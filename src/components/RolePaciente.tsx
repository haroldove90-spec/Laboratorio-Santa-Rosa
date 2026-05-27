/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkOrder } from '../types';
import { 
  Lock, 
  HelpCircle, 
  Heart, 
  Download, 
  Eye, 
  LineChart, 
  Clock, 
  ChevronRight,
  User,
  ArrowRight
} from 'lucide-react';

interface RolePacienteProps {
  orders: WorkOrder[];
}

export default function RolePaciente({ orders }: RolePacienteProps) {
  // Login wall credentials states
  const [codeUniqueInput, setCodeUniqueInput] = useState('');
  const [passUniqueInput, setPassUniqueInput] = useState('');

  // Active authenticated session patient data
  const [authenticatedPatientId, setAuthenticatedPatientId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Helper lists to map current orders for authenticated patiens
  const patientOrders = orders.filter(o => o.codeUnique === authenticatedPatientId);
  const activePatientName = patientOrders[0]?.patientName || 'Paciente';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Check if entered credentials match any active order
    // e.g., SR8101 / 4930, SR8102 / 5512, SR8103 / 8841, SR8104 / 3024
    const match = orders.find(o => 
      o.codeUnique.toUpperCase() === codeUniqueInput.toUpperCase().trim() && 
      o.passwordUnique === passUniqueInput.trim()
    );

    if (match) {
      setAuthenticatedPatientId(match.codeUnique);
    } else {
      setErrorMessage('❌ Los datos ingresados no corresponden a ningún recibo activo. Por favor verifique el código e intente nuevamente.');
    }
  };

  const handleLogout = () => {
    setAuthenticatedPatientId(null);
    setCodeUniqueInput('');
    setPassUniqueInput('');
    setErrorMessage('');
  };

  // Historic data points for the timeline graph of Glucose or Thyroid.
  // Standard clinical trend mock
  const glucoseHistory = [
    { date: 'Ene 2026', value: 92, status: 'Normal' },
    { date: 'Feb 2026', value: 115, status: 'Limítrofe' },
    { date: 'Mar 2026', value: 104, status: 'Normal' },
    { date: 'Abr 2026', value: 142, status: 'Elevado' },
    { date: 'May 2026 (Actual)', value: 512, status: 'Valores Críticos de Riesgo' },
  ];

  return (
    <div id="role-paciente-panel" className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Portal de Pacientes (Autoservicio)
          </span>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-1">Descarga de Resultados e Historial de Salud</h2>
          <p className="text-slate-500 text-xs">Acceso inmediato sin intermediarios utilizando las credenciales impresas en su ticket de caja.</p>
        </div>
        {authenticatedPatientId && (
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            Cerrar Sesión Portal
          </button>
        )}
      </div>

      {!authenticatedPatientId ? (
        /* LOGIN WALL */
        <div className="max-w-md mx-auto my-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">Consulte sus Resultados de Laboratorio</h3>
            <p className="text-xs text-slate-400">Ingrese las claves únicas localizadas en la zona inferior de su recibo de pago.</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs leading-normal">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Código del Recibo (Ej. SR8101)</label>
              <input
                type="text"
                required
                placeholder="SR8101"
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none bg-slate-50 focus:ring-2 focus:ring-indigo-500 uppercase font-mono tracking-wider"
                value={codeUniqueInput}
                onChange={e => setCodeUniqueInput(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña Única (Ej. 4930)</label>
              <input
                type="password"
                required
                placeholder="••••"
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none bg-slate-50 focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest text-center"
                value={passUniqueInput}
                onChange={e => setPassUniqueInput(e.target.value)}
              />
            </div>

            <button
              type="submit"
              id="btn-patient-login-submit"
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              Consultar Resultados
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Help Box */}
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-100 text-[11px] text-amber-800 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 fill-amber-100 text-amber-800" />
              Credenciales de Demostración Rápida:
            </span>
            <p className="font-mono text-[10px] space-y-0.5">
              • <b>Código:</b> SR8101 | <b>Contraseña:</b> 4930 (María Pérez)<br />
              • <b>Código:</b> SR8103 | <b>Contraseña:</b> 8841 (Sofía Vergara)
            </p>
          </div>
        </div>
      ) : (
        /* PRIVATE PATIENT PORTAL */
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">¡Hola de nuevo, {activePatientName}!</h3>
              <p className="text-slate-500 text-xs">Examine su récord histórico de glucosa y descargue sus informes de hoy.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Active PDF reports */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h4 className="text-sm font-semibold text-slate-900">Historial de Exámenes de Santa Rosa</h4>
              <div className="space-y-3">
                {patientOrders.map(order => {
                  const isReady = order.status === 'Firmada';

                  return (
                    <div key={order.id} className="p-4 rounded-xl border border-slate-150 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 font-mono block">ORDEN ID: {order.id}</span>
                          <span className="text-xs font-bold text-slate-800 block mt-0.5">
                            {order.studies.map(s => s.name).join(', ')}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                          isReady ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        }`}>
                          {isReady ? 'Firmado' : 'Procesando'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                        <span>Lote: {new Date(order.date).toLocaleDateString()}</span>
                        <span>Total: ${order.total} MXN</span>
                      </div>

                      {/* PDF actions */}
                      <div className="pt-2 border-t border-slate-200 flex justify-between gap-2">
                        {isReady ? (
                          <>
                            <button
                              onClick={() => alert(`👁 Visualización PDF: ${order.id} de ${order.patientName}`)}
                              className="w-full py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-semibold text-[10px] text-center cursor-pointer"
                            >
                              Ver Resultados
                            </button>
                            <button
                              onClick={() => alert(`📥 Descarga iniciada del reporte oficial PDF para ${order.id}.`)}
                              className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              Bajar PDF
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-amber-600 italic block text-center w-full bg-amber-50 p-2 rounded border border-amber-100 font-mono">
                            ⏳ Muestra en proceso de análisis técnico.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Comparative Dynamic Timeline graph */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <LineChart className="w-4.5 h-4.5 text-indigo-500" />
                <h4 className="text-sm font-semibold text-slate-900">Evolución Médica Temporal de Glucosa (Ayuno)</h4>
              </div>
              <p className="text-slate-500 text-xs mb-4">Línea de tendencia de sus pruebas anteriores cotejadas con el límite normal superior (100 mg/dL).</p>

              {/* Graphical Timeline with warning bars */}
              <div className="relative pt-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div className="flex justify-between text-xs font-mono font-bold text-slate-500 border-b border-slate-200 pb-2 mb-4">
                  <span>HISTORIAL CLÍNICO PACIENTE</span>
                  <span className="text-indigo-600">Glucosa en Ayunas (Valores Históricos)</span>
                </div>

                <div className="space-y-4">
                  {glucoseHistory.map((item, idx) => {
                    const isHigh = item.value > 100;
                    const isCritical = item.value > 300;
                    
                    // Width calculator representing values up to 600
                    const barWidth = Math.min(100, Math.round((item.value / 600) * 100)) + '%';

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-sans">
                          <span className="font-semibold text-slate-700">{item.date}</span>
                          <span className="font-mono">
                            <b className={`font-mono ${isHigh ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>{item.value} mg/dL</b>
                            <span className="text-slate-400"> (Intervalo ref: 70-100)</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-teal-500'
                              }`} 
                              style={{ width: barWidth }}
                            />
                          </div>
                          
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                            isCritical ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200' : isHigh ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-3 rounded-lg bg-amber-50 border border-amber-100 text-[11px] text-amber-800 leading-normal">
                  💡 <b>CONSEJO DIETÉTICO:</b> Su último resultado muestra un pico glucémico significativamente elevado. Por favor mantenga reposo e informe de inmediato a su médico general para el ajuste de medicación correspondiente.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
