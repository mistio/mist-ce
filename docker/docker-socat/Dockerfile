FROM alpine

RUN apk add --update socat && rm -rf /var/cache/apk/*

ENTRYPOINT ["socat"]

CMD ["TCP4-LISTEN:2375,fork,reuseaddr", "UNIX-CONNECT:/var/run/docker.sock"]

EXPOSE 2375
