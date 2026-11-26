import React, { useState } from "react";
import { 
  Users, 
  PlusCircle, 
  CheckCircle2, 
  Trash2, 
  Shield, 
  Key, 
  Mail, 
  Layers,
  ShieldCheck,
  Check,
  Pencil,
  X
} from "lucide-react";
import { rbacStore } from "../services/rbacStore";

export default function UserAccessManager({ onRefreshUsers }) {
  const [users, setUsers] = useState(() => rbacStore.getUsers());
  const [modules, setModules] = useState(() => rbacStore.getModules());
  const [activeTab, setActiveTab] = useState("users"); // "users" | "create"
  const [editingUser, setEditingUser] = useState(null); // User object being edited

  // Form states for creating new user
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("123");
  const [newDept, setNewDept] = useState("Operations");
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [canApprove, setCanApprove] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const toggleModule = (modId) => {
    setSelectedModuleIds((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    );
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim() || !newPassword.trim()) {
      alert("Please provide full name, login email and password.");
      return;
    }

    if (selectedModuleIds.length === 0) {
      alert("Please select at least 1 module to grant access to this user.");
      return;
    }

    const created = rbacStore.addUser({
      fullName: newFullName.trim(),
      email: newEmail.trim(),
      password: newPassword.trim(),
      department: newDept.trim() || "General",
      allowedModuleIds: selectedModuleIds,
      canApprove
    });

    const updated = rbacStore.getUsers();
    setUsers(updated);
    setNewFullName("");
    setNewEmail("");
    setNewPassword("123");
    setSuccessMsg(`User "${created.fullName}" created! Login: ${created.email} (Password: ${created.password})`);
    onRefreshUsers?.();
    setTimeout(() => {
      setSuccessMsg("");
      setActiveTab("users");
    }, 2000);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      const updated = rbacStore.deleteUser(userId);
      setUsers(updated);
      onRefreshUsers?.();
    }
  };

  // Save Edit User
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingUser.fullName.trim() || !editingUser.email.trim() || !editingUser.password.trim()) {
      alert("Name, email and password cannot be empty.");
      return;
    }

    const updated = rbacStore.updateUser(editingUser.id, editingUser);
    setUsers(updated);
    setSuccessMsg(`User "${editingUser.fullName}" updated successfully!`);
    setEditingUser(null);
    onRefreshUsers?.();
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  return (
    <div className="user-access-container">
      {/* Top Banner */}
      <div className="access-header-card">
        <div className="access-header-left">
          <div className="access-icon-badge">
            <Users size={24} />
          </div>
          <div>
            <h2 className="access-title">Users &amp; Module Access Management</h2>
            <p className="access-sub">
              Admin creates, edits user credentials and configures module permissions.
            </p>
          </div>
        </div>

        <div className="access-tab-group">
          <button
            type="button"
            className={`access-tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={16} />
            <span>Active Users ({users.length})</span>
          </button>
          <button
            type="button"
            className={`access-tab-btn primary ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            <PlusCircle size={16} />
            <span>+ Create New User</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="access-success-alert">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: USERS LIST */}
      {activeTab === "users" && (
        <div className="access-table-card">
          <div className="table-card-top">
            <h3>Registered ERP Users</h3>
            <span className="user-count-tag">{users.length} Users</span>
          </div>

          <div className="table-responsive">
            <table className="clean-erp-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Credentials (Email / Pass)</th>
                  <th>Department</th>
                  <th>Permitted Modules (Visible on Login)</th>
                  <th>Authority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isAdmin = u.role === "admin";
                  const permittedMods = isAdmin
                    ? modules
                    : modules.filter((m) => (u.allowedModuleIds || []).includes(m.id));

                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="user-name-bold">{u.fullName}</div>
                        <div className="user-badge-mini">{isAdmin ? "👑 Super Admin" : "💼 User"}</div>
                      </td>
                      <td>
                        <div className="cred-email">{u.email}</div>
                        <div className="cred-pass">Pass: <code>{u.password}</code></div>
                      </td>
                      <td>{u.department || "General"}</td>
                      <td>
                        <div className="modules-tag-list">
                          {isAdmin ? (
                            <span className="mod-tag all">🌟 Full Access (All Modules)</span>
                          ) : permittedMods.length > 0 ? (
                            permittedMods.map((m) => (
                              <span key={m.id} className="mod-tag">
                                📦 {m.name}
                              </span>
                            ))
                          ) : (
                            <span className="mod-tag none">No Modules Assigned</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {u.canApprove ? (
                          <span className="badge-can-approve">
                            <ShieldCheck size={14} /> Approver
                          </span>
                        ) : (
                          <span className="badge-entry-only">Entry Staff</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions-cell">
                          {/* Edit User Button */}
                          <button
                            type="button"
                            className="btn-edit-user"
                            onClick={() =>
                              setEditingUser({
                                ...u,
                                allowedModuleIds: Array.isArray(u.allowedModuleIds)
                                  ? [...u.allowedModuleIds]
                                  : []
                              })
                            }
                            title="Edit user details & module access"
                          >
                            <Pencil size={15} />
                          </button>

                          {/* Delete Button (non-admin only) */}
                          {!isAdmin && (
                            <button
                              type="button"
                              className="btn-trash-delete"
                              onClick={() => handleDeleteUser(u.id)}
                              title="Delete user"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE USER FORM */}
      {activeTab === "create" && (
        <div className="create-user-card">
          <div className="card-heading-box">
            <Key size={20} className="key-icon" />
            <div>
              <h3>Create User &amp; Assign Dynamic Modules</h3>
              <p>When this user logs in, only the selected modules will appear in their navigation menu.</p>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="clean-form">
            <div className="form-row-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="clean-input"
                  placeholder="e.g. Ramesh Kumar"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Department / Counter</label>
                <input
                  type="text"
                  className="clean-input"
                  placeholder="e.g. Warehouse, Billing, Store"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row-grid">
              <div className="form-group">
                <label>Login Email Address *</label>
                <input
                  type="email"
                  className="clean-input"
                  placeholder="e.g. ramesh@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Login Password *</label>
                <input
                  type="text"
                  className="clean-input"
                  placeholder="e.g. 123"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Checkbox list of created dynamic modules */}
            <div className="form-group">
              <label>Select Modules to Enable for this User *</label>
              <p className="hint-text">Only the checked modules will be visible to this user when they sign in.</p>

              <div className="modules-checkbox-grid">
                {modules.length === 0 ? (
                  <div className="no-modules-hint" style={{ padding: "16px", color: "#64748b", fontSize: "13px" }}>
                    No custom dynamic modules created yet. Create modules via <strong>Module Studio</strong> to assign access.
                  </div>
                ) : (
                  modules.map((mod) => {
                    const isChecked = selectedModuleIds.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        className={`module-check-card ${isChecked ? "selected" : ""}`}
                        onClick={() => toggleModule(mod.id)}
                      >
                        <div className="check-box-indicator">
                          {isChecked && <Check size={14} />}
                        </div>
                        <div>
                          <div className="mod-card-title">📦 {mod.name}</div>
                          <div className="mod-card-desc">{mod.fields?.length || 0} form fields</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Approval Authority Toggle */}
            <div className="approval-permission-box">
              <div className="toggle-info">
                <ShieldCheck size={22} className="shield-icon" />
                <div>
                  <h4>Can this user Approve / Reject records?</h4>
                  <p>When enabled, this user can approve submissions in their assigned modules.</p>
                </div>
              </div>

              <label className="switch-clean">
                <input
                  type="checkbox"
                  checked={canApprove}
                  onChange={(e) => setCanApprove(e.target.checked)}
                />
                <span className="slider-round"></span>
              </label>
            </div>

            <div className="form-submit-row">
              <button type="submit" className="btn-primary-save">
                <PlusCircle size={16} /> Create User Account
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setActiveTab("users")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="modal-backdrop-clean">
          <div className="dynamic-entry-modal">
            <div className="modal-top-bar">
              <div>
                <h3 className="modal-title">Edit User &amp; Module Permissions</h3>
                <p className="modal-desc">Update credentials, assign or revoke dynamic modules, and change authority.</p>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setEditingUser(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="clean-form">
              <div className="form-row-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className="clean-input"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Department / Counter</label>
                  <input
                    type="text"
                    className="clean-input"
                    value={editingUser.department || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label>Login Email Address *</label>
                  <input
                    type="email"
                    className="clean-input"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Login Password *</label>
                  <input
                    type="text"
                    className="clean-input"
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Modules Assignment Checkboxes (for non-admin users) */}
              {editingUser.role !== "admin" && (
                <div className="form-group">
                  <label>Assigned Modules (Visible on Login) *</label>
                  <p className="hint-text">Select which modules this user can access upon login.</p>

                  <div className="modules-checkbox-grid">
                    {modules.length === 0 ? (
                      <div className="no-modules-hint" style={{ padding: "16px", color: "#64748b", fontSize: "13px" }}>
                        No custom dynamic modules created yet.
                      </div>
                    ) : (
                      modules.map((mod) => {
                        const isChecked = (editingUser.allowedModuleIds || []).includes(mod.id);
                        return (
                          <div
                            key={mod.id}
                            className={`module-check-card ${isChecked ? "selected" : ""}`}
                            onClick={() => {
                              const cur = editingUser.allowedModuleIds || [];
                              const next = cur.includes(mod.id)
                                ? cur.filter((id) => id !== mod.id)
                                : [...cur, mod.id];
                              setEditingUser({ ...editingUser, allowedModuleIds: next });
                            }}
                          >
                            <div className="check-box-indicator">
                              {isChecked && <Check size={14} />}
                            </div>
                            <div>
                              <div className="mod-card-title">📦 {mod.name}</div>
                              <div className="mod-card-desc">{mod.fields?.length || 0} form fields</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Approval Authority Toggle */}
              <div className="approval-permission-box">
                <div className="toggle-info">
                  <ShieldCheck size={22} className="shield-icon" />
                  <div>
                    <h4>Can this user Approve / Reject records?</h4>
                    <p>When enabled, this user can approve submissions in their assigned modules.</p>
                  </div>
                </div>

                <label className="switch-clean">
                  <input
                    type="checkbox"
                    checked={!!editingUser.canApprove}
                    onChange={(e) => setEditingUser({ ...editingUser, canApprove: e.target.checked })}
                  />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="modal-buttons-row">
                <button type="submit" className="btn-save-record">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => setEditingUser(null)}
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
