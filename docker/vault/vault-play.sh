#!/bin/sh

#vault -autocomplete-install -v
#complete -C /bin/vault vault

vault server -config=/vault/config/vault.json

# Административа
export VAULT_ADDR=http://127.0.0.1:8200
vault operator init -key-shares=1 -key-threshold=1
vault operator unseal $(cat /vault/file/unseal)
vault login $(cat /vault/file/token)

#vault secrets enable -path="kv1" kv
#vault secrets enable -path="kv2" kv2

#vault kv put kv1/ssh takis="$(cat id_rsa)"
