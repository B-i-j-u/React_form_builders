import { 
  Type, 
  Hash, 
  ChevronDown, 
  AlignLeft, 
  Calendar, 
  CheckSquare, 
  Table 
} from "lucide-react";

export const AVAILABLE_FIELDS = [
  {
    type: "text",
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
  }
];
