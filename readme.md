# Programming Project 2025 – API

This repository contains the backend API code for our Programming Project 2025. The API is built with Node.js and Express, and serves as the backend for the EHB Match platform, enabling features such as user authentication, company and student management, speeddates, skills, opleidingen, and more.

## API Documentation

Full API documentation is available at:

👉 [https://api.ehb-match.me](https://api.ehb-match.me)

This documentation includes all available endpoints, request/response formats, authentication requirements, and example usage.

## Features
- **User authentication (JWT-based):** Secure login, registration, and session management using JSON Web Tokens. Supports both students, companies, and admin users.
- **Company (bedrijf) and student management:** CRUD operations for both user types, including profile updates, deletion, and role-based access control.
- **Speeddates scheduling and management:** Endpoints for creating, accepting, rejecting, and listing speeddates between students and companies.
- **Skills and functions assignment:** Assign, update, and remove skills and job functions (functies) for users. Bulk assignment supported.
- **Opleidingen (educational programs) management:** Manage educational programs, link them to users and companies, and update or remove as needed.
- **Profile photo upload and management:** Upload, update, and delete profile photos with file type/size validation, anonymized filenames, and automatic cleanup of unused files.
- **Admin and role-based access control:** Fine-grained authorization for sensitive actions (e.g., deleting users, managing companies, approving bedrijven).
- **RESTful API endpoints:** Consistent, well-documented endpoints following REST conventions, with clear error handling and status codes.
- **OpenAPI/Swagger documentation:** Comprehensive, up-to-date API documentation for all endpoints, request/response formats, and authentication requirements.
- **Automated cleanup scripts:** Background jobs for cleaning up unused temporary profile photos and other maintenance tasks.

## Security

Security is a top priority in this project. Key security measures include:
- **Password Hashing:** All user passwords are securely hashed using bcrypt before being stored in the database. Plaintext passwords are never saved.
- **JWT Authentication:** All protected endpoints require a valid, signed JWT access token. Tokens are short-lived and can be refreshed securely.
- **Role-Based Access Control:** Only authorized users (resource owners or admins) can perform sensitive actions. Middleware enforces these checks throughout the API.
- **Input Validation:** All user input is validated and sanitized. SQL queries use parameterized statements to prevent SQL injection.
- **File Upload Restrictions:** Only web-friendly image types (JPEG, PNG, GIF) are accepted for profile photos, with a strict 2MB size limit. Filenames are anonymized to prevent enumeration and privacy leaks.
- **Environment Variables:** Sensitive configuration (database credentials, JWT secrets, etc.) is managed via environment variables and never hardcoded.
- **CORS Policy:** Only trusted origins are allowed to access the API, reducing the risk of cross-origin attacks.
- **Error Handling:** The API never leaks sensitive error details to clients. All errors are logged server-side for auditing and debugging.

## Getting Started

### Prerequisites
- Node.js (v20 or higher required)
- MySQL database (with required tables)

### Installation
1. Clone this repository:
   ```sh
   git clone <repo-url>
   cd programming-project-2025-groep-1-API
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure your environment variables in a `.env` file (see `.env.example` if available).
4. Set up your MySQL database and update the connection settings as needed.
5. Start the server:
   ```sh
   npm start
   ```

### Project Structure
- `src/` – Main source code (Express routes, SQL modules, authentication, middleware, etc.)
  - `routes/` – Express route handlers for API endpoints (bedrijven, studenten, user, speeddates, etc.)
  - `auth/` – Authentication and authorization logic (JWT, local strategy, middleware)
  - `sql/` – Database access modules for all entities (users, bedrijven, studenten, skills, functies, opleidingen, etc.)
  - `modules/` – Utility modules and background scripts (e.g., temp profile photo cleanup)
- `docs/` – OpenAPI/Swagger documentation and related files
- `data/` – Example data files (JSON)
- `readme.md` – This file

## Key Concepts & Best Practices

- **Authentication:**
  - All protected endpoints require a valid JWT access token in the `Authorization` header: `Bearer <token>`.
  - Use the `/auth/login` endpoint to obtain tokens. Refresh tokens are managed via cookies.
- **Authorization:**
  - Only the owner of a resource or an admin can modify or delete it (enforced via middleware such as `canEdit`, `canEditProfilePicture`, and `authAdmin`).
  - Company approval is required before login is allowed for bedrijf users.
- **Profile Photo Management:**
  - Only JPEG, PNG, and GIF files up to 2MB are accepted. Filenames are anonymized for privacy.
  - Uploaded photos are stored temporarily until linked to a user. Unused temp photos are cleaned up automatically.
  - Only the linked user or an admin can delete a profile photo if it is in use.
- **Bulk Assignment:**
  - Skills and functions can be assigned in bulk using array-based endpoints. Bulk inserts use efficient SQL with dynamic placeholders.
- **Error Handling:**
  - Consistent use of HTTP status codes: 401 for authentication errors, 403 for forbidden actions, 404 for not found, 400 for validation errors, and 500 for server errors.
- **Database Access:**
  - All SQL queries use parameterized statements to prevent SQL injection.
  - Connection pooling is managed via `getPool` from `globalEntries.js`.
- **OpenAPI/Swagger:**
  - The `docs/openapi.yaml` file is kept up-to-date with all endpoints, request/response schemas, and authentication requirements.


## Sources & References
- GitHub Copilot (AI code assistance)
- [W3Schools](https://www.w3schools.com)
- [UploadThing Documentation](https://docs.uploadthing.com/)
- [Express.js Documentation](https://expressjs.com)
- [Swagger/OpenAPI Documentation](https://swagger.io/docs/)

---
Made with ❤️ by us.

© 2025 Programming Project Group 1 – EhB-Match.me
