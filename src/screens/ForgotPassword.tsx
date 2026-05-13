import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff, Activity, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { forgotPasswordAPI } from "../services/api";

type Step = 'email' | 'sent' | 'reset' | 'done';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [step, setStep] = useState<Step>(token ? 'reset' : 'email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Vérifier la validité du token à l'arrivée
  useEffect(() => {
    if (token) {
      setLoading(true);
      forgotPasswordAPI.verify(token)
        .then(data => {
          if (data.valid) { setTokenValid(true); setStep('reset'); }
          else { setTokenValid(false); setError(data.error || 'Lien invalide ou expiré'); setStep('email'); }
        })
        .catch((err: any) => { setTokenValid(false); setError(err.message || 'Lien invalide ou expiré'); setStep('email'); })
        .finally(() => setLoading(false));
    }
  }, [token]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Veuillez saisir votre email');
    setError(''); setLoading(true);
    try {
      await forgotPasswordAPI.request(email);
      setStep('sent');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return setError('Veuillez remplir tous les champs');
    if (password.length < 6) return setError('Le mot de passe doit contenir au moins 6 caractères');
    if (password !== confirmPassword) return setError('Les mots de passe ne correspondent pas');
    setError(''); setLoading(true);
    try {
      await forgotPasswordAPI.reset(token || '', password);
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Soft background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 md:p-10">
              {/* Logo */}
              <div className="flex items-center gap-2.5 md:gap-3 mb-8 md:mb-10">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Activity className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <span className="text-slate-900 font-black text-base md:text-lg uppercase tracking-widest">CarnetPlus</span>
              </div>

              {/* ── STEP: EMAIL ── */}
              {step === 'email' && (
                <>
                  <div className="mb-6 md:mb-8">
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight mb-2 leading-tight">Mot de passe<br /><span className="text-blue-600">oublié ?</span></h1>
                    <p className="text-slate-500 text-[13px] md:text-sm font-medium leading-relaxed">Saisissez votre adresse email pour recevoir un lien de réinitialisation.</p>
                  </div>

                  <form onSubmit={handleRequestReset} className="space-y-4 md:space-y-6">
                    <div className="space-y-1.5 md:space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Adresse Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="votre@email.com"
                          autoFocus
                          className="w-full pl-12 pr-5 py-3.5 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl text-slate-900 placeholder:text-slate-600 font-bold outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-sm md:text-base"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl md:rounded-2xl">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <p className="text-rose-600 text-[10px] md:text-xs font-black uppercase tracking-tight">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 md:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Envoyer le lien</span> <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </form>
                </>
              )}

              {/* ── STEP: SENT ── */}
              {step === 'sent' && (
                <div className="text-center py-2 md:py-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border border-emerald-100 shadow-inner">
                    <Mail className="w-8 h-8 md:w-9 md:h-9" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">Email <span className="text-emerald-500">envoyé !</span></h2>
                  <p className="text-slate-500 text-[13px] md:text-sm font-medium leading-relaxed mb-6 md:mb-8">
                    Si l'adresse <span className="text-slate-900 font-black">{email}</span> est enregistrée, vous allez recevoir un email avec un lien.
                  </p>
                  <p className="text-slate-600 text-[9px] md:text-[11px] mb-6 md:mb-8 italic font-bold uppercase tracking-wider">⏱️ Validité : 15 minutes</p>
                  <button
                    onClick={() => { setStep('email'); setEmail(''); }}
                    className="text-blue-600 hover:text-blue-700 font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto"
                  >
                    <ChevronLeft className="w-4 h-4" /> Nouvelle tentative
                  </button>
                </div>
              )}

              {/* ── STEP: RESET ── */}
              {step === 'reset' && tokenValid && (
                <>
                  <div className="mb-6 md:mb-8">
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight mb-2 leading-tight">Nouveau<br /><span className="text-blue-600">mot de passe</span></h1>
                    <p className="text-slate-500 text-[13px] md:text-sm font-medium leading-relaxed">Choisissez un mot de passe fort d'au moins 6 caractères.</p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4 md:space-y-6">
                    <div className="space-y-1.5 md:space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoFocus
                          className="w-full pl-12 pr-12 py-3.5 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl text-slate-900 placeholder:text-slate-600 font-bold outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-sm md:text-base"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-blue-600">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Confirmer le mot de passe</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-12 py-3.5 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl text-slate-900 placeholder:text-slate-600 font-bold outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-sm md:text-base"
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-blue-600">
                          {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl md:rounded-2xl">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <p className="text-rose-600 text-[10px] md:text-xs font-black uppercase tracking-tight">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 md:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Réinitialiser</span> <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </form>
                </>
              )}

              {/* ── STEP: DONE ── */}
              {step === 'done' && (
                <div className="text-center py-2 md:py-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border border-emerald-100 shadow-inner">
                    <CheckCircle className="w-8 h-8 md:w-9 md:h-9" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">C'est <span className="text-emerald-500">prêt !</span></h2>
                  <p className="text-slate-500 text-[13px] md:text-sm font-medium leading-relaxed mb-6 md:mb-8">Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-4 md:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <span>Se connecter</span> <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Back link */}
              {(step === 'email' || step === 'reset') && (
                <div className="mt-6 md:mt-8 text-center pt-5 md:pt-6 border-t border-slate-50">
                  <Link to="/login" className="text-slate-600 hover:text-blue-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 justify-center">
                    <ChevronLeft className="w-4 h-4" /> Retour à la connexion
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

