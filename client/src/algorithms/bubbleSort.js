export const bubbleSort = async (
  array,
  setArray,
  speed,
  setActiveIndex,
  setSortedIndex,
  setCurrentStep
) => {

  let arr = [...array];

  for (let i = 0; i < arr.length; i++) {

    for (let j = 0; j < arr.length - i - 1; j++) {

      setActiveIndex([j, j + 1]);

      setCurrentStep(
        `Comparing ${arr[j]} and ${arr[j + 1]}`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, speed)
      );

      if (arr[j] > arr[j + 1]) {

        setCurrentStep(
          `Swapping ${arr[j]} and ${arr[j + 1]}`
        );

        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        setArray([...arr]);

        await new Promise((resolve) =>
          setTimeout(resolve, speed)
        );
      }
    }

    setSortedIndex((prev) => [
      ...prev,
      arr.length - i - 1
    ]);
  }

  setActiveIndex([]);

  setCurrentStep("Sorting Completed ✅");
};