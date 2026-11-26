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
  FileText, 
  User, 
  Calendar,
  Layers,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  Package,
  Receipt,
  Printer,
  Edit2,
  CheckSquare
} from "lucide-react";
import { rbacStore } from "../services/rbacStore";

export default function DynamicModuleView({ moduleId, currentUser, onBackToStudio, onModulesUpdated }) {
  const [modules, setModules] = useState(() => rbacStore.getModules());
  const [searchQuery, setSearchQuery] = useState("");
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedInvoiceRecord, setSelectedInvoiceRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [syncNotification, setSyncNotification] = useState(null);

  const module = modules.find((m) => m.id === moduleId) || modules[0];
  if (!module) {
    return <div className="p-8 text-center text-gray-500">Module not found.</div>;
  }

  const fields = module.fields || [];
  const records = module.records || [];
  const isAdmin = currentUser?.role === "admin";
  const canUserApprove = isAdmin || currentUser?.canApprove === true;

  // Inventory products lookup for Sales / Purchase
  const inventoryMod = modules.find((m) => m.id === "mod_inventory");
  const availableProductNames = (inventoryMod?.records || []).map((p) => p.p_name).filter(Boolean);

  // Employees lookup for Tasks & Assignments
  const employeeMod = modules.find((m) => m.id === "mod_employee");
  const availableEmployeeNames = (employeeMod?.records || []).map((e) => e.emp_name).filter(Boolean);

  // Financial summary calculation for mod_transactions
  let totalIncome = 0;
  let totalExpense = 0;
  if (moduleId === "mod_transactions") {
    records.forEach((r) => {
      const amt = Number(String(r.tx_amount || 0).replace(/,/g, "")) || 0;
      if (String(r.tx_type).toLowerCase().includes("income")) {
        totalIncome += amt;
      } else {
        totalExpense += amt;
      }
    });
  }
  const netBalance = totalIncome - totalExpense;

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

  // Handle Form Input Change with Auto-Calculation
  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => {
      const next = { ...prev, [fieldId]: value };

      // Auto-calculate for Sales Invoice:
      if (fieldId === "inv_qty" || fieldId === "inv_unit_price") {
        const q = Number(fieldId === "inv_qty" ? value : prev.inv_qty) || 0;
        const p = Number(fieldId === "inv_unit_price" ? value : prev.inv_unit_price) || 0;
        if (q && p) next.inv_total = String(q * p);
      }

      // Auto-calculate for Purchase Order:
      if (fieldId === "po_qty" || fieldId === "po_unit_price") {
        const q = Number(fieldId === "po_qty" ? value : prev.po_qty) || 0;
        const p = Number(fieldId === "po_unit_price" ? value : prev.po_unit_price) || 0;
        if (q && p) next.po_total = String(q * p);
      }

      return next;
    });
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
    onModulesUpdated?.(updated);
    setFormData({});
    setIsEntryModalOpen(false);
  };

  // Approve action
  const handleApprove = (recId) => {
    const updated = rbacStore.updateRecordStatus(module.id, recId, "approved", currentUser.fullName);
    setModules([...updated]);
    onModulesUpdated?.(updated);
    setSyncNotification({
      title: "✓ Entry Approved Successfully!",
      details: `Record ${recId} has been approved by ${currentUser.fullName}. All associated inventory & financial records confirmed in real time!`
    });
  };

  // Reject action
  const handleReject = (recId) => {
    const updated = rbacStore.updateRecordStatus(module.id, recId, "rejected", currentUser.fullName);
    setModules([...updated]);
    onModulesUpdated?.(updated);
    setSyncNotification({
      title: "Entry Marked as Rejected",
      details: `Record ${recId} was rejected by ${currentUser.fullName}.`
    });
  };

  // Delete record
  const handleDelete = (recId) => {
    if (window.confirm("Delete this entry?")) {
      const updated = rbacStore.deleteRecord(module.id, recId);
      setModules([...updated]);
      onModulesUpdated?.(updated);
      setSyncNotification({
        title: "Record Deleted & Dynamic Link Reversed",
        details: "Stock and linked financial records were reversed automatically in real time."
      });
    }
  };

  // Start Editing a record
  const handleStartEdit = (rec) => {
    const cleaned = { ...rec };
    fields.forEach((f) => {
      if (f.type === "number" && cleaned[f.id] !== undefined) {
        cleaned[f.id] = String(cleaned[f.id]).replace(/,/g, "").trim();
      }
    });
    setEditingRecord(rec);
    setEditFormData(cleaned);
  };

  // Handle Edit Input Change with Auto-Calculation
  const handleEditInputChange = (fieldId, value) => {
    setEditFormData((prev) => {
      const next = { ...prev, [fieldId]: value };

      // Auto-calculate for Sales Invoice:
      if (fieldId === "inv_qty" || fieldId === "inv_unit_price") {
        const q = Number(fieldId === "inv_qty" ? value : prev.inv_qty) || 0;
        const p = Number(fieldId === "inv_unit_price" ? value : prev.inv_unit_price) || 0;
        if (q && p) next.inv_total = String(q * p);
      }

      // Auto-calculate for Purchase Order:
      if (fieldId === "po_qty" || fieldId === "po_unit_price") {
        const q = Number(fieldId === "po_qty" ? value : prev.po_qty) || 0;
        const p = Number(fieldId === "po_unit_price" ? value : prev.po_unit_price) || 0;
        if (q && p) next.po_total = String(q * p);
      }

      return next;
    });
  };

  // Save Edit and Dynamic Cross-Module Sync
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    const updated = rbacStore.updateRecord(module.id, editingRecord.id, editFormData, currentUser);
    setModules([...updated]);
    onModulesUpdated?.(updated);

    const docName = editFormData.inv_num || editFormData.po_num || editingRecord.id;
    let syncMsg = `Record ${docName} updated.`;
    if (moduleId === "mod_sales") {
      syncMsg = `⚡ Real-Time Sync Active: Invoice ${docName} updated. Stock adjusted in Products & Inventory, and Ledger updated in Financial Transactions!`;
    } else if (moduleId === "mod_purchase") {
      syncMsg = `⚡ Real-Time Sync Active: Purchase Order ${docName} updated. Stock adjusted in Products & Inventory, and Outflow updated in Financial Transactions!`;
    }

    setSyncNotification({
      title: "✓ Changes Saved & Dynamic Cross-Module Sync Complete!",
      details: syncMsg
    });

    setEditingRecord(null);
  };

  return (
    <div className="dynamic-module-container">
      {/* REAL-TIME CROSS-MODULE SYNC NOTIFICATION BANNER */}
      {syncNotification && (
        <div className="sync-alert-banner">
          <div className="sync-alert-left">
            <Sparkles size={20} className="text-emerald-600 flex-shrink-0" />
            <div>
              <div className="sync-alert-title">{syncNotification.title}</div>
              <div className="sync-alert-desc">{syncNotification.details}</div>
            </div>
          </div>
          <button
            type="button"
            className="sync-alert-close"
            onClick={() => setSyncNotification(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Module Title Banner */}
      <div className="module-banner-card">
        <div className="module-banner-info">
          {currentUser?.role === "admin" && onBackToStudio && (
            <button
              type="button"
              className="btn-back-studio"
              onClick={onBackToStudio}
              title="Return to Module Studio"
            >
              <ArrowLeft size={16} />
              <span>Studio</span>
            </button>
          )}
          <div className="module-badge-icon">
            {moduleId === "mod_inventory" ? <Package size={24} /> :
             moduleId === "mod_purchase" ? <Receipt size={24} /> :
             moduleId === "mod_sales" ? <TrendingUp size={24} /> :
             moduleId === "mod_transactions" ? <Wallet size={24} /> :
             moduleId === "mod_employee" ? <User size={24} /> :
             moduleId === "mod_tasks" ? <CheckSquare size={24} /> : <Layers size={24} />}
          </div>
          <div>
            <h2 className="module-heading">{module.name}</h2>
            <p className="module-subtext">{module.description || "Dynamic ERP Module"}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {(moduleId === "mod_sales" || moduleId === "mod_purchase") && records.length > 0 && (
            <button
              type="button"
              className="btn-preview-latest-doc"
              onClick={() => setSelectedInvoiceRecord(records[0])}
              title={`Preview latest ${moduleId === "mod_purchase" ? "Purchase Order" : "Tax Invoice"} (Print / PDF)`}
            >
              <Printer size={16} />
              <span>📄 Live {moduleId === "mod_purchase" ? "PO" : "Tax Invoice"} Preview</span>
            </button>
          )}

          <button
            type="button"
            className="btn-add-record"
            onClick={() => {
              const initial = {};
              fields.forEach((f) => {
                if (f.type === "select" && f.options?.[0]) initial[f.id] = f.options[0];
              });
              // Preset dates to today
              fields.forEach((f) => {
                if (f.type === "date") initial[f.id] = new Date().toISOString().split("T")[0];
              });
              setFormData(initial);
              setIsEntryModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>+ Add New Entry</span>
          </button>
        </div>
      </div>

      {/* ⚡ REAL-TIME DATA LINK BANNER ON DYNAMIC MODULES */}
      {moduleId === "mod_sales" && (
        <div className="connected-link-banner">
          <div className="link-banner-left">
            <span className="pulse-sync-dot"></span>
            <span className="link-banner-title">⚡ Real-Time Data Sharing Active:</span>
            <span className="link-banner-desc">
              Every sale automatically <strong>deducts stock</strong> from <em>Products &amp; Inventory</em> and <strong>logs revenue</strong> to <em>Financial Transactions</em>.
            </span>
          </div>
          <span className="link-flow-tag">2-Way Connected Flow</span>
        </div>
      )}

      {moduleId === "mod_purchase" && (
        <div className="connected-link-banner">
          <div className="link-banner-left">
            <span className="pulse-sync-dot"></span>
            <span className="link-banner-title">⚡ Real-Time Data Sharing Active:</span>
            <span className="link-banner-desc">
              Every purchase order automatically <strong>adds stock</strong> to <em>Products &amp; Inventory</em> and <strong>logs procurement expense</strong> to <em>Financial Transactions</em>.
            </span>
          </div>
          <span className="link-flow-tag">2-Way Connected Flow</span>
        </div>
      )}

      {moduleId === "mod_inventory" && (
        <div className="connected-link-banner">
          <div className="link-banner-left">
            <span className="pulse-sync-dot"></span>
            <span className="link-banner-title">⚡ Live Stock Auto-Sync:</span>
            <span className="link-banner-desc">
              Stock counts dynamically decrease when Sales are made and increase when Purchase Orders are received.
            </span>
          </div>
          <span className="link-flow-tag">Live Stock Balance</span>
        </div>
      )}

      {moduleId === "mod_transactions" && (
        <div className="connected-link-banner">
          <div className="link-banner-left">
            <span className="pulse-sync-dot"></span>
            <span className="link-banner-title">⚡ Real-Time Cashbook Ledger:</span>
            <span className="link-banner-desc">
              Income auto-synced from <em>Sales Invoicing</em> &bull; Expenses auto-synced from <em>Purchase Orders</em>. Zero duplicate data entry.
            </span>
          </div>
          <span className="link-flow-tag">Unified Ledger</span>
        </div>
      )}

      {moduleId === "mod_employee" && (
        <div className="connected-link-banner">
          <div className="link-banner-left">
            <span className="pulse-sync-dot"></span>
            <span className="link-banner-title">🛡️ HR Approval Workflow Active:</span>
            <span className="link-banner-desc">
              {canUserApprove 
                ? "You have Approval Authority. Review pending employee enrollments submitted by Ramesh (HR) and click Approve."
                : "Staff mode: Submitted employee profiles are queued for Super Admin audit & approval."}
            </span>
          </div>
          <span className="link-flow-tag">{canUserApprove ? "Approver Access" : "Staff Mode"}</span>
        </div>
      )}

      {moduleId === "mod_tasks" && (
        <div className="connected-link-banner">
          <div className="link-banner-left">
            <span className="pulse-sync-dot"></span>
            <span className="link-banner-title">⚡ Operational Tasks &amp; Workflow Sign-Off:</span>
            <span className="link-banner-desc">
              {canUserApprove 
                ? "You have Approval Authority. Review milestone deliverables submitted by staff and click Approve to verify completion."
                : "Staff mode: Execute your assigned milestones and submit completion deliverables for Super Admin review."}
            </span>
          </div>
          <span className="link-flow-tag">{canUserApprove ? "Approver Sign-Off" : "Staff Execution"}</span>
        </div>
      )}

      {/* SPECIAL KPI CARDS FOR FINANCIAL TRANSACTIONS */}
      {moduleId === "mod_transactions" && (
        <div className="dash-kpi-grid" style={{ marginBottom: "20px" }}>
          <div className="dash-kpi-card">
            <div className="kpi-icon-box emerald">
              <TrendingUp size={22} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Total Inflow (Sales)</span>
              <div className="kpi-val text-emerald">₹{totalIncome.toLocaleString()}</div>
              <span className="kpi-sub">Auto-synced from Sales</span>
            </div>
          </div>

          <div className="dash-kpi-card">
            <div className="kpi-icon-box amber">
              <TrendingDown size={22} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Total Outflow (Purchases)</span>
              <div className="kpi-val text-amber">₹{totalExpense.toLocaleString()}</div>
              <span className="kpi-sub">Auto-synced from POs</span>
            </div>
          </div>

          <div className="dash-kpi-card">
            <div className="kpi-icon-box blue">
              <Wallet size={22} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Net Operating Balance</span>
              <div className="kpi-val text-blue">₹{netBalance.toLocaleString()}</div>
              <span className="kpi-sub">Live Cashflow Position</span>
            </div>
          </div>
        </div>
      )}

      {/* Search and KPI Bar */}
      <div className="module-toolbar-row">
        <div className="search-box-clean">
          <Search size={16} className="search-icon-inside" />
          <input
            type="text"
            className="search-input-field"
            placeholder={`Search ${module.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="module-stats-pills">
          <span className="stat-pill">Total: {records.length}</span>
          <span className="stat-pill pending">
            Pending: {records.filter((r) => r.status === "pending").length}
          </span>
          <span className="stat-pill approved">
            Approved: {records.filter((r) => r.status === "approved").length}
          </span>
        </div>
      </div>

      {/* Dynamic Data Table */}
      <div className="module-table-wrapper">
        <table className="clean-erp-table module-data-grid">
          <thead>
            <tr>
              <th style={{ minWidth: "110px" }}>Record ID</th>
              {fields.map((f) => (
                <th key={f.id}>{f.label}</th>
              ))}
              <th style={{ minWidth: "110px" }}>Status</th>
              <th style={{ minWidth: "160px" }}>Submitted By</th>
              <th style={{ minWidth: "150px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={fields.length + 4} className="empty-table-cell">
                  No records found in this module. Click <strong>"+ Add New"</strong> to submit the first entry!
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => {
                const isPending = rec.status === "pending";
                const isApproved = rec.status === "approved";
                const isRejected = rec.status === "rejected";

                return (
                  <tr key={rec.id}>
                    <td>
                      <span 
                        className="rec-id-pill"
                        style={(moduleId === "mod_purchase" || moduleId === "mod_sales") ? { cursor: "pointer", color: "#2563eb", fontWeight: "700" } : {}}
                        onClick={() => {
                          if (moduleId === "mod_purchase" || moduleId === "mod_sales") {
                            setSelectedInvoiceRecord(rec);
                          }
                        }}
                        title={moduleId === "mod_purchase" || moduleId === "mod_sales" ? "Click to view live official document" : ""}
                      >
                        {rec.id} {(moduleId === "mod_purchase" || moduleId === "mod_sales") && "📄"}
                      </span>
                    </td>

                    {/* Dynamically render values for each field */}
                    {fields.map((f) => {
                      const val = rec[f.id];
                      return (
                        <td key={f.id} className="field-data-cell">
                          {val !== undefined && val !== "" ? String(val) : <span className="empty-dash">—</span>}
                        </td>
                      );
                    })}

                    {/* Status Pill */}
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

                    {/* Submitter */}
                    <td>
                      <div className="submitter-cell">
                        <span className="submitter-name">{rec.submittedBy || "User"}</span>
                        <span className="submitter-date">{rec.submittedAt || ""}</span>
                      </div>
                    </td>

                    {/* Approver / Staff Actions */}
                    <td>
                      <div className="action-buttons-cell">
                        {/* 1. View Invoice: ONLY for Sales and Purchase modules */}
                        {(moduleId === "mod_purchase" || moduleId === "mod_sales") && (
                          <button
                            type="button"
                            className="btn-live-invoice-pill"
                            onClick={() => setSelectedInvoiceRecord(rec)}
                            title="Open live corporate invoice & print"
                          >
                            <Printer size={13} />
                            <span>View Invoice</span>
                          </button>
                        )}

                        {/* 2. Approve & Reject: ONLY for pending records and ONLY when user has Approval authority */}
                        {canUserApprove && isPending && (
                          <>
                            <button
                              type="button"
                              className="btn-action-approve"
                              onClick={() => handleApprove(rec.id)}
                              title="Approve this entry (confirms stock and status)"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              type="button"
                              className="btn-action-reject"
                              onClick={() => handleReject(rec.id)}
                              title="Reject this entry"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}

                        {/* 3. Edit: Admin can edit any record; Staff can only edit their own pending submissions */}
                        {(isAdmin || (rec.submittedBy?.includes(currentUser?.fullName) && isPending)) && (
                          <button
                            type="button"
                            className="btn-action-edit"
                            onClick={() => handleStartEdit(rec)}
                            title="Edit record & dynamically sync connected modules"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                        )}

                        {/* 4. Delete: Strictly for Super Admin only (staff cannot delete corporate records) */}
                        {isAdmin && (
                          <button
                            type="button"
                            className="btn-trash-delete"
                            onClick={() => handleDelete(rec.id)}
                            title="Delete record (Admin only)"
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

      {/* DYNAMIC FORM ENTRY MODAL */}
      {isEntryModalOpen && (
        <div className="modal-backdrop-clean">
          <div className="dynamic-entry-modal">
            <div className="modal-top-bar">
              <div>
                <h3 className="modal-title">New {module.name} Entry</h3>
                <p className="modal-desc">
                  {moduleId === "mod_sales"
                    ? "Submitting this invoice automatically updates Inventory stock and logs income to Financial Transactions."
                    : moduleId === "mod_purchase"
                    ? "Submitting this PO automatically increases Inventory stock and logs expense to Financial Transactions."
                    : "Fill in the required information below to record this ERP entry."}
                </p>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsEntryModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="dynamic-rendered-form">
              {fields.map((f) => (
                <div key={f.id} className="rendered-form-field">
                  <label className="field-label-text">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>

                  {/* Suggest Product Name dropdown if in Sales/Purchase */}
                  {(f.id === "inv_product" || f.id === "po_product") && availableProductNames.length > 0 ? (
                    <div>
                      <select
                        className="clean-form-control"
                        value={formData[f.id] || ""}
                        onChange={(e) => handleInputChange(f.id, e.target.value)}
                        required={f.required}
                      >
                        <option value="">-- Choose from Live Inventory --</option>
                        {availableProductNames.map((name, idx) => (
                          <option key={idx} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : f.id === "task_assigned_to" && availableEmployeeNames.length > 0 ? (
                    <div>
                      <select
                        className="clean-form-control"
                        value={formData[f.id] || ""}
                        onChange={(e) => handleInputChange(f.id, e.target.value)}
                        required={f.required}
                      >
                        <option value="">-- Choose from Employee Directory --</option>
                        {availableEmployeeNames.map((name, idx) => (
                          <option key={idx} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : f.type === "text" ? (
                    <input
                      type="text"
                      className="clean-form-control"
                      placeholder={f.placeholder || ""}
                      value={formData[f.id] || ""}
                      onChange={(e) => handleInputChange(f.id, e.target.value)}
                      required={f.required}
                    />
                  ) : f.type === "number" ? (
                    <input
                      type="number"
                      className="clean-form-control"
                      placeholder={f.placeholder || "0"}
                      value={formData[f.id] || ""}
                      onChange={(e) => handleInputChange(f.id, e.target.value)}
                      required={f.required}
                    />
                  ) : f.type === "select" ? (
                    <select
                      className="clean-form-control"
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
                  ) : f.type === "date" ? (
                    <input
                      type="date"
                      className="clean-form-control"
                      value={formData[f.id] || ""}
                      onChange={(e) => handleInputChange(f.id, e.target.value)}
                      required={f.required}
                    />
                  ) : f.type === "textarea" ? (
                    <textarea
                      className="clean-form-control"
                      rows={f.rows || 3}
                      placeholder={f.placeholder || ""}
                      value={formData[f.id] || ""}
                      onChange={(e) => handleInputChange(f.id, e.target.value)}
                      required={f.required}
                    />
                  ) : (
                    <input
                      type="text"
                      className="clean-form-control"
                      value={formData[f.id] || ""}
                      onChange={(e) => handleInputChange(f.id, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <div className="modal-buttons-row">
                <button type="submit" className="btn-save-record">
                  ⚡ Submit &amp; Sync Across ERP
                </button>
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => setIsEntryModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REAL-TIME EDIT & CASCADE SYNC MODAL */}
      {editingRecord && (
        <div className="modal-backdrop-clean">
          <div className="dynamic-entry-modal">
            <div className="modal-top-bar">
              <div>
                <h3 className="modal-title">✏️ Edit Record: {editingRecord.id}</h3>
                <p className="modal-subtext">
                  {moduleId === "mod_sales"
                    ? "Changes here will automatically update Inventory Stock & Financial Transactions Cashbook in real time!"
                    : moduleId === "mod_purchase"
                    ? "Changes here will automatically adjust Inventory Stock & Financial Transactions Expense in real time!"
                    : `Update fields for ${module.name}`}
                </p>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setEditingRecord(null)}
              >
                ✕
              </button>
            </div>

            {/* Dynamic Real-Time Connected Notice */}
            {(moduleId === "mod_sales" || moduleId === "mod_purchase") && (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "10px 14px", margin: "14px 0", fontSize: "12.5px", color: "#1e40af", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={16} className="text-blue-600 flex-shrink-0" />
                <span>
                  <strong>⚡ Dynamic 2-Way Link Active:</strong> Editing quantity or amount will auto-recalculate Total, update stock in <strong>Products &amp; Inventory</strong>, and sync the cashbook in <strong>Financial Transactions</strong>.
                </span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="modal-form-grid">
              {fields.map((f) => (
                <div key={f.id} className="clean-form-group">
                  <label className="clean-form-label">
                    {f.label} {f.required && <span className="req-star">*</span>}
                  </label>

                  {/* Auto-fill product dropdown for sales & purchase */}
                  {(f.id === "inv_product" || f.id === "po_product") ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <input
                        type="text"
                        list={`edit-product-options-${f.id}`}
                        className="clean-form-control"
                        placeholder="Select or enter product name..."
                        value={editFormData[f.id] || ""}
                        onChange={(e) => handleEditInputChange(f.id, e.target.value)}
                        required={f.required}
                      />
                      <datalist id={`edit-product-options-${f.id}`}>
                        {availableProductNames.map((name) => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                    </div>
                  ) : f.id === "task_assigned_to" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <input
                        type="text"
                        list={`edit-employee-options-${f.id}`}
                        className="clean-form-control"
                        placeholder="Select or enter assigned employee..."
                        value={editFormData[f.id] || ""}
                        onChange={(e) => handleEditInputChange(f.id, e.target.value)}
                        required={f.required}
                      />
                      <datalist id={`edit-employee-options-${f.id}`}>
                        {availableEmployeeNames.map((name) => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                    </div>
                  ) : f.type === "number" ? (
                    <input
                      type="number"
                      step="any"
                      className="clean-form-control"
                      placeholder={f.placeholder || "0"}
                      value={editFormData[f.id] || ""}
                      onChange={(e) => handleEditInputChange(f.id, e.target.value)}
                      required={f.required}
                    />
                  ) : f.type === "select" ? (
                    <select
                      className="clean-form-control"
                      value={editFormData[f.id] || ""}
                      onChange={(e) => handleEditInputChange(f.id, e.target.value)}
                      required={f.required}
                    >
                      {(f.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "date" ? (
                    <input
                      type="date"
                      className="clean-form-control"
                      value={editFormData[f.id] || ""}
                      onChange={(e) => handleEditInputChange(f.id, e.target.value)}
                      required={f.required}
                    />
                  ) : f.type === "textarea" ? (
                    <textarea
                      className="clean-form-control"
                      rows={f.rows || 3}
                      placeholder={f.placeholder || ""}
                      value={editFormData[f.id] || ""}
                      onChange={(e) => handleEditInputChange(f.id, e.target.value)}
                      required={f.required}
                    />
                  ) : (
                    <input
                      type="text"
                      className="clean-form-control"
                      value={editFormData[f.id] || ""}
                      onChange={(e) => handleEditInputChange(f.id, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <div className="modal-buttons-row">
                <button type="submit" className="btn-save-record">
                  ⚡ Save &amp; Dynamic Sync Across ERP
                </button>
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => setEditingRecord(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* CORPORATE LIVE INVOICE DOCUMENT VIEWER & PRINT MODAL (IMAGE 2)      */}
      {/* =================================================================== */}
      {selectedInvoiceRecord && (
        <div className="modal-backdrop-clean">
          <div className="invoice-print-modal-box">
            {/* Modal Controls Bar */}
            <div className="invoice-modal-toolbar no-print">
              <div className="toolbar-left-info">
                <Receipt size={18} className="text-indigo-600" />
                <strong>Live Document: {selectedInvoiceRecord.po_num || selectedInvoiceRecord.inv_num || selectedInvoiceRecord.id}</strong>
                <span className={`status-badge-${selectedInvoiceRecord.status || "approved"}`} style={{ marginLeft: "10px" }}>
                  {selectedInvoiceRecord.status === "approved" ? "✓ Approved" : "⏳ Pending Approval"}
                </span>
              </div>
              <div className="toolbar-right-actions">
                <button
                  type="button"
                  className="btn-print-doc-action"
                  onClick={() => window.print()}
                  title="Print this invoice or save as PDF"
                >
                  <Printer size={16} />
                  <span>🖨️ Print / Save as PDF</span>
                </button>
                <button
                  type="button"
                  className="btn-close-invoice-modal"
                  onClick={() => setSelectedInvoiceRecord(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Print Sheet Container (Rendered exactly matching Image 2) */}
            <div className="print-document-sheet">
              {/* Header Box */}
              <div className="print-sheet-header">
                <div className="company-info-block">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#1e3a8a", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "16px", letterSpacing: "1px" }}>
                      AE
                    </div>
                    <div>
                      <h1 className="corp-name" style={{ margin: 0, lineHeight: 1.1 }}>[Company Name]</h1>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", letterSpacing: "0.5px" }}>ACME ENTERPRISE SOLUTIONS PVT LTD</span>
                    </div>
                  </div>
                  <span className="corp-sub">100 Industrial Parkway, Ambattur Industrial Estate, Chennai, TN 600058</span>
                  <span className="corp-sub">Phone: +91 44 2828 9000 &bull; Fax: (000) 000-0000</span>
                  <span className="corp-sub">GSTIN: 33AAAAA0000A1Z5 &bull; www.acme-corp.in</span>
                </div>

                <div className="po-title-meta-block">
                  <h2 className="doc-type-title">
                    {moduleId === "mod_purchase" ? "PURCHASE ORDER" : "TAX INVOICE"}
                  </h2>
                  <div className="doc-meta-table">
                    <div className="meta-tbl-row">
                      <span className="meta-tbl-th">DATE</span>
                      <span className="meta-tbl-td">
                        {selectedInvoiceRecord.po_date || selectedInvoiceRecord.inv_date || new Date().toISOString().split("T")[0]}
                      </span>
                    </div>
                    <div className="meta-tbl-row">
                      <span className="meta-tbl-th">{moduleId === "mod_purchase" ? "PO #" : "INV #"}</span>
                      <span className="meta-tbl-td">
                        <strong>{selectedInvoiceRecord.po_num || selectedInvoiceRecord.inv_num || selectedInvoiceRecord.id}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendor & Ship-To Blocks */}
              <div className="print-parties-row">
                <div className="print-party-box">
                  <div className="print-banner-title">
                    {moduleId === "mod_purchase" ? "VENDOR" : "BILLED TO (CUSTOMER)"}
                  </div>
                  <div className="print-party-details">
                    <strong>{selectedInvoiceRecord.po_vendor || selectedInvoiceRecord.inv_customer || "[Party Name]"}</strong>
                    <span>B2B Corporate Client Division</span>
                    <span>Industrial Tech Park, Electronic City, Bengaluru</span>
                    <span>GSTIN / Tax ID: 29BBBBB1111B1Z2</span>
                    <span>Terms: {selectedInvoiceRecord.po_payment_terms || selectedInvoiceRecord.inv_payment_mode || "Net 30 Days"}</span>
                  </div>
                </div>

                <div className="print-party-box">
                  <div className="print-banner-title">SHIP TO</div>
                  <div className="print-party-details">
                    <strong>Acme Central Delivery Warehouse #2</strong>
                    <span>Receiving Bay 4, Ambattur Industrial Estate</span>
                    <span>Chennai, Tamil Nadu - 600058</span>
                    <span>Contact: Senthil Nathan (Manager)</span>
                    <span>Phone: +91 98400 12345</span>
                  </div>
                </div>
              </div>

              {/* Requisitioner & Shipping Terms Bar */}
              <div className="print-terms-bar">
                <div className="terms-col">
                  <span className="term-lbl">REQUISITIONER</span>
                  <span className="term-txt">{selectedInvoiceRecord.submittedBy || "Operations Lead"}</span>
                </div>
                <div className="terms-col">
                  <span className="term-lbl">SHIP VIA</span>
                  <span className="term-txt">Surface Express Cargo</span>
                </div>
                <div className="terms-col">
                  <span className="term-lbl">F.O.B.</span>
                  <span className="term-txt">Destination</span>
                </div>
                <div className="terms-col">
                  <span className="term-lbl">SHIPPING TERMS</span>
                  <span className="term-txt">{selectedInvoiceRecord.po_payment_terms || "Prepaid Freight"}</span>
                </div>
              </div>

              {/* Main Line Items Table */}
              <div className="print-table-wrapper">
                <table className="corporate-po-table">
                  <thead>
                    <tr>
                      <th style={{ width: "15%" }}>ITEM #</th>
                      <th style={{ width: "45%" }}>DESCRIPTION</th>
                      <th style={{ width: "10%", textAlign: "center" }}>QTY</th>
                      <th style={{ width: "15%", textAlign: "right" }}>UNIT PRICE</th>
                      <th style={{ width: "15%", textAlign: "right" }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-mono">{selectedInvoiceRecord.id}</td>
                      <td>
                        <strong>{selectedInvoiceRecord.po_product || selectedInvoiceRecord.inv_product || "Enterprise Hardware Unit"}</strong>
                        <div className="text-xs text-slate-500">Official warranty guaranteed OEM serial sealed pack</div>
                      </td>
                      <td style={{ textAlign: "center" }}>{selectedInvoiceRecord.po_qty || selectedInvoiceRecord.inv_qty || 1}</td>
                      <td style={{ textAlign: "right" }}>₹{Number(String(selectedInvoiceRecord.po_unit_price || selectedInvoiceRecord.inv_unit_price || 0).replace(/,/g, "")).toLocaleString()}</td>
                      <td style={{ textAlign: "right" }}>
                        <strong>₹{Number(String(selectedInvoiceRecord.po_total || selectedInvoiceRecord.inv_total || 0).replace(/,/g, "")).toLocaleString()}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Comments & Financial Summary Bottom Block */}
              <div className="print-bottom-grid">
                <div className="print-comments-box">
                  <div className="comments-lbl">Comments or Special Instructions</div>
                  <div className="comments-txt">
                    1. Deliver all consignments with original manufacturer warranty certificates.<br/>
                    2. Please send duplicate invoice copy with packaging gate pass.<br/>
                    3. For questions regarding this order, contact Accounts at billing@acme-corp.in.
                  </div>
                  <div className="print-auth-signature-row">
                    <div className="auth-sign-box">
                      <div className="sign-line"></div>
                      <span className="sign-caption">Authorized Signatory &amp; Stamp</span>
                    </div>
                  </div>
                </div>

                <div className="print-financial-summary-card">
                  <div className="fin-row">
                    <span>SUBTOTAL</span>
                    <strong>₹{Number(String(selectedInvoiceRecord.po_total || selectedInvoiceRecord.inv_total || 0).replace(/,/g, "")).toLocaleString()}</strong>
                  </div>
                  <div className="fin-row">
                    <span>GST TAX (18%)</span>
                    <span>₹{Math.round(Number(String(selectedInvoiceRecord.po_total || selectedInvoiceRecord.inv_total || 0).replace(/,/g, "")) * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="fin-row">
                    <span>SHIPPING &amp; HANDLING</span>
                    <span>₹150.00</span>
                  </div>
                  <div className="fin-row total-highlight">
                    <span>TOTAL</span>
                    <strong className="text-blue-800">
                      ₹{Math.round(Number(String(selectedInvoiceRecord.po_total || selectedInvoiceRecord.inv_total || 0).replace(/,/g, "")) * 1.18 + 150).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="print-footer-note">
                If you have any questions about this purchase order, please contact [Accounts Dept, +91 44 2828 9000, billing@acme-corp.in]
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
