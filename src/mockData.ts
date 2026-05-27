/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Study, AuditLog, Patient, WorkOrder, QualityControlPoint } from './types';

// Standard fallback helper to save and load state from localStorage to ensure edits are persistent
const loadState = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error loading state ${key}:`, e);
    return defaultValue;
  }
};

const saveState = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving state ${key}:`, e);
  }
};

export const INITIAL_STAFF: User[] = [
  { id: 'ST-001', name: 'Dra. Rosa María Benítez', email: 'director@santarosa.com', role: 'patologo', status: 'Activo', lastActive: 'Hace 5 min' },
  { id: 'ST-002', name: 'Ing. Alejandro Solís', email: 'admin@santarosa.com', role: 'admin', status: 'Activo', lastActive: 'Ahora' },
  { id: 'ST-003', name: 'Lic. Sofía Montenegro', email: 'recepcion@santarosa.com', role: 'recepcion', status: 'Activo', lastActive: 'Hace 2 min' },
  { id: 'ST-004', name: 'Téc. Javier Mendoza', email: 'toma@santarosa.com', role: 'flebotomista', status: 'Activo', lastActive: 'Hace 15 min' },
  { id: 'ST-005', name: 'Q.F.B. Fernando Silva', email: 'analista@santarosa.com', role: 'quimico', status: 'Activo', lastActive: 'Hace 1 min' },
];

export const INITIAL_STUDIES: Study[] = [
  // Química Clínica
  { code: 'QC01', name: 'Glucosa en Ayunas', category: 'Química Clínica', cost: 40, price: 150, description: 'Determinación cuantitativa de glucosa. Clave para monitoreo de diabetes mellitus.' },
  { code: 'QC02', name: 'Perfil Lipídico', category: 'Química Clínica', cost: 120, price: 450, description: 'Incluye Colesterol Total, HDL, LDL, VLDL y Triglicéridos. Evaluación de riesgo cardíaco.' },
  { code: 'QC03', name: 'Pruebas de Función Hepática (PFH)', category: 'Química Clínica', cost: 150, price: 600, description: 'Incluye Bilirrubinas, ALT, AST, ALP y Proteínas Totales. Diagnóstico de patologías de hígado.' },
  { code: 'QC04', name: 'Creatinina y Urea', category: 'Química Clínica', cost: 60, price: 200, description: 'Evaluación rápida de la tasa de filtración glomerular e integridad renal.' },
  
  // Hematología
  { code: 'HE01', name: 'Biometría Hemática Completa', category: 'Hematología', cost: 80, price: 320, description: 'Conteo completo de glóbulos rojos, blancos, hemoglobina, hematocrito y plaquetas.' },
  { code: 'HE02', name: 'Tiempo de Protrombina (TP)', category: 'Hematología', cost: 50, price: 180, description: 'Evaluación de los factores de la vía extrínseca de la cascada de coagulación.' },

  // Inmunología y Hormonas
  { code: 'IN01', name: 'Perfil Tiroideo (T3, T4, TSH)', category: 'Inmunología', cost: 220, price: 750, description: 'Evaluación de la glándula tiroides y desórdenes metabólicos asociados.' },
  { code: 'IN02', name: 'Antígeno Antiprostático Específico (PSA)', category: 'Inmunología', cost: 160, price: 420, description: 'Tamizaje y monitoreo del tejido prostático benigno y maligno.' },
  { code: 'IN03', name: 'Prueba de Embarazo en Sangre (hCG cuantitativa)', category: 'Inmunología', cost: 90, price: 280, description: 'Detección ultrasensible y confirmación de embarazo en suero.' },

  // Microbiología y Especiales
  { code: 'MB01', name: 'Examen General de Orina (EGO)', category: 'Microbiología', cost: 35, price: 120, description: 'Análisis físico, químico y microscópico de orina fresca.' },
  { code: 'MB02', name: 'Coprocultivo', category: 'Microbiología', cost: 180, price: 550, description: 'Aislamiento e identificación de bacterias enteropatógenas e indicaciones de resistencia antibiótica.' },
];

export const CONVENIOS_LIST = [
  { company: 'Clínica Metropolitana', discount: '15% de descuento en todos los estudios' },
  { company: 'Aseguradora GNP', discount: 'Precios preferenciales + Pago directo a cuenta' },
  { company: 'Club de Leones', discount: '20% en perfiles geriátricos y pediátricos' },
  { company: 'Sindicato de Maestros', discount: 'Firma de convenio corporativo 10% descuento' },
];

export const INITIAL_AUDIT: AuditLog[] = [
  { id: 'AD-101', timestamp: '2026-05-27T14:32:00Z', user: 'Ing. Alejandro Solís', role: 'admin', action: 'Actualización de Catálogo', details: 'Modificó costo de QC02 Perfil Lipídico de 110 a 120 MXN.', severity: 'info' },
  { id: 'AD-102', timestamp: '2026-05-27T15:10:00Z', user: 'Lic. Sofía Montenegro', role: 'recepcion', action: 'Registro de Paciente', details: 'Dio de alta al paciente Juan Carlos Herrera en ventanilla 1.', severity: 'info' },
  { id: 'AD-103', timestamp: '2026-05-27T15:25:00Z', user: 'Téc. Javier Mendoza', role: 'flebotomista', action: 'Etiqueta Código Barras', details: 'Generó etiqueta para Orden R-201 (Biometría Hemática).', severity: 'info' },
  { id: 'AD-104', timestamp: '2026-05-27T16:05:00Z', user: 'Q.F.B. Fernando Silva', role: 'quimico', action: 'Detección Valor Pánico', details: 'Glucosa crítica registrada (512 mg/dL) en paciente María de Jesús.', severity: 'danger' },
  { id: 'AD-105', timestamp: '2026-05-27T16:40:00Z', user: 'Dra. Rosa María Benítez', role: 'patologo', action: 'Firma Digital', details: 'Se aplicó firma digital criptográfica de liberación para ORDEN R-203.', severity: 'warning' },
];

export const INITIAL_PATIENTS: Patient[] = [
  { id: 'PAC-8101', name: 'María de Jesús Pérez', email: 'maria.perez@live.com', phone: '556-324-9102', gender: 'Femenino', birthDate: '1962-08-14', clinicalHistory: 'Diabetes Mellitus Tipo II, presenta tratamiento con metformina.', refDoctor: 'Dra. Claudia Domínguez (Cardióloga)' },
  { id: 'PAC-8102', name: 'Juan Carlos Herrera', email: 'jcherrera@gmail.com', phone: '551-987-2342', gender: 'Masculino', birthDate: '1985-11-20', clinicalHistory: 'Monitoreo de lípidos e hipertensión en control con Losartán.', refDoctor: 'Dr. Manuel Gómez (Médico General)' },
  { id: 'PAC-8103', name: 'Sofía Isabel Vergara', email: 'sofia.vergara@hotmail.com', phone: '553-776-8811', gender: 'Femenino', birthDate: '1998-04-03', clinicalHistory: 'Sospecha de hipotiroidismo primario, fatiga recurrente.', refDoctor: 'Dr. Laura Estévez (Endocrinóloga)' },
  { id: 'PAC-8104', name: 'Eduardo Martínez Ruiz', email: 'edu.smart@outlook.com', phone: '554-101-2099', gender: 'Masculino', birthDate: '1974-02-28', clinicalHistory: 'Chequeo rutinario de próstata anual por antecedentes heredo-familiares.', refDoctor: 'Dr. Roberto Ortiz (Urólogo)' },
];

export const INITIAL_ORDERS: WorkOrder[] = [
  {
    id: 'R-201',
    patientId: 'PAC-8101',
    patientName: 'María de Jesús Pérez',
    patientEmail: 'maria.perez@live.com',
    patientPhone: '556-324-9102',
    refDoctor: 'Dra. Claudia Domínguez (Cardióloga)',
    studies: [
      { code: 'QC01', name: 'Glucosa en Ayunas', category: 'Química Clínica', price: 150, resultValue: '512', resultUnit: 'mg/dL', referenceInterval: '70 - 100 mg/dL', isPanic: true, isValidated: true },
      { code: 'QC04', name: 'Creatinina y Urea', category: 'Química Clínica', price: 200, resultValue: '1.2', resultUnit: 'mg/dL', referenceInterval: '0.6 - 1.2 mg/dL', isPanic: false, isValidated: true }
    ],
    subtotal: 350,
    discountPercent: 10,
    total: 315,
    status: 'Validada', // Waiting for pathologist's signature
    date: '2026-05-27T10:15:00Z',
    collectionTime: '2026-05-27T10:45:00Z',
    analysisTime: '2026-05-27T12:30:00Z',
    validationTime: '2026-05-27T14:45:00Z',
    codeUnique: 'SR8101',
    passwordUnique: '4930',
    paymentMethod: 'Tarjeta de Crédito',
    paymentStatus: 'Pagado'
  },
  {
    id: 'R-202',
    patientId: 'PAC-8102',
    patientName: 'Juan Carlos Herrera',
    patientEmail: 'jcherrera@gmail.com',
    patientPhone: '551-987-2342',
    refDoctor: 'Dr. Manuel Gómez',
    studies: [
      { code: 'QC02', name: 'Perfil Lipídico', category: 'Química Clínica', price: 450, resultValue: '210', resultUnit: 'mg/dL', referenceInterval: '< 200 mg/dL', isPanic: false, isValidated: false }
    ],
    subtotal: 450,
    discountPercent: 0,
    total: 450,
    status: 'Recolectada', // Taken, ready for Chemist to set results!
    date: '2026-05-27T11:00:00Z',
    collectionTime: '2026-05-27T11:25:00Z',
    codeUnique: 'SR8102',
    passwordUnique: '5512',
    paymentMethod: 'Efectivo',
    paymentStatus: 'Pagado'
  },
  {
    id: 'R-203',
    patientId: 'PAC-8103',
    patientName: 'Sofía Isabel Vergara',
    patientEmail: 'sofia.vergara@hotmail.com',
    patientPhone: '553-776-8811',
    refDoctor: 'Dr. Laura Estévez (Endocrinóloga)',
    studies: [
      { code: 'IN01', name: 'Perfil Tiroideo (T3, T4, TSH)', category: 'Inmunología', price: 750, resultValue: '6.8', resultUnit: 'uIU/mL', referenceInterval: '0.4 - 4.5 uIU/mL', isPanic: false, isValidated: true },
      { code: 'HE01', name: 'Biometría Hemática Completa', category: 'Hematología', price: 320, resultValue: '11.2', resultUnit: 'g/dL', referenceInterval: '12.0 - 15.5 g/dL', isPanic: false, isValidated: true }
    ],
    subtotal: 1070,
    discountPercent: 15,
    total: 909.5,
    status: 'Firmada', // Completed medical report
    date: '2026-05-27T08:30:00Z',
    collectionTime: '2026-05-27T08:50:00Z',
    analysisTime: '2026-05-27T10:15:00Z',
    validationTime: '2026-05-27T11:00:00Z',
    signatureTime: '2026-05-27T12:00:00Z',
    codeUnique: 'SR8103',
    passwordUnique: '8841',
    paymentMethod: 'Transferencia',
    paymentStatus: 'Pagado',
    clinicalNotes: 'Los niveles de TSH se encuentran elevados, lo cual sugiere un cuadro clínico de hipotiroidismo subclínico o primario leve. Adicionalmente, se observa anemia microcítica leve.',
    pathologistRemarks: 'Dra. Rosa María Benítez - Diagnóstico liberado.'
  },
  {
    id: 'R-204',
    patientId: 'PAC-8104',
    patientName: 'Eduardo Martínez Ruiz',
    patientEmail: 'edu.smart@outlook.com',
    patientPhone: '554-101-2099',
    refDoctor: 'Dr. Roberto Ortiz',
    studies: [
      { code: 'IN02', name: 'Antígeno Antiprostático Específico (PSA)', category: 'Inmunología', price: 420, referenceInterval: '0 - 4.0 ng/mL' }
    ],
    subtotal: 420,
    discountPercent: 0,
    total: 420,
    status: 'Pendiente Toma', // Newly created, waiting for Phlebotomist check list!
    date: '2026-05-27T12:10:00Z',
    codeUnique: 'SR8104',
    passwordUnique: '3024',
    paymentMethod: 'Convenio Aseguradora',
    paymentStatus: 'Pendiente'
  }
];

// Let's create an excellent set of calibration runs for Levey-Jennings Quality Control
// Beckmann Coulter chemistry analyzer runs for glucose.
// Target is 100 mg/dL. SD (Standard deviation) is 2 mg/dL.
// Control values should typically range between 96 and 104 (within 2SD).
// Let's have some normal random-walk values and 1 value on run 14 at 106.2 (violating 3SD rule!) to alert the path.
export const INITIAL_QC_POINTS: QualityControlPoint[] = [
  { id: 'QC-1', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-10', value: 99.1, target: 100, sd: 2 },
  { id: 'QC-2', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-11', value: 101.4, target: 100, sd: 2 },
  { id: 'QC-3', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-12', value: 98.6, target: 100, sd: 2 },
  { id: 'QC-4', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-13', value: 100.2, target: 100, sd: 2 },
  { id: 'QC-5', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-14', value: 97.4, target: 100, sd: 2 },
  { id: 'QC-6', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-15', value: 101.9, target: 100, sd: 2 },
  { id: 'QC-7', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-16', value: 100.1, target: 100, sd: 2 },
  { id: 'QC-8', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-17', value: 98.9, target: 100, sd: 2 },
  { id: 'QC-9', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-18', value: 102.5, target: 100, sd: 2 },
  { id: 'QC-10', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-19', value: 99.8, target: 100, sd: 2 },
  { id: 'QC-11', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-20', value: 100.4, target: 100, sd: 2 },
  { id: 'QC-12', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-21', value: 101.1, target: 100, sd: 2 },
  { id: 'QC-13', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-22', value: 99.3, target: 100, sd: 2 },
  { id: 'QC-14', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-23', value: 106.2, target: 100, sd: 2 }, // > 3SD Out-of-control point!
  { id: 'QC-15', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-24', value: 100.8, target: 100, sd: 2 },
  { id: 'QC-16', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-25', value: 98.7, target: 100, sd: 2 },
  { id: 'QC-17', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-26', value: 101.5, target: 100, sd: 2 },
  { id: 'QC-18', equipment: 'Automated Beckman Coulter CX5', analyte: 'Glucosa en Ayunas', date: '2026-05-27', value: 99.9, target: 100, sd: 2 }
];

// Encapsulate Local Storage operations for runtime changes so users can interactively edit and persist states in-app!
export class LabDatabase {
  static getStaff(): User[] {
    return loadState<User[]>('santarosa_staff', INITIAL_STAFF);
  }
  static setStaff(staff: User[]): void {
    saveState('santarosa_staff', staff);
  }

  static getStudies(): Study[] {
    return loadState<Study[]>('santarosa_studies', INITIAL_STUDIES);
  }
  static setStudies(studies: Study[]): void {
    saveState('santarosa_studies', studies);
  }

  static getPatients(): Patient[] {
    return loadState<Patient[]>('santarosa_patients', INITIAL_PATIENTS);
  }
  static setPatients(patients: Patient[]): void {
    saveState('santarosa_patients', patients);
  }

  static getOrders(): WorkOrder[] {
    return loadState<WorkOrder[]>('santarosa_orders', INITIAL_ORDERS);
  }
  static setOrders(orders: WorkOrder[]): void {
    saveState('santarosa_orders', orders);
  }

  static getAuditLogs(): AuditLog[] {
    return loadState<AuditLog[]>('santarosa_audit', INITIAL_AUDIT);
  }
  static setAuditLogs(logs: AuditLog[]): void {
    saveState('santarosa_audit', logs);
  }

  static getQCPoints(): QualityControlPoint[] {
    return loadState<QualityControlPoint[]>('santarosa_qc', INITIAL_QC_POINTS);
  }
  static setQCPoints(points: QualityControlPoint[]): void {
    saveState('santarosa_qc', points);
  }

  // Quick helper to add audit log
  static logActivity(user: string, role: string, action: string, details: string, severity: 'info' | 'warning' | 'danger' = 'info'): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `AD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      details,
      severity
    };
    this.setAuditLogs([newLog, ...logs]);
  }
}
