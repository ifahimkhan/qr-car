# 🚗 QR Car

**QR Car** is a privacy-first vehicle notification system. It allows anyone to alert a vehicle's owner anonymously by scanning a QR code sticker placed on the vehicle's window or dashboard. 

The system protects personal privacy by routing all communications (calls, WhatsApp messages, or SMS alerts) through a Twilio-powered bridge—ensuring the owner's phone number and the scanner's phone number are never exposed to each other.

---

## 🌟 Key Features

- **🔒 Privacy-First Communication**: Routes phone calls and messaging alerts anonymously. Strangers never see the vehicle owner's contact details.
- **📱 Twilio Messaging Integration**: Supports alerts via WhatsApp, SMS, or automated voice calls.
- **📍 Geolocation Logging**: Capture the precise location of the scan (with scanner permission) to show the owner exactly where their vehicle needs attention.
- **👥 Emergency Contacts**: Add and prioritize alternative emergency contacts if the owner is unreachable.
- **📊 Owner Dashboard**: Register vehicles, print high-quality QR codes, and view real-time scan event logs.
- **🎨 Modern UI**: Sleek, clean, responsive design built with TailwindCSS, Lucide icons, and Shadcn UI.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with [SQLite](https://www.sqlite.org/) (for dev, easily switchable to Postgres or MySQL)
- **APIs & Communication**: [Twilio SDK](https://www.twilio.com/)
- **Authentication**: JWT & [Jose](https://github.com/panva/jose) tokens for secure owner dashboards
- **QR Generation**: [qrcode](https://www.npmjs.com/package/qrcode)

---

## ⚙️ Configuration & Setup

### Prerequisites
- Node.js (v18.x or later)
- NPM, Yarn, PNPM, or Bun
- A Twilio account (for SMS, Voice, and WhatsApp capabilities)

### Step 1: Clone and Install
Clone the repository to your local system and install dependencies:
```bash
git clone https://github.com/your-username/qr-car.git
cd qr-car
npm install
```

### Step 2: Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Fill in the configuration details inside `.env`:
```env
# Database connection string (SQLite file path)
DATABASE_URL="file:./dev.db"

# JWT secret key for dashboard authorization
JWT_SECRET="your-super-secure-jwt-secret"

# Twilio API credentials
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"        # Twilio number for SMS/Voice
TWILIO_WHATSAPP_NUMBER="+1234567890"    # Twilio number configured for WhatsApp

# Publicly visible Twilio phone number (must match Twilio dashboard configuration)
NEXT_PUBLIC_TWILIO_NUMBER="+1234567890"

# Base URL for the QR code links (e.g. your production domain or local tunnel URL)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Step 3: Run Database Migrations
Initialize your SQLite database using Prisma:
```bash
npx prisma db push
```

### Step 4: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🗄️ Database Schema Overview

The database uses five main SQLite-backed tables via Prisma:
- **`Owner`**: Stores registration info, credentials, and associated vehicles.
- **`Vehicle`**: Car make, model, color, registration plate, and Owner relationships.
- **`EmergencyContact`**: Additional contacts to notify if the main owner doesn't respond.
- **`QrToken`**: Represents a unique sticker token linked to a vehicle.
- **`ScanEvent`**: Logs when the QR code was scanned, the selected alert type, and GPS coordinates (lat/lng).

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/qr-car/issues) if you have any questions or feedback.
