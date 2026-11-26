import React from "react";
import { X, BookOpen, Layers, Move, Sliders, CheckCircle } from "lucide-react";

export default function GuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <BookOpen size={22} className="text-primary" />
            <div>
              <h3 className="modal-title">Beginner Guide: How This Form Builder Works</h3>
              <p className="modal-subtitle">Step-by-step breakdown of concepts and code architecture</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body guide-scroll-body">
          {/* Section 1 */}
          <div className="guide-card">
            <div className="guide-card-header">
              <Layers size={18} className="text-primary" />
              <h4>1. What is a Form Builder?</h4>
            </div>
            <p>
              In traditional React, every form is hardcoded in JSX with static <code>&lt;input&gt;</code> tags.
              A <strong>Form Builder</strong> shifts this paradigm by representing every question as a <strong>JavaScript Object (JSON Schema)</strong>:
            </p>
            <pre className="guide-code">
{`{
  id: "field_1",
  type: "text",
  label: "Full Name",
  placeholder: "e.g. John Doe",
  required: true
}`}
            </pre>
            <p>
              When an input is added, reordered, or edited, we simply update this array in React state.
              The <code>FieldRenderer</code> component reads the array and generates the matching inputs on the fly.
            </p>
          </div>

          {/* Section 2 */}
          <div className="guide-card">
            <div className="guide-card-header">
              <Move size={18} className="text-primary" />
              <h4>2. How Drag and Drop (DnD) Works Here</h4>
            </div>
            <p>
              This app uses the native browser HTML5 Drag and Drop API:
            </p>
            <ul className="guide-list">
              <li>
                <strong>Toolbox (Source):</strong> Each component card has <code>draggable=&#123;true&#125;</code>.
                When dragged, <code>onDragStart</code> packs the field type into <code>e.dataTransfer.setData(...)</code>.
              </li>
              <li>
                <strong>Canvas (Target):</strong> The drop zone listens to <code>onDragOver</code> and runs <code>e.preventDefault()</code> to unlock dropping.
              </li>
              <li>
                <strong>Drop Event:</strong> When released, <code>onDrop</code> unpacks the field type, generates a unique ID (<code>field_timestamp</code>), and appends it to the <code>fields</code> state array.
              </li>
              <li>
                <strong>Reordering:</strong> Each card inside the canvas can also be dragged over another card to reorder using simple array index swapping!
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="guide-card">
            <div className="guide-card-header">
              <Sliders size={18} className="text-primary" />
              <h4>3. The 3-Panel State Architecture</h4>
            </div>
            <p>
              Everything in this app is coordinated through single-source-of-truth state in <code>App.jsx</code>:
            </p>
            <div className="guide-grid-3">
              <div className="guide-col">
                <strong>Left: Toolbox</strong>
                <p>Palette of component definitions ready to be dropped into the canvas.</p>
              </div>
              <div className="guide-col">
                <strong>Center: Canvas</strong>
                <p>Iterates over <code>fields.map()</code>, rendering each input card and reorder handles.</p>
              </div>
              <div className="guide-col">
                <strong>Right: Properties</strong>
                <p>Finds <code>fields.find(f =&gt; f.id === selectedId)</code> and lets you edit its labels and validation.</p>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="guide-card">
            <div className="guide-card-header">
              <CheckCircle size={18} className="text-primary" />
              <h4>4. Live Preview Mode &amp; Validation</h4>
            </div>
            <p>
              Switch to <strong>Live Preview</strong> using the top navigation bar. It creates an isolated form state,
              validates <code>required</code> fields, ensures valid email formats, and logs the submitted answers as clean JSON upon submission!
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Got it, let's build!
          </button>
        </div>
      </div>
    </div>
  );
}
