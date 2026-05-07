import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SearchProvider } from "../contexts/SearchContext";

export function AdminLayout() {
  const location = useLocation();
  
  return (
    <SearchProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar role="admin" activePath={location.pathname} />
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
