export const insertionSort = async (
  array,
  setArray,
  speed,
  setActiveIndex,
  setSortedIndex,
  setCurrentStep
) => {

  let arr = [...array];

  for (let i = 1; i < arr.length; i++) {

    let key = arr[i];

    let j = i - 1;

    while (j >= 0 && arr[j] > key) {

      setActiveIndex([j, j + 1]);

      setCurrentStep(
        `Moving ${arr[j]}`
      );

      arr[j + 1] = arr[j];

      j--;

      setArray([...arr]);

      await new Promise((resolve) =>
        setTimeout(resolve, speed)
      );
    }

    arr[j + 1] = key;

    setArray([...arr]);

    setSortedIndex((prev) => [...prev, i]);

    await new Promise((resolve) =>
      setTimeout(resolve, speed)
    );
  }

  setActiveIndex([]);

  setCurrentStep("Insertion Sort Completed ✅");
};