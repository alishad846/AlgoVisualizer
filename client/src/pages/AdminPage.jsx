import {
  Users,
  BarChart3,
  BrainCircuit,
  Settings
} from "lucide-react";

function AdminPage() {

  const cards = [

    {
      title: "Total Students",
      value: "128",
      icon: <Users size={40} />,
      color: "from-cyan-500 to-blue-500"
    },

    {
      title: "Algorithms",
      value: "50+",
      icon: <BarChart3 size={40} />,
      color: "from-green-500 to-emerald-500"
    },

    {
      title: "ML Models",
      value: "12",
      icon: <BrainCircuit size={40} />,
      color: "from-purple-500 to-pink-500"
    },

    {
      title: "Settings",
      value: "Active",
      icon: <Settings size={40} />,
      color: "from-orange-500 to-red-500"
    }

  ];

  return (

    <div className="min-h-screen bg-black text-white p-10">

      <div className="mb-14">

        <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text mb-4">
          Admin Dashboard
        </h1>

        <p className="text-zinc-400 text-xl">
          Manage AlgoVision platform
        </p>

      </div>

      <div className="grid grid-cols-4 gap-8">

        {cards.map((item, index) => (

          <div
            key={index}
            className="bg-zinc-900 border border-zinc-800 rounded-[35px] p-8 shadow-2xl hover:scale-105 transition-all duration-300"
          >

            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-8`}>

              {item.icon}

            </div>

            <h2 className="text-2xl font-bold mb-3">
              {item.title}
            </h2>

            <p className="text-5xl font-black text-cyan-400">
              {item.value}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}

export default AdminPage;