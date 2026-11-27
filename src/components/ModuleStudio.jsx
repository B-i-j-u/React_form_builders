import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  Layers, 
  CheckCircle2, 
  ArrowLeft, 
  Eye, 
  Settings, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  Search, 
  Sliders, 
  Type, 
  Hash, 
  ChevronDown as ChevronDownIcon, 
  Radio, 
  CheckSquare, 
  AlignLeft, 
  Calendar, 
  Mail, 
  Phone, 
  Upload, 
  Table, 
  Building2, 
  Receipt, 
  FileText,
  FileSpreadsheet,
  Calculator,
  X
} from "lucide-react";
import { AVAILABLE_FIELDS, INVOICE_PO_TEMPLATE_PRESET, SAMPLE_SALES_MODULE_PRESET } from "../constants/fieldTypes";
import { rbacStore } from "../services/rbacStore";

export default function ModuleStudio({ onModuleCreated, onSelectModuleView, onToggleFullScreen }) {
  const [modules, setModules] = useState(() => rbacStore.getModules());
  
  // Navigation: "list" (Modules overview) vs "builder" (3-column form designer)
  const [viewMode, setViewMode] = useState("list");
  
  // Sync full-screen state with parent layout (hides sidebar & app header)
  React.useEffect(() => {
    onToggleFullScreen?.(viewMode === "builder");
    return () => {
      onToggleFullScreen?.(false);
    };
  }, [viewMode, onToggleFullScreen]);
  
  // Current editing module state
  const [editingModuleId, setEditingModuleId] = useState(null); // null for brand new module
  const [moduleName, setModuleName] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [moduleIcon, setModuleIcon] = useState("Layers");
  const [fields, setFields] = useState([]);
  
  // Active selected field in Center Canvas (opened in Section 3 on the right)
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  
  // Toolbox state
  const [toolboxCategory, setToolboxCategory] = useState("all"); // "all" | "general" | "invoice"
  const [toolboxSearch, setToolboxSearch] = useState("");
  const [isOverCanvas, setIsOverCanvas] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Start creating a brand new module
  const handleStartCreateNew = () => {
    setEditingModuleId(null);
    setModuleName("");
    setModuleDesc("");
    setModuleIcon("Layers");
    setFields([]);
    setSelectedFieldId(null);
    setViewMode("builder");
  };

  // Open existing module in 3-column builder
  const handleEditModule = (mod) => {
    setEditingModuleId(mod.id);
    setModuleName(mod.name || "");
    setModuleDesc(mod.description || "");
    setModuleIcon(mod.icon || "Layers");
    const modFields = JSON.parse(JSON.stringify(mod.fields || []));
    setFields(modFields);
    setSelectedFieldId(modFields[0]?.id || null);
    setViewMode("builder");
  };

  // Delete a module from list
  const handleDeleteModule = (modId, e) => {
    e?.stopPropagation();
    if (window.confirm("Are you sure you want to delete this module and its records?")) {
      const updated = rbacStore.deleteModule(modId);
      setModules(updated);
      onModuleCreated?.();
      setSuccessMessage("Module deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 2500);
    }
  };

  // 1-Click Load Sample Module Preset (Sales & Customer Orders)
  const handleLoadSampleModule = () => {
    setModuleName("Sales & Customer Orders");
    setModuleDesc("Track client orders, product quantities, pricing and delivery fulfillment.");
    setModuleIcon("Receipt");
    const templateFields = JSON.parse(JSON.stringify(SAMPLE_SALES_MODULE_PRESET));
    setFields(templateFields);
    setSelectedFieldId(templateFields[0]?.id || null);
    setSuccessMessage("✨ Sample Sales Module loaded onto canvas!");
    setTimeout(() => setSuccessMessage(""), 2500);
  };

  // Drag start from Toolbox (Section 1)
  const handleDragStart = (e, fieldType) => {
    e.dataTransfer.setData("application/field-type", fieldType);
    e.dataTransfer.effectAllowed = "copy";
  };

  // Drop on Center Canvas (Section 2)
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!isOverCanvas) setIsOverCanvas(true);
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsOverCanvas(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOverCanvas(false);
    const fieldType = e.dataTransfer.getData("application/field-type");
    if (fieldType) {
      handleAddField(fieldType);
    }
  };

  // Add field helper (Clicking "+" or dropping on canvas)
  const handleAddField = (fieldType) => {
    const fieldDef = AVAILABLE_FIELDS.find((f) => f.type === fieldType);
    if (!fieldDef) return;

    const newFieldId = "fld_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
    const newField = {
      id: newFieldId,
      type: fieldType,
      ...JSON.parse(JSON.stringify(fieldDef.defaultConfig))
    };

    setFields((prev) => [...prev, newField]);
    // Immediately select this new field in Section 3 (Right)
    setSelectedFieldId(newFieldId);
  };

  // Update attributes of any field
  const updateFieldAttribute = (fieldId, key, value) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, [key]: value } : f))
    );
  };

  // Reorder fields in Canvas
  const handleMoveField = (index, direction, e) => {
    e?.stopPropagation();
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const reordered = [...fields];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    setFields(reordered);
  };

  // Duplicate field
  const handleDuplicateField = (fieldId, e) => {
    e?.stopPropagation();
    const idx = fields.findIndex((f) => f.id === fieldId);
    if (idx === -1) return;
    const orig = fields[idx];
    const duplicate = {
      ...JSON.parse(JSON.stringify(orig)),
      id: "fld_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      label: (orig.label || "Field") + " (Copy)"
    };
    const nextFields = [...fields.slice(0, idx + 1), duplicate, ...fields.slice(idx + 1)];
    setFields(nextFields);
    setSelectedFieldId(duplicate.id);
  };

  // Delete field
  const handleDeleteField = (fieldId, e) => {
    e?.stopPropagation();
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  // Save & Publish Module
  const handleSaveAndPublish = (e) => {
    e.preventDefault();
    if (!moduleName.trim()) {
      alert("Please enter a Module Name (e.g. Purchase Orders, Goods Receipt Notes, Vendor Registration).");
      return;
    }
    if (fields.length === 0) {
      alert("Please add at least 1 field to your module form.");
      return;
    }

    if (!editingModuleId) {
      // Create new module
      const created = rbacStore.createModule({
        name: moduleName.trim(),
        description: moduleDesc.trim(),
        icon: moduleIcon || "Layers",
        fields
      });
      const updated = rbacStore.getModules();
      setModules(updated);
      setEditingModuleId(created.id);
      setSuccessMessage(`🎉 Module "${created.name}" created and published successfully!`);
      onModuleCreated?.(created);
    } else {
      // Update existing module
      const updated = rbacStore.updateModule(editingModuleId, {
        name: moduleName.trim(),
        description: moduleDesc.trim(),
        icon: moduleIcon || "Layers",
        fields
      });
      setModules(updated);
      setSuccessMessage(`✓ Module "${moduleName.trim()}" updated successfully!`);
      const updatedMod = updated.find((m) => m.id === editingModuleId);
      onModuleCreated?.(updatedMod);
    }

    setTimeout(() => {
      setSuccessMessage("");
      setViewMode("list");
    }, 1800);
  };

  // Currently selected field object for Section 3
  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  // Filter toolbox items
  const visibleTools = AVAILABLE_FIELDS.filter((tool) => {
    const matchCategory = toolboxCategory === "all" || tool.category === toolboxCategory;
    const matchSearch = !toolboxSearch || 
      tool.label.toLowerCase().includes(toolboxSearch.toLowerCase()) ||
      tool.description.toLowerCase().includes(toolboxSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  // =========================================================================
  // VIEW 1: MODULES LISTING / LANDING PAGE
  // =========================================================================
  if (viewMode === "list") {
    return (
      <div className="module-studio-container">
        {/* Top Header Bar */}
        <div className="studio-top-bar">
          <div className="studio-title-block">
            <div className="studio-icon-circle">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="studio-title">Enterprise Dynamic Modules</h2>
              <p className="studio-desc">
                Create, customize and interconnect dynamic ERP modules with zero code.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              type="button"
              className="btn-create-mod-primary"
              onClick={handleStartCreateNew}
            >
              <Plus size={18} />
              <span>+ Create New Module</span>
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="studio-success-banner">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modules Grid / Cards */}
        {modules.length === 0 ? (
          <div className="modules-empty-state-card">
            <div className="empty-state-icon-box">
              <Layers size={48} className="text-indigo-400" />
            </div>
            <h3 className="empty-state-title">No Dynamic Modules Yet</h3>
            <p className="empty-state-sub">
              You haven't created any modules yet. Click below to launch the 3-column Form Designer and build your first custom module from scratch.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px" }}>
              <button
                type="button"
                className="btn-create-mod-primary"
                onClick={handleStartCreateNew}
              >
                <Plus size={18} />
                <span>+ Create Your First Module</span>
              </button>
              <button
                type="button"
                className="btn-preset-invoice"
                onClick={() => {
                  handleLoadSampleModule();
                  setViewMode("builder");
                }}
                title="Click to load a sample Sales & Orders module with basic standard fields"
              >
                <Sparkles size={16} />
                <span>Load Sample Module</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="modules-management-grid">
            {modules.map((mod) => (
              <div key={mod.id} className="module-mgmt-card">
                <div className="module-mgmt-header">
                  <div className="module-mgmt-icon">
                    <Layers size={22} className="text-indigo-600" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 className="module-mgmt-name">{mod.name}</h3>
                    <span className="module-mgmt-date">Created: {mod.createdAt || "Recently"}</span>
                  </div>
                </div>

                <p className="module-mgmt-desc">{mod.description || "No description provided."}</p>

                <div className="module-mgmt-stats">
                  <span className="mgmt-stat-chip fields">
                    {mod.fields?.length || 0} Form Fields
                  </span>
                  <span className="mgmt-stat-chip records">
                    {(mod.records || []).length} Records Logged
                  </span>
                </div>

                {/* Preview tags of first 3 fields */}
                {mod.fields && mod.fields.length > 0 && (
                  <div className="module-mgmt-fields-preview">
                    {mod.fields.slice(0, 4).map((f) => (
                      <span key={f.id} className="field-tag-preview">
                        {f.label}
                      </span>
                    ))}
                    {mod.fields.length > 4 && (
                      <span className="field-tag-preview more">+{mod.fields.length - 4} more</span>
                    )}
                  </div>
                )}

                <div className="module-mgmt-actions">
                  <button
                    type="button"
                    className="btn-mgmt-edit"
                    onClick={() => handleEditModule(mod)}
                  >
                    <span>✏️ Edit Form</span>
                  </button>
                  <button
                    type="button"
                    className="btn-mgmt-view"
                    onClick={() => onSelectModuleView?.(mod.id)}
                  >
                    <Eye size={14} />
                    <span>Open Table</span>
                  </button>
                  <button
                    type="button"
                    className="btn-mgmt-delete"
                    onClick={(e) => handleDeleteModule(mod.id, e)}
                    title="Delete Module"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: DEDICATED 3-SECTION FORM BUILDER / STUDIO
  // 1st: Input Fields Toolbox | 2nd: Form Add Canvas | 3rd: Field Settings
  // =========================================================================
  return (
    <div className="module-builder-full-wrapper">
      {/* Builder Top Bar */}
      <div className="builder-header-bar">
        <div className="builder-header-left">
          <button
            type="button"
            className="btn-back-modules-list"
            onClick={() => setViewMode("list")}
          >
            <ArrowLeft size={16} />
            <span>Modules</span>
          </button>
          <div className="builder-header-title-box">
            <h2 className="builder-header-title">
              {editingModuleId ? `Editing: ${moduleName || "Module"}` : "Create New Dynamic Module"}
            </h2>
            <span className="builder-fields-badge">
              {fields.length} {fields.length === 1 ? "field" : "fields"} on canvas
            </span>
          </div>
        </div>

        <div className="builder-header-right">
          <button
            type="button"
            className="btn-preset-invoice"
            onClick={handleLoadSampleModule}
            title="Click to load a sample Sales & Orders module with basic standard fields"
          >
            <Sparkles size={15} />
            <span>Load Sample Module</span>
          </button>

          <button
            type="button"
            className="btn-save-publish-glowing"
            onClick={handleSaveAndPublish}
          >
            <Save size={16} />
            <span>Save &amp; Publish Module</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="studio-success-banner" style={{ margin: "12px 24px" }}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 3-COLUMN STUDIO LAYOUT */}
      <div className="studio-3col-layout">
        {/* =================================================================== */}
        {/* SECTION 1 (LEFT): INPUT FIELDS TOOLBOX                              */}
        {/* =================================================================== */}
        <aside className="studio-col-toolbox">
          <div className="col-header-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="col-title">INPUT FIELDS</h3>
              <span className="col-badge">{visibleTools.length}</span>
            </div>
            <p className="col-subtitle">Drag to canvas or click <strong>+</strong></p>
          </div>

          {/* Search Tools */}
          <div className="toolbox-search-input-box">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Filter fields..."
              value={toolboxSearch}
              onChange={(e) => setToolboxSearch(e.target.value)}
            />
            {toolboxSearch && (
              <button type="button" onClick={() => setToolboxSearch("")}>✕</button>
            )}
          </div>

          {/* Category Filter */}
          <div className="toolbox-category-pills">
            <button
              type="button"
              className={`pill-btn ${toolboxCategory === "all" ? "active" : ""}`}
              onClick={() => setToolboxCategory("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`pill-btn ${toolboxCategory === "general" ? "active" : ""}`}
              onClick={() => setToolboxCategory("general")}
            >
              Inputs
            </button>
            <button
              type="button"
              className={`pill-btn ${toolboxCategory === "invoice" ? "active" : ""}`}
              onClick={() => setToolboxCategory("invoice")}
            >
              PO / Invoice
            </button>
          </div>

          {/* Fields List */}
          <div className="toolbox-scroll-list">
            {visibleTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tool.type)}
                  className="toolbox-tool-card"
                  onClick={() => handleAddField(tool.type)}
                  title="Click + or drag onto center canvas"
                >
                  <div className="tool-card-icon-circle">
                    <Icon size={17} />
                  </div>
                  <div className="tool-card-info">
                    <strong className="tool-card-label">{tool.label}</strong>
                    <span className="tool-card-desc">{tool.description}</span>
                  </div>
                  <button
                    type="button"
                    className="tool-card-add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddField(tool.type);
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        {/* =================================================================== */}
        {/* SECTION 2 (CENTER): FORM ADD CANVAS (LIVE FORM PREVIEW)             */}
        {/* =================================================================== */}
        <section className="studio-col-canvas">
          {/* Module Meta Card at top of Form */}
          <div className="canvas-module-meta-card">
            <div className="meta-input-group">
              <label className="meta-label">
                MODULE NAME <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="meta-input title-input"
                placeholder="e.g. Purchase Orders, Vendor Inward, Goods Receipt Notes..."
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
              />
            </div>
            <div className="meta-input-group" style={{ marginTop: "10px" }}>
              <label className="meta-label">MODULE DESCRIPTION</label>
              <input
                type="text"
                className="meta-input desc-input"
                placeholder="Brief description of this workflow and data collected..."
                value={moduleDesc}
                onChange={(e) => setModuleDesc(e.target.value)}
              />
            </div>
          </div>

          {/* Canvas Drop Target Area */}
          <div
            className={`canvas-fields-dropzone ${isOverCanvas ? "drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="canvas-header-strip">
              <strong style={{ fontSize: "13px", color: "#334155" }}>
                Form Fields &amp; Layout ({fields.length})
              </strong>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Click any field to customize in Settings panel 👉
              </span>
            </div>

            {fields.length === 0 ? (
              <div className="canvas-empty-dropzone">
                <div className="dropzone-icon-box">
                  <Plus size={32} className="text-indigo-400" />
                </div>
                <h4>Your Form Canvas is Empty</h4>
                <p>
                  Drag fields from the <strong>left toolbox</strong> or click <strong>+</strong> to add inputs here.
                </p>
                <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="btn-quick-add-pill"
                    onClick={() => handleAddField("text")}
                  >
                    + Add Text Field
                  </button>
                  <button
                    type="button"
                    className="btn-quick-add-pill"
                    onClick={() => handleAddField("number")}
                  >
                    + Add Number
                  </button>
                  <button
                    type="button"
                    className="btn-quick-add-pill"
                    onClick={() => handleAddField("select")}
                  >
                    + Add Select
                  </button>
                </div>
              </div>
            ) : (
              <div className="canvas-fields-list">
                {fields.map((field, idx) => {
                  const isSelected = selectedFieldId === field.id;

                  return (
                    <div
                      key={field.id}
                      className={`canvas-field-card ${isSelected ? "selected-field" : ""}`}
                      onClick={() => setSelectedFieldId(field.id)}
                    >
                      {/* Top Action Header */}
                      <div className="field-card-top-bar">
                        <div className="field-card-left-info">
                          <GripVertical size={16} className="text-gray-400 grip-icon" />
                          <span className="field-index-badge">#{idx + 1}</span>
                          <span className="field-type-pill">{field.type.toUpperCase()}</span>
                          <span className="field-name-title">{field.label || "Untitled Field"}</span>
                          {field.required && <span className="req-star-badge">* Required</span>}
                        </div>

                        {/* Card Reorder & Actions */}
                        <div className="field-card-actions">
                          <button
                            type="button"
                            className="btn-card-action"
                            title="Move Up"
                            disabled={idx === 0}
                            onClick={(e) => handleMoveField(idx, -1, e)}
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-card-action"
                            title="Move Down"
                            disabled={idx === fields.length - 1}
                            onClick={(e) => handleMoveField(idx, 1, e)}
                          >
                            <ChevronDown size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-card-action"
                            title="Duplicate Field"
                            onClick={(e) => handleDuplicateField(field.id, e)}
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn-card-action danger"
                            title="Delete Field"
                            onClick={(e) => handleDeleteField(field.id, e)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Interactive Visual Form Control Mock */}
                      <div className="field-card-preview-body">
                        <label className="mock-input-label">
                          {field.label || "Field Label"}{" "}
                          {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === "text" && (
                          <input
                            type="text"
                            className="mock-input-control"
                            placeholder={field.placeholder || "Enter text..."}
                            disabled
                          />
                        )}

                        {field.type === "number" && (
                          <input
                            type="number"
                            className="mock-input-control"
                            placeholder={field.placeholder || "0.00"}
                            disabled
                          />
                        )}

                        {field.type === "select" && (
                          <select className="mock-input-control" disabled>
                            {(field.options || ["Option 1", "Option 2"]).map((opt, i) => (
                              <option key={i}>{opt}</option>
                            ))}
                          </select>
                        )}

                        {field.type === "radio" && (
                          <div className="mock-radio-group">
                            {(field.options || ["Option A", "Option B"]).map((opt, i) => (
                              <label key={i} className="mock-radio-label">
                                <input type="radio" checked={i === 0} readOnly disabled />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {field.type === "checkbox" && (
                          <label className="mock-checkbox-label">
                            <input type="checkbox" checked={!!field.checked} readOnly disabled />
                            <span>{field.checkboxLabel || field.label || "Check this box"}</span>
                          </label>
                        )}

                        {field.type === "textarea" && (
                          <textarea
                            rows={field.rows || 3}
                            className="mock-input-control"
                            placeholder={field.placeholder || "Enter detailed notes..."}
                            disabled
                          />
                        )}

                        {field.type === "date" && (
                          <input type="date" className="mock-input-control" disabled />
                        )}

                        {field.type === "email" && (
                          <input
                            type="email"
                            className="mock-input-control"
                            placeholder={field.placeholder || "name@company.com"}
                            disabled
                          />
                        )}

                        {field.type === "phone" && (
                          <input
                            type="tel"
                            className="mock-input-control"
                            placeholder={field.placeholder || "+91 98765 43210"}
                            disabled
                          />
                        )}

                        {field.type === "file" && (
                          <div className="mock-file-upload-box">
                            <Upload size={18} className="text-gray-400" />
                            <span>{field.placeholder || "Attach document or image..."}</span>
                          </div>
                        )}

                        {field.type === "table" && (
                          <div className="mock-table-preview">
                            <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                              <thead>
                                <tr style={{ background: "#f1f5f9" }}>
                                  {(field.columns || [{ label: "Col 1" }, { label: "Col 2" }, { label: "Remarks" }]).map((col, cIdx) => (
                                    <th key={cIdx} style={{ padding: "6px 8px", border: "1px solid #cbd5e1" }}>
                                      {col.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1" }}>Item sample</td>
                                  <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1" }}>10 Units</td>
                                  <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1" }}>Verified</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        {field.type.startsWith("po_") && (
                          <div className="mock-po-block-preview">
                            <strong>📄 Corporate PO Component: {field.label}</strong>
                            <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>
                              Corporate formatted document block configured for ERP invoicing.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION 3 (RIGHT): FIELD SETTINGS & PROPERTIES INSPECTOR            */}
        {/* =================================================================== */}
        <aside className="studio-col-settings">
          {selectedField ? (
            <div className="settings-panel-content">
              {/* Header */}
              <div className="settings-panel-header">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sliders size={16} className="text-indigo-600" />
                    <h3 className="settings-title">Field Settings</h3>
                  </div>
                  <span className="settings-type-chip">{selectedField.type.toUpperCase()}</span>
                </div>
                <button
                  type="button"
                  className="btn-close-settings"
                  onClick={() => setSelectedFieldId(null)}
                  title="Deselect field"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Settings Form */}
              <div className="settings-form-scroll">
                {/* 1. Label Name */}
                <div className="setting-control-group">
                  <label className="setting-label">
                    Field Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="clean-setting-input"
                    value={selectedField.label || ""}
                    onChange={(e) => updateFieldAttribute(selectedField.id, "label", e.target.value)}
                    placeholder="e.g. Vendor Name, Quantity, Delivery Date"
                  />
                  <span className="setting-helper">Label displayed above the input.</span>
                </div>

                {/* 2. Field Key / ID */}
                <div className="setting-control-group">
                  <label className="setting-label">Field ID / Key</label>
                  <input
                    type="text"
                    className="clean-setting-input disabled"
                    value={selectedField.id}
                    disabled
                  />
                  <span className="setting-helper">Unique internal system key.</span>
                </div>

                {/* 3. Placeholder (if applicable) */}
                {selectedField.placeholder !== undefined && (
                  <div className="setting-control-group">
                    <label className="setting-label">Placeholder Text</label>
                    <input
                      type="text"
                      className="clean-setting-input"
                      value={selectedField.placeholder || ""}
                      onChange={(e) => updateFieldAttribute(selectedField.id, "placeholder", e.target.value)}
                      placeholder="Hint shown inside empty field..."
                    />
                  </div>
                )}

                {/* 4. Required Option Toggle */}
                <div className="setting-control-group">
                  <label className="setting-toggle-row">
                    <input
                      type="checkbox"
                      checked={!!selectedField.required}
                      onChange={(e) => updateFieldAttribute(selectedField.id, "required", e.target.checked)}
                    />
                    <strong style={{ fontSize: "13px", color: "#1e293b" }}>Required / Mandatory Field</strong>
                  </label>
                  <span className="setting-helper" style={{ marginLeft: "24px", display: "block" }}>
                    Users must fill this field before submitting.
                  </span>
                </div>

                {/* 5. SPECIFIC SETTINGS FOR DROPDOWN SELECT OR RADIO BUTTONS */}
                {(selectedField.type === "select" || selectedField.type === "radio") && (
                  <div className="setting-control-group options-manager-box">
                    <label className="setting-label" style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Options List</span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        {(selectedField.options || []).length} options
                      </span>
                    </label>

                    <div className="options-edit-list">
                      {(selectedField.options || []).map((opt, optIdx) => (
                        <div key={optIdx} className="option-edit-row">
                          <input
                            type="text"
                            className="option-text-input"
                            value={opt}
                            onChange={(e) => {
                              const nextOpts = [...(selectedField.options || [])];
                              nextOpts[optIdx] = e.target.value;
                              updateFieldAttribute(selectedField.id, "options", nextOpts);
                            }}
                          />
                          <button
                            type="button"
                            className="btn-delete-option"
                            title="Remove option"
                            onClick={() => {
                              const nextOpts = (selectedField.options || []).filter((_, i) => i !== optIdx);
                              updateFieldAttribute(selectedField.id, "options", nextOpts);
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="btn-add-option-pill"
                      onClick={() => {
                        const nextOpts = [
                          ...(selectedField.options || []),
                          `Option ${(selectedField.options?.length || 0) + 1}`
                        ];
                        updateFieldAttribute(selectedField.id, "options", nextOpts);
                      }}
                    >
                      <Plus size={13} />
                      <span>+ Add Option</span>
                    </button>
                  </div>
                )}

                {/* 6. SPECIFIC SETTINGS FOR CHECKBOX */}
                {selectedField.type === "checkbox" && (
                  <div className="setting-control-group">
                    <label className="setting-label">Checkbox Label Text</label>
                    <input
                      type="text"
                      className="clean-setting-input"
                      value={selectedField.checkboxLabel || ""}
                      onChange={(e) => updateFieldAttribute(selectedField.id, "checkboxLabel", e.target.value)}
                      placeholder="e.g. I agree to the terms, Is Active"
                    />
                  </div>
                )}

                {/* 7. SPECIFIC SETTINGS FOR TEXTAREA */}
                {selectedField.type === "textarea" && (
                  <div className="setting-control-group">
                    <label className="setting-label">Number of Rows</label>
                    <select
                      className="clean-setting-input"
                      value={selectedField.rows || 3}
                      onChange={(e) => updateFieldAttribute(selectedField.id, "rows", Number(e.target.value))}
                    >
                      <option value={2}>2 Rows</option>
                      <option value={3}>3 Rows (Standard)</option>
                      <option value={5}>5 Rows (Large)</option>
                      <option value={8}>8 Rows (Extended)</option>
                    </select>
                  </div>
                )}

                {/* 8. SPECIFIC SETTINGS FOR NUMBER */}
                {selectedField.type === "number" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="setting-control-group">
                      <label className="setting-label">Min Value</label>
                      <input
                        type="number"
                        className="clean-setting-input"
                        value={selectedField.min !== undefined ? selectedField.min : 0}
                        onChange={(e) => updateFieldAttribute(selectedField.id, "min", Number(e.target.value))}
                      />
                    </div>
                    <div className="setting-control-group">
                      <label className="setting-label">Step / Decimals</label>
                      <input
                        type="text"
                        className="clean-setting-input"
                        value={selectedField.step || "any"}
                        onChange={(e) => updateFieldAttribute(selectedField.id, "step", e.target.value)}
                        placeholder="1 or 0.01"
                      />
                    </div>
                  </div>
                )}

                {/* Bottom Danger Action */}
                <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
                  <button
                    type="button"
                    className="btn-delete-field-full"
                    onClick={() => handleDeleteField(selectedField.id)}
                  >
                    <Trash2 size={14} />
                    <span>Delete This Field</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* When NO field is selected: Show Module Properties & Instructions */
            <div className="settings-panel-content">
              <div className="settings-panel-header">
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Layers size={16} className="text-indigo-600" />
                  <h3 className="settings-title">Module Settings</h3>
                </div>
              </div>

              <div className="settings-form-scroll">
                <div className="module-properties-tip-card">
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <Sliders size={18} className="text-indigo-600" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <p style={{ margin: 0, fontSize: "12.5px", color: "#334155", lineHeight: 1.5 }}>
                      <strong>Field Inspector:</strong> Click on any field card in the <strong>center canvas</strong> to customize its label, placeholder, options list, and required rules here.
                    </p>
                  </div>
                </div>

                <div className="setting-control-group" style={{ marginTop: "16px" }}>
                  <label className="setting-label">Module Icon</label>
                  <select
                    className="clean-setting-input"
                    value={moduleIcon}
                    onChange={(e) => setModuleIcon(e.target.value)}
                  >
                    <option value="Layers">Layers (Standard)</option>
                    <option value="Receipt">Receipt (Purchasing / Invoices)</option>
                    <option value="ClipboardCheck">ClipboardCheck (GRN / QC / Inward)</option>
                    <option value="Package">Package (Inventory / Materials)</option>
                    <option value="Users">Users (Staff / Employees)</option>
                    <option value="Building2">Building2 (Vendors / Suppliers)</option>
                  </select>
                </div>

                <div className="setting-control-group">
                  <label className="setting-label">Total Form Fields</label>
                  <div style={{ padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", fontWeight: "600", color: "#1e293b", border: "1px solid #e2e8f0" }}>
                    {fields.length} {fields.length === 1 ? "field added" : "fields added"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
