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
  Users
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
    <div className="login-screen-wrapper">
      <div className="login-split-card">
        {/* Left Side: Brand & Quick User Switcher */}
        <div className="login-hero-sidebar">
          <div className="hero-logo-row">
            <div className="erp-logo-box">
              <Layers size={28} />
            </div>
            <div>
              <h2 className="erp-brand-name">Enterprise Dynamic ERP</h2>
              <span className="erp-tagline">Drag &amp; Drop Modules • Role Based Menus</span>
            </div>
          </div>

          <div className="dynamic-login-feature-list">
            <div className="feature-item">
              <div className="feature-dot purple"></div>
              <div>
                <strong>Zero Static Pages</strong>
                <p>Every module is created dynamically via Drag &amp; Drop form fields.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-dot emerald"></div>
              <div>
                <strong>Dynamic User Menus</strong>
                <p>When a user logs in, only the modules assigned to them appear in the menu.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-dot blue"></div>
              <div>
                <strong>Approvals &amp; Audit Trail</strong>
                <p>Managers can approve or reject records; staff submit in view-only mode.</p>
              </div>
            </div>
          </div>

          {/* 1-Click Demo Switcher */}
          <div className="quick-switch-section">
            <div className="quick-switch-header">
              <Sparkles size={16} />
              <span>1-Click Switch: Test Different User Logins</span>
            </div>

            <div className="quick-accounts-list">
              {users.map((u) => {
                const isAdmin = u.role === "admin";
                const isApprover = u.canApprove;
                const modCount = isAdmin ? modules.length : (u.allowedModuleIds || []).length;

                return (
                  <div
                    key={u.id}
                    className="quick-account-card"
                    onClick={() => handleQuickLogin(u)}
                    title={`Click to login directly as ${u.fullName}`}
                  >
                    <div className="account-avatar">
                      {isAdmin ? "👑" : isApprover ? "👔" : "💼"}
                    </div>
                    <div className="account-details">
                      <div className="account-name-row">
                        <span className="account-name">{u.fullName}</span>
                        <span className={`role-micro-badge ${isAdmin ? "purple" : isApprover ? "emerald" : "blue"}`}>
                          {isAdmin ? "Admin" : isApprover ? "Approver" : "Staff"}
                        </span>
                      </div>
                      <div className="account-meta">
                        {isAdmin ? "Full Access" : `${modCount} Permitted Module(s)`} • Pass: <code>{u.password}</code>
                      </div>
                    </div>
                    <ArrowRight size={15} className="account-arrow" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Clean Login Form */}
        <div className="login-form-pane">
          <div className="form-pane-header">
            <h3>Sign In to ERP Portal</h3>
            <p>Enter credentials to access your assigned modules.</p>
          </div>

          {errorMsg && (
            <div className="login-error-alert">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="sign-in-form">
            <div className="login-input-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  placeholder="admin@erp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-input-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn">
              <span>Sign In to Workspace</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Credential Hint */}
          <div className="login-hint-footer">
            <div className="hint-pill">👑 Admin: <strong>admin@erp.com</strong> (Pass: <strong>123</strong>)</div>
            <div className="hint-pill">👔 Manager: <strong>manager@erp.com</strong> (Pass: <strong>123</strong>)</div>
            <div className="hint-pill">💼 Staff: <strong>staff@erp.com</strong> (Pass: <strong>123</strong>)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
