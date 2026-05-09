import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { 
  Users, UserPlus, Search, 
  Stethoscope, Clock, 
  FlaskConical, CheckCircle2, XCircle, Trash2, Edit, X, Save, ArrowRight
} from "lucide-react";
import { utilisateursAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const roleIcons: Record<string, any> = {
  medecin: Stethoscope,
  secretaire: Clock,
  labo: FlaskConical,
};

const roleColors: Record<string, string> = {
  medecin: "bg-blue-50 text-blue-600 border-blue-100",
  secretaire: "bg-orange-50 text-orange-600 border-orange-100",
  labo: "bg-teal-50 text-teal-600 border-teal-100",
};

export function GestionnairePersonnel() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Tous");
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    prenom: "", nom: "", email: "", role: "medecin", password: "", telephone: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // We list all users and filter by establishment in the frontend for now, 
      // or the API should handle it if updated.
      const data = await utilisateursAPI.list();
      // Filter by current establishment and exclude patients/admins for this view
      const filteredData = data.filter((u: any) => 
        u.etablissement_id === currentUser?.etablissement_id && 
        ['medecin', 'secretaire', 'labo'].includes(u.role)
      );
      setUsers(filteredData);
    } catch (err) {
      console.error("Erreur chargement équipe:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce membre de l'équipe ?")) return;
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
      const dataToSave = { 
        ...formData, 
        etablissement_id: currentUser?.etablissement_id 
      };
      if (editingUser) {
        await utilisateursAPI.update(editingUser.id, dataToSave);
      } else {
        await utilisateursAPI.create(dataToSave);
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
      `${u.prenom} ${u.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === "Tous" || 
      u.role.toLowerCase() === activeTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  const roles = ["Tous", "Medecin", "Secretaire", "Labo"];

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl px-8 lg:px-12 py-6 border-b-4 border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Gestion de l'Équipe</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Users className="w-3 h-3 text-blue-500"/>
            Administration du personnel de l'établissement
          </p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setFormData({prenom:"", nom:"", email:"", role:"medecin", password:"", telephone:""}); setShowModal(true); }}
          className="flex items-center gap-4 bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95 border-4 border-slate-800"
        >
          <UserPlus className="w-5 h-5" />
          Ajouter un Membre
        </button>
      </div>

      <div className="px-8 lg:px-12 pb-12 space-y-10">
      {/* Grid of Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Médecins", count: users.filter(u=>u.role==='medecin').length, icon: Stethoscope, color: "blue" },
          { label: "Secrétaires", count: users.filter(u=>u.role==='secretaire').length, icon: Clock, color: "orange" },
          { label: "Laborantins", count: users.filter(u=>u.role==='labo').length, icon: FlaskConical, color: "emerald" },
        ].map((stat, i) => (
          <Card key={i} className={`p-8 border-4 border-slate-100 bg-white group hover:border-${stat.color}-500/30 transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-${stat.color}-50 border-4 border-${stat.color}-100 rounded-2xl flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-4xl font-black text-slate-900 tracking-tighter`}>{stat.count}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label} Actifs</p>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border-4 border-slate-100 w-full lg:w-auto">
          {roles.map((role) => (
            <button 
              key={role} 
              onClick={() => setActiveTab(role)}
              className={`flex-1 lg:px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                activeTab === role 
                  ? 'bg-white text-slate-900 shadow-md border-2 border-slate-100 scale-105' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom ou email..." 
            className="w-full pl-12 pr-6 py-4 bg-white border-4 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-blue-500 font-bold text-sm shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-[2.5rem] border-4 border-slate-50 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredUsers.map((u, i) => {
              const Icon = roleIcons[u.role] || Users;
              return (
                <motion.div
                  key={u.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-[3rem] border-4 border-slate-100 p-8 group hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-200/20 transition-all flex flex-col h-full"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 font-black text-xl border-4 border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-500">
                      {u.prenom.charAt(0)}{u.nom.charAt(0)}
                    </div>
                    <div className={`px-4 py-1.5 rounded-full border-2 text-[8px] font-black uppercase tracking-widest ${roleColors[u.role]}`}>
                      {u.role}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{u.prenom} {u.nom}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{u.email}</p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t-2 border-slate-50 mt-auto">
                    <div className="flex gap-2">
                      <button onClick={()=>handleEdit(u)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white border-2 border-transparent hover:border-blue-100 transition-all shadow-sm">
                        <Edit className="w-4 h-4"/>
                      </button>
                      <button onClick={()=>handleDelete(u.id)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-white border-2 border-transparent hover:border-rose-100 transition-all shadow-sm">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${u.actif ? 'bg-emerald-500' : 'bg-slate-300'}`}/>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{u.actif ? 'Actif' : 'Inactif'}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl border-4 border-slate-100 overflow-hidden relative">
            <div className="p-10 border-b-4 border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                  {editingUser ? <Edit className="w-7 h-7"/> : <UserPlus className="w-7 h-7"/>}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{editingUser ? 'Édition Membre' : 'Nouveau Membre'}</h2>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Affectation à l'établissement local</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-2xl transition-all text-slate-300 hover:text-slate-900 border-2 border-transparent hover:border-slate-100">
                <XCircle className="w-6 h-6"/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prénom <span className="text-rose-500">*</span></label>
                  <input required value={formData.prenom} onChange={e=>setFormData({...formData, prenom:e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-4 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-blue-500 focus:bg-white font-bold text-sm transition-all" placeholder="Prénom"/>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom <span className="text-rose-500">*</span></label>
                  <input required value={formData.nom} onChange={e=>setFormData({...formData, nom:e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-4 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-blue-500 focus:bg-white font-bold text-sm transition-all" placeholder="Nom"/>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Adresse Email Professionnelle <span className="text-rose-500">*</span></label>
                <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-4 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-blue-500 focus:bg-white font-bold text-sm transition-all shadow-inner" placeholder="nom.prenom@carnetplus.com"/>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fonction / Rôle</label>
                  <select value={formData.role} onChange={e=>setFormData({...formData, role:e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-4 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-blue-500 focus:bg-white font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer transition-all shadow-sm">
                    <option value="medecin">Médecin</option>
                    <option value="secretaire">Secrétaire</option>
                    <option value="labo">Laboratoire</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Téléphone</label>
                  <input value={formData.telephone} onChange={e=>setFormData({...formData, telephone:e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-4 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-blue-500 focus:bg-white font-bold text-sm transition-all" placeholder="+229 ..."/>
                </div>
              </div>

              {!editingUser && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mot de passe provisoire <span className="text-rose-500">*</span></label>
                  <input required type="password" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-4 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-blue-500 focus:bg-white font-bold text-sm transition-all" placeholder="••••••••"/>
                </div>
              )}

              <div className="pt-8 flex gap-6">
                <button type="submit" disabled={submitting}
                  className="flex-1 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 border-4 border-slate-800 disabled:opacity-50 flex items-center justify-center gap-4">
                  {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save className="w-4 h-4"/> Valider l'inscription</>}
                </button>
                <button type="button" onClick={()=>setShowModal(false)}
                  className="px-10 py-6 bg-white text-slate-400 border-4 border-slate-100 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all">
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
}
