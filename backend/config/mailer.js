const nodemailer = require('nodemailer');

let transporter = null;

const buildTransporter = () => {
  if (transporter) return transporter;

  const host   = process.env.SMTP_HOST;
  const port   = parseInt(process.env.SMTP_PORT) || 587;
  const user   = process.env.SMTP_USER;
  const pass   = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';

  if (!host || !user || !pass) {
    // Si no hay SMTP configurado se trabajará en modo "consola" (dev)
    return null;
  }

  transporter = nodemailer.createTransport({
    host, port, secure,
    auth: { user, pass },
  });
  return transporter;
};

/**
 * Envía un correo. Si no hay SMTP configurado en variables de entorno,
 * imprime el contenido en consola para entornos de desarrollo.
 */
const enviarCorreo = async ({ to, subject, html, text }) => {
  const trans = buildTransporter();
  const from  = process.env.SMTP_FROM || 'VenditaApp <no-reply@venditaapp.local>';

  if (!trans) {
    console.log('\n=================== CORREO (modo consola) ===================');
    console.log('De:     ', from);
    console.log('Para:   ', to);
    console.log('Asunto: ', subject);
    console.log('-------------------------------------------------------------');
    console.log(text || html);
    console.log('=============================================================\n');
    return { simulated: true };
  }

  return trans.sendMail({ from, to, subject, html, text });
};

module.exports = { enviarCorreo };
