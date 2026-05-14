import { useState, useEffect } from "react";
import {
  Building2, Search, MapPin, Phone, Mail,
  Plus, MoreVertical, Edit, Trash2,
  Activity, Users, FlaskConical, Globe,
  X, Save, AlertTriangle, ShieldCheck
} from "lucide-react";
import { etablissementsAPI } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmModal } from "../components/ConfirmModal";

export default function AdminEtablissements() {
  const [etablissements, setEtablissements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [showModal, setShowModal] = useState(false);
  const [editingEtab, setEditingEtab] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nom: "", adresse: "", ville: "", telephone: "", email: "", type: "hopital"
  });

  useEffect(() => {
    loadEtablissements();
  }, []);

  const loadEtablissements = async () => {
    setLoading(true);
    try {
      const data = await etablissementsAPI.list();
      setEtablissements(data);
    } catch (err) {
      console.error("Erreur chargement établissements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (etab: any) => {
    setEditingEtab(etab);
    setFormData({
      nom: etab.nom,
      adresse: etab.adresse,
      ville: etab.ville,
      telephone: etab.telephone,
      email: etab.email,
      type: etab.type || "hopital"
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await etablissementsAPI.delete(deletingId);
      loadEtablissements();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingEtab) {
        await etablissementsAPI.update(editingEtab.id, formData);
      } else {
        await etablissementsAPI.create(formData);
      }
      setShowModal(false);
      loadEtablissements();
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = etablissements.filter(e => {
    const matchesSearch = e.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.ville?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === "Tous") return matchesSearch;

    const typeMap: Record<string, string> = {
      "Hôpitaux": "hopital",
      "Cliniques": "clinique",
      "Laboratoires": "laboratoire",
      "Pharmacies": "pharmacie",
      "Cabinets": "cabinet",
    };

    // Case-insensitive comparison
    return matchesSearch && (e.type || "").toLowerCase() === (typeMap[activeFilter] || activeFilter).toLowerCase();
  });

  const stats = {
    total: etablissements.length,
    villes: new Set(etablissements.map(e => e.ville)).size,
    types: {
      hopital: etablissements.filter(e => (e.type || "").toLowerCase() === 'hopital').length,
      clinique: etablissements.filter(e => (e.type || "").toLowerCase() === 'clinique').length,
      laboratoire: etablissements.filter(e => (e.type || "").toLowerCase() === 'laboratoire').length,
    }
  };

  return (
    <div className="animate-fadeIn bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden flex flex-col">
      <div className="px-6 md:px-10 pb-12 pt-6 space-y-10">
        {/* Stats Quick View */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Total Structures", value: stats.total, icon: Building2, color: "blue" },
            { label: "Villes Couvertes", value: stats.villes, icon: MapPin, color: "emerald" },
            { label: "Hôpitaux", value: stats.types.hopital || 0, icon: Activity, color: "rose" },
            { label: "Laboratoires", value: stats.types.laboratoire || 0, icon: FlaskConical, color: "amber" },
          ].map((s, i) => (
            <div key={i} className="bg-white p-3 md:p-6 rounded-[1.2rem] md:rounded-[2rem] border-2 border-slate-100 shadow-sm flex items-center gap-3 md:gap-5">
              <div className={`w-12 h-12 bg-${s.color}-50 rounded-xl flex items-center justify-center text-${s.color}-600 border-2 border-${s.color}-100`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none mb-1">{s.value}</p>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col xl:flex-row justify-between items-center gap-8">
          <div className="flex bg-white/80 backdrop-blur-md p-2 rounded-[1.5rem] border-2 border-slate-100 shadow-sm w-full xl:w-auto overflow-x-auto no-scrollbar">
            {["Tous", "Hôpitaux", "Cliniques", "Laboratoires"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full xl:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, ville..."
              className="w-full pl-14 pr-6 py-4 bg-white border-4 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-blue-500 font-bold text-sm transition-all shadow-sm placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* List Grouped by Type */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-white rounded-[2rem] border-2 border-slate-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
            <Building2 className="w-16 h-16 text-slate-100 mx-auto mb-6" />
            <h3 className="text-slate-600 font-black text-xl uppercase tracking-widest">Aucun établissement trouvé</h3>
          </div>
        ) : (
          <div className="space-y-12">
            {(() => {
              const typeLabels: Record<string, string> = {
                hopital: "Hôpitaux",
                clinique: "Cliniques",
                laboratoire: "Laboratoires",
                pharmacie: "Pharmacies",
                cabinet: "Cabinets Médicaux",
              };
              // Collect all types present in data (in preferred order + any extras)
              // Normalize to lowercase for consistent grouping
              const orderedTypes = ["hopital", "clinique", "laboratoire", "pharmacie", "cabinet"];
              const rawTypes = filtered.map(e => (e.type || "autre").toLowerCase());
              const allTypes = [...new Set([...orderedTypes, ...rawTypes])];

              return allTypes.map(type => {
                // Case-insensitive filtering for the group
                const typeList = filtered.filter(e => {
                  const eType = (e.type || "autre").toLowerCase();
                  return eType === type;
                });
                if (typeList.length === 0) return null;

                return (
                  <div key={type} className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                      <div className="w-2 h-8 bg-blue-600 rounded-full" />
                      <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">
                        {typeLabels[type] || type}
                        <span className="ml-3 text-sm text-slate-600 font-bold">({typeList.length})</span>
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {typeList.map((e, i) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={e.id} 
                        className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 hover:border-blue-200 transition-all group relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-slate-200/50"
                      >
                        <div className="absolute top-0 right-0 p-4">
                          <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                              <Building2 className="w-8 h-8" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors">{e.nom}</h3>
                                <MapPin className="w-3 h-3" />
                                <span className="text-[9px] font-bold uppercase tracking-tight truncate">{e.ville || "Non précisé"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3 text-slate-700">
                              <Mail className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold truncate">{e.email || "Pas d'email"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-700">
                              <Phone className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">{e.telephone || "Pas de téléphone"}</span>
                            </div>
                          </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-600" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                              <span className="text-blue-600">{e.membres_count || 0}</span> Membres
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit(e)}
                              className="p-2.5 bg-slate-50 text-slate-600 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all border-2 border-transparent hover:border-blue-100"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(e.id)}
                              className="p-2.5 bg-slate-50 text-slate-600 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all border-2 border-transparent hover:border-rose-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
        );
            });
          })()}
      </div>
      )}
 
      {/* Modal Ajout/Modification */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-t-[2.5rem] sm:rounded-[3.5rem] shadow-2xl w-full max-w-2xl border border-white/20 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                    <Building2 className="w-7 h-7"/>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                      {editingEtab ? 'Modifier Structure' : 'Nouvelle Structure'}
                    </h2>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1 opacity-90">Configuration du partenaire santé</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm">
                  <X className="w-6 h-6"/>
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 md:p-10 space-y-6 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1 opacity-90">Nom de la structure</label>
                    <input 
                      required
                      type="text"
                      value={formData.nom}
                      onChange={e => setFormData({...formData, nom: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
                      placeholder="Ex: Hôpital Central"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1 opacity-90">Type d'établissement</label>
                    <select 
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-900 appearance-none"
                    >
                      <option value="hopital">Hôpital</option>
                      <option value="clinique">Clinique</option>
                      <option value="laboratoire">Laboratoire</option>
                      <option value="pharmacie">Pharmacie</option>
                      <option value="cabinet">Cabinet Médical</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1 opacity-90">Adresse complète</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                    <input 
                      required
                      type="text"
                      value={formData.adresse}
                      onChange={e => setFormData({...formData, adresse: e.target.value})}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
                      placeholder="Numéro, rue, quartier..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1 opacity-90">Ville</label>
                    <input 
                      required
                      type="text"
                      value={formData.ville}
                      onChange={e => setFormData({...formData, ville: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
                      placeholder="Ex: Cotonou"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1 opacity-90">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                      <input 
                        type="tel"
                        value={formData.telephone}
                        onChange={e => setFormData({...formData, telephone: e.target.value})}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
                        placeholder="+229 ..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1 opacity-90">Email de contact</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
                      placeholder="contact@etablissement.com"
                    />
                  </div>
                </div>

                <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="w-full py-3.5 md:py-4 bg-white text-slate-500 border-2 border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full py-3.5 md:py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? 'Enregistrement...' : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingEtab ? 'Mettre à jour' : 'Confirmer la création'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Supprimer la structure ?"
        message="Cette action est irréversible. Toutes les données associées à cet établissement seront définitivement supprimées du réseau CarnetPlus."
        confirmText="Supprimer définitivement"
        type="danger"
      />
    </div>
    </div>
  );
}

