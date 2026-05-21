import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function LoginPage() {

  const navigate = useNavigate();

  const [role, setRole] = useState("student");

  const handleLogin = () => {

    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/sorting");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative text-white">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 blur-[140px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 blur-[140px]" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-[450px] bg-zinc-900/70 border border-zinc-800 backdrop-blur-2xl rounded-[40px] p-10 shadow-2xl"
      >

        {/* Logo */}
        <h1 className="text-6xl font-black text-center mb-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-transparent bg-clip-text">
          AlgoVision
        </h1>

        <p className="text-center text-zinc-400 mb-10">
          AI Powered DSA Learning Platform
        </p>

        {/* Inputs */}
        <div className="space-y-5">

          <input
            type="email"
            placeholder="Enter Email"
            className="w-full bg-black/60 border border-zinc-700 rounded-2xl px-5 py-4 text-lg outline-none focus:border-cyan-400 transition-all"
          />

          <input
            type="password"
            placeholder="Enter Password"
            className="w-full bg-black/60 border border-zinc-700 rounded-2xl px-5 py-4 text-lg outline-none focus:border-cyan-400 transition-all"
          />

        </div>

        {/* Role Selection */}
        <div className="mt-8">

          <h2 className="text-xl font-semibold mb-5 text-zinc-300">
            Select Role
          </h2>

          <div className="grid grid-cols-2 gap-5">

            {/* Student */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setRole("student")}
              className={`cursor-pointer rounded-3xl p-6 border transition-all duration-300 ${
                role === "student"
                  ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(0,255,255,0.3)]"
                  : "border-zinc-700 bg-zinc-800/40"
              }`}
            >

              <div className="text-5xl mb-4">🎓</div>

              <h3 className="text-2xl font-bold">
                Student
              </h3>

              <p className="text-zinc-400 mt-2 text-sm">
                Learn algorithms visually
              </p>

            </motion.div>

            {/* Admin */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setRole("admin")}
              className={`cursor-pointer rounded-3xl p-6 border transition-all duration-300 ${
                role === "admin"
                  ? "border-purple-400 bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                  : "border-zinc-700 bg-zinc-800/40"
              }`}
            >

              <div className="text-5xl mb-4">⚡</div>

              <h3 className="text-2xl font-bold">
                Admin
              </h3>

              <p className="text-zinc-400 mt-2 text-sm">
                Manage full platform
              </p>

            </motion.div>

          </div>

        </div>

        {/* Login Button */}
        <motion.button
          whileHover={{
            scale: 1.03,
            boxShadow: "0px 0px 30px rgba(0,255,255,0.4)",
          }}
          whileTap={{ scale: 0.96 }}
          onClick={handleLogin}
          className="mt-10 w-full py-4 rounded-2xl text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-black"
        >

          Continue

        </motion.button>

      </motion.div>

    </div>
  );
}

export default LoginPage;