FROM gcr.io/mist-ops/alpine:3.4

COPY requirements.txt /mist.io/requirements.txt

WORKDIR /mist.io/

RUN pip install --no-cache-dir -r /mist.io/requirements.txt

COPY libcloud /mist.io/libcloud

RUN pip install -e libcloud/

COPY run_script /mist.io/run_script

COPY . /mist.io/

RUN pip install -e .
