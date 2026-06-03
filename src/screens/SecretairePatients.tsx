import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { patientsAPI } from "../services/api";
import { useSearch } from "../contexts/SearchContext";
import { Users, Search, Plus, ChevronRight, Activity, UserCircle, Filter, MoreHorizontal, Mail, Phone, Edit, Trash2, Printer, MapPin, Calendar } from "lucide-react";
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

  return (
    <div className="animate-fadeIn h-full flex flex-col bg-slate-50 w-full max-w-full overflow-x-hidden min-h-screen">
      <div className="px-4 md:px-10 pb-10 flex-1 flex flex-col pt-6">
        <Card noPadding className="rounded-[2rem] md:rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white flex-1 flex flex-col">
          {/* Table Controls */}
          <div className="px-4 md:px-8 py-4 md:py-6 border-b-2 border-slate-50 flex flex-col md:flex-row justify-between items-stretch md:items-center bg-white gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-[9px] md:text-[11px] font-black text-slate-900 uppercase tracking-widest">Total</span>
                <span className="bg-blue-600 text-white text-[8px] px-2 py-0.5 rounded-lg font-black">{filteredPatients.length}</span>
              </div>
              <button
                onClick={() => navigate("/secretaire/nouveau-patient")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-200 transition-all font-black text-[10px] md:text-[11px] uppercase tracking-widest"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Créer un dossier patient</span>
                <span className="sm:hidden">Nouveau</span>
              </button>
            </div>
            <div className="flex items-center gap-3 md:gap-6 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Rechercher (Nom, N° Dossier)..."
                  className="w-full pl-10 md:pl-12 pr-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl focus:border-blue-600 focus:bg-white outline-none text-[10px] md:text-[11px] font-bold transition-all shadow-inner"
                />
              </div>
              <button className="p-3 bg-slate-900 text-white rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Patients Table / List */}
          <div className="flex-1 overflow-auto relative px-4 md:px-8 pb-4 md:pb-8 scrollbar-hide">
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-black uppercase tracking-widest text-[9px]">Chargement des patients...</p>
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden lg:block">
                  <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead className="sticky top-0 z-20">
                      <tr className="bg-slate-900 text-white shadow-xl">
                        <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] rounded-l-2xl">Identité Patient</th>
                        <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em]">N° Dossier</th>
                        <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em]">Âge / Sexe</th>
                        <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em]">Contact</th>
                        <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em]">Dernière visite</th>
                        <th className="px-8 py-6 text-right text-[11px] font-black uppercase tracking-[0.2em] rounded-r-2xl">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((p, index) => (
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
                                <p className="text-[10px] text-slate-800 font-black opacity-90 uppercase tracking-widest mt-1">Né(e) le {formatDate(p.date_naissance)}</p>
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
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{p.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6 border-y-2 border-slate-100">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2 text-slate-600">
                                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[11px] font-bold">{p.telephone || "—"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[120px]">{p.adresse || "—"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 border-y-2 border-slate-100">
                            <p className="text-[11px] font-black text-slate-900 uppercase">12 Mai 2024</p>
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Dr. Martin</p>
                          </td>
                          <td className="px-8 py-6 border-y-2 border-r-2 border-slate-100 rounded-r-[2.5rem] text-right">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/secretaire?patientId=${p.id}`); }}
                                className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                                title="Planifier RDV"
                              >
                                <Calendar className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/secretaire/modifier-patient/${p.id}`); }}
                                className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100">
                                <Printer className="w-4 h-4" />
                              </button>
                              <button className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-lg">
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4 pt-4">
                  {filteredPatients.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/secretaire/patients/${p.id}`)}
                      className="p-5 bg-white rounded-2xl border-2 border-slate-100 active:scale-[0.98] transition-all shadow-sm flex flex-col gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg border-2 border-white">
                          {getInitiales(p.prenom, p.nom)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">{p.prenom} {p.nom}</h4>
                          <p className="text-[8px] text-blue-600 font-black uppercase tracking-widest mt-0.5">{p.numero_dossier}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50">
                        <div className="flex flex-col">
                          <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Contact</span>
                          <span className="text-[9px] font-bold text-slate-900">{p.telephone || "—"}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Âge / Sexe</span>
                          <span className="text-[9px] font-bold text-slate-900">{calculateAge(p.date_naissance)} Ans · {p.sexe}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {filteredPatients.length === 0 && !loading && (
              <div className="py-24 text-center">
                <Users className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">Aucun patient trouvé</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

