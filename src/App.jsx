"use client";

import { useState, useEffect } from "react";
import {
  Archive,
  LayoutDashboard,
  Menu,
  UserCircle,
  Database,
  ChevronRight,
  BarChart3,
  LogOutIcon,
} from "lucide-react";
import RawMaterialPage from "./pages/RawMaterialPage";
import RawMaterialsPage from "./pages/RawMaterialsPage";
import FinishedGoodPage from "./pages/FinishedGoodPage";
import FinishedGoodsPage from "./pages/FinishedGoodsPage";
import CombinedDashboardPage from "./pages/CombinedDashboardPage";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "./store/authStore";

function App() {
  const [currentPage, setCurrentPage] = useState("combined-dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        sidebarOpen &&
        !event.target.closest(".sidebar-container")
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  const navigationItems = [
    {
      id: "combined-dashboard",
      label: "Dashboard Overview",
      icon: BarChart3,
      section: "dashboard",
      description: "Combined Analytics View",
    },
    {
      id: "raw-materials-table",
      label: "Raw Material Data",
      icon: Database,
      section: "raw-materials",
      description: "Detailed Table View",
    },
    {
      id: "finished-goods-table",
      label: "Finished Good Data",
      icon: Archive,
      section: "finished-goods",
      description: "Detailed Table View",
    },
  ];

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems.find((item) => item.id === currentPage);
    if (currentItem?.section === "dashboard") {
      return "Dashboard Overview";
    }
    if (currentItem?.section === "raw-materials") {
      return "Raw Materials Management";
    }
    return "Finished Goods Management";
  };

  const getCurrentPageSubtitle = () => {
    const currentItem = navigationItems.find((item) => item.id === currentPage);
    return currentItem?.description || "";
  };

  const handlePageChange = (pageId) => {
    // setCurrentPage(pageId) // Remove this
    navigate(`/${pageId}`); // Add this
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // const location = useLocation();
  const { user, logout } = useAuthStore();
  // const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filter navigation items based on user's allowed pages
  const allowedPages = user?.page
    ? user.page.split(",").map((p) => p.trim())
    : [];

  const filteredNavigationItems = navigationItems.filter((item) => {
    const pageMapping = {
      "Dashboard Overview": "combined-dashboard",
      "Raw Material Data": "raw-materials-table",
      "Finished Good Data": "finished-goods-table",
    };

    const matchingPage = Object.entries(pageMapping).find(
      ([key, value]) => value === item.id
    );

    return matchingPage && allowedPages.includes(matchingPage[0]);
  });

  useEffect(() => {
    if (user && location.pathname === "/") {
      const allowedPages = user.page.split(",").map((p) => p.trim());

      if (allowedPages.includes("Dashboard Overview")) {
        navigate("/combined-dashboard");
      } else if (allowedPages.includes("Raw Material Data")) {
        navigate("/raw-materials-table");
      } else if (allowedPages.includes("Finished Good Data")) {
        navigate("/finished-goods-table");
      }
    }
  }, [user, location.pathname, navigate]);

  // console.log("user",user);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-40">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-indigo-600/5 pointer-events-none" />
        <div className="relative px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {getCurrentPageTitle()}
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {getCurrentPageSubtitle()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`
            sidebar-container
            fixed md:sticky top-16 bottom-0 left-0 z-30
            ${
              isMobile && sidebarOpen
                ? "translate-x-0"
                : isMobile
                ? "-translate-x-full"
                : ""
            }
            ${!isMobile && sidebarOpen ? "w-80" : !isMobile ? "w-20" : "w-80"}
            transition-all duration-500 ease-in-out bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl flex flex-col
            overflow-hidden
          `}
        >
          <div className="flex flex-col h-full">
            <nav className="flex-1 p-2 overflow-hidden">
              <div className="space-y-2">
                {filteredNavigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === `/${item.id}` ||
                    (location.pathname === "/" &&
                      item.id === "combined-dashboard");
                  return (
                    <button
                      key={item.id}
                      onClick={() => handlePageChange(item.id)}
                      className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-300 transform hover:scale-105 touch-friendly ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/25 scale-105"
                          : "text-slate-600 hover:bg-white/60 hover:text-slate-800 hover:shadow-lg backdrop-blur-sm"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          isActive
                            ? "bg-white/20 shadow-lg"
                            : "bg-slate-100 group-hover:bg-white group-hover:shadow-md"
                        }`}
                      >
                        <Icon
                          size={18}
                          className={isActive ? "text-white" : "text-slate-600"}
                        />
                      </div>
                      {(sidebarOpen || !isMobile) && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm truncate">
                                {item.label}
                              </p>
                              <p
                                className={`text-xs mt-0.5 truncate ${
                                  isActive ? "text-blue-100" : "text-slate-500"
                                }`}
                              >
                                {item.description}
                              </p>
                            </div>
                            <ChevronRight
                              size={14}
                              className={`transition-transform duration-300 ${
                                isActive
                                  ? "text-white rotate-90"
                                  : "text-slate-400 group-hover:translate-x-1"
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            {(sidebarOpen || !isMobile) && (
              <>
                <div className="relative p-3 border-t border-white/20">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <UserCircle className="text-white" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800 truncate">
                          {user?.username || user?.name || "User"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user?.role || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t  mt-auto">
                  <button
                    onClick={() => {
                      handleLogout();
                      // onClose?.();
                    }}
                    className="flex items-center py-2 px-4 rounded-lg text-white cursor-pointer bg-red-600/80 hover:bg-red-800 w-full transition-colors mb-3"
                  >
                    <LogOutIcon className="mr-2" size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="p-2 relative w-full h-full">
              <div className="relative w-full h-full">
                {location.pathname === "/combined-dashboard" && (
                  <CombinedDashboardPage />
                )}
                {location.pathname === "/raw-material" && <RawMaterialPage />}
                {location.pathname === "/raw-materials-table" && (
                  <RawMaterialsPage />
                )}
                {location.pathname === "/finished-good" && <FinishedGoodPage />}
                {location.pathname === "/finished-goods-table" && (
                  <FinishedGoodsPage />
                )}
              </div>
            </div>
          </main>

          <footer className="bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-lg border-t border-white/30 py-3 px-6 text-center">
            <p className="text-sm font-medium text-slate-700">
              Powered by{" "}
              <span className="text-indigo-600 font-semibold">Bootivate</span> ©
              2025
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
