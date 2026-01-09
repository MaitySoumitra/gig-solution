import { useContext } from "react";
import { BoardContext } from "./BoardContext"; // check path
import { CircleNotch } from "@phosphor-icons/react";

export const GlobalSpinner = () => {
    const boardContext = useContext(BoardContext);
    
    // If context isn't ready or not loading, show nothing
    if (!boardContext?.loading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/10 backdrop-blur-xs">
            <div className="">
                <CircleNotch size={48} weight="bold" className="text-blue-600 animate-spin" />
                
            </div>
        </div>
    );
};