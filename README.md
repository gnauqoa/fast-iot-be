<div id="top">

<!-- HEADER STYLE: CONSOLE -->
<div align="center">

<h1 align="center">
  <br>
  <a href="http://www.amitmerchant.com/electron-markdownify"><img src="https://raw.githubusercontent.com/gnauqoa/fast-iot-fe/c8f4e737913bd522e44882d34bd66b855ba340f1/public/fast-iot-no-text.svg"alt="Markdownify" width="200"></a>
  <br>Fast IoT - Backend
  <br>
</h1>

<h4 align="center">A framework to quick start IoT project.</h4>
</div>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#repository-structure">Repository Structure</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#license">License</a>
</p>
<div align="center">
<img src="https://img.shields.io/badge/Socket.io-010101.svg?style=flat-square&logo=socketdotio&logoColor=white" alt="Socket.io">
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat-square&logo=npm&logoColor=white" alt="npm">
<img src="https://img.shields.io/badge/TypeORM-FE0803.svg?style=flat-square&logo=TypeORM&logoColor=white" alt="TypeORM">
<img src="https://img.shields.io/badge/Redis-FF4438.svg?style=flat-square&logo=Redis&logoColor=white" alt="Redis">
<img src="https://img.shields.io/badge/Mongoose-F04D35.svg?style=flat-square&logo=Mongoose&logoColor=white" alt="Mongoose">
<img src="https://img.shields.io/badge/postgres-4169E1.svg?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
<img src="https://img.shields.io/badge/Docker-2496ED.svg?style=flat-square&logo=Docker&logoColor=white" alt="Docker">
<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat-square&logo=TypeScript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/MQTT-660066.svg?style=flat-square&logo=MQTT&logoColor=white" alt="MQTT">
<img src="https://img.shields.io/badge/Firebase-FFCA28.svg?style=flat-square&logo=firebase&logoColor=black" alt="Firebase">
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
4. Configure environment variables in `.env` (e.g., PostgreSQL, MongoDB, Redis, and MQTT broker credentials).
5. Install dependencies:
   ```bash
   npm install
   ```
6. Run database migrations:
   ```bash
   npm run migrate
   ```
7. Start the server:
   ```bash
   npm run start
   ```

## Usage
- **API Access**: The backend exposes RESTful APIs for device management, data processing, and system monitoring, built on the [nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate) structure. Refer to the API documentation (coming soon) for endpoints and usage.
- **MQTT Integration**: Configure IoT devices to connect to the Mosquitto broker for real-time data transmission.
- **Admin Panel**: Use the FastIoT admin panel (built with Refine) to monitor and manage devices via a user-friendly interface.

## Quality Management
- **Standards**:
  - Adheres to OWASP Top 10 for security.
  - Uses TLS 1.3 for data transmission and AES-256 for storage encryption.
  - API response time ≤ 300ms, system uptime ≥ 99.9%.
  - Supports multi-language admin panel for global accessibility.
- **Control Procedures**:
  - Git-based version control with strict pull request and code review processes, following the [nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate) guidelines.
  - Automated testing (unit, integration, and UAT) via GitHub Actions.
  - Monitoring with Prometheus and Grafana for performance and error detection.
  - Access control with role-based permissions and two-factor authentication (2FA).

## Technical Stack
- **Framework**: NestJS (TypeScript, based on [nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate))
- **Storage**: PostgreSQL (structured data), MongoDB (unstructured data), Redis (cache and real-time data)
- **MQTT Broker**: Mosquitto

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.