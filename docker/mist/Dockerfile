FROM mist/mist:io-staging

ARG VERSION_REPO=mistio/mist.io
ARG VERSION_SHA
ARG VERSION_NAME

# Variables defined solely by ARG are accessible as environmental variables
# during build but not during runtime. To persist these in the image, they're
# redefined as ENV in addition to ARG.
ENV VERSION_REPO=$VERSION_REPO \
    VERSION_SHA=$VERSION_SHA \
    VERSION_NAME=VERSION_NAME

RUN echo "{\"sha\":\"$VERSION_SHA\",\"name\":\"$VERSION_NAME\",\"repo\":\"$VERSION_REPO\",\"modified\":false}" \
        > /mist-version.json
