"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, Minus, Calendar, Milk, BarChart3 } from "lucide-react"
import { format, subDays } from "date-fns"
import { es } from "date-fns/locale"

interface MilkProductionRecord {
  id: string
  cattleId: string
  cattleName: string
  cattleBreed: string
  productionDate: string
  morningLiters: number
  afternoonLiters: number
  eveningLiters: number
  totalLiters: number
  notes?: string
}

interface Cattle {
  id: string
  name: string
  breed: string
  averageMilkProduction: number
}

interface MilkProductionChartsProps {
  records: MilkProductionRecord[]
  cattle: Cattle[]
}

export function MilkProductionCharts({ records, cattle }: MilkProductionChartsProps) {
  const [selectedCattle, setSelectedCattle] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7")
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("line")

  // Generate daily production data for the last N days
  const generateDailyData = () => {
    const days = Number.parseInt(selectedPeriod)
    const endDate = new Date()
    const startDate = subDays(endDate, days - 1)

    const dailyData = []

    for (let i = 0; i < days; i++) {
      const currentDate = subDays(endDate, days - 1 - i)
      const dateString = format(currentDate, "yyyy-MM-dd")

      const dayRecords = records.filter((r) => r.productionDate === dateString)

      if (selectedCattle === "all") {
        const totalProduction = dayRecords.reduce((sum, r) => sum + r.totalLiters, 0)
        const cattleCount = new Set(dayRecords.map((r) => r.cattleId)).size

        dailyData.push({
          date: dateString,
          displayDate: format(currentDate, "dd/MM", { locale: es }),
          fullDate: format(currentDate, "EEEE dd/MM", { locale: es }),
          totalLiters: totalProduction,
          averageLiters: cattleCount > 0 ? totalProduction / cattleCount : 0,
          cattleCount,
          morningTotal: dayRecords.reduce((sum, r) => sum + r.morningLiters, 0),
          afternoonTotal: dayRecords.reduce((sum, r) => sum + r.afternoonLiters, 0),
          eveningTotal: dayRecords.reduce((sum, r) => sum + r.eveningLiters, 0),
        })
      } else {
        const cattleRecord = dayRecords.find((r) => r.cattleId === selectedCattle)
        const selectedCattleInfo = cattle.find((c) => c.id === selectedCattle)

        dailyData.push({
          date: dateString,
          displayDate: format(currentDate, "dd/MM", { locale: es }),
          fullDate: format(currentDate, "EEEE dd/MM", { locale: es }),
          totalLiters: cattleRecord?.totalLiters || 0,
          morningLiters: cattleRecord?.morningLiters || 0,
          afternoonLiters: cattleRecord?.afternoonLiters || 0,
          eveningLiters: cattleRecord?.eveningLiters || 0,
          cattleName: selectedCattleInfo?.name || "",
          averageProduction: selectedCattleInfo?.averageMilkProduction || 0,
        })
      }
    }

    return dailyData
  }

  const dailyData = generateDailyData()

  // Calculate trends and statistics
  const calculateTrends = () => {
    if (dailyData.length < 2) return { trend: "stable", change: 0, percentage: 0 }

    const recent = dailyData.slice(-3).reduce((sum, d) => sum + d.totalLiters, 0) / 3
    const previous = dailyData.slice(-6, -3).reduce((sum, d) => sum + d.totalLiters, 0) / 3

    if (previous === 0) return { trend: "stable", change: 0, percentage: 0 }

    const change = recent - previous
    const percentage = (change / previous) * 100

    let trend: "up" | "down" | "stable" = "stable"
    if (Math.abs(percentage) > 5) {
      trend = percentage > 0 ? "up" : "down"
    }

    return { trend, change, percentage }
  }

  const trends = calculateTrends()

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.fullDate}</p>
          {selectedCattle === "all" ? (
            <>
              <p className="text-sm text-blue-600">Total: {data.totalLiters.toFixed(1)}L</p>
              <p className="text-sm text-green-600">Promedio: {data.averageLiters.toFixed(1)}L</p>
              <p className="text-sm text-gray-600">Vacas: {data.cattleCount}</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-orange-600">Mañana: {data.morningTotal.toFixed(1)}L</p>
                <p className="text-xs text-yellow-600">Tarde: {data.afternoonTotal.toFixed(1)}L</p>
                <p className="text-xs text-purple-600">Noche: {data.eveningTotal.toFixed(1)}L</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-blue-600">Total: {data.totalLiters.toFixed(1)}L</p>
              <p className="text-sm text-gray-600">Promedio histórico: {data.averageProduction.toFixed(1)}L</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-orange-600">Mañana: {data.morningLiters.toFixed(1)}L</p>
                <p className="text-xs text-yellow-600">Tarde: {data.afternoonLiters.toFixed(1)}L</p>
                <p className="text-xs text-purple-600">Noche: {data.eveningLiters.toFixed(1)}L</p>
              </div>
            </>
          )}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      data: dailyData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    }

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="totalLiters" fill="#3b82f6" name="Producción (L)" />
            {selectedCattle !== "all" && <Bar dataKey="averageProduction" fill="#e5e7eb" name="Promedio histórico" />}
          </BarChart>
        )

      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="totalLiters"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Producción (L)"
            />
            {selectedCattle !== "all" && (
              <Area
                type="monotone"
                dataKey="averageProduction"
                stroke="#9ca3af"
                fill="#f3f4f6"
                fillOpacity={0.5}
                name="Promedio histórico"
              />
            )}
          </AreaChart>
        )

      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalLiters"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              name="Producción (L)"
            />
            {selectedCattle !== "all" && (
              <Line
                type="monotone"
                dataKey="averageProduction"
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#9ca3af", strokeWidth: 2, r: 3 }}
                name="Promedio histórico"
              />
            )}
          </LineChart>
        )
    }
  }

  // Calculate statistics
  const totalProduction = dailyData.reduce((sum, d) => sum + d.totalLiters, 0)
  const averageDaily = totalProduction / dailyData.length
  const maxProduction = Math.max(...dailyData.map((d) => d.totalLiters))
  const minProduction = Math.min(...dailyData.map((d) => d.totalLiters))

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análisis de Producción de Leche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Vaca</label>
              <Select value={selectedCattle} onValueChange={setSelectedCattle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las vacas</SelectItem>
                  {cattle.map((cow) => (
                    <SelectItem key={cow.id} value={cow.id}>
                      {cow.name} ({cow.breed})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="14">Últimos 14 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Gráfica</label>
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Líneas</SelectItem>
                  <SelectItem value="bar">Barras</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                Exportar Reporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tendencia</p>
                <div className="flex items-center gap-2">
                  {getTrendIcon(trends.trend)}
                  <span className={`text-lg font-bold ${getTrendColor(trends.trend)}`}>
                    {trends.percentage > 0 ? "+" : ""}
                    {trends.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Badge
                variant={trends.trend === "up" ? "default" : trends.trend === "down" ? "destructive" : "secondary"}
              >
                {trends.trend === "up" ? "Subiendo" : trends.trend === "down" ? "Bajando" : "Estable"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promedio Diario</p>
                <p className="text-2xl font-bold">{averageDaily.toFixed(1)}L</p>
              </div>
              <Milk className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Máximo</p>
                <p className="text-2xl font-bold text-green-600">{maxProduction.toFixed(1)}L</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mínimo</p>
                <p className="text-2xl font-bold text-red-600">{minProduction.toFixed(1)}L</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedCattle === "all"
              ? `Producción Total - Últimos ${selectedPeriod} días`
              : `${cattle.find((c) => c.id === selectedCattle)?.name} - Últimos ${selectedPeriod} días`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Breakdown for Individual Cattle */}
      {selectedCattle !== "all" && (
        <Card>
          <CardHeader>
            <CardTitle>Desglose por Ordeño - {cattle.find((c) => c.id === selectedCattle)?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayDate" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="morningLiters" stackId="a" fill="#f97316" name="Mañana" />
                  <Bar dataKey="afternoonLiters" stackId="a" fill="#eab308" name="Tarde" />
                  <Bar dataKey="eveningLiters" stackId="a" fill="#8b5cf6" name="Noche" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
