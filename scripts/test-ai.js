const { callAI } = require('../src/services/ai/client');
const { getSystemPrompt, getAckPrompt, getResultsPrompt } = require('../src/services/ai/prompts');

async function testAI() {
  console.log('Testing AI prompts...\n');

  // Contexto de ejemplo
  const mockContext = `
ESTADO ACTUAL DEL HOTEL "Hotel Villa Carmen":
- Estrellas: 2
- Habitaciones: 90 (35% ocupación)
- Empleados: 12 (9 familia, 3 profesionales)
- Ingresos: 45000€/mes | Gastos: 48000€/mes
- Valoración Google: 2.8/5 (147 reseñas)
- Tecnología: WiFi NO, Sistema reservas NO (Excel), Web NO
- Nivel de caos: 9/10
- Tensión familiar: 7/10
- Problemas activos: reservas_en_excel, no_wifi_clientes, familia_en_plantilla
- Problemas resueltos: ninguno aún

HISTORIAL DE LA PARTIDA:
(Partida recién comenzada)

CONVERSACIÓN RECIENTE:
(Sin conversación previa)
  `.trim();

  const playerMessage = 'Lo primero es poner WiFi para los clientes. Es básico en 2025.';

  try {
    // Test 1: ACK
    console.log('=== TEST 1: ACK MESSAGE ===');
    const systemPrompt = getSystemPrompt(mockContext);
    const ackPrompt = getAckPrompt(playerMessage);

    const ackResponse = await callAI(systemPrompt, ackPrompt, {
      max_tokens: 150,
      temperature: 0.8,
    });

    console.log('Paco responde (ACK):');
    console.log(ackResponse.message);
    console.log(`\nTokens: ${ackResponse.tokensInput} in, ${ackResponse.tokensOutput} out`);

    // Test 2: RESULTS
    console.log('\n=== TEST 2: RESULTS MESSAGE ===');
    const resultsPrompt = getResultsPrompt(5, playerMessage);

    const resultsResponse = await callAI(systemPrompt, resultsPrompt, {
      max_tokens: 400,
      temperature: 0.85,
    });

    console.log('Paco responde (RESULTS):');
    console.log(resultsResponse.message);
    console.log(`\nTokens: ${resultsResponse.tokensInput} in, ${resultsResponse.tokensOutput} out`);

    console.log('\n✓ AI test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error testing AI:', error);
    process.exit(1);
  }
}

testAI();
