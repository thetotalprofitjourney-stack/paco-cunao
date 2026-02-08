# Ayuda a Paco 🏨

Juego conversacional asíncrono por WhatsApp donde ayudas a Paco, un tipo entrañable que heredó el Hotel Villa Carmen y necesita tu ayuda para gestionarlo.

## Características

- **100% por WhatsApp**: Todo el juego ocurre en conversaciones de WhatsApp
- **IA Generativa**: Cada partida es única, Paco responde según tus consejos usando GPT-4o-mini
- **Ritmo tranquilo**: ~5 intercambios al mes, ideal para jugar sin presión
- **Narrativa emergente**: No hay guion predefinido, la historia evoluciona según tus decisiones

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
paco-el-cunao/
├── src/
│   ├── config/          # Configuración (env, constants)
│   ├── db/              # Base de datos (client, queries, migrations)
│   ├── routes/          # Rutas del API (webhook, register, health)
│   ├── services/        # Servicios (WhatsApp, AI, game, scheduler)
│   ├── jobs/            # Jobs de BullMQ (sendAck, sendResults)
│   ├── prompts/         # Templates de prompts para la IA
│   └── index.js         # Entry point del servidor
├── web/                 # Aplicación Next.js para registro
├── scripts/             # Scripts de utilidad
├── tests/               # Tests
└── docker-compose.yml   # PostgreSQL + Redis para desarrollo
```

## Flujo del Juego

1. **Registro**: Usuario se registra en la web con nombre y teléfono
2. **Activación**: Usuario envía primer mensaje por WhatsApp a Paco
3. **Trigger**: Paco responde con el mensaje inicial explicando su situación
4. **Ciclo de juego**:
   - Jugador envía consejos (se consolidan durante 30 minutos)
   - Paco envía ACK (acuse de recibo) y avisa que estará desconectado
   - Espera de 3-7 días
   - Paco envía RESULTS (qué pasó, qué funcionó, qué problema nuevo surgió)
   - Vuelve al inicio del ciclo

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
