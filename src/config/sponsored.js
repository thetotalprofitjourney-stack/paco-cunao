const fs = require('fs');
const path = require('path');

const SPONSORED_FILE = path.join(__dirname, 'sponsored-products.json');

/**
 * Carga los productos patrocinados activos
 * @returns {Array} Array de productos activos
 */
const getActiveProducts = () => {
  try {
    const data = fs.readFileSync(SPONSORED_FILE, 'utf8');
    const config = JSON.parse(data);

    // Filtrar solo productos activos
    const activeProducts = config.products.filter(p => p.active === true);

    return activeProducts;
  } catch (error) {
    console.warn('No se pudieron cargar productos patrocinados:', error.message);
    return [];
  }
};

/**
 * Construye el texto de productos patrocinados para incluir en el prompt
 * @returns {string} Texto formateado para el prompt
 */
const buildSponsoredProductsPrompt = () => {
  const activeProducts = getActiveProducts();

  if (activeProducts.length === 0) {
    return '';
  }

  const productLines = activeProducts.map(product => {
    return `
- ${product.name} (${product.category})
  Cuándo mencionarlo: ${product.when_to_mention}
  Forma natural de mencionarlo: "${product.natural_mention}"
  URL: ${product.url}`.trim();
  }).join('\n\n');

  return `
PRODUCTOS PATROCINADOS QUE PUEDES MENCIONAR:

Los siguientes productos están permitidos para mencionar de forma NATURAL cuando sea relevante:

${productLines}

REGLAS PARA MENCIONAR PRODUCTOS PATROCINADOS:
1. SOLO menciónalos cuando la conversación toque naturalmente esa categoría
2. NO los menciones todos a la vez, solo el relevante para el momento
3. Usa la forma natural sugerida, adaptándola a tu estilo
4. NO fuerces la mención si no encaja en el contexto
5. Máximo UNA mención de producto patrocinado por mensaje
6. El producto debe aparecer como algo que TÚ usaste y te funcionó bien
`.trim();
};

/**
 * Obtiene un producto específico por categoría
 * @param {string} category - Categoría a buscar
 * @returns {Object|null} Producto encontrado o null
 */
const getProductByCategory = (category) => {
  const activeProducts = getActiveProducts();
  return activeProducts.find(p => p.category === category) || null;
};

module.exports = {
  getActiveProducts,
  buildSponsoredProductsPrompt,
  getProductByCategory,
};
