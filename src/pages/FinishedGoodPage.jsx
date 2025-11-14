"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer } from "../components/ui/chart"
import { Boxes, BarChart3, AlertTriangle, Package, DollarSign, Factory } from "lucide-react"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

export default function FinishedGoodPage() {
  const [totalValue, setTotalValue] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [finishedGoods, setFinishedGoods] = useState([])
  const [sheetColumns, setSheetColumns] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [vendors, setVendors] = useState([])

  const sheetId = "1SUYzbNk7Sm-YQn9a5lGV6UpQS-9iOs2TFIhbGDo8474"
  const sheetName = "Finished Good"

  const parseNumericValue = (value) => {
    if (!value) return 0
    if (typeof value === "string") {
      const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ""))
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
    const fetchFinishedGoods = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`
        const response = await fetch(url)
        const text = await response.text()
        const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1))

        const headers = json.table.cols.map((col, index) => ({
          id: `col${index}`,
          label: col.label || `Column ${index}`,
        }))

        const rows = json.table.rows
          .map((row, rowIndex) => {
            const rowData = { id: `row-${rowIndex}` }
            row.c?.forEach((cell, index) => {
              rowData[headers[index].id] = cell?.v ?? ""
            })
            return rowData
          })
          .filter((row) => row && Object.keys(row).length > 0)

        setSheetColumns(headers.map((h) => h.label))

        const processed = rows
          .map((row) => ({
            id: row.id,
            productName: row[headers[0].id] || "Unknown",
            currentStock: parseNumericValue(row[headers[1].id]),
            maxCapacity: parseNumericValue(row[headers[2].id]) || 1,
            inProduction: parseNumericValue(row[headers[14]?.id]),
            value: parseNumericValue(row[headers[14]?.id]),
          }))
          .filter((item) => item.productName?.toString().trim() !== "")

        setFinishedGoods(processed)
        setTotalValue(processed.reduce((sum, i) => sum + i.value, 0))
        setLowStockCount(processed.filter((i) => (i.currentStock / i.maxCapacity) * 100 < 33).length)

        // Mock vendor data
        const mockVendors = [
          { id: 1, name: "Customer A", poPending: 5, inTransit: 3, received: 12, status: "active" },
          { id: 2, name: "Customer B", poPending: 2, inTransit: 7, received: 8, status: "inactive" },
          { id: 3, name: "Customer C", poPending: 0, inTransit: 4, received: 15, status: "active" },
        ]
        setVendors(mockVendors)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFinishedGoods()
  }, [])

  const stockDistribution = [
    { name: "Critical", value: lowStockCount, color: "#ef4444", bgColor: "bg-red-50", textColor: "text-red-700" },
    {
      name: "Low",
      value: finishedGoods.filter((i) => {
        const percent = (i.currentStock / i.maxCapacity) * 100
        return percent >= 33 && percent < 66
      }).length,
      color: "#f59e0b",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
    {
      name: "Good",
      value: finishedGoods.filter((i) => {
        const percent = (i.currentStock / i.maxCapacity) * 100
        return percent >= 66 && percent <= 100
      }).length,
      color: "#10b981",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      name: "Excess",
      value: finishedGoods.filter((i) => (i.currentStock / i.maxCapacity) * 100 > 100).length,
      color: "#8b5cf6",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
  ]

  const finishedGoodsChartData = finishedGoods.slice(0, 5).map((item) => ({
    name: item.productName.length > 10 ? item.productName.slice(0, 10) + "..." : item.productName,
    fullName: item.productName,
    current: item.currentStock,
    max: item.maxCapacity,
  }))

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
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading finished goods data...</p>
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
          Finished Goods Dashboard
        </h1>
        {/* <p className="text-slate-600">Monitor and manage your finished goods inventory</p> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 stats-grid-mobile sm:stats-grid-tablet lg:stats-grid-desktop-sm">
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-2 lg:pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-green-600 font-medium text-xs lg:text-sm">
                  Total Products
                </CardDescription>
                <CardTitle className="text-2xl lg:text-3xl font-bold text-slate-800">{finishedGoods.length}</CardTitle>
              </div>
              <div className="bg-green-500 p-2 lg:p-3 rounded-lg lg:rounded-xl">
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

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/30 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-2 lg:pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-amber-600 font-medium text-xs lg:text-sm">Total Value</CardDescription>
                <CardTitle className="text-2xl lg:text-3xl font-bold text-slate-800">
                  ₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </CardTitle>
              </div>
              <div className="bg-amber-500 p-2 lg:p-3 rounded-lg lg:rounded-xl">
                <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-2 lg:pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-blue-600 font-medium text-xs lg:text-sm">
                  In Production
                </CardDescription>
                <CardTitle className="text-2xl lg:text-3xl font-bold text-slate-800">
                  {finishedGoods.reduce((sum, item) => sum + item.inProduction, 0)}
                </CardTitle>
              </div>
              <div className="bg-blue-500 p-2 lg:p-3 rounded-lg lg:rounded-xl">
                <Factory className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Stock Distribution */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Stock Level Distribution</CardTitle>
          <CardDescription>Overview of inventory levels across all finished goods</CardDescription>
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
                  {finishedGoods.length > 0 ? ((item.value / finishedGoods.length) * 100).toFixed(1) : 0}% of total
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
              <CardTitle className="text-xl font-semibold text-slate-800">Top Finished Goods Stock Levels</CardTitle>
              <CardDescription>Current stock vs max capacity for top 5 products</CardDescription>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-60 lg:h-80 w-full chart-mobile lg:chart-desktop-sm">
            <ChartContainer
              config={{
                current: { label: "Current Stock", color: "hsl(var(--chart-1))" },
                max: { label: "Max Capacity", color: "hsl(var(--chart-2))" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finishedGoodsChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend />
                  <Bar dataKey="current" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="max" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">Customer Information</CardTitle>
              <CardDescription>Customer details for Finished Goods</CardDescription>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <Boxes className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mt-4 filters-mobile">
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs bg-white/50 border-white/20"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-white/50 border-white/20">
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
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Sales Order (SO)</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Dispatch</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Production Date</th>
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
                      No customers found matching your criteria
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
