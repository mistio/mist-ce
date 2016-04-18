import logging
import requests
import datetime


logging.getLogger().setLevel(logging.CRITICAL)


def mist_conn_str(conn_dict):
    parts = []
    dt_last_rcv = datetime.datetime.fromtimestamp(conn_dict['last_rcv'])
    conn_dict['last_rcv'] = dt_last_rcv
    for key in ('name', 'last_rcv', 'user', 'ip', 'user_agent', 'closed',
                'session_id'):
        if key in conn_dict:
            parts.append(conn_dict.pop(key))
    parts.extend(conn_dict.values())
    return ' - '.join(map(str, parts))


def query(host='127.0.0.1:8081'):
    resp = requests.get('http://' + host)
    if not resp.ok:
        print "Error response from host '%s': %s" % (host, resp.body)
        return
    res = resp.json()
    res['session'] = res.pop('main', [])
    for kind in res:
        conn_dicts = list(sorted(res[kind], key=lambda d: d.get('last_rcv')))
        title = ' %d %sS - %s ' % (len(conn_dicts), kind.upper(), host)
        print title.center(80, '-')
        for i, conn_dict in enumerate(conn_dicts):
            print '%d: %s' % (i + 1, mist_conn_str(conn_dict))
        print


if __name__ == '__main__':
    for port in (8081, 8082, 8083, 8084):
        print
        host = '127.0.0.1:%d' % port
        try:
            query(host)
        except Exception as exc:
            print "Error querying host '%s': %r" % (host, exc)
        print
