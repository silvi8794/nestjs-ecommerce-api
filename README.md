# Smart E-Commerce API 🛒🤖

Una robusta API RESTful construida con **NestJS**, diseñada para manejar la lógica compleja de un comercio electrónico moderno. Este proyecto no es un e-commerce tradicional, ya que incluye características avanzadas de control de stock y un sistema de auto-aprobación de pagos potenciado por Inteligencia Artificial.

## 🌟 Características Principales

- **Autenticación y Autorización**: Sistema seguro basado en JWT, contraseñas encriptadas (Bcrypt) y guardias de roles personalizados (Admin/User).
- **Catálogo Jerárquico**: Gestión completa de Categorías, Marcas, Productos y Variantes de producto. Permite crear un producto base y asociarle colores, talles, precios y stock independiente a cada variante.
- **Carrito de Compras y Pagos**:
  - Reserva dinámica de inventario.
  - Sincronización automática de stock: Al descontar o devolver una variante, el producto padre refleja el cambio instantáneamente.
  - Tipos de pago soportados: Efectivo (CASH) y Transferencia Bancaria (TRANSFER).
- **🤖 Cajero de Inteligencia Artificial (Google Gemini)**: 
  - Para los pagos por transferencia, el usuario sube una captura del recibo.
  - La API se conecta al modelo `gemini-2.5-flash` para hacer un análisis de imagen (OCR Inteligente).
  - Extrae monto, banco y fecha. Si el monto cubre el carrito, la IA **aprueba automáticamente la orden de compra**, blindada contra intentos de re-procesamiento.
- **Cron Jobs**: Tarea programada (Schedule) que corre en segundo plano limpiando carritos "abandonados" o bloqueados en fase de pago por más de 24 horas, devolviendo automáticamente el stock a la tienda.

## 🛠️ Tecnologías Utilizadas

- **Framework**: NodeJS + NestJS
- **Lenguaje**: TypeScript
- **Base de Datos**: MariaDB / MySQL
- **ORM**: TypeORM
- **Inteligencia Artificial**: `@google/generative-ai`
- **Seguridad**: Passport, JWT, Bcrypt
- **Documentación**: Swagger OpenAPI

## 🚀 Instalación y Despliegue

1. Clona el repositorio:
   ```bash
   git clone https://github.com/silvi8794/nestjs-ecommerce-api.git
   cd nestjs-ecommerce-api
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura tus variables de entorno creando un archivo `.env` en la raíz (basado en `.env.example`). Asegúrate de incluir tu `GEMINI_API_KEY`.

4. Inicia la aplicación en modo desarrollo:
   ```bash
   npm run start:dev
   ```

5. (Opcional) Explora la documentación interactiva provista por Swagger ingresando a `http://localhost:3000/api` una vez que el servidor esté activo.

---
*Este proyecto fue desarrollado como parte de un Portfolio Backend para demostrar buenas prácticas de arquitectura de software, patrones de diseño y escalabilidad en Node.js.*
