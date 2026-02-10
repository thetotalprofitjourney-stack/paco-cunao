#!/bin/bash

# Script para iniciar todos los contenedores necesarios
# Uso: ./docker/start-all.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Iniciando infraestructura de Paco el Cuñao..."
echo ""

# Iniciar MariaDB
bash "${SCRIPT_DIR}/start-mariadb.sh"
echo ""

# Iniciar Redis
bash "${SCRIPT_DIR}/start-redis.sh"
echo ""

echo "✅ Infraestructura completa iniciada"
echo ""
echo "📝 Siguiente paso:"
echo "  1. Configura tu archivo .env con las credenciales de conexión"
echo "  2. Ejecuta las migraciones: npm run migrate"
echo "  3. (Opcional) Crea datos de prueba: npm run seed"
echo "  4. Inicia el servidor: npm run dev"
