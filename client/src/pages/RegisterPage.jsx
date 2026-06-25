
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password }),
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
          margin: 0 0 56px;
          letter-spacing: -1px;
        }

        .register-form-group {
          margin-bottom: 32px;
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
          padding: 0 16px 0 56px;
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

            <form onSubmit={handleRegister}>
              {error && <div className="register-error">{error}</div>}

              <div className="register-form-group">
                <label className="register-label" htmlFor="fullName">
                  Full Name
                </label>

                <div className="register-input-wrap">
                  <span className="register-input-icon">👤</span>
                  <input
                    id="fullName"
                    className="register-input"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
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

              
            </div>
          </div>
        </section>
      </main>
    </>
  );
}