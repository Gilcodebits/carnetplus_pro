import { Home, Calendar, Users, FileText, TestTube, MessageSquare, Bell, Settings, LogOut, Activity, Stethoscope, Pill, Bot, ArrowLeftRight, Send, Inbox, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Role = "admin" | "medecin" | "secretaire" | "labo" | "patient" | "gestionnaire";

interface SidebarProps { role: Role; activePath: string; }

const menuItems: Record<Role, {icon:any;label:string;path:string}[]> = {
  admin: [
    {icon:Home,label:"Dashboard",path:"/admin"},
    {icon:Users,label:"Utilisateurs",path:"/admin/users"},
    {icon:BarChart3,label:"Rapports",path:"/admin/reports"},
    {icon:Settings,label:"Paramètres",path:"/admin/settings"},
  ],
  medecin: [
    {icon:Home,label:"Dashboard",path:"/medecin"},
    {icon:Users,label:"Patients",path:"/medecin"},
    {icon:Calendar,label:"Agenda",path:"/medecin"},
    {icon:Stethoscope,label:"Consultations",path:"/medecin"},
    {icon:Pill,label:"Prescriptions",path:"/medecin"},
    {icon:TestTube,label:"Examens labo",path:"/labo"},
    {icon:MessageSquare,label:"Messagerie",path:"/messagerie"},
  ],
  secretaire: [
    {icon:Home,label:"Dashboard",path:"/secretaire"},
    {icon:Calendar,label:"Rendez-vous",path:"/secretaire"},
    {icon:Users,label:"Patients",path:"/secretaire"},
    {icon:MessageSquare,label:"Messages",path:"/messagerie"},
  ],
  labo: [
    {icon:Home,label:"Dashboard",path:"/labo"},
    {icon:TestTube,label:"Examens",path:"/labo"},
    {icon:FileText,label:"Résultats",path:"/labo"},
  ],
  patient: [
    {icon:Home,label:"Accueil",path:"/patient"},
    {icon:Calendar,label:"Mes RDV",path:"/patient"},
    {icon:Bot,label:"Assistant IA",path:"/patient/assistant-ia"},
    {icon:Activity,label:"Bilan Santé",path:"/patient/bilan-sante"},
    {icon:FileText,label:"Dossier Médical",path:"/patient/dossier"},
    {icon:MessageSquare,label:"Messages",path:"/messagerie"},
  ],
  gestionnaire: [
    {icon:Home,label:"Dashboard",path:"/gestionnaire"},
    {icon:Send,label:"Envois",path:"/gestionnaire"},
    {icon:Inbox,label:"Réceptions",path:"/gestionnaire"},
    {icon:ArrowLeftRight,label:"Historique",path:"/gestionnaire"},
    {icon:Users,label:"Établissements",path:"/gestionnaire"},
    {icon:MessageSquare,label:"Messagerie",path:"/messagerie"},
  ],
};

const roleGradients: Record<Role,string> = {
  admin:        "from-slate-600 to-slate-800",
  medecin:      "from-blue-500 to-blue-700",
  secretaire:   "from-violet-500 to-violet-700",
  labo:         "from-teal-500 to-teal-700",
  patient:      "from-emerald-500 to-emerald-700",
  gestionnaire: "from-orange-500 to-orange-700",
};

const roleLabels: Record<Role,string> = {
  admin:"Administrateur", medecin:"Médecin", secretaire:"Secrétaire",
  labo:"Laboratoire", patient:"Patient", gestionnaire:"Gestionnaire"
};

const roleAvatarNames: Record<Role,string> = {
  admin:"Sys", medecin:"Dr. Rousseau", secretaire:"C. Adjovi",
  labo:"S. Hounsa", patient:"M. Dubois", gestionnaire:"L. Kpossou"
};

const roleInitials: Record<Role,string> = {
  admin:"A", medecin:"AR", secretaire:"CA", labo:"SH", patient:"MD", gestionnaire:"LK"
};

export function Sidebar({ role, activePath }: SidebarProps) {
  const navigate = useNavigate();
  const items    = menuItems[role];
  const grad     = roleGradients[role];

  return (
    <div className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col flex-shrink-0 shadow-sm animate-fadeInLeft">
      {/* Header gradient */}
      <div className={`bg-gradient-to-br ${grad} relative overflow-hidden flex-shrink-0`}>
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"/>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"/>

        {/* Logo */}
        <div className="px-5 pt-5 flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Activity className="w-5 h-5 text-white"/>
          </div>
          <div>
            <h1 className="font-black text-white text-sm tracking-wider">CARNETPLUS</h1>
            <p className="text-white/60 text-xs">{roleLabels[role]}</p>
          </div>
        </div>

        {/* Avatar */}
        <div className="px-5 py-4 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/30 animate-pulse-ring flex-shrink-0">
            {roleInitials[role]}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-bold truncate">{roleAvatarNames[role]}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"/>
              <span className="text-white/60 text-xs">En ligne</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-bold text-gray-300 uppercase tracking-wider px-3 pt-2 pb-1">Navigation</p>
        {items.map((item, i) => {
          const Icon    = item.icon;
          const isActive= activePath === item.path;
          return (
            <button key={`${item.path}-${item.label}`} onClick={()=>navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group animate-fadeInLeft delay-${Math.min((i+1)*100,700)} ${
                isActive
                  ? `bg-gradient-to-r ${grad} text-white shadow-md`
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${isActive ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"}`}>
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}/>
              </div>
              <span className="text-sm font-semibold truncate">{item.label}</span>
              {isActive && <span className="ml-auto w-2 h-2 bg-white rounded-full flex-shrink-0"/>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 flex-shrink-0 space-y-0.5">
        <button onClick={()=>navigate("/messagerie")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 transition-all group">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-all flex-shrink-0">
            <Bell className="w-4 h-4 text-orange-500"/>
          </div>
          <span className="text-sm font-semibold">Notifications</span>
          <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse">3</span>
        </button>
        <button onClick={()=>navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-red-100 transition-all flex-shrink-0">
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-all"/>
          </div>
          <span className="text-sm font-semibold">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
