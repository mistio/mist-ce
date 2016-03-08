#get the default AMI's and titles for the 8 EC2 datacenters through endless screen scraping
#please destroy me when EC2 provides this data through JSON ;)
import time, datetime, sys, re
try:
    from splinter import Browser
except:
    sys.exit('install splinter, ./bin/pip install splinter')

EC2_USER = ""
EC2_PASS = ""
#user + pass you login on console.aws.amazon.com

URL = 'https://console.aws.amazon.com/'
browser = Browser()
browser.visit(URL)
browser.find_by_css('#ap_email').fill(EC2_USER)
browser.find_by_css('#ap_password').fill(EC2_PASS)
browser.find_by_css('#signInSubmit-input').click()

then = datetime.datetime.now()
for provider in ['eu-central-1', 'us-east-1', 'us-west-2', 'us-west-1', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1', 'ap-southeast-2','sa-east-1', 'ap-northeast-2']:
    provider_images = []
    browser.visit('https://console.aws.amazon.com/ec2/v2/home?region=%s' % provider)
    time.sleep(10)
    #wait to load otherwise it fails
    browser.find_by_css('.gwt-Button').click()

    time.sleep(1)

    divs = browser.find_by_css('.NB')
    divs.extend(browser.find_by_css('.PB'))
    divs.extend(browser.find_by_css('.BC'))


    print '    \'%s\': {' % provider
    for div in divs:
        if 'Microsoft Windows' in div.value:
            continue
        value = div.value.split('\n')
        if 'ami' in value[3]:
            ami_in = value[3]
        else:
            ami_in = value[4]
        name = ami_in.split(' - ')[0]

        a = re.findall(r'ami-\w+\s+\(64-bit\)', ami_in)
        if a:
            ami = a[0].split(' (64-bit)')[0]
            print '        \'%s\': \'%s (64-bit)\',' % (ami, name)
        b = re.findall(r'ami-\w+\s+\(32-bit\)', ami_in)
        if b:
             ami = b[0].split(' (32-bit)')[0]
             print '        \'%s\': \'%s (32-bit)\',' % (ami, name)

        c = re.findall(r'ami-\w+$', ami_in)
        if c:
            print '        \'%s\': \'%s\',' % (c[0], name)

    print '    },'
    #lame formating for easy copy paste to ec2_images.EC2_IMAGES dict

now = datetime.datetime.now()
total = (now-then).seconds
print 'took %s seconds\n' % total
