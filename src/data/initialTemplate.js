export const INITIAL_FORM_TEMPLATE = [
  {
    id: "field_1",
    type: "text",
    label: "Full Name",
    placeholder: "e.g. Alex Johnson",
    helperText: "Enter your legal first and last name",
    required: true,
    defaultValue: ""
  },
  {
    id: "field_2",
    type: "email",
    label: "Work Email Address",
    placeholder: "alex@company.com",
    helperText: "Official email for confirmation",
    required: true,
    defaultValue: ""
  },
  {
    id: "field_3",
    type: "select",
    label: "Department",
    placeholder: "-- Select Department --",
    helperText: "Select which team you belong to",
    required: false,
    options: ["Engineering", "Product Design", "Marketing", "Customer Support", "Operations"],
    defaultValue: ""
  },
  {
    id: "field_4",
    type: "radio",
    label: "Employment Type",
    helperText: "Select your contract status",
    required: true,
    options: ["Full-time", "Part-time", "Contractor"],
    defaultValue: "Full-time"
  },
  {
    id: "field_5",
    type: "checkbox",
    label: "I agree to the company remote work policies",
    helperText: "Mandatory compliance checkbox",
    required: true,
    defaultValue: false
  }
];

// Exact Purchase Order Template matching user's image
export const PURCHASE_ORDER_TEMPLATE = [
  {
    id: "po_company_header",
    type: "po_header",
    label: "Header & Document Details",
    companyName: "[Company Name]",
    streetAddress: "[Street Address]",
    cityStateZip: "[City, ST ZIP]",
    phone: "(000) 000-0000",
    fax: "(000) 000-0000",
    website: "www.example.com",
    docTitle: "PURCHASE ORDER",
    date: "9/17/2026",
    poNumber: "123456",
    required: true
  },
  {
    id: "po_parties_section",
    type: "po_parties",
    label: "Vendor & Ship-To Details",
    vendor: {
      title: "VENDOR",
      companyName: "[Company Name]",
      contact: "[Contact or Department]",
      streetAddress: "[Street Address]",
      cityStateZip: "[City, ST ZIP]",
      phone: "(000) 000-0000",
      fax: "(000) 000-0000"
    },
    shipTo: {
      title: "SHIP TO",
      name: "[Name]",
      companyName: "[Company Name]",
      streetAddress: "[Street Address]",
      cityStateZip: "[City, ST ZIP]",
      phone: "[Phone]"
    },
    required: true
  },
  {
    id: "po_logistics_strip",
    type: "po_logistics",
    label: "Shipping & Terms Strip",
    requisitioner: "",
    shipVia: "",
    fob: "",
    shippingTerms: "",
    required: false
  },
  {
    id: "po_items_grid",
    type: "po_items",
    label: "Purchase Order Line Items Grid",
    currency: "$",
    columns: [
      { id: "itemNo", label: "ITEM #", width: "120px" },
      { id: "description", label: "DESCRIPTION", width: "auto" },
      { id: "qty", label: "QTY", width: "80px" },
      { id: "unitPrice", label: "UNIT PRICE", width: "120px" },
      { id: "total", label: "TOTAL", width: "130px" }
    ],
    rows: [
      { id: "row_1", itemNo: "23423423", description: "Product XYZ", qty: 15, unitPrice: 150.00 },
      { id: "row_2", itemNo: "45645645", description: "Product ABC", qty: 1, unitPrice: 75.00 }
    ],
    minRows: 12,
    required: true
  },
  {
    id: "po_totals_and_comments",
    type: "po_footer",
    label: "Comments & Totals Calculation",
    commentsTitle: "Comments or Special Instructions",
    comments: "",
    currency: "$",
    taxRate: 0,
    taxAmount: 0,
    shippingAmount: 0,
    otherAmount: 0,
    contactNotice: "If you have any questions about this purchase order, please contact\n[Name, Phone #, E-mail]",
    required: true
  }
];

export const E_INVOICE_TEMPLATE = PURCHASE_ORDER_TEMPLATE;
