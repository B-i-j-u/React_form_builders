import React, { useState } from "react";
import { 
  Printer, 
  Save, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Package, 
  Building2, 
  Truck, 
  Calculator, 
  RotateCcw, 
  Eye, 
  Edit3,
  Copy,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { rbacStore } from "../services/rbacStore";

// Predefined corporate templates for quick testing
const TEMPLATES = {
  electronics: {
    poNumber: "PO-2026-0042",
    poDate: new Date().toISOString().split("T")[0],
    company: {
      name: "Apex Global Technologies Pvt. Ltd.",
      address: "104, Tech Park Boulevard, OMR Phase II",
      cityStateZip: "Chennai, TN 600096",
      phone: "+91 (044) 2899-4400",
      fax: "+91 (044) 2899-4401",
      website: "www.apextech-erp.com"
    },
    vendor: {
      name: "Global Silicon Semiconductors Ltd.",
      contact: "Acct: Vivek Narayanan (Supply Division)",
      address: "88, Industrial Electronics Corridor",
      cityStateZip: "Bengaluru, KA 560100",
      phone: "+91 98401 22334",
      fax: "sales@globalsilicon.in"
    },
    shipTo: {
      name: "Senthil Nathan / Stores Incharge",
      company: "Apex Global Technologies Pvt. Ltd.",
      address: "Warehouse Bay 4, OMR Tech Park",
      cityStateZip: "Chennai, TN 600096",
      phone: "+91 98400 12345"
    },
    logistics: {
      requisitioner: "Senthil Nathan (Manager)",
      shipVia: "Blue Dart Air Express",
      fob: "Destination",
      shippingTerms: "Net 30 Days"
    },
    items: [
      { id: "1", itemNo: "PRD-101", description: "Dell XPS 15 High-Performance Developer Laptops (32GB RAM / 1TB SSD)", qty: 2, unitPrice: 125000 },
      { id: "2", itemNo: "PRD-102", description: "Logitech MX Master 3S Wireless Bluetooth Mice with Bolt Receiver", qty: 5, unitPrice: 8499 },
      { id: "3", itemNo: "ACC-882", description: "USB-C Multiport Thunderbolt 4 Docking Stations", qty: 2, unitPrice: 14500 }
    ],
    taxPercent: 18,
    shippingFee: 1500,
    otherFee: 0,
    comments: "1. Please send two original copies of your tax invoice with this PO number quoted.\n2. Deliver all units with standard OEM manufacturer warranty certificates.\n3. Goods must be delivered within 5 business days of PO receipt.\n4. Payment will be released via RTGS within Net 30 Days after warehouse physical inspection.",
    contactFooter: "Rajesh Kumar (Director), +91 98400 12345, finance@apextech.com"
  },
  samplePO: {
    poNumber: "123456",
    poDate: "2026-11-26",
    company: {
      name: "[Company Name]",
      address: "[Street Address]",
      cityStateZip: "[City, ST ZIP]",
      phone: "Phone: (000) 000-0000",
      fax: "Fax: (000) 000-0000",
      website: "Website:"
    },
    vendor: {
      name: "[Company Name]",
      contact: "[Contact or Department]",
      address: "[Street Address]",
      cityStateZip: "[City, ST ZIP]",
      phone: "Phone: (000) 000-0000",
      fax: "Fax: (000) 000-0000"
    },
    shipTo: {
      name: "[Name]",
      company: "[Company Name]",
      address: "[Street Address]",
      cityStateZip: "[City, ST ZIP]",
      phone: "[Phone]"
    },
    logistics: {
      requisitioner: "John Doe",
      shipVia: "Ground Freight",
      fob: "Destination",
      shippingTerms: "Net 30"
    },
    items: [
      { id: "1", itemNo: "[23423423]", description: "Product XYZ", qty: 15, unitPrice: 150.00 },
      { id: "2", itemNo: "[45845845]", description: "Product ABC", qty: 1, unitPrice: 75.00 }
    ],
    taxPercent: 0,
    shippingFee: 0,
    otherFee: 0,
    comments: "Comments or Special Instructions: Standard delivery terms apply. Please quote PO# on all correspondence.",
    contactFooter: "[Name, Phone #, E-mail]"
  },
  blank: {
    poNumber: `PO-${Date.now().toString().slice(-6)}`,
    poDate: new Date().toISOString().split("T")[0],
    company: {
      name: "",
      address: "",
      cityStateZip: "",
      phone: "",
      fax: "",
      website: ""
    },
    vendor: {
      name: "",
      contact: "",
      address: "",
      cityStateZip: "",
      phone: "",
      fax: ""
    },
    shipTo: {
      name: "",
      company: "",
      address: "",
      cityStateZip: "",
      phone: ""
    },
    logistics: {
      requisitioner: "",
      shipVia: "Standard Surface Cargo",
      fob: "Destination",
      shippingTerms: "Net 30 Days"
    },
    items: [
      { id: "1", itemNo: "", description: "", qty: 1, unitPrice: 0 }
    ],
    taxPercent: 18,
    shippingFee: 0,
    otherFee: 0,
    comments: "",
    contactFooter: ""
  }
};

export default function PurchaseOrderBuilder({ currentUser, onNavigateToModule, onBackToFormStudio }) {
  const [poData, setPoData] = useState(() => JSON.parse(JSON.stringify(TEMPLATES.samplePO)));
  const [activeTab, setActiveTab] = useState("editor"); // "editor" | "preview"
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Available Inventory Products from Live Database (Strictly filter APPROVED items only)
  const modules = rbacStore.getModules();
  const productsModule = modules.find((m) => m.id === "mod_products");
  const availableInventory = (productsModule?.records || []).filter((r) => r.status === "approved");

  // Update Top-level nested fields
  const handleNestedChange = (section, field, value) => {
    setPoData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Update Direct fields
  const handleDirectChange = (field, value) => {
    setPoData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Add Item Row
  const handleAddItem = () => {
    const newItem = {
      id: "item_" + Date.now(),
      itemNo: "",
      description: "",
      qty: 1,
      unitPrice: 0
    };
    setPoData((prev) => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Add from Inventory
  const handleAddFromInventory = (product) => {
    const unitPriceNum = Number(String(product.fld_p3 || "0").replace(/[^0-9.-]+/g, "")) || 0;
    const newItem = {
      id: "item_" + Date.now(),
      itemNo: product.id || `PRD-${Date.now().toString().slice(-3)}`,
      description: product.fld_p1 || "Inventory Item",
      qty: 1,
      unitPrice: unitPriceNum
    };
    setPoData((prev) => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Update Item field
  const handleItemChange = (id, field, value) => {
    setPoData((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    }));
  };

  // Remove Item
  const handleRemoveItem = (id) => {
    if (poData.items.length <= 1) {
      alert("Purchase order must have at least 1 line item.");
      return;
    }
    setPoData((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id)
    }));
  };

  // Load Preset Template
  const handleLoadTemplate = (key) => {
    if (TEMPLATES[key]) {
      setPoData(JSON.parse(JSON.stringify(TEMPLATES[key])));
    }
  };

  // Auto Calculations
  const subtotal = poData.items.reduce((sum, it) => {
    const qty = Number(it.qty) || 0;
    const price = Number(it.unitPrice) || 0;
    return sum + (qty * price);
  }, 0);

  const taxAmount = (subtotal * (Number(poData.taxPercent) || 0)) / 100;
  const shippingCharge = Number(poData.shippingFee) || 0;
  const otherAdjustment = Number(poData.otherFee) || 0;
  const grandTotal = subtotal + taxAmount + shippingCharge + otherAdjustment;

  // Print Function
  const handlePrint = () => {
    window.print();
  };

  // Save as official PO in mod_purchase_orders database
  const handleSaveToPoModule = () => {
    if (!poData.poNumber.trim()) {
      alert("Please enter a PO Number.");
      return;
    }
    if (!poData.vendor.name.trim()) {
      alert("Please provide Vendor Name.");
      return;
    }

    // Save record into mod_purchase_orders in rbacStore
    rbacStore.addRecord(
      "mod_purchase_orders",
      {
        fld_po1: poData.poNumber,
        fld_po2: poData.vendor.name,
        fld_po3: grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        fld_po4: poData.poDate,
        fld_po5: poData.logistics.shippingTerms || "Net 30 Days"
      },
      currentUser
    );

    setSaveSuccessMsg(`PO #${poData.poNumber} has been officially recorded in Purchase Orders Workspace!`);
    setTimeout(() => setSaveSuccessMsg(""), 5000);
  };

  // Copy PO summary to clipboard
  const handleCopySummary = () => {
    const summary = `PURCHASE ORDER: ${poData.poNumber}
Date: ${poData.poDate}
Vendor: ${poData.vendor.name}
Total Items: ${poData.items.length}
Grand Total: ₹ ${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
Requisitioner: ${poData.logistics.requisitioner}
Terms: ${poData.logistics.shippingTerms}`;

    navigator.clipboard.writeText(summary);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER & ACTION CONTROLS (Hidden on Print) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs print:hidden space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {onBackToFormStudio && (
              <button
                type="button"
                onClick={onBackToFormStudio}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer shrink-0"
                title="Return to Drag & Drop Form Studio"
              >
                <ArrowLeft size={14} />
                <span>Form Studio</span>
              </button>
            )}
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Purchase Order &amp; Invoice Builder
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  ISO Corporate Template
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate, calculate, customize, and print verified purchase order invoices matching standard corporate layouts.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center">
              <button
                type="button"
                onClick={() => setActiveTab("editor")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "editor"
                    ? "bg-white text-indigo-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Edit3 size={13} />
                <span>Form Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-white text-indigo-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Eye size={13} />
                <span>Full Sheet Preview</span>
              </button>
            </div>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Print directly or save as clean PDF document"
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>

            {/* Save into ERP Purchase Orders Database */}
            <button
              type="button"
              onClick={handleSaveToPoModule}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Save directly into Purchase Orders module"
            >
              <Save size={15} />
              <span>Save to PO Workspace</span>
            </button>
          </div>
        </div>

        {/* Templates Bar & Quick Load Presets */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider">Load Template:</span>
            <button
              type="button"
              onClick={() => handleLoadTemplate("samplePO")}
              className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              Standard PO (As in Image)
            </button>
            <button
              type="button"
              onClick={() => handleLoadTemplate("electronics")}
              className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Tech / Hardware PO
            </button>
            <button
              type="button"
              onClick={() => handleLoadTemplate("blank")}
              className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Clear / Blank PO
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              <Copy size={13} />
              <span>{copiedMsg ? "Copied to Clipboard!" : "Copy PO Summary"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold shadow-xs animate-in fade-in print:hidden">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          {onNavigateToModule && (
            <button
              type="button"
              onClick={() => onNavigateToModule("mod_purchase_orders")}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 hover:underline cursor-pointer ml-3 shrink-0"
            >
              <span>View in PO Module</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* 2. MAIN WORKSPACE: EDITOR & LIVE SHEET PREVIEW */}
      <div className={`grid grid-cols-1 ${activeTab === "editor" ? "xl:grid-cols-12" : ""} gap-4`}>
        {/* ========================================================================= */}
        {/* LEFT COLUMN: INTERACTIVE FORM CONTROLS (Only visible in editor mode) */}
        {/* ========================================================================= */}
        {activeTab === "editor" && (
          <div className="xl:col-span-5 space-y-4 print:hidden">
            {/* Box 1: PO Reference & Dates */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2 flex items-center gap-1.5">
                <FileText size={14} className="text-indigo-600" />
                1. Order Number &amp; Date
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">PO # (Invoice ID)</label>
                  <input
                    type="text"
                    value={poData.poNumber}
                    onChange={(e) => handleDirectChange("poNumber", e.target.value)}
                    className="w-full text-xs font-mono font-bold px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. 123456"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Order Date</label>
                  <input
                    type="date"
                    value={poData.poDate}
                    onChange={(e) => handleDirectChange("poDate", e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Box 2: Vendor Details */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2 flex items-center gap-1.5">
                <Building2 size={14} className="text-indigo-600" />
                2. Vendor Details
              </h3>
              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Vendor Company Name"
                  value={poData.vendor.name}
                  onChange={(e) => handleNestedChange("vendor", "name", e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="text"
                  placeholder="Contact Person or Department"
                  value={poData.vendor.contact}
                  onChange={(e) => handleNestedChange("vendor", "contact", e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="text"
                  placeholder="Vendor Street Address"
                  value={poData.vendor.address}
                  onChange={(e) => handleNestedChange("vendor", "address", e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City, ST ZIP"
                    value={poData.vendor.cityStateZip}
                    onChange={(e) => handleNestedChange("vendor", "cityStateZip", e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={poData.vendor.phone}
                    onChange={(e) => handleNestedChange("vendor", "phone", e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Box 3: Ship To & Logistics */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2 flex items-center gap-1.5">
                <Truck size={14} className="text-indigo-600" />
                3. Ship To &amp; Shipping Logistics
              </h3>
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Recipient Name"
                    value={poData.shipTo.name}
                    onChange={(e) => handleNestedChange("shipTo", "name", e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={poData.shipTo.company}
                    onChange={(e) => handleNestedChange("shipTo", "company", e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-slate-300"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={poData.shipTo.address}
                  onChange={(e) => handleNestedChange("shipTo", "address", e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-slate-300"
                />

                <div className="grid grid-cols-2 gap-2 pt-1 border-t">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block">Requisitioner</label>
                    <input
                      type="text"
                      value={poData.logistics.requisitioner}
                      onChange={(e) => handleNestedChange("logistics", "requisitioner", e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border rounded-lg border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block">Ship Via</label>
                    <input
                      type="text"
                      value={poData.logistics.shipVia}
                      onChange={(e) => handleNestedChange("logistics", "shipVia", e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border rounded-lg border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block">F.O.B.</label>
                    <input
                      type="text"
                      value={poData.logistics.fob}
                      onChange={(e) => handleNestedChange("logistics", "fob", e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border rounded-lg border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block">Shipping Terms</label>
                    <input
                      type="text"
                      value={poData.logistics.shippingTerms}
                      onChange={(e) => handleNestedChange("logistics", "shippingTerms", e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border rounded-lg border-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Box 4: Line Items Editor */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Package size={14} className="text-indigo-600" />
                  4. Line Items ({poData.items.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-indigo-200/60"
                >
                  <Plus size={13} />
                  <span>+ Add Item</span>
                </button>
              </div>

              {/* Quick Add from Approved Live Inventory */}
              {availableInventory.length > 0 ? (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                  <div className="font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Quick Insert from Approved Inventory ({availableInventory.length}):
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Active Catalog
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {availableInventory.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAddFromInventory(p)}
                        className="px-2 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded text-[11px] font-medium text-slate-700 hover:text-indigo-700 transition-colors cursor-pointer truncate max-w-[220px] shadow-2xs"
                        title={`Click to insert ${p.fld_p1} (Price: ₹${p.fld_p3}, Stock: ${p.fld_p4 || 'N/A'})`}
                      >
                        + {p.fld_p1} (₹{p.fld_p3})
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-200/60 text-xs text-amber-800 flex items-center justify-between">
                  <span>No approved inventory items yet. Products must be approved in Products &amp; Inventory first.</span>
                </div>
              )}

              {/* Items List Fields */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {poData.items.map((item, idx) => (
                  <div key={item.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Item #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Item Code / SKU</label>
                        <input
                          type="text"
                          value={item.itemNo}
                          onChange={(e) => handleItemChange(item.id, "itemNo", e.target.value)}
                          className="w-full text-xs font-mono px-2 py-1.5 bg-white border border-slate-300 rounded"
                          placeholder="e.g. 23423423"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                          className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded"
                          placeholder="Product description..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleItemChange(item.id, "qty", e.target.value)}
                          className="w-full text-xs font-bold px-2 py-1.5 bg-white border border-slate-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Unit Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, "unitPrice", e.target.value)}
                          className="w-full text-xs font-bold px-2 py-1.5 bg-white border border-slate-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Line Total</label>
                        <div className="text-xs font-bold text-indigo-700 bg-indigo-50/70 border border-indigo-100 rounded px-2 py-1.5 truncate">
                          {((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 5: Tax, Shipping & Special Instructions */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2 flex items-center gap-1.5">
                <Calculator size={14} className="text-indigo-600" />
                5. Tax &amp; Instructions
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block">Tax / GST %</label>
                  <input
                    type="number"
                    value={poData.taxPercent}
                    onChange={(e) => handleDirectChange("taxPercent", e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border rounded-lg border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block">Shipping Charge</label>
                  <input
                    type="number"
                    value={poData.shippingFee}
                    onChange={(e) => handleDirectChange("shippingFee", e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border rounded-lg border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block">Other / Adjust</label>
                  <input
                    type="number"
                    value={poData.otherFee}
                    onChange={(e) => handleDirectChange("otherFee", e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border rounded-lg border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Comments or Special Instructions</label>
                <textarea
                  rows={3}
                  value={poData.comments}
                  onChange={(e) => handleDirectChange("comments", e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Special instructions, delivery terms, payment conditions..."
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Footer Contact Information</label>
                <input
                  type="text"
                  value={poData.contactFooter}
                  onChange={(e) => handleDirectChange("contactFooter", e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-slate-300"
                  placeholder="[Name, Phone #, E-mail]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: PIXEL-PERFECT PURCHASE ORDER SHEET (EXACT MATCH TO IMAGE) */}
        {/* ========================================================================= */}
        <div className={`${activeTab === "editor" ? "xl:col-span-7" : "max-w-4xl mx-auto w-full"}`}>
          {/* Printable A4 White Sheet */}
          <div className="bg-white border border-slate-300 shadow-xl rounded-lg p-6 sm:p-10 font-sans text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full">
            
            {/* ROW 1: HEADER & TITLE */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6">
              {/* Left: Company Details */}
              <div className="space-y-0.5 text-xs text-slate-700">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  {poData.company.name || "[Company Name]"}
                </h1>
                <p>{poData.company.address || "[Street Address]"}</p>
                <p>{poData.company.cityStateZip || "[City, ST ZIP]"}</p>
                <p>{poData.company.phone || "Phone: (000) 000-0000"}</p>
                <p>{poData.company.fax || "Fax: (000) 000-0000"}</p>
                <p>{poData.company.website || "Website:"}</p>
              </div>

              {/* Right: Big "PURCHASE ORDER" & Info Box */}
              <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                <h2 className="text-3xl font-extrabold text-[#5c85ad] tracking-wide uppercase mb-3">
                  PURCHASE ORDER
                </h2>
                
                {/* Date & PO Box */}
                <table className="border-collapse border border-slate-400 text-xs text-right w-48">
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 bg-slate-50 px-2 py-1 font-bold text-slate-700 text-left">
                        DATE
                      </td>
                      <td className="border border-slate-400 px-3 py-1 font-mono">
                        {poData.poDate}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-50 px-2 py-1 font-bold text-slate-700 text-left">
                        PO #
                      </td>
                      <td className="border border-slate-400 px-3 py-1 font-mono font-bold text-slate-900">
                        {poData.poNumber || "[123456]"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ROW 2: VENDOR & SHIP TO ADDRESS BOXES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              {/* Vendor Box */}
              <div className="border border-slate-400">
                <div className="bg-[#2c4d75] text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                  VENDOR
                </div>
                <div className="p-3 text-xs text-slate-800 space-y-0.5 min-h-[95px]">
                  <p className="font-bold">{poData.vendor.name || "[Company Name]"}</p>
                  <p>{poData.vendor.contact || "[Contact or Department]"}</p>
                  <p>{poData.vendor.address || "[Street Address]"}</p>
                  <p>{poData.vendor.cityStateZip || "[City, ST ZIP]"}</p>
                  <p>{poData.vendor.phone || "Phone: (000) 000-0000"}</p>
                  {poData.vendor.fax && <p>{poData.vendor.fax}</p>}
                </div>
              </div>

              {/* Ship To Box */}
              <div className="border border-slate-400">
                <div className="bg-[#2c4d75] text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                  SHIP TO
                </div>
                <div className="p-3 text-xs text-slate-800 space-y-0.5 min-h-[95px]">
                  <p className="font-bold">{poData.shipTo.name || "[Name]"}</p>
                  <p>{poData.shipTo.company || "[Company Name]"}</p>
                  <p>{poData.shipTo.address || "[Street Address]"}</p>
                  <p>{poData.shipTo.cityStateZip || "[City, ST ZIP]"}</p>
                  <p>{poData.shipTo.phone || "[Phone]"}</p>
                </div>
              </div>
            </div>

            {/* ROW 3: LOGISTICS / SHIPPING SPECIFICATION BAR */}
            <div className="my-4 border border-slate-400">
              <table className="w-full border-collapse text-xs text-center">
                <thead>
                  <tr className="bg-[#2c4d75] text-white font-bold uppercase tracking-wider">
                    <th className="border-r border-slate-400 py-1 px-2 w-1/4">REQUISITIONER</th>
                    <th className="border-r border-slate-400 py-1 px-2 w-1/4">SHIP VIA</th>
                    <th className="border-r border-slate-400 py-1 px-2 w-1/4">F.O.B.</th>
                    <th className="py-1 px-2 w-1/4">SHIPPING TERMS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-slate-800">
                    <td className="border-r border-slate-400 py-1.5 px-2 font-medium">{poData.logistics.requisitioner || "—"}</td>
                    <td className="border-r border-slate-400 py-1.5 px-2">{poData.logistics.shipVia || "—"}</td>
                    <td className="border-r border-slate-400 py-1.5 px-2">{poData.logistics.fob || "—"}</td>
                    <td className="py-1.5 px-2">{poData.logistics.shippingTerms || "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ROW 4: LINE ITEMS TABLE (EXACT ACCOUNTING GRID) */}
            <div className="my-4 border border-slate-400">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#2c4d75] text-white font-bold uppercase tracking-wider text-center">
                    <th className="border-r border-slate-400 py-1 px-2 w-[18%]">ITEM #</th>
                    <th className="border-r border-slate-400 py-1 px-3 text-left w-[44%]">DESCRIPTION</th>
                    <th className="border-r border-slate-400 py-1 px-2 w-[10%]">QTY</th>
                    <th className="border-r border-slate-400 py-1 px-2 w-[14%] text-right">UNIT PRICE</th>
                    <th className="py-1 px-2 w-[14%] text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Real Items */}
                  {poData.items.map((it) => {
                    const rowTotal = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);
                    return (
                      <tr key={it.id} className="border-b border-slate-300">
                        <td className="border-r border-slate-400 py-1.5 px-2 font-mono text-center text-slate-800">
                          {it.itemNo || "—"}
                        </td>
                        <td className="border-r border-slate-400 py-1.5 px-3 text-slate-900 font-medium">
                          {it.description || "—"}
                        </td>
                        <td className="border-r border-slate-400 py-1.5 px-2 text-center text-slate-800">
                          {it.qty}
                        </td>
                        <td className="border-r border-slate-400 py-1.5 px-2 text-right font-mono text-slate-800">
                          {Number(it.unitPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono font-semibold text-slate-900">
                          {rowTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Empty Spacer Rows (Exactly matching user's template visual grid) */}
                  {Array.from({ length: Math.max(0, 10 - poData.items.length) }).map((_, i) => (
                    <tr key={`empty_${i}`} className="border-b border-slate-200 h-6">
                      <td className="border-r border-slate-400 py-1 px-2"></td>
                      <td className="border-r border-slate-400 py-1 px-3"></td>
                      <td className="border-r border-slate-400 py-1 px-2"></td>
                      <td className="border-r border-slate-400 py-1 px-2"></td>
                      <td className="py-1 px-2 text-right text-slate-400 font-mono">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ROW 5: COMMENTS & FINANCIAL TOTALS CALCULATION */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-3 items-start">
              {/* Left (7 cols): Comments or Special Instructions */}
              <div className="md:col-span-7 border border-slate-400">
                <div className="bg-slate-300 text-slate-800 text-xs font-bold px-3 py-1">
                  Comments or Special Instructions
                </div>
                <div className="p-3 text-xs text-slate-700 min-h-[110px] whitespace-pre-line leading-relaxed">
                  {poData.comments || "No special instructions provided."}
                </div>
              </div>

              {/* Right (5 cols): Subtotal, Tax, Shipping, Total */}
              <div className="md:col-span-5 border border-slate-400">
                <table className="w-full border-collapse text-xs">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="border-r border-slate-400 px-3 py-1 font-bold text-slate-700 uppercase bg-slate-50">
                        SUBTOTAL
                      </td>
                      <td className="px-3 py-1 text-right font-mono font-bold text-slate-900">
                        {subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="border-r border-slate-400 px-3 py-1 font-bold text-slate-700 uppercase bg-slate-50">
                        TAX {poData.taxPercent > 0 ? `(${poData.taxPercent}%)` : ""}
                      </td>
                      <td className="px-3 py-1 text-right font-mono text-slate-800">
                        {taxAmount > 0 ? taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "-"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="border-r border-slate-400 px-3 py-1 font-bold text-slate-700 uppercase bg-slate-50">
                        SHIPPING
                      </td>
                      <td className="px-3 py-1 text-right font-mono text-slate-800">
                        {shippingCharge > 0 ? shippingCharge.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "-"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="border-r border-slate-400 px-3 py-1 font-bold text-slate-700 uppercase bg-slate-50">
                        OTHER
                      </td>
                      <td className="px-3 py-1 text-right font-mono text-slate-800">
                        {otherAdjustment !== 0 ? otherAdjustment.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "-"}
                      </td>
                    </tr>
                    {/* Highlighted Grand Total Bar */}
                    <tr className="bg-[#b3c7db] text-slate-900 font-extrabold text-sm">
                      <td className="border-r border-slate-400 px-3 py-1.5 uppercase tracking-wide">
                        TOTAL
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono">
                        $ {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ROW 6: FOOTER CONTACT */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-600">
              <p>
                If you have any questions about this purchase order, please contact{" "}
                <strong className="text-slate-800 font-semibold">{poData.contactFooter || "[Name, Phone #, E-mail]"}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}