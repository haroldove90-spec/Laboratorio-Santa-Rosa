/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkOrder, OrderStudyItem } from '../types';
import { LabDatabase } from '../mockData';
import { 
  Dna, 
  Cpu, 
  Activity, 
  Check, 
  AlertOctagon, 
  ShieldAlert, 
  Save, 
  CheckCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react';

interface RoleQuimicoProps {
  onRefreshAllData: () => void;
  orders: WorkOrder[];
}

export default function RoleQuimico({ onRefreshAllData, orders }: RoleQuimicoProps) {
  // Chemist processes orders in status "Recolectada" or "En Análisis"
  const analysableOrders = orders.filter(o => o.status === 'Recolectada' || o.status === 'En Análisis' || o.status === 'Validada');

  // Selected Order to analyze
  const [selectedOrderId, setSelectedOrderId] = useState<string>(analysableOrders[0]?.id || '');
  const activeOrder = orders.find(o => o.id === selectedOrderId);

  // Results values temporarily edited by chemist
  const [editingResults, setEditingResults] = useState<{ [studyCode: string]: string }>({});

  // Live Sync Simulation values
  const [syncingEquipment, setSyncingEquipment] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Local feedback toast
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Detect and set default editing state when switching active orders
  const loadOrderForEditing = (order: WorkOrder) => {
    setSelectedOrderId(order.id);
    const initialVals: { [code: string]: string } = {};
    order.studies.forEach(s => {
      initialVals[s.code] = s.resultValue || '';
    });
    setEditingResults(initialVals);
    setSyncLogs([]);
  };

  // Calculate panic threshold trigger states
  const verifyPanicValue = (code: string, valueStr: string): boolean => {
    const value = parseFloat(valueStr);
    if (isNaN(value)) return false;

    if (code === 'QC01') { // Glucose
      return value > 400 || value < 55; // critical diabetic emergency values!
    }
    if (code === 'QC04') { // Creatinine / Kidney Urea
      return value > 5.0; // severe renal crisis
    }
    if (code === 'IN01') { // Thyroid TSH
      return value > 25.0 || value < 0.1;
    }
    return false;
  };

  // Automated machine simulation!
  const triggerAutomatedConnection = () => {
    if (!activeOrder) return;
    setSyncingEquipment(true);
    setSyncLogs(['Iniciando protocolo RS-232 / TCP-IP...', 'Conexión establecida con Beckman Coulter CX5 v2.1...', 'Leyendo códigos de barras de contenedor...']);
    
    setTimeout(() => {
      setSyncLogs(prev => [...prev, `Muestra identificada para Paciente [${activeOrder.patientName}] ok.`, 'Descargando curvas de calibración óptimas...']);
    }, 1200);

    setTimeout(() => {
      // Mock readings based on standard or interesting values
      const automaticReadings: { [code: string]: string } = {};
      activeOrder.studies.forEach(s => {
        if (s.code === 'QC01') {
          automaticReadings[s.code] = '512'; // Trigger diagnostic interest
        } else if (s.code === 'QC02') {
          automaticReadings[s.code] = '210';
        } else if (s.code === 'QC04') {
          automaticReadings[s.code] = '1.2';
        } else if (s.code === 'HE01') {
          automaticReadings[s.code] = '12.4';
        } else if (s.code === 'IN01') {
          automaticReadings[s.code] = '6.8';
        } else {
          automaticReadings[s.code] = '98.5';
        }
      });

      setEditingResults(automaticReadings);
      setSyncLogs(prev => [...prev, '✓ Datos brutos transferidos con éxito. Llenado automático realizado.', 'Cierre de socket cerrado con código 200.']);
      setSyncingEquipment(false);
    }, 2800);
  };

  const handleSaveAndValidate = (order: WorkOrder) => {
    const currentOrders = LabDatabase.getOrders();
    
    // Build updated studies with the new results
    const updatedStudies = order.studies.map(s => {
      const resultValue = editingResults[s.code] || '';
      const isPanic = verifyPanicValue(s.code, resultValue);
      
      // Determine unit
      let resultUnit = 'mg/dL';
      if (s.code === 'IN01') resultUnit = 'uIU/mL';
      if (s.code === 'HE01') resultUnit = 'g/dL';
      if (s.code === 'MB01') resultUnit = 'Obs';

      // Set reference intervals
      let referenceInterval = '70 - 100 mg/dL';
      if (s.code === 'QC02') referenceInterval = '< 200 mg/dL';
      if (s.code === 'QC04') referenceInterval = '0.6 - 1.2 mg/dL';
      if (s.code === 'HE01') referenceInterval = '12.0 - 15.5 g/dL';
      if (s.code === 'IN01') referenceInterval = '0.4 - 4.5 uIU/mL';

      return {
        ...s,
        resultValue,
        resultUnit,
        referenceInterval,
        isPanic,
        isValidated: true // Technical chemist approval
      };
    });

    const isAnyPanic = updatedStudies.some(s => s.isPanic);

    const updated = currentOrders.map(o => {
      if (o.id === order.id) {
        return {
          ...o,
          studies: updatedStudies,
          status: 'Validada' as const, // technical validation completed, ready for pathologist signature
          analysisTime: new Date().toISOString(),
          validationTime: new Date().toISOString()
        };
      }
      return o;
    });

    LabDatabase.setOrders(updated);
    
    // Log
    LabDatabase.logActivity(
      'Q.F.B. Fernando Silva',
      'quimico',
      'Validación Técnica QFB',
      `Resultados capturados y validados para ${order.patientName} (${order.id}). ${isAnyPanic ? 'Se detectó VALOR DE PÁNICO CRÍTICO.' : ''}`,
      isAnyPanic ? 'danger' : 'warning'
    );

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onRefreshAllData();
  };

  return (
    <div id="role-quimico-panel" className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Zona Analítica de Reactivos
          </span>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-1">Químico Clínico / Validación Técnica</h2>
          <p className="text-slate-500 text-xs">Captura de curvas metabólicas, interfaces con espectrofotómetros Beckman y alarmas de seguridad biológica.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-mono">USUARIO ACTIVO</span>
            <span className="text-sm font-semibold text-slate-700">Q.F.B. Fernando Silva</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold font-mono">
            FS
          </div>
        </div>
      </div>

      {analysableOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
          <Dna className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-spin duration-3000" />
          <h4 className="font-semibold text-slate-800">No hay muestras listas para examen</h4>
          <p className="text-xs mt-1">El personal de Flebotomía debe marcar muestras como "Recolectadas" para que ingresen aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left list: Select which order to calibrate */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 h-fit">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Cola de Trabajo Analítica</h3>
            <div className="space-y-2">
              {analysableOrders.map(o => {
                const isSelected = o.id === selectedOrderId;
                const statusBadge = o.status === 'Validada' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600';

                return (
                  <button
                    key={o.id}
                    onClick={() => loadOrderForEditing(o)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                      isSelected ? 'border-purple-400 bg-purple-50/15' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-mono text-xs font-bold text-purple-600">{o.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${statusBadge}`}>{o.status}</span>
                    </div>
                    <div className="font-bold text-slate-800 text-xs truncate">{o.patientName}</div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {o.studies.map(s => s.code).join(', ')}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Column: Results Capturing Form / Automated Sync */}
          {activeOrder ? (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Estudio: {activeOrder.id}</h3>
                    <p className="text-xs text-slate-500">Paciente: <span className="font-semibold text-slate-700">{activeOrder.patientName}</span></p>
                  </div>
                  
                  {/* Automated Interface Sync button */}
                  <button
                    onClick={triggerAutomatedConnection}
                    disabled={syncingEquipment}
                    className="py-1.5 px-3 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Cpu className={`w-3.5 h-3.5 ${syncingEquipment ? 'animate-pulse text-purple-600' : ''}`} />
                    {syncingEquipment ? 'Conectando...' : 'Sincronizar con Analizador'}
                  </button>
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-100 mb-4 animate-bounce">
                    ✓ Validación Técnica QFB registrada. Turnado a Patología para liberación.
                  </div>
                )}

                {/* Simulated analyzer logs stream UI */}
                {syncLogs.length > 0 && (
                  <div className="bg-slate-900 text-slate-300 font-mono text-[10px] p-3 rounded-lg mb-4 space-y-1.5 border border-slate-850 h-28 overflow-y-auto">
                    <div className="text-teal-400 flex items-center justify-between">
                      <span>DATALOGGER BECKMAN-COULTER RS232:</span>
                      <span className="animate-ping w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    </div>
                    {syncLogs.map((log, lIdx) => (
                      <div key={lIdx} className="text-slate-400 font-sans">{log}</div>
                    ))}
                  </div>
                )}

                {/* Core inputs fields for clinical outcomes */}
                <div className="space-y-4">
                  {activeOrder.studies.map((study) => {
                    const currentVal = editingResults[study.code] || '';
                    const isPanic = verifyPanicValue(study.code, currentVal);

                    return (
                      <div key={study.code} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="max-w-xs">
                          <span className="text-[10px] font-mono font-bold text-purple-600 uppercase block">{study.code}</span>
                          <h4 className="font-semibold text-slate-800 text-xs leading-snug">{study.name}</h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                            Intervalo referencia: {study.category === 'Química Clínica' ? '70 - 100 mg/dL' : 'Varía'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Ej. 100"
                            className={`w-full sm:w-28 text-sm p-2 border rounded-lg text-center font-mono focus:ring-2 ${
                              isPanic 
                                ? 'bg-rose-50 border-rose-400 text-rose-700 font-extrabold focus:ring-rose-500' 
                                : 'bg-white border-slate-200 text-slate-800 focus:ring-purple-500'
                            }`}
                            value={currentVal}
                            onChange={e => setEditingResults({ ...editingResults, [study.code]: e.target.value })}
                          />
                          <span className="text-xs text-slate-400 font-mono shrink-0">
                            {study.code === 'IN01' ? 'uIU/mL' : study.code === 'HE01' ? 'g/dL' : 'mg/dL'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => handleSaveAndValidate(activeOrder)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    Registrar y Validar Técnicamente
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2 leading-relaxed">
                    Al validar técnicamente, la orden pasa al flujo inmediato del Director Médico para el estampado de la firma digital e interpretación opcional.
                  </p>
                </div>
              </div>

              {/* Warning card for detected PANIC value */}
              {activeOrder.studies.some(study => verifyPanicValue(study.code, editingResults[study.code] || '')) && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex gap-4 items-start animate-pulse">
                  <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-rose-950 font-bold text-sm">⚠️ ALERTA DE SEGURO BIOLÓGICO: VALOR DE PÁNICO</h4>
                    <p className="text-xs text-rose-800 leading-relaxed mt-1">
                      El sistema ha detectado niveles críticos que ponen en riesgo la vida inmediata del paciente (por ejemplo, Glucosa mayor a 400 mg/dL).
                    </p>
                    <ul className="list-disc list-inside text-[11px] text-rose-900 font-bold mt-2 font-mono">
                      <li>Proceder con notificación de emergencia a Recepción.</li>
                      <li>Turnado inmediato a Dr. Patólogo de forma urgente.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
