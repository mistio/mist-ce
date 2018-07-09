FROM logstash:5.6.10

CMD ["logstash", "-f", "/config-dir"]

ENV ELASTIC_URI=http://elasticsearch:9200 \
    ELASTIC_USERNAME=admin \
    ELASTIC_PASSWORD=admin \
    RABBITMQ_HOST=rabbitmq \
    RABBITMQ_PORT=5672 \
    RABBITMQ_USERNAME=guest \
    RABBITMQ_PASSWORD=guest \
    INFLUXDB_HOST=influxdb \
    INFLUXDB_PORT=8086

RUN logstash-plugin install logstash-output-influxdb

COPY ./config /config-dir
