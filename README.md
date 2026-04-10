<div align="center">

# 🚀 TeamEase

### Employee Management System

**A modern SaaS platform to simplify HR operations — built for scale, speed, and real-world workflows.**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

</div>

---

## 📌 About the Project

**TeamEase** is a full-stack SaaS application that helps organizations manage their workforce efficiently. From payroll to attendance, onboarding to role-based access — TeamEase brings it all under one roof.

> Built to demonstrate real-world HR workflows, backend scalability with Redis caching, and modular system design.

---

## ✨ Core Features

### 👥 Employee Management
- Add, update, and manage employee profiles
- Role-based access control: **Admin / Super Admin / Employee**
- Department & designation handling

### 💰 Payroll & Salary Slips
- Flexible salary structure management
- Automated salary slip generation
- Edge-case handled: payslips generated based on employee joining date

### 📅 Attendance & Leave Management
- Daily attendance tracking
- Leave application and approval workflows
- Paid leave balance management & holiday calendar

### 📊 Dashboard
- SaaS-style modern UI with key HR insights
- Summary cards and analytics at a glance
- Scalable, component-based frontend architecture

### 📩 Demo Booking System
- Users can request platform demos
- Super Admin can manage and respond to demo requests
- Designed for seamless SaaS onboarding workflows

### ⚡ Redis Caching Layer
- Intelligent API response caching
- Reduced database load under high traffic
- Measurable performance improvements on repeated queries

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | Node.js, Express.js, REST APIs |
| **Database** | PostgreSQL *(migrated from MySQL)* |
| **Caching** | Redis |
| **Dev Tools** | Git (feature-based branching), Cursor AI |

---

## 🏗️ Project Structure

```
employee-management-system/
│
├── frontend/        # React application
├── backend/         # Express API server
├── database/        # Schema & migrations
├── redis/           # Redis configuration
└── README.md
```

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/employee-management-system.git
cd employee-management-system
```

### 2. Setup Backend

```bash
cd backend
npm install
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm start
```

### 4. Configure Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000
DB_URL=your_postgresql_connection
REDIS_URL=your_redis_connection
JWT_SECRET=your_secret_key
```

### 5. Run Redis

```bash
redis-server
```

---

## 🔄 Git Workflow

| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `dev` | Active development |
| `feature/*` | New features |
| `bugfix/*` | Bug fixes |

**Branch naming examples:**

```
feature/salary-slip
feature/leave-management
bugfix/redis-cache
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/your-feature`)
3. **Commit** your changes (`git commit -m 'Add your feature'`)
4. **Push** to the branch (`git push origin feature/your-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Uday Hiremath**  
*Aspiring Full Stack Developer | Interested in Web3 & Scalable Systems*

<div align="center">

---

*Built with ❤️ to simplify HR, one feature at a time.*

</div>
