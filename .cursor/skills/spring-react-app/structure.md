# Required project structure

Create every path below. Do not add a root `pom.xml` or a `backend/` directory.

```text
.
├── .gitignore
├── README.md
├── docker-compose.yml
├── install.sh
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── favicon.png
│   │   └── logo.png
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── components/
│       │   ├── AdminRoute.jsx
│       │   ├── AppHeader.jsx
│       │   ├── AppHeader.css
│       │   ├── AppLogo.jsx
│       │   ├── ImageLightbox.jsx
│       │   ├── ImageLightbox.css
│       │   ├── ProductThumb.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── CategoryForm.jsx
│       │   ├── CategoryList.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Dashboard.css
│       │   ├── Login.jsx
│       │   ├── Login.css
│       │   ├── ProductDetail.jsx
│       │   ├── ProductForm.jsx
│       │   ├── ProductList.jsx
│       │   └── Products.css
│       └── utils/
│           ├── axios.js
│           └── productImage.js
├── nginx/
│   └── default.conf
├── nginx-docker/
│   ├── Dockerfile.nginx
│   ├── nginx.conf
│   ├── nginx-ssl.conf
│   ├── nginx-ssl-namecheap.conf
│   └── ssl-entrypoint.sh
└── webapp/
    ├── Dockerfile
    ├── pom.xml
    └── src/main/
        ├── java/com/base/
        │   ├── BaseApplication.java
        │   ├── config/
        │   │   ├── JwtConfig.java
        │   │   ├── JwtUtil.java
        │   │   ├── SecurityConfig.java
        │   │   └── WebConfig.java
        │   ├── controller/
        │   │   ├── ApiController.java
        │   │   ├── AuthController.java
        │   │   ├── CategoryController.java
        │   │   ├── HealthController.java
        │   │   ├── ProductController.java
        │   │   ├── RestExceptionHandler.java
        │   │   ├── SpaController.java
        │   │   └── UploadController.java
        │   ├── dto/
        │   │   ├── CategoryRequestDto.java
        │   │   ├── CategoryResponseDto.java
        │   │   ├── LoginRequestDto.java
        │   │   ├── LoginResponseDto.java
        │   │   ├── PageResponseDto.java
        │   │   ├── ProductRequestDto.java
        │   │   ├── ProductResponseDto.java
        │   │   └── RefreshTokenRequestDto.java
        │   ├── entity/
        │   │   ├── CategoryEntity.java
        │   │   ├── ProductEntity.java
        │   │   ├── RefreshTokenEntity.java
        │   │   └── UserEntity.java
        │   ├── filter/
        │   │   └── JwtAuthenticationFilter.java
        │   ├── repository/
        │   │   ├── CategoryRepository.java
        │   │   ├── ProductRepository.java
        │   │   ├── RefreshTokenRepository.java
        │   │   └── UserRepository.java
        │   └── service/
        │       ├── CategoryService.java
        │       ├── ProductService.java
        │       ├── RefreshTokenService.java
        │       └── UserService.java
        └── resources/
            ├── application.yml
            └── data.sql
```

## Compose contract

Services: `nginx` (build `nginx-docker/Dockerfile.nginx`, ports 80/443) and `app` (build `webapp/Dockerfile`).

`app` environment (from `.env`):

```text
SPRING_PROFILES_ACTIVE
SERVER_PORT=8080
DB_HOST DB_PORT DB_NAME DB_USERNAME DB_PASSWORD
JWT_SECRET
APP_MAIL_USERNAME APP_MAIL_PASSWORD NO_REPLY_MAIL
GOOGLE_CLIENT_ID FACEBOOK_APP_ID FACEBOOK_APP_SECRET
DOMAIN_NAME=https://${LEGO_DOMAIN}
ANTHROPIC_API_KEY
```

`nginx` environment: `LEGO_DOMAIN`, `LEGO_EMAIL`, `IS_LET_ENCRYPT`.

## Dockerfile contract

`webapp/Dockerfile`:

1. `maven:3.9.6-eclipse-temurin-21` — copy `webapp/pom.xml`, `webapp/src`, `frontend/`
2. `WORKDIR /workspace/webapp` then `mvn -B -ntp -DskipTests clean package -P${APP_PROFILE}`
3. Runtime `eclipse-temurin:21-jre-alpine`, copy the built JAR to `app.jar`, `EXPOSE 8080`

`nginx-docker/Dockerfile.nginx`:

1. Copy lego binary from `goacme/lego:latest`
2. Base `nginx:1.27-alpine`
3. Copy `nginx.conf` plus SSL templates and `ssl-entrypoint.sh`

`ssl-entrypoint.sh`:

- No `LEGO_DOMAIN` → `nginx` HTTP mode
- `IS_LET_ENCRYPT=true` → obtain/renew cert with lego HTTP-01, then nginx
- Else render Namecheap SSL template (`/etc/certs/`)

## application.yml minimum

```yaml
spring:
  application:
    name: product-management-application
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  h2.console:
    enabled: true
    path: /h2-console
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate.ddl-auto: update
    defer-datasource-initialization: true
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 5MB

jwt:
  secret: <generate, do not reuse repo secret in new apps>
  access-token-validity: 900000
  refresh-token-validity: 86400000

server:
  port: 8080
```

Comment a PostgreSQL/MySQL switch block; do not enable it by default.

## Vite proxy

```js
proxy: {
  '/api': { target: 'http://localhost:8080', changeOrigin: true },
  '/uploads': { target: 'http://localhost:8080', changeOrigin: true },
}
```

## .gitignore minimum

Ignore `target/`, `frontend/node_modules/`, `frontend/dist/`, `uploads/`, IDE files, `*.log`, `*.jar`, `.env`.
