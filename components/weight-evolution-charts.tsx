"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from "recharts"
import { TrendingUp, TrendingDown, Weight, Calendar, Target, AlertTriangle } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { parseYMDToDate } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useMemo } from 'react'

interface WeightRecord {
  id: string
  cattleId: string
  cattleName: string
  cattleBreed: string
  weightDate: string
  weightKg: number
  previousWeight?: number
  weightChange?: number
  notes?: string
}

interface Cattle {
  id: string
  name: string
  breed: string
  birthDate: string
  lastWeight: number
}

interface WeightEvolutionChartsProps {
  records: WeightRecord[]
  cattle: Cattle[]
}

export function WeightEvolutionCharts({ records, cattle }: WeightEvolutionChartsProps) {
  const [selectedCattle, setSelectedCattle] = useState<string>(cattle[0]?.id || "")
  const [searchName, setSearchName] = useState<string>("")

  // Get weight evolution data for selected cattle
  const getWeightEvolution = () => {
    if (!selectedCattle) return []

    const cattleRecords = records
      .filter((r) => r.cattleId === selectedCattle)
      .sort((a, b) => parseYMDToDate(a.weightDate).getTime() - parseYMDToDate(b.weightDate).getTime())

    return cattleRecords.map((record, index) => {
      const date = parseYMDToDate(record.weightDate)
      const selectedCattleInfo = cattle.find((c) => c.id === selectedCattle)

      // Calculate age in months
  const birthDate = parseYMDToDate(selectedCattleInfo?.birthDate || "")
      const ageInDays = differenceInDays(date, birthDate)
      const ageInMonths = Math.floor(ageInDays / 30)

      // Calculate weight gain rate (kg per month)
      let weightGainRate = 0
      if (index > 0) {
        const prevRecord = cattleRecords[index - 1]
  const daysDiff = differenceInDays(date, parseYMDToDate(prevRecord.weightDate))
        const weightDiff = record.weightKg - prevRecord.weightKg
        weightGainRate = daysDiff > 0 ? (weightDiff / daysDiff) * 30 : 0
      }

      // Expected weight ranges by breed and age
      const getExpectedWeight = (breed: string, ageMonths: number) => {
        const breedRanges: { [key: string]: { min: number; max: number; adult: number } } = {
          Holstein: { min: 40 + ageMonths * 25, max: 50 + ageMonths * 30, adult: 650 },
          Jersey: { min: 30 + ageMonths * 18, max: 40 + ageMonths * 22, adult: 450 },
          Angus: { min: 35 + ageMonths * 22, max: 45 + ageMonths * 28, adult: 600 },
        }

        const range = breedRanges[breed] || breedRanges["Holstein"]

        // Cap at adult weight
        return {
          min: Math.min(range.min, range.adult * 0.9),
          max: Math.min(range.max, range.adult),
          target: Math.min((range.min + range.max) / 2, range.adult * 0.95),
        }
      }

      const expectedWeight = getExpectedWeight(selectedCattleInfo?.breed || "Holstein", ageInMonths)

  return {
  date: record.weightDate,
  displayDate: format(date, "dd/MM/yy", { locale: es }),
  fullDate: format(date, "dd MMMM yyyy", { locale: es }),
        weight: record.weightKg,
        weightChange: record.weightChange || 0,
        ageMonths: ageInMonths,
        weightGainRate: weightGainRate,
        expectedMin: expectedWeight.min,
        expectedMax: expectedWeight.max,
        expectedTarget: expectedWeight.target,
        notes: record.notes,
        isUnderweight: record.weightKg < expectedWeight.min,
        isOverweight: record.weightKg > expectedWeight.max,
        isOptimal: record.weightKg >= expectedWeight.min && record.weightKg <= expectedWeight.max,
      }
    })
  }

  const weightData = getWeightEvolution()
  const selectedCattleInfo = cattle.find((c) => c.id === selectedCattle)

  // Calculate statistics
  const calculateStats = () => {
    if (weightData.length < 2) return { totalGain: 0, averageGainRate: 0, trend: "stable" }

    const firstWeight = weightData[0].weight
    const lastWeight = weightData[weightData.length - 1].weight
    const totalGain = lastWeight - firstWeight

  const totalDays = differenceInDays(parseYMDToDate(weightData[weightData.length - 1].date), parseYMDToDate(weightData[0].date))

    const averageGainRate = totalDays > 0 ? (totalGain / totalDays) * 30 : 0

    // Determine trend based on recent measurements
    const recentData = weightData.slice(-3)
    const recentGain = recentData.length > 1 ? recentData[recentData.length - 1].weight - recentData[0].weight : 0

    let trend = "stable"
    if (Math.abs(recentGain) > 5) {
      trend = recentGain > 0 ? "gaining" : "losing"
    }

    return { totalGain, averageGainRate, trend }
  }

  const stats = calculateStats()

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.fullDate}</p>
          <p className="text-sm text-blue-600">Peso: {data.weight}kg</p>
          <p className="text-sm text-gray-600">Edad: {data.ageMonths} meses</p>
          {data.weightChange !== 0 && (
            <p className={`text-sm ${data.weightChange > 0 ? "text-green-600" : "text-red-600"}`}>
              Cambio: {data.weightChange > 0 ? "+" : ""}
              {data.weightChange}kg
            </p>
          )}
          <p className="text-sm text-purple-600">
            Rango esperado: {data.expectedMin.toFixed(0)}-{data.expectedMax.toFixed(0)}kg
          </p>
          {data.notes && <p className="text-xs text-gray-500 mt-1">{data.notes}</p>}
        </div>
      )
    }
    return null
  }

  const getStatusColor = (isUnderweight: boolean, isOverweight: boolean) => {
    if (isUnderweight) return "text-red-600"
    if (isOverweight) return "text-orange-600"
    return "text-green-600"
  }

  const getStatusBadge = (isUnderweight: boolean, isOverweight: boolean, isOptimal: boolean) => {
    if (isUnderweight) return <Badge variant="destructive">Bajo peso</Badge>
    if (isOverweight) return <Badge variant="secondary">Sobrepeso</Badge>
    if (isOptimal) return <Badge variant="default">Óptimo</Badge>
    return <Badge variant="outline">Sin datos</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Weight className="h-5 w-5" />
            Evolución de Peso Individual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar / Seleccionar Vaca</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="mt-2">
                <Select value={selectedCattle} onValueChange={setSelectedCattle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cattle
                      .filter((cow) => cow.name.toLowerCase().includes(searchName.toLowerCase()))
                      .map((cow) => (
                        <SelectItem key={cow.id} value={cow.id}>
                          {cow.name} ({cow.breed})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                Exportar Historial
              </Button>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full bg-transparent">
                <Target className="h-4 w-4 mr-2" />
                Establecer Meta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {selectedCattleInfo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Peso Actual</p>
                  <p className="text-2xl font-bold">{selectedCattleInfo.lastWeight}kg</p>
                </div>
                <Weight className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ganancia Total</p>
                  <p className={`text-2xl font-bold ${stats.totalGain >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {stats.totalGain > 0 ? "+" : ""}
                    {stats.totalGain.toFixed(1)}kg
                  </p>
                </div>
                {stats.totalGain >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ganancia Mensual</p>
                  <p className={`text-2xl font-bold ${stats.averageGainRate >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {stats.averageGainRate > 0 ? "+" : ""}
                    {stats.averageGainRate.toFixed(1)}kg
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <div className="mt-1">
                    {weightData.length > 0 &&
                      getStatusBadge(
                        weightData[weightData.length - 1]?.isUnderweight,
                        weightData[weightData.length - 1]?.isOverweight,
                        weightData[weightData.length - 1]?.isOptimal,
                      )}
                  </div>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weight Evolution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Peso - {selectedCattleInfo?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayDate" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {/* Expected weight range */}
                <Area type="monotone" dataKey="expectedMax" stroke="none" fill="#f3f4f6" fillOpacity={0.3} />
                <Area type="monotone" dataKey="expectedMin" stroke="none" fill="#ffffff" fillOpacity={1} />

                {/* Target weight line */}
                <Line
                  type="monotone"
                  dataKey="expectedTarget"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Peso objetivo"
                />

                {/* Actual weight */}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                  name="Peso real"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weight Change Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Cambios de Peso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weightData.slice(1).map((record, index) => {
                const prevRecord = weightData[index]
                const daysBetween = differenceInDays(parseYMDToDate(record.date), parseYMDToDate(prevRecord.date))

              return (
                <div key={record.date} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <p className="font-medium">{record.fullDate}</p>
                      <p className="text-muted-foreground">{daysBetween} días después</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{record.weight}kg</p>
                      <p className={`text-sm ${record.weightChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {record.weightChange > 0 ? "+" : ""}
                        {record.weightChange}kg
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Tasa mensual</p>
                      <p
                        className={`text-sm font-medium ${record.weightGainRate >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {record.weightGainRate > 0 ? "+" : ""}
                        {record.weightGainRate.toFixed(1)}kg/mes
                      </p>
                    </div>

                    {record.isUnderweight && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    {record.isOverweight && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                    {record.isOptimal && <div className="h-5 w-5 rounded-full bg-green-500" />}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
