# AI Marketing Brief

Full-stack application with Spring Boot 3 backend and React + Vite frontend.

## Features

- **Backend (Spring Boot 3)**
  - JWT access token + refresh token authentication
  - Spring Security 6 (stateless)
  - Role-based access control (ADMIN, USER)
  - H2 database (dev) with easy DB switch configuration
  - React embedded under resources/static
  - SPA fallback controller
  - Single runnable JAR

- **Frontend (React + Vite)**
  - Login page
  - Axios interceptor with auto refresh-token handling
  - Role-based UI guards
  - Production build copied into Spring Boot

## Quick Start

### Development

1. **Backend:**
   ```bash
   mvn spring-boot:run
   ```
   Backend runs on http://localhost:8080

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on http://localhost:5173

### Production Build

```bash
mvn clean package
java -jar target/ai-marketing-brief-1.0.0.jar
```

The Maven build will:
1. Install Node.js and npm
2. Build the React frontend
3. Copy the frontend build to Spring Boot static resources
4. Create a single runnable JAR

## Default Credentials

- **Admin:** username: `admin`, password: `password123`
- **User:** username: `user`, password: `password123`

## API Endpoints

- `POST /api/auth/login` - Login endpoint
- `POST /api/auth/refresh` - Refresh token endpoint
- `GET /api/user` - User endpoint (requires USER or ADMIN role)
- `GET /api/admin` - Admin endpoint (requires ADMIN role)

## Database Configuration

The application uses H2 in-memory database by default. To switch to PostgreSQL or another database, update `src/main/resources/application.yml`.

## Project Structure

```
ai-marketing-brief/
├── backend/
│	├── src/
│	│   └── main/
│	│       ├── java/
│	│       │   └── com/example/aimarketingbrief/
│	│       │       ├── config/          # Security, JWT config
│	│       │       ├── controller/      # REST controllers
│	│       │       ├── dto/             # Data transfer objects
│	│       │       ├── entity/          # JPA entities
│	│       │       ├── filter/          # JWT filter
│	│       │       ├── repository/      # JPA repositories
│	│       │       └── service/         # Business logic
│	│       └── resources/
│	│           ├── static/              # React build output (generated)
│	│           └── application.yml      # Application configuration
├── frontend/                        # React + Vite application
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── context/                 # Auth context
│   │   ├── pages/                   # Page components
│   │   └── utils/                   # Axios configuration
│   └── package.json
└── pom.xml                          # Maven configuration
```


