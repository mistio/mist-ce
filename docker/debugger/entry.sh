#!/bin/sh

set -ex

mkdir -p /keys/
if [ ! -f /keys/id_rsa ] || [ ! -f /keys/id_rsa.pub ]; then
    rm -f /keys/id_rsa keys/id_rsa.pub
    ssh-keygen -t rsa -f /keys/id_rsa -P ''
fi
cat /keys/id_rsa.pub >> /root/.ssh/authorized_keys

if [ -x /opt/mistio-collectd/collectd.sh ]; then
    /opt/mistio-collectd/collectd.sh start
fi

if [ -x /etc/init.d/mist-telegraf ]; then
    /etc/init.d/mist-telegraf status || /etc/init.d/mist-telegraf start
fi

exec /usr/sbin/sshd -D
