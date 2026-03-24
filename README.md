# Smart E-Commerce API

> 🇪🇸 [Versión en Español disponible aquí](./README.es.md)

A robust RESTful API built with **NestJS**, designed to handle the complex logic of a modern e-commerce platform. This is not a traditional e-commerce project — it includes advanced stock control features and an AI-powered payment auto-approval system.

## Key Features

- **Authentication & Authorization**: Secure JWT-based system with encrypted passwords (Bcrypt) and custom role guards (Admin / User).
- **Hierarchical Catalog**: Full management of Categories, Brands, Products, and Product Variants. Create a base product and associate independent colors, sizes, prices, and stock to each variant.
- **Shopping Cart & Payments**:
  - Dynamic inventory reservation.
  - Automatic stock synchronization: when a variant is deducted or returned, the parent product reflects the change instantly.
  - Supported payment methods: Cash (CASH), Bank Transfer (TRANSFER) and **Mercado Pago (MERCADO_PAGO)**.
- **Mercado Pago Integration**: Full checkout flow with automated payment status updates via Webhooks. It creates a payment preference and handles notifications (IPN) to automatically approve orders.
- ** AI-Powered Cashier (Google Gemini)**:
  - For transfer payments, the user uploads a screenshot of the receipt.
  - The API connects to the `gemini-2.5-flash` model to perform intelligent image analysis (Smart OCR).
  - It extracts the amount, bank, and date. If the amount covers the cart total, the AI **automatically approves the purchase order**, protected against reprocessing attempts.
- **Async Event System**: After AI approval, an `order.approved` event is emitted asynchronously. The `NotificationsService` captures it in the background to simulate sending an invoice email — without blocking the user's response.
- **Real-Time WebSocket Notifications**: A `@WebSocketGateway` pushes an `order-approved` event instantly to all connected admin clients the moment a payment is auto-approved. No more refreshing.
- **Cron Jobs**: A scheduled background task cleans up "abandoned" carts or carts stuck in payment phase for more than 24 hours, automatically returning stock to the store.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Node.js + NestJS |
| Language | TypeScript |
| Database | MariaDB / MySQL |
| ORM | TypeORM |
| AI | `@google/generative-ai` (Gemini) |
| Security | Passport, JWT, Bcrypt |
| Events | `@nestjs/event-emitter` |
| WebSockets | `@nestjs/websockets` + `socket.io` |
| Payments | `mercadopago` SDK |
| Docs | Swagger / OpenAPI |

## Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/silvi8794/nestjs-ecommerce-api.git
   cd nestjs-ecommerce-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables by creating a `.env` file at the root (based on `.env.example`).
   - `GEMINI_API_KEY`: Required for transfer receipt analysis.
   - `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`: Mercado Pago credentials.
   - `FRONTEND_URL`: Your frontend URL for post-payment redirection.
   - `MP_WEBHOOK_URL`: Your public ngrok or server URL for Mercado Pago notifications.

4. Start the application in development mode:
   ```bash
   npm run start:dev
   ```

5. *(Optional)* Explore the interactive Swagger docs at `http://localhost:3000/api` once the server is running.

## API Flow — Payments

### Transfer Payment
```
POST /carts/add                → Add items to cart
POST /carts/checkout           → Confirm order (paymentMethod: "TRANSFER")
POST /carts/upload-receipt/:id → Upload receipt → AI analyzes → auto-approves if amount matches
```

### Mercado Pago Payment
```
POST /carts/add                → Add items to cart
POST /carts/checkout           → Confirm order (paymentMethod: "MERCADO_PAGO") → returns paymentUrl
REDIRECT to Mercado Pago       → User completes payment
POST /payments/webhook         → Webhook notifies payment status → auto-approves if "approved"
```

---
*This project was developed as part of a Backend Portfolio to demonstrate software architecture best practices, design patterns, and scalability in Node.js.*
