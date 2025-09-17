"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, AlertTriangle, Pill, Stethoscope } from "lucide-react"
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

interface MedicalObservationsFormProps {
  onSubmit: (observation: Omit<MedicalObservation, "id">) => void
  cattleList: Array<{ id: string; name: string }>
  editingObservation?: MedicalObservation
}

export function MedicalObservationsForm({ onSubmit, cattleList, editingObservation }: MedicalObservationsFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(editingObservation?.date || new Date())
  const [nextCheckupDate, setNextCheckupDate] = useState<Date | undefined>(editingObservation?.nextCheckup)
  const [formData, setFormData] = useState({
    cattleId: editingObservation?.cattleId || "",
    type: editingObservation?.type || ("revision" as const),
    severity: editingObservation?.severity || ("leve" as const),
    symptoms: editingObservation?.symptoms || "",
    diagnosis: editingObservation?.diagnosis || "",
    treatment: editingObservation?.treatment || "",
    medication: editingObservation?.medication || "",
    dosage: editingObservation?.dosage || "",
    frequency: editingObservation?.frequency || "",
    duration: editingObservation?.duration || "",
    veterinarian: editingObservation?.veterinarian || "",
    cost: editingObservation?.cost || 0,
    notes: editingObservation?.notes || "",
    status: editingObservation?.status || ("activo" as const),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedCattle = cattleList.find((c) => c.id === formData.cattleId)

    onSubmit({
      cattleId: formData.cattleId,
      cattleName: selectedCattle?.name || "",
      date: selectedDate,
      type: formData.type,
      severity: formData.severity,
      symptoms: formData.symptoms,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      medication: formData.medication,
      dosage: formData.dosage,
      frequency: formData.frequency,
      duration: formData.duration,
      nextCheckup: nextCheckupDate,
      veterinarian: formData.veterinarian,
      cost: formData.cost,
      notes: formData.notes,
      status: formData.status,
    })

    // Reset form
    setFormData({
      cattleId: "",
      type: "revision",
      severity: "leve",
      symptoms: "",
      diagnosis: "",
      treatment: "",
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      veterinarian: "",
      cost: 0,
      notes: "",
      status: "activo",
    })
    setSelectedDate(new Date())
    setNextCheckupDate(undefined)
  }

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          {editingObservation ? "Editar Observación Médica" : "Nueva Observación Médica"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cattle">Vaca</Label>
              <Select
                value={formData.cattleId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, cattleId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar vaca" />
                </SelectTrigger>
                <SelectContent>
                  {cattleList.map((cattle) => (
                    <SelectItem key={cattle.id} value={cattle.id}>
                      {cattle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Observación</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revision">Revisión General</SelectItem>
                  <SelectItem value="enfermedad">Enfermedad</SelectItem>
                  <SelectItem value="tratamiento">Tratamiento</SelectItem>
                  <SelectItem value="vacunacion">Vacunación</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severidad</Label>
              <Select
                value={formData.severity}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, severity: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderada">Moderada</SelectItem>
                  <SelectItem value="grave">Grave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symptoms">Síntomas Observados</Label>
              <Textarea
                id="symptoms"
                value={formData.symptoms}
                onChange={(e) => setFormData((prev) => ({ ...prev, symptoms: e.target.value }))}
                placeholder="Describe los síntomas observados..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnóstico</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) => setFormData((prev) => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Diagnóstico del veterinario..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment">Tratamiento Aplicado</Label>
              <Textarea
                id="treatment"
                value={formData.treatment}
                onChange={(e) => setFormData((prev) => ({ ...prev, treatment: e.target.value }))}
                placeholder="Describe el tratamiento aplicado..."
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medication">Medicamento</Label>
              <Input
                id="medication"
                value={formData.medication}
                onChange={(e) => setFormData((prev) => ({ ...prev, medication: e.target.value }))}
                placeholder="Nombre del medicamento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">Dosis</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData((prev) => ({ ...prev, dosage: e.target.value }))}
                placeholder="ej: 10ml, 2 pastillas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frecuencia</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData((prev) => ({ ...prev, frequency: e.target.value }))}
                placeholder="ej: cada 8 horas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duración</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                placeholder="ej: 7 días"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="veterinarian">Veterinario</Label>
              <Input
                id="veterinarian"
                value={formData.veterinarian}
                onChange={(e) => setFormData((prev) => ({ ...prev, veterinarian: e.target.value }))}
                placeholder="Nombre del veterinario"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Costo (USD)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData((prev) => ({ ...prev, cost: Number.parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Próxima Revisión</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextCheckupDate ? format(nextCheckupDate, "PPP", { locale: es }) : "Seleccionar fecha (opcional)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={nextCheckupDate} onSelect={setNextCheckupDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="suspendido">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Observaciones adicionales, recomendaciones, etc..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            {editingObservation ? "Actualizar Observación" : "Registrar Observación"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
