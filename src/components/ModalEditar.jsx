// src/components/ModalEditar.jsx
import { useState, useEffect } from 'react';

function ModalEditar({ pedido, onClose, onSave }) {
  // 1. Añadimos 'estado_entrega' al estado inicial
  const [formData, setFormData] = useState({
    nombre_cliente: '',
    responsable: '',
    monto: 0,
    estado_pago: false,
    estado_entrega: false, // Nuevo campo
  });

  // 2. Llenamos 'estado_entrega' cuando el pedido carga
  useEffect(() => {
    if (pedido) {
      setFormData({
        nombre_cliente: pedido.nombre_cliente,
        responsable: pedido.responsable,
        monto: pedido.monto || 0,
        estado_pago: pedido.estado_pago,
        estado_entrega: pedido.estado_entrega, // Nuevo campo
      });
    }
  }, [pedido]);

  // El manejador de cambios ya funciona para checkboxes, no necesita cambios
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 3. Pasamos todos los datos actualizados al guardar
    onSave({
      nombre_cliente: formData.nombre_cliente,
      responsable: formData.responsable,
      monto: parseFloat(formData.monto) || 0,
      estado_pago: formData.estado_pago,
      estado_entrega: formData.estado_entrega,
    });
  };

  if (!pedido) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg">
        <form onSubmit={handleSubmit} className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Editar Pedido</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
          </div>

          <div className="space-y-4">
            {/* Campos de texto (sin cambios) */}
            <div>
              <label htmlFor="nombre_cliente_modal" className="block text-sm font-semibold text-gray-700">Nombre del Cliente</label>
              <input type="text" id="nombre_cliente_modal" name="nombre_cliente" value={formData.nombre_cliente} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500" required />
            </div>
            <div>
              <label htmlFor="responsable_modal" className="block text-sm font-semibold text-gray-700">Responsable</label>
              <input type="text" id="responsable_modal" name="responsable" value={formData.responsable} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500" required />
            </div>
            <div>
              <label htmlFor="monto_modal" className="block text-sm font-semibold text-gray-700">Monto (S/.)</label>
              <input type="number" step="0.10" min="0" id="monto_modal" name="monto" value={formData.monto} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500" required />
            </div>
          </div>

          {/* 4. SECCIÓN DE INTERRUPTORES (ahora en una cuadrícula) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
            {/* Interruptor para Estado de Pago */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estado del Pago</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="estado_pago" checked={formData.estado_pago} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {formData.estado_pago ? 'Pagado' : 'Pendiente'}
                </span>
              </label>
            </div>

            {/* Interruptor para Estado de Entrega */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estado de Entrega</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="estado_entrega" checked={formData.estado_entrega} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-orange-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {formData.estado_entrega ? 'Entregado' : 'Pendiente'}
                </span>
              </label>
            </div>
          </div>

          {/* Botones de acción (sin cambios) */}
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalEditar;