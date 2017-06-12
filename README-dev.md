# mist.io development deployment

Clone this git repo and all its submodules with something like:

    git clone --recursive https://github.com/mistio/mist.io.git
    cd mist.io

This may take some time.

This setup will mount the checked out code into the containers. By cloning the
directory, now there's also a `docker-compose.override.yml` file in the current
directory in addition to `docker-compose.yml` and is used to modify the
configuration for development mode.

Now run

    docker-compose up -d
