import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Check, 
  X, 
  Layers,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import { rbacStore } from "../services/rbacStore";

export default function DynamicModuleView({ moduleId, currentUser, onBackToStudio }) {
  const [modules, setModules] = useState(() => rbacStore.getModules());
  const [searchQuery, setSearchQuery] = useState("");
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const module = modules.find((m) => m.id === moduleId);
  if (!module) {
    return (
      <div className="p-12 text-center text-slate-500">
        <Layers size={36} className="mx-auto text-slate-300 mb-2" />
        <p className="font-semibold text-sm">Module not found.</p>
      </div>
    );
  }

  const fields = module.fields || [];
  const records = module.records || [];
  const isAdmin = currentUser?.role === "admin";
  const canUserApprove = isAdmin || currentUser?.canApprove === true;
  const isEmployeeDirectory = module.id === "mod_employees";

  // Access Permission Guard (RBAC): Ensure user has permission to view this module
  const isPermitted = isAdmin ||
    (currentUser?.allowedModuleIds || []).includes("*") ||
    (currentUser?.allowedModuleIds || []).includes(module.id);

  if (!isPermitted) {
    return (
      <div className="p-12 text-center text-slate-500 max-w-md mx-auto">
        <ShieldCheck size={40} className="mx-auto text-amber-500 mb-3" />
        <h3 className="font-bold text-base text-slate-900">Access Restricted</h3>
        <p className="text-sm mt-1 text-slate-500">
          Your account ({currentUser?.fullName}) is not authorized to view the "{module.name}" workspace. Contact Super Admin to request access.
        </p>
      </div>
    );
  }

  // Separation of Duties:
  // In Employee Directory, ONLY HR (non-admin or HR department user) can add new employee records.
  // Super Admin acts strictly as Executive Reviewer and Final Approver.
  const canAddEntry = isEmployeeDirectory
    ? !isAdmin || currentUser?.department === "Human Resources"
    : true;

  // Separation of Duties & Approvals Authority:
  // - In Employee Directory: ONLY HR (Ramesh) creates employees; ONLY Super Admin (Rajesh Kumar) reviews/approves.
  // - In other modules: Both Super Admin and designated Approvers (like Manager Senthil Nathan) can approve.
  // - Super Admin has ultimate executive authority and can approve any record.
  // - Non-admin staff/managers cannot approve their own submissions (Self-Approval Restriction).
  const canUserReviewRecord = (rec) => {
    if (isAdmin) return true; // Super Admin has ultimate executive approval authority across all modules!
    if (rec.submittedBy === currentUser?.fullName) return false; // Regular staff / manager cannot approve their own submission (SoD)
    if (isEmployeeDirectory) return false; // Employee Directory approval is reserved for Super Admin
    return currentUser?.canApprove === true; // Manager/Approver authority for their assigned modules
  };

  // Generate dynamic workflow steps for ANY module
  const getWorkflowSteps = () => {
    if (isEmployeeDirectory) {
      return {
        title: "HR Employee Registration ➔ Executive Approval Workflow",
        subtitle: isAdmin
          ? "Logged in as Super Admin (Review & Approval Authority)"
          : "Logged in as HR Ramesh (Employee Data Creator)",
        step1: {
          title: "HR Ramesh Enters Data",
          desc: 'Clicks "+ Add New Employee"',
          active: !isAdmin
        },
        step2: {
          title: "Pending Review Queue",
          desc: "Records wait for management sign-off",
          active: false
        },
        step3: {
          title: "Super Admin Approval",
          desc: 'Rajesh Kumar clicks "✓ Approve"',
          active: isAdmin
        },
        step4: {
          title: "Official Company Registry",
          desc: "Status updated to Approved ✅",
          active: false
        }
      };
    }
    if (module.id === "mod_products") {
      const isApproverRole = isAdmin || currentUser?.canApprove === true;
      return {
        title: "Product Inventory Entry ➔ Manager / Admin Verification Workflow",
        subtitle: isApproverRole
          ? `Logged in as ${currentUser?.fullName} (Inventory Verification Authority)`
          : `Logged in as ${currentUser?.fullName} (Product Spec & Stock Entry)`,
        step1: {
          title: "Product Spec Entry",
          desc: "Staff Priya / Manager Senthil submits item",
          active: !isApproverRole
        },
        step2: {
          title: "Pricing & Stock Queue",
          desc: "Status: ⏳ Pending price & stock review",
          active: false
        },
        step3: {
          title: "Manager / Admin Sign-Off",
          desc: 'Approver verifies and clicks "✓ Approve"',
          active: isApproverRole
        },
        step4: {
          title: "Active Catalog & PO Builder",
          desc: "Available in PO / Invoice Builder ✅",
          active: false
        }
      };
    }
    if (module.id === "mod_leave") {
      const isApproverRole = isAdmin || currentUser?.canApprove === true;
      return {
        title: "Leave Application ➔ Supervisor Sign-Off Workflow",
        subtitle: isApproverRole
          ? `Logged in as ${currentUser?.fullName} (Approval Authority)`
          : `Logged in as ${currentUser?.fullName} (Applicant)`,
        step1: {
          title: "Staff Submits Request",
          desc: 'Clicks "+ Add New Entry"',
          active: !isApproverRole
        },
        step2: {
          title: "Manager Review Queue",
          desc: "Awaiting supervisor sign-off",
          active: false
        },
        step3: {
          title: "Manager / Admin Approval",
          desc: 'Approver clicks "✓ Approve"',
          active: isApproverRole
        },
        step4: {
          title: "Leave Approved & Scheduled",
          desc: "Leave calendar updated ✅",
          active: false
        }
      };
    }
    if (module.id === "mod_purchase_orders") {
      const isApproverRole = isAdmin || currentUser?.canApprove === true;
      return {
        title: "Procurement Entry ➔ Executive PO Authorization Workflow",
        subtitle: isApproverRole
          ? `Logged in as ${currentUser?.fullName} (PO Authorization Authority)`
          : `Logged in as ${currentUser?.fullName} (Procurement Entry)`,
        step1: {
          title: "Procurement Entry",
          desc: "Staff creates vendor purchase order",
          active: !isApproverRole
        },
        step2: {
          title: "Budget & Terms Review",
          desc: "Validation against department budget",
          active: false
        },
        step3: {
          title: "Executive PO Sign-Off",
          desc: 'Authorized approver signs off',
          active: isApproverRole
        },
        step4: {
          title: "Official PO Issued",
          desc: "Purchase order certified ✅",
          active: false
        }
      };
    }
    // Generic / Custom Module Workflow
    const isApproverRole = isAdmin || currentUser?.canApprove === true;
    return {
      title: `${module.name} ➔ Operational Approval Workflow`,
      subtitle: isApproverRole
        ? `Logged in as ${currentUser?.fullName} (Review & Approval Authority)`
        : `Logged in as ${currentUser?.fullName} (Data Entry)`,
      step1: {
        title: "Data Submission",
        desc: `Staff submits ${module.name} entry`,
        active: !isApproverRole
      },
      step2: {
        title: "Validation Queue",
        desc: "Stored awaiting review",
        active: false
      },
      step3: {
        title: "Management Sign-Off",
        desc: 'Reviewer clicks "✓ Approve"',
        active: isApproverRole
      },
      step4: {
        title: "Verified Registry",
        desc: "Certified live in database ✅",
        active: false
      }
    };
  };

  const workflow = getWorkflowSteps();

  // Filter records by search
  const filteredRecords = records.filter((rec) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (rec.id && rec.id.toLowerCase().includes(query)) ||
      (rec.submittedBy && rec.submittedBy.toLowerCase().includes(query)) ||
      fields.some((f) => rec[f.id] && String(rec[f.id]).toLowerCase().includes(query))
    );
  });

  // Handle Form Input Change
  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Submit new record
  const handleSaveRecord = (e) => {
    e.preventDefault();
    // Validate required fields
    for (const f of fields) {
      if (f.required && !formData[f.id]) {
        alert(`Field "${f.label}" is required.`);
        return;
      }
    }

    const updated = rbacStore.addRecord(module.id, formData, currentUser);
    setModules([...updated]);
    setFormData({});
    setIsEntryModalOpen(false);
  };

  // Approve action
  const handleApprove = (recId) => {
    const updated = rbacStore.updateRecordStatus(module.id, recId, "approved", currentUser.fullName);
    setModules([...updated]);
  };

  // Reject action
  const handleReject = (recId) => {
    const updated = rbacStore.updateRecordStatus(module.id, recId, "rejected", currentUser.fullName);
    setModules([...updated]);
  };

  // Delete record
  const handleDelete = (recId) => {
    if (window.confirm("Delete this entry?")) {
      const updated = rbacStore.deleteRecord(module.id, recId);
      setModules([...updated]);
    }
  };

  return (
    <div className="p-4 md:p-5 max-w-7xl mx-auto space-y-4">
      {/* Module Title Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          {currentUser?.role === "admin" && onBackToStudio && (
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors border border-slate-200/60 cursor-pointer"
              onClick={onBackToStudio}
              title="Return to Module Studio"
            >
              <ArrowLeft size={14} />
              <span>Studio</span>
            </button>
          )}
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{module.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{module.description || "Dynamic ERP Module"}</p>
          </div>
        </div>

        {canAddEntry ? (
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
            onClick={() => {
              const initial = {};
              fields.forEach((f) => {
                if (f.type === "select" && f.options?.[0]) initial[f.id] = f.options[0];
              });
              setFormData(initial);
              setIsEntryModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>{isEmployeeDirectory ? "+ Add New Employee" : "+ Add New Entry"}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 border border-indigo-200/80 rounded-xl text-xs font-bold text-indigo-800 shadow-2xs shrink-0">
            <ShieldCheck size={16} className="text-indigo-600" />
            <span>Super Admin Mode (Employees managed by HR Ramesh)</span>
          </div>
        )}
      </div>

      {/* Visual Role-Based Approval Flow Roadmap (Shows who does what dynamically for any module) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider gap-2">
          <span className="flex items-center gap-1.5 text-slate-800 font-extrabold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {workflow.title}
          </span>
          <span className="text-indigo-600 font-semibold normal-case">
            {workflow.subtitle}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Step 1 */}
          <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
            workflow.step1.active ? "bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs" : "bg-slate-50 border-slate-200/80 text-slate-600"
          }`}>
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              1
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">{workflow.step1.title}</div>
              <div className="text-[11px] text-slate-500 truncate">{workflow.step1.desc}</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-2.5 rounded-xl border bg-amber-50/70 border-amber-200/80 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              2
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-amber-950 truncate">{workflow.step2.title}</div>
              <div className="text-[11px] text-amber-700 truncate">{workflow.step2.desc}</div>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
            workflow.step3.active ? "bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs" : "bg-slate-50 border-slate-200/80 text-slate-600"
          }`}>
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              3
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">{workflow.step3.title}</div>
              <div className="text-[11px] text-slate-500 truncate">{workflow.step3.desc}</div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-2.5 rounded-xl border bg-slate-50 border-slate-200/80 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              4
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">{workflow.step4.title}</div>
              <div className="text-[11px] text-slate-500 truncate">{workflow.step4.desc}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and KPI Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs transition-all"
            placeholder={`Search in ${module.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60">
            Total: <strong className="text-slate-900">{records.length}</strong>
          </span>
          <span className="text-sm font-medium px-3.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60">
            Pending: <strong className="text-amber-900">{records.filter((r) => r.status === "pending").length}</strong>
          </span>
          <span className="text-sm font-medium px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Approved: <strong className="text-emerald-900">{records.filter((r) => r.status === "approved").length}</strong>
          </span>
          <span className="text-sm font-medium px-3.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/60">
            Rejected: <strong className="text-rose-900">{records.filter((r) => r.status === "rejected").length}</strong>
          </span>
        </div>
      </div>

      {/* Dynamic Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[850px]">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5 whitespace-nowrap sticky left-0 bg-slate-50 z-20 border-r border-slate-200/80 shadow-2xs w-32 min-w-[125px]">
                  Record ID
                </th>
                {fields.map((f) => (
                  <th key={f.id} className="py-2.5 px-3.5 whitespace-nowrap min-w-[150px]">{f.label}</th>
                ))}
                <th className="py-2.5 px-3.5 whitespace-nowrap min-w-[170px]">Status &amp; Review Trail</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap min-w-[140px]">Submitted By</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap min-w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={fields.length + 4} className="py-12 text-center text-slate-400">
                    <p className="text-base font-semibold text-slate-700">No records found in this workspace.</p>
                    {isEmployeeDirectory && isAdmin ? (
                      <p className="text-sm mt-1.5 text-slate-500 max-w-md mx-auto">
                        Employee records registered by <strong>HR (Ramesh)</strong> will automatically appear here for your executive review and approval.
                      </p>
                    ) : canAddEntry ? (
                      <p className="text-sm mt-1 text-slate-400">Click "{isEmployeeDirectory ? '+ Add New Employee' : '+ Add New Entry'}" above to submit the first record.</p>
                    ) : (
                      <p className="text-sm mt-1 text-slate-400">Submissions created by assigned department staff will appear here.</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isPending = rec.status === "pending";
                  const isApproved = rec.status === "approved";
                  const isRejected = rec.status === "rejected";

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono font-bold text-indigo-600 text-sm whitespace-nowrap sticky left-0 bg-white z-10 border-r border-slate-200/80 shadow-2xs w-32 min-w-[125px]">
                        <span className="bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md inline-block">
                          {rec.id}
                        </span>
                      </td>

                      {/* Dynamically render values for each field */}
                      {fields.map((f) => {
                        const val = rec[f.id];
                        return (
                          <td key={f.id} className="py-2.5 px-3.5 text-slate-700 text-sm whitespace-nowrap">
                            {val !== undefined && val !== "" ? (
                              String(val)
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Status & Review Audit Trail */}
                      <td className="py-2.5 px-3.5">
                        {isPending && (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 w-fit">
                              <Clock size={13} className="animate-pulse" /> Pending
                            </span>
                            <span className="text-[11px] text-amber-600 font-medium mt-0.5 whitespace-nowrap">
                              {isEmployeeDirectory ? "⏳ Awaiting Admin Approval" : "⏳ Awaiting Sign-Off"}
                            </span>
                          </div>
                        )}
                        {isApproved && (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 w-fit">
                                <CheckCircle2 size={13} /> Approved
                              </span>
                              {module.id === "mod_products" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60" title="Active catalog item ready to insert in PO / Invoice Builder">
                                  🛒 In PO Builder
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium mt-0.5 whitespace-nowrap">
                              by {rec.reviewedBy || "Super Admin"}
                            </span>
                            {rec.reviewedAt && (
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">{rec.reviewedAt}</span>
                            )}
                          </div>
                        )}
                        {isRejected && (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200/60 w-fit">
                              <XCircle size={13} /> Rejected
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium mt-0.5 whitespace-nowrap">
                              by {rec.reviewedBy || "Super Admin"}
                            </span>
                            {rec.reviewedAt && (
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">{rec.reviewedAt}</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Submitter */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-sm whitespace-nowrap">{rec.submittedBy || "User"}</span>
                          <span className="text-xs text-slate-400 whitespace-nowrap">{rec.submittedAt || ""}</span>
                        </div>
                      </td>

                      {/* Approver / Staff Actions */}
                      <td className="py-2.5 px-4 text-right whitespace-nowrap min-w-[150px]">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Approval Actions on Pending Records when user has review authority */}
                          {isPending && canUserReviewRecord(rec) && (
                            <>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-lg transition-colors cursor-pointer shadow-2xs"
                                onClick={() => handleApprove(rec.id)}
                                title="Approve Record"
                              >
                                <Check size={14} /> Approve
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center justify-center p-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 rounded-lg transition-colors cursor-pointer"
                                onClick={() => handleReject(rec.id)}
                                title="Reject Record"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}

                          {/* If pending and non-admin self-submitted (SoD: user cannot approve their own record) */}
                          {isPending && !isAdmin && rec.submittedBy === currentUser?.fullName && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg border border-amber-200/60" title="Awaiting review by authorized approver">
                              <Clock size={12} /> Your Submission (Queue)
                            </span>
                          )}

                          {/* If pending and regular submitter without review authority */}
                          {isPending && !canUserReviewRecord(rec) && rec.submittedBy !== currentUser?.fullName && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg border border-amber-200/60">
                              <Clock size={12} /> In Review Queue
                            </span>
                          )}

                          {/* Status Badge when already Reviewed (Never empty blank cell!) */}
                          {!isPending && (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg ${
                                isApproved
                                  ? "text-emerald-700 bg-emerald-50 border border-emerald-200/60"
                                  : "text-rose-700 bg-rose-50 border border-rose-200/60"
                              }`}
                              title={isApproved ? `Approved by ${rec.reviewedBy || 'Approver'}` : `Declined by ${rec.reviewedBy || 'Approver'}`}
                            >
                              {isApproved ? "✓ Approved" : "✕ Declined"}
                            </span>
                          )}

                          {/* Super Admin Delete Authority */}
                          {isAdmin && (
                            <button
                              type="button"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer ml-1"
                              onClick={() => handleDelete(rec.id)}
                              title="Delete record (Super Admin Authority Only)"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DYNAMIC FORM MODAL (RENDERS EXACT DRAG-AND-DROP FIELDS DESIGNED BY ADMIN) */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">New {module.name} Entry</h3>
                <p className="text-xs text-slate-500 mt-0.5">Fill in the fields below. Dynamically generated from Studio.</p>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => setIsEntryModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
              {fields.map((f) => (
                <div key={f.id} className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {f.label} {f.required && <span className="text-rose-500">*</span>}
                  </label>

                  {/* Text Input */}
                  {f.type === "text" && (
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                      placeholder={f.placeholder || ""}
                      value={formData[f.id] || ""}
                      onChange={(e) => handleInputChange(f.id, e.target.value)}
                      required={f.required}
                    />
                  )}

                  {/* Number Input */}
                  {f.type === "number" && (
                    <input
                      type="number"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                      placeholder={f.placeholder || "0"}
                      value={formData[f.id] || ""}
                      onChange={(e) => handleInputChange(f.id, e.target.value)}
                      required={f.required}
                    />
                  )}

                  {/* Select Dropdown */}
                  {f.type === "select" && (
                    <select
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={formData[f.id] || f.options?.[0] || ""}
                      onChange={(e) => handleInputChange(f.id, e.target.value)}
                      required={f.required}
                    >
                      {(f.options || []).map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Date Input */}
                  {f.type === "date" && (
                    <input
                      type="date"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={formData[f.id] || ""}
                      onChange={(e) => handleInputChange(f.id, e.target.value)}
                      required={f.required}
                    />
                  )}

                  {/* Textarea */}
                  {f.type === "textarea" && (
                    <textarea
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                      rows={f.rows || 3}
                      placeholder={f.placeholder || ""}
                      value={formData[f.id] || ""}
                      onChange={(e) => handleInputChange(f.id, e.target.value)}
                      required={f.required}
                    />
                  )}

                  {/* Checkbox / Toggle Switch */}
                  {f.type === "checkbox" && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-sm font-semibold text-slate-700">{f.checkboxLabel || "Yes / Enable"}</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={formData[f.id] !== undefined ? !!formData[f.id] : true}
                        onClick={() => handleInputChange(f.id, formData[f.id] !== undefined ? !formData[f.id] : false)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          (formData[f.id] !== undefined ? !!formData[f.id] : true) ? "bg-indigo-600" : "bg-slate-300"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            (formData[f.id] !== undefined ? !!formData[f.id] : true) ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  onClick={() => setIsEntryModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  Submit Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
