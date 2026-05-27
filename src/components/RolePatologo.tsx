/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkOrder, QualityControlPoint } from '../types';
import { LabDatabase } from '../mockData';
import { 
  FileCheck, 
  PenTool, 
  HeartHandshake, 
  Activity, 
  CheckSquare, 
  AlertTriangle, 
  Settings2, 
  Sparkles,
  RefreshCw,
  Signpost
} from 'lucide-react';

interface RolePatologoProps {
  onRefreshAllData: () => void;
  orders: WorkOrder[];
}

export default function RolePatologo({ onRefreshAllData, orders }: RolePatologoProps) {
  const [activeSegmentTab, setActiveSegmentTab] = useState<'firmas' | 'calidad'>('firmas');

  // Load Validadas and Firmadas orders
  const reviewableOrders = orders.filter(o => o.status === 'Validada' || o.status === 'Firmada');

  // Currently reviewed order
  const [selectedOrderId, setSelectedOrderId] = useState<string>(reviewableOrders[0]?.id || '');
  const activeOrder = orders.find(o => o.id === selectedOrderId);

  // Pathologist dynamic clinical interpretation notes fields
  const [interpretationNotes, setInterpretationNotes] = useState<{ [id: string]: string }>({});

  // Quality control points state
  const [qcPoints, setQcPoints] = useState<QualityControlPoint[]>(LabDatabase.getQCPoints());
  const [recalibrating, setRecalibrating] = useState(false);
  const [recalibrateNotice, setRecalibrateNotice] = useState('');

  const handleApplySignatureAndLiberate = (order: WorkOrder) => {
    const currentOrders = LabDatabase.getOrders();
    const comment = interpretationNotes[order.id] || 'Estudio liberado oficialmente por la dirección médica tras cumplir con estándares de calibración analítica.';

    const updated = currentOrders.map(o => {
      if (o.id === order.id) {
        return {
          ...o,
          status: 'Firmada' as const, // Officially Completed & Liberated!
          signatureTime: new Date().toISOString(),
          clinicalNotes: comment,
          pathologistRemarks: 'Dra. Rosa María Benítez - Directora Médica CEP 49302A'
        };
      }
      return o;
    });

    LabDatabase.setOrders(updated);
    
    // Log Activity
    LabDatabase.logActivity(
      'Dra. Rosa María Benítez',
      'patologo',
      'Firma Digital Aplicada',
      `Se aplicó firma electrónica criptográfica de liberación para ORDEN ${order.id}. Reporte listo para descarga.`,
      'warning'
    );

    onRefreshAllData();
  };

  const handleRecalibrateEquipment = () => {
    setRecalibrating(true);
    setRecalibrateNotice('Espere... Ejecutando purga, lavado de aguja y re-análisis con suero control Standard...');
    
    setTimeout(() => {
      // Correct the out of bounds point 14 (recalibrate value back within 1SD)
      const points = LabDatabase.getQCPoints();
      const updated = points.map(p => {
        if (p.id === 'QC-14') {
          return { ...p, value: 99.8 }; // corrected!
        }
        return p;
      });

      LabDatabase.setQCPoints(updated);
      setQcPoints(updated);
      
      LabDatabase.logActivity(
        'Dra. Rosa María Benítez',
        'patologo',
        'Calibración de Canal',
        'Se ejecutó calibración exitosa del analizador Beckman Coulter tras violación de regla Westgard 1-3S.',
        'info'
      );

      setRecalibrating(false);
      setRecalibrateNotice('¡Calibración Completada! El equipo se encuentra operando dentro de ±1 Desviación Estándar.');
      setTimeout(() => setRecalibrateNotice(''), 4500);
      onRefreshAllData();
    }, 3000);
  };

  return (
    <div id="role-patologo-panel" className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Dirección Médica y Patología
          </span>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-1">Liberación de Resultados y Calidad Interna</h2>
          <p className="text-slate-500 text-xs">Firma legal de reportes, redacción de interpretaciones diagnósticas y monitoreo Levey-Jennings.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-mono">USUARIO ACTIVO</span>
            <span className="text-sm font-semibold text-slate-700">Dra. Rosa María Benítez</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold font-mono">
            RB
          </div>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-200/60 rounded-xl mb-6 max-w-sm">
        <button
          onClick={() => setActiveSegmentTab('firmas')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-medium cursor-pointer transition-all ${
            activeSegmentTab === 'firmas' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4 text-emerald-600" />
          Revisión & Firma Electrónica
        </button>
        <button
          onClick={() => setActiveSegmentTab('calidad')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-medium cursor-pointer transition-all ${
            activeSegmentTab === 'calidad' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4 text-rose-500" />
          Control Calidad (IQC)
        </button>
      </div>

      {activeSegmentTab === 'firmas' && (
        reviewableOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
            <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-800">No hay órdenes validadas esperando firma</h4>
            <p className="text-xs mt-1">El equipo químico técnico debe capturar y cerrar resultados primero.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left selector */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 h-fit">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Bandeja de Liberaciones</h3>
              <div className="space-y-2">
                {reviewableOrders.map(o => {
                  const isSelected = o.id === selectedOrderId;
                  const isSigned = o.status === 'Firmada';

                  return (
                    <button
                      key={o.id}
                      onClick={() => {
                        setSelectedOrderId(o.id);
                        if (!interpretationNotes[o.id] && o.clinicalNotes) {
                          setInterpretationNotes({ ...interpretationNotes, [o.id]: o.clinicalNotes });
                        }
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                        isSelected ? 'border-emerald-400 bg-emerald-50/15' : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-mono text-xs font-bold text-emerald-600">{o.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                          isSigned ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        }`}>
                          {isSigned ? 'FIRMADO' : 'PENDIENTE'}
                        </span>
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

            {/* Right: Validation Panel and Remarks editing */}
            {activeOrder ? (
              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
                      DIAGNÓSTICO EN REVISIÓN MÉDICA CLÍNICA
                    </span>
                    <h3 className="text-base font-bold text-slate-800 mt-0.5">{activeOrder.patientName}</h3>
                    <p className="text-xs text-slate-500">Médico solicitante: {activeOrder.refDoctor}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-indigo-700">{activeOrder.id}</span>
                </div>

                {/* Displaying studies outcomes with dangerous alert signals */}
                <div className="space-y-2 font-mono text-[11px]">
                  <span className="font-bold text-slate-700 font-sans block text-xs uppercase mb-1">
                    RESULTADO ALOJADO POR QUÍMICO Y VALIDADOR
                  </span>
                  
                  {activeOrder.studies.map((s, sIdx) => {
                    const isPanicVal = s.isPanic;

                    return (
                      <div key={sIdx} className={`p-3 rounded-lg border font-mono flex justify-between items-center ${
                        isPanicVal ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-100'
                      }`}>
                        <div>
                          <span className="font-bold text-[10px] text-slate-400 block font-sans uppercase">
                            {s.code} - {s.name}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            RESULTADO: <b className={`font-mono text-sm ${isPanicVal ? 'text-rose-600 underline' : 'text-slate-900'}`}>{s.resultValue}</b> {s.resultUnit}
                          </span>
                        </div>
                        <div className="text-right text-[10px] text-slate-500 space-y-0.5 font-mono">
                          <div>Intervalo: {s.referenceInterval || 'S/D'}</div>
                          {isPanicVal && (
                            <span className="inline-block bg-rose-200 text-rose-800 border border-rose-300 font-bold px-1.5 py-0.5 rounded text-[8px] animate-pulse">
                              ¡CRÍTICO!
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Patient medical summary background context */}
                {activeOrder.clinicalNotes && (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-slate-700 text-xs text-justify font-sans leading-relaxed">
                    <span className="font-bold text-slate-800 block mb-1">Nota médica de recepción / Flebotomía:</span>
                    {activeOrder.clinicalNotes}
                  </div>
                )}

                {/* Pathologist dynamic text entry */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <PenTool className="w-3.5 h-3.5 text-rose-500" />
                    Interpretación Clínica Diagnóstica / Notas Médicas del Reporte:
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Escriba aquí los comentarios patológicos o interpretación clínica diagnóstica que formarán parte del reporte PDF final oficial..."
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none bg-slate-50 focus:ring-2 focus:ring-rose-500 resize-none font-sans leading-relaxed"
                    value={interpretationNotes[activeOrder.id] || ''}
                    onChange={e => setInterpretationNotes({ ...interpretationNotes, [activeOrder.id]: e.target.value })}
                  />
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                      <Sparkles className="w-3 h-3 text-teal-500" />
                      Firma Médica digital criptográfica vinculada de forma inmutable.
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-3">
                  {activeOrder.status !== 'Firmada' ? (
                    <button
                      onClick={() => handleApplySignatureAndLiberate(activeOrder)}
                      id="btn-pat-sign-report"
                      className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <FileCheck className="w-4.5 h-4.5 text-teal-400" />
                      Aplicar Firma Electrónica y Liberar Reporte
                    </button>
                  ) : (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 text-center flex items-center justify-center gap-1.5 font-sans">
                      ✓ Liberado. El reporte se encuentra oficialmente en la red de Médicos y Portal Pacientes.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )
      )}

      {activeSegmentTab === 'calidad' && (
        <div className="space-y-6">
          {/* Quality Control Details Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Gráfico de Control Interno de Calidad (Levey-Jennings)</h3>
                <p className="text-xs text-slate-500">Supervisión diaria del canal de Glucosa en Ayunas analizado en el equipo Beckman Coulter.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRecalibrateEquipment}
                  disabled={recalibrating}
                  className="py-1.5 px-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${recalibrating ? 'animate-spin' : ''}`} />
                  {recalibrating ? 'Procesando Calibrador...' : 'Forzar Recalibración de Canal'}
                </button>
              </div>
            </div>

            {recalibrateNotice && (
              <div id="recalibrando-alert" className="p-3 bg-rose-50 text-rose-800 rounded-lg text-xs font-semibold border border-rose-200 mb-4 animate-pulse">
                {recalibrateNotice}
              </div>
            )}

            {/* Pathologist's Interactive Levey-Jennings Chart built using elegant custom SVGs */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2 font-mono">
                MONITOR VISTAS SUERO CONTROL STANDARD - TARGET: 100 mg/dL (SD: 2.0)
              </span>

              {/* Check if warning point exists still (run 14 value is 106.2) */}
              {qcPoints.some(p => p.id === 'QC-14' && p.value > 104) && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex gap-3 items-start mb-6 font-sans">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <h5 className="text-rose-950 font-bold text-xs">REGLA WESTGARD VIOLADA: Punto QC-14 {qcPoints.find(p => p.id === 'QC-14')?.value} mg/dL ({'>'}3SD)</h5>
                    <p className="text-[11px] text-rose-800 leading-normal mt-0.5">
                      Se detectó una desviación inaceptable en el corrido analítico del lote de control de calidad. Por favor realice calibración para evitar falsos reportes clínicos.
                    </p>
                  </div>
                </div>
              )}

              {/* SVGs Graphic Engine */}
              <div className="relative bg-slate-50/50 p-4 rounded-xl border border-slate-150">
                <svg viewBox="0 0 800 240" className="w-full h-64">
                  {/* Guide lines and standard deviations labels */}
                  {/* Target 100 on Y=120 */}
                  {/* +1SD = Y=90, +2SD = Y=60, +3SD = Y=30 */}
                  {/* -1SD = Y=150, -2SD = Y=180, -3SD = Y=210 */}

                  {/* Lines */}
                  {/* +3SD */}
                  <line x1="60" y1="30" x2="780" y2="30" stroke="#f43f5e" strokeDasharray="3,3" strokeWidth="1" />
                  <text x="15" y="34" fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">+3SD (106)</text>

                  {/* +2SD */}
                  <line x1="60" y1="60" x2="780" y2="60" stroke="#f59e0b" strokeDasharray="4,4" strokeWidth="1" />
                  <text x="15" y="64" fill="#f59e0b" fontSize="9" fontFamily="monospace">+2SD (104)</text>

                  {/* +1SD */}
                  <line x1="60" y1="90" x2="780" y2="90" stroke="#64748b" strokeDasharray="5,5" strokeWidth="0.8" />
                  <text x="15" y="94" fill="#64748b" fontSize="9" fontFamily="monospace">+1SD (102)</text>

                  {/* Target 100 */}
                  <line x1="60" y1="120" x2="780" y2="120" stroke="#059669" strokeWidth="2.0" />
                  <text x="15" y="124" fill="#059669" fontSize="10" fontFamily="monospace" fontWeight="bold">TARGET (100)</text>

                  {/* -1SD */}
                  <line x1="60" y1="150" x2="780" y2="150" stroke="#64748b" strokeDasharray="5,5" strokeWidth="0.8" />
                  <text x="15" y="154" fill="#64748b" fontSize="9" fontFamily="monospace">-1SD (98)</text>

                  {/* -2SD */}
                  <line x1="60" y1="180" x2="780" y2="180" stroke="#f59e0b" strokeDasharray="4,4" strokeWidth="1" />
                  <text x="15" y="184" fill="#f59e0b" fontSize="9" fontFamily="monospace">-2SD (96)</text>

                  {/* -3SD */}
                  <line x1="60" y1="210" x2="780" y2="210" stroke="#f43f5e" strokeDasharray="3,3" strokeWidth="1" />
                  <text x="15" y="214" fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">-3SD (94)</text>

                  {/* Plotting points & drawing links path connecting them */}
                  {/* Width of graph is 720 px, let's map 18 runs */}
                  {/* Step X is 720 / 17 = 42.3 px */}
                  {/* X coordinate: 60 + i * 42.3 */}
                  {/* Y coordinate: 120 - ((Value - 100)/2)*30 */}
                  {(() => {
                    const stepY = 30; // 30 px is 2 units (1SD)
                    const pointsCoords = qcPoints.map((pt, index) => {
                      const x = 60 + index * 41.5;
                      const y = 120 - ((pt.value - 100) / 2) * stepY;
                      return { x, y, val: pt.value, code: pt.id };
                    });

                    // Stringify points line
                    const lineString = pointsCoords.map(pt => `${pt.x},${pt.y}`).join(' ');

                    return (
                      <g>
                        {/* Connecting line */}
                        <polyline 
                          fill="none" 
                          stroke="#6366f1" 
                          strokeWidth="2.5" 
                          points={lineString} 
                          strokeLinecap="round"
                        />
                        {/* Circle Markers */}
                        {pointsCoords.map((pt, i) => {
                          const isOOB = pt.val > 104 || pt.val < 96;
                          return (
                            <g key={i}>
                              <circle 
                                cx={pt.x} 
                                cy={pt.y} 
                                r={isOOB ? '6' : '4'} 
                                fill={isOOB ? '#f43f5e' : '#6366f1'} 
                                stroke="#ffffff" 
                                strokeWidth="1.5"
                                className="transition-all hover:scale-150 cursor-pointer"
                              />
                              {/* Label value hover simulation trigger indicator */}
                              <text 
                                x={pt.x} 
                                y={pt.y > 110 ? pt.y - 8 : pt.y + 16} 
                                fontSize="7" 
                                fill="#475569" 
                                fontFamily="monospace" 
                                textAnchor="middle"
                              >
                                {pt.val}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
