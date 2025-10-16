// src/components/ConfirmModal.jsx
import { AlertTriangle, CheckCircle } from 'lucide-react';

function ConfirmModal({ isOpen, onClose, onConfirm, type, title, message }) {
  if (!isOpen) return null;

  const isDanger = type === 'danger';

  // Define los estilos según el tipo de modal
  const styles = {
    iconContainer: isDanger ? 'bg-red-100' : 'bg-green-100',
    icon: isDanger ? 'text-red-600' : 'text-green-600',
    confirmButton: isDanger 
      ? 'bg-red-600 hover:bg-red-700' 
      : 'bg-green-500 hover:bg-green-600',
  };

  return (
    // Fondo con desenfoque
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center">
        {/* Ícono */}
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${styles.iconContainer}`}>
          {isDanger ? <AlertTriangle className={styles.icon} size={40} /> : <CheckCircle className={styles.icon} size={40} />}
        </div>

        {/* Título y Mensaje */}
        <h3 className="mt-5 text-2xl font-bold text-gray-900">{title}</h3>
        <p className="mt-3 text-gray-600">{message}</p>

        {/* Botones de Acción - Ahora siempre muestra ambos */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 text-white font-semibold rounded-lg transition-colors ${styles.confirmButton}`}
          >
            {isDanger ? 'Sí, eliminar' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;