"use client"
import { useState } from "react"
import { FileText, Package2 } from "lucide-react"
import RawMaterialPage from "./RawMaterialPage"
import FinishedGoodPage from "./FinishedGoodPage"

export default function CombinedDashboardPage() {
  const [activeTab, setActiveTab] = useState("raw-materials")

  const tabs = [
    {
      id: "raw-materials",
      label: "Raw Materials",
      shortLabel: "Raw", // For mobile
      icon: FileText,
      count: null,
      component: RawMaterialPage,
    },
    {
      id: "finished-goods",
      label: "Finished Goods",
      shortLabel: "Finished", // For mobile
      icon: Package2,
      count: null,
      component: FinishedGoodPage,
    },
  ]

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Enhanced Responsive Tab Navigation */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl lg:rounded-2xl p-1 lg:p-2 border border-white/20 shadow-lg">
        <div className="flex space-x-1 lg:space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center justify-center lg:justify-start gap-2 lg:gap-3 px-3 lg:px-6 py-3 lg:py-4 rounded-lg lg:rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 flex-1 lg:flex-initial touch-friendly
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/25 scale-105"
                      : "text-slate-600 hover:bg-white/60 hover:text-slate-800 hover:shadow-lg backdrop-blur-sm"
                  }
                `}
              >
                {/* Tab Background Decoration */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-700/10 rounded-lg lg:rounded-xl blur-xl" />
                )}

                {/* Tab Icon */}
                <div
                  className={`
                  p-1.5 lg:p-2 rounded-md lg:rounded-lg transition-all duration-300
                  ${isActive ? "bg-white/20 shadow-lg" : "bg-slate-100 group-hover:bg-white group-hover:shadow-md"}
                `}
                >
                  <Icon size={16} className={isActive ? "text-white" : "text-slate-600"} />
                </div>

                {/* Tab Label - Responsive */}
                <span className="relative z-10 font-semibold">
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </span>

                {/* Tab Count Badge (if needed) */}
                {tab.count !== null && (
                  <span
                    className={`
                    px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full text-xs font-bold min-w-[16px] lg:min-w-[20px] text-center
                    ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}
                  `}
                  >
                    {tab.count}
                  </span>
                )}

                {/* Active Tab Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white rounded-full shadow-lg" />
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Underline Animation */}
        <div className="relative mt-1 lg:mt-2">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <div
            className={`
              absolute top-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full transition-all duration-500 ease-out
              ${activeTab === "raw-materials" ? "left-0 w-1/2" : "left-1/2 w-1/2"}
            `}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative">
        {/* Content Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-blue-50/20 pointer-events-none rounded-xl lg:rounded-2xl" />

        {/* Animated Content Container */}
        <div className="relative animate-fadeIn tab-content">{ActiveComponent && <ActiveComponent />}</div>
      </div>
    </div>
  )
}
