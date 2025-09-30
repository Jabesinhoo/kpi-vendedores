import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar, DollarSign, User, XCircle, CheckCircle, Check, X } from 'lucide-react';

const RegistroVentas = () => {
  const [formData, setFormData] = useState({
    vendedorId: '',
    fecha: new Date().toISOString().split('T')[0],
    montoVentaMillones: '',
    asistencia: true
  });
  
  const [vendedores, setVendedores] = useState([]);
  const [registrosRecientes, setRegistrosRecientes] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' }); // Estado para notificaciones

  useEffect(() => {
    cargarVendedores();
    cargarRegistrosRecientes();
    
    // Obtener vendedorId de URL si existe
    const urlParams = new URLSearchParams(window.location.search);
    const vendedorId = urlParams.get('vendedorId');
    if (vendedorId) {
      // Asegurar que el ID del vendedor es un string válido antes de setearlo
      setFormData(prev => ({ ...prev, vendedorId: String(vendedorId) }));
    }
  }, []);

  // Función para mostrar notificaciones temporalmente
  const showNotification = (message, type) => {
    setNotification({ message, type });
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
      }
    } catch (error) {
      console.error('Error cargando vendedores:', error);
    }
  };

  const cargarRegistrosRecientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/kpi/ventas-diarias/vendedor/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Asumiendo que data.data es el array de registros
        setRegistrosRecientes(data.data.slice(0, 10));
      }
    } catch (error) {
      console.error('Error cargando registros:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: '', type: '' }); // Limpiar notificaciones previas
    
    if (!formData.vendedorId) {
      showNotification('Por favor seleccione un vendedor para continuar.', 'error');
      return;
    }
    
    // Validar monto para ventas
    if (formData.asistencia && (!formData.montoVentaMillones || parseFloat(formData.montoVentaMillones) <= 0)) {
        showNotification('El monto de venta no puede estar vacío o ser cero si el vendedor asistió.', 'error');
        return;
    }
    
    // Si no asistió, el monto debe ser cero
    const montoFinal = formData.asistencia ? parseFloat(formData.montoVentaMillones) : 0;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/kpi/ventas-diarias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vendedorId: formData.vendedorId,
          fecha: formData.fecha,
          montoVentaMillones: montoFinal,
          asistencia: formData.asistencia
        })
      });

      if (response.ok) {
        const result = await response.json();
        showNotification(result.message || 'Registro de venta guardado con éxito.', 'success');
        
        // Resetear el formulario, manteniendo el vendedor seleccionado para registros continuos
        setFormData(prev => ({
          vendedorId: prev.vendedorId, 
          fecha: new Date().toISOString().split('T')[0],
          montoVentaMillones: '',
          asistencia: true
        }));
        cargarRegistrosRecientes();
      } else {
        const error = await response.json();
        showNotification(error.error || 'Error al guardar el registro. Inténtelo de nuevo.', 'error');
      }
    } catch (error) {
      console.error('Error guardando registro:', error);
      showNotification('Error de conexión con el servidor al intentar guardar el registro.', 'error');
    }
  };

  const getVendedorNombre = (vendedorId) => {
    const vendedor = vendedores.find(v => v.id === parseInt(vendedorId));
    return vendedor ? vendedor.nombre : `Vendedor ID ${vendedorId}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Registro de Ventas Diarias</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* === Formulario de Nueva Venta === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Nueva Venta o Registro de Asistencia
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
                  // Deshabilitar si se pasó por URL y el usuario no lo debe cambiar
                  // disabled={!!new URLSearchParams(window.location.search).get('vendedorId')}
                >
                  <option value="">Seleccionar vendedor...</option>
                  {vendedores.map(v => (
                    <option key={v.id} value={v.id}>{v.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <Label htmlFor="fecha">Fecha del Registro</Label>
                <Input
                  type="date"
                  id="fecha"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              
              {/* Asistencia Switch */}
              <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center space-x-2">
                  <span className={`h-5 w-5 ${formData.asistencia ? 'text-green-500' : 'text-red-500'}`}>
                     {formData.asistencia ? <Check /> : <X />}
                  </span>
                  <Label htmlFor="asistencia" className="cursor-pointer font-medium">
                    {formData.asistencia ? 'Asistencia: Presente' : 'Asistencia: Ausente'}
                  </Label>
                </div>
                <Switch
                  id="asistencia"
                  checked={formData.asistencia}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      asistencia: checked,
                      // Limpiar monto si marca como "Ausente"
                      montoVentaMillones: checked ? prev.montoVentaMillones : ''
                  }))}
                />
              </div>

              {/* Monto de Venta (condicional) */}
              {formData.asistencia && (
                  <div>
                    <Label htmlFor="montoVentaMillones">Monto de Venta (Millones)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      id="montoVentaMillones"
                      value={formData.montoVentaMillones}
                      onChange={(e) => setFormData({...formData, montoVentaMillones: e.target.value})}
                      placeholder="Ej: 5.25"
                      required={formData.asistencia} // Es requerido solo si asistió
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ingrese el valor de venta en millones de la unidad de moneda.</p>
                  </div>
              )}
              
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
                Guardar Registro Diario
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* === Registros Recientes === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Últimos Registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {registrosRecientes.map((registro) => (
                <div key={registro.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-base">
                        {getVendedorNombre(registro.vendedorId)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(registro.fecha).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600 dark:text-green-400">
                      ${parseFloat(registro.montoVentaMillones).toFixed(2)}M
                    </p>
                    <div className={`text-xs flex items-center gap-1 mt-0.5 ${registro.asistencia ? 'text-green-500' : 'text-red-500'}`}>
                      {registro.asistencia ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {registro.asistencia ? 'Asistió' : 'Ausente'}
                    </div>
                  </div>
                </div>
              ))}
              
              {registrosRecientes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No se han encontrado registros de ventas recientes.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistroVentas;