/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role =
  | 'admin'          // Administrador / Dueño
  | 'recepcion'      // Recepcionista
  | 'flebotomista'  // Personal de Toma de Muestras
  | 'quimico'        // Químico / Analista
  | 'patologo'       // Director Médico / Patólogo
  | 'doctor'         // Médico Externo
  | 'paciente';      // Paciente (Autoservicio)

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Activo' | 'Inactivo';
  lastActive: string;
}

export interface Study {
  code: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  description: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'danger';
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'Masculino' | 'Femenino' | 'Otro';
  birthDate: string;
  clinicalHistory: string;
  refDoctor: string;
}

export interface OrderStudyItem {
  code: string;
  name: string;
  category: string;
  price: number;
  // Chemist sets results
  resultValue?: string;
  resultUnit?: string;
  referenceInterval?: string;
  isPanic?: boolean;
  isValidated?: boolean;
}

export interface WorkOrder {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  refDoctor: string;
  studies: OrderStudyItem[];
  subtotal: number;
  discountPercent: number;
  total: number;
  status: 'Pendiente Toma' | 'Recolectada' | 'En Análisis' | 'Validada' | 'Firmada';
  date: string;
  collectionTime?: string;
  analysisTime?: string;
  validationTime?: string;
  signatureTime?: string;
  codeUnique: string;      // Used by Patient to log in
  passwordUnique: string;  // Used by Patient to log in
  paymentMethod: 'Efectivo' | 'Tarjeta de Crédito' | 'Transferencia' | 'Convenio Aseguradora';
  paymentStatus: 'Pagado' | 'Parcial' | 'Pendiente';
  clinicalNotes?: string;  // Left by pathologist
  pathologistRemarks?: string;
}

export interface QualityControlPoint {
  id: string;
  equipment: string;
  analyte: string;
  date: string;
  value: number;
  target: number;
  sd: number; // Standard Deviation
}
