import React, { useState } from "react";
import FieldCard from "./FieldCard";
import { PlusCircle, FormInput } from "lucide-react";

export default function Canvas({
  formMetadata,
  onUpdateMetadata,
  fields,
  selectedFieldId,
  onSelectField,
  onAddFieldByType,
  onDeleteField,
  onDuplicateField,
  onMoveField,
  onReorderFields,
  onAddColumn,
  onDeleteColumn,
  onUpdateColumn,
  onAddRow,
  onDeleteRow,
  onUpdateCell
}) {
  const [isOverCanvas, setIsOverCanvas] = useState(false);
  const [draggedSortIndex, setDraggedSortIndex] = useState(null);

  // Drag & Drop handlers for new elements from Toolbox
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
      onAddFieldByType(fieldType);
      return;
    }
  };

  // Reordering handlers within Canvas
  const handleDragStartSort = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
    e.dataTransfer.effectAllowed = "move";
    setDraggedSortIndex(index);
  };

  const handleDragOverSort = (e, index) => {
    e.preventDefault();
  };

  const handleDropSort = (e, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedSortIndex === null || draggedSortIndex === targetIndex) return;

    onReorderFields(draggedSortIndex, targetIndex);
    setDraggedSortIndex(null);
  };

  return (
    <main className="canvas-wrapper">
      {/* Form Title & Subtitle banner */}
      <div className="canvas-form-header">
        <input
          type="text"
          value={formMetadata.title}
          onChange={(e) => onUpdateMetadata({ ...formMetadata, title: e.target.value })}
          placeholder="Form Title..."
          className="canvas-title-input"
        />
        <input
          type="text"
          value={formMetadata.description}
          onChange={(e) => onUpdateMetadata({ ...formMetadata, description: e.target.value })}
          placeholder="Add a short description or instructions for respondents..."
          className="canvas-desc-input"
        />
      </div>

      {/* Drop Zone Area */}
      <div
        className={`canvas-drop-zone ${isOverCanvas ? "drag-over" : ""} ${fields.length === 0 ? "empty" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {fields.length === 0 ? (
          <div className="canvas-empty-state">
            <div className="empty-icon-circle">
              <PlusCircle size={36} />
            </div>
            <h3>Your form canvas is empty</h3>
            <p>
              Drag inputs or tables from the <strong>Toolbox</strong> on the left, or click the <strong>+</strong> button to get started.
            </p>
          </div>
        ) : (
          <div className="fields-container">
            {fields.map((field, index) => (
              <FieldCard
                key={field.id}
                field={field}
                index={index}
                totalFields={fields.length}
                isSelected={field.id === selectedFieldId}
                onSelect={onSelectField}
                onDelete={onDeleteField}
                onDuplicate={onDuplicateField}
                onMoveUp={(idx) => onMoveField(idx, idx - 1)}
                onMoveDown={(idx) => onMoveField(idx, idx + 1)}
                onDragStartSort={handleDragStartSort}
                onDragOverSort={handleDragOverSort}
                onDropSort={handleDropSort}
                onAddColumn={onAddColumn}
                onDeleteColumn={onDeleteColumn}
                onUpdateColumn={onUpdateColumn}
                onAddRow={onAddRow}
                onDeleteRow={onDeleteRow}
                onUpdateCell={onUpdateCell}
              />
            ))}

            {/* Bottom helper drop target */}
            <div className="canvas-bottom-drop-indicator">
              <FormInput size={18} />
              <span>Drag & drop elements here to append to bottom</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
