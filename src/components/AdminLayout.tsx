import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SearchProvider } from "../contexts/SearchContext";
import { Menu, X } from "lucide-react";

export function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isHome = [
    '/admin', '/admin/',
    '/medecin', '/medecin/',
    '/secretaire', '/secretaire/',
    '/gestionnaire', '/gestionnaire/',
    '/labo', '/labo/',
    '/patient', '/patient/'
  ].includes(location.pathname);

  return (
    <SearchProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar
          role={user?.role || "admin"}
          activePath={location.pathname}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {isHome && <Header onMenuClick={() => setIsSidebarOpen(true)} />}

          <main className="flex-1 overflow-y-auto bg-slate-50 scrollbar-hide">
            <Outlet />
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}
