import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Login } from "./screens/Login";
import { AdminLayout } from "./components/AdminLayout";
import { MedecinLayout } from "./components/MedecinLayout";
import { SecretaireLayout } from "./components/SecretaireLayout";
import { LaboLayout } from "./components/LaboLayout";
import { AdminDashboard } from "./screens/AdminDashboard";
import { AdminUsers } from "./screens/AdminUsers";
import { AdminReports } from "./screens/AdminReports";
import { AdminSettings } from "./screens/AdminSettings";
import { Notifications } from "./screens/Notifications";
import { MedecinDashboard } from "./screens/MedecinDashboard";
import { MedecinPatients } from "./screens/MedecinPatients";
import { MedecinAgenda } from "./screens/MedecinAgenda";
import { SecretaireDashboard } from "./screens/SecretaireDashboard";
import { PatientPortal } from "./screens/PatientPortal";
import { PatientDossier } from "./screens/PatientDossier";
import { Consultation } from "./screens/Consultation";
import { Prescription } from "./screens/Prescription";
import { DemandeExamen } from "./screens/DemandeExamen";
import { Labo } from "./screens/Labo";
import { LaboAnalyses } from "./screens/LaboAnalyses";
import { NouveauPatient } from "./screens/NouveauPatient";
import { RechercheRDV } from "./screens/RechercheRDV";
import { CalendrierRDV } from "./screens/CalendrierRDV";
import { ConfirmationRDV } from "./screens/ConfirmationRDV";
import { AssistantIA } from "./screens/AssistantIA";
import { BilanSante } from "./screens/BilanSante";
import { Messagerie } from "./screens/Messagerie";
import { GestionnaireDashboard } from "./screens/GestionnaireDashboard";
import { PageTransition } from "./components/PageTransition";
import { AnimatePresence } from "framer-motion";
import { PrescriptionView } from "./screens/PrescriptionView";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin", medecin: "/medecin", secretaire: "/secretaire",
  labo: "/labo", patient: "/patient", gestionnaire: "/gestionnaire"
};

function AuthRedirect() {
  const { user } = useAuth();
  if (user) return <Navigate to={ROLE_HOME[user.role] || "/"} replace />;
  return <Login />;
}

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const { user, loading } = useAuth();
  if (loading) return null; // Let the main AppRoutes handle global loading
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role.toLowerCase() !== role.toLowerCase()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center animate-fadeIn">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl">
          <svg className="w-8 h-8 text-white animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-blue-600 font-bold">Chargement…</p>
      </div>
    </div>
  );
  return (
    <Routes>
      <Route path="/" element={<AuthRedirect />} />

      {/* Admin Protected Routes with Layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="messagerie" element={<Messagerie />} />
      </Route>

        <Route path="/medecin" element={<ProtectedRoute role="medecin"><MedecinLayout /></ProtectedRoute>}>
          <Route index element={<MedecinDashboard />} />
          <Route path="patients" element={<MedecinPatients />} />
          <Route path="agenda" element={<MedecinAgenda />} />
          <Route path="nouveau-patient" element={<NouveauPatient />} />
          <Route path="dossier/:id" element={<PatientDossier />} />
          <Route path="consultation/:id" element={<Consultation />} />
          <Route path="prescription/:id" element={<Prescription />} />
          <Route path="examen/:id" element={<DemandeExamen />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="messagerie" element={<Messagerie />} />
        </Route>
        <Route path="/secretaire" element={<ProtectedRoute role="secretaire"><SecretaireLayout /></ProtectedRoute>}>
          <Route index element={<SecretaireDashboard tab="rdv"/>} />
          <Route path="rdv" element={<SecretaireDashboard tab="rdv"/>} />
          <Route path="patients" element={<SecretaireDashboard tab="patients"/>} />
          <Route path="patients/:id" element={<PatientDossier/>} />
          <Route path="modifier-patient/:id" element={<NouveauPatient/>} />
          <Route path="nouveau-patient" element={<NouveauPatient/>} />
          <Route path="notifications" element={<Notifications/>} />
          <Route path="messagerie" element={<Messagerie/>} />
        </Route>
        <Route path="/labo" element={<ProtectedRoute role="labo"><LaboLayout /></ProtectedRoute>}>
          <Route index element={<Labo />} />
          <Route path="analyses" element={<LaboAnalyses />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="messagerie" element={<Messagerie />} />
        </Route>
      <Route path="/patient" element={<PatientPortal />} />
      <Route path="/patient/recherche-rdv" element={<RechercheRDV />} />
      <Route path="/patient/calendrier-rdv" element={<CalendrierRDV />} />
      <Route path="/patient/confirmation-rdv" element={<ConfirmationRDV />} />
      <Route path="/patient/assistant-ia" element={<AssistantIA />} />
      <Route path="/patient/bilan-sante" element={<BilanSante />} />
      <Route path="/gestionnaire" element={<GestionnaireDashboard />} />
      <Route path="/prescription-view/:id" element={<PrescriptionView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
