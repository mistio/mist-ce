FROM nginx:1.17.1-alpine

RUN set -x \
	# && addgroup -g 82 -S www-data \
	&& adduser -u 82 -D -S -G www-data www-data

COPY ./static /srv/www/static

RUN wget https://github.com/novnc/noVNC/archive/master.tar.gz && \
	tar xvzf master.tar.gz && \
	rm master.tar.gz && rmdir /srv/www/static/novnc && \
	mv noVNC-master /srv/www/static/novnc

COPY ./nginx.conf ./nginx-listen.conf /etc/nginx/
