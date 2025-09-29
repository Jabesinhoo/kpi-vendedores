// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import useTheme from "./hooks/useTheme"; // 👈 Importamos el hook

function App() {
  // 💥 ESTE ES EL PASO CRÍTICO: Llama el hook para obtener el estado y el toggle
  const [theme, toggleTheme] = useTheme(); 

  return (
    <BrowserRouter>
      <Routes>
        {/* 💥 PASAMOS LAS PROPIEDADES A LOS COMPONENTES DE PÁGINA */}
        <Route 
          path="/" 
          element={<Login toggleTheme={toggleTheme} currentTheme={theme} />} 
        />
        <Route 
          path="/register" 
          element={<Register toggleTheme={toggleTheme} currentTheme={theme} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;