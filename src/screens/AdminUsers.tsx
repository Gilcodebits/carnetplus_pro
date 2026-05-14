import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import {
  Users, UserPlus, Search,
  Shield, Stethoscope, Clock,
  FlaskConical, UserCircle, CheckCircle2, XCircle, Trash2, Edit, X, Save
} from "lucide-react";
import { utilisateursAPI } from "../services/api";
import { useSearch } from "../contexts/SearchContext";

const roleIcons: Record<string, any> = {
  admin: Shield,
  medecin: Stethoscope,
  secretaire: Clock,
  labo: FlaskConical,
  patient: UserCircle,
  gestionnaire: Users,
};

const roleColors: Record<string, string> = {
  admin: "bg-purple-50 text-purple-600 border-purple-100",
  medecin: "bg-blue-50 text-blue-600 border-blue-100",
  secretaire: "bg-orange-50 text-orange-600 border-orange-100",
  labo: "bg-teal-50 text-teal-600 border-teal-100",
  patient: "bg-emerald-50 text-emerald-600 border-emerald-100",
  gestionnaire: "bg-indigo-50 text-indigo-600 border-indigo-100",
};

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, setSearchQuery } = useSearch();
  const [activeTab, setActiveTab] = useState("Tous");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    prenom: "", nom: "", email: "", role: "patient", password: "", telephone: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await utilisateursAPI.list();
      setUsers(data);
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    try {
      await utilisateursAPI.delete(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      role: user.role,
      password: "",
      telephone: user.telephone || ""
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        await utilisateursAPI.update(editingUser.id, formData);
      } else {
        await utilisateursAPI.create(formData);
      }
      setShowModal(false);
      loadUsers();
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      `${u.prenom} ${u.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "Tous" ||
      u.role.toLowerCase() === activeTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  const roles = ["Tous", "Admin", "Medecin", "Secretaire", "Labo", "Patient", "Gestionnaire"];

  return (
    <div className="animate-fadeIn bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden flex flex-col">
      <div className="px-6 md:px-10 pb-12 pt-6 space-y-10">

        {/* Stats Cards - REDUCED OPACITY / SOFTER COLORS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12">
          <div className="bg-white p-3 md:p-8 rounded-[1.2rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border-2 border-slate-200 flex flex-col justify-between group hover:border-blue-400 transition-all">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-14 md:h-14 bg-blue-50 border-2 border-blue-100 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Users className="w-4 h-4 md:w-7 md:h-7 text-blue-600" />
              </div>
              <span className="hidden sm:inline-block text-[9px] font-black text-blue-600 bg-white border border-blue-100 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em] shadow-sm">Global</span>
            </div>
            <div>
              <h3 className="text-xl md:text-4xl font-black text-slate-900 mb-1 tracking-tighter">{users.length}</h3>
              <p className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest">Utilisateurs</p>
            </div>
          </div>

          <div className="bg-white p-3 md:p-8 rounded-[1.2rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border-2 border-slate-200 flex flex-col justify-between group hover:border-emerald-400 transition-all">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-14 md:h-14 bg-emerald-50 border-2 border-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <CheckCircle2 className="w-4 h-4 md:w-7 md:h-7 text-emerald-600" />
              </div>
              <span className="hidden sm:inline-block text-[9px] font-black text-emerald-600 bg-white border border-emerald-100 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em] shadow-sm">Actifs</span>
            </div>
            <div>
              <h3 className="text-xl md:text-4xl font-black text-slate-900 mb-1 tracking-tighter">{users.filter(u => u.actif !== 0).length}</h3>
              <p className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest">En ligne</p>
            </div>
          </div>

          <div className="bg-white p-3 md:p-8 rounded-[1.2rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border-2 border-slate-200 flex flex-col justify-between group hover:border-purple-400 transition-all">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-14 md:h-14 bg-purple-50 border-2 border-purple-100 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Shield className="w-4 h-4 md:w-7 md:h-7 text-purple-600" />
              </div>
              <span className="hidden sm:inline-block text-[9px] font-black text-purple-600 bg-white border border-purple-100 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em] shadow-sm">Admins</span>
            </div>
            <div>
              <h3 className="text-xl md:text-4xl font-black text-slate-900 mb-1 tracking-tighter">{users.filter(u => u.role === 'admin').length}</h3>
              <p className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest">Gestion</p>
            </div>
          </div>

          <div className="bg-white p-3 md:p-8 rounded-[1.2rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border-2 border-slate-200 flex flex-col justify-between group hover:border-orange-400 transition-all">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-14 md:h-14 bg-orange-50 border-2 border-orange-100 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Clock className="w-4 h-4 md:w-7 md:h-7 text-orange-500" />
              </div>
              <span className="hidden sm:inline-block text-[9px] font-black text-orange-600 bg-white border border-orange-100 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em] shadow-sm">Activité</span>
            </div>
            <div>
              <h3 className="text-xl md:text-4xl font-black text-slate-900 mb-1 tracking-tighter">5m</h3>
              <p className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest">MAJ</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Filters & Search */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 md:gap-8 bg-white p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50">
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center lg:justify-start">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveTab(role)}
                  className={`px-4 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black transition-all uppercase tracking-widest border-2 shadow-sm ${activeTab === role
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-200 scale-105'
                      : 'text-slate-700 bg-slate-50 border-slate-100 hover:border-blue-200 hover:text-blue-600'
                    }`}
                >
                  {role}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-[35rem] group">
              <Search className={`absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors z-10 ${searchQuery ? 'text-blue-600' : 'text-slate-600'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un profil par nom, email..."
                className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-slate-200 rounded-[2rem] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-black text-slate-900 placeholder-slate-300 shadow-inner"
              />
            </div>
          </div>

          {/* Users Table Card */}
          <div className="space-y-4">
            {loading ? (
              <div className="p-32 text-center bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Synchronisation sécurisée des données...</p>
              </div>
            ) : (
              <>
                {filteredUsers.length > 0 ? (
                  <div className="bg-white rounded-[2rem] border-2 border-slate-200 overflow-hidden shadow-xl shadow-slate-200/40">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900 border-b-2 border-slate-800">
                            <th className="px-6 py-4 text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">Utilisateur</th>
                            <th className="px-6 py-4 text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">Contact</th>
                            <th className="px-6 py-4 text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">Privilège</th>
                            <th className="px-6 py-4 text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">Statut</th>
                            <th className="px-6 py-4 text-[10px] font-black text-white uppercase tracking-[0.2em] text-right whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100">
                          {filteredUsers.map((u, i) => {
                            const Icon = roleIcons[u.role] || UserCircle;
                            return (
                              <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-4">
                                    <div className="relative">
                                      <div className="w-12 h-12 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-blue-600 font-black text-lg shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all uppercase">
                                        {u.prenom.charAt(0)}{u.nom.charAt(0)}
                                      </div>
                                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${u.actif !== 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    </div>
                                    <div>
                                      <p className="font-black text-slate-900 text-sm uppercase tracking-tight leading-none group-hover:text-blue-600 transition-colors">{u.prenom} {u.nom}</p>
                                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">ID: {u.id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-800">{u.email}</p>
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{u.telephone || "SANS CONTACT"}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-[9px] font-black uppercase tracking-widest ${roleColors[u.role] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                    {u.role}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${u.actif !== 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                                    {u.actif !== 0 ? 'En Ligne' : 'Hors Ligne'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleEdit(u)}
                                      className="p-2.5 text-slate-600 hover:text-blue-600 bg-white rounded-xl transition-all border-2 border-slate-100 hover:border-blue-200 shadow-sm flex items-center justify-center active:scale-95"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(u.id)}
                                      className="p-2.5 text-slate-600 hover:text-rose-600 bg-white rounded-xl transition-all border-2 border-slate-100 hover:border-rose-200 shadow-sm flex items-center justify-center active:scale-95"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-24 text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border-2 border-slate-100">
                      <Search className="w-12 h-12 text-slate-200" />
                    </div>
                    <h3 className="text-slate-900 font-black text-2xl uppercase tracking-tight">Aucun utilisateur trouvé</h3>
                    <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mt-3">Affinez vos filtres ou effectuez une nouvelle recherche</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>

      {/* User Modal - SOFTER THEME */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowModal(false)} />
          <div className="bg-white w-full max-w-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-scaleIn max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  {editingUser ? <Edit className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">{editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h2>
                  <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mt-1">Édition des accès</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto flex-1 no-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prénom <span className="text-rose-500">*</span></label>
                  <input
                    required
                    value={formData.prenom}
                    onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 placeholder-slate-300"
                    placeholder="Prénom"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom <span className="text-rose-500">*</span></label>
                  <input
                    required
                    value={formData.nom}
                    onChange={e => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 placeholder-slate-300"
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Adresse Email <span className="text-rose-500">*</span></label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 placeholder-slate-300"
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rôle plateforme</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold appearance-none cursor-pointer text-slate-900 shadow-sm"
                  >
                    <option value="admin">Administrateur</option>
                    <option value="medecin">Médecin</option>
                    <option value="secretaire">Secrétaire</option>
                    <option value="labo">Laboratoire</option>
                    <option value="patient">Patient</option>
                    <option value="gestionnaire">Gestionnaire</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Téléphone</label>
                  <input
                    value={formData.telephone}
                    onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 placeholder-slate-300"
                    placeholder="+229 ..."
                  />
                </div>
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mot de passe provisoire <span className="text-rose-500">*</span></label>
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 placeholder-slate-300"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 bg-white text-slate-500 border-2 border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 uppercase tracking-widest text-[10px]"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingUser ? 'Mettre à jour' : 'Confirmer la création'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
