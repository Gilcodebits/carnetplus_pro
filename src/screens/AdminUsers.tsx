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
    <div className="p-8 animate-fadeIn bg-slate-200 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Gérez les comptes, les accès et les permissions de la plateforme.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setFormData({prenom:"", nom:"", email:"", role:"patient", password:"", telephone:""}); setShowModal(true); }}
          className="flex items-center gap-4 bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:shadow-blue-300 transition-all active:scale-95 shadow-xl shadow-blue-200/50 border-2 border-blue-500"
        >
          <UserPlus className="w-5 h-5" />
          <span>NOUVEL UTILISATEUR</span>
        </button>
      </div>

      {/* Stats Cards - REDUCED OPACITY / SOFTER COLORS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border-2 border-slate-200 flex flex-col justify-between group hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <span className="text-[9px] font-black text-blue-600 bg-white border border-blue-100 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em] shadow-sm">Global</span>
          </div>
          <div>
            <h3 className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">{users.length}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateurs inscrits</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border-2 border-slate-200 flex flex-col justify-between group hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <span className="text-[9px] font-black text-emerald-600 bg-white border border-emerald-100 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em] shadow-sm">Actifs</span>
          </div>
          <div>
            <h3 className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">{users.filter(u => u.actif !== 0).length}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comptes en ligne</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border-2 border-slate-200 flex flex-col justify-between group hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-purple-50 border-2 border-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Shield className="w-7 h-7 text-purple-600" />
            </div>
            <span className="text-[9px] font-black text-purple-600 bg-white border border-purple-100 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em] shadow-sm">Admins</span>
          </div>
          <div>
            <h3 className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">{users.filter(u => u.role === 'admin').length}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Droits de gestion</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border-2 border-slate-200 flex flex-col justify-between group hover:border-orange-400 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-orange-50 border-2 border-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Clock className="w-7 h-7 text-orange-500" />
            </div>
            <span className="text-[9px] font-black text-orange-600 bg-white border border-orange-100 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em] shadow-sm">Activité</span>
          </div>
          <div>
            <h3 className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">5m</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dernière mise à jour</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-white p-6 rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50">
          <div className="flex flex-wrap gap-3">
            {roles.map((role) => (
              <button 
                key={role} 
                onClick={() => setActiveTab(role)}
                className={`px-10 py-4 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest border-2 shadow-sm ${
                  activeTab === role 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-200 scale-105' 
                    : 'text-slate-500 bg-slate-50 border-slate-100 hover:border-blue-200 hover:text-blue-600'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-[35rem] group">
            <Search className={`absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors z-10 ${searchQuery ? 'text-blue-600' : 'text-slate-400'}`} />
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
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronisation sécurisée des données...</p>
            </div>
          ) : (
            <>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u, i) => {
                  const Icon = roleIcons[u.role] || UserCircle;
                  return (
                    <div key={u.id} className={`p-8 rounded-[3rem] border-2 transition-all flex flex-col lg:flex-row items-center justify-between group hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-200/50 animate-fadeInUp gap-10 ${i % 2 === 0 ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/30"}`}>
                      <div className="flex items-center gap-10 w-full lg:w-auto">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-[2rem] bg-white border-2 border-slate-100 flex items-center justify-center text-blue-600 font-black text-3xl shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 uppercase">
                            {u.prenom.charAt(0)}{u.nom.charAt(0)}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-8 h-8 border-4 border-white rounded-full shadow-lg ${u.actif !== 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-3xl uppercase tracking-tighter mb-2 group-hover:text-blue-600 transition-colors leading-none">{u.prenom} {u.nom}</p>
                          <div className="flex flex-wrap items-center gap-4">
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{u.email}</p>
                             <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{u.telephone || "SANS CONTACT"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap lg:flex-nowrap items-center gap-10 w-full lg:w-auto justify-between lg:justify-end">
                        <div className="text-center lg:text-left bg-white p-4 rounded-[1.5rem] border-2 border-slate-100 shadow-sm min-w-[140px]">
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Privilège</p>
                          <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest ${roleColors[u.role] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                            <Icon className="w-4 h-4" />
                            {u.role}
                          </div>
                        </div>

                        <div className="hidden xl:block min-w-[180px] bg-white p-4 rounded-[1.5rem] border-2 border-slate-100 shadow-sm">
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Affectation</p>
                          <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">{u.etablissement_nom || "Hôpital Central"}</p>
                          <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mt-1 opacity-80">Unité Active</p>
                        </div>

                        <div className="flex gap-4">
                          <button 
                            onClick={() => handleEdit(u)}
                            className="w-16 h-16 text-slate-400 hover:text-blue-600 bg-white rounded-[1.5rem] transition-all border-2 border-slate-100 hover:border-blue-400 shadow-sm flex items-center justify-center active:scale-95"
                          >
                            <Edit className="w-7 h-7" />
                          </button>
                          <button 
                            onClick={() => handleDelete(u.id)}
                            className="w-16 h-16 text-slate-400 hover:text-rose-600 bg-white rounded-[1.5rem] transition-all border-2 border-slate-100 hover:border-rose-400 shadow-sm flex items-center justify-center active:scale-95"
                          >
                            <Trash2 className="w-7 h-7" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-24 text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border-2 border-slate-100">
                    <Search className="w-12 h-12 text-slate-200" />
                  </div>
                  <h3 className="text-slate-900 font-black text-2xl uppercase tracking-tight">Aucun utilisateur trouvé</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-3">Affinez vos filtres ou effectuez une nouvelle recherche</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User Modal - SOFTER THEME */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowModal(false)} />
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-scaleIn">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  {editingUser ? <Edit className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">{editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h2>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Édition des accès</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prénom <span className="text-rose-500">*</span></label>
                  <input 
                    required 
                    value={formData.prenom}
                    onChange={e => setFormData({...formData, prenom: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 placeholder-slate-300"
                    placeholder="Prénom"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom <span className="text-rose-500">*</span></label>
                  <input 
                    required 
                    value={formData.nom}
                    onChange={e => setFormData({...formData, nom: e.target.value})}
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
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 placeholder-slate-300"
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rôle plateforme</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
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
                    onChange={e => setFormData({...formData, telephone: e.target.value})}
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
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 placeholder-slate-300"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div className="pt-8 flex gap-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-5 bg-white text-slate-500 border-2 border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-[2] py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 uppercase tracking-widest text-[10px]"
                >
                  {submitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingUser ? 'Mettre à jour' : 'Finaliser la création'}
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
