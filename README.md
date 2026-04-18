# CloudWise - Cloud File Organizer

CloudWise is a full-stack cloud file management system with AI-assisted categorization, secure file transfers, and an admin console for operational control. The project includes a Spring Boot backend and a Vite/React frontend.

## Features
- Secure file upload and download with AWS S3 storage
- AI-assisted file categorization and summaries
- Search and filtering across stored files
- Secure transfer sessions with PIN verification
- Admin console for user governance, storage limits, and platform settings

## Repository Structure
- backend: Spring Boot API, security, data models, and integrations
- frontend: Vite + React application and UI components

## Tech Stack
- Backend: Java 17, Spring Boot, Spring Security, JPA/Hibernate, PostgreSQL
- Frontend: React, Vite, Tailwind CSS
- Storage: AWS S3
- AI: Google Gemini API

## Getting Started

### Prerequisites
- Java 17
- Node.js 18+
- PostgreSQL

### Environment Variables
Create environment files for each app. Do not commit secrets.

Backend example (backend/.env):
- DB_URL
- DB_USERNAME
- DB_PASSWORD
- SERVER_PORT
- APP_BASE_URL
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- AWS_S3_BUCKET_NAME
- GEMINI_API_KEY
- TRANSFER_PIN_ENCRYPTION_KEY

Frontend example (frontend/.env):
- VITE_API_BASE_URL

### Run Backend
From backend:
1) mvn spring-boot:run

### Run Frontend
From frontend:
1) npm install
2) npm run dev

## Admin Access
The admin panel is available at /admin for users with the ADMIN role. Access is controlled by server-side role checks.

## Notes
- For production, configure secure secrets management and HTTPS.
- Do not store credentials in the repository.

## License
Proprietary - for internal use only.
