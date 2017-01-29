#!/usr/bin/env python
# This is taken from https://github.com/apache/libcloud/blob/trunk/contrib/update_google_prices.py

import os
import json
import simplejson
import sys
import time
import urllib2
import utils

GOOGLE_CLOUD_PRICES = 'https://cloudpricingcalculator.appspot.com/static/data/pricelist.json'


def main(argv):
    # Read the current pricing data.
    libcloud_data = {}

    # Download the current Google Cloud Platform pricing.
    req = urllib2.Request(GOOGLE_CLOUD_PRICES, '')
    google_ext_prices = json.loads(urllib2.urlopen(req).read())
    if 'gcp_price_list' not in google_ext_prices:
        sys.stderr.write('Google Cloud pricing data missing "gcp_price_list" node\n')
        sys.exit(1)

    # This is a map from regions used in the pricing JSON file to the regions as
    # reflected in the Google Cloud Platform documentation and APIs.
    pricing_to_region = {
        'us': 'us',
        'eu': 'europe',  # alias for 'europe'
        'europe': 'europe',
        'apac': 'asia',  # alias for 'asia'
        'asia': 'asia'
    }

    # Initialize Google Cloud Platform regions.
    for _, region in pricing_to_region.iteritems():
        libcloud_data['google_%s' % region] = {}

    # Update Google Compute Engine pricing.
    gcp_price_list = google_ext_prices['gcp_price_list']
    gce_vm_prefix = 'CP-COMPUTEENGINE-VMIMAGE-'
    for name, prices in gcp_price_list.iteritems():
        if not name.startswith(gce_vm_prefix):
            continue
        short_name = name[len(gce_vm_prefix):]
        machine_type = short_name.lower()
        for key, price in prices.iteritems():
            if key in pricing_to_region:
                region = pricing_to_region[key]
                libcloud_data['google_%s' % region][machine_type] = price

    # Update last-modified timestamp.

    # Write updated price list.
    json_str = simplejson.dumps(libcloud_data, indent=4 * ' ')
    print json_str


if __name__ == '__main__':
    sys.exit(main(sys.argv))
