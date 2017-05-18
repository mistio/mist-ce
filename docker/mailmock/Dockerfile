FROM python:2.7-alpine

RUN pip install behaving

WORKDIR /var/mail

EXPOSE 8025

ENTRYPOINT ["mailmock", "-o", "8025", "-o", "/var/mail"]
