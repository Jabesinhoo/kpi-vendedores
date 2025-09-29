import { useState } from "react";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Login exitoso");
        localStorage.setItem("token", data.token);
      } else {
        alert("❌ " + data.error);
      }
    } catch (err) {
      alert("Error conectando con el servidor");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">KPI</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-4">Bienvenido</h1>
          <p className="text-blue-200">Accede a tu panel de métricas</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">
              Usuario
            </label>
            <input
              type="text"
              placeholder="Tu usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Iniciar Sesión
          </button>
        </form>

        <p className="text-center text-sm text-blue-200 mt-6">
          ¿No tienes cuenta?{" "}
          <a
            href="/register"
            className="text-white font-semibold hover:text-blue-300 transition"
          >
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}
