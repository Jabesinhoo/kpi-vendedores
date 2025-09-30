import { useState, useEffect } from 'react';

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    // 1. Cargar el tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // 2. Usar preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [mounted, setMounted] = useState(false);

  const toggleTheme = () => {
    setTheme(current => (current === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    setMounted(true);
    const root = window.document.documentElement;
    
    // Remover clases anteriores
    root.classList.remove('light', 'dark');
    // Añadir clase actual
    root.classList.add(theme);
    
    // Guardar preferencia
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Evitar renderizado hasta montaje en cliente
  return [mounted ? theme : 'light', toggleTheme];
}