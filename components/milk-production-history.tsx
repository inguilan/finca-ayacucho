"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Search, Edit, Trash2, Calendar, TrendingUp, TrendingDown, Milk } from "lucide-react"

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

interface MilkProductionHistoryProps {
  records: MilkProductionRecord[]
  cattle: Array<{ id: string; name: string; breed: string }>
  onEdit: (record: MilkProductionRecord) => void
  onDelete: (id: string) => void
}

export function MilkProductionHistory({ records, cattle, onEdit, onDelete }: MilkProductionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCattle, setFilterCattle] = useState("all")
  const [filterDateRange, setFilterDateRange] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")

  const getDateRangeFilter = (dateRange: string, recordDate: string): boolean => {
    const today = new Date()
    const recordDateObj = new Date(recordDate)

    switch (dateRange) {
      case "today":
        return recordDateObj.toDateString() === today.toDateString()
      case "week":
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return recordDateObj >= weekAgo
      case "month":
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        return recordDateObj >= monthAgo
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
      const matchesDateRange = getDateRangeFilter(filterDateRange, record.productionDate)

      return matchesSearch && matchesCattle && matchesDateRange
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.productionDate).getTime() - new Date(a.productionDate).getTime()
        case "date-asc":
          return new Date(a.productionDate).getTime() - new Date(b.productionDate).getTime()
        case "production-desc":
          return b.totalLiters - a.totalLiters
        case "production-asc":
          return a.totalLiters - b.totalLiters
        case "cattle":
          return a.cattleName.localeCompare(b.cattleName)
        default:
          return 0
      }
    })

  const calculateStats = () => {
    if (filteredAndSortedRecords.length === 0) return null

    const totalProduction = filteredAndSortedRecords.reduce((sum, record) => sum + record.totalLiters, 0)
    const averageProduction = totalProduction / filteredAndSortedRecords.length
    const maxProduction = Math.max(...filteredAndSortedRecords.map((r) => r.totalLiters))
    const minProduction = Math.min(...filteredAndSortedRecords.map((r) => r.totalLiters))

    // Calculate trend (comparing first half vs second half of records)
    const midPoint = Math.floor(filteredAndSortedRecords.length / 2)
    const firstHalf = filteredAndSortedRecords.slice(0, midPoint)
    const secondHalf = filteredAndSortedRecords.slice(midPoint)

    const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.totalLiters, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.totalLiters, 0) / secondHalf.length
    const trend = secondHalfAvg - firstHalfAvg

    return {
      totalProduction: totalProduction.toFixed(1),
      averageProduction: averageProduction.toFixed(1),
      maxProduction: maxProduction.toFixed(1),
      minProduction: minProduction.toFixed(1),
      trend: trend.toFixed(1),
      recordCount: filteredAndSortedRecords.length,
    }
  }

  const stats = calculateStats()

  const getProductionColor = (production: number, average: number) => {
    if (production >= average * 1.1) return "text-green-600"
    if (production <= average * 0.9) return "text-red-600"
    return "text-yellow-600"
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Milk className="w-5 h-5" />
            Historial de Producción de Leche
          </CardTitle>
          <CardDescription>Registro completo de {records.length} entradas de producción de leche</CardDescription>
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
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Fecha (más reciente)</SelectItem>
                  <SelectItem value="date-asc">Fecha (más antigua)</SelectItem>
                  <SelectItem value="production-desc">Producción (mayor)</SelectItem>
                  <SelectItem value="production-asc">Producción (menor)</SelectItem>
                  <SelectItem value="cattle">Nombre de vaca</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalProduction}L</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.averageProduction}L</div>
                <div className="text-xs text-muted-foreground">Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.maxProduction}L</div>
                <div className="text-xs text-muted-foreground">Máximo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.minProduction}L</div>
                <div className="text-xs text-muted-foreground">Mínimo</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold">{Math.abs(Number(stats.trend))}L</span>
                  {Number(stats.trend) > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Tendencia</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.recordCount}</div>
                <div className="text-xs text-muted-foreground">Registros</div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {filteredAndSortedRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Milk className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron registros de producción que coincidan con los filtros seleccionados.</p>
              </div>
            ) : (
              filteredAndSortedRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg">{record.cattleName}</h3>
                        <Badge variant="outline">{record.cattleBreed}</Badge>
                        <Badge
                          variant="secondary"
                          className={`${getProductionColor(record.totalLiters, Number(stats?.averageProduction || 0))}`}
                        >
                          {record.totalLiters.toFixed(1)}L
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(record.productionDate).toLocaleDateString("es-ES", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                          <span className="text-sm font-medium">🌅 Mañana</span>
                          <span className="font-bold">{record.morningLiters.toFixed(1)}L</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <span className="text-sm font-medium">☀️ Tarde</span>
                          <span className="font-bold">{record.afternoonLiters.toFixed(1)}L</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm font-medium">🌙 Noche</span>
                          <span className="font-bold">{record.eveningLiters.toFixed(1)}L</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Progreso del día</span>
                          <span className="text-sm font-medium">{record.totalLiters.toFixed(1)}L</span>
                        </div>
                        <Progress value={(record.totalLiters / 40) * 100} className="h-2" />
                      </div>

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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
