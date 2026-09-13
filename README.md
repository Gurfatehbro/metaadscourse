# Meta Ads Crash Course 2026 (PDF Edition)

High-converting, responsive single-product eCommerce landing page and full-stack sales system for the **Meta Ads Crash Course 2026** (28-Page Comprehensive PDF Playbook).

---

## ⚡ Features

- **High-Converting Product Page**:
  - Interactive 3D physical book tilt effect with dynamic light gloss and realistic shadows.
  - Digital bundle preview tabs.
  - Transparent pricing: **₹249** (Regular ₹999 — SAVE 75%).
  - Customer input fields: **Name** (Required), **Mobile Number** (Required), **Email Address** (Optional).
- **Payment Gateway**:
  - Direct integration with **Razorpay Live**.
  - Supports UPI (GPay, PhonePe, Paytm, CRED), QR codes, Debit/Credit Cards, and NetBanking.
  - Instant server-side payment verification via HMAC-SHA256 signature verification.
  - Automatic digital license key generation (`META-2026-XXXX-XXXX`).
  - Instant automatic download of the 28-Page PDF Playbook upon successful payment.
- **Admin AI Dashboard (`/adminai`)**:
  - Password protected (`metaadmin`).
  - **Paid Orders Tab**: View all verified paid orders with Customer Name, Mobile Number, Email, Payment ID, Amount (₹249), Status, and License Key.
  - **Abandoned / Pending Orders Tab**: Captures checkouts where payment was initiated but dropped off.
  - **1-Click WhatsApp Recovery**: Direct WhatsApp chat links to instantly follow up with abandoned leads.
  - Real-time revenue metrics, search filtering, and one-click CSV export.

---

## 🛠️ Tech Stack

- **Backend**: Node.js (`server.js`)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (`index.html`, `styles.css`, `app.js`, `adminai.html`)
- **Database**: Local JSON storage (`orders.json`)
- **PDF Generation**: `pdf-lib`

---

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Gurfatehbro/metaadscourse.git
   cd metaadscourse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   - **Storefront**: [http://localhost:3000](http://localhost:3000)
   - **Admin Portal**: [http://localhost:3000/adminai](http://localhost:3000/adminai) (Password: `metaadmin`)
