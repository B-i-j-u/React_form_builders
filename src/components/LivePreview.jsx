import React, { useState, useMemo } from "react";
import { Printer, Send, CheckCircle2, Plus, Trash2, ArrowLeft, X } from "lucide-react";

export default function LivePreview({
  formMetadata,
  fields = [],
  onUpdateField,
  onBackToBuilder,
  canAccessBuilder = true,
  onAddRow,
  onDeleteRow,
  onUpdateCell,
  onAddColumn,
  onDeleteColumn,
  onUpdateColumn,
  onDeleteField
}) {
  const [submitted, setSubmitted] = useState(false);
  const [docDate, setDocDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [docId, setDocId] = useState(() => "DOC-" + Math.floor(100000 + Math.random() * 900000));

  // Helper to format currency
  const formatMoney = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Compute subtotal for a single table
  const getTableSubtotal = (tableField) => {
    const rows = tableField.rows || tableField.items || [];
    return rows.reduce((sum, item) => {
      const q = Number(item.qty ?? item.col_qty ?? 0);
      const p = Number(item.unitPrice ?? item.col_rate ?? item.rate ?? 0);
      return sum + (q * p);
    }, 0);
  };

  // Compute grand subtotal across ALL tables in fields
  const allTablesSubtotal = useMemo(() => {
    return fields.reduce((sum, field) => {
      if (field.type === "table" || field.type === "po_items") {
        return sum + getTableSubtotal(field);
      }
      return sum;
    }, 0);
  }, [fields]);

  // Find footer if exists or calculate standalone totals
  const footerField = fields.find((f) => f.type === "po_footer") || {
    commentsTitle: "Comments or Special Instructions",
    comments: "",
    currency: "$",
    taxAmount: 0,
    shippingAmount: 0,
    otherAmount: 0,
    contactNotice: "If you have any questions about this purchase order, please contact\n[Name, Phone #, E-mail]"
  };

  const currency = footerField.currency || "$";
  const tax = Number(footerField.taxAmount || 0);
  const shipping = Number(footerField.shippingAmount || 0);
  const other = Number(footerField.otherAmount || 0);
  const grandTotal = allTablesSubtotal + tax + shipping + other;

  // Check if any tables exist
  const hasTables = fields.some((f) => f.type === "table" || f.type === "po_items");

  // Check if this document is a Purchase Order / Invoice
  const isInvoiceDoc = fields.some(
    (f) =>
      f.type === "po_header" ||
      f.type === "po_parties" ||
      f.type === "po_logistics" ||
      f.type === "po_footer"
  );

  // =========================================================================
  // DYNAMIC SECTION RENDERERS
  // =========================================================================

  // 1. PO Header
  const renderPOHeader = (field) => (
    <div key={field.id} className="po-header-grid">
      <div className="po-company-info">
        <input
          type="text"
          className="po-company-name-input"
          value={field.companyName || "[Company Name]"}
          onChange={(e) => onUpdateField?.({ ...field, companyName: e.target.value })}
        />
        <input
          type="text"
          className="po-company-line-input"
          value={field.streetAddress || "[Street Address]"}
          onChange={(e) => onUpdateField?.({ ...field, streetAddress: e.target.value })}
        />
        <input
          type="text"
          className="po-company-line-input"
          value={field.cityStateZip || "[City, ST ZIP]"}
          onChange={(e) => onUpdateField?.({ ...field, cityStateZip: e.target.value })}
        />
        <div className="po-contact-row">
          <span className="po-contact-label">Phone:</span>
          <input
            type="text"
            className="po-company-line-input inline"
            value={field.phone || "(000) 000-0000"}
            onChange={(e) => onUpdateField?.({ ...field, phone: e.target.value })}
          />
        </div>
        <div className="po-contact-row">
          <span className="po-contact-label">Fax:</span>
          <input
            type="text"
            className="po-company-line-input inline"
            value={field.fax || "(000) 000-0000"}
            onChange={(e) => onUpdateField?.({ ...field, fax: e.target.value })}
          />
        </div>
        <div className="po-contact-row">
          <span className="po-contact-label">Website:</span>
          <input
            type="text"
            className="po-company-line-input inline"
            value={field.website || "Website:"}
            onChange={(e) => onUpdateField?.({ ...field, website: e.target.value })}
          />
        </div>
      </div>

      <div className="po-title-block">
        <h1 className="po-main-title">{field.docTitle || "PURCHASE ORDER"}</h1>

        <table className="po-meta-table">
          <tbody>
            <tr>
              <td className="po-meta-label">DATE</td>
              <td className="po-meta-value">
                <input
                  type="text"
                  className="po-meta-input text-center"
                  value={field.date || "9/17/2026"}
                  onChange={(e) => onUpdateField?.({ ...field, date: e.target.value })}
                />
              </td>
            </tr>
            <tr>
              <td className="po-meta-label">PO #</td>
              <td className="po-meta-value">
                <input
                  type="text"
                  className="po-meta-input text-center"
                  value={field.poNumber || "123456"}
                  onChange={(e) => onUpdateField?.({ ...field, poNumber: e.target.value })}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  // 2. Vendor & Ship To Parties
  const renderPOParties = (field) => {
    const vendor = field.vendor || {};
    const shipTo = field.shipTo || {};

    return (
      <div key={field.id} className="po-parties-grid">
        <div className="po-party-col">
          <div className="po-navy-header">VENDOR</div>
          <div className="po-party-body">
            <input
              type="text"
              className="po-party-input font-bold"
              value={vendor.companyName || "[Company Name]"}
              onChange={(e) =>
                onUpdateField?.({
                  ...field,
                  vendor: { ...vendor, companyName: e.target.value }
                })
              }
            />
            <input
              type="text"
              className="po-party-input"
              value={vendor.contact || "[Contact or Department]"}
              onChange={(e) =>
                onUpdateField?.({
                  ...field,
                  vendor: { ...vendor, contact: e.target.value }
                })
              }
            />
            <input
              type="text"
              className="po-party-input"
              value={vendor.streetAddress || "[Street Address]"}
              onChange={(e) =>
                onUpdateField?.({
                  ...field,
                  vendor: { ...vendor, streetAddress: e.target.value }
                })
              }
            />
            <input
              type="text"
              className="po-party-input"
              value={vendor.cityStateZip || "[City, ST ZIP]"}
              onChange={(e) =>
                onUpdateField?.({
                  ...field,
                  vendor: { ...vendor, cityStateZip: e.target.value }
                })
              }
            />
            <div className="po-contact-row">
              <span className="po-contact-label">Phone:</span>
              <input
                type="text"
                className="po-party-input inline"
                value={vendor.phone || "(000) 000-0000"}
                onChange={(e) =>
                  onUpdateField?.({
                    ...field,
                    vendor: { ...vendor, phone: e.target.value }
                  })
                }
              />
            </div>
            <div className="po-contact-row">
              <span className="po-contact-label">Fax:</span>
              <input
                type="text"
                className="po-party-input inline"
                value={vendor.fax || "(000) 000-0000"}
                onChange={(e) =>
                  onUpdateField?.({
                    ...field,
                    vendor: { ...vendor, fax: e.target.value }
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="po-party-col">
          <div className="po-navy-header">SHIP TO</div>
          <div className="po-party-body">
            <input
              type="text"
              className="po-party-input font-bold"
              value={shipTo.name || "[Name]"}
              onChange={(e) =>
                onUpdateField?.({
                  ...field,
                  shipTo: { ...shipTo, name: e.target.value }
                })
              }
            />
            <input
              type="text"
              className="po-party-input"
              value={shipTo.companyName || "[Company Name]"}
              onChange={(e) =>
                onUpdateField?.({
                  ...field,
                  shipTo: { ...shipTo, companyName: e.target.value }
                })
              }
            />
            <input
              type="text"
              className="po-party-input"
              value={shipTo.streetAddress || "[Street Address]"}
              onChange={(e) =>
                onUpdateField?.({
                  ...field,
                  shipTo: { ...shipTo, streetAddress: e.target.value }
                })
              }
            />
            <input
              type="text"
              className="po-party-input"
              value={shipTo.cityStateZip || "[City, ST ZIP]"}
              onChange={(e) =>
                onUpdateField?.({
                  ...field,
                  shipTo: { ...shipTo, cityStateZip: e.target.value }
                })
              }
            />
            <div className="po-contact-row">
              <span className="po-contact-label">Phone:</span>
              <input
                type="text"
                className="po-party-input inline"
                value={shipTo.phone || "[Phone]"}
                onChange={(e) =>
                  onUpdateField?.({
                    ...field,
                    shipTo: { ...shipTo, phone: e.target.value }
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. Logistics Strip
  const renderPOLogistics = (field) => (
    <div key={field.id} className="po-logistics-wrapper">
      <table className="po-logistics-table">
        <thead>
          <tr>
            <th>REQUISITIONER</th>
            <th>SHIP VIA</th>
            <th>F.O.B.</th>
            <th>SHIPPING TERMS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input
                type="text"
                className="po-strip-input text-center"
                value={field.requisitioner || ""}
                placeholder="—"
                onChange={(e) => onUpdateField?.({ ...field, requisitioner: e.target.value })}
              />
            </td>
            <td>
              <input
                type="text"
                className="po-strip-input text-center"
                value={field.shipVia || ""}
                placeholder="—"
                onChange={(e) => onUpdateField?.({ ...field, shipVia: e.target.value })}
              />
            </td>
            <td>
              <input
                type="text"
                className="po-strip-input text-center"
                value={field.fob || ""}
                placeholder="—"
                onChange={(e) => onUpdateField?.({ ...field, fob: e.target.value })}
              />
            </td>
            <td>
              <input
                type="text"
                className="po-strip-input text-center"
                value={field.shippingTerms || ""}
                placeholder="—"
                onChange={(e) => onUpdateField?.({ ...field, shippingTerms: e.target.value })}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // 4. DYNAMIC TABLE RENDERER (RENDERS ANY & EVERY TABLE IN FIELDS!)
  const renderTableField = (field, tableIndex) => {
    const rawCols = field.columns || [
      { id: "itemNo", label: "ITEM #", width: "120px" },
      { id: "description", label: "DESCRIPTION", width: "auto" },
      { id: "qty", label: "QTY", width: "80px" },
      { id: "unitPrice", label: "UNIT PRICE", width: "120px" },
      { id: "total", label: "TOTAL", width: "130px" }
    ];

    const columns = rawCols.map((c, idx) => (typeof c === "string" ? { id: `col_${idx}`, label: c } : c));
    const rows = field.rows || field.items || [];
    const tableSub = getTableSubtotal(field);

    // Number of blank rows to maintain accounting look
    const minRows = field.minRows || 4;
    const blankCount = Math.max(0, minRows - rows.length);

    return (
      <div key={field.id} className="po-items-table-wrapper" style={{ marginTop: tableIndex > 0 ? "24px" : "0" }}>
        {/* Table Title with Row Count and Delete Table Button */}
        <div className="flex-between" style={{ marginBottom: "6px" }}>
          <div className="flex-align-gap">
            <span className="po-table-section-title font-bold text-sm" style={{ color: "#2b476e", textTransform: "uppercase" }}>
              {field.label || `ITEMS TABLE #${tableIndex + 1}`}
            </span>
            <span className="th-td-indicator-pill">
              {columns.length} &lt;th&gt; • {rows.length} &lt;td&gt;
            </span>
          </div>

          <div className="flex-align-gap no-print">
            <button
              type="button"
              className="btn-po-add-row"
              onClick={() => onAddRow?.(field.id)}
              title="Add a new row to this table"
            >
              <Plus size={13} /> Add Item Row
            </button>
            {fields.filter((f) => f.type === "table" || f.type === "po_items").length > 1 && (
              <button
                type="button"
                className="action-icon-btn delete-btn"
                onClick={() => onDeleteField?.(field.id)}
                title="Delete this entire table"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* The Accounting Table */}
        <table className="po-accounting-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.id} style={{ width: col.width || "auto" }}>
                  {col.label}
                </th>
              ))}
              <th className="no-print" style={{ width: "35px" }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => {
              const q = Number(row.qty ?? row.col_qty ?? 0);
              const p = Number(row.unitPrice ?? row.col_rate ?? row.rate ?? 0);
              const rowTotal = q * p;

              return (
                <tr key={row.id || rIdx} className="po-data-row">
                  {columns.map((col) => {
                    const isTotalCol = col.id === "total" || col.id === "col_total" || col.type === "calculated";

                    if (isTotalCol) {
                      const rawVal = row[col.id];
                      // If it's an invoice row with quantity and unit price, calculate q * p
                      // Otherwise if it's an academic marks table or explicit total, show row[col.id]
                      const displayVal = (q > 0 && p > 0)
                        ? formatMoney(rowTotal)
                        : (rawVal !== undefined && rawVal !== "" ? rawVal : "-");

                      return (
                        <td key={col.id} className="text-right font-mono font-bold po-total-cell">
                          <input
                            type="text"
                            className="po-cell-input text-right font-mono font-bold"
                            value={displayVal}
                            onChange={(e) =>
                              onUpdateCell?.(field.id, row.id, col.id, e.target.value, rIdx)
                            }
                          />
                        </td>
                      );
                    }

                    const isQtyCol = col.id === "qty" || col.id === "col_qty";
                    const isPriceCol = col.id === "unitPrice" || col.id === "col_rate" || col.id === "rate";
                    const isItemNoCol = col.id === "itemNo" || col.id === "col_hsn";
                    const cellVal = row[col.id] ?? "";

                    return (
                      <td key={col.id} className={isPriceCol ? "text-right" : isQtyCol ? "text-center" : ""}>
                        <input
                          type={isQtyCol || isPriceCol ? "number" : "text"}
                          className={`po-cell-input ${isPriceCol ? "text-right font-mono" : isQtyCol ? "text-center font-mono" : ""}`}
                          value={cellVal}
                          placeholder={isItemNoCol ? "Item #" : isQtyCol ? "1" : isPriceCol ? "0.00" : "Description..."}
                          onChange={(e) =>
                            onUpdateCell?.(
                              field.id,
                              row.id,
                              col.id,
                              isQtyCol || isPriceCol ? Number(e.target.value) : e.target.value
                            )
                          }
                        />
                      </td>
                    );
                  })}

                  <td className="no-print text-center">
                    <button
                      type="button"
                      className="po-row-del-btn"
                      onClick={() => onDeleteRow?.(field.id, row.id)}
                      title="Delete this row"
                      disabled={rows.length <= 1}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* Blank filler rows */}
            {Array.from({ length: blankCount }).map((_, bIdx) => (
              <tr key={`blank_${bIdx}`} className="po-blank-row">
                {columns.map((c, cIdx) => (
                  <td key={c.id} className={cIdx === columns.length - 1 ? "text-right font-mono text-muted" : ""}>
                    {cIdx === columns.length - 1 ? "-" : <>&nbsp;</>}
                  </td>
                ))}
                <td className="no-print"></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={Math.max(1, columns.length - 2)} className="font-bold text-xs" style={{ background: "#f8fafc" }}>
                Total Items in Table: {rows.length}
              </td>
              <td className="text-right font-bold text-xs" style={{ background: "#f8fafc", color: "#475569" }}>
                Table Subtotal:
              </td>
              <td className="text-right font-bold font-mono text-sm" style={{ background: "#f8fafc", color: "#2b476e" }}>
                {currency} {formatMoney(tableSub)}
              </td>
              <td className="no-print" style={{ background: "#f8fafc" }}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  // 5. Comments & Totals Footer
  const renderPOFooter = (field) => {
    return (
      <div key={field.id} className="po-bottom-grid">
        <div className="po-comments-box">
          <div className="po-grey-header">{field.commentsTitle || "Comments or Special Instructions"}</div>
          <textarea
            className="po-comments-textarea"
            rows={5}
            value={field.comments || ""}
            placeholder="Enter special shipping notes or comments here..."
            onChange={(e) => onUpdateField?.({ ...field, comments: e.target.value })}
          />
        </div>

        <div className="po-totals-box">
          <table className="po-totals-table">
            <tbody>
              <tr>
                <td className="po-calc-label">SUBTOTAL</td>
                <td className="po-calc-value font-mono">{formatMoney(allTablesSubtotal)}</td>
              </tr>
              <tr>
                <td className="po-calc-label">TAX</td>
                <td className="po-calc-value">
                  <input
                    type="number"
                    step="0.01"
                    className="po-calc-input text-right font-mono"
                    value={field.taxAmount ?? 0}
                    placeholder="-"
                    onChange={(e) => onUpdateField?.({ ...field, taxAmount: Number(e.target.value) })}
                  />
                </td>
              </tr>
              <tr>
                <td className="po-calc-label">SHIPPING</td>
                <td className="po-calc-value">
                  <input
                    type="number"
                    step="0.01"
                    className="po-calc-input text-right font-mono"
                    value={field.shippingAmount ?? 0}
                    placeholder="-"
                    onChange={(e) => onUpdateField?.({ ...field, shippingAmount: Number(e.target.value) })}
                  />
                </td>
              </tr>
              <tr>
                <td className="po-calc-label">OTHER</td>
                <td className="po-calc-value">
                  <input
                    type="number"
                    step="0.01"
                    className="po-calc-input text-right font-mono"
                    value={field.otherAmount ?? 0}
                    placeholder="-"
                    onChange={(e) => onUpdateField?.({ ...field, otherAmount: Number(e.target.value) })}
                  />
                </td>
              </tr>
              <tr className="po-grand-total-row">
                <td className="po-calc-total-label">TOTAL</td>
                <td className="po-calc-total-value">
                  <div className="po-total-highlight-cell">
                    <span className="po-currency-sym">{currency}</span>
                    <span className="po-total-num font-mono">{formatMoney(grandTotal)}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 6. Generic Standard Inputs (Full dropdown, radio, checkbox, date support)
  const renderGenericField = (field) => {
    return (
      <div key={field.id} className="po-generic-field-block" style={{ margin: "14px 0", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#ffffff" }}>
        <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#1e3a8a", marginBottom: "6px" }}>
          {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
        
        {field.type === "textarea" ? (
          <textarea
            className="po-cell-input"
            style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 10px", width: "100%", fontSize: "13px" }}
            rows={3}
            value={field.defaultValue || ""}
            placeholder={field.placeholder || "Enter details here..."}
            onChange={(e) => onUpdateField?.({ ...field, defaultValue: e.target.value })}
          />
        ) : field.type === "select" ? (
          <select
            className="po-cell-input font-medium"
            style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 10px", width: "100%", fontSize: "13px", background: "#ffffff" }}
            value={field.defaultValue || ""}
            onChange={(e) => onUpdateField?.({ ...field, defaultValue: e.target.value })}
          >
            <option value="">{field.placeholder || "-- Select an option --"}</option>
            {(field.options || []).map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        ) : field.type === "radio" ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "4px" }}>
            {(field.options || ["Yes", "No"]).map((opt, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#334155", cursor: "pointer" }}>
                <input
                  type="radio"
                  name={`preview_radio_${field.id}`}
                  value={opt}
                  checked={field.defaultValue === opt || (!field.defaultValue && i === 0)}
                  onChange={(e) => onUpdateField?.({ ...field, defaultValue: e.target.value })}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        ) : field.type === "checkbox" ? (
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={Boolean(field.defaultValue)}
              onChange={(e) => onUpdateField?.({ ...field, defaultValue: e.target.checked })}
            />
            <span>{field.label}</span>
          </label>
        ) : field.type === "date" ? (
          <input
            type="date"
            className="po-cell-input"
            style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 10px", width: "100%", fontSize: "13px" }}
            value={field.defaultValue || ""}
            onChange={(e) => onUpdateField?.({ ...field, defaultValue: e.target.value })}
          />
        ) : (
          <input
            type={field.type === "number" ? "number" : "text"}
            className="po-cell-input"
            style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 10px", width: "100%", fontSize: "13px" }}
            value={field.defaultValue || ""}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            onChange={(e) => onUpdateField?.({ ...field, defaultValue: e.target.value })}
          />
        )}
      </div>
    );
  };

  // Count how many tables we have rendered
  let tableCounter = 0;

  return (
    <div className="po-preview-viewport">
      {/* Top Floating Control Bar */}
      <div className="po-preview-top-toolbar no-print">
        {canAccessBuilder && onBackToBuilder && (
          <button
            type="button"
            className="btn-toolbar-back"
            onClick={onBackToBuilder}
          >
            <ArrowLeft size={16} /> Back to Builder
          </button>
        )}

        <div className="po-toolbar-title">
          <span>{isInvoiceDoc ? "Live Purchase Order / Invoice Preview" : (formMetadata?.title || "Live Document Preview")} ({fields.length} dynamic blocks)</span>
        </div>

        <div className="po-toolbar-actions">
          <button
            type="button"
            className="btn-toolbar-print"
            onClick={() => window.print()}
          >
            <Printer size={16} /> Print / Save PDF
          </button>
          <button
            type="button"
            className="btn-toolbar-submit"
            onClick={() => setSubmitted(true)}
          >
            <Send size={16} /> {isInvoiceDoc ? "Finalize Order" : "Submit Form"}
          </button>
        </div>
      </div>

      {/* Actual A4 Sheet Matching Document Style */}
      <div className="po-document-sheet">
        {fields.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
            <h3>Your document is empty</h3>
            <p>Go back to the Builder and add elements or load a template.</p>
          </div>
        ) : (
          <>
            {/* If Non-Invoice Document (e.g. Admission / Application / Survey), render official Form Header */}
            {!isInvoiceDoc && (
              <div className="non-invoice-header" style={{ borderBottom: "2px solid #1e3a8a", paddingBottom: "16px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#1e3a8a", letterSpacing: "-0.5px", textTransform: "uppercase", margin: 0 }}>
                      {formMetadata?.title || "OFFICIAL APPLICATION & REGISTRATION FORM"}
                    </h2>
                    <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px", marginBottom: 0 }}>
                      {formMetadata?.description || "Please review and verify all details before submitting."}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "12px", color: "#475569", flexShrink: 0, paddingLeft: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", marginBottom: "6px" }}>
                      <strong>Date:</strong>
                      <input
                        type="date"
                        className="po-company-line-input inline"
                        style={{ width: "130px", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "2px 6px", fontSize: "12px", background: "#ffffff" }}
                        value={docDate}
                        onChange={(e) => setDocDate(e.target.value)}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                      <strong>Doc ID:</strong>
                      <input
                        type="text"
                        className="po-company-line-input inline"
                        style={{ width: "130px", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "2px 6px", fontSize: "12px", textAlign: "right", fontWeight: "700", color: "#1e3a8a", background: "#ffffff" }}
                        value={docId}
                        onChange={(e) => setDocId(e.target.value)}
                        placeholder="DOC-123456"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DYNAMICALLY MAP OVER EVERY SINGLE FIELD IN CANVAS! */}
            {fields.map((field) => {
              switch (field.type) {
                case "po_header":
                  return renderPOHeader(field);

                case "po_parties":
                  return renderPOParties(field);

                case "po_logistics":
                  return renderPOLogistics(field);

                case "po_items":
                case "table":
                  tableCounter++;
                  return renderTableField(field, tableCounter - 1);

                case "po_footer":
                  return renderPOFooter(field);

                default:
                  return renderGenericField(field);
              }
            })}

            {/* Document Bottom Section: INVOICE vs APPLICATION FORM */}
            {isInvoiceDoc ? (
              <>
                {/* If invoice without po_footer, render financial calculation summary */}
                {!fields.some((f) => f.type === "po_footer") && hasTables && (
                  <div className="po-bottom-grid" style={{ marginTop: "24px" }}>
                    <div className="po-comments-box">
                      <div className="po-grey-header">Comments or Special Instructions</div>
                      <textarea
                        className="po-comments-textarea"
                        rows={4}
                        placeholder="Enter special shipping notes or comments here..."
                      />
                    </div>
                    <div className="po-totals-box">
                      <table className="po-totals-table">
                        <tbody>
                          <tr>
                            <td className="po-calc-label">SUBTOTAL</td>
                            <td className="po-calc-value font-mono">{formatMoney(allTablesSubtotal)}</td>
                          </tr>
                          <tr className="po-grand-total-row">
                            <td className="po-calc-total-label">TOTAL</td>
                            <td className="po-calc-total-value">
                              <div className="po-total-highlight-cell">
                                <span className="po-currency-sym">{currency}</span>
                                <span className="po-total-num font-mono">{formatMoney(allTablesSubtotal)}</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Footer Notice for Invoices */}
                <div className="po-footer-notice">
                  <p>{footerField.contactNotice?.split("\n")[0] || "If you have any questions about this purchase order, please contact"}</p>
                  <p className="po-footer-contact">{footerField.contactNotice?.split("\n")[1] || "[Name, Phone #, E-mail]"}</p>
                </div>
              </>
            ) : (
              /* Official Declaration Box for Non-Invoice Forms (Admission, Application, Survey) */
              <div className="non-invoice-declaration-box" style={{ marginTop: "32px", padding: "18px 20px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#f8fafc" }}>
                <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
                  Applicant Declaration &amp; Certification
                </h4>
                <p style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5", margin: 0 }}>
                  I hereby solemnly declare that all particulars, personal information, and academic records stated above are true, complete, and correct to the best of my knowledge and belief.
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", paddingTop: "14px", borderTop: "1px dashed #cbd5e1", fontSize: "12px", color: "#334155" }}>
                  <span>Date: ________________________</span>
                  <span>Signature of Applicant: ________________________</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation feedback */}
      {submitted && (
        <div className="po-success-modal no-print" onClick={() => setSubmitted(false)}>
          <div className="po-success-dialog" onClick={(e) => e.stopPropagation()}>
            <CheckCircle2 size={40} className="text-green" />
            <h3>{isInvoiceDoc ? "Purchase Order Finalized!" : "Form Submitted Successfully!"}</h3>
            <p>
              {isInvoiceDoc 
                ? `Total: ${currency} ${formatMoney(grandTotal)} recorded across all tables.` 
                : "All applicant particulars and records have been verified and submitted."}
            </p>
            <div className="po-success-actions">
              <button
                type="button"
                className="btn-toolbar-print"
                onClick={() => {
                  setSubmitted(false);
                  window.print();
                }}
              >
                <Printer size={16} /> Print Document
              </button>
              <button
                type="button"
                className="btn-toolbar-back"
                onClick={() => setSubmitted(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
