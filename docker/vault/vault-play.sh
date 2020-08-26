#!/bin/sh

# Constants
VAULT_CONFIG=/vault/config/vault.json
INIT_LOG=/vault/init.log
UNSEAL_TOKEN=/vault/config/unseal_token
#export VAULT_ADDR=http://127.0.0.1:8200

echo "Installing dependencies"
apk add vim grep #socat vault

# TODO: This is problematic
# Exists && Is_Bigger_Than_One
# Creates problem when both are false
if [ -f "$UNSEAL_TOKEN" ]; then

	# Big brain hack
	# socat STDIO 'EXEC:vault operator unseal,PTY' < $UNSEAL_TOKEN
	vault operator unseal $Unseal_Key

else
	echo "Initializing Vault server"
	vault operator init -key-shares=1 -key-threshold=1 > "$INIT_LOG"
	#cat /vault/init.log
	echo "Init success"

	echo "Configuring..."
	# Parse thy Unseal from init as env var
	export Unseal_Key=$(grep -Po "(?<=^Unseal Key 1: ).*" "$INIT_LOG")
	echo "$Unseal_Key" > "$UNSEAL_TOKEN"
	#echo "[HARRY] Token value is $UNSEAL_TOKEN"

	# Parse thy Root token
	export Root_Token=$(grep -Po "(?<=^Initial Root Token: ).*" "$INIT_LOG")

	# Big brain hack
	#echo vault operator unseal $Unseal_Key
	vault operator unseal $Unseal_Key
	vault login $Root_Token

	vault secrets enable -path="kv1" kv
	
	# No need; auto-enabled at /secret/ path
	#vault secrets enable -path="kv2" kv2

	vault policy write mist /vault/policies/vault-mist.hcl
	vault token create -policy=mist \
			   -display-name="mparmpoun" \
		           -id="P4c8WrUdATjnKtBMbiUhs7ji"
fi

echo "Done! Success"

vault login "P4c8WrUdATjnKtBMbiUhs7ji"
vault kv put kv1/ssh takis="psistaria"
