#!/bin/sh

#vault -autocomplete-install -v
#complete -C /bin/vault vault

apk add vim grep 

vault server -config=/vault/config/vault.json

# Административа
export VAULT_ADDR=http://127.0.0.1:8200
vault operator init -key-shares=1 -key-threshold=1 > /vault/init.log

# Parse thy Unseal from init as env var
export Unseal_Key=$(grep -Po "(?<=^Unseal Key 1: ).*" /vault/init.log)

# Parse thy Root token
export Root_Token=$(grep -Po "(?<=^Initial Root Token: ).*" /vault/init.log)

vault operator unseal $Unseal_Key
vault login $Root_Token

vault secrets enable -path="kv1" kv
#vault secrets enable -path="kv2" kv2

vault policy write mist /vault/policies/vault-mist.hcl 
vault token create -policy=mist \
		   -display-name="mparmpoun" \
		   -id="P4c8WrUdATjnKtBMbiUhs7ji" > /vault/mist-token 
	
vault login "P4c8WrUdATjnKtBMbiUhs7ji"
vault kv put kv1/ssh takis="$(cat id_rsa)"
