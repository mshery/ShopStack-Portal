import { RouterProvider } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { router } from "@/core/routing/router";
import { initializeStores } from "@/data/loader";
import { queryClient } from "@/core/api/queryClient";
import { authApi, useAuthStore } from "@/modules/auth";
import { tokenStorage } from "@/core/security/storage";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";

function App() {
  const isInitializedRef = useRef<boolean | null>(null);
  const [bootDone, setBootDone] = useState(false);

  // Initialize stores synchronously on first render.
  if (isInitializedRef.current == null) {
    initializeStores();
    isInitializedRef.current = true;
  }

  // ITS-26: silent refresh on boot. If the httpOnly refresh cookie is still
  // valid the backend hands back a new access token; we populate the in-
  // memory store and restore the session. If it fails, the route guards send
  // the user to /login on the very next navigation — no token leak.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { token } = await authApi.refreshToken();
        if (!cancelled && token) {
          tokenStorage.setAccessToken(token);
          try {
            const user = await authApi.getProfile();
            if (cancelled) return;
            const isPlatform = !user.tenantId;
            useAuthStore.getState().login({
              user: isPlatform
                ? {
                    id: user.id,
                    email: user.email,
                    password: "",
                    name: user.name,
                    role: "super_admin",
                    status:
                      user.status === "suspended" ? "inactive" : user.status,
                    phone: user.phone,
                    avatarUrl: user.avatarUrl,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                  }
                : {
                    id: user.id,
                    tenant_id: user.tenantId!,
                    email: user.email,
                    password: "",
                    name: user.name,
                    role: user.role as "owner" | "cashier",
                    status:
                      user.status === "suspended" ? "inactive" : user.status,
                    phone: user.phone,
                    avatarUrl: user.avatarUrl,
                    createdBy: user.createdBy as "platform" | "tenant",
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                  },
              userType: isPlatform ? "platform" : "tenant",
              tenantId: user.tenantId ?? null,
              tenant: null,
            });
          } catch {
            // Profile fetch failed; fall through to login screen.
            tokenStorage.clearTokens();
          }
        }
      } catch {
        // No valid refresh cookie — user will land on /login.
      } finally {
        if (!cancelled) setBootDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!bootDone) return null;

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
