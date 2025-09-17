import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

// Colecciones
const cattleCollection = collection(db, 'cattle')
const milkCollection = collection(db, 'milkRecords')
const weightCollection = collection(db, 'weightRecords')
const medicalCollection = collection(db, 'medicalObservations')

// Cattle
export async function addCattle(data: any) {
  const ref = await addDoc(cattleCollection, data)
  return ref.id
}

export async function getAllCattle() {
  const snap = await getDocs(cattleCollection)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
}

export async function getCattleById(id: string) {
  const ref = doc(db, 'cattle', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as any) }
}

export async function updateCattle(id: string, data: any) {
  const ref = doc(db, 'cattle', id)
  await updateDoc(ref, data)
}

export async function deleteCattle(id: string) {
  const ref = doc(db, 'cattle', id)
  await deleteDoc(ref)
}

// Milk records
export async function addMilkRecord(data: any) {
  const ref = await addDoc(milkCollection, data)
  return ref.id
}

export async function getAllMilkRecords() {
  const snap = await getDocs(milkCollection)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
}

export async function updateMilkRecord(id: string, data: any) {
  const ref = doc(db, 'milkRecords', id)
  await updateDoc(ref, data)
}

export async function deleteMilkRecord(id: string) {
  const ref = doc(db, 'milkRecords', id)
  await deleteDoc(ref)
}

// Weight records
export async function addWeightRecord(data: any) {
  const ref = await addDoc(weightCollection, data)
  return ref.id
}

export async function getAllWeightRecords() {
  const snap = await getDocs(weightCollection)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
}

export async function updateWeightRecord(id: string, data: any) {
  const ref = doc(db, 'weightRecords', id)
  await updateDoc(ref, data)
}

export async function deleteWeightRecord(id: string) {
  const ref = doc(db, 'weightRecords', id)
  await deleteDoc(ref)
}

// Medical observations
export async function addMedicalObservation(data: any) {
  const ref = await addDoc(medicalCollection, data)
  return ref.id
}

export async function getAllMedicalObservations() {
  const snap = await getDocs(medicalCollection)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
}

export async function updateMedicalObservation(id: string, data: any) {
  const ref = doc(db, 'medicalObservations', id)
  await updateDoc(ref, data)
}

export async function deleteMedicalObservation(id: string) {
  const ref = doc(db, 'medicalObservations', id)
  await deleteDoc(ref)
}
