import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SearchProvider } from "../contexts/SearchContext";

export function SecretaireLayout() {
  const location = useLocation();

  return (
    <SearchProvider>
      <div className="flex h-screen bg-slate-200 overflow-hidden">
        <Sidebar role="secretaire" activePath={location.pathname} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}