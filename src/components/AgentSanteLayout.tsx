import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SearchProvider } from "../contexts/SearchContext";

export function AgentSanteLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getHeaderConfig = () => {
    const path = location.pathname;
    if (path === '/agent-sante' || path === '/agent-sante/') {
      return { title: "Tableau de Bord", subtitle: "Agent de Santé" };
    }
    if (path === '/agent-sante/patients') {
      return { title: "Patients", subtitle: "Accès aux dossiers patients" };
    }
    if (path.includes('/agent-sante/messagerie')) {
      return { title: "Messagerie", subtitle: "Échanges sécurisés" };
    }
    if (path.includes('/agent-sante/dossier/')) {
      return { title: "Dossier Patient", subtitle: "Consultation & Suivi" };
    }
    return { title: "Espace Santé", subtitle: "Plateforme CarnetPlus" };
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
          role="agent_sante"
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
            <div className="animate-fadeIn">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}
