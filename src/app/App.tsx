import { RouterProvider } from "react-router-dom";
import { useRef } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { router } from "@/core/routing/router";
import { initializeStores } from "@/data/loader";
import { queryClient } from "@/core/api/queryClient";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";

function App() {
  const isInitializedRef = useRef<boolean | null>(null);

  // Initialize stores synchronously on first render
  if (isInitializedRef.current == null) {
    initializeStores();
    isInitializedRef.current = true;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SidebarProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </SidebarProvider>
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
