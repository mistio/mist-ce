#!/bin/sh

set -e

TAG=${TAG:-$CI_COMMIT_REF_SLUG}
STACK=${STACK:-io}
DNS_ZONE=${ZONE:-mist.io}

USAGE="Usage: $0 [-h|--help]

Deploy application to kubernetes in order to run tests.

Must run this from the top directory of the git repository.

Options:
    -h,--help               Show this help message and exit.


Required environmental variables:
    Key                     Value
    ---                     -----
    NAMESPACE               $NAMESPACE
    TAG                     $TAG
    SENDGRID_USERNAME       $SENDGRID_USERNAME
    SENDGRID_PASSWORD       $SENDGRID_PASSWORD
    ELASTIC_URI             $ELASTIC_URI
    ELASTIC_USERNAME        $ELASTIC_USERNAME
    ELASTIC_PASSWORD        $ELASTIC_PASSWORD

Optional environmental variables:

    Set both to create DNS record for application:

    DNS_ZONE                $DNS_ZONE
    DNS_PREFIX              $DNS_PREFIX

    Set to a positive integer to destroy namespace after that many hours:

    EXPIRE_HOURS            0

    Set to a path where the IP address of the environment will be stored:

    OUTPUT_FILE

    Image prefix to use:

    STACK                   $STACK

"

log() { echo "$@" >&2; }

if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "$USAGE"
    exit
fi

# Make sure kubectl is installed.
if ! command -v kubectl > /dev/null; then
    log "Couldn't find kubectl executable in PATH."
    exit 1
fi

log "Preparing kubernetes files"
set -x
TEMP_DIR=`mktemp -d`
cp -r kubernetes/tests/ $TEMP_DIR

# Substitute environmental variables in kubernetes yaml definitions.
for var in NAMESPACE TAG SENDGRID_USERNAME SENDGRID_PASSWORD \
           ELASTIC_URI ELASTIC_USERNAME ELASTIC_PASSWORD STACK; do
    val=$(eval echo \$$var)
    if [ -z "$val" ]; then
        log "Enviromental variable \$$var is not set."
        exit 1
    fi
    find $TEMP_DIR/tests -type f -exec sed -i "s~REPLACE_$var~$val~g" {} \;
done

log "Start applying kubernetes namespace and service files"
kubectl apply -f $TEMP_DIR/tests/namespace.yaml
kubectl apply -f $TEMP_DIR/tests/services --namespace $NAMESPACE
IP_ADDR=""
while [ -z $IP_ADDR ]; do
    sleep 2
    IP_ADDR=$(kubectl --namespace $NAMESPACE get svc nginx \
              --template="{{range .status.loadBalancer.ingress}}{{.ip}}{{end}}")
done
log "Application's load balancer endpoint is $IP_ADDR"
# Create nginx and mist configs.
sed -i "s/REPLACE_MIST_URI/$IP_ADDR/g" $TEMP_DIR/tests/config/mist-conf.yaml
kubectl apply -f $TEMP_DIR/tests/config/ --namespace $NAMESPACE
# Deploy app.
kubectl apply -f $TEMP_DIR/tests/deployments --namespace $NAMESPACE
log "Application deployed"

# Label namespace to expire after a few hours.
if [ -n "$EXPIRE_HOURS" ]; then
    log "Will label namespace to expire after $EXPIRE_HOURS hours."
    expires=$(date -d "+$EXPIRE_HOURS hour")
    kubectl label namespace $NAMESPACE time-of-destruction=$expires \
        --overwrite=true
fi

# Create Route53 A record for deployment.
if [ -n "$DNS_PREFIX" ] && [ -n "$DNS_ZONE" ]; then
    log "Creating DNS name."
    cli53 rrcreate --replace --wait \
        mist.io "$CI_COMMIT_REF_SLUG.fatboy.ops 30 A $IP_ADDR"
fi

# Wait for environment to become ready.
log "Waiting for environment to become ready."
./scripts/wupar.sh $NAMESPACE
./scripts/wupiao.sh http://$IP_ADDR

if [ -n "$OUTPUT_FILE" ]; then
    log "Storing the ip address ($IP_ADDR) to $OUTPUT_FILE."
    echo $IP_ADDR > $OUTPUT_FILE
fi
