const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { pool } = require('../config/db.postgres');
const { enviarCorreo } = require('../config/mailer');

// ── Registro ──────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nombre, email, password } = req.body;

  try {
    // Verificar si el email ya existe
    const existing = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Cifrar contraseña
    const salt          = await bcrypt.genSalt(12);
    const passwordHash  = await bcrypt.hash(password, salt);

    // Insertar usuario
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, email, rol, created_at`,
      [nombre.trim(), email.toLowerCase().trim(), passwordHash]
    );

    const usuario = result.rows[0];

    // Generar JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id:     usuario.id,
        nombre: usuario.nombre,
        email:  usuario.email,
        rol:    usuario.rol,
      },
    });
  } catch (err) {
    console.error('Error en register:', err);
    return res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = result.rows[0];

    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id:     usuario.id,
        nombre: usuario.nombre,
        email:  usuario.email,
        rol:    usuario.rol,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// ── Perfil (ruta protegida) ───────────────────────────────────────────────────
const perfil = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    return res.json({ usuario: result.rows[0] });
  } catch (err) {
    console.error('Error en perfil:', err);
    return res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// ── Solicitar recuperación de contraseña ─────────────────────────────────────
const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  const emailNorm = String(email).toLowerCase().trim();

  try {
    const result = await pool.query(
      'SELECT id, nombre, email FROM usuarios WHERE email = $1 AND activo = true',
      [emailNorm]
    );

    // Respuesta uniforme para no filtrar existencia de cuentas
    const respuestaOk = {
      message: 'Si el correo está registrado recibirás un enlace de recuperación',
    };

    if (result.rows.length === 0) {
      return res.json(respuestaOk);
    }

    const usuario = result.rows[0];

    // Genera token aleatorio (texto plano se envía al correo, en BD solo el hash)
    const token       = crypto.randomBytes(32).toString('hex');
    const tokenHash   = crypto.createHash('sha256').update(token).digest('hex');
    const expiresMin  = parseInt(process.env.RESET_TOKEN_MIN) || 30;
    const expiresAt   = new Date(Date.now() + expiresMin * 60 * 1000);

    // Invalida tokens anteriores y crea el nuevo
    await pool.query(
      'UPDATE password_resets SET used = true WHERE usuario_id = $1 AND used = false',
      [usuario.id]
    );
    await pool.query(
      `INSERT INTO password_resets (usuario_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [usuario.id, tokenHash, expiresAt]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl    = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(emailNorm)}`;

    const textoPlano =
`Hola ${usuario.nombre},

Recibimos una solicitud para restablecer tu contraseña en VenditaApp.
Usa el siguiente enlace para crear una nueva contraseña (válido por ${expiresMin} minutos):

${resetUrl}

Si no solicitaste este cambio, ignora este mensaje.`;

    const html =
`<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;background:#f8fafc;border-radius:12px">
  <h2 style="color:#1E293B">Recuperación de contraseña</h2>
  <p>Hola <strong>${usuario.nombre}</strong>,</p>
  <p>Recibimos una solicitud para restablecer tu contraseña en <strong>VenditaApp</strong>.</p>
  <p>Haz clic en el siguiente botón para crear una nueva contraseña. El enlace es válido por <strong>${expiresMin} minutos</strong>.</p>
  <p style="text-align:center;margin:24px 0">
    <a href="${resetUrl}" style="background:#6366F1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Restablecer contraseña</a>
  </p>
  <p style="font-size:13px;color:#64748B">Si el botón no funciona, copia y pega este enlace en tu navegador:<br>${resetUrl}</p>
  <hr style="margin:24px 0;border:none;border-top:1px solid #E2E8F0">
  <p style="font-size:12px;color:#94A3B8">Si no solicitaste este cambio, ignora este mensaje.</p>
</div>`;

    await enviarCorreo({
      to: emailNorm,
      subject: 'VenditaApp · Recuperación de contraseña',
      html, text: textoPlano,
    });

    return res.json(respuestaOk);
  } catch (err) {
    console.error('Error en forgotPassword:', err);
    return res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

// ── Restablecer contraseña ───────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, token, password } = req.body;
  const emailNorm = String(email).toLowerCase().trim();
  const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');

  try {
    const userQ = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1 AND activo = true',
      [emailNorm]
    );
    if (userQ.rows.length === 0) {
      return res.status(400).json({ error: 'Solicitud inválida' });
    }
    const usuarioId = userQ.rows[0].id;

    const resetQ = await pool.query(
      `SELECT id, expires_at, used
         FROM password_resets
        WHERE usuario_id = $1 AND token_hash = $2
        ORDER BY created_at DESC
        LIMIT 1`,
      [usuarioId, tokenHash]
    );

    if (resetQ.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido' });
    }
    const reset = resetQ.rows[0];
    if (reset.used) {
      return res.status(400).json({ error: 'Este enlace ya fue utilizado' });
    }
    if (new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({ error: 'El enlace ha expirado, solicítalo de nuevo' });
    }

    const salt         = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    await pool.query(
      'UPDATE usuarios SET password = $1 WHERE id = $2',
      [passwordHash, usuarioId]
    );
    await pool.query(
      'UPDATE password_resets SET used = true WHERE id = $1',
      [reset.id]
    );

    return res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error en resetPassword:', err);
    return res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
};

module.exports = { register, login, perfil, forgotPassword, resetPassword };
