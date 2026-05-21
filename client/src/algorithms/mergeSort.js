export const mergeSort = async (
  array,
  setArray,
  speed,
  setActiveIndex,
  setSortedIndex,
  setCurrentStep
) => {

  let arr = [...array];

  const merge = async (left, mid, right) => {

    let n1 = mid - left + 1;
    let n2 = right - mid;

    let L = [];
    let R = [];

    for (let i = 0; i < n1; i++) {
      L.push(arr[left + i]);
    }

    for (let j = 0; j < n2; j++) {
      R.push(arr[mid + 1 + j]);
    }

    let i = 0;
    let j = 0;
    let k = left;

    while (i < n1 && j < n2) {

      setActiveIndex([k]);

      setCurrentStep(
        `Merging ${L[i]} and ${R[j]}`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, speed)
      );

      if (L[i] <= R[j]) {

        arr[k] = L[i];
        i++;

      } else {

        arr[k] = R[j];
        j++;
      }

      setArray([...arr]);

      k++;
    }

    while (i < n1) {

      arr[k] = L[i];

      i++;
      k++;

      setArray([...arr]);

      await new Promise((resolve) =>
        setTimeout(resolve, speed)
      );
    }

    while (j < n2) {

      arr[k] = R[j];

      j++;
      k++;

      setArray([...arr]);

      await new Promise((resolve) =>
        setTimeout(resolve, speed)
      );
    }
  };

  const mergeSortHelper = async (left, right) => {

    if (left >= right) return;

    let mid = Math.floor((left + right) / 2);

    await mergeSortHelper(left, mid);

    await mergeSortHelper(mid + 1, right);

    await merge(left, mid, right);
  };

  await mergeSortHelper(0, arr.length - 1);

  setSortedIndex(
    Array.from(
      { length: arr.length },
      (_, i) => i
    )
  );

  setActiveIndex([]);

  setCurrentStep("Merge Sort Completed ✅");
};