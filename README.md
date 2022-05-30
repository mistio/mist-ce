# Mist Cloud Management Platform - Community Edition

Mist is an open source platform for managing heterogeneous computing
infrastructure, aka a Multicloud Management Platform.

The managed computing resources may be running on any combination of public
clouds, private clouds, hypervisors, bare metal servers, container hosts.

Mist is developed by Mist.io Inc. The code for the Community Edition is
provided under the Apache License v2. The Enterprise Edition and the Hosted
Service include plugins for Governance, Role Based Access Control & Cost
Insights. They are available for purchase at __https://mist.io__. Paid support
plans are available for any edition.

<a href="https://www.youtube.com/watch?v=7oYyC-FIaAM" source="_blank"><img src="https://mist.io/landing/images/frontpage/home-dashboard.png" width="768"></a>

# Table of Contents

- [Who needs Mist?](#who-needs-mist)
- [Features](#features)
- [Terminology](#terminology)
- [Architecture](#architecture)
- [Installation](#installation)
  - [Kubernetes cluster with helm](#kubernetes-cluster)
  - [Single host with docker-compose](#single-host)
  - [Dev environment with docker-compose](#development-deployment)

# Who needs Mist?

1. Organizations that depend on hybrid or multi-cloud infrastructure
2. Organizations that provide computing resources to their users on a self-service fashion

They often end up building silos of distinct tools, processes & teams for each
supported platform, introducing operational complexities which can affect both
security and efficiency.

As the heterogeneity increases, it's becoming increasingly difficult to
- train users
- set access control rules
- set governance policies like quotas and other constraints
- audit usage
- monitor/optimize costs
- automate complex deployments
- set up metering & billing

Mist provides a unified way to operate, monitor & govern these resources. The
mission statement of the Mist platform is to help commoditize computing by
alleviating vendor lock-in.

# Features

- Instant visibility of all the available resources across clouds, grouped by tags
- Instant reporting/estimation of the current infrastructure costs
- Compare current & past costs, correlate with usage, provide right-sizing recommendations (EE/HS only)
- Provision new resources on any cloud: machines, volumes, networks, zones, records
- Perform life cycle actions on existing resources: stop, start, reboot, resize, destroy, etc
- Instant audit logging for all actions performed through Mist or detected through continuous polling
- Upload scripts to the library, run them on any machine while enforcing audit logging and centralized control of SSH keys
- SSH command shell on any machine within the browser or through the CLI, enforcing audit logging and centralized control of SSH keys
- Enable monitoring on target machines to display real time system & custom metrics and store them for long term access
- Set rules on metrics or logs that trigger notifications, webhooks, scripts or machine lifecycle actions
- Set schedules that trigger scripts or machine lifecycle actions
- Set fine grained access control policies per team/tag/resource/action (EE/HS only)
- Set governance constraints: e.g. quotas on cost per user/team, required expiration dates (EE/HS only)
- Upload infrastructure templates that may describe complex deployments and workflows (EE/HS only)
- Deploy and scale Kubernetes clusters on any supported cloud (EE/HS only)

# Terminology

#### Cloud
Any service that provides on-demand access to computing resources
- Public clouds  (e.g. AWS, Azure, Google Cloud, IBM Cloud, DigitalOcean, Linode, Packet)
- Private clouds (e.g. based on OpenStack, vSphere, OnApp)
- Hypervisors (e.g. KVM, ESXi),
- Container hosts / Container clusters
- Bare metal / Other server

#### Machine

Any computing resource is a machine. There are many types of machines and some machines may contain other machines.

#### Volume

Any physical or virtual data storage device. E.g. Physical HDD/SSD, Cloud disks, EBS volumes, etc. Volumes may be attached on machines. May be provisioned along with machines or independently.

#### Network

Private network spaces that machines can join. e.g. AWS VPC's

#### Script

An executable (e.g. bash script) or an Ansible playbook that can run on machines over SSH. Scripts may be added inline or by a reference to a tarball or a Git repository.

#### Template

A blueprint that describes the full lifecycle of an application that may require multiple computing resources, network, storage and additional configurations. E.g. The provided Kubernetes template enables the deployment of a Kubernetes cluster on any cloud and provides workflows to easily scale the cluster up or down. Currently supporting Cloudify blueprints. Terraform support coming soon.

#### Stack

The deployment of a template is a Stack. A Stack may include resources (e.g. machines, networks, volumes) and provides a set of workflow actions that can be performed. A Stack created by the Kubernetes template refers to a Kubernetes cluster. It includes references to the master and worker nodes and provides scale up & down workflows that can be applied to the cluster.

#### Tunnel

A point to point VPN enabling Mist to manage infrastructure that's not on publicly addressable network space.

# Architecture

Mist is a cloud native application split into microservices which are packaged as Docker containers. It can be deployed on a single host with Docker Compose, or on a Kubernetes cluster using Helm.

The most notable components are the following:
- Mist UI, a web application built with Web Components and Polymer
- REST API that serves requests from clients
- WebSocket API, sends real-time updates to connected clients and proxies shell connections
- Hubshell service, opens SSH connections to machines or shell connections using the Docker API
- Dramatiq workers, running asynchronous jobs
- APScheduler based scheduler that schedules polling tasks, rule checks, as well as user defined scheduled actions
- Gocky as the relay to receive and pre-process monitoring metrics
- RabbitMQ message queue service
- InfluxDB, or VictoriaMetrics as a time series database
- MongoDB or FoundationDB Document Layer as the main database
- Elasticsearch for storing and searching logs
- Logstash for routing logs to Elasticsearch
- Telegraf as a data collection agent, installed on monitored machines

![Architecture.svg](Architecture.svg)

The user interacts with the RESTful Mist API through client apps like the Mist
UI in the browser, or command line tools (e.g. cURL,  Mist CLI). The Mist UI,
apart from invoking the RESTful API, also establishes a WebSocket connection,
which is used to receive real time updates and to proxy shell connections to
machines. The Mist API server interacts with the respective API's of the
target clouds, either directly, or by adding tasks that get executed
asynchronously by Celery workers. The messaging is following the AMQP protocol
and gets coordinated by RabbitMQ. The main data store is MongoDB. Logs are
being stored in Elasticsearch. Time series data go to either VictoriaMetrics or
InfluxDB, depending on the installation. Rule checks, polling tasks & user
tasks are triggered by the scheduler service. Whenever a shell connection is
required (e.g. SSH or Docker Shell), Sheller establishes the connection and
makes it available through the WebSocket API.

# Kubernetes cluster

Add the mist chart repository and fetch available charts
```
helm repo add mist https://dl.mist.io/charts
helm repo update
```

For Mist to function correctly, you should set the `http.host` parameter to specify the FQDN of the installation.

```
helm install mist-ce mist/mist-ce --set http.host=foo.bar.com,portalAdmin.organization=example.com,portalAdmin.mail=admin@example.com
```

The above command set the FQDN to `foo.bar.com` and additionaly creates an administrator account with email address `admin@example.com` and Organization name `example.com`.

## Configuration

In order to easily customize all available options:
1. Export default chart values
```
helm show values mist/mist-ce > values.yaml
```
2. Edit values.yaml according to your needs
3. Install or upgrade release
```
helm upgrade --install mist-ce mist/mist-ce -f values.yaml
```

### TLS

If you have configured a TLS certificate for this hostname as a k8s secret you can configure it using the http.tlsSecret option
```
helm install mist-ce mist/mist-ce --set http.host=foo.bar.com --set http.tlsSecret=secretName
```
If you want to issue a new certificate, also configure the cluster issuer that will be used
```
helm install mist-ce mist/mist-ce --set http.host=foo.bar.com  --set http.tlsClusterIssuer=letsencrypt-prod --set http.tlsSecret=secretName
```

### External dockerhost

In order for orchestration plugin to work Mist needs to deploy Docker containers.  
By default an in-cluster dockerhost pod in privileged mode is deployed.

To use an external dockerhost set the following values:

```shell
helm install mist-ce mist/mist-ce --set docker.host=<dockerIP>,docker.port=<dockerPort>,docker.key=<TLSKey>,docker.cert=<TLSCert>,docker.ca=<TLSCACert>
```

The following table lists the configurable parameters of the Mist chart and their default values.

|            Parameter                       |              Description                                                           |            Default                |
| ------------------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------- |
| `http.host`                                | FQDN or IP of Mist installation                                                    | `localhost`                       |
| `http.http2`                               | Use HTTP/2                                                                         | `false`                           |
| `http.tlsSecret`                           | The Kubernetes Secret containing the tls.crt, tls.key data                         | `''`                              |
| `http.tlsHosts`                            | Array of TLS hosts for ingress record                                              | `[]`                              |
| `http.tlsAnnotations`                      |                                                                                    | `{}`                              |
| `http.tlsClusterIssuer`                    | The TLS clusterIssuer                                                              | `''`                              |
| `smtp.host`                                | SMTP mail server address                                                           | `''`                              |
| `smtp.port`                                | The SMTP port                                                                      | `8025`                            |
| `smtp.username`                            | SMTP username                                                                      | `''`                              |
| `smtp.password`                            | SMTP password                                                                      | `''`                              |
| `smtp.tls`                                 | Use TLS with SMTP                                                                  | `false`                           |
| `smtp.starttls`                            | If true, will send the starttls command (typically not used with smtp.tls=true)    | `false`                           |
| `portalAdmin.enabled`                      | Whether to create a new admin user on first Chart installation                     | `true`                            |
| `portalAdmin.organization`                 | The organization name                                                              | `example.com`                     |
| `portalAdmin.mail`                         | The admin's email address                                                          | `admin@example.com`               |
| `portalAdmin.password`                     | The admin's password                                                               | `example.com`                     |
| `portalAdmin.createApiToken`               | If true, an API token will also be created                                         | `true`                            |
| `docker.deploy`                            | Deploy a dockerhost pod in-cluster (The pod will run in privileged mode)           | `true`                            |
| `docker.host`                              | External dockerhost address                                                        | `''`                              |
| `docker.port`                              | External dockerhost port                                                           | `2375`                            |
| `docker.key`                               | The external dockerhost SSL private key                                            | `''`                              |
| `docker.cert`                              | The external dockerhost SSL certificate                                            | `''`                              |
| `docker.ca`                                | The external dockerhost CA certificate                                             | `''`                              |
| `vault.address`                            | Vault address                                                                      | `http://vault:8200`               |
| `vault.token`                              | Authentication token for Vault                                                     | `''`                              |
| `vault.roleId`                             | The Vault RoleID                                                                   | `''`                              |
| `vault.secretId`                           | The Vault SecretID                                                                 | `''`                              |
| `vault.secret_engine_path`                 |                                                                                    | `{}`                              |
| `vault.clouds_path`                        | The default Vault path for Cloud credentials                                       | `mist/clouds/`                    |
| `vault.keys_path`                          | The default Vault path for Key credentials                                         | `mist/keys`                       |
| `elasticsearch.host`                       | The ElasticSearch host                                                             | `''`                              |
| `elasticsearch.port`                       | The ElasticSearch port                                                             | `9200`                            |
| `elasticsearch.username`                   | Username for ElasticSearch with basic auth                                         | `''`                              |
| `elasticsearch.password`                   | Password for ElasticSearch with basic auth                                         | `''`                              |
| `elasticsearch.tls`                        | Connect to ElasticSearch using TLS                                                 | `false`                           |
| `elasticsearch.verifyCerts`                | Whether or not to verify TLS                                                       | `false`                           |
| `influxdb.host`                            | The InfluxDB host                                                                  | `''`                              |
| `influxdb.port`                            | Whether or not to verify TLS                                                       | `8086`                            |
| `influxdb.db`                              | The InfluxDB database to use                                                       | `telegraf`                        |
| `influxdb.monitoring`                      |                                                                                    | `true`                            |
| `victoriametrics.enabled`                  |                                                                                    | `true`                            |
| `victoriametrics.deploy`                   | Deploy a Victoria Metrics cluster                                                  | `true`                            |
| `victoriametrics.readEndpoint`             | External Victoria Metrics cluster read endpoint                                    | `''`                              |
| `victoriametrics.writeEndpoint`            | External Victoria Metrics cluster write endpoint                                   | `''`                              |
| `rabbitmq.deploy`                          | Deploy a RabbitMQ cluster                                                          | `true`                            |
| `rabbitmq.replicaCount`                    | Number of RabbitMQ replicas to deploy                                              | `1`                               |
| `rabbitmq.replicationFactor`               | Default replication factor for queues                                              | `1`                               |
| `rabbitmq.auth.username`                   | RabbitMQ username                                                                  | `guest`                           |
| `rabbitmq.auth.password`                   | RabbitMQ password                                                                  | `guest`                           |
| `rabbitmq.auth.erlangCookie`               | Erlang cookie to determine whether nodes are allowed to communicate with each other| `guest`                           |
| `rabbitmqExternal.host`                    | External RabbitMQ address (Only used when `rabbitmq.deploy` is false)              | `''`                              |
| `rabbitmqExternal.port`                    | External RabbitMQ port                                                             | `5672`                            |
| `rabbitmqExternal.username`                | External RabbitMQ username                                                         | `guest`                           |
| `rabbitmqExternal.password`                | External RabbitMQ password                                                         | `guest`                           |
| `mongodb.deploy`                           | Deploy a MongoDB cluster                                                           | `true`                            |
| `mongodb.host`                             | External MongoDB address (Only used when `mongodb.deploy` is false)                | `''`                              |
| `mongodb.port`                             | External MongoDB port                                                              | `27017`                           |
| `memcached.host`                           | Memcached host in the format: {host}:{port}                                        | `''`                              |
| `monitoring.defaultMethod`                 | Available options: "telegraf-victoriametrics", "telegraf-influxdb"                 | `telegraf-influxdb`               |
| `auth.email.signup`                        | Allow signups with email/password                                                  | `false`                           |
| `auth.email.signin`                        | Allow signins with email/password                                                  | `true`                            |
| `auth.google.signup`                       | Allow signups with Google oAuth                                                    | `false`                           |
| `auth.google.signin`                       | Allow signins with Google oAuth                                                    | `false`                           |
| `auth.google.key`                          | The Client ID for Google oAuth                                                     | `''`                              |
| `auth.google.secret`                       | The Client Secret for Google oAuth                                                 | `''`                              |
| `auth.github.signup`                       | Allow signups with Github oAuth                                                    | `false`                           |
| `auth.github.signin`                       | Allow signins with Github oAuth                                                    | `false`                           |
| `auth.github.key`                          | The Client ID for Github oAuth                                                     | `''`                              |
| `auth.github.secret`                       | The Client Secret for Github oAuth                                                 | `''`                              |
| `backup.key`                               | The AWS Key                                                                        | `''`                              |
| `backup.secret`                            | The AWS Secret                                                                     | `''`                              |
| `backup.bucket`                            | The S3 Bucket name used to store backups                                           | `''`                              |
| `backup.region`                            | The region where the S3 bucket is located                                          | `''`                              |
| `backup.gpg.recipient`                     | The email recipient of the encrypted backup                                        | `''`                              |
| `backup.gpg.public`                        | The GPG public key                                                                 | `''`                              |
| `githubBotToken`                           |                                                                                    | `''`                              |
| `deployment.gocky.replicas`                | Replicas for gocky deployment                                                      | `1`                               |
| `deployment.api.replicas`                  | Replicas for api deployment                                                        | `2`                               |
| `deployment.sockjs.replicas`               | Replicas for sockjs deployment                                                     | `1`                               |
| `deployment.ui.replicas`                   | Replicas for ui deployment                                                         | `1`                               |
| `deployment.nginx.replicas`                | Replicas for nginx deployment                                                      | `1`                               |
| `deployment.landing.replicas`              | Replicas for landing deployment                                                    | `1`                               |
| `deployment.dramatiq.dramatiq.enabled`     | Enable dramatiq consumers for all queues                                           | `true`                            |
| `deployment.dramatiq.dramatiq.replicas`    |                                                                                    | `2`                               |
| `deployment.dramatiq.default.enabled`      | Enable dramatiq consumers for "default" queue                                      | `false`                           |
| `deployment.dramatiq.default.replicas`     |                                                                                    | `1`                               |
| `deployment.dramatiq.provisioning.enabled` | Enable dramatiq consumers for "dramatiq_provisioning" queue                        | `false`                           |
| `deployment.dramatiq.provisioning.replicas`|                                                                                    | `1`                               |
| `deployment.dramatiq.polling.enabled`      | Enable dramatiq consumers for "dramatiq_polling" queue                             | `false`                           |
| `deployment.dramatiq.polling.replicas`     |                                                                                    | `1`                               |
| `deployment.dramatiq.machines.enabled`     | Enable dramatiq consumers for "dramatiq_machines" queue                            | `false`                           |
| `deployment.dramatiq.machines.replicas`    |                                                                                    | `1`                               |
| `deployment.dramatiq.clusters.enabled`     | Enable dramatiq consumers for "dramatiq_clusters" queue                            | `false`                           |
| `deployment.dramatiq.clusters.replicas`    |                                                                                    | `1`                               |
| `deployment.dramatiq.networks.enabled`     | Enable dramatiq consumers for "dramatiq_networks" queue                            | `false`                           |
| `deployment.dramatiq.networks.replicas`    |                                                                                    | `1`                               |
| `deployment.dramatiq.zones.enabled`        | Enable dramatiq consumers for "dramatiq_zones" queue                               | `false`                           |
| `deployment.dramatiq.zones.replicas`       |                                                                                    | `1`                               |
| `deployment.dramatiq.volumes.enabled`      | Enable dramatiq consumers for "dramatiq_volumes" queue                             | `false`                           |
| `deployment.dramatiq.volumes.replicas`     |                                                                                    | `1`                               |
| `deployment.dramatiq.buckets.enabled`      | Enable dramatiq consumers for "dramatiq_buckets" queue                             | `false`                           |
| `deployment.dramatiq.buckets.replicas`     |                                                                                    | `1`                               |
| `deployment.dramatiq.mappings.enabled`     | Enable dramatiq consumers for "dramatiq_mappings", "dramatiq_sessions" queues      | `false`                           |
| `deployment.dramatiq.mappings.replicas`    |                                                                                    | `1`                               |
| `deployment.dramatiq.scripts.enabled`      | Enable dramatiq consumers for "dramatiq_scripts" queue                             | `false`                           |
| `deployment.dramatiq.scripts.replicas`     |                                                                                    | `1`                               |
| `deployment.dramatiq.probe.enabled`        | Enable dramatiq consumers for "dramatiq_ssh_probe" queue                           | `false`                           |
| `deployment.dramatiq.probe.replicas`       |                                                                                    | `1`                               |
| `deployment.dramatiq.ping.enabled`         | Enable dramatiq consumers for "dramatiq_ping_probe" queue                          | `false`                           |
| `deployment.dramatiq.ping.replicas`        |                                                                                    | `1`                               |
| `deployment.dramatiq.rules.enabled`        | Enable dramatiq consumers for "dramatiq_rules" queue                               | `false`                           |
| `deployment.dramatiq.rules.replicas`       |                                                                                    | `1`                               |
| `deployment.dramatiq.schedules.enabled`    | Enable dramatiq consumers for "dramatiq_schedules" queue                           | `false`                           |
| `deployment.dramatiq.schedules.replicas`   |                                                                                    | `1`                               |
| `deployment.scheduler.scheduler.enabled`   | Enable scheduler for all polling schedules                                         | `true`                            |
| `deployment.scheduler.scheduler.replicas`  |                                                                                    | `1`                               |
| `deployment.scheduler.builtin.enabled`     | Enable scheduler for "builtin" schedules                                           | `false`                           |
| `deployment.scheduler.builtin.replicas`    |                                                                                    | `1`                               |
| `deployment.scheduler.user.enabled`        | Enable scheduler for "user" schedules                                              | `false`                           |
| `deployment.scheduler.user.replicas`       |                                                                                    | `1`                               |
| `deployment.scheduler.polling.enabled`     | Enable scheduler for "polling" schedules                                           | `false`                           |
| `deployment.scheduler.polling.replicas`    |                                                                                    | `1`                               |
| `deployment.scheduler.rules.enabled`       | Enable scheduler for "rules" schedules                                             | `false`                           |
| `deployment.scheduler.rules.replicas`      |                                                                                    | `1`                               |

# Single host

The easiest way to get started with Mist is to install the latest release
using `docker-compose`. So, in order to run it, one needs to install a recent
version of [docker](https://docs.docker.com/engine/installation/) and
[docker-compose](https://docs.docker.com/compose/install/).

To install the latest stable release, head over to
[releases](https://github.com/mistio/mist-ce/releases) and follow the
instructions there.

After a few minutes (depending on your connection) all the mist containers will
be downloaded and started in the background.

Run `docker-compose ps`. All containers should be in the UP state, except
shortlived container elasticsearch-manage.

Linode users can quickly set up Mist through Linode's One-Click App Marketplace. You can find Mist [here](https://www.linode.com/marketplace/apps/mist/mist-cloud-management-platform/) and a video about how it works [here](https://youtu.be/kPr-LFucNSo).

## Hardware requirements

We recommended setting up Mist in a machine with 4 CPU cores, 8GB RAM and 10GB disk (accessible to /var/lib/docker/).

## Running Mist

Make sure you're inside the directory containing the `docker-compose.yml` file.

Switch to the directory containing the `docker-compose.yml` file and run

    docker-compose up -d

This will start all the mist docker containers in the background.

To create a user for the first time, first run

    docker-compose exec api sh

This should drop you in a shell into one of the mist containers. In there,
run

    ./bin/adduser --admin admin@example.com

Replace the email address with yours. Try running `./bin/adduser -h` for more
options. The `--docker-cloud` flag will add the docker daemon hosting the
mist installation as a docker cloud in the created account.

Mist binds on port 80 of the host. Visit http://localhost and login with the
email and password specified above.

Welcome to Mist! Enjoy!

## Configuring

After the initial `docker-compose up -d`, you'll see that a configuration file
is created in `./settings/settings.py`. Edit this file to modify configuration.
Any changes to the `./settings/settings.py` require a restart to take effect:

    docker-compose restart

## Required configuration

### URL

If running on anything other than `localhost`, you'll need to set the
`CORE_URI` setting in `./settings/settings.py`. Example:

    CORE_URI = "http://198.51.100.12"


### Mail settings

In some cases, such as user registration, forgotten passwords, user invitations
etc, mist needs to send emails. By default, mist is configured to use a
mock mailer. To see logs sent by mist, run

    docker-compose logs -f mailmock

If you wish to use a real SMTP server, edit `./settings/settings.py` and modify
`MAILER_SETTINGS`.

Don't forget to restart docker-compose for changes to take effect.

### TLS settings

This section applies if you've installed mist by using the `docker-compose.yml`
file of a mist release.

Assuming a certificate `cert.pem` and private key file `key.pem` in the same
directory as the `docker-compose.yml` file:

Create a `docker-compose.override.yml` file with the following contents:
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

Create a `nginx-listen.conf` in the directory of `docker-compose.yml`, with the
following contents:
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

Update `CORE_URI` in mist's settings (see URL section above).

Run `docker-compose up -d`.

## Managing Mist

Mist is managed using `docker-compose`. Look that up for details. Some
useful commands follow. Keep in mind that you need to run these from inside the
directory containing the `docker-compose.yml` file:

    # See status of all applications
    docker-compose ps

    # Almost all containers should be in the UP state. An exception to this
    # is shortlived containers. Currently the only such container is
    # elasticsearch-manage. This should run for a few seconds and exit 0 if
    # everything went fine.

    # Restart nginx container
    docker-compose restart nginx

    # See the logs of the api and celery containers, starting with the last
    # 50 lines.
    docker-compose logs --tail=50 -f api celery

    # Stop mist
    docker-compose stop

    # Start mist
    docker-compose start
    # or even better
    docker-compose up -d

    # Stop and remove all containers
    docker-compose down

    # Completely remove all containers and data volumes.
    docker-compose down -v

## Migrating from previous versions

1. Bring down your current installation by running `docker-compose down`.
2. Download the docker-compose.yml file of the latest release and place it
within the same directory as before. This way the new installation will use the
same Docker volumes.
3. Run `docker-compose up -d` to bring up the new version.
4. Check that everything is in order by running `docker-compose ps`. Also check
if your Mist portal works as expected.

## Backups

Mist can automatically backup itself to an S3 bucket. To set this up, first create a bucket for the backups on your S3 provider (AWS, MinIO, etc).

Then go to settings/setting.py of your Mist installation and edit the following part accordingly:
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
Finally, please keep in mind that backups include MongoDB, InfluxDB & VictoriaMetrics data. Mist logs are stored in Elasticsearch. If you would like to backup these as well, please check out https://www.elastic.co/guide/en/elasticsearch/reference/current/backup-cluster.html.

## Monitoring methods

Mist stores monitoring metrics in InfluxDB by default. Since v4.6 it's possible
to use VictoriaMetrics instead. You can configure that in settings/settings.py

```
DEFAULT_MONITORING_METHOD = 'telegraf-victoriametrics'
```

Restart docker-compose for changes to take effect.

```
docker-compose restart
```

Then run the respective migration script.

```
docker-compose exec api python migrations/0016-migrate-monitoring.py
```

The above script will update all monitored machines to use the configured
monitoring method. It will also update all rules on metrics to use the
appropriate query format. It won't migrate past monitoring data between
time series databases.

If running on Kubernetes, configure monitoring.defaultMethod in values.yaml
instead and use helm to upgrade your release as described above.

## Staging version

If you want to install the latest bleeding edge build of mist,
run the following:

```bash
mkdir mist-ce && cd mist-ce && echo 'MIST_TAG=staging' > .env
wget https://raw.githubusercontent.com/mistio/mist-ce/staging/docker-compose.yml
docker-compose up -d
```

# Development deployment

If you're planning to modify Mist's source code, an alternative installation
method is recommended.

Clone this git repo and all its submodules with something like:

    git clone --recursive https://github.com/mistio/mist-ce.git
    cd mist-ce
    docker-compose up -d

This may take some time.

This setup will mount the checked out code into the containers. By cloning the
directory, now there's also a `docker-compose.override.yml` file in the current
directory in addition to `docker-compose.yml` and is used to modify the
configuration for development mode.

If you're not interested in frontend development, you can comment out the ui &
landing sections within the `docker-compose.override.yml` file and re-run
`docker-compose up -d`. Otherwise, you'll also need to install the ui &
landing page dependencies before you can access the Mist UI.

Install all front-end dependencies with the following commands

    docker-compose exec landing npm install
    docker-compose exec ui npm install

And then build the landing & ui bundles

    docker-compose exec landing npm run build
    docker-compose exec ui npm run build

When doing front-end development, it's usually more convenient to serve the
source code instead of the bundles. To do that, edit settings/settings.py and
set `JS_BUILD = False`. Restart the api container for the changes to take
effect

    ./restart.sh api

The above instructions for running and managing Mist apply.
