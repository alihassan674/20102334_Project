# Lodgely Backend — API Service

This is the backend API service for **Lodgely**, built with Node.js, Express, TypeScript, and Prisma ORM with a PostgreSQL database.

---

## 🛠️ Tech Stack & Libraries
- **Runtime Environment:** Node.js (v18+ or v20+)
- **Language:** TypeScript
- **Framework:** Express.js
- **Database ORM:** Prisma
- **Development Tooling:** `ts-node-dev` (automatic reload on save)

---

## 🚀 Setup & Installation

### 1. Prerequisites
Make sure you have Node.js and a running PostgreSQL instance installed on your local computer.

### 2. Install Dependencies
Navigate to the `backend` directory and run:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root of the `backend` directory (there is an example inside) containing the following details:
```env
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<dbname>?schema=public"
PORT=5000
```
- Example:
  `DATABASE_URL="postgresql://postgres:admin@localhost:5432/lodgely?schema=public"`

### 4. Database Setup & Prisma Migrations
To initialize the database schema and synchronize it with PostgreSQL, run:
```bash
# Generate the Prisma Client
npm run prisma:generate

# Run schema migrations
npm run prisma:migrate
```

### 5. Running the Service
```bash
# Start development server with auto-reload:
npm run dev

# Build the TypeScript project:
npm run build

# Start the compiled production build:
npm run start

# View the Prisma Studio database GUI:
npm run prisma:studio
```

---

## 📁 Project Structure
- `src/index.ts` — Server entry point and middleware configuration.
- `src/controllers/` — Controllers containing business logic for Hostels, Rooms, and Students.
- `src/routes/` — Express route mappings and endpoints.
- `prisma/schema.prisma` — Database models mapping relationships between Hostel, Room, and Student.
