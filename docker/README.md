# Scripts Docker (sin Docker Compose)

Scripts para gestionar la infraestructura de **DESARROLLO LOCAL** usando Docker sin Docker Compose.

## ⚠️ IMPORTANTE: Solo para Desarrollo

**Estos scripts Docker son EXCLUSIVAMENTE para desarrollo local.**

**En producción (Plesk + Ubuntu 24.04):**
- ❌ **NO uses Docker**
- ✅ **MariaDB**: Instalado en el host (gestionado por Plesk)
- ✅ **Redis**: Instalado en el host con `apt install redis-server`
- ✅ **Node.js**: Instalado en el host con PM2

Ver la guía de despliegue en producción en el [`README.md`](../README.md#despliegue-en-producción) principal.

## Requisitos (Solo Desarrollo)

- Docker instalado y corriendo
- Permisos para ejecutar Docker (o usar `sudo`)

## Scripts Disponibles

### Iniciar todo

```bash
./docker/start-all.sh
```

Inicia tanto MariaDB como Redis de una vez.

### Iniciar servicios individuales

```bash
# Solo MariaDB
./docker/start-mariadb.sh

# Solo Redis
./docker/start-redis.sh
```

### Detener todo

```bash
./docker/stop-all.sh
```

## Información de Conexión

### MariaDB

- **Host**: localhost
- **Puerto**: 3306
- **Base de datos**: paco_el_cunao
- **Usuario**: paco
- **Contraseña**: paco123
- **URL**: `mysql://paco:paco123@localhost:3306/paco_el_cunao`

### Redis

- **Host**: localhost
- **Puerto**: 6379
- **URL**: `redis://localhost:6379`

## Comandos Útiles

### Ver logs

```bash
# MariaDB
docker logs paco-mariadb

# Redis
docker logs paco-redis

# Seguir logs en tiempo real
docker logs -f paco-mariadb
docker logs -f paco-redis
```

### Conectarse a los contenedores

```bash
# MariaDB CLI
docker exec -it paco-mariadb mariadb -upaco -ppaco123 paco_el_cunao

# Redis CLI
docker exec -it paco-redis redis-cli
```

### Ver estado de los contenedores

```bash
docker ps --filter "name=paco"
```

### Reiniciar contenedores

```bash
docker restart paco-mariadb
docker restart paco-redis
```

## Gestión de Datos

### Backup de la base de datos

```bash
# Crear backup
docker exec paco-mariadb mariadb-dump -upaco -ppaco123 paco_el_cunao > backup.sql

# Restaurar backup
docker exec -i paco-mariadb mariadb -upaco -ppaco123 paco_el_cunao < backup.sql
```

### Limpiar todo (⚠️ BORRA TODOS LOS DATOS)

```bash
# Detener contenedores
docker stop paco-mariadb paco-redis

# Eliminar contenedores
docker rm paco-mariadb paco-redis

# Eliminar volúmenes (BORRA DATOS)
docker volume rm paco_mariadb_data paco_redis_data
```

## Diferencias con Producción

| Aspecto | Desarrollo (Docker) | Producción (Plesk) |
|---------|---------------------|---------------------|
| **MariaDB** | Docker Container | Instalado en host vía `apt` |
| **Redis** | Docker Container | Instalado en host vía `apt` |
| **Node.js** | Local o Docker | Instalado en host + PM2 |
| **Gestión** | Scripts manuales | Systemd + Plesk |
| **Datos** | Volúmenes Docker | Directorios del sistema |

**Para producción**, consulta la guía completa de despliegue en el [`README.md`](../README.md#despliegue-en-producción) principal.

## Troubleshooting

### Puerto ya en uso

Si obtienes un error de puerto ya en uso:

```bash
# Ver qué proceso usa el puerto
sudo lsof -i :3306  # Para MariaDB
sudo lsof -i :6379  # Para Redis

# Detener el servicio local
sudo systemctl stop mariadb  # o mysql
sudo systemctl stop redis
```

### Contenedor no inicia

```bash
# Ver logs detallados
docker logs paco-mariadb
docker logs paco-redis

# Eliminar y recrear
docker rm paco-mariadb
./docker/start-mariadb.sh
```

### Permisos de Docker

Si obtienes errores de permisos:

```bash
# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# Cerrar sesión y volver a iniciar sesión
# O usar newgrp docker en la sesión actual
```
