"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, X, Weight, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { parseYMDToDate } from '@/lib/utils'

interface WeightRecordData {
  cattleId: string
  weightDate: string
  weightKg: number
  notes?: string
}

interface WeightRecordFormProps {
  cattle: Array<{ id: string; name: string; breed: string; lastWeight: number; lastWeightDate: string }>
  onSubmit: (data: WeightRecordData) => void
  onCancel: () => void
  initialData?: Partial<WeightRecordData>
  isEditing?: boolean
}

export function WeightRecordForm({
  cattle,
  onSubmit,
  onCancel,
  initialData = {},
  isEditing = false,
}: WeightRecordFormProps) {
  const [formData, setFormData] = useState<WeightRecordData>({
    cattleId: initialData.cattleId || "",
    weightDate: initialData.weightDate || new Date().toISOString().split("T")[0],
    weightKg: initialData.weightKg || 0,
    notes: initialData.notes || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.cattleId) {
      newErrors.cattleId = "Debe seleccionar una vaca"
    }

    if (!formData.weightDate) {
      newErrors.weightDate = "La fecha es obligatoria"
    } else {
      const weightDate = parseYMDToDate(formData.weightDate)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      if (weightDate > today) {
        newErrors.weightDate = "La fecha no puede ser futura"
      }
    }

    if (!formData.weightKg || formData.weightKg <= 0) {
      newErrors.weightKg = "El peso debe ser mayor a 0"
    } else if (formData.weightKg < 50 || formData.weightKg > 1200) {
      newErrors.weightKg = "El peso debe estar entre 50 y 1200 kg"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: keyof WeightRecordData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const selectedCattle = cattle.find((c) => c.id === formData.cattleId)
  const weightDifference = selectedCattle && formData.weightKg ? formData.weightKg - selectedCattle.lastWeight : 0
  const weightChangePercentage =
    selectedCattle && formData.weightKg ? (weightDifference / selectedCattle.lastWeight) * 100 : 0

  const getDaysSinceLastWeight = (lastWeightDate: string): number => {
    const lastDate = parseYMDToDate(lastWeightDate)
    const today = new Date()
    return Math.ceil((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getWeightStatus = (difference: number) => {
    if (Math.abs(difference) < 5) return { icon: Minus, color: "text-gray-500", text: "Sin cambios significativos" }
    if (difference > 0) return { icon: TrendingUp, color: "text-green-600", text: "Aumento de peso" }
    return { icon: TrendingDown, color: "text-red-600", text: "Pérdida de peso" }
  }

  const getRecommendedWeightRange = (breed: string) => {
    const ranges: Record<string, { min: number; max: number }> = {
      Holstein: { min: 550, max: 750 },
      Jersey: { min: 350, max: 450 },
      Angus: { min: 500, max: 700 },
      Brahman: { min: 450, max: 650 },
      Charolais: { min: 600, max: 800 },
      Hereford: { min: 500, max: 700 },
    }
    return ranges[breed] || { min: 400, max: 700 }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Weight className="w-5 h-5" />
          {isEditing ? "Editar Registro de Peso" : "Registrar Peso de Vaca"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifica el registro de peso seleccionado"
            : "Registra el peso mensual de la vaca para seguimiento de crecimiento y salud"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cattleId">Vaca *</Label>
              <Select value={formData.cattleId} onValueChange={(value) => handleInputChange("cattleId", value)}>
                <SelectTrigger className={errors.cattleId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecciona la vaca" />
                </SelectTrigger>
                <SelectContent>
                  {cattle.map((cow) => {
                    const daysSinceLastWeight = getDaysSinceLastWeight(cow.lastWeightDate)
                    return (
                      <SelectItem key={cow.id} value={cow.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>
                            {cow.name} - {cow.breed}
                          </span>
                          {daysSinceLastWeight >= 30 && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              +{daysSinceLastWeight}d
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {errors.cattleId && <p className="text-sm text-red-500">{errors.cattleId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightDate">Fecha de Pesaje *</Label>
              <Input
                id="weightDate"
                type="date"
                value={formData.weightDate}
                onChange={(e) => handleInputChange("weightDate", e.target.value)}
                className={errors.weightDate ? "border-red-500" : ""}
              />
              {errors.weightDate && <p className="text-sm text-red-500">{errors.weightDate}</p>}
            </div>
          </div>

          {selectedCattle && (
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedCattle.name}</Badge>
                  <span className="text-sm text-muted-foreground">Raza: {selectedCattle.breed}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Último pesaje: {getDaysSinceLastWeight(selectedCattle.lastWeightDate)} días atrás
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-background rounded border">
                  <div className="text-sm text-muted-foreground">Peso Anterior</div>
                  <div className="text-xl font-bold">{selectedCattle.lastWeight} kg</div>
                  <div className="text-xs text-muted-foreground">
                    {parseYMDToDate(selectedCattle.lastWeightDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-3 bg-background rounded border">
                  <div className="text-sm text-muted-foreground">Rango Recomendado</div>
                  <div className="text-lg font-semibold">
                    {getRecommendedWeightRange(selectedCattle.breed).min} -{" "}
                    {getRecommendedWeightRange(selectedCattle.breed).max} kg
                  </div>
                  <div className="text-xs text-muted-foreground">Para raza {selectedCattle.breed}</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="weightKg">Peso Actual (kg) *</Label>
            <Input
              id="weightKg"
              type="number"
              min="50"
              max="1200"
              step="0.5"
              value={formData.weightKg || ""}
              onChange={(e) => handleInputChange("weightKg", e.target.value ? Number(e.target.value) : 0)}
              placeholder="Ej: 650.5"
              className={errors.weightKg ? "border-red-500" : ""}
            />
            {errors.weightKg && <p className="text-sm text-red-500">{errors.weightKg}</p>}
          </div>

          {selectedCattle && formData.weightKg > 0 && (
            <div className="p-4 bg-primary/5 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Análisis de Cambio de Peso</span>
                <div className="flex items-center gap-2">
                  {(() => {
                    const status = getWeightStatus(weightDifference)
                    const StatusIcon = status.icon
                    return (
                      <>
                        <StatusIcon className={`w-4 h-4 ${status.color}`} />
                        <span className={`text-sm font-medium ${status.color}`}>
                          {weightDifference > 0 ? "+" : ""}
                          {weightDifference.toFixed(1)} kg
                        </span>
                      </>
                    )
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cambio porcentual:</span>
                  <span
                    className={`ml-2 font-medium ${weightChangePercentage > 0 ? "text-green-600" : weightChangePercentage < 0 ? "text-red-600" : "text-gray-500"}`}
                  >
                    {weightChangePercentage > 0 ? "+" : ""}
                    {weightChangePercentage.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>
                  <span className={`ml-2 font-medium ${getWeightStatus(weightDifference).color}`}>
                    {getWeightStatus(weightDifference).text}
                  </span>
                </div>
              </div>

              {selectedCattle && (
                <div className="mt-3 text-xs text-muted-foreground">
                  {formData.weightKg < getRecommendedWeightRange(selectedCattle.breed).min && (
                    <div className="text-orange-600">⚠️ Peso por debajo del rango recomendado para la raza</div>
                  )}
                  {formData.weightKg > getRecommendedWeightRange(selectedCattle.breed).max && (
                    <div className="text-orange-600">⚠️ Peso por encima del rango recomendado para la raza</div>
                  )}
                  {Math.abs(weightDifference) > 50 && (
                    <div className="text-red-600">
                      🚨 Cambio de peso significativo - considerar revisión veterinaria
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observaciones (Opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Notas sobre el estado físico, condiciones del pesaje, etc."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "Guardar Cambios" : "Registrar Peso"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
