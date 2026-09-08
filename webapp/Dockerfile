## Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /workspace

# If pom.xml is in webapp/
COPY webapp/pom.xml ./webapp/pom.xml
COPY webapp/src ./webapp/src

# Copy frontend from root-level frontend/
COPY frontend ./frontend

WORKDIR /workspace/webapp

# Build Spring Boot jar (backend + frontend build via frontend-maven-plugin)
ARG APP_PROFILE=dev
RUN mvn -B -ntp -DskipTests clean package -P${APP_PROFILE}

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-alpine
ENV TZ=Asia/Ho_Chi_Minh
WORKDIR /app

COPY --from=build /workspace/webapp/target/base-application-webapp-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
