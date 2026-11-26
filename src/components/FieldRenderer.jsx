import React from "react";
import { 
  Building2, 
  FileSpreadsheet, 
  Calculator, 
  Landmark, 
  PenTool, 
  Plus, 
  Trash2, 
  QrCode, 
  ShieldCheck, 
  CreditCard,
  Columns3,
  Rows3,
  X
} from "lucide-react";

export default function FieldRenderer({
  field,
  mode = "builder", // "builder" | "preview"
  value,
  onChange,
  error,
  onAddColumn,
  onDeleteColumn,
  onUpdateColumn,
  onAddRow,
  onDeleteRow,
  onUpdateCell
}) {
  const isPreview = mode === "preview";
  const disabled = !isPreview;

  // Helper to format currency
  const formatMoney = (amount, currency = "₹") => {
    const num = Number(amount) || 0;
    return `${currency} ${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // =========================================================================
  // 1. DYNAMIC MODULAR TABLE RENDERER (<th> and <td> SUPPORT)
  // =========================================================================
  if (field.type === "table" || field.type === "po_items") {
    const currency = field.currency || "$";

    // Normalize columns
    const rawColumns = field.columns || [
      { id: "itemNo", label: "ITEM #", width: "120px" },
      { id: "description", label: "DESCRIPTION", width: "auto" },
      { id: "qty", label: "QTY", width: "80px" },
      { id: "unitPrice", label: "UNIT PRICE", width: "120px" },
      { id: "total", label: "TOTAL", width: "130px" }
    ];

    const columns = rawColumns.map((col, idx) => {
      if (typeof col === "string") {
        return { id: `col_${idx}`, label: col, type: "text" };
      }
      return col;
    });

    // Normalize rows
    const rows = isPreview 
      ? (value?.rows || field.rows || field.items || []) 
      : (field.rows || field.items || []);

    // Calculate row total dynamically
    const calculateRowTotal = (row) => {
      const q = Number(row.col_qty ?? row.qty) || 0;
      const r = Number(row.col_rate ?? row.unitPrice ?? row.rate) || 0;
      const t = Number(row.col_tax ?? row.taxRate) || 0;
      const base = q * r;
      const tax = base * (t / 100);
      return base + tax;
    };

    // Calculate table totals
    const tableSubtotal = rows.reduce((sum, row) => {
      const q = Number(row.col_qty ?? row.qty) || 0;
      const r = Number(row.col_rate ?? row.rate) || 0;
      return sum + (q * r);
    }, 0);

    const tableTotalTax = rows.reduce((sum, row) => {
      const q = Number(row.col_qty ?? row.qty) || 0;
      const r = Number(row.col_rate ?? row.rate) || 0;
      const t = Number(row.col_tax ?? row.taxRate) || 0;
      return sum + ((q * r) * (t / 100));
    }, 0);

    const tableGrandTotal = tableSubtotal + tableTotalTax;

    // Handle cell change
    const handleCellChange = (rowId, colId, newVal, rowIdx) => {
      if (isPreview) {
        const updatedRows = rows.map((r, idx) => {
          if ((rowId && r.id && r.id === rowId) || (rowIdx !== undefined && idx === rowIdx)) {
            return { ...r, [colId]: newVal };
          }
          return r;
        });
        onChange?.({
          ...value,
          rows: updatedRows,
          subtotal: tableSubtotal,
          totalTax: tableTotalTax,
          grandTotal: tableGrandTotal
        });
      } else {
        onUpdateCell?.(field.id, rowId, colId, newVal, rowIdx);
      }
    };

    // Handle adding row
    const handleAddRowClick = (e) => {
      e?.stopPropagation();
      if (isPreview) {
        const newRow = { id: "row_" + Date.now() };
        columns.forEach((c) => {
          if (c.id === "col_desc") newRow[c.id] = "New Item / Service";
          else if (c.id === "col_qty") newRow[c.id] = 1;
          else if (c.id === "col_rate") newRow[c.id] = 1000;
          else if (c.id === "col_tax") newRow[c.id] = "18";
          else newRow[c.id] = c.type === "number" ? 0 : "";
        });
        onChange?.({ ...value, rows: [...rows, newRow] });
      } else {
        onAddRow?.(field.id);
      }
    };

    // Handle deleting row
    const handleDeleteRowClick = (rowId, rowIdx, e) => {
      e?.preventDefault();
      e?.stopPropagation();
      if (isPreview) {
        const updated = rows.filter((r, idx) => (rowId && r.id ? r.id !== rowId : idx !== rowIdx));
        onChange?.({ ...value, rows: updated });
      } else {
        onDeleteRow?.(field.id, rowId, rowIdx);
      }
    };

    // Handle adding column (th)
    const handleAddColumnClick = (e) => {
      e?.stopPropagation();
      onAddColumn?.(field.id);
    };

    // Handle deleting column (th)
    const handleDeleteColumnClick = (colId, e) => {
      e?.stopPropagation();
      onDeleteColumn?.(field.id, colId);
    };

    return (
      <div className="invoice-table-wrapper" onClick={(e) => !isPreview && e.stopPropagation()}>
        {/* Table Title and Quick Action Bar */}
        <div className="invoice-table-header-bar">
          <div>
            <div className="flex-align-gap">
              <h4 className="invoice-section-title">{field.label || "Goods & Services Table"}</h4>
              <span className="th-td-indicator-pill">
                <strong>&lt;table&gt;</strong> {columns.length} &lt;th&gt; • {rows.length} &lt;td&gt;
              </span>
            </div>
            {field.helperText && <p className="invoice-section-subtitle">{field.helperText}</p>}
          </div>

          <div className="table-header-actions-group">
            {/* Add <th> column button */}
            {!isPreview && (
              <button
                type="button"
                className="btn-add-th"
                onClick={handleAddColumnClick}
                title="Add a new <th> column header to this table"
              >
                <Columns3 size={14} /> + Add &lt;th&gt; Column
              </button>
            )}

            {/* Add <td> row button */}
            <button
              type="button"
              className="btn-add-td"
              onClick={handleAddRowClick}
              title="Add a new row with <td> data cells"
            >
              <Rows3 size={14} /> + Add &lt;td&gt; Row
            </button>
          </div>
        </div>

        {/* The HTML Table */}
        <div className="table-responsive">
          <table className="invoice-data-table">
            <thead>
              <tr>
                <th style={{ width: "36px" }} className="text-center font-bold">#</th>
                {columns.map((col) => (
                  <th key={col.id} style={{ width: col.width || "auto" }} className="table-th-cell">
                    <div className="th-cell-content">
                      <span className="th-badge-tag">&lt;th&gt;</span>
                      {!isPreview ? (
                        <input
                          type="text"
                          className="th-inline-edit-input"
                          value={col.label}
                          onChange={(e) => onUpdateColumn?.(field.id, col.id, { label: e.target.value })}
                          title="Click to rename <th> column"
                        />
                      ) : (
                        <span className="th-text">{col.label}</span>
                      )}
                      {!isPreview && columns.length > 1 && (
                        <button
                          type="button"
                          className="th-delete-col-btn"
                          onClick={(e) => handleDeleteColumnClick(col.id, e)}
                          title="Delete this <th> column"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th style={{ width: "45px" }} className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIdx) => {
                const rowTotal = calculateRowTotal(row);
                return (
                  <tr key={row.id || rowIdx} className="table-data-row">
                    <td className="text-center font-bold text-muted">{rowIdx + 1}</td>
                    {columns.map((col) => {
                      const cellVal = row[col.id] ?? row[col.id.replace("col_", "")] ?? "";
                      const isCalculated = col.type === "calculated" || col.id === "col_total";

                      return (
                        <td key={col.id} className="table-td-cell">
                          {isCalculated ? (
                            <span className="font-bold font-mono text-right block">
                              {formatMoney(rowTotal, currency)}
                            </span>
                          ) : col.type === "select" || col.id === "col_tax" ? (
                            <select
                              className="table-cell-select"
                              value={cellVal || "18"}
                              disabled={disabled}
                              onChange={(e) => handleCellChange(row.id, col.id, e.target.value, rowIdx)}
                            >
                              {(col.options || ["0", "5", "12", "18", "28"]).map((opt, oIdx) => (
                                <option key={oIdx} value={opt}>
                                  {opt}%
                                </option>
                              ))}
                            </select>
                          ) : col.type === "number" || col.id === "col_qty" || col.id === "col_rate" ? (
                            <input
                              type="number"
                              className="table-cell-input text-right font-mono"
                              value={cellVal}
                              disabled={disabled}
                              onChange={(e) => handleCellChange(row.id, col.id, Number(e.target.value), rowIdx)}
                            />
                          ) : (
                            <input
                              type="text"
                              className="table-cell-input"
                              placeholder={`Enter ${col.label}...`}
                              value={cellVal}
                              disabled={disabled}
                              onChange={(e) => handleCellChange(row.id, col.id, e.target.value, rowIdx)}
                            />
                          )}
                        </td>
                      );
                    })}

                    <td className="text-center">
                      <button
                        type="button"
                        className="table-delete-row-btn"
                        title="Delete <td> row"
                        disabled={rows.length <= 1}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteRowClick(row.id, rowIdx, e);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={Math.max(2, Math.floor(columns.length / 2))} className="text-left font-bold">
                  Total Items / Rows: {rows.length}
                </td>
                <td colSpan={Math.max(1, columns.length - Math.floor(columns.length / 2))} className="text-right font-bold text-secondary">
                  Table Subtotal:
                </td>
                <td className="text-right font-bold text-primary font-mono">
                  {formatMoney(tableSubtotal, currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Quick button to append row */}
        <div className="table-bottom-bar">
          <button
            type="button"
            className="btn-add-td-bottom"
            onClick={handleAddRowClick}
          >
            <Plus size={14} /> Add New &lt;td&gt; Row
          </button>
        </div>

        {error && <p className="field-error-message">⚠️ {error}</p>}
      </div>
    );
  }

  // =========================================================================
  // CLASSIC PURCHASE ORDER / INVOICE PREVIEW CARDS (FOR CANVAS BUILDER MODE)
  // =========================================================================

  // PO Header Block
  if (field.type === "po_header") {
    return (
      <div className="po-header-grid builder-card-preview">
        <div className="po-company-info">
          <h3 className="po-company-name-input" style={{ fontSize: "16px", fontWeight: "bold" }}>
            {field.companyName || "[Company Name]"}
          </h3>
          <p className="po-company-line-input" style={{ fontSize: "12px", color: "#444" }}>{field.streetAddress}</p>
          <p className="po-company-line-input" style={{ fontSize: "12px", color: "#444" }}>{field.cityStateZip}</p>
          <p className="po-company-line-input" style={{ fontSize: "12px", color: "#444" }}>Phone: {field.phone}</p>
          <p className="po-company-line-input" style={{ fontSize: "12px", color: "#444" }}>Fax: {field.fax}</p>
          <p className="po-company-line-input" style={{ fontSize: "12px", color: "#444" }}>{field.website}</p>
        </div>
        <div className="po-title-block">
          <h2 className="po-main-title" style={{ fontSize: "22px", margin: "0 0 6px 0" }}>{field.docTitle || "PURCHASE ORDER"}</h2>
          <table className="po-meta-table">
            <tbody>
              <tr>
                <td className="po-meta-label">DATE</td>
                <td className="po-meta-value">{field.date || "9/17/2026"}</td>
              </tr>
              <tr>
                <td className="po-meta-label">PO #</td>
                <td className="po-meta-value">{field.poNumber || "123456"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // PO Parties Block (Vendor & Ship To)
  if (field.type === "po_parties") {
    const vendor = field.vendor || {};
    const shipTo = field.shipTo || {};
    return (
      <div className="po-parties-grid builder-card-preview" style={{ gap: "20px" }}>
        <div className="po-party-col">
          <div className="po-navy-header">VENDOR</div>
          <div className="po-party-body" style={{ minHeight: "90px", fontSize: "12px" }}>
            <p className="font-bold">{vendor.companyName || "[Company Name]"}</p>
            <p>{vendor.contact || "[Contact or Department]"}</p>
            <p>{vendor.streetAddress || "[Street Address]"}</p>
            <p>{vendor.cityStateZip || "[City, ST ZIP]"}</p>
            <p>Phone: {vendor.phone || "(000) 000-0000"}</p>
          </div>
        </div>
        <div className="po-party-col">
          <div className="po-navy-header">SHIP TO</div>
          <div className="po-party-body" style={{ minHeight: "90px", fontSize: "12px" }}>
            <p className="font-bold">{shipTo.name || "[Name]"}</p>
            <p>{shipTo.companyName || "[Company Name]"}</p>
            <p>{shipTo.streetAddress || "[Street Address]"}</p>
            <p>{shipTo.cityStateZip || "[City, ST ZIP]"}</p>
            <p>Phone: {shipTo.phone || "[Phone]"}</p>
          </div>
        </div>
      </div>
    );
  }

  // PO Logistics Strip
  if (field.type === "po_logistics") {
    return (
      <div className="po-logistics-wrapper builder-card-preview">
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
              <td className="text-center" style={{ fontSize: "12px" }}>{field.requisitioner || "—"}</td>
              <td className="text-center" style={{ fontSize: "12px" }}>{field.shipVia || "—"}</td>
              <td className="text-center" style={{ fontSize: "12px" }}>{field.fob || "—"}</td>
              <td className="text-center" style={{ fontSize: "12px" }}>{field.shippingTerms || "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // PO Footer Block (Comments & Totals)
  if (field.type === "po_footer") {
    return (
      <div className="po-bottom-grid builder-card-preview" style={{ gap: "20px" }}>
        <div className="po-comments-box">
          <div className="po-grey-header">{field.commentsTitle || "Comments or Special Instructions"}</div>
          <div className="po-comments-textarea" style={{ minHeight: "70px", color: "#555", fontSize: "11px" }}>
            {field.comments || "Please deliver during business hours. Contact receiving upon arrival."}
          </div>
        </div>
        <div className="po-totals-box">
          <table className="po-totals-table">
            <tbody>
              <tr>
                <td className="po-calc-label">SUBTOTAL</td>
                <td className="po-calc-value">2,325.00</td>
              </tr>
              <tr>
                <td className="po-calc-label">TAX</td>
                <td className="po-calc-value">-</td>
              </tr>
              <tr>
                <td className="po-calc-label">SHIPPING</td>
                <td className="po-calc-value">-</td>
              </tr>
              <tr className="po-grand-total-row">
                <td className="po-calc-total-label">TOTAL</td>
                <td className="po-calc-total-value">
                  <div className="po-total-highlight-cell">
                    <span className="po-currency-sym">{field.currency || "$"}</span>
                    <span className="po-total-num">2,325.00</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. SELLER / BUYER PARTY DETAILS BLOCK
  // =========================================================================
  if (field.type === "party_details") {
    const isSeller = field.partyType === "seller";
    const data = isPreview ? (value || field) : field;

    const handlePartyChange = (key, val) => {
      if (!isPreview) return;
      onChange?.({ ...data, [key]: val });
    };

    return (
      <div className={`invoice-party-box ${isSeller ? "seller-box" : "buyer-box"}`}>
        <div className="party-box-header">
          <div className="flex-align-gap">
            <Building2 size={16} className={isSeller ? "text-indigo" : "text-emerald"} />
            <span className="party-role-tag">{isSeller ? "SUPPLIER / BILLED FROM" : "BILLED TO (CUSTOMER)"}</span>
          </div>
          {field.showGstin && (
            <span className="gstin-badge">
              GSTIN: <strong>{data.gstin || "Unregistered"}</strong>
            </span>
          )}
        </div>

        <div className="party-box-body">
          {isPreview ? (
            <div className="party-inputs-grid">
              <input
                type="text"
                className="party-inline-input font-bold"
                placeholder="Company / Business Name"
                value={data.businessName || ""}
                onChange={(e) => handlePartyChange("businessName", e.target.value)}
              />
              <input
                type="text"
                className="party-inline-input"
                placeholder="GSTIN (e.g. 33AABCT1234A1Z7)"
                value={data.gstin || ""}
                onChange={(e) => handlePartyChange("gstin", e.target.value)}
              />
              <textarea
                rows={2}
                className="party-inline-textarea"
                placeholder="Address line & Pincode"
                value={data.address || ""}
                onChange={(e) => handlePartyChange("address", e.target.value)}
              />
              <div className="party-two-col">
                <input
                  type="text"
                  className="party-inline-input sm"
                  placeholder="State & Code"
                  value={data.state || ""}
                  onChange={(e) => handlePartyChange("state", e.target.value)}
                />
                <input
                  type="text"
                  className="party-inline-input sm"
                  placeholder="Phone"
                  value={data.phone || ""}
                  onChange={(e) => handlePartyChange("phone", e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="party-details-display">
              <h4 className="party-title">{data.businessName}</h4>
              <p className="party-line text-muted">{data.address}</p>
              <div className="party-meta-row">
                <span><strong>State:</strong> {data.state}</span>
                <span><strong>Phone:</strong> {data.phone}</span>
                <span><strong>Email:</strong> {data.email}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. INVOICE META & IRN / QR HEADER
  // =========================================================================
  if (field.type === "invoice_meta") {
    const data = isPreview ? (value || field) : field;

    const handleMetaChange = (key, val) => {
      if (!isPreview) return;
      onChange?.({ ...data, [key]: val });
    };

    return (
      <div className="invoice-meta-banner">
        <div className="invoice-meta-left">
          <div className="invoice-badge-title">
            <FileSpreadsheet size={18} />
            <span>{field.label || "TAX INVOICE"}</span>
          </div>

          <div className="invoice-meta-fields-grid">
            <div className="meta-item">
              <label>Invoice Number:</label>
              {isPreview ? (
                <input
                  type="text"
                  className="meta-input font-bold"
                  value={data.invoiceNumber || ""}
                  onChange={(e) => handleMetaChange("invoiceNumber", e.target.value)}
                />
              ) : (
                <strong className="meta-val font-mono">{data.invoiceNumber}</strong>
              )}
            </div>

            <div className="meta-item">
              <label>Invoice Date:</label>
              {isPreview ? (
                <input
                  type="date"
                  className="meta-input"
                  value={data.invoiceDate || ""}
                  onChange={(e) => handleMetaChange("invoiceDate", e.target.value)}
                />
              ) : (
                <span className="meta-val">{data.invoiceDate}</span>
              )}
            </div>

            {field.showDueDate && (
              <div className="meta-item">
                <label>Due Date:</label>
                {isPreview ? (
                  <input
                    type="date"
                    className="meta-input"
                    value={data.dueDate || ""}
                    onChange={(e) => handleMetaChange("dueDate", e.target.value)}
                  />
                ) : (
                  <span className="meta-val text-red">{data.dueDate}</span>
                )}
              </div>
            )}

            {field.showPoNumber && (
              <div className="meta-item">
                <label>P.O. / Ref No:</label>
                {isPreview ? (
                  <input
                    type="text"
                    className="meta-input"
                    value={data.poNumber || ""}
                    onChange={(e) => handleMetaChange("poNumber", e.target.value)}
                  />
                ) : (
                  <span className="meta-val font-mono">{data.poNumber || "-"}</span>
                )}
              </div>
            )}
          </div>

          {field.showIrn && (
            <div className="irn-display-box">
              <span className="irn-label">IRN (Invoice Reference Number):</span>
              <code className="irn-hash">{data.irnNumber || "Generated automatically upon portal upload"}</code>
            </div>
          )}
        </div>

        <div className="invoice-meta-right">
          <div className="e-invoice-qr-box" title="E-Invoice B2B Digitally Signed QR Code">
            <QrCode size={64} className="qr-icon" />
            <span className="qr-subtext">NIC E-Invoice QR</span>
            <span className="qr-verified">
              <ShieldCheck size={12} /> GST Verified
            </span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. TAX & GRAND TOTAL SUMMARY
  // =========================================================================
  if (field.type === "invoice_summary") {
    const currency = field.currency || "₹";
    const subtotal = Number(field.subtotal) || 30000;
    const isCgstSgst = field.taxMode !== "igst";

    const cgstAmt = isCgstSgst ? subtotal * ((Number(field.cgstPercent) || 9) / 100) : 0;
    const sgstAmt = isCgstSgst ? subtotal * ((Number(field.sgstPercent) || 9) / 100) : 0;
    const igstAmt = !isCgstSgst ? subtotal * ((Number(field.igstPercent) || 18) / 100) : 0;
    const totalTax = cgstAmt + sgstAmt + igstAmt;
    const discount = Number(field.discount) || 0;
    const rawTotal = subtotal + totalTax - discount;
    const grandTotal = field.roundOff ? Math.round(rawTotal) : rawTotal;
    const roundOffDiff = grandTotal - rawTotal;

    return (
      <div className="invoice-summary-card">
        <div className="summary-rows-list">
          <div className="summary-row">
            <span className="summary-label">Taxable Amount (Subtotal):</span>
            <span className="summary-val font-mono">{formatMoney(subtotal, currency)}</span>
          </div>

          {isCgstSgst ? (
            <>
              <div className="summary-row tax-row">
                <span className="summary-label">Central GST ({field.cgstPercent || 9}%):</span>
                <span className="summary-val font-mono">{formatMoney(cgstAmt, currency)}</span>
              </div>
              <div className="summary-row tax-row">
                <span className="summary-label">State GST ({field.sgstPercent || 9}%):</span>
                <span className="summary-val font-mono">{formatMoney(sgstAmt, currency)}</span>
              </div>
            </>
          ) : (
            <div className="summary-row tax-row">
              <span className="summary-label">Integrated GST (IGST {field.igstPercent || 18}%):</span>
              <span className="summary-val font-mono">{formatMoney(igstAmt, currency)}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="summary-row discount-row">
              <span className="summary-label">Discount:</span>
              <span className="summary-val font-mono text-green">- {formatMoney(discount, currency)}</span>
            </div>
          )}

          {field.roundOff && Math.abs(roundOffDiff) > 0.001 && (
            <div className="summary-row text-muted text-xs">
              <span className="summary-label">Round Off:</span>
              <span className="summary-val font-mono">{roundOffDiff > 0 ? "+" : ""}{roundOffDiff.toFixed(2)}</span>
            </div>
          )}

          <div className="summary-row grand-total-row">
            <span className="summary-label">Grand Total (Total Payable):</span>
            <span className="summary-val font-mono">{formatMoney(grandTotal, currency)}</span>
          </div>
        </div>

        {field.showInWords && (
          <div className="summary-in-words">
            <span className="in-words-label">Amount Chargeable in Words:</span>
            <p className="in-words-text">
              Indian Rupees Thirty-Five Thousand Four Hundred Only
            </p>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 5. BANK & PAYMENT DETAILS
  // =========================================================================
  if (field.type === "bank_details") {
    return (
      <div className="invoice-bank-card">
        <div className="bank-card-header">
          <div className="flex-align-gap">
            <Landmark size={18} className="text-primary" />
            <span className="font-bold">{field.label || "Bank & Payment Details"}</span>
          </div>
          <span className="neft-rtgs-badge">NEFT / RTGS / IMPS / UPI</span>
        </div>

        <div className="bank-details-grid">
          <div className="bank-info-col">
            <p><strong>Bank:</strong> {field.bankName || "HDFC Bank"}</p>
            <p><strong>Account Name:</strong> {field.accountName || "Your Company Pvt Ltd"}</p>
            <p><strong>Account Number:</strong> <code className="mono-badge">{field.accountNumber || "50200012345678"}</code></p>
            <p><strong>IFSC Code:</strong> <code className="mono-badge">{field.ifscCode || "HDFC0001234"}</code></p>
            <p><strong>Branch:</strong> {field.branch || "Chennai Main"}</p>
          </div>

          {field.showQrPlaceholder && (
            <div className="bank-upi-qr-col">
              <div className="upi-qr-frame">
                <QrCode size={52} />
                <span className="upi-id-tag">UPI: {field.upiId || "company@bank"}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. TERMS & SIGNATURE BLOCK
  // =========================================================================
  if (field.type === "signature_block") {
    return (
      <div className="invoice-signature-card">
        <div className="signature-terms-left">
          <h5 className="terms-heading">Terms & Conditions:</h5>
          <pre className="terms-pre-text">{field.terms}</pre>
          <p className="declaration-text">
            <strong>Declaration:</strong> {field.declaration}
          </p>
        </div>

        <div className="signature-box-right">
          <span className="for-company">{field.signatoryCompany || "For TechVision Solutions"}</span>
          <div className="signature-blank-line">
            <span className="signature-placeholder">[ Digitally Signed ]</span>
          </div>
          <span className="signatory-title">{field.signatoryDesignation || "Authorized Signatory"}</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. STANDARD INPUTS (Text, Email, Number, Dropdown, Radio, etc.)
  // =========================================================================
  const renderInput = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <input
            type={field.type}
            placeholder={field.placeholder || ""}
            value={isPreview ? (value ?? "") : (field.defaultValue || "")}
            onChange={(e) => isPreview && onChange?.(e.target.value)}
            disabled={disabled}
            className="field-input"
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={isPreview ? (value ?? "") : (field.defaultValue || "")}
            onChange={(e) => isPreview && onChange?.(e.target.value)}
            disabled={disabled}
            className="field-input"
          />
        );

      case "textarea":
        return (
          <textarea
            rows={3}
            placeholder={field.placeholder || ""}
            value={isPreview ? (value ?? "") : (field.defaultValue || "")}
            onChange={(e) => isPreview && onChange?.(e.target.value)}
            disabled={disabled}
            className="field-input field-textarea"
          />
        );

      case "select":
        return (
          <select
            value={isPreview ? (value ?? "") : (field.defaultValue || "")}
            onChange={(e) => isPreview && onChange?.(e.target.value)}
            disabled={disabled}
            className="field-input field-select"
          >
            <option value="">{field.placeholder || "-- Select an option --"}</option>
            {(field.options || []).map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="field-radio-group">
            {(field.options || []).map((opt, idx) => {
              const checked = isPreview ? value === opt : (field.defaultValue === opt || idx === 0);
              return (
                <label key={idx} className="field-radio-label">
                  <input
                    type="radio"
                    name={`radio_${field.id}`}
                    value={opt}
                    checked={checked}
                    onChange={(e) => isPreview && onChange?.(e.target.value)}
                    disabled={disabled}
                    className="field-radio-input"
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        );

      case "checkbox":
        const checked = isPreview ? Boolean(value) : Boolean(field.defaultValue);
        return (
          <label className="field-checkbox-label">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => isPreview && onChange?.(e.target.checked)}
              disabled={disabled}
              className="field-checkbox-input"
            />
            <span className="field-checkbox-text">
              {field.label}
              {field.required && <span className="required-star">*</span>}
            </span>
          </label>
        );

      default:
        return <p className="text-muted">Unsupported field type: {field.type}</p>;
    }
  };

  return (
    <div className="field-renderer-wrapper">
      {field.type !== "checkbox" && (
        <div className="field-header">
          <label className="field-label">
            {field.label}
            {field.required && <span className="required-star">*</span>}
          </label>
        </div>
      )}

      {renderInput()}

      {field.helperText && (
        <p className="field-helper-text">{field.helperText}</p>
      )}

      {error && (
        <p className="field-error-message">⚠️ {error}</p>
      )}
    </div>
  );
}
