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
    INFLUXDB_PORT=8086 \
    TSFDB_URL=http://tsfdb:8080/v1/datapoints

#RUN logstash-plugin install logstash-output-http
#RUN logstash-plugin install logstash-filter-grok
RUN logstash-plugin install logstash-output-stdout
RUN logstash-plugin install logstash-filter-http

COPY ./config /config-dir
