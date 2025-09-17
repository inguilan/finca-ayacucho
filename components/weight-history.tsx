"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Search, Edit, Trash2, Calendar, TrendingUp, TrendingDown, Weight, Minus } from "lucide-react"

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

interface WeightHistoryProps {
  records: WeightRecord[]
  cattle: Array<{ id: string; name: string; breed: string }>
  onEdit: (record: WeightRecord) => void
  onDelete: (id: string) => void
}

export function WeightHistory({ records, cattle, onEdit, onDelete }: WeightHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCattle, setFilterCattle] = useState("all")
  const [filterDateRange, setFilterDateRange] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")

  const getDateRangeFilter = (dateRange: string, recordDate: string): boolean => {
    const today = new Date()
    const recordDateObj = new Date(recordDate)

    switch (dateRange) {
      case "month":
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        return recordDateObj >= monthAgo
      case "quarter":
        const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
        return recordDateObj >= quarterAgo
      case "year":
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
        return recordDateObj >= yearAgo
      default:
        return true
    }
  }

  const filteredAndSortedRecords = records
    .filter((record) => {
      const matchesSearch =
        record.cattleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.cattleBreed.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCattle = filterCattle === "all" || record.cattleId === filterCattle
      const matchesDateRange = getDateRangeFilter(filterDateRange, record.weightDate)

      return matchesSearch && matchesCattle && matchesDateRange
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.weightDate).getTime() - new Date(a.weightDate).getTime()
        case "date-asc":
          return new Date(a.weightDate).getTime() - new Date(b.weightDate).getTime()
        case "weight-desc":
          return b.weightKg - a.weightKg
        case "weight-asc":
          return a.weightKg - b.weightKg
        case "change-desc":
          return (b.weightChange || 0) - (a.weightChange || 0)
        case "change-asc":
          return (a.weightChange || 0) - (b.weightChange || 0)
        case "cattle":
          return a.cattleName.localeCompare(b.cattleName)
        default:
          return 0
      }
    })

  const calculateStats = () => {
    if (filteredAndSortedRecords.length === 0) return null

    const totalRecords = filteredAndSortedRecords.length
    const averageWeight = filteredAndSortedRecords.reduce((sum, record) => sum + record.weightKg, 0) / totalRecords
    const maxWeight = Math.max(...filteredAndSortedRecords.map((r) => r.weightKg))
    const minWeight = Math.min(...filteredAndSortedRecords.map((r) => r.weightKg))

    const recordsWithChange = filteredAndSortedRecords.filter((r) => r.weightChange !== undefined)
    const averageChange =
      recordsWithChange.length > 0
        ? recordsWithChange.reduce((sum, r) => sum + (r.weightChange || 0), 0) / recordsWithChange.length
        : 0

    const positiveChanges = recordsWithChange.filter((r) => (r.weightChange || 0) > 0).length
    const negativeChanges = recordsWithChange.filter((r) => (r.weightChange || 0) < 0).length

    return {
      totalRecords,
      averageWeight: averageWeight.toFixed(1),
      maxWeight: maxWeight.toFixed(1),
      minWeight: minWeight.toFixed(1),
      averageChange: averageChange.toFixed(1),
      positiveChanges,
      negativeChanges,
    }
  }

  const stats = calculateStats()

  const getWeightChangeIcon = (change?: number) => {
    if (!change || Math.abs(change) < 2) return { icon: Minus, color: "text-gray-500" }
    if (change > 0) return { icon: TrendingUp, color: "text-green-600" }
    return { icon: TrendingDown, color: "text-red-600" }
  }

  const getWeightStatus = (weight: number, breed: string) => {
    const ranges: Record<string, { min: number; max: number }> = {
      Holstein: { min: 550, max: 750 },
      Jersey: { min: 350, max: 450 },
      Angus: { min: 500, max: 700 },
      Brahman: { min: 450, max: 650 },
      Charolais: { min: 600, max: 800 },
      Hereford: { min: 500, max: 700 },
    }

    const range = ranges[breed] || { min: 400, max: 700 }

    if (weight < range.min) return { status: "Bajo", color: "text-orange-600" }
    if (weight > range.max) return { status: "Alto", color: "text-orange-600" }
    return { status: "Normal", color: "text-green-600" }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Weight className="w-5 h-5" />
            Historial de Peso
          </CardTitle>
          <CardDescription>Registro completo de {records.length} mediciones de peso del ganado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por vaca o raza..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={filterCattle} onValueChange={setFilterCattle}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por vaca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las vacas</SelectItem>
                  {cattle.map((cow) => (
                    <SelectItem key={cow.id} value={cow.id}>
                      {cow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                  <SelectItem value="year">Último año</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Fecha (más reciente)</SelectItem>
                  <SelectItem value="date-asc">Fecha (más antigua)</SelectItem>
                  <SelectItem value="weight-desc">Peso (mayor)</SelectItem>
                  <SelectItem value="weight-asc">Peso (menor)</SelectItem>
                  <SelectItem value="change-desc">Cambio (mayor)</SelectItem>
                  <SelectItem value="change-asc">Cambio (menor)</SelectItem>
                  <SelectItem value="cattle">Nombre de vaca</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalRecords}</div>
                <div className="text-xs text-muted-foreground">Registros</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.averageWeight}kg</div>
                <div className="text-xs text-muted-foreground">Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.maxWeight}kg</div>
                <div className="text-xs text-muted-foreground">Máximo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.minWeight}kg</div>
                <div className="text-xs text-muted-foreground">Mínimo</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold">{Math.abs(Number(stats.averageChange))}kg</span>
                  {Number(stats.averageChange) > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : Number(stats.averageChange) < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Cambio Prom.</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.positiveChanges}</div>
                <div className="text-xs text-muted-foreground">Aumentos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.negativeChanges}</div>
                <div className="text-xs text-muted-foreground">Pérdidas</div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {filteredAndSortedRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Weight className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron registros de peso que coincidan con los filtros seleccionados.</p>
              </div>
            ) : (
              filteredAndSortedRecords.map((record) => {
                const changeIcon = getWeightChangeIcon(record.weightChange)
                const ChangeIcon = changeIcon.icon
                const weightStatus = getWeightStatus(record.weightKg, record.cattleBreed)

                return (
                  <div key={record.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">{record.cattleName}</h3>
                          <Badge variant="outline">{record.cattleBreed}</Badge>
                          <Badge variant="secondary" className="font-mono">
                            {record.weightKg} kg
                          </Badge>
                          <Badge variant="outline" className={weightStatus.color}>
                            {weightStatus.status}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(record.weightDate).toLocaleDateString("es-ES", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                            <span className="text-sm font-medium">Peso Actual</span>
                            <span className="font-bold text-lg">{record.weightKg} kg</span>
                          </div>

                          {record.previousWeight && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <span className="text-sm font-medium">Peso Anterior</span>
                              <span className="font-bold">{record.previousWeight} kg</span>
                            </div>
                          )}

                          {record.weightChange !== undefined && (
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                              <span className="text-sm font-medium">Cambio</span>
                              <div className="flex items-center gap-1">
                                <ChangeIcon className={`w-4 h-4 ${changeIcon.color}`} />
                                <span className={`font-bold ${changeIcon.color}`}>
                                  {record.weightChange > 0 ? "+" : ""}
                                  {record.weightChange.toFixed(1)} kg
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {record.weightChange !== undefined && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-muted-foreground">Progreso de cambio</span>
                              <span className="text-sm font-medium">
                                {((Math.abs(record.weightChange) / record.weightKg) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={Math.min(100, (Math.abs(record.weightChange) / 50) * 100)}
                              className="h-2"
                            />
                          </div>
                        )}

                        {record.notes && (
                          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                            <strong>Observaciones:</strong> {record.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => onEdit(record)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onDelete(record.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
