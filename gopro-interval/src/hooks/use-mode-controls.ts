import { SimpleModeContext } from "@/context/SimpleModeContext";
import { useContext } from "react";

export default function useModeControls() {
    const context = useContext(SimpleModeContext);
    if (!context) {
        throw new Error("useModeControls must be used within a SimpleModeContextProvider");
    }
    return context;
}