#!/bin/bash

# Script para detener todos los contenedores de Paco el Cuñao
# Uso: ./docker/stop-all.sh

echo "🛑 Deteniendo contenedores de Paco el Cuñao..."

CONTAINERS=("paco-mariadb" "paco-redis")

for CONTAINER in "${CONTAINERS[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
        echo "  Deteniendo ${CONTAINER}..."
        docker stop ${CONTAINER}
        echo "  ✅ ${CONTAINER} detenido"
    else
        echo "  ⚠️  ${CONTAINER} no está corriendo"
    fi
done

echo ""
echo "✅ Todos los contenedores detenidos"
echo ""
echo "Para eliminar completamente los contenedores:"
echo "  docker rm paco-mariadb paco-redis"
echo ""
echo "Para eliminar también los volúmenes (⚠️  BORRA TODOS LOS DATOS):"
echo "  docker volume rm paco_mariadb_data paco_redis_data"
