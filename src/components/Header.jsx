import React from "react";
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  Package, 
  ArrowLeft,
  ChevronRight
} from "lucide-react";

export default function Header({
  activeView,
  setActiveView,
  modules = [],
  currentUser,
  onLogout
}) {
  const isAdmin = currentUser?.role === "admin";

  // Breadcrumb / Title generator
  const getPageInfo = () => {
    if (activeView === "dashboard") {
      return {
        title: "Overview Dashboard",
        section: "Main",
        icon: <LayoutDashboard size={18} />
      };
    }
    if (activeView === "studio") {
      return {
        title: "Module Studio",
        section: "Admin Tools",
        icon: <Layers size={18} />
      };
    }
    if (activeView === "users") {
      return {
        title: "Users & Module Access",
        section: "Admin Tools",
        icon: <Users size={18} />
      };
    }

    const currentMod = modules.find((m) => m.id === activeView);
    return {
      title: currentMod?.name || "Dynamic Module",
      section: "Modules",
      icon: <Package size={18} />
    };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="erp-topbar">
      {/* Breadcrumb Info */}
      <div className="topbar-breadcrumb">
        <button
          type="button"
          className="breadcrumb-home-btn"
          onClick={() => setActiveView && setActiveView("dashboard")}
          title="Return to Dashboard"
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </button>

        {activeView !== "dashboard" && (
          <>
            <ChevronRight size={14} className="breadcrumb-arrow" />
            <span className="breadcrumb-section">{pageInfo.section}</span>
            <ChevronRight size={14} className="breadcrumb-arrow" />
            <div className="breadcrumb-current">
              {pageInfo.icon}
              <span>{pageInfo.title}</span>
            </div>
          </>
        )}
      </div>

      {/* Topbar Right Profile & Status */}
      <div className="topbar-right-actions">
        {activeView !== "dashboard" && (
          <button
            type="button"
            className="topbar-back-btn"
            onClick={() => setActiveView && setActiveView("dashboard")}
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </button>
        )}

        <div className="topbar-status-badge">
          <span className="live-status-dot"></span>
          <span>System Live</span>
        </div>

        {currentUser && (
          <div className="topbar-user-pill">
            <div className="topbar-avatar">
              {currentUser.fullName?.charAt(0) || "U"}
            </div>
            <div className="topbar-user-meta">
              <span className="topbar-name">{currentUser.fullName}</span>
              <span className="topbar-role">
                {isAdmin ? "👑 Super Admin" : currentUser.canApprove ? "🛡️ Approver" : "💼 Staff"}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
