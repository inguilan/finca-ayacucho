"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Edit, Eye, Heart, Milk, MoreVertical, Search, Trash2, Weight } from "lucide-react"
import { useState } from "react"

interface Cattle {
  id: string
  name: string
  breed: string
  birthDate: string
  gender: "female" | "male"
  pregnancyDueDate?: string
  lastWeightDate: string
  lastWeight: number
  todayMilkProduction: number
  averageMilkProduction: number
  healthStatus: "healthy" | "sick" | "treatment"
  observations: string[]
  notes?: string
}

interface CattleListProps {
  cattle: Cattle[]
  onEdit: (cattle: Cattle) => void
  onDelete: (id: string) => void
  onViewDetails: (cattle: Cattle) => void
}

export function CattleList({ cattle, onEdit, onDelete, onViewDetails }: CattleListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBreed, setFilterBreed] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate)
    const today = new Date()
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())

    if (ageInMonths < 12) {
      return `${ageInMonths}m`
    } else {
      const years = Math.floor(ageInMonths / 12)
      return `${years}a`
    }
  }

  const getDaysUntilBirth = (dueDate: string): number => {
    const due = new Date(dueDate)
    const today = new Date()
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "default"
      case "sick":
        return "destructive"
      case "treatment":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case "healthy":
        return "Saludable"
      case "sick":
        return "Enferma"
      case "treatment":
        return "Tratamiento"
      default:
        return "Desconocido"
    }
  }

  const filteredAndSortedCattle = cattle
    .filter((cow) => {
      const matchesSearch =
        cow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cow.breed.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBreed = filterBreed === "all" || cow.breed === filterBreed
      const matchesStatus = filterStatus === "all" || cow.healthStatus === filterStatus

      return matchesSearch && matchesBreed && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "age":
          return new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime()
        case "production":
          return b.todayMilkProduction - a.todayMilkProduction
        case "weight":
          return b.lastWeight - a.lastWeight
        default:
          return 0
      }
    })

  const breeds = Array.from(new Set(cattle.map((cow) => cow.breed)))

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Ganado</CardTitle>
          <CardDescription>Lista completa de {cattle.length} vacas registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o raza..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={filterBreed} onValueChange={setFilterBreed}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por raza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las razas</SelectItem>
                  {breeds.map((breed) => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado de salud" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="healthy">Saludables</SelectItem>
                  <SelectItem value="sick">Enfermas</SelectItem>
                  <SelectItem value="treatment">En tratamiento</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="age">Edad</SelectItem>
                  <SelectItem value="production">Producción</SelectItem>
                  <SelectItem value="weight">Peso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAndSortedCattle.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No se encontraron vacas que coincidan con los filtros seleccionados.</p>
              </div>
            ) : (
              filteredAndSortedCattle.map((cow) => (
                <div key={cow.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg">{cow.name}</h3>
                        <Badge variant={getHealthStatusColor(cow.healthStatus) as any}>
                          {getHealthStatusText(cow.healthStatus)}
                        </Badge>
                        {cow.pregnancyDueDate && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {getDaysUntilBirth(cow.pregnancyDueDate)}d para parto
                          </Badge>
                        )}
                        <Badge variant="outline">{calculateAge(cow.birthDate)}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Raza:</span>
                          <span className="font-medium">{cow.breed}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Weight className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{cow.lastWeight}kg</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Milk className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{cow.todayMilkProduction}L hoy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Promedio:</span>
                          <span className="font-medium">{cow.averageMilkProduction}L</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Género:</span>
                          <span className="font-medium">{cow.gender === "female" ? "Hembra" : "Macho"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{new Date(cow.birthDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {cow.observations && cow.observations.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Última observación: {cow.observations[cow.observations.length - 1]}
                          </span>
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(cow)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(cow)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(cow.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
