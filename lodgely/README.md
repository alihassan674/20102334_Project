# Lodgely — Hostel & Occupancy Management Platform

Lodgely is a centralized system designed to streamline management, room assignments, check-ins, check-outs, and tracking occupancy levels for student hostels.

---

## 📁 Repository Overview
The codebase is structured as a monorepo containing two main folders:
- **`backend/`**: Node.js/Express API with TypeScript and Prisma.
- **`frontend/`**: Next.js App Router UI styled with Tailwind CSS.

---

## 🚀 Quick Start (Local Run)

1. **Prerequisites:** Ensure you have Node.js (v18+) and PostgreSQL installed.
2. **Start Backend Database & Server:**
   ```bash
   cd backend
   npm install
   # Create a .env file and set DATABASE_URL="..." and PORT=5000
   npm run prisma:migrate
   npm run dev
   ```
3. **Start Frontend Portal:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Access the web dashboard on **http://localhost:3000**.

---

## ☁️ Google Cloud VM Deployment Guide (Ubuntu Server)

Follow these detailed steps to deploy Lodgely on a Google Cloud Platform (GCP) Compute Engine instance.

### Step 1: Create a VM Instance on GCP
1. Go to **Compute Engine** > **VM Instances** in the Google Cloud Console.
2. Click **Create Instance**.
3. Choose an machine type (e.g., `e2-micro` or `e2-small` for testing).
4. Under **Boot disk**, choose **Ubuntu 22.04 LTS**.
5. Under **Firewall**, check **Allow HTTP traffic** and **Allow HTTPS traffic**.
6. Click **Create** and wait for the VM to start.
7. Click the **SSH** button to open the VM terminal.

### Step 2: Install Node.js, Git, and PostgreSQL on the VM
Once connected via SSH, run the following commands to update system packages and install prerequisites:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git build-essential

# Install Node.js v20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
```

### Step 3: Configure the Database on the VM
1. Log in to the PostgreSQL user:
   ```bash
   sudo -i -u postgres psql
   ```
2. Create a database, user, and set a password:
   ```sql
   CREATE DATABASE lodgely;
   CREATE USER lodgelyuser WITH PASSWORD 'securepassword123';
   GRANT ALL PRIVILEGES ON DATABASE lodgely TO lodgelyuser;
   \q
   ```

### Step 4: Clone Repository and Build Applications
1. Clone your project repository onto the VM:
   ```bash
   git clone <your-repository-url> lodgely
   cd lodgely
   ```
2. **Set up Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file (`nano .env`) with:
   ```env
   DATABASE_URL="postgresql://lodgelyuser:securepassword123@localhost:5432/lodgely?schema=public"
   PORT=5000
   ```
   Run database migrations and build:
   ```bash
   npx prisma db push
   npm run build
   ```
3. **Set up Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env.local` file (`nano .env.local`) to configure the public URL of the backend. Replace `YOUR_VM_EXTERNAL_IP` with your VM's public IP address or your domain:
   ```env
   NEXT_PUBLIC_API_URL="http://YOUR_VM_EXTERNAL_IP:5000"
   ```
   Compile Next.js build:
   ```bash
   npm run build
   ```

### Step 5: Keep Apps Running in Background with PM2
Install PM2 globally on the VM to manage and persist node background processes:
```bash
sudo npm install -y -g pm2

# Start Backend Process
cd ../backend
pm2 start dist/index.js --name "lodgely-backend"

# Start Frontend Process
cd ../frontend
pm2 start npm --name "lodgely-frontend" -- start

# Configure PM2 to start on system boot
pm2 startup systemd
pm2 save
```

### Step 6: Configure Nginx Reverse Proxy
To serve the app cleanly over standard web ports (80/443), set up Nginx:
```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/default
```
Replace the content of the file with this config (change ports and IP if needed):
```nginx
server {
    listen 80;
    server_name YOUR_VM_EXTERNAL_IP_OR_DOMAIN;

    # Frontend Route
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API Route
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Validate configuration and restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

If you configured Next.js using Nginx as a reverse proxy, make sure to update `NEXT_PUBLIC_API_URL` to `"http://YOUR_VM_EXTERNAL_IP_OR_DOMAIN"` and rebuild/restart the frontend process. Your app is now fully deployed and accessible on your VM's external IP address!
