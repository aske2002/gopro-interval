import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import Header from "@/components/header";
import SimpleModeContextProvider from "@/context/SimpleModeContext";
import { useRef, useState } from "react";

export const Route = createRootRoute({
  component: () => {
    const [SimpleModeContext, setSimpleModeContext] = useState(false);
    const bodyRef = useRef<HTMLDivElement>(null);

    return (
      <SimpleModeContextProvider
        simpleMode={SimpleModeContext}
        setSimpleMode={setSimpleModeContext}
      >
        <div className="absolute top-0 left-0 w-full h-screen flex flex-col overflow-hidden">
          <Header scrollElement={bodyRef}/>
          <div className="overflow-auto scroll-smooth flex flex-col grow" ref={bodyRef}>
            <div className="container mx-auto px-4 py-8 bg-background flex flex-col grow">
              <Outlet />
              <div className="w-full flex mt-2 text-muted-foreground justify-between">
                <p>{new Date().getFullYear()}©</p>
                <div>
                  Made with ❤️ by
                  <a
                    className="font-mono text-foreground ml-2"
                    href="https://www.github.com/aske2002"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Aske Valdemar Koed
                  </a>
                </div>
              </div>
            </div>
          </div>
          <TanStackDevtools
            config={{
              position: "bottom-left",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </div>
      </SimpleModeContextProvider>
    );
  },
});
