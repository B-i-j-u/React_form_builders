import React from "react";
import { 
  Layers, 
  Users, 
  Package, 
  ShieldCheck, 
  Calendar, 
  Bell, 
  Search,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function Topbar({ activeView, modules = [], currentUser }) {
  const isAdmin = currentUser?.role === "admin";
  const currentModule = modules.find((m) => m.id === activeView) || 
    (activeView !== "studio" && activeView !== "users" && activeView !== "home" ? modules[0] : null);

  // Breadcrumb title logic
  let sectionName = "Dynamic Workspaces";
  let pageTitle = currentModule?.name || "Workspace";

  if (activeView === "home") {
    sectionName = "Overview";
    pageTitle = "Dashboard User";
  } else if (activeView === "studio") {
    sectionName = "Administration";
    pageTitle = "Drag & Drop Module Studio";
  } else if (activeView === "users") {
    sectionName = "Administration";
    pageTitle = "Users & Module Access Manager";
  } else if (activeView === "po_builder") {
    sectionName = "Financial & Procurement Tools";
    pageTitle = "Purchase Order & Invoice Builder";
  } else if (currentModule) {
    sectionName = "Dynamic Workspaces";
    pageTitle = currentModule.name;
  }

  return (
    <header className="h-14 px-5 border-b border-slate-200/80 bg-white flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left: Breadcrumbs & Title */}
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {sectionName}
        </span>
        <span className="text-slate-300">/</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">
            {pageTitle}
          </span>
          {currentModule && (
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
              {currentModule.fields?.length || 0} fields
            </span>
          )}
        </div>
      </div>

      {/* Right: Status Pill, Authority Badge, Profile */}
      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Workspace</span>
        </div>

        {/* Authority Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {isAdmin ? (
            <span className="text-indigo-600 font-bold">👑 Super Admin (Executive Approver)</span>
          ) : currentUser?.department === "Human Resources" ? (
            <span className="text-indigo-700 font-bold flex items-center gap-1">
              <Users size={13} /> HR Officer (Employee Submissions)
            </span>
          ) : currentUser?.canApprove ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck size={13} /> Approver
            </span>
          ) : (
            <span className="text-slate-600">💼 Data Entry Staff</span>
          )}
        </div>

        {/* User Mini Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {currentUser?.fullName?.charAt(0) || "U"}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {currentUser?.fullName}
            </div>
            <div className="text-[11px] text-slate-500">
              {currentUser?.department || "General"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
