import React, { useState } from "react";
import { 
  Users, 
  PlusCircle, 
  CheckCircle2, 
  Trash2, 
  ShieldCheck, 
  Check, 
  Pencil, 
  Key,
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
  const [selectedModuleIds, setSelectedModuleIds] = useState(["mod_products"]);
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

    // Duplicate email check
    const duplicate = users.find((u) => u.email.toLowerCase().trim() === newEmail.toLowerCase().trim());
    if (duplicate) {
      alert(`User with email "${newEmail}" already exists! Please choose a unique email address.`);
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

    // Duplicate email check
    const duplicate = users.find(
      (u) => u.id !== editingUser.id && u.email.toLowerCase().trim() === editingUser.email.toLowerCase().trim()
    );
    if (duplicate) {
      alert(`Another user already has the email "${editingUser.email}". Please choose a unique email.`);
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
    <div className="p-4 md:p-5 space-y-4 max-w-7xl mx-auto">
      {/* Top Banner Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <Users size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Users &amp; Module Access Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin creates user credentials and decides which dynamic modules they see upon logging in.
            </p>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            type="button"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={14} />
            <span>Active Users ({users.length})</span>
          </button>

          <button
            type="button"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "create"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("create")}
          >
            <PlusCircle size={14} />
            <span>+ Create New User</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: USERS LIST TABLE */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Registered ERP Users</h3>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
              {users.length} Users
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3.5">User Details</th>
                  <th className="py-2.5 px-3.5">Credentials (Email / Pass)</th>
                  <th className="py-2.5 px-3.5">Department</th>
                  <th className="py-2.5 px-3.5">Permitted Modules</th>
                  <th className="py-2.5 px-3.5">Authority</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isAdmin = u.role === "admin";
                  const isAll = (u.allowedModuleIds || []).includes("*");
                  const permittedMods = isAdmin || isAll
                    ? modules
                    : modules.filter((m) => (u.allowedModuleIds || []).includes(m.id));

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3.5">
                        <div className="font-bold text-sm text-slate-900">{u.fullName}</div>
                        <div className="text-xs text-slate-400">
                          {isAdmin ? "👑 Super Admin" : u.department === "Human Resources" ? "📋 HR Officer" : "💼 User Account"}
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5">
                        <div className="font-medium text-sm text-slate-800">{u.email}</div>
                        <div className="text-xs text-slate-400">
                          Pass: <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">{u.password}</code>
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {u.department || "General"}
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {isAdmin || isAll ? (
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                              🌟 Full Access (All Modules)
                            </span>
                          ) : permittedMods.length > 0 ? (
                            permittedMods.map((m) => (
                              <span
                                key={m.id}
                                className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                                  m.id === "mod_employees"
                                    ? "bg-teal-50 text-teal-700 border-teal-200"
                                    : m.id === "mod_potential"
                                    ? "bg-violet-50 text-violet-700 border-violet-200"
                                    : "bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                              >
                                📦 {m.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">No Modules Assigned</span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5">
                        {u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                            👑 Executive Admin
                          </span>
                        ) : u.department === "Human Resources" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                            📋 HR Submissions
                          </span>
                        ) : u.canApprove ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <ShieldCheck size={13} /> Approver
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            Entry Staff
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit User Button */}
                          <button
                            type="button"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
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
                            <Pencil size={14} />
                          </button>

                          {/* Delete Button (non-admin only) */}
                          {!isAdmin && (
                            <button
                              type="button"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                              onClick={() => handleDeleteUser(u.id)}
                              title="Delete user"
                            >
                              <Trash2 size={14} />
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
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-start gap-3.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Key size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create User &amp; Assign Dynamic Modules</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                When this user signs in, only the selected modules will appear in their navigation menu.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  placeholder="e.g. Ramesh Kumar"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department / Counter
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  placeholder="e.g. Warehouse, Billing, Store"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Login Email Address *
                </label>
                <input
                  type="email"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  placeholder="e.g. ramesh@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Login Password *
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                  placeholder="e.g. 123"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Checkbox list of created dynamic modules */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Modules to Enable for this User *
              </label>
              <p className="text-xs text-slate-400">Only checked modules will be visible in their menu upon login.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {modules.map((mod) => {
                  const isChecked = selectedModuleIds.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "border-indigo-500 bg-indigo-50/60 shadow-2xs"
                          : "border-slate-200 bg-slate-50/50 hover:bg-white"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check size={13} />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">📦 {mod.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{mod.fields?.length || 0} fields</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Approval Authority Toggle (Modern Tailwind Switch) */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <ShieldCheck size={22} className="text-indigo-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Can this user Approve / Reject records?</h4>
                  <p className="text-[11px] text-slate-500">
                    When enabled, this user will have authority to approve submissions in assigned modules.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={canApprove}
                onClick={() => setCanApprove(!canApprove)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                  canApprove ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    canApprove ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <PlusCircle size={15} /> Create User Account
              </button>
              <button
                type="button"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
                onClick={() => setActiveTab("users")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT USER MODAL (Tailwind Powered) */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit User &amp; Module Permissions</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update credentials, assign or revoke dynamic modules, and change authority.
                </p>
              </div>
              <button
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                onClick={() => setEditingUser(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department / Counter
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={editingUser.department || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Login Email Address *
                  </label>
                  <input
                    type="email"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Login Password *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Module Assignment Checkboxes */}
              {editingUser.role !== "admin" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Assigned Modules (Visible on Login) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {modules.map((mod) => {
                      const cur = editingUser.allowedModuleIds || [];
                      const isChecked = cur.includes(mod.id) || cur.includes("*");
                      return (
                        <div
                          key={mod.id}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? "border-indigo-500 bg-indigo-50/60"
                              : "border-slate-200 bg-slate-50/50 hover:bg-white"
                          }`}
                          onClick={() => {
                            let list = cur.includes("*") ? modules.map((m) => m.id) : [...cur];
                            const next = list.includes(mod.id)
                              ? list.filter((id) => id !== mod.id)
                              : [...list, mod.id];
                            setEditingUser({ ...editingUser, allowedModuleIds: next });
                          }}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                              isChecked
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <Check size={13} />}
                          </div>
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            📦 {mod.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Authority Switch (Modern Tailwind Switch) */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={22} className="text-indigo-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Can this user Approve / Reject records?</h4>
                    <p className="text-xs text-slate-500">Enable to grant approval authority.</p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={!!editingUser.canApprove}
                  onClick={() => setEditingUser({ ...editingUser, canApprove: !editingUser.canApprove })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                    editingUser.canApprove ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      editingUser.canApprove ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
