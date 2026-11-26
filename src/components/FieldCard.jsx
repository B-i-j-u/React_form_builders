import React from "react";
import FieldRenderer from "./FieldRenderer";
import { 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  GripVertical 
} from "lucide-react";

export default function FieldCard({
  field,
  index,
  totalFields,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDragStartSort,
  onDragOverSort,
  onDropSort,
  onAddColumn,
  onDeleteColumn,
  onUpdateColumn,
  onAddRow,
  onDeleteRow,
  onUpdateCell
}) {
  return (
    <div
      className={`field-card ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(field.id)}
      draggable
      onDragStart={(e) => onDragStartSort(e, index)}
      onDragOver={(e) => onDragOverSort(e, index)}
      onDrop={(e) => onDropSort(e, index)}
    >
      <div className="field-card-toolbar">
        <div className="field-card-left">
          <span className="field-drag-handle" title="Drag to reorder position">
            <GripVertical size={16} />
          </span>
          <span className="field-index-badge">#{index + 1}</span>
          <span className="field-type-badge">{field.type}</span>
          {field.required && <span className="field-required-pill">Required</span>}
        </div>

        <div className="field-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="action-icon-btn"
            disabled={index === 0}
            onClick={() => onMoveUp(index)}
            title="Move Up"
          >
            <ChevronUp size={16} />
          </button>

          <button
            type="button"
            className="action-icon-btn"
            disabled={index === totalFields - 1}
            onClick={() => onMoveDown(index)}
            title="Move Down"
          >
            <ChevronDown size={16} />
          </button>

          <button
            type="button"
            className="action-icon-btn"
            onClick={() => onDuplicate(field.id)}
            title="Duplicate Field"
          >
            <Copy size={16} />
          </button>

          <button
            type="button"
            className="action-icon-btn delete-btn"
            onClick={() => onDelete(field.id)}
            title="Delete Field"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div
        className="field-card-preview-area"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <FieldRenderer
          field={field}
          mode="builder"
          onAddColumn={onAddColumn}
          onDeleteColumn={onDeleteColumn}
          onUpdateColumn={onUpdateColumn}
          onAddRow={onAddRow}
          onDeleteRow={onDeleteRow}
          onUpdateCell={onUpdateCell}
        />
      </div>
    </div>
  );
}
