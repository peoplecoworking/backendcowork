import nodemailer from "nodemailer";

// TODO: mejorar los html de los mail que llegan a los clientes.

export const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos;

  const hemail = process.env.EMAIL;
  const hpass = process.env.PASSWORD;
  const host = process.env.HOST;
  const port = process.env.EMAIL_PORT;

  const transport = nodemailer.createTransport({
    host: host,
    port: port,
    auth: {
      user: hemail,
      pass: hpass,
    },
  });

  //informacion del email

  const info = await transport.sendMail({
    from: '"People Coworking - Bienvenid@!" <info@peopleco.com.ar>',
    to: email,
    subject: "Alta de cuenta",
    text: "Verifica tu cuenta en People Coworking",
    html: `
        <p>Hola ${nombre}, bienvenid@ a People Coworking</p>
        <p>Hemos creado tu cuenta para que puedas gestionar tus reservas de sala de reunion, ver facturas, abonar y mucho mas. Solo debes configurar una contraseña y puedes hacerlo en el siguiente enlace: <a href='${process.env.FRONTEND_URL}/crear-password/${token}'>Configurar Pass</a></p>

        <p>Si no acabas de adquirir una membresia en People Coworking, puedes ignorar este mensaje.</p>

        <p>Que tengas un gran dia!</p>
        <p>Equipo People Coworking</p>
    `,
  });
};

export const emailOlvidePassword = async (datos) => {
  const { email, nombre, token } = datos;

  const hemail = process.env.EMAIL;
  const hpass = process.env.PASSWORD;
  const host = process.env.HOST;
  const port = process.env.EMAIL_PORT;

  const transport = nodemailer.createTransport({
    host: host,
    port: port,
    auth: {
      user: hemail,
      pass: hpass,
    },
  });

  //informacion del email

  const info = await transport.sendMail({
    from: '"People Coworking" <info@peopleco.com.ar>',
    to: email,
    subject: "Reestablece tu Password",
    text: "Reestablece tu Password",
    html: `
        <p>Hola ${nombre} has solicitado reestablecer tu password en nuestro sistema</p>
        <p>sigue siguiente enlace para generar un nuevo password: <a href='${process.env.FRONTEND_URL}/olvide-password/${token}'>Reestablecer Password</a></p>

        <p>Si tu no solicitaste este cambio, puedes ignorar el mensaje</p>

       
    `,
  });
};
