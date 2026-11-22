# Inventory and Data Management System

Web Development III - Assignment 3 (Unit 3)

A backend inventory management API built using Node.js, Express.js, MongoDB, Mongoose and dotenv.

## Project structure

```text
InventoryManagement/
├── controllers/
│   └── productController.js
├── middleware/
│   └── errorMiddleware.js
├── models/
│   └── Product.js
├── routes/
│   └── productRoutes.js
├── .env
├── .gitignore
├── package.json
├── package-lock.json (created after npm install)
└── server.js
```

- `controllers`: contains the functions that perform product operations.
- `models`: contains the Mongoose Product schema and validation rules.
- `routes`: maps API URLs and HTTP methods to controller functions.
- `middleware`: contains centralized error handling.
- `server.js`: connects to MongoDB and starts the Express server.

## Setup

1. Install Node.js, MongoDB (local server or MongoDB Atlas), and Postman.
2. Open this project folder in VS Code.
3. Run `npm install` in the terminal.
4. Copy `.env.example` and rename the copy to `.env`.
5. Put your own MongoDB connection string in `.env`.

Example for local MongoDB:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inventoryDB
```

Do not upload your real `.env` file or `node_modules` folder to GitHub.

## Run the server

```bash
npm start
```

The terminal should show `MongoDB Connected Successfully` and `Server running on port 5000` when the connection is successful.

Open `http://localhost:5000/` to check the server.

## API endpoints

Base URL: `http://localhost:5000/api/products`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/` | Create a product |
| GET | `/` | Get products with filtering, sorting and pagination |
| GET | `/:id` | Get one product by ID |
| PUT | `/:id` | Update product details |
| PATCH | `/:id/stock` | Increase or decrease stock |
| DELETE | `/:id` | Delete a product |
| GET | `/low-stock` | Get products at or below reorder level |
| GET | `/summary` | Category-wise summary using aggregation |

### Create product example

POST `http://localhost:5000/api/products`

Choose Body > raw > JSON in Postman:

```json
{
  "name": "Notebook",
  "sku": "NOTE101",
  "category": "Stationery",
  "price": 50,
  "quantity": 100,
  "reorderLevel": 10,
  "supplier": "ABC Store"
}
```

### Useful GET examples

- All products: `GET /api/products`
- Search by name: `GET /api/products?search=Note`
- Filter by category: `GET /api/products?category=Stationery`
- Filter by price: `GET /api/products?minPrice=20&maxPrice=100`
- Sort by price, high to low: `GET /api/products?sort=-price`
- Pagination: `GET /api/products?page=1&limit=5`
- Low-stock report: `GET /api/products/low-stock`
- Category summary: `GET /api/products/summary`

For routes containing `:id`, replace it with the `_id` returned when a product is created.

For stock adjustment, send JSON such as `{ "change": 10 }` to `PATCH /api/products/PRODUCT_ID`. Use a negative number to reduce stock, for example `-5`.

## GitHub notes

The `.gitignore` file excludes `node_modules/` and `.env`. Upload the source code, `.env.example`, README, and package files. Never commit database passwords or API secrets.
