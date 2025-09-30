import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Target, DollarSign, Award } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVendedores: 0,
    totalVentasMes: 0,
    metaAlcanzada: 0,
    totalComisiones: 0,
    vendedoresMeta: 0
  });

  const [vendedoresDestacados, setVendedoresDestacados] = useState([]);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Cargar vendedores
      const vendedoresResponse = await fetch('http://localhost:5000/api/kpi/vendedores', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (vendedoresResponse.ok) {
        const vendedoresData = await vendedoresResponse.json();
        setStats(prev => ({
          ...prev,
          totalVendedores: vendedoresData.data.length
        }));
        
        // Cargar datos de cada vendedor para calcular estadísticas
        const vendedoresConDatos = await Promise.all(
          vendedoresData.data.map(async (vendedor) => {
            const hoy = new Date();
            const resumenResponse = await fetch(
              `http://localhost:5000/api/kpi/ventas-diarias/resumen/${vendedor.id}/${hoy.getMonth() + 1}/${hoy.getFullYear()}`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            if (resumenResponse.ok) {
              const resumenData = await resumenResponse.json();
              // Meta de ejemplo: 120
              const ventas = parseFloat(resumenData.data.resumen.totalVentas) || 0;
              return {
                ...vendedor,
                ventas: ventas,
                metaAlcanzada: ventas >= 120 
              };
            }
            return { ...vendedor, ventas: 0, metaAlcanzada: false };
          })
        );

        const totalVentas = vendedoresConDatos.reduce((sum, v) => sum + v.ventas, 0);
        const vendedoresMeta = vendedoresConDatos.filter(v => v.metaAlcanzada).length;
        
        setStats(prev => ({
          ...prev,
          totalVentasMes: totalVentas.toFixed(2),
          vendedoresMeta,
          metaAlcanzada: vendedoresData.data.length > 0 ? 
            (vendedoresMeta / vendedoresData.data.length) * 100 : 0
        }));

        // Ordenar vendedores por ventas (descendente)
        const destacados = vendedoresConDatos
          .sort((a, b) => b.ventas - a.ventas)
          .slice(0, 5);
        
        setVendedoresDestacados(destacados);
      } else {
         console.error('Error al cargar vendedores:', vendedoresResponse.statusText);
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard de KPIs</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tarjeta 1: Vendedores Activos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Vendedores Activos</p>
                <p className="text-2xl font-bold">{stats.totalVendedores}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta 2: Ventas del Mes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ventas del Mes</p>
                <p className="text-2xl font-bold">${stats.totalVentasMes}M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta 3: Meta Alcanzada (Porcentaje) */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Target className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Meta Alcanzada</p>
                <p className="text-2xl font-bold">{stats.metaAlcanzada.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">{stats.vendedoresMeta}/{stats.totalVendedores} vendedores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta 4: Vendedores con Meta Cumplida */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Vendedores con Meta</p>
                <p className="text-2xl font-bold">{stats.vendedoresMeta}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo: Vendedores Destacados */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Vendedores Destacados</h3>
              <div className="space-y-4">
                {vendedoresDestacados.map((vendedor, index) => (
                  <div key={vendedor.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <span className="font-medium">{vendedor.nombre}</span>
                        <p className="text-sm text-gray-500">
                          Ventas: ${vendedor.ventas.toFixed(2)}M • 
                          {vendedor.metaAlcanzada ? ' Cumplió Meta' : ' Pendiente de Meta'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = `/registro-ventas?vendedorId=${vendedor.id}`}
                    >
                      Registrar Venta
                    </Button>
                  </div>
                ))}
                {vendedoresDestacados.length === 0 && (
                    <p className="text-center text-gray-500">No hay datos de ventas disponibles para el ranking.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Derecho: Acciones Rápidas y Metas */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => window.location.href = '/registro-ventas'}
              >
                Registrar Venta
              </Button>
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={() => window.location.href = '/evaluaciones'}
              >
                Nueva Evaluación
              </Button>
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={() => window.location.href = '/vendedores'}
              >
                Gestionar Vendedores
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Recordatorio de Metas
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>120M = 70% cumplimiento + 1% comisión</li>
                <li>140M = 90% cumplimiento + día libre</li>
                <li>Evaluación = 10% restante</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;