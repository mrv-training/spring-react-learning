#!/bin/bash
set -e

# Generate random secrets
generate_secret() {
  openssl rand -hex "$1"
}


# Create .env file (only if not exists and don't overwrite existing config)
if [ -f .env ]; then
  echo -e "${GREEN}.env existed, keep current configurations.${NC}"
else
  JWT_SECRET=$(generate_secret 32)
  ENCRYPTION_KEY=$(generate_secret 16)
  DB_PASSWORD=$(generate_secret 16)

  # Create .env from template
  cat > .env <<EOF
# Server Settings
SERVER_PORT=8080
SERVER_HOST=0.0.0.0
SPRING_PROFILES_ACTIVE=prod

# Database Settings
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=dbuser
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=base_db

# Security Settings
JWT_SECRET=${JWT_SECRET}

# SSL/Domain Settings
LEGO_DOMAIN=${DOMAIN}
LEGO_EMAIL=admin@example.com
EOF
  echo -e "${GREEN}.env created from template.${NC}"
fi

source .env

# Configuration
WORKSPACE_DIR="/opt/base-app"
ACTIONS_RUNNER_DIR="/opt/actions-runner"
DOMAIN="https://${LEGO_DOMAIN:-example.com}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}       Base Application Installer       ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run with root (sudo)${NC}"
  exit 1
fi

# Detect OS
detect_os() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_ID="$ID"
    OS_ID_LIKE="$ID_LIKE"
  else
    OS_ID="unknown"
    OS_ID_LIKE=""
  fi
}

# Install Docker
install_docker() {
  if command -v docker &> /dev/null; then
    echo -e "${GREEN}Docker Installed.${NC}"
    return
  fi

  detect_os
  echo -e "${YELLOW}Installing Docker for ${OS_ID}...${NC}"

  case "$OS_ID" in
    ubuntu|debian)
      apt-get update -qq
      apt-get install -y -qq ca-certificates curl gnupg
      install -m 0755 -d /etc/apt/keyrings
      curl -fsSL "https://download.docker.com/linux/${OS_ID}/gpg" | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
      chmod a+r /etc/apt/keyrings/docker.gpg
      echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${OS_ID} $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
      apt-get update -qq
      DEBIAN_FRONTEND=noninteractive apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
      ;;
    centos|rhel|rocky|almalinux|ol)
      yum install -y yum-utils
      yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
      yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
      ;;
    amzn)
      # Amazon Linux 2
      amazon-linux-extras install docker -y 2>/dev/null || yum install -y docker
      # Docker Compose plugin
      mkdir -p /usr/local/lib/docker/cli-plugins
      curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-compose
      chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
      ;;
  esac

  systemctl enable docker 2>/dev/null || true
  systemctl start docker 2>/dev/null || true
  echo -e "${GREEN}Installed Docker successfully!.${NC}"
}

# Install Docker Compose plugin if not present
install_compose() {
  if docker compose version &> /dev/null; then
    return
  else
   echo -e "${GREEN}Docker Compose installed!.${NC}"
  fi

  echo -e "${YELLOW}Installing Docker Compose plugin...${NC}"

  # Try package manager first
  detect_os
  case "$OS_ID" in
    ubuntu|debian)
      DEBIAN_FRONTEND=noninteractive apt-get install -y -qq docker-compose-plugin 2>/dev/null && return
      ;;
    centos|rhel|rocky|almalinux|ol|fedora)
      yum install -y docker-compose-plugin 2>/dev/null && return
      ;;
  esac

  # Fallback: download binary
  COMPOSE_URL="https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)"
  mkdir -p /usr/local/lib/docker/cli-plugins
  curl -fsSL "$COMPOSE_URL" -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

  if docker compose version &> /dev/null; then
    echo -e "${GREEN}Installed Docker Compose successfully.${NC}"
  else
    echo -e "${RED}Can not install Docker Compose. Please try again manually.${NC}"
    exit 1
  fi
}

# Main
install_docker
install_compose

# Create directory
echo -e "${YELLOW}Creating $WORKSPACE_DIR...${NC}"
mkdir -p "$WORKSPACE_DIR"
cd "$WORKSPACE_DIR"

mkdir -p "$ACTIONS_RUNNER_DIR"
cd "$ACTIONS_RUNNER_DIR"

install_github_actions_runner() {

  # Wait for health
  echo ""
  echo -e "${YELLOW}Installing Github Actions Runner...${NC}"
  echo -e "${YELLOW}Path: ${ACTIONS_RUNNER_DIR}${NC}"
  echo -e "${YELLOW}Github Repository: ${GITHUB_REPO}${NC}"
  echo -e "${YELLOW}Hash: ${GITHUB_ACTIONS_HASH}${NC}"
  echo -e "${YELLOW}Token: ${GITHUB_ACTIONS_TOKEN}${NC}"

  # Download the latest runner package
  echo -e "${YELLOW}Downloading actions-runner package and installing...${NC}"
  curl -o actions-runner-linux-x64-2.333.1.tar.gz -L https://github.com/actions/runner/releases/download/v2.333.1/actions-runner-linux-x64-2.333.1.tar.gz
  
  # Optional: Validate the hash
  echo -e "${GITHUB_ACTIONS_HASH}  actions-runner-linux-x64-2.333.1.tar.gz" | shasum -a 256 -c

  tar xzf ./actions-runner-linux-x64-2.333.1.tar.gz

  if id "github" &>/dev/null; then
    echo "User 'github' already exists"
  else
    # Add github user
    sudo adduser --disabled-password --gecos "" github
  fi

  # Assign permission
  sudo usermod -aG docker github

  cd /opt
  # Assign permission
  sudo chown -R github:github actions-runner
  
  sudo -u github bash <<EOF
cd "$ACTIONS_RUNNER_DIR"
echo "Creating the runner and start the configuration experience..."
./config.sh --url ${GITHUB_REPO} --token ${GITHUB_ACTIONS_TOKEN} --unattended --labels ${SPRING_PROFILES_ACTIVE:-prod}
exit
EOF

  cd "$ACTIONS_RUNNER_DIR"

  # Install service to run actions-runner event listener in background
  echo "Installing service to run actions-runner event listener in background"
  sudo ./svc.sh install
  sudo ./svc.sh start

  # Verify status
  sudo ./svc.sh status > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Installed Github Actions Runner Service successfully.${NC}"
    echo ""
  else
    echo -e "${RED}Start Github Actions Runner Service failed${NC}"
  fi
}

# Verify status
cd "$ACTIONS_RUNNER_DIR"
if sudo ./svc.sh status > /dev/null 2>&1; then
  echo -e "${GREEN}Github Actions Runner Service installed!${NC}"
else
  install_github_actions_runner
fi

# Pull and start services
echo -e "${YELLOW}Starting web application...${NC}"
cd "$WORKSPACE_DIR"
docker compose up -d --build

# Wait for health
echo ""
echo -e "${YELLOW}Waiting services...${NC}"

for i in {1..30}; do
  if curl -sf http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}Web Application activated!${NC}"
    break
  fi
  sleep 2
done

# If service still not responding
if ! curl -sf http://localhost/health > /dev/null 2>&1; then
  echo -e "${RED}Service failed to start after 60 seconds!${NC}"
  exit 1
fi

IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
EXTERNAL_IP=$(curl -s https://api.ipify.org)

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Install Web Application Successfully! ${NC}"
echo -e "${GREEN}  URL: ${DOMAIN}                        ${NC}"
echo -e "${GREEN}  IP: ${EXTERNAL_IP}                    ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
