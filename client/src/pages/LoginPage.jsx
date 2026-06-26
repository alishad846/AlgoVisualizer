
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [keepSession, setKeepSession] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
   const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

 if (!username.trim() && !password.trim()) {
  setError("All the fields are required.");
  return;
}

if (!username.trim()) {
  setError("Please enter username");
  return;
}

if (!password.trim()) {
  setError("Please enter password");
  return;
}

  setIsLoading(true);

  try {
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, keepSession }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } else {
      setError(data.error || "Login failed");
    }
  } catch {
    setError("Failed to connect to the server");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <>
      <style>{`
        .auth-terminal-page,
        .auth-terminal-page * {
          box-sizing: border-box;
        }

        .auth-terminal-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          background: #131313;
          color: #e2e2e2;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        .auth-left {
          width: 50%;
          min-height: 100vh;
          background: #0e0e0e;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 96px;
          position: relative;
          overflow: hidden;
        }

        .auth-left-content {
          max-width: 680px;
          width: 100%;
          position: relative;
          z-index: 2;
        }

        .auth-brand-row {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 48px;
        }

        .auth-logo-box {
          width: 56px;
          height: 56px;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: #ffffff;
        }

        .auth-brand-title {
          font-size: 48px;
          line-height: 1;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -2px;
        }

        .auth-main-heading {
          font-size: 72px;
          line-height: 1.1;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 28px;
          letter-spacing: -2px;
        }

        .auth-desc {
          font-size: 20px;
          line-height: 1.6;
          color: #c4c7c8;
          max-width: 620px;
          margin: 0;
        }

        .auth-grid-art {
          position: absolute;
          right: 72px;
          bottom: 80px;
          display: grid;
          grid-template-columns: repeat(6, 40px);
          gap: 12px;
          opacity: 0.1;
        }

        .auth-grid-box {
          width: 40px;
          height: 40px;
          border: 1px solid #ffffff;
        }

        .auth-grid-box.fill {
          background: #ffffff;
        }

        .auth-right {
          width: 50%;
          min-height: 100vh;
          background: #131313;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 96px;
        }

        .auth-panel {
          width: 100%;
          max-width: 540px;
          background: rgba(27, 27, 27, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 56px;
          backdrop-filter: blur(12px);
        }

        .auth-panel-title {
          font-size: 32px;
          line-height: 1.2;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 56px;
          letter-spacing: -1px;
        }

        .auth-form-group {
          margin-bottom: 32px;
        }

        .auth-label {
          display: block;
          font-size: 14px;
          font-weight: 800;
          color: #c4c7c8;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .auth-password-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .auth-forgot {
          background: none;
          border: none;
          color: #8e9192;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          text-transform: uppercase;
        }

        .auth-forgot:hover {
          color: #ffffff;
        }

        .auth-input-wrap {
          position: relative;
        }

        .auth-input-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #8e9192;
          font-size: 20px;
          z-index: 2;
        }

        .auth-input {
          width: 100%;
          height: 58px;
          background: #0e0e0e;
          border: 1px solid #353535;
          color: #ffffff;
          padding: 0 50px 0 56px;
          border-radius: 8px;
          font-size: 16px;
          font-family: 'JetBrains Mono', monospace;
          outline: none;
        }

        .auth-input::placeholder {
          color: #555555;
        }

        .auth-input:focus {
          border-color: #ffffff;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
        }

        .auth-check-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 8px 0 28px;
        }

        .auth-check {
          width: 20px;
          height: 20px;
          accent-color: #ffffff;
          cursor: pointer;
        }

        .auth-check-label {
          color: #c4c7c8;
          font-size: 16px;
          cursor: pointer;
        }

        .auth-submit {
          width: 100%;
          height: 64px;
          background: #ffffff;
          color: #000000;
          border: none;
          border-radius: 8px;
          font-size: 20px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 56px;
        }

        .auth-submit:hover {
          background: #e5e5e5;
        }

        .auth-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-divider-area {
          border-top: 1px solid #353535;
          padding-top: 40px;
          text-align: center;
        }

        .auth-new-text {
          color: #c4c7c8;
          font-size: 18px;
          margin: 0 0 24px;
        }

        .auth-create {
          width: 100%;
          height: 62px;
          border: 2px solid #ffffff;
          border-radius: 8px;
          color: #ffffff;
          background: transparent;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 40px;
        }

        .auth-create:hover {
          background: #ffffff;
          color: #000000;
        }

        .auth-social-area {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .auth-social-btn {
          width: 100%;
          height: 56px;
          border: 1px solid #353535;
          border-radius: 8px;
          background: transparent;
          color: #ffffff;
          font-size: 16px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          cursor: pointer;
        }

        .auth-social-btn:hover {
          background: #1b1b1b;
        }

        .auth-error {
          padding: 14px;
          border: 1px solid rgba(255, 180, 171, 0.4);
          color: #ffb4ab;
          background: rgba(147, 0, 10, 0.18);
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
        }

        @media (max-width: 1024px) {
          .auth-terminal-page {
            flex-direction: column;
          }

          .auth-left,
          .auth-right {
            width: 100%;
            min-height: auto;
            padding: 56px 24px;
          }

          .auth-main-heading {
            font-size: 44px;
          }

          .auth-brand-title {
            font-size: 34px;
          }

          .auth-panel {
            padding: 36px 24px;
          }

          .auth-grid-art {
            display: none;
          }
        }
      `}</style>

      <main className="auth-terminal-page">
        <section className="auth-left">
          <div className="auth-left-content">
            <div className="auth-brand-row">
              <div className="auth-logo-box">▦</div>
              <h1 className="auth-brand-title">AlgoVisualizer</h1>
            </div>

            <h2 className="auth-main-heading">
              Translating Logic <br />
              Into Intelligence.
            </h2>

            <p className="auth-desc">
              A high-performance engine engineered for surgical precision.
              AlgoVisualizer bridges the gap between complex computational logic
              and clear, actionable visual intelligence. Experience real-time
              insight into the architecture of your data.
            </p>
          </div>

          <div className="auth-grid-art">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className={`auth-grid-box ${index === 3 ? "fill" : ""}`}
              />
            ))}
          </div>
        </section>

        <section className="auth-right">
          <div className="auth-panel">
            <h3 className="auth-panel-title">AlgoVisualizer</h3>

            <form onSubmit={handleLogin} noValidate>
              {error && <div className="auth-error">{error}</div>}

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="username">
                  Username
                </label>

                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input
                    id="username"
                    className="auth-input"
                    type="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <div className="auth-password-row">
                  <label className="auth-label" htmlFor="password">
                    Password
                  </label>

                  <button className="auth-forgot" type="button">
                    Forgot Password?
                  </button>
                </div>

                <div className="auth-input-wrap">
                        <span className="auth-input-icon">⌕</span>

                        <input
                          id="password"
                          className="auth-input"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "18px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#8e9192",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                      </div>    
              </div>

              <div className="auth-check-row">
                <input
                  id="persist"
                  className="auth-check"
                  type="checkbox"
                  checked={keepSession}
                  onChange={(e) => setKeepSession(e.target.checked)}
                />
                <label className="auth-check-label" htmlFor="persist">
                  Keep session active
                </label>
              </div>

              <button className="auth-submit" type="submit" disabled={isLoading}>
                {isLoading ? "INITIALIZING..." : "Login →"}
              </button>
            </form>

            <div className="auth-divider-area">
              <p className="auth-new-text">New to AlgoVisualizer?</p>

              <Link className="auth-create" to="/register">
                Create an Account
              </Link>

              <div className="auth-social-area">
                <button className="auth-social-btn" type="button">
                  <span
  style={{
    fontSize: "20px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  G
</span>
                  <span>Sign in with Google</span>
                </button>

                <button className="auth-social-btn" type="button">
  <span
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M16.365 1.43c0 1.14-.415 2.184-1.107 2.943-.748.823-1.97 1.458-3.025 1.372-.134-1.085.39-2.245 1.115-2.997.746-.77 2.038-1.324 3.017-1.318zM20.97 17.252c-.59 1.348-.87 1.95-1.63 3.138-1.06 1.656-2.553 3.72-4.406 3.735-1.647.015-2.072-1.07-4.309-1.058-2.237.012-2.703 1.078-4.35 1.063-1.853-.015-3.266-1.88-4.326-3.536C-1.02 15.96-.53 8.896 3.27 6.568c2.03-1.245 5.24-.998 6.62.665 1.07-1.64 4.105-1.786 6.14-.81.815.39 2.845 1.61 2.94 4.51-2.417 1.32-2.027 4.77.999 6.319z" />
    </svg>
  </span>
  <span>Sign in with Apple</span>
</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}