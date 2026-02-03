const usersQueries = require('../src/db/queries/users');
const gamesQueries = require('../src/db/queries/games');

async function seed() {
  try {
    console.log('Seeding database...');

    // Crear usuario de prueba
    const user = await usersQueries.createUser({
      phone: '+34600000000',
      name: 'Usuario de Prueba',
    });

    console.log('✓ Test user created:', user.id);

    // Crear game para el usuario
    const game = await gamesQueries.createGame(user.id);

    console.log('✓ Test game created:', game.id);
    console.log('\n✓ Database seeded successfully!');
    console.log('\nTest user phone:', user.phone);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
