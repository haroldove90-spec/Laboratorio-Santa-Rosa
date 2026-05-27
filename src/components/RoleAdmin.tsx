/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Study, AuditLog, WorkOrder } from '../types';
import { LabDatabase, CONVENIOS_LIST } from '../mockData';
import { 
  Users, 
  BookOpen, 
  History, 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  PlusCircle, 
  Trash2, 
  Edit, 
  Search, 
  ChevronRight,
  ShieldCheck,
  Percent,
  RefreshCw,
  Building2
} from 'lucide-react';

interface RoleAdminProps {
  onRefreshAllData: () => void;
  orders: WorkOrder[];
}

export default function RoleAdmin({ onRefreshAllData, orders }: RoleAdminProps) {
  // Local active tabs
  const [activeSubTab, setActiveSubTab] = useState<'usuarios' | 'catalogo' | 'auditoria' | 'metricas'>('usuarios');

  // Multi-state reading from local storage inside LabDatabase
  const [staff, setStaff] = useState<User[]>(LabDatabase.getStaff());
  const [studies, setStudies] = useState<Study[]>(LabDatabase.getStudies());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(LabDatabase.getAuditLogs());
  
  // Custom states for creating entities
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'quimico' as any, status: 'Activo' as any });
  const [newStudy, setNewStudy] = useState({ code: '', name: '', category: 'Química Clínica', cost: 0, price: 0, description: '' });
  
  // Search parameters
  const [userSearch, setUserSearch] = useState('');
  const [studySearch, setStudySearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const formattedUser: User = {
      id: `ST-${(staff.length + 1).toString().padStart(3, '0')}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      lastActive: 'Nuevo Registro'
    };

    const updated = [...staff, formattedUser];
    LabDatabase.setStaff(updated);
    setStaff(updated);
    LabDatabase.logActivity('Ing. Alejandro Solís', 'admin', 'Alta de Personal', `Creó el usuario ${newUser.name} como ${newUser.role}.`, 'info');
    
    // reset
    setNewUser({ name: '', email: '', role: 'quimico', status: 'Activo' });
    setAuditLogs(LabDatabase.getAuditLogs());
    onRefreshAllData();
  };

  const handleDeleteUser = (id: string, name: string) => {
    const updated = staff.filter(u => u.id !== id);
    LabDatabase.setStaff(updated);
    setStaff(updated);
    LabDatabase.logActivity('Ing. Alejandro Solís', 'admin', 'Baja de Personal', `Eliminó el usuario de ${name} del sistema.`, 'warning');
    setAuditLogs(LabDatabase.getAuditLogs());
    onRefreshAllData();
  };

  const handleCreateStudy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudy.code || !newStudy.name || newStudy.price <= 0) return;

    const formattedStudy: Study = {
      code: newStudy.code.toUpperCase(),
      name: newStudy.name,
      category: newStudy.category,
      cost: Number(newStudy.cost),
      price: Number(newStudy.price),
      description: newStudy.description || 'Sin descripción adicional'
    };

    const updated = [...studies, formattedStudy];
    LabDatabase.setStudies(updated);
    setStudies(updated);
    LabDatabase.logActivity('Ing. Alejandro Solís', 'admin', 'Conf. de Catálogo', `Registró el nuevo análisis ${newStudy.name} (${newStudy.code}).`, 'info');

    // reset
    setNewStudy({ code: '', name: '', category: 'Química Clínica', cost: 0, price: 0, description: '' });
    setAuditLogs(LabDatabase.getAuditLogs());
    onRefreshAllData();
  };

  const handlePriceUpdate = (code: string, newPrice: number) => {
    const updated = studies.map(s => s.code === code ? { ...s, price: newPrice } : s);
    LabDatabase.setStudies(updated);
    setStudies(updated);
    const study = studies.find(s => s.code === code);
    LabDatabase.logActivity('Ing. Alejandro Solís', 'admin', 'Modificación Precios', `Actualizó precio de ${study?.name} a $${newPrice} MXN.`, 'info');
    setAuditLogs(LabDatabase.getAuditLogs());
    onRefreshAllData();
  };

  // Metrics calculators
  const cashTotal = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Pagado' ? o.total : 0), 0);
  const costsTotal = orders.reduce((sum, o) => {
    return sum + o.studies.reduce((sSum, st) => {
      const match = studies.find(s => s.code === st.code);
      return sSum + (match ? match.cost : 50); // Default cost
    }, 0);
  }, 0);
  const grossProfit = Math.max(0, cashTotal - costsTotal);

  return (
    <div id="role-admin-panel" className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-6 transition-all">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Consola del Administrador
          </span>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-1">Configuración y Auditoría del Sistema</h2>
          <p className="text-slate-500 text-xs">Alineación de catálogo de estudios, permisos de personal y métricas del negocio.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-mono">USUARIO ACTIVO</span>
            <span className="text-sm font-semibold text-slate-700">Ing. Alejandro Solís</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold font-mono">
            AS
          </div>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-200/60 rounded-xl mb-6 max-w-2xl">
        <button
          id="btn-admin-tab-users"
          onClick={() => setActiveSubTab('usuarios')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-medium cursor-pointer transition-all ${
            activeSubTab === 'usuarios' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-teal-600" />
          Gestión Personal ({staff.length})
        </button>
        <button
          id="btn-admin-tab-catalog"
          onClick={() => setActiveSubTab('catalogo')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-medium cursor-pointer transition-all ${
            activeSubTab === 'catalogo' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          Menú de Estudios
        </button>
        <button
          id="btn-admin-tab-audit"
          onClick={() => {
            setAuditLogs(LabDatabase.getAuditLogs());
            setActiveSubTab('auditoria');
          }}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-medium cursor-pointer transition-all ${
            activeSubTab === 'auditoria' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4 text-rose-500" />
          Bitácora / Logs
        </button>
        <button
          id="btn-admin-tab-metrics"
          onClick={() => setActiveSubTab('metricas')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-medium cursor-pointer transition-all ${
            activeSubTab === 'metricas' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          Rendimiento Alto Nivel
        </button>
      </div>

      {/* Subtab Contents */}
      {activeSubTab === 'usuarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: New User Registration Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs h-fit">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-teal-600" />
              Alta de Personal Clínico
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Dra. Carmen Luján"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="carmen.lujan@santarosa.com"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Asignación de Rol</label>
                <select
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50"
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
                >
                  <option value="quimico">Químico / Analista de Laboratorio</option>
                  <option value="flebotomista">Flebotomista / Toma de Muestra</option>
                  <option value="patologo">Director Médico / Patólogo</option>
                  <option value="recepcion">Recepcionista / Atención al Cliente</option>
                  <option value="admin">Administrador del Sistema / Dueño</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Estado Operativo</label>
                <select
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50"
                  value={newUser.status}
                  onChange={e => setNewUser({ ...newUser, status: e.target.value as any })}
                >
                  <option value="Activo">Activo (Acceso de Red habilitado)</option>
                  <option value="Inactivo">Inactivo (Acceso revocado)</option>
                </select>
              </div>

              <button
                type="submit"
                id="btn-admin-add-user"
                className="w-full py-2 px-4 rounded-xl text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                Guardar y Habilitar Permisos
              </button>
            </form>
          </div>

          {/* Right panel: Live User Management List */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center mb-4 gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Bitácora de Seguridad de Personal</h3>
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar personal..."
                  className="text-xs bg-transparent border-none outline-none w-full"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-500 bg-slate-50/50">
                    <th className="p-3">ID / Personal</th>
                    <th className="p-3">Rol asignado</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Único acceso</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff
                    .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.role.toLowerCase().includes(userSearch.toLowerCase()))
                    .map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/40">
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{item.name}</div>
                          <div className="text-[10px] text-slate-400">{item.email}</div>
                        </td>
                        <td className="p-3">
                          <span className="capitalize font-medium text-slate-600 px-2 py-0.5 rounded-md bg-slate-100 text-[10px]">
                            {item.role === 'patologo' ? 'Médico Patólogo / Director' : item.role === 'recepcion' ? 'Ventanilla' : item.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            item.status === 'Activo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${item.status === 'Activo' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 font-mono text-[10px]">{item.lastActive}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(item.id, item.name)}
                            disabled={item.id === 'ST-002' || item.id === 'ST-001'} // No borrar al administrador ni al director por seguridad
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                            title="Eliminar del sistema"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'catalogo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Register study in laboratory menu */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs h-fit">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              Alta / Registro de Estudios
            </h3>
            <form onSubmit={handleCreateStudy} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Clave (Ej. GL01)</label>
                  <input
                    type="text"
                    required
                    placeholder="HE03"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none uppercase bg-slate-50 font-mono"
                    value={newStudy.code}
                    onChange={e => setNewStudy({ ...newStudy, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Categoría</label>
                  <select
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50"
                    value={newStudy.category}
                    onChange={e => setNewStudy({ ...newStudy, category: e.target.value })}
                  >
                    <option value="Química Clínica">Química Clínica</option>
                    <option value="Hematología">Hematología</option>
                    <option value="Inmunología">Inmunología</option>
                    <option value="Microbiología">Microbiología</option>
                    <option value="Patología Especial">Patología Especial</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nombre Comercial del Análisis</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Tiempo de Tromboplastina (TPT)"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50"
                  value={newStudy.name}
                  onChange={e => setNewStudy({ ...newStudy, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Costo ($ MXN)</label>
                  <input
                    type="number"
                    required
                    placeholder="40"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50 font-mono"
                    value={newStudy.cost || ''}
                    onChange={e => setNewStudy({ ...newStudy, cost: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Precio Paciente ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="150"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50 font-mono"
                    value={newStudy.price || ''}
                    onChange={e => setNewStudy({ ...newStudy, price: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Descripción del Estudio / Indicaciones</label>
                <textarea
                  placeholder="Detalles clínicos o requerimientos específicos (Ej. ayuno de 8 hrs)..."
                  rows={2}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50 resize-none resize-y"
                  value={newStudy.description}
                  onChange={e => setNewStudy({ ...newStudy, description: e.target.value })}
                />
              </div>

              <button
                type="submit"
                id="btn-admin-add-study"
                className="w-full py-2 px-4 rounded-xl text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                Guardar e Integrar en Menú
              </button>
            </form>
          </div>

          {/* Right Panel: List studies & corporate agreements menu */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Menú Clínico de Análisis & Precios</h3>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 w-48 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Filtrar por nombre o clave..."
                    className="text-xs bg-transparent border-none outline-none w-full"
                    value={studySearch}
                    onChange={e => setStudySearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-white shadow-xs z-10 text-slate-500">
                    <tr className="border-b border-slate-150 bg-slate-50/50">
                      <th className="p-3">Clave / Análisis</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3">Costo Fabrica</th>
                      <th className="p-3">Precio Público</th>
                      <th className="p-3 text-right">Margen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studies
                      .filter(s => s.name.toLowerCase().includes(studySearch.toLowerCase()) || s.code.toLowerCase().includes(studySearch.toLowerCase()))
                      .map(item => {
                        const marginPercent = Math.round(((item.price - item.cost) / item.price) * 105);
                        return (
                          <tr key={item.code} className="hover:bg-slate-50/35">
                            <td className="p-3">
                              <span className="font-mono font-semibold text-teal-600 text-[11px] block">{item.code}</span>
                              <div className="font-semibold text-slate-800">{item.name}</div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] whitespace-nowrap">
                                {item.category}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 font-mono">${item.cost} MXN</td>
                            <td className="p-3">
                              <input
                                type="number"
                                className="w-18 p-1 text-xs border border-slate-200 rounded text-slate-700 font-semibold font-mono text-center focus:ring-1 focus:ring-teal-500"
                                value={item.price}
                                onChange={e => handlePriceUpdate(item.code, Number(e.target.value))}
                              />
                            </td>
                            <td className="p-3 text-right">
                              <span className="text-emerald-600 font-semibold font-mono">{marginPercent}%</span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Corporate/Insurance agreements */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Convenios y Alianzas de Descuento (Empresas/Aseguradoras)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONVENIOS_LIST.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-slate-700 block">{c.company}</span>
                      <span className="text-[11px] text-teal-600 mt-0.5 inline-block font-medium">{c.discount}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded">
                      Autorizado
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'auditoria' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Bitácora Oficial de Actividades del Sistema (Audit Log)</h3>
              <p className="text-slate-500 text-xs">Monitoreo inmutable para saber qué químico, recepcionista o patólogo alteró o liberó estudios sensibles.</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Filtrar por acción o usuario..."
                className="text-xs bg-transparent border-none outline-none w-full"
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-150 text-slate-500 bg-slate-50/50">
                  <th className="p-3">ID Log</th>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Responsable</th>
                  <th className="p-3">Acción Registrada</th>
                  <th className="p-3">Detalle Criptográfico / Operativo</th>
                  <th className="p-3 text-right">Gravedad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {auditLogs
                  .filter(l => l.user.toLowerCase().includes(auditSearch.toLowerCase()) || l.action.toLowerCase().includes(auditSearch.toLowerCase()) || l.details.toLowerCase().includes(auditSearch.toLowerCase()))
                  .map(log => {
                    let sevClass = 'bg-blue-50 text-blue-700 border-blue-200';
                    if (log.severity === 'warning') sevClass = 'bg-amber-50 text-amber-700 border-amber-200';
                    if (log.severity === 'danger') sevClass = 'bg-rose-50 text-rose-700 border-rose-200';
                    
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/40 text-[11px]">
                        <td className="p-3 font-semibold text-slate-400">{log.id}</td>
                        <td className="p-3 text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString() || log.timestamp}</td>
                        <td className="p-3 font-semibold text-slate-700">{log.user} <span className="text-[10px] text-slate-400 font-normal">({log.role})</span></td>
                        <td className="p-3 font-semibold text-slate-800">{log.action}</td>
                        <td className="p-3 text-slate-500 max-w-sm truncate" title={log.details}>{log.details}</td>
                        <td className="p-3 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${sevClass}`}>
                            {log.severity}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'metricas' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ingresos Netos (Caja)</span>
                <span className="text-emerald-500 bg-emerald-50 text-xs px-2 py-0.5 rounded font-bold">+18.5%</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-800 mt-2">${cashTotal} MXN</div>
              <p className="text-[10px] text-slate-500 mt-1">Órdenes procesadas efectivamente hoy</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Costo Reactivos</span>
                <span className="text-slate-400 font-mono text-xs">Est.</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-800 mt-2">${costsTotal} MXN</div>
              <p className="text-[10px] text-slate-500 mt-1">Calibradores, insumos y tubos al vacío</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs bg-slate-900 text-white">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Margen Bruto</span>
                <span className="text-teal-400 bg-teal-500/10 text-xs px-2 py-0.5 rounded font-bold">Excelente</span>
              </div>
              <div className="text-2xl font-bold font-mono text-teal-400 mt-2">${grossProfit} MXN</div>
              <p className="text-[10px] text-slate-400 mt-1">Diferencial económico bruto diario</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rendimiento Operativo</span>
                <span className="text-rose-500 bg-rose-50 text-xs px-2 py-0.5 rounded font-bold">1 Out of control</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-800 mt-2">94.4%</div>
              <p className="text-[10px] text-slate-500 mt-1">Índice de calibración de analizador</p>
            </div>
          </div>

          {/* Interactive Custom SVG Chart of Laboratory Performance */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Volumen Semanal de Pacientes Santa Rosa</h3>
            <p className="text-slate-500 text-xs mb-4">Demanda diaria por área del laboratorio clínico (Inmunología contra Química).</p>
            
            <div className="relative pt-4">
              <svg viewBox="0 0 800 200" className="w-full h-48">
                {/* Horizontal Guide Lines */}
                <line x1="50" y1="20" x2="780" y2="20" stroke="#f1f5f9" strokeWidth="2" />
                <line x1="50" y1="70" x2="780" y2="70" stroke="#f1f5f9" strokeWidth="2" />
                <line x1="50" y1="120" x2="780" y2="120" stroke="#f1f5f9" strokeWidth="2" />
                <line x1="50" y1="170" x2="780" y2="170" stroke="#e2e8f0" strokeWidth="2" />

                {/* Left indicators */}
                <text x="15" y="25" fill="#94a3b8" fontSize="10" fontFamily="monospace">150 pac</text>
                <text x="15" y="75" fill="#94a3b8" fontSize="10" fontFamily="monospace">100 pac</text>
                <text x="15" y="125" fill="#94a3b8" fontSize="10" fontFamily="monospace">50 pac</text>
                <text x="15" y="175" fill="#94a3b8" fontSize="10" fontFamily="monospace">0</text>

                {/* Week Days data peaks: Lu 120, Ma 150, Mi 80, Ju 130, Vi 110, Sa 160 */}
                {/* Point coordinates: 
                    Lunes: 100, 170 -> 170 - (120/150)*150 = 50
                    Martes: 220, 170 -> 170 - (145/150)*150 = 25
                    Miercoles: 340, 170 -> 170 - (75/150)*150 = 95
                    Jueves: 460, 170 -> 170 - (130/150)*150 = 40
                    Viernes: 580, 170 -> 170 - (115/150)*150 = 55
                    Sabado: 700, 170 -> 170 - (160/150)*150 = 10
                */}
                <g>
                  {/* Undergird Fill Area */}
                  <polygon 
                    points="100,170 100,70 220,40 340,110 460,60 580,75 700,20 700,170" 
                    fill="url(#teal-grad)" 
                    opacity="0.1" 
                  />
                  {/* Line Draw */}
                  <polyline 
                    fill="none" 
                    stroke="#0d9488" 
                    strokeWidth="3.5" 
                    points="100,70 220,40 340,110 460,60 580,75 700,20" 
                    strokeLinecap="round"
                  />
                  {/* Data Circles */}
                  <circle cx="100" cy="70" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="220" cy="40" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="340" cy="110" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="460" cy="60" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="580" cy="75" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="700" cy="20" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
                </g>

                {/* X Axis Labels */}
                <text x="100" y="190" fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="bold">Lunes</text>
                <text x="220" y="190" fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="bold">Martes</text>
                <text x="340" y="190" fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="bold">Miércoles</text>
                <text x="460" y="190" fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="bold">Jueves</text>
                <text x="580" y="190" fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="bold">Viernes</text>
                <text x="700" y="190" fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="bold">Sábado (Pico)</text>

                <defs>
                  <linearGradient id="teal-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
