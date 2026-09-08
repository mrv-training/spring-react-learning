#!/bin/sh
set -e

# If LEGO_DOMAIN is not set, run nginx in plain HTTP mode (development)
if [ -z "$LEGO_DOMAIN" ]; then
    echo "[ssl-entrypoint] LEGO_DOMAIN not set, running in HTTP mode."
    exec nginx -g "daemon off;"
fi

# --- SSL mode ---
DOMAIN="$LEGO_DOMAIN"

# Choose template based on SSL type
if [ "$IS_LET_ENCRYPT" = "true" ]; then
  TEMPLATE=/etc/nginx/templates/nginx-ssl.conf
else
  TEMPLATE=/etc/nginx/templates/nginx-ssl-namecheap.conf
fi

# Render config with envsubst
envsubst '${LEGO_DOMAIN}' < "$TEMPLATE" > /etc/nginx/conf.d/default.conf

# 4. Debug (optional but useful)
echo "===== Generated Nginx Config ====="
cat /etc/nginx/conf.d/default.conf

generate_let_encrypt_ssl() {

  EMAIL="${LEGO_EMAIL:-admin@example.com}"
  LEGO_DATA="/etc/lego"
  CERT_DIR="${LEGO_DATA}/certificates"
  CERT_FILE="${CERT_DIR}/${DOMAIN}.crt"
  ACME_DIR="/var/www/acme"

  mkdir -p "$ACME_DIR"

  # Obtain certificate if it doesn't exist yet
  if [ ! -f "$CERT_FILE" ]; then
      echo "[ssl-entrypoint] Obtaining certificate for ${DOMAIN}..."
      lego --accept-tos \
           --email="$EMAIL" \
           --domains="$DOMAIN" \
           --path="$LEGO_DATA" \
           --http \
           --http.port ":80" \
           run
      echo "[ssl-entrypoint] Certificate obtained."
  else
      # Attempt renewal on startup in case cert is near expiry
      echo "[ssl-entrypoint] Checking certificate renewal on startup..."
      lego --accept-tos \
           --email="$EMAIL" \
           --domains="$DOMAIN" \
           --path="$LEGO_DATA" \
           --http \
           --http.webroot "$ACME_DIR" \
           renew --days 30 || true
  fi

  # Background renewal loop (every 7 days, renew if <30 days remaining)
  (
      while true; do
          sleep 604800
          echo "[ssl-entrypoint] Attempting certificate renewal..."
          if lego --accept-tos \
                  --email="$EMAIL" \
                  --domains="$DOMAIN" \
                  --path="$LEGO_DATA" \
                  --http \
                  --http.webroot "$ACME_DIR" \
                  renew --days 30; then
               echo "[ssl-entrypoint] Reloading nginx with new certificate..."
              nginx -s reload
          fi
     done
  ) &
}

if [ "$IS_LET_ENCRYPT" = "true" ]; then
 generate_let_encrypt_ssl
fi

exec nginx -g "daemon off;"
