# Grant permissions on kv1 engine
path "+/*" {
    capabilities = [ "create", "update", "read", "delete", "list" ]
}

# For Web UI usage
path "kv1/metadata" {
  capabilities = ["list"]
}

# Grant permissions on kv2 engine
path "secret/+/*" {
    capabilities = [ "create", "update", "read", "delete", "list" ]
}

# For Web UI usage
path "secret/metadata" {
  capabilities = ["list"]
}
