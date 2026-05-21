import {
  BarChart3,
  Search,
  GitBranch,
  Binary,
  BrainCircuit
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function StudentPage() {

  const navigate = useNavigate();

  const categories = [

    {
      title: "Sorting Algorithms",
      icon: <BarChart3 size={40} />,
      color: "from-cyan-500 to-blue-500",
      count: "10 Algorithms",
      route: "/sorting"
    },

    {
      title: "Searching Algorithms",
      icon: <Search size={40} />,
      color: "from-green-500 to-emerald-500",
      count: "8 Algorithms",
      route: "/searching"
    },

    {
      title: "Graph Algorithms",
      icon: <GitBranch size={40} />,
      color: "from-purple-500 to-pink-500",
      count: "12 Algorithms",
      route: "/graph"
    },

    {
      title: "Tree Algorithms",
      icon: <Binary size={40} />,
      color: "from-yellow-500 to-orange-500",
      count: "10 Algorithms",
      route: "/tree"
    },

    {
      title: "Machine Learning",
      icon: <BrainCircuit size={40} />,
      color: "from-red-500 to-rose-500",
      count: "10 Models",
      route: "/ml"
    }

  ];

  return (

    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white p-10 relative overflow-hidden">

      {/* Glow Effects */}

      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full"></div>

      {/* Main Content */}

      <div className="relative z-10">

        {/* Heading */}

        <div className="mb-16">

          <h1 className="text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 text-transparent bg-clip-text mb-5 tracking-tight">

            Student Dashboard

          </h1>

          <p className="text-zinc-400 text-2xl">

            Explore algorithms and visualize them interactively

          </p>

        </div>

        {/* Cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">

          {categories.map((item, index) => (

            <div
              key={index}
              onClick={() => navigate(item.route)}
              className="group bg-white/5 border border-white/10 backdrop-blur-xl rounded-[35px] p-10 cursor-pointer hover:scale-105 hover:border-cyan-400/40 transition-all duration-500 shadow-[0_0_40px_rgba(0,255,255,0.08)]"
            >

              {/* Icon */}

              <div className={`w-24 h-24 rounded-[30px] bg-gradient-to-r ${item.color} flex items-center justify-center mb-10 shadow-2xl`}>

                {item.icon}

              </div>

              {/* Title */}

              <h2 className="text-4xl font-black mb-4 group-hover:text-cyan-300 transition-all duration-300">

                {item.title}

              </h2>

              {/* Count */}

              <p className="text-zinc-400 text-xl">

                {item.count}

              </p>

            </div>

          ))}

        </div>

      </div>

    </div>

  );
}

export default StudentPage;