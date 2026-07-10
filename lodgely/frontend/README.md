# Lodgely — Frontend Portal

> **Student ID:** 20102334  
> **Project:** Hostel Management System  
> **Technology:** Next.js (App Router) + React + Tailwind CSS + Lucide Icons + TypeScript

---

## What This Frontend Does

The frontend is the interactive user interface (UI) for **Lodgely**. It is built as a single-page web app using React and Next.js, allowing campus administrators to manage residential data dynamically without reloading the page.

It provides three main functional dashboards:
1. **Hostels Dashboard** (`/`) — Displays all campus hostels in a card grid with summary statistics, allowing users to add, update, or delete hostels.
2. **Rooms Dashboard** (`/rooms?hostelId=...`) — Lists all rooms within a specific hostel (or all rooms globally), displaying their capacity, occupants, price, and status (Available, Occupied, Maintenance).
3. **Students Dashboard** (`/students?roomId=...`) — Manages student registrations, check-in dates, and contact information. When registering a student, only rooms with available beds are shown. Checking out a student frees their bed immediately.

---

## Libraries / Technologies Used

| Library / Tool | What It Does and Why We Used It |
|---|---|
| **Next.js (v15)** | React framework that handles page routing (App Router) and provides optimization. |
| **React (v19)** | UI library used for managing state (`useState`, `useEffect`) and building reusable components. |
| **Tailwind CSS** | Utility-first CSS framework for clean, rapid, responsive design with a premium dark color palette. |
| **Lucide React** | A clean, modern icon library for buttons, sidebars, and input labels. |
| **TypeScript** | Adds static types to prevent bugs like reading properties from `undefined` or passing invalid IDs to API calls. |
| **native fetch API** | Standard browser HTTP client, wrapped cleanly to send/receive JSON payload to/from our Node.js backend. |

---

## Project Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx            ← Root wrapper: sets up HTML document, fonts, and the Sidebar
│   │   ├── page.tsx              ← Hostels overview dashboard (Homepage)
│   │   ├── rooms/
│   │   │   └── page.tsx          ← Rooms list dashboard (filterable by hostelId URL query)
│   │   └── students/
│   │       └── page.tsx          ← Student lists dashboard (filterable by roomId URL query)
│   ├── components/
│   │   ├── Sidebar.tsx           ← Navigation menu on the left side of the screen
│   │   ├── Modal.tsx             ← Reusable popup overlay for Forms
│   │   ├── HostelForm.tsx        ← Create/Edit hostel inputs
│   │   ├── RoomForm.tsx          ← Create/Edit room inputs
│   │   └── StudentForm.tsx       ← Register/Edit student inputs
│   └── lib/
│       ├── api.ts                ← Reusable fetch wrappers to communicate with backend API
│       └── types.ts              ← Shared TypeScript type declarations (entities & responses)
├── tailwind.config.ts            ← Theme configuration (colors, font family)
├── package.json                  ← Project dependencies and scripts
└── tsconfig.json                 ← TypeScript compiler options
```

---

## How the Frontend Works (Application Flow)

Here is how data flows from user action to screen render:

1. **URL Entry / Navigation:** When a user visits `/rooms?hostelId=abc`, Next.js routes the request to `src/app/rooms/page.tsx`.
2. **Parameters Extraction:** The page reads the query parameter `hostelId` using the `useSearchParams()` hook.
3. **API Call (`api.ts`):** A `useEffect` hook fires when the component loads, triggering `fetchRooms({ hostelId })`.
4. **State Update:** Once the promise resolves, `setRooms(roomsData)` is called.
5. **Re-rendering:** React detects the state change and updates the DOM, passing individual room records into the `<RoomCard />` components.
6. **Interaction:** If the user registers a student, the submission calls `createStudent(...)`, hides the modal, and calls `loadData()` to update the occupant counters live.

---

## Environment Variables

The frontend reads the backend server URL from an environment variable. Create a `.env` or `.env.local` file in the `frontend/` folder:

```env
# Backend API base URL
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

*Note: In Next.js, variables prefixed with `NEXT_PUBLIC_` are compiled into the browser bundle, making them accessible to client-side code.*

On **Google Cloud Machine (GCM)**, change this to point to the external IP of your virtual machine:
```env
NEXT_PUBLIC_API_URL="http://<YOUR_VM_EXTERNAL_IP>:5000"
```

---

## How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the hot-reloading development server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Deploying to Google Cloud Machine (GCM)

Next.js projects need to be built (compiled to optimized production code) before running on a cloud instance.

### Step 1: Install Node.js on the VM
Refer to the backend README deployment steps to configure your GCP Compute Engine VM.

### Step 2: Transfer and Install
```bash
# Copy the frontend folder to your GCM VM instance
scp -r ./frontend/ username@VM_IP:~/lodgely/

# SSH into the VM, go to the folder, and install dependencies
cd ~/lodgely/frontend
npm install
```

### Step 3: Configure GCM Production Variables
Create a production `.env` file inside the `frontend` folder:
```bash
nano .env
```
Add the following line (replace with your VM's public IP address):
```env
NEXT_PUBLIC_API_URL="http://YOUR_VM_EXTERNAL_IP:5000"
```

### Step 4: Build the Frontend
Compile the TypeScript and build the optimized Next.js app:
```bash
npm run build
```

### Step 5: Run with PM2 in the Background
To keep the Next.js frontend running even after closing your terminal window:
```bash
pm2 start npm --name "lodgely-frontend" -- start -- -p 3000
pm2 save
```

### Step 6: Configure Nginx as a Reverse Proxy (Optional, Recommended)
To access the app via standard port 80 (e.g. `http://YOUR_VM_EXTERNAL_IP` without specifying `:3000`), configure Nginx to route traffic to localhost:3000:
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/default
```
Update Nginx config to forward port 80 to port 3000:
```nginx
server {
    listen 80;
    server_name YOUR_VM_EXTERNAL_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

Now, your frontend is accessible directly on: `http://YOUR_VM_EXTERNAL_IP`

---

## How AI (Gemini / Antigravity IDE) Helped Write This Project

This project was built using the **Antigravity AI coding assistant** (powered by Google DeepMind's Gemini model) inside the Antigravity IDE.

Here is how AI helped with the frontend:

1. **Next.js App Router Structure** — AI organized the routes logically, routing the flow of details from Hostels to Rooms, and finally to Students, passing IDs through Next.js URL query strings.
2. **Form Validations** — AI wrote the validation handlers for forms (e.g. verifying phone formatting, checking email syntax, ensuring all mandatory fields are filled) before submitting data to the server.
3. **Responsive Grid Layouts** — Using Tailwind utility classes, AI structured the grids to dynamically adapt from mobile view (1 column) up to desktop wide-screens (4 columns).
4. **Conditional UI Rendering** — AI added logic to show helpful warning cards when no rooms are available for registration, disable registration buttons if capacity is full, and conditionally display action menus (edit/delete) only on hover.
5. **Code Comments & Documentation** — AI commented every frontend page and custom component so that the presentation flow and business logic are crystal clear during evaluation.
