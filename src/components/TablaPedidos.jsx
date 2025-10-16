// src/components/TablaPedidos.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ModalEditar from './ModalEditar.jsx';
import ConfirmModal from './ConfirmModal.jsx';

function TablaPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [pedidoActual, setPedidoActual] = useState(null);
  const [confirmacionPendiente, setConfirmacionPendiente] = useState({
    isOpen: false,
    type: null, // 'danger' para eliminar, 'warning' para pagar
    pedidoId: null,
    action: null, // 'eliminar' o 'pagar'
  });
  const [modalExito, setModalExito] = useState({
    isOpen: false,
    mensaje: '',
  });

  const abrirModalEditar = (pedido) => {
    setPedidoActual(pedido);
    setModalEditarAbierto(true);
  };

  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setPedidoActual(null);
  };

  const guardarCambios = async (datosActualizados) => {
    if (!pedidoActual) return;
    const { error } = await supabase.from('pedidos').update(datosActualizados).eq('id', pedidoActual.id);
    if (error) {
      alert('Error al guardar los cambios: ' + error.message);
    } else {
      cerrarModalEditar();
      mostrarExito('¡Pedido actualizado correctamente!');
      cargarPedidos();
    }
  };

  const abrirConfirmEliminar = (pedidoId) => {
    setConfirmacionPendiente({
      isOpen: true,
      type: 'danger',
      pedidoId: pedidoId,
      action: 'eliminar',
    });
  };

  const confirmarEliminar = async () => {
    const { error } = await supabase.from('pedidos').delete().eq('id', confirmacionPendiente.pedidoId);
    setConfirmacionPendiente({ isOpen: false, type: null, pedidoId: null, action: null });
    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      mostrarExito('¡Pedido eliminado correctamente!');
      cargarPedidos();
    }
  };

  const abrirConfirmPagar = (pedidoId) => {
    setConfirmacionPendiente({
      isOpen: true,
      type: 'warning',
      pedidoId: pedidoId,
      action: 'pagar',
    });
  };

  const confirmarPagar = async () => {
    const { error } = await supabase.from('pedidos').update({ estado_pago: true }).eq('id', confirmacionPendiente.pedidoId);
    setConfirmacionPendiente({ isOpen: false, type: null, pedidoId: null, action: null });
    if (error) {
      alert('Error al actualizar: ' + error.message);
    } else {
      mostrarExito('¡Pedido marcado como pagado!');
      cargarPedidos();
    }
  };

  const cerrarConfirmacion = () => {
    setConfirmacionPendiente({ isOpen: false, type: null, pedidoId: null, action: null });
  };

  const mostrarExito = (mensaje) => {
    setModalExito({
      isOpen: true,
      mensaje: mensaje,
    });
    setTimeout(() => {
      setModalExito({ isOpen: false, mensaje: '' });
    }, 1200);
  };

  const cerrarModalExito = () => {
    setModalExito({ isOpen: false, mensaje: '' });
  };

  const handleConfirm = () => {
    if (confirmacionPendiente.action === 'eliminar') {
      confirmarEliminar();
    } else if (confirmacionPendiente.action === 'pagar') {
      confirmarPagar();
    }
  };

  async function cargarPedidos() {
    setLoading(true);
    const { data, error } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error cargando pedidos:', error);
    } else {
      setPedidos(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    cargarPedidos();
    const handleNuevoPedido = () => cargarPedidos();
    window.addEventListener('pedidoAgregado', handleNuevoPedido);
    return () => {
      window.removeEventListener('pedidoAgregado', handleNuevoPedido);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">📋 Lista de Pedidos</h2>
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-slate-100 border-b-2 border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600 uppercase tracking-wider">Responsable</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-600 uppercase tracking-wider">Marcar Pago</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Cargando...</td></tr>
              ) : pedidos.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">No hay pedidos registrados.</td></tr>
              ) : (
                pedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{pedido.nombre_cliente}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{pedido.responsable}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${pedido.estado_pago ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {pedido.estado_pago ? 'Pagado' : 'Debe'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {!pedido.estado_pago ? (
                        <button onClick={() => abrirConfirmPagar(pedido.id)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md transition-colors">
                          Pagar
                        </button>
                      ) : (
                        <span className="text-green-500 font-bold">✓ Completado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => abrirModalEditar(pedido)} className="p-2 rounded-full text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors" aria-label="Editar pedido">
                          ✏️
                        </button>
                        <button onClick={() => abrirConfirmEliminar(pedido.id)} className="p-2 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors" aria-label="Eliminar pedido">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición */}
      <ModalEditar
        pedido={pedidoActual}
        onClose={cerrarModalEditar}
        onSave={guardarCambios}
      />

      {/* Modal de Confirmación */}
      <ConfirmModal
        isOpen={confirmacionPendiente.isOpen}
        onClose={cerrarConfirmacion}
        onConfirm={handleConfirm}
        type={confirmacionPendiente.type}
        title={
          confirmacionPendiente.action === 'eliminar'
            ? '⚠️ Eliminar Pedido'
            : confirmacionPendiente.action === 'pagar'
            ? 'Marcar como Pagado'
            : 'Confirmar'
        }
        message={
          confirmacionPendiente.action === 'eliminar'
            ? 'Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este pedido?'
            : confirmacionPendiente.action === 'pagar'
            ? '¿Estás seguro de que quieres marcar este pedido como pagado?'
            : 'Por favor confirma tu acción.'
        }
      />

      {/* Modal de Éxito */}
      {modalExito.isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={cerrarModalExito}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm animate-in fade-in zoom-in duration-300 p-8 text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">¡Éxito!</h3>
              <p className="text-slate-600 mb-6">{modalExito.mensaje}</p>
              <button 
                onClick={cerrarModalExito}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TablaPedidos;