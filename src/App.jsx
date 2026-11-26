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

  // Auth Handlers
  const handleLogin = (user) => {
    setCurrentUser(user);
    setActiveView("dashboard");
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
    <div className="erp-app-layout">
      {/* 1. Left ERP Sidebar (Dashboard, Module Studio, Users & Access, Workspaces) */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        modules={modules}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Main Page Area (Top Header + View Content) */}
      <div className="erp-main-wrapper">
        <Header
          activeView={activeView}
          setActiveView={setActiveView}
          modules={modules}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="erp-page-content">
          {/* View 1: Simple Beautiful Dashboard UI */}
          {activeView === "dashboard" && (
            <Dashboard
              currentUser={currentUser}
              modules={modules}
              onNavigate={(view) => setActiveView(view)}
              onSelectModule={(modId) => setActiveView(modId)}
            />
          )}

          {/* View 2: Drag & Drop Module Studio (Admin only) */}
          {activeView === "studio" && (
            <ModuleStudio
              onModuleCreated={handleRefreshModules}
              onSelectModuleView={(modId) => setActiveView(modId)}
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
              onBackToStudio={() => setActiveView("studio")}
              onModulesUpdated={handleRefreshModules}
            />
          )}
        </main>
      </div>
    </div>
  );
}
