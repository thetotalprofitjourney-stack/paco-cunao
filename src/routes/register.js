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
          error: 'Necesitamos tu nombre y número de teléfono para recomendarte a Paco',
        });
      }

      // Validar formato de teléfono (E.164)
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone)) {
        return reply.code(400).send({
          success: false,
          error: 'El formato del teléfono no es válido. Tiene que empezar por + y el código de país, por ejemplo: +34612345678',
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await usersQueries.getUserByPhone(phone);
      if (existingUser) {
        return reply.code(409).send({
          success: false,
          error: 'duplicate_phone',
        });
      }

      // Crear usuario
      const user = await usersQueries.createUser({ phone, name });

      // Crear game asociado
      await gamesQueries.createGame(user.id);

      return reply.code(201).send({
        success: true,
        message: '¡Perfecto! Ya estás en la lista de Paco',
        instructions: `Guarda el número ${process.env.WHATSAPP_NUMBER || '+34XXXXXXXXX'} y escríbele: "Hola Paco, ¿en qué puedo ayudarte?"`,
      });
    } catch (error) {
      console.error('Error registering user:', error);
      return reply.code(500).send({
        success: false,
        error: 'Vaya, algo ha fallado por nuestra parte. Inténtalo de nuevo en unos minutos o escríbenos a soporte',
      });
    }
  });
}

module.exports = registerRoutes;
