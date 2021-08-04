FROM mist/python3:latest

RUN pip install --no-cache-dir elasticsearch==6.8.0 certifi

COPY . /opt/elasticsearch-manage

WORKDIR /opt/elasticsearch-manage
