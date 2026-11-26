// ============================================================================
// DYNAMIC ERP MODULE & USER ACCESS STORE (LOCALSTORAGE PERSISTED)
// ============================================================================

export const INITIAL_MODULES = [
  // 1. PRODUCTS & INVENTORY
  {
    id: "mod_products",
    name: "Products & Inventory",
    description: "Catalog of company products, pricing and inventory levels",
    icon: "Package",
    createdAt: "2026-11-20",
    fields: [
      {
        id: "fld_p1",
        type: "text",
        label: "Product Name",
        placeholder: "e.g. Dell Latitude 7420",
        required: true
      },
      {
        id: "fld_p2",
        type: "select",
        label: "Product Category",
        options: ["Electronics", "Office Furniture", "IT Hardware", "Stationery"],
        required: true,
        defaultValue: "Electronics"
      },
      {
        id: "fld_p3",
        type: "number",
        label: "Unit Price (₹)",
        placeholder: "15000",
        required: true
      },
      {
        id: "fld_p4",
        type: "number",
        label: "Stock Quantity (Units)",
        placeholder: "50",
        required: true
      },
      {
        id: "fld_p5",
        type: "textarea",
        label: "Product Specifications & Notes",
        placeholder: "Detailed specifications, model code, or warranty info...",
        required: false
      }
    ],
    records: [
      {
        id: "PRD-101",
        fld_p1: "Dell XPS 15 Laptop (32GB RAM / 1TB SSD)",
        fld_p2: "IT Hardware",
        fld_p3: "1,25,000",
        fld_p4: "24",
        fld_p5: "High-performance dev laptops with 3-year warranty.",
        status: "approved",
        submittedBy: "Rajesh Kumar",
        submittedAt: "24 Nov 2026, 10:15 AM"
      },
      {
        id: "PRD-102",
        fld_p1: "Logitech MX Master 3S Wireless Mouse",
        fld_p2: "Electronics",
        fld_p3: "8,499",
        fld_p4: "85",
        fld_p5: "Quiet click, 8K DPI sensor, Bluetooth + USB Bolt.",
        status: "approved",
        submittedBy: "Priya Sundaram",
        submittedAt: "24 Nov 2026, 02:40 PM"
      },
      {
        id: "PRD-103",
        fld_p1: "Ergonomic Mesh High-Back Executive Chair",
        fld_p2: "Office Furniture",
        fld_p3: "14,500",
        fld_p4: "15",
        fld_p5: "Lumbar support with adjustable armrests.",
        status: "pending",
        submittedBy: "Priya Sundaram",
        submittedAt: "25 Nov 2026, 09:20 AM"
      }
    ]
  },

  // 2. PURCHASE ORDERS & INVOICES
  {
    id: "mod_purchase_orders",
    name: "Purchase Orders",
    description: "Official vendor purchase orders, GST billing and procurement",
    icon: "Receipt",
    createdAt: "2026-11-21",
    fields: [
      {
        id: "fld_po1",
        type: "text",
        label: "PO / Invoice Number",
        placeholder: "e.g. PO-2026-8810",
        required: true
      },
      {
        id: "fld_po2",
        type: "text",
        label: "Vendor / Supplier Name",
        placeholder: "e.g. Acme Tech Solutions Ltd.",
        required: true
      },
      {
        id: "fld_po3",
        type: "number",
        label: "Total Amount (₹)",
        placeholder: "45000",
        required: true
      },
      {
        id: "fld_po4",
        type: "date",
        label: "Order Date",
        required: true
      },
      {
        id: "fld_po5",
        type: "select",
        label: "Payment Terms",
        options: ["Net 30 Days", "Immediate / Cash", "50% Advance", "Net 15 Days"],
        required: true,
        defaultValue: "Net 30 Days"
      }
    ],
    records: [
      {
        id: "PO-881",
        fld_po1: "PO-2026-0091",
        fld_po2: "Global Silicon Semiconductors Ltd.",
        fld_po3: "1,85,000",
        fld_po4: "2026-11-22",
        fld_po5: "Net 30 Days",
        status: "approved",
        submittedBy: "Rajesh Kumar",
        submittedAt: "22 Nov 2026, 03:00 PM"
      },
      {
        id: "PO-882",
        fld_po1: "PO-2026-0092",
        fld_po2: "Nexus Office Systems & Network",
        fld_po3: "62,500",
        fld_po4: "2026-11-25",
        fld_po5: "50% Advance",
        status: "pending",
        submittedBy: "Senthil Nathan",
        submittedAt: "25 Nov 2026, 11:30 AM"
      }
    ]
  },

  // 3. LEAVE REQUESTS
  {
    id: "mod_leave",
    name: "Leave Requests",
    description: "Employee leave applications and manager approval workflow",
    icon: "CalendarCheck",
    createdAt: "2026-11-22",
    fields: [
      {
        id: "fld_l1",
        type: "text",
        label: "Applicant Full Name",
        placeholder: "e.g. Karthik Raja",
        required: true
      },
      {
        id: "fld_l2",
        type: "select",
        label: "Leave Category",
        options: ["Casual Leave", "Medical / Sick Leave", "Annual Paid Vacation"],
        required: true,
        defaultValue: "Casual Leave"
      },
      {
        id: "fld_l3",
        type: "number",
        label: "Total Days Requested",
        placeholder: "3",
        required: true
      },
      {
        id: "fld_l4",
        type: "date",
        label: "Start Date",
        required: true
      },
      {
        id: "fld_l5",
        type: "textarea",
        label: "Reason for Absence",
        placeholder: "Brief explanation...",
        required: true
      }
    ],
    records: [
      {
        id: "LEV-201",
        fld_l1: "Karthik Raja",
        fld_l2: "Medical / Sick Leave",
        fld_l3: "2",
        fld_l4: "2026-11-26",
        fld_l5: "Doctor appointment and recovery.",
        status: "pending",
        submittedBy: "Karthik Raja",
        submittedAt: "25 Nov 2026, 08:30 AM"
      },
      {
        id: "LEV-202",
        fld_l1: "Priya Sundaram",
        fld_l2: "Annual Paid Vacation",
        fld_l3: "4",
        fld_l4: "2026-12-01",
        fld_l5: "Family vacation trip.",
        status: "approved",
        submittedBy: "Priya Sundaram",
        submittedAt: "23 Nov 2026, 11:15 AM",
        reviewedBy: "Senthil Nathan",
        reviewedAt: "23 Nov 2026, 01:00 PM"
      }
    ]
  },

  // 4. CUSTOMER INQUIRIES
  {
    id: "mod_customers",
    name: "Customer Inquiries",
    description: "Track client leads, project inquiries and contact details",
    icon: "Users",
    createdAt: "2026-11-23",
    fields: [
      {
        id: "fld_c1",
        type: "text",
        label: "Client / Company Name",
        placeholder: "e.g. Apollo Enterprises",
        required: true
      },
      {
        id: "fld_c2",
        type: "text",
        label: "Contact Phone / Email",
        placeholder: "e.g. +91 98400 12345",
        required: true
      },
      {
        id: "fld_c3",
        type: "select",
        label: "Requirement Category",
        options: ["Web & Cloud ERP", "Mobile App Development", "UI/UX Consulting", "Annual Maintenance"],
        required: true,
        defaultValue: "Web & Cloud ERP"
      },
      {
        id: "fld_c4",
        type: "number",
        label: "Expected Budget (₹)",
        placeholder: "75000",
        required: false
      },
      {
        id: "fld_c5",
        type: "textarea",
        label: "Project Scope & Remarks",
        placeholder: "Client requirements summary...",
        required: false
      }
    ],
    records: [
      {
        id: "INQ-301",
        fld_c1: "Apollo Health & Logistics",
        fld_c2: "+91 98401 22334",
        fld_c3: "Web & Cloud ERP",
        fld_c4: "2,50,000",
        fld_c5: "Need warehouse inventory management and multi-branch billing.",
        status: "pending",
        submittedBy: "Priya Sundaram",
        submittedAt: "25 Nov 2026, 10:00 AM"
      },
      {
        id: "INQ-302",
        fld_c1: "Zenith Retail Outlets",
        fld_c2: "info@zenithretail.in",
        fld_c3: "Mobile App Development",
        fld_c4: "95,000",
        fld_c5: "Customer loyalty program & POS barcode scanner app.",
        status: "approved",
        submittedBy: "Rajesh Kumar",
        submittedAt: "24 Nov 2026, 04:30 PM"
      }
    ]
  },

  // 5. POTENTIAL CLIENTS & DEALS (Requested by Mentor)
  {
    id: "mod_potential",
    name: "Potential Clients & Deals",
    description: "Prospective business leads, potential clients, pipeline stages and expected deal values",
    icon: "TrendingUp",
    createdAt: "2026-11-25",
    fields: [
      {
        id: "fld_pot1",
        type: "text",
        label: "Potential Client / Company Name",
        placeholder: "e.g. Infosys Technologies Ltd",
        required: true
      },
      {
        id: "fld_pot2",
        type: "select",
        label: "Deal Pipeline Stage",
        options: ["New Lead / Discovery", "Demo Scheduled", "Quotation Sent", "Executive Negotiation", "Closed Won", "Closed Lost"],
        required: true,
        defaultValue: "Quotation Sent"
      },
      {
        id: "fld_pot3",
        type: "number",
        label: "Estimated Deal Value (₹)",
        placeholder: "850000",
        required: true
      },
      {
        id: "fld_pot4",
        type: "text",
        label: "Contact Person & Phone Number",
        placeholder: "e.g. Anand Verma (+91 98401 55667)",
        required: true
      },
      {
        id: "fld_pot5",
        type: "date",
        label: "Expected Closing Date",
        required: true
      },
      {
        id: "fld_pot6",
        type: "textarea",
        label: "Proposal Summary & Follow-up Notes",
        placeholder: "Summary of client requirements, software scope, and next call date...",
        required: false
      }
    ],
    records: [
      {
        id: "POT-101",
        fld_pot1: "Infosys Cloud Enterprise Migration",
        fld_pot2: "Quotation Sent",
        fld_pot3: "8,50,000",
        fld_pot4: "Anand Verma (+91 98401 55667)",
        fld_pot5: "2026-12-15",
        fld_pot6: "Sent corporate quote for 500 user licenses and cloud backup.",
        status: "pending",
        submittedBy: "Rajesh Kumar",
        submittedAt: "25 Nov 2026, 11:30 AM"
      },
      {
        id: "POT-102",
        fld_pot1: "Tata Motors Connected Logistics App",
        fld_pot2: "Demo Scheduled",
        fld_pot3: "14,00,000",
        fld_pot4: "Pooja Sharma (Head of IT)",
        fld_pot5: "2026-12-20",
        fld_pot6: "Scheduled live demo with technical architecture team.",
        status: "approved",
        submittedBy: "Priya Sundaram",
        submittedAt: "25 Nov 2026, 01:15 PM"
      }
    ]
  },

  // 6. EMPLOYEE DIRECTORY (Requested by Mentor - Assigned to HR Ramesh)
  {
    id: "mod_employees",
    name: "Employee Directory",
    description: "Official registry of company employees, departments, job titles, and employment status",
    icon: "Users",
    createdAt: "2026-11-25",
    fields: [
      {
        id: "fld_emp1",
        type: "text",
        label: "Employee Full Name",
        placeholder: "e.g. Vikram Raghavan",
        required: true
      },
      {
        id: "fld_emp2",
        type: "select",
        label: "Department",
        options: ["Engineering & IT", "Human Resources", "Sales & Marketing", "Finance & Accounts", "Operations & Supply Chain"],
        required: true,
        defaultValue: "Engineering & IT"
      },
      {
        id: "fld_emp3",
        type: "text",
        label: "Designation / Job Role",
        placeholder: "e.g. Senior Frontend Engineer",
        required: true
      },
      {
        id: "fld_emp4",
        type: "date",
        label: "Date of Joining",
        required: true
      },
      {
        id: "fld_emp5",
        type: "text",
        label: "Official Email / Contact",
        placeholder: "e.g. vikram@company.com",
        required: true
      },
      {
        id: "fld_emp6",
        type: "select",
        label: "Employment Type",
        options: ["Permanent / Full-Time", "Probation (6 Months)", "Internship", "Contract"],
        required: true,
        defaultValue: "Permanent / Full-Time"
      }
    ],
    records: [
      {
        id: "EMP-001",
        fld_emp1: "Vikram Raghavan",
        fld_emp2: "Engineering & IT",
        fld_emp3: "Lead React & Cloud Architect",
        fld_emp4: "2024-06-15",
        fld_emp5: "vikram@company.com",
        fld_emp6: "Permanent / Full-Time",
        status: "approved",
        submittedBy: "Ramesh (HR)",
        submittedAt: "24 Nov 2026, 09:00 AM",
        reviewedBy: "Rajesh Kumar (Admin)",
        reviewedAt: "24 Nov 2026, 11:30 AM"
      },
      {
        id: "EMP-002",
        fld_emp1: "Deepa Narayanan",
        fld_emp2: "Sales & Marketing",
        fld_emp3: "Enterprise Account Executive",
        fld_emp4: "2025-01-10",
        fld_emp5: "deepa@company.com",
        fld_emp6: "Probation (6 Months)",
        status: "approved",
        submittedBy: "Ramesh (HR)",
        submittedAt: "25 Nov 2026, 10:15 AM",
        reviewedBy: "Rajesh Kumar (Admin)",
        reviewedAt: "25 Nov 2026, 12:00 PM"
      },
      {
        id: "EMP-003",
        fld_emp1: "Arun Prakash",
        fld_emp2: "Finance & Accounts",
        fld_emp3: "Financial Analyst & Auditor",
        fld_emp4: "2026-03-01",
        fld_emp5: "arun.prakash@company.com",
        fld_emp6: "Permanent / Full-Time",
        status: "pending",
        submittedBy: "Ramesh (HR)",
        submittedAt: "25 Nov 2026, 02:45 PM"
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
    id: "usr_hr",
    fullName: "Ramesh (HR)",
    email: "ramesh@erp.com",
    password: "123",
    role: "user",
    allowedModuleIds: ["mod_employees"], // ONLY assigned Employee Directory!
    canApprove: false, // HR Ramesh creates employee records; Super Admin Rajesh Kumar approves
    department: "Human Resources"
  },
  {
    id: "usr_manager",
    fullName: "Senthil Nathan (Manager)",
    email: "manager@erp.com",
    password: "123",
    role: "user",
    allowedModuleIds: ["mod_products", "mod_purchase_orders", "mod_leave"],
    canApprove: true,
    department: "Operations & Inventory"
  },
  {
    id: "usr_staff",
    fullName: "Priya Sundaram (Staff)",
    email: "staff@erp.com",
    password: "123",
    role: "user",
    allowedModuleIds: ["mod_products", "mod_customers"],
    canApprove: false,
    department: "Sales & Counter"
  }
];

const STORAGE_KEYS = {
  MODULES: "erp_dynamic_modules_v2",
  USERS: "erp_dynamic_users_v2"
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
  // Modules - Automatically merges all 4 default modules so none are ever lost
  getModules() {
    const saved = loadStorage(STORAGE_KEYS.MODULES, null);
    if (!saved || saved.length === 0) {
      this.saveModules(INITIAL_MODULES);
      return INITIAL_MODULES;
    }

    // Merge: ensure all INITIAL_MODULES exist in the returned list and have their initial seed records
    const existingIds = new Set(saved.map((m) => m.id));
    const missing = INITIAL_MODULES.filter((m) => !existingIds.has(m.id));

    let merged = [...saved, ...missing];

    // Ensure mod_employees has default records if empty
    merged = merged.map((m) => {
      if (m.id === "mod_employees" && (!m.records || m.records.length === 0)) {
        const defaultMod = INITIAL_MODULES.find((im) => im.id === "mod_employees");
        return { ...m, records: defaultMod?.records || [] };
      }
      return m;
    });

    this.saveModules(merged);
    return merged;
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
  updateModuleFields(moduleId, fields) {
    return this.updateModule(moduleId, { fields });
  },
  deleteModule(moduleId) {
    const mods = this.getModules().filter((m) => m.id !== moduleId);
    this.saveModules(mods);
    return mods;
  },

  // Records inside a Module
  addRecord(moduleId, recordData, user) {
    const mods = this.getModules().map((m) => {
      if (m.id !== moduleId) return m;
      const newRec = {
        id: "REC-" + Date.now().toString().slice(-4),
        ...recordData,
        status: "pending",
        submittedBy: user?.fullName || "User",
        submittedAt: new Date().toLocaleString()
      };
      return {
        ...m,
        records: [newRec, ...(m.records || [])]
      };
    });
    this.saveModules(mods);
    return mods;
  },
  updateRecordStatus(moduleId, recordId, status, reviewerName) {
    const mods = this.getModules().map((m) => {
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
    const mods = this.getModules().map((m) => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        records: (m.records || []).filter((r) => r.id !== recordId)
      };
    });
    this.saveModules(mods);
    return mods;
  },

  // Users
  getUsers() {
    const saved = loadStorage(STORAGE_KEYS.USERS, null);
    if (!saved || saved.length === 0) {
      this.saveUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    const existingIds = new Set(saved.map((u) => u.id));
    const missing = INITIAL_USERS.filter((u) => !existingIds.has(u.id));
    let merged = [...saved, ...missing];

    // Ensure Ramesh (HR) is properly configured with Human Resources department and Employee Directory access
    merged = merged.map((u) => {
      if (u.id === "usr_hr" || u.email === "ramesh@erp.com") {
        return {
          ...u,
          department: "Human Resources",
          allowedModuleIds: ["mod_employees"],
          canApprove: false
        };
      }
      return u;
    });

    this.saveUsers(merged);
    return merged;
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

  // Reset to clean demo state
  resetAll() {
    saveStorage(STORAGE_KEYS.MODULES, INITIAL_MODULES);
    saveStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
};
