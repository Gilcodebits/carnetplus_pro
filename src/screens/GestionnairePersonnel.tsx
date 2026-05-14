import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import {
  Users, UserPlus, Search,
  Stethoscope, Clock,
  FlaskConical, CheckCircle2, XCircle, Trash2, Edit, X, Save, ArrowRight, Mail, Phone, Shield, MoreHorizontal, ChevronRight, AlertTriangle
} from "lucide-react";
import { utilisateursAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

const roleIcons: Record<string, any> = {
  medecin: Stethoscope,
  secretaire: Clock,
  labo: FlaskConical,
};

const roleColors: Record<string, string> = {
  medecin: "bg-blue-50 text-blue-600 border-blue-100",
  secretaire: "bg-orange-50 text-orange-600 border-orange-100",
  labo: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

export function GestionnairePersonnel() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Tous");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [formData, setFormData] = useState({ prenom: "", nom: "", email: "", role: "medecin", telephone: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await utilisateursAPI.list();
      const filteredData = data.filter((u: any) =>
        Number(u.etablissement_id) === Number(currentUser?.etablissement_id) &&
        ['medecin', 'secretaire', 'labo'].includes(u.role)
      );
      const sortedData = filteredData.sort((a: any, b: any) => a.id - b.id);
      setUsers(sortedData);
    } catch (err) {
      showToast("Erreur", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (user: any) => {
    setUserToDelete(user);
    setShowConfirmDelete(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await utilisateursAPI.delete(userToDelete.id);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      showToast("Membre supprimé avec succès", "success");
      setShowConfirmDelete(false);
      setUserToDelete(null);
    } catch (err) {
      showToast("Erreur de suppression", "error");
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({ prenom: user.prenom, nom: user.nom, email: user.email, role: user.role, telephone: user.telephone || "" });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const dataToSave = { ...formData, etablissement_id: currentUser?.etablissement_id };
      if (editingUser) {
        await utilisateursAPI.update(editingUser.id, dataToSave);
        showToast("Profil mis à jour avec succès", "success");
      } else {
        await utilisateursAPI.create(dataToSave);
        showToast(`✅ Compte créé ! Identifiants envoyés par email à ${formData.email}`, "success");
        if (activeTab !== "Tous") setActiveTab("Tous");
      }
      setShowModal(false);
      setFormData({ prenom: "", nom: "", email: "", role: "medecin", telephone: "" });
      await loadUsers();
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'opération", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const s = searchTerm.toLowerCase();
    return (u.prenom.toLowerCase().includes(s) || u.nom.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)) && (activeTab === "Tous" || u.role.toLowerCase() === activeTab.toLowerCase());
  });

  const tabs = ["Tous", "Medecin", "Secretaire", "Labo"];
  return (
    <div className="animate-fadeIn bg-slate-50/50 min-h-screen w-full max-w-full overflow-x-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 pt-6 flex flex-col gap-6 md:gap-8 no-scrollbar">

        {/* Grid of Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 shrink-0">
          {[
            { label: "Médecins", count: users.filter(u => u.role === 'medecin').length, icon: Stethoscope, color: "from-blue-500 to-blue-600" },
            { label: "Secrétaires", count: users.filter(u => u.role === 'secretaire').length, icon: Clock, color: "from-orange-500 to-orange-600" },
            { label: "Laborantins", count: users.filter(u => u.role === 'labo').length, icon: FlaskConical, color: "from-emerald-500 to-emerald-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shrink-0`}><stat.icon className="w-4 h-4" /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-none">{stat.count}</h3>
                <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm shrink-0">
          <div className="flex gap-1.5 p-1 bg-slate-50 rounded-xl w-full lg:w-auto">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 lg:px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-900'}`}>{tab}</button>
            ))}
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-900" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher..."
              className="w-full pl-11 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 font-bold text-slate-900 text-xs transition-all" />
          </div>
        </div>

        {/* Tableau Premium */}
        <div className="flex-1 min-h-0 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 z-20">
                <tr className="bg-slate-900 text-white shadow-xl">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Membre</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Fonction</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Contact</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Statut</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 font-black text-base border-2 border-white shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">{u.prenom?.charAt(0)}{u.nom?.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{u.prenom} {u.nom}</p>
                            <p className="text-[9px] font-bold text-slate-900 mt-0.5 opacity-90">ID #{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${roleColors[u.role]}`}>
                          {u.role}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">{u.email}</span>
                          <span className="text-[10px] font-bold text-slate-900 opacity-90">{u.telephone || 'Non renseigné'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${u.actif ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                          <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{u.actif ? 'Actif' : 'Désactivé'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(u)} className="p-2.5 rounded-xl bg-slate-100 text-slate-900 hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => confirmDelete(u)} className="p-2.5 rounded-xl bg-slate-100 text-slate-900 hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr><td colSpan={5} className="px-8 py-20 text-center"><p className="text-slate-900 font-black uppercase tracking-widest text-xs">Aucun membre trouvé</p></td></tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Inscription / Modification */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">{editingUser ? <Edit className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}</div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{editingUser ? 'MODIFIER' : 'NOUVEAU'} <span className="text-blue-600">MEMBRE</span></h2>
                      <p className="text-[9px] font-black text-blue-900 uppercase tracking-widest">ÉQUIPE LOCALE</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-rose-50 text-slate-900 transition-all"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 no-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-slate-900 uppercase tracking-widest">Prénom</label>
                      <input required value={formData.prenom} onChange={e => setFormData({ ...formData, prenom: e.target.value })} className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-bold text-slate-900 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-slate-900 uppercase tracking-widest">Nom</label>
                      <input required value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-bold text-slate-900 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-slate-900 uppercase tracking-widest">Email Professionnel</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-bold text-slate-900 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-slate-900 uppercase tracking-widest">Fonction</label>
                      <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-black text-[9px] uppercase tracking-widest cursor-pointer transition-all">
                        <option value="medecin">MÉDECIN</option>
                        <option value="secretaire">SECRÉTAIRE</option>
                        <option value="labo">LABORATOIRE</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-slate-900 uppercase tracking-widest">Téléphone</label>
                      <input value={formData.telephone} onChange={e => setFormData({ ...formData, telephone: e.target.value })} className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-bold text-slate-900 text-sm" />
                    </div>
                  </div>
                  {!editingUser && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-0.5">Mot de passe auto-généré</p>
                        <p className="text-xs font-bold text-blue-600/80">Un mot de passe temporaire sécurisé sera généré automatiquement et envoyé à l'adresse email du nouveau membre. Il pourra le modifier lors de sa première connexion.</p>
                      </div>
                    </div>
                  )}
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="w-full py-4 bg-white text-slate-500 border-2 border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">ANNULER</button>
                    <button type="submit" disabled={submitting} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                      {submitting ? 'TRAITEMENT...' : (editingUser ? 'METTRE À JOUR' : 'CONFIRMER')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal Confirmation Suppression Premium */}
        <AnimatePresence>
          {showConfirmDelete && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center border border-slate-100">
                <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Supprimer le membre ?</h2>
                <p className="text-sm font-bold text-slate-900 opacity-90 mb-8">
                  Êtes-vous sûr de vouloir retirer <span className="text-rose-600">{userToDelete?.prenom} {userToDelete?.nom}</span> de votre équipe ? Cette action est irréversible.
                </p>
                <div className="flex flex-col gap-3">
                  <button onClick={handleDelete} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95">
                    Oui, Supprimer
                  </button>
                  <button onClick={() => setShowConfirmDelete(false)} className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">
                    Annuler
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

