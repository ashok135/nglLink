# nglLink 🤫 - Modern NGL-Style Anonymous Messaging App

A premium, production-ready anonymous messaging application inspired by the NGL app. Built using **React 19, Vite 8, TypeScript 6, Tailwind CSS v4, and Firebase Firestore**.

---

## ✨ Features

- **NGL-Style Branding**: Centers a vibrant pink-orange gradient card with curved corners, complete with a clean header warning bar and a bottom black capsule button.
- **Capsule Inputs**: Capsule-styled transparent message textarea and responsive focus highlights.
- **Floating organic bubble background**: Custom HSL-based floating glass bubble animation for interactive depth.
- **Pure Anonymity**: Eliminates personal field inputs to ensure 100% anonymous submission.
- **Geo-Location and Analytics**: Automatically queries public geo-location details (City, State, Country) and hashes the visitor IP address client-side (via SHA-256) before sending data to Firestore.
- **Admin Portal (`/admin`)**:
  - Secure login access using administrator credentials (`admin` / `admin`).
  - Real-time message streaming feed directly from Firestore.
  - Displays message text, location tag, submission time, and visitor user agent.
  - Interactive "Delete" command to remove messages from the feed and Firestore.
- **Toast Notifications**: Glassmorphic sliding toast alerts for quick validation and connection feedback.
- **Micro-animations**: Powered by Framer Motion, featuring confetti explosions on success and SVG path checkmark drawing.
- **Resilient Fallback**: Automatically activates a simulated **Demo Mode** using LocalStorage if Firestore keys are not configured.

---

## 🛠️ Tech Stack

- **Framework**: React 19 & TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4
- **Database**: Firebase Firestore
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Celebration**: Canvas Confetti

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/ashok135/nglLink.git
cd nglLink
npm install
```

### 2. Environment Configuration
To connect to your Firestore database:
- Copy the environment template:
  ```bash
  cp .env.example .env
  ```
- Fill in your Firebase Web App configuration credentials in `.env`:
  ```ini
  VITE_FIREBASE_API_KEY=your_api_key
  VITE_FIREBASE_PROJECT_ID=your_project_id
  # ...
  ```

### 3. Running Locally
Launch the Vite dev server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security & Privacy

- All IP addresses are hashed client-side using a SHA-256 algorithm before submission. Original IPs are never sent to or stored in Firestore.
- The `.env` credentials file is strictly ignored by Git config settings.
- The `/admin` portal features a basic mock password lock. For production environments, consider connecting Firebase Auth.
