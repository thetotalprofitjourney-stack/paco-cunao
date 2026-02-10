#!/bin/bash

# Script para iniciar MariaDB con Docker (sin docker-compose)
# Uso: ./docker/start-mariadb.sh

set -e

CONTAINER_NAME="paco-mariadb"
IMAGE="mariadb:11.2"
PORT="3306"
DB_NAME="paco_el_cunao"
DB_USER="paco"
DB_PASSWORD="paco123"
VOLUME_NAME="paco_mariadb_data"

echo "🚀 Iniciando MariaDB para Paco el Cuñao..."

# Verificar si el contenedor ya existe
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "⚠️  El contenedor ${CONTAINER_NAME} ya existe"

    # Verificar si está corriendo
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo "✅ El contenedor ya está corriendo"
        docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        exit 0
    else
        echo "🔄 Iniciando contenedor existente..."
        docker start ${CONTAINER_NAME}
        echo "✅ Contenedor iniciado"
        exit 0
    fi
fi

# Crear volumen si no existe
if ! docker volume ls | grep -q "${VOLUME_NAME}"; then
    echo "📦 Creando volumen ${VOLUME_NAME}..."
    docker volume create ${VOLUME_NAME}
fi

# Crear y iniciar el contenedor
echo "🐳 Creando contenedor MariaDB..."
docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${PORT}:3306 \
    -e MYSQL_ROOT_PASSWORD=${DB_PASSWORD} \
    -e MYSQL_DATABASE=${DB_NAME} \
    -e MYSQL_USER=${DB_USER} \
    -e MYSQL_PASSWORD=${DB_PASSWORD} \
    -v ${VOLUME_NAME}:/var/lib/mysql \
    --restart unless-stopped \
    ${IMAGE}

echo "⏳ Esperando que MariaDB esté lista..."
sleep 5

# Verificar que el contenedor está corriendo
if docker ps | grep -q "${CONTAINER_NAME}"; then
    echo "✅ MariaDB iniciado correctamente"
    echo ""
    echo "📊 Información de conexión:"
    echo "  Host: localhost"
    echo "  Puerto: ${PORT}"
    echo "  Base de datos: ${DB_NAME}"
    echo "  Usuario: ${DB_USER}"
    echo "  Contraseña: ${DB_PASSWORD}"
    echo ""
    echo "📝 Para conectarte:"
    echo "  docker exec -it ${CONTAINER_NAME} mariadb -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME}"
    echo ""
    echo "🛑 Para detener:"
    echo "  docker stop ${CONTAINER_NAME}"
    echo ""
    echo "🗑️  Para eliminar:"
    echo "  docker rm ${CONTAINER_NAME}"
else
    echo "❌ Error al iniciar MariaDB"
    docker logs ${CONTAINER_NAME}
    exit 1
fi
