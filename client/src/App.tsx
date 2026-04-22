import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import { useUser } from "@clerk/react";
import ProtectedRoute from "./components/custom/ProtectedRoute";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded)
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">Loading...</div>
    );

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <div className="min-h-screen transition-colors duration-300">
          <Routes>
            {/* Protected route */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />

            {/* Public route */}
            <Route
              path="/auth"
              element={!isSignedIn ? <Auth /> : <Navigate to="/" replace />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
