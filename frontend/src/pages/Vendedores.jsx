import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users, Calendar, XCircle, CheckCircle } from 'lucide-react';

const Vendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    fechaIngreso: new Date().toISOString().split('T')[0]
  });
  const [notification, setNotification] = useState({ message: '', type: '' }); // Estado para notificaciones

  useEffect(() => {
    cargarVendedores();
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVendedores(data.data);
      } else {
        console.error('Error al obtener vendedores:', response.statusText);
      }
    } catch (error) {
      console.error('Error cargando vendedores:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: '', type: '' }); // Limpiar notificaciones previas
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/kpi/vendedores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        showNotification(result.message || 'Vendedor creado con éxito.', 'success');
        
        setShowForm(false);
        setFormData({ nombre: '', fechaIngreso: new Date().toISOString().split('T')[0] });
        cargarVendedores();
      } else {
        const error = await response.json();
        showNotification(error.error || 'Error al crear el vendedor. Inténtelo de nuevo.', 'error');
      }
    } catch (error) {
      console.error('Error creando vendedor:', error);
      showNotification('Error de conexión con el servidor al crear el vendedor.', 'error');
    }
  };

  // Componente de Notificación
  const NotificationBanner = () => {
    if (!notification.message) return null;

    const Icon = notification.type === 'success' ? CheckCircle : XCircle;
    const colorClass = notification.type === 'success' 
      ? 'bg-green-100 text-green-700 border border-green-300' 
      : 'bg-red-100 text-red-700 border border-red-300';

    return (
      <div className={`p-3 rounded-lg flex items-center gap-2 ${colorClass}`}>
        <Icon className="h-5 w-5" />
        <p className="text-sm font-medium">{notification.message}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Vendedores</h1>
        <Button onClick={() => setShowForm(prev => !prev)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {showForm ? 'Ocultar Formulario' : 'Nuevo Vendedor'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar Nuevo Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <NotificationBanner /> {/* Mostrar notificación aquí */}
              
              <div>
                <Label htmlFor="nombre">Nombre del Vendedor</Label>
                <Input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                  placeholder="Ingrese el nombre completo"
                />
              </div>
              
              <div>
                <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
                <Input
                  type="date"
                  id="fechaIngreso"
                  value={formData.fechaIngreso}
                  onChange={(e) => setFormData({...formData, fechaIngreso: e.target.value})}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Guardar Vendedor</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Listado de Vendedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vendedores.map((vendedor) => (
          <Card key={vendedor.id} className="hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{vendedor.nombre}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID Interno: **{vendedor.id}**
                  </p>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4 border-t pt-3 mt-3">
                <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                **Ingreso:** {new Date(vendedor.fechaIngreso).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => window.location.href = `/dashboard?vendedorId=${vendedor.id}`}
                >
                  Ver Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = `/registro-ventas?vendedorId=${vendedor.id}`}
                >
                  Registrar Venta
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vendedores.length === 0 && !showForm && (
        <Card>
          <CardContent className="p-10 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">No hay vendedores registrados aún</h3>
            <p className="text-gray-500 mb-6">
              Haz clic en "Nuevo Vendedor" para empezar a gestionar tu equipo.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primer Vendedor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Vendedores;
