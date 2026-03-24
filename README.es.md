# Smart E-Commerce API

> 🇬🇧 [English version available here](./README.md)

Una robusta API RESTful construida con **NestJS**, diseñada para manejar la lógica compleja de un comercio electrónico moderno. Este proyecto no es un e-commerce tradicional, ya que incluye características avanzadas de control de stock y un sistema de auto-aprobación de pagos potenciado por Inteligencia Artificial.

## Características Principales

- **Autenticación y Autorización**: Sistema seguro basado en JWT, contraseñas encriptadas (Bcrypt) y guardias de roles personalizados (Admin / User).
- **Catálogo Jerárquico**: Gestión completa de Categorías, Marcas, Productos y Variantes de producto. Permite crear un producto base y asociarle colores, talles, precios y stock independiente a cada variante.
- **Carrito de Compras y Pagos**:
  - Reserva dinámica de inventario.
  - Sincronización automática de stock: al descontar o devolver una variante, el producto padre refleja el cambio instantáneamente.
  - Tipos de pago soportados: Efectivo (CASH) y Transferencia Bancaria (TRANSFER).
- **Cajero de Inteligencia Artificial (Google Gemini)**:
  - Para los pagos por transferencia, el usuario sube una captura del recibo.
  - La API se conecta al modelo `gemini-2.5-flash` para hacer un análisis de imagen (OCR Inteligente).
  - Extrae monto, banco y fecha. Si el monto cubre el carrito, la IA **aprueba automáticamente la orden de compra**, blindada contra intentos de re-procesamiento.
- **Sistema de Eventos Asíncronos**: Tras la aprobación por IA, se emite el evento `order.approved` de forma asíncrona. El `NotificationsService` lo captura en segundo plano para simular el envío de un email con factura, sin bloquear la respuesta al usuario.
- **Notificaciones en Tiempo Real (WebSockets)**: Un `@WebSocketGateway` hace "push" del evento `order-approved` a todos los clientes admin conectados en el instante en que un pago es auto-aprobado. Sin necesidad de recargar la página.
- **Cron Jobs**: Tarea programada que corre en segundo plano limpiando carritos "abandonados" o bloqueados en fase de pago por más de 24 horas, devolviendo automáticamente el stock a la tienda.

## Tecnologías Utilizadas

| Capa | Tecnología |
|---|---|
| Framework | Node.js + NestJS |
| Lenguaje | TypeScript |
| Base de Datos | MariaDB / MySQL |
| ORM | TypeORM |
| Inteligencia Artificial | `@google/generative-ai` (Gemini) |
| Seguridad | Passport, JWT, Bcrypt |
| Eventos | `@nestjs/event-emitter` |
| WebSockets | `@nestjs/websockets` + `socket.io` |
| Documentación | Swagger / OpenAPI |

## Instalación y Despliegue

1. Cloná el repositorio:
   ```bash
   git clone https://github.com/silvi8794/nestjs-ecommerce-api.git
   cd nestjs-ecommerce-api
   ```

2. Instalá las dependencias:
   ```bash
   npm install
   ```

3. Configurá tus variables de entorno creando un archivo `.env` en la raíz (basado en `.env.example`). Asegurate de incluir tu `GEMINI_API_KEY`.

4. Iniciá la aplicación en modo desarrollo:
   ```bash
   npm run start:dev
   ```

5. *(Opcional)* Explorá la documentación interactiva de Swagger en `http://localhost:3000/api` una vez que el servidor esté activo.

## Flujo de API — Pago por Transferencia

```
POST /carts/add                → Agregar productos al carrito
POST /carts/checkout           → Confirmar pedido (paymentMethod: "TRANSFER")
POST /carts/upload-receipt/:id → Subir comprobante → IA analiza → auto-aprueba si el monto coincide
```

---
*Este proyecto fue desarrollado como parte de un Portfolio Backend para demostrar buenas prácticas de arquitectura de software, patrones de diseño y escalabilidad en Node.js.*
