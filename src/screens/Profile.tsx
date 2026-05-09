import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  User, Mail, Phone, Shield, Key, Camera, 
  MapPin, Calendar, Heart, Droplets, CheckCircle2,
  Lock, ArrowRight, Save, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../components/Card";
import { ConfirmModal } from "../components/ConfirmModal";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";

export function Profile() {
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    prenom: user?.prenom || "",
    nom: user?.nom || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
    groupe_sanguin: user?.groupe_sanguin || "A+",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSave = () => {
    updateUser({
      prenom: formData.prenom,
      nom: formData.nom,
      telephone: formData.telephone
    });
    setIsEditing(false);
    showToast("Profil mis à jour avec succès !", "success");
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header Section - Compact */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative group">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100 group-hover:scale-105 transition-transform duration-500">
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          {isEditing && (
            <button className="absolute bottom-1 right-1 p-2 bg-white rounded-xl shadow-lg border-2 border-white text-blue-600 hover:scale-110 transition-all">
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">
              {user?.role}
            </span>
            {user?.role === 'patient' && (
              <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-1.5">
                <Droplets className="w-3 h-3" /> {user?.groupe_sanguin || "A+"}
              </span>
            )}
            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> Vérifié
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight mb-1 leading-none">
            {user?.prenom} {user?.nom}
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center md:justify-start gap-2">
             ID: {user?.id?.toString().padStart(6, '0')} · {user?.email}
          </p>
        </div>

        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="flex md:hidden items-center gap-3 px-8 py-5 bg-rose-50 text-rose-600 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-100 active:scale-95 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Déconnexion
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation Tabs */}
        <div className="lg:col-span-3 space-y-4">
           {[
             { id: 'info', label: 'Informations', icon: User },
             { id: 'security', label: 'Sécurité', icon: Shield },
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`w-full flex items-center gap-4 px-6 py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all ${
                 activeTab === tab.id 
                 ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                 : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-100'
               }`}
             >
               <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-400' : ''}`} />
               {tab.label}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {activeTab === 'info' ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50 space-y-10">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Détails Personnels</h2>
                    </div>
                    {!isEditing && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        Modifier le profil
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input 
                          type="text" 
                          value={formData.prenom}
                          disabled={!isEditing}
                          onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                          className={`w-full border-2 rounded-2xl py-4 pl-14 pr-6 font-bold transition-all outline-none ${
                            isEditing 
                            ? 'bg-white border-blue-500 text-slate-900' 
                            : 'bg-slate-50 border-slate-100 text-slate-900 cursor-not-allowed opacity-80'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input 
                          type="text" 
                          value={formData.nom}
                          disabled={!isEditing}
                          onChange={(e) => setFormData({...formData, nom: e.target.value})}
                          className={`w-full border-2 rounded-2xl py-4 pl-14 pr-6 font-bold transition-all outline-none ${
                            isEditing 
                            ? 'bg-white border-blue-500 text-slate-900' 
                            : 'bg-slate-50 border-slate-100 text-slate-900 cursor-not-allowed opacity-80'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input 
                          type="email" 
                          value={formData.email}
                          disabled
                          className="w-full bg-slate-100 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-400 cursor-not-allowed outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                      <div className="relative">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input 
                          type="text" 
                          value={formData.telephone}
                          disabled={!isEditing}
                          onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                          className={`w-full border-2 rounded-2xl py-4 pl-14 pr-6 font-bold transition-all outline-none ${
                            isEditing 
                            ? 'bg-white border-blue-500 text-slate-900' 
                            : 'bg-slate-50 border-slate-100 text-slate-900 cursor-not-allowed opacity-80'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-6 flex justify-end gap-4">
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                      >
                        Annuler
                      </button>
                      <button 
                        onClick={handleSave}
                        className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Save className="w-5 h-5" />
                        Enregistrer les modifications
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50 space-y-10">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Mot de Passe</h2>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe actuel</label>
                      <div className="relative">
                        <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={passwords.current}
                          onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-900 focus:border-blue-600 focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                        <div className="relative">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <input 
                            type="password" 
                            placeholder="••••••••"
                            value={passwords.new}
                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-900 focus:border-blue-600 focus:bg-white transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmer</label>
                        <div className="relative">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <input 
                            type="password" 
                            placeholder="••••••••"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-900 focus:border-blue-600 focus:bg-white transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button 
                      onClick={() => {
                        setPasswords({ current: "", new: "", confirm: "" });
                        showToast("Mot de passe mis à jour avec succès !", "success");
                      }}
                      className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
                    >
                      <ArrowRight className="w-5 h-5" />
                      Mettre à jour la sécurité
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Fin de session"
        message="Voulez-vous vraiment vous déconnecter ? Pour des raisons de sécurité, votre accès sera verrouillé jusqu'à votre prochaine connexion."
        confirmText="Déconnexion sécurisée"
        type="danger"
      />
    </div>
  );
}
