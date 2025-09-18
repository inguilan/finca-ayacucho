"use client"

import { CattleList } from "@/components/cattle-list"
import { CattleRegistrationForm } from "@/components/cattle-registration-form"
import { MedicalHistory } from "@/components/medical-history"
import { MedicalObservationsForm } from "@/components/medical-observations-form"
import { MilkProductionCharts } from "@/components/milk-production-charts"
import { MilkProductionForm } from "@/components/milk-production-form"
import { MilkProductionHistory } from "@/components/milk-production-history"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WeightEvolutionCharts } from "@/components/weight-evolution-charts"
import { WeightHistory } from "@/components/weight-history"
import { WeightRecordForm } from "@/components/weight-record-form"
import { useAuth } from '@/hooks/useAuth'
import { useCattle } from '@/hooks/useCattle'
import { useMilk } from '@/hooks/useMilk'
import { useWeight } from '@/hooks/useWeight'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  Cog as Cow,
  FileText,
  Heart,
  Milk,
  Plus,
  TrendingUp,
  Weight
} from "lucide-react"
import { useEffect, useState } from "react"

import { auth } from '@/lib/firebase'
import { addMedicalObservation, getAllMedicalObservations } from '@/lib/firestore'

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

interface DailyStats {
  date: string
  totalMilk: number
  cattleCount: number
  averageProduction: number
}

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

export default function CattleManagementDashboard() {
  const { cattle, addCattle: addCattleDb, updateCattle: updateCattleDb, removeCattle: removeCattleDb, refresh, error: cattleError, loading: cattleLoading } = useCattle()
  const { user, ready: authReady, error: authError } = useAuth()
  const { records: milkRecords, loading: milkLoading, error: milkError, add: addMilk, update: updateMilk, remove: removeMilk, refresh: refreshMilk } = useMilk()
  const { records: weightRecords, loading: weightLoading, error: weightError, add: addWeight, update: updateWeight, remove: removeWeight, refresh: refreshWeight } = useWeight()
  const [medicalObservations, setMedicalObservations] = useState<MedicalObservation[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [showMilkForm, setShowMilkForm] = useState(false)
  const [showWeightForm, setShowWeightForm] = useState(false)
  const [showMedicalForm, setShowMedicalForm] = useState(false)
  const [editingCattle, setEditingCattle] = useState<Cattle | null>(null)
  const [editingMilkRecord, setEditingMilkRecord] = useState<any | null>(null)
  const [editingWeightRecord, setEditingWeightRecord] = useState<any | null>(null)
  const [editingMedicalObservation, setEditingMedicalObservation] = useState<MedicalObservation | null>(null)

  useEffect(() => {
    if (cattleError) console.warn('[page] cattle hook error:', cattleError)
    if (authError) console.warn('[page] auth hook error:', authError)
    if (milkError) console.warn('[page] milk hook error:', milkError)
    if (weightError) console.warn('[page] weight hook error:', weightError)
  }, [cattleError, authError, milkError, weightError])

  // Load medical observations once
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const medical = await getAllMedicalObservations()
        if (!mounted) return
        setMedicalObservations(medical)
      } catch (e) {
        console.error('[page] error loading medical records', e)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleAddMilkProduction = async (formData: any) => {
    const selectedCattle = cattle.find((c) => c.id === formData.cattleId)
    if (!selectedCattle) return

    const payload = {
      cattleId: formData.cattleId,
      productionDate: formData.productionDate,
      morningLiters: formData.morningLiters,
      afternoonLiters: formData.afternoonLiters,
      eveningLiters: formData.eveningLiters,
      totalLiters: formData.morningLiters + formData.afternoonLiters + formData.eveningLiters,
      cattleName: selectedCattle.name,
      cattleBreed: selectedCattle.breed,
      notes: formData.notes || '',
      ownerId: auth.currentUser?.uid || (typeof window !== 'undefined' && (window as any).localStorage.getItem('uid')) || null,
    }

    try {
      const id = await addMilk(payload)
      // if id returned, no further action (onSnapshot will update local list)
      setShowMilkForm(false)

      const today = new Date().toISOString().split("T")[0]
      if (formData.productionDate === today) {
        updateCattleDb(formData.cattleId, { todayMilkProduction: payload.totalLiters }).catch((e) => console.error(e))
      }
    } catch (e) {
      console.error('[page] failed to persist milk record', e)
    }
  }

  const handleEditMilkProduction = (record: any) => {
    setEditingMilkRecord(record)
    setShowMilkForm(true)
  }

  const handleUpdateMilkProduction = async (formData: any) => {
    if (!editingMilkRecord) return

    const updated = {
      ...editingMilkRecord,
      productionDate: formData.productionDate,
      morningLiters: formData.morningLiters,
      afternoonLiters: formData.afternoonLiters,
      eveningLiters: formData.eveningLiters,
      totalLiters: formData.morningLiters + formData.afternoonLiters + formData.eveningLiters,
      notes: formData.notes,
    }

    try {
      await updateMilk(editingMilkRecord.id, updated)
      setEditingMilkRecord(null)
      setShowMilkForm(false)
    } catch (e) {
      console.error('[page] failed to update milk record', e)
    }
  }

  const handleDeleteMilkProduction = async (id: string) => {
    try {
      await removeMilk(id)
    } catch (e) {
      console.error('[page] failed to delete milk record', e)
    }
  }

  const handleCancelMilkForm = () => {
    setShowMilkForm(false)
    setEditingMilkRecord(null)
  }

  const handleAddWeightRecord = async (formData: any) => {
    const selectedCattle = cattle.find((c) => c.id === formData.cattleId)
    if (!selectedCattle) return

    const previousRecord = weightRecords
      .filter((r) => r.cattleId === formData.cattleId)
      .sort((a, b) => new Date(b.weightDate).getTime() - new Date(a.weightDate).getTime())[0]

    const payload = {
      cattleId: formData.cattleId,
      weightDate: formData.weightDate,
      weightKg: formData.weightKg,
      cattleName: selectedCattle.name,
      cattleBreed: selectedCattle.breed,
      notes: formData.notes || '',
      ownerId: auth.currentUser?.uid || (typeof window !== 'undefined' && (window as any).localStorage.getItem('uid')) || null,
    }

    try {
      const id = await addWeight(payload)
      setShowWeightForm(false)
      // Update cattle's last weight
      updateCattleDb(formData.cattleId, { lastWeight: formData.weightKg, lastWeightDate: formData.weightDate }).catch(
        (e) => console.error(e),
      )
    } catch (e) {
      console.error('[page] failed to persist weight record', e)
    }
  }

  const handleEditWeightRecord = (record: any) => {
    setEditingWeightRecord(record)
    setShowWeightForm(true)
  }

  const handleUpdateWeightRecord = async (formData: any) => {
    if (!editingWeightRecord) return

    const updated = {
      ...editingWeightRecord,
      weightDate: formData.weightDate,
      weightKg: formData.weightKg,
      notes: formData.notes,
    }

    try {
      await updateWeight(editingWeightRecord.id, updated)
      setEditingWeightRecord(null)
      setShowWeightForm(false)
    } catch (e) {
      console.error('[page] failed to update weight record', e)
    }
  }

  const handleDeleteWeightRecord = async (id: string) => {
    try {
      await removeWeight(id)
    } catch (e) {
      console.error('[page] failed to delete weight record', e)
    }
  }

  const handleCancelWeightForm = () => {
    setShowWeightForm(false)
    setEditingWeightRecord(null)
  }

  const handleAddCattle = (formData: any) => {
    const payload = {
      name: formData.name,
      breed: formData.breed,
      birthDate: formData.birthDate,
      gender: formData.gender,
      pregnancyDueDate: formData.pregnancyDueDate || null,
      lastWeightDate: new Date().toISOString().split("T")[0],
      lastWeight: formData.initialWeight || 0,
      todayMilkProduction: 0,
      averageMilkProduction: 0,
      healthStatus: "healthy",
      observations: [],
      notes: formData.notes || "",
    }

    addCattleDb(payload)
      .then(() => setShowRegistrationForm(false))
      .catch((e) => console.error(e))
  }

  const handleEditCattle = (cattle: Cattle) => {
    setEditingCattle(cattle)
    setShowRegistrationForm(true)
  }

  const handleUpdateCattle = (formData: any) => {
    if (!editingCattle) return

    const updatedCattle: Cattle = {
      ...editingCattle,
      name: formData.name,
      breed: formData.breed,
      birthDate: formData.birthDate,
      gender: formData.gender,
      pregnancyDueDate: formData.pregnancyDueDate || undefined,
      notes: formData.notes,
    }

    updateCattleDb(editingCattle.id, updatedCattle)
      .then(() => {
        setEditingCattle(null)
        setShowRegistrationForm(false)
      })
      .catch((e) => console.error(e))
  }

  const handleDeleteCattle = (id: string) => {
    removeCattleDb(id).catch((e) => console.error(e))
    // remove related records via hooks if available
    try {
      // remove milk records for this cattle
      if (typeof removeMilk === 'function') {
        // we don't know ids here; rely on snapshot to drop items when deleted elsewhere
      }
      if (typeof removeWeight === 'function') {
        // same as above
      }
    } catch (e) {
      // ignore
    }
    setMedicalObservations((prev) => prev.filter((obs) => obs.cattleId !== id))
  }

  const handleViewDetails = (cattle: Cattle) => {
    console.log("View details for:", cattle.name)
  }

  const handleCancelForm = () => {
    setShowRegistrationForm(false)
    setEditingCattle(null)
  }

  const handleAddMedicalObservation = async (formData: any) => {
    const newObservation: MedicalObservation = {
      id: Date.now().toString(),
      cattleId: formData.cattleId,
      cattleName: formData.cattleName,
      date: formData.date,
      type: formData.type,
      severity: formData.severity,
      symptoms: formData.symptoms,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      medication: formData.medication,
      dosage: formData.dosage,
      frequency: formData.frequency,
      duration: formData.duration,
      nextCheckup: formData.nextCheckup,
      veterinarian: formData.veterinarian,
      cost: formData.cost,
      notes: formData.notes,
      status: formData.status,
    }

    setMedicalObservations((prev) => [...prev, newObservation])
    setShowMedicalForm(false)

    const ownerId = auth.currentUser?.uid || (typeof window !== 'undefined' && (window as any).localStorage.getItem('uid'))
    try {
      const id = await addMedicalObservation({
        cattleId: newObservation.cattleId,
        date: newObservation.date,
        type: newObservation.type,
        severity: newObservation.severity,
        symptoms: newObservation.symptoms,
        diagnosis: newObservation.diagnosis,
        treatment: newObservation.treatment,
        veterinarian: newObservation.veterinarian,
        status: newObservation.status,
        notes: newObservation.notes || '',
        ownerId: ownerId || null,
      })
      setMedicalObservations((prev) => prev.map((r) => (r.id === newObservation.id ? { ...r, id } : r)))
    } catch (e) {
      console.error('[page] failed to persist medical observation', e)
    }

    // Update cattle health status if needed
    if (formData.type === "enfermedad" || formData.type === "tratamiento") {
      const newStatus = formData.status === "activo" ? "treatment" : "healthy"
      updateCattleDb(formData.cattleId, { healthStatus: newStatus }).catch((e) => console.error(e))
    }
  }

  const handleEditMedicalObservation = (observation: MedicalObservation) => {
    setEditingMedicalObservation(observation)
    setShowMedicalForm(true)
  }

  const handleUpdateMedicalObservation = (formData: any) => {
    if (!editingMedicalObservation) return

    const updatedObservation: MedicalObservation = {
      ...editingMedicalObservation,
      date: formData.date,
      type: formData.type,
      severity: formData.severity,
      symptoms: formData.symptoms,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      medication: formData.medication,
      dosage: formData.dosage,
      frequency: formData.frequency,
      duration: formData.duration,
      nextCheckup: formData.nextCheckup,
      veterinarian: formData.veterinarian,
      cost: formData.cost,
      notes: formData.notes,
      status: formData.status,
    }

    setMedicalObservations((prev) =>
      prev.map((obs) => (obs.id === editingMedicalObservation.id ? updatedObservation : obs)),
    )
    setEditingMedicalObservation(null)
    setShowMedicalForm(false)
  }

  const handleDeleteMedicalObservation = (id: string) => {
    setMedicalObservations((prev) => prev.filter((obs) => obs.id !== id))
  }

  const handleCancelMedicalForm = () => {
    setShowMedicalForm(false)
    setEditingMedicalObservation(null)
  }

  // Derived stats with guards for empty arrays
  const totalCattle = cattle.length
  const pregnantCattle = cattle.filter((c) => c.pregnancyDueDate).length
  const totalMilkToday = cattle.reduce((sum, c) => sum + (c.todayMilkProduction || 0), 0)
  const cattleNeedingAttention = cattle.filter((c) => c.healthStatus !== "healthy").length
  const averageWeight = totalCattle > 0 ? Math.round(cattle.reduce((sum, c) => sum + (c.lastWeight || 0), 0) / totalCattle) : 0

  const weeklyAverage = 0 // no mock weekly stats by default
  const todayVsAverage = weeklyAverage > 0 ? ((totalMilkToday - weeklyAverage) / weeklyAverage) * 100 : 0

  const upcomingBirths = cattle.filter((c) => {
    if (!c.pregnancyDueDate) return false
    const dueDate = new Date(c.pregnancyDueDate)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  })

  const cattleNeedingWeightCheck = cattle.filter((c) => {
    if (!c.lastWeightDate) return false
    const lastWeightDate = new Date(c.lastWeightDate)
    const today = new Date()
    const diffTime = today.getTime() - lastWeightDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 30
  })

  if (showRegistrationForm) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <CattleRegistrationForm
            onSubmit={editingCattle ? handleUpdateCattle : handleAddCattle}
            onCancel={handleCancelForm}
            initialData={editingCattle || {}}
            isEditing={!!editingCattle}
          />
        </div>
      </div>
    )
  }

  if (showMilkForm) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <MilkProductionForm
            cattle={cattle}
            onSubmit={editingMilkRecord ? handleUpdateMilkProduction : handleAddMilkProduction}
            onCancel={handleCancelMilkForm}
            initialData={editingMilkRecord || {}}
            isEditing={!!editingMilkRecord}
          />
        </div>
      </div>
    )
  }

  if (showWeightForm) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <WeightRecordForm
            cattle={cattle}
            onSubmit={editingWeightRecord ? handleUpdateWeightRecord : handleAddWeightRecord}
            onCancel={handleCancelWeightForm}
            initialData={editingWeightRecord || {}}
            isEditing={!!editingWeightRecord}
          />
        </div>
      </div>
    )
  }

  if (showMedicalForm) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <MedicalObservationsForm
            onSubmit={editingMedicalObservation ? handleUpdateMedicalObservation : handleAddMedicalObservation}
            cattleList={cattle.map((c) => ({ id: c.id, name: c.name }))}
            editingObservation={editingMedicalObservation || undefined}
          />
          <div className="mt-4">
            <Button variant="outline" onClick={handleCancelMedicalForm}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión Ganadera</h1>
            <p className="text-muted-foreground">Sistema integral para el manejo de ganado bovino</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">

              <span className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                Sistema activo
              </span>
            </div>
          </div>

          {/* Auth / debug status */}
          <div className="flex flex-col items-end gap-2">
            <div className="text-sm text-muted-foreground">Auth: {authReady ? (user ? user.uid : 'no user') : 'iniciando...'}</div>
            {authError && <div className="text-xs text-red-500">Auth error: {authError}</div>}
            {cattleError && <div className="text-xs text-red-500">Datos error: {cattleError}</div>}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refresh && refresh()}>
                Refrescar
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Reportes
            </Button>
            <Button onClick={() => setShowRegistrationForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Registrar Nueva Vaca
            </Button>
          </div>
        </div>

        {(upcomingBirths.length > 0 || cattleNeedingAttention > 0 || cattleNeedingWeightCheck.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingBirths.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-orange-800 flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    Partos Próximos ({upcomingBirths.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {upcomingBirths.slice(0, 2).map((cow) => {
                      const daysUntilBirth = Math.ceil(
                        (new Date(cow.pregnancyDueDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                      )
                      return (
                        <div key={cow.id} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{cow.name}</span>
                          <Badge variant="outline" className="text-orange-700 text-xs">
                            {daysUntilBirth}d
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {cattleNeedingAttention > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-red-800 flex items-center gap-2 text-sm">
                    <Heart className="w-4 h-4" />
                    Atención Médica ({cattleNeedingAttention})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {cattle
                      .filter((c) => c.healthStatus !== "healthy")
                      .slice(0, 2)
                      .map((cow) => (
                        <div key={cow.id} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{cow.name}</span>
                          <Badge variant="outline" className="text-red-700 text-xs">
                            {cow.healthStatus === "sick" ? "Enferma" : "Tratamiento"}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {cattleNeedingWeightCheck.length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-800 flex items-center gap-2 text-sm">
                    <Weight className="w-4 h-4" />
                    Pesaje Pendiente ({cattleNeedingWeightCheck.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {cattleNeedingWeightCheck.slice(0, 2).map((cow) => (
                      <div key={cow.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{cow.name}</span>
                        <Badge variant="outline" className="text-blue-700 text-xs">
                          +30d
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vacas</CardTitle>
              <Cow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCattle}</div>
              <p className="text-xs text-muted-foreground">{pregnantCattle} embarazadas</p>
              <Progress value={totalCattle ? (pregnantCattle / totalCattle) * 100 : 0} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Producción Hoy</CardTitle>
              <Milk className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMilkToday}L</div>
              <p className="text-xs text-muted-foreground">
                {todayVsAverage > 0 ? "+" : ""}
                {todayVsAverage.toFixed(1)}% vs promedio
              </p>
              <Progress value={Math.min(100, (totalMilkToday / (weeklyAverage * 1.2 || 1)) * 100)} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peso Promedio</CardTitle>
              <Weight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageWeight}kg</div>
              <p className="text-xs text-muted-foreground">
                Rango: {totalCattle ? Math.min(...cattle.map((c) => c.lastWeight || 0)) : 0} - {totalCattle ? Math.max(...cattle.map((c) => c.lastWeight || 0)) : 0}kg
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado de Salud</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalCattle ? totalCattle - cattleNeedingAttention : 0}</div>
              <p className="text-xs text-muted-foreground">{cattleNeedingAttention} requieren atención</p>
              <Progress value={totalCattle ? ((totalCattle - cattleNeedingAttention) / totalCattle) * 100 : 0} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCattle ? ((totalMilkToday / totalCattle / 25) * 100).toFixed(0) : 0}%</div>
              <p className="text-xs text-muted-foreground">Producción vs objetivo</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="cattle">Ganado</TabsTrigger>
            <TabsTrigger value="production">Producción</TabsTrigger>
            <TabsTrigger value="analytics">Gráficas</TabsTrigger>
            <TabsTrigger value="health">Salud</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Producción Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* no default weekly stats */}
                    <div className="text-sm text-muted-foreground">Sin datos</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Tareas Pendientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">Pesaje mensual</span>
                      <Badge variant="outline">{cattleNeedingWeightCheck.length} vacas</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">Seguimiento médico</span>
                      <Badge variant="outline">{cattleNeedingAttention} casos</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">Preparación partos</span>
                      <Badge variant="outline">{upcomingBirths.length} próximos</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cattle" className="space-y-4">
            <CattleList
              cattle={cattle}
              onEdit={handleEditCattle}
              onDelete={handleDeleteCattle}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>

          <TabsContent value="production" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 bg-transparent"
                onClick={() => setShowMilkForm(true)}
              >
                <Milk className="w-6 h-6" />
                Registrar Producción de Leche
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 bg-transparent"
                onClick={() => setShowWeightForm(true)}
              >
                <Weight className="w-6 h-6" />
                Registrar Peso
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 bg-transparent"
                onClick={() => setActiveTab("analytics")}
              >
                <BarChart3 className="w-6 h-6" />
                Ver Gráficas y Análisis
              </Button>
            </div>

            <Tabs defaultValue="milk" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="milk">Producción de Leche</TabsTrigger>
                <TabsTrigger value="weight">Control de Peso</TabsTrigger>
              </TabsList>

              <TabsContent value="milk">
                <MilkProductionHistory
                  records={milkRecords}
                  cattle={cattle}
                  onEdit={handleEditMilkProduction}
                  onDelete={handleDeleteMilkProduction}
                />
              </TabsContent>

              <TabsContent value="weight">
                <WeightHistory
                  records={weightRecords}
                  cattle={cattle}
                  onEdit={handleEditWeightRecord}
                  onDelete={handleDeleteWeightRecord}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Tabs defaultValue="milk-charts" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="milk-charts">Análisis de Producción de Leche</TabsTrigger>
                <TabsTrigger value="weight-charts">Evolución de Peso</TabsTrigger>
              </TabsList>

              <TabsContent value="milk-charts">
                <MilkProductionCharts records={milkRecords} cattle={cattle} />
              </TabsContent>

              <TabsContent value="weight-charts">
                <WeightEvolutionCharts records={weightRecords} cattle={cattle} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 bg-transparent"
                onClick={() => setShowMedicalForm(true)}
              >
                <FileText className="w-6 h-6" />
                Agregar Observación Médica
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                <Heart className="w-6 h-6" />
                Programar Revisión
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                <Calendar className="w-6 h-6" />
                Historial Médico
              </Button>
            </div>

            <MedicalHistory
              observations={medicalObservations}
              onEdit={handleEditMedicalObservation}
              onDelete={handleDeleteMedicalObservation}
              cattleList={cattle.map((c) => ({ id: c.id, name: c.name }))}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
