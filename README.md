# Base Application

Full-stack Spring Boot 3 + React application, packaged as a single JAR and deployed on Ubuntu with Docker Compose.

Nginx listens on ports **80** and **443** and reverse-proxies traffic to the Spring Boot app on port **8080**. The React production build is copied into the JAR during the Maven build.

---

## What you need

- An Ubuntu **22.04** or **24.04** LTS server with sudo access
- At least **2 GB RAM** and **20 GB** disk
- A domain name pointing to the server public IP (required for HTTPS)
- Ports **80** and **443** open in the cloud firewall (and in UFW)

---

## 1. Prepare the Ubuntu server

SSH into the server and update packages:

```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl git openssl ufw
```

Set the hostname if you have not already:

```bash
sudo hostnamectl set-hostname your-server
```

### Firewall

Allow SSH, HTTP, and HTTPS, then enable UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### DNS

Create an **A** record for your domain (for example `app.example.com`) that points to the server public IP. Wait until it resolves before enabling Let's Encrypt:

```bash
dig +short app.example.com
curl -s https://api.ipify.org
```

Both values should match.

---

## 2. Install Docker Engine and Compose

Official Docker packages (not the Ubuntu `docker.io` package):

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

Enable Docker and allow your user to run it without `sudo`:

```bash
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Log out and back in, then verify:

```bash
docker --version
docker compose version
```

---

## 3. Get the application code

```bash
sudo mkdir -p /opt/base-app
sudo chown "$USER":"$USER" /opt/base-app
cd /opt/base-app
git clone <YOUR_REPOSITORY_URL> .
```

If the repo is already on the server, copy the project into `/opt/base-app` instead.

Create directories that Docker Compose mounts:

```bash
mkdir -p logs/nginx logs/webapp config lego_certs namecheap_certs lego_webroot
```

---

## 4. Configure environment variables

Create `/opt/base-app/.env` (do not commit this file):

```bash
cd /opt/base-app
cat > .env <<EOF
# Spring profile used at image build and runtime
SPRING_PROFILES_ACTIVE=prod

# Domain used by Nginx and Let's Encrypt (no https:// prefix)
LEGO_DOMAIN=app.example.com
LEGO_EMAIL=admin@example.com
IS_LET_ENCRYPT=true

# JWT signing secret (generate a unique value)
JWT_SECRET=$(openssl rand -hex 32)

# Optional: MySQL (only used after you switch application.yml off H2)
DB_HOST=
DB_PORT=3306
DB_NAME=base_db
DB_USERNAME=
DB_PASSWORD=

# Optional integrations
APP_MAIL_USERNAME=
APP_MAIL_PASSWORD=
NO_REPLY_MAIL=
GOOGLE_CLIENT_ID=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
ANTHROPIC_API_KEY_NOVAGENT=
EOF
```

Replace `LEGO_DOMAIN` and `LEGO_EMAIL` with your real domain and contact email.

Generate a JWT secret by hand if you prefer:

```bash
openssl rand -hex 32
```

| Variable | Purpose |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | Maven/Docker profile. Use `prod` on the server. |
| `LEGO_DOMAIN` | Public hostname. Leave empty to run HTTP only (no TLS). |
| `LEGO_EMAIL` | Email for Let's Encrypt registration. |
| `IS_LET_ENCRYPT` | `true` for Let's Encrypt via lego. `false` to use certificates in `namecheap_certs/`. |
| `JWT_SECRET` | Secret used to sign JWT tokens. Required in production. |

The app ships with **H2 in-memory** database by default. Data is lost when the container restarts. To use MySQL, update `webapp/src/main/resources/application.yml` to a MySQL datasource, then fill `DB_*` in `.env`.

---

## 5. Deploy with Docker Compose

From `/opt/base-app`:

```bash
docker compose up -d --build
```

This builds two images and starts two containers:

| Service | Container | Role |
| --- | --- | --- |
| `nginx` | `app-nginx` | Reverse proxy, TLS, ports 80 and 443 |
| `app` | `base-structure-app` | Spring Boot + embedded React UI |

Check status:

```bash
docker compose ps
docker compose logs -f --tail=100
```

Health check (HTTP, before TLS is ready):

```bash
curl -sf http://127.0.0.1/health
```

Expected response includes application status. After DNS and Let's Encrypt succeed, open:

```text
https://app.example.com
```

### Default login

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `password123` |
| User | `user` | `password123` |

Change these immediately after the first login.

---

## 6. HTTPS

### Let's Encrypt (default)

With `IS_LET_ENCRYPT=true` and `LEGO_DOMAIN` set:

1. DNS **A** record must already point at this server.
2. Port **80** must be reachable from the internet (HTTP-01 challenge).
3. On first start, the Nginx container obtains a certificate with [lego](https://go-acme.github.io/lego/) and stores it in `lego_certs/`.
4. Certificates are checked for renewal on startup and every 7 days.

If issuance fails, inspect Nginx logs:

```bash
docker compose logs nginx
```

Common causes: DNS not propagated, port 80 blocked, or `LEGO_DOMAIN` includes `https://`.

### Commercial / Namecheap certificates

1. Place files in `namecheap_certs/`:
   - `${LEGO_DOMAIN}.crt`
   - `${LEGO_DOMAIN}.key`
   - `${LEGO_DOMAIN}.ca-bundle`
2. Set `IS_LET_ENCRYPT=false` in `.env`.
3. Recreate Nginx:

```bash
docker compose up -d --force-recreate nginx
```

### HTTP only (no domain yet)

Leave `LEGO_DOMAIN` empty. Nginx serves HTTP on port 80 and does not request certificates.

---

## 7. Day-to-day operations

| Task | Command |
| --- | --- |
| View logs | `docker compose logs -f app nginx` |
| Restart | `docker compose restart` |
| Stop | `docker compose down` |
| Rebuild after code change | `git pull && docker compose up -d --build` |
| Container status | `docker compose ps` |
| App logs on disk | `logs/webapp/` |
| Nginx logs on disk | `logs/nginx/` |

Spring Boot logs are also written to `./logs/webapp` via the volume in `docker-compose.yml`.

---

## 8. Automated install script (optional)

`install.sh` installs Docker, creates a `.env` if missing, optionally registers a GitHub Actions runner, then runs `docker compose up -d --build`.

Run as root from a copy of this repository that already lives in `/opt/base-app`, or copy the script there first:

```bash
sudo bash install.sh
```

The script expects `/opt/base-app` as the application directory. If you use the GitHub Actions runner section, set these before running:

- `GITHUB_REPO`
- `GITHUB_ACTIONS_TOKEN`
- `GITHUB_ACTIONS_HASH`

For a first production deploy, the manual Docker steps in sections 2–5 are enough.

---

## API

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/health` | Public |
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/refresh` | Public |
| `GET` | `/api/user` | USER or ADMIN |
| `GET` | `/api/admin` | ADMIN |

---

## Local development (not Ubuntu production)

Backend:

```bash
cd webapp
mvn spring-boot:run
```

Backend: http://localhost:8080

Frontend (Vite, proxies `/api` to 8080):

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

Single JAR (frontend built into `static/`):

```bash
cd webapp
mvn clean package -Pdev
java -jar target/base-application-webapp-1.0.0.jar
```

---

## Project layout

```text
.
├── docker-compose.yml          # Nginx + Spring Boot services
├── install.sh                  # Optional Ubuntu installer
├── frontend/                   # React + Vite
├── webapp/                     # Spring Boot 3 (Java 21)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/resources/
│       └── application.yml
└── nginx-docker/               # Nginx image, SSL entrypoint, configs
```

---

## Troubleshooting

**Containers exit immediately**

```bash
docker compose logs app
docker compose logs nginx
```

Confirm `.env` exists and `JWT_SECRET` is set.

**`/health` fails**

Wait for the first Maven build inside Docker (several minutes). Then:

```bash
docker compose ps
curl -v http://127.0.0.1/health
```

**HTTPS not issued**

- Confirm DNS A record
- Confirm `ufw` and the cloud security group allow 80/443
- Confirm `LEGO_DOMAIN` is a hostname only (`app.example.com`, not `https://app.example.com`)

**Permission denied talking to Docker**

Log out and back in after `usermod -aG docker`, or use `sudo docker compose ...`.
