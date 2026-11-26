import { z } from "zod";

// ============================================================================
// 1. STRICT ZOD SCHEMAS FOR TYPESAFE FORM & INVOICE BUILDER
// ============================================================================

// Schema for Table Columns (<th>)
export const TableColumnSchema = z.object({
  id: z.string().min(1, "Column ID is required"),
  label: z.string().min(1, "Column Label is required"),
  type: z.enum(["text", "number", "date", "select"]).default("text"),
  width: z.string().optional().default("120px")
});

// Schema for Table Rows / Cells (<td>)
export const TableRowSchema = z.record(z.string(), z.any());

// Schema for Single Form Field
export const FormFieldSchema = z.object({
  id: z.string().min(1, "Field ID is required"),
  type: z.enum([
    "text",
    "textarea",
    "number",
    "email",
    "select",
    "radio",
    "checkbox",
    "date",
    "table",
    "po_header",
    "po_parties",
    "po_logistics",
    "po_items",
    "po_footer"
  ]),
  label: z.string().min(1, "Field Label is required"),
  placeholder: z.string().optional().default(""),
  required: z.boolean().optional().default(false),
  defaultValue: z.any().optional(),
  options: z.array(z.string()).optional(),
  
  // Table specific properties
  columns: z.array(TableColumnSchema).optional(),
  rows: z.array(TableRowSchema).optional(),
  items: z.array(TableRowSchema).optional(),

  // Purchase order / invoice specific block properties
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyFax: z.string().optional(),
  companyWebsite: z.string().optional(),
  poNumber: z.string().optional(),
  poDate: z.string().optional(),
  vendor: z.record(z.string(), z.any()).optional(),
  shipTo: z.record(z.string(), z.any()).optional(),
  requisitioner: z.string().optional(),
  shipVia: z.string().optional(),
  fob: z.string().optional(),
  shippingTerms: z.string().optional(),
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  shipping: z.number().optional(),
  other: z.number().optional(),
  total: z.number().optional(),
  comments: z.string().optional(),
  helpText: z.string().optional()
});

// Schema for the Full Form / Invoice Document
export const FormDocumentSchema = z.object({
  metadata: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().default("")
  }),
  fields: z.array(FormFieldSchema).min(1, "At least one field is required")
});

// ============================================================================
// 2. VALIDATION FUNCTION
// ============================================================================
export function validateFormDocument(rawData) {
  const result = FormDocumentSchema.safeParse(rawData);
  if (!result.success) {
    const formattedErrors = result.error.errors.map(err => ({
      path: err.path.join("."),
      message: err.message
    }));
    return {
      isValid: false,
      data: null,
      errors: formattedErrors
    };
  }

  return {
    isValid: true,
    data: result.data,
    errors: []
  };
}

// ============================================================================
// 3. DEFAULT BASE TEMPLATES BUILDER
// Returns the full, rich default template fields for each category
// ============================================================================

function makeId(prefix, text) {
  const clean = (text || "").toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20);
  return `${prefix}_${clean || Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
}

// Default Academic Admission Fields
function getDefaultAcademicFields() {
  return [
    {
      id: "fld_student_name",
      type: "text",
      label: "Student Full Legal Name (As per 10th Certificate)",
      placeholder: "e.g. Anand Kumar S",
      required: true
    },
    {
      id: "fld_dob",
      type: "date",
      label: "Date of Birth",
      required: true
    },
    {
      id: "fld_gender",
      type: "radio",
      label: "Gender",
      options: ["Male", "Female", "Other"],
      required: true
    },
    {
      id: "fld_student_email",
      type: "email",
      label: "Student Personal Email Address",
      placeholder: "student@example.com",
      required: true
    },
    {
      id: "fld_student_phone",
      type: "number",
      label: "Student Mobile Number",
      placeholder: "+91 98400 12345",
      required: true
    },
    {
      id: "fld_branch_pref",
      type: "select",
      label: "Preferred Engineering Program / Branch",
      options: [
        "B.E. Computer Science & AI",
        "B.Tech Information Technology",
        "B.E. Electronics & Communication",
        "B.E. Mechanical & Robotics",
        "B.Tech Data Science & Cyber Security"
      ],
      required: true
    },
    {
      id: "table_prev_academic_records",
      type: "table",
      label: "PREVIOUS ACADEMIC PERFORMANCE (10th & 12th)",
      columns: [
        { id: "col_exam", label: "EXAMINATION / CLASS", type: "text", width: "180px" },
        { id: "col_board", label: "BOARD / INSTITUTION", type: "text", width: "160px" },
        { id: "col_year", label: "PASSING YEAR", type: "text", width: "120px" },
        { id: "col_percentage", label: "PERCENTAGE / CGPA", type: "number", width: "140px" },
        { id: "col_cutoff", label: "CUTOFF MARK", type: "number", width: "120px" }
      ],
      rows: [
        { id: "row_1", col_exam: "Class 10 (SSLC / 10th)", col_board: "State Board / CBSE", col_year: "2024", col_percentage: 94.5, col_cutoff: 472 },
        { id: "row_2", col_exam: "Class 12 (HSC / 12th)", col_board: "State Board / CBSE", col_year: "2026", col_percentage: 96.2, col_cutoff: 195.5 }
      ]
    },
    {
      id: "fld_extracurricular",
      type: "textarea",
      label: "Extracurricular Achievements / Sports / Hackathons",
      placeholder: "Mention any state-level sports, coding competitions, or science fairs...",
      required: false
    }
  ];
}

// Current Academic Marks Table
function getCurrentAcademicMarksTable() {
  return {
    id: "table_current_academic_marks",
    type: "table",
    label: "CURRENT ACADEMIC MARKS & SEMESTER PERFORMANCE",
    columns: [
      { id: "col_sub_code", label: "SUBJECT CODE", type: "text", width: "120px" },
      { id: "col_sub_name", label: "COURSE / SUBJECT NAME", type: "text", width: "240px" },
      { id: "col_internal", label: "INTERNAL (40)", type: "number", width: "110px" },
      { id: "col_external", label: "SEMESTER EXAM (60)", type: "number", width: "140px" },
      { id: "col_total", label: "TOTAL (100)", type: "number", width: "110px" },
      { id: "col_grade", label: "GRADE", type: "text", width: "80px" },
      { id: "col_result", label: "RESULT", type: "text", width: "90px" }
    ],
    rows: [
      { id: "row_1", col_sub_code: "CS3401", col_sub_name: "Algorithms & Data Structures", col_internal: 38, col_external: 54, col_total: 92, col_grade: "O", col_result: "PASS" },
      { id: "row_2", col_sub_code: "CS3402", col_sub_name: "Operating Systems & Kernels", col_internal: 36, col_external: 51, col_total: 87, col_grade: "A+", col_result: "PASS" },
      { id: "row_3", col_sub_code: "CS3403", col_sub_name: "Database Management Systems", col_internal: 39, col_external: 56, col_total: 95, col_grade: "O", col_result: "PASS" },
      { id: "row_4", col_sub_code: "MA3451", col_sub_name: "Discrete Mathematics & Linear Algebra", col_internal: 35, col_external: 48, col_total: 83, col_grade: "A", col_result: "PASS" }
    ]
  };
}

// Default Hospital / Medical Bill Fields
function getDefaultHospitalFields() {
  return [
    {
      id: "field_patient_parties",
      type: "po_parties",
      label: "HOSPITAL & PATIENT PARTICULARS",
      vendor: {
        title: "HOSPITAL / PHARMACY",
        name: "Apollo Healthcare & Specialty Hospitals",
        contact: "Dr. K. Senthil Nathan, MD",
        address: "142 Anna Salai, Thousand Lights",
        cityState: "Chennai, TN 600006",
        phone: "(044) 2829-0200"
      },
      shipTo: {
        title: "PATIENT PARTICULARS",
        name: "Mr. R. Rajesh Kumar (Age: 38 / M)",
        company: "UHID: AP-2026-88914",
        address: "Plot 12, Gandhi Nagar 2nd Street",
        cityState: "Adyar, Chennai 600020",
        phone: "+91 98401 23456"
      }
    },
    {
      id: "table_prescribed_medicines",
      type: "table",
      label: "PRESCRIBED MEDICINES & PHARMACY SUPPLIES",
      columns: [
        { id: "col_med_name", label: "MEDICINE / ITEM NAME", type: "text", width: "240px" },
        { id: "col_batch", label: "BATCH NO", type: "text", width: "110px" },
        { id: "col_expiry", label: "EXPIRY", type: "text", width: "100px" },
        { id: "col_qty", label: "QTY", type: "number", width: "80px" },
        { id: "col_rate", label: "MRP (₹)", type: "number", width: "110px" },
        { id: "col_gst", label: "GST %", type: "text", width: "80px" }
      ],
      rows: [
        { id: "row_1", col_med_name: "Augmentin 625 Duo Tablet (10s)", col_batch: "AUG982", col_expiry: "12/2027", col_qty: 2, col_rate: 204.50, col_gst: "12%" },
        { id: "row_2", col_med_name: "Pan-D Gastro Capsule (15s)", col_batch: "PND104", col_expiry: "09/2028", col_qty: 2, col_rate: 198.00, col_gst: "12%" },
        { id: "row_3", col_med_name: "Dolo 650mg Paracetamol (15s)", col_batch: "DL650B", col_expiry: "05/2029", col_qty: 3, col_rate: 34.20, col_gst: "5%" }
      ]
    },
    {
      id: "field_doctor_instructions",
      type: "textarea",
      label: "Doctor's Dosage Directions & Discharge Instructions",
      placeholder: "Take prescribed medicines after food. Review in outpatient clinic after 7 days.",
      required: false
    },
    {
      id: "field_hospital_footer",
      type: "po_footer",
      label: "BILL TOTALS & PHARMACIST AUTHORIZATION",
      subtotal: 907.60,
      tax: 98.40,
      shipping: 0,
      other: 0,
      total: 1006.00,
      comments: "Original receipt valid for insurance mediclaim reimbursement."
    }
  ];
}

// Default IT Consulting Fields
function getDefaultSoftwareFields() {
  return [
    {
      id: "field_it_header",
      type: "po_header",
      label: "CONSULTING INVOICE HEADER",
      companyName: "DEVFORGE SOLUTIONS INC.",
      companyAddress: "Level 4, Tidel Park, Rajiv Gandhi Salai",
      companyPhone: "+91 44 4890 1200",
      companyFax: "GSTIN: 33AAAAA0000A1Z5",
      companyWebsite: "https://devforge.io",
      poNumber: "INV-2026-DEV49",
      poDate: new Date().toISOString().split("T")[0]
    },
    {
      id: "field_it_parties",
      type: "po_parties",
      label: "DEVELOPER & CLIENT PARTICULARS",
      vendor: {
        title: "CONSULTANT (FROM)",
        name: "DevForge Solutions Inc.",
        contact: "Lead Full-Stack Architect",
        address: "Tidel Park, Taramani",
        cityState: "Chennai, TN 600113",
        phone: "+91 98410 99887"
      },
      shipTo: {
        title: "CLIENT (BILLED TO)",
        name: "Acme Fintech Corp.",
        company: "Engineering & Product Division",
        address: "500 Howard Street, Suite 400",
        cityState: "San Francisco, CA 94105",
        phone: "+1 (415) 555-0199"
      }
    },
    {
      id: "table_it_sprint_tasks",
      type: "table",
      label: "BILLABLE SPRINT TASKS & DELIVERABLES",
      columns: [
        { id: "col_task", label: "TASK / MODULE DESCRIPTION", type: "text", width: "260px" },
        { id: "col_hours", label: "HOURS", type: "number", width: "90px" },
        { id: "col_rate", label: "HOURLY RATE ($)", type: "number", width: "130px" },
        { id: "col_tax", label: "TAX %", type: "text", width: "80px" }
      ],
      rows: [
        { id: "row_1", col_task: "React Form Builder & DnD Architecture", col_hours: 32, col_rate: 65, col_tax: "18%" },
        { id: "row_2", col_task: "TypeSafe AI & Zod Runtime Schema Integration", col_hours: 18, col_rate: 75, col_tax: "18%" },
        { id: "row_3", col_task: "E-Invoice GST Table Calculation & PDF Generation", col_hours: 24, col_rate: 65, col_tax: "18%" }
      ]
    },
    {
      id: "field_it_footer",
      type: "po_footer",
      label: "PAYMENT TERMS & WIRE TRANSFER INFO",
      subtotal: 5010.00,
      tax: 901.80,
      shipping: 0,
      other: 0,
      total: 5911.80,
      comments: "Wire Transfer: Chase Bank NY, Account: 9876543210, Swift: CHASUS33. Due in 15 days."
    }
  ];
}

// Default Commercial Purchase Order / Invoice Fields
function getDefaultInvoiceFields() {
  return [
    {
      id: "hdr_po_default",
      type: "po_header",
      label: "COMMERCIAL INVOICE HEADER",
      companyName: "GLOBAL TRADING VENTURES LTD.",
      companyAddress: "77 Industrial Cyber Corridor, Tech Park",
      companyPhone: "+91 80 4123 9000",
      companyFax: "GSTIN: 29AABCU9603R1ZM",
      companyWebsite: "https://globaltrading.example.com",
      poNumber: "PO-" + Math.floor(100000 + Math.random() * 900000),
      poDate: new Date().toISOString().split("T")[0]
    },
    {
      id: "party_po_default",
      type: "po_parties",
      label: "VENDOR & SHIP TO PARTICULARS",
      vendor: {
        title: "VENDOR (SUPPLIER)",
        name: "Apex Hardware & Components Corp.",
        contact: "Sales Operations",
        address: "88 Logistics Boulevard",
        cityState: "Bengaluru, KA 560100",
        phone: "+91 80 2854 3322"
      },
      shipTo: {
        title: "SHIP TO (DELIVERY)",
        name: "Global Trading Central Warehouse",
        company: "Receiving Bay 4",
        address: "Plot 19 Electronic City Phase 1",
        cityState: "Bengaluru, KA 560100",
        phone: "+91 80 4123 9015"
      }
    },
    {
      id: "logistics_po_default",
      type: "po_logistics",
      label: "SHIPPING & LOGISTICS STRIP",
      requisitioner: "Operations Lead",
      shipVia: "Blue Dart Surface Express",
      fob: "Origin / Destination",
      shippingTerms: "Net 30 Days"
    },
    {
      id: "table_po_items_default",
      type: "po_items",
      label: "PURCHASE ORDER LINE ITEMS GRID",
      columns: [
        { id: "itemNo", label: "ITEM #", width: "110px" },
        { id: "description", label: "DESCRIPTION", width: "240px" },
        { id: "qty", label: "QTY", width: "80px" },
        { id: "unitPrice", label: "UNIT PRICE ($)", width: "120px" },
        { id: "total", label: "TOTAL ($)", width: "110px" }
      ],
      rows: [
        { id: "row_1", itemNo: "IT-8841", description: "Industrial Microcontroller Boards", qty: 25, unitPrice: 85.00, total: 2125.00 },
        { id: "row_2", itemNo: "PW-9902", description: "Heavy Duty Power Supply 24V 10A", qty: 10, unitPrice: 42.50, total: 425.00 }
      ]
    },
    {
      id: "ftr_po_default",
      type: "po_footer",
      label: "TOTALS & AUTHORIZATION",
      subtotal: 2550.00,
      tax: 229.50,
      shipping: 50.00,
      other: 0,
      total: 2829.50,
      comments: "All goods must conform to quality inspection specifications."
    }
  ];
}

// ============================================================================
// 4. INFER FIELD TYPE FOR EXTRA REQUESTED ITEMS
// ============================================================================
function inferExtraFieldConfig(rawText) {
  const clean = rawText.trim();
  const lower = clean.toLowerCase();

  // 1. Cutoff mark
  if (lower.includes("cutoff")) {
    return {
      type: "number",
      label: "12th Standard Cutoff Mark",
      placeholder: "e.g. 195.5 / 200",
      required: true
    };
  }

  // 2. Hostel Requirement
  if (lower.includes("hostel")) {
    return {
      type: "radio",
      label: "Hostel Accommodation Required?",
      options: ["Yes (Hostel Required)", "No (Day Scholar)"],
      required: true
    };
  }

  // 3. Transport / Bus
  if (lower.includes("transport") || lower.includes("bus")) {
    return {
      type: "radio",
      label: "College Bus Transport Required?",
      options: ["Yes (Opt for College Bus)", "No (Own Transport)"],
      required: false
    };
  }

  // 4. Father / Parent Name
  if (lower.includes("father") || lower.includes("parent name")) {
    return {
      type: "text",
      label: "Father / Guardian Full Name",
      placeholder: "Enter father's name",
      required: true
    };
  }

  // 5. Mother Name
  if (lower.includes("mother")) {
    return {
      type: "text",
      label: "Mother's Full Name",
      placeholder: "Enter mother's name",
      required: false
    };
  }

  // 6. Parent Phone / Emergency contact
  if (lower.includes("parent phone") || lower.includes("emergency contact") || lower.includes("parent contact")) {
    return {
      type: "number",
      label: "Parent / Emergency Contact Number",
      placeholder: "+91 98400 99887",
      required: true
    };
  }

  // 7. Blood Group
  if (lower.includes("blood")) {
    return {
      type: "select",
      label: "Blood Group",
      options: ["O+ Positive", "O- Negative", "A+ Positive", "A- Negative", "B+ Positive", "B- Negative", "AB+ Positive", "AB- Negative"],
      required: true
    };
  }

  // 8. Aadhar / ID
  if (lower.includes("aadhar") || lower.includes("aadhaar") || lower.includes("identity")) {
    return {
      type: "text",
      label: "Aadhar / National ID Number",
      placeholder: "12-digit UIDAI number",
      required: true
    };
  }

  // 9. Community / Category
  if (lower.includes("community") || lower.includes("caste") || lower.includes("category")) {
    return {
      type: "select",
      label: "Community / Category",
      options: ["OC (Open Competition)", "BC (Backward Class)", "BCM (Backward Muslim)", "MBC (Most Backward)", "SC (Scheduled Caste)", "ST (Scheduled Tribe)"],
      required: true
    };
  }

  // 10. First Graduate
  if (lower.includes("first graduate")) {
    return {
      type: "radio",
      label: "First Graduate in Family?",
      options: ["Yes (Eligible for Tuition Concession)", "No"],
      required: true
    };
  }

  // 11. Date / DOB / Expiry
  if (lower.includes("date") || lower.includes("dob") || lower.includes("birth") || lower.includes("joining") || lower.includes("expiry")) {
    return {
      type: "date",
      label: formatLabel(clean),
      required: true
    };
  }

  // 12. Email
  if (lower.includes("email") || lower.includes("mail")) {
    return {
      type: "email",
      label: formatLabel(clean),
      placeholder: "user@example.com",
      required: true
    };
  }

  // 13. Number / Qty / Rate / Phone / Salary / Mark / Fee
  if (
    lower.includes("phone") || 
    lower.includes("mobile") || 
    lower.includes("mark") || 
    lower.includes("score") || 
    lower.includes("gpa") || 
    lower.includes("cgpa") || 
    lower.includes("age") || 
    lower.includes("price") || 
    lower.includes("rate") || 
    lower.includes("fee") || 
    lower.includes("salary") || 
    lower.includes("hours") || 
    lower.includes("qty")
  ) {
    return {
      type: "number",
      label: formatLabel(clean),
      placeholder: "0",
      required: true
    };
  }

  // 14. Textarea
  if (
    lower.includes("address") || 
    lower.includes("comment") || 
    lower.includes("note") || 
    lower.includes("feedback") || 
    lower.includes("reason") || 
    lower.includes("instruction") || 
    lower.includes("description")
  ) {
    return {
      type: "textarea",
      label: formatLabel(clean),
      placeholder: `Enter ${clean.toLowerCase()}...`,
      required: false
    };
  }

  // Default text field
  return {
    type: "text",
    label: formatLabel(clean),
    placeholder: `Enter ${clean.toLowerCase()}...`,
    required: true
  };
}

function formatLabel(str) {
  return str
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ============================================================================
// 5. MASTER GENERATOR: RETAINS FULL DEFAULTS + DYNAMICALLY ADDS ALL EXTRA PROMPTS!
// ============================================================================
export function generateLocalTypeSafeForm(promptText) {
  const rawPrompt = promptText || "";
  const promptLower = rawPrompt.toLowerCase();

  // Category classification
  const isHospital = promptLower.includes("pharmacy") || promptLower.includes("hospital") || promptLower.includes("doctor") || promptLower.includes("medical") || promptLower.includes("patient");
  const isAcademic = (promptLower.includes("college") || promptLower.includes("school") || promptLower.includes("admission") || promptLower.includes("student") || promptLower.includes("academic") || promptLower.includes("marks")) && !isHospital;
  const isSoftware = promptLower.includes("software") || promptLower.includes("consulting") || promptLower.includes("freelance") || promptLower.includes("it consulting") || promptLower.includes("sprint");
  const isInvoice = (promptLower.includes("invoice") || promptLower.includes("purchase order") || promptLower.includes("po ") || promptLower.includes("bill") || promptLower.includes("receipt")) && !isHospital && !isSoftware;

  let docTitle = "CUSTOM FORM & APPLICATION";
  let baseFields = [];

  // 1. LOAD FULL DEFAULT FOUNDATION TEMPLATE
  if (isAcademic) {
    docTitle = "ACADEMIC ADMISSION & STUDENT REGISTRATION FORM";
    baseFields = getDefaultAcademicFields();
  } else if (isHospital) {
    docTitle = "HEALTHCARE & CLINICAL MEDICAL INVOICE";
    baseFields = getDefaultHospitalFields();
  } else if (isSoftware) {
    docTitle = "IT CONSULTING & SERVICES BILL";
    baseFields = getDefaultSoftwareFields();
  } else if (isInvoice) {
    docTitle = "COMMERCIAL TAX INVOICE & PURCHASE ORDER";
    baseFields = getDefaultInvoiceFields();
  } else {
    // Generic base
    docTitle = "CUSTOM DATA COLLECTION FORM";
    baseFields = [
      { id: "fld_full_name", type: "text", label: "Full Name", required: true },
      { id: "fld_email", type: "email", label: "Email Address", required: true },
      { id: "fld_phone", type: "number", label: "Contact Phone Number", required: true }
    ];
  }

  // Deep clone default fields
  const finalFields = JSON.parse(JSON.stringify(baseFields));
  const existingLabelsLower = new Set(finalFields.map(f => (f.label || "").toLowerCase()));
  const existingIds = new Set(finalFields.map(f => f.id));

  // 2. CHECK SPECIFIC EXTRA FEATURE: CURRENT ACADEMIC MARKS TABLE
  if (
    promptLower.includes("current academic mark") || 
    promptLower.includes("current academic marks") || 
    promptLower.includes("current mark") ||
    promptLower.includes("current semester") ||
    promptLower.includes("semester mark") ||
    promptLower.includes("semester marks") ||
    promptLower.includes("internal mark")
  ) {
    if (!existingIds.has("table_current_academic_marks")) {
      // Insert right after student details or after previous marks table
      const marksTable = getCurrentAcademicMarksTable();
      finalFields.push(marksTable);
      existingIds.add(marksTable.id);
      existingLabelsLower.add(marksTable.label.toLowerCase());
    }
  }

  // 3. PARSE PROMPT FOR ANY OTHER EXTRA REQUESTED FIELDS
  const delimitersRegex = /[,;]|\b(?:with|and|including|includes|having|contain|contains|consists of|also|need|needs|plus|extra)\b/gi;
  const segments = rawPrompt.split(delimitersRegex)
    .map(s => s.trim())
    .filter(s => s.length > 1);

  const verbPrefixes = /^(create|build|make|add|generate|design|i want|i need|please|form|invoice|table)\s+/gi;

  segments.forEach((seg, index) => {
    let clean = seg.replace(verbPrefixes, "").trim();
    if (!clean || clean.length < 2) return;

    const lower = clean.toLowerCase();

    // Skip the segment if it's just naming the overall document
    if (
      index === 0 && 
      (lower.includes("form") || lower.includes("bill") || lower.includes("invoice") || lower.includes("card") || lower.includes("sheet"))
    ) {
      return;
    }

    if (
      lower === "form" || 
      lower === "invoice" || 
      lower === "builder" || 
      lower === "e-invoice" || 
      lower === "application" ||
      lower.endsWith("admission form") ||
      lower.endsWith("registration form")
    ) {
      return;
    }

    // Skip if it refers to current academic marks table which was already added
    if (
      (lower.includes("current academic mark") || lower.includes("semester mark") || lower.includes("current mark")) &&
      existingIds.has("table_current_academic_marks")
    ) {
      return;
    }

    // Check if this label or a similar label already exists in defaults
    const isAlreadyPresent = Array.from(existingLabelsLower).some(ex => 
      ex.includes(lower) || lower.includes(ex)
    );

    if (isAlreadyPresent) {
      return; // Already in the default template!
    }

    // New Extra Field Requested by User!
    const extraConfig = inferExtraFieldConfig(clean);
    const newField = {
      id: makeId("extra", lower),
      ...extraConfig
    };

    finalFields.push(newField);
    existingLabelsLower.add(newField.label.toLowerCase());
    existingIds.add(newField.id);
  });

  const rawDocument = {
    metadata: {
      title: docTitle,
      description: `Default template preserved + Extra requested prompt features applied: "${rawPrompt}"`
    },
    fields: finalFields
  };

  return validateFormDocument(rawDocument);
}
