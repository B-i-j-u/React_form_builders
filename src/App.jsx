import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import ModuleStudio from "./components/ModuleStudio";
import UserAccessManager from "./components/UserAccessManager";
import DynamicModuleView from "./components/DynamicModuleView";
import { rbacStore } from "./services/rbacStore";
import "./styles/builder.css";

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

  // 3. Active View State (Defaults to Dashboard!)
  const [activeView, setActiveView] = useState("dashboard");

  // 4. Fullscreen Form Builder Mode (Hides Sidebar & Top Header when creating/editing module)
  const [isBuilderFullScreen, setIsBuilderFullScreen] = useState(false);

  // Safe navigation handler that resets fullscreen mode
  const handleNavigate = (view) => {
    setIsBuilderFullScreen(false);
    setActiveView(view);
  };

  // Auth Handlers
  const handleLogin = (user) => {
    setCurrentUser(user);
    handleNavigate("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("rfb_auth_user");
    setCurrentUser(null);
    setIsBuilderFullScreen(false);
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
    <div className={`erp-app-layout ${isBuilderFullScreen ? "fullscreen-builder-active" : ""}`}>
      {/* 1. Left ERP Sidebar (Hidden when in Full-Screen Form Builder) */}
      {!isBuilderFullScreen && (
        <Sidebar
          activeView={activeView}
          setActiveView={handleNavigate}
          modules={modules}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {/* 2. Main Page Area (Top Header + View Content) */}
      <div className={`erp-main-wrapper ${isBuilderFullScreen ? "fullscreen" : ""}`}>
        {!isBuilderFullScreen && (
          <Header
            activeView={activeView}
            setActiveView={handleNavigate}
            modules={modules}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}

        <main className={`erp-page-content ${isBuilderFullScreen ? "fullscreen-no-padding" : ""}`}>
          {/* View 1: Simple Beautiful Dashboard UI */}
          {activeView === "dashboard" && (
            <Dashboard
              currentUser={currentUser}
              modules={modules}
              onNavigate={(view) => handleNavigate(view)}
              onSelectModule={(modId) => handleNavigate(modId)}
            />
          )}

          {/* View 2: Drag & Drop Module Studio (Admin only) */}
          {activeView === "studio" && (
            <ModuleStudio
              onModuleCreated={handleRefreshModules}
              onSelectModuleView={(modId) => handleNavigate(modId)}
              onToggleFullScreen={setIsBuilderFullScreen}
            />
          )}

          {/* View 3: User & Module Access Manager (Admin only) */}
          {activeView === "users" && (
            <UserAccessManager
              onRefreshUsers={() => setModules(rbacStore.getModules())}
            />
          )}

          {/* View 4: Dynamic Module Data Table & Form Entry */}
          {activeView !== "dashboard" && activeView !== "studio" && activeView !== "users" && (
            <DynamicModuleView
              key={activeView}
              moduleId={activeView}
              currentUser={currentUser}
              onBackToStudio={() => handleNavigate("studio")}
              onModulesUpdated={handleRefreshModules}
              onSelectModule={(modId) => handleNavigate(modId)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
