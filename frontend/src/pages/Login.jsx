import { useState, useEffect } from "react"; // 👈 Agregamos useEffect
import { Moon, Sun, X, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react"; // 👈 Agregamos Eye y EyeOff

// --- Componente de Notificación Simple (Reutilizado) ---
const Notification = ({ message, type, onClose }) => {
    if (!message) return null;

    const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-xl flex items-center transition-all duration-300 transform z-50";
    const successClasses = "bg-green-100 border border-green-400 text-green-700";
    const errorClasses = "bg-red-100 border border-red-400 text-red-700";

    return (
        <div className={`${baseClasses} ${type === 'success' ? successClasses : errorClasses}`}>
            {type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
            ) : (
                <XCircle className="w-5 h-5 mr-3 text-red-500" />
            )}
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// --- Componente Principal de Login ---
export default function Login() {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // 🚨 Nuevo estado para mostrar/ocultar contraseña
    const [showPassword, setShowPassword] = useState(false);

    // 🚨 PERSISTENCIA DEL MODO OSCURO (Lectura inicial)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem("darkMode");
        // Por defecto, usa 'true' si no hay nada guardado
        return savedMode !== null ? JSON.parse(savedMode) : true; 
    }); 

    // 🚨 PERSISTENCIA DEL MODO OSCURO (Guardado al cambiar)
    useEffect(() => {
        localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    // Función para mostrar la notificación y ocultarla después de 5 segundos
    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: "", type: "" });
        }, 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario, password }),
            });

            const data = await res.json();
            if (res.ok) {
                showNotification(" Login exitoso. Redirigiendo...", "success");
                localStorage.setItem("token", data.token);
                
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 1500);

            } else {
                showNotification(` ${data.error || 'Credenciales inválidas.'}`, "error");
            }
        } catch (err) {
            showNotification(" Error conectando con el servidor", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Clases base (sin cambios)
    const bgClass = isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-slate-900 to-slate-800 text-white" 
        : "bg-gray-100 text-gray-900";
    
    const cardClass = isDarkMode 
        ? "bg-gray-800/80 backdrop-blur-md shadow-2xl border border-gray-700/50" 
        : "bg-white/90 backdrop-blur-md shadow-xl border border-gray-200";

    const inputClass = (isDarkMode) =>
        `w-full px-4 py-3 rounded-lg ${isDarkMode ? "bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500" : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-600"} focus:outline-none focus:ring-2 transition-colors`;
    
    const labelClass = isDarkMode ? "text-gray-300" : "text-gray-600";
    const linkClass = isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700";


    return (
        <div className={`min-h-screen flex items-center justify-center p-6 ${bgClass}`}>
            
            <Notification 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification({ message: "", type: "" })} 
            />

            <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`fixed top-5 left-5 p-3 rounded-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'} shadow-lg hover:shadow-xl transition-all z-50`}
                aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className={`w-full max-w-md rounded-2xl p-10 animate-fadeIn ${cardClass}`}>
                
                {/* Logo y Encabezado */}
                <div className="text-center mb-8">
                    
                    <img 
                        src="/img/logo.png" 
                        alt="Logo Corporativo KPI" 
                        // Corregimos las clases para un tamaño estándar
                        className="w-50 h-50 mx-auto object-contain rounded-xl shadow-lg" 
                    />

                    <h1 className={`text-3xl font-extrabold mt-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Bienvenido
                    </h1>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Usuario */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                            Usuario
                        </label>
                        <input
                            type="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            required
                            className={inputClass(isDarkMode)}
                        />
                    </div>
                    
                    {/* 🚨 Contraseña con "Ojito" */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                            Contraseña
                        </label>
                        <div className="relative"> {/* Contenedor para el icono */}
                            <input
                                // 🚨 Tipo condicional
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={inputClass(isDarkMode) + " pr-10"} 
                            />
                            {/* 🚨 Botón del "Ojito" */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 top-0 pr-3 flex items-center h-full text-gray-400 hover:text-blue-500"
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-cyan-700 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className={`text-center text-sm mt-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ¿No tienes cuenta?{" "}
                    <a
                        href="/register"
                        className={`font-semibold transition ${linkClass}`}
                    >
                        Regístrate aquí
                    </a>
                </p>
            </div>
        </div>
    );
}