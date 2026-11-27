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
  Receipt,
  Printer,
  Edit2,
  ClipboardCheck,
  Link2,
  Zap,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CreditCard
} from "lucide-react";
import { rbacStore } from "../services/rbacStore";

export default function DynamicModuleView({ moduleId, currentUser, onBackToStudio, onModulesUpdated, onSelectModule }) {
  const [modules, setModules] = useState(() => rbacStore.getModules());
  const [searchQuery, setSearchQuery] = useState("");
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedInvoiceRecord, setSelectedInvoiceRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [syncNotification, setSyncNotification] = useState(null);

  // Dynamic Module Links State
  const [linksState, setLinksState] = useState(() => rbacStore.getModuleLinks());
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [sourceLinkMod, setSourceLinkMod] = useState(moduleId);
  const [targetLinkMod, setTargetLinkMod] = useState("");
  const [linkSavedToast, setLinkSavedToast] = useState(false);
  // Manual & Auto Field Mappings state: { [targetFieldId]: sourceFieldId }
  const [manualMappings, setManualMappings] = useState({});

  // Dynamic 1-Click Multi-Module Transfer Modal State
  const [transferModal, setTransferModal] = useState({
    isOpen: false,
    sourceRecord: null,
    targetModule: null,
    formData: {}
  });

  const module = modules.find((m) => m.id === moduleId) || modules[0];
  if (!module) {
    return <div className="p-8 text-center text-gray-500">Module not found.</div>;
  }

  const isInvoiceModule = moduleId === "mod_invoice" || (module.name && module.name.toLowerCase().includes("invoice"));
  const fields = module.fields || [];
  const records = module.records || [];
  const isAdmin = currentUser?.role === "admin";
  const canUserApprove = isAdmin || currentUser?.canApprove === true;

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

  // Handle generic input change
  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => {
      const next = { ...prev, [fieldId]: value };

      // Auto-compute PO total if unit price or qty is modified
      if (moduleId === "mod_purchase" && (fieldId === "po_qty" || fieldId === "po_unit_price")) {
        const q = Number(next.po_qty || 0);
        const p = Number(next.po_unit_price || 0);
        if (q && p) {
          next.po_total = String(q * p);
        }
      }

      // Auto-compute rejected qty in GRN if received and accepted are entered
      if (moduleId === "mod_grn" && (fieldId === "grn_received_qty" || fieldId === "grn_accepted_qty")) {
        const rcvd = Number(next.grn_received_qty || 0);
        const acc = Number(next.grn_accepted_qty || 0);
        if (rcvd >= acc) {
          next.grn_rejected_qty = String(rcvd - acc);
        }
      }

      // Auto-compute Invoice financial calculations
      if (isInvoiceModule && (fieldId === "billed_qty" || fieldId === "unit_rate" || fieldId === "gst_rate")) {
        const q = Number(next.billed_qty || 0);
        const r = Number(next.unit_rate || 0);
        const gstRatePct = parseInt(next.gst_rate || "18") || 18;
        const sub = q * r;
        const gst = sub * (gstRatePct / 100);
        next.subtotal = String(sub);
        next.gst_amount = String(gst);
        next.grand_total = String(sub + gst);
      }

      return next;
    });
  };

  // Submit new entry
  const handleSaveRecord = (e) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !formData[f.id]) {
        alert(`Field "${f.label}" is required.`);
        return;
      }
    }

    const payload = { ...formData };
    if (isInvoiceModule) {
      const poMod = modules.find(m => m.id === "mod_purchase" || m.name?.toLowerCase().includes("purchase"));
      const grnMod = modules.find(m => m.id === "mod_grn" || m.name?.toLowerCase() === "grn");
      const matchedPo = (poMod?.records || []).find(p => p.id === payload.po_ref || p.po_num === payload.po_ref);
      const matchedGrn = (grnMod?.records || []).find(g => g.id === payload.grn_ref || g.grn_num === payload.grn_ref);
      const matchRes = rbacStore.calculateThreeWayMatch(matchedPo, matchedGrn, payload);
      payload.match_status = matchRes.status;
      if (!payload.payment_status) payload.payment_status = "Unpaid";
    }

    const updated = rbacStore.addRecord(module.id, payload, currentUser);
    setModules([...updated]);
    onModulesUpdated?.(updated);
    setFormData({});
    setIsEntryModalOpen(false);

    if (module.id === "mod_grn") {
      setSyncNotification({
        title: "⚡ GRN Inward Recorded & PO Delivery Updated!",
        details: `Material receipt #${formData.grn_num || "New"} saved. Linked Purchase Order status was updated to Received in real time.`
      });
    } else if (isInvoiceModule) {
      setSyncNotification({
        title: "📄 Supplier Invoice Logged & 3-Way Match Verified!",
        details: `Invoice entry recorded with 3-Way Matching status: ${payload.match_status}.`
      });
    } else {
      setSyncNotification({
        title: "Record Saved Successfully",
        details: `New entry logged in ${module.name}.`
      });
    }
  };

  // Mark an invoice record as Paid
  const handleMarkPaid = (recId) => {
    const updated = rbacStore.markInvoicePaid(module.id, recId, currentUser);
    setModules([...updated]);
    onModulesUpdated?.(updated);
    setSyncNotification({
      title: "💳 Payment Recorded Successfully!",
      details: `Invoice #${recId} is marked as Paid.`
    });
  };

  // Approve / Reject
  const handleApprove = (recId) => {
    const updated = rbacStore.updateRecordStatus(module.id, recId, "approved", currentUser.fullName);
    setModules([...updated]);
    onModulesUpdated?.(updated);
    setSyncNotification({
      title: "Entry Approved",
      details: `Record ${recId} in ${module.name} is now approved.`
    });
  };

  const handleReject = (recId) => {
    const updated = rbacStore.updateRecordStatus(module.id, recId, "rejected", currentUser.fullName);
    setModules([...updated]);
    onModulesUpdated?.(updated);
  };

  const handleDelete = (recId) => {
    if (!window.confirm("Are you sure you want to permanently delete this record?")) return;
    const updated = rbacStore.deleteRecord(module.id, recId);
    setModules([...updated]);
    onModulesUpdated?.(updated);
  };

  // Start Edit
  const handleStartEdit = (rec) => {
    const cleaned = {};
    fields.forEach((f) => {
      cleaned[f.id] = rec[f.id] !== undefined ? rec[f.id] : "";
    });
    setEditingRecord(rec);
    setEditFormData(cleaned);
  };

  const handleEditInputChange = (fieldId, value) => {
    setEditFormData((prev) => {
      const next = { ...prev, [fieldId]: value };
      if (moduleId === "mod_purchase" && (fieldId === "po_qty" || fieldId === "po_unit_price")) {
        const q = Number(next.po_qty || 0);
        const p = Number(next.po_unit_price || 0);
        if (q && p) {
          next.po_total = String(q * p);
        }
      }
      return next;
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !editFormData[f.id]) {
        alert(`Field "${f.label}" is required.`);
        return;
      }
    }
    const updated = rbacStore.updateRecord(module.id, editingRecord.id, editFormData, currentUser);
    setModules([...updated]);
    onModulesUpdated?.(updated);
    setEditingRecord(null);
    setSyncNotification({
      title: "Record Updated & Link Preserved",
      details: `Changes saved for record ${editingRecord.id}.`
    });
  };

  // Calculate active outgoing links from current module
  const activeOutgoingLinks = (linksState || [])
    .filter((l) => l.sourceModuleId === moduleId && l.active !== false)
    .map((l) => ({
      link: l,
      targetModule: modules.find((m) => m.id === l.targetModuleId)
    }))
    .filter((item) => item.targetModule);

  // Smart auto-mapping calculation helper
  const calculateAutoMappings = (srcMod, tgtMod) => {
    const newMappings = {};
    const usedSourceIds = new Set();

    (tgtMod?.fields || []).forEach((tf) => {
      // 1. Exact match by label or ID
      const exact = (srcMod?.fields || []).find((sf) =>
        sf.id === tf.id ||
        sf.label.toLowerCase() === tf.label.toLowerCase()
      );
      if (exact) {
        newMappings[tf.id] = exact.id;
        usedSourceIds.add(exact.id);
        return;
      }

      // 2. Similar name (e.g. "product" and "products")
      const similar = (srcMod?.fields || []).find((sf) =>
        sf.label.toLowerCase().includes(tf.label.toLowerCase()) ||
        tf.label.toLowerCase().includes(sf.label.toLowerCase())
      );
      if (similar) {
        newMappings[tf.id] = similar.id;
        usedSourceIds.add(similar.id);
        return;
      }

      // 3. Reference or ID field
      if (
        tf.label.toLowerCase().includes("ref") ||
        tf.label.toLowerCase().includes("order") ||
        tf.label.toLowerCase().includes("id")
      ) {
        newMappings[tf.id] = "__rec_id__";
        return;
      }

      // 4. If source module only has 1 field, map only to first compatible text/general field
      if (srcMod?.fields && srcMod.fields.length === 1 && !usedSourceIds.has(srcMod.fields[0].id)) {
        if (tf.type === "text" || tf.type === "textarea" || (tgtMod?.fields?.length === 1)) {
          newMappings[tf.id] = srcMod.fields[0].id;
          usedSourceIds.add(srcMod.fields[0].id);
          return;
        }
      }

      // Otherwise, leave unmapped so user can choose manually or leave empty
      newMappings[tf.id] = "";
    });

    return newMappings;
  };

  // Auto-generate or load field mappings for the chosen link pair
  const autoMapFields = (srcId, tgtId) => {
    const existing = rbacStore.getLinkBetween(srcId, tgtId);
    if (existing && existing.fieldMappings && Object.keys(existing.fieldMappings).length > 0) {
      setManualMappings({ ...existing.fieldMappings });
      return;
    }

    const srcMod = modules.find((m) => m.id === srcId);
    const tgtMod = modules.find((m) => m.id === tgtId);
    setManualMappings(calculateAutoMappings(srcMod, tgtMod));
  };

  // Force re-running auto-map algorithm (bypassing cached link mappings)
  const handleRunAutoMap = () => {
    const srcId = sourceLinkMod;
    const tgtId = targetLinkMod;
    if (!srcId || !tgtId) return;
    const srcMod = modules.find((m) => m.id === srcId);
    const tgtMod = modules.find((m) => m.id === tgtId);
    setManualMappings(calculateAutoMappings(srcMod, tgtMod));
  };

  // Open Dynamic Transfer Modal for a record to a linked target module
  const handleOpenDynamicTransferModal = (record, targetModule) => {
    // Look up saved custom field mappings between this module and target module
    const link = rbacStore.getLinkBetween(moduleId, targetModule.id);
    const fieldMappings = link?.fieldMappings || {};
    const initialData = {};

    (targetModule.fields || []).forEach((tf) => {
      // 1. If user configured fieldMappings for this target field
      if (tf.id in fieldMappings) {
        const mappedSourceKey = fieldMappings[tf.id];
        if (mappedSourceKey === "__rec_id__") {
          initialData[tf.id] = record.id;
        } else if (mappedSourceKey && record[mappedSourceKey] !== undefined) {
          initialData[tf.id] = record[mappedSourceKey];
        } else {
          // Explicitly configured to "-- Don't Map / Leave Empty --" -> keep it empty!
          initialData[tf.id] = "";
        }
        return;
      }

      // 2. Direct ID match
      if (record[tf.id] !== undefined && record[tf.id] !== "") {
        initialData[tf.id] = record[tf.id];
        return;
      }

      // 3. Fallback: match by label or reference
      const match = (fields || []).find((sf) =>
        sf.id === tf.id ||
        sf.label.toLowerCase() === tf.label.toLowerCase()
      );

      if (match && record[match.id] !== undefined && record[match.id] !== "") {
        initialData[tf.id] = record[match.id];
      } else if (
        tf.label.toLowerCase().includes("ref") ||
        tf.label.toLowerCase().includes("order") ||
        tf.label.toLowerCase().includes("linked") ||
        tf.label.toLowerCase().includes("po")
      ) {
        initialData[tf.id] = record.po_num || record.id;
      } else {
        initialData[tf.id] = tf.defaultValue || "";
      }
    });

    // If target is an invoice module, auto-fill unit_rate from PO and compute 3-way match
    const isTargetInvoice = targetModule.id === "mod_invoice" || targetModule.name?.toLowerCase().includes("invoice");
    if (isTargetInvoice) {
      const poMod = modules.find((m) => m.id === "mod_purchase" || m.name?.toLowerCase().includes("purchase"));
      const poNum = record.grn_po_ref || record.po_ref || record.id;
      const matchedPo = (poMod?.records || []).find((p) => p.id === poNum || p.po_num === poNum);

      const billedQty = Number(initialData.billed_qty || record.grn_accepted_qty || record.accepted_qty || record.grn_received_qty || 0);
      const unitRate = Number(initialData.unit_rate || matchedPo?.po_unit_price || matchedPo?.unit_rate || matchedPo?.number_amount || 0);

      initialData.po_ref = matchedPo?.po_num || matchedPo?.id || poNum;
      initialData.grn_ref = record.grn_num || record.id;
      initialData.inv_num = initialData.inv_num || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      initialData.inv_date = initialData.inv_date || new Date().toISOString().split("T")[0];
      initialData.vendor_name = initialData.vendor_name || record.grn_vendor || matchedPo?.po_vendor || "";
      initialData.product_name = initialData.product_name || record.grn_product || matchedPo?.po_product || "";
      initialData.billed_qty = billedQty ? String(billedQty) : "";
      initialData.unit_rate = unitRate ? String(unitRate) : "";

      if (billedQty && unitRate) {
        const sub = billedQty * unitRate;
        const gstPct = parseInt(initialData.gst_rate || "18") || 18;
        const gst = sub * (gstPct / 100);
        initialData.subtotal = String(sub);
        initialData.gst_amount = String(gst);
        initialData.grand_total = String(sub + gst);
      }

      const matchRes = rbacStore.calculateThreeWayMatch(matchedPo, record, { billed_qty: billedQty, unit_rate: unitRate });
      initialData.match_status = matchRes.status;
      if (!initialData.payment_status) initialData.payment_status = "Unpaid";
    }

    setTransferModal({
      isOpen: true,
      sourceRecord: record,
      targetModule,
      formData: initialData
    });
  };

  // Live input change inside 1-Click Transfer Modal
  const handleTransferInputChange = (fieldId, val) => {
    setTransferModal((prev) => {
      const nextData = { ...prev.formData, [fieldId]: val };
      const isTargetInvoice = prev.targetModule?.id === "mod_invoice" || prev.targetModule?.name?.toLowerCase().includes("invoice");

      if (isTargetInvoice && (fieldId === "billed_qty" || fieldId === "unit_rate" || fieldId === "gst_rate")) {
        const q = Number(nextData.billed_qty || 0);
        const r = Number(nextData.unit_rate || 0);
        const gstPct = parseInt(nextData.gst_rate || "18") || 18;
        const sub = q * r;
        const gst = sub * (gstPct / 100);
        nextData.subtotal = String(sub);
        nextData.gst_amount = String(gst);
        nextData.grand_total = String(sub + gst);

        // Live 3-Way match check
        const poMod = modules.find((m) => m.id === "mod_purchase" || m.name?.toLowerCase().includes("purchase"));
        const poNum = nextData.po_ref || prev.sourceRecord?.grn_po_ref || prev.sourceRecord?.id;
        const matchedPo = (poMod?.records || []).find((p) => p.id === poNum || p.po_num === poNum);
        const matchRes = rbacStore.calculateThreeWayMatch(matchedPo, prev.sourceRecord, nextData);
        nextData.match_status = matchRes.status;
      }

      return { ...prev, formData: nextData };
    });
  };

  // Execute Dynamic 1-Click Multi-Module Transfer
  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    if (!transferModal.sourceRecord || !transferModal.targetModule) return;

    const res = rbacStore.convertRecordToTarget(
      moduleId,
      transferModal.targetModule.id,
      transferModal.sourceRecord.id,
      currentUser,
      transferModal.formData
    );

    if (res.success) {
      setModules([...res.mods]);
      onModulesUpdated?.(res.mods);
      const targetModName = transferModal.targetModule.name;
      const targetModId = transferModal.targetModule.id;
      setTransferModal({ isOpen: false, sourceRecord: null, targetModule: null, formData: {} });
      setSyncNotification({
        title: `⚡ 1-Click Transfer to "${targetModName}" Successful!`,
        details: `Created new record #${res.createdRecord.id} in ${targetModName}. All matching data transferred seamlessly!`,
        targetModuleId: targetModId,
        targetModuleName: targetModName
      });
    } else {
      alert("Transfer failed: " + (res.error || "Unknown error"));
    }
  };

  // Save Dynamic Link Definition with custom manual field mappings
  const handleSaveLinkMapping = () => {
    if (!sourceLinkMod || !targetLinkMod || sourceLinkMod === targetLinkMod) {
      alert("Please select two different modules to link.");
      return;
    }
    const srcMod = modules.find((m) => m.id === sourceLinkMod);
    const tgtMod = modules.find((m) => m.id === targetLinkMod);
    const updated = rbacStore.saveModuleLink({
      sourceModuleId: sourceLinkMod,
      targetModuleId: targetLinkMod,
      name: `${srcMod?.name || "Source"} ➔ ${tgtMod?.name || "Target"}`,
      active: true,
      fieldMappings: manualMappings
    });
    setLinksState([...updated]);
    setLinkSavedToast(true);
    setTimeout(() => setLinkSavedToast(false), 2500);
  };

  const handleDeleteLink = (sourceId, targetId) => {
    const updated = rbacStore.deleteModuleLink(sourceId, targetId);
    setLinksState([...updated]);
  };

  const getSourceModuleObj = () => modules.find((m) => m.id === sourceLinkMod) || module;
  const getTargetModuleObj = () => modules.find((m) => m.id === targetLinkMod) || modules.find((m) => m.id !== moduleId) || module;

  return (
    <div className="dynamic-module-view-container">
      {/* Real-time Notification Banner */}
      {syncNotification && (
        <div className="realtime-sync-toast">
          <div className="sync-toast-left">
            <div className="sync-toast-icon-badge">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="sync-toast-title">
                {syncNotification.title}
              </div>
              <div className="sync-toast-body">{syncNotification.details}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {syncNotification.targetModuleId && onSelectModule && (
              <button
                type="button"
                className="btn-live-invoice-pill"
                onClick={() => {
                  onSelectModule(syncNotification.targetModuleId);
                  setSyncNotification(null);
                }}
                style={{ background: "#0d9488", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "8px", fontWeight: "600", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
              >
                <span>👉 View in {syncNotification.targetModuleName || "Target"}</span>
                <ExternalLink size={13} />
              </button>
            )}
            <button
              type="button"
              className="sync-toast-close"
              onClick={() => setSyncNotification(null)}
              title="Dismiss notification"
            >
              ✕
            </button>
          </div>
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
            {moduleId === "mod_purchase" ? <Receipt size={24} className="text-amber-500" /> : <ClipboardCheck size={24} className="text-teal-500" />}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 className="module-heading">{module.name}</h2>
              {currentUser?.role === "admin" && (
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "3px", borderRadius: "4px", display: "inline-flex", alignItems: "center" }}
                  onClick={() => {
                    const newName = window.prompt("Rename Module:", module.name);
                    if (newName && newName.trim() && newName.trim() !== module.name) {
                      const updated = rbacStore.updateModule(module.id, { name: newName.trim() });
                      setModules([...updated]);
                      onModulesUpdated?.(updated);
                    }
                  }}
                  title="Rename Module"
                >
                  <Edit2 size={15} />
                </button>
              )}
            </div>
            <p className="module-subtext">{module.description || "Enterprise ERP Workspace"}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* 🔗 Dynamic Module Link Modal Trigger */}
          <button
            type="button"
            className="btn-link-modules-glow"
            onClick={() => {
              setSourceLinkMod(moduleId);
              const other = modules.find((m) => m.id !== moduleId);
              const targetId = other?.id || "";
              setTargetLinkMod(targetId);
              if (targetId) {
                autoMapFields(moduleId, targetId);
              }
              setIsLinkModalOpen(true);
            }}
            title="Configure Dynamic Module Linking & Field Rules"
          >
            <Link2 size={16} />
            <span>🔗 Dynamic Module Link</span>
          </button>

          {/* Live PO Document Preview */}
          {moduleId === "mod_purchase" && records.length > 0 && (
            <button
              type="button"
              className="btn-preview-latest-doc"
              onClick={() => setSelectedInvoiceRecord(records[0])}
              title="Preview latest Purchase Order (Print / PDF)"
            >
              <Printer size={16} />
              <span>📄 Live PO Preview</span>
            </button>
          )}

          <button
            type="button"
            className="btn-add-record"
            onClick={() => {
              const initial = {};
              fields.forEach((f) => {
                if (f.type === "select" && f.options?.[0]) initial[f.id] = f.options[0];
                if (f.type === "date") initial[f.id] = new Date().toISOString().split("T")[0];
              });
              setFormData(initial);
              setIsEntryModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Add New Entry</span>
          </button>
        </div>
      </div>

      {/* ⚡ DYNAMIC COMPACT LINK INFO STRIP */}
      {activeOutgoingLinks.length > 0 ? (
        <div className="compact-link-strip">
          <span className="pulse-sync-dot"></span>
          <span style={{ fontWeight: 600, color: "#0284c7", fontSize: "12.5px" }}>
            ⚡ Linked to: {activeOutgoingLinks.map((item) => item.targetModule.name).join(", ")}
          </span>
          <span style={{ color: "#64748b", fontSize: "12px" }}>
            Click ⚡ on any row below to transfer data in 1 click!
          </span>
          <button
            type="button"
            style={{ marginLeft: "auto", fontSize: "11.5px", color: "#0284c7", background: "none", border: "1px solid #bae6fd", borderRadius: "6px", padding: "2px 10px", cursor: "pointer", fontWeight: 600 }}
            onClick={() => {
              setSourceLinkMod(moduleId);
              const other = modules.find((m) => m.id !== moduleId);
              setTargetLinkMod(other?.id || "");
              setIsLinkModalOpen(true);
            }}
          >
            🔗 Manage Links ({activeOutgoingLinks.length})
          </button>
        </div>
      ) : (
        <div className="compact-link-strip" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px 16px", borderRadius: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#0284c7", display: "flex", alignItems: "center" }}><Link2 size={15} /></span>
            <span style={{ color: "#475569", fontSize: "12.5px" }}>
              <strong>{module.name}</strong> is not linked yet. Connect it with another module to enable 1-Click data transfer!
            </span>
          </div>
          <button
            type="button"
            style={{ marginLeft: "auto", fontSize: "12px", color: "#0284c7", background: "#e0f2fe", border: "1px solid #bae6fd", borderRadius: "6px", padding: "4px 12px", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "5px" }}
            onClick={() => {
              setSourceLinkMod(moduleId);
              const other = modules.find((m) => m.id !== moduleId);
              const targetId = other?.id || "";
              setTargetLinkMod(targetId);
              if (targetId) {
                autoMapFields(moduleId, targetId);
              }
              setIsLinkModalOpen(true);
            }}
          >
            <Plus size={13} />
            <span>Link Module Now</span>
          </button>
        </div>
      )}

      {/* Controls Bar: Search & Stats */}
      <div className="module-controls-bar">
        <div className="module-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search entries by ID or fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="clear-search" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        <div className="module-stats-pills">
          <span className="stat-pill total">Total: {records.length}</span>
          <span className="stat-pill approved">
            Approved: {records.filter((r) => r.status === "approved").length}
          </span>
          {records.some((r) => r.status === "pending") && (
            <span className="stat-pill pending">
              Pending: {records.filter((r) => r.status === "pending").length}
            </span>
          )}
        </div>
      </div>

      {/* Clean Key-Column Table */}
      <div className="module-table-wrapper">
        <table className="module-data-table">
          <thead>
            <tr>
              {moduleId === "mod_purchase" ? (
                <>
                  <th>PO #</th>
                  <th>Vendor</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total (₹)</th>
                  <th>Delivery</th>
                  <th>Status</th>
                  <th>Actions</th>
                </>
              ) : moduleId === "mod_grn" ? (
                <>
                  <th>GRN #</th>
                  <th>Linked PO #</th>
                  <th>Vendor</th>
                  <th>Product</th>
                  <th>Received</th>
                  <th>Accepted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </>
              ) : isInvoiceModule ? (
                <>
                  <th>Invoice #</th>
                  <th>Linked PO &amp; GRN</th>
                  <th>Supplier</th>
                  <th>Product</th>
                  <th>Billed Qty &amp; Rate</th>
                  <th>Total (₹)</th>
                  <th>3-Way Match</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </>
              ) : (
                <>
                  <th>ID</th>
                  {fields.slice(0, 5).map((f) => (
                    <th key={f.id}>{f.label}</th>
                  ))}
                  <th>Status</th>
                  <th>Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={isInvoiceModule ? 10 : 8} className="empty-table-cell">
                  No records found. Click <strong>+ Add New Entry</strong>{moduleId === "mod_purchase" ? " or use ⚡ 1-Click to GRN on a PO row." : "."}
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => {
                const isPending = rec.status === "pending";
                const isApproved = rec.status === "approved";
                const isRejected = rec.status === "rejected";

                // Delivery badge
                const dVal = rec.po_delivery_status || "";
                const isFullyRcvd = dVal.toLowerCase().includes("fully");
                const isPartial = dVal.toLowerCase().includes("partial");

                return (
                  <tr key={rec.id}>
                    {moduleId === "mod_purchase" ? (
                      <>
                        {/* PO # — clickable to open PO document */}
                        <td>
                          <span
                            className="rec-id-pill"
                            style={{ cursor: "pointer", color: "#2563eb", fontWeight: 700 }}
                            onClick={() => setSelectedInvoiceRecord(rec)}
                            title="Click to view PO document"
                          >
                            {rec.po_num || rec.id}
                          </span>
                        </td>
                        <td className="field-data-cell">{rec.po_vendor || <span className="empty-dash">—</span>}</td>
                        <td className="field-data-cell" style={{ maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={rec.po_product}>
                          {rec.po_product || <span className="empty-dash">—</span>}
                        </td>
                        <td className="field-data-cell">{rec.po_qty || <span className="empty-dash">—</span>}</td>
                        <td className="field-data-cell" style={{ fontWeight: 600 }}>
                          {rec.po_total ? `₹${Number(rec.po_total).toLocaleString("en-IN")}` : <span className="empty-dash">—</span>}
                        </td>
                        <td>
                          <span style={{
                            padding: "3px 9px",
                            borderRadius: "12px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            background: isFullyRcvd ? "#dcfce7" : isPartial ? "#fef3c7" : "#f1f5f9",
                            color: isFullyRcvd ? "#15803d" : isPartial ? "#b45309" : "#475569",
                            whiteSpace: "nowrap"
                          }}>
                            {dVal || "Pending"}
                          </span>
                        </td>
                      </>
                    ) : moduleId === "mod_grn" ? (
                      <>
                        <td>
                          <span className="rec-id-pill" style={{ fontWeight: 700 }}>
                            {rec.grn_num || rec.id}
                          </span>
                        </td>
                        <td className="field-data-cell" style={{ color: "#2563eb", fontWeight: 600 }}>{rec.grn_po_ref || <span className="empty-dash">—</span>}</td>
                        <td className="field-data-cell">{rec.grn_vendor || <span className="empty-dash">—</span>}</td>
                        <td className="field-data-cell" style={{ maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={rec.grn_product}>
                          {rec.grn_product || <span className="empty-dash">—</span>}
                        </td>
                        <td className="field-data-cell">{rec.grn_received_qty ?? <span className="empty-dash">—</span>}</td>
                        <td className="field-data-cell" style={{ color: "#0d9488", fontWeight: 600 }}>{rec.grn_accepted_qty ?? <span className="empty-dash">—</span>}</td>
                      </>
                    ) : isInvoiceModule ? (
                      <>
                        <td>
                          <span
                            className="rec-id-pill"
                            style={{ cursor: "pointer", color: "#059669", fontWeight: 700 }}
                            onClick={() => setSelectedInvoiceRecord(rec)}
                            title="Click to view 3-Way Match Invoice Voucher"
                          >
                            {rec.inv_num || rec.id}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: 600 }}>PO: {rec.po_ref || "—"}</span>
                            <span style={{ fontSize: "11px", color: "#0d9488", fontWeight: 600 }}>GRN: {rec.grn_ref || "—"}</span>
                          </div>
                        </td>
                        <td className="field-data-cell">{rec.vendor_name || <span className="empty-dash">—</span>}</td>
                        <td className="field-data-cell" style={{ maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={rec.product_name}>
                          {rec.product_name || <span className="empty-dash">—</span>}
                        </td>
                        <td className="field-data-cell">
                          <strong>{rec.billed_qty || "0"}</strong> @ ₹{Number(rec.unit_rate || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="field-data-cell" style={{ fontWeight: 700, color: "#047857" }}>
                          {rec.grand_total ? `₹${Number(rec.grand_total).toLocaleString("en-IN")}` : rec.subtotal ? `₹${Number(rec.subtotal).toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td>
                          {/* 3-Way Match Badge */}
                          {rec.match_status?.includes("Matched") ? (
                            <span style={{ padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, background: "#dcfce7", color: "#15803d", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <CheckCircle2 size={11} /> 3-Way Matched
                            </span>
                          ) : rec.match_status?.includes("Mismatch") ? (
                            <span style={{ padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, background: "#fef3c7", color: "#b45309", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <AlertTriangle size={11} /> {rec.match_status}
                            </span>
                          ) : (
                            <span style={{ padding: "3px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: "#e0f2fe", color: "#0369a1" }}>
                              {rec.match_status || "Pending"}
                            </span>
                          )}
                        </td>
                        <td>
                          {/* Payment Status Badge */}
                          <span style={{
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: rec.payment_status === "Paid" ? "#dcfce7" : "#f1f5f9",
                            color: rec.payment_status === "Paid" ? "#166534" : "#475569"
                          }}>
                            {rec.payment_status === "Paid" ? "✓ Paid" : "Unpaid"}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <span className="rec-id-pill" style={{ fontWeight: 700 }}>
                            {rec.id}
                          </span>
                        </td>
                        {fields.slice(0, 5).map((f) => (
                          <td key={f.id} className="field-data-cell" style={{ maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {rec[f.id] !== undefined && rec[f.id] !== "" ? String(rec[f.id]) : <span className="empty-dash">—</span>}
                          </td>
                        ))}
                      </>
                    )}

                    {/* Status */}
                    <td>
                      {isPending && <span className="status-badge-pending"><Clock size={12} /> Pending</span>}
                      {isApproved && <span className="status-badge-approved"><CheckCircle2 size={12} /> Approved</span>}
                      {isRejected && <span className="status-badge-rejected"><XCircle size={12} /> Rejected</span>}
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: "flex", gap: "5px", alignItems: "center", flexWrap: "nowrap" }}>
                        {/* ⚡ Dynamic Multi-Module 1-Click Transfer Buttons */}
                        {activeOutgoingLinks.map(({ targetModule }) => (
                          <button
                            key={targetModule.id}
                            type="button"
                            className="btn-action-convert-dynamic"
                            onClick={() => handleOpenDynamicTransferModal(rec, targetModule)}
                            title={`1-Click Transfer: Copy this row's data into ${targetModule.name}`}
                          >
                            <Zap size={12} className="text-amber-300" />
                            <span>⚡ To {targetModule.name}</span>
                          </button>
                        ))}

                        {/* Invoice Voucher view button */}
                        {isInvoiceModule && (
                          <button
                            type="button"
                            className="btn-action-edit"
                            style={{ background: "#ecfdf5", color: "#059669" }}
                            onClick={() => setSelectedInvoiceRecord(rec)}
                            title="View 3-Way Match Audit Voucher"
                          >
                            <FileText size={13} />
                          </button>
                        )}

                        {/* Mark as Paid: Admin / Finance only when Invoice is approved */}
                        {isInvoiceModule && isAdmin && isApproved && rec.payment_status !== "Paid" && (
                          <button
                            type="button"
                            style={{ background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "3px" }}
                            onClick={() => handleMarkPaid(rec.id)}
                            title="Mark Invoice as Paid"
                          >
                            <CreditCard size={12} />
                            <span>Pay</span>
                          </button>
                        )}

                        {/* Approve / Reject — only if pending */}
                        {canUserApprove && isPending && (
                          <>
                            <button type="button" className="btn-action-approve" onClick={() => handleApprove(rec.id)} title="Approve">
                              <Check size={13} />
                            </button>
                            <button type="button" className="btn-action-reject" onClick={() => handleReject(rec.id)} title="Reject">
                              <X size={13} />
                            </button>
                          </>
                        )}

                        {/* Edit */}
                        {(isAdmin || (rec.submittedBy?.includes(currentUser?.fullName) && isPending)) && (
                          <button type="button" className="btn-action-edit" onClick={() => handleStartEdit(rec)} title="Edit">
                            <Edit2 size={13} />
                          </button>
                        )}

                        {/* Delete — admin only */}
                        {isAdmin && (
                          <button type="button" className="btn-trash-delete" onClick={() => handleDelete(rec.id)} title="Delete">
                            <Trash2 size={13} />
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

      {/* =================================================================== */}
      {/* 1. DYNAMIC FORM ENTRY MODAL WITH AUTO-LOOKUP                        */}
      {/* =================================================================== */}
      {isEntryModalOpen && (
        <div className="modal-backdrop-clean">
          <div className="dynamic-entry-modal">
            <div className="modal-top-bar">
              <div>
                <h3 className="modal-title">New {module.name} Entry</h3>
                <p className="modal-desc">
                  {moduleId === "mod_grn"
                    ? "Inward receipts link to Purchase Orders. Inward accepted quantities update the PO delivery status."
                    : "Fill in the required information below to record this purchase order entry."}
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

                  {/* AUTO-LOOKUP: If entering GRN and field is grn_po_ref, show PO Dropdown with auto-fill! */}
                  {f.id === "grn_po_ref" ? (
                    <div>
                      <select
                        className="clean-form-control"
                        value={formData[f.id] || ""}
                        onChange={(e) => {
                          const selectedPoVal = e.target.value;
                          handleInputChange("grn_po_ref", selectedPoVal);
                          // Auto-fill connected fields from the selected Purchase Order
                          const pMod = modules.find((m) => m.id === "mod_purchase");
                          const matchedPo = (pMod?.records || []).find((p) => p.po_num === selectedPoVal || p.id === selectedPoVal);
                          if (matchedPo) {
                            setFormData((prev) => ({
                              ...prev,
                              grn_po_ref: selectedPoVal,
                              grn_vendor: matchedPo.po_vendor || prev.grn_vendor || "",
                              grn_product: matchedPo.po_product || prev.grn_product || "",
                              grn_po_qty: matchedPo.po_qty || prev.grn_po_qty || "",
                              grn_received_qty: matchedPo.po_qty || prev.grn_received_qty || "",
                              grn_accepted_qty: matchedPo.po_qty || prev.grn_accepted_qty || "",
                              grn_rejected_qty: "0"
                            }));
                          }
                        }}
                        required={f.required}
                      >
                        <option value="">-- Choose Linked Purchase Order --</option>
                        {(modules.find((m) => m.id === "mod_purchase")?.records || []).map((po) => (
                          <option key={po.id} value={po.po_num || po.id}>
                            {po.po_num || po.id} - {po.po_product} ({po.po_vendor}) - Qty: {po.po_qty}
                          </option>
                        ))}
                      </select>
                      <span style={{ fontSize: "11px", color: "#0d9488", marginTop: "3px", display: "block" }}>
                        ⚡ Selecting a PO automatically pre-fills Vendor, Product, and Quantity fields.
                      </span>
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
                  ) : f.type === "radio" ? (
                    <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "6px" }}>
                      {(f.options || []).map((opt, i) => (
                        <label key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="radio"
                            name={`radio_${f.id}`}
                            value={opt}
                            checked={formData[f.id] === opt || (!formData[f.id] && i === 0)}
                            onChange={() => handleInputChange(f.id, opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : f.type === "checkbox" ? (
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", marginTop: "6px" }}>
                      <input
                        type="checkbox"
                        checked={!!formData[f.id]}
                        onChange={(e) => handleInputChange(f.id, e.target.checked)}
                      />
                      <span>{f.checkboxLabel || f.label}</span>
                    </label>
                  ) : f.type === "email" ? (
                    <input
                      type="email"
                      className="clean-form-control"
                      placeholder={f.placeholder || "name@company.com"}
                      value={formData[f.id] || ""}
                      onChange={(e) => handleInputChange(f.id, e.target.value)}
                      required={f.required}
                    />
                  ) : f.type === "phone" ? (
                    <input
                      type="tel"
                      className="clean-form-control"
                      placeholder={f.placeholder || "+91 98765 43210"}
                      value={formData[f.id] || ""}
                      onChange={(e) => handleInputChange(f.id, e.target.value)}
                      required={f.required}
                    />
                  ) : f.type === "file" ? (
                    <input
                      type="file"
                      className="clean-form-control"
                      onChange={(e) => handleInputChange(f.id, e.target.files?.[0]?.name || "attached_file.pdf")}
                    />
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
                  ⚡ Submit &amp; Update ERP
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

      {/* =================================================================== */}
      {/* 2. DYNAMIC MODULE LINK MODAL (POPUP YOUR TL / YOU ASKED FOR)         */}
      {/* =================================================================== */}
      {isLinkModalOpen && (
        <div className="modal-backdrop-clean">
          <div className="module-link-modal-card">
            <div className="modal-top-bar">
              <div>
                <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Link2 size={20} className="text-sky-600" />
                  <span>Dynamic Module Linking Engine</span>
                </h3>
                <p className="modal-desc">
                  Select two dynamic modules to detect matching fields and configure automatic 1-click record conversion.
                </p>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsLinkModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Selection Grid: Source Module ➔ Target Module */}
            <div className="link-selection-grid">
              <div className="link-select-box">
                <label>Source Module (Origin)</label>
                <select
                  className="clean-form-control"
                  value={sourceLinkMod}
                  onChange={(e) => {
                    const newSrc = e.target.value;
                    setSourceLinkMod(newSrc);
                    if (targetLinkMod && targetLinkMod !== newSrc) {
                      autoMapFields(newSrc, targetLinkMod);
                    }
                  }}
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="link-arrow-badge">➔</div>

              <div className="link-select-box">
                <label>Target Module (Destination)</label>
                <select
                  className="clean-form-control"
                  value={targetLinkMod}
                  onChange={(e) => {
                    const newTgt = e.target.value;
                    setTargetLinkMod(newTgt);
                    if (newTgt && sourceLinkMod) {
                      autoMapFields(sourceLinkMod, newTgt);
                    }
                  }}
                >
                  <option value="">-- Choose Target Module to Link --</option>
                  {modules.filter((m) => m.id !== sourceLinkMod).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Currently Active Links List */}
            {activeOutgoingLinks.length > 0 && (
              <div style={{ marginBottom: "14px", padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                <strong style={{ fontSize: "12px", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Active Links Configured for "{module.name}":
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {activeOutgoingLinks.map(({ link, targetModule }) => (
                    <div key={link.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", padding: "7px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12.5px" }}>
                      <span>
                        <strong>{module.name}</strong> ➔ <strong style={{ color: "#0284c7" }}>{targetModule.name}</strong> &nbsp;
                        <span style={{ fontSize: "11px", color: "#16a34a", background: "#dcfce7", padding: "1px 6px", borderRadius: "4px" }}>Button: ⚡ To {targetModule.name}</span>
                      </span>
                      <button
                        type="button"
                        style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "4px", padding: "3px 8px", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}
                        onClick={() => handleDeleteLink(link.sourceModuleId, link.targetModuleId)}
                        title="Remove link"
                      >
                        ✕ Remove Link
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Field Mapping Rules Table (Auto-Map + Manual Dropdown Selector) */}
            <div style={{ marginTop: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <strong style={{ fontSize: "13px", color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Field Mapping Rules (Manual &amp; Auto):</span>
                  </strong>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                    Map fields from <strong>{getSourceModuleObj()?.name}</strong> into <strong>{getTargetModuleObj()?.name}</strong>.
                  </span>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={handleRunAutoMap}
                    style={{ background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd", padding: "5px 10px", borderRadius: "6px", fontSize: "11.5px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                    title="Auto-detect and map all matching fields"
                  >
                    <Zap size={13} />
                    <span>⚡ Auto-Map All</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualMappings({})}
                    style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #cbd5e1", padding: "5px 10px", borderRadius: "6px", fontSize: "11.5px", fontWeight: "600", cursor: "pointer" }}
                    title="Clear all field mappings"
                  >
                    🔄 Clear All
                  </button>
                </div>
              </div>

              {(!getTargetModuleObj()?.fields || getTargetModuleObj()?.fields?.length === 0) ? (
                <div style={{ padding: "20px", textAlign: "center", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px", color: "#64748b", fontSize: "12px" }}>
                  Please select a Target Module with fields to configure mappings.
                </div>
              ) : (
                <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                  <table className="matching-fields-table" style={{ margin: 0, width: "100%" }}>
                    <thead>
                      <tr>
                        <th style={{ width: "35%" }}>Target Field ({getTargetModuleObj()?.name})</th>
                        <th style={{ width: "10%", textAlign: "center" }}>Copy From</th>
                        <th style={{ width: "40%" }}>Source Field ({getSourceModuleObj()?.name})</th>
                        <th style={{ width: "15%", textAlign: "center" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(getTargetModuleObj()?.fields || []).map((tf) => {
                        const selectedVal = manualMappings[tf.id] !== undefined ? manualMappings[tf.id] : "";
                        const srcFields = getSourceModuleObj()?.fields || [];
                        const matchedSrcField = srcFields.find((sf) => sf.id === selectedVal);
                        const isRecId = selectedVal === "__rec_id__";
                        const isMapped = isRecId || !!matchedSrcField;

                        return (
                          <tr key={tf.id}>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span style={{ fontWeight: "600", color: "#1e293b", fontSize: "12px" }}>{tf.label}</span>
                                <span style={{ fontSize: "10.5px", color: "#64748b" }}>
                                  Type: <code style={{ background: "#f1f5f9", padding: "1px 4px", borderRadius: "3px" }}>{tf.type}</code>
                                  {tf.required && <span style={{ color: "#ef4444", marginLeft: "4px" }}>*Required</span>}
                                </span>
                              </div>
                            </td>
                            <td style={{ textAlign: "center", color: "#0284c7", fontWeight: "700" }}>
                              ⬅
                            </td>
                            <td>
                              <select
                                className="clean-form-control"
                                style={{
                                  fontSize: "12px",
                                  padding: "6px 8px",
                                  borderRadius: "6px",
                                  border: isMapped ? "1px solid #0284c7" : "1px solid #cbd5e1",
                                  background: isMapped ? "#f0f9ff" : "#ffffff",
                                  width: "100%"
                                }}
                                value={selectedVal}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setManualMappings((prev) => ({
                                    ...prev,
                                    [tf.id]: val
                                  }));
                                }}
                              >
                                <option value="">-- Don't Map / Leave Empty --</option>
                                <option value="__rec_id__">📦 Record ID (e.g. {getSourceModuleObj()?.name?.slice(0, 3).toUpperCase()}-101)</option>
                                {srcFields.map((sf) => (
                                  <option key={sf.id} value={sf.id}>
                                    🏷️ {sf.label} ({sf.type})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {isMapped ? (
                                <span className="match-status-badge" style={{ background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" }}>
                                  <Check size={11} /> Mapped
                                </span>
                              ) : (
                                <span style={{ fontSize: "11px", color: "#94a3b8" }}>— Empty</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", color: "#166534", marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>💡</span>
                <span>
                  <strong>Manual Mapping Tip:</strong> Choose any field in the dropdown to map data manually, or click <strong>⚡ Auto-Map All</strong>. When saved, clicking <strong>⚡ To {getTargetModuleObj()?.name}</strong> will transfer data accurately into the mapped fields!
                </span>
              </div>
            </div>

            {linkSavedToast && (
              <div style={{ marginTop: "12px", padding: "10px", background: "#dcfce7", color: "#15803d", borderRadius: "6px", fontSize: "12px", fontWeight: "600", textAlign: "center" }}>
                ✓ Dynamic Link &amp; Field Rules Saved Successfully!
              </div>
            )}

            <div className="modal-buttons-row" style={{ marginTop: "20px" }}>
              <button
                type="button"
                className="btn-save-record"
                onClick={handleSaveLinkMapping}
                style={{ background: "#0284c7" }}
              >
                ✅ Confirm &amp; Save Dynamic Link
              </button>
              <button
                type="button"
                className="btn-cancel-modal"
                onClick={() => setIsLinkModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. DYNAMIC 1-CLICK RECORD TRANSFER MODAL (MULTI-MODULE ENGINE)      */}
      {/* =================================================================== */}
      {transferModal.isOpen && transferModal.sourceRecord && transferModal.targetModule && (
        <div className="modal-backdrop-clean">
          <div className="module-link-modal-card">
            <div className="modal-top-bar">
              <div>
                <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Zap size={20} className="text-amber-500" />
                  <span>1-Click Transfer: {module.name} ➔ {transferModal.targetModule.name}</span>
                </h3>
                <p className="modal-desc">
                  Transferring matching data from record <strong>#{transferModal.sourceRecord.id}</strong> into a new <strong>{transferModal.targetModule.name}</strong> entry without re-typing.
                </p>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setTransferModal({ isOpen: false, sourceRecord: null, targetModule: null, formData: {} })}
              >
                ✕
              </button>
            </div>

            {/* Source Record Summary Card */}
            <div className="convert-source-summary">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ color: "#92400e", fontSize: "13px" }}>
                  📦 Source Record: #{transferModal.sourceRecord.id} ({module.name})
                </strong>
                <span className="match-status-badge">⚡ Target: {transferModal.targetModule.name}</span>
              </div>
              <div className="convert-summary-row">
                {(fields || []).slice(0, 4).map((f) => (
                  <div key={f.id}>
                    <strong>{f.label}:</strong> {String(transferModal.sourceRecord[f.id] || "—")}
                  </div>
                ))}
              </div>
            </div>

            {/* Live 3-Way Match Audit Box if target is Invoice */}
            {(transferModal.targetModule.id === "mod_invoice" || transferModal.targetModule.name?.toLowerCase().includes("invoice")) && (
              <div className="three-way-match-audit-card">
                <div className="three-way-match-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <strong style={{ fontSize: "13px", color: "#065f46" }}>Live 3-Way Match Verification (PO ↔ GRN ↔ Invoice)</strong>
                  </div>
                  <span className={
                    transferModal.formData.match_status?.includes("Matched")
                      ? "three-way-badge-matched"
                      : "three-way-badge-mismatch"
                  }>
                    {transferModal.formData.match_status?.includes("Matched") ? "✓ 3-Way Matched" : (transferModal.formData.match_status || "Verifying Match...")}
                  </span>
                </div>
                <div className="three-way-grid">
                  <div className="three-way-col">
                    <span className="three-way-label">1. PO Reference</span>
                    <span className="three-way-val">{transferModal.formData.po_ref || "—"}</span>
                    <span className="three-way-sub">PO Rate: ₹{transferModal.formData.unit_rate || "0"}</span>
                  </div>
                  <div className="three-way-col">
                    <span className="three-way-label">2. GRN Accepted</span>
                    <span className="three-way-val">{transferModal.formData.grn_ref || transferModal.sourceRecord.id || "—"}</span>
                    <span className="three-way-sub">Accepted Qty: {transferModal.sourceRecord.grn_accepted_qty || transferModal.formData.billed_qty || "0"}</span>
                  </div>
                  <div className="three-way-col">
                    <span className="three-way-label">3. Invoice Billed</span>
                    <span className="three-way-val">{transferModal.formData.billed_qty || "0"} Qty @ ₹{transferModal.formData.unit_rate || "0"}</span>
                    <span className="three-way-sub">Total: ₹{Number(transferModal.formData.grand_total || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleExecuteTransfer}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", maxHeight: "380px", overflowY: "auto", padding: "4px" }}>
                {(transferModal.targetModule.fields || []).map((tf) => (
                  <div key={tf.id} className="rendered-form-field" style={tf.type === "textarea" ? { gridColumn: "span 2" } : {}}>
                    <label className="field-label-text">
                      {tf.label} {tf.required && <span className="text-red-500">*</span>}
                    </label>

                    {tf.type === "select" ? (
                      <select
                        className="clean-form-control"
                        value={transferModal.formData[tf.id] || tf.options?.[0] || ""}
                        onChange={(e) => handleTransferInputChange(tf.id, e.target.value)}
                        required={tf.required}
                      >
                        {(tf.options || []).map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : tf.type === "textarea" ? (
                      <textarea
                        rows={2}
                        className="clean-form-control"
                        value={transferModal.formData[tf.id] || ""}
                        onChange={(e) => handleTransferInputChange(tf.id, e.target.value)}
                        required={tf.required}
                      />
                    ) : (
                      <input
                        type={tf.type === "number" ? "number" : tf.type === "date" ? "date" : "text"}
                        className="clean-form-control"
                        value={transferModal.formData[tf.id] || ""}
                        onChange={(e) => handleTransferInputChange(tf.id, e.target.value)}
                        required={tf.required}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="modal-buttons-row" style={{ marginTop: "18px" }}>
                <button
                  type="submit"
                  className="btn-save-record"
                  style={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" }}
                >
                  ⚡ Transfer &amp; Create in {transferModal.targetModule.name} (1-Click)
                </button>
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => setTransferModal({ isOpen: false, sourceRecord: null, targetModule: null, formData: {} })}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. REAL-TIME EDIT RECORD MODAL                                      */}
      {/* =================================================================== */}
      {editingRecord && (
        <div className="modal-backdrop-clean">
          <div className="dynamic-entry-modal">
            <div className="modal-top-bar">
              <div>
                <h3 className="modal-title">✏️ Edit Record: {editingRecord.id}</h3>
                <p className="modal-subtext">Update fields for {module.name}</p>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setEditingRecord(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form-grid">
              {fields.map((f) => (
                <div key={f.id} className="clean-form-group">
                  <label className="clean-form-label">
                    {f.label} {f.required && <span className="req-star">*</span>}
                  </label>
                  {f.type === "number" ? (
                    <input
                      type="number"
                      step="any"
                      className="clean-form-control"
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
                  ) : f.type === "radio" ? (
                    <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "6px" }}>
                      {(f.options || []).map((opt, i) => (
                        <label key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                          <input
                            type="radio"
                            name={`radio_${f.id}`}
                            value={opt}
                            checked={formData[f.id] === opt || (!formData[f.id] && i === 0)}
                            onChange={() => handleInputChange(f.id, opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : f.type === "checkbox" ? (
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", marginTop: "6px" }}>
                      <input
                        type="checkbox"
                        checked={!!formData[f.id]}
                        onChange={(e) => handleInputChange(f.id, e.target.checked)}
                      />
                      <span>{f.checkboxLabel || f.label}</span>
                    </label>
                  ) : f.type === "email" ? (
                    <input
                      type="email"
                      className="clean-form-control"
                      placeholder={f.placeholder || "name@company.com"}
                      value={formData[f.id] || ""}
                      onChange={(e) => handleInputChange(f.id, e.target.value)}
                      required={f.required}
                    />
                  ) : f.type === "phone" ? (
                    <input
                      type="tel"
                      className="clean-form-control"
                      placeholder={f.placeholder || "+91 98765 43210"}
                      value={formData[f.id] || ""}
                      onChange={(e) => handleInputChange(f.id, e.target.value)}
                      required={f.required}
                    />
                  ) : f.type === "file" ? (
                    <input
                      type="file"
                      className="clean-form-control"
                      onChange={(e) => handleInputChange(f.id, e.target.files?.[0]?.name || "attached_file.pdf")}
                    />
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
                  ⚡ Save Changes
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
      {/* 5. CORPORATE PRINTABLE MODAL (PURCHASE ORDER OR 3-WAY MATCH INVOICE) */}
      {/* =================================================================== */}
      {selectedInvoiceRecord && (
        <div className="modal-backdrop-clean">
          <div className="invoice-print-modal-box">
            <div className="invoice-modal-toolbar no-print">
              <div className="toolbar-left-info">
                <Receipt size={18} className="text-indigo-600" />
                <strong>Document: {selectedInvoiceRecord.inv_num || selectedInvoiceRecord.po_num || selectedInvoiceRecord.id}</strong>
                <span className={`status-badge-${selectedInvoiceRecord.status || "approved"}`} style={{ marginLeft: "10px" }}>
                  {selectedInvoiceRecord.status === "approved" ? "✓ Approved" : "⏳ Pending Approval"}
                </span>
                {selectedInvoiceRecord.inv_num && (
                  <span style={{
                    marginLeft: "8px",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontSize: "11px",
                    fontWeight: 700,
                    background: selectedInvoiceRecord.payment_status === "Paid" ? "#dcfce7" : "#fef3c7",
                    color: selectedInvoiceRecord.payment_status === "Paid" ? "#15803d" : "#b45309"
                  }}>
                    {selectedInvoiceRecord.payment_status === "Paid" ? "✓ Paid" : "⏳ Unpaid"}
                  </span>
                )}
              </div>
              <div className="toolbar-right-btns">
                <button
                  type="button"
                  className="btn-print-doc"
                  onClick={() => window.print()}
                >
                  <Printer size={15} />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  className="btn-close-doc-modal"
                  onClick={() => setSelectedInvoiceRecord(null)}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <div className="print-document-sheet">
              {/* Check if Invoice Voucher or Purchase Order */}
              {(selectedInvoiceRecord.inv_num || isInvoiceModule) ? (
                <>
                  <div className="invoice-print-header">
                    <div>
                      <h1 className="company-logo-text">Enterprise Global Ltd</h1>
                      <p className="company-meta-sub">Finance &amp; Accounts Division &bull; GSTIN: 33AAACG9912K1Z5</p>
                    </div>
                    <div className="invoice-title-block">
                      <h2 className="invoice-main-title" style={{ color: "#047857" }}>TAX INVOICE VOUCHER</h2>
                      <div className="invoice-meta-tag">INVOICE #: {selectedInvoiceRecord.inv_num || selectedInvoiceRecord.id}</div>
                      <div className="invoice-meta-date">Date: {selectedInvoiceRecord.inv_date || new Date().toISOString().split("T")[0]}</div>
                    </div>
                  </div>

                  {/* 3-Way Match Verification Banner */}
                  <div className="voucher-3way-match-banner" style={{
                    margin: "16px 0",
                    padding: "12px 16px",
                    background: selectedInvoiceRecord.match_status?.includes("Matched") ? "#f0fdf4" : "#fffbeb",
                    border: `1.5px solid ${selectedInvoiceRecord.match_status?.includes("Matched") ? "#86efac" : "#fde68a"}`,
                    borderRadius: "8px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <strong style={{ color: selectedInvoiceRecord.match_status?.includes("Matched") ? "#166534" : "#92400e", fontSize: "13px" }}>
                        🔍 3-Way Match Audit Verification (PO ↔ GRN ↔ Invoice)
                      </strong>
                      <span style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: selectedInvoiceRecord.match_status?.includes("Matched") ? "#dcfce7" : "#fef3c7",
                        color: selectedInvoiceRecord.match_status?.includes("Matched") ? "#15803d" : "#b45309"
                      }}>
                        {selectedInvoiceRecord.match_status || "3-Way Matched ✓"}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", fontSize: "12px", color: "#334155" }}>
                      <div><strong>1. PO Reference:</strong> {selectedInvoiceRecord.po_ref || "PO-2026-8819"}</div>
                      <div><strong>2. GRN Inward:</strong> {selectedInvoiceRecord.grn_ref || "GRN-2026-001"}</div>
                      <div><strong>3. Accepted vs Billed:</strong> {selectedInvoiceRecord.billed_qty || "10"} / {selectedInvoiceRecord.billed_qty || "10"} Qty</div>
                    </div>
                  </div>

                  <div className="invoice-parties-grid">
                    <div className="party-box vendor">
                      <div className="party-box-title">Supplier / Vendor:</div>
                      <strong className="party-name">{selectedInvoiceRecord.vendor_name || selectedInvoiceRecord.po_vendor || "ABC Technologies Ltd"}</strong>
                      <div className="party-address">100 Industrial Parkway, Chennai, TN 600001</div>
                      <div className="party-contact">GSTIN: 33AAAAA0000A1Z5 | contact@abctech.com</div>
                    </div>
                    <div className="party-box ship-to">
                      <div className="party-box-title">Billed To (Company):</div>
                      <strong className="party-name">Enterprise Global Ltd</strong>
                      <div className="party-address">Procurement &amp; Finance Accounts, Chennai, TN 600058</div>
                      <div className="party-contact">Payment Terms: Net 30 Days</div>
                    </div>
                  </div>

                  <table className="invoice-line-items-table">
                    <thead>
                      <tr>
                        <th>Item Description</th>
                        <th style={{ textAlign: "right" }}>Billed Qty</th>
                        <th style={{ textAlign: "right" }}>Unit Rate</th>
                        <th style={{ textAlign: "right" }}>Subtotal (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>{selectedInvoiceRecord.product_name || selectedInvoiceRecord.po_product || "Procured Products"}</strong>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>PO Ref: {selectedInvoiceRecord.po_ref || "—"} | GRN: {selectedInvoiceRecord.grn_ref || "—"}</div>
                        </td>
                        <td style={{ textAlign: "right" }}>{selectedInvoiceRecord.billed_qty || "1"} Units</td>
                        <td style={{ textAlign: "right" }}>₹{Number(selectedInvoiceRecord.unit_rate || 0).toLocaleString("en-IN")}</td>
                        <td style={{ textAlign: "right" }}>₹{Number(selectedInvoiceRecord.subtotal || (Number(selectedInvoiceRecord.billed_qty || 1) * Number(selectedInvoiceRecord.unit_rate || 0))).toLocaleString("en-IN")}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" style={{ textAlign: "right", fontWeight: 600 }}>Subtotal:</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>₹{Number(selectedInvoiceRecord.subtotal || 0).toLocaleString("en-IN")}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" style={{ textAlign: "right", color: "#64748b" }}>GST ({selectedInvoiceRecord.gst_rate || "18"}%):</td>
                        <td style={{ textAlign: "right", color: "#64748b" }}>₹{Number(selectedInvoiceRecord.gst_amount || 0).toLocaleString("en-IN")}</td>
                      </tr>
                      <tr style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", borderTop: "2px solid #cbd5e1" }}>
                        <td colSpan="3" style={{ textAlign: "right" }}>Grand Total:</td>
                        <td style={{ textAlign: "right", color: "#047857" }}>₹{Number(selectedInvoiceRecord.grand_total || selectedInvoiceRecord.subtotal || 0).toLocaleString("en-IN")}</td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="invoice-footer-notes" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "24px" }}>
                    <div>
                      <p><strong>Payment Status:</strong> {selectedInvoiceRecord.payment_status || "Unpaid"}</p>
                      <p><strong>Recorded By:</strong> {selectedInvoiceRecord.submittedBy || "Priya (Staff)"}</p>
                      <p><strong>Approved &amp; Verified:</strong> {selectedInvoiceRecord.approvedBy || "Senthil (Manager)"}</p>
                    </div>
                    <div style={{ textAlign: "center", borderTop: "1px dashed #94a3b8", paddingTop: "8px", width: "180px" }}>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Authorized Finance Signatory</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="invoice-print-header">
                    <div>
                      <h1 className="company-logo-text">Enterprise Global Ltd</h1>
                      <p className="company-meta-sub">Official Procurement Division &bull; GSTIN: 33AAACG9912K1Z5</p>
                    </div>
                    <div className="invoice-title-block">
                      <h2 className="invoice-main-title">PURCHASE ORDER</h2>
                      <div className="invoice-meta-tag">PO #: {selectedInvoiceRecord.po_num || selectedInvoiceRecord.id}</div>
                      <div className="invoice-meta-date">Date: {selectedInvoiceRecord.po_date || new Date().toISOString().split("T")[0]}</div>
                    </div>
                  </div>

                  <div className="invoice-parties-grid">
                    <div className="party-box vendor">
                      <div className="party-box-title">Vendor / Supplier:</div>
                      <strong className="party-name">{selectedInvoiceRecord.po_vendor || "Global Supplier Corp"}</strong>
                      <div className="party-address">42 Technology Park Boulevard, Bengaluru, KA 560100</div>
                      <div className="party-contact">Email: supply@vendor.com | Phone: +91 80 4111 2200</div>
                    </div>
                    <div className="party-box ship-to">
                      <div className="party-box-title">Delivery Warehouse Destination:</div>
                      <strong className="party-name">Central Inward Warehouse #2</strong>
                      <div className="party-address">Ambattur Industrial Estate, Chennai, TN 600058</div>
                      <div className="party-contact">Storekeeper Contact: +91 44 2828 9000</div>
                    </div>
                  </div>

                  <table className="invoice-line-items-table">
                    <thead>
                      <tr>
                        <th>Item Description</th>
                        <th style={{ textAlign: "right" }}>Ordered Qty</th>
                        <th style={{ textAlign: "right" }}>Unit Price</th>
                        <th style={{ textAlign: "right" }}>Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>{selectedInvoiceRecord.po_product || "Procured Item"}</strong>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>SKU Code: {selectedInvoiceRecord.po_num || "PRD-101"}</div>
                        </td>
                        <td style={{ textAlign: "right" }}>{selectedInvoiceRecord.po_qty || "1"} Units</td>
                        <td style={{ textAlign: "right" }}>₹{selectedInvoiceRecord.po_unit_price || "0.00"}</td>
                        <td style={{ textAlign: "right" }}>₹{selectedInvoiceRecord.po_total || "0.00"}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="invoice-footer-notes">
                    <p><strong>Terms:</strong> {selectedInvoiceRecord.po_payment_terms || "Net 30 Days"}</p>
                    <p><strong>Delivery Status:</strong> {selectedInvoiceRecord.po_delivery_status || "Pending Delivery"}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
