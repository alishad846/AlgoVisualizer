import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError("");
    setMsg("");
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid registered email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.message || "Verification code sent!");
        setStep(2);
      } else {
        setError(data.error || "Account not found.");
      }
    } catch {
      setError("Failed to connect to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError("");
    setMsg("");
    if (!otp.trim() || otp.length < 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Verification successful! Please enter your new password.");
        setStep(3);
      } else {
        setError(data.error || "Invalid verification code.");
      }
    } catch {
      setError("Failed to connect to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError("");
    setMsg("");
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        const preservedUser = location.state?.username || sessionStorage.getItem("last_typed_username") || data.username || email;
        sessionStorage.setItem("autofill_username", preservedUser);
        sessionStorage.setItem("autofill_password", newPassword);
        navigate("/login", { state: { username: preservedUser, password: newPassword } });
      } else {
        setError(data.error || "Password reset failed.");
      }
    } catch {
      setError("Failed to connect to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .forgot-terminal-page * { box-sizing: border-box; }
        .forgot-terminal-page {
          min-height: 100vh; width: 100%; display: flex; align-items: center; justify-content: center;
          background: #0e0e0e; color: #e2e2e2; font-family: 'Inter', sans-serif; padding: 24px;
        }
        .forgot-panel {
          width: 100%; max-width: 520px; background: rgba(27, 27, 27, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 48px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(12px);
        }
        .forgot-title { font-size: 32px; font-weight: 800; color: #fff; margin: 0 0 12px; letter-spacing: -1px; }
        .forgot-sub { font-size: 15px; color: #aaa; margin: 0 0 32px; line-height: 1.5; }
        .forgot-label { display: block; font-size: 13px; font-weight: 800; color: #ccc; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
        .forgot-input {
          width: 100%; height: 56px; background: #0e0e0e; border: 1px solid #353535;
          color: #fff; padding: 0 20px; border-radius: 8px; font-size: 16px; font-family: 'JetBrains Mono', monospace;
          outline: none; transition: border-color 0.2s;
        }
        .forgot-input:focus { border-color: #fff; }
        .forgot-btn {
          width: 100%; height: 60px; background: #fff; color: #000; border: none; border-radius: 8px;
          font-size: 17px; font-weight: 800; cursor: pointer; margin-top: 24px; display: flex; align-items: center; justify-content: center;
        }
        .forgot-btn:hover { background: #e5e5e5; }
        .forgot-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .forgot-alert-error { padding: 14px; border: 1px solid #ef4444; color: #f87171; background: rgba(239, 68, 68, 0.1); border-radius: 8px; margin-bottom: 24px; font-size: 14px; }
        .forgot-alert-msg { padding: 14px; border: 1px solid #10b981; color: #34d399; background: rgba(16, 185, 129, 0.1); border-radius: 8px; margin-bottom: 24px; font-size: 14px; }
        .forgot-back { display: inline-block; margin-top: 32px; color: #aaa; font-size: 14px; text-decoration: none; font-weight: 700; }
        .forgot-back:hover { color: #fff; }
      `}</style>

      <main className="forgot-terminal-page">
        <div className="forgot-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", background: "#222", padding: "6px 12px", borderRadius: "20px", color: "#888", fontWeight: 800, textTransform: "uppercase" }}>Step {step} of 3</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={{ width: "24px", height: "4px", borderRadius: "2px", background: step >= 1 ? "#fff" : "#333" }} />
              <div style={{ width: "24px", height: "4px", borderRadius: "2px", background: step >= 2 ? "#fff" : "#333" }} />
              <div style={{ width: "24px", height: "4px", borderRadius: "2px", background: step >= 3 ? "#fff" : "#333" }} />
            </div>
          </div>

          <h1 className="forgot-title">
            {step === 1 && "Reset Password"}
            {step === 2 && "Email Verification"}
            {step === 3 && "Create New Password"}
          </h1>

          <p className="forgot-sub">
            {step === 1 && "Enter your account's registered email address and we'll send you a 6-digit verification code."}
            {step === 2 && `We sent a verification code to ${email}. Check your inbox or server logs.`}
            {step === 3 && "Almost done. Enter and confirm your new secure password below."}
          </p>

          {error && <div className="forgot-alert-error">{error}</div>}
          {msg && <div className="forgot-alert-msg">{msg}</div>}

          {step === 1 && (
            <form onSubmit={handleSendOtp} noValidate>
              <label className="forgot-label">Registered Email</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                className="forgot-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="forgot-btn" type="submit" disabled={isLoading}>
                {isLoading ? "SENDING CODE..." : "Send Verification Code →"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} noValidate>
              <label className="forgot-label">6-Digit Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                style={{ textAlign: "center", letterSpacing: "8px", fontSize: "24px", fontWeight: "bold" }}
                className="forgot-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button className="forgot-btn" type="submit" disabled={isLoading}>
                {isLoading ? "VERIFYING..." : "Verify Code →"}
              </button>
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}
                >
                  Didn't receive code? Resend
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} noValidate>
              <div style={{ marginBottom: "20px" }}>
                <label className="forgot-label">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="forgot-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label className="forgot-label">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="forgot-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button className="forgot-btn" type="submit" disabled={isLoading}>
                {isLoading ? "UPDATING..." : "Update Password & Login →"}
              </button>
            </form>
          )}

          <div style={{ textAlign: "center" }}>
            <Link className="forgot-back" to="/login">← Back to Login</Link>
          </div>
        </div>
      </main>
    </>
  );
}
