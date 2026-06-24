// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// export default function RegisterPage() {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   // 3D Tilt Effect Setup
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);

//   const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
//   const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

//   const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
//   const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

//   const handleMouseMove = (e) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const width = rect.width;
//     const height = rect.height;
//     const mouseX = e.clientX - rect.left;
//     const mouseY = e.clientY - rect.top;
//     const xPct = mouseX / width - 0.5;
//     const yPct = mouseY / height - 0.5;
//     x.set(xPct);
//     y.set(yPct);
//   };

//   const handleMouseLeave = () => {
//     x.set(0);
//     y.set(0);
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (password !== confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const response = await fetch("http://localhost:5000/api/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         navigate("/login");
//       } else {
//         setError(data.error || "Registration failed");
//       }
//     } catch (err) {
//       setError("Failed to connect to the server");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 30 },
//     visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
//   };

//   return (
//     <div className="min-h-screen flex bg-canvas-white font-helveticanowdisplay overflow-hidden perspective-[1000px]">
//       {/* Left Panel - Imagery / Brand */}
//       <motion.div 
//         initial={{ opacity: 0, x: -50 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.8, ease: "easeOut" }}
//         className="hidden lg:flex lg:w-1/2 bg-obsidian flex-col justify-between p-68 relative overflow-hidden"
//       >
//         {/* Subtle decorative background element */}
//         <motion.div 
//           animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
//           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//           className="absolute top-0 right-0 w-[150%] h-[150%] -translate-y-1/4 translate-x-1/4 bg-[radial-gradient(ellipse_at_center,_var(--color-slate-mist)_0%,_transparent_60%)] opacity-10 pointer-events-none" 
//         />
        
//         <div className="z-10">
//           <motion.h1 
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5, duration: 0.6 }}
//             className="text-canvas-white text-heading-sm font-bold tracking-[length:var(--tracking-heading-sm)] leading-[var(--leading-heading-sm)] mb-2"
//           >
//             AlgoVision.
//           </motion.h1>
//         </div>

//         <motion.div 
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//           className="z-10"
//         >
//           <motion.h2 
//             variants={itemVariants}
//             className="text-canvas-white text-heading font-bold tracking-[length:var(--tracking-heading)] leading-[var(--leading-heading)] mb-23"
//           >
//             Join the Next Era
//             <br />
//             of Learning.
//           </motion.h2>
//           <motion.p 
//             variants={itemVariants}
//             className="text-slate-mist text-body-sm leading-[var(--leading-body-sm)] max-w-md"
//           >
//             Create an account to track your progress, save custom algorithms, and experience learning without limits.
//           </motion.p>
//         </motion.div>
//       </motion.div>

//       {/* Right Panel - Register Form */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-22 sm:p-68 [perspective:1000px]">
//         <motion.div 
//           onMouseMove={handleMouseMove}
//           onMouseLeave={handleMouseLeave}
//           style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
//           className="w-full max-w-md bg-canvas-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-mist/10"
//         >
//           <div className="lg:hidden mb-11" style={{ transform: "translateZ(30px)" }}>
//             <h1 className="text-obsidian text-heading-sm font-bold tracking-[length:var(--tracking-heading-sm)] leading-[var(--leading-heading-sm)]">
//               AlgoVision.
//             </h1>
//           </div>

//           <div style={{ transform: "translateZ(40px)" }}>
//             <h2 className="text-obsidian text-heading-sm font-bold tracking-[length:var(--tracking-heading-sm)] leading-[var(--leading-heading-sm)] mb-11">
//               Create Account
//             </h2>
//             <p className="text-slate-mist text-body-sm leading-[var(--leading-body-sm)] tracking-[length:var(--tracking-body-sm)] mb-38">
//               Enter your details to register.
//             </p>
//           </div>

//           <form onSubmit={handleRegister} className="flex flex-col gap-23" style={{ transform: "translateZ(50px)" }}>
//             {error && (
//               <motion.div 
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-[10px] text-body-sm"
//               >
//                 {error}
//               </motion.div>
//             )}

//             <div className="flex flex-col gap-2 relative group">
//               <label className="text-obsidian text-[14px] font-bold transition-colors group-focus-within:text-obsidian/70">
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 required
//                 className="w-full border-b-2 border-slate-mist/20 bg-transparent py-3 text-obsidian text-body-sm focus:outline-none focus:border-obsidian transition-colors placeholder:text-slate-mist/40"
//                 placeholder="name@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>

//             <div className="flex flex-col gap-2 relative group">
//               <label className="text-obsidian text-[14px] font-bold transition-colors group-focus-within:text-obsidian/70">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 required
//                 className="w-full border-b-2 border-slate-mist/20 bg-transparent py-3 text-obsidian text-body-sm focus:outline-none focus:border-obsidian transition-colors placeholder:text-slate-mist/40"
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>

//             <div className="flex flex-col gap-2 relative group">
//               <label className="text-obsidian text-[14px] font-bold transition-colors group-focus-within:text-obsidian/70">
//                 Confirm Password
//               </label>
//               <input
//                 type="password"
//                 required
//                 className="w-full border-b-2 border-slate-mist/20 bg-transparent py-3 text-obsidian text-body-sm focus:outline-none focus:border-obsidian transition-colors placeholder:text-slate-mist/40"
//                 placeholder="••••••••"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//               />
//             </div>

//             <motion.button
//               type="submit"
//               disabled={isLoading}
//               whileHover={{ scale: 1.03, boxShadow: "0px 10px 30px rgba(0, 13, 16, 0.4)" }}
//               whileTap={{ scale: 0.98 }}
//               className="mt-23 w-full bg-obsidian text-canvas-white rounded-full pt-[15px] px-[22px] pb-[16px] font-bold text-[17px] transition-colors disabled:opacity-70 disabled:pointer-events-none flex justify-center items-center gap-2"
//             >
//               {isLoading ? "Creating..." : "Register"}
//             </motion.button>
//           </form>

//           <div style={{ transform: "translateZ(30px)" }}>
//             <p className="mt-38 text-center text-slate-mist text-body-sm">
//               Already have an account?{" "}
//               <Link
//                 to="/login"
//                 className="text-obsidian font-bold hover:text-desert-sienna transition-colors"
//               >
//                 Log in
//               </Link>
//             </p>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }
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