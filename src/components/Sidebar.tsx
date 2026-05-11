import { useState } from "react";
import { Home, Calendar, Users, FileText, TestTube, MessageSquare, Bell, Settings, LogOut, Activity, Stethoscope, Pill, Bot, ArrowLeftRight, Send, Inbox, BarChart3, ChevronRight, Building2, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMessages } from "../contexts/MessageContext";
import { ConfirmModal } from "./ConfirmModal";

type Role = "admin" | "medecin" | "secretaire" | "labo" | "patient" | "gestionnaire";

interface SidebarProps { role: Role; activePath: string; }

const menuItems: Record<Role, {icon:any;label:string;path:string}[]> = {
  admin: [
    {icon:Home,label:"Dashboard",path:"/admin"},
    {icon:Users,label:"Utilisateurs",path:"/admin/users"},
    {icon:Building2,label:"Établissements",path:"/admin/etablissements"},
    {icon:ShieldCheck,label:"Demandes",path:"/admin/demandes"},
    {icon:MessageSquare,label:"Messagerie",path:"/admin/messagerie"},
    {icon:BarChart3,label:"Rapports",path:"/admin/reports"},
    {icon:Settings,label:"Paramètres",path:"/admin/settings"},
  ],
  medecin: [
    {icon:Home,label:"Dashboard",path:"/medecin"},
    {icon:Users,label:"Patients",path:"/medecin/patients"},
    {icon:Calendar,label:"Agenda",path:"/medecin/agenda"},
    {icon:MessageSquare,label:"Messagerie",path:"/medecin/messagerie"},
  ],
  secretaire: [
    {icon:Home,label:"Dashboard",path:"/secretaire"},
    {icon:Users,label:"Patients",path:"/secretaire/patients"},
    {icon:MessageSquare,label:"Messagerie",path:"/secretaire/messagerie"},
  ],
  labo: [
    {icon:Home,label:"Dashboard",path:"/labo"},
    {icon:TestTube,label:"Analyses",path:"/labo/analyses"},
    {icon:MessageSquare,label:"Messagerie",path:"/labo/messagerie"},
  ],
  patient: [
    {icon:Home,label:"Accueil",path:"/patient"},
    {icon:Calendar,label:"Mes RDV",path:"/patient/calendrier-rdv"},
    {icon:Bot,label:"Assistant IA",path:"/patient/assistant-ia"},
    {icon:Activity,label:"Bilan Santé",path:"/patient/bilan-sante"},
    {icon:FileText,label:"Dossier Médical",path:"/patient/dossier"},
    {icon:MessageSquare,label:"Messagerie",path:"/patient/messagerie"},
  ],
  gestionnaire: [
    {icon:Home,label:"Dashboard",path:"/gestionnaire"},
    {icon:ArrowLeftRight,label:"Transferts & Flux",path:"/gestionnaire/transferts"},
    {icon:Building2,label:"Réseau Médical",path:"/gestionnaire/etablissements"},
    {icon:Users,label:"Personnel",path:"/gestionnaire/personnel"},
    {icon:MessageSquare,label:"Messagerie",path:"/gestionnaire/messagerie"},
    {icon:ShieldCheck,label:"Journal Conformité",path:"/gestionnaire/journal"},
  ],
};

const roleLabels: Record<Role,string> = {
  admin:"Administrateur", medecin:"Médecin", secretaire:"Secrétaire",
  labo:"Laboratoire", patient:"Patient", gestionnaire:"Gestionnaire"
};

export function Sidebar({ role, activePath }: SidebarProps) {
  const { logout } = useAuth();
  const { unreadMessagesCount } = useMessages();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const items    = menuItems[role];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col flex-shrink-0 relative z-20 no-print">
      {/* Sidebar Header - Blue Gradient */}
      <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"/>
        <Link to="/" className="flex items-center gap-3 relative z-10 group" title="Retour à l'accueil">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 group-hover:bg-white/30 transition-all">
            <Activity className="w-5 h-5 text-white"/>
          </div>
          <div>
            <h1 className="font-black text-white text-sm tracking-tight leading-none uppercase group-hover:text-blue-100 transition-colors">CARNETPLUS</h1>
            <p className="text-blue-100 text-[9px] uppercase font-bold mt-1 tracking-widest opacity-80">{roleLabels[role]}</p>
          </div>
        </Link>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hide">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3 mt-2">Menu</p>
        {items.map((item) => {
          const Icon    = item.icon;
          const isRoot = item.path === "/admin" || item.path === "/medecin" || item.path === "/secretaire" || item.path === "/labo" || item.path === "/patient" || item.path === "/gestionnaire";
          const isActive = isRoot 
            ? location.pathname === item.path 
            : location.pathname.startsWith(item.path);
          
          return (
            <Link key={item.path + item.label} to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? `bg-blue-600 text-white shadow-md shadow-blue-100`
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}>
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`}/>
              <span className="text-xs font-bold truncate">{item.label}</span>
              
              {item.label === "Messagerie" && unreadMessagesCount > 0 && (
                <span className={`ml-auto px-1.5 py-0.5 rounded-lg text-[9px] font-black ${
                  isActive ? "bg-white text-blue-600" : "bg-rose-500 text-white shadow-lg shadow-rose-200"
                }`}>
                  {unreadMessagesCount}
                </span>
              )}
              
              {isActive && item.label !== "Messagerie" && <ChevronRight className="ml-auto w-3.5 h-3.5 text-white/70"/>}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-50">
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all group"
        >
          <LogOut className="w-4 h-4 transition-all"/>
          <span className="text-xs font-bold">Déconnexion</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          logout();
          navigate("/");
        }}
        title="Déconnexion"
        message="Voulez-vous vraiment quitter la session ?"
        confirmText="Déconnecter"
        type="danger"
      />
    </div>
  );
}
