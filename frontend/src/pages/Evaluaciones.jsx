import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardCheck, Star, Calendar, XCircle, CheckCircle } from 'lucide-react';

const Evaluaciones = () => {
  const [formData, setFormData] = useState({
    vendedorId: '',
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    aprendizajePuntuacion: 3,
    vestimentaAreaPuntuacion: 3
  });
  
  const [vendedores, setVendedores] = useState([]);
  const [evaluacionesRecientes, setEvaluacionesRecientes] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' }); // Nuevo estado para notificaciones

  useEffect(() => {
    cargarVendedores();
    cargarEvaluacionesRecientes();
  }, []);

  // Función para mostrar notificaciones temporalmente
  const showNotification = (message, type) => {
    setNotification({ message, type });
    // Ocultar notificación después de 5 segundos
    setTimeout(() => setNotification({ message: '', type: '' }), 5000); 
  };

  const cargarVendedores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/kpi/vendedores', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVendedores(data.data);
      } else {
        // Manejo de error silencioso o en consola para carga de datos
        console.error('Error cargando vendedores:', response.statusText);
      }
    } catch (error) {
      console.error('Error cargando vendedores:', error);
    }
  };

  const cargarEvaluacionesRecientes = async () => {
    try {
      const token = localStorage.getItem('token');
      // Endpoint para todas las evaluaciones recientes
      const response = await fetch('http://localhost:5000/api/kpi/evaluaciones-mensuales', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Asumiendo que data.data es el array de evaluaciones
        setEvaluacionesRecientes(data.data.slice(0, 10)); 
      } else {
        console.error('Error cargando evaluaciones recientes:', response.statusText);
      }
    } catch (error) {
      console.error('Error cargando evaluaciones:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: '', type: '' }); // Limpiar notificaciones previas
    
    if (!formData.vendedorId) {
      showNotification('Por favor seleccione un vendedor para continuar.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/kpi/evaluaciones-mensuales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          // Asegurar que los campos numéricos se envíen como números
          mes: parseInt(formData.mes), 
          anio: parseInt(formData.anio),
          aprendizajePuntuacion: parseInt(formData.aprendizajePuntuacion),
          vestimentaAreaPuntuacion: parseInt(formData.vestimentaAreaPuntuacion)
        })
      });

      if (response.ok) {
        const result = await response.json();
        showNotification(result.message || 'Evaluación guardada con éxito.', 'success');
        
        // Resetear el formulario (manteniendo mes/año actual)
        setFormData(prev => ({
          vendedorId: '',
          mes: new Date().getMonth() + 1,
          anio: new Date().getFullYear(),
          aprendizajePuntuacion: 3,
          vestimentaAreaPuntuacion: 3
        }));
        cargarEvaluacionesRecientes();
      } else {
        const error = await response.json();
        showNotification(error.error || 'Error al guardar la evaluación. Inténtelo de nuevo.', 'error');
      }
    } catch (error) {
      console.error('Error guardando evaluación:', error);
      showNotification('Error de conexión con el servidor al intentar guardar la evaluación.', 'error');
    }
  };

  const getVendedorNombre = (vendedorId) => {
    // Usamos vendors.find. Dado que la carga de vendedores es asíncrona, 
    // necesitamos asegurarnos de que el ID es un número para la comparación.
    const vendedor = vendedores.find(v => v.id === parseInt(vendedorId));
    return vendedor ? vendedor.nombre : `Vendedor ID ${vendedorId}`;
  };

  // Componente StarRating (sin cambios, ya que no usa alerts ni emojis)
  const StarRating = ({ value, onChange, label }) => (
    <div>
      <Label>{label}</Label>
      <div className="flex space-x-1 mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 transition-colors ${
              star <= value 
                ? 'text-yellow-400' 
                : 'text-gray-300 dark:text-gray-600'
            }`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Registro de Evaluación Mensual</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* === Formulario de Nueva Evaluación === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Registrar Evaluación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Vendedor Select */}
              <div>
                <Label htmlFor="vendedorId">Vendedor</Label>
                <select
                  id="vendedorId"
                  value={formData.vendedorId}
                  onChange={(e) => setFormData({...formData, vendedorId: e.target.value})}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 mt-1"
                  required
                >
                  <option value="">Seleccionar vendedor...</option>
                  {vendedores.map(v => (
                    <option key={v.id} value={v.id}>{v.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Mes y Año */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mes">Mes</Label>
                  <select
                    id="mes"
                    value={formData.mes}
                    onChange={(e) => setFormData({...formData, mes: e.target.value})}
                    className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 mt-1"
                    required
                  >
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i+1} value={i+1}>
                        {new Date(2000, i).toLocaleString('es', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="anio">Año</Label>
                  <Input
                    type="number"
                    id="anio"
                    value={formData.anio}
                    onChange={(e) => setFormData({...formData, anio: e.target.value})}
                    min="2020"
                    max="2030"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Puntuación de Aprendizaje */}
              <StarRating
                value={formData.aprendizajePuntuacion}
                onChange={(value) => setFormData({...formData, aprendizajePuntuacion: value})}
                label="Puntuación: Aprendizaje (1-5)"
              />

              {/* Puntuación de Vestimenta/Área */}
              <StarRating
                value={formData.vestimentaAreaPuntuacion}
                onChange={(value) => setFormData({...formData, vestimentaAreaPuntuacion: value})}
                label="Puntuación: Vestimenta y Área de Trabajo (1-5)"
              />
              
              {/* Notificación */}
              {notification.message && (
                <div 
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    notification.type === 'success' 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : 'bg-red-100 text-red-700 border border-red-300'
                  }`}
                >
                  {notification.type === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <p className="text-sm font-medium">{notification.message}</p>
                </div>
              )}

              {/* Botón de Submit */}
              <Button type="submit" className="w-full">
                Guardar Evaluación
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* === Evaluaciones Recientes === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Evaluaciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evaluacionesRecientes.map((evaluacion) => (
                <div key={evaluacion.id} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-base">
                      {getVendedorNombre(evaluacion.vendedorId)}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {evaluacion.mes}/{evaluacion.anio}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                        **Aprendizaje:** {evaluacion.aprendizajePuntuacion}/5
                    </div>
                    <div>
                        **Vestimenta/Área:** {evaluacion.vestimentaAreaPuntuacion}/5
                    </div>
                  </div>
                </div>
              ))}
              
              {evaluacionesRecientes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aún no se han registrado evaluaciones recientes.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Evaluaciones;