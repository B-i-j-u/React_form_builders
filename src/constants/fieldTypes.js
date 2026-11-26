import { 
  Type, 
  Hash, 
  ChevronDown, 
  AlignLeft, 
  Calendar, 
  CheckSquare, 
  Table,
  FileText,
  Building2,
  Receipt,
  Calculator,
  FileSpreadsheet
} from "lucide-react";

export const AVAILABLE_FIELDS = [
  // --- Standard Form Fields ---
  {
    type: "text",
    category: "general",
    label: "Text Field",
    description: "Single-line text (e.g. Product Name, Supplier)",
    icon: Type,
    defaultConfig: {
      label: "Field Label",
      placeholder: "Enter value...",
      required: false,
      defaultValue: ""
    }
  },
  {
    type: "number",
    category: "general",
    label: "Number / Price",
    description: "Numeric or currency (e.g. Price, Quantity)",
    icon: Hash,
    defaultConfig: {
      label: "Amount / Quantity",
      placeholder: "0.00",
      required: false,
      min: 0,
      defaultValue: ""
    }
  },
  {
    type: "select",
    category: "general",
    label: "Dropdown Select",
    description: "Select from options (e.g. Category, Status)",
    icon: ChevronDown,
    defaultConfig: {
      label: "Select Option",
      options: ["Option 1", "Option 2", "Option 3"],
      required: false,
      defaultValue: "Option 1"
    }
  },
  {
    type: "textarea",
    category: "general",
    label: "Long Text / Notes",
    description: "Multi-line text (e.g. Description, Specs)",
    icon: AlignLeft,
    defaultConfig: {
      label: "Description",
      placeholder: "Enter detailed notes...",
      required: false,
      rows: 3
    }
  },
  {
    type: "date",
    category: "general",
    label: "Date Picker",
    description: "Date field (e.g. Delivery Date, Expiry Date)",
    icon: Calendar,
    defaultConfig: {
      label: "Date",
      required: false
    }
  },
  {
    type: "checkbox",
    category: "general",
    label: "Checkbox / Toggle",
    description: "Boolean yes/no option (e.g. Is Active, Taxable)",
    icon: CheckSquare,
    defaultConfig: {
      label: "Active Status",
      checkboxLabel: "Enable this item",
      checked: true
    }
  },
  {
    type: "table",
    category: "general",
    label: "Dynamic Grid / Table",
    description: "Multi-column sub-table (e.g. Batch, Units, Specs)",
    icon: Table,
    defaultConfig: {
      label: "Item Specifications Grid",
      columns: [
        { id: "col_1", label: "Spec / Item", type: "text" },
        { id: "col_2", label: "Value / Qty", type: "text" },
        { id: "col_3", label: "Remarks", type: "text" }
      ],
      rows: [
        { id: "row_1", col_1: "Standard Pack", col_2: "10 Units", col_3: "Warehouse A" }
      ]
    }
  },

  // --- Invoice & Purchase Order Tools (Image 2 Specification) ---
  {
    type: "po_header",
    category: "invoice",
    label: "Company Header & PO #",
    description: "Company address, PO #, and Order Date block",
    icon: FileText,
    defaultConfig: {
      label: "Purchase Order Header",
      companyName: "[Company Name]",
      streetAddress: "[Street Address, City, ST ZIP]",
      phone: "Phone: (000) 000-0000",
      poNumber: "123456",
      poDate: "2026-11-26"
    }
  },
  {
    type: "po_parties",
    category: "invoice",
    label: "Vendor & Ship-To Blocks",
    description: "Side-by-side Vendor and Shipping destination details",
    icon: Building2,
    defaultConfig: {
      label: "Vendor & Shipping Destination",
      vendorName: "[Vendor Company Name]",
      vendorContact: "[Contact or Department]",
      vendorAddress: "[Vendor Street Address, City, ZIP]",
      vendorPhone: "[Vendor Phone]",
      shipToName: "[Ship-To Name / Branch]",
      shipToAddress: "[Ship-To Street Address, City, ZIP]"
    }
  },
  {
    type: "po_items",
    category: "invoice",
    label: "PO Line Items Grid",
    description: "Multi-row table: Item #, Description, Qty, Unit Price, Total",
    icon: Receipt,
    defaultConfig: {
      label: "Purchase Order Line Items Grid",
      currency: "₹",
      items: [
        { itemNo: "23423423", description: "Product XYZ Enterprise Units", qty: 15, unitPrice: 150.00, total: 2250.00 },
        { itemNo: "46846846", description: "Product ABC Standard Accessories", qty: 1, unitPrice: 75.00, total: 75.00 }
      ]
    }
  },
  {
    type: "po_summary",
    category: "invoice",
    label: "Financial Summary & Taxes",
    description: "Subtotal, Tax %, Shipping, Other Charges and Grand Total",
    icon: Calculator,
    defaultConfig: {
      label: "Order Financial Summary",
      subtotal: "2,325.00",
      taxRate: "18%",
      taxAmount: "418.50",
      shippingCharges: "150.00",
      grandTotal: "2,893.50"
    }
  },
  {
    type: "po_instructions",
    category: "invoice",
    label: "Comments & Shipping Terms",
    description: "Requisitioner, Ship Via, FOB, Terms and Special Instructions",
    icon: FileSpreadsheet,
    defaultConfig: {
      label: "Terms & Special Instructions",
      requisitioner: "Operations Lead",
      shipVia: "Surface Express Cargo",
      shippingTerms: "F.O.B. Destination",
      instructions: "Deliver to dock #3 during regular business hours."
    }
  }
];

// 1-Click Complete Purchase Order / Invoice Template Preset
export const INVOICE_PO_TEMPLATE_PRESET = [
  {
    id: "fld_po_header",
    type: "po_header",
    label: "Purchase Order Header",
    companyName: "Acme Industrial Corporation",
    streetAddress: "100 Industrial Parkway, Chennai, TN 600001",
    phone: "+91 44 2828 9000",
    poNumber: "PO-2026-8819",
    poDate: "2026-11-26"
  },
  {
    id: "fld_po_parties",
    type: "po_parties",
    label: "Vendor & Shipping Destination",
    vendorName: "Global Silicon Semiconductor Ltd",
    vendorContact: "Sales & Supply Division",
    vendorAddress: "42 Tech Park Avenue, Bengaluru, KA 560100",
    vendorPhone: "+91 80 4111 2200",
    shipToName: "Acme Warehouse #2",
    shipToAddress: "Plot 14, Ambattur Industrial Estate, Chennai"
  },
  {
    id: "fld_po_items",
    type: "po_items",
    label: "Purchase Order Line Items Grid",
    currency: "₹",
    items: [
      { itemNo: "PRD-101", description: "Dell Latitude Laptop 16GB / 512GB SSD", qty: 10, unitPrice: 52000, total: 520000 },
      { itemNo: "PRD-102", description: "Logitech MX Master Wireless Mouse", qty: 20, unitPrice: 6500, total: 130000 }
    ]
  },
  {
    id: "fld_po_instructions",
    type: "po_instructions",
    label: "Terms & Special Instructions",
    requisitioner: "Senthil Nathan (Manager)",
    shipVia: "BlueDart Express Surface",
    shippingTerms: "Net 30 Days F.O.B.",
    instructions: "Verify warranty seals upon delivery and sign gate-pass copy."
  },
  {
    id: "fld_po_summary",
    type: "po_summary",
    label: "Order Financial Summary",
    subtotal: "6,50,000.00",
    taxRate: "18% GST",
    taxAmount: "1,17,000.00",
    shippingCharges: "2,500.00",
    grandTotal: "7,69,500.00"
  }
];
