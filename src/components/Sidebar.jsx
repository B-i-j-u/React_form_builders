import React, { useState } from "react";
import { 
  Home, 
  Folder, 
  Layers, 
  Users, 
  LogOut, 
  User,
  Pin,
  PinOff,
  Receipt
} from "lucide-react";

export default function Sidebar({
  activeView,
  setActiveView,
  modules = [],
  currentUser,
  onLogout
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const isExpanded = isHovered || isPinned;
  const isAdmin = currentUser?.role === "admin";

  // Filter modules visible to this user
  const permittedModules = isAdmin
    ? modules
    : modules.filter((m) =>
        (currentUser?.allowedModuleIds || []).includes("*") ||
        (currentUser?.allowedModuleIds || []).includes(m.id)
      );

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`h-screen sticky top-0 select-none z-40 transition-all duration-500 ease-out bg-[#1c3554] border-r border-[#152a42] flex flex-col justify-between overflow-x-hidden ${
        isExpanded ? "w-64 shadow-2xl" : "w-16"
      }`}
    >
      {/* 1. TOP SECTION: LOGO (COLLAPSED) OR FULL USER PROFILE (HOVERED / EXPANDED) */}
      <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
        {/* COLLAPSED STATE: ONLY LOGO IS SHOWN */}
        {!isExpanded && (
          <div className="py-5 flex flex-col items-center justify-center border-b border-white/10 shrink-0">
            <div 
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform"
              title="Hover to expand sidebar"
            >
              <Layers size={22} className="text-white" />
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2"></span>
          </div>
        )}

        {/* EXPANDED STATE (EXACT MATCH TO USER SCREENSHOT) */}
        {isExpanded && (
          <div className="pt-6 pb-5 px-6 text-center border-b border-white/10 relative shrink-0 animate-in fade-in duration-300">
            {/* Optional Pin Toggle button on top-right */}
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? "Unpin sidebar" : "Pin sidebar open"}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              {isPinned ? <Pin size={14} className="text-[#ff9900]" /> : <PinOff size={14} />}
            </button>

            {/* Circular User Avatar */}
            <div className="w-20 h-20 mx-auto rounded-full bg-[#162a42] border-[3.5px] border-[#294569] flex items-center justify-center text-white shadow-inner mb-3">
              <User size={38} className="text-white stroke-[2.2]" />
            </div>

            {/* User Full Name (Bold Uppercase) */}
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-white truncate">
              {currentUser?.fullName?.toUpperCase() || "RAJESH KUMAR (ADMIN)"}
            </h2>

            {/* User Email */}
            <p className="text-xs text-[#8ea4be] mt-0.5 truncate font-normal">
              {currentUser?.email || "admin@erp.com"}
            </p>
          </div>
        )}

        {/* 2. NAVIGATION MENU (EXACT LABELS & ORANGE ACTIVE BAR FROM SCREENSHOT) */}
        <div className="py-2.5">
          {/* Dashboard Overview */}
          <button
            type="button"
            onClick={() => setActiveView("home")}
            title="Dashboard Overview"
            className={`w-full flex items-center gap-3.5 py-2.5 text-sm font-semibold tracking-wide transition-colors cursor-pointer ${
              isExpanded ? "px-6" : "justify-center px-0"
            } ${
              activeView === "home"
                ? "bg-[#142337] text-white font-bold border-l-4 border-[#ff9900]"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Home size={18} className="shrink-0" />
            {isExpanded && <span className="truncate">Dashboard Overview</span>}
          </button>

          {/* Module Studio (Admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveView("studio")}
              title="Module Studio"
              className={`w-full flex items-center gap-3.5 py-2.5 text-sm font-semibold tracking-wide transition-colors cursor-pointer ${
                isExpanded ? "px-6" : "justify-center px-0"
              } ${
                activeView === "studio"
                  ? "bg-[#142337] text-white font-bold border-l-4 border-[#ff9900]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers size={18} className="shrink-0" />
              {isExpanded && <span className="truncate">Module Studio</span>}
            </button>
          )}

          {/* Users & Access (Admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveView("users")}
              title="Users & Access"
              className={`w-full flex items-center gap-3.5 py-2.5 text-sm font-semibold tracking-wide transition-colors cursor-pointer ${
                isExpanded ? "px-6" : "justify-center px-0"
              } ${
                activeView === "users"
                  ? "bg-[#142337] text-white font-bold border-l-4 border-[#ff9900]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Users size={18} className="shrink-0" />
              {isExpanded && <span className="truncate">Users &amp; Access</span>}
            </button>
          )}

          {/* INSTALLED WORKSPACES (Exact Category Header) */}
          <div className="pt-4">
            {isExpanded ? (
              <div className="px-6 py-1.5 text-xs font-bold uppercase tracking-wider text-[#68819f]">
                INSTALLED WORKSPACES
              </div>
            ) : (
              <div className="w-8 h-[1px] bg-white/10 mx-auto my-2"></div>
            )}

            {permittedModules.map((m) => {
              const isActive = activeView === m.id;
              const pendingCount = (m.records || []).filter((r) => r.status === "pending").length;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveView(m.id)}
                  title={m.name}
                  className={`w-full flex items-center justify-between py-2.5 text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                    isExpanded ? "px-6" : "justify-center px-0"
                  } ${
                    isActive
                      ? "bg-[#142337] text-white font-bold border-l-4 border-[#ff9900]"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <Folder size={18} className="shrink-0 text-slate-300" />
                    {isExpanded && <span className="truncate">{m.name}</span>}
                  </div>

                  {isExpanded && pendingCount > 0 && (
                    <span className="bg-[#ff9900] text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: ADMIN AUTHORITY & LOGOUT (EXACT SCREENSHOT MATCH) */}
      <div className="p-4 border-t border-white/10 bg-[#162a42]/70 shrink-0">
        <div className={`flex items-center ${isExpanded ? "justify-between" : "justify-center"}`}>
          {isExpanded && (
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0"></span>
              <span className="text-xs font-semibold text-[#8ea4be] truncate">
                {isAdmin ? "Admin Authority" : currentUser?.department === "Human Resources" ? "HR Officer" : currentUser?.canApprove ? "Approver" : "Staff"}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 text-[#8ea4be] hover:text-rose-400 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
