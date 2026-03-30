import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

export default function App({ Component, page_props }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Component {...page_props} />
      </AuthProvider>
    </ThemeProvider>
  );
}
