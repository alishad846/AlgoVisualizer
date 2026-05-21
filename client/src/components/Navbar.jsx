function Navbar() {
  return (
    <nav className="w-full bg-zinc-900 border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
      
      <h1 className="text-2xl font-bold text-cyan-400">
        AlgoVision
      </h1>

      <div className="flex gap-6 text-white font-medium">
        <button className="hover:text-cyan-400 transition">
          Sorting
        </button>

        <button className="hover:text-cyan-400 transition">
          Searching
        </button>

        <button className="hover:text-cyan-400 transition">
          Graph
        </button>

        <button className="hover:text-cyan-400 transition">
          ML
        </button>
      </div>
    </nav>
  );
}

export default Navbar;