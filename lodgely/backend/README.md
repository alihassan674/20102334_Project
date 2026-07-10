# Lodgely — Backend API

> **Student ID:** 20102334  
> **Project:** Hostel Management System  
> **Technology:** Node.js + Express + TypeScript + Prisma + PostgreSQL

---

## What This Backend Does

The backend is a **REST API** (Application Programming Interface) built with Node.js. It is the "brain" of the system — it receives requests from the frontend, talks to the database, and sends back data.

It manages **three core resources**:
- **Hostels** — physical buildings that contain rooms
- **Rooms** — individual rooms inside a hostel (SINGLE, DOUBLE, or TRIPLE)
- **Students** — residents who are assigned to a room

There is also a **Dashboard Analytics** endpoint that aggregates statistics for the homepage.

---

## Libraries / Technologies Used

| Library | What It Does |
|---|---|
| **Express.js** | Web framework — handles HTTP requests and routes |
| **TypeScript** | Typed version of JavaScript — catches errors before runtime |
| **Prisma** | ORM (Object Relational Mapper) — lets us write TypeScript instead of raw SQL |
| **PostgreSQL** | The database — stores all hostels, rooms, and student data |
| **dotenv** | Loads environment variables from the `.env` file |
| **cors** | Allows the browser frontend to make API requests to this server |
| **express-async-errors** | Auto-catches async errors and forwards them to the error handler |
| **ts-node-dev** | Runs TypeScript directly in development (with auto-restart on save) |

---

## Project Folder Structure

```
backend/
├── src/
│   ├── index.ts                  ← Entry point: starts the server
│   ├── lib/
│   │   └── prisma.ts             ← Prisma client singleton (DB connection)
│   ├── middleware/
│   │   └── errorHandler.ts       ← Global error catching + custom AppError class
│   ├── routes/
│   │   ├── hostel.routes.ts      ← Maps URLs to hostel controller functions
│   │   ├── room.routes.ts        ← Maps URLs to room controller functions
│   │   ├── student.routes.ts     ← Maps URLs to student controller functions
│   │   └── analytics.routes.ts  ← Maps URL to analytics controller function
│   └── controllers/
│       ├── hostel.controller.ts  ← Hostel business logic (CRUD)
│       ├── room.controller.ts    ← Room business logic (CRUD + occupancy)
│       ├── student.controller.ts ← Student registration/checkout + transactions
│       └── analytics.controller.ts ← Dashboard statistics aggregation
├── prisma/
│   ├── schema.prisma             ← Database schema (3 models: Hostel, Room, Student)
│   └── seed.ts                   ← Script to populate DB with sample data
├── .env                          ← Environment variables (not committed to Git)
├── package.json                  ← Dependencies and npm scripts
└── tsconfig.json                 ← TypeScript compiler configuration
```

---

## How a Request Flows Through the Backend

When the frontend calls the API, here is the exact path the request takes:

```
Browser (Next.js frontend)
    ↓  HTTP Request  (e.g. POST /api/students)
Express Server (index.ts)
    ↓  Middleware  (CORS check → parse JSON body)
Route File  (student.routes.ts)
    ↓  Maps route to handler function
Controller  (student.controller.ts → createStudent)
    ↓  Validates data → queries DB
Prisma ORM  (converts TypeScript to SQL)
    ↓  SQL query
PostgreSQL Database
    ↑  Returns rows
Prisma ORM  (converts rows to TypeScript objects)
    ↑
Controller  (formats response)
    ↑  JSON response  { success: true, data: {...} }
Browser
```

---

## API Endpoints Summary

### Hostels
| Method | URL | Action |
|---|---|---|
| GET | `/api/hostels` | List all hostels |
| GET | `/api/hostels/:id` | Get one hostel (with rooms) |
| POST | `/api/hostels` | Create a new hostel |
| PUT | `/api/hostels/:id` | Update hostel details |
| DELETE | `/api/hostels/:id` | Delete hostel (cascades to rooms + students) |

### Rooms
| Method | URL | Action |
|---|---|---|
| GET | `/api/rooms` | List rooms (supports `?hostelId=`, `?status=`, `?type=`) |
| GET | `/api/rooms/:id` | Get one room (with students list) |
| POST | `/api/rooms` | Create a room inside a hostel |
| PUT | `/api/rooms/:id` | Update room details or status |
| DELETE | `/api/rooms/:id` | Delete room (blocked if students inside) |

### Students
| Method | URL | Action |
|---|---|---|
| GET | `/api/students` | List students (supports `?hostelId=`, `?roomId=`, `?search=`) |
| GET | `/api/students/:id` | Get one student |
| POST | `/api/students` | Register student + auto-update room status |
| PUT | `/api/students/:id` | Update student info |
| DELETE | `/api/students/:id` | Check-out student (frees their bed) |

### Analytics
| Method | URL | Action |
|---|---|---|
| GET | `/api/analytics/dashboard` | Returns all dashboard statistics |

---

## Environment Variables (`.env`)

Create a `.env` file in the `backend/` folder with:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/lodgely_db"

# Port for the Express server
PORT=5000

# URL where the frontend is running (for CORS)
FRONTEND_URL="http://localhost:3000"

# Environment (development | production)
NODE_ENV="development"
```

On **Google Cloud Machine (GCM)**, change these:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/lodgely_db"
PORT=5000
FRONTEND_URL="http://<YOUR_FRONTEND_VM_IP>:3000"
NODE_ENV="production"
```

---

## How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Set up the .env file (see above)

# 3. Push the Prisma schema to the database
npx prisma migrate dev --name init

# 4. (Optional) Seed the database with sample data
npm run prisma:seed

# 5. Start the development server (auto-restarts on save)
npm run dev
```

The server will run at: **http://localhost:5000**  
Health check URL: **http://localhost:5000/api/health**

---

## Deploying to Google Cloud Machine (GCM)

### Step 1: Provision the VM
- Create a **Compute Engine** VM instance (e2-micro or e2-small is enough)
- OS: Ubuntu 22.04 LTS
- Allow HTTP traffic (port 80) and custom port 5000 in the firewall rules

### Step 2: Install Node.js on the VM
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 3: Install PostgreSQL on the VM
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE DATABASE lodgely_db;"
sudo -u postgres psql -c "CREATE USER lodgely_user WITH PASSWORD 'yourpassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lodgely_db TO lodgely_user;"
```

### Step 4: Upload and configure the backend
```bash
# On your local machine, copy the backend folder to the VM
scp -r ./backend/ username@VM_IP:~/lodgely/

# On the VM
cd ~/lodgely/backend
npm install
npx prisma generate
npx prisma migrate deploy  # Applies migrations without prompts
```

### Step 5: Set environment variables on the VM
```bash
# Create the .env file on the VM
nano .env
# Paste your production environment variables (see above)
```

### Step 6: Run the server with PM2 (keeps it running after you disconnect)
```bash
sudo npm install -g pm2
pm2 start dist/index.js --name lodgely-backend
pm2 save
pm2 startup  # Follow the printed command to auto-start on reboot
```

Or in development mode (no build needed):
```bash
pm2 start "npm run dev" --name lodgely-backend
```

### Step 7: Open firewall port on GCM
In **GCP Console → VPC Network → Firewall Rules**, add:
- Name: `allow-backend-5000`
- Direction: Ingress
- Target: All instances
- Port: `tcp:5000`

---

## How AI (Gemini / Antigravity IDE) Helped Write This Project

This project was developed using the **Antigravity AI coding assistant** (powered by Google DeepMind's Gemini model) inside the Antigravity IDE.

Here is how AI contributed:

1. **Project Architecture** — AI suggested the folder structure (routes → controllers → lib) which follows the industry-standard MVC pattern, making the code organized and easy to understand.

2. **Prisma Schema Design** — AI designed the `schema.prisma` file with proper relationships (Hostel → Rooms → Students) and cascade deletes so that deleting a hostel automatically cleans up all related data.

3. **Database Transactions** — The student registration and check-out code uses `prisma.$transaction()`. AI recommended this pattern to ensure that if either the student creation OR the room status update fails, both operations are rolled back, preventing data corruption.

4. **Error Handling** — AI wrote the `AppError` class and `globalErrorHandler` middleware so that all errors across the entire app produce consistent, structured JSON responses that the frontend can reliably parse.

5. **Analytics Query Optimization** — The dashboard analytics endpoint uses `Promise.all()` to run 7 database queries in parallel instead of sequentially, making the dashboard load much faster.

6. **Code Comments** — AI added detailed plain-English comments throughout the codebase to explain what each section does, making the code easy to understand during code reviews and presentations.

7. **GCM Deployment Guide** — AI provided the step-by-step Google Cloud Machine deployment instructions in this README.
