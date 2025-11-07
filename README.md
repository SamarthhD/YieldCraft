# 💹 YieldCraft Lite

YieldCraft Lite  is a full-stack investment tracking and analytics application that allows users to manage their assets, visualize performance, and analyze portfolio insights — all in one place.

---

## 🚀 Tech Stack

**Frontend**
- Angular 17  
- Angular Material  
- ApexCharts (for analytics visualization)

**Backend**
- Node.js (REST API)  
- FastAPI (Python-based service)

**Databases**
- PostgreSQL 


**Containerization**
- Docker & Docker Compose

**Optional**
- Apache Airflow (for workflow automation — minimal setup)

---

## 📁 Project Structure

yieldcraft-lite/
│
├── frontend/
│ └── yieldcraft-ui/ # Angular app
│ ├── src/
│ ├── Dockerfile
│ └── .dockerignore
│
├── backend-node/ # Node.js backend
├── backend-fastapi/ # FastAPI backend
│
├── airflow/ # Minimal Airflow setup
│ ├── dags/
│ └── docker-compose.yml
│
├── docker-compose.yml # Databases (Postgres)
└── README.md



---

## ⚙️ Setup Instructions

### 🧩 1. Clone the repository
```bash
git clone https://github.com/<your-username>/yieldcraft-lite.git
cd yieldcraft-lite
🧱 2. Install dependencies
Frontend


cd frontend/yieldcraft-ui
npm install
Backend (FastAPI or Node)


# For Node backend
cd backend-node
npm install

# For FastAPI backend
cd backend-fastapi
pip install -r requirements.txt
🐳 3. Run using Docker
Make sure Docker Desktop is running.

Start databases

docker compose up -d
Build frontend

cd frontend/yieldcraft-ui
docker build -t yieldcraft-frontend .
Run frontend

docker run -p 80:80 yieldcraft-frontend
Frontend will be available at 👉 http://localhost

🪶 4. Run Airflow (optional)

cd airflow
docker compose up
Visit Airflow UI at 👉 http://localhost:8080
Username: airflow
Password: airflow

🧠 Features
🔐 User authentication (login & register)

💰 Add / view investments

📊 Real-time portfolio analytics

📈 ApexCharts integration for visual insights

🐳 Docker-ready for full containerization


🧩 Future Enhancements

Role-based dashboards

Airflow data pipelines

DeFi asset integration (Web3 support)

🧑‍💻 Author
Samarth Deshpande 


🌐 GitHub
📧 [samarthdeshpande467@gmail.com]



