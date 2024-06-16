export const getName = (type: string, t: (key: string) => string): string => {
  return t(type);
};
