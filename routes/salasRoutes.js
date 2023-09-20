import express from "express";

const router = express.Router();

import {
  crearReserva,
  verificarDisponibilidad,
} from "../controllers/salasController.js";

import checkAuth from "../middleware/checkAuth.js";

router.post("/verificar-disponibilidad", checkAuth, verificarDisponibilidad);
router.post("/crear-reserva/:id", checkAuth, crearReserva);

export default router;
