#!/bin/sh

if [ -f /vault/config/vault.json ]; then
    echo "Found vault config file"
else
    cp /init/config/vault.json /vault/config
    echo "Initialized vault config"
fi

echo "Starting vault server ..."
exec vault server -config=/vault/config/vault.json
