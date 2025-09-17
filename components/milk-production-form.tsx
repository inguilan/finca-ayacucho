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
import { Save, X, Milk, Clock } from "lucide-react"

interface MilkProductionData {
  cattleId: string
  productionDate: string
  morningLiters: number
  afternoonLiters: number
  eveningLiters: number
  notes?: string
}

interface MilkProductionFormProps {
  cattle: Array<{ id: string; name: string; breed: string }>
  onSubmit: (data: MilkProductionData) => void
  onCancel: () => void
  initialData?: Partial<MilkProductionData>
  isEditing?: boolean
}

export function MilkProductionForm({
  cattle,
  onSubmit,
  onCancel,
  initialData = {},
  isEditing = false,
}: MilkProductionFormProps) {
  const [formData, setFormData] = useState<MilkProductionData>({
    cattleId: initialData.cattleId || "",
    productionDate: initialData.productionDate || new Date().toISOString().split("T")[0],
    morningLiters: initialData.morningLiters || 0,
    afternoonLiters: initialData.afternoonLiters || 0,
    eveningLiters: initialData.eveningLiters || 0,
    notes: initialData.notes || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.cattleId) {
      newErrors.cattleId = "Debe seleccionar una vaca"
    }

    if (!formData.productionDate) {
      newErrors.productionDate = "La fecha es obligatoria"
    } else {
      const productionDate = new Date(formData.productionDate)
      const today = new Date()
      today.setHours(23, 59, 59, 999) // Set to end of today
      if (productionDate > today) {
        newErrors.productionDate = "La fecha no puede ser futura"
      }
    }

    if (formData.morningLiters < 0 || formData.morningLiters > 50) {
      newErrors.morningLiters = "La producción matutina debe estar entre 0 y 50 litros"
    }

    if (formData.afternoonLiters < 0 || formData.afternoonLiters > 50) {
      newErrors.afternoonLiters = "La producción vespertina debe estar entre 0 y 50 litros"
    }

    if (formData.eveningLiters < 0 || formData.eveningLiters > 50) {
      newErrors.eveningLiters = "La producción nocturna debe estar entre 0 y 50 litros"
    }

    const totalProduction = formData.morningLiters + formData.afternoonLiters + formData.eveningLiters
    if (totalProduction === 0) {
      newErrors.total = "Debe registrar al menos alguna producción"
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

  const handleInputChange = (field: keyof MilkProductionData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const totalProduction = formData.morningLiters + formData.afternoonLiters + formData.eveningLiters
  const selectedCattle = cattle.find((c) => c.id === formData.cattleId)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Milk className="w-5 h-5" />
          {isEditing ? "Editar Producción de Leche" : "Registrar Producción de Leche"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifica el registro de producción seleccionado"
            : "Registra la producción diaria de leche por ordeño"}
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
                  {cattle.map((cow) => (
                    <SelectItem key={cow.id} value={cow.id}>
                      {cow.name} - {cow.breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cattleId && <p className="text-sm text-red-500">{errors.cattleId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="productionDate">Fecha de Producción *</Label>
              <Input
                id="productionDate"
                type="date"
                value={formData.productionDate}
                onChange={(e) => handleInputChange("productionDate", e.target.value)}
                className={errors.productionDate ? "border-red-500" : ""}
              />
              {errors.productionDate && <p className="text-sm text-red-500">{errors.productionDate}</p>}
            </div>
          </div>

          {selectedCattle && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{selectedCattle.name}</Badge>
                <span className="text-muted-foreground">Raza: {selectedCattle.breed}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">Registro por Ordeño</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="morningLiters" className="flex items-center gap-2">
                  🌅 Ordeño Matutino (Litros)
                </Label>
                <Input
                  id="morningLiters"
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={formData.morningLiters || ""}
                  onChange={(e) => handleInputChange("morningLiters", e.target.value ? Number(e.target.value) : 0)}
                  placeholder="0.0"
                  className={errors.morningLiters ? "border-red-500" : ""}
                />
                {errors.morningLiters && <p className="text-sm text-red-500">{errors.morningLiters}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="afternoonLiters" className="flex items-center gap-2">
                  ☀️ Ordeño Vespertino (Litros)
                </Label>
                <Input
                  id="afternoonLiters"
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={formData.afternoonLiters || ""}
                  onChange={(e) => handleInputChange("afternoonLiters", e.target.value ? Number(e.target.value) : 0)}
                  placeholder="0.0"
                  className={errors.afternoonLiters ? "border-red-500" : ""}
                />
                {errors.afternoonLiters && <p className="text-sm text-red-500">{errors.afternoonLiters}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="eveningLiters" className="flex items-center gap-2">
                  🌙 Ordeño Nocturno (Litros)
                </Label>
                <Input
                  id="eveningLiters"
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={formData.eveningLiters || ""}
                  onChange={(e) => handleInputChange("eveningLiters", e.target.value ? Number(e.target.value) : 0)}
                  placeholder="0.0"
                  className={errors.eveningLiters ? "border-red-500" : ""}
                />
                {errors.eveningLiters && <p className="text-sm text-red-500">{errors.eveningLiters}</p>}
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total del Día:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {totalProduction.toFixed(1)} L
                  </Badge>
                </div>
              </div>
              {totalProduction > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Distribución: {formData.morningLiters}L + {formData.afternoonLiters}L + {formData.eveningLiters}L
                </div>
              )}
            </div>

            {errors.total && <p className="text-sm text-red-500">{errors.total}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observaciones (Opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Notas sobre la calidad de la leche, comportamiento de la vaca, etc."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "Guardar Cambios" : "Registrar Producción"}
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
