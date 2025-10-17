// src/components/Deudores.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserX, CheckCircle, CreditCard } from 'lucide-react';
import ConfirmModal from './ConfirmModal.jsx';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount || 0);
};

function Deudores() {
  const [deudores, setDeudores] = useState([]);
  const [totalDeuda, setTotalDeuda] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmacionPendiente, setConfirmacionPendiente] = useState({ isOpen: false });

  async function fetchDeudores() {
    setLoading(true);
    // 1. CAMBIO: Ahora también pedimos el 'responsable'
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('nombre_cliente, monto, responsable') // <-- Se añade 'responsable'
      .eq('estado_pago', false);

    if (error) {
      console.error('Error fetching deudores:', error);
      setLoading(false);
      return;
    }

    const deudoresMap = new Map();
    let deudaTotalCalculada = 0;

    // 2. CAMBIO: La lógica ahora guarda también los responsables
    pedidos.forEach(p => {
      deudaTotalCalculada += p.monto || 0;
      const deudorExistente = deudoresMap.get(p.nombre_cliente);

      if (deudorExistente) {
        // Si ya existe, actualizamos su monto y añadimos el responsable (si no está ya)
        deudorExistente.monto += p.monto || 0;
        deudorExistente.responsables.add(p.responsable);
      } else {
        // Si es nuevo, creamos la entrada
        deudoresMap.set(p.nombre_cliente, {
          monto: p.monto || 0,
          responsables: new Set([p.responsable]), // Usamos un Set para evitar duplicados
        });
      }
    });

    const deudoresOrdenados = Array.from(deudoresMap.entries())
      .map(([nombre, data]) => ({
        nombre,
        monto: data.monto,
        // Convertimos el Set de responsables a un texto legible
        responsables: Array.from(data.responsables).join(', '),
      }))
      .sort((a, b) => b.monto - a.monto);

    setDeudores(deudoresOrdenados);
    setTotalDeuda(deudaTotalCalculada);
    setLoading(false);
  }

  useEffect(() => {
    fetchDeudores();
  }, []);

  const handlePagarDeuda = (nombreDeudor) => {
    setConfirmacionPendiente({
      isOpen: true,
      type: 'warning',
      title: '💳 Confirmar Pago',
      message: `¿Saldar toda la deuda de ${nombreDeudor}?`,
      action: async () => {
        const { error } = await supabase
          .from('pedidos')
          .update({ estado_pago: true })
          .eq('nombre_cliente', nombreDeudor)
          .eq('estado_pago', false);
        
        setConfirmacionPendiente({ isOpen: false });
        if (error) {
          alert('Error al registrar el pago: ' + error.message);
        } else {
          alert('¡Deuda saldada!');
          fetchDeudores();
        }
      }
    });
  };

  const cerrarConfirmacion = () => {
    setConfirmacionPendiente({ isOpen: false });
  };

  if (loading) {
    return <div className="text-center p-10 text-gray-500">Buscando deudores...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Lista de Deudores</h1>
            <p className="text-gray-500 mt-1">
              {deudores.length > 0
                ? `${deudores.length} personas deben un total de `
                : 'No hay deudas pendientes.'}
              {deudores.length > 0 && <span className="font-bold text-red-600">{formatCurrency(totalDeuda)}</span>}
            </p>
          </div>
        </div>

        {deudores.length > 0 ? (
          <div className="space-y-4">
            {deudores.map((deudor, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-lg truncate">{idx + 1}. {deudor.nombre}</p>
                  {/* 3. CAMBIO: Mostramos los responsables */}
                  <p className="text-xs text-gray-500 truncate">Vendido por: {deudor.responsables}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-red-600 text-xl flex-shrink-0">{formatCurrency(deudor.monto)}</p>
                  <button
                    onClick={() => handlePagarDeuda(deudor.nombre)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold p-2 rounded-lg transition-colors"
                    aria-label={`Pagar deuda de ${deudor.nombre}`}
                  >
                    <CreditCard size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-800">¡Todo Pagado!</h3>
            <p className="text-gray-500 mt-2">No hay ninguna deuda pendiente en el sistema. 🎉</p>
          </div>
        )}
      </div>
      
      <ConfirmModal
        isOpen={confirmacionPendiente.isOpen}
        onClose={cerrarConfirmacion}
        onConfirm={confirmacionPendiente.action}
        type={confirmacionPendiente.type}
        title={confirmacionPendiente.title}
        message={confirmacionPendiente.message}
      />
    </div>
  );
}

export default Deudores;