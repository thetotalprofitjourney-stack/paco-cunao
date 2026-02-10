#!/bin/bash

# Script para iniciar Redis con Docker (sin docker-compose)
# Uso: ./docker/start-redis.sh

set -e

CONTAINER_NAME="paco-redis"
IMAGE="redis:7-alpine"
PORT="6379"
VOLUME_NAME="paco_redis_data"

echo "🚀 Iniciando Redis para Paco el Cuñao..."

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
echo "🐳 Creando contenedor Redis..."
docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${PORT}:6379 \
    -v ${VOLUME_NAME}:/data \
    --restart unless-stopped \
    ${IMAGE}

echo "⏳ Esperando que Redis esté listo..."
sleep 2

# Verificar que el contenedor está corriendo
if docker ps | grep -q "${CONTAINER_NAME}"; then
    echo "✅ Redis iniciado correctamente"
    echo ""
    echo "📊 Información de conexión:"
    echo "  Host: localhost"
    echo "  Puerto: ${PORT}"
    echo "  URL: redis://localhost:${PORT}"
    echo ""
    echo "📝 Para conectarte:"
    echo "  docker exec -it ${CONTAINER_NAME} redis-cli"
    echo ""
    echo "🛑 Para detener:"
    echo "  docker stop ${CONTAINER_NAME}"
    echo ""
    echo "🗑️  Para eliminar:"
    echo "  docker rm ${CONTAINER_NAME}"
else
    echo "❌ Error al iniciar Redis"
    docker logs ${CONTAINER_NAME}
    exit 1
fi
