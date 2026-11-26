// ============================================================================
// ENTERPRISE ERP DATA STORE WITH REAL-TIME INTERCONNECTED MODULES & DATA SYNC
// ============================================================================

export const INITIAL_MODULES = [
  // 1. PRODUCTS & INVENTORY
  {
    id: "mod_inventory",
    name: "Products & Inventory",
    description: "Live warehouse inventory levels, unit pricing, and stock status tracking",
    icon: "Package",
    createdAt: "2026-11-20",
    fields: [
      { id: "p_code", type: "text", label: "Product SKU / Code", placeholder: "e.g. PRD-101", required: true },
      { id: "p_name", type: "text", label: "Product Name", placeholder: "e.g. Dell Latitude Laptop 16GB", required: true },
      { id: "p_category", type: "select", label: "Category", options: ["IT Hardware", "Electronics", "Office Furniture", "Stationery"], required: true, defaultValue: "IT Hardware" },
      { id: "p_unit_price", type: "number", label: "Selling Price (₹)", placeholder: "65000", required: true },
      { id: "p_stock_qty", type: "number", label: "Available Stock (Units)", placeholder: "25", required: true },
      { id: "p_status", type: "select", label: "Stock Health", options: ["In Stock", "Low Stock", "Out of Stock"], required: true, defaultValue: "In Stock" }
    ],
    records: [
      {
        id: "PRD-101",
        p_code: "PRD-101",
        p_name: "Dell Latitude Laptop 16GB",
        p_category: "IT Hardware",
        p_unit_price: "65,000",
        p_stock_qty: "25",
        p_status: "In Stock",
        status: "approved",
        submittedBy: "Rajesh Kumar (Admin)",
        submittedAt: "20 Nov 2026, 10:00 AM"
      },
      {
        id: "PRD-102",
        p_code: "PRD-102",
        p_name: "Logitech MX Master Wireless Mouse",
        p_category: "Electronics",
        p_unit_price: "8,500",
        p_stock_qty: "60",
        p_status: "In Stock",
        status: "approved",
        submittedBy: "Senthil Nathan (Manager)",
        submittedAt: "21 Nov 2026, 02:30 PM"
      },
      {
        id: "PRD-103",
        p_code: "PRD-103",
        p_name: "Ergonomic High-Back Office Chair",
        p_category: "Office Furniture",
        p_unit_price: "14,500",
        p_stock_qty: "15",
        p_status: "Low Stock",
        status: "approved",
        submittedBy: "Rajesh Kumar (Admin)",
        submittedAt: "22 Nov 2026, 11:15 AM"
      }
    ]
  },

  // 2. PURCHASE ORDERS (Auto-adds stock to Inventory & Expense to Transactions)
  {
    id: "mod_purchase",
    name: "Purchase Orders",
    description: "Vendor procurement orders (⚡ Auto-Sync: Adds stock to Inventory & logs Expense to Cashbook)",
    icon: "Receipt",
    createdAt: "2026-11-21",
    fields: [
      { id: "po_num", type: "text", label: "PO / Order #", placeholder: "e.g. PO-2026-0091", required: true },
      { id: "po_vendor", type: "text", label: "Supplier / Vendor Name", placeholder: "e.g. Global Silicon Semiconductor Ltd", required: true },
      { id: "po_product", type: "text", label: "Purchased Product Name", placeholder: "e.g. Dell Latitude Laptop 16GB", required: true },
      { id: "po_qty", type: "number", label: "Order Quantity (Units)", placeholder: "10", required: true },
      { id: "po_unit_price", type: "number", label: "Unit Cost (₹)", placeholder: "52000", required: true },
      { id: "po_total", type: "number", label: "Total PO Value (₹)", placeholder: "520000", required: true },
      { id: "po_date", type: "date", label: "Order Date", required: true },
      { id: "po_payment_terms", type: "select", label: "Payment Terms", options: ["Net 30 Days", "Immediate Advance", "Cash on Delivery"], required: true, defaultValue: "Net 30 Days" }
    ],
    records: [
      {
        id: "PO-881",
        po_num: "PO-2026-0091",
        po_vendor: "Global Silicon Semiconductor Ltd",
        po_product: "Dell Latitude Laptop 16GB",
        po_qty: "10",
        po_unit_price: "52,000",
        po_total: "5,20,000",
        po_date: "2026-11-20",
        po_payment_terms: "Net 30 Days",
        status: "approved",
        submittedBy: "Rajesh Kumar (Admin)",
        submittedAt: "20 Nov 2026, 03:00 PM"
      },
      {
        id: "PO-882",
        po_num: "PO-2026-0092",
        po_vendor: "Nexus Office Systems & Network",
        po_product: "Ergonomic High-Back Office Chair",
        po_qty: "5",
        po_unit_price: "11,000",
        po_total: "55,000",
        po_date: "2026-11-25",
        po_payment_terms: "Immediate Advance",
        status: "pending",
        submittedBy: "Senthil Nathan (Manager)",
        submittedAt: "25 Nov 2026, 11:30 AM"
      }
    ]
  },

  // 3. SALES & INVOICING (Auto-deducts stock from Inventory & logs Income to Transactions)
  {
    id: "mod_sales",
    name: "Sales & Invoicing",
    description: "Customer sales invoices (⚡ Auto-Sync: Deducts stock from Inventory & logs Income to Cashbook)",
    icon: "TrendingUp",
    createdAt: "2026-11-22",
    fields: [
      { id: "inv_num", type: "text", label: "Invoice Number", placeholder: "e.g. INV-2026-1001", required: true },
      { id: "inv_customer", type: "text", label: "Customer / Client Name", placeholder: "e.g. Infosys Technologies Ltd", required: true },
      { id: "inv_product", type: "text", label: "Product Sold", placeholder: "e.g. Dell Latitude Laptop 16GB", required: true },
      { id: "inv_qty", type: "number", label: "Quantity Sold", placeholder: "3", required: true },
      { id: "inv_unit_price", type: "number", label: "Unit Selling Price (₹)", placeholder: "65000", required: true },
      { id: "inv_total", type: "number", label: "Total Invoice Value (₹)", placeholder: "195000", required: true },
      { id: "inv_date", type: "date", label: "Invoice Date", required: true },
      { id: "inv_payment_mode", type: "select", label: "Payment Mode", options: ["Bank NEFT/RTGS", "Corporate Card", "UPI / Cash"], required: true, defaultValue: "Bank NEFT/RTGS" }
    ],
    records: [
      {
        id: "INV-501",
        inv_num: "INV-2026-1001",
        inv_customer: "Infosys Technologies Ltd",
        inv_product: "Dell Latitude Laptop 16GB",
        inv_qty: "3",
        inv_unit_price: "65,000",
        inv_total: "1,95,000",
        inv_date: "2026-11-22",
        inv_payment_mode: "Bank NEFT/RTGS",
        status: "approved",
        submittedBy: "Priya Sundaram (Staff)",
        submittedAt: "22 Nov 2026, 02:15 PM"
      },
      {
        id: "INV-502",
        inv_num: "INV-2026-1002",
        inv_customer: "Wipro Digital Solutions",
        inv_product: "Logitech MX Master Wireless Mouse",
        inv_qty: "5",
        inv_unit_price: "8,500",
        inv_total: "42,500",
        inv_date: "2026-11-24",
        inv_payment_mode: "Corporate Card",
        status: "approved",
        submittedBy: "Priya Sundaram (Staff)",
        submittedAt: "24 Nov 2026, 04:45 PM"
      },
      {
        id: "INV-503",
        inv_num: "INV-2026-1003",
        inv_customer: "Cognizant Technology Solutions",
        inv_product: "Dell Latitude Laptop 16GB",
        inv_qty: "4",
        inv_unit_price: "65,000",
        inv_total: "2,60,000",
        inv_date: "2026-11-26",
        inv_payment_mode: "Bank NEFT/RTGS",
        status: "pending",
        submittedBy: "Priya Sundaram (Staff)",
        submittedAt: "26 Nov 2026, 02:00 PM"
      }
    ]
  },

  // 4. FINANCIAL TRANSACTIONS (Central Cashbook Ledger with Live Auto-Sync)
  {
    id: "mod_transactions",
    name: "Financial Transactions",
    description: "Central financial ledger (⚡ Live Sync: Inflows auto-synced from Sales & Outflows from Purchases)",
    icon: "Wallet",
    createdAt: "2026-11-23",
    fields: [
      { id: "tx_id", type: "text", label: "Transaction ID", placeholder: "e.g. TXN-301", required: true },
      { id: "tx_type", type: "select", label: "Transaction Type", options: ["Income (Sales)", "Expense (Procurement)"], required: true, defaultValue: "Income (Sales)" },
      { id: "tx_ref", type: "text", label: "Linked Reference (PO / Invoice #)", placeholder: "e.g. INV-2026-1001", required: true },
      { id: "tx_party", type: "text", label: "Party Name (Customer / Vendor)", placeholder: "e.g. Infosys Technologies Ltd", required: true },
      { id: "tx_amount", type: "number", label: "Amount (₹)", placeholder: "195000", required: true },
      { id: "tx_category", type: "select", label: "Category", options: ["Sales Revenue", "Vendor Procurement", "Operational Expense"], required: true, defaultValue: "Sales Revenue" },
      { id: "tx_date", type: "date", label: "Transaction Date", required: true },
      { id: "tx_status", type: "select", label: "Clearance Status", options: ["Completed", "Pending Clearance"], required: true, defaultValue: "Completed" }
    ],
    records: [
      {
        id: "TXN-301",
        tx_id: "TXN-301",
        tx_type: "Income (Sales)",
        tx_ref: "INV-2026-1001",
        tx_party: "Infosys Technologies Ltd",
        tx_amount: "1,95,000",
        tx_category: "Sales Revenue",
        tx_date: "2026-11-22",
        tx_status: "Completed",
        status: "approved",
        submittedBy: "Priya Sundaram (Staff)",
        submittedAt: "22 Nov 2026, 02:15 PM"
      },
      {
        id: "TXN-302",
        tx_id: "TXN-302",
        tx_type: "Expense (Procurement)",
        tx_ref: "PO-2026-0091",
        tx_party: "Global Silicon Semiconductor Ltd",
        tx_amount: "5,20,000",
        tx_category: "Vendor Procurement",
        tx_date: "2026-11-20",
        tx_status: "Completed",
        status: "approved",
        submittedBy: "Rajesh Kumar (Admin)",
        submittedAt: "20 Nov 2026, 03:00 PM"
      },
      {
        id: "TXN-303",
        tx_id: "TXN-303",
        tx_type: "Income (Sales)",
        tx_ref: "INV-2026-1002",
        tx_party: "Wipro Digital Solutions",
        tx_amount: "42,500",
        tx_category: "Sales Revenue",
        tx_date: "2026-11-24",
        tx_status: "Completed",
        status: "approved",
        submittedBy: "Priya Sundaram (Staff)",
        submittedAt: "24 Nov 2026, 04:45 PM"
      }
    ]
  },

  // 5. EMPLOYEE DIRECTORY (Assigned to Ramesh HR; requires Admin Approval for new entries)
  {
    id: "mod_employee",
    name: "Employee Directory",
    description: "Official workforce registry (Ramesh HR creates new staff; Admin audits & approves)",
    icon: "Users",
    createdAt: "2026-11-24",
    fields: [
      { id: "emp_code", type: "text", label: "Employee Code", placeholder: "e.g. EMP-101", required: true },
      { id: "emp_name", type: "text", label: "Employee Full Name", placeholder: "e.g. Anand Varma", required: true },
      { id: "emp_title", type: "text", label: "Designation / Role", placeholder: "e.g. Principal Cloud Architect", required: true },
      { id: "emp_dept", type: "select", label: "Department", options: ["Engineering", "Finance", "Operations", "Sales", "Human Resources"], required: true, defaultValue: "Engineering" },
      { id: "emp_email", type: "text", label: "Official Email Address", placeholder: "anand@erp.com", required: true },
      { id: "emp_salary", type: "number", label: "Monthly Compensation (₹)", placeholder: "165000", required: true },
      { id: "emp_doj", type: "date", label: "Date of Joining", required: true }
    ],
    records: [
      {
        id: "EMP-101",
        emp_code: "EMP-101",
        emp_name: "Anand Varma",
        emp_title: "Principal Cloud Architect",
        emp_dept: "Engineering",
        emp_email: "anand@erp.com",
        emp_salary: "1,65,000",
        emp_doj: "2025-06-15",
        status: "approved",
        submittedBy: "Ramesh (HR)",
        submittedAt: "15 Jun 2025, 09:30 AM"
      },
      {
        id: "EMP-102",
        emp_code: "EMP-102",
        emp_name: "Deepa Sundaram",
        emp_title: "Senior Finance Auditor",
        emp_dept: "Finance",
        emp_email: "deepa@erp.com",
        emp_salary: "95,000",
        emp_doj: "2025-09-01",
        status: "approved",
        submittedBy: "Ramesh (HR)",
        submittedAt: "01 Sep 2025, 10:15 AM"
      },
      {
        id: "EMP-103",
        emp_code: "EMP-103",
        emp_name: "Ramesh Krishnan",
        emp_title: "HR Operations Lead",
        emp_dept: "Human Resources",
        emp_email: "ramesh@erp.com",
        emp_salary: "75,000",
        emp_doj: "2026-01-10",
        status: "approved",
        submittedBy: "Rajesh Kumar (Admin)",
        submittedAt: "10 Jan 2026, 11:00 AM"
      },
      {
        id: "EMP-104",
        emp_code: "EMP-104",
        emp_name: "Karthik Raja",
        emp_title: "DevOps & Cloud Engineer",
        emp_dept: "Engineering",
        emp_email: "karthik.raja@erp.com",
        emp_salary: "85,000",
        emp_doj: "2026-11-26",
        status: "pending",
        submittedBy: "Ramesh (HR)",
        submittedAt: "26 Nov 2026, 11:45 AM"
      }
    ]
  },

  // 6. TASKS & ASSIGNMENTS (Connected to Employee Directory, Operations & Admin Review)
  {
    id: "mod_tasks",
    name: "Tasks & Assignments",
    description: "Assign operational tasks to staff, link to employees & POs, track deadlines, and review sign-offs",
    icon: "CheckSquare",
    createdAt: "2026-11-26",
    fields: [
      { id: "task_code", type: "text", label: "Task Code", placeholder: "e.g. TSK-101", required: true },
      { id: "task_title", type: "text", label: "Task Title & Summary", placeholder: "e.g. Verify Laptop Delivery & Tag Assets", required: true },
      { id: "task_assigned_to", type: "text", label: "Assigned Employee", placeholder: "e.g. Anand Varma", required: true },
      { id: "task_dept", type: "select", label: "Department", options: ["Engineering", "Operations", "Finance", "Human Resources", "Sales"], required: true, defaultValue: "Operations" },
      { id: "task_priority", type: "select", label: "Priority Level", options: ["Critical", "High", "Medium", "Normal"], required: true, defaultValue: "High" },
      { id: "task_deadline", type: "date", label: "Target Deadline", required: true },
      { id: "task_status_prog", type: "select", label: "Workflow Stage", options: ["In Progress", "Pending Admin Sign-Off", "Completed", "On Hold"], required: true, defaultValue: "In Progress" },
      { id: "task_notes", type: "textarea", label: "Deliverables / Completion Notes", placeholder: "Enter details, PO references, or deliverables...", required: false }
    ],
    records: [
      {
        id: "TSK-101",
        task_code: "TSK-101",
        task_title: "Inspect Global Silicon PO-2026-0091 Hardware Delivery & Serial Tags",
        task_assigned_to: "Anand Varma",
        task_dept: "Engineering",
        task_priority: "High",
        task_deadline: "2026-11-28",
        task_status_prog: "In Progress",
        task_notes: "Verify sealed serial packaging for 10 units of Dell Latitude 16GB laptops against PO-881.",
        status: "approved",
        submittedBy: "Rajesh Kumar (Admin)",
        submittedAt: "26 Nov 2026, 09:00 AM"
      },
      {
        id: "TSK-102",
        task_code: "TSK-102",
        task_title: "Reconcile B2B Customer Tax Invoices & GST E-Way Bills (Infosys & Wipro)",
        task_assigned_to: "Deepa Sundaram",
        task_dept: "Finance",
        task_priority: "Critical",
        task_deadline: "2026-11-30",
        task_status_prog: "In Progress",
        task_notes: "Verify GSTR-1 outward sales return against INV-2026-1001 and INV-2026-1002.",
        status: "approved",
        submittedBy: "Rajesh Kumar (Admin)",
        submittedAt: "26 Nov 2026, 10:15 AM"
      },
      {
        id: "TSK-103",
        task_code: "TSK-103",
        task_title: "Onboard New DevOps Engineer Karthik Raja (System, Email & Workstation Setup)",
        task_assigned_to: "Ramesh Krishnan",
        task_dept: "Human Resources",
        task_priority: "Medium",
        task_deadline: "2026-11-27",
        task_status_prog: "Pending Admin Sign-Off",
        task_notes: "Setup employee file EMP-104, NDA sign-off completed, awaiting Super Admin final clearance.",
        status: "pending",
        submittedBy: "Ramesh (HR)",
        submittedAt: "26 Nov 2026, 11:50 AM"
      },
      {
        id: "TSK-104",
        task_code: "TSK-104",
        task_title: "Warehouse Inventory Barcode Scanning & Re-shelving (Mice & Accessories)",
        task_assigned_to: "Priya Sundaram",
        task_dept: "Operations",
        task_priority: "Normal",
        task_deadline: "2026-12-02",
        task_status_prog: "In Progress",
        task_notes: "Audit physical count of Logitech MX Master mice on bay 4 shelves against Products & Inventory.",
        status: "approved",
        submittedBy: "Senthil Nathan (Manager)",
        submittedAt: "26 Nov 2026, 01:10 PM"
      }
    ]
  }
];

export const INITIAL_USERS = [
  {
    id: "usr_admin",
    fullName: "Rajesh Kumar (Admin)",
    email: "admin@erp.com",
    password: "123",
    role: "admin", // Admin has full access to Studio, User Access, and all modules
    allowedModuleIds: ["*"], // all modules
    canApprove: true,
    department: "Executive Management"
  },
  {
    id: "usr_ramesh",
    fullName: "Ramesh (HR)",
    email: "ramesh@erp.com",
    password: "123",
    role: "user",
    allowedModuleIds: ["mod_employee", "mod_tasks"], // Employee Directory and Tasks
    canApprove: false, // Staff level: submissions require Admin approval!
    department: "Human Resources"
  },
  {
    id: "usr_manager",
    fullName: "Senthil Nathan (Manager)",
    email: "manager@erp.com",
    password: "123",
    role: "user",
    allowedModuleIds: ["mod_inventory", "mod_purchase", "mod_sales", "mod_transactions", "mod_tasks"],
    canApprove: true, // Manager can approve POs and sales
    department: "Operations & Inventory"
  },
  {
    id: "usr_staff",
    fullName: "Priya Sundaram (Staff)",
    email: "staff@erp.com",
    password: "123",
    role: "user",
    allowedModuleIds: ["mod_sales", "mod_inventory", "mod_tasks"], // Sales entry and Tasks
    canApprove: false,
    department: "Sales & Billing"
  }
];

const STORAGE_KEYS = {
  MODULES: "erp_interconnected_modules_v7",
  USERS: "erp_interconnected_users_v7"
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
  // Get all active modules
  getModules() {
    return loadStorage(STORAGE_KEYS.MODULES, INITIAL_MODULES);
  },
  saveModules(mods) {
    saveStorage(STORAGE_KEYS.MODULES, mods);
  },
  getModuleById(id) {
    return this.getModules().find((m) => m.id === id) || null;
  },
  createModule({ name, description, fields }) {
    const mods = this.getModules();
    const newMod = {
      id: "mod_" + Date.now(),
      name: name.trim(),
      description: description.trim() || `Custom module: ${name}`,
      icon: "Layers",
      createdAt: new Date().toISOString().split("T")[0],
      fields: fields || [],
      records: []
    };
    const updated = [...mods, newMod];
    this.saveModules(updated);
    return newMod;
  },
  updateModule(moduleId, { name, description, fields }) {
    const mods = this.getModules().map((m) => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        name: name !== undefined ? name.trim() : m.name,
        description: description !== undefined ? description.trim() : m.description,
        fields: fields !== undefined ? fields : m.fields
      };
    });
    this.saveModules(mods);
    return mods;
  },
  deleteModule(moduleId) {
    const mods = this.getModules().filter((m) => m.id !== moduleId);
    this.saveModules(mods);
    return mods;
  },

  // ==========================================================================
  // REAL-TIME DATA SHARING & AUTO-LINKING ENGINE
  // ==========================================================================
  addRecord(moduleId, recordData, user) {
    let mods = this.getModules();
    const newId = (
      moduleId === "mod_inventory" ? "PRD-" :
      moduleId === "mod_purchase" ? "PO-" :
      moduleId === "mod_sales" ? "INV-" :
      moduleId === "mod_transactions" ? "TXN-" :
      moduleId === "mod_employee" ? "EMP-" :
      moduleId === "mod_tasks" ? "TSK-" : "REC-"
    ) + Math.floor(100 + Math.random() * 900);

    const isDirectApproved = user?.role === "admin" || user?.canApprove === true;
    const newRec = {
      id: newId,
      ...recordData,
      status: isDirectApproved ? "approved" : "pending",
      submittedBy: user?.fullName || "System User",
      submittedAt: new Date().toLocaleString()
    };

    // 1. Add record to target module
    mods = mods.map((m) => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        records: [newRec, ...(m.records || [])]
      };
    });

    // 2. AUTO-LINK: Sales Invoice -> Deduct Inventory + Log Income in Financial Transactions
    if (moduleId === "mod_sales") {
      const soldQty = Number(recordData.inv_qty || 1);
      const prodName = recordData.inv_product || "";
      const totalAmount = recordData.inv_total || (soldQty * Number(recordData.inv_unit_price || 0));

      // A. Deduct stock from Products & Inventory
      mods = mods.map((m) => {
        if (m.id !== "mod_inventory") return m;
        const updatedRecords = (m.records || []).map((p) => {
          if (p.p_name && prodName && p.p_name.toLowerCase().includes(prodName.toLowerCase())) {
            const currentStock = Number(String(p.p_stock_qty).replace(/,/g, "")) || 0;
            const newStock = Math.max(0, currentStock - soldQty);
            return {
              ...p,
              p_stock_qty: String(newStock),
              p_status: newStock <= 5 ? "Low Stock" : "In Stock"
            };
          }
          return p;
        });
        return { ...m, records: updatedRecords };
      });

      // B. Auto-Log Income to Financial Transactions
      mods = mods.map((m) => {
        if (m.id !== "mod_transactions") return m;
        const newTxn = {
          id: "TXN-" + Math.floor(100 + Math.random() * 900),
          tx_id: "TXN-S" + newId,
          tx_type: "Income (Sales)",
          tx_ref: recordData.inv_num || newId,
          tx_party: recordData.inv_customer || "Customer",
          tx_amount: String(totalAmount),
          tx_category: "Sales Revenue",
          tx_date: recordData.inv_date || new Date().toISOString().split("T")[0],
          tx_status: "Completed",
          status: "approved",
          submittedBy: user?.fullName || "Sales Sync",
          submittedAt: new Date().toLocaleString()
        };
        return {
          ...m,
          records: [newTxn, ...(m.records || [])]
        };
      });
    }

    // 3. AUTO-LINK: Purchase Order -> Add Inventory + Log Expense in Financial Transactions
    if (moduleId === "mod_purchase") {
      const poQty = Number(recordData.po_qty || 1);
      const prodName = recordData.po_product || "";
      const totalAmount = recordData.po_total || (poQty * Number(recordData.po_unit_price || 0));

      // A. Add stock to Products & Inventory
      mods = mods.map((m) => {
        if (m.id !== "mod_inventory") return m;
        const updatedRecords = (m.records || []).map((p) => {
          if (p.p_name && prodName && p.p_name.toLowerCase().includes(prodName.toLowerCase())) {
            const currentStock = Number(String(p.p_stock_qty).replace(/,/g, "")) || 0;
            const newStock = currentStock + poQty;
            return {
              ...p,
              p_stock_qty: String(newStock),
              p_status: "In Stock"
            };
          }
          return p;
        });
        return { ...m, records: updatedRecords };
      });

      // B. Auto-Log Expense to Financial Transactions
      mods = mods.map((m) => {
        if (m.id !== "mod_transactions") return m;
        const newTxn = {
          id: "TXN-" + Math.floor(100 + Math.random() * 900),
          tx_id: "TXN-P" + newId,
          tx_type: "Expense (Procurement)",
          tx_ref: recordData.po_num || newId,
          tx_party: recordData.po_vendor || "Vendor",
          tx_amount: String(totalAmount),
          tx_category: "Vendor Procurement",
          tx_date: recordData.po_date || new Date().toISOString().split("T")[0],
          tx_status: isDirectApproved ? "Completed" : "Pending Clearance",
          status: isDirectApproved ? "approved" : "pending",
          submittedBy: user?.fullName || "Procurement Sync",
          submittedAt: new Date().toLocaleString()
        };
        return {
          ...m,
          records: [newTxn, ...(m.records || [])]
        };
      });
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
      id: recordId, // preserve ID
      updatedBy: user?.fullName || "System User",
      updatedAt: new Date().toLocaleString()
    };

    // 1. Update the record in the target module
    mods = mods.map((m) => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        records: (m.records || []).map((r) => (r.id === recordId ? mergedRec : r))
      };
    });

    // 2. REAL-TIME DATA SHARING CASCADE: If Sales & Invoicing is changed:
    if (moduleId === "mod_sales") {
      const oldQty = Number(String(oldRec.inv_qty || 0).replace(/,/g, "")) || 0;
      const newQty = Number(String(mergedRec.inv_qty || 0).replace(/,/g, "")) || 0;
      const oldProd = oldRec.inv_product || "";
      const newProd = mergedRec.inv_product || "";
      const unitP = Number(String(mergedRec.inv_unit_price || 0).replace(/,/g, "")) || 0;
      const newTotal = mergedRec.inv_total || (newQty * unitP);

      // A. Dynamic Stock Sync in Products & Inventory:
      mods = mods.map((m) => {
        if (m.id !== "mod_inventory") return m;
        const updatedProds = (m.records || []).map((p) => {
          const pName = p.p_name || "";
          let stock = Number(String(p.p_stock_qty).replace(/,/g, "")) || 0;

          if (oldProd && pName.toLowerCase().includes(oldProd.toLowerCase())) {
            if (newProd && pName.toLowerCase().includes(newProd.toLowerCase())) {
              // Same product: net stock difference (if newQty increased, deduct difference; if decreased, add back!)
              const diff = newQty - oldQty;
              stock = Math.max(0, stock - diff);
            } else {
              // Product changed: restore old product stock!
              stock = stock + oldQty;
            }
          } else if (newProd && pName.toLowerCase().includes(newProd.toLowerCase())) {
            // New product: deduct newQty!
            stock = Math.max(0, stock - newQty);
          }

          return {
            ...p,
            p_stock_qty: String(stock),
            p_status: stock <= 5 ? "Low Stock" : "In Stock"
          };
        });
        return { ...m, records: updatedProds };
      });

      // B. Dynamic Ledger Sync in Financial Transactions:
      mods = mods.map((m) => {
        if (m.id !== "mod_transactions") return m;
        const updatedTxns = (m.records || []).map((t) => {
          const isLinked = (
            (oldRec.inv_num && t.tx_ref === oldRec.inv_num) ||
            t.tx_ref === recordId ||
            (t.tx_id && t.tx_id.includes(recordId))
          );
          if (isLinked) {
            return {
              ...t,
              tx_amount: String(newTotal),
              tx_party: mergedRec.inv_customer || t.tx_party,
              tx_ref: mergedRec.inv_num || t.tx_ref,
              tx_date: mergedRec.inv_date || t.tx_date,
              tx_status: "Completed",
              updatedBy: user?.fullName || "Sales Sync",
              updatedAt: new Date().toLocaleString()
            };
          }
          return t;
        });
        return { ...m, records: updatedTxns };
      });
    }

    // 3. REAL-TIME DATA SHARING CASCADE: If Purchase Orders is changed:
    if (moduleId === "mod_purchase") {
      const oldQty = Number(String(oldRec.po_qty || 0).replace(/,/g, "")) || 0;
      const newQty = Number(String(mergedRec.po_qty || 0).replace(/,/g, "")) || 0;
      const oldProd = oldRec.po_product || "";
      const newProd = mergedRec.po_product || "";
      const unitCost = Number(String(mergedRec.po_unit_price || 0).replace(/,/g, "")) || 0;
      const newTotal = mergedRec.po_total || (newQty * unitCost);

      // A. Dynamic Stock Sync in Products & Inventory:
      mods = mods.map((m) => {
        if (m.id !== "mod_inventory") return m;
        const updatedProds = (m.records || []).map((p) => {
          const pName = p.p_name || "";
          let stock = Number(String(p.p_stock_qty).replace(/,/g, "")) || 0;

          if (oldProd && pName.toLowerCase().includes(oldProd.toLowerCase())) {
            if (newProd && pName.toLowerCase().includes(newProd.toLowerCase())) {
              // Same product: PO quantity increased -> add more stock; decreased -> subtract stock!
              const diff = newQty - oldQty;
              stock = Math.max(0, stock + diff);
            } else {
              // Product changed: remove old qty
              stock = Math.max(0, stock - oldQty);
            }
          } else if (newProd && pName.toLowerCase().includes(newProd.toLowerCase())) {
            // New product: add new qty
            stock = stock + newQty;
          }

          return {
            ...p,
            p_stock_qty: String(stock),
            p_status: stock <= 5 ? "Low Stock" : "In Stock"
          };
        });
        return { ...m, records: updatedProds };
      });

      // B. Dynamic Ledger Sync in Financial Transactions:
      mods = mods.map((m) => {
        if (m.id !== "mod_transactions") return m;
        const updatedTxns = (m.records || []).map((t) => {
          const isLinked = (
            (oldRec.po_num && t.tx_ref === oldRec.po_num) ||
            t.tx_ref === recordId ||
            (t.tx_id && t.tx_id.includes(recordId))
          );
          if (isLinked) {
            return {
              ...t,
              tx_amount: String(newTotal),
              tx_party: mergedRec.po_vendor || t.tx_party,
              tx_ref: mergedRec.po_num || t.tx_ref,
              tx_date: mergedRec.po_date || t.tx_date,
              updatedBy: user?.fullName || "Procurement Sync",
              updatedAt: new Date().toLocaleString()
            };
          }
          return t;
        });
        return { ...m, records: updatedTxns };
      });
    }

    this.saveModules(mods);
    return mods;
  },

  updateRecordStatus(moduleId, recordId, status, reviewerName) {
    let mods = this.getModules();
    const targetModule = mods.find((m) => m.id === moduleId);
    const targetRec = (targetModule?.records || []).find((r) => r.id === recordId);

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

    // If approving a purchase order, mark its linked transaction completed
    if (moduleId === "mod_purchase" && status === "approved") {
      mods = mods.map((m) => {
        if (m.id !== "mod_transactions") return m;
        const updated = (m.records || []).map((t) => {
          if (
            (targetRec?.po_num && t.tx_ref === targetRec.po_num) ||
            t.tx_ref === recordId ||
            (t.tx_id && t.tx_id.includes(recordId))
          ) {
            return { ...t, status: "approved", tx_status: "Completed" };
          }
          return t;
        });
        return { ...m, records: updated };
      });
    }

    // If approving a sales invoice, mark its linked transaction completed
    if (moduleId === "mod_sales" && status === "approved") {
      mods = mods.map((m) => {
        if (m.id !== "mod_transactions") return m;
        const updated = (m.records || []).map((t) => {
          if (
            (targetRec?.inv_num && t.tx_ref === targetRec.inv_num) ||
            t.tx_ref === recordId ||
            (t.tx_id && t.tx_id.includes(recordId))
          ) {
            return { ...t, status: "approved", tx_status: "Completed" };
          }
          return t;
        });
        return { ...m, records: updated };
      });
    }

    this.saveModules(mods);
    return mods;
  },

  deleteRecord(moduleId, recordId) {
    let mods = this.getModules();
    const targetModule = mods.find((m) => m.id === moduleId);
    const oldRec = (targetModule?.records || []).find((r) => r.id === recordId);

    // If deleting a Sales Invoice, restore stock in Inventory & remove from Transactions
    if (moduleId === "mod_sales" && oldRec) {
      const soldQty = Number(String(oldRec.inv_qty || 0).replace(/,/g, "")) || 0;
      const prodName = oldRec.inv_product || "";

      // Restore stock
      mods = mods.map((m) => {
        if (m.id !== "mod_inventory") return m;
        const updated = (m.records || []).map((p) => {
          if (p.p_name && prodName && p.p_name.toLowerCase().includes(prodName.toLowerCase())) {
            const currentStock = Number(String(p.p_stock_qty).replace(/,/g, "")) || 0;
            return { ...p, p_stock_qty: String(currentStock + soldQty) };
          }
          return p;
        });
        return { ...m, records: updated };
      });

      // Remove transaction
      mods = mods.map((m) => {
        if (m.id !== "mod_transactions") return m;
        return {
          ...m,
          records: (m.records || []).filter((t) => (
            t.tx_ref !== oldRec.inv_num &&
            t.tx_ref !== oldRec.id &&
            (!t.tx_id || !t.tx_id.includes(oldRec.id))
          ))
        };
      });
    }

    // If deleting a Purchase Order, deduct stock from Inventory & remove from Transactions
    if (moduleId === "mod_purchase" && oldRec) {
      const poQty = Number(String(oldRec.po_qty || 0).replace(/,/g, "")) || 0;
      const prodName = oldRec.po_product || "";

      // Deduct stock
      mods = mods.map((m) => {
        if (m.id !== "mod_inventory") return m;
        const updated = (m.records || []).map((p) => {
          if (p.p_name && prodName && p.p_name.toLowerCase().includes(prodName.toLowerCase())) {
            const currentStock = Number(String(p.p_stock_qty).replace(/,/g, "")) || 0;
            return { ...p, p_stock_qty: String(Math.max(0, currentStock - poQty)) };
          }
          return p;
        });
        return { ...m, records: updated };
      });

      // Remove transaction
      mods = mods.map((m) => {
        if (m.id !== "mod_transactions") return m;
        return {
          ...m,
          records: (m.records || []).filter((t) => (
            t.tx_ref !== oldRec.po_num &&
            t.tx_ref !== oldRec.id &&
            (!t.tx_id || !t.tx_id.includes(oldRec.id))
          ))
        };
      });
    }

    // Remove from target module
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
    return loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  saveUsers(users) {
    saveStorage(STORAGE_KEYS.USERS, users);
  },
  addUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: "usr_" + Date.now(),
      fullName: userData.fullName.trim(),
      email: userData.email.trim(),
      password: userData.password.trim(),
      role: "user",
      allowedModuleIds: userData.allowedModuleIds || [],
      canApprove: !!userData.canApprove,
      department: userData.department?.trim() || "General"
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

  // Reset to clean connected state
  resetAll() {
    saveStorage(STORAGE_KEYS.MODULES, INITIAL_MODULES);
    saveStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
};
