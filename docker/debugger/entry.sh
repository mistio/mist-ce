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
/usr/sbin/sshd -D
