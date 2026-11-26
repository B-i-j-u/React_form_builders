import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  Layers, 
  CheckCircle2, 
  PlusCircle, 
  Eye, 
  Copy,
  Sparkles,
  Receipt,
  ArrowRight,
  FileSpreadsheet
} from "lucide-react";
import { AVAILABLE_FIELDS } from "../constants/fieldTypes";
import { rbacStore } from "../services/rbacStore";
import PurchaseOrderBuilder from "./PurchaseOrderBuilder";

export default function ModuleStudio({ currentUser, onModuleCreated, onSelectModuleView, initialMode = "form_builder" }) {
  const [studioMode, setStudioMode] = useState(initialMode); // "form_builder" | "po_invoice"
  const [modules, setModules] = useState(() => rbacStore.getModules());
  const [selectedModuleId, setSelectedModuleId] = useState("new"); // "new" | module_id
  
  // Current editing module state
  const [moduleName, setModuleName] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [fields, setFields] = useState([]);
  const [isOverCanvas, setIsOverCanvas] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Select an existing module to view/edit
  const handleSelectModule = (modId) => {
    if (modId === "po_invoice") {
      setStudioMode("po_invoice");
      return;
    }
    setStudioMode("form_builder");
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
    if (window.confirm("Are you sure you want to delete this module and all its records?")) {
      const updated = rbacStore.deleteModule(modId);
      setModules(updated);
      setSelectedModuleId("new");
      setModuleName("");
      setModuleDesc("");
      setFields([]);
      onModuleCreated?.(null);
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
      // Update existing module (Name, Description & Fields!)
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

  return (
    <div className="p-4 md:p-5 space-y-4 max-w-7xl mx-auto">
      {/* Studio Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tier 1: Brand & Studio Mode Switcher */}
        <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/60 via-white to-indigo-50/30">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/20">
              <Layers size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  ERP Dynamic Module Studio
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Zero Code
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Drag &amp; drop form fields to create complete ERP modules or use corporate templates.
              </p>
            </div>
          </div>

          {/* Studio Tool Switcher Pills: Form Field Studio vs PO & Invoice Builder */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setStudioMode("form_builder")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                studioMode === "form_builder"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers size={14} className={studioMode === "form_builder" ? "text-indigo-600" : "text-slate-400"} />
              <span>Form Fields Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setStudioMode("po_invoice")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                studioMode === "po_invoice"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Receipt size={14} />
              <span>PO &amp; Invoice Builder</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Sub-toolbar for Form Builder (Module Selector, Save, Open Table, Delete) */}
        {studioMode === "form_builder" && (
          <div className="px-4 sm:px-6 py-2.5 bg-slate-50/70 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 min-w-0">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {selectedModuleId === "new" ? "New Custom Module" : `Editing: ${moduleName || "Workspace"}`}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium shrink-0">
                {fields.length} field{fields.length === 1 ? "" : "s"} configured
              </span>
            </div>

            {/* Actions Toolbar: Select + Save + Open + Delete (Always in 1 balanced horizontal row) */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs cursor-pointer min-w-[220px]"
                value={selectedModuleId}
                onChange={(e) => handleSelectModule(e.target.value)}
              >
                <option value="new">+ Create Brand New Module</option>
                <option value="po_invoice">🧾 PO &amp; Invoice Builder (Template)</option>
                <optgroup label="Edit Existing Modules:">
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      📦 {m.name} ({m.fields?.length || 0} fields)
                    </option>
                  ))}
                </optgroup>
              </select>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer whitespace-nowrap active:scale-95"
                onClick={handleSaveModule}
              >
                <Save size={14} />
                <span>Save &amp; Publish</span>
              </button>

              {selectedModuleId !== "new" && (
                <>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                    onClick={() => onSelectModuleView?.(selectedModuleId)}
                    title="View records and table for this module"
                  >
                    <Eye size={13} className="text-indigo-600" />
                    <span>Open Table</span>
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 text-rose-600 font-semibold text-xs px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                    onClick={() => handleDeleteModule(selectedModuleId)}
                    title="Delete this module"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Dynamic Content: Form Builder or PO Invoice Builder */}
      {studioMode === "po_invoice" ? (
        <PurchaseOrderBuilder
          currentUser={currentUser}
          onNavigateToModule={onSelectModuleView}
          onBackToFormStudio={() => setStudioMode("form_builder")}
        />
      ) : (
        /* Main Studio 2-Column Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Component Toolbox (4 cols) */}
          <aside className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 space-y-3">
            <div className="border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-800">Drag &amp; Drop Fields</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Drag into the canvas or click <span className="font-bold text-indigo-600">+</span>
              </p>
            </div>

            <div className="space-y-1.5">
              {AVAILABLE_FIELDS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.type)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-400 hover:shadow-xs transition-all cursor-grab active:cursor-grabbing group"
                  >
                    <div className="text-slate-400 group-hover:text-slate-600">
                      <GripVertical size={15} />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{item.label}</div>
                      <div className="text-xs text-slate-400 truncate">{item.description}</div>
                    </div>
                    <button
                      type="button"
                      className="w-7 h-7 rounded-full bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                      onClick={() => addFieldByType(item.type)}
                      title="Add to form"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Ready-Made Corporate Template Card */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Specialized Tool
              </div>
              <button
                type="button"
                onClick={() => setStudioMode("po_invoice")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 to-blue-50/50 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Receipt size={16} />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                      Purchase Order &amp; Invoice
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      Corporate PO Template Builder
                    </div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
              💡 <strong>Zero Code ERP:</strong> Any module you design here is automatically backed by database storage, dynamic entry forms, and role-based permissions.
            </div>
          </aside>

        {/* Right Column: Form Canvas (8 cols) */}
        <main className="lg:col-span-8 space-y-3.5">
          {/* Module Identity Box */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Module Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  placeholder="e.g. Products, Office Expenses, Vendor Register"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Module Description
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  placeholder="Briefly state what this module manages..."
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Canvas Drop Zone */}
          <div
            className={`min-h-[380px] rounded-xl border-2 border-dashed p-4 transition-all ${
              isOverCanvas
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-slate-300 bg-white"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3 shadow-xs">
                  <PlusCircle size={32} />
                </div>
                <h3 className="text-base font-bold text-slate-800">Drag &amp; Drop Form Fields Here</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Drag any input type from the left toolbox or click <strong className="text-indigo-600">+</strong> to build your custom module form.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-bold text-slate-500">
                  <span>Form Fields ({fields.length})</span>
                  <span className="font-normal text-slate-400">Order here reflects the live entry form</span>
                </div>

                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                          {field.type} Field
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          onClick={() => duplicateField(field.id)}
                          title="Duplicate field"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          onClick={() => deleteField(field.id)}
                          title="Delete field"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Field Properties Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      <div className="md:col-span-6 space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Field Label / Title
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-1.5 bg-slate-50/70 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                          value={field.label}
                          onChange={(e) => updateField(field.id, "label", e.target.value)}
                          placeholder="e.g. Product Name, Expense Date..."
                        />
                      </div>

                      <div className="md:col-span-4 space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Placeholder Hint
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-1.5 bg-slate-50/70 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                          value={field.placeholder || ""}
                          onChange={(e) => updateField(field.id, "placeholder", e.target.value)}
                          placeholder="Hint text for user..."
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-700">
                          <span>Required</span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={!!field.required}
                            onClick={() => updateField(field.id, "required", !field.required)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              field.required ? "bg-indigo-600" : "bg-slate-300"
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                field.required ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Options editor */}
                    {field.type === "select" && (
                      <div className="pt-2 border-t border-slate-100">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Dropdown Options (comma separated):
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-1.5 bg-slate-50/70 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
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
      )}
    </div>
  );
}
