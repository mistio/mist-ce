# Mist.io Community Edition

Mist.io helps you operate, monitor and govern your computing infrastructure,
across clouds and platforms. The code is provided under the GNU AGPL v3.0
License.

The Enterprise Edition and the Hosted Service that include Role Based Access, VPN tunnels and
Insights for cost optimization are available at https://mist.io

<img src="https://mist.io/landing/images/frontpage/home-dashboard.png" width="768">

## Hardware requirements

Recommended hardware resources are:
    4 CPU cores
    8 GB RAM
    10 GB disk (accessible to /var/lib/docker/)


## Installation

Mist.io is a large application split into microservices which are packages in
docker containers. The easiest way to run it is by using `docker-compose`. So,
in order to run it, one needs to install a recent version of
[docker](https://docs.docker.com/engine/installation/) and
[docker-compose](https://docs.docker.com/compose/install/).

To install the latest stable release, head over to
[releases](https://github.com/mistio/mist-ce/releases) and follow the
instructions there.

After a few minutes (depending on your connection) all mist.io containers will
be downloaded and started in the background.

Run `docker-compose ps`. All containers should be in the UP state, except
shortlived container elasticsearch-manage.


## Running Mist.io

Make sure you're inside the directory containing the `docker-compose.yml` file.

Switch to the directory containing the `docker-compose.yml` file and run

    docker-compose up -d

This will start all the mist.io docker containers in the background.

To create a user for the first time, first run

    docker-compose exec api sh

This should drop you in a shell into one of the mist.io containers. In there,
run

    ./bin/adduser --admin admin@example.com

Replace the email address with yours. Try running `./bin/adduser -h` for more
options. The `--docker-cloud` flag will add the docker daemon hosting the
mist.io installation as a docker cloud in the created account.

Mist.io binds on port 80 of the host. Visit http://localhost and login with the
email and password specified above.

Welcome to Mist.io! Enjoy!


## Configuring Mist.io

After the initial `docker-compose up -d`, you'll see that a configuration file
is created in `./config/settings.py`. Edit this file to modify configuration.
Any changes to the `./config/settings.py` require a restart to take effect:

    docker-compose restart


### Required configuration

#### URL

If running on anything other than `localhost`, you'll need to set the
`CORE_URI` setting in `./config/settings.py`. Example:

    CORE_URI = "http://198.51.100.12"


### Mail settings

In some cases, such as user registration, forgotten passwords, user invitations
etc, mist.io needs to send emails. By default, mist.io is configured to use a
mock mailer. To see logs sent by mist.io, run

    docker-compose logs -f mailmock

If you wish to use a real SMTP server, edit `./config/settings.py` and modify
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
      - ./docker/nginx/nginx-listen.conf:/etc/nginx/nginx-listen.conf:ro
      - ./docker/nginx/cert.pem:/etc/nginx/cert.pem:ro
      - ./docker/nginx/key.pem:/etc/nginx/key.pem:ro
    ports:
      - 443:80
```

Create a `nginx-listen.conf` in the directory of `docker-compose.yml`, with the
following contents:
```
server {
    listen              80 ssl;
    server_name         www.example.com;
    ssl_certificate     /etc/nginx/cert.pem;
    ssl_certificate_key /etc/nginx/key.pem;
```

Update `CORE_URI` in mist's settings (see URL section above).

Run `docker-compose up -d`.


## Managing Mist.io

Mist.io is managed using `docker-compose`. Look that up for details. Some
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

## Migrating from previous versions

1. Bring down your current installation by running `docker-compose down`.
2. Download the docker-compose.yml file of the latest release and place it
within the same directory as before. This way the new installation will use the
same Docker volumes.
3. Run `docker-compose up -d` to bring up the new version.
4. Check that everything is in order by running `docker-compose ps`. Also check
if your Mist.io portal works as expected.
5. In some cases, it might be necessary to run the latest database migration
scripts. Connect to the api container and run the latest scripts in
`mist.io/api/migrations`. e.g. `docker-compose exec api ls migrations`
and then `docker-compose exec api python migrations/0006-list-locations.py`

## Staging version

If you want to install the latest bleeding edge build of mist.io,
run the following:

```bash
mkdir mist-ce && cd mist-ce && echo 'MIST_TAG=staging' > .env
wget https://raw.githubusercontent.com/mistio/mist-ce/staging/docker-compose.yml
docker-compose up -d
```

## Development deployment

If you're planning to modify Mist.io's source code, an alternative installation
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

The above instructions for running and managing Mist.io apply.
