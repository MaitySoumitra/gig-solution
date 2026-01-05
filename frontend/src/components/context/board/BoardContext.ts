import { createContext } from "react";
import type { Board } from "../../types/allType";

export const BoardContext=createContext<Board | null>(null)

