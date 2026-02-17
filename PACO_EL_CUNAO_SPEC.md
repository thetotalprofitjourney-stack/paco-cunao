# Ayuda a Paco

## Juego conversacional asíncrono por WhatsApp

---

## 1. RESUMEN DEL PROYECTO

**Ayuda a Paco** es un juego de rol conversacional donde el jugador actúa como consultor de Paco, un tipo entrañable que ha heredado un hotel caótico y necesita ayuda para gestionarlo.

El juego funciona íntegramente por WhatsApp. El jugador da consejos, Paco los implementa (con resultados mixtos), y vuelve pidiendo ayuda con los nuevos problemas que surgen. No hay guion predefinido: una IA genera las respuestas de Paco basándose en el historial de cada jugador.

**Características clave:**
- Comunicación 100% por WhatsApp
- Ritmo lento y realista (~5 intercambios/mes)
- Narrativa emergente generada por IA
- Coste operativo: ~0.38€/jugador/mes

---

## 2. ARQUITECTURA GENERAL

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Registro  │────▶│    Backend      │────▶│   MariaDB    │
│   (Next.js)     │     │   (Node.js)     │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
             ┌──────────┐ ┌──────────┐ ┌──────────┐
             │ WhatsApp │ │    IA    │ │  Redis   │
             │   API    │ │  (LLM)   │ │  (Jobs)  │
             └──────────┘ └──────────┘ └──────────┘
```

### Componentes:

| Componente | Tecnología | Función |
|------------|------------|---------|
| Web Registro | Next.js | Landing + formulario registro |
| Backend API | Node.js + Fastify | Lógica de juego, webhooks |
| Base de datos | MariaDB | Jugadores, partidas, mensajes |
| Cola de trabajos | Redis + BullMQ | Timers (3h, 3-7 días) |
| Mensajería | WhatsApp Business API (360dialog) | Envío/recepción mensajes |
| IA | OpenAI GPT-4o-mini / Groq | Generación respuestas Paco |

---

## 3. FLUJO DEL JUEGO

### 3.1 Registro e inicio

```
1. Usuario entra en web → rellena formulario (nombre, teléfono)
2. Sistema guarda usuario en BD con estado "pending_activation"
3. Web muestra instrucciones: "Guarda este número y escríbele a Paco"
4. Usuario envía WhatsApp al número del juego
5. Webhook recibe mensaje → detecta teléfono registrado
6. Sistema activa usuario y envía MENSAJE TRIGGER
7. Estado pasa a "waiting_player"
```

### 3.2 Ciclo de juego (2 mensajes de Paco por ciclo)

```
Estado: WAITING_PLAYER
    │
    ▼ (jugador escribe mensaje)
    │
Estado: CONSOLIDATING
    │   - Timer de 30 MINUTOS activo
    │   - Si llega otro mensaje → REINICIAR timer a 30min
    │   - Acumula todos los mensajes del jugador
    │   - NO responde nada
    │
    ▼ (30 minutos sin nuevos mensajes)
    │
    ├── ¿Es horario nocturno (22:00-07:00)?
    │   → Sí: programar envío a las 07:00
    │   → No: enviar ahora
    │
Estado: SENDING_ACK
    │   - Concatena mensajes del jugador
    │   - Llama a IA para generar acuse de recibo
    │   - Envía MENSAJE B (acuse)
    │   - Calcula días de espera (3-7) según complejidad
    │
    ▼
Estado: WAITING_RESULTS
    │   - Timer de X días activo
    │   - IGNORA cualquier mensaje del jugador
    │
    ▼ (pasan X días)
    │
    ├── ¿Es horario nocturno (22:00-07:00)?
    │   → Sí: programar envío a las 07:00
    │   → No: enviar ahora
    │
Estado: SENDING_RESULTS
    │   - Llama a IA para generar resultados
    │   - Envía MENSAJE A (resultados + nuevo problema)
    │
    ▼
Estado: WAITING_PLAYER (nuevo ciclo)
```

### 3.3 Regla de consolidación (30 minutos de inactividad)

**CRÍTICO:** Cuando el jugador escribe después del último mensaje de Paco:
- Arranca un timer de 30 MINUTOS
- Si el jugador escribe otro mensaje, se REINICIA el timer a 30 minutos
- Se acumulan TODOS los mensajes mientras el jugador siga escribiendo
- Cuando pasan 30 minutos SIN nuevos mensajes, Paco responde procesando todo junto
- Esto permite al jugador escribir a su ritmo sin presión

### 3.4 Regla de horario nocturno

**Paco no escribe entre las 22:00 y las 07:00 (hora española).**

- Si un timer termina en horario nocturno, el envío se pospone a las 07:00
- Aplica tanto al mensaje ACK como al mensaje de RESULTS
- Refuerza el realismo: Paco duerme como una persona normal

### 3.5 Regla de silencio durante implementación

**Durante WAITING_RESULTS, se ignoran todos los mensajes del jugador.**

- El mensaje ACK avisa explícitamente: "Voy a estar unos días desconectado mientras pongo esto en marcha"
- Si el jugador escribe durante este período, NO se guarda, NO se procesa, NO se responde
- El jugador deberá esperar al siguiente ciclo para dar nuevas indicaciones

---

## 4. MODELO DE DATOS (MariaDB)

### 4.1 Tabla: users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,  -- formato E.164: +34612345678
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending_activation',
        -- pending_activation: registrado, esperando primer WA
        -- active: jugando
        -- inactive: abandonó (>30 días sin escribir)
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity_at TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
```

### 4.2 Tabla: games

```sql
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    state VARCHAR(20) DEFAULT 'waiting_player',
        -- waiting_player: esperando input del jugador
        -- consolidating: acumulando mensajes (timer 30min que se reinicia)
        -- sending_ack: procesando acuse de recibo
        -- waiting_results: esperando enviar resultados (IGNORA mensajes)
        -- sending_results: procesando mensaje de resultados
    
    -- Estado narrativo del hotel (JSON actualizado por IA cada ciclo)
    hotel_state JSONB DEFAULT '{
        "name": "Hotel Villa Carmen",
        "stars": 3,
        "rooms": 90,
        "occupancy_percent": 35,
        "employees": {
            "total": 8,
            "family": 6,
            "professional": 2
        },
        "monthly_revenue": 12000,
        "monthly_expenses": 11500,
        "google_rating": 2.8,
        "google_reviews_count": 47,
        "technology": {
            "has_wifi": false,
            "has_booking_system": false,
            "has_pms": false,
            "has_card_payment": true,
            "has_website": false
        },
        "chaos_level": 9,
        "family_tension_level": 7,
        "problems_resolved": [],
        "problems_active": [
            "reservas_en_excel",
            "no_wifi_clientes", 
            "familia_en_plantilla",
            "resenas_negativas"
        ]
    }',
    
    -- Historial resumido de la partida (una frase por ciclo)
    key_events JSONB DEFAULT '[]',
    -- Ejemplo: [
    --   {"cycle": 1, "summary": "Se instalo wifi. La tia Encarna se quejo del gasto."},
    --   {"cycle": 2, "summary": "Paco hablo con Encarna, ella amenazo con irse."},
    --   {"cycle": 3, "summary": "Encarna nombrada Supervisora de Calidad. Tension reducida."}
    -- ]
    
    -- Control de ciclos
    current_cycle INT DEFAULT 0,
    consolidation_started_at TIMESTAMP,
    consolidation_job_id VARCHAR(100),     -- ID del job en BullMQ para poder cancelarlo
    results_scheduled_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_games_user ON games(user_id);
CREATE INDEX idx_games_state ON games(state);
```

### 4.3 Tabla: messages

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    cycle INT NOT NULL,
    direction VARCHAR(10) NOT NULL,       -- 'inbound' | 'outbound'
    message_type VARCHAR(20),             -- 'player_input' | 'trigger' | 'ack' | 'results'
    content TEXT NOT NULL,
    wa_message_id VARCHAR(100),
    tokens_input INT,                     -- tokens de input consumidos (si es de IA)
    tokens_output INT,                    -- tokens de output consumidos (si es de IA)
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_game ON messages(game_id);
CREATE INDEX idx_messages_cycle ON messages(game_id, cycle);
CREATE INDEX idx_messages_game_type ON messages(game_id, message_type);
```

### 4.4 Tabla: scheduled_jobs

```sql
-- Para tracking de jobs de BullMQ (opcional, BullMQ tiene su propio almacenamiento en Redis)
CREATE TABLE scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    job_type VARCHAR(20) NOT NULL,  -- 'send_ack' | 'send_results'
    scheduled_for TIMESTAMP NOT NULL,
    bullmq_job_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'completed' | 'failed'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jobs_scheduled ON scheduled_jobs(scheduled_for);
CREATE INDEX idx_jobs_game ON scheduled_jobs(game_id);
```

---

## 5. ENDPOINTS API

### 5.1 Webhook WhatsApp (POST /webhook/whatsapp)

Recibe mensajes entrantes de WhatsApp.

```javascript
// Payload de 360dialog/WhatsApp Cloud API
{
  "messages": [{
    "from": "34612345678",
    "type": "text",
    "text": { "body": "Yo lo primero que haría es poner wifi" },
    "timestamp": "1234567890"
  }]
}

// Lógica:
// 1. Buscar usuario por teléfono
// 2. Si no existe o status != active → ignorar (o activar si pending)
// 3. Obtener game del usuario
// 4. Según game.state:
//    - waiting_player → crear job 30min, cambiar a consolidating, guardar mensaje
//    - consolidating → REINICIAR timer 30min, guardar mensaje
//    - waiting_results → IGNORAR mensaje completamente (no guardar)
//    - otros estados → ignorar
```

### 5.2 Registro usuario (POST /api/register)

```javascript
// Request
{
  "name": "Juan",
  "phone": "+34612345678"
}

// Response
{
  "success": true,
  "instructions": "Guarda el número +34600000000 y escríbele: Hola Paco, ¿en qué puedo ayudarte?"
}

// Lógica:
// 1. Validar formato teléfono (E.164)
// 2. Crear usuario con status 'pending_activation'
// 3. Crear game asociado
```

### 5.3 Health check (GET /health)

```javascript
// Response
{
  "status": "ok",
  "db": "connected",
  "redis": "connected",
  "whatsapp": "connected"
}
```

---

## 6. JOBS (BullMQ)

### 6.1 Job: send_ack

Se ejecuta 30 minutos después del ÚLTIMO mensaje del jugador (timer se reinicia con cada mensaje).

```javascript
// Datos del job
{
  "gameId": "uuid",
  "cycle": 1
}

// Proceso:
// 1. Verificar que el estado sigue siendo 'consolidating' (si no, abortar)
// 2. Comprobar horario: ¿es entre 22:00 y 07:00 hora española?
//    → Sí: reprogramar job para las 07:00, salir
//    → No: continuar
// 3. Obtener todos los mensajes del jugador en este ciclo
// 4. Concatenar contenido
// 5. Llamar a IA con prompt de ACK
// 6. Enviar mensaje por WhatsApp
// 7. Guardar mensaje en BD
// 8. Calcular días de espera (3-7, basado en reglas o respuesta IA)
// 9. Programar job send_results respetando horario nocturno
// 10. Actualizar game.state = 'waiting_results'
```

### 6.2 Job: send_results

Se ejecuta 3-7 días después del ACK.

```javascript
// Datos del job
{
  "gameId": "uuid",
  "cycle": 1
}

// Proceso:
// 1. Comprobar horario: ¿es entre 22:00 y 07:00 hora española?
//    → Sí: reprogramar job para las 07:00, salir
//    → No: continuar
// 2. Obtener historial relevante (últimos N mensajes + hotel_state)
// 3. Llamar a IA con prompt de RESULTS
// 4. Parsear respuesta para extraer:
//    - Mensaje para el jugador
//    - Actualizaciones a hotel_state
// 5. Enviar mensaje por WhatsApp
// 6. Guardar mensaje en BD
// 7. Actualizar hotel_state en game
// 8. Incrementar cycle
// 9. Actualizar game.state = 'waiting_player'
```

### 6.3 Lógica de reinicio de timer (en webhook)

```javascript
// Cuando llega mensaje en estado 'consolidating':
// 1. Cancelar job anterior de send_ack (si existe)
// 2. Crear nuevo job send_ack con delay de 30 minutos
// 3. Guardar mensaje en BD
// 4. Actualizar consolidation_started_at (opcional, para tracking)
```

### 6.4 Helper: comprobar horario nocturno

```javascript
const isNightTime = () => {
  // Hora actual en España
  const spainTime = new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' });
  const hour = new Date(spainTime).getHours();
  return hour >= 22 || hour < 7;
};

const getNextAllowedTime = () => {
  // Devuelve las 07:00 del día siguiente (o de hoy si aún no son las 07:00)
  const now = new Date();
  const spain = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  
  let next7am = new Date(spain);
  next7am.setHours(7, 0, 0, 0);
  
  if (spain.getHours() >= 7) {
    next7am.setDate(next7am.getDate() + 1);
  }
  
  return next7am;
};
```

---

## 7. SISTEMA DE MEMORIA Y CONTEXTO

La IA no tiene memoria entre llamadas. Todo el contexto debe enviarse en cada request.
Usamos un sistema de memoria en capas para mantener coherencia narrativa sin explotar en tokens.

### 7.1 Capas de memoria

```
┌─────────────────────────────────────────────────────────────────┐
│ CAPA 1: hotel_state (JSON)                                      │
│ Estado actual del hotel: empleados, tecnologia, ingresos, etc.  │
│ Se actualiza al final de cada ciclo.                            │
│ ~200-300 tokens                                                 │
├─────────────────────────────────────────────────────────────────┤
│ CAPA 2: key_events (Array)                                      │
│ Una frase por ciclo resumiendo que paso.                        │
│ Da memoria "larga" de toda la partida.                          │
│ ~10-20 tokens por ciclo, crece con el tiempo                    │
├─────────────────────────────────────────────────────────────────┤
│ CAPA 3: Ultimos 2 ciclos completos (mensajes literales)         │
│ Mensajes reales de los 2 ciclos anteriores.                     │
│ Permite referencias concretas a conversaciones recientes.       │
│ ~300-500 tokens                                                 │
├─────────────────────────────────────────────────────────────────┤
│ CAPA 4: Mensajes del ciclo actual                               │
│ Lo que el jugador acaba de escribir (consolidado).              │
│ ~100-300 tokens                                                 │
└─────────────────────────────────────────────────────────────────┘
TOTAL ESTIMADO: 800-1500 tokens de contexto
```

### 7.2 Construccion del contexto para la IA

```javascript
const buildContext = async (gameId, currentCycleMessages) => {
  const game = await getGame(gameId);
  const recentMessages = await getMessagesFromLastNCycles(gameId, 2);
  
  return `
ESTADO ACTUAL DEL HOTEL "${game.hotel_state.name}":
- Estrellas: ${game.hotel_state.stars}
- Habitaciones: ${game.hotel_state.rooms} (${game.hotel_state.occupancy_percent}% ocupacion)
- Empleados: ${game.hotel_state.employees.total} (${game.hotel_state.employees.family} familia, ${game.hotel_state.employees.professional} profesionales)
- Ingresos: ${game.hotel_state.monthly_revenue}€/mes | Gastos: ${game.hotel_state.monthly_expenses}€/mes
- Valoracion Google: ${game.hotel_state.google_rating}/5 (${game.hotel_state.google_reviews_count} resenas)
- Tecnologia: WiFi ${game.hotel_state.technology.has_wifi ? 'SI' : 'NO'}, Sistema reservas ${game.hotel_state.technology.has_booking_system ? 'SI' : 'NO (Excel)'}, Web ${game.hotel_state.technology.has_website ? 'SI' : 'NO'}
- Nivel de caos: ${game.hotel_state.chaos_level}/10
- Tension familiar: ${game.hotel_state.family_tension_level}/10
- Problemas activos: ${game.hotel_state.problems_active.join(', ')}
- Problemas resueltos: ${game.hotel_state.problems_resolved.join(', ') || 'ninguno aun'}

HISTORIAL DE LA PARTIDA:
${game.key_events.map(e => `- Ciclo ${e.cycle}: ${e.summary}`).join('\n') || '(Partida recien comenzada)'}

CONVERSACION RECIENTE:
${formatRecentMessages(recentMessages)}

MENSAJES DEL JUGADOR EN ESTE CICLO:
${currentCycleMessages.map(m => m.content).join('\n\n')}
`;
};
```

### 7.3 Generacion del resumen de ciclo

Al final de cada ciclo (despues de enviar RESULTS), hacemos una llamada adicional para generar el resumen:

```javascript
const generateCycleSummary = async (game, playerMessages, resultsMessage) => {
  const prompt = `
Resume en UNA SOLA FRASE (maximo 20 palabras) que paso en este ciclo del juego.

El jugador sugirio:
${playerMessages}

Paco hizo:
${resultsMessage}

Ejemplo de formato: "Se instalo wifi. La tia Encarna amenazo con irse por el gasto."

RESUMEN:`;

  const summary = await callAI(prompt, { max_tokens: 50 });
  
  // Añadir al array de key_events
  await addKeyEvent(game.id, game.current_cycle, summary);
};
```

### 7.4 Limpieza de memoria (opcional, para partidas muy largas)

Si una partida supera los 50 ciclos, podemos comprimir los key_events antiguos:

```javascript
const compressOldEvents = async (gameId) => {
  const game = await getGame(gameId);
  
  if (game.key_events.length > 50) {
    // Mantener los ultimos 20 eventos intactos
    const recentEvents = game.key_events.slice(-20);
    const oldEvents = game.key_events.slice(0, -20);
    
    // Pedir a la IA que resuma los eventos antiguos en 5-10 puntos
    const compressedHistory = await compressEvents(oldEvents);
    
    // Guardar: eventos comprimidos + eventos recientes
    await updateKeyEvents(gameId, [
      { cycle: 0, summary: `RESUMEN CICLOS 1-${oldEvents.length}: ${compressedHistory}` },
      ...recentEvents
    ]);
  }
};
```

---

## 8. PROMPTS DE IA

### 8.1 System prompt base (Paco)

```
Eres Paco, un hombre de 52 años que dirige el Hotel Villa Carmen en Badajoz centro (90 habitaciones + salones para bodas).
Tu experiencia previa: 5 años con un bar de tapas en tu barrio.

PERSONALIDAD:
- Cercano y educado (NO uses: "tío", "máquina", "crack", "bro" ni derivados)
- Humilde, pero no pusilánime (no pides perdón constantemente)
- Trabajador y constante: te esfuerzas y eso se nota
- Cabezoneas cuando crees que algo es importante (proteger a tu gente, el hotel o tu dignidad)
- Tienes orgullo sano por lo que construyes
- Aprendes despacio, pero no te rindes
- Expresivo: usas exclamaciones, algún emoji ocasional (máximo 1-2 por mensaje)
- Cuentas anécdotas del hotel y la familia cuando viene a cuento
- A veces malinterpretas los consejos de forma cómica pero bienintencionada
- Hablas como en WhatsApp: informal, cercano, con algún error menor de escritura ocasional
- Usas expresiones coloquiales españolas

LENGUAJE INCLUSIVO (CRÍTICO):
- NUNCA asumas el género del jugador
- Dirígete en neutro o usando su nombre si está disponible
- Ejemplos válidos: "Me quedo con lo que me dices", "Como lo ves tú", "Gracias por estar ahí"
- Ejemplos prohibidos: "Gracias tío", "A ver qué me dices, jefe"

REGLAS ABSOLUTAS:
- Mensajes de 100-180 palabras máximo (estilo WhatsApp real)
- NUNCA inventes soluciones: solo reaccionas a lo que propone el jugador
- Siempre incluyes algo positivo Y algo problemático (una de cal, una de arena)
- Terminas pidiendo ayuda o consejo sobre el nuevo problema surgido
- Recuerda y haz referencia a cosas que pasaron en ciclos anteriores cuando sea relevante

CABEZONERÍA NARRATIVA:
- Puedes insistir en una idea si crees que protege a tu gente, el hotel o tu dignidad
- Esto permite "Te hice caso... a medias" y fricciones sanas

{{CONTEXTO_PARTIDA}}
```

### 8.2 Prompt para ACK (mensaje B)

```
El jugador te ha enviado estos consejos:

---
{{player_messages}}
---

Genera un mensaje de acuse de recibo donde:
1. Muestras que has leido y entendido TODO lo que te ha dicho
2. Resumes brevemente que vas a intentar hacer
3. Le avisas de que vas a estar DESCONECTADO unos dias mientras lo pones en marcha
4. Le dices que le escribiras cuando tengas resultados

IMPORTANTE: Deja claro que no vas a poder leer mensajes durante unos dias.

Longitud: 60-100 palabras maximo.
Tono: agradecido, motivado, un poco nervioso por intentar algo nuevo.

Ejemplo de cierre: "Voy a estar unos dias desconectado mientras pongo todo esto en marcha, que

 bastante lio va a ser jaja. Te escribo cuando tenga novedades!"
```

### 8.3 Prompt para RESULTS (mensaje A)

```
Han pasado {{days}} dias. El jugador te sugirio:

---
{{player_suggestion}}
---

Genera DOS cosas:

1. MENSAJE PARA EL JUGADOR (120-180 palabras):
   - Cuenta que hiciste y como fue
   - Incluye UN resultado positivo concreto y medible si es posible
   - Incluye UN problema nuevo o consecuencia inesperada
   - Termina pidiendo consejo sobre el nuevo problema
   - Haz referencia a eventos pasados si es relevante (mira el historial)

2. ACTUALIZACIONES AL ESTADO DEL HOTEL (JSON):
   Solo incluye los campos que cambian. Ejemplos:
   - Si instalaste wifi: {"technology": {"has_wifi": true}}
   - Si mejor la ocupacion: {"occupancy_percent": 42}
   - Si contrataste a alguien: {"employees": {"total": 9, "professional": 3}}
   - Si resolviste un problema: {"problems_resolved": ["wifi"], "problems_active": ["nuevo_problema"]}

Responde en este formato exacto:

---MENSAJE---
(tu mensaje para el jugador aqui)

---HOTEL_UPDATE---
{"campo": "valor", ...}

---RESUMEN_CICLO---
(una frase de max 20 palabras resumiendo que paso en este ciclo)
```

---

## 9. INTEGRACION WHATSAPP (MODULAR)

El servicio de WhatsApp esta diseñado como un modulo aislado.
Para cambiar de proveedor (360dialog → Meta directo), solo hay que modificar este archivo.

### 9.1 Interfaz del servicio

```javascript
// src/services/whatsapp/index.js
// Este archivo exporta las funciones, internamente usa el proveedor configurado

const provider = require(`./${process.env.WHATSAPP_PROVIDER || '360dialog'}`);

module.exports = {
  sendMessage: provider.sendMessage,
  verifyWebhook: provider.verifyWebhook,
  parseIncomingMessage: provider.parseIncomingMessage,
  getMessageStatus: provider.getMessageStatus
};
```

### 9.2 Proveedor: 360dialog (inicial)

```javascript
// src/services/whatsapp/360dialog.js

const API_URL = 'https://waba.360dialog.io/v1/messages';

const sendMessage = async (phone, text) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'D360-API-KEY': process.env.WHATSAPP_360_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone.replace('+', ''),  // 360dialog no quiere el +
      type: 'text',
      text: { body: text }
    })
  });
  
  const data = await response.json();
  return {
    success: response.ok,
    messageId: data.messages?.[0]?.id,
    error: data.error?.message
  };
};

const parseIncomingMessage = (webhookBody) => {
  const entry = webhookBody.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];
  
  if (!message) return null;
  
  return {
    from: message.from,
    text: message.text?.body || '',
    timestamp: new Date(parseInt(message.timestamp) * 1000),
    messageId: message.id,
    type: message.type
  };
};

const verifyWebhook = (req) => {
  // 360dialog usa un token en el header
  return req.headers['d360-api-key'] === process.env.WHATSAPP_360_WEBHOOK_TOKEN;
};

module.exports = { sendMessage, parseIncomingMessage, verifyWebhook };
```

### 9.3 Proveedor: Meta Cloud API (futuro)

```javascript
// src/services/whatsapp/meta.js
// Para cuando migres a Meta directo

const API_URL = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

const sendMessage = async (phone, text) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_META_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone.replace('+', ''),
      type: 'text',
      text: { body: text }
    })
  });
  
  const data = await response.json();
  return {
    success: response.ok,
    messageId: data.messages?.[0]?.id,
    error: data.error?.message
  };
};

const verifyWebhook = (req) => {
  // Meta usa verificacion con hub.verify_token
  if (req.query['hub.mode'] === 'subscribe') {
    if (req.query['hub.verify_token'] === process.env.WHATSAPP_VERIFY_TOKEN) {
      return { verified: true, challenge: req.query['hub.challenge'] };
    }
  }
  return { verified: false };
};

const parseIncomingMessage = (webhookBody) => {
  // El formato es casi identico a 360dialog (ambos siguen Cloud API)
  const entry = webhookBody.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];
  
  if (!message) return null;
  
  return {
    from: message.from,
    text: message.text?.body || '',
    timestamp: new Date(parseInt(message.timestamp) * 1000),
    messageId: message.id,
    type: message.type
  };
};

module.exports = { sendMessage, parseIncomingMessage, verifyWebhook };
```

### 9.4 Cambiar de proveedor

Para migrar de 360dialog a Meta directo:

1. Configura tu cuenta en Meta Business Suite
2. Cambia la variable de entorno: `WHATSAPP_PROVIDER=meta`
3. Añade las nuevas variables: `WHATSAPP_META_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
4. Actualiza la URL del webhook en Meta
5. Listo, sin tocar nada mas del codigo

---

## 10. ESTRUCTURA DE CARPETAS

```
paco-el-cunao/
├── README.md
├── package.json
├── .env.example
├── docker-compose.yml          # MariaDB + Redis para desarrollo
│
├── src/
│   ├── index.js                # Entry point Fastify
│   ├── config/
│   │   ├── env.js              # Variables de entorno
│   │   └── constants.js        # Constantes del juego
│   │
│   ├── db/
│   │   ├── client.js           # Conexion MariaDB
│   │   ├── migrations/         # Migraciones SQL
│   │   │   ├── 001_users.sql
│   │   │   ├── 002_games.sql
│   │   │   ├── 003_messages.sql
│   │   │   └── 004_scheduled_jobs.sql
│   │   └── queries/
│   │       ├── users.js
│   │       ├── games.js
│   │       └── messages.js
│   │
│   ├── routes/
│   │   ├── webhook.js          # POST /webhook/whatsapp
│   │   ├── register.js         # POST /api/register
│   │   └── health.js           # GET /health
│   │
│   ├── services/
│   │   ├── whatsapp/           # MODULO AISLADO - facil de cambiar proveedor
│   │   │   ├── index.js        # Exporta interfaz comun
│   │   │   ├── 360dialog.js    # Implementacion 360dialog
│   │   │   └── meta.js         # Implementacion Meta Cloud API (futuro)
│   │   │
│   │   ├── ai/
│   │   │   ├── client.js       # Cliente OpenAI
│   │   │   ├── prompts.js      # Carga y formatea prompts
│   │   │   └── context.js      # Construye contexto para la IA
│   │   │
│   │   ├── game/
│   │   │   ├── stateMachine.js # Logica de estados
│   │   │   ├── memory.js       # Gestion de hotel_state y key_events
│   │   │   └── cycle.js        # Logica de ciclos
│   │   │
│   │   └── scheduler/
│   │       └── nightTime.js    # Logica horario nocturno
│   │
│   ├── jobs/
│   │   ├── queue.js            # Configuracion BullMQ
│   │   ├── sendAck.js          # Job: enviar acuse de recibo
│   │   ├── sendResults.js      # Job: enviar resultados
│   │   └── workers.js          # Registro de workers
│   │
│   └── prompts/
│       ├── system.txt          # System prompt de Paco
│       ├── ack.txt             # Template prompt ACK
│       └── results.txt         # Template prompt RESULTS
│
├── web/                        # Frontend Next.js (puede ser repo separado)
│   ├── pages/
│   │   ├── index.js            # Landing + formulario registro
│   │   └── instrucciones.js    # Pagina post-registro con instrucciones
│   ├── components/
│   └── styles/
│
├── scripts/
│   ├── migrate.js              # Ejecutar migraciones
│   ├── seed.js                 # Datos de prueba
│   └── test-ai.js              # Probar prompts sin WhatsApp
│
└── tests/
    ├── services/
    │   ├── whatsapp.test.js
    │   ├── ai.test.js
    │   └── game.test.js
    └── integration/
        └── webhook.test.js
```

---

## 11. VARIABLES DE ENTORNO

```bash
# .env.example

# Base de datos
DATABASE_URL=mysql://user:pass@localhost:5432/paco_el_cunao

# Redis (para BullMQ)
REDIS_URL=redis://localhost:6379

# WhatsApp - Proveedor (cambiar a 'meta' cuando migres)
WHATSAPP_PROVIDER=360dialog

# WhatsApp - 360dialog
WHATSAPP_360_API_KEY=tu_api_key_aqui
WHATSAPP_360_WEBHOOK_TOKEN=token_verificacion_webhook

# WhatsApp - Meta Cloud API (para cuando migres)
# WHATSAPP_PROVIDER=meta
# WHATSAPP_META_TOKEN=tu_token_meta
# WHATSAPP_PHONE_NUMBER_ID=tu_phone_id
# WHATSAPP_VERIFY_TOKEN=tu_verify_token

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Servidor
PORT=3000
NODE_ENV=development

# Tiempos (en milisegundos)
CONSOLIDATION_WINDOW_MS=1800000       # 30 minutos de inactividad
MIN_RESULTS_DELAY_MS=259200000        # 3 dias
MAX_RESULTS_DELAY_MS=604800000        # 7 dias

# Horario nocturno (hora española)
NIGHT_START_HOUR=22                   # No enviar desde las 22:00
NIGHT_END_HOUR=7                      # Hasta las 07:00
TIMEZONE=Europe/Madrid

# Memoria/Contexto
RECENT_CYCLES_TO_INCLUDE=2            # Cuantos ciclos completos incluir en contexto
MAX_KEY_EVENTS=50                     # Maximo de eventos antes de comprimir
```

---

## 12. COMANDOS DE DESARROLLO

```bash
# Instalar dependencias
npm install

# Levantar MariaDB + Redis con Docker
docker-compose up -d

# Ejecutar migraciones
npm run migrate

# Desarrollo con hot reload
npm run dev

# Producción
npm start

# Tests
npm test
```

---

## 13. CHECKLIST DE IMPLEMENTACION

### Fase 1: Infraestructura basica
- [ ] Configurar proyecto Node.js + Fastify
- [ ] Configurar MariaDB y crear tablas
- [ ] Configurar Redis + BullMQ
- [ ] Implementar health check
- [ ] Docker compose para desarrollo local

### Fase 2: Modulo WhatsApp
- [ ] Implementar servicio 360dialog
- [ ] Webhook para recibir mensajes
- [ ] Funcion enviar mensaje
- [ ] Preparar estructura para Meta (futuro)

### Fase 3: Registro y activacion
- [ ] Endpoint POST /api/register
- [ ] Validacion telefono formato E.164
- [ ] Logica de activacion (pending → active)
- [ ] Envio de mensaje trigger

### Fase 4: Maquina de estados
- [ ] Estado WAITING_PLAYER
- [ ] Estado CONSOLIDATING con timer 30min reiniciable
- [ ] Estado WAITING_RESULTS (ignorar mensajes)
- [ ] Transiciones entre estados
- [ ] Logica horario nocturno

### Fase 5: Sistema de memoria
- [ ] Estructura hotel_state completa
- [ ] Array key_events
- [ ] Funcion buildContext()
- [ ] Generacion de resumen de ciclo
- [ ] (Opcional) Compresion para partidas largas

### Fase 6: Integracion IA
- [ ] Cliente OpenAI
- [ ] System prompt de Paco
- [ ] Prompt ACK con aviso desconexion
- [ ] Prompt RESULTS con formato estructurado
- [ ] Parseo de respuesta (mensaje + hotel_update + resumen)
- [ ] Actualizacion de hotel_state post-ciclo

### Fase 7: Jobs BullMQ
- [ ] Job sendAck
- [ ] Job sendResults
- [ ] Cancelacion de jobs al reiniciar timer
- [ ] Respeto horario nocturno en jobs

### Fase 8: Web de registro
- [ ] Landing page
- [ ] Formulario con validacion
- [ ] Pagina instrucciones post-registro

### Fase 9: Testing y pulido
- [ ] Tests unitarios servicios
- [ ] Tests integracion webhook
- [ ] Script test-ai.js para probar prompts
- [ ] Ajuste de prompts con pruebas reales
- [ ] Monitorizacion y logs

---

## 14. COSTES ESTIMADOS

| Concepto | Coste mensual |
|----------|---------------|
| Servidor VPS (Hetzner CX21) | ~5€ |
| WhatsApp (100 jugadores, tier gratis) | 0€ |
| WhatsApp (500 jugadores) | ~140€ |
| IA GPT-4o-mini (500 jugadores) | ~12€ |
| **Total 100 jugadores** | **~5€** |
| **Total 500 jugadores** | **~157€** |

---

## 15. NOTAS IMPORTANTES

1. **La ventana de 30 minutos se REINICIA**: Cada mensaje del jugador reinicia el contador. Solo respondemos cuando lleva 30 min sin escribir.

2. **Horario nocturno es sagrado**: Nada de mensajes entre 22:00 y 07:00 hora espanola. Si un timer termina en ese rango, se pospone a las 07:00.

3. **Durante WAITING_RESULTS se ignora TODO**: El jugador no puede anadir nada. El mensaje ACK le avisa de esto explicitamente.

4. **Sistema de memoria en 4 capas**: hotel_state (estado actual) + key_events (resumen historico) + ultimos 2 ciclos completos + mensajes actuales. Esto da coherencia narrativa sin explotar en tokens.

5. **Una de cal, una de arena**: SIEMPRE. Cada respuesta de resultados debe tener algo bueno y algo malo. Es la mecanica core.

6. **Paco es cercano pero no pesado**: No usa demasiados emojis, no es excesivamente efusivo. Es un trabajador humilde pero no pusilánime. Su simpatía viene del esfuerzo, no de la inseguridad.

7. **Cabezonería narrativa**: Paco puede "hacer caso a medias" si cree que algo protege a su gente, el hotel o su dignidad. Esto genera fricción sana y evolución del personaje sin traicionar completamente al jugador.

8. **El modulo WhatsApp es intercambiable**: Disenado para cambiar de 360dialog a Meta directo modificando solo una variable de entorno y un archivo.

---

*Documento preparado para desarrollo. Ultima actualizacion: Febrero 2025*
