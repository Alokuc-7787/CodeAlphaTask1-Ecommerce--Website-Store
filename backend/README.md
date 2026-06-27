# EasyMart Backend

Node.js, Express, MongoDB, and JWT backend for the React ecommerce frontend.

## Folder Structure

```text
backend/
  config/
    db.js
  controllers/
    authController.js
    cartController.js
    productController.js
  middleware/
    authMiddleware.js
  models/
    Cart.js
    Product.js
    User.js
  routes/
    authRoutes.js
    cartRoutes.js
    productRoutes.js
  .env.example
  package.json
  server.js
```

## Setup

1. Copy `.env.example` to `.env`
2. Update `MONGO_URI` and `JWT_SECRET`
3. Run `npm install`
4. Run `npm run dev`

## Main APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/cart`
- `POST /api/cart/add`
- `DELETE /api/cart/remove`

## Auth Header

```text
Authorization: Bearer your_jwt_token
```
