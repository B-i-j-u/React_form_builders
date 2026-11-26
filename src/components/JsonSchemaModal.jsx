import React, { useState } from "react";
import { X, Copy, Check, Upload, AlertCircle } from "lucide-react";

export default function JsonSchemaModal({
  isOpen,
  onClose,
  formMetadata,
  fields,
  onImportSchema
}) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customJson, setCustomJson] = useState("");
  const [importError, setImportError] = useState("");

  if (!isOpen) return null;

  const fullSchema = {
    metadata: formMetadata,
    fields: fields
  };

  const schemaString = JSON.stringify(fullSchema, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(schemaString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleStartImport = () => {
    setCustomJson(schemaString);
    setIsEditing(true);
    setImportError("");
  };

  const handleApplyImport = () => {
    try {
      const parsed = JSON.parse(customJson);
      if (!parsed.fields || !Array.isArray(parsed.fields)) {
        throw new Error("Invalid schema format: 'fields' array is required.");
      }
      onImportSchema(parsed.metadata || { title: "Imported Form", description: "" }, parsed.fields);
      setIsEditing(false);
      onClose();
    } catch (err) {
      setImportError(err.message || "Invalid JSON syntax");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">JSON Form Schema</h3>
            <p className="modal-subtitle">
              {isEditing 
                ? "Paste valid form schema JSON and apply to load" 
                : "This JSON represents the entire state of your dynamic form"}
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {isEditing ? (
            <div>
              <textarea
                className="json-textarea"
                rows={16}
                value={customJson}
                onChange={(e) => {
                  setCustomJson(e.target.value);
                  setImportError("");
                }}
              />
              {importError && (
                <div className="import-error">
                  <AlertCircle size={16} />
                  <span>{importError}</span>
                </div>
              )}
            </div>
          ) : (
            <pre className="json-code-block">
              <code>{schemaString}</code>
            </pre>
          )}
        </div>

        <div className="modal-footer">
          {isEditing ? (
            <div className="modal-footer-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleApplyImport}
              >
                <Upload size={16} /> Apply & Load Form
              </button>
            </div>
          ) : (
            <div className="modal-footer-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleStartImport}
              >
                <Upload size={16} /> Edit / Import Custom JSON
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleCopy}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied to Clipboard!" : "Copy JSON"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
