# Map the mist user 
path "secret/data/mist-user/*" {
  capabilities = ["create", "update", "read", "delete"]
}

# 
path "secret/metadata/mist-user/*" {
  capabilities = ["list"]
}

