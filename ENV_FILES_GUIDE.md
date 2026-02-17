# Guía de Archivos de Entorno (.env)

Este documento explica los diferentes archivos `.env` del proyecto y cómo usarlos.

---

## 📁 **ARCHIVOS DE ENTORNO EN EL PROYECTO:**

### **1. `.env.example`** ✅ **EN GITHUB**
- **Ubicación**: Raíz del proyecto
- **Estado**: Commiteado en el repositorio
- **Propósito**: Plantilla con ejemplos y documentación
- **Contenido**: Variables de ejemplo SIN credenciales reales
- **Uso**: Referencia para saber qué variables configurar

### **2. `.env`** ❌ **NO EN GITHUB** (protegido por `.gitignore`)
- **Ubicación**: Raíz del proyecto (solo local)
- **Estado**: NO commiteado (protegido por `.gitignore`)
- **Propósito**: Credenciales reales de desarrollo/producción
- **Contenido**: ✅ Todas las credenciales configuradas
- **Uso**: Archivo activo que usa la aplicación

### **3. `.env.template.production`** ✅ **EN GITHUB**
- **Ubicación**: Raíz del proyecto
- **Estado**: Commiteado en el repositorio
- **Propósito**: **Backup de credenciales de producción**
- **Contenido**: ✅ Credenciales reales de WhatsApp + OpenAI
- **Uso**: Copiar al servidor cuando migres

⚠️ **IMPORTANTE**: Este archivo solo está en GitHub porque el repositorio es **PRIVADO**.
Si el repositorio se hace público, **ELIMINAR INMEDIATAMENTE**.

---

## 🔐 **CREDENCIALES CONFIGURADAS:**

El archivo `.env.template.production` contiene:

### **WhatsApp Business API (Meta Cloud API):**
```bash
WHATSAPP_PROVIDER=meta
WHATSAPP_META_TOKEN=EAFtWYZ... (Token permanente sin vencimiento)
WHATSAPP_APP_SECRET=eecb7d109491ffe0ce9772e2afe91bc2 (App Secret - requerido para seguridad)
WHATSAPP_PHONE_NUMBER_ID=1029054796951741
WHATSAPP_VERIFY_TOKEN=47e81b7b...
WHATSAPP_REACTIVATION_TEMPLATE=paco_confirmacion_2
WHATSAPP_NUMBER=+34 679 32 76 17
```

**Nota de Seguridad:**
- El `WHATSAPP_APP_SECRET` es **obligatorio** porque la opción "Clave secreta de la aplicación obligatoria" está activada en Meta Business.
- Se usa para generar el `appsecret_proof` (hash HMAC-SHA256) en todas las llamadas a la API.
- Obtener desde: Meta Business Manager → App Paco_backend → Configuración → Básica → "Clave secreta de la aplicación"

### **OpenAI:**
```bash
OPENAI_API_KEY=sk-svcacct-... (Service Account - Proyecto: Paco_VillaCarmen)
OPENAI_MODEL=gpt-4o-mini
```

### **Servidor:**
```bash
DATABASE_URL=mysql://user:password@localhost:3306/paco_el_cunao
REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=production
```

---

## 🚀 **CÓMO USAR EN EL SERVIDOR:**

### **Paso 1: Clonar el repositorio**
```bash
cd /var/www
git clone <repo-url> paco-cunao
cd paco-cunao
```

### **Paso 2: Crear .env desde la plantilla**
```bash
# Copiar el template a .env
cp .env.template.production .env
```

### **Paso 3: Verificar y ajustar credenciales**
```bash
# Editar .env
nano .env

# Verificar que las credenciales son correctas:
# ✅ WhatsApp: Ya configurado (incluyendo WHATSAPP_APP_SECRET)
# ✅ OpenAI: Ya configurado
# ⚠️ DATABASE_URL: Actualizar con password real de MariaDB
# ⚠️ REDIS_URL: Verificar que Redis está en localhost:6379
# ⚠️ NODE_ENV: Cambiar a "production"
```

### **Paso 4: Proteger el archivo**
```bash
# Asegurar que .env no se puede leer por otros usuarios
chmod 600 .env

# Verificar que está en .gitignore
cat .gitignore | grep ".env"
# Debe mostrar: .env
```

---

## 🔄 **FLUJO DE TRABAJO:**

### **Durante el desarrollo local:**
```
.env.example (GitHub)
     ↓ (copiar y rellenar)
    .env (local, NO en GitHub)
```

### **Durante la migración al servidor:**
```
.env.template.production (GitHub)
     ↓ (git clone)
Servidor → /var/www/paco-cunao/
     ↓ (copiar)
    .env (servidor, NO en GitHub)
```

---

## 🛡️ **SEGURIDAD:**

### ✅ **Buenas prácticas:**
1. ✅ `.env` está en `.gitignore` (nunca se commitea)
2. ✅ `.env.template.production` solo existe porque el repo es PRIVADO
3. ✅ Credenciales reales solo en archivos locales
4. ✅ `chmod 600 .env` en el servidor

### ❌ **NUNCA hagas esto:**
1. ❌ Commitear `.env` directamente
2. ❌ Compartir credenciales por email/chat
3. ❌ Hacer el repositorio público sin eliminar `.env.template.production`
4. ❌ Subir credenciales a otros servicios públicos

---

## 📊 **COMPARACIÓN DE ARCHIVOS:**

| Archivo | En GitHub | Credenciales Reales | Propósito |
|---------|-----------|---------------------|-----------|
| `.env.example` | ✅ Sí | ❌ No (ejemplos) | Documentación |
| `.env` | ❌ No (gitignore) | ✅ Sí | Uso en desarrollo/producción |
| `.env.template.production` | ✅ Sí* | ✅ Sí | Backup para migración |

*Solo porque el repo es PRIVADO

---

## 🔧 **ACTUALIZAR CREDENCIALES:**

### **Si cambias alguna credencial:**

1. **Actualizar `.env` local:**
   ```bash
   nano .env
   # Cambiar la credencial
   # Guardar: Ctrl+X, Y, Enter
   ```

2. **Actualizar `.env.template.production` en GitHub:**
   ```bash
   # Editar el template
   nano .env.template.production

   # Commitear
   git add .env.template.production
   git commit -m "Update [credential_name] in production template"
   git push
   ```

3. **Actualizar en el servidor:**
   ```bash
   # SSH al servidor
   ssh user@servidor

   # Ir al proyecto
   cd /var/www/paco-cunao

   # Pull cambios
   git pull

   # Actualizar .env
   cp .env.template.production .env

   # Reiniciar
   pm2 restart paco-backend
   ```

---

## ⚠️ **SI EL REPOSITORIO SE HACE PÚBLICO:**

### **ACCIÓN INMEDIATA:**

```bash
# 1. Eliminar el archivo con credenciales
git rm .env.template.production
git commit -m "Remove production credentials before making repo public"
git push

# 2. Rotar TODAS las credenciales:
# - Generar nuevo token de WhatsApp
# - Generar nueva API key de OpenAI
# - Cambiar verify token

# 3. Actualizar .env en todos los servidores
```

---

## 📞 **SOPORTE:**

Si tienes problemas con las credenciales:

1. Verificar que el archivo `.env` existe: `ls -la .env`
2. Verificar permisos: `ls -l .env` (debe mostrar: `-rw-------`)
3. Ver logs: `pm2 logs paco-backend | grep -i error`
4. Verificar que las variables se cargan: `node -e "require('dotenv').config(); console.log(process.env.WHATSAPP_META_TOKEN ? 'OK' : 'MISSING')"`

---

## 📝 **RESUMEN:**

```
✅ .env.example          → En GitHub → Plantilla documentada
✅ .env                  → LOCAL ONLY → Credenciales activas
✅ .env.template.production → En GitHub → Backup de producción (solo repo privado)
```

**Cuando migres al servidor:**
```bash
cp .env.template.production .env
```

**Y listo!** 🚀

---

**Última actualización**: 2026-02-17
**Estado**: ✅ Todas las credenciales configuradas y documentadas
