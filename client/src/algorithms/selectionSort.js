export const selectionSort = async (
  array,
  setArray,
  speed,
  setActiveIndex,
  setSortedIndex,
  setCurrentStep
) => {

  let arr = [...array];

  for (let i = 0; i < arr.length; i++) {

    let minIndex = i;

    for (let j = i + 1; j < arr.length; j++) {

      setActiveIndex([minIndex, j]);

      setCurrentStep(
        `Comparing ${arr[minIndex]} and ${arr[j]}`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, speed)
      );

      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }

    [arr[i], arr[minIndex]] =
      [arr[minIndex], arr[i]];

    setArray([...arr]);

    setSortedIndex((prev) => [...prev, i]);

    await new Promise((resolve) =>
      setTimeout(resolve, speed)
    );
  }

  setActiveIndex([]);

  setCurrentStep("Selection Sort Completed ✅");
};