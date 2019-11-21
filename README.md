# Mist Cloud Management Platform - Community Edition

Mist is an open source platform for managing heterogeneous computing 
infrastructure, aka a Multi-Cloud Management Platform.

The managed computing resources may be running on any combination of public 
clouds, private clouds, hypervisors, bare metal servers, container hosts.

Mist is developed by Mist.io Inc. The code for the Community Edition is 
provided under the Apache License. The Enterprise Edition and the Hosted 
Service include plugins for Governance, Role Based Access Control & Cost 
Insights. They are available for purchase at __https://mist.io__. Paid support 
plans are available for any edition.

<img src="https://mist.io/landing/images/frontpage/home-dashboard.png" width="768">

# Who needs Mist?

1. Organizations that depend on hybrid or multi-cloud infrastructure
2. Organizations that provide infrastructure resources to their users on a self-service fashion

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
- Celery workers, running asynchronous jobs
- Celery Beat schedulers & pollers that schedule polling tasks, as well as user defined scheduled actions
- Gocky as the relay to receive and pre-process monitoring metrics
- RabbitMQ message queue service
- InfluxDB, Graphite or FoundationDB as a time series database
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
being stored in Elasticsearch. Time series data go to either Graphite, 
InfluxDB or TSFDB, depending on the installation. Schedules and polling tasks 
are triggered by Celery Beat. Whenever a shell connection is required (e.g. 
SSH or Docker Shell), Hubshell establishes the connection and makes it 
available through the WebSocket API.

## Hardware requirements

Recommended hardware resources are:
    4 CPU cores
    8 GB RAM
    10 GB disk (accessible to /var/lib/docker/)


## Installation


### Single host

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


### Kubernetes cluster

Use the available helm chart within the chart directory.



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


### Required configuration

#### URL

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

## Staging version

If you want to install the latest bleeding edge build of mist,
run the following:

```bash
mkdir mist-ce && cd mist-ce && echo 'MIST_TAG=staging' > .env
wget https://raw.githubusercontent.com/mistio/mist-ce/staging/docker-compose.yml
docker-compose up -d
```

## Development deployment

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

    docker-compose exec landing bower install
    docker-compose exec ui bower install

And then build the landing & ui bundles

    docker-compose exec landing polymer build
    docker-compose exec ui node --max_old_space_size=4096 /usr/local/bin/polymer build
    docker-compose exec ui cp bower_components/echarts/dist/echarts.common.min.js build/bundled/bower_components/echarts/dist/

When doing front-end development, it's usually more convenient to serve the 
source code instead of the bundles. To do that, edit settings/settings.py and 
set `JS_BUILD = False`. Restart the api container for the changes to take 
effect

    ./restart.sh api

The above instructions for running and managing Mist apply.
