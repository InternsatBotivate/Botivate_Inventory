"use client"
import { useEffect, useState, useMemo } from "react"
import { DataTable } from "../components/data-table"
import { Search, Filter, Download, RefreshCw, AlertTriangle } from "lucide-react"

export default function FinishedGoodsPage() {
  const [finishedGoodsData, setFinishedGoodsData] = useState([])
  const [columns, setColumns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const sheetId = "1mFNpoBh11K2VLLcoZvc7wzuxc-v1WAbnW3zH5u4TctU"
  const sheetName = "Finished Good"
  const webAppUrl =
    "https://script.google.com/macros/s/AKfycbxYDe9Rj2M7kzaKOFR0-tGf8acwyOaM3Fq3ezIwA3HAb0YcDO0GIgMC1bx0UGDbIij8/exec"

  const parseNumber = (val) => {
    const n = Number.parseFloat(String(val ?? "").replace(/,/g, ""))
    return isNaN(n) ? 0 : n
  }

  const getStatusColor = (cur, pending) => {
    const ratio = (cur / Math.max(1, pending)) * 100
    if (ratio < 80) return "#ef4444"
    if (ratio < 100) return "#f59e0b"
    if (ratio < 120) return "#3b82f6"
    return "#10b981"
  }

  const getRowColor = (item) => {
    const cur = parseNumber(item["Current Level"])
    const pending = parseNumber(item["Sales Order Pending"])
    const ratio = (cur / Math.max(1, pending)) * 100
    if (ratio < 80) return "bg-red-50/80 hover:bg-red-100/80 border-l-4 border-red-400"
    if (ratio < 100) return "bg-amber-50/80 hover:bg-amber-100/80 border-l-4 border-amber-400"
    if (ratio < 120) return "bg-blue-50/80 hover:bg-blue-100/80 border-l-4 border-blue-400"
    return "bg-emerald-50/80 hover:bg-emerald-100/80 border-l-4 border-emerald-400"
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const url = `${webAppUrl}?sheetId=${sheetId}&sheetName=${encodeURIComponent(sheetName)}&range=A:N`

        let response
        try {
          response = await fetch(url, {
            headers: {
              Accept: "application/json",
            },
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const text = await response.text()
          let json
          try {
            json = JSON.parse(text)
          } catch (parseError) {
            console.error("Failed to parse JSON:", text)
            throw new Error("Received invalid JSON from server")
          }

          if (!json.success || !Array.isArray(json.data)) {
            throw new Error(json.message || "Invalid data format")
          }

          const data = json.data.map((row, idx) => ({
            id: idx + 1,
            "S.No.": row[0] || "",
            "Product Name": row[1] || "",
            Opening: parseNumber(row[2]),
            Adjustment: parseNumber(row[3]),
            "Sales Order Pending": parseNumber(row[4]),
            "Purchase Material Received": parseNumber(row[5]),
            "Lift Material": parseNumber(row[6]),
            "In Transit": parseNumber(row[7]),
            "Purchase Return": parseNumber(row[8]),
            Production: parseNumber(row[9]),
            Sales: parseNumber(row[10]),
            "Sales Return": parseNumber(row[11]),
            Consumption: parseNumber(row[12]),
            "Current Level": parseNumber(row[13]),
          }))

          const generatedColumns = [
            {
              key: "S.No.",
              header: "S.No.",
              cell: (row) => row["S.No."] || "",
              className: "text-center",
            },
            {
              key: "Product Name",
              header: "Product Name",
              cell: (row) => (
                <div className="flex items-center font-medium">
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-3 shadow-sm"
                    style={{
                      backgroundColor: getStatusColor(row["Current Level"], row["Sales Order Pending"]),
                      boxShadow: `0 0 8px ${getStatusColor(row["Current Level"], row["Sales Order Pending"])}40`,
                    }}
                  />
                  <span className="text-slate-800">{row["Product Name"]}</span>
                </div>
              ),
            },
            {
              key: "Opening",
              header: "Opening",
              cell: (row) => row["Opening"].toLocaleString(),
              className: "text-right",
            },
            {
              key: "Adjustment",
              header: "Adjustment",
              cell: (row) => row["Adjustment"].toLocaleString(),
              className: "text-right",
            },
            {
              key: "Sales Order Pending",
              header: "Sales Order Pending",
              cell: (row) => row["Sales Order Pending"].toLocaleString(),
              className: "text-right",
            },
            {
              key: "Purchase Material Received",
              header: "Purchase Material Received",
              cell: (row) => row["Purchase Material Received"].toLocaleString(),
              className: "text-right",
            },
            {
              key: "Lift Material",
              header: "Lift Material",
              cell: (row) => row["Lift Material"].toLocaleString(),
              className: "text-right",
            },
            {
              key: "In Transit",
              header: "In Transit",
              cell: (row) => row["In Transit"].toLocaleString(),
              className: "text-right",
            },
            {
              key: "Purchase Return",
              header: "Purchase Return",
              cell: (row) => row["Purchase Return"].toLocaleString(),
              className: "text-right",
            },
            {
              key: "Production",
              header: "Production",
              cell: (row) => row["Production"].toLocaleString(),
              className: "text-right",
            },
            {
              key: "Sales",
              header: "Sales",
              cell: (row) => row["Sales"].toLocaleString(),
              className: "text-right",
            },
            {
              key: "Sales Return",
              header: "Sales Return",
              cell: (row) => row["Sales Return"].toLocaleString(),
              className: "text-right",
            },
            {
              key: "Consumption",
              header: "Consumption",
              cell: (row) => row["Consumption"].toLocaleString(),
              className: "text-right",
            },
            {
              key: "Current Level",
              header: "Current Level",
              cell: (row) => {
                const cur = row["Current Level"]
                const pending = row["Sales Order Pending"]
                const ratio = (cur / Math.max(1, pending)) * 100
                const color = getStatusColor(cur, pending)
                return (
                  <div className="flex items-center gap-3">
                    <div className="w-20 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full transition-all duration-700 ease-out rounded-full"
                        style={{
                          width: `${Math.min(100, ratio)}%`,
                          backgroundColor: color,
                          boxShadow: `0 0 8px ${color}40`,
                        }}
                      />
                    </div>
                    <span className="font-bold text-slate-800">{cur.toLocaleString()}</span>
                    <span className="text-sm text-slate-500">{ratio.toFixed(0)}%</span>
                  </div>
                )
              },
            },
          ]

          setFinishedGoodsData(data)
          setColumns(generatedColumns)
        } catch (err) {
          console.error("Fetch Error:", err)
          setError(err.message || "Failed to load data. Please check the Google Apps Script configuration.")
        }
      } catch (err) {
        console.error("Unexpected Error:", err)
        setError(err.message || "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    if (!searchTerm) return finishedGoodsData
    const term = searchTerm.toLowerCase()
    return finishedGoodsData.filter((item) =>
      Object.values(item).some((value) =>
        typeof value === "string"
          ? value.toLowerCase().includes(term)
          : typeof value === "number"
            ? value.toString().includes(term)
            : false,
      ),
    )
  }, [finishedGoodsData, searchTerm])

  const legend = [
    {
      color: "#ef4444",
      label: "Insufficient (<80%)",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    {
      color: "#f59e0b",
      label: "Low (80–99%)",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
    {
      color: "#3b82f6",
      label: "Adequate (100–119%)",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      color: "#10b981",
      label: "Sufficient (≥120%)",
      className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Finished Goods Inventory
            </h1>
            <p className="text-slate-600 mt-1 text-sm">Detailed view of all finished goods stock levels</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base touch-manipulation">
              <Download size={16} />
              Export
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-3 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base touch-manipulation"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-6">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-xl border border-white/20 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 sm:py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/70 transition-all duration-200 text-sm touch-manipulation">
            <Filter size={16} className="text-slate-600" />
            <span className="text-slate-700">Filters</span>
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-3 lg:mt-4">
          {legend.map((item) => (
            <div key={item.color} className={`px-2 py-1 rounded-full text-xs font-medium border ${item.className}`}>
              <span
                className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-12 border border-white/20 shadow-lg">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mb-4" />
            <p className="text-slate-600 font-medium text-sm">Loading finished goods data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-8 text-center">
          <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 mx-auto mb-2 sm:mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-1 sm:mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-2 sm:mb-4 text-sm">{error}</p>
          <div className="text-xs sm:text-sm text-red-600 mb-3 sm:mb-4">
            <p>Please ensure:</p>
            <ul className="list-disc pl-5 mt-1 text-left inline-block">
              <li>The Google Sheet is shared with the script's service account</li>
              <li>The sheet name and range are correct</li>
              <li>The Google Apps Script is deployed correctly</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-200 text-sm touch-manipulation"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-x-auto">
          <div className="p-4 sm:p-6">
            <DataTable
              data={filteredData}
              columns={columns}
              searchField="Product Name"
              title="Finished Goods Inventory"
              getRowClassName={getRowColor}
              className="w-full table-compact"
            />
          </div>
        </div>
      )}
    </div>
  )
}
