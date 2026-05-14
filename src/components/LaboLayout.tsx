import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SearchProvider } from "../contexts/SearchContext";
import { Menu } from "lucide-react";

export function LaboLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const getHeaderConfig = () => {
    const path = location.pathname;
    if (path === '/labo' || path === '/labo/') {
      return { title: "Tableau de Bord", subtitle: "Centre de Biologie Médicale" };
    }
    if (path === '/labo/analyses') {
      return { title: "Analyses", subtitle: "Suivi et traitement des prélèvements" };
    }
    if (path === '/labo/messagerie') {
      return { title: "Messagerie", subtitle: "Échanges sécurisés" };
    }
    return { title: undefined, subtitle: undefined };
  };

  const { title, subtitle } = getHeaderConfig();

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
          role="labo" 
          activePath={location.pathname} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Header 
            onMenuClick={() => setIsSidebarOpen(true)} 
            title={title}
            subtitle={subtitle}
          />
          
          <main className="flex-1 overflow-y-auto bg-slate-50 scrollbar-hide">
            <Outlet />
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}
