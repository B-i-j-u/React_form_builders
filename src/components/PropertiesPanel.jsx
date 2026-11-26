import React, { useState } from "react";
import { 
  Sliders, 
  Trash2, 
  Plus, 
  X, 
  Table, 
  Building2, 
  Calculator, 
  FileSpreadsheet, 
  Landmark, 
  PenTool,
  Columns3,
  Rows3
} from "lucide-react";

export default function PropertiesPanel({
  selectedField,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onAddColumn,
  onDeleteColumn,
  onUpdateColumn,
  onAddRow,
  onDeleteRow
}) {
  const [newOptionInput, setNewOptionInput] = useState("");

  if (!selectedField) {
    return (
      <aside className="properties-panel empty">
        <div className="properties-empty-state">
          <div className="properties-empty-icon">
            <Sliders size={32} />
          </div>
          <h3>Field Inspector</h3>
          <p>Click on any field or table in the canvas to configure its settings, columns, and tax rates.</p>
        </div>
      </aside>
    );
  }

  // Update a specific attribute of selected field
  const handleChange = (key, value) => {
    onUpdateField({
      ...selectedField,
      [key]: value
    });
  };

  // Option list management (for select & radio)
  const handleAddOption = () => {
    const trimmed = newOptionInput.trim();
    if (!trimmed) return;
    const currentOptions = selectedField.options || [];
    handleChange("options", [...currentOptions, trimmed]);
    setNewOptionInput("");
  };

  const handleRemoveOption = (indexToRemove) => {
    const currentOptions = selectedField.options || [];
    handleChange(
      "options",
      currentOptions.filter((_, idx) => idx !== indexToRemove)
    );
  };

  const handleUpdateOption = (indexToUpdate, newValue) => {
    const currentOptions = [...(selectedField.options || [])];
    currentOptions[indexToUpdate] = newValue;
    handleChange("options", currentOptions);
  };

  const isTable = selectedField.type === "table" || selectedField.type === "po_items";
  const isParty = selectedField.type === "party_details";
  const isMeta = selectedField.type === "invoice_meta";
  const isSummary = selectedField.type === "invoice_summary";
  const isBank = selectedField.type === "bank_details";
  const isSignature = selectedField.type === "signature_block";
  const isPOHeader = selectedField.type === "po_header";
  const isPOParties = selectedField.type === "po_parties";
  const isPOLogistics = selectedField.type === "po_logistics";
  const isPOFooter = selectedField.type === "po_footer";
  const hasOptions = selectedField.type === "select" || selectedField.type === "radio";
  const hasPlaceholder = ["text", "email", "number", "textarea", "select"].includes(selectedField.type);

  // Normalize table columns
  const tableColumns = isTable 
    ? (selectedField.columns || []).map((col, idx) => (typeof col === "string" ? { id: `col_${idx}`, label: col, type: "text" } : col))
    : [];

  const tableRows = isTable 
    ? (selectedField.rows || selectedField.items || []) 
    : [];

  return (
    <aside className="properties-panel">
      <div className="panel-header">
        <div className="flex-between">
          <div>
            <h2 className="panel-title">Properties</h2>
            <span className="field-type-pill">{selectedField.type}</span>
          </div>
          <button
            type="button"
            className="panel-delete-btn"
            onClick={() => onDeleteField(selectedField.id)}
            title="Delete this block"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="properties-body">
        {/* Section / Field Label */}
        <div className="form-group">
          <label className="prop-label">Section / Field Title</label>
          <input
            type="text"
            className="prop-input"
            value={selectedField.label || ""}
            onChange={(e) => handleChange("label", e.target.value)}
          />
        </div>

        {/* =======================================================
            PO HEADER EDITOR
           ======================================================= */}
        {isPOHeader && (
          <div className="prop-custom-section">
            <h4 className="prop-subhead"><FileSpreadsheet size={14} /> Company &amp; Header Info</h4>

            <div className="form-group">
              <label className="prop-label">Document Title</label>
              <input
                type="text"
                className="prop-input"
                value={selectedField.docTitle || "PURCHASE ORDER"}
                onChange={(e) => handleChange("docTitle", e.target.value)}
              />
            </div>

            <div className="two-col-grid">
              <div className="form-group">
                <label className="prop-label">Date</label>
                <input
                  type="text"
                  className="prop-input"
                  value={selectedField.date || "9/17/2026"}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="prop-label">PO / Invoice #</label>
                <input
                  type="text"
                  className="prop-input"
                  value={selectedField.poNumber || "123456"}
                  onChange={(e) => handleChange("poNumber", e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="prop-label">Company Name</label>
              <input
                type="text"
                className="prop-input"
                value={selectedField.companyName || ""}
                onChange={(e) => handleChange("companyName", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="prop-label">Street Address</label>
              <input
                type="text"
                className="prop-input"
                value={selectedField.streetAddress || ""}
                onChange={(e) => handleChange("streetAddress", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="prop-label">City, State ZIP</label>
              <input
                type="text"
                className="prop-input"
                value={selectedField.cityStateZip || ""}
                onChange={(e) => handleChange("cityStateZip", e.target.value)}
              />
            </div>

            <div className="two-col-grid">
              <div className="form-group">
                <label className="prop-label">Phone</label>
                <input
                  type="text"
                  className="prop-input"
                  value={selectedField.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="prop-label">Fax</label>
                <input
                  type="text"
                  className="prop-input"
                  value={selectedField.fax || ""}
                  onChange={(e) => handleChange("fax", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            PO PARTIES (VENDOR & SHIP TO)
           ======================================================= */}
        {isPOParties && (
          <div className="prop-custom-section">
            <h4 className="prop-subhead"><Building2 size={14} /> Vendor &amp; Ship To</h4>

            <h5 className="font-bold text-xs" style={{ color: "#2b476e", marginTop: "4px" }}>VENDOR (Supplier)</h5>
            <div className="form-group">
              <label className="prop-label">Vendor Company</label>
              <input
                type="text"
                className="prop-input"
                value={selectedField.vendor?.companyName || ""}
                onChange={(e) =>
                  handleChange("vendor", { ...selectedField.vendor, companyName: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="prop-label">Contact / Dept</label>
              <input
                type="text"
                className="prop-input"
                value={selectedField.vendor?.contact || ""}
                onChange={(e) =>
                  handleChange("vendor", { ...selectedField.vendor, contact: e.target.value })
                }
              />
            </div>

            <h5 className="font-bold text-xs" style={{ color: "#2b476e", marginTop: "8px" }}>SHIP TO (Destination)</h5>
            <div className="form-group">
              <label className="prop-label">Recipient Name</label>
              <input
                type="text"
                className="prop-input"
                value={selectedField.shipTo?.name || ""}
                onChange={(e) =>
                  handleChange("shipTo", { ...selectedField.shipTo, name: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label className="prop-label">Destination Company</label>
              <input
                type="text"
                className="prop-input"
                value={selectedField.shipTo?.companyName || ""}
                onChange={(e) =>
                  handleChange("shipTo", { ...selectedField.shipTo, companyName: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {/* =======================================================
            PO LOGISTICS STRIP
           ======================================================= */}
        {isPOLogistics && (
          <div className="prop-custom-section">
            <h4 className="prop-subhead"><FileSpreadsheet size={14} /> Shipping Terms &amp; Logistics</h4>

            <div className="form-group">
              <label className="prop-label">Requisitioner</label>
              <input
                type="text"
                className="prop-input"
                value={selectedField.requisitioner || ""}
                onChange={(e) => handleChange("requisitioner", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="prop-label">Ship Via</label>
              <input
                type="text"
                className="prop-input"
                value={selectedField.shipVia || ""}
                onChange={(e) => handleChange("shipVia", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="prop-label">F.O.B.</label>
              <input
                type="text"
                className="prop-input"
                value={selectedField.fob || ""}
                onChange={(e) => handleChange("fob", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="prop-label">Shipping Terms</label>
              <input
                type="text"
                className="prop-input"
                value={selectedField.shippingTerms || ""}
                onChange={(e) => handleChange("shippingTerms", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* =======================================================
            PO FOOTER & TOTALS
           ======================================================= */}
        {isPOFooter && (
          <div className="prop-custom-section">
            <h4 className="prop-subhead"><Calculator size={14} /> Totals &amp; Comments</h4>

            <div className="form-group">
              <label className="prop-label">Comments Title</label>
              <input
                type="text"
                className="prop-input"
                value={selectedField.commentsTitle || "Comments or Special Instructions"}
                onChange={(e) => handleChange("commentsTitle", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="prop-label">Default Instructions</label>
              <textarea
                rows={3}
                className="prop-input"
                value={selectedField.comments || ""}
                onChange={(e) => handleChange("comments", e.target.value)}
              />
            </div>

            <div className="two-col-grid">
              <div className="form-group">
                <label className="prop-label">Tax Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="prop-input"
                  value={selectedField.taxAmount ?? 0}
                  onChange={(e) => handleChange("taxAmount", Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="prop-label">Shipping Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="prop-input"
                  value={selectedField.shippingAmount ?? 0}
                  onChange={(e) => handleChange("shippingAmount", Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            TABLE SPECIFIC SETTINGS (th & td MANAGERS)
           ======================================================= */}
        {isTable && (
          <div className="prop-custom-section">
            <h4 className="prop-subhead"><Table size={14} /> Table Settings</h4>

            <div className="form-group">
              <label className="prop-label">Currency Symbol</label>
              <select
                className="prop-input"
                value={selectedField.currency || "$"}
                onChange={(e) => handleChange("currency", e.target.value)}
              >
                <option value="$">$ (USD - US Dollar)</option>
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - British Pound)</option>
                <option value="AED">AED (UAE Dirham)</option>
              </select>
            </div>

            {/* <th> Columns Manager */}
            <div className="th-manager-box">
              <div className="flex-between" style={{ marginBottom: "8px" }}>
                <span className="prop-subhead" style={{ color: "#4f46e5", fontSize: "11px" }}>
                  <Columns3 size={13} /> &lt;th&gt; Column Headers ({tableColumns.length})
                </span>
                <button
                  type="button"
                  className="btn-add-th-sm"
                  onClick={() => onAddColumn?.(selectedField.id)}
                  title="Add a new <th> column"
                >
                  <Plus size={12} /> Add &lt;th&gt;
                </button>
              </div>

              <div className="th-columns-list">
                {tableColumns.map((col, idx) => (
                  <div key={col.id || idx} className="th-column-item-card">
                    <div className="th-item-top">
                      <span className="th-badge-sm">th #{idx + 1}</span>
                      <input
                        type="text"
                        className="prop-input sm font-semibold"
                        value={col.label}
                        onChange={(e) => onUpdateColumn?.(selectedField.id, col.id, { label: e.target.value })}
                        placeholder="Column Label"
                      />
                      {tableColumns.length > 1 && (
                        <button
                          type="button"
                          className="th-col-del-btn"
                          onClick={() => onDeleteColumn?.(selectedField.id, col.id)}
                          title="Delete column"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    <div className="th-item-details">
                      <div className="th-type-select-wrapper">
                        <span className="th-sublabel">Data Type:</span>
                        <select
                          className="prop-input sm"
                          value={col.type || "text"}
                          onChange={(e) => onUpdateColumn?.(selectedField.id, col.id, { type: e.target.value })}
                        >
                          <option value="text">Text (e.g. Item #, Description)</option>
                          <option value="number">Numeric (e.g. Qty, Price)</option>
                          <option value="select">Dropdown / Selection</option>
                          <option value="calculated">Calculated Total</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* <td> Data Rows Manager */}
            <div className="td-manager-box">
              <div className="flex-between" style={{ marginBottom: "6px" }}>
                <span className="prop-subhead" style={{ color: "#059669", fontSize: "11px" }}>
                  <Rows3 size={13} /> &lt;td&gt; Data Rows ({tableRows.length})
                </span>
                <button
                  type="button"
                  className="btn-add-td-sm"
                  onClick={() => onAddRow?.(selectedField.id)}
                  title="Add a new row with <td> cells"
                >
                  <Plus size={12} /> Add &lt;td&gt; Row
                </button>
              </div>
              <p className="text-muted text-xs">
                Each row renders matching <code>&lt;td&gt;</code> cells for all defined <code>&lt;th&gt;</code> columns.
              </p>
            </div>
          </div>
        )}

        {/* =======================================================
            STANDARD FIELD SETTINGS (Placeholder, Options, etc.)
           ======================================================= */}
        {hasPlaceholder && (
          <div className="form-group">
            <label className="prop-label">Placeholder Text</label>
            <input
              type="text"
              className="prop-input"
              value={selectedField.placeholder || ""}
              onChange={(e) => handleChange("placeholder", e.target.value)}
            />
          </div>
        )}

        {/* Helper Subtext */}
        {selectedField.helperText !== undefined && (
          <div className="form-group">
            <label className="prop-label">Help / Subtext</label>
            <input
              type="text"
              className="prop-input"
              value={selectedField.helperText || ""}
              onChange={(e) => handleChange("helperText", e.target.value)}
            />
          </div>
        )}

        {/* Required Field Toggle */}
        <div className="form-group checkbox-group">
          <label className="prop-switch-label">
            <input
              type="checkbox"
              checked={Boolean(selectedField.required)}
              onChange={(e) => handleChange("required", e.target.checked)}
            />
            <span className="prop-switch-text">Required block / field</span>
          </label>
        </div>

        {/* Options list for Select & Radio */}
        {hasOptions && (
          <div className="form-group">
            <label className="prop-label">Options</label>
            <div className="options-editor-list">
              {(selectedField.options || []).map((opt, idx) => (
                <div key={idx} className="option-editor-item">
                  <span className="option-number">{idx + 1}.</span>
                  <input
                    type="text"
                    className="prop-input sm"
                    value={opt}
                    onChange={(e) => handleUpdateOption(idx, e.target.value)}
                  />
                  <button
                    type="button"
                    className="option-remove-btn"
                    onClick={() => handleRemoveOption(idx)}
                    title="Remove option"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="add-option-row">
              <input
                type="text"
                className="prop-input sm"
                placeholder="New option name..."
                value={newOptionInput}
                onChange={(e) => setNewOptionInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddOption()}
              />
              <button
                type="button"
                className="btn-add-option"
                onClick={handleAddOption}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        )}

        <div className="properties-meta">
          <small>Field ID: <code>{selectedField.id}</code></small>
        </div>
      </div>
    </aside>
  );
}
