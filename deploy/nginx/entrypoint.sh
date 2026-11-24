#!/bin/sh
# Picks the HTTPS config when a certificate exists for $DOMAIN, otherwise HTTP-only
# (which still answers ACME challenges so the first certificate can be issued).
# Re-checks every 6h and reloads, so renewed certificates are actually served.
set -eu
: "${DOMAIN:?DOMAIN must be set}"

render() {
  if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    tpl=https
  else
    tpl=http
  fi
  envsubst '$DOMAIN' < "/etc/nginx/qsofte/$tpl.conf.template" > /etc/nginx/conf.d/site.conf
  echo "qsofte: using $tpl config for $DOMAIN"
}

render
(
  while :; do
    sleep 6h
    render && nginx -t && nginx -s reload
  done
) &
exec nginx -g 'daemon off;'
