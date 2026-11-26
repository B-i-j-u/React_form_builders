import React from "react";
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  Package, 
  Receipt, 
  TrendingUp, 
  Wallet, 
  LogOut,
  CheckSquare
} from "lucide-react";

export default function Sidebar({
  activeView,
  setActiveView,
  modules = [],
  currentUser,
  onLogout
}) {
  const isAdmin = currentUser?.role === "admin";

  // Filter modules visible to this specific user based on RBAC permissions
  const permittedModules = isAdmin
    ? modules
    : modules.filter((m) => 
        (currentUser?.allowedModuleIds || []).includes("*") || 
        (currentUser?.allowedModuleIds || []).includes(m.id)
      );

  const getModuleIcon = (mod) => {
    if (mod.id === "mod_inventory") return <Package size={17} className="text-indigo-500" />;
    if (mod.id === "mod_purchase") return <Receipt size={17} className="text-amber-500" />;
    if (mod.id === "mod_sales") return <TrendingUp size={17} className="text-emerald-500" />;
    if (mod.id === "mod_transactions") return <Wallet size={17} className="text-cyan-500" />;
    if (mod.id === "mod_employee") return <Users size={17} className="text-purple-500" />;
    if (mod.id === "mod_tasks") return <CheckSquare size={17} className="text-blue-500" />;
    return <Layers size={17} />;
  };

  return (
    <aside className="erp-sidebar">
      {/* Brand & Platform Identity */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Layers size={22} />
        </div>
        <div className="sidebar-brand-text">
          <h1 className="sidebar-title">Enterprise ERP</h1>
          <span className="sidebar-subtitle">Interconnected Core Modules</span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="sidebar-nav-scroll">
        {/* SECTION 1: MAIN OVERVIEW */}
        <div className="nav-group">
          <span className="nav-group-title">MAIN</span>
          
          <button
            type="button"
            className={`sidebar-nav-btn ${activeView === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveView("dashboard")}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
        </div>

        {/* SECTION 2: ADMIN STUDIO & ACCESS (Only visible to Admin) */}
        {isAdmin && (
          <div className="nav-group">
            <span className="nav-group-title">ADMIN TOOLS</span>

            <button
              type="button"
              className={`sidebar-nav-btn ${activeView === "studio" ? "active" : ""}`}
              onClick={() => setActiveView("studio")}
            >
              <Layers size={18} />
              <span>Module Studio</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-btn ${activeView === "users" ? "active" : ""}`}
              onClick={() => setActiveView("users")}
            >
              <Users size={18} />
              <span>Users &amp; Access</span>
            </button>
          </div>
        )}

        {/* SECTION 3: ROLE-BASED PERMITTED WORKSPACES (Image 1 Style) */}
        {permittedModules.length > 0 && (
          <div className="nav-group">
            <div className="flex-align-between group-title-row">
              <span className="nav-group-title">
                {isAdmin ? "ERP CORE WORKSPACES" : "MY MODULES"}
              </span>
              <span className="sidebar-counter-tag">{permittedModules.length}</span>
            </div>

            {permittedModules.map((m) => {
              const isActive = activeView === m.id;
              const pendingCount = (m.records || []).filter((r) => r.status === "pending").length;

              return (
                <button
                  key={m.id}
                  type="button"
                  className={`sidebar-nav-btn ${isActive ? "active" : ""}`}
                  onClick={() => setActiveView(m.id)}
                  title={m.name}
                >
                  {getModuleIcon(m)}
                  <span className="sidebar-btn-label">{m.name}</span>
                  {pendingCount > 0 && (
                    <span className="sidebar-pending-badge" title={`${pendingCount} pending approvals`}>
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom User Profile & Sign Out Card */}
      {currentUser && (
        <div className="sidebar-footer-profile">
          <div className="footer-user-avatar">
            {currentUser.fullName?.charAt(0) || "U"}
          </div>
          <div className="footer-user-details">
            <span className="footer-user-name">{currentUser.fullName}</span>
            <span className="footer-user-role">
              {isAdmin ? "👑 Super Admin" : currentUser.canApprove ? "🛡️ Department Approver" : "💼 Operational Staff"}
            </span>
          </div>
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={onLogout}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
