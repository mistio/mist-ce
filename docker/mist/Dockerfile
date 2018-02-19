FROM mist/mist:io-staging

ARG IO_VERSION_SHA
ARG IO_VERSION_NAME

# Variables defined solely by ARG are accessible as environmental variables
# during build but not during runtime. To persist these in the image, they're
# redefined as ENV in addition to ARG.
ENV VERSION_REPO=mistio/mist.io \
    VERSION_SHA=$IO_VERSION_SHA \
    VERSION_NAME=$IO_VERSION_NAME

RUN ipython /mist.api/openapi/generate_api_spec.py

RUN echo "{\"sha\":\"$VERSION_SHA\",\"name\":\"$VERSION_NAME\",\"repo\":\"$VERSION_REPO\",\"modified\":false}" \
        > /mist-version.json
