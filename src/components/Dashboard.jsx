import React, { useState } from "react";
import { 
  Layers, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  PlusCircle, 
  Package, 
  Receipt, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  ShieldCheck,
  Sparkles,
  Check,
  X,
  RefreshCw,
  Zap,
  CheckSquare,
  ClipboardCheck
} from "lucide-react";
import { rbacStore } from "../services/rbacStore";

export default function Dashboard({ 
  currentUser, 
  modules = [], 
  onNavigate, 
  onSelectModule 
}) {
  const [modulesState, setModulesState] = useState(() => rbacStore.getModules());
  const users = rbacStore.getUsers();
  const isAdmin = currentUser?.role === "admin";
  const canApprove = isAdmin || currentUser?.canApprove === true;

  // Filter modules visible to current user
  const permittedModules = isAdmin
    ? modulesState
    : modulesState.filter((m) => 
        (currentUser?.allowedModuleIds || []).includes("*") || 
        (currentUser?.allowedModuleIds || []).includes(m.id)
      );

  // Compute live stats dynamically across ALL modules
  let totalRecordCount = 0;
  let totalPendingCount = 0;
  let totalApprovedCount = 0;
  const allSubmissions = [];

  permittedModules.forEach((mod) => {
    const recs = mod.records || [];
    totalRecordCount += recs.length;
    recs.forEach((r) => {
      if (r.status === "pending") totalPendingCount++;
      if (r.status === "approved") totalApprovedCount++;

      // Pick first two field values for display
      const primaryField = mod.fields?.[0];
      const secondaryField = mod.fields?.[1];

      allSubmissions.push({
        id: r.id,
        moduleId: mod.id,
        moduleName: mod.name,
        primaryValue: primaryField ? (r[primaryField.id] || "Record") : "Record",
        secondaryValue: secondaryField ? (r[secondaryField.id] || "") : "",
        submittedBy: r.submittedBy || "User",
        submittedAt: r.submittedAt || "Recently",
        status: r.status || "pending"
      });
    });
  });

  // Recent 6 submissions
  const recentSubmissions = allSubmissions.slice(0, 6);

  // Quick Approve / Reject handler
  const handleApprove = (modId, recId) => {
    const updated = rbacStore.updateRecordStatus(modId, recId, "approved", currentUser.fullName);
    setModulesState([...updated]);
  };

  const handleReject = (modId, recId) => {
    const updated = rbacStore.updateRecordStatus(modId, recId, "rejected", currentUser.fullName);
    setModulesState([...updated]);
  };

  const getModuleIcon = (mod) => {
    if (mod.id === "mod_inventory") return <Package size={22} className="text-indigo-600" />;
    if (mod.id === "mod_purchase") return <Receipt size={22} className="text-amber-600" />;
    if (mod.id === "mod_grn") return <ClipboardCheck size={22} className="text-teal-600" />;
    if (mod.id === "mod_sales") return <TrendingUp size={22} className="text-emerald-600" />;
    if (mod.id === "mod_transactions") return <Wallet size={22} className="text-cyan-600" />;
    if (mod.id === "mod_employee") return <Users size={22} className="text-purple-600" />;
    if (mod.id === "mod_tasks") return <CheckSquare size={22} className="text-blue-600" />;
    return <Layers size={22} />;
  };

  return (
    <div className="dashboard-content-wrapper">
      {/* 1. Welcome Banner */}
      <div className="dash-welcome-card">
        <div className="welcome-text-side">
          <div className="welcome-tag">
            <Zap size={14} />
            <span>Real-Time Interconnected ERP</span>
          </div>
          <h2 className="welcome-headline">
            Welcome back, {currentUser?.fullName || "User"} 👋
          </h2>
          <p className="welcome-subtext">
            {isAdmin
              ? "Full system control active. Live 2-way data sharing between Inventory, Sales Invoices, Purchase Orders, and Cashbook."
              : `Operational workspace for ${currentUser?.department || "Operations"}. Access assigned modules, manage data, and submit real-time entries.`}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="welcome-actions">
          {isAdmin ? (
            <>
              <button 
                type="button" 
                className="dash-primary-btn"
                onClick={() => onNavigate("studio")}
              >
                <PlusCircle size={16} />
                <span>+ Create Module</span>
              </button>
              <button 
                type="button" 
                className="dash-secondary-btn"
                onClick={() => onNavigate("users")}
              >
                <Users size={16} />
                <span>Manage Users</span>
              </button>
            </>
          ) : (
            <div className="user-role-card-mini">
              <span className="user-role-label">Your Role</span>
              <strong>{canApprove ? "🛡️ Department Approver" : "💼 Operational Staff"}</strong>
            </div>
          )}
        </div>
      </div>

      {/* 2. Dynamic KPI Metrics Grid */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card">
          <div className="kpi-icon-box amber">
            <Layers size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Modules</span>
            <div className="kpi-val text-amber">{permittedModules.length}</div>
            <span className="kpi-sub">Your ERP workspaces</span>
          </div>
        </div>

        <div className="dash-kpi-card">
          <div className="kpi-icon-box emerald">
            <FileText size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Records</span>
            <div className="kpi-val text-emerald">{totalRecordCount}</div>
            <span className="kpi-sub">Across all modules</span>
          </div>
        </div>

        <div className="dash-kpi-card">
          <div className="kpi-icon-box blue">
            <Clock size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Pending Approvals</span>
            <div className="kpi-val text-blue">{totalPendingCount}</div>
            <span className="kpi-sub">Awaiting review</span>
          </div>
        </div>

        <div className="dash-kpi-card">
          <div className="kpi-icon-box purple">
            <CheckCircle2 size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Approved</span>
            <div className="kpi-val">{totalApprovedCount}</div>
            <span className="kpi-sub">Records confirmed</span>
          </div>
        </div>
      </div>

      {/* 3. Live Module Link Banner — only if 2+ modules exist */}
      {permittedModules.length >= 2 && (
        <div className="data-flow-overview-card">
          <div className="flow-card-header">
            <div className="flow-header-left">
              <Zap size={18} className="text-amber-500" />
              <h3 className="flow-title">⚡ Dynamic Module Linking Active</h3>
            </div>
            <span className="flow-live-pill">⚡ 1-Click Link Ready</span>
          </div>
          <div className="flow-diagram-steps">
            {permittedModules.slice(0, 3).map((mod, i) => (
              <React.Fragment key={mod.id}>
                <div className="flow-step-box" onClick={() => onSelectModule(mod.id)}>
                  <div className="step-icon-circle bg-amber-50 text-amber-600">
                    <Layers size={20} />
                  </div>
                  <strong>{mod.name}</strong>
                  <span>{(mod.records || []).length} records</span>
                </div>
                {i < permittedModules.slice(0, 3).length - 1 && (
                  <div className="flow-arrow-indicator">
                    <span>⚡ Link ➔</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* 4. Permitted Workspaces Cards Grid */}
      <div className="dash-section-card">
        <div className="dash-section-header">
          <div>
            <h3>{isAdmin ? "ERP Core Workspaces" : "Your Accessible Modules"}</h3>
            <p>Click any workspace to open its live data table and record new entries.</p>
          </div>
          <span className="section-count-badge">{permittedModules.length} Modules</span>
        </div>

        <div className="dash-modules-grid">
          {permittedModules.map((mod) => {
            const pendingInMod = (mod.records || []).filter((r) => r.status === "pending").length;
            const totalInMod = (mod.records || []).length;

            return (
              <div 
                key={mod.id} 
                className="dash-module-card"
                onClick={() => onSelectModule(mod.id)}
              >
                <div className="mod-card-top">
                  <div className="mod-icon-wrapper">
                    {getModuleIcon(mod)}
                  </div>
                  {pendingInMod > 0 && (
                    <span className="mod-pending-pill">
                      {pendingInMod} Pending
                    </span>
                  )}
                </div>

                <h4 className="mod-name-title">{mod.name}</h4>
                <p className="mod-desc-text">{mod.description || "Dynamic ERP Module"}</p>

                <div className="mod-card-footer">
                  <span className="mod-records-count">
                    <strong>{totalInMod}</strong> Records • {mod.fields?.length || 0} Fields
                  </span>
                  <span className="mod-arrow-link">
                    Open Table <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Recent Submissions & Activity Feed */}
      <div className="dash-section-card">
        <div className="dash-section-header">
          <div>
            <h3>Recent Submissions &amp; Activity Feed</h3>
            <p>Latest record entries submitted across your modules with live audit actions.</p>
          </div>
          {canApprove && totalPendingCount > 0 && (
            <span className="approval-attention-pill">
              🛡️ {totalPendingCount} items waiting for approval
            </span>
          )}
        </div>

        {recentSubmissions.length === 0 ? (
          <div className="dash-empty-state-box">
            <div className="empty-icon-circle">
              <FileText size={28} />
            </div>
            <h4>No Records Submitted Yet</h4>
            <p>Entries submitted in any module will appear here in real time with approval actions.</p>
          </div>
        ) : (
          <div className="recent-table-responsive">
            <table className="clean-erp-table">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Module</th>
                  <th>Primary Details</th>
                  <th>Submitted By</th>
                  <th>Status</th>
                  {canApprove && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((sub) => {
                  const isPending = sub.status === "pending";
                  const isApproved = sub.status === "approved";
                  const isRejected = sub.status === "rejected";

                  return (
                    <tr key={sub.id}>
                      <td>
                        <span className="rec-id-pill">{sub.id}</span>
                      </td>
                      <td>
                        <span 
                          className="sub-mod-link"
                          onClick={() => onSelectModule(sub.moduleId)}
                          title="Jump to this module"
                        >
                          📦 {sub.moduleName}
                        </span>
                      </td>
                      <td>
                        <div className="rec-details-cell">
                          <strong>{sub.primaryValue}</strong>
                          {sub.secondaryValue && <span className="text-secondary-sub">{sub.secondaryValue}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="submitter-cell">
                          <span className="submitter-name">{sub.submittedBy}</span>
                          <span className="submitter-date">{sub.submittedAt}</span>
                        </div>
                      </td>
                      <td>
                        {isPending && (
                          <span className="status-badge-pending">
                            <Clock size={13} /> Pending
                          </span>
                        )}
                        {isApproved && (
                          <span className="status-badge-approved">
                            <CheckCircle2 size={13} /> Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="status-badge-rejected">
                            <XCircle size={13} /> Rejected
                          </span>
                        )}
                      </td>
                      {canApprove && (
                        <td>
                          {isPending ? (
                            <div className="action-buttons-cell">
                              <button
                                type="button"
                                className="btn-action-approve"
                                onClick={() => handleApprove(sub.moduleId, sub.id)}
                                title="Approve this entry"
                              >
                                <Check size={14} /> Approve
                              </button>
                              <button
                                type="button"
                                className="btn-action-reject"
                                onClick={() => handleReject(sub.moduleId, sub.id)}
                                title="Reject this entry"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="decision-done-text">✓ Audited</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
