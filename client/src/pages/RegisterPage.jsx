
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 

  const handleRegister = async (e) => {
  e.preventDefault();
  setError("");

 const emptyFields = [
  !username.trim(),
  !email.trim(),
  !password.trim(),
  !confirmPassword.trim(),
].filter(Boolean).length;

if (emptyFields >= 2) {
  setError("All fields are required.");
  return;
}

if (!username.trim()) {
  setError("Please enter username");
  return;
}

if (!email.trim()) {
  setError("Please enter email");
  return;
}

if (!password.trim()) {
  setError("Please enter password");
  return;
}

if (!confirmPassword.trim()) {
  setError("Please confirm your password");
  return;
}

if (password !== confirmPassword) {
  setError("Password and Confirm Password do not match");
  return;
}
if (!email.includes("@")) {
  setError("Please enter a valid email address.");
  return;
}

  setIsLoading(true);

  try {
    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      navigate("/login");
    } else {
      setError(data.error || "Registration failed");
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
        .register-terminal-page,
        .register-terminal-page * {
          box-sizing: border-box;
        }

        .register-terminal-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          background: #131313;
          color: #e2e2e2;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        .register-left {
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

        .register-left-content {
          max-width: 680px;
          width: 100%;
          position: relative;
          z-index: 2;
        }

        .register-brand-row {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 48px;
        }

        .register-logo-box {
          width: 56px;
          height: 56px;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: #ffffff;
        }

        .register-brand-title {
          font-size: 48px;
          line-height: 1;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -2px;
        }

        .register-main-heading {
          font-size: 72px;
          line-height: 1.1;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 28px;
          letter-spacing: -2px;
        }

        .register-desc {
          font-size: 20px;
          line-height: 1.6;
          color: #c4c7c8;
          max-width: 620px;
          margin: 0;
        }

        .register-grid-art {
          position: absolute;
          right: 72px;
          bottom: 80px;
          display: grid;
          grid-template-columns: repeat(6, 40px);
          gap: 12px;
          opacity: 0.1;
        }

        .register-grid-box {
          width: 40px;
          height: 40px;
          border: 1px solid #ffffff;
        }

        .register-grid-box.fill {
          background: #ffffff;
        }

        .register-right {
          width: 50%;
          min-height: 100vh;
          background: #131313;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 96px;
        }

        .register-panel {
          width: 100%;
          max-width: 540px;
          background: rgba(27, 27, 27, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 56px;
          backdrop-filter: blur(12px);
        }

        .register-panel-title {
          font-size: 40px;
          line-height: 1.2;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 34px;
          letter-spacing: -1px;
        }

        .register-form-group {
          margin-bottom: 20px;
        }

        .register-label {
          display: block;
          font-size: 14px;
          font-weight: 800;
          color: #c4c7c8;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .register-input-wrap {
          position: relative;
          width: 100%;
        }

        .register-input-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #8e9192;
          font-size: 20px;
          z-index: 2;
        }

        .register-input {
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

        .register-input::placeholder {
          color: #555555;
        }

        .register-input:focus {
          border-color: #ffffff;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
        }

        .register-submit {
          width: 100%;
          height: 64px;
          background: #ffffff;
          color: #000000;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 4px;
          margin-bottom: 56px;
        }

        .register-submit:hover {
          background: #e5e5e5;
        }

        .register-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .register-divider-area {
          border-top: 1px solid #353535;
          padding-top: 40px;
          text-align: center;
        }

        .register-new-text {
          color: #c4c7c8;
          font-size: 16px;
          margin: 0 0 24px;
        }

        .register-login-link {
          width: 100%;
          height: 56px;
          border: 1px solid #353535;
          border-radius: 8px;
          color: #ffffff;
          background: transparent;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 40px;
        }

        .register-login-link:hover {
          background: #1b1b1b;
        }

        .register-social-area {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .register-social-btn {
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

        .register-social-btn:hover {
          background: #1b1b1b;
        }

        .register-error {
          padding: 14px;
          border: 1px solid rgba(255, 180, 171, 0.4);
          color: #ffb4ab;
          background: rgba(147, 0, 10, 0.18);
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
        }

        @media (max-width: 1024px) {
          .register-terminal-page {
            flex-direction: column;
          }

          .register-left,
          .register-right {
            width: 100%;
            min-height: auto;
            padding: 56px 24px;
          }

          .register-main-heading {
            font-size: 44px;
          }

          .register-brand-title {
            font-size: 34px;
          }

          .register-panel {
            padding: 36px 24px;
          }

          .register-panel-title {
            font-size: 32px;
          }

          .register-grid-art {
            display: none;
          }
        }
      `}</style>

      <main className="register-terminal-page">
        <section className="register-left">
          <div className="register-left-content">
            <div className="register-brand-row">
              <div className="register-logo-box">▦</div>
              <h1 className="register-brand-title">AlgoVisualizer</h1>
            </div>

            <h2 className="register-main-heading">
              Translating Logic <br />
              Into Intelligence.
            </h2>

            <p className="register-desc">
              A high-performance engine engineered for surgical precision.
              AlgoVisualizer bridges the gap between complex computational logic
              and clear, actionable visual intelligence. Experience real-time
              insight into the architecture of your data.
            </p>
          </div>

          <div className="register-grid-art">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className={`register-grid-box ${index === 3 ? "fill" : ""}`}
              />
            ))}
          </div>
        </section>

        <section className="register-right">
          <div className="register-panel">
            <h3 className="register-panel-title">Create Account</h3>

           <form onSubmit={handleRegister} noValidate>
              {error && <div className="register-error">{error}</div>}

              <div className="register-form-group">
                <label className="register-label" htmlFor="username">
                  Username
                </label>

                <div className="register-input-wrap">
                  <span className="register-input-icon">👤</span>
                  <input
                    id="username"
                    className="register-input"
                    type="text"
                    placeholder="John Doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="register-form-group">
                <label className="register-label" htmlFor="email">
                  Email
                </label>

                <div className="register-input-wrap">
                  <span className="register-input-icon">@</span>
                  <input
                    id="email"
                    className="register-input"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

            

              <div className="register-form-group">
  <label className="register-label" htmlFor="password">
    Password
  </label>

  <div className="register-input-wrap">
    <span className="register-input-icon">⌕</span>

    <input
      id="password"
      className="register-input"
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

      <div className="register-form-group">
  <label className="register-label" htmlFor="confirmPassword">
    Confirm Password
  </label>

  <div className="register-input-wrap">
    <span className="register-input-icon">⌕</span>

    <input
      id="confirmPassword"
      className="register-input"
      type={showConfirmPassword ? "text" : "password"}
      placeholder="••••••••"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      required
    />

    <button
      type="button"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
      {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
    </button>
  </div>
</div>


              <button
                className="register-submit"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "CREATING..." : "Register →"}
              </button>
            </form>

            <div className="register-divider-area">
  <p className="register-new-text">Already have an account?</p>

  <Link className="register-login-link" to="/login">
    Back to Login
  </Link>

  <div className="register-social-area">
    <button className="register-social-btn" type="button">
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
      <span>Register with Google</span>
    </button>

    <button className="register-social-btn" type="button">
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
      <span>Register with Apple</span>
    </button>
  </div>
</div>
          </div>
        </section>
      </main>
    </>
  );
}