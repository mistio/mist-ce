# -*- coding: utf-8 -*-

# get pricing for rackspace providers by asking rackspace.
# Outputs dicts with providers and pricing per size, per image type, suitable for mist.io's config.py

import requests, json

prices_url = 'https://www.rackspace.com/profiles/www/modules/custom/rs/json/prices.json'

GBP_TO_DOLLAR_RATE = requests.get('http://api.fixer.io/latest?base=GBP&symbols=USD').json()['rates']['USD'] 
# For conversion of Rackspace London prices to dollar



all_prices = requests.get(prices_url).json().get('geo')
us_prices = all_prices.get('USA').get('rates').get('cloud-servers')
uk_prices = all_prices.get('UK').get('rates').get('cloud-servers')
aus_prices = all_prices.get('AUS').get('rates').get('cloud-servers')
apac_prices = all_prices.get('APAC').get('rates').get('cloud-servers')

sizes = {}
sizes['rackspacenovadfw'] = {}
sizes['rackspacenovalon'] = {}
sizes['rackspacenovasyd'] = {}
sizes['rackspacenovahkg'] = {}

# TODO: RACKSPACE_FIRST_GEN_REGIONS = ['uk', 'us']

flavor_type_mapping = {
    'genv1-1024' : 'general1-1',
    'genv1-2048' :'general1-2',
    'genv1-4096' : 'general1-4',
    'genv1-8192' :'general1-8',
    'memv1-15360': 'memory1-15',
    'memv1-30720': 'memory1-30',
    'memv1-61440': 'memory1-60',
    'memv1-122880': 'memory1-120',
    'memv1-245760': 'memory1-240',
    'cpuv1-3840': 'compute1-4',
    'cpuv1-7680': 'compute1-8',
    'cpuv1-15360': 'compute1-15',
    'cpuv1-30720': 'compute1-30',
    'cpuv1-61440': 'compute1-60',
    'iov1-15360': 'io1-15',
    'iov1-30720': 'io1-30',
    'iov1-61440': 'io1-60',
    'iov1-92160': 'io1-90',
    'iov1-122880': 'io1-120',
}


def get_size_per_region(prices, region):
    for flavor_type in prices:
        if flavor_type in ['cpuv1', 'memv1', 'iov1', 'genv1']:
            for flavor_os in prices[flavor_type]:
                for flavor_size in prices[flavor_type][flavor_os]:
                    size = '%s-%s' % (flavor_type, str(flavor_size))
                    size = flavor_type_mapping[size]
                    if not sizes[region].get(size):
                        sizes[region][size] = {}
                    if region == 'rackspacenovalon':
                        infrastructure = prices[flavor_type][flavor_os][flavor_size]['infrastructure']['managed-inf']['GBP']
                        support = prices[flavor_type][flavor_os][flavor_size]['support']['managed-inf']['GBP']
                        sizes[region][size][flavor_os] = (infrastructure + support) * GBP_TO_DOLLAR_RATE
                    else:
                        infrastructure = prices[flavor_type][flavor_os][flavor_size]['infrastructure']['managed-inf']['USD']
                        support = prices[flavor_type][flavor_os][flavor_size]['support']['managed-inf']['USD']
                        sizes[region][size][flavor_os] = infrastructure + support

get_size_per_region(us_prices, region='rackspacenovadfw')
sizes['rackspacenovaord'] = sizes['rackspacenovadfw']
sizes['rackspacenovaiad'] = sizes['rackspacenovadfw']

get_size_per_region(uk_prices, region='rackspacenovalon')
get_size_per_region(aus_prices, region='rackspacenovasyd')
get_size_per_region(apac_prices, region='rackspacenovahkg')

# TODO: rackspace first gen http://www.rackspace.com/cloud/pricing/


#formatting for easy copy/paste to mist.io/config.py
for rack_key in sizes.keys():
    if sizes[rack_key].keys():
        print "        \"%s\": {" % rack_key
        for image in sizes[rack_key].keys()[:-1]:
            print "            \"%s\": %s," % (image, json.dumps(sizes[rack_key][image]))
        image = sizes[rack_key].keys()[-1]
        print "            \"%s\": %s" % (image, json.dumps(sizes[rack_key][image]))
        #don't use a comma for the last key, for valid JSON
        print '        },\n'
