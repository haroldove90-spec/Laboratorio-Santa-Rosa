/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Patient, Study, WorkOrder, OrderStudyItem } from '../types';
import { LabDatabase } from '../mockData';
import { 
  UserPlus, 
  ShoppingCart, 
  CreditCard, 
  FileText, 
  Search, 
  Check, 
  Mail, 
  Printer, 
  Percent, 
  Trash, 
  HelpCircle,
  Tag
} from 'lucide-react';

interface RoleRecepcionProps {
  onRefreshAllData: () => void;
  orders: WorkOrder[];
}

export default function RoleRecepcion({ onRefreshAllData, orders }: RoleRecepcionProps) {
  const [activeTab, setActiveTab] = useState<'registro' | 'cotizacion' | 'caja' | 'entrega'>('registro');

  // Load datasets dynamically with persist state
  const [patients, setPatients] = useState<Patient[]>(LabDatabase.getPatients());
  const [studies] = useState<Study[]>(LabDatabase.getStudies());
  
  // Registration Form State
  const [newPatient, setNewPatient] = useState<Omit<Patient, 'id'>>({
    name: '',
    email: '',
    phone: '',
    gender: 'Femenino',
    birthDate: '',
    clinicalHistory: '',
    refDoctor: ''
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Quotes / Cart State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [cart, setCart] = useState<Study[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta de Crédito' | 'Transferencia' | 'Convenio Aseguradora'>('Efectivo');
  
  // Search parameters
  const [patientSearch, setPatientSearch] = useState('');
  const [studySearch, setStudySearch] = useState('');

  // Email/Print notifications feedback
  const [actionFeedback, setActionFeedback] = useState<{ [id: string]: string }>({});

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.email || !newPatient.phone) return;

    const savedPatient: Patient = {
      id: `PAC-${(8100 + patients.length + 1).toString()}`,
      ...newPatient
    };

    const updated = [savedPatient, ...patients];
    LabDatabase.setPatients(updated);
    setPatients(updated);
    
    // Auto-select for next step if desired
    setSelectedPatient(savedPatient);

    // Activity Log
    LabDatabase.logActivity(
      'Lic. Sofía Montenegro', 
      'recepcion', 
      'Registro Paciente', 
      `Dio de alta al paciente ${savedPatient.name} en ventanilla 1.`, 
      'info'
    );

    // Reset Form
    setNewPatient({
      name: '',
      email: '',
      phone: '',
      gender: 'Femenino',
      birthDate: '',
      clinicalHistory: '',
      refDoctor: ''
    });
    setRegistrationSuccess(true);
    setTimeout(() => setRegistrationSuccess(false), 4000);
    onRefreshAllData();
  };

  const handleStudyAddToCart = (study: Study) => {
    if (cart.some(s => s.code === study.code)) return; // No duplicates
    setCart([...cart, study]);
  };

  const handleRemoveFromCart = (code: string) => {
    setCart(cart.filter(s => s.code !== code));
  };

  const calculateSubtotal = () => cart.reduce((sum, s) => sum + s.price, 0);
  const calculateTotal = () => {
    const sub = calculateSubtotal();
    return sub - (sub * (discount / 100));
  };

  const handleCreateOrder = () => {
    if (!selectedPatient) return;
    if (cart.length === 0) return;

    const subtotal = calculateSubtotal();
    const finalTotal = calculateTotal();
    
    // Generate credentials for patient (first letter of name + sequence)
    const randomSeq = Math.floor(1000 + Math.random() * 9000).toString();
    const codeUnique = `SR${selectedPatient.id.split('-')[1]}`;

    const studyItems: OrderStudyItem[] = cart.map(s => ({
      code: s.code,
      name: s.name,
      category: s.category,
      price: s.price,
      referenceInterval: s.category === 'Química Clínica' ? '70 - 100 mg/dL' : undefined
    }));

    const newOrder: WorkOrder = {
      id: `R-${(200 + orders.length + 1).toString()}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientEmail: selectedPatient.email,
      patientPhone: selectedPatient.phone,
      refDoctor: selectedPatient.refDoctor || 'Autoreferido',
      studies: studyItems,
      subtotal,
      discountPercent: discount,
      total: finalTotal,
      status: 'Pendiente Toma',
      date: new Date().toISOString(),
      codeUnique,
      passwordUnique: randomSeq,
      paymentMethod,
      paymentStatus: paymentMethod === 'Convenio Aseguradora' ? 'Pendiente' : 'Pagado'
    };

    const currentOrders = LabDatabase.getOrders();
    LabDatabase.setOrders([newOrder, ...currentOrders]);
    
    LabDatabase.logActivity(
      'Lic. Sofía Montenegro',
      'recepcion',
      'Nueva Orden',
      `Creada la orden de servicio ${newOrder.id} para ${newOrder.patientName} (${studyItems.length} análisis).`,
      'info'
    );

    // Reset Quote Area
    setCart([]);
    setDiscount(0);
    setSelectedPatient(null);
    setActiveTab('caja'); // auto redirect to receipt drawer
    onRefreshAllData();
  };

  const triggerActionFeedback = (orderId: string, type: 'email' | 'whatsapp' | 'print') => {
    const key = `${orderId}-${type}`;
    setActionFeedback(prev => ({ ...prev, [key]: 'Procesando...' }));
    
    setTimeout(() => {
      setActionFeedback(prev => ({ 
        ...prev, 
        [key]: type === 'email' ? '¡Correo enviado con éxito!' : type === 'print' ? 'Imprimiendo copia clínica...' : 'Enviado por WhatsApp.' 
      }));

      // Log it
      LabDatabase.logActivity(
        'Lic. Sofía Montenegro',
        'recepcion',
        type === 'email' ? 'Disparo de Email' : 'Impresión Física',
        `Reenvío de reporte / ticket de la orden ${orderId} al destinatario.`,
        'info'
      );
      
      onRefreshAllData();
    }, 1500);

    setTimeout(() => {
      setActionFeedback(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }, 4500);
  };

  return (
    <div id="role-recep-panel" className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-6 transition-all">
      {/* Role Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Recepción e Ingresos
          </span>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-1">Atención, Registro y Facturación</h2>
          <p className="text-slate-500 text-xs">Captura veloz en ventanilla, calculadora de cotizaciones y emisión de comprobantes impresos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-mono">USUARIO ACTIVO</span>
            <span className="text-sm font-semibold text-slate-700">Lic. Sofía Montenegro</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold font-mono">
            SM
          </div>
        </div>
      </div>

      {/* Recep Navigation */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-200/60 rounded-xl mb-6 max-w-xl">
        <button
          onClick={() => setActiveTab('registro')}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
            activeTab === 'registro' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4 text-sky-500" />
          Ficha de Registro ({patients.length})
        </button>
        <button
          onClick={() => setActiveTab('cotizacion')}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
            activeTab === 'cotizacion' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4 text-indigo-500" />
          Cotizaciones & Descuentos
        </button>
        <button
          onClick={() => setActiveTab('caja')}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
            activeTab === 'caja' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-500" />
          Módulo de Caja
        </button>
        <button
          onClick={() => setActiveTab('entrega')}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
            activeTab === 'entrega' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-500" />
          Entregar Resultados (.PDF)
        </button>
      </div>

      {/* Reception subpanels */}
      {activeTab === 'registro' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sign Up New Patient */}
          <form onSubmit={handleRegisterPatient} className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Ventanilla de Registro Ágil</h3>
            
            {registrationSuccess && (
              <div id="toast-register" className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-pulse">
                ✓ Paciente registrado y guardado con éxito.
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre Completo del Paciente</label>
              <input
                type="text"
                required
                placeholder="Ej. Juan Carlos Herrera"
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:ring-2 focus:ring-sky-500"
                value={newPatient.name}
                onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Género biológico</label>
                <select
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50"
                  value={newPatient.gender}
                  onChange={e => setNewPatient({ ...newPatient, gender: e.target.value as any })}
                >
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Otro">Otro / Prefiere no decir</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Fecha de Nacimiento</label>
                <input
                  type="date"
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50"
                  value={newPatient.birthDate}
                  onChange={e => setNewPatient({ ...newPatient, birthDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
                <input
                  type="text"
                  required
                  placeholder="555-123-4567"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50"
                  value={newPatient.phone}
                  onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email (Envío Resultados)</label>
                <input
                  type="email"
                  required
                  placeholder="paciente@mail.com"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50"
                  value={newPatient.email}
                  onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Médico que Refiere (Dr./Dra.)</label>
              <input
                type="text"
                placeholder="Ej. Dr. Manuel Gómez, Cardiólogo"
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50"
                value={newPatient.refDoctor}
                onChange={e => setNewPatient({ ...newPatient, refDoctor: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Historial Clínico Básico (Opcional)</label>
              <textarea
                placeholder="Alergias, medicamentos críticos, ayuno verificado, diabetes, etc."
                rows={2}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50 resize-none"
                value={newPatient.clinicalHistory}
                onChange={e => setNewPatient({ ...newPatient, clinicalHistory: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              Guardar Ficha en Base de Datos
            </button>
          </form>

          {/* Patient Directory List */}
          <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Directorio de Pacientes Registrados</h3>
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o teléfono..."
                  className="text-xs bg-transparent border-none outline-none w-full"
                  value={patientSearch}
                  onChange={e => setPatientSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto pr-1">
              {patients
                .filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.phone.includes(patientSearch))
                .map(p => (
                  <div key={p.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          {p.id}
                        </span>
                        <h4 className="font-semibold text-slate-800 text-sm">{p.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        ⏱ {p.birthDate} ({p.gender}) <span className="text-slate-300">|</span> 📞 {p.phone} <span className="text-slate-300">|</span> ✉ {p.email}
                      </p>
                      {p.clinicalHistory && (
                        <p className="text-[10px] bg-sky-50 text-sky-800 p-1.5 rounded mt-1.5 border border-sky-100 font-mono max-w-sm">
                          Historial: {p.clinicalHistory}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedPatient(p);
                        setActiveTab('cotizacion');
                      }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-sky-200 text-sky-600 bg-sky-50 hover:bg-sky-100 cursor-pointer text-center w-full sm:w-auto"
                    >
                      Nueva Cotización
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cotizacion' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Study catalog selector */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Menú de Exámenes para Cotizar</h3>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 w-48 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Filtrar por estudio o categoría..."
                    className="text-xs bg-transparent border-none outline-none w-full"
                    value={studySearch}
                    onChange={e => setStudySearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                {studies
                  .filter(s => s.name.toLowerCase().includes(studySearch.toLowerCase()) || s.category.toLowerCase().includes(studySearch.toLowerCase()))
                  .map(study => {
                    const isInCart = cart.some(s => s.code === study.code);
                    return (
                      <div 
                        key={study.code} 
                        className={`p-3 rounded-xl border transition-all ${
                          isInCart ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-100 hover:border-slate-200'
                        } flex flex-col justify-between`}
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              {study.code}
                            </span>
                            <span className="text-xs font-bold text-slate-800">${study.price} MXN</span>
                          </div>
                          <h4 className="font-semibold text-slate-800 text-xs mt-1.5 leading-snug">{study.name}</h4>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-snug">{study.description}</p>
                        </div>

                        <button
                          onClick={() => handleStudyAddToCart(study)}
                          disabled={isInCart}
                          className={`mt-2 py-1 px-3 rounded text-[10px] font-semibold text-center transition-all cursor-pointer ${
                            isInCart 
                              ? 'bg-slate-100 text-indigo-400 border border-transparent' 
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                          }`}
                        >
                          {isInCart ? 'Agregado a Cotización' : ' + Agregar al carrito'}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Quick Helper */}
            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              Los costos y claves de preparación son ajustados por el Administrador en su consola regulada.
            </div>
          </div>

          {/* Checkout & Quote Summary Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-fit">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-indigo-500" />
                Resumen de Cotización
              </h3>

              {/* Patient selected block */}
              <div className="my-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">PACIENTE DESIGNADO</span>
                {selectedPatient ? (
                  <div className="mt-1 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 truncate">{selectedPatient.name}</h4>
                      <p className="text-[10px] text-slate-500">Morfia: {selectedPatient.gender} | {selectedPatient.id}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedPatient(null)} 
                      className="text-[9px] text-rose-500 hover:underline font-bold cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-rose-500 font-semibold mt-1">✗ Ninguno. Seleccione o registre un paciente en la pestaña "Ficha".</p>
                )}
              </div>

              {/* Cart Items */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No hay análisis en su carrito.</p>
                ) : (
                  cart.map(item => (
                    <div key={item.code} className="flex justify-between items-center text-xs p-2 rounded-lg border border-slate-50 bg-slate-50/20">
                      <div>
                        <span className="font-bold text-slate-800 block text-xs truncate max-w-[120px] sm:max-w-none">{item.name}</span>
                        <span className="text-[9px] text-slate-400 block font-mono">Clave: {item.code}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-700">${item.price}</span>
                        <button 
                          onClick={() => handleRemoveFromCart(item.code)}
                          className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations Form */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  Descuento Manual (%):
                </span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  className="w-14 p-1 text-xs border border-slate-200 rounded font-semibold text-center outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                  value={discount}
                  onChange={e => setDiscount(Math.min(50, Number(e.target.value)))}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">MÉTODO DE PAGO</label>
                <select
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none bg-slate-50"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito / Débito</option>
                  <option value="Transferencia">Transferencia SPEI / Banco</option>
                  <option value="Convenio Aseguradora">Aseguradora (Facturación Diferida)</option>
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs mt-3 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal()} MXN</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-indigo-600">
                    <span>Descuento ({discount}%):</span>
                    <span>-${(calculateSubtotal() * (discount / 100)).toFixed(1)} MXN</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-800 text-sm border-t border-dashed border-slate-200 pt-1.5">
                  <span>Total Neto:</span>
                  <span>${calculateTotal().toFixed(1)} MXN</span>
                </div>
              </div>

              <button
                onClick={handleCreateOrder}
                id="btn-recep-generate-ticket"
                disabled={!selectedPatient || cart.length === 0}
                className="w-full mt-3 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45 disabled:pointer-events-none shadow-xs"
              >
                ✓ Generar Ticket y Cobrar Orden
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'caja' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Módulo de Caja y Recibos Emitidos</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map(order => (
              <div key={order.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-[10px] text-teal-600 block">ORDEN ID: {order.id}</span>
                      <h4 className="font-semibold text-slate-800 text-sm">{order.patientName}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Fecha: {new Date(order.date).toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      order.paymentStatus === 'Pagado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>

                  {/* Studies checklist */}
                  <div className="my-3 py-2 border-t border-dashed border-slate-200 font-mono text-[10px] text-slate-600">
                    <span className="font-bold text-slate-700">ESTUDIOS ADQUIRIDOS:</span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      {order.studies.map((s, idx) => (
                        <li key={idx} className="truncate">[{s.code}] - {s.name} (${s.price} MXN)</li>
                      ))}
                    </ul>
                  </div>

                  {/* Credentials block */}
                  <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 mb-3">
                    <span className="text-[9px] text-indigo-800 font-bold uppercase tracking-widest block">ACCESO PORTAL AUTOSERVICIO (TICKET)</span>
                    <div className="flex justify-between items-center text-xs mt-1 text-indigo-950 font-mono font-bold">
                      <span>Código: {order.codeUnique}</span>
                      <span>Contraseña: {order.passwordUnique}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                  <div className="font-semibold font-mono text-xs text-slate-700">Total: ${order.total} MXN</div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => triggerActionFeedback(order.id, 'print')}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      {actionFeedback[`${order.id}-print`] || 'Imprimir Comprobante'}
                    </button>
                    <button
                      onClick={() => triggerActionFeedback(order.id, 'email')}
                      className="px-2.5 py-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {actionFeedback[`${order.id}-email`] || 'Enviar Mail de Ticket'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'entrega' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">Liberación y Entrega de Resultados Digitales / Físicos</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-150 text-slate-500 bg-slate-50/50">
                  <th className="p-3">Código / Paciente</th>
                  <th className="p-3">Estudios</th>
                  <th className="p-3">Estado de Liberación</th>
                  <th className="p-3">Código Ticket</th>
                  <th className="p-3 text-right">Módulo de Entrega Directa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(order => {
                  let badgeStyle = 'bg-amber-100 text-amber-800 border-amber-200';
                  if (order.status === 'Firmada') badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/40">
                      <td className="p-3">
                        <span className="font-mono font-bold text-slate-400 text-[10px] block">{order.id}</span>
                        <div className="font-semibold text-slate-800">{order.patientName}</div>
                        <div className="text-[10px] text-slate-400">{order.patientEmail}</div>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-600">
                        {order.studies.map(s => s.name).join(', ')}
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badgeStyle}`}>
                          {order.status === 'Firmada' ? '✓ Listo: Firmado por Path' : `⚠️ Pendiente: ${order.status}`}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] font-mono text-indigo-700 font-bold">{order.codeUnique}</td>
                      <td className="p-3 text-right">
                        {order.status === 'Firmada' ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => triggerActionFeedback(order.id, 'print')}
                              className="px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" />
                              {actionFeedback[`${order.id}-print`] || 'Imprimir Reporte'}
                            </button>
                            <button
                              onClick={() => triggerActionFeedback(order.id, 'email')}
                              className="px-2 py-1 rounded bg-teal-500 text-white hover:bg-teal-600 text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Mail className="w-3 h-3" />
                              {actionFeedback[`${order.id}-email`] || 'Notificar Mail'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Esperando proceso pre-analítico</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
