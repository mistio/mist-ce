FROM logstash:5.6.9

CMD ["logstash", "-f", "/config-dir"]

ENV ELASTIC_URI=http://elasticsearch:9200 \
    ELASTIC_USERNAME=admin \
    ELASTIC_PASSWORD=admin

RUN logstash-plugin install logstash-output-influxdb

COPY ./config /config-dir
