/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkOrder } from '../types';
import { 
  FolderSearch, 
  Search, 
  Download, 
  FileText, 
  Heart, 
  ChevronRight, 
  Mail, 
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

interface RoleDoctorProps {
  orders: WorkOrder[];
}

export default function RoleDoctor({ orders }: RoleDoctorProps) {
  // External physicians can see ALL patients or filter by their doctor reference tag!
  const [selectedDocName, setSelectedDocName] = useState('Dr. Manuel Gómez');
  const [searchQuery, setSearchQuery] = useState('');

  // Find orders that matches either the doctor tag, or custom search queries
  const doctorOrders = orders.filter(o => {
    const isDocReferenced = o.refDoctor.toLowerCase().includes(selectedDocName.toLowerCase()) || selectedDocName === 'Todos';
    const matchesSearch = o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.includes(searchQuery);
    return isDocReferenced && matchesSearch;
  });

  const [activeReportOrder, setActiveReportOrder] = useState<WorkOrder | null>(null);

  return (
    <div id="role-doctor-panel" className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Portal de Médicos Externos
          </span>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-1">Expedientes de Pacientes Referidos</h2>
          <p className="text-slate-500 text-xs">Acceso seguro con clave digital COFEPRIS para descarga inmediata de estudios validados de su consulta.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Filtrar por Médico:</label>
          <select
            className="text-xs p-2 border border-slate-200 bg-white rounded-lg outline-none cursor-pointer"
            value={selectedDocName}
            onChange={e => {
              setSelectedDocName(e.target.value);
              setActiveReportOrder(null);
            }}
          >
            <option value="Dr. Manuel Gómez">Dr. Manuel Gómez (Generalist)</option>
            <option value="Dra. Claudia Domínguez">Dra. Claudia Domínguez (Cardiologist)</option>
            <option value="Dr. Laura Estévez">Dr. Laura Estévez (Endocrinologist)</option>
            <option value="Todos">Ver todos los médicos externos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Directory of their referred cases */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1">
              <FolderSearch className="w-4 h-4 text-teal-600" />
              Bandeja de Diagnósticos ({doctorOrders.length})
            </h3>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 w-full mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar paciente referenciado..."
              className="text-xs bg-transparent border-none outline-none w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {doctorOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No se encontraron expedientes para este filtro médico.</p>
            ) : (
              doctorOrders.map(o => {
                const isSelected = o.id === activeReportOrder?.id;
                let statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                if (o.status === 'Firmada') statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <button
                    key={o.id}
                    onClick={() => setActiveReportOrder(o)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex justify-between items-start cursor-pointer hover:border-teal-200 ${
                      isSelected ? 'border-teal-500 bg-teal-50/10 shadow-xs' : 'border-slate-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-teal-600">{o.id}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase ${statusBadge}`}>
                          {o.status === 'Firmada' ? 'Disponible' : o.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs mt-1.5">{o.patientName}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">Estudios: {o.studies.map(s => s.name).join(', ')}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 mt-1" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: PDF Medical Record Design Mockup Viewer */}
        <div className="lg:col-span-2">
          {activeReportOrder ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative">
              {/* PDF Mock Header banner */}
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-150 mb-6">
                <span className="text-xs text-slate-500 font-mono">
                  💾 Vista Digital de Reporte Médico (PDF Certificado)
                </span>
                <button
                  onClick={() => alert('📥 Descarga iniciada del archivo PDF firmado con certificado XML de Laboratorio Santa Rosa.')}
                  className="py-1 px-3 rounded bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar PDF Oficial
                </button>
              </div>

              {/* Physical Clinical PDF layout */}
              <div className="border border-slate-300 p-6 rounded-lg bg-white shadow-xs text-left text-slate-800 max-w-2xl mx-auto space-y-6">
                
                {/* Lab Letterhead */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                  <div>
                    <h1 className="text-lg font-extrabold text-teal-800 tracking-tight flex items-center gap-1 uppercase">
                      <Heart className="w-5 h-5 fill-teal-600 text-teal-600" />
                      Laboratorio Santa Rosa
                    </h1>
                    <p className="text-[10px] text-slate-500 leading-normal font-sans">
                      Análisis Clínicos de Alta Fiabilidad e Inmunoensayos<br />
                      Matriz: Av. Independencia #402, Col. Centro<br />
                      Director Médico: Dra. Rosa María Benítez (Céd. Prov. 49302A)
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 font-mono">
                    <b>No. Registro:</b> {activeReportOrder.id}<br />
                    <b>Fecha toma:</b> {activeReportOrder.collectionTime ? new Date(activeReportOrder.collectionTime).toLocaleDateString() : 'N/D'}<br />
                    <b>Fecha liberación:</b> {activeReportOrder.signatureTime ? new Date(activeReportOrder.signatureTime).toLocaleDateString() : 'Pendiente'}
                  </div>
                </div>

                {/* Patient Ficha details */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded text-[11px] border border-slate-150">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">PACIENTE:</span>
                    <b className="text-xs text-slate-800">{activeReportOrder.patientName}</b><br />
                    <b>Email:</b> {activeReportOrder.patientEmail}<br />
                    <b>Edad/Género:</b> 42 años | Femenino
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">MÉDICO REMITENTE:</span>
                    <b className="text-xs text-slate-800">{activeReportOrder.refDoctor}</b><br />
                    <b>Institución:</b> Privada Santa Rosa SA<br />
                    <b>Ubicación:</b> Ciudad de México, MX
                  </div>
                </div>

                {/* Main Scientific Findings Table */}
                <div>
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2">Informe de Resultados Analíticos</h3>
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-sans">
                        <th className="py-2">Análisis Solicitado</th>
                        <th className="py-2 text-center">Resultado Obtenido</th>
                        <th className="py-2">Intervalo de Referencia</th>
                        <th className="py-2 text-right">Estatus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeReportOrder.studies.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 font-sans">
                            <span className="font-semibold block font-sans">{s.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono">Prueba ID: [{s.code}]</span>
                          </td>
                          <td className="py-2.5 text-center font-bold">
                            <span className={s.isPanic ? 'text-rose-600 font-bold underline' : 'text-slate-800'}>
                              {s.resultValue || 'En Análisis...'} {s.resultValue ? s.resultUnit : ''}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-500">{s.referenceInterval || 'Consultar intervalos clínicos'}</td>
                          <td className="py-2.5 text-right font-sans font-semibold text-[10px]">
                            {s.isPanic ? (
                              <span className="text-rose-600 bg-rose-50 border border-rose-200 px-1 py-0.5 rounded text-[8px] animate-pulse">
                                CRÍTICO
                              </span>
                            ) : s.resultValue ? (
                              <span className="text-emerald-600">Normal</span>
                            ) : (
                              <span className="text-slate-400">En proceso</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pathologist Diagnostic Interpretation notes */}
                {activeReportOrder.status === 'Firmada' && (
                  <div className="bg-amber-50/40 p-4 rounded border border-amber-200/60 text-xs">
                    <span className="font-bold text-teal-800 block mb-1">INTERPRETACIÓN CLÍNICA PATOLÓGICA:</span>
                    <p className="text-slate-700 italic text-justify leading-relaxed">
                      "{activeReportOrder.clinicalNotes}"
                    </p>
                  </div>
                )}

                {/* Digital Signature seal */}
                <div className="flex justify-between items-end border-t border-slate-200 pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-7 h-7 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block font-sans">FIRMA DIGITAL DE LIBERACIÓN</span>
                      <b className="text-xs text-slate-800 font-sans">{activeReportOrder.pathologistRemarks || 'Pendiente de Liberación final'}</b>
                      <span className="text-[9px] text-slate-400 block font-mono">XML-SHA256: ee04f0391abf83c84</span>
                    </div>
                  </div>
                  
                  {activeReportOrder.status === 'Firmada' && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-100 flex items-center justify-center rounded border border-slate-200 font-bold text-slate-400 text-xs font-serif italic relative">
                        SELLO
                        <span className="absolute text-[8px] text-emerald-600 font-sans uppercase font-bold text-center border-2 border-emerald-600 rounded bg-white px-1 py-0.5 rotate-12 scale-105">
                          ✓ LIBERADO
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              <FileText className="w-14 h-14 text-slate-300 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-800">No hay reporte seleccionado para visualizar</h4>
              <p className="text-xs mt-1">Seleccione un paciente de la lista izquierda para desplegar el informe de resultados clínico oficial.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
