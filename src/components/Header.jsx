import React from "react";
import { 
  FormInput, 
  Layers, 
  Users, 
  LogOut, 
  ShieldCheck, 
  Package,
  CalendarCheck,
  Receipt,
  CheckCircle2
} from "lucide-react";

export default function Header({
  activeView,
  setActiveView,
  modules = [],
  currentUser,
  onLogout
}) {
  const isAdmin = currentUser?.role === "admin";

  // For Admin: keep the header ultra-clean with only Module Studio and Users & Access!
  // Modules created in Studio will NOT clutter the top header.
  // For normal users: only show the modules assigned to that user.
  const permittedModules = isAdmin
    ? []
    : modules.filter((m) => 
        (currentUser?.allowedModuleIds || []).includes("*") || 
        (currentUser?.allowedModuleIds || []).includes(m.id)
      );

  const getModuleIcon = (mod) => {
    if (mod.id === "mod_products") return <Package size={16} />;
    if (mod.id === "mod_purchase_orders") return <Receipt size={16} />;
    if (mod.id === "mod_leave") return <CalendarCheck size={16} />;
    if (mod.id === "mod_customers") return <Users size={16} />;
    return <Package size={16} />;
  };

  return (
    <header className="erp-clean-header">
      {/* Brand */}
      <div className="erp-brand-block">
        <div className="erp-brand-icon">
          <Layers size={22} />
        </div>
        <div>
          <h1 className="erp-brand-title">Enterprise Dynamic ERP</h1>
          <span className="erp-brand-tagline">Drag &amp; Drop Modules • Dynamic RBAC</span>
        </div>
      </div>

      {/* Center Dynamic Navigation Tabs */}
      <nav className="erp-nav-tabs">
        {/* Admin-only tools */}
        {isAdmin && (
          <>
            <button
              type="button"
              className={`nav-tab-item ${activeView === "studio" ? "active" : ""}`}
              onClick={() => setActiveView("studio")}
            >
              <Layers size={16} />
              <span>Module Studio</span>
            </button>

            <button
              type="button"
              className={`nav-tab-item ${activeView === "users" ? "active" : ""}`}
              onClick={() => setActiveView("users")}
            >
              <Users size={16} />
              <span>Users &amp; Access</span>
            </button>

            {/* If Admin is viewing a module from Studio, show clean active tab */}
            {activeView !== "studio" && activeView !== "users" && (
              <button
                type="button"
                className="nav-tab-item active"
                onClick={() => setActiveView(activeView)}
              >
                <Package size={16} />
                <span>Viewing: {modules.find((m) => m.id === activeView)?.name || "Module"}</span>
              </button>
            )}
          </>
        )}

        {/* Dynamic Modules Permitted for this User */}
        {permittedModules.map((m) => {
          const isActive = activeView === m.id;
          const pendingCount = (m.records || []).filter((r) => r.status === "pending").length;

          return (
            <button
              key={m.id}
              type="button"
              className={`nav-tab-item ${isActive ? "active" : ""}`}
              onClick={() => setActiveView(m.id)}
            >
              {getModuleIcon(m)}
              <span>{m.name}</span>
              {pendingCount > 0 && (
                <span className="nav-pending-badge" title={`${pendingCount} pending records`}>
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right User Profile & Sign Out */}
      <div className="erp-user-actions">
        {currentUser && (
          <div className="header-profile-box">
            <div className="profile-avatar-circle">
              {currentUser.fullName?.charAt(0) || "U"}
            </div>
            <div className="profile-details-mini">
              <span className="profile-name">{currentUser.fullName}</span>
              <span className="profile-role-pill">
                {isAdmin ? "👑 Super Admin" : currentUser.canApprove ? "🛡️ Approver" : "💼 Staff"}
              </span>
            </div>
            <button
              type="button"
              className="btn-sign-out"
              onClick={onLogout}
              title="Sign Out to switch account"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
