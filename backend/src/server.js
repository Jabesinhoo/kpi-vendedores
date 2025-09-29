import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>KPI Vendedores</title>
      </head>
      <body>
        <h1> Ya funka esta vaina.</h1>
        <p>Servidor corriendo correctamente.</p>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log(" Conectado a PostgreSQL con Sequelize");
    return sequelize.sync(); 
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}  http://localhost:${PORT}/`);
    });
  })
  .catch((error) => {
    console.error(" Error conectando a la DB:", error);
  });
