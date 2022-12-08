FROM mist/python3:latest

RUN pip install --no-cache-dir elasticsearch==7.10.1 certifi ipdb

COPY . /opt/elasticsearch-manage

WORKDIR /opt/elasticsearch-manage
