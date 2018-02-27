#!/bin/sh

set -e

if [ -d mist.io/ ]; then
    io_dir=./mist.io
else
    io_dir=.
fi

TAG=${TAG:-$CI_COMMIT_SHA}
STACK=${STACK:-io}
DNS_ZONE=${ZONE:-mist.io}
JS_BUILD=${JS_BUILD:-True}

USAGE="Usage: $0 [-h|--help] [<KUBE_DIR> [<KUBE_DIR> .. ]]

Deploy application to kubernetes in order to run tests.

Must run this from the top directory of the git repository.

Positional arguments:
    KUBE_DIR                Directory containing kubernetes templates to
                            deploy. Defaults to

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
    STRIPE_SECRET_APIKEY    $STRIPE_SECRET_APIKEY
    STRIPE_PUBLIC_APIKEY    $STRIPE_PUBLIC_APIKEY

Optional environmental variables:

    Configure if built ui files are served

    JS_BUILD                0

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
TEMP_DIR=`mktemp -d`
if [ "$#" -eq 0 ]; then
    cp -r kubernetes/tests/ $TEMP_DIR
else
    for kube_dir in "$@"; do
        cp -r $kube_dir/ $TEMP_DIR
    done
fi

# Substitute environmental variables in kubernetes yaml definitions.
for var in NAMESPACE TAG SENDGRID_USERNAME SENDGRID_PASSWORD DEFAULT_MONITORING_METHOD \
           ELASTIC_URI ELASTIC_USERNAME ELASTIC_PASSWORD STACK STRIPE_SECRET_APIKEY STRIPE_PUBLIC_APIKEY JS_BUILD; do
    val=$(eval echo \$$var)
    if [ -z "$val" ]; then
        log "Enviromental variable \$$var is not set."
        exit 1
    fi
    find $TEMP_DIR/tests -type f -exec sed -i "s~REPLACE_$var~$val~g" {} \;
done

# Create load balancer and discover IP address.
log "Start applying kubernetes namespace and service files"
kubectl apply -f $TEMP_DIR/tests/namespace.yaml
kubectl apply -f $TEMP_DIR/tests/services --namespace $NAMESPACE
log "Discovering IP address of load balancer..."
IP_ADDR=""
while [ -z $IP_ADDR ]; do
    sleep 2
    IP_ADDR=$(kubectl --namespace $NAMESPACE get svc nginx \
              --template="{{range .status.loadBalancer.ingress}}{{.ip}}{{end}}")
done
log "Application's load balancer endpoint is $IP_ADDR"

# Create nginx and mist configs.
if [ -n "$DNS_PREFIX" ] && [ -n "$DNS_ZONE" ]; then
    MIST_URI=$DNS_PREFIX.$DNS_ZONE
else
    MIST_URI=$IP_ADDR
fi
sed -i "s/REPLACE_MIST_URI/$MIST_URI/g" $TEMP_DIR/tests/config/mist-conf.yaml
kubectl apply -f $TEMP_DIR/tests/config/ --namespace $NAMESPACE

# Deploy app.
kubectl apply -f $TEMP_DIR/tests/deployments --namespace $NAMESPACE
log "Application deployed"

# Label namespace to expire after a few hours.
if [ -n "$EXPIRE_HOURS" ]; then
    log "Will label namespace to expire after $EXPIRE_HOURS hours."
    expires=$(date -d "+$EXPIRE_HOURS hour" +%s)
    kubectl label namespace $NAMESPACE time-of-destruction="$expires" \
        --overwrite=true
fi

# Create Route53 A record for deployment.
if [ -n "$DNS_PREFIX" ] && [ -n "$DNS_ZONE" ]; then
    log "Creating DNS name."
    cli53 rrcreate --replace --wait \
        $DNS_ZONE "$DNS_PREFIX 30 A $IP_ADDR"
fi

# Wait for environment to become ready.
log "Waiting for environment to become ready."
$io_dir/scripts/wupar.sh $NAMESPACE
$io_dir/scripts/wupiao.sh http://$IP_ADDR

if [ -n "$OUTPUT_FILE" ]; then
    log "Storing the ip address ($IP_ADDR) to $OUTPUT_FILE."
    echo $IP_ADDR > $OUTPUT_FILE
fi
