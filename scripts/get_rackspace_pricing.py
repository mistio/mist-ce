# -*- coding: utf-8 -*- 

#get pricing for rackspace providers by asking rackspace.
#Outputs dicts with providers and pricing per size, per image type, suitable for mist.io's config.py

import urllib
import urllib2
import cookielib
import json

#username and password as you login in https://mycloud.rackspace.com
username = ''
password = ''

rack_auth_url = 'https://mycloud.rackspace.com/'

payload = {
    'username': username,
    'password': password,
    'type': 'password'
    }
    

cj = cookielib.CookieJar()
opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cj))
urllib2.install_opener(opener)
data = urllib.urlencode(payload)
req = urllib2.Request(rack_auth_url, data)
urllib2.urlopen(req)
#authenticate to rackspace, to get a valid session id

rackspace_pricing_url = 'https://mycloud.rackspace.com/proxy/rax:offerings,offerings/offerings/22'
price_list = urllib2.urlopen(rackspace_pricing_url)
#then ask for the pricing list

data = price_list.read()
price_list = json.loads(data)
price_list = price_list['offering']['product']

image_mapping = {
    "Windows + SQL Web": 'mswinSQLWeb',
    "Windows + SQL Standard": 'mswinSQL',
    "Windows -": 'mswin',
    "RHEL": 'rhel',
    "Linux": 'linux',
    "Vyatta": 'vyatta',    
}


#available datacenters/regions
#rackspace dict on pricing.json refers to first generation cloud servers and is manually 
#created from http://www.rackspace.com/cloud/pricing/ First Gen...
rackspace = {
  'rackspacenovalon': {},
  'rackspacenovaiad': {},
  'rackspacenovasyd': {},
  'rackspacenovaord': {},
  'rackspacenovadfw': {},
  'rackspacenovahkg': {}
}

#FIXME: GBP mapping
currency_mapping = {
   'USD': '$',
   'GBP': 'GBP'
}

#populate our dict with prices

for prod in price_list:
    description = prod['description'] # description, contains the image type as well
    for image_type in image_mapping.keys():
        if image_type in description:
            image = image_mapping[image_type]
            break
    try:
        for line in prod['productCharacteristics']['productCharacteristic']:
            if line.get('characteristicCategory') == 'PROVISIONING':
                size = line['value'] #the size value, values 2-8
        for pricing in prod['priceList']['productOfferingPrice'][0]['prices']['price']: 
            currency = currency_mapping.get(pricing['currency'], '')
            amount = currency + pricing['amount'] + "/hour"
            region = 'rackspacenova' + pricing['region'].lower()
            try:
                rackspace[region][size][image] = amount
            except:
                rackspace[region][size] = {}
                rackspace[region][size][image] = amount
    except Exception as e: 
        pass
        #dicts for Bandwidth/Storage that do not interest us

        
#formatting for easy copy/paste to mist.io/config.py
for rack_key in rackspace.keys(): 
    print "        \"%s\": {" % rack_key
    for image in rackspace[rack_key].keys()[:-1]:
        print "            \"%s\": %s," % (image, json.dumps(rackspace[rack_key][image]))
    image = rackspace[rack_key].keys()[-1]   
    print "            \"%s\": %s" % (image, json.dumps(rackspace[rack_key][image]))   
    #don't use a comma for the last key, for valid JSON
    print '        },\n'

