import { useState, useEffect } from "react";
import { 
  Building2, Search, MapPin, Phone, Mail, 
  Plus, MoreVertical, Edit, Trash2, 
  Activity, Users, FlaskConical, Globe
} from "lucide-react";
import { etablissementsAPI } from "../services/api";
import { motion } from "framer-motion";

export default function AdminEtablissements() {
  const [etablissements, setEtablissements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [activeFilter, setActiveFilter] = useState("Tous");

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
    <div className="animate-fadeIn bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl px-8 lg:px-12 py-6 border-b border-slate-200/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Réseau d'Établissements</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-1">
            <Globe className="w-3 h-3 text-blue-500"/>
            Gestion des structures de santé connectées au carnetplus
          </p>
        </div>
      </div>

      <div className="px-8 lg:px-12 pb-12 space-y-10">
      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Structures", value: stats.total, icon: Building2, color: "blue" },
          { label: "Villes Couvertes", value: stats.villes, icon: MapPin, color: "emerald" },
          { label: "Hôpitaux", value: stats.types.hopital || 0, icon: Activity, color: "rose" },
          { label: "Laboratoires", value: stats.types.laboratoire || 0, icon: FlaskConical, color: "amber" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-12 h-12 bg-${s.color}-50 rounded-xl flex items-center justify-center text-${s.color}-600 border-2 border-${s.color}-100`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none mb-1">{s.value}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
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
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full xl:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, ville..." 
            className="w-full pl-14 pr-6 py-4 bg-white border-4 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-blue-500 font-bold text-sm transition-all shadow-sm"
          />
        </div>
      </div>

      {/* List Grouped by Type */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-white rounded-[2rem] border-2 border-slate-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
          <Building2 className="w-16 h-16 text-slate-100 mx-auto mb-6" />
          <h3 className="text-slate-400 font-black text-xl uppercase tracking-widest">Aucun établissement trouvé</h3>
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
            const rawTypes = filtered.map(e => (e.type || "").toLowerCase()).filter(Boolean);
            const allTypes = [...new Set([...orderedTypes, ...rawTypes])];

            return allTypes.map(type => {
              // Case-insensitive filtering for the group
              const typeList = filtered.filter(e => (e.type || "").toLowerCase() === type);
              if (typeList.length === 0) return null;

              return (
                <div key={type} className="space-y-6">
                  <div className="flex items-center gap-4 px-2">
                    <div className="w-2 h-8 bg-blue-600 rounded-full" />
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">
                      {typeLabels[type] || type}
                      <span className="ml-3 text-sm text-slate-400 font-bold">({typeList.length})</span>
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
                          <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
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
                              <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                                <MapPin className="w-3 h-3" />
                                <span className="text-[9px] font-bold uppercase tracking-tight truncate">{e.ville || "Non précisé"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3 text-slate-500">
                              <Mail className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold truncate">{e.email || "Pas d'email"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500">
                              <Phone className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">{e.telephone || "Pas de téléphone"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-300" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <span className="text-blue-600">{e.membres_count || 0}</span> Membres
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all border-2 border-transparent hover:border-blue-100">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all border-2 border-transparent hover:border-rose-100">
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
      </div>
    </div>
  );
}
