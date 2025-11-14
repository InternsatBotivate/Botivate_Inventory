"use client"
import { useEffect, useState, useMemo } from "react"
import { DataTable } from "../components/data-table"
import { Search, Filter, Download, RefreshCw } from "lucide-react"

export default function RawMaterialsPage() {
  const [rawMaterialsData, setRawMaterialsData] = useState([])
  const [columns, setColumns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const sheetId = "1mFNpoBh11K2VLLcoZvc7wzuxc-v1WAbnW3zH5u4TctU"
  const sheetName = "Raw Material"
  const webAppUrl =
    "https://script.google.com/macros/s/AKfycby4G3iXpQczMBXUP-BwOHimp6mv0nvZyKEyrqOwizCSfIj9spZaEW3ohtoVdbPjFxwliw/exec"

  const parseNumber = (val) => {
    const n = Number.parseFloat(String(val ?? "").replace(/,/g, ""))
    return isNaN(n) ? 0 : n
  }

  const getStatusColor = (cur, max) => {
    const pct = (cur / max) * 100
    if (pct < 33) return "#ef4444"
    if (pct < 66) return "#f59e0b"
    if (pct <= 100) return "#10b981"
    return "#8b5cf6"
  }

  const getRowColor = (item) => {
    const cur = item["Current Level"] ?? item["Actual Level"]
    const max = item["Max Level For Color Code"]
    const pct = (cur / max) * 100
    if (pct < 33) return "bg-red-50/80 hover:bg-red-100/80 border-l-4 border-red-400"
    if (pct < 66) return "bg-amber-50/80 hover:bg-amber-100/80 border-l-4 border-amber-400"
    if (pct <= 100) return "bg-emerald-50/80 hover:bg-emerald-100/80 border-l-4 border-emerald-400"
    return "bg-purple-50/80 hover:bg-purple-100/80 border-l-4 border-purple-400"
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const url = `${webAppUrl}?sheetId=${sheetId}&sheetName=${encodeURIComponent(sheetName)}`
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const json = await response.json()
        if (!json.success || !Array.isArray(json.data)) {
          throw new Error(json.message || "Invalid data format")
        }

        const data = json.data.map((row) => ({ ...row }))
        const headers = data.length > 0 ? Object.keys(data[0]) : []
        const generatedColumns = headers.map((header) => {
          const baseColumn = {
            key: header,
            header,
            cell: (row) => {
              const value = row[header]
              if (typeof value === "number") return value.toLocaleString()
              return value || ""
            },
          }

          // Special handling for item name column
          if (baseColumn.key.toLowerCase().includes("item")) {
            baseColumn.cell = (i) => (
              <div className="flex items-center font-medium">
                <span
                  className="inline-block w-3 h-3 rounded-full mr-3 shadow-sm"
                  style={{
                    backgroundColor: getStatusColor(
                      i["Current Level"] ?? i["Actual Level"],
                      i["Max Level For Color Code"],
                    ),
                    boxShadow: `0 0 8px ${getStatusColor(
                      i["Current Level"] ?? i["Actual Level"],
                      i["Max Level For Color Code"],
                    )}40`,
                  }}
                />
                <span className="text-slate-800">{i[baseColumn.key]}</span>
              </div>
            )
          }

          // Special handling for current level column
          if (
            baseColumn.key.toLowerCase().includes("current level") ||
            baseColumn.key.toLowerCase().includes("actual level")
          ) {
            baseColumn.cell = (i) => {
              const cur = i[baseColumn.key]
              const max = i["Max Level For Color Code"]
              const pct = (cur / max) * 100
              const color = getStatusColor(cur, max)
              return (
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full transition-all duration-700 ease-out rounded-full"
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 8px ${color}40`,
                      }}
                    />
                  </div>
                  <span className="font-bold text-slate-800">{cur.toLocaleString()}</span>
                  <span className="text-sm text-slate-500">{pct.toFixed(0)}%</span>
                </div>
              )
            }
          }

          return baseColumn
        })

        setRawMaterialsData(data)
        setColumns(generatedColumns)
      } catch (err) {
        console.error("Fetch Error:", err)
        setError(err.message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    if (!searchTerm) return rawMaterialsData
    const term = searchTerm.toLowerCase()
    return rawMaterialsData.filter((item) =>
      Object.values(item).some((value) =>
        typeof value === "string"
          ? value.toLowerCase().includes(term)
          : typeof value === "number"
            ? value.toString().includes(term)
            : false,
      ),
    )
  }, [rawMaterialsData, searchTerm])

  const legend = [
    {
      color: "#ef4444",
      label: "Critical (<33%)",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    {
      color: "#f59e0b",
      label: "Low (33–66%)",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
    {
      color: "#10b981",
      label: "Good (66–100%)",
      className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    {
      color: "#8b5cf6",
      label: "Excess (>100%)",
      className: "bg-purple-100 text-purple-800 border-purple-200",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/20 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Raw Materials Inventory
            </h1>
            <p className="text-slate-600 mt-1 text-sm lg:text-base">Detailed view of all raw material stock levels</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3">
            <button className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2 lg:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg lg:rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl text-sm lg:text-base touch-friendly">
              <Download size={14} />
              Export
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2 lg:py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg lg:rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl text-sm lg:text-base touch-friendly"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mt-4 lg:mt-6 filters-mobile">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search materials..."
              className="w-full pl-10 pr-4 py-2.5 lg:py-3 rounded-lg lg:rounded-xl border border-white/20 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base touch-friendly"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg lg:rounded-xl hover:bg-white/70 transition-all duration-200 text-sm lg:text-base touch-friendly">
            <Filter size={14} className="text-slate-600" />
            <span className="text-slate-700">Filters</span>
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 lg:gap-3 mt-3 lg:mt-4">
          {legend.map((item) => (
            <div
              key={item.color}
              className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs font-medium border ${item.className}`}
            >
              <span
                className="inline-block w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full mr-1.5 lg:mr-2 align-middle"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl lg:rounded-2xl p-8 lg:p-12 border border-white/20 shadow-lg">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-4 border-blue-200 border-t-blue-600 mb-4" />
            <p className="text-slate-600 font-medium text-sm lg:text-base">Loading inventory data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Data</h3>
            <p className="text-red-600">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-white/20 shadow-lg">
          <div className="p-3 lg:p-6">
            <DataTable
              data={filteredData}
              columns={columns}
              searchField="itemName"
              title="Raw Materials Inventory"
              getRowClassName={getRowColor}
              legend={legend}
              className="w-full table-compact table-mobile lg:table-auto"
            />
          </div>
        </div>
      )}
    </div>
  )
}
