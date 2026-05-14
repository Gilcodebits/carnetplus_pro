import { useState } from "react";
import { 
  Globe, Shield, Bell, HardDrive, Palette, Save, 
  Smartphone, Mail, Lock, Key, Database, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SETTINGS_TABS = [
  { id: 'general', label: 'Général', icon: Globe, desc: 'Identité de la plateforme' },
  { id: 'security', label: 'Sécurité & Accès', icon: Shield, desc: 'Protection des données' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Préférences d\'alertes' },
  { id: 'backup', label: 'Sauvegardes', icon: HardDrive, desc: 'Conservation des données' },
  { id: 'appearance', label: 'Apparence', icon: Palette, desc: 'Thème et couleurs' },
];

function AnimatedToggle({ enabled, onChange }: { enabled: boolean, onChange: () => void }) {
  return (
    <div 
      onClick={onChange}
      className={`w-14 h-7 rounded-full relative cursor-pointer border-2 transition-all duration-300 ${enabled ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-200' : 'bg-slate-200 border-slate-300'}`}
    >
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
        style={{ left: enabled ? "calc(100% - 24px)" : "4px" }}
      />
    </div>
  );
}

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const [toggles, setToggles] = useState({
    twoFactor: true,
    sessionExpiry: false,
    emailNotifs: true,
    smsNotifs: false,
    autoBackup: true,
    darkMode: false
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1200);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="border-b-2 border-slate-100 pb-6">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Paramètres Généraux</h2>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-1">Configurez l'identité principale du réseau.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Nom de la plateforme</label>
                <input type="text" defaultValue="CarnetPlus Pro" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-black text-slate-900 shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Email de contact système</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input type="email" defaultValue="admin@carnetplus.com" className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 shadow-inner" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Langue par défaut</label>
                <select className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer shadow-inner">
                  <option>Français (FR)</option>
                  <option>English (US)</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Fuseau Horaire</label>
                <select className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer shadow-inner">
                  <option>Afrique/Porto-Novo (GMT+1)</option>
                  <option>Europe/Paris (GMT+1/2)</option>
                </select>
              </div>
            </div>
          </motion.div>
        );
      
      case 'security':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="border-b-2 border-slate-100 pb-6">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sécurité & Accès</h2>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-1">Gérez la sécurité des comptes et des sessions.</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-200/30 transition-all gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-100">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Authentification à deux facteurs (2FA)</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Obligatoire pour les rôles Administrateur et Gestionnaire.</p>
                  </div>
                </div>
                <AnimatedToggle enabled={toggles.twoFactor} onChange={() => handleToggle('twoFactor')} />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-200/30 transition-all gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center border-2 border-orange-100">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Expiration stricte des sessions</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Déconnexion automatique après 30 minutes d'inactivité.</p>
                  </div>
                </div>
                <AnimatedToggle enabled={toggles.sessionExpiry} onChange={() => handleToggle('sessionExpiry')} />
              </div>
            </div>
            
            <div className="pt-4 border-t-2 border-slate-100">
               <button className="px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-[10px] uppercase tracking-widest rounded-2xl border-2 border-slate-200 transition-all">
                 Forcer la déconnexion de tous les utilisateurs
               </button>
            </div>
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="border-b-2 border-slate-100 pb-6">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Notifications Système</h2>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-1">Règles d'envoi des messages automatiques.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:border-blue-200 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center border-2 border-indigo-100">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Rapports par Email</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Envoi d'un récapitulatif quotidien aux admins.</p>
                  </div>
                </div>
                <AnimatedToggle enabled={toggles.emailNotifs} onChange={() => handleToggle('emailNotifs')} />
              </div>

              <div className="flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:border-blue-200 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center border-2 border-emerald-100">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Passerelle SMS</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Alertes SMS pour les événements critiques.</p>
                  </div>
                </div>
                <AnimatedToggle enabled={toggles.smsNotifs} onChange={() => handleToggle('smsNotifs')} />
              </div>
            </div>
          </motion.div>
        );

      case 'backup':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="border-b-2 border-slate-100 pb-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sauvegardes Base de Données</h2>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-1">Rétention et intégrité des données.</p>
              </div>
              <button className="flex items-center gap-2 px-5 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <Database className="w-4 h-4" /> Lancer une sauvegarde
              </button>
            </div>

            <div className="flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:border-blue-200 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border-2 border-purple-100">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Sauvegarde Automatique</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Dump quotidien de la base MySQL à minuit.</p>
                  </div>
                </div>
                <AnimatedToggle enabled={toggles.autoBackup} onChange={() => handleToggle('autoBackup')} />
            </div>
          </motion.div>
        );
        
      case 'appearance':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
             <div className="border-b-2 border-slate-100 pb-6">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Apparence & Thème</h2>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-1">Personnalisation visuelle globale.</p>
            </div>
            <div className="flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:border-blue-200 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center border-2 border-slate-700">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Mode Sombre par défaut</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Appliquer le thème sombre à l'ensemble du réseau.</p>
                  </div>
                </div>
                <AnimatedToggle enabled={toggles.darkMode} onChange={() => handleToggle('darkMode')} />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-fadeIn bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden flex flex-col">
      <div className="px-6 md:px-10 pb-12 pt-6">
        <div className="flex justify-end mb-8">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center justify-center gap-3 px-6 md:px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 w-full md:w-auto ${
              isSaving 
                ? 'bg-emerald-500 text-white shadow-emerald-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer les modifications</span>
              </>
            )}
          </button>
        </div>
      <div className="flex flex-col xl:flex-row gap-6 md:gap-10 max-w-7xl">
        {/* Sidebar Navigation - Horizontal scroll on mobile */}
        <div className="xl:w-80 flex-shrink-0 flex xl:flex-col gap-3 bg-white p-3 md:p-4 rounded-[2rem] md:rounded-[2.5rem] border-2 border-slate-100 shadow-sm h-fit overflow-x-auto no-scrollbar md:overflow-visible">
          {SETTINGS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 xl:w-full flex items-center gap-4 px-4 md:px-5 py-3 md:py-4 rounded-[1.2rem] md:rounded-[1.5rem] transition-all duration-300 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' 
                    : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                <div className={`flex items-center justify-center ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-500'}`}>
                  <tab.icon className="w-6 h-6" />
                </div>
                <div className="text-left whitespace-nowrap md:whitespace-normal">
                  <p className={`font-black text-xs md:text-sm uppercase tracking-tight leading-none mb-1 ${isActive ? 'text-white' : 'text-slate-700 group-hover:text-blue-600'}`}>{tab.label}</p>
                  <p className={`hidden md:block text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-blue-100' : 'text-slate-600'}`}>{tab.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white p-6 md:p-8 lg:p-12 rounded-[2rem] md:rounded-[3rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/50 min-h-[400px] md:min-h-[600px] relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} className="h-full">
               {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      </div>
    </div>
  );
}

