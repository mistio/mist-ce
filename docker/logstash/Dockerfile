FROM logstash:5.6.4

CMD ["logstash", "-f", "/config-dir"]

ENV ELASTIC_URI=http://elasticsearch:9200 \
    ELASTIC_USERNAME=admin \
    ELASTIC_PASSWORD=admin

COPY ./config /config-dir
