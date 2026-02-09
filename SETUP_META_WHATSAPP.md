# Guía: Configurar WhatsApp Business con Meta Cloud API

Esta guía te explica paso a paso cómo dar de alta tu número de WhatsApp en Meta Business y dónde introducir los datos en el proyecto.

## Índice

1. [Requisitos previos](#requisitos-previos)
2. [Paso 1: Crear cuenta Meta Business](#paso-1-crear-cuenta-meta-business)
3. [Paso 2: Configurar WhatsApp Business API](#paso-2-configurar-whatsapp-business-api)
4. [Paso 3: Obtener credenciales](#paso-3-obtener-credenciales)
5. [Paso 4: Configurar webhook](#paso-4-configurar-webhook)
6. [Paso 5: Introducir datos en el proyecto](#paso-5-introducir-datos-en-el-proyecto)
7. [Paso 6: Crear plantillas de mensaje](#paso-6-crear-plantillas-de-mensaje)
8. [Verificación y pruebas](#verificación-y-pruebas)

---

## Requisitos previos

- ✅ Número de teléfono móvil que no esté registrado en WhatsApp
- ✅ Cuenta de Facebook (personal)
- ✅ Tarjeta de crédito/débito para verificación (no se cobra)
- ✅ Servidor con HTTPS configurado para el webhook
- ✅ Acceso al servidor donde está desplegado el proyecto

---

## Paso 1: Crear cuenta Meta Business

### 1.1 Acceder a Meta Business Suite

1. Ve a [business.facebook.com](https://business.facebook.com/)
2. Haz clic en **"Crear cuenta"**
3. Completa los datos:
   - Nombre de tu negocio: `Hotel Villa Carmen` (o el nombre de tu proyecto)
   - Tu nombre
   - Tu email de trabajo

### 1.2 Verificar la cuenta

1. Confirma tu email
2. Meta puede pedirte verificación adicional (documentación del negocio)

---

## Paso 2: Configurar WhatsApp Business API

### 2.1 Crear aplicación de WhatsApp

1. En Meta Business Suite, ve a **"Configuración del negocio"** (esquina inferior izquierda)
2. En el menú lateral, haz clic en **"Cuentas" → "Cuentas de WhatsApp"**
3. Haz clic en **"Agregar"** → **"Crear una cuenta de WhatsApp Business"**
4. Nombre de la cuenta: `Ayuda a Paco` (o tu nombre de proyecto)
5. Haz clic en **"Crear cuenta"**

### 2.2 Registrar tu número de teléfono

1. En la nueva cuenta de WhatsApp, haz clic en **"Agregar número de teléfono"**
2. Selecciona tu país: **España** (o el tuyo)
3. Introduce tu número de teléfono (sin el +34)

   > ⚠️ **IMPORTANTE**: Este número NO debe estar registrado previamente en WhatsApp. Si ya lo tienes en WhatsApp personal, tendrás que usar otro número o desvincularlo primero.

4. Elige el método de verificación:
   - **SMS** (recomendado): Recibirás un código por SMS
   - **Llamada de voz**: Recibirás una llamada automática

5. Introduce el código de 6 dígitos que recibas
6. Acepta los términos de WhatsApp Business

### 2.3 Completar el perfil de WhatsApp Business

1. **Nombre para mostrar**: `Paco - Hotel Villa Carmen` (lo que verán los usuarios)
2. **Descripción**: `Ayuda a Paco a gestionar su hotel respondiendo sus consultas`
3. **Categoría**: `Servicios de hostelería` o `Entretenimiento`
4. **Foto de perfil**: Sube una foto de Paco o del hotel
5. **Dirección** (opcional): La dirección del hotel si es relevante

---

## Paso 3: Obtener credenciales

Ahora necesitas obtener 3 datos clave para configurar el proyecto:

### 3.1 Obtener el Token de acceso (WHATSAPP_META_TOKEN)

1. En Meta Business Suite, ve a **"Desarrolladores" → "Aplicaciones"**
2. Si no tienes una app, haz clic en **"Crear app"** → **"Empresa"** → **"Siguiente"**
3. Nombre de la app: `Paco Backend`
4. Email de contacto: Tu email
5. Una vez creada la app, ve a **"WhatsApp" → "Empezar"**
6. En el panel de WhatsApp, busca la sección **"Token de acceso"** o **"Access Token"**
7. Haz clic en **"Generar token"** o **"Sistema de tokens"**
8. Selecciona tu cuenta de WhatsApp Business
9. Copia el **Token de acceso** (empieza con `EAA...`)

   > ⚠️ **IMPORTANTE**: Este token es temporal (24 horas). Para producción necesitarás generar un **token permanente**:
   >
   > **Generar token permanente:**
   > 1. Ve a **"Configuración del sistema de usuarios"** en tu app
   > 2. Selecciona tu usuario del sistema (o crea uno)
   > 3. Haz clic en **"Generar nuevo token"**
   > 4. Selecciona los permisos: `whatsapp_business_messaging`, `whatsapp_business_management`
   > 5. Copia y guarda este token de forma segura

### 3.2 Obtener el Phone Number ID (WHATSAPP_PHONE_NUMBER_ID)

1. En el mismo panel de WhatsApp de tu app
2. Busca la sección **"Desde"** o **"Phone number"**
3. Verás tu número de teléfono y debajo un ID numérico
4. Copia el **Phone Number ID** (es un número largo, ej: `123456789012345`)

### 3.3 Crear un Verify Token (WHATSAPP_VERIFY_TOKEN)

Este token lo creas tú, es una cadena de texto segura para verificar el webhook:

1. Genera una cadena aleatoria, por ejemplo:
   ```bash
   # Puedes usar este comando en terminal:
   openssl rand -hex 32
   ```

2. Guarda esta cadena, la necesitarás para configurar el webhook y el `.env`

---

## Paso 4: Configurar webhook

El webhook permite que Meta envíe los mensajes entrantes a tu servidor.

### 4.1 URL del webhook

Tu URL del webhook será:
```
https://tu-dominio.com/webhook/whatsapp
```

> ⚠️ **Requisitos**:
> - Debe ser **HTTPS** (Meta no acepta HTTP)
> - Debe estar **públicamente accesible**
> - Debe responder en menos de 5 segundos

### 4.2 Configurar el webhook en Meta

1. En el panel de tu app de Meta, ve a **"WhatsApp" → "Configuración"**
2. Busca la sección **"Webhook"** o **"Configuración de webhook"**
3. Haz clic en **"Editar"** o **"Configurar webhook"**
4. Introduce:
   - **URL de devolución de llamada**: `https://tu-dominio.com/webhook/whatsapp`
   - **Token de verificación**: El token que generaste en el paso 3.3 (WHATSAPP_VERIFY_TOKEN)
5. Haz clic en **"Verificar y guardar"**

   > ✅ Si la verificación es exitosa, verás un check verde
   > ❌ Si falla, revisa que:
   > - El servidor esté corriendo
   > - La URL sea correcta y accesible
   > - El WHATSAPP_VERIFY_TOKEN en tu `.env` coincida con el que pusiste aquí

### 4.3 Suscribirse a eventos

1. En la misma página de webhook, busca **"Campos de webhook"** o **"Webhook fields"**
2. Suscríbete a estos eventos:
   - ✅ `messages` (para recibir mensajes entrantes)
   - ✅ `message_status` (opcional, para saber si los mensajes fueron entregados/leídos)
3. Haz clic en **"Guardar"**

---

## Paso 5: Introducir datos en el proyecto

### 5.1 Crear/editar el archivo `.env`

1. Conéctate a tu servidor donde está el proyecto
2. Ve al directorio del proyecto:
   ```bash
   cd /ruta/a/paco-cunao
   ```

3. Si no existe el archivo `.env`, créalo copiando el ejemplo:
   ```bash
   cp .env.example .env
   ```

4. Edita el archivo `.env`:
   ```bash
   nano .env
   ```
   (o usa tu editor favorito: `vim`, `code`, etc.)

### 5.2 Configurar las variables de WhatsApp

Busca la sección de WhatsApp y configúrala así:

```bash
# WhatsApp - Proveedor
WHATSAPP_PROVIDER=meta

# WhatsApp - Meta Cloud API
WHATSAPP_META_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_VERIFY_TOKEN=tu_token_aleatorio_que_generaste

# WhatsApp - Número del juego (para mostrar en la web)
WHATSAPP_NUMBER=+34XXXXXXXXX
```

**Reemplaza:**
- `EAAxxxxx...` → El token que obtuviste en el paso 3.1
- `123456789012345` → El Phone Number ID del paso 3.2
- `tu_token_aleatorio_que_generaste` → El verify token del paso 3.3
- `+34XXXXXXXXX` → Tu número de WhatsApp (con el +34 y sin espacios)

### 5.3 Otras variables importantes

Asegúrate de que también estén configuradas:

```bash
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/paco_el_cunao

# Redis (para BullMQ)
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Servidor
PORT=3000
NODE_ENV=production
```

### 5.4 Guardar y reiniciar

1. Guarda el archivo `.env`:
   - En nano: `Ctrl + X` → `Y` → `Enter`
   - En vim: `Esc` → `:wq` → `Enter`

2. Reinicia el servidor:
   ```bash
   # Si usas PM2:
   pm2 restart paco-backend

   # Si usas systemd:
   sudo systemctl restart paco-backend

   # O si lo ejecutas manualmente:
   npm start
   ```

---

## Paso 6: Crear plantillas de mensaje

WhatsApp Business requiere que las conversaciones iniciadas por el negocio usen **plantillas pre-aprobadas**.

### 6.1 Crear plantilla de reactivación

Esta plantilla se usa para enviar el mensaje de resultados a los jugadores:

1. En Meta Business Suite, ve a tu cuenta de WhatsApp
2. Haz clic en **"Plantillas de mensajes"** o **"Message templates"**
3. Haz clic en **"Crear plantilla"**
4. Configuración:
   - **Nombre**: `paco_novedades` (debe coincidir con WHATSAPP_REACTIVATION_TEMPLATE en `.env`)
   - **Categoría**: `MARKETING` o `UTILITY`
   - **Idiomas**: Español

5. Contenido del mensaje:
   ```
   Hola de nuevo! Soy Paco 👋

   Después de pensarlo bien y seguir tus consejos, te cuento qué ha pasado...
   ```

6. **Botón** (opcional):
   - Tipo: `Quick Reply`
   - Texto: `Cuéntame más`

7. Haz clic en **"Enviar"**
8. Meta revisará la plantilla (puede tardar 1-24 horas)

### 6.2 Plantilla de bienvenida (opcional)

Otra plantilla útil para dar la bienvenida a nuevos jugadores:

- **Nombre**: `bienvenida_paco`
- **Contenido**:
  ```
  Hola {{1}}! Soy Paco 😊

  Acabo de heredar el Hotel Villa Carmen de mi tío y... bueno, no tengo ni idea de hostelería.

  Necesito tu ayuda para tomar decisiones. ¿Me echas una mano?
  ```

---

## Verificación y pruebas

### 7.1 Verificar que el servidor está corriendo

```bash
# Ver logs del servidor
pm2 logs paco-backend

# O si no usas PM2:
tail -f /var/log/paco-backend.log
```

Deberías ver algo como:
```
Server listening on port 3000
WhatsApp provider: meta
Database connected
Redis connected
```

### 7.2 Probar el webhook

1. Envía un mensaje de WhatsApp al número que configuraste
2. Revisa los logs del servidor para ver si recibe el webhook:
   ```bash
   pm2 logs paco-backend --lines 100
   ```

3. Deberías ver algo como:
   ```
   POST /webhook/whatsapp - 200 OK
   Received message from +34XXXXXXXXX: Hola
   ```

### 7.3 Probar envío de mensajes

Puedes probar manualmente que el envío funciona:

```bash
# En el servidor, ejecuta:
node -e "
const meta = require('./src/services/whatsapp/meta');
meta.sendMessage('+34XXXXXXXXX', 'Hola! Este es un mensaje de prueba de Paco')
  .then(result => console.log('Result:', result))
  .catch(err => console.error('Error:', err));
"
```

### 7.4 Verificar en el panel de Meta

1. Ve a tu app en Meta Business
2. Busca **"WhatsApp" → "Análisis"** o **"Analytics"**
3. Deberías ver:
   - Mensajes enviados
   - Mensajes recibidos
   - Errores (si los hay)

---

## Troubleshooting

### Problema: "Webhook verification failed"

**Solución:**
- Verifica que `WHATSAPP_VERIFY_TOKEN` en `.env` coincida exactamente con el que pusiste en Meta
- Asegúrate de que el servidor esté corriendo
- Verifica que la URL sea HTTPS y accesible públicamente

### Problema: "Invalid access token"

**Solución:**
- El token puede haber expirado (tokens temporales duran 24h)
- Genera un token permanente siguiendo el paso 3.1
- Verifica que el token esté correctamente copiado en `.env` (sin espacios)

### Problema: "Phone number not registered"

**Solución:**
- Verifica el `WHATSAPP_PHONE_NUMBER_ID` en `.env`
- Asegúrate de que el número esté verificado en Meta Business
- Comprueba que uses el Phone Number ID, no el número de teléfono

### Problema: "Template not approved"

**Solución:**
- Las plantillas pueden tardar hasta 24 horas en aprobarse
- Revisa que no contengan URLs sospechosas o contenido prohibido
- Comprueba el estado en Meta Business → Plantillas de mensajes

### Problema: No recibo webhooks

**Solución:**
- Verifica que te hayas suscrito a los eventos `messages` en el webhook
- Comprueba los logs del servidor para ver si llegan las peticiones
- Asegúrate de que el servidor responda en menos de 5 segundos

---

## Resumen de archivos modificados

Después de seguir esta guía, habrás modificado:

1. **`.env`** - Credenciales de WhatsApp:
   ```bash
   WHATSAPP_PROVIDER=meta
   WHATSAPP_META_TOKEN=EAA...
   WHATSAPP_PHONE_NUMBER_ID=123...
   WHATSAPP_VERIFY_TOKEN=tu_token
   WHATSAPP_NUMBER=+34XXX...
   ```

2. **Meta Business** - Configuración:
   - Cuenta de WhatsApp Business creada
   - Número verificado
   - App de Facebook creada
   - Webhook configurado y verificado
   - Eventos suscritos (messages)
   - Plantillas creadas y aprobadas

---

## Próximos pasos

Una vez configurado todo:

1. ✅ Prueba el registro desde la web: `/registro`
2. ✅ Envía un mensaje de WhatsApp al número de Paco
3. ✅ Verifica que recibes respuesta automática
4. ✅ Revisa que los mensajes se guarden en la base de datos
5. ✅ Monitorea los logs por posibles errores

---

## Documentación oficial de Meta

- [WhatsApp Cloud API - Guía de inicio](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Referencia de la API](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
- [Plantillas de mensajes](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)

---

## Contacto y soporte

Si tienes problemas con la configuración:

1. Revisa los logs del servidor: `pm2 logs paco-backend`
2. Comprueba el estado del webhook en Meta Business
3. Verifica que todas las variables de `.env` estén correctamente configuradas
4. Abre un issue en el repositorio del proyecto

---

¡Listo! Ahora tienes WhatsApp Business configurado con Meta Cloud API para el proyecto "Ayuda a Paco" 🎉
