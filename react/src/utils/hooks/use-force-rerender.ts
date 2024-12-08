import { useReducer } from "react";

export const useForceRerender = () =>
  useReducer(() => ({}), {})[1] as () => void; // <- paste here