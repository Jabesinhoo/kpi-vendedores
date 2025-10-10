import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    TrendingUp,
    Target,
    Calendar,
    DollarSign,
    Award,
    Users,
    PieChart,
    BarChart3,
    Grid,
    User
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Funciones auxiliares
const formatPesos = (valor) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor);
};

// Función segura para mostrar porcentajes
const safePercentage = (value, decimales = 1) => {
    if (value === undefined || value === null || isNaN(value)) return '0.0';
    return Number(value).toFixed(decimales);
};

const Dashboard = () => {
    const [vendedores, setVendedores] = useState([]);
    const [vendedorSeleccionado, setVendedorSeleccionado] = useState('todos');
    const [estadisticas, setEstadisticas] = useState(null);
    const [estadisticasTodos, setEstadisticasTodos] = useState([]);
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarVendedores();
    }, []);

    useEffect(() => {
        if (vendedorSeleccionado === 'todos') {
            cargarEstadisticasTodos();
        } else if (vendedorSeleccionado) {
            cargarEstadisticasVendedor();
        }
    }, [vendedorSeleccionado, mes, anio]);

    const cargarVendedores = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/kpi/vendedores`, {
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

    const cargarEstadisticasTodos = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const promesas = vendedores.map(vendedor =>
                fetch(
                    `${import.meta.env.VITE_API_URL}api/kpi/dashboard/${vendedor.id}/${mes}/${anio}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                ).then(res => res.json())
            );

            const resultados = await Promise.all(promesas);
            const estadisticasConNombre = resultados.map((resultado, index) => ({
                ...resultado.data,
                vendedorId: vendedores[index].id,
                vendedorNombre: vendedores[index].nombre
            }));

            setEstadisticasTodos(estadisticasConNombre);
        } catch (error) {
            console.error('Error cargando estadísticas de todos:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarEstadisticasVendedor = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}api/kpi/dashboard/${vendedorSeleccionado}/${mes}/${anio}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.ok) {
                const data = await response.json();
                setEstadisticas(data.data);
            } else {
                console.error('Error en respuesta del servidor:', response.status);
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    const getVendedorNombre = () => {
        if (vendedorSeleccionado === 'todos') return 'Todos los vendedores';
        const vendedor = vendedores.find(v => v.id === vendedorSeleccionado);
        return vendedor ? vendedor.nombre : 'Seleccionar vendedor';
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Dashboard KPI</h1>
                </div>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    // Vista de todos los vendedores
    if (vendedorSeleccionado === 'todos') {
        const totales = estadisticasTodos.reduce((acc, est) => ({
            ventas: acc.ventas + (est.ventasTotales || 0),
            comision: acc.comision + (est.comision?.monto || 0),
            kpiPromedio: acc.kpiPromedio + (est.kpis?.kpiTotal || 0)
        }), { ventas: 0, comision: 0, kpiPromedio: 0 });

        if (estadisticasTodos.length > 0) {
            totales.kpiPromedio = totales.kpiPromedio / estadisticasTodos.length;
        }

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard KPI</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {getVendedorNombre()} • {new Date(anio, mes - 1).toLocaleDateString('es', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <select
                            value={vendedorSeleccionado}
                            onChange={(e) => setVendedorSeleccionado(e.target.value)}
                            className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        >
                            <option value="todos">Todos los vendedores</option>
                            {vendedores.map(v => (
                                <option key={v.id} value={v.id}>{v.nombre}</option>
                            ))}
                        </select>

                        <select
                            value={mes}
                            onChange={(e) => setMes(parseInt(e.target.value))}
                            className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(2000, i).toLocaleString('es', { month: 'long' })}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            value={anio}
                            onChange={(e) => setAnio(parseInt(e.target.value))}
                            className="p-2 border rounded-lg w-24 dark:bg-gray-800 dark:border-gray-700"
                            min="2020"
                            max="2030"
                        />
                    </div>
                </div>

                {/* Tarjetas Totales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Ventas Totales</p>
                                    <p className="text-2xl font-bold mt-1">{formatPesos(totales.ventas)}</p>
                                    <div className="flex items-center mt-2 text-blue-100">
                                        <DollarSign className="h-4 w-4 mr-1" />
                                        <span className="text-sm">Comisión: {formatPesos(totales.comision)}</span>
                                    </div>
                                </div>
                                <TrendingUp className="h-8 w-8 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">KPI Promedio</p>
                                    <p className="text-2xl font-bold mt-1">{safePercentage(totales.kpiPromedio)}%</p>
                                    <div className="flex items-center mt-2 text-green-100">
                                        <Award className="h-4 w-4 mr-1" />
                                        <span className="text-sm">{estadisticasTodos.length} vendedores</span>
                                    </div>
                                </div>
                                <Award className="h-8 w-8 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Vendedores Activos</p>
                                    <p className="text-2xl font-bold mt-1">{estadisticasTodos.length}</p>
                                    <div className="flex items-center mt-2 text-purple-100">
                                        <Users className="h-4 w-4 mr-1" />
                                        <span className="text-sm">Este mes</span>
                                    </div>
                                </div>
                                <Users className="h-8 w-8 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabla de Vendedores */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Grid className="h-5 w-5" />
                            Resumen por Vendedor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b dark:border-gray-700">
                                        <th className="text-left p-3">Vendedor</th>
                                        <th className="text-right p-3">Ventas</th>
                                        <th className="text-right p-3">Comisión</th>
                                        <th className="text-right p-3">KPI Ventas</th>
                                        <th className="text-right p-3">KPI Asistencia</th>
                                        <th className="text-right p-3">KPI Total</th>
                                        <th className="text-center p-3">Día Libre</th>
                                        <th className="text-center p-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estadisticasTodos.map((est) => (
                                        <tr key={est.vendedorId} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="p-3 font-medium">{est.vendedorNombre}</td>
                                            <td className="p-3 text-right">{formatPesos(est.ventasTotales || 0)}</td>
                                            <td className="p-3 text-right">{formatPesos(est.comision?.monto || 0)}</td>
                                            <td className="p-3 text-right">
                                                <span className={`font-semibold ${(est.kpis?.kpiVentas || 0) >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                                                    {safePercentage(est.kpis?.kpiVentas)}%
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <span className={`font-semibold ${(est.kpis?.porcentajeAsistencia || 0) >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                                                    {safePercentage(est.kpis?.porcentajeAsistencia)}%
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <span className={`font-bold ${(est.kpis?.kpiTotal || 0) >= 80 ? 'text-green-600' : (est.kpis?.kpiTotal || 0) >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                                                    {safePercentage(est.kpis?.kpiTotal)}%
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                {est.kpis?.diaLibre ? '✅' : '❌'}
                                            </td>
                                            <td className="p-3 text-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setVendedorSeleccionado(est.vendedorId)}
                                                >
                                                    Ver detalle
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Vista individual de vendedor
    if (!estadisticas) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <p className="text-gray-600">No se encontraron datos para este vendedor.</p>
                </div>
            </div>
        );
    }

    const { ventasTotales, kpis, comision, ventasDiarias, diasTrabajados, totalDias } = estadisticas;

    // Usar valores por defecto si kpis es undefined
    const kpisData = kpis || {
        kpiVentas: 0,
        porcentajeAsistencia: 0,
        kpiConducta: 0,
        kpiTotal: 0,
        diaLibre: false,
        evaluacionPromedio: 0
    };

    // Preparar datos para la gráfica
    const datosGrafica = (ventasDiarias || []).map(venta => ({
        dia: new Date(venta.fecha).getDate(),
        ventas: venta.montoVenta || 0,
        fecha: new Date(venta.fecha).toLocaleDateString('es', { day: '2-digit', month: 'short' })
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard KPI</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {getVendedorNombre()} • {new Date(anio, mes - 1).toLocaleDateString('es', { month: 'long', year: 'numeric' })}
                    </p>
                </div>

                <div className="flex gap-4">
                    <select
                        value={vendedorSeleccionado}
                        onChange={(e) => setVendedorSeleccionado(e.target.value)}
                        className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    >
                        <option value="todos">Todos los vendedores</option>
                        {vendedores.map(v => (
                            <option key={v.id} value={v.id}>{v.nombre}</option>
                        ))}
                    </select>

                    <select
                        value={mes}
                        onChange={(e) => setMes(parseInt(e.target.value))}
                        className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(2000, i).toLocaleString('es', { month: 'long' })}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        value={anio}
                        onChange={(e) => setAnio(parseInt(e.target.value))}
                        className="p-2 border rounded-lg w-24 dark:bg-gray-800 dark:border-gray-700"
                        min="2020"
                        max="2030"
                    />
                </div>
            </div>

            {/* Tarjetas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Ventas del mes</p>
                                <p className="text-2xl font-bold mt-1">{formatPesos(ventasTotales || 0)}</p>
                                <div className="flex items-center mt-2 text-blue-100">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    <span className="text-sm">
                                        Comisión {(comision?.porcentaje || 0)}%: {formatPesos(comision?.monto || 0)}
                                    </span>
                                </div>
                            </div>
                            <TrendingUp className="h-8 w-8 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Cumplimiento Ventas</p>
                                <p className="text-2xl font-bold mt-1">{safePercentage(kpisData.kpiVentas)}%</p>
                                <div className="flex items-center mt-2 text-green-100">
                                    <Target className="h-4 w-4 mr-1" />
                                    <span className="text-sm">
                                        {kpisData.diaLibre ? 'Día libre' : 'Sin día libre'}
                                    </span>
                                </div>
                            </div>
                            <Target className="h-8 w-8 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Asistencia y Conducta</p>
                                <p className="text-2xl font-bold mt-1">{safePercentage(kpisData.porcentajeAsistencia)}%</p>
                                <div className="flex items-center mt-2 text-orange-100">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span className="text-sm">
                                        {(diasTrabajados || 0)}/{(totalDias || 0)} días • Conducta: {safePercentage(kpisData.kpiConducta)}%
                                    </span>
                                </div>
                            </div>
                            <Users className="h-8 w-8 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">KPI Total</p>
                                <p className="text-2xl font-bold mt-1">{safePercentage(kpisData.kpiTotal)}%</p>
                                <div className="flex items-center mt-2 text-purple-100">
                                    <Award className="h-4 w-4 mr-1" />
                                    <span className="text-sm">
                                        Meta: 120M • Escalón: 140M
                                    </span>
                                </div>
                            </div>
                            <Award className="h-8 w-8 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gráficas y Tabla */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfica de Ventas Diarias con Recharts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Ventas Diarias
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={datosGrafica}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="dia"
                                    label={{ value: 'Día del mes', position: 'insideBottom', offset: -5 }}
                                />
                                <YAxis
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                    label={{ value: 'Ventas (Millones)', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip
                                    formatter={(value) => formatPesos(value)}
                                    labelFormatter={(label) => `Día ${label}`}
                                />
                                <Bar dataKey="ventas" fill="#3b82f6" name="Ventas" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Distribución de KPIs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            Distribución KPI
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Ventas ({safePercentage(kpisData.kpiVentas)}%)</span>
                                    <span>Meta: {formatPesos(120000000)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{ width: `${Math.min(kpisData.kpiVentas, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Asistencia ({safePercentage(kpisData.porcentajeAsistencia)}%)</span>
                                    <span>{(diasTrabajados || 0)}/{(totalDias || 0)} días</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full transition-all"
                                        style={{ width: `${Math.min(kpisData.porcentajeAsistencia, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Conducta ({safePercentage(kpisData.kpiConducta)}%)</span>
                                    <span>Promedio: {(kpisData.evaluacionPromedio || 0).toFixed(1)}/5</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full transition-all"
                                        style={{ width: `${Math.min(kpisData.kpiConducta, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="pt-4 border-t dark:border-gray-700">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold">KPI Total</span>
                                    <span className="font-semibold">{safePercentage(kpisData.kpiTotal)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 h-3 rounded-full transition-all"
                                        style={{ width: `${Math.min(kpisData.kpiTotal, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabla de Ventas Diarias */}
            <Card>
                <CardHeader>
                    <CardTitle>Registro Diario - {new Date(anio, mes - 1).toLocaleDateString('es', { month: 'long', year: 'numeric' })}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="text-left p-3">Fecha</th>
                                    <th className="text-left p-3">Ventas</th>
                                    <th className="text-left p-3">Asistencia</th>
                                    <th className="text-left p-3">Aprendizaje</th>
                                    <th className="text-left p-3">Vestimenta</th>
                                    <th className="text-left p-3">Área</th>
                                    <th className="text-left p-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(ventasDiarias || []).map((venta) => (
                                    <tr key={venta.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="p-3">
                                            {new Date(venta.fecha).toLocaleDateString('es', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </td>
                                        <td className="p-3 font-medium">{formatPesos(venta.montoVenta || 0)}</td>
                                        <td className="p-3">
                                            {venta.asistencia ? (
                                                <span className="text-green-600">✓</span>
                                            ) : (
                                                <span className="text-red-600">✗</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {venta.aprendizajePuntuacion ? '⭐'.repeat(venta.aprendizajePuntuacion) : '-'}
                                        </td>
                                        <td className="p-3">
                                            {venta.vestimentaPuntuacion ? '⭐'.repeat(venta.vestimentaPuntuacion) : '-'}
                                        </td>
                                        <td className="p-3">
                                            {venta.areaPuntuacion ? '⭐'.repeat(venta.areaPuntuacion) : '-'}
                                        </td>
                                        <td className="p-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.location.href = `/registro-ventas?edit=${venta.id}`}
                                            >
                                                Editar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;