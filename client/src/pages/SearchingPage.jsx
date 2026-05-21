import { motion } from "framer-motion";

function SearchingPage() {

  const algorithms = [
    {
      name: "Linear Search",
      color: "from-green-400 to-emerald-600",
      time: "O(n)",
    },
    {
      name: "Binary Search",
      color: "from-cyan-400 to-blue-600",
      time: "O(log n)",
    },
    {
      name: "Jump Search",
      color: "from-purple-400 to-pink-600",
      time: "O(√n)",
    },
    {
      name: "Interpolation Search",
      color: "from-yellow-400 to-orange-500",
      time: "O(log log n)",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-500/20 blur-[140px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 blur-[140px]" />

      <div className="relative z-10 p-10">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >

          <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-green-400 via-cyan-400 to-emerald-500 text-transparent bg-clip-text">

            Searching Algorithms

          </h1>

          <p className="text-zinc-400 text-xl mb-12">
            Visualize powerful searching algorithms in real-time
          </p>

        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">

          {algorithms.map((algo, index) => (

            <motion.div
              key={index}
              whileHover={{
                scale: 1.05,
                y: -10,
              }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              className="bg-zinc-900/60 border border-zinc-800 rounded-[30px] p-8 backdrop-blur-xl shadow-2xl"
            >

              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${algo.color} mb-6`} />

              <h2 className="text-3xl font-bold mb-3">
                {algo.name}
              </h2>

              <p className="text-zinc-400 mb-4">
                Time Complexity
              </p>

              <div className={`text-4xl font-black bg-gradient-to-r ${algo.color} text-transparent bg-clip-text`}>
                {algo.time}
              </div>

            </motion.div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default SearchingPage;