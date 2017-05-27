# mist.io

Mist.io helps you operate, monitor and govern your computing infrastructure,
across clouds and platforms. The code is provided under the GNU AGPL v3.0
License.

An enterprise version that includes Role Based Access, VPN tunnels and
Insights for cost optimization is available as a service at https://mist.io


## Installation

Mist.io is a large application split into microservices which are packages in
docker containers. The easiest way to run it is by using `docker-compose`. So,
in order to run it, one needs to install a recent version of `docker` and
`docker-compose`.

There are two ways to run this application with docker-compose:


### Single file deployment

Simply download the `docker-compose.yml` file from this repository and put it
in a directory. The directory name is used by `docker-compose` as the `project`
name, so use something descriptive and unique, like `mist.io`.


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
options.

Visit http://localhost and login with the email and password specified above.

Welcome to mist.io! Enjoy!
