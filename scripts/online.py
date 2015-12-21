import requests
from datetime import datetime

def getKey(item): 
    return item[2]

for port in [8081, 8082]:
    try:
        ret = requests.get('http://127.0.0.1:%d' % port)
        res = ret.json()
        print '-'*32 + ' SESSIONS: %s '%(port) + '-'*32
        i = 1
        for s in sorted(res['main'], key=getKey):
            print '%d: %s - %s - %s - %s - %s' % (i, datetime.fromtimestamp(s[2]).strftime('%c'), s[1], s[3], s[4], s[0])
            i+=1
        print '-'*80
	print ''
        print '-'*33 + ' SHELLS: %s '%(port) + '-'*33
        i = 1
        for s in sorted(res['shell'], key=getKey):
            print '%d: %s - %s - %s - %s - %s' % (i, datetime.fromtimestamp(s[2]).strftime('%c'), s[1], s[3], s[4], s[0])
            i+=1
        print '-'*80
    except:
        pass
