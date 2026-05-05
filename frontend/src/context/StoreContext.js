// context/StoreContext.js
import { createContext, useContext } from "react";
import { todoStore } from "../store/TodoStore";

const StoreContext = createContext(todoStore);

export const useStore = () => useContext(StoreContext);
export const StoreProvider = ({ children }) => (
  <StoreContext.Provider value={todoStore}>{children}</StoreContext.Provider>
);
