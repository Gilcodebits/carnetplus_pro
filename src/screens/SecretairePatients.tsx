import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { patientsAPI } from "../services/api";
import { useSearch } from "../contexts/SearchContext";
import { Users, Search, Plus, ChevronRight, Activity, UserCircle, Filter, MoreHorizontal, Mail, Phone, Edit, Trash2, Printer, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "../utils/format";

const getInitiales = (prenom: string, nom: string) => 
  `${prenom?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase();

const calculateAge = (date_naissance: string) => {
  if (!date_naissance) return "—";
  const birthDate = new Date(date_naissance);
  const difference = Date.now() - birthDate.getTime();
  const age = new Date(difference);
  return Math.abs(age.getUTCFullYear() - 1970);
};

export function SecretairePatients() {
  const { searchQuery } = useSearch();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await patientsAPI.list();
      setPatients(data);
    } catch (err) {
      console.error("Erreur chargement patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const s = (localSearch || searchQuery || "").toLowerCase();
    return (p.nom || "").toLowerCase().includes(s) ||
           (p.prenom || "").toLowerCase().includes(s) ||
           (p.numero_dossier || "").toLowerCase().includes(s);
  });

  if (loading) {
    return (
      <div className="p-8 text-center py-40 bg-slate-200 min-h-screen flex items-center justify-center">
        <div className="bg-white p-16 rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-8" />
          <p className="text-slate-900 font-black uppercase tracking-widest text-xs">Chargement de la patientèle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 animate-fadeIn h-full flex flex-col bg-slate-200">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-slate-200/90 backdrop-blur-xl -mx-10 -mt-10 px-10 pb-4 pt-6 border-b border-slate-300/50 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Répertoire Patient</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-80">Liste complète des patients inscrits dans l'établissement.</p>
          </div>
          <button
            onClick={() => navigate("/secretaire/nouveau-patient")}
            className="px-8 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center gap-3 active:scale-95 border-2 border-emerald-500/50"
          >
            <Plus className="w-4 h-4" /> Nouveau Patient
          </button>
        </div>
      </div>

      <Card noPadding className="rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white flex-1 flex flex-col">
        {/* Table Controls */}
        <div className="px-8 py-6 border-b-2 border-slate-50 flex justify-between items-center bg-white">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Total Patients</span>
                <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-lg font-black">{filteredPatients.length}</span>
             </div>
          </div>
          <div className="flex items-center gap-6 flex-1 max-w-xl">
             <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Rechercher un patient (Nom, Prénom, N° Dossier)..."
                  className="w-full pl-12 pr-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none text-[11px] font-bold transition-all shadow-inner"
                />
             </div>
             <button className="p-3 bg-slate-900 text-white rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95">
                <Filter className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Patients Table */}
        <div className="flex-1 overflow-auto relative px-8 pb-8 scrollbar-hide">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest rounded-l-2xl">Identité Patient</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">N° Dossier</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Âge / Sexe</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Dernière visite</th>
                <th className="px-8 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest rounded-r-2xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p, index) => (
                  <tr 
                    key={p.id}
                    onClick={() => navigate(`/secretaire/patients/${p.id}`)}
                    className="group hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-200/50 transition-all cursor-pointer bg-white"
                  >
                    <td className="px-8 py-6 border-y-2 border-l-2 border-slate-100 rounded-l-[2.5rem]">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                          {getInitiales(p.prenom, p.nom)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                            {p.prenom} {p.nom}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Né(e) le {formatDate(p.date_naissance)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 border-y-2 border-slate-100">
                      <span className="px-4 py-1.5 bg-slate-50 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200">
                        {p.numero_dossier}
                      </span>
                    </td>
                    <td className="px-6 py-6 border-y-2 border-slate-100">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-black text-slate-900 uppercase">{calculateAge(p.date_naissance)} Ans</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 border-y-2 border-slate-100">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[11px] font-bold">{p.telephone || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[120px]">{p.adresse || "—"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 border-y-2 border-slate-100">
                       <p className="text-[11px] font-black text-slate-900 uppercase">12 Mai 2024</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dr. Martin</p>
                    </td>
                    <td className="px-8 py-6 border-y-2 border-r-2 border-slate-100 rounded-r-[2.5rem] text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/secretaire/modifier-patient/${p.id}`); }}
                          className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button 
                          className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-lg"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                     <Users className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                     <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Aucun patient trouvé</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
