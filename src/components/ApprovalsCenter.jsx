import React, { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  FileText, 
  User, 
  Calendar, 
  AlertCircle,
  PlusCircle,
  Check,
  X,
  MessageSquare,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { rbacStore } from "../services/rbacStore";

export default function ApprovalsCenter({ currentUser }) {
  const [submissions, setSubmissions] = useState(() => rbacStore.getSubmissions());
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "pending" | "approved" | "rejected"
  const [searchQuery, setSearchQuery] = useState("");
  
  // Quick new submission modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("Purchase Order");
  const [newAmount, setNewAmount] = useState("");

  const canUserApprove = currentUser?.role?.canApprove === true;

  // Filter logic
  const filteredSubmissions = submissions.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.moduleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const totalCount = submissions.length;
  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const rejectedCount = submissions.filter((s) => s.status === "rejected").length;

  // Approve action
  const handleApprove = (id) => {
    const comment = prompt("Optional Approval remarks:", "Approved as per operational budget.");
    if (comment === null) return; // cancelled
    const updated = rbacStore.updateSubmissionStatus(id, "approved", currentUser.fullName, comment);
    setSubmissions([...updated]);
  };

  // Reject action
  const handleReject = (id) => {
    const comment = prompt("Enter reason for rejection (Required):", "Exceeds approved allocation.");
    if (!comment) return;
    const updated = rbacStore.updateSubmissionStatus(id, "rejected", currentUser.fullName, comment);
    setSubmissions([...updated]);
  };

  // Quick submit new request
  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = rbacStore.createSubmission({
      title: newTitle.trim(),
      moduleType: newType,
      amount: newAmount.trim() || "₹ 15,000",
      submittedBy: currentUser.fullName,
      department: currentUser.department || "Field Staff",
      itemsCount: 1
    });

    const updated = rbacStore.getSubmissions();
    setSubmissions([...updated]);
    setNewTitle("");
    setNewAmount("");
    setIsNewModalOpen(false);
  };

  return (
    <div className="approvals-page-container">
      {/* Top Banner */}
      <div className="approvals-hero-card">
        <div className="hero-content">
          <div className="hero-icon-box">
            <CheckCircle2 size={30} />
          </div>
          <div>
            <div className="hero-role-pill">
              {canUserApprove ? (
                <span className="badge-approver">🛡️ You have Approver Authority</span>
              ) : (
                <span className="badge-staff">👁️ Submitter / View Only Mode</span>
              )}
            </div>
            <h2 className="hero-title">Enterprise Approvals &amp; Audit Center</h2>
            <p className="hero-desc">
              {canUserApprove
                ? "You have full authorization to review pending purchase orders, asset requisitions and form entries."
                : "View the live status of your submissions. Approval decisions can only be made by authorized managers."}
            </p>
          </div>
        </div>

        {/* Quick action button */}
        <button
          type="button"
          className="create-request-btn"
          onClick={() => setIsNewModalOpen(true)}
        >
          <PlusCircle size={16} />
          <span>+ Submit New Request</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="kpi-grid">
        <div 
          className={`kpi-card ${statusFilter === "all" ? "active-kpi" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          <div className="kpi-number">{totalCount}</div>
          <div className="kpi-label">Total Submissions</div>
        </div>

        <div 
          className={`kpi-card pending ${statusFilter === "pending" ? "active-kpi" : ""}`}
          onClick={() => setStatusFilter("pending")}
        >
          <div className="kpi-number text-amber">{pendingCount}</div>
          <div className="kpi-label">Pending Review</div>
        </div>

        <div 
          className={`kpi-card approved ${statusFilter === "approved" ? "active-kpi" : ""}`}
          onClick={() => setStatusFilter("approved")}
        >
          <div className="kpi-number text-emerald">{approvedCount}</div>
          <div className="kpi-label">Approved</div>
        </div>

        <div 
          className={`kpi-card rejected ${statusFilter === "rejected" ? "active-kpi" : ""}`}
          onClick={() => setStatusFilter("rejected")}
        >
          <div className="kpi-number text-rose">{rejectedCount}</div>
          <div className="kpi-label">Rejected</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-search-row">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, title, submitter or module..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="status-filter-pills">
          <button
            type="button"
            className={`filter-pill ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${statusFilter === "pending" ? "active" : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${statusFilter === "approved" ? "active" : ""}`}
            onClick={() => setStatusFilter("approved")}
          >
            Approved ({approvedCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${statusFilter === "rejected" ? "active" : ""}`}
            onClick={() => setStatusFilter("rejected")}
          >
            Rejected ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="submissions-list">
        {filteredSubmissions.length === 0 ? (
          <div className="empty-state-box">
            <AlertCircle size={36} className="empty-icon" />
            <h3>No submissions found</h3>
            <p>Try changing the status filter or search query.</p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => {
            const isPending = sub.status === "pending";
            const isApproved = sub.status === "approved";
            const isRejected = sub.status === "rejected";

            return (
              <div key={sub.id} className={`submission-card ${sub.status}`}>
                <div className="sub-card-header">
                  <div className="sub-id-block">
                    <span className="sub-id">{sub.id}</span>
                    <span className="sub-module-badge">{sub.moduleType}</span>
                  </div>

                  <div className="sub-status-pill">
                    {isPending && (
                      <span className="badge-status-pending">
                        <Clock size={14} /> Pending Approval
                      </span>
                    )}
                    {isApproved && (
                      <span className="badge-status-approved">
                        <CheckCircle2 size={14} /> Approved
                      </span>
                    )}
                    {isRejected && (
                      <span className="badge-status-rejected">
                        <XCircle size={14} /> Rejected
                      </span>
                    )}
                  </div>
                </div>

                <div className="sub-title-row">
                  <h3 className="sub-title">{sub.title}</h3>
                  <div className="sub-amount">{sub.amount}</div>
                </div>

                {/* Submitter & meta row */}
                <div className="sub-meta-row">
                  <span className="meta-item">
                    <User size={14} /> Submitted by: <strong>{sub.submittedBy}</strong> ({sub.department})
                  </span>
                  <span className="meta-item">
                    <Calendar size={14} /> {sub.date}
                  </span>
                </div>

                {/* Review details if already processed */}
                {(isApproved || isRejected) && (
                  <div className={`review-audit-box ${sub.status}`}>
                    <div className="audit-header">
                      <strong>Reviewed by:</strong> {sub.reviewedBy || "Manager"} on {sub.reviewedAt}
                    </div>
                    {sub.reviewComment && (
                      <div className="audit-comment">
                        <MessageSquare size={13} /> "{sub.reviewComment}"
                      </div>
                    )}
                  </div>
                )}

                {/* Action Row */}
                <div className="sub-card-actions">
                  {canUserApprove ? (
                    isPending ? (
                      <div className="approver-buttons-group">
                        <button
                          type="button"
                          className="btn-approve"
                          onClick={() => handleApprove(sub.id)}
                        >
                          <Check size={16} />
                          <span>Approve Request</span>
                        </button>

                        <button
                          type="button"
                          className="btn-reject"
                          onClick={() => handleReject(sub.id)}
                        >
                          <X size={16} />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <div className="decision-final-text">
                        <Check size={14} /> Decision recorded in audit log.
                      </div>
                    )
                  ) : (
                    <div className="staff-view-only-note">
                      {isPending ? (
                        <span>⏳ Waiting for Department Manager review and signature.</span>
                      ) : (
                        <span>✓ Review completed by management.</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QUICK NEW SUBMISSION MODAL */}
      {isNewModalOpen && (
        <div className="modal-overlay">
          <div className="quick-modal-card">
            <div className="modal-header">
              <h3>Submit New Request / Purchase Order</h3>
              <button 
                type="button" 
                className="close-modal-btn"
                onClick={() => setIsNewModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="modal-form">
              <div className="form-field-group">
                <label className="form-label">Request Title / Description *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Server Ram Upgrade, Annual Leave, Raw Material PO"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid-two-cols">
                <div className="form-field-group">
                  <label className="form-label">Module / Category</label>
                  <select
                    className="form-select-lg"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    <option value="Purchase Order">Purchase Order (PO)</option>
                    <option value="Product Request">Product Request</option>
                    <option value="Leave Application">Leave Application</option>
                    <option value="Asset Requisition">Asset Requisition</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Amount / Quantity</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ₹ 75,000 or 5 Units"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="submit-role-btn">
                  Submit for Approval
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsNewModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
