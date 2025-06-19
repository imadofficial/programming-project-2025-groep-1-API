# Programming Project 2025 – API

This repository contains the backend API code for our Programming Project 2025. The API is built with Node.js and Express, and serves as the backend for the EHB Match platform, enabling features such as user authentication, company and student management, speeddates, skills, opleidingen, and more.

## Features
- User authentication (JWT-based)
- Company (bedrijf) and student management
- Speeddates scheduling and management
- Skills and functions assignment
- Opleidingen (educational programs) management
- Profile photo upload and management
- Admin and role-based access control
- RESTful API endpoints

## Getting Started

### Prerequisites
- Node.js (v20 or higher required)
- MySQL database

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

## Documentation

Full API documentation is available at:

👉 [https://api.ehb-match.me](https://api.ehb-match.me)

This documentation includes all available endpoints, request/response formats, authentication requirements, and example usage.

## Project Structure
- `src/` – Main source code (routes, SQL modules, authentication, etc.)
- `docs/` – OpenAPI/Swagger documentation and related files
- `data/` – Example data files
- `readme.md` – This file

## Contributing
Contributions are welcome! Please open an issue or submit a pull request if you have suggestions or improvements.

## Sources & References
- GitHub Copilot (AI code assistance)
- [W3Schools](https://www.w3schools.com)
- [UploadThing Documentation](https://docs.uploadthing.com/)
- [Express.js Documentation](https://expressjs.com)
- [Swagger/OpenAPI Documentation](https://swagger.io/docs/)

---
Made with ❤️ by us.

© 2025 Programming Project Group 1 – EhB-Match.me
