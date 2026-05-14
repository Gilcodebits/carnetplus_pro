import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SearchProvider } from "../contexts/SearchContext";
import { Menu } from "lucide-react";

export function SecretaireLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getHeaderConfig = () => {
    const path = location.pathname;
    if (path === '/secretaire' || path === '/secretaire/') {
      return {
        title: "Tableau de Bord",
        subtitle: "Gestion du Secrétariat"
      };
    }
    if (path === '/secretaire/patients') {
      return {
        title: "Répertoire Patient",
        subtitle: "Base de données des patients inscrits"
      };
    }
    if (path === '/secretaire/nouveau-patient') {
      return {
        title: "Nouveau Patient",
        subtitle: "Enregistrement d'un nouveau dossier"
      };
    }
    if (path.includes('/secretaire/patients/')) {
      return {
        title: "Dossier Médical",
        subtitle: "Consultation et historique du patient"
      };
    }
    if (path === '/secretaire/messagerie') {
      return {
        title: "Messagerie",
        subtitle: "Communications internes et patients"
      };
    }
    if (path === '/secretaire/profil') {
      return {
        title: "Mon Profil",
        subtitle: "Gestion de votre compte"
      };
    }
    if (path === '/secretaire/notifications') {
      return {
        title: "Notifications",
        subtitle: "Alertes et messages système"
      };
    }
    // Default: Show Greeting
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
          role="secretaire"
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