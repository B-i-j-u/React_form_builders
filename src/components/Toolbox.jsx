import React, { useState } from "react";
import { AVAILABLE_FIELDS } from "../constants/fieldTypes";
import { Plus, GripVertical, Table, ReceiptText, SlidersHorizontal, Sparkles } from "lucide-react";

export default function Toolbox({ onAddField, onOpenTypeSafeAiModal }) {
  const [selectedCategory, setSelectedCategory] = useState("all"); // "all" | "invoice" | "standard"

  const handleDragStart = (e, fieldType) => {
    e.dataTransfer.setData("application/field-type", fieldType);
    e.dataTransfer.effectAllowed = "copy";
  };

  const invoiceTools = AVAILABLE_FIELDS.filter((f) => f.category === "invoice");
  const standardTools = AVAILABLE_FIELDS.filter((f) => f.category === "standard");

  const filteredFields = selectedCategory === "all"
    ? AVAILABLE_FIELDS
    : AVAILABLE_FIELDS.filter((f) => f.category === selectedCategory);

  return (
    <aside className="toolbox-panel">
      <div className="panel-header">
        <h2 className="panel-title">Component Toolbox</h2>
        <p className="panel-subtitle">Drag to canvas or click <strong>+</strong></p>

        {/* Quick TypeSafe AI Banner */}
        <div 
          className="toolbox-ai-banner" 
          onClick={onOpenTypeSafeAiModal}
          title="Open TypeSafe AI generator"
        >
          <div className="ai-icon-pulse">
            <Sparkles size={16} />
          </div>
          <div className="ai-banner-text">
            <span className="ai-banner-title">✨ TypeSafe AI Generator</span>
            <span className="ai-banner-desc">Prompt to Form • Zod Guaranteed</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="toolbox-category-pills">
          <button
            type="button"
            className={`pill-btn ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`pill-btn highlight ${selectedCategory === "invoice" ? "active" : ""}`}
            onClick={() => setSelectedCategory("invoice")}
          >
            🧾 E-Invoice & Tables
          </button>
          <button
            type="button"
            className={`pill-btn ${selectedCategory === "standard" ? "active" : ""}`}
            onClick={() => setSelectedCategory("standard")}
          >
            📝 Inputs
          </button>
        </div>
      </div>

      <div className="toolbox-items-list">
        {/* If 'all' is selected, show neat section dividers */}
        {selectedCategory === "all" ? (
          <>
            <div className="toolbox-section-divider">
              <Table size={13} />
              <span>E-INVOICE &amp; TABLE TOOLS</span>
            </div>
            {invoiceTools.map((item) => renderToolboxCard(item, handleDragStart, onAddField))}

            <div className="toolbox-section-divider" style={{ marginTop: "14px" }}>
              <SlidersHorizontal size={13} />
              <span>STANDARD FORM INPUTS</span>
            </div>
            {standardTools.map((item) => renderToolboxCard(item, handleDragStart, onAddField))}
          </>
        ) : (
          filteredFields.map((item) => renderToolboxCard(item, handleDragStart, onAddField))
        )}
      </div>

      <div className="toolbox-hint">
        💡 <strong>E-Invoice Ready:</strong> Drag the <strong>Items Table</strong> &amp; <strong>Tax Summary</strong> to auto-calculate totals with GST!
      </div>
    </aside>
  );
}

function renderToolboxCard(item, handleDragStart, onAddField) {
  const Icon = item.icon;
  const isInvoiceTool = item.category === "invoice";

  return (
    <div
      key={item.type}
      draggable
      onDragStart={(e) => handleDragStart(e, item.type)}
      className={`toolbox-item ${isInvoiceTool ? "invoice-item-card" : ""}`}
      title="Drag onto Canvas or click + to add"
    >
      <div className="toolbox-item-handle">
        <GripVertical size={16} />
      </div>
      <div className={`toolbox-item-icon ${isInvoiceTool ? "invoice-icon" : ""}`}>
        <Icon size={18} />
      </div>
      <div className="toolbox-item-info">
        <div className="flex-align-between">
          <span className="toolbox-item-title">{item.label}</span>
          {isInvoiceTool && <span className="invoice-tag">E-Invoice</span>}
        </div>
        <span className="toolbox-item-desc">{item.description}</span>
      </div>
      <button
        type="button"
        onClick={() => onAddField(item.type)}
        className="toolbox-add-btn"
        title="Add to form"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
