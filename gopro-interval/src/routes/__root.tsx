import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import Header from "@/components/Header";

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <div className="mt-20 container mx-auto px-4 py-8 min-h-screen bg-backgroun">
        <Outlet />
        <div className="w-full flex mt-4 text-muted-foreground ">
          © {new Date().getFullYear()} Aske Valdemar Koed
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
    </>
  ),
});
