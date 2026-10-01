import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { router } from "./router";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Analytics />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
