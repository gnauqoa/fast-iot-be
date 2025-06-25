# FastIoT Backend 🚀

## Overview
FastIoT is an open-source platform designed to simplify and accelerate the development of IoT projects. The backend, built with **NestJS** using the [nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate) template, serves as the core of the FastIoT ecosystem. It provides robust APIs, secure data handling, and seamless integration with IoT devices. The platform integrates **PostgreSQL** and **MongoDB** for flexible data storage, **Redis** for caching and real-time data processing, and **Mosquitto** as the MQTT broker for efficient device communication. This repository contains the backend codebase for FastIoT, enabling developers to quickly set up and deploy IoT applications with a single command.

## Purpose and Vision
- **Purpose**: FastIoT streamlines IoT project development by offering a comprehensive open-source platform that simplifies the integration of complex components such as servers, communication protocols, and admin interfaces. It enables developers, especially students and startups, to deploy complete IoT systems efficiently.
- **Vision**: To become the go-to open-source platform for IoT development, empowering developers—from individuals to small businesses—to transform ideas into reality quickly and effectively. FastIoT integrates advanced technologies like edge AI, ensuring flexibility, security, and future-readiness.

## Features
- **Backend Server**: Built with NestJS based on the [nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate), providing scalable and secure APIs for IoT device management and data processing.
- **Database**: Utilizes PostgreSQL for structured data storage, MongoDB for flexible, unstructured data, and Redis for high-performance caching and real-time data handling.
- **MQTT Integration**: Employs Mosquitto as the MQTT broker for real-time communication between IoT devices and the server.
- **Security**: Implements TLS 1.3 for data transmission, AES-256 for data storage, and adheres to OWASP Top 10 to mitigate common security vulnerabilities.
- **Scalability**: Supports at least 1,000 concurrent device connections with API response times under 300ms and 99.9% uptime.
- **Extensibility**: Designed to integrate emerging technologies like edge AI and support diverse IoT devices.

## Project Goals
- Create a comprehensive open-source platform to connect developers, IoT devices, and data management systems.
- Enable rapid IoT project deployment, minimizing integration efforts.
- Provide user-friendly tools for developers, particularly students and startups, to prototype and build IoT applications.
- Enhance IoT system reliability and flexibility through advanced technologies and optimized communication protocols.

## Objectives
- Develop a fully integrated backend with NestJS, PostgreSQL, MongoDB, Redis, and Mosquitto, enabling project initialization with a single command.
- Ensure high compatibility with embedded devices like ESP32/ESP8266 through a dedicated C++ library.
- Optimize developer experience with a secure, scalable, and easy-to-use backend system.
- Support extensibility for future integrations, such as advanced IoT security and diverse device compatibility.

## Success Criteria
- Developers can initialize and deploy IoT projects with a single command, receiving rapid system feedback.
- The platform operates reliably with no critical failures during development or deployment.
- Backend APIs respond within 300ms under normal conditions, with 99.9% uptime.
- Achieves at least 75% successful IoT project deployments within six months of launch, based on developer and tester feedback.
- Budget adherence: Total development cost not exceeding 300 million VND, with monthly operational costs under 8 million VND.

## Installation
### Prerequisites
- Node.js (v16 or higher)
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
   cp .env.docker.example .env
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
   cp .env.dev.example .env
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
- **Deployment**: Compatible with cloud platforms (AWS, Google Cloud) or local servers
- **Security**: TLS 1.3, AES-256, OWASP compliance
- **Monitoring**: Prometheus, Grafana

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

FastIoT is developed as part of a project at the University of Information Technology, VNU-HCM. Join us in building a robust and accessible IoT development platform! 🌟