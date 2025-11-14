"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer } from "../components/ui/chart"
import { Boxes, BarChart3, TrendingUp, AlertTriangle, Package, DollarSign } from "lucide-react"
import { rawMaterialsData } from "../lib/data"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

export default function RawMaterialPage() {
  const [totalRawValue, setTotalRawValue] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rawMaterials, setRawMaterials] = useState([])
  const [sheetColumns, setSheetColumns] = useState([])
  const [columnVSum, setColumnVSum] = useState(0)
  const [tableHeaders, setTableHeaders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [vendors, setVendors] = useState([])

  const sheetId = "1mFNpoBh11K2VLLcoZvc7wzuxc-v1WAbnW3zH5u4TctU"
  const sheetName = "Raw Material"

  const parseNumericValue = (value) => {
    if (value === undefined || value === null || value === "") return 0
    if (typeof value === "string") {
      const cleanValue = value.replace(/[^\d.-]/g, "")
      const parsed = Number.parseFloat(cleanValue)
      return isNaN(parsed) ? 0 : parsed
    }
    return typeof value === "number" ? value : 0
  }

  const getStatusColor = (count, type) => {
    if (count === 0) return "bg-slate-100 text-slate-600"
    switch (type) {
      case "poPending":
        return count > 5 ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
      case "inTransit":
        return count > 5 ? "bg-blue-100 text-blue-800" : "bg-cyan-100 text-cyan-800"
      case "received":
        return count > 10 ? "bg-emerald-100 text-emerald-800" : "bg-green-100 text-green-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  useEffect(() => {
    const fetchRawMaterials = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`)
        const text = await response.text()
        const jsonStart = text.indexOf("{")
        const jsonEnd = text.lastIndexOf("}")
        const jsonString = text.substring(jsonStart, jsonEnd + 1)
        const data = JSON.parse(jsonString)

        const headers = data.table.cols.map((col, index) => ({
          id: `col${index}`,
          label: col.label || `Column ${index}`,
          type: col.type,
        }))
        setTableHeaders(headers)

        if (!data.table.rows || data.table.rows.length === 0) {
          setRawMaterials([])
          setIsLoading(false)
          return
        }

        const rowsData = data.table.rows
          .map((row) => {
            const rowData = {}
            row.c &&
              row.c.forEach((cell, index) => {
                if (index < headers.length) {
                  const header = headers[index]
                  rowData[header.id] = cell?.v ?? ""
                  if (cell?.f) {
                    rowData[`${header.id}_formatted`] = cell.f
                  }
                }
              })
            return rowData
          })
          .filter((row) => row && Object.keys(row).length > 0)

        const columnNames = headers.map((h) => h.label)
        setSheetColumns(columnNames)

        const itemNameIndex = 0
        const currentLevelIndex = 1
        const maxLevelIndex = 2
        const inTransitIndex = 3
        const valueIndex = 4
        const columnVIndex = 21

        const processedData = rowsData
          .map((row) => ({
            itemName: row[headers[itemNameIndex].id] || "Unknown",
            currentLevel: parseNumericValue(row[headers[currentLevelIndex].id]),
            maxLevelForColorCode: parseNumericValue(row[headers[maxLevelIndex].id]) || 1,
            inTransit: parseNumericValue(row[headers[inTransitIndex].id]),
            valueOfStockAsOnDate: parseNumericValue(row[headers[valueIndex].id]),
            columnVValue: parseNumericValue(row[headers[columnVIndex].id]),
          }))
          .filter((item) => item.itemName?.toString().trim() !== "")

        setRawMaterials(processedData)

        // Mock vendor data - replace with actual data from your sheet
        const mockVendors = [
          { id: 1, name: "Supplier A", poPending: 5, inTransit: 3, received: 12, status: "active" },
          { id: 2, name: "Supplier B", poPending: 2, inTransit: 7, received: 8, status: "inactive" },
          { id: 3, name: "Supplier C", poPending: 0, inTransit: 4, received: 15, status: "active" },
        ]
        setVendors(mockVendors)

        setTotalRawValue(processedData.reduce((sum, item) => sum + item.valueOfStockAsOnDate, 0))
        setColumnVSum(processedData.reduce((sum, item) => sum + (item.columnVValue || 0), 0))
        setLowStockCount(
          processedData.filter((item) => (item.currentLevel / (item.maxLevelForColorCode || 1)) * 100 < 33).length,
        )
      } catch (err) {
        setError(`Failed to load raw material data: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRawMaterials()
  }, [])

  const dataToUse = rawMaterials.length > 0 ? rawMaterials : rawMaterialsData
  const totalRawMaterials = dataToUse.length

  const rawMaterialsChartData = dataToUse.slice(0, 5).map((item) => ({
    name: item.itemName.length > 10 ? `${item.itemName.substring(0, 10)}...` : item.itemName,
    fullName: item.itemName,
    current: item.currentLevel,
    max: item.maxLevelForColorCode,
  }))

  const stockDistribution = [
    { name: "Critical", value: lowStockCount, color: "#ef4444", bgColor: "bg-red-50", textColor: "text-red-700" },
    {
      name: "Low",
      value: dataToUse.filter((item) => {
        const percent = (item.currentLevel / (item.maxLevelForColorCode || 1)) * 100
        return percent >= 33 && percent < 66
      }).length,
      color: "#f59e0b",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
    {
      name: "Good",
      value: dataToUse.filter((item) => {
        const percent = (item.currentLevel / (item.maxLevelForColorCode || 1)) * 100
        return percent >= 66 && percent <= 100
      }).length,
      color: "#10b981",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      name: "Excess",
      value: dataToUse.filter((item) => (item.currentLevel / (item.maxLevelForColorCode || 1)) * 100 > 100).length,
      color: "#8b5cf6",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
  ]

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || vendor.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 p-4 rounded-xl shadow-xl">
          <p className="font-semibold text-slate-800">{payload[0]?.payload?.fullName || label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-lg text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          {sheetColumns.length > 0 && (
            <details className="text-sm text-left">
              <summary className="cursor-pointer hover:text-red-700 font-medium">Available columns:</summary>
              <ul className="mt-2 ml-4 space-y-1 text-red-600">
                {sheetColumns.map((col, index) => (
                  <li key={index} className="font-mono text-xs">
                    {index}: {col}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
          Raw Materials Dashboard
        </h1>
        {/* <p className="text-slate-600">Monitor and manage your raw material inventory</p> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 stats-grid-mobile sm:stats-grid-tablet lg:stats-grid-desktop-sm">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-2 lg:pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-blue-600 font-medium text-xs lg:text-sm">Total Items</CardDescription>
                <CardTitle className="text-2xl lg:text-3xl font-bold text-slate-800">{totalRawMaterials}</CardTitle>
              </div>
              <div className="bg-blue-500 p-2 lg:p-3 rounded-lg lg:rounded-xl">
                <Package className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-200/30 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-2 lg:pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-red-600 font-medium text-xs lg:text-sm">
                  Low Stock Alert
                </CardDescription>
                <CardTitle className="text-2xl lg:text-3xl font-bold text-red-700">{lowStockCount}</CardTitle>
              </div>
              <div className="bg-red-500 p-2 lg:p-3 rounded-lg lg:rounded-xl">
                <AlertTriangle className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200/30 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-2 lg:pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-emerald-600 font-medium text-xs lg:text-sm">
                  Total Value
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-slate-800">
                  ₹{totalRawValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </CardTitle>
              </div>
              <div className="bg-emerald-500 p-2 lg:p-3 rounded-lg lg:rounded-xl">
                <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/30 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-2 lg:pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-amber-600 font-medium text-xs lg:text-sm">
                  Alternative Value
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-slate-800">
                  ₹{columnVSum.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </CardTitle>
              </div>
              <div className="bg-amber-500 p-2 lg:p-3 rounded-lg lg:rounded-xl">
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Stock Distribution */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Stock Level Distribution</CardTitle>
          <CardDescription>Overview of inventory levels across all raw materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stockDistribution.map((item, index) => (
              <div key={index} className={`${item.bgColor} rounded-xl p-4 border border-white/20`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className={`text-sm font-medium ${item.textColor}`}>{item.name}</span>
                </div>
                <div className={`text-2xl font-bold ${item.textColor}`}>{item.value}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {((item.value / totalRawMaterials) * 100).toFixed(1)}% of total
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">Top Raw Materials Stock Levels</CardTitle>
              <CardDescription>Current stock vs maximum level for top 5 raw materials</CardDescription>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-60 lg:h-80 w-full chart-mobile lg:chart-desktop-sm">
            <ChartContainer
              config={{
                current: { label: "Current Level", color: "hsl(var(--chart-1))" },
                max: { label: "Maximum Level", color: "hsl(var(--chart-2))" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rawMaterialsChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend />
                  <Bar dataKey="current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="max" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Information */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">Vendor Information</CardTitle>
              <CardDescription>Vendor details for Raw Materials</CardDescription>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Boxes className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mt-4 filters-mobile">
            <Input
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-xs bg-white/50 border-white/20 touch-friendly"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-white/50 border-white/20 touch-friendly">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto vendor-table-mobile">
            <table className="min-w-full table-mobile lg:table-auto">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Vendor</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">PO Pending</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">In Transit</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Received</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-800">{vendor.name}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.poPending, "poPending")}`}
                        >
                          {vendor.poPending}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.inTransit, "inTransit")}`}
                        >
                          {vendor.inTransit}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.received, "received")}`}
                        >
                          {vendor.received}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No vendors found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
