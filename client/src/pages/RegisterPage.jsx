import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 3D Tilt Effect Setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/login");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Failed to connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen flex bg-canvas-white font-helveticanowdisplay overflow-hidden perspective-[1000px]">
      {/* Left Panel - Imagery / Brand */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 bg-obsidian flex-col justify-between p-68 relative overflow-hidden"
      >
        {/* Subtle decorative background element */}
        <motion.div 
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-[150%] h-[150%] -translate-y-1/4 translate-x-1/4 bg-[radial-gradient(ellipse_at_center,_var(--color-slate-mist)_0%,_transparent_60%)] opacity-10 pointer-events-none" 
        />
        
        <div className="z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-canvas-white text-heading-sm font-bold tracking-[length:var(--tracking-heading-sm)] leading-[var(--leading-heading-sm)] mb-2"
          >
            AlgoVision.
          </motion.h1>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="z-10"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-canvas-white text-heading font-bold tracking-[length:var(--tracking-heading)] leading-[var(--leading-heading)] mb-23"
          >
            Join the Next Era
            <br />
            of Learning.
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-slate-mist text-body-sm leading-[var(--leading-body-sm)] max-w-md"
          >
            Create an account to track your progress, save custom algorithms, and experience learning without limits.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-22 sm:p-68 [perspective:1000px]">
        <motion.div 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-md bg-canvas-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-mist/10"
        >
          <div className="lg:hidden mb-11" style={{ transform: "translateZ(30px)" }}>
            <h1 className="text-obsidian text-heading-sm font-bold tracking-[length:var(--tracking-heading-sm)] leading-[var(--leading-heading-sm)]">
              AlgoVision.
            </h1>
          </div>

          <div style={{ transform: "translateZ(40px)" }}>
            <h2 className="text-obsidian text-heading-sm font-bold tracking-[length:var(--tracking-heading-sm)] leading-[var(--leading-heading-sm)] mb-11">
              Create Account
            </h2>
            <p className="text-slate-mist text-body-sm leading-[var(--leading-body-sm)] tracking-[length:var(--tracking-body-sm)] mb-38">
              Enter your details to register.
            </p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-23" style={{ transform: "translateZ(50px)" }}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-[10px] text-body-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="flex flex-col gap-2 relative group">
              <label className="text-obsidian text-[14px] font-bold transition-colors group-focus-within:text-obsidian/70">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full border-b-2 border-slate-mist/20 bg-transparent py-3 text-obsidian text-body-sm focus:outline-none focus:border-obsidian transition-colors placeholder:text-slate-mist/40"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 relative group">
              <label className="text-obsidian text-[14px] font-bold transition-colors group-focus-within:text-obsidian/70">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full border-b-2 border-slate-mist/20 bg-transparent py-3 text-obsidian text-body-sm focus:outline-none focus:border-obsidian transition-colors placeholder:text-slate-mist/40"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 relative group">
              <label className="text-obsidian text-[14px] font-bold transition-colors group-focus-within:text-obsidian/70">
                Confirm Password
              </label>
              <input
                type="password"
                required
                className="w-full border-b-2 border-slate-mist/20 bg-transparent py-3 text-obsidian text-body-sm focus:outline-none focus:border-obsidian transition-colors placeholder:text-slate-mist/40"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.03, boxShadow: "0px 10px 30px rgba(0, 13, 16, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="mt-23 w-full bg-obsidian text-canvas-white rounded-full pt-[15px] px-[22px] pb-[16px] font-bold text-[17px] transition-colors disabled:opacity-70 disabled:pointer-events-none flex justify-center items-center gap-2"
            >
              {isLoading ? "Creating..." : "Register"}
            </motion.button>
          </form>

          <div style={{ transform: "translateZ(30px)" }}>
            <p className="mt-38 text-center text-slate-mist text-body-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-obsidian font-bold hover:text-desert-sienna transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
