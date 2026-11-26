import React from "react";
import { 
  Layers, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Users, 
  ArrowUpRight, 
  Plus, 
  ChevronRight,
  TrendingUp,
  Package,
  Receipt,
  CalendarCheck
} from "lucide-react";
import { rbacStore } from "../services/rbacStore";

export default function DashboardHome({
  currentUser,
  modules = [],
  onNavigateStudio,
  onNavigateUsers,
  onSelectModule,
  onNavigatePoBuilder
}) {
  const isAdmin = currentUser?.role === "admin";
  const canAccessPoBuilder = isAdmin || 
    (currentUser?.allowedModuleIds || []).includes("*") || 
    (currentUser?.allowedModuleIds || []).includes("mod_purchase_orders");

  // Filter modules visible to this user
  const permittedModules = isAdmin
    ? modules
    : modules.filter((m) =>
        (currentUser?.allowedModuleIds || []).includes("*") ||
        (currentUser?.allowedModuleIds || []).includes(m.id)
      );

  // Aggregate all records across permitted modules
  const allRecords = permittedModules.flatMap((m) =>
    (m.records || []).map((r) => ({
      ...r,
      moduleName: m.name,
      moduleId: m.id
    }))
  );

  // Sort recent records (latest first)
  const recentRecords = [...allRecords].reverse().slice(0, 5);

  // Dynamic KPI counts computed from real database
  const totalModulesCount = permittedModules.length;
  const totalRecordsCount = allRecords.length;
  const pendingCount = allRecords.filter((r) => r.status === "pending").length;
  const approvedCount = allRecords.filter((r) => r.status === "approved").length;
  const rejectedCount = allRecords.filter((r) => r.status === "rejected").length;

  // Real Approval Rate percentage
  const approvalRate = totalRecordsCount > 0 
    ? Math.round((approvedCount / totalRecordsCount) * 100) 
    : 100;

  // Registered Users count (Admin view)
  const allUsers = rbacStore.getUsers();

  // Helper for Module Icons
  const getModuleIcon = (modId) => {
    if (modId === "mod_products") return <Package size={20} className="text-indigo-600" />;
    if (modId === "mod_purchase_orders") return <Receipt size={20} className="text-emerald-600" />;
    if (modId === "mod_leave") return <CalendarCheck size={20} className="text-amber-600" />;
    if (modId === "mod_customers") return <Users size={20} className="text-sky-600" />;
    if (modId === "mod_potential") return <TrendingUp size={20} className="text-violet-600" />;
    if (modId === "mod_employees") return <Users size={20} className="text-teal-600" />;
    return <Layers size={20} className="text-indigo-600" />;
  };

  return (
    <div className="p-4 md:p-5 bg-[#edf1f5] min-h-screen text-slate-800 space-y-4">
      {/* 1. TOP HEADER WITH REAL USER DETAILS & QUICK ACTIONS */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live ERP System
            </span>
            <span className="text-xs text-slate-400 font-medium">•</span>
            <span className="text-xs font-semibold text-slate-600">
              {currentUser?.department || "General"}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Welcome back, <strong className="text-slate-900 font-semibold">{currentUser?.fullName}</strong>.{" "}
            {isAdmin ? (
              <>
                You have <strong className="text-amber-600 font-bold">{pendingCount}</strong> record(s) pending executive approval across{" "}
                <strong className="text-slate-900 font-bold">{totalModulesCount}</strong> active workspace(s).
              </>
            ) : (
              <>
                You have access to <strong className="text-slate-900 font-bold">{totalModulesCount}</strong> assigned workspace(s) with{" "}
                <strong className="text-amber-600 font-bold">{pendingCount}</strong> record(s) awaiting executive approval.
              </>
            )}
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={onNavigateStudio}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>+ Create Module (Studio)</span>
              </button>

              <button
                type="button"
                onClick={onNavigateUsers}
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold border border-slate-200 transition-all cursor-pointer"
              >
                <Users size={16} />
                <span>Users ({allUsers.length})</span>
              </button>
            </>
          )}

          {permittedModules.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectModule?.(permittedModules[0].id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <span>{permittedModules.length === 1 ? `Open ${permittedModules[0].name}` : "Open Workspaces"}</span>
              <ArrowUpRight size={15} className="text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* 2. TOP 4 DYNAMIC KPI CARDS (TIGHT & BOLD) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Active Installed Modules */}
        <div 
          onClick={isAdmin ? onNavigateStudio : undefined}
          className={`bg-[#1c3554] text-white rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[115px] border border-slate-800 transition-all ${
            isAdmin ? "cursor-pointer hover:shadow-md hover:border-indigo-400 group" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">Active Workspaces</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <Layers size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-2">
              <span>{totalModulesCount}</span>
              <span className="text-xs font-medium text-slate-300">Modules</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 flex items-center justify-between">
              <span>{isAdmin ? "Click to manage in Studio" : "Permitted for your role"}</span>
              {isAdmin && <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />}
            </p>
          </div>
        </div>

        {/* Card 2: Total Records Across Database */}
        <div className="bg-white rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[115px] border border-slate-200/80 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Total Submissions</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileText size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-baseline gap-2">
              <span>{totalRecordsCount}</span>
              <span className="text-xs font-medium text-slate-500">Records</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live entries stored in database
            </p>
          </div>
        </div>

        {/* Card 3: Pending Approvals (High-Priority Real Metric) */}
        <div className="bg-white rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[115px] border border-slate-200/80 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-amber-600 flex items-baseline gap-2">
              <span>{pendingCount}</span>
              <span className="text-xs font-medium text-slate-500">Awaiting Action</span>
            </div>
            <p className="text-xs text-amber-700 mt-0.5 font-medium">
              {pendingCount > 0 ? "⚡ Requires approver decision" : "✅ All records up to date"}
            </p>
          </div>
        </div>

        {/* Card 4: Real Approval Rate */}
        <div className="bg-white rounded-xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[115px] border border-slate-200/80 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Approval Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-700 flex items-baseline gap-2">
              <span>{approvalRate}%</span>
              <span className="text-xs font-medium text-slate-500">Approved</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {approvedCount} approved of {totalRecordsCount} records
            </p>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE LAYOUT: REAL MODULE VOLUME DISTRIBUTION + STATUS HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Column (8 cols): Real Modules Activity & Record Volume */}
        <div className="lg:col-span-8 bg-white rounded-xl p-4 shadow-xs border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Workspace Distribution &amp; Live Volume
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real records and pending counts across each configured module
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              {permittedModules.length} Modules
            </span>
          </div>

          {/* Module Bars List */}
          <div className="space-y-2.5">
            {permittedModules.map((m) => {
              const recs = m.records || [];
              const pending = recs.filter((r) => r.status === "pending").length;
              const approved = recs.filter((r) => r.status === "approved").length;
              const maxVol = Math.max(...permittedModules.map((x) => (x.records || []).length), 5);
              const pct = (recs.length / maxVol) * 100;

              return (
                <div
                  key={m.id}
                  onClick={() => onSelectModule?.(m.id)}
                  className="p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/70 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
                        {getModuleIcon(m.id)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {m.name}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {m.fields?.length || 0} fields • {m.description || "Dynamic ERP Module"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {pending > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                          {pending} Pending
                        </span>
                      )}
                      <span className="text-sm font-extrabold text-slate-800">
                        {recs.length} records
                      </span>
                      <ArrowUpRight size={15} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Volume Visual Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{ width: `${pct * (recs.length > 0 ? approved / recs.length : 0)}%` }}
                      title={`Approved: ${approved}`}
                    ></div>
                    <div
                      className="bg-amber-400 h-full transition-all"
                      style={{ width: `${pct * (recs.length > 0 ? pending / recs.length : 0)}%` }}
                      title={`Pending: ${pending}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (4 cols): Real Status Distribution & Audit Health */}
        <div className="lg:col-span-4 bg-white rounded-xl p-4 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-base font-bold text-slate-900">
              System Audit Health
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live approval status breakdown
            </p>
          </div>

          {/* Real Radial Donut Ring */}
          <div className="relative w-32 h-32 mx-auto my-3 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background Ring */}
              <circle
                cx="50"
                cy="50"
                r="38"
                strokeWidth="11"
                className="text-slate-100"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Approved Arc (Emerald) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                strokeWidth="11"
                stroke="#10b981"
                strokeDasharray="238.7"
                strokeDashoffset={238.7 - (238.7 * (totalRecordsCount > 0 ? approvedCount / totalRecordsCount : 1))}
                fill="transparent"
                strokeLinecap="round"
                className="transition-all duration-700"
              />
              {/* Pending Arc (Amber) */}
              {pendingCount > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  strokeWidth="11"
                  stroke="#f59e0b"
                  strokeDasharray="238.7"
                  strokeDashoffset={238.7 - (238.7 * (pendingCount / totalRecordsCount))}
                  fill="transparent"
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              )}
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-extrabold text-slate-900">{approvalRate}%</span>
              <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                Approved
              </span>
            </div>
          </div>

          {/* Real Status Legend breakdown */}
          <div className="space-y-1.5 my-1">
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-emerald-900">Approved Records</span>
              </div>
              <strong className="text-emerald-700 font-bold text-sm">{approvedCount}</strong>
            </div>

            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-amber-50/60 border border-amber-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="font-semibold text-amber-900">Pending Review</span>
              </div>
              <strong className="text-amber-700 font-bold text-sm">{pendingCount}</strong>
            </div>

            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span className="font-semibold text-slate-700">Rejected / Archived</span>
              </div>
              <strong className="text-slate-600 font-bold text-sm">{rejectedCount}</strong>
            </div>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={isAdmin ? onNavigateStudio : () => onSelectModule?.(permittedModules[0]?.id)}
            className="w-full mt-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{isAdmin ? "Open Module Studio" : "Browse Records"}</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY & SUBMISSIONS TABLE (REAL DATABASE FEED) */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Latest Submissions Activity Feed
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time audit log of entries created by staff across modules
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            Showing latest {recentRecords.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5">Record ID</th>
                <th className="py-2.5 px-3.5">Workspace / Module</th>
                <th className="py-2.5 px-3.5">Submitted By</th>
                <th className="py-2.5 px-3.5">Timestamp</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 text-sm">
                    No submissions recorded yet. Click on any module to add records.
                  </td>
                </tr>
              ) : (
                recentRecords.map((rec) => (
                  <tr key={rec.id + rec.moduleId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono font-bold text-indigo-600 text-sm">
                      <span className="bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                        {rec.id}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2">
                        {getModuleIcon(rec.moduleId)}
                        <span className="font-bold text-slate-900 text-sm">{rec.moduleName}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 text-slate-800 font-semibold text-sm">
                      {rec.submittedBy || "System User"}
                    </td>

                    <td className="py-2.5 px-3.5 text-slate-500 text-xs">
                      {rec.submittedAt || "Just now"}
                    </td>

                    <td className="py-2.5 px-3.5">
                      {rec.status === "pending" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                          <Clock size={13} /> Pending
                        </span>
                      )}
                      {rec.status === "approved" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <CheckCircle2 size={13} /> Approved
                        </span>
                      )}
                      {rec.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                          <XCircle size={13} /> Rejected
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectModule?.(rec.moduleId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-200/60 rounded-lg transition-colors cursor-pointer"
                      >
                        <span>View</span>
                        <ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
