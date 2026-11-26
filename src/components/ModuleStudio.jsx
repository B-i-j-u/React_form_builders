import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  Layers, 
  CheckCircle2, 
  PlusCircle, 
  ArrowRight, 
  Eye,
  Settings, 
  X, 
  Copy,
  FileText,
  Building2,
  Receipt,
  Calculator,
  FileSpreadsheet,
  DownloadCloud,
  Sparkles
} from "lucide-react";
import { AVAILABLE_FIELDS, INVOICE_PO_TEMPLATE_PRESET } from "../constants/fieldTypes";
import { rbacStore } from "../services/rbacStore";

export default function ModuleStudio({ onModuleCreated, onSelectModuleView }) {
  const [modules, setModules] = useState(() => rbacStore.getModules());
  const [selectedModuleId, setSelectedModuleId] = useState("new"); // "new" | module_id
  
  // Current editing module state
  const [moduleName, setModuleName] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [fields, setFields] = useState([]);
  const [isOverCanvas, setIsOverCanvas] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [toolboxCategory, setToolboxCategory] = useState("all"); // "all" | "invoice" | "general"

  // Select an existing module to view/edit
  const handleSelectModule = (modId) => {
    setSelectedModuleId(modId);
    if (modId === "new") {
      setModuleName("");
      setModuleDesc("");
      setFields([]);
    } else {
      const mod = modules.find((m) => m.id === modId);
      if (mod) {
        setModuleName(mod.name);
        setModuleDesc(mod.description || "");
        setFields(JSON.parse(JSON.stringify(mod.fields || [])));
      }
    }
  };

  // 1-Click Load Corporate PO / Invoice Template (Image 2 Preset)
  const handleLoadInvoiceTemplate = () => {
    setSelectedModuleId("new");
    setModuleName("Purchase Orders & Invoices");
    setModuleDesc("Corporate vendor purchase order document with itemized billing, taxes and terms.");
    setFields(JSON.parse(JSON.stringify(INVOICE_PO_TEMPLATE_PRESET)));
    setSuccessMessage("✨ Corporate PO / Invoice Template loaded onto canvas!");
    setTimeout(() => setSuccessMessage(""), 2500);
  };

  // Drag start from Toolbox
  const handleDragStart = (e, fieldType) => {
    e.dataTransfer.setData("application/field-type", fieldType);
    e.dataTransfer.effectAllowed = "copy";
  };

  // Drop on Canvas
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
      addFieldByType(fieldType);
    }
  };

  // Add field helper
  const addFieldByType = (fieldType) => {
    const fieldDef = AVAILABLE_FIELDS.find((f) => f.type === fieldType);
    if (!fieldDef) return;

    const newField = {
      id: "fld_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      type: fieldType,
      ...JSON.parse(JSON.stringify(fieldDef.defaultConfig))
    };

    setFields((prev) => [...prev, newField]);
  };

  // Update field property
  const updateField = (id, key, value) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  // Delete field
  const deleteField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  // Duplicate field
  const duplicateField = (id) => {
    const idx = fields.findIndex((f) => f.id === id);
    if (idx === -1) return;
    const copy = {
      ...JSON.parse(JSON.stringify(fields[idx])),
      id: "fld_" + Date.now(),
      label: fields[idx].label + " (Copy)"
    };
    setFields((prev) => [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)]);
  };

  // Delete Module Handler
  const handleDeleteModule = (modId) => {
    if (window.confirm("Are you sure you want to delete this module and its records?")) {
      const updated = rbacStore.deleteModule(modId);
      setModules(updated);
      setSelectedModuleId("new");
      setModuleName("");
      setModuleDesc("");
      setFields([]);
      setSuccessMessage("Module deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 2000);
    }
  };

  // Save Module Handler
  const handleSaveModule = (e) => {
    e.preventDefault();
    if (!moduleName.trim()) {
      alert("Please enter a Module Name (e.g. Products, Vendor Registration, Leave Request).");
      return;
    }
    if (fields.length === 0) {
      alert("Please drag and drop at least 1 field into your module form.");
      return;
    }

    if (selectedModuleId === "new") {
      const created = rbacStore.createModule({
        name: moduleName.trim(),
        description: moduleDesc.trim(),
        fields
      });
      const updated = rbacStore.getModules();
      setModules(updated);
      setSelectedModuleId(created.id);
      setSuccessMessage(`Module "${created.name}" created successfully! It is now accessible in the menu.`);
      onModuleCreated?.(created);
    } else {
      const updated = rbacStore.updateModule(selectedModuleId, {
        name: moduleName.trim(),
        description: moduleDesc.trim(),
        fields
      });
      setModules(updated);
      setSuccessMessage(`Module "${moduleName.trim()}" updated successfully!`);
      const updatedMod = updated.find((m) => m.id === selectedModuleId);
      onModuleCreated?.(updatedMod);
    }

    setTimeout(() => setSuccessMessage(""), 2500);
  };

  // Filter toolbox tools
  const visibleTools = AVAILABLE_FIELDS.filter((tool) => {
    if (toolboxCategory === "all") return true;
    return tool.category === toolboxCategory;
  });

  return (
    <div className="module-studio-container">
      {/* Studio Header Bar */}
      <div className="studio-top-bar">
        <div className="studio-title-block">
          <div className="studio-icon-circle">
            <Layers size={22} />
          </div>
          <div>
            <h2 className="studio-title">ERP Dynamic Module Studio</h2>
            <p className="studio-desc">Drag &amp; drop form fields to create complete ERP modules with zero code.</p>
          </div>
        </div>

        {/* Existing modules selector & Action buttons */}
        <div className="studio-actions-group">
          <button
            type="button"
            className="btn-preset-invoice"
            onClick={handleLoadInvoiceTemplate}
            title="Click to load complete Purchase Order / Invoice template layout"
          >
            <Sparkles size={16} />
            <span>Load PO Template</span>
          </button>

          <select
            className="module-selector-dropdown"
            value={selectedModuleId}
            onChange={(e) => handleSelectModule(e.target.value)}
          >
            <option value="new">+ Create Brand New Module</option>
            {modules.length > 0 && (
              <optgroup label="Edit Existing Modules:">
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    📦 {m.name} ({m.fields?.length || 0} fields)
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          <button
            type="button"
            className="save-module-btn"
            onClick={handleSaveModule}
          >
            <Save size={16} />
            <span>Save &amp; Publish Module</span>
          </button>

          {selectedModuleId !== "new" && (
            <>
              <button
                type="button"
                className="view-mod-btn"
                onClick={() => onSelectModuleView?.(selectedModuleId)}
                title="View records and table for this module"
              >
                <Eye size={16} />
                <span>Open Table</span>
              </button>

              <button
                type="button"
                className="delete-mod-btn"
                onClick={() => handleDeleteModule(selectedModuleId)}
                title="Delete this module"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="studio-success-banner">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Studio Workspace: 2-Column Clean Layout */}
      <div className="studio-workspace-grid">
        {/* Left Column: Component Toolbox */}
        <aside className="studio-toolbox-sidebar">
          <div className="toolbox-header-row">
            <div>
              <h3 className="toolbox-heading">COMPONENT TOOLBOX</h3>
              <span className="toolbox-sub">Drag to canvas or click +</span>
            </div>
          </div>

          {/* Category Tabs: All | E-Invoice & Tables | Inputs */}
          <div className="toolbox-filter-tabs">
            <button
              type="button"
              className={`filter-tab-btn ${toolboxCategory === "all" ? "active" : ""}`}
              onClick={() => setToolboxCategory("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${toolboxCategory === "invoice" ? "active" : ""}`}
              onClick={() => setToolboxCategory("invoice")}
            >
              E-Invoice &amp; Tables
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${toolboxCategory === "general" ? "active" : ""}`}
              onClick={() => setToolboxCategory("general")}
            >
              Inputs
            </button>
          </div>

          <div className="toolbox-clean-list">
            {visibleTools.map((item) => {
              const Icon = item.icon;
              const isInvoiceTool = item.category === "invoice";
              return (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.type)}
                  className={`clean-tool-card ${isInvoiceTool ? "invoice-tool-card" : ""}`}
                  title="Drag onto Canvas or click + to add"
                >
                  <div className="tool-drag-handle">
                    <GripVertical size={16} />
                  </div>
                  <div className={`tool-icon-box ${isInvoiceTool ? "indigo" : ""}`}>
                    <Icon size={18} />
                  </div>
                  <div className="tool-meta">
                    <div className="tool-label">
                      {item.label}
                      {isInvoiceTool && <span className="mini-badge-tag">E-INVOICE</span>}
                    </div>
                    <div className="tool-desc">{item.description}</div>
                  </div>
                  <button
                    type="button"
                    className="tool-quick-add"
                    onClick={() => addFieldByType(item.type)}
                    title="Add to form"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="toolbox-tip-card">
            <span className="tip-icon">💡</span>
            <div className="tip-text">
              <strong>E-Invoice Tools:</strong> Drag Header, Vendor Blocks, and Line Items Grid to build authentic corporate invoices matching your business stationary.
            </div>
          </div>
        </aside>

        {/* Right Column: Canvas & Field Customizer */}
        <main className="studio-canvas-area">
          {/* Module Meta Header Inputs */}
          <div className="module-meta-card">
            <div className="meta-inputs-grid">
              <div className="meta-field-group">
                <label className="meta-label">MODULE NAME *</label>
                <input
                  type="text"
                  className="meta-input"
                  placeholder="e.g. Purchase Orders, Sales Invoicing, Vendor Portal"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                />
              </div>

              <div className="meta-field-group">
                <label className="meta-label">MODULE DESCRIPTION</label>
                <input
                  type="text"
                  className="meta-input"
                  placeholder="Briefly describe what this module manages..."
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Form Fields Canvas Dropzone */}
          <div
            className={`module-fields-canvas ${isOverCanvas ? "drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {fields.length === 0 ? (
              <div className="canvas-empty-prompt">
                <div className="empty-drop-circle">
                  <PlusCircle size={36} />
                </div>
                <h3>Drag &amp; Drop Form Fields Here</h3>
                <p>Drag any field from the left toolbox or click <strong>+</strong> to start designing your module form.</p>
                <button
                  type="button"
                  className="btn-load-preset-prompt"
                  onClick={handleLoadInvoiceTemplate}
                >
                  <Sparkles size={16} />
                  <span>Or Load Purchase Order / Invoice Template</span>
                </button>
              </div>
            ) : (
              <div className="canvas-fields-stack">
                <div className="stack-header">
                  <span>Form Fields &amp; Invoice Components ({fields.length})</span>
                  <span className="stack-hint">Fields will appear in this exact layout in the user entry form</span>
                </div>

                {fields.map((field, idx) => (
                  <div key={field.id} className={`field-designer-card ${field.type.startsWith("po_") ? "invoice-component-card" : ""}`}>
                    <div className="field-card-top-bar">
                      <div className="field-type-pill">
                        <span className="field-index-badge">#{idx + 1}</span>
                        <span className="field-type-name">{field.type.toUpperCase()}</span>
                        {field.type.startsWith("po_") && (
                          <span className="doc-section-badge">CORPORATE DOCUMENT BLOCK</span>
                        )}
                      </div>

                      <div className="field-card-actions">
                        <button
                          type="button"
                          className="field-action-btn"
                          onClick={() => duplicateField(field.id)}
                          title="Duplicate field"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          type="button"
                          className="field-action-btn delete"
                          onClick={() => deleteField(field.id)}
                          title="Delete field"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* SPECIAL CASE 1: Company Header & PO # (Image 2 Top Block) */}
                    {field.type === "po_header" && (
                      <div className="invoice-preview-header-box">
                        <div className="preview-company-side">
                          <input
                            type="text"
                            className="designer-company-title"
                            value={field.companyName || "[Company Name]"}
                            onChange={(e) => updateField(field.id, "companyName", e.target.value)}
                            placeholder="[Company Name]"
                          />
                          <input
                            type="text"
                            className="designer-address-sub"
                            value={field.streetAddress || "[Street Address, City, ST ZIP]"}
                            onChange={(e) => updateField(field.id, "streetAddress", e.target.value)}
                            placeholder="[Street Address, City, ST ZIP]"
                          />
                          <input
                            type="text"
                            className="designer-address-sub"
                            value={field.phone || "Phone: (000) 000-0000"}
                            onChange={(e) => updateField(field.id, "phone", e.target.value)}
                            placeholder="Phone: (000) 000-0000"
                          />
                        </div>

                        <div className="preview-po-meta-side">
                          <h2 className="preview-doc-title">PURCHASE ORDER</h2>
                          <div className="po-meta-table">
                            <div className="po-meta-row">
                              <span className="meta-th">DATE</span>
                              <input
                                type="date"
                                className="meta-td-input"
                                value={field.poDate || "2026-11-26"}
                                onChange={(e) => updateField(field.id, "poDate", e.target.value)}
                              />
                            </div>
                            <div className="po-meta-row">
                              <span className="meta-th">PO #</span>
                              <input
                                type="text"
                                className="meta-td-input"
                                value={field.poNumber || "123456"}
                                onChange={(e) => updateField(field.id, "poNumber", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SPECIAL CASE 2: Vendor & Ship-To Blocks (Image 2 Parties Block) */}
                    {field.type === "po_parties" && (
                      <div className="invoice-parties-grid">
                        <div className="party-card-block">
                          <div className="party-card-banner">VENDOR</div>
                          <div className="party-fields-padding">
                            <input
                              type="text"
                              className="designer-input"
                              placeholder="[Vendor Company Name]"
                              value={field.vendorName || ""}
                              onChange={(e) => updateField(field.id, "vendorName", e.target.value)}
                            />
                            <input
                              type="text"
                              className="designer-input"
                              placeholder="[Contact or Department]"
                              value={field.vendorContact || ""}
                              onChange={(e) => updateField(field.id, "vendorContact", e.target.value)}
                            />
                            <input
                              type="text"
                              className="designer-input"
                              placeholder="[Vendor Street Address, City, ZIP]"
                              value={field.vendorAddress || ""}
                              onChange={(e) => updateField(field.id, "vendorAddress", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="party-card-block">
                          <div className="party-card-banner">SHIP TO</div>
                          <div className="party-fields-padding">
                            <input
                              type="text"
                              className="designer-input"
                              placeholder="[Name / Receiving Company]"
                              value={field.shipToName || ""}
                              onChange={(e) => updateField(field.id, "shipToName", e.target.value)}
                            />
                            <input
                              type="text"
                              className="designer-input"
                              placeholder="[Delivery Address, City, ZIP]"
                              value={field.shipToAddress || ""}
                              onChange={(e) => updateField(field.id, "shipToAddress", e.target.value)}
                            />
                            <input
                              type="text"
                              className="designer-input"
                              placeholder="[Receiving Dock / Contact Phone]"
                              value={field.shipToPhone || ""}
                              onChange={(e) => updateField(field.id, "shipToPhone", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SPECIAL CASE 3: Line Items Table (Image 2 Main Table) */}
                    {field.type === "po_items" && (
                      <div className="invoice-items-table-block">
                        <table className="designer-invoice-table">
                          <thead>
                            <tr>
                              <th style={{ width: "15%" }}>ITEM #</th>
                              <th style={{ width: "45%" }}>DESCRIPTION</th>
                              <th style={{ width: "10%" }}>QTY</th>
                              <th style={{ width: "15%" }}>UNIT PRICE</th>
                              <th style={{ width: "15%" }}>TOTAL</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(field.items || []).map((row, rIdx) => (
                              <tr key={rIdx}>
                                <td>{row.itemNo}</td>
                                <td>{row.description}</td>
                                <td>{row.qty}</td>
                                <td>{field.currency || "₹"}{row.unitPrice}</td>
                                <td><strong>{field.currency || "₹"}{row.total}</strong></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="items-table-note">
                          ✨ Dynamic Line Items Grid: Calculates Total = (Qty &times; Unit Price) automatically upon record submission.
                        </div>
                      </div>
                    )}

                    {/* SPECIAL CASE 4: Terms & Shipping Terms Bar */}
                    {field.type === "po_instructions" && (
                      <div className="invoice-instructions-block">
                        <div className="terms-bar-grid">
                          <div className="term-cell">
                            <span className="term-header">REQUISITIONER</span>
                            <span className="term-value">{field.requisitioner || "Operations Lead"}</span>
                          </div>
                          <div className="term-cell">
                            <span className="term-header">SHIP VIA</span>
                            <span className="term-value">{field.shipVia || "Surface Cargo"}</span>
                          </div>
                          <div className="term-cell">
                            <span className="term-header">SHIPPING TERMS</span>
                            <span className="term-value">{field.shippingTerms || "Net 30 Days F.O.B."}</span>
                          </div>
                        </div>

                        <div className="comments-box">
                          <label className="comments-header">Comments or Special Instructions</label>
                          <textarea
                            className="designer-textarea"
                            rows={2}
                            placeholder="Enter delivery guidelines, inspection rules, or payment details..."
                            value={field.instructions || ""}
                            onChange={(e) => updateField(field.id, "instructions", e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* SPECIAL CASE 5: Financial Summary Box (Subtotal, Tax, Total) */}
                    {field.type === "po_summary" && (
                      <div className="invoice-summary-wrapper">
                        <div className="summary-calc-card">
                          <div className="calc-row">
                            <span>SUBTOTAL</span>
                            <strong>₹{field.subtotal || "0.00"}</strong>
                          </div>
                          <div className="calc-row">
                            <span>TAX ({field.taxRate || "18%"})</span>
                            <span>₹{field.taxAmount || "0.00"}</span>
                          </div>
                          <div className="calc-row">
                            <span>SHIPPING</span>
                            <span>₹{field.shippingCharges || "0.00"}</span>
                          </div>
                          <div className="calc-row grand-total-row">
                            <span>TOTAL</span>
                            <strong className="text-indigo-600">₹{field.grandTotal || "0.00"}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STANDARD FIELD EDITOR BODY (For general fields) */}
                    {!field.type.startsWith("po_") && (
                      <div className="field-inputs-row">
                        <div className="field-prop-group flex-2">
                          <label>Field Label / Question</label>
                          <input
                            type="text"
                            className="designer-input"
                            value={field.label}
                            onChange={(e) => updateField(field.id, "label", e.target.value)}
                            placeholder="e.g. Product Name, Delivery Date..."
                          />
                        </div>

                        <div className="field-prop-group flex-2">
                          <label>Placeholder Hint</label>
                          <input
                            type="text"
                            className="designer-input"
                            value={field.placeholder || ""}
                            onChange={(e) => updateField(field.id, "placeholder", e.target.value)}
                            placeholder="Hint text for users..."
                          />
                        </div>

                        <div className="field-prop-group flex-1">
                          <label>Mandatory?</label>
                          <label className="checkbox-toggle-label">
                            <input
                              type="checkbox"
                              checked={!!field.required}
                              onChange={(e) => updateField(field.id, "required", e.target.checked)}
                            />
                            <span>Required</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* If Dropdown / Select: Option editor */}
                    {field.type === "select" && (
                      <div className="dropdown-options-editor">
                        <label>Dropdown Options (comma separated):</label>
                        <input
                          type="text"
                          className="designer-input"
                          value={(field.options || []).join(", ")}
                          onChange={(e) =>
                            updateField(
                              field.id,
                              "options",
                              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                            )
                          }
                          placeholder="Option 1, Option 2, Option 3..."
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
