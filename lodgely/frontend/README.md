# Lodgely Frontend — Web Portal

This is the Next.js frontend user portal for **Lodgely**, built with Next.js (App Router), React, Tailwind CSS, TypeScript, and Lucide React.

---

## 🛠️ Tech Stack & Components
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (customized minimalist dark theme)
- **Icons:** Lucide React
- **Language:** TypeScript

---

## 🚀 Setup & Installation

### 1. Prerequisites
Ensure the backend API server is set up and running before starting the frontend, or configure the backend URL environment variable.

### 2. Install Dependencies
Navigate to the `frontend` directory and run:
```bash
npm install
```

### 3. Environment Configuration (Optional)
By default, the application connects to `http://localhost:5000` (which is the default port for the backend server). If you need to change this, create a `.env.local` file inside the `frontend` folder:
```env
NEXT_PUBLIC_API_URL="http://your-backend-api-url"
```

### 4. Running the Dev Server
```bash
# Run Next.js in development mode (hot reloads on file save):
npm run dev

# Compile and optimize for production:
npm run build

# Start the compiled production build:
npm run start

# Run typescript compilation verification and lint check:
npm run lint
```
Once started, open [http://localhost:3000](http://localhost:3000) in your web browser to access the portal.

---

## 📁 Component Structure
- `src/app/page.tsx` — Hostels Overview and drilldown navigation entry.
- `src/app/rooms/page.tsx` — Rooms Overview (filtered by selected Hostel).
- `src/app/students/page.tsx` — Students list (filtered by selected Room).
- `src/components/` — Sidebar layout, Modal helper, forms (`HostelForm`, `RoomForm`, `StudentForm`) and UI cards.
- `src/lib/api.ts` — Axios/fetch wrappers mapping client requests to backend API handlers.
