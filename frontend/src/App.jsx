import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Vendedores from "./pages/Vendedores.jsx";
import RegistroVentas from "./pages/RegistroVentas.jsx";
import useTheme from "./hooks/useTheme";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout.jsx";

function App() {
  const [theme, toggleTheme] = useTheme();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login toggleTheme={toggleTheme} currentTheme={theme} />}
        />
        <Route
          path="/register"
          element={<Register toggleTheme={toggleTheme} currentTheme={theme} />}
        />
        
        {/* Rutas protegidas con Layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout theme={theme} toggleTheme={toggleTheme} />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vendedores" element={<Vendedores />} />
          <Route path="registro-ventas" element={<RegistroVentas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;