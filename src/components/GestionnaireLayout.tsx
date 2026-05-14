import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SearchProvider } from "../contexts/SearchContext";
import { Menu } from "lucide-react";

export function GestionnaireLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const getHeaderConfig = () => {
    const path = location.pathname;
    if (path === '/gestionnaire' || path === '/gestionnaire/') {
      return {
        title: "Tableau de Bord",
        subtitle: "Gestion de l'Établissement"
      };
    }
    if (path === '/gestionnaire/patients') {
      return {
        title: "Répertoire Patients",
        subtitle: "Base de données de l'établissement"
      };
    }
    if (path === '/gestionnaire/etablissements') {
      return {
        title: "Établissements",
        subtitle: "Gestion des structures de santé"
      };
    }
    if (path === '/gestionnaire/personnel') {
      return {
        title: "Personnel Médical",
        subtitle: "Gestion des accès et utilisateurs"
      };
    }
    if (path === '/gestionnaire/transferts') {
      return {
        title: "Transferts",
        subtitle: "Mouvements de patients inter-établissements"
      };
    }
    if (path === '/gestionnaire/journal') {
      return {
        title: "Journal d'Audit",
        subtitle: "Historique des actions et conformité"
      };
    }
    if (path === '/gestionnaire/messagerie') {
      return {
        title: "Messagerie",
        subtitle: "Communications sécurisées"
      };
    }
    if (path === '/gestionnaire/profil') {
      return {
        title: "Mon Profil",
        subtitle: "Gestion de votre compte"
      };
    }
    if (path === '/gestionnaire/notifications') {
      return {
        title: "Notifications",
        subtitle: "Alertes et messages système"
      };
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
          role="gestionnaire" 
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
