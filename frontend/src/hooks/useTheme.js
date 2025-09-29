// src/hooks/useTheme.js
import { useState, useEffect } from 'react';

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    // 1. Cargar el tema guardado en la sesión (localStorage)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // 2. Si no hay preferencia guardada, usar la del sistema operativo
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    setTheme(current => (current === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // 🔥 EL PASO CRÍTICO: Añadir o remover la clase 'dark' al <html>
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Guardar la preferencia
    localStorage.setItem('theme', theme);
  }, [theme]);

  return [theme, toggleTheme];
}