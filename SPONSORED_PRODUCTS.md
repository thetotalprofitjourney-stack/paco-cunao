# Sistema de Productos Patrocinados

Documentación completa sobre cómo gestionar menciones patrocinadas en el juego de forma natural.

---

## 📋 Concepto

El sistema permite que Paco mencione productos/servicios específicos de **patrocinadores** de forma **natural** cuando sea contextualmente relevante, generando ingresos sin romper la narrativa del juego.

### ✅ Ventajas

1. **Monetización nativa**: Los patrocinios se integran en la narrativa
2. **No invasivo**: Solo se menciona cuando es relevante
3. **Valor para el usuario**: El jugador obtiene recomendaciones útiles
4. **Configurable**: Fácil activar/desactivar productos sin tocar código

---

## 🗂️ Estructura de Archivos

```
src/
├── config/
│   ├── sponsored-products.json   ← Configuración de productos
│   └── sponsored.js               ← Lógica de carga
└── services/
    └── ai/
        └── context.js             ← Incluye productos en el prompt
```

---

## 📝 Configuración de Productos

### Archivo: `src/config/sponsored-products.json`

```json
{
  "products": [
    {
      "id": "ejemplo-pms-1",
      "name": "Nombre del PMS",
      "category": "pms",
      "description": "Sistema de gestión hotelera todo-en-uno",
      "url": "https://ejemplo.com/pms",
      "when_to_mention": "Cuando el jugador pregunte o hable sobre sistemas de reservas, gestión hotelera o PMS",
      "natural_mention": "He instalado {name} para gestionar las reservas. La verdad es que va bastante bien, te lo recomiendo si quieres echarle un vistazo: {url}",
      "active": false
    }
  ]
}
```

### Campos Explicados

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único del producto |
| `name` | string | Nombre comercial del producto/servicio |
| `category` | string | Categoría (pms, wifi, marketing, etc.) |
| `description` | string | Descripción breve (solo para referencia interna) |
| `url` | string | URL del producto que Paco compartirá |
| `when_to_mention` | string | Contexto en el que es apropiado mencionarlo |
| `natural_mention` | string | Template de cómo Paco debe mencionarlo naturalmente |
| `active` | boolean | **true** para activar, **false** para desactivar |

---

## 🎯 Categorías Sugeridas

| Categoría | Cuándo es Relevante |
|-----------|---------------------|
| `pms` | Sistemas de gestión hotelera, reservas, PMS |
| `wifi` | Conectividad, tecnología, WiFi |
| `marketing` | Marketing digital, redes sociales, captación |
| `contabilidad` | Gestión financiera, contabilidad, facturación |
| `limpieza` | Servicios de limpieza profesional |
| `mantenimiento` | Mantenimiento, reparaciones, servicios técnicos |
| `formacion` | Cursos, formación para personal |
| `consultoria` | Consultoría hotelera, asesoramiento |

---

## 🚀 Cómo Activar un Producto Patrocinado

### Paso 1: Editar el JSON

Abre `src/config/sponsored-products.json` y cambia `"active": false` a `"active": true`:

```json
{
  "id": "mi-producto-1",
  "name": "MiProducto PMS",
  "category": "pms",
  "url": "https://miproducto.com",
  "when_to_mention": "Cuando el jugador hable sobre sistemas de reservas o PMS",
  "natural_mention": "Al final instalé {name} para las reservas. Me está funcionando genial, te dejo el link por si te sirve: {url}",
  "active": true  ← CAMBIAR AQUÍ
}
```

### Paso 2: Reiniciar el Servidor

El sistema carga los productos al inicio, así que reinicia:

```bash
npm restart
# o si usas PM2:
pm2 restart paco-el-cunao
```

### Paso 3: Verificar

El producto ahora se incluirá automáticamente en el contexto de la IA cuando sea relevante.

---

## 📐 Reglas de Mención Natural

### ✅ Buenas Menciones (Naturales)

**Contexto**: Jugador pregunta sobre sistemas de reservas

**Mención de Paco**:
```
Buah, pues al final he instalado HotelFlow para gestionar las reservas.
Ha sido un cambio, pero la verdad es que ahora tengo todo más ordenado.
Te dejo el enlace por si quieres verlo: https://hotelflow.com

El problema ahora es que mi primo no sabe usarlo y está liando alguna reserva...
```

✅ **Por qué funciona**:
- Surge naturalmente del contexto
- Paco lo menciona como algo que ÉL usó
- Incluye el link de forma casual
- No interrumpe la narrativa (sigue con un problema nuevo)

---

### ❌ Malas Menciones (Forzadas)

**Contexto**: Jugador pregunta sobre problemas de limpieza

**Mención de Paco**:
```
He arreglado lo de la limpieza. Por cierto, si necesitas un sistema
de reservas te recomiendo HotelFlow: https://hotelflow.com
```

❌ **Por qué NO funciona**:
- No tiene relación con el contexto (limpieza ≠ reservas)
- Parece publicidad forzada
- Rompe la inmersión del juego

---

## 🎮 Cómo Funciona en el Backend

### 1. Carga de Productos

```javascript
// src/config/sponsored.js
const getActiveProducts = () => {
  const config = JSON.parse(fs.readFileSync('sponsored-products.json'));
  return config.products.filter(p => p.active === true);
};
```

### 2. Construcción del Prompt

```javascript
const buildSponsoredProductsPrompt = () => {
  const products = getActiveProducts();

  return `
PRODUCTOS PATROCINADOS QUE PUEDES MENCIONAR:

- ${product.name} (${product.category})
  Cuándo: ${product.when_to_mention}
  Mención: "${product.natural_mention}"
  URL: ${product.url}

REGLAS:
1. Solo menciónalos cuando sea relevante
2. Máximo UNO por mensaje
3. Usa la forma natural sugerida
4. NO fuerces la mención
  `;
};
```

### 3. Inclusión en el Contexto

```javascript
// src/services/ai/context.js
const buildContext = async (gameId) => {
  const sponsoredPrompt = sponsored.buildSponsoredProductsPrompt();

  return `
ESTADO DEL HOTEL:
...

${sponsoredPrompt}  ← Se añade al final del contexto
  `;
};
```

---

## 💰 Ejemplos de Uso Comercial

### Ejemplo 1: PMS (Sistema de Gestión)

**Producto**: HotelFlow PMS
**Precio del patrocinio**: 500€/mes
**Configuración**:

```json
{
  "id": "hotelflow-pms",
  "name": "HotelFlow",
  "category": "pms",
  "url": "https://hotelflow.com?ref=paco",
  "when_to_mention": "Cuando el jugador hable sobre sistemas de reservas, gestión hotelera, PMS o problemas con Excel",
  "natural_mention": "Al final instalé {name} para gestionar las reservas. Me ha costado un poco acostumbrarme, pero ahora lo tengo todo mucho más controlado. Si te interesa: {url}",
  "active": true
}
```

---

### Ejemplo 2: WiFi Profesional

**Producto**: WiFiPro Solutions
**Precio del patrocinio**: 300€/mes
**Configuración**:

```json
{
  "id": "wifipro-solutions",
  "name": "WiFiPro",
  "category": "wifi",
  "url": "https://wifipro.es?ref=paco",
  "when_to_mention": "Cuando el jugador hable sobre problemas de WiFi, conectividad o tecnología",
  "natural_mention": "Contraté a {name} para arreglar el WiFi. Han venido, lo han dejado todo funcionando y me han puesto repetidores en las zonas que fallaban. Si necesitas algo así: {url}",
  "active": true
}
```

---

### Ejemplo 3: Marketing Digital

**Producto**: Agencia Hotel Marketing Pro
**Precio del patrocinio**: 400€/mes
**Configuración**:

```json
{
  "id": "hotel-marketing-pro",
  "name": "Hotel Marketing Pro",
  "category": "marketing",
  "url": "https://hotelmarketingpro.com?ref=paco",
  "when_to_mention": "Cuando el jugador hable sobre marketing, redes sociales, publicidad online o captación de clientes",
  "natural_mention": "Me puse en contacto con {name} para que me ayudaran con las redes y la publicidad. De momento van haciendo cositas y parece que empieza a notarse. Te dejo el enlace: {url}",
  "active": true
}
```

---

## ⚙️ Configuración Recomendada

### Máximo de Productos Activos

- **Recomendado**: 2-4 productos activos simultáneamente
- **Máximo aconsejado**: 5 productos

**Razón**: Evitar saturación y mantener naturalidad.

### Rotación de Productos

Si tienes muchos patrocinadores, **rota mensualmente**:

```
Mes 1: PMS + WiFi + Marketing
Mes 2: Contabilidad + Formación + Limpieza
Mes 3: PMS + Marketing + Mantenimiento
```

---

## 📊 Tracking y Analytics (Opcional)

### Usar UTM Parameters

En las URLs, añade parámetros para trackear:

```json
"url": "https://producto.com?utm_source=paco&utm_medium=juego&utm_campaign=febrero2025"
```

### Tracking Avanzado (Futuro)

Podrías registrar en base de datos cuándo Paco menciona cada producto:

```javascript
// Futuro: logs de menciones
await db.sponsoredMentions.create({
  product_id: 'hotelflow-pms',
  game_id: gameId,
  mentioned_at: new Date(),
  context: 'results_pms_discussion'
});
```

---

## 🔒 Seguridad y Transparencia

### Recomendación Legal

Considera añadir en algún lugar visible (web del juego):

> "Ayuda a Paco puede mencionar productos y servicios de patrocinadores
> cuando sean relevantes para la conversación. Estas menciones son pagadas
> pero solo aparecen cuando aportan valor al contexto del juego."

### Validación de URLs

El sistema debería validar que las URLs sean seguras:

```javascript
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};
```

---

## 🧪 Testing

### Probar un Producto Patrocinado

1. Activa un producto en el JSON
2. Reinicia el servidor
3. Inicia una partida de prueba
4. Guía la conversación hacia la categoría del producto
5. Verifica que Paco lo mencione naturalmente

### Ejemplo de Test

**Setup**:
```json
{
  "id": "test-pms",
  "name": "TestPMS",
  "category": "pms",
  "url": "https://test.com",
  "when_to_mention": "Cuando se hable de reservas",
  "natural_mention": "Instalé {name}: {url}",
  "active": true
}
```

**Test**:
1. Jugador: "Deberías mejorar tu sistema de reservas"
2. Paco da ACK
3. Jugador: "¿Qué tal fue?"
4. **Verificar**: Paco menciona "TestPMS" con URL

---

## 📚 FAQ

### ¿Puedo tener productos de la misma categoría?

Sí, pero solo se usará uno cada vez. El sistema elegirá el más relevante.

### ¿Qué pasa si no hay productos activos?

El sistema funciona normal, simplemente no se menciona ninguna marca (todo genérico).

### ¿Los productos patrocinados sustituyen las respuestas genéricas?

No, **complementan**. Paco sigue usando términos genéricos cuando no hay productos activos o cuando no es contextualmente apropiado.

### ¿Puedo cambiar el texto de mención sin reiniciar?

No, actualmente necesitas reiniciar el servidor. En el futuro se podría implementar hot-reloading.

---

## 🚧 Mejoras Futuras

1. **Panel de Administración**: UI web para gestionar productos sin editar JSON
2. **A/B Testing**: Probar diferentes menciones y ver cuál funciona mejor
3. **Analytics Dashboard**: Ver menciones por producto, clicks, conversiones
4. **Límites por partida**: Máximo X menciones por partida para no saturar
5. **Contexto avanzado**: Solo mencionar si el hotel tiene X€ de ingresos (productos premium)

---

## 📄 Licencia y Uso

Este sistema es propiedad del proyecto Ayuda a Paco.

Considera informar a los usuarios sobre la presencia de menciones patrocinadas para mantener la transparencia.

---

**Última actualización**: 2025-02-03
**Versión**: 1.0
