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
  const getHeaderConfig = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') {
      return { title: "Dashboard Admin", subtitle: "Vue d'ensemble et état de la plateforme" };
    }
    if (path === '/admin/users') {
      return { title: "Utilisateurs", subtitle: "Gestion des comptes et des rôles" };
    }
    if (path === '/admin/etablissements') {
      return { title: "Établissements", subtitle: "Réseau des structures partenaires" };
    }
    if (path === '/admin/demandes') {
      return { title: "Demandes d'adhésion", subtitle: "Validation des nouveaux partenaires" };
    }
    if (path === '/admin/reports') {
      return { title: "Rapports & Audit", subtitle: "Analyses et journaux d'activité" };
    }
    if (path === '/admin/settings') {
      return { title: "Configuration", subtitle: "Paramètres globaux du système" };
    }
    if (path === '/admin/messagerie') {
      return { title: "Messagerie", subtitle: "Communications administratives" };
    }
    
    // Medecin Paths (if using AdminLayout)
    if (path === '/medecin' || path === '/medecin/') {
      return { title: undefined, subtitle: undefined }; // Greeting
    }
    if (path === '/medecin/messagerie') {
      return { title: "Messagerie", subtitle: "Échanges sécurisés" };
    }
    if (path === '/medecin/patients') {
      return { title: "Répertoire Patients", subtitle: "Liste complète des patients suivis" };
    }
    if (path === '/medecin/agenda') {
      return { title: "Agenda Médical", subtitle: "Planning des consultations" };
    }
    if (path === '/admin/profil' || path === '/medecin/profil') {
      return { title: "Mon Profil", subtitle: "Gestion de votre compte" };
    }
    if (path === '/admin/notifications' || path === '/medecin/notifications') {
      return { title: "Notifications", subtitle: "Alertes et messages système" };
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
          role={user?.role || "admin"}
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
