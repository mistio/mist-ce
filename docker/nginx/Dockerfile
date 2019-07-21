FROM nginx:1.17.1-alpine

RUN set -x \
	# && addgroup -g 82 -S www-data \
	&& adduser -u 82 -D -S -G www-data www-data

COPY ./static /srv/www/static

COPY ./nginx.conf ./nginx-listen.conf /etc/nginx/
