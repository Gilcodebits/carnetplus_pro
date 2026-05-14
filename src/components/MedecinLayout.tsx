import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SearchProvider } from "../contexts/SearchContext";
import { Menu } from "lucide-react";

export function MedecinLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const getHeaderConfig = () => {
    const path = location.pathname;
    if (path === '/medecin' || path === '/medecin/') {
      return { title: "Tableau de Bord", subtitle: "Cabinet Médical" };
    }
    if (path === '/medecin/agenda') {
      return { title: "Agenda", subtitle: "Planning des consultations" };
    }
    if (path === '/medecin/patients') {
      return { title: "Patients", subtitle: "Répertoire des dossiers suivis" };
    }
    if (path.includes('/medecin/messagerie')) {
      return { title: "Messagerie", subtitle: "Échanges sécurisés" };
    }
    if (path.includes('/medecin/consultation/')) {
      return { title: "Consultation", subtitle: "Suivi médical actif" };
    }
    if (path.includes('/medecin/prescription/')) {
      return { title: "Prescription", subtitle: "Rédaction d'ordonnance" };
    }
    if (path.includes('/medecin/examen/')) {
      return { title: "Examen Labo", subtitle: "Demande d'analyses" };
    }
    if (path.includes('/medecin/dossier/')) {
      return { title: "Dossier Patient", subtitle: "Historique médical complet" };
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
          role="medecin"
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
