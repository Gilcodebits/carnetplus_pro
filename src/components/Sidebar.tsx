import { Home, Calendar, Users, FileText, TestTube, MessageSquare, Bell, Settings, LogOut, Activity, Stethoscope, Pill, Bot, ArrowLeftRight, Send, Inbox, BarChart3, ChevronRight, Building2, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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
    {icon:Building2,label:"Réseau Actif",path:"/gestionnaire/etablissements"},
    {icon:Users,label:"Personnel",path:"/gestionnaire/personnel"},
    {icon:MessageSquare,label:"Messagerie",path:"/gestionnaire/messagerie"},
  ],
};

const roleGradients: Record<Role,string> = {
  admin:        "from-blue-600 to-blue-800",
  medecin:      "from-blue-500 to-blue-700",
  secretaire:   "from-blue-600 to-blue-800",
  labo:         "from-blue-600 to-blue-800",
  patient:      "from-blue-600 to-blue-800",
  gestionnaire: "from-blue-600 to-blue-800",
};

const roleLabels: Record<Role,string> = {
  admin:"Administrateur", medecin:"Médecin", secretaire:"Secrétaire",
  labo:"Laboratoire", patient:"Patient", gestionnaire:"Gestionnaire"
};

export function Sidebar({ role, activePath }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const items    = menuItems[role];
  const grad     = roleGradients[role];

  return (
    <div className="w-64 bg-white border-r border-slate-100 h-screen flex flex-col flex-shrink-0 shadow-sm animate-fadeInLeft relative z-20">
      {/* Header gradient */}
      <div className={`bg-gradient-to-br ${grad} relative overflow-hidden flex-shrink-0 p-6`}>
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"/>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"/>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Activity className="w-6 h-6 text-white"/>
          </div>
          <div>
            <h1 className="font-black text-white text-base tracking-wider leading-none">CARNETPLUS</h1>
            <p className="text-white/60 text-[10px] uppercase font-bold mt-1 tracking-widest">{roleLabels[role]}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-4">Menu Principal</p>
        {items.map((item) => {
          const Icon    = item.icon;
          const isRoot = item.path === "/admin" || item.path === "/medecin" || item.path === "/secretaire" || item.path === "/labo" || item.path === "/patient" || item.path === "/gestionnaire";
          const isActive = isRoot 
            ? location.pathname === item.path 
            : location.pathname.startsWith(item.path);
          
          return (
            <Link key={item.path + item.label} to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive
                  ? `bg-blue-600 text-white shadow-xl shadow-blue-100`
                  : "text-slate-600 hover:bg-slate-50 hover:text-gray-900"
              }`}>
              <div className={`p-2 rounded-xl transition-all ${isActive ? "bg-white/20" : "bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50"}`}>
                <Icon className={`w-4 h-4`}/>
              </div>
              <span className="text-xs font-black uppercase tracking-tight truncate">{item.label}</span>
              {isActive && <ChevronRight className="ml-auto w-4 h-4 text-white/50"/>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-6 border-t border-gray-50 flex-shrink-0">
        <button onClick={() => { logout(); navigate("/"); }}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-rose-600 bg-rose-50/50 hover:bg-rose-600 hover:text-white transition-all group shadow-sm shadow-rose-100">
          <div className="p-2 bg-white/50 rounded-xl group-hover:bg-white/20 transition-all">
            <LogOut className="w-4 h-4 text-rose-500 group-hover:text-white transition-all"/>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">DÉCONNEXION</span>
        </button>
      </div>
    </div>
  );
}
