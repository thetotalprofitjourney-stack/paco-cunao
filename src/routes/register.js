const usersQueries = require('../db/queries/users');
const gamesQueries = require('../db/queries/games');

async function registerRoutes(fastify, options) {
  fastify.post('/api/register', async (request, reply) => {
    try {
      const { name, phone } = request.body;

      // Validar entrada
      if (!name || !phone) {
        return reply.code(400).send({
          success: false,
          error: 'Name and phone are required',
        });
      }

      // Validar formato de teléfono (E.164)
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone)) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid phone format. Use E.164 format (e.g., +34612345678)',
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await usersQueries.getUserByPhone(phone);
      if (existingUser) {
        return reply.code(409).send({
          success: false,
          error: 'User already registered with this phone number',
        });
      }

      // Crear usuario
      const user = await usersQueries.createUser({ phone, name });

      // Crear game asociado
      await gamesQueries.createGame(user.id);

      return reply.code(201).send({
        success: true,
        message: 'User registered successfully',
        instructions: `Guarda el número ${process.env.WHATSAPP_NUMBER || '+34XXXXXXXXX'} y escríbele: "Hola Paco, ¿en qué puedo ayudarte?"`,
      });
    } catch (error) {
      console.error('Error registering user:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });
}

module.exports = registerRoutes;
