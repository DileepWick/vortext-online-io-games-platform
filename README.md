# Vortex - Online IO Games Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://vortexiogaming.vercel.app)

Vortex is a dynamic, full-stack web platform designed to be a central hub for indie game developers and players. It allows developers to upload, manage, and monetize their games, while players can browse a diverse library, play instantly, and purchase their favorites.

**Live Application:** [https://vortexiogaming.vercel.app](https://vortexiogaming.vercel.app)

---

### 📖 Table of Contents
- [🌟 Key Features](#-key-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [📂 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

### 🌟 Key Features

**For Players:**
- **Instant Play:** Instantly play a wide variety of .io games directly in the browser.
- **Game Marketplace:** Browse, search, and purchase games.
- **Social Hub:** Create posts, and comment on or react to posts from other users.
- **Real-time Chat:** Chat with other players in real-time.
- **User Accounts:** Register and log in to manage your profile and purchased games.

**For Developers:**
- **Game Upload & Management:** A dedicated dashboard to upload new games and manage existing ones.
- **Stock & Version Control:** Manage game stock and different versions.
- **Monetization:** Set prices for games and track earnings through a detailed payments dashboard.
- **Developer Profiles:** Showcase your work and connect with the player community.

**For Administrators:**
- **Comprehensive Dashboards:** Multiple dashboards for managing users, orders, products, payments, and site content.
- **User Management:** Tools to manage all user roles (players, developers, staff).
- **Order Fulfillment:** A complete system for tracking and processing game sales and rentals.
- **Content Moderation:** Review and manage community-generated content and chats.

---

### 🛠️ Tech Stack

- **Frontend:**
  - **Framework:** React.js
  - **Build Tool:** Vite
  - **Styling:** Tailwind CSS
  - **UI Components:** Shadcn UI (based on `components.json`)

- **Backend:**
  - **Runtime:** Node.js
  - **Framework:** Express.js
  - **Database:** MongoDB (inferred from typical MERN stack patterns)
  - **Authentication:** Passport.js for JWT authentication
  - **File Storage:** Cloudinary for media uploads
  - **Real-time Communication:** Socket.IO (inferred from chat feature)

- **Deployment:**
  - **Frontend:** Vercel
  - **Backend:** Railway, Vercel

---

### 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

#### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)
- A MongoDB database instance (local or cloud-hosted like MongoDB Atlas)

#### Backend Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/vortext-online-io-games-platform.git
   cd vortext-online-io-games-platform/backend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `backend` directory and add the following variables. Replace the placeholder values with your actual credentials.
   ```env
   # Server Configuration
   PORT=5000

   # MongoDB Connection
   MONGO_URI=your_mongodb_connection_string

   # JWT Secret for Authentication
   JWT_SECRET=your_super_secret_key

   # Cloudinary Configuration (for image/game uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run the backend server:**
   ```sh
   npm start
   ```
   The backend API should now be running on `http://localhost:5000`.

#### Frontend Setup

1. **Navigate to the frontend directory:**
   ```sh
   # From the root directory
   cd frontend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the `frontend` directory.
   ```env
   # The base URL of your backend API
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Run the frontend development server:**
   ```sh
   npm run dev
   ```
   The application should now be running on `http://localhost:5173` (or another port if 5173 is busy).

---

### 📂 Project Structure

The project is organized as a monorepo with two main packages:

- **`backend/`**: The Node.js/Express.js server.
  - `api/`: Server entry point for Vercel.
  - `controllers/`: Contains the business logic for handling requests.
  - `models/`: Defines the MongoDB database schemas.
  - `routes/`: Defines the API endpoints.
  - `middleware/`: Custom middleware for authentication, file uploads, etc.
- **`frontend/`**: The React.js client application.
  - `src/`: Main source code directory.
  - `src/pages/`: Top-level page components.
  - `src/components/`: Reusable UI components.
  - `src/dashboards/`: Components specifically for the various admin/developer dashboards.
  - `Games/`: Contains the source for simple, embedded browser games.

---

### 🤝 Contributing

Contributions are welcome! If you have suggestions for improving the platform, please feel free to open an issue or submit a pull request.

1.  **Fork** the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  **Commit** your Changes (`git commit -m '''Add some AmazingFeature'''`)
4.  **Push** to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a **Pull Request**

---

### 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details (if one exists).
