// ============================================================================
// ENTERPRISE ERP DATA STORE — FULLY DYNAMIC MODULES
// No hardcoded modules. User creates their own modules from Module Studio.
// Dynamic Module Linking & 1-Click Record Conversion Engine
// ============================================================================

// Start with ZERO modules — user creates their own from scratch
export const INITIAL_MODULES = [];

// Core Fields for 3-Way Matching Purchase Invoice (Hybrid Standard)
export const DEFAULT_INVOICE_FIELDS = [
  { id: "inv_num", type: "text", label: "Supplier Invoice #", placeholder: "e.g. INV-2026-001", required: true },
  { id: "inv_date", type: "date", label: "Invoice Date", required: true },
  { id: "po_ref", type: "text", label: "Purchase Order (PO #)", placeholder: "e.g. PUR-998", required: true },
  { id: "grn_ref", type: "text", label: "GRN Receipt #", placeholder: "e.g. GRN-932", required: true },
  { id: "vendor_name", type: "text", label: "Supplier / Vendor Name", placeholder: "Vendor Name", required: true },
  { id: "product_name", type: "text", label: "Product / Item Description", placeholder: "Product name", required: true },
  { id: "billed_qty", type: "number", label: "Billed Quantity", placeholder: "10", required: true },
  { id: "unit_rate", type: "number", label: "Unit Rate (₹)", placeholder: "50000", required: true },
  { id: "subtotal", type: "number", label: "Subtotal (₹)", placeholder: "Auto-computed", required: false },
  { id: "gst_rate", type: "select", label: "GST %", options: ["0%", "5%", "12%", "18%", "28%"], defaultValue: "18%" },
  { id: "gst_amount", type: "number", label: "GST Tax Amount (₹)", placeholder: "Auto-computed", required: false },
  { id: "grand_total", type: "number", label: "Grand Total (₹)", placeholder: "Auto-computed", required: false },
  { id: "match_status", type: "select", label: "3-Way Match Status", options: ["3-Way Matched ✓", "Quantity Mismatch ⚠️", "Rate Mismatch ⚠️", "Pending Verification", "On Hold / Dispute"], defaultValue: "Pending Verification" },
  { id: "payment_status", type: "select", label: "Payment Status", options: ["Unpaid", "Partially Paid", "Paid"], defaultValue: "Unpaid" }
];

// No pre-configured links — links are created dynamically by user
export const INITIAL_MODULE_LINKS = [];

export const INITIAL_USERS = [
  {
    id: "usr_admin",
    fullName: "Rajesh Kumar (Admin)",
    email: "admin@erp.com",
    password: "123",
    role: "admin",
    allowedModuleIds: ["*"],
    canApprove: true,
    department: "Executive Management"
  },
  {
    id: "usr_manager",
    fullName: "Senthil Nathan (Manager)",
    email: "manager@erp.com",
    password: "123",
    role: "user",
    allowedModuleIds: ["mod_purchase", "mod_grn", "mod_invoice", "purchase", "GRN", "Purchase Invoice"],
    canApprove: true,
    department: "Procurement & Store Operations"
  },
  {
    id: "usr_staff",
    fullName: "Priya Sundaram (Staff)",
    email: "staff@erp.com",
    password: "123",
    role: "user",
    allowedModuleIds: ["mod_purchase", "mod_grn", "mod_invoice", "purchase", "GRN", "Purchase Invoice"],
    canApprove: false,
    department: "Storekeeper / Warehouse Gate"
  },
  {
    id: "usr_hr",
    fullName: "Ramesh Kumar (HR)",
    email: "hr@erp.com",
    password: "123",
    role: "user",
    allowedModuleIds: ["mod_hr", "mod_attendance", "mod_payroll"],
    canApprove: true,
    department: "Human Resources"
  }
];

const STORAGE_KEYS = {
  MODULES: "erp_interconnected_modules_v12",
  USERS: "erp_interconnected_users_v12",
  LINKS: "erp_dynamic_module_links_v12"
};

function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(e);
  }
}

export const rbacStore = {
  // Modules Management
  getModules() {
    // Load from storage — no filter, allow ANY user-created module
    let mods = loadStorage(STORAGE_KEYS.MODULES, INITIAL_MODULES);
    let changed = false;

    // Auto-migrate "GRM" to "GRN" if user had named it GRM
    mods = mods.map((m) => {
      if (m.name && m.name.trim().toUpperCase() === "GRM") {
        changed = true;
        const updatedRecords = (m.records || []).map((r) => {
          if (r.id && r.id.startsWith("GRM-")) {
            return { ...r, id: r.id.replace(/^GRM-/, "GRN-") };
          }
          return r;
        });
        return {
          ...m,
          name: "GRN",
          description: m.description && m.description.includes("GRM") 
            ? m.description.replace(/GRM/g, "GRN") 
            : (m.description || "Goods Receipt Note (GRN)"),
          records: updatedRecords
        };
      }
      return m;
    });

    // Auto-provision "Purchase Invoice" module if not present
    const hasInvoiceMod = mods.some(
      (m) => m.id === "mod_invoice" || (m.name && m.name.toLowerCase().includes("invoice"))
    );
    if (!hasInvoiceMod) {
      changed = true;
      const invoiceMod = {
        id: "mod_invoice",
        name: "Purchase Invoice",
        description: "Supplier Tax Invoices, 3-Way Matching (PO vs GRN vs Invoice) & Payment Verification",
        icon: "Receipt",
        createdAt: new Date().toISOString().split("T")[0],
        fields: DEFAULT_INVOICE_FIELDS,
        records: [
          {
            id: "INV-2026-001",
            inv_num: "INV-2026-001",
            inv_date: "2026-11-27",
            po_ref: "PUR-998",
            grn_ref: "GRN-932",
            vendor_name: "Dell Technologies India Ltd",
            product_name: "Dell Latitude Laptop 16GB",
            billed_qty: "10",
            unit_rate: "40000",
            subtotal: "400000",
            gst_rate: "18%",
            gst_amount: "72000",
            grand_total: "472000",
            match_status: "3-Way Matched ✓",
            payment_status: "Unpaid",
            status: "approved",
            submittedBy: "Priya Sundaram (Staff)",
            submittedAt: "27 Nov 2026, 11:30 AM"
          }
        ]
      };
      mods.push(invoiceMod);
    }

    if (changed) {
      saveStorage(STORAGE_KEYS.MODULES, mods);
    }
    return mods;
  },
  saveModules(mods) {
    saveStorage(STORAGE_KEYS.MODULES, mods);
  },
  getModuleById(id) {
    return this.getModules().find((m) => m.id === id) || null;
  },

  // Create a brand new module (called from Module Studio)
  createModule(data) {
    const mods = this.getModules();
    const newMod = {
      id: "mod_" + Date.now(),
      name: data.name,
      description: data.description || "",
      icon: data.icon || "Layers",
      createdAt: new Date().toISOString().split("T")[0],
      fields: data.fields || [],
      records: []
    };
    const updated = [...mods, newMod];
    this.saveModules(updated);
    return newMod;
  },

  // Update an existing module's name/description/fields
  updateModule(moduleId, data) {
    let mods = this.getModules();
    mods = mods.map((m) => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        name: data.name !== undefined ? data.name : m.name,
        description: data.description !== undefined ? data.description : m.description,
        fields: data.fields !== undefined ? data.fields : m.fields
      };
    });
    this.saveModules(mods);
    return mods;
  },

  // Delete a module and all its records
  deleteModule(moduleId) {
    const mods = this.getModules().filter((m) => m.id !== moduleId);
    this.saveModules(mods);
    return mods;
  },

  // Dynamic Module Links (No-Code Linking Engine)
  getModuleLinks() {
    let links = loadStorage(STORAGE_KEYS.LINKS, INITIAL_MODULE_LINKS);
    let changed = false;
    links = links.map((l) => {
      if (l.name && l.name.includes("GRM")) {
        changed = true;
        return {
          ...l,
          name: l.name.replace(/GRM/g, "GRN")
        };
      }
      return l;
    });

    // Auto-link GRN -> Purchase Invoice if both exist and link not yet created
    const mods = loadStorage(STORAGE_KEYS.MODULES, INITIAL_MODULES);
    const grnMod = mods.find((m) => m.id === "mod_grn" || (m.name && m.name.trim().toUpperCase() === "GRN"));
    const invMod = mods.find((m) => m.id === "mod_invoice" || (m.name && m.name.toLowerCase().includes("invoice")));

    if (grnMod && invMod) {
      const existingLink = links.find(
        (l) => l.sourceModuleId === grnMod.id && l.targetModuleId === invMod.id
      );
      if (!existingLink) {
        changed = true;
        const grnFields = grnMod.fields || [];
        const prodField = grnFields.find(f => f.label.toLowerCase().includes("product") || f.id.includes("product") || f.type === "text");
        const qtyField = grnFields.find(f => f.label.toLowerCase().includes("accept") || f.label.toLowerCase().includes("receiv") || f.type === "number");
        const poRefField = grnFields.find(f => f.label.toLowerCase().includes("po") || f.label.toLowerCase().includes("ref"));
        const vendorField = grnFields.find(f => f.label.toLowerCase().includes("vendor") || f.label.toLowerCase().includes("supplier"));

        const fieldMappings = {
          inv_num: "__rec_id__",
          po_ref: poRefField?.id || "__rec_id__",
          grn_ref: "__rec_id__",
          vendor_name: vendorField?.id || "",
          product_name: prodField?.id || "",
          billed_qty: qtyField?.id || "",
          unit_rate: "",
          match_status: ""
        };

        links.push({
          id: "link_grn_invoice",
          name: `${grnMod.name} ➔ ${invMod.name}`,
          sourceModuleId: grnMod.id,
          targetModuleId: invMod.id,
          active: true,
          fieldMappings
        });
      }
    }

    if (changed) {
      saveStorage(STORAGE_KEYS.LINKS, links);
    }
    return links;
  },
  saveModuleLink(linkData) {
    const links = this.getModuleLinks();
    const existingIdx = links.findIndex(
      (l) => l.sourceModuleId === linkData.sourceModuleId && l.targetModuleId === linkData.targetModuleId
    );
    if (existingIdx !== -1) {
      links[existingIdx] = { ...links[existingIdx], ...linkData, active: true };
    } else {
      links.push({
        id: "link_" + Date.now(),
        active: true,
        ...linkData
      });
    }
    saveStorage(STORAGE_KEYS.LINKS, links);
    return links;
  },
  getLinksForModule(moduleId) {
    const links = this.getModuleLinks();
    return links.filter((l) => l.sourceModuleId === moduleId && l.active !== false);
  },
  deleteModuleLink(sourceModuleId, targetModuleId) {
    const links = this.getModuleLinks().filter(
      (l) => !(l.sourceModuleId === sourceModuleId && l.targetModuleId === targetModuleId)
    );
    saveStorage(STORAGE_KEYS.LINKS, links);
    return links;
  },
  getLinkBetween(sourceModuleId, targetModuleId) {
    return this.getModuleLinks().find(
      (l) => l.sourceModuleId === sourceModuleId && l.targetModuleId === targetModuleId
    ) || null;
  },

  // 1-CLICK DYNAMIC RECORD CONVERTER (Fully Dynamic for ANY Custom or Built-in Modules)
  convertRecordToTarget(sourceModId, targetModId, sourceRecordId, user, fieldOverrides = {}) {
    let mods = this.getModules();
    const sourceMod = mods.find((m) => m.id === sourceModId);
    const targetMod = mods.find((m) => m.id === targetModId);
    if (!sourceMod || !targetMod) {
      return { success: false, error: "Module not found", mods };
    }

    const sourceRec = (sourceMod.records || []).find((r) => r.id === sourceRecordId);
    if (!sourceRec) {
      return { success: false, error: "Source record not found", mods };
    }

    const prefix = targetMod.name.substring(0, 3).toUpperCase().replace(/\s/g, "") || "REC";
    const newTargetId = prefix + "-" + Math.floor(100 + Math.random() * 900);

    // Look up saved custom field mappings between these two modules
    const link = this.getLinkBetween(sourceModId, targetModId);
    const fieldMappings = link?.fieldMappings || {};

    // Auto-map matching fields from source record
    const newRecordData = {
      id: newTargetId,
      status: "approved",
      submittedBy: user?.fullName || "1-Click Link Engine",
      submittedAt: new Date().toLocaleString(),
      linked_source_id: sourceRec.id,
      linked_source_module: sourceMod.name
    };

    // For every field in the target module, pull from overrides, custom manual mapping, source record, or fallback
    (targetMod.fields || []).forEach((tf) => {
      // 1. Direct user override from modal form (strictly honor whatever user input, even if empty string "")
      if (fieldOverrides && tf.id in fieldOverrides) {
        newRecordData[tf.id] = fieldOverrides[tf.id];
        return;
      }

      // 2. Custom manual field mapping configured in Dynamic Module Link
      if (tf.id in fieldMappings) {
        const mappedSourceKey = fieldMappings[tf.id];
        if (mappedSourceKey === "__rec_id__") {
          newRecordData[tf.id] = sourceRec.id;
        } else if (mappedSourceKey && sourceRec[mappedSourceKey] !== undefined) {
          newRecordData[tf.id] = sourceRec[mappedSourceKey];
        } else {
          // Explicitly mapped to "" (Don't Map / Leave Empty) -> keep empty!
          newRecordData[tf.id] = "";
        }
        return;
      }

      // 3. Fallback only if this target field was never mapped:
      if (sourceRec[tf.id] !== undefined && sourceRec[tf.id] !== "") {
        newRecordData[tf.id] = sourceRec[tf.id];
      } else {
        const match = (sourceMod.fields || []).find((sf) =>
          sf.id === tf.id ||
          sf.label.toLowerCase() === tf.label.toLowerCase()
        );

        if (match && sourceRec[match.id] !== undefined && sourceRec[match.id] !== "") {
          newRecordData[tf.id] = sourceRec[match.id];
        } else if (
          tf.label.toLowerCase().includes("ref") || 
          tf.label.toLowerCase().includes("order") || 
          tf.label.toLowerCase().includes("linked") || 
          tf.label.toLowerCase().includes("po")
        ) {
          // If it's a reference field in target, link source ID
          newRecordData[tf.id] = sourceRec.po_num || sourceRec.id;
        } else {
          newRecordData[tf.id] = tf.defaultValue || (tf.type === "number" ? "" : "");
        }
      }
    });

    // 1. Add new record to target module
    mods = mods.map((m) => {
      if (m.id !== targetModId) return m;
      return { ...m, records: [newRecordData, ...(m.records || [])] };
    });

    // 2. Mark source record with link info
    mods = mods.map((m) => {
      if (m.id !== sourceModId) return m;
      return {
        ...m,
        records: (m.records || []).map((r) => {
          if (r.id === sourceRecordId) {
            return {
              ...r,
              [`linked_to_${targetModId}`]: newTargetId,
              last_linked_target_name: targetMod.name
            };
          }
          return r;
        })
      };
    });

    this.saveModules(mods);
    return { success: true, mods, createdRecord: newRecordData, targetModule: targetMod };
  },

  // Record CRUD Operations
  addRecord(moduleId, recordData, user) {
    let mods = this.getModules();
    const mod = mods.find((m) => m.id === moduleId);
    // Use module name prefix or fallback to "REC"
    const prefix = mod ? mod.name.substring(0, 3).toUpperCase().replace(/\s/g, "") : "REC";
    const newId = prefix + "-" + Math.floor(100 + Math.random() * 900);
    const isDirectApproved = user?.role === "admin" || user?.canApprove === true;

    const newRec = {
      id: newId,
      ...recordData,
      status: isDirectApproved ? "approved" : "pending",
      submittedBy: user?.fullName || "System User",
      submittedAt: new Date().toLocaleString()
    };

    mods = mods.map((m) => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        records: [newRec, ...(m.records || [])]
      };
    });

    // If adding a GRN that references a PO, update the PO delivery status
    if (moduleId === "mod_grn") {
      const acceptedQty = Number(recordData.grn_accepted_qty || recordData.grn_received_qty || 0);
      const linkedPoNum = recordData.grn_po_ref || "";

      if (linkedPoNum) {
        mods = mods.map((m) => {
          if (m.id !== "mod_purchase") return m;
          const updatedRecords = (m.records || []).map((po) => {
            if (po.po_num === linkedPoNum || po.id === linkedPoNum) {
              const currentRcvd = Number(po.po_received_qty || 0);
              const totalRcvd = currentRcvd + acceptedQty;
              const orderQty = Number(po.po_qty || 0);
              return {
                ...po,
                po_received_qty: String(totalRcvd),
                po_delivery_status: totalRcvd >= orderQty ? "Fully Received" : "Partially Received",
                linked_grn_id: newId
              };
            }
            return po;
          });
          return { ...m, records: updatedRecords };
        });
      }
    }

    this.saveModules(mods);
    return mods;
  },

  updateRecord(moduleId, recordId, updatedData, user) {
    let mods = this.getModules();
    const targetModule = mods.find((m) => m.id === moduleId);
    if (!targetModule) return mods;

    const oldRec = (targetModule.records || []).find((r) => r.id === recordId);
    if (!oldRec) return mods;

    const mergedRec = {
      ...oldRec,
      ...updatedData,
      id: recordId,
      updatedBy: user?.fullName || "System User",
      updatedAt: new Date().toLocaleString()
    };

    mods = mods.map((m) => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        records: (m.records || []).map((r) => (r.id === recordId ? mergedRec : r))
      };
    });

    this.saveModules(mods);
    return mods;
  },

  updateRecordStatus(moduleId, recordId, status, reviewerName) {
    let mods = this.getModules();
    mods = mods.map((m) => {
      if (m.id !== moduleId) return m;
      const updatedRecords = (m.records || []).map((r) => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          status,
          reviewedBy: reviewerName,
          reviewedAt: new Date().toLocaleString()
        };
      });
      return { ...m, records: updatedRecords };
    });

    this.saveModules(mods);
    return mods;
  },

  deleteRecord(moduleId, recordId) {
    let mods = this.getModules();
    mods = mods.map((m) => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        records: (m.records || []).filter((r) => r.id !== recordId)
      };
    });
    this.saveModules(mods);
    return mods;
  },

  // Users Management
  getUsers() {
    let users = loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    // Ensure Ramesh Kumar (HR) is included
    if (!users.some((u) => u.email === "hr@erp.com" || u.id === "usr_hr")) {
      users.push({
        id: "usr_hr",
        fullName: "Ramesh Kumar (HR)",
        email: "hr@erp.com",
        password: "123",
        role: "user",
        allowedModuleIds: ["mod_hr", "mod_attendance", "mod_payroll"],
        canApprove: true,
        department: "Human Resources"
      });
      saveStorage(STORAGE_KEYS.USERS, users);
    }
    return users;
  },
  saveUsers(users) {
    saveStorage(STORAGE_KEYS.USERS, users);
  },

  // 3-Way Matching Engine: Compares PO vs GRN vs Invoice
  calculateThreeWayMatch(poRec, grnRec, invData) {
    const poQty = Number(poRec?.po_qty || poRec?.quantity || poRec?.qantity || 0);
    const grnAccepted = Number(grnRec?.grn_accepted_qty || grnRec?.accepted_qty || grnRec?.grn_received_qty || 0);
    const billedQty = Number(invData?.billed_qty || invData?.qty || 0);

    const poRate = Number(poRec?.po_unit_price || poRec?.unit_rate || poRec?.price || poRec?.number_amount || 0);
    const billedRate = Number(invData?.unit_rate || invData?.rate || 0);

    const hasAllThree = (poQty > 0 || poRec) && (grnAccepted > 0 || grnRec) && billedQty > 0;

    if (!hasAllThree) {
      return {
        status: "Pending Verification",
        isMatch: false,
        poQty,
        grnAccepted,
        billedQty,
        poRate,
        billedRate,
        discrepancy: null
      };
    }

    // Check Quantity Mismatch
    if (grnAccepted > 0 && billedQty > grnAccepted) {
      return {
        status: "Quantity Mismatch ⚠️",
        isMatch: false,
        poQty,
        grnAccepted,
        billedQty,
        poRate,
        billedRate,
        discrepancy: `Billed Quantity (${billedQty}) exceeds GRN Accepted Quantity (${grnAccepted})!`
      };
    }

    // Check Rate Mismatch
    if (poRate > 0 && billedRate > poRate) {
      return {
        status: "Rate Mismatch ⚠️",
        isMatch: false,
        poQty,
        grnAccepted,
        billedQty,
        poRate,
        billedRate,
        discrepancy: `Billed Unit Rate (₹${billedRate.toLocaleString()}) exceeds PO Rate (₹${poRate.toLocaleString()})!`
      };
    }

    return {
      status: "3-Way Matched ✓",
      isMatch: true,
      poQty,
      grnAccepted,
      billedQty,
      poRate,
      billedRate,
      discrepancy: null
    };
  },

  // Mark an invoice record as Paid
  markInvoicePaid(moduleId, recordId, user) {
    let mods = this.getModules();
    mods = mods.map((m) => {
      if (m.id !== moduleId) return m;
      const updated = (m.records || []).map((r) => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          payment_status: "Paid",
          paidAt: new Date().toLocaleString(),
          paidBy: user?.fullName || "Finance Admin"
        };
      });
      return { ...m, records: updated };
    });
    this.saveModules(mods);
    return mods;
  },
  addUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: "usr_" + Date.now(),
      fullName: userData.fullName.trim(),
      email: userData.email.trim(),
      password: userData.password.trim(),
      role: "user",
      allowedModuleIds: userData.allowedModuleIds || ["mod_purchase", "mod_grn"],
      canApprove: !!userData.canApprove,
      department: userData.department?.trim() || "Operations"
    };
    const updated = [...users, newUser];
    this.saveUsers(updated);
    return newUser;
  },
  updateUser(userId, updatedData) {
    const users = this.getUsers().map((u) => {
      if (u.id !== userId) return u;
      return {
        ...u,
        fullName: updatedData.fullName !== undefined ? updatedData.fullName.trim() : u.fullName,
        email: updatedData.email !== undefined ? updatedData.email.trim() : u.email,
        password: updatedData.password !== undefined ? updatedData.password.trim() : u.password,
        department: updatedData.department !== undefined ? updatedData.department.trim() : u.department,
        allowedModuleIds: updatedData.allowedModuleIds !== undefined ? updatedData.allowedModuleIds : u.allowedModuleIds,
        canApprove: updatedData.canApprove !== undefined ? !!updatedData.canApprove : u.canApprove
      };
    });
    this.saveUsers(users);
    return users;
  },
  deleteUser(userId) {
    const users = this.getUsers().filter((u) => u.id !== userId);
    this.saveUsers(users);
    return users;
  },
  authenticate(email, password) {
    const users = this.getUsers();
    const found = users.find(
      (u) =>
        u.email.toLowerCase().trim() === email.toLowerCase().trim() &&
        u.password === password
    );
    return found || null;
  },

  resetAll() {
    saveStorage(STORAGE_KEYS.MODULES, INITIAL_MODULES);
    saveStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    saveStorage(STORAGE_KEYS.LINKS, INITIAL_MODULE_LINKS);
  }
};
