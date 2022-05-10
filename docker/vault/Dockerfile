FROM vault:latest
RUN apk add vim grep socat jq
RUN wget -O /bin/wait-for https://github.com/eficode/wait-for/releases/download/v2.2.3/wait-for \
    && chmod +x /bin/wait-for
COPY ./init /init
COPY vault-start.sh /vault-start.sh
