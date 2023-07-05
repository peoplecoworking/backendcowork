import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from "./config/db.js";
import router from "./routes/usuarioRoutes.js";
import clientesRouter from "./routes/clientesRoutes.js";
import planesRouter from "./routes/planesRoutes.js";
import facturasRouter from "./routes/facturasRoutes.js";
import proveedoresRouter from "./routes/proveedorRoutes.js";
import rubrosRouter from "./routes/rubrosRoutes.js";
import contableRouter from "./routes/contableRoutes.js";

const app = express();
app.use(express.json());

dotenv.config();

conectarDB();

// Configurar CORS
const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.includes(origin)) {
      // Puede consultar la API
      callback(null, true);
    } else {
      // No esta permitido su request
      callback(new Error("Error de Cors"));
    }
  },
};

app.use(cors(corsOptions));

// Routing
app.use("/api/usuarios", router);
app.use("/api/clientes", clientesRouter);
app.use("/api/proveedores", proveedoresRouter);
app.use("/api/contable", contableRouter);
app.use("/api/rubros", rubrosRouter);
app.use("/api/planes", planesRouter);
app.use("/api/facturas", facturasRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
