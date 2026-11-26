import React, { useState } from "react";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck,
  Layers,
  Users,
  CheckCircle2
} from "lucide-react";
import { rbacStore } from "../services/rbacStore";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("admin@erp.com");
  const [password, setPassword] = useState("123");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const users = rbacStore.getUsers();
  const modules = rbacStore.getModules();

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    const authResult = rbacStore.authenticate(email, password);
    if (!authResult) {
      setErrorMsg("Invalid credentials. Try 1-click accounts or check registered users.");
      return;
    }

    localStorage.setItem("rfb_auth_user", JSON.stringify(authResult));
    onLogin(authResult);
  };

  // 1-Click Demo Login Quick Picker
  const handleQuickLogin = (user) => {
    localStorage.setItem("rfb_auth_user", JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Side: Brand & Quick User Switcher */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3.5 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                <Layers size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight leading-snug">Enterprise Dynamic ERP</h2>
                <span className="text-xs font-medium text-indigo-400 block">Drag &amp; Drop Modules • Dynamic RBAC</span>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3.5 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                <div>
                  <strong className="text-xs font-semibold text-slate-200 block">Zero Static Pages</strong>
                  <p className="text-[11px] text-slate-400">All modules are built dynamically via Studio with instant live forms.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div>
                <div>
                  <strong className="text-xs font-semibold text-slate-200 block">Role-Based Left Sidebar</strong>
                  <p className="text-[11px] text-slate-400">Users only see modules and actions they are explicitly permitted to view.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0"></div>
                <div>
                  <strong className="text-xs font-semibold text-slate-200 block">Record Approvals &amp; Audit</strong>
                  <p className="text-[11px] text-slate-400">Managers approve/reject submissions with automatic author stamp.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 1-Click Demo Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Sparkles size={14} />
              <span>1-Click Fast Login (Test Accounts)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.map((u) => {
                const isAdmin = u.role === "admin";
                const isHR = u.department === "Human Resources" || u.id === "usr_hr";
                const isApprover = u.canApprove;
                const modCount = isAdmin ? modules.length : (u.allowedModuleIds || []).length;

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-700/70 text-slate-200 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {isAdmin ? "👑" : isHR ? "📋" : isApprover ? "👔" : "💼"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate group-hover:text-indigo-300">
                          {u.fullName}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {isAdmin ? "Full Admin" : isHR ? "Employee Screen Only" : `${modCount} module(s)`} • Pass: {u.password}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={15} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Clean Login Form */}
        <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between bg-white text-slate-800">
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to ERP Portal</h3>
              <p className="text-sm text-slate-500 mt-1">Enter credentials to open your assigned dashboard workspace.</p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="admin@erp.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                <span>Sign In to Workspace</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Quick Credential Hint */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
            <div className="text-xs text-slate-500 font-medium">Quick Demo Passwords (Pass: 123):</div>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-mono">👑 admin@erp.com</span>
              <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-mono">📋 ramesh@erp.com (HR)</span>
              <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-mono">👔 manager@erp.com</span>
              <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-mono">💼 staff@erp.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
