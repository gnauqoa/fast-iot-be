<div id="top">

<!-- HEADER STYLE: CONSOLE -->
<div align="center">

<h1 align="center">
  <br>
  <a href="http://www.amitmerchant.com/electron-markdownify"><img src="https://raw.githubusercontent.com/gnauqoa/fast-iot-fe/c8f4e737913bd522e44882d34bd66b855ba340f1/public/fast-iot-no-text.svg"alt="Markdownify" width="200"></a>
  <br>Fast IoT - Backend
  <br>
</h1>

<h4>A full-stack framework to fast-track your IoT development.</h4>
</div>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#technical-stack">Technical Stack</a> •
  <a href="#license">License</a>
</p>

<div align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E.svg?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/i18n-Multilingual-6c63ff.svg?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS i18n" />
  <img src="https://img.shields.io/badge/Socket.io-010101.svg?style=flat-square&logo=socketdotio&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/MQTT-660066.svg?style=flat-square&logo=MQTT&logoColor=white" alt="MQTT" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1.svg?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/MongoDB-47A248.svg?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-FF4438.svg?style=flat-square&logo=Redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Docker-2496ED.svg?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28.svg?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Swagger-85EA2D.svg?style=flat-square&logo=swagger&logoColor=black" alt="Swagger" />
</div>
</div>

## Features
- **Backend Server**: Built with NestJS based on the [nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate), providing scalable and secure APIs for IoT device management and data processing.
- **Database**: Utilizes PostgreSQL for structured data storage, MongoDB for flexible, unstructured data, and Redis for high-performance caching and real-time data handling.
- **MQTT Integration**: Employs Mosquitto as the MQTT broker for real-time communication between IoT devices and the server.

## Installation
### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- MongoDB (v5 or higher)
- Redis (v6 or higher)
- Mosquitto MQTT Broker
- Docker (optional, for Docker Compose setup)
- Git

### Option 1: Using Docker Compose
1. Clone the repository:
   ```bash
   git clone https://github.com/gnauqoa/fast-iot-be.git
   ```
2. Navigate to the project directory:
   ```bash
   cd fast-iot-be
   ```
3. Copy the Docker environment file:
   ```bash
   cp .env-docker-example .env
   ```
4. Configure environment variables in `.env` (e.g., PostgreSQL, MongoDB, Redis, and MQTT broker credentials).
5. Start the services:
   ```bash
   docker-compose up -d
   ```
6. The backend will be available at `http://localhost:3000`.

### Option 2: Using npm
1. Clone the repository:
   ```bash
   git clone https://github.com/gnauqoa/fast-iot-be.git
   ```
2. Navigate to the project directory:
   ```bash
   cd fast-iot-be
   ```
3. Copy the development environment file:
   ```bash
   cp .env-dev-example .env
   ```
4. Configure environment variables in `.env` (e.g., PostgreSQL, MongoDB, Redis, and MQTT broker credentials, Firebase).
5. Install dependencies:
   ```bash
   npm install
   ```
6. Run database migrations:
   ```bash
   npm run migrate
   ```
7. Run seed database:
   ```bash
   npm run seed
   ```
8. Start the server:
   ```bash
   npm run dev
   ```
This will spin up:

- 🌐 Backend API available at [`http://localhost:3000`](http://localhost:3000)
- 📡 MQTT Broker for IoT device communication via port [`1883`](http://localhost:1883)
- 🧪 Swagger UI for dev mode at [`http://localhost:3000/docs`](http://localhost:3000/docs)


## Usage

- 🛠️ **API Access & Documentation**  
  The backend exposes a full suite of RESTful endpoints for device management, data processing, and system monitoring, built on the [nestjs‑boilerplate](https://github.com/brocoders/nestjs-boilerplate) framework.  
  👉 Explore and test every endpoint interactively via **Swagger UI** (development mode):  
  [`http://localhost:3000/docs`](http://localhost:3000/docs)

- 📡 **MQTT Integration**  
  Connect your IoT devices to the **Mosquitto MQTT broker** for real‑time data exchange.  
  - **Authentication**: Supports username/password or token-based login.  
  - **Authorization**: Topic-level publish/subscribe permissions are managed via role-based access control (RBAC).

- 🔄 **Real-Time Communication & Notifications**  
  - **Socket.IO**: Enables low-latency, bidirectional communication for live dashboards, control commands (e.g., toggling relays), and **instant notifications** to connected clients.
  - **Firebase Cloud Messaging (FCM)**: Delivers **push notifications** to mobile or browser clients for alerts like device offline, threshold breaches, or custom events.

- 🔐 **Security**  
  - **REST API**: Protected using JWT authentication and TLS 1.3 encryption.  
  - **MQTT**: Encrypted with TLS, with fine-grained access controls.  
  - **WebSocket & FCM**: Authenticated using secure tokens, integrated with RBAC for scoped access.


## Technical Stack
- **Framework**: NestJS (TypeScript, based on [nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate))
- **Storage**: PostgreSQL (structured data), MongoDB (unstructured data), Redis (cache and real-time data)
- **MQTT Broker**: Mosquitto
- **Firebase**: Currently just for FCM

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.