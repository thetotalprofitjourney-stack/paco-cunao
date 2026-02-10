#!/usr/bin/env node

/**
 * Script de prueba para enviar mensajes de WhatsApp
 *
 * Uso:
 *   node scripts/test-whatsapp.js [numero_destino]
 *
 * Ejemplo:
 *   node scripts/test-whatsapp.js +34615655339
 */

require('dotenv').config();
const whatsapp = require('../src/services/whatsapp');

// Número de destino (usa el argumento o el número de prueba por defecto)
const phoneNumber = process.argv[2] || '+34615655339';

async function testWhatsApp() {
  console.log('🚀 Iniciando prueba de WhatsApp...\n');

  // Verificar configuración
  console.log('📋 Configuración:');
  console.log(`  - Proveedor: ${process.env.WHATSAPP_PROVIDER}`);
  console.log(`  - Phone Number ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID}`);
  console.log(`  - Token configurado: ${process.env.WHATSAPP_META_TOKEN ? '✅ Sí' : '❌ No'}`);
  console.log(`  - Número destino: ${phoneNumber}\n`);

  if (!process.env.WHATSAPP_META_TOKEN || process.env.WHATSAPP_META_TOKEN === 'PENDIENTE_DE_GENERAR_TOKEN') {
    console.error('❌ Error: WHATSAPP_META_TOKEN no configurado en .env');
    console.log('\n💡 Genera tu token en Meta Developers y actualiza el archivo .env');
    process.exit(1);
  }

  try {
    // Test 1: Enviar mensaje de texto simple
    console.log('📤 Test 1: Enviando mensaje de texto...');
    const result1 = await whatsapp.sendMessage(
      phoneNumber,
      '¡Hola! Este es un mensaje de prueba desde Paco Backend. 🎉\n\nSi recibes este mensaje, la integración con WhatsApp está funcionando correctamente.'
    );

    if (result1.success) {
      console.log(`✅ Mensaje enviado exitosamente`);
      console.log(`   Message ID: ${result1.messageId}\n`);
    } else {
      console.error(`❌ Error al enviar mensaje: ${result1.error}\n`);
      return;
    }

    // Test 2: Enviar plantilla (solo si está configurada)
    if (process.env.WHATSAPP_REACTIVATION_TEMPLATE) {
      console.log('📤 Test 2: Enviando plantilla de reactivación...');
      console.log(`   Plantilla: ${process.env.WHATSAPP_REACTIVATION_TEMPLATE}`);

      const result2 = await whatsapp.sendTemplate(
        phoneNumber,
        process.env.WHATSAPP_REACTIVATION_TEMPLATE,
        'es'
      );

      if (result2.success) {
        console.log(`✅ Plantilla enviada exitosamente`);
        console.log(`   Message ID: ${result2.messageId}\n`);
      } else {
        console.log(`⚠️  Error al enviar plantilla: ${result2.error}`);
        console.log(`   (Esto es normal si la plantilla aún no está aprobada en Meta)\n`);
      }
    }

    console.log('✅ Prueba completada. Revisa tu WhatsApp en el número:', phoneNumber);

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar prueba
testWhatsApp();
