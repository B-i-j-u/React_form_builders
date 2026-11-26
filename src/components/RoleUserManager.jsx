import React, { useState } from "react";
import { 
  Shield, 
  Users, 
  PlusCircle, 
  CheckCircle2, 
  Trash2, 
  Lock, 
  Mail, 
  Building, 
  Eye, 
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Layers
} from "lucide-react";
import { AVAILABLE_SCREENS, rbacStore } from "../services/rbacStore";

export default function RoleUserManager({ onRefreshAuth }) {
  const [activeTab, setActiveTab] = useState("roles"); // "roles" | "users" | "create_role" | "create_user"
  const [roles, setRoles] = useState(() => rbacStore.getRoles());
  const [users, setUsers] = useState(() => rbacStore.getUsers());

  // Form states for new role
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleScreens, setNewRoleScreens] = useState(["preview"]);
  const [newRoleCanApprove, setNewRoleCanApprove] = useState(false);
  const [roleSuccessMsg, setRoleSuccessMsg] = useState("");

  // Form states for new user
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("123");
  const [newDepartment, setNewDepartment] = useState("Operations");
  const [newRoleId, setNewRoleId] = useState(roles[0]?.id || "role_staff");
  const [userSuccessMsg, setUserSuccessMsg] = useState("");

  // Toggle screen selection for new role
  const toggleScreen = (screenId) => {
    setNewRoleScreens((prev) =>
      prev.includes(screenId)
        ? prev.filter((s) => s !== screenId)
        : [...prev, screenId]
    );
  };

  // Create Role Handler
  const handleCreateRole = (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    if (newRoleScreens.length === 0) {
      alert("Please select at least 1 accessible screen for this role.");
      return;
    }

    const created = rbacStore.addRole({
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || "Custom dynamic role created by Admin",
      badgeColor: newRoleCanApprove ? "emerald" : "blue",
      allowedScreens: newRoleScreens,
      canApprove: newRoleCanApprove
    });

    const updatedRoles = rbacStore.getRoles();
    setRoles(updatedRoles);
    setNewRoleName("");
    setNewRoleDesc("");
    setNewRoleScreens(["preview"]);
    setNewRoleCanApprove(false);
    setRoleSuccessMsg(`Role "${created.name}" created successfully! Users can now be assigned to this role.`);
    setTimeout(() => {
      setRoleSuccessMsg("");
      setActiveTab("roles");
    }, 1800);
  };

  // Delete Role Handler
  const handleDeleteRole = (roleId) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      const updated = rbacStore.deleteRole(roleId);
      setRoles(updated);
    }
  };

  // Create User Handler
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim() || !newPassword.trim()) {
      alert("Please fill in name, email and password.");
      return;
    }

    const created = rbacStore.addUser({
      fullName: newFullName.trim(),
      email: newEmail.trim(),
      password: newPassword.trim(),
      department: newDepartment.trim() || "General",
      roleId: newRoleId
    });

    const updatedUsers = rbacStore.getUsers();
    setUsers(updatedUsers);
    setNewFullName("");
    setNewEmail("");
    setNewPassword("123");
    setUserSuccessMsg(`User "${created.fullName}" created! They can now login with email: ${created.email} & password: ${created.password}`);
    setTimeout(() => {
      setUserSuccessMsg("");
      setActiveTab("users");
    }, 1800);
  };

  // Delete User Handler
  const handleDeleteUser = (userId) => {
    if (window.confirm("Delete this user?")) {
      const updated = rbacStore.deleteUser(userId);
      setUsers(updated);
    }
  };

  return (
    <div className="rbac-manager-container">
      {/* Top Banner / Explainer */}
      <div className="rbac-header-card">
        <div className="rbac-header-left">
          <div className="rbac-icon-badge">
            <Shield size={28} />
          </div>
          <div>
            <h2 className="rbac-title">Dynamic Role &amp; User Access Control (RBAC)</h2>
            <p className="rbac-subtitle">
              Admin controls which screens appear on login and whether a user has authority to approve forms &amp; purchase orders.
            </p>
          </div>
        </div>

        <div className="rbac-tab-pills">
          <button 
            type="button" 
            className={`rbac-tab-btn ${activeTab === "roles" ? "active" : ""}`}
            onClick={() => setActiveTab("roles")}
          >
            <Layers size={16} />
            <span>Active Roles ({roles.length})</span>
          </button>
          <button 
            type="button" 
            className={`rbac-tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={16} />
            <span>Active Users ({users.length})</span>
          </button>
          <button 
            type="button" 
            className={`rbac-tab-btn primary ${activeTab === "create_role" ? "active" : ""}`}
            onClick={() => setActiveTab("create_role")}
          >
            <PlusCircle size={16} />
            <span>+ Create Role</span>
          </button>
          <button 
            type="button" 
            className={`rbac-tab-btn primary ${activeTab === "create_user" ? "active" : ""}`}
            onClick={() => setActiveTab("create_user")}
          >
            <Users size={16} />
            <span>+ Create User</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ROLES LIST */}
      {activeTab === "roles" && (
        <div className="rbac-content-section">
          <div className="rbac-section-header">
            <h3>Registered Roles &amp; Screen Permissions</h3>
            <span className="rbac-badge-counter">{roles.length} Roles Configured</span>
          </div>

          <div className="roles-grid">
            {roles.map((r) => {
              const assignedUserCount = users.filter((u) => u.roleId === r.id).length;
              return (
                <div key={r.id} className="role-card">
                  <div className="role-card-top">
                    <div>
                      <span className={`role-badge ${r.badgeColor || "blue"}`}>
                        {r.canApprove ? "🛡️ Approver Authority" : "📝 Entry Only"}
                      </span>
                      <h4 className="role-name">{r.name}</h4>
                      <p className="role-desc">{r.description}</p>
                    </div>

                    {!r.isSystem && (
                      <button
                        type="button"
                        className="delete-role-btn"
                        onClick={() => handleDeleteRole(r.id)}
                        title="Delete custom role"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Allowed screens tags */}
                  <div className="role-screens-container">
                    <span className="screens-label">Visible Screens on Login:</span>
                    <div className="screen-tags">
                      {AVAILABLE_SCREENS.map((s) => {
                        const isAllowed = r.allowedScreens.includes(s.id);
                        return (
                          <span 
                            key={s.id} 
                            className={`screen-tag ${isAllowed ? "allowed" : "blocked"}`}
                          >
                            {isAllowed ? "✓ " : "✕ "} {s.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer details */}
                  <div className="role-card-footer">
                    <span className="assigned-users-count">
                      <Users size={14} /> {assignedUserCount} User(s) assigned
                    </span>
                    <span className={`approval-pill ${r.canApprove ? "can-approve" : "no-approve"}`}>
                      {r.canApprove ? "Can Approve Forms: YES" : "Can Approve: NO"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: USERS LIST */}
      {activeTab === "users" && (
        <div className="rbac-content-section">
          <div className="rbac-section-header">
            <h3>Registered Enterprise Users</h3>
            <button 
              type="button" 
              className="rbac-action-btn"
              onClick={() => setActiveTab("create_user")}
            >
              <PlusCircle size={15} /> Add New User
            </button>
          </div>

          <div className="users-table-wrapper">
            <table className="rbac-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Department</th>
                  <th>Assigned Role</th>
                  <th>Permitted Screens</th>
                  <th>Approval Authority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const role = roles.find((r) => r.id === u.roleId) || roles[0];
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell-info">
                          <div className="user-avatar-circle">{u.avatar || u.fullName.slice(0, 2)}</div>
                          <div>
                            <div className="user-name-text">{u.fullName}</div>
                            <div className="user-email-text">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="dept-tag">{u.department || "General"}</span>
                      </td>
                      <td>
                        <span className="role-pill-bold">{role?.name}</span>
                      </td>
                      <td>
                        <div className="permitted-screens-mini">
                          {role?.allowedScreens.map((sid) => {
                            const sc = AVAILABLE_SCREENS.find((s) => s.id === sid);
                            return <span key={sid} className="mini-screen-badge">{sc?.label || sid}</span>;
                          })}
                        </div>
                      </td>
                      <td>
                        {role?.canApprove ? (
                          <span className="status-badge-approved">
                            <CheckCircle2 size={13} /> Approver
                          </span>
                        ) : (
                          <span className="status-badge-pending">Staff</span>
                        )}
                      </td>
                      <td>
                        {u.email !== "admin@erp.com" && (
                          <button
                            type="button"
                            className="table-delete-btn"
                            onClick={() => handleDeleteUser(u.id)}
                            title="Delete user"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CREATE ROLE FORM */}
      {activeTab === "create_role" && (
        <div className="rbac-form-wrapper">
          <div className="form-card-box">
            <div className="form-card-header">
              <Sparkles size={20} className="sparkle-icon" />
              <div>
                <h3>Create New Dynamic Role</h3>
                <p>Configure which modules this role sees upon login and set their approval power.</p>
              </div>
            </div>

            {roleSuccessMsg && (
              <div className="success-banner">
                <CheckCircle2 size={18} /> {roleSuccessMsg}
              </div>
            )}

            <form onSubmit={handleCreateRole} className="rbac-form">
              <div className="form-field-group">
                <label className="form-label">Role Title / Designation *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Quality Assurance Manager, Branch Auditor, Store Keeper"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="form-label">Short Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Briefly state what this role is responsible for"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                />
              </div>

              {/* Screens Checkbox List */}
              <div className="form-field-group">
                <label className="form-label">Select Screens Visible to this Role on Login *</label>
                <p className="field-hint">Any unselected screen will be completely hidden from their navigation menu.</p>
                
                <div className="screens-select-grid">
                  {AVAILABLE_SCREENS.map((s) => {
                    const checked = newRoleScreens.includes(s.id);
                    return (
                      <div 
                        key={s.id} 
                        className={`screen-choice-card ${checked ? "selected" : ""}`}
                        onClick={() => toggleScreen(s.id)}
                      >
                        <div className="checkbox-indicator">
                          {checked ? <Check size={14} /> : null}
                        </div>
                        <div>
                          <div className="screen-choice-title">{s.label}</div>
                          <div className="screen-choice-desc">{s.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Approval Authority Toggle */}
              <div className="approval-toggle-card">
                <div className="toggle-left">
                  <ShieldCheck size={24} className="shield-check-icon" />
                  <div>
                    <h4 className="toggle-title">Grant Approver Authority?</h4>
                    <p className="toggle-sub">
                      When enabled, this user will see the <strong>[ Approve ]</strong> and <strong>[ Reject ]</strong> action buttons in the Approvals Center.
                    </p>
                  </div>
                </div>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    checked={newRoleCanApprove}
                    onChange={(e) => setNewRoleCanApprove(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="form-actions-row">
                <button type="submit" className="submit-role-btn">
                  <PlusCircle size={16} /> Save &amp; Publish Role
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setActiveTab("roles")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: CREATE USER FORM */}
      {activeTab === "create_user" && (
        <div className="rbac-form-wrapper">
          <div className="form-card-box">
            <div className="form-card-header">
              <Users size={20} className="sparkle-icon" />
              <div>
                <h3>Create New Enterprise User</h3>
                <p>Create a user credential and assign them one of the dynamic roles.</p>
              </div>
            </div>

            {userSuccessMsg && (
              <div className="success-banner">
                <CheckCircle2 size={18} /> {userSuccessMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="rbac-form">
              <div className="grid-two-cols">
                <div className="form-field-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ramesh Varma"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Department / Branch</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Inventory, Billing, Procurement"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-two-cols">
                <div className="form-field-group">
                  <label className="form-label">Email Address (Login Username) *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="user@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Login Password *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter password (e.g. 123)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Role Selection Dropdown */}
              <div className="form-field-group">
                <label className="form-label">Assign Role (Controls Screen Access &amp; Approvals) *</label>
                <select
                  className="form-select-lg"
                  value={newRoleId}
                  onChange={(e) => setNewRoleId(e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — ({r.canApprove ? "Approver" : "Entry Only"}, {r.allowedScreens.length} Screens)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions-row">
                <button type="submit" className="submit-role-btn">
                  <PlusCircle size={16} /> Create User Account
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setActiveTab("users")}
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
