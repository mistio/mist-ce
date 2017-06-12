# mist.io

Mist.io helps you operate, monitor and govern your computing infrastructure,
across clouds and platforms. The code is provided under the GNU AGPL v3.0
License.

An enterprise version that includes Role Based Access, VPN tunnels and
Insights for cost optimization is available as a service at https://mist.io


## Hardware requirements

Recommended hardware resources are:
    4 CPU cores
    8 GB RAM
    10 GB disk (accessible to /var/lib/docker/)


## Installation

Mist.io is a large application split into microservices which are packages in
docker containers. The easiest way to run it is by using `docker-compose`. So,
in order to run it, one needs to install a recent version of [docker](https://docs.docker.com/engine/installation/) and
[docker-compose](https://docs.docker.com/compose/install/)

With docker and docker-compose installed, run

    wget https://github.com/mistio/mist.io/releases/download/v2.0.0-rc4/docker-compose.yml
    docker-compose up -d

After a few minutes (depending on your connection) all mist.io containers will be downloaded
and started in the background.

Run

    docker-compose ps

all containers should be in the UP state, except shortlived container elasticsearch-manage


## Running mist.io

Mist.io binds on port 80 of all interfaces on the server it has been run.

Visit http://server_ip_address or http://localhost, mist.io main page welcomes you!

To create a user for the first time, run

    docker-compose exec api sh

This should drop you in a shell into one of the mist.io containers. In there,
run

    ./bin/adduser --admin admin@example.com

Replace the email address with yours. Try running `./bin/adduser -h` for more
options. The `--docker-cloud` flag will add the docker daemon hosting the
mist.io installation as a docker cloud in the created account.

You can now login through this email and password specified above.


## Configuring mist.io

After the initial `docker-compose up -d`, you'll see that a configuration file
is created in `./config/settings.py`. Edit this file to modify configuration. Any changes to the `.config/settings.py` file need restart of docker-compose in order to take effect

    docker-compose restart


## Setting mail settings

In order to read email produced by mist.io (eg on user register, forgot password, invite members to team) edit
`.config/settings.py` and set the `CORE_URI`. Example

    CORE_URI = "http://54.229.180.245"

You can either set the `MAILER_SETTINGS` to use a real mail server, or attach to the mailmock container and read all email
generated

    docker-compose logs -f mailmock

Don't forget to restart docker-compose for changes to take effect.


## Managing mist.io

Mist.io is managed using `docker-compose`. Look that up for details. Some
useful commands:

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

    # Stop mist.io
    docker-compose stop

    # Start mist.io
    docker-compose start
    # or even better
    docker-compose up -d

    # Stop and remove all containers
    docker-compose down

    # Completely remove all containers and data volumes.
    docker-compose down -v


## Development version

There's also a development version of mist.io, you will find instructions on how to get it working
on [dev-install](README-dev.md).
