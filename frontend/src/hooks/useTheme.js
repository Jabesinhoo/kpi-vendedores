import { useState, useEffect } from 'react';

export default function useTheme() {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Solo ejecutar en el cliente
    setMounted(true);
    
    // Detectar preferencia del sistema
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = systemPrefersDark ? 'dark' : 'light';
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    
    // Remover clases anteriores
    root.classList.remove('light', 'dark');
    // Añadir clase actual
    root.classList.add(theme);
    
    // Actualizar atributo data-theme para mejor compatibilidad
    root.setAttribute('data-theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(current => (current === 'light' ? 'dark' : 'light'));
  };

  // Retornar como array para usar con destructuring [theme, toggleTheme]
  return [mounted ? theme : 'light', toggleTheme];
}