"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  Pill,
  Stethoscope,
  Calendar,
  DollarSign,
  User,
  Edit,
  Trash2,
  Search,
  Filter,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface MedicalObservation {
  id: string
  cattleId: string
  cattleName: string
  date: Date
  type: "enfermedad" | "tratamiento" | "vacunacion" | "revision" | "otro"
  severity: "leve" | "moderada" | "grave"
  symptoms: string
  diagnosis: string
  treatment: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  nextCheckup?: Date
  veterinarian: string
  cost: number
  notes: string
  status: "activo" | "completado" | "suspendido"
}

interface MedicalHistoryProps {
  observations: MedicalObservation[]
  onEdit: (observation: MedicalObservation) => void
  onDelete: (id: string) => void
  cattleList: Array<{ id: string; name: string }>
}

export function MedicalHistory({ observations, onEdit, onDelete, cattleList }: MedicalHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCattle, setFilterCattle] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")

  const filteredObservations = observations.filter((obs) => {
    const matchesSearch =
      obs.cattleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.medication.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCattle = filterCattle === "all" || obs.cattleId === filterCattle
    const matchesType = filterType === "all" || obs.type === filterType
    const matchesStatus = filterStatus === "all" || obs.status === filterStatus
    const matchesSeverity = filterSeverity === "all" || obs.severity === filterSeverity

    return matchesSearch && matchesCattle && matchesType && matchesStatus && matchesSeverity
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "enfermedad":
        return <AlertTriangle className="h-4 w-4" />
      case "tratamiento":
        return <Pill className="h-4 w-4" />
      case "vacunacion":
        return <Stethoscope className="h-4 w-4" />
      default:
        return <Stethoscope className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "enfermedad":
        return "bg-red-100 text-red-800"
      case "tratamiento":
        return "bg-blue-100 text-blue-800"
      case "vacunacion":
        return "bg-green-100 text-green-800"
      case "revision":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "leve":
        return "bg-green-100 text-green-800"
      case "moderada":
        return "bg-yellow-100 text-yellow-800"
      case "grave":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activo":
        return "bg-blue-100 text-blue-800"
      case "completado":
        return "bg-green-100 text-green-800"
      case "suspendido":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Estadísticas
  const totalCost = observations.reduce((sum, obs) => sum + obs.cost, 0)
  const activeObservations = observations.filter((obs) => obs.status === "activo").length
  const upcomingCheckups = observations.filter(
    (obs) =>
      obs.nextCheckup &&
      obs.nextCheckup > new Date() &&
      obs.nextCheckup <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  ).length

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Observaciones</p>
                <p className="text-2xl font-bold">{observations.length}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tratamientos Activos</p>
                <p className="text-2xl font-bold text-blue-600">{activeObservations}</p>
              </div>
              <Pill className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revisiones Próximas</p>
                <p className="text-2xl font-bold text-orange-600">{upcomingCheckups}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Costo Total</p>
                <p className="text-2xl font-bold text-green-600">${totalCost.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar observaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterCattle} onValueChange={setFilterCattle}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por vaca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las vacas</SelectItem>
                {cattleList.map((cattle) => (
                  <SelectItem key={cattle.id} value={cattle.id}>
                    {cattle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="revision">Revisión</SelectItem>
                <SelectItem value="enfermedad">Enfermedad</SelectItem>
                <SelectItem value="tratamiento">Tratamiento</SelectItem>
                <SelectItem value="vacunacion">Vacunación</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="suspendido">Suspendido</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Severidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las severidades</SelectItem>
                <SelectItem value="leve">Leve</SelectItem>
                <SelectItem value="moderada">Moderada</SelectItem>
                <SelectItem value="grave">Grave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Observaciones */}
      <div className="space-y-4">
        {filteredObservations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron observaciones médicas</p>
            </CardContent>
          </Card>
        ) : (
          filteredObservations.map((observation) => (
            <Card key={observation.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(observation.type)}
                      <h3 className="font-semibold text-lg">{observation.cattleName}</h3>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getTypeColor(observation.type)}>{observation.type}</Badge>
                      <Badge className={getSeverityColor(observation.severity)}>{observation.severity}</Badge>
                      <Badge className={getStatusColor(observation.status)}>{observation.status}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(observation)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(observation.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                    <p className="text-sm">{format(observation.date, "PPP", { locale: es })}</p>
                  </div>
                  {observation.veterinarian && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Veterinario</p>
                      <p className="text-sm flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {observation.veterinarian}
                      </p>
                    </div>
                  )}
                  {observation.cost > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Costo</p>
                      <p className="text-sm flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />${observation.cost.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {observation.nextCheckup && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Próxima Revisión</p>
                      <p className="text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(observation.nextCheckup, "PPP", { locale: es })}
                      </p>
                    </div>
                  )}
                </div>

                {observation.symptoms && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground">Síntomas</p>
                    <p className="text-sm">{observation.symptoms}</p>
                  </div>
                )}

                {observation.diagnosis && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground">Diagnóstico</p>
                    <p className="text-sm">{observation.diagnosis}</p>
                  </div>
                )}

                {observation.treatment && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground">Tratamiento</p>
                    <p className="text-sm">{observation.treatment}</p>
                  </div>
                )}

                {observation.medication && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Medicamento</p>
                      <p className="text-sm">{observation.medication}</p>
                    </div>
                    {observation.dosage && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Dosis</p>
                        <p className="text-sm">{observation.dosage}</p>
                      </div>
                    )}
                    {observation.frequency && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Frecuencia</p>
                        <p className="text-sm">{observation.frequency}</p>
                      </div>
                    )}
                    {observation.duration && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Duración</p>
                        <p className="text-sm">{observation.duration}</p>
                      </div>
                    )}
                  </div>
                )}

                {observation.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Notas</p>
                    <p className="text-sm">{observation.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
