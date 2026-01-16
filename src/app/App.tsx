import { RouterProvider } from "react-router-dom";
import { useRef } from "react";
import { router } from "./router";
import { initializeStores } from "@/data/loader";
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
    <ThemeProvider>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
