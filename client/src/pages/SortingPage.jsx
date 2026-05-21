import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function SortingPage() {
  const [array, setArray] = useState([]);
  const [speed, setSpeed] = useState(400);
  const [sorting, setSorting] = useState(false);
  const [steps, setSteps] = useState(0);
  const [activity, setActivity] = useState("Waiting to start...");
  const [algorithm, setAlgorithm] = useState("Bubble Sort");

  const [activeIndex, setActiveIndex] = useState([]);
  const [sortedIndex, setSortedIndex] = useState([]);

  useEffect(() => {
    generateArray();
  }, []);

  // GENERATE ARRAY
  const generateArray = () => {
    const newArray = [];

    for (let i = 0; i < 7; i++) {
      newArray.push(Math.floor(Math.random() * 120) + 10);
    }

    setArray(newArray);
    setSteps(0);
    setSortedIndex([]);
    setActivity("New array generated 🚀");
  };

  // SLEEP
  const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // START SORTING
  const startSorting = async () => {
    if (sorting) return;

    if (algorithm === "Bubble Sort") {
      await bubbleSort();
    }

    if (algorithm === "Selection Sort") {
      await selectionSort();
    }

    if (algorithm === "Insertion Sort") {
      await insertionSort();
    }

    if (algorithm === "Merge Sort") {
      await mergeSort();
    }
  };

  // BUBBLE SORT
  const bubbleSort = async () => {
    setSorting(true);

    let arr = [...array];
    let count = 0;

    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        setActiveIndex([j, j + 1]);

        setActivity(
          `Comparing ${arr[j]} and ${arr[j + 1]}`
        );

        await sleep(speed);

        if (arr[j] > arr[j + 1]) {
          setActivity(
            `Swapping ${arr[j]} ↔ ${arr[j + 1]}`
          );

          [arr[j], arr[j + 1]] = [
            arr[j + 1],
            arr[j],
          ];

          setArray([...arr]);

          await sleep(speed);
        }

        count++;
        setSteps(count);
      }

      setSortedIndex((prev) => [
        ...prev,
        arr.length - i - 1,
      ]);

      setActivity(
        `${arr[arr.length - i - 1]} fixed ✅`
      );
    }

    setActivity("Bubble Sort Completed 🚀");

    setActiveIndex([]);
    setSorting(false);
  };

  // SELECTION SORT
  const selectionSort = async () => {
    setSorting(true);

    let arr = [...array];
    let count = 0;

    for (let i = 0; i < arr.length; i++) {
      let min = i;

      for (let j = i + 1; j < arr.length; j++) {
        setActiveIndex([min, j]);

        setActivity(
          `Checking ${arr[j]} with ${arr[min]}`
        );

        await sleep(speed);

        if (arr[j] < arr[min]) {
          min = j;
        }

        count++;
        setSteps(count);
      }

      if (min !== i) {
        [arr[i], arr[min]] = [arr[min], arr[i]];

        setArray([...arr]);

        setActivity(
          `Swapped ${arr[i]} with ${arr[min]}`
        );

        await sleep(speed);
      }

      setSortedIndex((prev) => [...prev, i]);
    }

    setActivity("Selection Sort Completed 🚀");

    setActiveIndex([]);
    setSorting(false);
  };

  // INSERTION SORT
  const insertionSort = async () => {
    setSorting(true);

    let arr = [...array];
    let count = 0;

    for (let i = 1; i < arr.length; i++) {
      let current = arr[i];
      let j = i - 1;

      while (j >= 0 && arr[j] > current) {
        setActiveIndex([j, j + 1]);

        setActivity(
          `Moving ${arr[j]} forward`
        );

        arr[j + 1] = arr[j];

        setArray([...arr]);

        await sleep(speed);

        j--;

        count++;
        setSteps(count);
      }

      arr[j + 1] = current;

      setArray([...arr]);

      await sleep(speed);
    }

    setSortedIndex(
      arr.map((_, index) => index)
    );

    setActivity("Insertion Sort Completed 🚀");

    setActiveIndex([]);
    setSorting(false);
  };

  // MERGE SORT
  const mergeSort = async () => {
    setSorting(true);

    let arr = [...array];
    let count = 0;

    const merge = async (left, mid, right) => {
      let L = arr.slice(left, mid + 1);
      let R = arr.slice(mid + 1, right + 1);

      let i = 0;
      let j = 0;
      let k = left;

      while (i < L.length && j < R.length) {
        setActiveIndex([k]);

        setActivity(
          `Merging ${L[i]} and ${R[j]}`
        );

        await sleep(speed);

        if (L[i] <= R[j]) {
          arr[k] = L[i];
          i++;
        } else {
          arr[k] = R[j];
          j++;
        }

        setArray([...arr]);

        k++;

        count++;
        setSteps(count);
      }

      while (i < L.length) {
        arr[k] = L[i];

        i++;
        k++;

        setArray([...arr]);

        await sleep(speed);
      }

      while (j < R.length) {
        arr[k] = R[j];

        j++;
        k++;

        setArray([...arr]);

        await sleep(speed);
      }
    };

    const mergeSortHelper = async (
      left,
      right
    ) => {
      if (left >= right) return;

      const mid = Math.floor(
        (left + right) / 2
      );

      await mergeSortHelper(left, mid);

      await mergeSortHelper(mid + 1, right);

      await merge(left, mid, right);
    };

    await mergeSortHelper(0, arr.length - 1);

    setSortedIndex(
      arr.map((_, index) => index)
    );

    setActivity("Merge Sort Completed 🚀");

    setActiveIndex([]);

    setSorting(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 overflow-hidden">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">

        <div>
          <h1 className="text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Sorting Visualizer
          </h1>

          <p className="text-zinc-400 text-2xl mt-3">
            Interactive futuristic sorting algorithm visualization
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex gap-4 flex-wrap">

          <select
            value={algorithm}
            onChange={(e) =>
              setAlgorithm(e.target.value)
            }
            className="bg-zinc-900 border border-zinc-700 px-8 py-5 rounded-3xl text-2xl outline-none text-white"
          >
            <option className="bg-black text-white">
              Bubble Sort
            </option>

            <option className="bg-black text-white">
              Selection Sort
            </option>

            <option className="bg-black text-white">
              Insertion Sort
            </option>

            <option className="bg-black text-white">
              Merge Sort
            </option>
          </select>

          <button
            onClick={generateArray}
            className="px-10 py-5 rounded-3xl text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 duration-300 shadow-[0_0_40px_rgba(0,255,255,0.5)]"
          >
            Generate
          </button>

          <button
            onClick={startSorting}
            disabled={sorting}
            className="px-10 py-5 rounded-3xl text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 hover:scale-105 duration-300 shadow-[0_0_40px_rgba(0,255,120,0.5)]"
          >
            Start
          </button>

          <button
            onClick={generateArray}
            className="px-10 py-5 rounded-3xl text-xl font-bold bg-gradient-to-r from-pink-500 to-red-400 hover:scale-105 duration-300 shadow-[0_0_40px_rgba(255,0,100,0.5)]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* INFO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">

        <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-zinc-800 rounded-[30px] p-8">
          <h2 className="text-zinc-400 text-2xl">
            Algorithm
          </h2>

          <p className="text-5xl font-bold text-cyan-400 mt-5">
            {algorithm}
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-[30px] p-8">
          <h2 className="text-zinc-400 text-2xl">
            Time Complexity
          </h2>

          <p className="text-5xl font-bold text-yellow-400 mt-5">
            O(n²)
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-[30px] p-8">
          <h2 className="text-zinc-400 text-2xl">
            Total Steps
          </h2>

          <p className="text-5xl font-bold text-green-400 mt-5">
            {steps}
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-[30px] p-8">
          <h2 className="text-zinc-400 text-2xl">
            Space Complexity
          </h2>

          <p className="text-5xl font-bold text-pink-400 mt-5">
            O(1)
          </p>
        </div>
      </div>

      {/* SPEED */}
      <div className="mt-10 bg-zinc-900/60 border border-zinc-800 rounded-[35px] p-8">

        <div className="flex items-center gap-8">

          <h2 className="text-cyan-400 text-5xl font-bold">
            Speed
          </h2>

          <input
            type="range"
            min="50"
            max="1000"
            value={speed}
            onChange={(e) =>
              setSpeed(Number(e.target.value))
            }
            className="w-full"
          />

          <span className="text-4xl font-bold text-zinc-300">
            {speed}ms
          </span>
        </div>
      </div>

      {/* MAIN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-10">

        {/* LIVE PANEL */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[35px] p-8">

          <div className="flex items-center gap-3 text-green-400 text-3xl font-bold">
            <div className="w-5 h-5 rounded-full bg-green-400 animate-pulse"></div>
            Live Visualization Active
          </div>

          <h2 className="text-6xl font-black mt-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Live Activity
          </h2>

          <div className="mt-10 space-y-6">

            <div className="bg-black rounded-[25px] p-6 border border-zinc-800">
              <p className="text-zinc-500 text-xl">
                Current Status
              </p>

              <p className="text-3xl font-bold mt-4">
                {activity}
              </p>
            </div>

            <div className="bg-black rounded-[25px] p-6 border border-zinc-800">
              <p className="text-zinc-500 text-xl">
                Selected Algorithm
              </p>

              <p className="text-4xl font-bold text-cyan-400 mt-4">
                {algorithm}
              </p>
            </div>

            <div className="bg-black rounded-[25px] p-6 border border-zinc-800">
              <p className="text-zinc-500 text-xl">
                Total Steps
              </p>

              <p className="text-5xl font-black text-green-400 mt-4">
                {steps}
              </p>
            </div>
          </div>
        </div>

        {/* VISUALIZER */}
        <div className="lg:col-span-3 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[40px] p-10 overflow-hidden relative">

          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="relative flex items-end justify-center gap-6 h-[650px]">

            {array.map((value, index) => {

              let barColor =
                "from-cyan-400 via-blue-500 to-purple-500 shadow-cyan-500/40";

              if (
                activeIndex.includes(index)
              ) {
                barColor =
                  "from-red-500 via-pink-500 to-orange-400 shadow-red-500/50";
              }

              if (
                sortedIndex.includes(index)
              ) {
                barColor =
                  "from-green-400 via-emerald-500 to-lime-400 shadow-green-500/50";
              }

              return (
                <motion.div
                  key={index}
                  layout
                  initial={{
                    height: 0,
                    opacity: 0,
                  }}
                  animate={{
                    height: value * 4,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                  className={`w-24 rounded-t-[35px] bg-gradient-to-t ${barColor} shadow-[0_0_40px] relative`}
                >
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-cyan-300 text-4xl font-black">
                    {value}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SortingPage;