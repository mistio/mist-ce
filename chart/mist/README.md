# Mist Helm Chart

This is the mist helm chart.

The following table lists the configurable parameters of the Mist chart and their default values.

|            Parameter              |              Description                                                           |                          Default                        |
| --------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `http.host`                       | FQDN or IP of Mist installation                                                    | `localhost`                                             |
| `http.http2`                      | Use HTTP/2                                                                         | `false`                                                 |
| `http.tlsSecret`                  | Set to `https` for TLS                                                             | `''`                                                    |
| `http.tlsHosts`                   | Bookstack image tag                                                                | `[]`                                                    |
| `http.tlsAnnotations`             | Bookstack image pull policy                                                        | `{}`                                                    |
| `http.tlsClusterIssuer`           | The TLS clusterIssuer CRD                                                          | `''`                                                    |
| `smtp.host`                       | SMTP mail server address                                                           | `''`                                                    |
| `smtp.port`                       | The listen address of the SMTP server                                              | `8025`                                                  |
| `smtp.username`                   | SMTP username                                                                      | `''`                                                    |
| `smtp.password`                   | SMTP password                                                                      | `''`                                                    |
| `smtp.tls`                        | Use TLS with SMTP                                                                  | `false`                                                 |
| `smtp.starttls`                   | If true, will send the starttls command (typically not used with smtp.tls=true)    | `false`                                                 |
| `vault.address`                   | Vault address                                                                      | `http://vault:8200`                                     |
| `vault.token`                     | Authentication token for Vault                                                     | `''`                                                    |
| `vault.roleId`                    | The Vault RoleID                                                                   | `''`                                                    |
| `vault.secretId`                  | The Vault SecretID                                                                 | `''`                                                    |
| `vault.secret_engine_path`        |                                                                                    | `{}`                                                    |
| `vault.clouds_path`               | The default Vault path for Cloud credentials                                       | `mist/clouds/`                                          |
| `vault.keys_path`                 | The default Vault path for Key credentials                                         | `mist/keys`                                             |
| `elasticsearch.host`              | The ElasticSearch host                                                             | `''`                                                    |
| `elasticsearch.port`              | The ElasticSearch port                                                             | `9200`                                                  |
| `elasticsearch.username`          | Username for ElasticSearch with basic auth                                         | `''`                                                    |
| `elasticsearch.password`          | Password for ElasticSearch with basic auth                                         | `''`                                                    |
| `elasticsearch.tls`               | Connect to ElasticSearch using TLS                                                 | `false`                                                 |
| `elasticsearch.verifyCerts`       | Whether or not to verify TLS                                                       | `false`                                                 |
| `influxdb.host`                   | The InfluxDB host                                                                  | `''`                                                    |
| `influxdb.port`                   | Whether or not to verify TLS                                                       | `8086`                                                  |
| `influxdb.db`                     | The InfluxDB database to use                                                       | `telegraf`                                              |
| `influxdb.monitoring`             |                                                                                    | `true`                                                  |
| `victoriametrics.enabled`         |                                                                                    | `true`                                                  |
| `victoriametrics.deploy`          |                                                                                    | `true`                                                  |
| `victoriametrics.readEndpoint`    |                                                                                    | `''`                                                    |
| `victoriametrics.writeEndpoint`   |                                                                                    | `''`                                                    |
| `rabbitmq.deploy`                 |                                                                                    | `true`                                                  |
| `rabbitmq.replicaCount`           |                                                                                    | `true`                                                  |
| `rabbitmq.replicationFactor`      |                                                                                    | `true`                                                  |
| `rabbitmq.auth.username`          |                                                                                    | `true`                                                  |
| `rabbitmq.auth.password`          |                                                                                    | `true`                                                  |
| `rabbitmq.auth.erlangCookie`      |                                                                                    | `true`                                                  |
| `rabbitmqExternal.host`           |                                                                                    | `true`                                                  |
| `rabbitmqExternal.port`           |                                                                                    | `true`                                                  |
| `rabbitmqExternal.username`       |                                                                                    | `true`                                                  |
| `rabbitmqExternal.password`       |                                                                                    | `true`                                                  |
| `mongodb.deploy`                  |                                                                                    | `true`                                                  |
| `mongodb.host`                    |                                                                                    | `true`                                                  |
| `mongodb.port`                    |                                                                                    | `true`                                                  |
| `memcached.host`                  |                                                                                    | `true`                                                  |
| `docker.deploy`                   |                                                                                    | `true`                                                  |
| `docker.host`                     |                                                                                    | `true`                                                  |
| `docker.port`                     |                                                                                    | `true`                                                  |
| `docker.key`                      |                                                                                    | `true`                                                  |
| `docker.cert`                     |                                                                                    | `true`                                                  |
| `docker.ca`                       |                                                                                    | `true`                                                  |
| `monitoring.defaultMethod`        |                                                                                    | `telegraf-influxdb`                                     |
| `auth.email.signup`               |                                                                                    | `true`                                                  |
| `auth.email.signin`               |                                                                                    | `true`                                                  |
| `auth.google.signup`              |                                                                                    | `false`                                                 |
| `auth.google.signin`              |                                                                                    | `false`                                                 |
| `auth.google.key`                 |                                                                                    | `''`                                                    |
| `auth.google.secret`              |                                                                                    | `''`                                                    |
| `auth.github.key`                 |                                                                                    | `''`                                                    |
| `auth.github.secret`              |                                                                                    | `''`                                                    |
| `backup.key`                      |                                                                                    | `''`                                                    |
| `backup.secret`                   |                                                                                    | `''`                                                    |
| `backup.bucket`                   |                                                                                    | `''`                                                    |
| `backup.region`                   |                                                                                    | `''`                                                    |
| `backup.gpg.recipient`            |                                                                                    | `''`                                                    |
| `backup.gpg.public`               |                                                                                    | `''`                                                    |
| `githubBotToken`                  |                                                                                    | `''`                                                    |
