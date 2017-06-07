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
in order to run it, one needs to install a recent version of `docker` and
`docker-compose`.

There are two ways to run this application with docker-compose:


### Single file deployment

If you want to install a stable release, head over to mist.io's github
[releases](https://github.com/mistio/mist.io/releases/) and follow the
instructions there.

Alternatively, if you want to run the latest development version of mist.io,
simply download the `docker-compose.yml` file from this repository and put it
in a directory. The directory name is used by `docker-compose` as the `project`
name, so use something descriptive and unique, like `mist.io`.

You also need to set the environmental variable `MIST_TAG=staging`. Do that by
either running `export MIST_TAG=staging` or for it to persist, do
`echo MIST_TAG=staging > .env`.


### Development deployment

Clone this git repo and all its submodules with something like:

    git clone --recursive https://github.com/mistio/mist.io.git
    cd mist.io

This may take some time.

This setup will mount the checked out code into the containers. By cloning the
directory, now there's also a `docker-compose.override.yml` file in the current
directory in addition to `docker-compose.yml` and is used to modify the
configuration for development mode.


## Running mist.io

Switch to the directory containing the `docker-compose.yml` file and run

    docker-compose up -d

This will start all the mist.io docker containers in the background.

To create a user for the first time, first run

    docker-compose exec api sh

This should drop you in a shell into one of the mist.io containers. In there,
run

    ./bin/adduser --admin --docker-cloud admin@example.com

Replace the email address with yours. Try running `./bin/adduser -h` for more
options. The `--docker-cloud` flag will add the docker daemon hosting the
mist.io installation as a docker cloud in the created account.

Visit http://localhost and login with the email and password specified above.

Welcome to mist.io! Enjoy!


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

