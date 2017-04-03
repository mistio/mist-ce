FROM alpine:3.4
MAINTAINER mist.io <support@mist.io>

RUN apk update && apk upgrade && \
    apk add python-dev py-pip git openssl-dev py-openssl && \
    apk add libffi-dev openssh build-base && \
    apk add uwsgi uwsgi-python perl libevent libevent-dev && \
    apk add python ca-certificates gnupg sed iputils

RUN pip install --upgrade pip

RUN rm -rf /var/cache/apk/*
