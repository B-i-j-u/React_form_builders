import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import DashboardHome from "./components/DashboardHome";
import LoginPage from "./components/LoginPage";
import ModuleStudio from "./components/ModuleStudio";
import UserAccessManager from "./components/UserAccessManager";
import DynamicModuleView from "./components/DynamicModuleView";
import PurchaseOrderBuilder from "./components/PurchaseOrderBuilder";
import { rbacStore } from "./services/rbacStore";

export default function App() {
  // 1. Current Authenticated User
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("rfb_auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 2. Dynamic Modules State
  const [modules, setModules] = useState(() => rbacStore.getModules());

  // 3. Active View State (Starts on Screen 1: "home" matching Image 1)
  const [activeView, setActiveView] = useState("home");

  // Auth Handlers
  const handleLogin = (user) => {
    setCurrentUser(user);
    setActiveView("home"); // Default landing is Screen 1 (Dashboard User)
  };

  const handleLogout = () => {
    localStorage.removeItem("rfb_auth_user");
    setCurrentUser(null);
  };

  // Refresh modules when modified
  const handleRefreshModules = () => {
    const updated = rbacStore.getModules();
    setModules([...updated]);
  };

  // If user is not logged in, render Clean Dynamic Login Page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#edf1f5] font-sans text-slate-800 antialiased overflow-hidden">
      {/* 1. Left Sidebar styled with exact Dark Navy Theme of Image 1 */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        modules={modules}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar shown on sub-views; DashboardHome has its own top header matching Image 1 */}
        {activeView !== "home" && (
          <Topbar
            activeView={activeView}
            modules={modules}
            currentUser={currentUser}
          />
        )}

        {/* Dynamic Main Views */}
        <main className="flex-1 overflow-y-auto">
          {/* SCREEN 1: Live Dynamic ERP Dashboard Home */}
          {activeView === "home" && (
            <DashboardHome
              currentUser={currentUser}
              modules={modules}
              onNavigateStudio={() => setActiveView("studio")}
              onNavigateUsers={() => setActiveView("users")}
              onNavigatePoBuilder={() => setActiveView("po_builder")}
              onSelectModule={(modId) => setActiveView(modId)}
            />
          )}

          {/* SCREEN 2: Module Studio (Super Admin only) */}
          {activeView === "studio" && (
            currentUser?.role === "admin" ? (
              <ModuleStudio
                currentUser={currentUser}
                onModuleCreated={handleRefreshModules}
                onSelectModuleView={(modId) => setActiveView(modId)}
              />
            ) : (
              <div className="p-12 text-center text-slate-500 max-w-md mx-auto">
                <p className="font-bold text-base text-slate-900">Access Restricted</p>
                <p className="text-sm mt-1 text-slate-500">Only Super Admin has access to Drag &amp; Drop Module Studio.</p>
              </div>
            )
          )}

          {/* SCREEN 3: User Access & Permissions Manager (Super Admin only) */}
          {activeView === "users" && (
            currentUser?.role === "admin" ? (
              <UserAccessManager
                onRefreshUsers={() => setModules(rbacStore.getModules())}
              />
            ) : (
              <div className="p-12 text-center text-slate-500 max-w-md mx-auto">
                <p className="font-bold text-base text-slate-900">Access Restricted</p>
                <p className="text-sm mt-1 text-slate-500">Only Super Admin has access to Users &amp; Permissions Manager.</p>
              </div>
            )
          )}

          {/* SCREEN 4: Dynamic Record Table & Entry Form (for any Permitted Module) */}
          {activeView !== "home" && activeView !== "studio" && activeView !== "users" && (
            <DynamicModuleView
              key={activeView}
              moduleId={activeView}
              currentUser={currentUser}
              onBackToStudio={() => setActiveView("studio")}
            />
          )}
        </main>
      </div>
    </div>
  );
}
