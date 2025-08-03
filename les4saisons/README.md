# Les 4 Saisons - Restaurant Management & Ordering Platform

A modern full-stack web application for restaurant menu management, online ordering, and admin control panel. Built for Les 4 Saisons, this project features a beautiful UI, robust backend, and flexible customization for both customers and admins.

---

## 🚀 Features

- **Customer Side:**
  - Browse menu (tacos, burgers, pizzas, drinks, etc.)
  - Customize items (meats, sauces, supplements, combos)
  - Add to cart, checkout, and payment
  - Multi-language (English & French)
  - Responsive, mobile-friendly design

- **Admin Panel:**
  - Manage menu items, categories, meats, sauces, drinks, supplements, price presets
  - CRUD for all entities with modern UI (tables, icons, inline editing)
  - Order management (view, update status)
  - Real-time feedback, error handling, and loading states

- **Tech Stack:**
  - **Frontend:** React, TypeScript, Tailwind CSS, Vite
  - **Backend:** Node.js, Express, MongoDB (Mongoose)
  - **Auth:** JWT-based authentication
  - **API:** RESTful, modular controllers

---

## 🛠️ Setup & Installation

### 1. Clone the Repository
```bash
git clone git@github.com:Aymanehajli/les4saisons.git
cd les4saisons
```

### 2. Install Dependencies
#### Backend
```bash
cd backend
npm install
```
#### Frontend
```bash
cd ../
npm install
```

### 3. Environment Variables
- Copy `.env.example` to `.env` in both root and backend folders.
- Fill in MongoDB URI and any other secrets as needed.

### 4. Run the App
#### Backend
```bash
cd backend
npm run dev
```
#### Frontend
```bash
npm run dev
```

- The frontend will be available at `http://localhost:5173` (or as shown in your terminal).
- The backend API runs at `http://localhost:3001` by default.

---

## 📸 Screenshots

> _Add screenshots/gifs of the main UI, admin panel, and customization modals here._

---

## 🤝 Contributing

1. Fork the repo and create your branch from `branch-Aymane`.
2. Make your changes and commit with clear messages.
3. Push to your fork and open a Pull Request.
4. For major changes, open an issue first to discuss.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

- [Aymane Hajli](https://github.com/Aymanehajli)

---

## 💡 Credits

- UI icons: [Lucide](https://lucide.dev/)
- Inspiration: Modern restaurant SaaS platforms 