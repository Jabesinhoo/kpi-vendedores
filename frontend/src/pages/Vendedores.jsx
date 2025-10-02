import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Plus,
    Users,
    Calendar,
    XCircle,
    CheckCircle,
    Edit3,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Eye
} from 'lucide-react';

const Vendedores = () => {
    const [vendedores, setVendedores] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        nombre: ''
    });
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        cargarVendedores();
    }, []);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const cargarVendedores = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/kpi/vendedores`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            if (response.ok) {
                const data = await response.json();
                setVendedores(data.data);
            } else {
                console.error('Error al obtener vendedores:', response.statusText);
                showNotification('Error al cargar los vendedores', 'error');
            }
        } catch (error) {
            console.error('Error cargando vendedores:', error);
            showNotification('Error de conexión al cargar vendedores', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification({ message: '', type: '' });
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/kpi/vendedores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });


            if (response.ok) {
                const result = await response.json();
                showNotification(result.message || '✅ Vendedor creado exitosamente', 'success');

                setShowForm(false);
                setFormData({ nombre: '' });
                cargarVendedores();
            } else {
                const error = await response.json();
                showNotification(error.error || '❌ Error al crear el vendedor', 'error');
            }
        } catch (error) {
            console.error('Error creando vendedor:', error);
            showNotification('❌ Error de conexión con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleVendedorActivo = async (vendedorId, estadoActual) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}api/kpi/vendedores/${vendedorId}/toggle-activo`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                const result = await response.json();
                showNotification(result.message, 'success');
                cargarVendedores(); // Recargar la lista
            } else {
                const error = await response.json();
                showNotification(error.error || 'Error al cambiar estado', 'error');
            }
        } catch (error) {
            console.error('Error cambiando estado:', error);
            showNotification('Error de conexión', 'error');
        }
    };

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

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Gestión de Vendedores</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Administra el equipo de vendedores y sus métricas
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(prev => !prev)}
                    className="flex items-center gap-2"
                    disabled={loading}
                >
                    <Plus className="h-4 w-4" />
                    {showForm ? 'Cancelar' : 'Nuevo Vendedor'}
                </Button>
            </div>

            {/* Notificación */}
            <NotificationBanner />

            {/* Formulario de Nuevo Vendedor */}
            {showForm && (
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Agregar Nuevo Vendedor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="nombre" className="text-sm font-medium">
                                    Nombre del Vendedor *
                                </Label>
                                <Input
                                    type="text"
                                    id="nombre"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                    placeholder="Ingrese el nombre completo del vendedor"
                                    disabled={loading}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    type="submit"
                                    disabled={loading || !formData.nombre.trim()}
                                    className="flex items-center gap-2"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <Plus className="h-4 w-4" />
                                    )}
                                    {loading ? 'Creando...' : 'Guardar Vendedor'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowForm(false)}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
            {/* Estadísticas */}
            {vendedores.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>
                                    <strong>{vendedores.filter(v => v.activo).length}</strong> activos
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                <span>
                                    <strong>{vendedores.filter(v => !v.activo).length}</strong> inactivos
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span>
                                    <strong>{vendedores.length}</strong> total
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            {/* Listado de Vendedores */}
            {loading && vendedores.length === 0 ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando vendedores...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {vendedores.map((vendedor) => (
                        <Card
                            key={vendedor.id}
                            className={`hover:shadow-xl transition-all duration-300 border-l-4 ${vendedor.activo
                                ? 'border-l-green-500 hover:border-l-green-600'
                                : 'border-l-gray-400 hover:border-l-gray-500'
                                }`}
                        >
                            <CardContent className="p-6">
                                {/* Header con estado */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${vendedor.activo
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                {vendedor.nombre}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {vendedor.activo ? '🟢 Activo' : '⚫ Inactivo'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleVendedorActivo(vendedor.id, vendedor.activo)}
                                        className={`p-1 rounded-full transition-colors ${vendedor.activo
                                            ? 'text-green-600 hover:text-green-700'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        title={vendedor.activo ? 'Desactivar vendedor' : 'Activar vendedor'}
                                    >
                                        {vendedor.activo ?
                                            <ToggleRight className="h-5 w-5" /> :
                                            <ToggleLeft className="h-5 w-5" />
                                        }
                                    </button>
                                </div>

                                {/* Información adicional */}
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 border-t pt-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>Registrado: {formatFecha(vendedor.createdAt)}</span>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex flex-col gap-2 mt-4">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => window.location.href = `/dashboard?vendedor=${vendedor.id}`}
                                        className="flex items-center gap-2"
                                        disabled={!vendedor.activo}
                                    >
                                        <Eye className="h-3 w-3" />
                                        Ver Dashboard
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.location.href = `/registro-ventas?vendedor=${vendedor.id}`}
                                        className="flex items-center gap-2"
                                        disabled={!vendedor.activo}
                                    >
                                        <Edit3 className="h-3 w-3" />
                                        Registrar Venta
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Estado vacío */}
            {vendedores.length === 0 && !showForm && !loading && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">
                            No hay vendedores registrados
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Comienza agregando el primer vendedor a tu equipo para poder registrar ventas y métricas.
                        </p>
                        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 mx-auto">
                            <Plus className="h-4 w-4" />
                            Agregar Primer Vendedor
                        </Button>
                    </CardContent>
                </Card>
            )}


        </div>
    );
};

export default Vendedores;