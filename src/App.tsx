import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./screens/Login";
import { AdminDashboard } from "./screens/AdminDashboard";
import { MedecinDashboard } from "./screens/MedecinDashboard";
import { SecretaireDashboard } from "./screens/SecretaireDashboard";
import { PatientPortal } from "./screens/PatientPortal";
import { PatientDossier } from "./screens/PatientDossier";
import { Consultation } from "./screens/Consultation";
import { Prescription } from "./screens/Prescription";
import { DemandeExamen } from "./screens/DemandeExamen";
import { Labo } from "./screens/Labo";
import { NouveauPatient } from "./screens/NouveauPatient";
import { RechercheRDV } from "./screens/RechercheRDV";
import { CalendrierRDV } from "./screens/CalendrierRDV";
import { ConfirmationRDV } from "./screens/ConfirmationRDV";
import { AssistantIA } from "./screens/AssistantIA";
import { BilanSante } from "./screens/BilanSante";
import { Messagerie } from "./screens/Messagerie";
import { GestionnaireDashboard } from "./screens/GestionnaireDashboard";

const ROLE_HOME: Record<string,string> = {
  admin:"/admin", medecin:"/medecin", secretaire:"/secretaire",
  labo:"/labo", patient:"/patient", gestionnaire:"/gestionnaire"
};

function AuthRedirect() {
  const { user } = useAuth();
  if (user) return <Navigate to={ROLE_HOME[user.role] || "/"} replace/>;
  return <Login/>;
}

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center animate-fadeIn">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl">
          <svg className="w-8 h-8 text-white animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-blue-600 font-bold">Chargement…</p>
      </div>
    </div>
  );
  return (
    <Routes>
      <Route path="/"                            element={<AuthRedirect/>}/>
      <Route path="/admin"                       element={<AdminDashboard/>}/>
      <Route path="/medecin"                     element={<MedecinDashboard/>}/>
      <Route path="/medecin/nouveau-patient"     element={<NouveauPatient/>}/>
      <Route path="/medecin/dossier/:id"         element={<PatientDossier/>}/>
      <Route path="/medecin/consultation/:id"    element={<Consultation/>}/>
      <Route path="/medecin/prescription/:id"    element={<Prescription/>}/>
      <Route path="/medecin/examen/:id"          element={<DemandeExamen/>}/>
      <Route path="/secretaire"                  element={<SecretaireDashboard/>}/>
      <Route path="/labo"                        element={<Labo/>}/>
      <Route path="/patient"                     element={<PatientPortal/>}/>
      <Route path="/patient/recherche-rdv"       element={<RechercheRDV/>}/>
      <Route path="/patient/calendrier-rdv"      element={<CalendrierRDV/>}/>
      <Route path="/patient/confirmation-rdv"    element={<ConfirmationRDV/>}/>
      <Route path="/patient/assistant-ia"        element={<AssistantIA/>}/>
      <Route path="/patient/bilan-sante"         element={<BilanSante/>}/>
      <Route path="/messagerie"                  element={<Messagerie/>}/>
      <Route path="/gestionnaire"                element={<GestionnaireDashboard/>}/>
      <Route path="*"                            element={<Navigate to="/" replace/>}/>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes/>
      </BrowserRouter>
    </AuthProvider>
  );
}
