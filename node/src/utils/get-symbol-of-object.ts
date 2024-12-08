export const getSymbolOfObject = (obj: any, symbolKey: string) => {
  const symbol = Object.getOwnPropertySymbols(obj).find(sym => sym.toString() === symbolKey);
  if (!symbol) {
    return null;
  }
  return obj[symbol];
};
