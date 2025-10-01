import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
    Calendar, 
    DollarSign, 
    User, 
    XCircle, 
    CheckCircle, 
    Check, 
    X,
    Star,
    AlertTriangle,
    Save
} from 'lucide-react';
import { formatPesos, esDiaLaboral } from '../utils/formatters';

const RegistroVentas = () => {
    const [formData, setFormData] = useState({
        vendedorId: '',
        fecha: new Date().toISOString().split('T')[0],
        montoVenta: '',
        asistencia: true,
        aprendizajePuntuacion: 3,
        vestimentaPuntuacion: 3,
        areaPuntuacion: 3
    });
    
    const [vendedores, setVendedores] = useState([]);
    const [registrosRecientes, setRegistrosRecientes] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [esDiaNoLaboral, setEsDiaNoLaboral] = useState(false);
    const [registroExistente, setRegistroExistente] = useState(null);

    useEffect(() => {
        cargarVendedores();
        cargarRegistrosRecientes();
        
        // Obtener vendedorId de URL si existe
        const urlParams = new URLSearchParams(window.location.search);
        const vendedorId = urlParams.get('vendedor');
        if (vendedorId) {
            setFormData(prev => ({ ...prev, vendedorId }));
        }
    }, []);

    useEffect(() => {
        // Verificar si es día laboral cuando cambia la fecha
        const esLaboral = esDiaLaboral(formData.fecha);
        setEsDiaNoLaboral(!esLaboral);
        
        // Si hay vendedor seleccionado y fecha, buscar registro existente
        if (formData.vendedorId && formData.fecha) {
            cargarRegistroExistente();
        }
    }, [formData.fecha, formData.vendedorId]);

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
                setVendedores(data.data.filter(v => v.activo)); // Solo vendedores activos
            }
        } catch (error) {
            console.error('Error cargando vendedores:', error);
        }
    };

    const cargarRegistroExistente = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:5000/api/kpi/ventas-diarias/vendedor/${formData.vendedorId}/fecha/${formData.fecha}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    setRegistroExistente(data.data);
                    // Cargar datos existentes en el formulario
                    setFormData(prev => ({
                        ...prev,
                        montoVenta: data.data.montoVenta || '',
                        asistencia: data.data.asistencia,
                        aprendizajePuntuacion: data.data.aprendizajePuntuacion || 3,
                        vestimentaPuntuacion: data.data.vestimentaPuntuacion || 3,
                        areaPuntuacion: data.data.areaPuntuacion || 3
                    }));
                } else {
                    setRegistroExistente(null);
                    // Resetear form excepto vendedor y fecha
                    setFormData(prev => ({
                        ...prev,
                        montoVenta: '',
                        asistencia: true,
                        aprendizajePuntuacion: 3,
                        vestimentaPuntuacion: 3,
                        areaPuntuacion: 3
                    }));
                }
            }
        } catch (error) {
            console.error('Error cargando registro existente:', error);
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
                setRegistrosRecientes(data.data.slice(0, 8));
            }
        } catch (error) {
            console.error('Error cargando registros:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification({ message: '', type: '' });
        setLoading(true);
        
        if (!formData.vendedorId) {
            showNotification('Por favor seleccione un vendedor', 'error');
            setLoading(false);
            return;
        }

        if (esDiaNoLaboral) {
            showNotification('⚠️ Hoy es día no laboral. El registro es opcional.', 'warning');
        }

        // Validaciones
        if (formData.asistencia) {
            if (!formData.montoVenta || parseFloat(formData.montoVenta) < 0) {
                showNotification('Si el vendedor asistió, debe ingresar un monto de venta válido', 'error');
                setLoading(false);
                return;
            }
        } else {
            // Si no asistió, el monto debe ser 0
            setFormData(prev => ({ ...prev, montoVenta: '0' }));
        }

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
                    montoVenta: formData.asistencia ? parseFloat(formData.montoVenta) : 0,
                    asistencia: formData.asistencia,
                    aprendizajePuntuacion: formData.asistencia ? formData.aprendizajePuntuacion : null,
                    vestimentaPuntuacion: formData.asistencia ? formData.vestimentaPuntuacion : null,
                    areaPuntuacion: formData.asistencia ? formData.areaPuntuacion : null
                })
            });

            if (response.ok) {
                const result = await response.json();
                showNotification(
                    `${result.message} ${registroExistente ? '(Actualizado)' : '(Creado)'}`, 
                    'success'
                );
                
                cargarRegistrosRecientes();
                cargarRegistroExistente(); // Recargar registro existente
            } else {
                const error = await response.json();
                showNotification(error.error || 'Error al guardar el registro', 'error');
            }
        } catch (error) {
            console.error('Error guardando registro:', error);
            showNotification('Error de conexión con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getVendedorNombre = (vendedorId) => {
        const vendedor = vendedores.find(v => v.id === vendedorId);
        return vendedor ? vendedor.nombre : 'Vendedor no encontrado';
    };

    const StarRating = ({ value, onChange, label, disabled = false }) => (
        <div className="space-y-2">
            <Label className="text-sm font-medium">{label}</Label>
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => !disabled && onChange(star)}
                        className={`p-1 transition-transform hover:scale-110 ${
                            star <= value 
                                ? 'text-yellow-400' 
                                : 'text-gray-300 dark:text-gray-600'
                        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        disabled={disabled}
                    >
                        <Star className="h-6 w-6 fill-current" />
                    </button>
                ))}
            </div>
        </div>
    );

    const NotificationBanner = () => {
        if (!notification.message) return null;

        const Icon = notification.type === 'success' ? CheckCircle : 
                    notification.type === 'warning' ? AlertTriangle : XCircle;
        
        const colorClass = notification.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : notification.type === 'warning'
            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
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
                <div>
                    <h1 className="text-3xl font-bold">Registro Diario</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Registra ventas, asistencia y evaluación de conducta diaria
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulario Principal */}
                <Card className="lg:col-span-1">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <DollarSign className="h-5 w-5" />
                            {registroExistente ? 'Editar Registro' : 'Nuevo Registro'}
                            {registroExistente && (
                                <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    Editando
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Alerta día no laboral */}
                            {esDiaNoLaboral && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-yellow-800">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            ⚠️ Día no laboral - Registro opcional
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Vendedor */}
                            <div className="space-y-2">
                                <Label htmlFor="vendedorId" className="text-sm font-medium">
                                    Vendedor *
                                </Label>
                                <select
                                    id="vendedorId"
                                    value={formData.vendedorId}
                                    onChange={(e) => setFormData({...formData, vendedorId: e.target.value})}
                                    className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Seleccionar vendedor...</option>
                                    {vendedores.map(v => (
                                        <option key={v.id} value={v.id}>{v.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Fecha */}
                            <div className="space-y-2">
                                <Label htmlFor="fecha" className="text-sm font-medium">
                                    Fecha *
                                </Label>
                                <Input
                                    type="date"
                                    id="fecha"
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                                    required
                                    className="w-full p-3"
                                />
                            </div>

                            {/* Asistencia */}
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-full ${
                                        formData.asistencia 
                                            ? 'bg-green-100 text-green-600' 
                                            : 'bg-red-100 text-red-600'
                                    }`}>
                                        {formData.asistencia ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <Label htmlFor="asistencia" className="cursor-pointer font-medium text-base">
                                            {formData.asistencia ? 'Asistió al trabajo' : 'No asistió'}
                                        </Label>
                                        <p className="text-sm text-gray-500">
                                            {formData.asistencia ? 'Registro completo habilitado' : 'Solo registro de ausencia'}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    id="asistencia"
                                    checked={formData.asistencia}
                                    onCheckedChange={(checked) => setFormData(prev => ({ 
                                        ...prev, 
                                        asistencia: checked,
                                        montoVenta: checked ? prev.montoVenta : ''
                                    }))}
                                />
                            </div>

                            {/* Monto de Venta - Solo si asistió */}
                            {formData.asistencia && (
                                <div className="space-y-2">
                                    <Label htmlFor="montoVenta" className="text-sm font-medium">
                                        Monto de Ventas del Día *
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            step="1000"
                                            min="0"
                                            id="montoVenta"
                                            value={formData.montoVenta}
                                            onChange={(e) => setFormData({...formData, montoVenta: e.target.value})}
                                            placeholder="0"
                                            required
                                            className="w-full p-3 pr-24 text-lg font-semibold"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="text-gray-500 text-sm">COP</span>
                                        </div>
                                    </div>
                                    {formData.montoVenta && (
                                        <p className="text-sm text-green-600 font-medium">
                                            {formatPesos(parseFloat(formData.montoVenta))}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Evaluación de Conducta - Solo si asistió */}
                            {formData.asistencia && (
                                <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                                    <h3 className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                                        <Star className="h-4 w-4" />
                                        Evaluación de Conducta Diaria
                                    </h3>
                                    
                                    <StarRating
                                        value={formData.aprendizajePuntuacion}
                                        onChange={(value) => setFormData({...formData, aprendizajePuntuacion: value})}
                                        label="Aprendizaje - Nivel de aprovechamiento del día"
                                    />
                                    
                                    <StarRating
                                        value={formData.vestimentaPuntuacion}
                                        onChange={(value) => setFormData({...formData, vestimentaPuntuacion: value})}
                                        label="Vestimenta - Presentación personal adecuada"
                                    />
                                    
                                    <StarRating
                                        value={formData.areaPuntuacion}
                                        onChange={(value) => setFormData({...formData, areaPuntuacion: value})}
                                        label="Área de Trabajo - Orden y limpieza"
                                    />
                                </div>
                            )}

                            {/* Notificación */}
                            <NotificationBanner />

                            {/* Botón de Envío */}
                            <Button 
                                type="submit" 
                                className="w-full py-3 text-lg font-semibold"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Guardando...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Save className="h-4 w-4" />
                                        {registroExistente ? 'Actualizar Registro' : 'Guardar Registro'}
                                    </div>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Registros Recientes */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Registros Recientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {registrosRecientes.map((registro) => (
                                <div key={registro.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="font-semibold">
                                                {getVendedorNombre(registro.vendedorId)}
                                            </span>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-xs ${
                                            registro.asistencia 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {registro.asistencia ? 'Presente' : 'Ausente'}
                                        </div>
                                    </div>
                                    
                                    <div className="text-sm text-gray-600 mb-2">
                                        {new Date(registro.fecha).toLocaleDateString('es', {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </div>

                                    {registro.asistencia && (
                                        <>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-semibold text-green-600 text-lg">
                                                    {formatPesos(registro.montoVenta)}
                                                </span>
                                            </div>
                                            
                                            <div className="flex gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 text-yellow-400" />
                                                    <span>A: {registro.aprendizajePuntuacion}/5</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 text-yellow-400" />
                                                    <span>V: {registro.vestimentaPuntuacion}/5</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 text-yellow-400" />
                                                    <span>Á: {registro.areaPuntuacion}/5</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            
                            {registrosRecientes.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>No hay registros recientes</p>
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