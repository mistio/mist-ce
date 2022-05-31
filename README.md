# Mist Cloud Management Platform - Community Edition

Mist simplifies multicloud management. It offers a unified interface from where you can manage public clouds, private clouds, hypervisors, containers and bare metal servers.

With Mist you can perform common management tasks like provisioning, orchestration, monitoring, automation and cost analysis.

It comes with a [RESTful API](https://mist.io/api/v2) and a [CLI](https://github.com/mistio/mist-cli), so you can easily integrate it into your existing workflows.

Mist users include organizations like Juniper Networks, SevOne, Windstream, National Bank of Greece, Shoprite and more. They all report faster roll-outs while reducing their bills and management overheads by 40%-60%.

Mist Community Edition (CE) is licensed under the Apache License v2. It is ideal for teams with a DIY approach.

Mist Enterprise Edition (EE) and Hosted Service (HS) are commercial editions which offer additional plugins for governance, role-based access control & cost insights. You can check them out on our [website](https://mist.io).

The easiest way to try Mist is to sign up for a 14-day free trial at https://mist.io/sign-up.

<a href="https://www.youtube.com/watch?v=7oYyC-FIaAM" source="_blank"><img src="https://mist.io/landing/images/frontpage/home-dashboard.png" width="768"></a>

## Table of Contents

- [List of features](#features)
- [Basic terms and concepts](#terminology)
- [Mist's architecture](#architecture)
- [How to install Mist](#installation)
  - [On Kubernetes with Helm](#kubernetes)
  - [On a single host with Docker Compose](#single-host)
  - [Local dev environment with Docker Compose](#development-deployment)

## Features

Mist's features include:

- Support for more than 20 infrastructure technologies.
- Instant visibility of all the available resources across clouds, grouped by tags.
- Instant reporting/estimation of the current infrastructure costs.
- Compare current & past costs, correlate with usage, provide right-sizing recommendations (EE & HS only).
- Provision new resources on any cloud including machines, clusters, volumes, networks, zones and DNS records.
- Deploy and scale Kubernetes clusters on any supported cloud.
- Perform lifecycle actions on existing resources, e.g. stop, start, reboot, resize, destroy, etc.
- Upload scripts and run them on any machine while enforcing audit logging and centralized control of SSH keys.
- SSH command shell on any machine within the browser or through the CLI, enforcing audit logging and centralized control of SSH keys.
- Instant audit logging for all actions performed through Mist or detected through continuous polling.
- Monitor machines, display real time system & custom metrics and store them for long term access.
- Set rules on metrics or logs that trigger notifications, webhooks, scripts or lifecycle actions.
- Set schedules that trigger scripts or machine lifecycle actions.
- Set fine-grained access control policies per team, tag, resource and/or action (EE & HS only).
- Set governance constraints: e.g. quotas on cost per user/team, required expiration dates (EE & HS only).
- Upload infrastructure templates that may describe complex deployments and workflows (EE & HS only).

## Terminology

Some terms are used very often in Mist. Below is a list of the most basic ones to help you avoid any confusion:

- **Cloud**. Any service that provides on-demand access to resources, e.g. public clouds, private clouds, hypervisors, container hosts, Kubernetes clusters, bare metal servers, etc.
- **Machine**. Any computing resource. There are many types of machines and some machines may contain other machines.
- **Volume**. Any physical or virtual data storage device, e.g. physical HDD/SSD, cloud disks, EBS volumes etc. Volumes may be attached on machines. Volumes may be provisioned along with machines or independently.
- **Network**. Private network spaces that machines can join, e.g. AWS VPCs.
- **Script**. An executable (e.g. bash script) or an Ansible playbook that can run on machines over SSH. Scripts may be added inline or by a reference to a tarball or a Git repository.
- **Template**. A blueprint that describes the full lifecycle of an application that may require multiple computing resources, network, storage and additional configurations. For example, the provided Kubernetes template enables the deployment of a Kubernetes cluster on any cloud and provides workflows to easily scale the cluster up or down. Currently, Mist supports Cloudify blueprints. Helm and Terraform support is coming soon.
- **Stack**. The deployment of a template is a stack. A stack may include resources (e.g. machines, networks, volumes etc) and provides a set of workflow actions that can be performed. A stack created by the Kubernetes template refers to a Kubernetes cluster. It includes references to all control and data plane nodes. It provides scale up & down workflows that can be applied to the cluster.
- **Tunnel**. A secure, point-to-point VPN tunnel enabling Mist to access infrastructure that is not on a publicly addressable network space.

## Architecture

Mist is a cloud native application split into microservices which are packaged as Docker containers. It can be deployed on a Kubernetes cluster using Helm or a single host with Docker Compose.

The most notable components are the following:

- Mist UI, a web application built with Web Components and Polymer.
- REST API that serves requests from clients.
- WebSocket API, sends real-time updates to connected clients and proxies shell connections.
- Hubshell service, opens SSH connections to machines or shell connections using the Docker API.
- Dramatiq workers, running asynchronous jobs.
- APScheduler based scheduler that schedules polling tasks, rule checks, as well as user defined scheduled actions.
- RabbitMQ message queue service.
- MongoDB as the main database.
- Elasticsearch for storing and searching logs.
- Logstash for routing logs to Elasticsearch.
- Telegraf as a data collection agent, installed on monitored machines.
- Gocky as the relay to receive and pre-process monitoring metrics.
- InfluxDB or VictoriaMetrics as a time series database.

![Architecture.svg](Architecture.svg)

The user interacts with the RESTful Mist API through client apps like the Mist UI in the browser or command line tools (e.g. cURL, Mist CLI, etc.).

The Mist UI, apart from invoking the RESTful API, also establishes a WebSocket connection. This is used to receive real time updates and to proxy shell connections to machines.

The Mist API server interacts with the respective API's of the target clouds, either directly, or by adding tasks that get executed asynchronously by Dramatiq workers. The messaging is following the AMQP protocol and gets coordinated by RabbitMQ.

The main data store is MongoDB. Logs are being stored in Elasticsearch. Time series data go to either VictoriaMetrics or InfluxDB, depending on the installation.

Rule checks, polling tasks & user tasks are triggered by the scheduler service. Whenever a shell connection is required (e.g. SSH, Docker shell, etc.), Sheller establishes the connection and makes it available through the WebSocket API.

## Installation

You can install Mist in several ways, depending on your needs:

- [On Kubernetes with Helm](#kubernetes)
- [On a single host with Docker Compose](#single-host)
- [Local dev environment with Docker Compose](#development-environment)

### Kubernetes

To get started, you will need:

1. A working and up-to-date Kubernetes cluster, able to allocate 8 CPUs and 16GB of RAM to Mist. 
3. Access rights to run Helm on your cluster.

Run the following commands to install Mist:

```
helm repo add mist https://dl.mist.io/charts
helm repo update
helm install mist-ce mist/mist-ce
```

Finally, follow the on-screen instructions after the installation is completed to configure an ingress IP and create the required Mist admin user.

Linode and Vultr users can find detailed installation videos in the respective, official YouTube channels.

#### Important configuration options

##### Domain and TLS

The quick installation method described above does not set up TLS. This is done in order to keep things simple and get you to test Mist quickly. However, we strongly recommend using TLS. This requires a domain for your Mist installation.

First, configure your DNS to point to your cluster's IP.

If you want to issue a new certificate, configure the cluster issuer that will be used, e.g.:

```
helm install mist-ce mist/mist-ce --set http.host=foo.bar.com  \
  --set http.tlsClusterIssuer=letsencrypt-prod \
  --set http.tlsSecret=secretName
```

For instructions on how to install and configure cert-manager read the docs [here](https://cert-manager.io/docs/installation/).

If you have configured a TLS certificate for this hostname as a Kubernetes secret, you should use the `http.tlsSecret` option, e.g.:

```
helm install mist-ce mist/mist-ce --set http.host=foo.bar.com \
  --set http.tlsSecret=secretName
```

##### Email

In some cases, such as user registration, forgotten passwords, user invitations etc., Mist needs to send emails. By default, Mist uses a mock mailer.

To see emails sent by Mist, get the relevant pod name:

```
kubectl get pods -l app=mailmock
```

Now, view the logs of this pod, e.g.: 

```
kubectl logs -f mailmock-pod-name
```

If you wish to use an SMTP server, do something like this:

```
helm install mist-ce mist/mist-ce --set smtp.host=smtp.foo.bar.com \
  --set smtp.username=foo
  --set smtp.password=bar
  --set smtp.port=25
  --set smtp.tls=false
  --set smtp.starttls=true
```

##### External Docker host

Mist's orchestration plugin needs to deploy Docker containers. By default, Mist deploys an in-cluster `dockerhost` pod in privileged mode.

To use an external Docker host, set the following:

```
helm install mist-ce mist/mist-ce --set docker.host=dockerIP \
  --set docker.port=dockerPort \
  --set docker.key=TLSKey \
  --set docker.cert=TLSCert \
  --set docker.ca=TLSCACert
```

#### All configuration options

To review and customize all available configuration options:

1. Export the default chart values.
```
helm show values mist/mist-ce > values.yaml
```
2. Edit the exported `values.yaml`.
3. Run `helm install` with `values.yaml` as input.
```
helm install mist-ce mist/mist-ce -f values.yaml
```

The following table lists all the configurable parameters in Mist's Helm chart and their default values.

|            Parameter                       |              Description                                                           |            Default                |
| ------------------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------- |
| `http.host`                                | FQDN or IP of Mist installation.                                                    | `localhost`                       |
| `http.http2`                               | Use HTTP/2.                                                                         | `false`                           |
| `http.tlsSecret`                           | Kubernetes secret containing the `tls.crt` and `tls.key` data.                         | `''`                              |
| `http.tlsHosts`                            | Array of TLS hosts for ingress record.                                              | `[]`                              |
| `http.tlsAnnotations`                      |                                                                                    | `{}`                              |
| `http.tlsClusterIssuer`                    | TLS cluster issuer.                                                              | `''`                              |
| `smtp.host`                                | SMTP mail server address.                                                           | `''`                              |
| `smtp.port`                                | SMTP port.                                                                      | `8025`                            |
| `smtp.username`                            | SMTP username.                                                                      | `''`                              |
| `smtp.password`                            | SMTP password.                                                                     | `''`                              |
| `smtp.tls`                                 | Use TLS with SMTP.                                                                  | `false`                           |
| `smtp.starttls`                            | Send the starttls command. Typically, it is not used with `smtp.tls=true`.    | `false`                           |
| `portalAdmin.enabled`                      | Create a Mist admin user upon chart installation.                    | `true`                            |
| `portalAdmin.organization`                 | Mist organization name.                                                              | `example.com`                     |
| `portalAdmin.mail`                         | Mist admin's email address.                                                          | `admin@example.com`               |
| `portalAdmin.password`                     | Mist admin's password.                                                              | `example.com`                     |
| `portalAdmin.createApiToken`               | Create an API token upon chart installation.                                         | `true`                            |
| `docker.deploy`                            | Deploy a dockerhost pod in-cluster. The pod will run in privileged mode.           | `true`                            |
| `docker.host`                              | External Docker host address.                                                        | `''`                              |
| `docker.port`                              | External Docker host port.                                                          | `2375`                            |
| `docker.key`                               | External Docker host SSL private key.                                            | `''`                              |
| `docker.cert`                              | External Docker host SSL certificate.                                            | `''`                              |
| `docker.ca`                                | External Docker host CA certificate.                                             | `''`                              |
| `elasticsearch.host`                       | ElasticSearch host.                                                             | `''`                              |
| `elasticsearch.port`                       | ElasticSearch port.                                                            | `9200`                            |
| `elasticsearch.username`                   | Username for ElasticSearch with basic auth.                                         | `''`                              |
| `elasticsearch.password`                   | Password for ElasticSearch with basic auth.                                        | `''`                              |
| `elasticsearch.tls`                        | Connect to ElasticSearch using TLS.                                                 | `false`                           |
| `elasticsearch.verifyCerts`                | Verify ElasticSearch TLS.                                                       | `false`                           |
| `influxdb.host`                            | InfluxDB host.                                                                  | `''`                              |
| `influxdb.port`                            | Verify InfluxDB TLS.                                                       | `8086`                            |
| `influxdb.db`                              | InfluxDB database to use.                                                       | `telegraf`                        |
| `influxdb.monitoring`                      |                                                                                    | `true`                            |
| `influxdb.storageSize`                     | Size of the InfluxDB pvc.                                                       | `1024Mi`                          |
| `victoriametrics.enabled`                  |                                                                                    | `true`                            |
| `victoriametrics.deploy`                   | Deploy a VictoriaMetrics cluster.                                                  | `true`                            |
| `victoriametrics.readEndpoint`             | External VictoriaMetrics cluster read endpoint.                                    | `''`                              |
| `victoriametrics.writeEndpoint`            | External VictoriaMetrics cluster write endpoint.                                   | `''`                              |
| `victoriametrics.vmstorage.persistentVolume.storageClass` | StorageClass of the VictoriaMetrics pvc.                         | `standard`                        |
| `victoriametrics.vmstorage.persistentVolume.size` | Size of the VictoriaMetrics pvc.                                         | `1024Mi`                          |
| `rabbitmq.deploy`                          | Deploy RabbitMQ cluster.                                                          | `true`                            |
| `rabbitmq.replicaCount`                    | RabbitMQ replicas to deploy.                                              | `1`                               |
| `rabbitmq.replicationFactor`               | Default replication factor for queues.                                              | `1`                               |
| `rabbitmq.auth.username`                   | RabbitMQ username.                                                                  | `guest`                           |
| `rabbitmq.auth.password`                   | RabbitMQ password.                                                                  | `guest`                           |
| `rabbitmq.auth.erlangCookie`               | Erlang cookie to determine whether nodes are allowed to communicate with each other.| `guest`                           |
| `rabbitmqExternal.host`                    | External RabbitMQ address. Only used when `rabbitmq.deploy` is `false`.              | `''`                              |
| `rabbitmqExternal.port`                    | External RabbitMQ port.                                                             | `5672`                            |
| `rabbitmqExternal.username`                | External RabbitMQ username.                                                         | `guest`                           |
| `rabbitmqExternal.password`                | External RabbitMQ password.                                                         | `guest`                           |
| `mongodb.deploy`                           | Deploy MongoDB cluster.                                                           | `true`                            |
| `mongodb.host`                             | External MongoDB address. Only used when `mongodb.deploy` is `false`.                | `''`                              |
| `mongodb.port`                             | External MongoDB port.                                                              | `27017`                           |
| `memcached.host`                           | Memcached host in the format `{host}:{port}`.                                        | `''`                              |
| `monitoring.defaultMethod`                 | Available options: `telegraf-victoriametrics` and `telegraf-influxdb`                 | `telegraf-influxdb`               |
| `auth.email.signup`                        | Allow signups with email & password.                                                  | `false`                           |
| `auth.email.signin`                        | Allow signins with email & password.                                                  | `true`                            |
| `auth.google.signup`                       | Allow signups with Google oAuth.                                                    | `false`                           |
| `auth.google.signin`                       | Allow signins with Google oAuth.                                                    | `false`                           |
| `auth.google.key`                          | Google oAuth client ID.                                                     | `''`                              |
| `auth.google.secret`                       | Google oAuth client Secret.                                                  | `''`                              |
| `auth.github.signup`                       | Allow signups with Github oAuth.                                                    | `false`                           |
| `auth.github.signin`                       | Allow signins with Github oAuth.                                                    | `false`                           |
| `auth.github.key`                          | Github oAuth client ID.                                                    | `''`                              |
| `auth.github.secret`                       | Github oAuth client secret.                                                  | `''`                              |
| `backup.key`                               | AWS API key.                                                                        | `''`                              |
| `backup.secret`                            | AWS API secret.                                                                     | `''`                              |
| `backup.bucket`                            | AWS S3 bucket name used to store backups.                                           | `''`                              |
| `backup.region`                            | AWS S3 bucket region.                                        | `''`                              |
| `backup.gpg.recipient`                     | Email recipient of the encrypted backup.                                        | `''`                              |
| `backup.gpg.public`                        | GPG public key.                                                                 | `''`                              |
| `githubBotToken`                           |                                                                                    | `''`                              |
| `deployment.gocky.replicas`                | Replicas in Gocky deployment.                                                      | `1`                               |
| `deployment.api.replicas`                  | Replicas in API server deployment.                                                        | `2`                               |
| `deployment.sockjs.replicas`               | Replicas in sockjs deployment                                                     | `1`                               |
| `deployment.ui.replicas`                   | Replicas in Mist UI deployment.                                                         | `1`                               |
| `deployment.nginx.replicas`                | Replicas in NGINX deployment.                                                      | `1`                               |
| `deployment.landing.replicas`              | Replicas in Mist's landing webpage deployment.                                                    | `1`                               |
| `deployment.dramatiq.dramatiq.enabled`     | Enable Dramatiq consumers for all queues.                                           | `true`                            |
| `deployment.dramatiq.dramatiq.replicas`    |                                                                                    | `2`                               |
| `deployment.dramatiq.default.enabled`      | Enable Dramatiq consumers for `default` queue.                                      | `false`                           |
| `deployment.dramatiq.default.replicas`     |                                                                                    | `1`                               |
| `deployment.dramatiq.provisioning.enabled` | Enable Dramatiq consumers for `dramatiq_provisioning` queue.                        | `false`                           |
| `deployment.dramatiq.provisioning.replicas`|                                                                                    | `1`                               |
| `deployment.dramatiq.polling.enabled`      | Enable Dramatiq consumers for `dramatiq_polling` queue.                             | `false`                           |
| `deployment.dramatiq.polling.replicas`     |                                                                                    | `1`                               |
| `deployment.dramatiq.machines.enabled`     | Enable Dramatiq consumers for `dramatiq_machines` queue.                            | `false`                           |
| `deployment.dramatiq.machines.replicas`    |                                                                                    | `1`                               |
| `deployment.dramatiq.clusters.enabled`     | Enable Dramatiq consumers for `dramatiq_clusters` queue.                            | `false`                           |
| `deployment.dramatiq.clusters.replicas`    |                                                                                    | `1`                               |
| `deployment.dramatiq.networks.enabled`     | Enable Dramatiq consumers for `dramatiq_networks` queue.                            | `false`                           |
| `deployment.dramatiq.networks.replicas`    |                                                                                    | `1`                               |
| `deployment.dramatiq.zones.enabled`        | Enable Dramatiq consumers for `dramatiq_zones` queue.                               | `false`                           |
| `deployment.dramatiq.zones.replicas`       |                                                                                    | `1`                               |
| `deployment.dramatiq.volumes.enabled`      | Enable Dramatiq consumers for `dramatiq_volumes` queue.                             | `false`                           |
| `deployment.dramatiq.volumes.replicas`     |                                                                                    | `1`                               |
| `deployment.dramatiq.buckets.enabled`      | Enable Dramatiq consumers for `dramatiq_buckets` queue.                             | `false`                           |
| `deployment.dramatiq.buckets.replicas`     |                                                                                    | `1`                               |
| `deployment.dramatiq.mappings.enabled`     | Enable Dramatiq consumers for `dramatiq_mappings` and `dramatiq_sessions` queues.      | `false`                           |
| `deployment.dramatiq.mappings.replicas`    |                                                                                    | `1`                               |
| `deployment.dramatiq.scripts.enabled`      | Enable Dramatiq consumers for `dramatiq_scripts` queue.                             | `false`                           |
| `deployment.dramatiq.scripts.replicas`     |                                                                                    | `1`                               |
| `deployment.dramatiq.probe.enabled`        | Enable Dramatiq consumers for `dramatiq_ssh_probe` queue.                           | `false`                           |
| `deployment.dramatiq.probe.replicas`       |                                                                                    | `1`                               |
| `deployment.dramatiq.ping.enabled`         | Enable Dramatiq consumers for `dramatiq_ping_probe` queue.                          | `false`                           |
| `deployment.dramatiq.ping.replicas`        |                                                                                    | `1`                               |
| `deployment.dramatiq.rules.enabled`        | Enable Dramatiq consumers for `dramatiq_rules` queue.                               | `false`                           |
| `deployment.dramatiq.rules.replicas`       |                                                                                    | `1`                               |
| `deployment.dramatiq.schedules.enabled`    | Enable Dramatiq consumers for `dramatiq_schedules` queue.                           | `false`                           |
| `deployment.dramatiq.schedules.replicas`   |                                                                                    | `1`                               |
| `deployment.scheduler.scheduler.enabled`   | Enable scheduler for all polling schedules.                                         | `true`                            |
| `deployment.scheduler.scheduler.replicas`  |                                                                                    | `1`                               |
| `deployment.scheduler.builtin.enabled`     | Enable scheduler for `builtin` schedules.                                           | `false`                           |
| `deployment.scheduler.builtin.replicas`    |                                                                                    | `1`                               |
| `deployment.scheduler.user.enabled`        | Enable scheduler for `user` schedules.                                              | `false`                           |
| `deployment.scheduler.user.replicas`       |                                                                                    | `1`                               |
| `deployment.scheduler.polling.enabled`     | Enable scheduler for `polling` schedules.                                           | `false`                           |
| `deployment.scheduler.polling.replicas`    |                                                                                    | `1`                               |
| `deployment.scheduler.rules.enabled`       | Enable scheduler for `rules` schedules.                                             | `false`                           |
| `deployment.scheduler.rules.replicas`      |                                                                                    | `1`                               |

### Single host

To get started, you will need:

1. A machine with at least 4 CPU cores, 8GB RAM and 10GB disk (accessible to /var/lib/docker/).
2. The OS should be the latest stable Debian or Ubuntu.
3. The OS should include `openssh-server`, `docker` and `docker-compose` packages.

First, download `docker-compose.yml` from the latest stable release as shown [here](https://github.com/mistio/mist-ce/releases/latest).

Make sure you're inside the directory containing the `docker-compose.yml` file and run:

```
docker-compose up -d
```

Then, run `docker-compose ps` and verify that all containers are in the `UP` state, except the short-lived container `elasticsearch-manage`.

Now, you need to create an admin user. Drop in shell with:

```
docker-compose exec api sh
```

and add a new user with:

```
./bin/adduser --admin admin@example.com
```

Try running `./bin/adduser -h` for more options. For example, the `--docker-cloud` flag will add the docker daemon hosting the Mist installation as a docker cloud in the created account.

You can now visit http://localhost and login with the email and password you specified above.

Alternatively, you can also deploy Mist directly from your cloud provider's marketplace:

- Linode users can find Mist [here](https://www.linode.com/marketplace/apps/mist/mist-cloud-management-platform/) and a video about how it works [here](https://youtu.be/kPr-LFucNSo).
- Vultr users can find Mist [here](https://www.vultr.com/marketplace/apps/mist/mist_community_edition/).
- DigitalOcean users can find Mist [here](https://marketplace.digitalocean.com/apps/mist).
- Microsoft Azure users can find Mist [here](https://azuremarketplace.microsoft.com/en-gb/marketplace/apps/mistio1601460379393.mist-ce).

#### Important configuration options

After the initial `docker-compose up -d`, you will see that a configuration file is created in `./settings/settings.py`. Edit this file to modify Mist's configuration.

Any changes to `./settings/settings.py` will take effect after a restart with:

```
docker-compose restart
```

##### URL

If running on anything other than `localhost`, you will need to set the `CORE_URI` setting in `./settings/settings.py`.

For example:

```
CORE_URI = "http://198.51.100.12"
```

##### Email

In some cases, such as user registration, forgotten passwords, user invitations etc., Mist needs to send emails. By default, Mist uses a mock mailer. To see emails sent by Mist, run:

```
docker-compose logs -f mailmock
```

If you wish to use an SMTP server, edit `./settings/settings.py` and modify `MAILER_SETTINGS`.

##### TLS

We strongly recommend using TLS. Assuming a certificate `cert.pem` and private key file `key.pem` in the same directory as the `docker-compose.yml` file, create a `docker-compose.override.yml` file with the following contents:

```yaml
version: '2.0'
services:
  nginx:
    volumes:
      - ./nginx-listen.conf:/etc/nginx/nginx-listen.conf:ro
      - ./cert.pem:/etc/nginx/cert.pem:ro
      - ./key.pem:/etc/nginx/key.pem:ro
    ports:
      - 443:443
```

Then, create a `nginx-listen.conf` in the directory of `docker-compose.yml`, with the following contents:

```
    listen 80;
    listen 443 ssl;
    server_name www.example.com;
    ssl_certificate     /etc/nginx/cert.pem;
    ssl_certificate_key /etc/nginx/key.pem;
    if ($scheme != "https") {
        rewrite ^ https://$host$uri permanent;
    }
```

Finally, update `CORE_URI` in Mist's settings and restart it.

##### Monitoring methods

Mist stores monitoring metrics in InfluxDB by default. Since Mist v4.6, it is possible to use VictoriaMetrics instead. You can configure that in `settings/settings.py`:

```
DEFAULT_MONITORING_METHOD = 'telegraf-victoriametrics'
```

Restart docker-compose for the changes to take effect and then run the respective migration script:

```
docker-compose exec api python migrations/0016-migrate-monitoring.py
```

The above script will update all monitored machines to use the configured monitoring method. It will also update all rules on metrics to use the appropriate query format. However, this **will not** migrate old monitoring data to the new time series database.

#### Upgrade

To upgrade to a new Mist version:

1. Stop your current Mist by running `docker-compose down`.
2. Download the `docker-compose.yml` file of the latest release and place it
in the same directory as before. This way the new installation will use the
same Docker volumes.
3. Run `docker-compose up -d` to bring up the new version.
4. Check that everything is in order by running `docker-compose ps`.

#### Backup

Mist can automatically take and store backups in an S3-compatible bucket. To set this up, first create a bucket on your S3 provider, e.g. AWS, MinIO, etc.

Then, go to `settings/setting.py` and edit the following part accordingly:

```python
BACKUP_INTERVAL = 24  # hours between each backup
BACKUP = {
    'host': '',  # eg s3.amazonaws.com
    'key': '',
    'secret': '',
    'bucket': '',
    'gpg': {
        'recipient': '',
        'public': '',
        'private': '',
    }
}
```

Providing a GPG key is optional but strongly recommended. If you provide it, your backups will be encrypted before getting uploaded to your bucket.

Mist also offers a set of manual commands for backing up, listing backups and restoring backups:

```
docker-compose exec api ./bin/backup
docker-compose exec api ./bin/list-backups
docker-compose exec api ./bin/restore {{myBackupName}}
```

Backups on time series data stored on VictoriaMetrics will be incremental by default. To perform a full backup, use the `--no-incremental` flag:

```
docker-compose exec api ./bin/backup --db victoria --no-incremental
```

Finally, please keep in mind that backups include MongoDB, InfluxDB & VictoriaMetrics data. Mist logs are stored in Elasticsearch. If you would like to back up these as well, please check out [this doc](https://www.elastic.co/guide/en/elasticsearch/reference/current/backup-cluster.html).

#### Staging version

If you want to install the latest bleeding edge build of Mist, run the following:

```
mkdir mist-ce && cd mist-ce && echo 'MIST_TAG=staging' > .env
wget https://raw.githubusercontent.com/mistio/mist-ce/staging/docker-compose.yml
docker-compose up -d
```

## Development environment

If you plan to modify Mist's source code, clone this git repo and all its submodules. Then, bring it online. For example:

```
git clone --recursive https://github.com/mistio/mist-ce.git
cd mist-ce
docker-compose up -d
```

This will mount the checked out code into the containers and may take some time.

By cloning the directory, there is also a `docker-compose.override.yml` file in the current directory in addition to `docker-compose.yml`. This is used to modify the configuration for development mode.

If you are not interested in front-end development, you can comment out the UI & landing sections within the `docker-compose.override.yml` file and re-run `docker-compose up -d`.

Otherwise, you will also need to install the UI & landing page dependencies before you can access the Mist UI.

Install all front-end dependencies with the following commands:

```
docker-compose exec landing npm install
docker-compose exec ui npm install
```

And then build the landing & UI bundles with:

```
docker-compose exec landing npm run build
docker-compose exec ui npm run build
```

When doing front-end development, it is usually more convenient to serve the source code instead of the bundles. To do that, edit `settings/settings.py` and set `JS_BUILD = False`. Restart the `api` container for the changes to take effect with:

```
./restart.sh api
```
