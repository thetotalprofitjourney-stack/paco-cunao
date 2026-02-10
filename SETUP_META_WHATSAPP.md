# Guía: Configurar WhatsApp Business con Meta Cloud API

Esta guía te explica paso a paso cómo dar de alta tu número de WhatsApp en Meta Business y dónde introducir los datos en el proyecto.

> 📌 **Actualizado con experiencia real**: Esta guía incluye soluciones a problemas comunes basadas en la configuración real del proyecto, especialmente sobre cómo conseguir que Meta acepte tus plantillas como categoría "Servicio" (gratis) en lugar de "Marketing" (de pago).

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

Cuando crees la cuenta de WhatsApp Business, te pedirá estos datos:

1. **Nombre para mostrar de WhatsApp Business**
   - Sugerencia: `Paco Hotel Badajoz` o `Paco - Hotel Villa Carmen`
   - Este es el nombre que verán los usuarios cuando les escribas

2. **Categoría**
   - Sugerencia: `Entretenimiento`
   - Otras opciones: `Juegos`, `Servicios de entretenimiento`

3. **Zona horaria**
   - Selecciona: `(GMT+01:00) Europe/Madrid` (si estás en España)

4. **Descripción de la empresa** (Opcional pero recomendado)
   - Sugerencia:
   ```
   Ayuda a Paco a gestionar su hotel heredado en Badajoz.
   Juego conversacional por WhatsApp donde tus consejos
   cambian el rumbo de la historia.
   ```
   - Alternativa más corta:
   ```
   Experiencia interactiva de gestión hotelera.
   Acompaña a Paco en la aventura de gestionar
   el Hotel Villa Carmen en Badajoz.
   ```

5. **Sitio web** (Opcional)
   - Si tienes landing page: `https://tu-dominio.com/ayuda-a-paco`
   - Si no, déjalo vacío o pon tu web principal

6. **Foto de perfil**
   - Sube una foto de Paco o del hotel (opcional pero recomendado)

7. **Dirección** (Opcional)
   - Solo si es relevante para tu proyecto

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
DATABASE_URL=mysql://user:password@localhost:3306/paco_el_cunao

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

### 🎯 Entender el flujo (MUY IMPORTANTE)

Antes de crear la plantilla, es crucial entender cómo funciona el sistema de ventanas de conversación de WhatsApp:

**Flujo correcto:**
1. **Día 0**: Jugador da consejos a Paco
2. **Día X** (3-14 días después): Paco envía **PLANTILLA** (push notification) ← Esto es lo que configuramos aquí
3. **Jugador responde** → Se abre ventana de 24 horas GRATIS
4. **Dentro de esas 24h**: Paco envía mensajes normales (NO plantillas) contando resultados + nuevo escenario

**Objetivo de la plantilla:**
- ✅ Solo debe "enganchar" al jugador para que responda
- ✅ NO debe contar los resultados ni la historia (eso va en los mensajes posteriores)
- ✅ Debe ser corta, intrigante, que invite a la acción

**Ventajas de este enfoque:**
- 🆓 La plantilla puede ser GRATIS (si es categoría Servicio/Utility)
- 🆓 Los mensajes dentro de la ventana de 24h son GRATIS
- 💰 Solo pagas (si acaso) el mensaje inicial de la plantilla

---

### 6.1 Crear plantilla de reactivación (paco_confirmacion)

#### Paso 1: Acceder a plantillas

1. En Meta Business Suite, ve a tu cuenta de WhatsApp
2. Haz clic en **"Administrador de WhatsApp"** → **"Plantillas de mensajes"**
3. Haz clic en **"Crear plantilla"**

#### Paso 2: Elegir categoría SERVICIO (no Marketing)

> ⚠️ **MUY IMPORTANTE**: Debes elegir categoría **SERVICIO** (Utility), NO Marketing

**Por qué SERVICIO:**
- 🆓 **Gratis** o muy barato (actualizaciones de servicio)
- ✅ Mejor deliverability (Meta prioriza estos mensajes)
- 🎯 Evita costes de mensajes Marketing (0.005€ - 0.05€ por mensaje)

**Configuración:**
1. **Categoría**: Selecciona **"Servicio"** o **"Utility"**
2. **Tipo**: Selecciona **"Predeterminado"** (envía mensajes sobre cuenta existente)
3. Haz clic en **"Siguiente"**

#### Paso 3: Configurar nombre e idioma

1. **Nombre de la plantilla**: `paco_confirmacion`

   > ⚠️ **IMPORTANTE**: Debe ser exactamente `paco_confirmacion` porque es el nombre configurado en el código del proyecto (variable `WHATSAPP_REACTIVATION_TEMPLATE`)

2. **Idioma**: `Spanish` o `Español`

#### Paso 4: Configurar contenido

**Campos que NO debes rellenar (déjalos vacíos):**
- ❌ **Tipo de variable**: No uses variables dinámicas como `{{1}}`, `{{2}}` (déjalo en blanco)
- ❌ **Muestra de contenido multimedia**: Déjalo en "Ninguno" (no añadas imágenes/videos)
- ❌ **Encabezado**: Déjalo vacío
- ❌ **Pie de página**: Déjalo vacío (o pon "Hotel Villa Carmen" si quieres)

**Campo que SÍ debes rellenar:**

**Texto del mensaje:**

```
Actualización del Hotel Villa Carmen.

Paco ha revisado tu situación y tiene información nueva.
```

> ✅ **Este mensaje específico ha sido probado y FUNCIONA** - Meta lo acepta como categoría Servicio

**Por qué este mensaje funciona:**
- ✅ "Actualización" = palabra clave transaccional (Utility-friendly)
- ✅ "ha revisado" = acción completada (pasado), no engagement futuro
- ✅ Mantiene a Paco como protagonista sin ser demasiado casual
- ✅ "información nueva" es informativo, no pide acción directa
- ✅ Sin botones ni llamadas a la acción que Meta detecte como engagement

#### Paso 5: Añadir botón de respuesta rápida (OPCIONAL)

> ⚠️ **RECOMENDACIÓN**: Para maximizar las posibilidades de que Meta acepte la plantilla como Servicio, **NO añadas botón**. Los botones pueden verse como engagement.

**Si decides añadir un botón (úsalo con precaución):**
1. En la sección **"Botones"**, haz clic en **"Añadir botón"**
2. **Tipo**: Selecciona **"Respuesta rápida"** (Quick Reply)
3. **Texto del botón**:
   - ✅ `Ver detalles` (neutro, informativo)
   - ✅ `Revisar` (pasivo)
   - ✅ `Acceder` (transaccional)
   - ❌ `Cuéntame` (demasiado engagement)
   - ❌ `Dime más` (demasiado casual)

#### Paso 6: Configurar período de validez

> ⚠️ **IMPORTANTE**: No uses el período estándar de 10 minutos

1. En **"Período de validez de los mensajes"**, **activa el toggle**
2. Configura: **7 días** (168 horas)

**Por qué 7 días:**
- ✅ El jugador tiene una semana para ver el mensaje
- ✅ Perfecto para el ritmo asíncrono del juego (~5 intercambios/mes)
- ✅ No es tan corto que se pierda si está ocupado
- ✅ No es tan largo que quede obsoleto

#### Paso 7: Enviar para revisión

1. Revisa toda la configuración
2. Haz clic en **"Enviar"**
3. Meta revisará la plantilla

---

### ⚠️ Problema común: Reclasificación automática a Marketing

**Si ves este mensaje:**
```
"Si envías esta plantilla se actualizará su categoría a marketing"
```

**Significa que:** Meta detectó que el mensaje suena promocional y quiere cambiarlo a categoría Marketing (de pago).

**Solución:**
1. Haz clic en **"Cancelar"**
2. Vuelve al campo **"Texto"**
3. Usa el mensaje que hemos probado que funciona (ver arriba)
4. Evita palabras como:
   - ❌ "¿tienes un momento para que te cuente?"
   - ❌ "Han pasado cosas..."
   - ❌ Emojis excesivos
   - ❌ Lenguaje muy casual o promocional
5. Usa lenguaje más neutro y tipo "notificación de servicio"

**Mensajes alternativos si el principal no funciona:**

**Opción 2 (más natural con botón):**
```
Paco ha actualizado tu consulta del Hotel Villa Carmen.

Información disponible sobre los últimos acontecimientos.
```
Botón: "Ver detalles"

**Opción 3 (con contexto del juego):**
```
Confirmación - Hotel Villa Carmen.

Paco ha aplicado tus consejos y tiene resultados de la situación.
```

**Opción 4 (ultra neutral si todo falla):**
```
Tu sesión del Hotel Villa Carmen ha sido actualizada.

Estado: Paco ha procesado tu último mensaje.
```

---

### 📊 Tiempo de revisión

- ⚡ **Rápido**: 15 minutos - 2 horas
- 📊 **Normal**: 2-6 horas
- 🐌 **Lento**: Hasta 24 horas

**Ver estado:**
Meta Business → Administrador de WhatsApp → Plantillas de mensajes

**Estados posibles:**
- 🟡 **En revisión**: Meta está evaluando la plantilla
- 🟢 **Aprobada**: Lista para usar
- 🔴 **Rechazada**: Revisa el motivo y edita el contenido

---

### 💰 Costes según categoría (2026)

Desde julio 2025, WhatsApp cambió a precio por mensaje:

| Categoría | Coste (España) | Cuándo se cobra |
|-----------|----------------|-----------------|
| **Servicio/Utility** | 🆓 Gratis dentro de ventana de 24h<br>~€0.005-0.01 fuera de ventana | Solo fuera de conversación activa |
| **Marketing** | 💰 €0.03-0.05 por mensaje | Siempre, cada envío |
| **Autenticación** | 🆓 Gratis | Siempre |

**Ejemplo de ahorro (100 jugadores, 5 notificaciones/mes):**
- Con **Servicio**: ~€2.50/mes (si el 100% responde, es gratis)
- Con **Marketing**: ~€15-25/mes
- **Ahorro**: ~€12.50-22.50/mes

---

### 6.2 Probar la plantilla una vez aprobada

Cuando Meta apruebe la plantilla, pruébala:

```bash
# Conecta a tu servidor y ejecuta:
cd /ruta/a/paco-cunao

node -e "
const meta = require('./src/services/whatsapp/meta');
meta.sendTemplate('+34XXXXXXXXX', 'paco_confirmacion', 'es')
  .then(r => console.log('✅ Plantilla enviada:', r))
  .catch(e => console.error('❌ Error:', e));
"
```

**Reemplaza** `+34XXXXXXXXX` con tu número de prueba.

---

### 6.3 Plantilla de bienvenida (opcional)

Esta plantilla es para cuando un jugador nuevo se registra:

**Configuración:**
- **Nombre**: `bienvenida_paco`
- **Categoría**: **Servicio** (también debe ser Servicio, no Marketing)
- **Idioma**: Español

**Contenido:**
```
Hola! Soy Paco del Hotel Villa Carmen.

Gracias por registrarte. Responde cuando estés listo para empezar.
```

**Botón:**
- Tipo: Respuesta rápida
- Texto: `Empezar`

---

### 📋 Resumen de configuración de plantilla

```
Nombre:                 paco_confirmacion
Categoría:              Servicio / Utility (NO Marketing)
Idioma:                 Spanish
Texto:                  "Actualización del Hotel Villa Carmen.

                        Paco ha revisado tu situación y tiene
                        información nueva."
Botón:                  Ninguno (recomendado) o "Ver detalles"
Variables:              Ninguna (no usar {{1}}, {{2}}, etc.)
Multimedia:             Ninguno
Encabezado:             Vacío
Pie de página:          Vacío (o "Hotel Villa Carmen")
Período validez:        7 días (168 horas)
```

---

### 🔗 Documentación oficial sobre categorías

- [Template Categorization - Meta](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [Utility vs Marketing Guidelines](https://business.whatsapp.com/products/platform-pricing)
- [2025 Pricing Changes](https://developers.facebook.com/docs/whatsapp/pricing)

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

### Problema: "Template not approved" o rechazada

**Solución:**
- Las plantillas pueden tardar hasta 24 horas en aprobarse
- Revisa que no contengan URLs sospechosas o contenido prohibido
- Comprueba el estado en Meta Business → Plantillas de mensajes
- Si fue rechazada, edita el contenido y vuelve a enviar

### Problema: Meta quiere cambiar la plantilla a categoría "Marketing"

**Síntoma:**
Al enviar la plantilla ves: "Si envías esta plantilla se actualizará su categoría a marketing"

**Causa:**
Meta detectó que el mensaje suena promocional en lugar de transaccional/informativo.

**Solución:**
1. Haz clic en **"Cancelar"** (no aceptes el cambio a Marketing)
2. Usa el mensaje probado que funciona:
   ```
   Tienes una actualización pendiente de tu sesión con Paco.
   Responde cuando puedas para continuar.
   ```
3. Evita:
   - ❌ Lenguaje demasiado casual o promocional
   - ❌ Emojis excesivos
   - ❌ Frases tipo "¿tienes un momento?"
   - ❌ Intentar "enganchar" en exceso
4. Usa lenguaje más neutro y tipo "notificación de servicio"

**Si sigue sin funcionar:**
- Prueba con mensajes más formales (ver alternativas en sección 6.1)
- Como último recurso, acepta que sea Marketing (evalúa costes)

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
   - ✅ Cuenta de WhatsApp Business creada
   - ✅ Número verificado y perfil completado
   - ✅ App de Facebook creada
   - ✅ Webhook configurado y verificado
   - ✅ Eventos suscritos (messages, message_status)
   - ✅ Plantilla `paco_confirmacion` creada y aprobada (categoría: Servicio)

3. **Plantilla aprobada**:
   ```
   Nombre: paco_confirmacion
   Categoría: Servicio/Utility
   Texto: "Actualización del Hotel Villa Carmen.
           Paco ha revisado tu situación y tiene información nueva."
   Botón: Ninguno (recomendado)
   Validez: 7 días
   ```

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
