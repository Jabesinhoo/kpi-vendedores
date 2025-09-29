import { useState } from "react";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("registrador");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, usuario, password, rol }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Usuario registrado con éxito");
      } else {
        alert("❌ " + data.error);
      }
    } catch (err) {
      alert("Error conectando con el servidor");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-10 animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">KPI</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-4">Crear cuenta</h1>
          <p className="text-purple-200">Únete y gestiona tus métricas</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              placeholder="Ingresa tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1">
              Usuario
            </label>
            <input
              type="text"
              placeholder="Elige tu usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Crea tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1">
              Rol
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="registrador" className="bg-slate-900">
                Registrador
              </option>
              <option value="admin" className="bg-slate-900">
                Admin
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Crear cuenta
          </button>
        </form>

        <p className="text-center text-sm text-purple-200 mt-6">
          ¿Ya tienes cuenta?{" "}
          <a
            href="/"
            className="text-white font-semibold hover:text-purple-300 transition"
          >
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}
