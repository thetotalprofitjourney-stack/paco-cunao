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
│   Web Registro  │────▶│    Backend      │────▶│    MariaDB      │
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

- **Backend**: Node.js 18+ + Fastify
- **Base de datos**: MariaDB 11.2+ (MySQL compatible)
- **Cola de trabajos**: Redis 7+ + BullMQ
- **Mensajería**: WhatsApp Business API (360dialog o Meta)
- **IA**: OpenAI GPT-4o-mini
- **Web**: Next.js 14
- **Infraestructura**: Docker + Plesk (producción) | Docker scripts (desarrollo)

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

### 4. Levantar MariaDB y Redis (Desarrollo)

**⚠️ Importante**: Esta sección es SOLO para desarrollo local. En producción, MariaDB y Redis se instalan en el host (ver sección "Despliegue en Producción").

**Opción A: Con scripts Docker (recomendado para desarrollo)**

```bash
# Iniciar todo (MariaDB + Redis)
./docker/start-all.sh

# O iniciar servicios individuales
./docker/start-mariadb.sh
./docker/start-redis.sh
```

Ver [`docker/README.md`](./docker/README.md) para más detalles sobre los scripts Docker.

**Opción B: Con Docker Compose**

```bash
docker-compose up -d
```

**Opción C: Instalación nativa (también para desarrollo)**

Instala MariaDB y Redis en tu sistema:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mariadb-server redis-server

# Configurar MariaDB
sudo mysql_secure_installation

# Crear base de datos
sudo mysql -u root -p
CREATE DATABASE paco_el_cunao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'paco'@'localhost' IDENTIFIED BY 'paco123';
GRANT ALL PRIVILEGES ON paco_el_cunao.* TO 'paco'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

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
├── docker/              # Scripts Docker sin docker-compose
│   ├── start-mariadb.sh # Iniciar MariaDB
│   ├── start-redis.sh   # Iniciar Redis
│   ├── start-all.sh     # Iniciar todo
│   ├── stop-all.sh      # Detener todo
│   └── README.md        # Documentación de scripts Docker
├── scripts/             # Scripts de utilidad (migrate, seed, test-ai)
├── tests/               # Tests
├── HOTEL_CONTEXT.md     # 🎯 Contexto canónico: personajes, hotel, Badajoz
├── PACO_PROFILE.md      # Perfil detallado de Paco (personalidad, historia)
├── GPT_CONFIG.md        # Configuración de prompts de IA
└── docker-compose.yml   # MariaDB + Redis (legacy, usar scripts docker/)
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

## Variables de Entorno Importantes

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de conexión a MariaDB (formato: `mysql://user:password@host:3306/database`) |
| `REDIS_URL` | URL de conexión a Redis (formato: `redis://host:6379`) |
| `WHATSAPP_PROVIDER` | Proveedor de WhatsApp (360dialog o meta) |
| `OPENAI_API_KEY` | API Key de OpenAI |
| `CONSOLIDATION_WINDOW_MS` | Tiempo de espera para consolidar mensajes (default: 30min) |
| `NIGHT_START_HOUR` | Hora de inicio del horario nocturno (default: 22) |
| `NIGHT_END_HOUR` | Hora de fin del horario nocturno (default: 7) |

## Despliegue en Producción

### Infraestructura de Producción

Este proyecto está optimizado para desplegarse en:
- **Sistema Operativo**: Ubuntu 24.04 LTS
- **Panel de Control**: Plesk Obsidian
- **Base de Datos**: MariaDB (instalado en el host, gestionado por Plesk)
- **Cache/Queue**: Redis (instalado en el host, gestionado por Plesk)
- **Backend**: Node.js con PM2 (en el host)
- **Reverse Proxy**: Nginx (gestionado por Plesk)

**⚠️ Importante**: Docker se usa SOLO para desarrollo local. En producción, todos los servicios se ejecutan directamente en el host.

**Arquitectura de Producción**:
```
┌──────────────────────────────────────────────────────┐
│  Servidor Ubuntu 24.04 (Host)                        │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Plesk     │  │  MariaDB    │  │   Redis     │  │
│  │  (Panel)    │  │   (Host)    │  │   (Host)    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                       │
│  ┌─────────────┐  ┌─────────────────────────────┐   │
│  │    PM2      │  │          Nginx              │   │
│  │  (Node.js)  │◄─┤    (Reverse Proxy)          │   │
│  └─────────────┘  └─────────────────────────────┘   │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Guía de Migración a Producción (Paso a Paso)

#### Prerequisitos en el Servidor

1. **Acceso SSH** al servidor Ubuntu 24.04
2. **Plesk** instalado y configurado
3. **Dominio** apuntando al servidor (con SSL/HTTPS configurado en Plesk)

#### Paso 1: Preparar la Base de Datos MariaDB en el Host

**Importante**: La base de datos MariaDB se ejecuta directamente en el host (no en Docker), gestionada por Plesk.

1. En Plesk, ve a **Bases de Datos** → **Agregar base de datos**
2. Crea una nueva base de datos:
   - **Nombre**: `paco_el_cunao`
   - **Usuario**: `paco`
   - **Contraseña**: (genera una segura)
   - **Tipo**: MariaDB
   - **Servidor de base de datos**: Local (MariaDB en el host)
   - **Charset**: `utf8mb4`
   - **Collation**: `utf8mb4_unicode_ci`
3. Anota las credenciales y el **host** (normalmente `localhost` o `127.0.0.1`)
4. Plesk gestionará automáticamente MariaDB en el servidor

**Nota**: Si Plesk no tiene MariaDB instalado, instálalo desde:
```bash
# Instalar MariaDB en Ubuntu 24.04
sudo apt update
sudo apt install mariadb-server -y
sudo mysql_secure_installation

# Verificar instalación
mysql --version
```

Luego configúralo en Plesk: **Herramientas y Configuración** → **Servidores de bases de datos** → **Agregar servidor de base de datos**.

#### Paso 2: Instalar Docker en Ubuntu 24.04

```bash
# Conectarse por SSH al servidor
ssh usuario@tu-servidor.com

# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
sudo apt install docker.io -y

# Habilitar Docker
sudo systemctl enable docker
sudo systemctl start docker

# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# Cerrar sesión y volver a conectar para aplicar cambios
exit
ssh usuario@tu-servidor.com

# Verificar instalación
docker --version
```

#### Paso 3: Instalar Redis en el Host

Redis se instala directamente en el host (no en Docker) para producción.

```bash
# Actualizar repositorios
sudo apt update

# Instalar Redis
sudo apt install redis-server -y

# Verificar instalación
redis-server --version

# Configurar Redis para mayor seguridad
sudo nano /etc/redis/redis.conf
```

**Configuraciones recomendadas en `redis.conf`**:
```bash
# Bind solo a localhost (no accesible desde fuera)
bind 127.0.0.1 ::1

# Habilitar persistencia
save 900 1
save 300 10
save 60 10000

# Directorio de datos
dir /var/lib/redis

# Log
logfile /var/log/redis/redis-server.log

# Memoria máxima (ajusta según tu servidor)
maxmemory 256mb
maxmemory-policy allkeys-lru
```

```bash
# Reiniciar Redis con la nueva configuración
sudo systemctl restart redis-server

# Habilitar inicio automático
sudo systemctl enable redis-server

# Verificar estado
sudo systemctl status redis-server

# Probar conexión
redis-cli ping
# Debería devolver: PONG

# Ver info de Redis
redis-cli info server
```

**Nota**: Si Plesk tiene una extensión para Redis, puedes instalarlo desde el panel. Si no, la instalación manual funciona perfectamente.

#### Paso 4: Clonar el Repositorio

```bash
# Crear directorio para la aplicación
sudo mkdir -p /var/www/paco-cunao
sudo chown $USER:$USER /var/www/paco-cunao

# Clonar el repositorio
cd /var/www
git clone <tu-repo-url> paco-cunao
cd paco-cunao
```

#### Paso 5: Configurar Node.js

```bash
# Instalar Node.js 18+ usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debería ser v18+
npm --version

# Instalar dependencias de producción
npm ci --production
```

#### Paso 6: Configurar Variables de Entorno

```bash
# Copiar plantilla de .env
cp .env.example .env

# Editar .env con credenciales reales
nano .env
```

Configurar las siguientes variables:

```bash
# Base de datos (usar credenciales de Plesk)
DATABASE_URL=mysql://paco:TU_PASSWORD_SEGURA@localhost:3306/paco_el_cunao

# Redis
REDIS_URL=redis://127.0.0.1:6379

# WhatsApp (configurar según tu proveedor)
WHATSAPP_PROVIDER=meta
WHATSAPP_META_TOKEN=tu_token_de_meta
WHATSAPP_PHONE_NUMBER_ID=tu_phone_id
WHATSAPP_VERIFY_TOKEN=tu_verify_token_seguro
WHATSAPP_NUMBER=+34XXXXXXXXX

# OpenAI
OPENAI_API_KEY=sk-tu-api-key-de-openai
OPENAI_MODEL=gpt-4o-mini

# Servidor
PORT=3000
NODE_ENV=production

# Tiempos
CONSOLIDATION_WINDOW_MS=1800000

# Horario nocturno (España)
NIGHT_START_HOUR=22
NIGHT_END_HOUR=7
TIMEZONE=Europe/Madrid

# Memoria
RECENT_CYCLES_TO_INCLUDE=2
MAX_KEY_EVENTS=50
```

Guardar con `Ctrl+O`, `Enter`, `Ctrl+X`.

#### Paso 7: Ejecutar Migraciones

```bash
# Ejecutar migraciones de la base de datos
npm run migrate

# Verificar que las tablas se crearon correctamente
# Conectarse a MariaDB desde Plesk o SSH
mysql -upaco -p paco_el_cunao

# Dentro de MySQL
SHOW TABLES;
# Deberías ver: users, games, messages, scheduled_jobs
EXIT;
```

#### Paso 8: Instalar y Configurar PM2

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar la aplicación con PM2
cd /var/www/paco-cunao
pm2 start src/index.js --name paco-backend --env production

# Configurar PM2 para iniciar automáticamente
pm2 startup systemd
# Copiar y ejecutar el comando que PM2 te muestra

# Guardar la configuración
pm2 save

# Ver estado
pm2 status
pm2 logs paco-backend

# Comandos útiles de PM2
# pm2 restart paco-backend  # Reiniciar
# pm2 stop paco-backend     # Detener
# pm2 delete paco-backend   # Eliminar
# pm2 logs paco-backend     # Ver logs en tiempo real
```

#### Paso 9: Configurar Reverse Proxy en Plesk

1. En Plesk, ve a tu **Dominio** → **Hosting y DNS**
2. Habilita **Proxy de Node.js**:
   - **Puerto de la aplicación**: `3000`
   - **Modo**: Producción
   - **Comando de inicio**: (déjalo vacío, PM2 gestiona esto)

**O configura manualmente con Nginx**:

1. Ve a **Dominios** → **Configuración de Apache y nginx**
2. En **Directivas adicionales de nginx**, agrega:

```nginx
location /webhook/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /health {
    proxy_pass http://127.0.0.1:3000;
}
```

3. Guardar y aplicar cambios.

#### Paso 10: Configurar Webhooks de WhatsApp

1. Ve a **Meta Business Suite** → **WhatsApp** → **Configuración** → **Webhooks**
2. Configura el webhook:
   - **URL**: `https://tu-dominio.com/webhook/whatsapp`
   - **Token de verificación**: (el mismo que pusiste en `WHATSAPP_VERIFY_TOKEN`)
3. Suscribirse a los eventos:
   - `messages`
   - `message_status` (opcional)

#### Paso 11: Verificar el Despliegue

```bash
# Probar endpoint de salud
curl https://tu-dominio.com/health
# Debería devolver: {"status":"ok"}

# Ver logs de PM2
pm2 logs paco-backend --lines 50

# Ver logs de Docker Redis
docker logs paco-redis --tail 50

# Verificar conectividad a MariaDB
mysql -upaco -p paco_el_cunao -e "SELECT COUNT(*) FROM users;"
```

#### Paso 12: Configurar el Frontend (Next.js)

```bash
cd /var/www/paco-cunao/web

# Instalar dependencias
npm install

# Configurar variables de entorno del frontend
cp .env.local.example .env.local
nano .env.local
```

Agregar:

```bash
NEXT_PUBLIC_API_URL=https://tu-dominio.com
```

```bash
# Compilar para producción
npm run build

# Iniciar con PM2
pm2 start npm --name paco-frontend -- start

# Guardar configuración
pm2 save
```

Configurar Plesk para servir el frontend en un subdominio o ruta diferente si es necesario.

### Mantenimiento en Producción

#### Actualizaciones del Código

```bash
cd /var/www/paco-cunao

# Detener aplicación
pm2 stop paco-backend paco-frontend

# Actualizar código
git pull origin main

# Instalar nuevas dependencias
npm ci --production
cd web && npm install && cd ..

# Ejecutar migraciones nuevas (si las hay)
npm run migrate

# Recompilar frontend
cd web && npm run build && cd ..

# Reiniciar aplicaciones
pm2 restart paco-backend paco-frontend

# Verificar que todo funciona
pm2 logs --lines 50
```

#### Backups de Base de Datos

```bash
# Crear backup manual (MariaDB en el host)
mysqldump -upaco -pTU_PASSWORD paco_el_cunao > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -upaco -pTU_PASSWORD paco_el_cunao < backup_20240101.sql

# Automatizar backups diarios (crontab)
crontab -e
# Agregar: 0 2 * * * mysqldump -upaco -pPASSWORD paco_el_cunao > /backups/paco_$(date +\%Y\%m\%d).sql

# O desde Plesk:
# Herramientas y Configuración → Backup Manager → Crear backup
# (Recomendado: incluye base de datos, archivos y configuración)
```

#### Monitoreo

```bash
# Ver estado de PM2
pm2 status
pm2 monit

# Ver estado de servicios
sudo systemctl status mariadb
sudo systemctl status redis-server

# Ver logs en tiempo real
pm2 logs paco-backend --lines 100
sudo tail -f /var/log/redis/redis-server.log
sudo tail -f /var/log/mysql/error.log

# Ver info de Redis
redis-cli info

# Ver conexiones activas a MariaDB
mysql -upaco -p -e "SHOW PROCESSLIST;"

# Recursos del sistema
htop
df -h
free -h
```

### Troubleshooting Común

#### Error de conexión a MariaDB

```bash
# Verificar que MariaDB está corriendo
sudo systemctl status mariadb

# Verificar credenciales
mysql -upaco -p paco_el_cunao

# Ver logs de MariaDB
sudo tail -f /var/log/mysql/error.log
```

#### Error de conexión a Redis

```bash
# Verificar que Redis está corriendo
sudo systemctl status redis-server

# Ver logs
sudo tail -f /var/log/redis/redis-server.log

# Reiniciar servicio
sudo systemctl restart redis-server

# Probar conexión
redis-cli ping
# Debería devolver: PONG

# Ver información de conexiones
redis-cli info clients
```

#### Aplicación no arranca

```bash
# Ver logs detallados de PM2
pm2 logs paco-backend --err --lines 200

# Probar manualmente
cd /var/www/paco-cunao
node src/index.js
# Observar errores

# Verificar variables de entorno
cat .env | grep DATABASE_URL
cat .env | grep REDIS_URL
```

#### Webhook de WhatsApp no funciona

```bash
# Verificar que el endpoint responde
curl -X POST https://tu-dominio.com/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Ver logs del webhook
pm2 logs paco-backend | grep webhook

# Verificar configuración de Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Seguridad en Producción

1. **Firewall**: Configurar UFW para permitir solo puertos necesarios
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

2. **SSL/TLS**: Asegúrate de que Plesk tiene SSL configurado (Let's Encrypt)

3. **Variables de entorno**: NUNCA commitear el archivo `.env` al repositorio

4. **Backups automáticos**: Configurar backups diarios en Plesk

5. **Actualizaciones**: Mantener Ubuntu, Node.js y dependencias actualizados

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Actualizar dependencias de npm
npm outdated
npm update
```

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
