import dotenv from "dotenv";
import SalaMadrid from "../models/SalaMadrid.js";
import SalaAmsterdam from "../models/SalaAmsterdam.js";
import SalaCabina from "../models/SalaCabina.js";
import SalaBsAs from "../models/SalaBsAs.js";
import SalaParis from "../models/SalaParis.js";
import Usuario from "../models/Usuario.js";
import Cliente from "../models/Cliente.js";
dotenv.config();

const config = {
  imap: {
    user: process.env.EMAIL_SALAS,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.PORT,
    tls: false,
  },
};
const verificarDisponibilidad = async (req, res) => {
  console.log(req.body);
  try {
    const { fecha, horaInicio, horaFin } = req.body;

    const fechaInicio = new Date(`${fecha}T${horaInicio}:00`);
    const fechaFin = new Date(`${fecha}T${horaFin}:00`);

    // Convertir las fechas y horas a objetos Date
    const fechaInicioISO = fechaInicio.toISOString();
    const fechaFinISO = fechaFin.toISOString();

    console.log("Fecha Inicio (ISO): " + fechaInicioISO);
    console.log("Fecha Fin (ISO): " + fechaFinISO);

    const salas = {
      SalaMadrid,
      SalaAmsterdam,
      SalaCabina,
      SalaParis,
    };

    const resultados = {};

    for (const [nombreSala, modeloSala] of Object.entries(salas)) {
      const reservasCoincidentes = await modeloSala.find({
        $and: [
          { horaInicio: { $lt: fechaFinISO } },
          { horaFin: { $gt: fechaInicioISO } },
        ],
      });

      console.log(
        `Reservas coincidentes para ${nombreSala}:`,
        reservasCoincidentes
      );

      resultados[nombreSala] = reservasCoincidentes.length === 0; // true si está disponible, false si no
    }

    res.status(200).json(resultados);
  } catch (error) {
    console.error("Error en verificarDisponibilidad:", error);
    res.status(500).json({ error: "Error al verificar la disponibilidad" });
  }
};

const obtenerDisponibilidadDia = async (req, res) => {
  try {
    const { fecha, sala } = req.body;

    const salas = {
      SalaMadrid,
      SalaAmsterdam,
      SalaCabina,
      SalaBsAs,
      SalaParis,
    };

    if (!salas[sala]) {
      return res.status(400).json({ error: "Nombre de sala no válido" });
    }

    const modeloSala = salas[sala];

    // Buscar reservas para la sala y fecha especificadas
    const reservas = await modeloSala.find({
      fechaReserva: fecha,
    });

    // Extraer y devolver solo las horas de inicio y fin de las reservas
    const horariosReservados = reservas.map((r) => ({
      horaInicio: r.horaInicio,
      horaFin: r.horaFin,
    }));

    res.status(200).json(horariosReservados);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener la disponibilidad del día" });
  }
};

const crearReserva = async (req, res) => {
  try {
    const { fecha, horaInicio, horaFin, sala } = req.body;
    const { id } = req.params;

    // Convertir las fechas y horas a strings ISO
    const fechaISO = new Date(fecha).toISOString().split("T")[0]; // Solo la fecha
    const horaInicioISO = new Date(
      fecha + "T" + horaInicio + ":00"
    ).toISOString();
    const horaFinISO = new Date(fecha + "T" + horaFin + ":00").toISOString();

    const usuario = await Usuario.findById(id);
    const cliente = await Cliente.findById(usuario.cliente);

    // Verificar que la hora de inicio sea anterior a la hora de fin
    if (horaInicio >= horaFin) {
      return res
        .status(400)
        .json({ error: "Hora de inicio debe ser anterior a la hora de fin." });
    }

    const salas = {
      SalaMadrid,
      SalaAmsterdam,
      SalaCabina,
      SalaBsAs,
      SalaParis,
    };

    if (!salas[sala]) {
      return res.status(400).json({ error: "Nombre de sala no válido" });
    }

    const modeloSala = salas[sala];

    // Verificar disponibilidad
    const reservasCoincidentes = await modeloSala.find({
      fechaReserva: fechaISO,
      $or: [
        { horaInicio: { $gte: horaInicioISO, $lt: horaFinISO } },
        { horaFin: { $gt: horaInicioISO, $lte: horaFinISO } },
        { horaInicio: { $lt: horaInicioISO }, horaFin: { $gt: horaFinISO } },
      ],
    });

    if (reservasCoincidentes.length > 0) {
      return res.status(400).json({
        error: "La sala ya está reservada para el horario especificado.",
      });
    }

    // Crear la reserva
    const nuevaReserva = new modeloSala({
      fechaReserva: fechaISO,
      horaInicio: horaInicioISO,
      horaFin: horaFinISO,
      usuario: id,
      cliente: usuario.cliente,
      nombreCliente: cliente.nombre,
      nombreUsuario: usuario.nombre + usuario.apellido,
    });

    await nuevaReserva.save();
    res.status(201).json(nuevaReserva);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la reserva" });
  }
};

export { verificarDisponibilidad, obtenerDisponibilidadDia, crearReserva };
