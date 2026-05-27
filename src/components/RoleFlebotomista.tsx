/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkOrder } from '../types';
import { LabDatabase } from '../mockData';
import { 
  CheckSquare, 
  Square, 
  Beaker, 
  CheckCircle, 
  Clock, 
  Printer, 
  Truck, 
  AlertTriangle,
  Barcode
} from 'lucide-react';

interface RoleFlebotomistaProps {
  onRefreshAllData: () => void;
  orders: WorkOrder[];
}

export default function RoleFlebotomista({ onRefreshAllData, orders }: RoleFlebotomistaProps) {
  // Read Orders having Pendiente Toma or Recolectada
  const activeOrders = orders.filter(o => o.status === 'Pendiente Toma' || o.status === 'Recolectada');

  // Multi-step preparation checklist state per order
  const [fastingState, setFastingState] = useState<{ [id: string]: boolean }>({});
  const [identityVerifiedState, setIdentityVerifiedState] = useState<{ [id: string]: boolean }>({});
  const [indicationsState, setIndicationsState] = useState<{ [id: string]: boolean }>({});

  // Label prints feedback state
  const [printedLabels, setPrintedLabels] = useState<{ [id: string]: boolean }>({});
  const [transitLogistics, setTransitLogistics] = useState<{ [id: string]: boolean }>({});

  const handleMarkCollected = (order: WorkOrder) => {
    // Requirements
    if (!fastingState[order.id] || !identityVerifiedState[order.id]) {
      alert('⚠️ Por favor verifique el ayuno y la identidad del paciente para poder recolectar la muestra.');
      return;
    }

    const currentOrders = LabDatabase.getOrders();
    const updated = currentOrders.map(o => {
      if (o.id === order.id) {
        return {
          ...o,
          status: 'Recolectada' as const,
          collectionTime: new Date().toISOString()
        };
      }
      return o;
    });

    LabDatabase.setOrders(updated);
    
    // Log
    LabDatabase.logActivity(
      'Téc. Javier Mendoza',
      'flebotomista',
      'Muestreo Exitoso',
      `Muestra recolectada para Orden ${order.id} (${order.patientName}). Ayuno verificado.`,
      'info'
    );

    onRefreshAllData();
  };

  const handlePrintLabel = (orderId: string) => {
    setPrintedLabels(prev => ({ ...prev, [orderId]: true }));
    setTimeout(() => {
      // Log
      LabDatabase.logActivity(
        'Téc. Javier Mendoza',
        'flebotomista',
        'Impresión Código Barras',
        `Código de barras generado con contenedores tubo rojo/violeta para ${orderId}.`,
        'info'
      );
      onRefreshAllData();
    }, 1000);
  };

  const handleTransitDispatch = (orderId: string) => {
    setTransitLogistics(prev => ({ ...prev, [orderId]: true }));
    LabDatabase.logActivity(
      'Téc. Javier Mendoza',
      'flebotomista',
      'Salida Logística',
      `Se registró el envío de muestras de la orden ${orderId} a matriz central en nevera térmica.`,
      'info'
    );
    onRefreshAllData();
  };

  // Tubes map generator for visual labeling
  const getContainerType = (studies: { code: string; name: string }[]) => {
    const containers: string[] = [];
    studies.forEach(s => {
      if (s.code.startsWith('QC')) {
        if (!containers.includes('Tubo Tapa Amarilla/Roja (Gel Separador)')) {
          containers.push('Tubo Tapa Amarilla/Roja (Gel Separador)');
        }
      } else if (s.code.startsWith('HE')) {
        if (!containers.includes('Tubo Tapa Morada (EDTA)')) {
          containers.push('Tubo Tapa Morada (EDTA)');
        }
      } else if (s.code.startsWith('IN')) {
        if (!containers.includes('Tubo Tapa Roja (Suero Seco)')) {
          containers.push('Tubo Tapa Roja (Suero Seco)');
        }
      } else if (s.code.startsWith('MB')) {
        if (!containers.includes('Contenedor Estéril de Orina/Copro')) {
          containers.push('Contenedor Estéril de Orina/Copro');
        }
      }
    });
    return containers.length > 0 ? containers : ['Tubo Tapa Roja (Estándar)'];
  };

  return (
    <div id="role-flebo-panel" className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Pre-analítica y Flebotomía
          </span>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-1">Control de Muestras y Trazabilidad</h2>
          <p className="text-slate-500 text-xs">Preparación de pacientes, etiquetado de códigos de barras interactivo y salida vial térmica.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-mono">USUARIO ACTIVO</span>
            <span className="text-sm font-semibold text-slate-700">Téc. Javier Mendoza</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold font-mono">
            JM
          </div>
        </div>
      </div>

      {activeOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
          <Beaker className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-800">No hay muestras pendientes hoy</h4>
          <p className="text-xs mt-1">El flujo dinámico está completamente al día. Genere nuevas órdenes en Recepción.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeOrders.map(order => {
            const containers = getContainerType(order.studies);
            const isCollected = order.status === 'Recolectada';

            return (
              <div 
                key={order.id} 
                className={`bg-white p-5 rounded-2xl border transition-all ${
                  isCollected ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-200/80 shadow-xs'
                } flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
                        PACIENTE EN SILLA DE RECOLECCIÓN
                      </span>
                      <h3 className="text-base font-bold text-slate-800 mt-0.5">{order.patientName}</h3>
                      <p className="text-xs text-slate-500">Orden: <b className="text-indigo-600">{order.id}</b> | Ref: {order.refDoctor}</p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      isCollected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Clinical Study list */}
                  <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-[11px]">
                    <span className="font-bold text-slate-700 block uppercase mb-1">Muestras Requeridas:</span>
                    <ul className="space-y-1 text-slate-600">
                      {order.studies.map((s, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>• {s.name}</span>
                          <span className="font-semibold text-indigo-600">[{s.code}]</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2.5 border-t border-dashed border-slate-200 pt-2 text-slate-500">
                      <span className="font-bold text-slate-600">CONTENEDOR INDICADO:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {containers.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Checklist Section */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      CHECKLIST DE FIABILIDAD PRE-ANALÍTICA
                    </span>
                    
                    <button
                      onClick={() => !isCollected && setIdentityVerifiedState(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                      disabled={isCollected}
                      className="w-full text-left flex items-center gap-2.5 text-xs text-slate-700 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {identityVerifiedState[order.id] ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold block text-xs">Identidad verificada del Paciente</span>
                        <span className="text-[10px] text-slate-400">Preguntar nombre completo y cotejar con identificación.</span>
                      </div>
                    </button>

                    <button
                      onClick={() => !isCollected && setFastingState(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                      disabled={isCollected}
                      className="w-full text-left flex items-center gap-2.5 text-xs text-slate-700 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {fastingState[order.id] ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold block text-xs">Ayuno de 8-12 horas verificado</span>
                        <span className="text-[10px] text-slate-400">Verificar que no haya ingerido grasas, alcohol o azúcares.</span>
                      </div>
                    </button>

                    <button
                      onClick={() => !isCollected && setIndicationsState(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                      disabled={isCollected}
                      className="w-full text-left flex items-center gap-2.5 text-xs text-slate-700 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {indicationsState[order.id] ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold block text-xs">Estándares específicos del estudio</span>
                        <span className="text-[10px] text-slate-400">Verificar recolección adecuada de orina o aseo previo.</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Phleb Operations Footer */}
                <div className="mt-5 border-t border-slate-100 pt-4 space-y-3">
                  {/* Dynamic Interactive barcode generation preview! */}
                  {printedLabels[order.id] && (
                    <div className="bg-slate-50 border border-slate-200 text-slate-700 p-3 rounded-lg flex items-center justify-between font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block tracking-widest font-bold">STICKER GENERADO</span>
                        <span className="text-xs font-bold text-slate-800">{order.id} | {order.patientName.split(' ')[0]}</span>
                        <span className="text-[9px] text-emerald-600 block mt-0.5">✓ {containers.length} Imbricaciones impresas</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Barcode id={`barcode-element-${order.id}`} className="w-16 h-8 text-slate-900" />
                        <span className="text-[8px] text-slate-400 tracking-wider">CODE-128 SR</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <button
                      onClick={() => handlePrintLabel(order.id)}
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 justify-center flex items-center gap-1.5 text-xs text-slate-700 font-medium transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      {printedLabels[order.id] ? 'Reimprimir Etiquetas' : 'Imprimir Código Barras'}
                    </button>

                    {!isCollected ? (
                      <button
                        onClick={() => handleMarkCollected(order)}
                        className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-xs text-white justify-center flex items-center gap-1.5 font-semibold transition-all cursor-pointer shadow-xs"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Marcar como Recolectada
                      </button>
                    ) : (
                      <button
                        onClick={() => handleTransitDispatch(order.id)}
                        disabled={transitLogistics[order.id]}
                        className={`w-full py-2 px-3 rounded-xl text-xs justify-center flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                          transitLogistics[order.id]
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                        {transitLogistics[order.id] ? 'Muestra despachada a Central ✓' : ' Registrar salida a laboratorio'}
                      </button>
                    )}
                  </div>

                  {isCollected && order.collectionTime && (
                    <div className="text-right text-[10px] text-slate-400 font-mono">
                      ✉ Recolectado a las: {new Date(order.collectionTime).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
