/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WorkOrder } from '../types';
import { Microscope, Activity, CheckCircle, FileText, Beaker } from 'lucide-react';

interface WorkflowVisualizerProps {
  orders: WorkOrder[];
  onOrderSelect?: (order: WorkOrder) => void;
}

export default function WorkflowVisualizer({ orders, onOrderSelect }: WorkflowVisualizerProps) {
  const counts = {
    'Pendiente Toma': orders.filter(o => o.status === 'Pendiente Toma').length,
    'Recolectada': orders.filter(o => o.status === 'Recolectada').length,
    'En Análisis': orders.filter(o => o.status === 'En Análisis').length,
    'Validada': orders.filter(o => o.status === 'Validada').length,
    'Firmada': orders.filter(o => o.status === 'Firmada').length,
  };

  const steps = [
    { key: 'Pendiente Toma', label: 'Toma de Muestra', desc: 'Paciente esperando/ayuno', count: counts['Pendiente Toma'], icon: Activity, color: 'text-amber-500 bg-amber-50 hover:bg-amber-100', borderColor: 'border-amber-200' },
    { key: 'Recolectada', label: 'Recolectada', desc: 'Tubos etiquetados y listos', count: counts['Recolectada'], icon: Beaker, color: 'text-sky-500 bg-sky-50 hover:bg-sky-100', borderColor: 'border-sky-200' },
    { key: 'En Análisis', label: 'En Análisis', desc: 'Lectura automatizada', count: counts['En Análisis'], icon: Microscope, color: 'text-purple-500 bg-purple-50 hover:bg-purple-100', borderColor: 'border-purple-200' },
    { key: 'Validada', label: 'Validadas', desc: 'Aprobación técnica QFB', count: counts['Validada'], icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100', borderColor: 'border-emerald-200' },
    { key: 'Firmada', label: 'Firmadas y Listas', desc: 'Firma Médica Digital', count: counts['Firmada'], icon: FileText, color: 'text-indigo-500 bg-indigo-50 hover:bg-indigo-100', borderColor: 'border-indigo-200' },
  ];

  return (
    <div id="workflow-visualizer" className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            Flujo de Órdenes en Tiempo Real
          </h2>
          <p className="text-xs text-slate-500">Estado dinámico de las muestras y liberación en el laboratorio hoy</p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded">
          Total de órdenes: <span className="font-semibold text-teal-600">{orders.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.key} 
              className={`p-4 rounded-xl border ${step.borderColor} transition-all duration-200 hover:shadow-xs group relative flex flex-col justify-between`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg ${step.color.split(' ')[1]} ${step.color.split(' ')[0]} transition-colors`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">{step.count}</div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight">{step.label}</h3>
                <p className="text-[11px] text-slate-500 leading-snug mt-1">{step.desc}</p>
              </div>

              {/* Subtle connector arrows for larger screens */}
              {idx < 4 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Dynamic Activity List */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Monitoreo Rápido de Órdenes Recientes</h4>
        <div className="flex flex-wrap gap-2">
          {orders.map(o => {
            let badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
            if (o.status === 'Recolectada') badgeStyle = 'bg-sky-50 text-sky-700 border-sky-200';
            if (o.status === 'En Análisis') badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';
            if (o.status === 'Validada') badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (o.status === 'Firmada') badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';

            return (
              <button
                key={o.id}
                id={`btn-order-quick-${o.id}`}
                onClick={() => onOrderSelect?.(o)}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium border ${badgeStyle} flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer`}
              >
                <span className="font-bold">{o.id}</span>
                <span className="text-slate-400">|</span>
                <span className="max-w-[120px] truncate">{o.patientName}</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
