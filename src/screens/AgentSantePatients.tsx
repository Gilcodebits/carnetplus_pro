import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { patientsAPI } from "../services/api";
import { useSearch } from "../contexts/SearchContext";
import { Users, Search, Plus, ChevronRight, Activity, UserCircle, Filter, Download, MoreHorizontal, Mail, Phone } from "lucide-react";

const getInitiales = (prenom: string, nom: string) =>
  `${prenom?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase();

const calculateAge = (date_naissance: string) => {
  if (!date_naissance) return "—";
  const birthDate = new Date(date_naissance);
  const difference = Date.now() - birthDate.getTime();
  const age = new Date(difference);
  return Math.abs(age.getUTCFullYear() - 1970);
};

export function AgentSantePatients() {
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    const s = searchQuery.toLowerCase();
    const nom = (p.nom || "").toLowerCase();
    const prenom = (p.prenom || "").toLowerCase();
    const numero = (p.numero_dossier || "").toLowerCase();
    return nom.includes(s) || prenom.includes(s) || numero.includes(s);
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
    <div className="animate-fadeIn bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden flex flex-col">
      <div className="px-4 md:px-10 pb-10 flex-1 flex flex-col pt-6">
        <Card noPadding className="rounded-[2rem] md:rounded-[3rem] border-2 border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white flex-1 flex flex-col">
          <div className="px-6 md:px-8 py-6 border-b-2 border-slate-50 flex flex-col md:flex-row justify-between items-center bg-white gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-slate-50 px-4 md:px-5 py-2 md:py-2.5 rounded-2xl border border-slate-100 shadow-sm">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase tracking-widest">Répertoire Patient</span>
                <span className="bg-blue-600 text-white text-[8px] md:text-[9px] px-2 py-0.5 rounded-lg font-black">{filteredPatients.length}</span>
              </div>
            </div>

            <div className="flex-1 max-w-md w-full">
              <div className="relative group">
                <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-blue-600' : 'text-slate-400'}`} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="RECHERCHER UN PATIENT (NOM, N° DOSSIER...)"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto relative px-4 md:px-8 pb-8">
            {/* Desktop Table View */}
            <table className="hidden lg:table w-full text-left border-separate border-spacing-y-4">
              <thead className="sticky top-0 z-20 shadow-xl">
                <tr className="bg-slate-900 text-white">
                  <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] rounded-l-2xl">Patient</th>
                  <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em]">Identifiant</th>
                  <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em]">Âge / Sexe</th>
                  <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em]">Groupe Sanguin</th>
                  <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em]">Contact</th>
                  <th className="px-8 py-6 text-right text-[11px] font-black uppercase tracking-[0.2em] rounded-r-2xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p, index) => (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/agent-sante/dossier/${p.id}`)}
                      className={`group hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-200/50 transition-all cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}`}
                    >
                      <td className="px-8 py-8 border-y-2 border-l-2 border-slate-200 rounded-l-[2rem]">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm shadow-sm ring-2 ring-white">
                            {getInitiales(p.prenom, p.nom)}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-sm uppercase tracking-tight group-hover:text-blue-700 transition-colors">{p.prenom} {p.nom}</p>
                            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest mt-1 opacity-80">Dernière visite: —</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-8 border-y-2 border-slate-200">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-blue-100">
                          {p.numero_dossier}
                        </span>
                      </td>
                      <td className="px-6 py-8 border-y-2 border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-700">{calculateAge(p.date_naissance)} ans</span>
                          <span className="w-1 h-1 bg-slate-400 rounded-full" />
                          <span className="text-xs font-black text-slate-700 uppercase">{p.sexe || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-8 border-y-2 border-slate-200">
                        {p.groupe_sanguin ? (
                          <div className="flex items-center gap-2 text-emerald-600">
                            <Activity className="w-4 h-4" />
                            <span className="text-xs font-black uppercase">{p.groupe_sanguin}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600 font-bold">Non défini</span>
                        )}
                      </td>
                      <td className="px-6 py-8 border-y-2 border-slate-200">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-900">
                            <Phone className="w-3 h-3 text-blue-600" /> {p.telephone || '—'}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
                            <Mail className="w-3 h-3 text-blue-600" /> {p.email || '—'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right border-y-2 border-r-2 border-slate-200 rounded-r-[2rem]">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-300 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-32 text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                        <UserCircle className="w-10 h-10 text-gray-200" />
                      </div>
                      <h3 className="text-gray-900 font-black text-lg uppercase tracking-tight">Aucun résultat</h3>
                      <p className="text-slate-600 text-sm font-medium italic">Vérifiez vos filtres ou la recherche en haut.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 pt-4">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/agent-sante/dossier/${p.id}`)}
                    className="bg-white border-2 border-slate-100 p-5 rounded-[1.5rem] shadow-sm active:scale-[0.98] transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-blue-600 font-black text-sm">
                        {getInitiales(p.prenom, p.nom)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 text-sm uppercase tracking-tight truncate">{p.prenom} {p.nom}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-widest border border-blue-100">{p.numero_dossier}</span>
                          <span className="text-[10px] font-bold text-slate-600">{calculateAge(p.date_naissance)} ans</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-slate-100">
                    <UserCircle className="w-8 h-8 text-slate-200" />
                  </div>
                  <h3 className="text-slate-900 font-black text-base uppercase tracking-tight">Aucun résultat</h3>
                </div>
              )}
            </div>
          </div>

        </Card>
      </div>
    </div>
  );
}
