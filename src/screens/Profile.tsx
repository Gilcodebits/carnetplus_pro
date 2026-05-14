import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  User, Mail, Phone, Shield, Key, Camera,
  MapPin, Calendar, Heart, Droplets, CheckCircle2,
  Lock, ArrowRight, Save, LogOut, Eye, EyeOff
} from "lucide-react";
import { authAPI } from "../services/api";
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

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      showToast("Veuillez remplir tous les champs", "error");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showToast("Les nouveaux mots de passe ne correspondent pas", "error");
      return;
    }
    if (passwords.new.length < 6) {
      showToast("Le mot de passe doit contenir au moins 6 caractères", "error");
      return;
    }
    setLoadingPassword(true);
    try {
      await authAPI.updatePassword({
        current_password: passwords.current,
        new_password: passwords.new
      });
      setPasswords({ current: "", new: "", confirm: "" });
      showToast("Mot de passe mis à jour avec succès !", "success");
    } catch (err: any) {
      showToast(err.message || "Erreur de mise à jour", "error");
    } finally {
      setLoadingPassword(false);
    }
  };

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
    <div className="animate-fadeIn h-full flex flex-col bg-slate-50 w-full max-w-full overflow-x-hidden min-h-screen">
      <div className="flex-1 overflow-y-auto p-4 md:p-10 pt-6 scrollbar-hide">
        <div className="max-w-6xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
            {/* Navigation Tabs */}
            <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 md:gap-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
              {[
                { id: 'info', label: 'Informations', icon: User },
                { id: 'security', label: 'Sécurité', icon: Shield },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 lg:w-full flex items-center justify-center lg:justify-start gap-2 md:gap-3 px-3 md:px-5 py-1 md:py-1.5 rounded-xl font-black text-[8px] md:text-[9px] uppercase tracking-widest transition-all whitespace-nowrap border ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-500/10 scale-[1.01]'
                      : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-600 border-slate-100'
                    }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`} />
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
                    <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-slate-50 space-y-6 md:space-y-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-4">
                          <div className="w-1.5 h-6 md:h-8 bg-blue-600 rounded-full" />
                          <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">Détails</h2>
                        </div>
                        {!isEditing && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-black text-[8px] md:text-[9px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            Modifier
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 md:space-y-3">
                          <label className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Prénom</label>
                          <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-500" />
                            <input
                              type="text"
                              value={formData.prenom}
                              disabled={!isEditing}
                              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                              className={`w-full border-2 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-12 md:pl-14 pr-6 font-bold transition-all outline-none text-xs md:text-sm ${isEditing
                                  ? 'bg-white border-blue-500 text-slate-900'
                                  : 'bg-slate-50 border-slate-100 text-slate-900 cursor-not-allowed opacity-80'
                                }`}
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Nom</label>
                          <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                              type="text"
                              value={formData.nom}
                              disabled={!isEditing}
                              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                              className={`w-full border-2 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-14 pr-6 font-bold transition-all outline-none text-xs md:text-sm ${isEditing
                                  ? 'bg-white border-blue-500 text-slate-900'
                                  : 'bg-slate-50 border-slate-100 text-slate-900 cursor-not-allowed opacity-80'
                                }`}
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                              type="email"
                              value={formData.email}
                              disabled
                              className="w-full bg-slate-100 border-2 border-slate-100 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-14 pr-6 font-bold text-slate-600 cursor-not-allowed outline-none text-xs md:text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Téléphone</label>
                          <div className="relative">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                              type="text"
                              value={formData.telephone}
                              disabled={!isEditing}
                              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                              className={`w-full border-2 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-14 pr-6 font-bold transition-all outline-none text-xs md:text-sm ${isEditing
                                  ? 'bg-white border-blue-500 text-slate-900'
                                  : 'bg-slate-50 border-slate-100 text-slate-900 cursor-not-allowed opacity-80'
                                }`}
                            />
                          </div>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="pt-4 md:pt-6 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="w-full sm:w-auto px-6 py-2 md:py-2.5 bg-slate-100 text-slate-600 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={handleSave}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 md:px-8 py-2 md:py-2.5 bg-blue-600 text-white rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Enregistrer
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
                    <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-slate-50 space-y-6 md:space-y-8">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Mot de Passe</h2>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Mot de passe actuel</label>
                          <div className="relative">
                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                              type={showCurrent ? "text" : "password"}
                              placeholder="••••••••"
                              value={passwords.current}
                              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-14 pr-12 font-bold text-slate-900 focus:border-blue-600 focus:bg-white transition-all outline-none text-xs md:text-sm"
                            />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-blue-600 transition-colors">
                              {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                            <div className="relative">
                              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                              <input
                                type={showNew ? "text" : "password"}
                                placeholder="••••••••"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-14 pr-12 font-bold text-slate-900 focus:border-blue-600 focus:bg-white transition-all outline-none text-xs md:text-sm"
                              />
                              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-blue-600 transition-colors">
                                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Confirmer</label>
                            <div className="relative">
                              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                              <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="••••••••"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-14 pr-12 font-bold text-slate-900 focus:border-blue-600 focus:bg-white transition-all outline-none text-xs md:text-sm"
                              />
                              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-blue-600 transition-colors">
                                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 flex justify-end">
                        <button
                          onClick={handleUpdatePassword}
                          disabled={loadingPassword}
                          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md shadow-slate-200 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingPassword ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5" />
                          )}
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
      </div>
    </div>
  );
}

