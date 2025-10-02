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
    BarChart3
} from 'lucide-react';
import { formatPesos, calcularComision, calcularKPIs } from '../utils/formatters';

const Dashboard = () => {
    const [vendedores, setVendedores] = useState([]);
    const [vendedorSeleccionado, setVendedorSeleccionado] = useState('');
    const [estadisticas, setEstadisticas] = useState(null);
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());

    useEffect(() => {
        cargarVendedores();
    }, []);

    useEffect(() => {
        if (vendedorSeleccionado) {
            cargarEstadisticasVendedor();
        }
    }, [vendedorSeleccionado, mes, anio]);

    const cargarVendedores = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/vendedores`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });


            if (response.ok) {
                const data = await response.json();
                setVendedores(data.data);
                if (data.data.length > 0 && !vendedorSeleccionado) {
                    setVendedorSeleccionado(data.data[0].id);
                }
            }
        } catch (error) {
            console.error('Error cargando vendedores:', error);
        }
    };

    const cargarEstadisticasVendedor = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/dashboard/${vendedorSeleccionado}/${mes}/${anio}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.ok) {
                const data = await response.json();
                setEstadisticas(data.data);
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    };

    const getVendedorNombre = () => {
        const vendedor = vendedores.find(v => v.id === vendedorSeleccionado);
        return vendedor ? vendedor.nombre : 'Seleccionar vendedor';
    };

    if (!estadisticas) {
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

    const { ventasTotales, kpis, comision, ventasDiarias, diasTrabajados, totalDias } = estadisticas;

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
                                <p className="text-2xl font-bold mt-1">{formatPesos(ventasTotales)}</p>
                                <div className="flex items-center mt-2 text-blue-100">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    <span className="text-sm">
                                        Comisión {comision.porcentaje}%: {formatPesos(comision.monto)}
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
                                <p className="text-2xl font-bold mt-1">{kpis.kpiVentas.toFixed(0)}%</p>
                                <div className="flex items-center mt-2 text-green-100">
                                    <Target className="h-4 w-4 mr-1" />
                                    <span className="text-sm">
                                        {kpis.diaLibre ? '✅ Día libre' : 'Sin día libre'}
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
                                <p className="text-orange-100 text-sm">Asistencia y Área de Trabajo</p>
                                <p className="text-2xl font-bold mt-1">{kpis.kpiAsistenciaConducta.toFixed(0)}%</p>
                                <div className="flex items-center mt-2 text-orange-100">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span className="text-sm">
                                        {diasTrabajados}/{totalDias} asistencias
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
                                <p className="text-2xl font-bold mt-1">{kpis.kpiTotal.toFixed(0)}%</p>
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
                {/* Gráfica de Ventas Diarias */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Ventas Diarias
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-end justify-between gap-1">
                            {ventasDiarias.map((venta, index) => (
                                <div key={index} className="flex flex-col items-center flex-1">
                                    <div
                                        className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600 cursor-pointer"
                                        style={{
                                            height: `${(venta.montoVenta / 5000000) * 100}%`,
                                            maxHeight: '200px'
                                        }}
                                        title={`${new Date(venta.fecha).getDate()}: ${formatPesos(venta.montoVenta)}`}
                                    />
                                    <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                                        {new Date(venta.fecha).getDate()}
                                    </span>
                                </div>
                            ))}
                        </div>
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
                                    <span>Ventas ({kpis.kpiVentas.toFixed(0)}%)</span>
                                    <span>70% máximo</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{ width: `${(kpis.kpiVentas / 70) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Asistencia y Área de trabajo ({kpis.kpiAsistenciaConducta.toFixed(0)}%)</span>
                                    <span>10% máximo</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full transition-all"
                                        style={{ width: `${(kpis.kpiAsistenciaConducta / 10) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="pt-4 border-t dark:border-gray-700">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold">KPI Total</span>
                                    <span className="font-semibold">{kpis.kpiTotal.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-blue-600 to-green-600 h-3 rounded-full transition-all"
                                        style={{ width: `${kpis.kpiTotal}%` }}
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
                                {ventasDiarias.map((venta) => (
                                    <tr key={venta.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="p-3">
                                            {new Date(venta.fecha).toLocaleDateString('es', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </td>
                                        <td className="p-3 font-medium">{formatPesos(venta.montoVenta)}</td>
                                        <td className="p-3">
                                            {venta.asistencia ? (
                                                <span className="text-green-600">✅</span>
                                            ) : (
                                                <span className="text-red-600">❌</span>
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