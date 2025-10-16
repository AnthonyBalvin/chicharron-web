// src/components/Reportes.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, CheckCircle } from 'lucide-react';

// Función para formatear números como moneda (Soles)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount || 0);
};

function Reportes() {
  const [reportData, setReportData] = useState({
    totalVendido: 0,
    totalPagado: 0,
    totalDebe: 0,
    totalTransacciones: 0,
    porcentajePagado: 0,
    deudores: [],
    ultimosPagos: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReportData() {
      setLoading(true);
      const { data: pedidos, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching report data:', error);
        setLoading(false);
        return;
      }

      // Lógica de cálculo con datos reales
      let totalVendido = 0;
      let totalPagado = 0;
      const deudoresMap = new Map();
      const ultimosPagosList = [];

      pedidos.forEach(p => {
        totalVendido += p.monto || 0;
        if (p.estado_pago) {
          totalPagado += p.monto || 0;
          ultimosPagosList.push(p);
        } else {
          const deudaActual = deudoresMap.get(p.nombre_cliente) || 0;
          deudoresMap.set(p.nombre_cliente, deudaActual + (p.monto || 0));
        }
      });
      
      const deudoresOrdenados = Array.from(deudoresMap.entries())
        .map(([nombre, monto]) => ({ nombre, monto }))
        .sort((a, b) => b.monto - a.monto)
        .slice(0, 5);
        
      const porcentajePagadoNum = totalVendido > 0 ? (totalPagado / totalVendido) * 100 : 0;

      setReportData({
        totalVendido,
        totalPagado,
        totalDebe: totalVendido - totalPagado,
        totalTransacciones: pedidos.length,
        porcentajePagado: porcentajePagadoNum.toFixed(1),
        deudores: deudoresOrdenados,
        ultimosPagos: ultimosPagosList.slice(0, 5),
      });

      setLoading(false);
    }

    fetchReportData();
  }, []);

  if (loading) {
    return <div className="text-center p-10 text-gray-500">Analizando datos...</div>;
  }

  // --- El JSX que te gustó, ahora con datos reales ---
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Reporte de Ventas</h1>
        <p className="text-gray-600 mt-2">Resumen general de ventas y cobranzas en tiempo real.</p>
      </div>

      {/* SECCIÓN DE TOTALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white border border-blue-400 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-blue-100 font-semibold">Total Vendido</p>
              <p className="text-4xl font-extrabold mt-2">{formatCurrency(reportData.totalVendido)}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 p-3 rounded-xl"><DollarSign size={32} /></div>
          </div>
          <div className="text-blue-100 text-sm">{reportData.totalTransacciones} transacciones registradas</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white border border-green-400 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-green-100 font-semibold">Total Pagado</p>
              <p className="text-4xl font-extrabold mt-2">{formatCurrency(reportData.totalPagado)}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 p-3 rounded-xl"><CheckCircle size={32} /></div>
          </div>
          <div className="text-green-100 text-sm">{reportData.porcentajePagado}% de las ventas</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white border border-red-400 hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-red-100 font-semibold">Por Cobrar</p>
              <p className="text-4xl font-extrabold mt-2">{formatCurrency(reportData.totalDebe)}</p>
            </div>
            <div className="bg-red-400 bg-opacity-30 p-3 rounded-xl"><AlertCircle size={32} /></div>
          </div>
          <div className="text-red-100 text-sm">{(100 - reportData.porcentajePagado).toFixed(1)}% pendiente</div>
        </div>
      </div>

      {/* SECCIÓN DE LISTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg"><TrendingDown size={20} className="text-red-600" /></div>
            <h3 className="text-xl font-bold text-gray-800">Mayores Deudores</h3>
          </div>
          {reportData.deudores.length > 0 ? (
            <div className="space-y-4">
              {reportData.deudores.map((deudor, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <p className="font-semibold text-gray-800 truncate">{idx + 1}. {deudor.nombre}</p>
                  <p className="font-bold text-red-600 text-lg">{formatCurrency(deudor.monto)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12"><CheckCircle size={32} className="mx-auto text-green-500 mb-2" /><p className="text-gray-500 font-semibold">¡Nadie debe, todo está pagado! 🎉</p></div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg"><TrendingUp size={20} className="text-green-600" /></div>
            <h3 className="text-xl font-bold text-gray-800">Últimos Pagos</h3>
          </div>
          {reportData.ultimosPagos.length > 0 ? (
            <div className="space-y-4">
              {reportData.ultimosPagos.map((pago, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <p className="font-semibold text-gray-800 truncate">{pago.nombre_cliente}</p>
                  <p className="font-bold text-green-600 text-lg">{formatCurrency(pago.monto)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12"><AlertCircle size={32} className="mx-auto text-gray-400 mb-2" /><p className="text-gray-500 font-semibold">Aún no se han registrado pagos.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reportes;