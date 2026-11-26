#!/bin/sh
# Picks the HTTPS config when a certificate exists for $DOMAIN, otherwise HTTP-only
# (which still answers ACME challenges so the first certificate can be issued).
# Same for the Payments Desk when $DESK_DOMAIN is set (desk-*.conf.template).
# Re-checks every 6h and reloads, so renewed and newly issued certificates are served.
set -eu
: "${DOMAIN:?DOMAIN must be set}"
DESK_DOMAIN="${DESK_DOMAIN:-}"
export DESK_DOMAIN

render() {
  if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    tpl=https
  else
    tpl=http
  fi
  envsubst '$DOMAIN' < "/etc/nginx/qsofte/$tpl.conf.template" > /etc/nginx/conf.d/site.conf
  echo "qsofte: using $tpl config for $DOMAIN"

  if [ -n "$DESK_DOMAIN" ]; then
    if [ -f "/etc/letsencrypt/live/$DESK_DOMAIN/fullchain.pem" ]; then
      desk=desk-https
    else
      desk=desk-http
    fi
    envsubst '$DESK_DOMAIN' < "/etc/nginx/qsofte/$desk.conf.template" > /etc/nginx/conf.d/desk.conf
    echo "qsofte: using $desk config for $DESK_DOMAIN"
  else
    rm -f /etc/nginx/conf.d/desk.conf
  fi
}

render
(
  while :; do
    sleep 6h
    render && nginx -t && nginx -s reload
  done
) &
exec nginx -g 'daemon off;'
