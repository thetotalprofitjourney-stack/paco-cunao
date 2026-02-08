# Ayuda a Paco 🏨

Juego conversacional asíncrono por WhatsApp donde ayudas a Paco, un tipo entrañable que heredó el **Hotel Villa Carmen** (90 habitaciones) en Badajoz, España. Paco no tiene experiencia en hostelería y gestiona a toda su familia extendida trabajando en el hotel. **Te necesita** para tomar decisiones y ayudarle a mantener el negocio familiar a flote.

## Características

- **🏨 Hotel Real**: 90 habitaciones, 5 departamentos, familia trabajadora, problemas reales de gestión
- **📱 100% por WhatsApp**: Todo el juego ocurre en conversaciones de WhatsApp
- **🤖 IA Generativa**: Cada partida es única, Paco responde según tus consejos usando GPT-4o-mini
- **⏱️ Ritmo tranquilo**: ~5 intercambios al mes, ideal para jugar sin presión
- **📖 Narrativa emergente**: No hay guion predefinido, la historia evoluciona según tus decisiones
- **👨‍👩‍👧‍👦 Personajes definidos**: Familia extendida con personalidades, conflictos y objetivos únicos

## 🎬 Contexto del Juego

### El Hotel Villa Carmen
- **Ubicación**: Badajoz, España (ciudad interior, no playa)
- **Capacidad**: 90 habitaciones, 3 estrellas
- **Año**: Fundado en 1985, arquitectura años 90-2000
- **Estado**: Funcional pero caótico - "demasiados cocineros en la cocina"

### Paco - El Protagonista
- **Edad**: 52 años, ex-administrativo de seguros
- **Situación**: Heredó el hotel hace 6 meses de su tío fallecido
- **Problema**: Sin experiencia hotelera + familia extendida trabajando = caos organizativo
- **Necesidad**: **TU AYUDA** para tomar decisiones y gestionar el hotel

### La Familia Trabajadora (Todos adultos 30s-60s)
- **Manolo** (cuñado): Jefe de Mantenimiento - Gruñón, "no hay presupuesto"
- **Lucía** (prima): Jefa de Limpieza - Perfeccionista, "siempre se ha hecho así"
- **Carlos** (primo): Recepcionista - Estresado, primera línea con quejas
- **Antonio** (tío): Chef - Artista orgulloso, pide ingredientes caros
- **Mercedes** (esposa): Coordinadora - Voz de la razón que nadie escucha
- **Carmen** (madre): Fundadora - Sabia pero desactualizada tecnológicamente

**Ver contexto completo en**: [`HOTEL_CONTEXT.md`](./HOTEL_CONTEXT.md)

## 🌐 Landing Page de Registro

La web de registro presenta:
- **Hero image full-screen**: Fotografía cinematográfica de Paco, su familia y el Hotel Villa Carmen
- **Formulario flotante inferior**: Glassmorphism, no invasivo, responsive
- **Info popup**: Explicación del juego sin saturar (mantiene la intriga)
- **Logo WhatsApp**: Integrado en el campo de teléfono
- **CTA emocional**: "Quiero ayudar a Paco"

**Diseñado para embeber en Kajabi** mediante iframe o código personalizado.

## Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Registro  │────▶│    Backend      │────▶│   PostgreSQL    │
│   (Next.js)     │     │   (Fastify)     │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
             ┌──────────┐ ┌──────────┐ ┌──────────┐
             │ WhatsApp │ │    IA    │ │  Redis   │
             │   API    │ │  (GPT)   │ │ (BullMQ) │
             └──────────┘ └──────────┘ └──────────┘
```

### Stack Tecnológico

- **Backend**: Node.js + Fastify
- **Base de datos**: PostgreSQL
- **Cola de trabajos**: Redis + BullMQ
- **Mensajería**: WhatsApp Business API (360dialog o Meta)
- **IA**: OpenAI GPT-4o-mini
- **Web**: Next.js

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd paco-cunao
```

### 2. Instalar dependencias

```bash
# Backend
npm install

# Web (opcional, si quieres ejecutar la web localmente)
cd web
npm install
cd ..
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env con tus credenciales
```

### 4. Levantar PostgreSQL y Redis

**Opción A: Con Docker (recomendado para desarrollo local)**

```bash
docker-compose up -d
```

**Opción B: En un servidor**

Instala PostgreSQL y Redis en tu servidor y configura las URLs en `.env`.

### 5. Ejecutar migraciones

```bash
npm run migrate
```

### 6. (Opcional) Crear datos de prueba

```bash
npm run seed
```

## Uso

### Desarrollo

```bash
# Backend
npm run dev

# Web (en otra terminal)
cd web
npm run dev
```

### Producción

```bash
# Backend
npm start

# Web
cd web
npm run build
npm start
```

## Scripts Disponibles

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo con hot reload
- `npm run migrate` - Ejecutar migraciones de base de datos
- `npm run seed` - Crear datos de prueba
- `npm run test-ai` - Probar prompts de IA sin WhatsApp

## Estructura del Proyecto

```
ayuda-a-paco/
├── src/
│   ├── config/          # Configuración (env, constants, sponsored products)
│   ├── db/              # Base de datos (client, queries, migrations)
│   ├── routes/          # Rutas del API (webhook, register, health)
│   ├── services/        # Servicios (WhatsApp, AI, game, scheduler)
│   ├── jobs/            # Jobs de BullMQ (sendAck, sendResults)
│   ├── prompts/         # Templates de prompts para la IA
│   └── index.js         # Entry point del servidor
├── web/                 # Aplicación Next.js para landing/registro
│   ├── pages/           # index.js (hero image + formulario flotante)
│   ├── styles/          # CSS Modules + globals (glassmorphism, responsive)
│   └── public/          # hero_paco.webp (imagen de fondo del hotel)
├── scripts/             # Scripts de utilidad (migrate, seed, test-ai)
├── tests/               # Tests
├── HOTEL_CONTEXT.md     # 🎯 Contexto canónico: personajes, hotel, Badajoz
├── PACO_PROFILE.md      # Perfil detallado de Paco (personalidad, historia)
├── GPT_CONFIG.md        # Configuración de prompts de IA
└── docker-compose.yml   # PostgreSQL + Redis para desarrollo
```

## Flujo del Juego

### 1. **Registro** (Landing Page)
- Usuario ve la imagen de Paco y el Hotel Villa Carmen
- Rellena formulario: Nombre + WhatsApp
- Recibe confirmación con instrucciones

### 2. **Activación** (Primer contacto por WhatsApp)
- Usuario envía primer mensaje por WhatsApp al número de Paco
- Paco responde presentándose: "Acabo de heredar este hotel... no sé por dónde empezar"
- Establece el tono: cercano, vulnerable, necesita ayuda real

### 3. **Ciclo de Juego** (Asíncrono, ~5 intercambios/mes)

#### Fase 1: Problema (TRIGGER)
Paco te cuenta una situación real del hotel:
- Overbooking en plena temporada
- Manolo y Antonio peleándose por la campana extractora
- Cliente VIP quejándose, Carlos estresado
- Presupuesto ajustado, decisiones difíciles

#### Fase 2: Consulta (30 min de consolidación)
- Jugador envía consejos/preguntas (WhatsApp las consolida 30 min)
- Paco envía **ACK**: "Recibido, lo voy a pensar y te cuento"
- Indica cuándo volverá con resultados

#### Fase 3: Resultados (3-7 días después)
- Paco cuenta **qué pasó** según tus consejos
- Qué funcionó, qué salió mal, consecuencias
- Menciones de personajes reaccionando
- Introduce **nuevo problema** (siguiente ciclo)

#### Fase 4: Loop
Vuelve a Fase 1 con nueva situación emergente

**La IA hace que cada partida sea única** - Paco recuerda tus decisiones anteriores y el hotel evoluciona según tus consejos.

## Configuración de WhatsApp

### Opción 1: 360dialog (por defecto)

1. Crea una cuenta en [360dialog](https://www.360dialog.com/)
2. Obtén tu API Key
3. Configura el webhook apuntando a `https://tu-dominio.com/webhook/whatsapp`
4. Actualiza `.env`:
   ```
   WHATSAPP_PROVIDER=360dialog
   WHATSAPP_360_API_KEY=tu_api_key
   WHATSAPP_360_WEBHOOK_TOKEN=tu_token
   ```

### Opción 2: Meta Cloud API

1. Configura WhatsApp Business en [Meta Business Suite](https://business.facebook.com/)
2. Obtén tu token y phone number ID
3. Actualiza `.env`:
   ```
   WHATSAPP_PROVIDER=meta
   WHATSAPP_META_TOKEN=tu_token
   WHATSAPP_PHONE_NUMBER_ID=tu_phone_id
   WHATSAPP_VERIFY_TOKEN=tu_verify_token
   ```

## Despliegue en Producción

### Requisitos

- Servidor Linux (Ubuntu/Debian recomendado)
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Dominio con HTTPS (para webhooks de WhatsApp)

### Pasos

1. Clona el repo en el servidor
2. Instala dependencias de producción: `npm ci --production`
3. Configura `.env` con credenciales reales
4. Ejecuta migraciones: `npm run migrate`
5. Usa un process manager como PM2:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name paco-backend
   pm2 startup
   pm2 save
   ```
6. Configura nginx como reverse proxy
7. Configura el webhook de WhatsApp apuntando a tu dominio

## Variables de Entorno Importantes

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `REDIS_URL` | URL de conexión a Redis |
| `WHATSAPP_PROVIDER` | Proveedor de WhatsApp (360dialog o meta) |
| `OPENAI_API_KEY` | API Key de OpenAI |
| `CONSOLIDATION_WINDOW_MS` | Tiempo de espera para consolidar mensajes (default: 30min) |
| `NIGHT_START_HOUR` | Hora de inicio del horario nocturno (default: 22) |
| `NIGHT_END_HOUR` | Hora de fin del horario nocturno (default: 7) |

## Costes Estimados (mensual)

| Concepto | 100 jugadores | 500 jugadores |
|----------|---------------|---------------|
| Servidor VPS | ~5€ | ~10€ |
| WhatsApp API | 0€ (tier gratis) | ~140€ |
| OpenAI (GPT-4o-mini) | ~2€ | ~12€ |
| **TOTAL** | **~7€** | **~162€** |

## Testing

### Test de prompts sin WhatsApp

```bash
npm run test-ai
```

Esto te permite probar cómo responde Paco sin necesidad de configurar WhatsApp.

## Monetización: Productos Patrocinados

El juego incluye un sistema opcional de productos patrocinados que permite menciones naturales de marcas cuando son contextualmente relevantes.

**Documentación completa**: Ver [`SPONSORED_PRODUCTS.md`](./SPONSORED_PRODUCTS.md)

**Cómo funciona:**
- Configura productos patrocinados en `src/config/sponsored-products.json`
- Paco los menciona de forma natural cuando el contexto lo requiere
- No es publicidad intrusiva: solo aparece cuando aporta valor a la conversación
- Ejemplo: Si el jugador pregunta por sistemas de reservas y tienes un PMS patrocinado, Paco lo menciona como algo que él usa

**Activar un producto:**
```json
{
  "id": "mi-producto",
  "name": "NombreDelProducto",
  "category": "pms",
  "url": "https://producto.com",
  "active": true  ← cambiar a true
}
```

## Soporte

Para issues o consultas, abre un issue en GitHub.

## Licencia

MIT
