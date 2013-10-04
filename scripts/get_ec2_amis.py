#get the default AMI's and titles for the 8 EC2 datacenters through endless screen scraping
#please destroy me when EC2 provides this data through JSON ;)


import time, datetime
import sys

try:
    from splinter import Browser
except:
    sys.exit('install splinter, ./bin/pip install splinter')


then = datetime.datetime.now()
URL = 'https://console.aws.amazon.com/'
EC2_USER = ''
EC2_PASS = ''

browser = Browser()
browser.visit(URL)


browser.find_by_css('#ap_email').fill(EC2_USER)
browser.find_by_css('#ap_password').fill(EC2_PASS)
browser.find_by_css('#signInSubmit').click()

for provider in ['us-east-1', 'us-west-2', 'us-west-1', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1', 'ap-southeast-2','sa-east-1']:
    browser.visit('https://console.aws.amazon.com/ec2/v2/home?region=%s' % provider)
    time.sleep(6)
    #wait to load otherwise it fails
    browser.find_by_css('.gwt-Button').click()
    time.sleep(6)
    browser.find_by_css('#scenario').click()
    browser.find_by_name('key-pair-method')[2].click()
    #select no key, because for example ap-southeast-2 does not have the existing keys, 
    #and this asks for a key without letting you to proceed with the images

    provider_images = []
    for i in range (1, len(browser.find_by_css('tr.scenario_description'))):
        browser.execute_script("$('tr.scenario_description').eq(%d).click()" % i)
        browser.execute_script("$('#qs_continue_scenario .elasticbig-container').click()")
        line = browser.evaluate_script("$('.wizard_review h1.ami_name').eq(0).text()")
        ami = line.split(' (')[1].replace(')','')
        title = line.split(' (')[0]
        if browser.find_by_css('.wizard_review .details dd')[1].text == 'i386':
            title += ' 32bit'
        else:
            title += ' 64bit'
        new_pair = (ami, title)
        if new_pair not in provider_images:
            provider_images.append(new_pair)
        browser.execute_script("$('.wizardReview .wizardBackButton').eq(0).find('a').click()")
        browser.find_by_css('tr.scenario_description')[i].find_by_css('input#i386')[0].click()
        #select the i386 also
        
        browser.execute_script("$('#qs_continue_scenario .elasticbig-container').click()")
        line = browser.evaluate_script("$('.wizard_review h1.ami_name').eq(0).text()")
        ami = line.split(' (')[1].replace(')','')
        import pdb; pdb.set_trace()
        title = line.split(' (')[0]
        if browser.find_by_css('.wizard_review .details dd')[1].text == 'i386':
            title += ' 32bit'
        else:
            title += ' 64bit'
        new_pair = (ami, title)
        if new_pair not in provider_images:
            provider_images.append(new_pair)
        browser.find_by_css('.wizardBackButton')[1].click()
    
    print '    \'%s\': {' % provider      
    for ami, image in provider_images: 
        print '        \'%s\': \'%s\',' % (ami, image)
    print '    },' 
    #lame formating for easy copy paste to ec2_images.EC2_IMAGES dict
    
now = datetime.datetime.now()
total = (now-then).seconds
print 'took %s seconds\n' % total
