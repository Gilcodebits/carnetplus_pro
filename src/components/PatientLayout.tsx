import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SearchProvider } from "../contexts/SearchContext";
import { Menu } from "lucide-react";

export function PatientLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const getHeaderConfig = () => {
    const path = location.pathname;
    if (path === '/patient' || path === '/patient/') {
      return { title: "Mon Espace Santé", subtitle: "Suivi médical personnel" };
    }
    if (path === '/patient/dossier') {
      return { title: "Dossier Médical", subtitle: "Historique et résultats" };
    }
    if (path === '/patient/calendrier-rdv') {
      return { title: "Rendez-vous", subtitle: "Gestion de mes consultations" };
    }
    if (path === '/patient/messagerie') {
      return { title: "Messagerie", subtitle: "Échanges avec les praticiens" };
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
          role="patient" 
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
