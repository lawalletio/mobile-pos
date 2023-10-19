export const addElementoToPassword = (
  element: (string | null)[],
  value: string,
) => {
  const tempElement = element;
  for (let index = 0; index < tempElement.length; index++) {
    if (!tempElement[index]) {
      tempElement[index] = value;
      break;
    }
  }
  return tempElement;
};

export const removeElementoToPassword = (
  element: (string | null)[],
  value: string | null,
) => {
  const tempElement = element;
  for (let index = tempElement.length; index >= 0; index--) {
    if (tempElement[index]) {
      tempElement[index] = value;
      break;
    }
  }

  return tempElement;
};
