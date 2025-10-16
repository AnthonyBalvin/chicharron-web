// src/components/TablaPedidos.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ModalEditar from './ModalEditar.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import { Pencil, Trash2, Search } from 'lucide-react';

function TablaPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [pedidoActual, setPedidoActual] = useState(null);
  const [filtro, setFiltro] = useState('todos');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [confirmacionPendiente, setConfirmacionPendiente] = useState({ isOpen: false, type: null, action: null });
  const [modalExito, setModalExito] = useState({ isOpen: false, mensaje: '' });

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

  const abrirConfirmacion = (actionType, pedidoId) => {
    let type = actionType === 'eliminar' ? 'danger' : 'warning';
    setConfirmacionPendiente({
      isOpen: true,
      type: type,
      pedidoId: pedidoId,
      action: actionType,
    });
  };

  const cerrarConfirmacion = () => {
    setConfirmacionPendiente({ isOpen: false, type: null, pedidoId: null, action: null });
  };

  const handleConfirm = async () => {
    const { action, pedidoId } = confirmacionPendiente;
    let error;
    let successMessage = '';
    
    if (action === 'eliminar') {
      const { error: deleteError } = await supabase.from('pedidos').delete().eq('id', pedidoId);
      error = deleteError;
      successMessage = '¡Pedido eliminado correctamente!';
    } else if (action === 'pagar') {
      const { error: payError } = await supabase.from('pedidos').update({ estado_pago: true }).eq('id', pedidoId);
      error = payError;
      successMessage = '¡Pedido marcado como pagado!';
    } else if (action === 'entregar') {
      const { error: deliverError } = await supabase.from('pedidos').update({ estado_entrega: true }).eq('id', pedidoId);
      error = deliverError;
      successMessage = '¡Pedido marcado como entregado!';
    }

    cerrarConfirmacion();
    if (error) {
      alert('Error: ' + error.message);
    } else {
      mostrarExito(successMessage);
      cargarPedidos();
    }
  };

  const mostrarExito = (mensaje) => {
    setModalExito({ isOpen: true, mensaje: mensaje });
    setTimeout(() => {
      setModalExito({ isOpen: false, mensaje: '' });
    }, 1200);
  };

  const cerrarModalExito = () => {
    setModalExito({ isOpen: false, mensaje: '' });
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
  
  const pedidosFiltrados = pedidos
    .filter((pedido) => {
      if (filtro === 'pendiente') return !pedido.estado_entrega;
      if (filtro === 'entregado') return pedido.estado_entrega;
      return true;
    })
    .filter((pedido) => {
      if (terminoBusqueda.trim() === '') return true;
      const busquedaLower = terminoBusqueda.toLowerCase();
      return (
        pedido.nombre_cliente.toLowerCase().includes(busquedaLower) ||
        pedido.responsable.toLowerCase().includes(busquedaLower)
      );
    });

  return (
    <div className="w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">📋 Lista de Pedidos</h2>
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por cliente o responsable..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="mb-6 flex gap-3 justify-center sm:justify-start flex-wrap">
        <button onClick={() => setFiltro('todos')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filtro === 'todos' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
          📦 Todos ({pedidos.length})
        </button>
        <button onClick={() => setFiltro('pendiente')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filtro === 'pendiente' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
          ⏳ Pendientes ({pedidos.filter(p => !p.estado_entrega).length})
        </button>
        <button onClick={() => setFiltro('entregado')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filtro === 'entregado' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
          ✅ Entregados ({pedidos.filter(p => p.estado_entrega).length})
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-slate-100 border-b-2 border-slate-200">
              <tr>
                <th className="p-4 text-left text-sm font-bold text-slate-600 uppercase">Cliente</th>
                <th className="p-4 text-center text-sm font-bold text-slate-600 uppercase">Cant.</th>
                <th className="p-4 text-center text-sm font-bold text-slate-600 uppercase">Pago</th>
                <th className="p-4 text-center text-sm font-bold text-slate-600 uppercase">Entrega</th>
                <th className="p-4 text-center text-sm font-bold text-slate-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Cargando...</td></tr>
              ) : pedidosFiltrados.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">No se encontraron pedidos.</td></tr>
              ) : (
                pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 whitespace-nowrap"><p className="font-medium text-gray-800">{pedido.nombre_cliente}</p><p className="text-xs text-gray-500">Resp: {pedido.responsable}</p></td>
                    <td className="p-4 text-center font-bold text-lg text-slate-700">{pedido.cantidad || 1}</td>
                    <td className="p-4 text-center">
                      {!pedido.estado_pago ? (
                        <button onClick={() => abrirConfirmacion('pagar', pedido.id)} className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-full">Pagar</button>
                      ) : (<span className="text-green-600 font-bold">Pagado</span>)}
                    </td>
                    <td className="p-4 text-center">
                      {!pedido.estado_entrega ? (
                        <button onClick={() => abrirConfirmacion('entregar', pedido.id)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-1 px-3 rounded-full">Entregar</button>
                      ) : (<span className="text-green-600 font-bold">Entregado</span>)}
                    </td>
                    <td className="p-4 text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => abrirModalEditar(pedido)} className="p-2 rounded-full text-blue-500 hover:bg-blue-100" aria-label="Editar"><Pencil size={16} /></button>
                        <button onClick={() => abrirConfirmacion('eliminar', pedido.id)} className="p-2 rounded-full text-red-500 hover:bg-red-100" aria-label="Eliminar"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ModalEditar pedido={pedidoActual} onClose={cerrarModalEditar} onSave={guardarCambios}/>
      <ConfirmModal
        isOpen={confirmacionPendiente.isOpen}
        onClose={cerrarConfirmacion}
        onConfirm={handleConfirm}
        type={confirmacionPendiente.type}
        title={
          confirmacionPendiente.action === 'eliminar' ? '⚠️ Eliminar Pedido' :
          confirmacionPendiente.action === 'pagar' ? '💳 Marcar como Pagado' :
          confirmacionPendiente.action === 'entregar' ? '📦 Marcar como Entregado' : 'Confirmar'
        }
        message={
          confirmacionPendiente.action === 'eliminar' ? 'Esta acción es irreversible. ¿Estás seguro?' :
          confirmacionPendiente.action === 'pagar' ? '¿Confirmas que este pedido ha sido pagado?' :
          confirmacionPendiente.action === 'entregar' ? '¿Confirmas la entrega de este pedido?' : 'Por favor confirma.'
        }
      />
      {modalExito.isOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={cerrarModalExito}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in fade-in zoom-in">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">¡Éxito!</h3>
              <p className="text-slate-600 mb-6">{modalExito.mensaje}</p>
              <button onClick={cerrarModalExito} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Cerrar</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TablaPedidos;