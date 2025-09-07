import { createContext, useMemo } from "react";

export const SimpleModeContext = createContext<{
  simpleMode: boolean;
  setSimpleMode: (value: boolean) => void;
} | null>(null);

interface SimpleModeContextProviderProps {
  simpleMode: boolean;
  setSimpleMode: (value: boolean) => void;
  children: React.ReactNode;
}

export default function SimpleModeContextProvider({
  simpleMode,
  setSimpleMode,
  children,
}: SimpleModeContextProviderProps) {
  const context = useMemo(
    () => ({
      simpleMode,
      setSimpleMode,
    }),
    [simpleMode, setSimpleMode]
  );

  return (
    <SimpleModeContext.Provider value={context}>
      {children}
    </SimpleModeContext.Provider>
  );
}
