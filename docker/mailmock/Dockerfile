FROM python:2.7-alpine

RUN apk add --update python-dev libffi-dev musl-dev openssl-dev gcc git
RUN pip install behaving service_identity git+https://gitlab.ops.mist.io/mistio/localmail.git

WORKDIR /var/mail

EXPOSE 8025

ENTRYPOINT ["twistd", "-n", "localmail", "--smtp", "8025", "--imap", "8143", "--http", "8880", "--file", "localmail.mbox"]
#ENTRYPOINT ["mailmock", "-o", "8025", "-o", "/var/mail"]
