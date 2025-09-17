"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CattleFormData {
  name: string
  breed: string
  birthDate: string
  gender: "female" | "male"
  pregnancyDueDate?: string
  initialWeight?: number
  notes?: string
}

interface CattleRegistrationFormProps {
  onSubmit: (data: CattleFormData) => void
  onCancel: () => void
  initialData?: Partial<CattleFormData>
  isEditing?: boolean
}

const commonBreeds = [
  "Holstein",
  "Jersey",
  "Angus",
  "Brahman",
  "Charolais",
  "Hereford",
  "Simmental",
  "Limousin",
  "Gyr",
  "Nelore",
  "Criollo",
  "Otra",
]

export function CattleRegistrationForm({
  onSubmit,
  onCancel,
  initialData = {},
  isEditing = false,
}: CattleRegistrationFormProps) {
  const [formData, setFormData] = useState<CattleFormData>({
    name: initialData.name || "",
    breed: initialData.breed || "",
    birthDate: initialData.birthDate || "",
    gender: initialData.gender || "female",
    pregnancyDueDate: initialData.pregnancyDueDate || "",
    initialWeight: initialData.initialWeight || undefined,
    notes: initialData.notes || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }

    if (!formData.breed) {
      newErrors.breed = "La raza es obligatoria"
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "La fecha de nacimiento es obligatoria"
    } else {
      const birthDate = new Date(formData.birthDate)
      const today = new Date()
      if (birthDate > today) {
        newErrors.birthDate = "La fecha de nacimiento no puede ser futura"
      }
    }

    if (formData.pregnancyDueDate) {
      const dueDate = new Date(formData.pregnancyDueDate)
      const today = new Date()
      if (dueDate <= today) {
        newErrors.pregnancyDueDate = "La fecha de parto debe ser futura"
      }
    }

    if (formData.initialWeight && (formData.initialWeight < 50 || formData.initialWeight > 1000)) {
      newErrors.initialWeight = "El peso debe estar entre 50 y 1000 kg"
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

  const handleInputChange = (field: keyof CattleFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return ""
    const birth = new Date(birthDate)
    const today = new Date()
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())

    if (ageInMonths < 12) {
      return `${ageInMonths} meses`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      return months > 0 ? `${years} años, ${months} meses` : `${years} años`
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{isEditing ? "Editar Vaca" : "Registrar Nueva Vaca"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifica la información de la vaca seleccionada"
            : "Completa la información básica para registrar una nueva vaca en el sistema"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Vaca *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ej: Bella, Luna, Estrella"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Raza *</Label>
              <Select value={formData.breed} onValueChange={(value) => handleInputChange("breed", value)}>
                <SelectTrigger className={errors.breed ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecciona la raza" />
                </SelectTrigger>
                <SelectContent>
                  {commonBreeds.map((breed) => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.breed && <p className="text-sm text-red-500">{errors.breed}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                className={errors.birthDate ? "border-red-500" : ""}
              />
              {formData.birthDate && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Edad: {calculateAge(formData.birthDate)}
                  </Badge>
                </div>
              )}
              {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Género *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: "female" | "male") => handleInputChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Hembra</SelectItem>
                  <SelectItem value="male">Macho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pregnancyDueDate">Fecha de Parto Esperada (Opcional)</Label>
              <Input
                id="pregnancyDueDate"
                type="date"
                value={formData.pregnancyDueDate}
                onChange={(e) => handleInputChange("pregnancyDueDate", e.target.value)}
                className={errors.pregnancyDueDate ? "border-red-500" : ""}
                disabled={formData.gender === "male"}
              />
              {formData.gender === "male" && <p className="text-xs text-muted-foreground">No aplica para machos</p>}
              {errors.pregnancyDueDate && <p className="text-sm text-red-500">{errors.pregnancyDueDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialWeight">Peso Inicial (kg) (Opcional)</Label>
              <Input
                id="initialWeight"
                type="number"
                min="50"
                max="1000"
                value={formData.initialWeight || ""}
                onChange={(e) => handleInputChange("initialWeight", e.target.value ? Number(e.target.value) : "")}
                placeholder="Ej: 450"
                className={errors.initialWeight ? "border-red-500" : ""}
              />
              {errors.initialWeight && <p className="text-sm text-red-500">{errors.initialWeight}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Información adicional sobre la vaca (origen, características especiales, etc.)"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "Guardar Cambios" : "Registrar Vaca"}
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
