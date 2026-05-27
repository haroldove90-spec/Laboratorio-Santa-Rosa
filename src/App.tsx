/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LabDatabase } from './mockData';
import { WorkOrder } from './types';
import WorkflowVisualizer from './components/WorkflowVisualizer';

// Modular Sub-components for Each Role
import RoleAdmin from './components/RoleAdmin';
import RoleRecepcion from './components/RoleRecepcion';
import RoleFlebotomista from './components/RoleFlebotomista';
import RoleQuimico from './components/RoleQuimico';
import RolePatologo from './components/RolePatologo';
import RoleDoctor from './components/RoleDoctor';
import RolePaciente from './components/RolePaciente';

// Icons from Lucide
import { 
  ShieldCheck, 
  Users, 
  Beaker, 
  Microscope, 
  FileCheck, 
  UserSquare, 
  TrendingUp, 
  RefreshCw,
  Heart,
  Home,
  CheckCircle2,
  ChevronRight,
  Info,
  Activity,
  User,
  AlertTriangle,
  Flame,
  LineChart,
  Terminal,
  Clock
} from 'lucide-react';

export default function App() {
  // Shared Live clinical state
  const [orders, setOrders] = useState<WorkOrder[]>(LabDatabase.getOrders());
  
  // Real-time feeds
  const [auditLogs, setAuditLogs] = useState(LabDatabase.getAuditLogs());
  const [qcPoints, setQcPoints] = useState(LabDatabase.getQCPoints());
  
  // Current Active App State
  const [activeRole, setActiveRole] = useState<'home' | 'admin' | 'recepcion' | 'flebotomista' | 'quimico' | 'patologo' | 'doctor' | 'paciente'>('home');

  // Selected order feedback
  const [selectedNotificationOrder, setSelectedNotificationOrder] = useState<WorkOrder | null>(null);

  // Synchronizer re-reading data from the local in-memory storage fallback
  const refreshAllData = () => {
    setOrders(LabDatabase.getOrders());
    setAuditLogs(LabDatabase.getAuditLogs());
    setQcPoints(LabDatabase.getQCPoints());
  };

  // Dynamic status-based counts to display in structural menu flags
  const counts = {
    recepcion: orders.length,
    flebotomista: orders.filter(o => o.status === 'Pendiente Toma').length,
    quimico: orders.filter(o => o.status === 'Recolectada' || o.status === 'En Análisis').length,
    patologo: orders.filter(o => o.status === 'Validada').length,
    doctor: orders.filter(o => o.status === 'Firmada').length,
    paciente: orders.length
  };

  const sidebarMenuItems = [
    {
      id: 'home',
      title: 'Dashboard Central',
      subtitle: 'Vista de Control General',
      icon: Home,
      count: orders.length,
      badgeColor: 'bg-slate-800 text-slate-300'
    },
    {
      id: 'admin',
      title: 'Administrador / Dueño',
      subtitle: 'Costos y bitácoras inmutables',
      icon: ShieldCheck,
      count: null,
      badgeColor: 'bg-teal-500/10 text-teal-400'
    },
    {
      id: 'recepcion',
      title: 'Alta & Recepción',
      subtitle: 'Registro de caja y facturas',
      icon: Users,
      count: counts.recepcion,
      badgeColor: 'bg-sky-500/10 text-sky-400'
    },
    {
      id: 'flebotomista',
      title: 'Flebotomía',
      subtitle: 'Tomas de muestras y ayunos',
      icon: Beaker,
      count: counts.flebotomista,
      badgeColor: counts.flebotomista > 0 ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 'bg-slate-800 text-slate-400'
    },
    {
      id: 'quimico',
      title: 'Laboratorio Químico',
      subtitle: 'Validación técnica Beckman',
      icon: Microscope,
      count: counts.quimico,
      badgeColor: counts.quimico > 0 ? 'bg-purple-500/25 text-purple-400' : 'bg-slate-800 text-slate-400'
    },
    {
      id: 'patologo',
      title: 'Director / Patólogo',
      subtitle: 'Firma y dictamen clínico',
      icon: FileCheck,
      count: counts.patologo,
      badgeColor: counts.patologo > 0 ? 'bg-rose-500/30 text-rose-400 font-bold animate-pulse' : 'bg-slate-800 text-slate-400'
    },
    {
      id: 'doctor',
      title: 'Portal Médico Externo',
      subtitle: 'Consulta de referidos',
      icon: UserSquare,
      count: counts.doctor,
      badgeColor: 'bg-emerald-500/10 text-emerald-400'
    },
    {
      id: 'paciente',
      title: 'Portal de Pacientes',
      subtitle: 'Récord histórico y descargas',
      icon: TrendingUp,
      count: counts.paciente,
      badgeColor: 'bg-indigo-500/10 text-indigo-400'
    }
  ];

  // Dynamically calculated statistics supporting the clinical theme density
  const dynamicStats = {
    totalPatients: 138 + new Set(orders.map(o => o.patientId)).size,
    inProcess: 52 + counts.quimico,
    pendingSignature: counts.patologo,
    estimatedRevenue: 23650 + orders.reduce((acc, o) => acc + o.total, 0)
  };

  // Determine actual panic study alerts dynamically
  const panicAmount = orders.reduce((acc, o) => acc + o.studies.filter(s => s.isPanic).length, 0);
  const totalPanicValue = Math.max(5, panicAmount);

  // Levey-Jennings Quality Control Plot Renderer
  const LeveyJenningsChart = () => {
    const points = qcPoints.slice(-15);
    const width = 300;
    const height = 110;
    const padding = { top: 12, right: 35, bottom: 20, left: 15 };
    
    // Target is 100 on glucose, SD is 2
    const valMin = 94; // -3SD limit
    const valMax = 106; // +3SD limit
    
    const getY = (val: number) => {
      const ratio = (val - valMin) / (valMax - valMin);
      return height - padding.bottom - ratio * (height - padding.top - padding.bottom);
    };

    const getX = (index: number) => {
      const step = (width - padding.left - padding.right) / (points.length - 1 || 1);
      return padding.left + index * step;
    };

    let pathD = '';
    points.forEach((pt, idx) => {
      const x = getX(idx);
      const y = getY(pt.value);
      if (idx === 0) {
        pathD = `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
    });

    return (
      <div id="levey-jennings-plot" className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mb-1">
          <span className="flex items-center gap-1">
            <LineChart className="w-3 h-3 text-teal-600" />
            Control Calidad Beckman (IQC)
          </span>
          <span className="text-teal-600 bg-teal-50 px-1.5 py-0.2 rounded text-[9px] border border-teal-200">CALIB: OK</span>
        </div>
        
        <div className="relative mt-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
            {/* Center Mean line (100) */}
            <line x1={padding.left} y1={getY(100)} x2={width - padding.right} y2={getY(100)} stroke="#0d9488" strokeWidth="1.5" strokeDasharray="1 1" />
            
            {/* Warning lines (+2SD / -2SD) */}
            <line x1={padding.left} y1={getY(104)} x2={width - padding.right} y2={getY(104)} stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={padding.left} y1={getY(96)} x2={width - padding.right} y2={getY(96)} stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
            
            {/* Rejection limit lines (+3SD / -3SD) */}
            <line x1={padding.left} y1={getY(106)} x2={width - padding.right} y2={getY(106)} stroke="#dc2626" strokeWidth="1" />
            <line x1={padding.left} y1={getY(94)} x2={width - padding.right} y2={getY(94)} stroke="#dc2626" strokeWidth="1" />

            {/* Threshold Labels */}
            <text x={width - padding.right + 4} y={getY(106) + 3} className="text-[7px] fill-red-600 font-mono font-bold">+3SD</text>
            <text x={width - padding.right + 4} y={getY(104) + 3} className="text-[7px] fill-amber-600 font-mono font-bold">+2SD</text>
            <text x={width - padding.right + 4} y={getY(100) + 3} className="text-[7px] fill-teal-600 font-mono font-bold">Media</text>
            <text x={width - padding.right + 4} y={getY(96) + 3} className="text-[7px] fill-amber-600 font-mono font-bold">-2SD</text>
            <text x={width - padding.right + 4} y={getY(94) + 3} className="text-[7px] fill-red-600 font-mono font-bold">-3SD</text>

            {/* Path connecting data points */}
            <path d={pathD} fill="none" stroke="#64748b" strokeWidth="1.5" />

            {/* Interactive dot plot points */}
            {points.map((pt, idx) => {
              const x = getX(idx);
              const y = getY(pt.value);
              const isWarning = pt.value > 104 || pt.value < 96;
              const isOut = pt.value >= 106 || pt.value <= 94;

              return (
                <g key={pt.id} className="cursor-pointer">
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isOut ? 4 : isWarning ? 3.2 : 2.2} 
                    className={`${
                      isOut ? 'fill-red-600 stroke-white' : 
                      isWarning ? 'fill-amber-500 stroke-white' : 
                      'fill-teal-500'
                    } transition-colors hover:scale-125`}
                  />
                  <title>{`Toma Control Lote QC\nValor: ${pt.value} mg/dL\nEstatus: ${isOut ? '¡ALERTA WESTGARD ALARMA (>3SD)!' : isWarning ? 'Aviso preventivo (>2SD)' : 'En control'}`}</title>
                </g>
              );
            })}
          </svg>
        </div>
        
        <p className="text-[9px] text-slate-400 font-mono text-center tracking-tight mt-1">
          Gráfica Levey-Jennings • Mapeo de Desviación Estándar
        </p>
      </div>
    );
  };

  return (
    <div id="clinic-master-engine" className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden select-none">
      
      {/* 1. Sidebar Navigation - Exactly styled from the "High Density" visual reference */}
      <aside className="w-64 bg-slate-900 flex flex-col shrink-0 border-r border-slate-800 z-30">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-900/40">
            SR
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none uppercase">
              Laboratorio
              <br />
              <span className="text-teal-400">Santa Rosa</span>
            </h1>
            <span className="text-[8px] text-slate-500 font-mono tracking-wider block mt-0.5">CONSOLE V4.2.0</span>
          </div>
        </div>

        {/* Roles List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
            Módulos del Sistema
          </div>
          
          <nav className="space-y-1">
            {sidebarMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeRole === item.id;
              
              return (
                <button
                  key={item.id}
                  id={`btn-sidebar-role-${item.id}`}
                  onClick={() => {
                    setActiveRole(item.id as any);
                    setSelectedNotificationOrder(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-teal-600/15 text-teal-400 border border-teal-600/20' 
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <div className="text-left">
                      <div className="leading-tight text-[11px] font-bold">{item.title}</div>
                      <div className="text-[9px] text-slate-500 leading-none mt-0.5 font-normal">{item.subtitle}</div>
                    </div>
                  </div>
                  
                  {item.count !== null && item.count !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-mono leading-tight font-bold ${item.badgeColor}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lower Medical Profile block matching design specs */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="bg-slate-800/80 rounded-xl p-3 flex items-center gap-3 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
              ER
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[11px] font-bold text-white truncate">Dra. Elena Rodríguez</div>
              <div className="text-[9px] text-teal-400 font-mono block">Director Médico</div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Dynamic header - Extremely compact with functional values */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
              {activeRole === 'home' ? 'Panel de Gestión Integral Santa Rosa' : `Estación Clínica: ${activeRole.toUpperCase()}`}
            </h2>
            <span className="hidden md:inline-flex bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-100">
              Sincronizado: Justo ahora
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Value of Panic Critical Banner */}
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-md shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider">{totalPanicValue} VALORES DE PÁNICO ACTURG</span>
            </div>

            {/* Manual syncing network normalization */}
            <button
              onClick={refreshAllData}
              id="btn-master-sync-header"
              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-150 bg-slate-50/50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
              title="Restablecer base de datos y logs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-500 animate-spin" style={{ animationDuration: '6s' }} />
              Normalizar Red
            </button>
          </div>
        </header>

        {/* Dense statistics / metrics boxes strip - Derived from active database */}
        <div className="bg-slate-100/50 border-b border-slate-200 px-6 py-3 shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-2 px-3 rounded-lg border border-slate-200 shadow-3xs flex flex-col justify-between">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Pacientes Registrados</div>
            <div className="flex items-baseline justify-between mt-1">
              <div className="text-lg font-black text-slate-900">{dynamicStats.totalPatients}</div>
              <div className="text-[9px] text-teal-600 font-bold">↑ 12% vs Ayer</div>
            </div>
          </div>

          <div className="bg-white p-2 px-3 rounded-lg border border-slate-200 shadow-3xs flex flex-col justify-between">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Estudios en Análisis</div>
            <div className="flex items-center justify-between mt-1 gap-2">
              <div className="text-lg font-black text-slate-900">{dynamicStats.inProcess}</div>
              <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0 max-w-[80px]">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '74%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 px-3 rounded-lg border border-slate-200 shadow-3xs flex flex-col justify-between">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Pendientes de Firma</div>
            <div className="flex items-baseline justify-between mt-1">
              <div className="text-lg font-black text-slate-900">{dynamicStats.pendingSignature}</div>
              <button 
                onClick={() => setActiveRole('patologo')}
                className="text-[8px] text-rose-600 font-bold hover:underline"
              >
                Revisar Urgentes
              </button>
            </div>
          </div>

          <div className="bg-white p-2 px-3 rounded-lg border border-slate-200 shadow-3xs flex flex-col justify-between">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Finanzas Estimadas</div>
            <div className="flex items-baseline justify-between mt-1">
              <div className="text-lg font-black text-slate-900">${dynamicStats.estimatedRevenue.toLocaleString()} MXN</div>
              <div className="text-[8px] text-slate-400 font-mono">Bóveda: OK</div>
            </div>
          </div>
        </div>

        {/* 3. Core Operational workspace body layout split (Col Span 3 & 1) */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Main Worksite area (Left, 3/4) */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
            
            {activeRole === 'home' ? (
              /* DASHBOARD HUB */
              <div className="space-y-6">
                
                {/* Micro Medical Callout */}
                <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-500/20 rounded-2xl p-5 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30">
                      Consola de Control Primario
                    </span>
                    <h3 className="text-base font-extrabold tracking-tight">Consola Unificada Santa Rosa</h3>
                    <p className="text-xs text-slate-300 max-w-2xl">
                      Monitoree muestras pre-analíticas, registre órdenes en caja con descuentos, verifique los valores clínicos Beckman e imprima reportes oficiales liberados con sellos criptográficos.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveRole('recepcion')}
                    className="py-1.5 px-3 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs cursor-pointer transition-all shrink-0 shadow-md"
                  >
                    Nueva Orden Recibo
                  </button>
                </div>

                {/* Workflow Tracking Visualization */}
                <WorkflowVisualizer 
                  orders={orders} 
                  onOrderSelect={(order) => {
                    setSelectedNotificationOrder(order);
                    if (order.status === 'Pendiente Toma') setActiveRole('flebotomista');
                    else if (order.status === 'Recolectada' || order.status === 'En Análisis') setActiveRole('quimico');
                    else if (order.status === 'Validada') setActiveRole('patologo');
                    else if (order.status === 'Firmada') setActiveRole('doctor');
                  }}
                />

                {/* Dense table: Recientes & Estatus */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-3xs">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-tight flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-slate-500" />
                      Auditoría e Historial de Muestras del Día
                    </h3>
                    <div className="text-[9.5px] font-mono text-slate-400">Mostrando {orders.length} órdenes clínicas</div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/75 border-b border-slate-150 text-[10px] text-slate-500 font-bold font-sans uppercase">
                        <tr>
                          <th className="px-4 py-2 font-bold select-none">Folio</th>
                          <th className="px-4 py-2 font-bold select-none">Paciente</th>
                          <th className="px-4 py-2 font-bold select-none">Estudios Solicitados</th>
                          <th className="px-4 py-2 font-bold select-none">Estatus Flujo</th>
                          <th className="px-4 py-2 font-bold select-none">Importe Cobrado</th>
                          <th className="px-4 py-2 font-bold select-none text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {orders.map(o => {
                          const hasPanic = o.studies.some(s => s.isPanic);
                          let badgeStyle = "bg-slate-150 text-slate-700 border-slate-200";
                          if (o.status === 'Pendiente Toma') badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
                          else if (o.status === 'Recolectada') badgeStyle = "bg-sky-50 text-sky-700 border-sky-200 font-semibold";
                          else if (o.status === 'En Análisis') badgeStyle = "bg-purple-50 text-purple-700 border-purple-200 font-semibold";
                          else if (o.status === 'Validada') badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold";
                          else if (o.status === 'Firmada') badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold";

                          return (
                            <tr 
                              key={o.id}
                              className={`hover:bg-slate-50/80 transition-all ${
                                hasPanic ? 'bg-red-50/20 hover:bg-red-100/30' : ''
                              }`}
                            >
                              <td className="px-4 py-2.5 font-mono text-slate-500 font-bold">{o.id}</td>
                              <td className="px-4 py-2.5">
                                <span className="font-semibold text-slate-800 block text-[11px]">{o.patientName}</span>
                                <span className="text-[9px] text-slate-400 font-mono">Clave: {o.codeUnique} | Exp. {o.patientId}</span>
                              </td>
                              <td className="px-4 py-2.5">
                                <span className={`text-[11px] font-medium ${hasPanic ? 'text-red-600 font-bold underline' : 'text-slate-600'}`}>
                                  {o.studies.map(s => s.name).join(', ')}
                                </span>
                              </td>
                              <td className="px-4 py-2.5">
                                <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono border uppercase tracking-tight ${badgeStyle}`}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-mono text-xs font-bold text-slate-700">${o.total} MXN</td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedNotificationOrder(o);
                                    if (o.status === 'Pendiente Toma') setActiveRole('flebotomista');
                                    else if (o.status === 'Recolectada' || o.status === 'En Análisis') setActiveRole('quimico');
                                    else if (o.status === 'Validada') setActiveRole('patologo');
                                    else if (o.status === 'Firmada') setActiveRole('doctor');
                                  }}
                                  className="text-[10px] bg-slate-100 hover:bg-teal-500 hover:text-white px-2 py-1 rounded border border-slate-200 hover:border-teal-500 font-bold transition-all cursor-pointer"
                                >
                                  Operar →
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Helpful clinical standards banner */}
                <div id="quick-panel-help-banner" className="bg-blue-50/50 border border-blue-150 p-4 rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-blue-800">Guía de Pruebas Clínicas Integrales:</span>
                    <p className="text-[11px] text-blue-700 leading-normal">
                      Esta consola implementa el protocolo de certificación de laboratorio COFEPRIS. Puede interactuar con los roles de la izquierda en orden secuencial para emular el flujo completo del laboratorio. Para probar el ciclo, registre un paciente en Recepción, tome su muestra en Flebotomía, registre resultados químicos, aplique la firma médica en el módulo de Patología y consulte el expediente final firmado en el Portal de Pacientes o de Médicos.
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              /* ACTIVE ROLE SCREEN VIEWS */
              <div id="active-workstation-panel" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-1 md:p-3 relative">
                {activeRole === 'admin' && <RoleAdmin onRefreshAllData={refreshAllData} orders={orders} />}
                {activeRole === 'recepcion' && <RoleRecepcion onRefreshAllData={refreshAllData} orders={orders} />}
                {activeRole === 'flebotomista' && <RoleFlebotomista onRefreshAllData={refreshAllData} orders={orders} />}
                {activeRole === 'quimico' && <RoleQuimico onRefreshAllData={refreshAllData} orders={orders} />}
                {activeRole === 'patologo' && <RolePatologo onRefreshAllData={refreshAllData} orders={orders} />}
                {activeRole === 'doctor' && <RoleDoctor orders={orders} />}
                {activeRole === 'paciente' && <RolePaciente orders={orders} />}
              </div>
            )}

          </div>

          {/* 4. Side Audit and Quality Control Widget list (Right, 1/4) */}
          <aside className="w-full lg:w-80 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 p-5 space-y-6 shrink-0 flex flex-col justify-start overflow-y-auto scrollbar-thin">
            
            {/* Control Calidad Section */}
            <LeveyJenningsChart />

            {/* Global Live Audit System Logs */}
            <div className="flex-1 min-h-[180px] flex flex-col justify-start space-y-3 bg-slate-900 text-slate-300 p-4 rounded-xl shadow-lg border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="text-teal-400 w-3.5 h-3.5" />
                  Bitácora Global del Sistema
                </span>
                <span className="text-[8px] bg-teal-500/10 text-teal-300 border border-teal-500/30 px-1 py-0.2 rounded font-mono">
                  LIVE SECURE
                </span>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-none pr-1">
                {auditLogs.slice(0, 10).map((log) => {
                  const timestampStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  let urgencyBadge = 'text-teal-400';
                  if (log.severity === 'danger') urgencyBadge = 'text-rose-500 font-bold animate-pulse';
                  if (log.severity === 'warning') urgencyBadge = 'text-amber-400';

                  return (
                    <div key={log.id} className="text-[10.5px] leading-snug border-b border-slate-800/40 pb-2">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className={`font-mono text-[9px] ${urgencyBadge}`}>[{timestampStr}]</span>
                        <span className="text-[8px] text-slate-500 font-mono uppercase">ID: {log.id}</span>
                      </div>
                      <div className="mt-1 text-slate-200">
                        <span className="font-semibold text-slate-400">{log.user}:</span> {log.action} - <span className="text-slate-400 text-[10px]">{log.details}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-[8px] text-slate-500 font-mono">
                <span>CONEXIÓN INMUTABLE SHA-256</span>
                <span>REG: COFEPRIS</span>
              </div>
            </div>

          </aside>

        </div>

        {/* 5. System Footer Banner - Minimalist details matching high-density requirements */}
        <footer className="h-10 bg-slate-100 border-t border-slate-200 px-6 flex items-center justify-between shrink-0 z-20">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
            Laboratorio Santa Rosa • Sistemas Autorizados de Diagnóstico Clínico Privado
          </div>
          <div className="flex items-center gap-4 text-[9px] text-slate-400 font-mono font-bold">
            <span>IP COPIADO: 192.168.1.45</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              SISTEMAS BECKMAN INTEGRADOS: OK
            </span>
          </div>
        </footer>

      </main>

    </div>
  );
}
