"""Tests Cloud models and Controllers"""

import os
import uuid
import json
import random
import string
from time import time
from time import sleep
from mist.io.keypairs.models import Keypair
from mist.io.methods import create_machine, destroy_machine


def test_create_machine_list_machines(org, cloud, key, load_clouds_from_config):
    CLOUDS = load_clouds_from_config
    CLOUD_NAMES = [cdict['name'] for cdict in CLOUDS]

    # create_machine_params
    for cdict in CLOUDS:
        if cdict['provider'] == cloud.__class__.__name__[:-5].lower():
            machine_args = cdict['create_machine_params']
            break
    # machine_args = {cdict['create_machine_params'] for cdict in CLOUDS if
    #                 cdict['provider']== cloud.__class__.__name__[:-5]}

    job_id = uuid.uuid4().hex
    cloud_id = cloud.id
    key_id = key.id
    random_word = ''.join(random.choice(string.lowercase) for i in range(6))
    machine_name = 'karitest'+ random_word

    print ("****Create machine with name %s" % machine_name)
    result= create_machine(user=org, cloud_id=cloud_id, key_id=key_id,
                           machine_name=machine_name, ips=None,
                           monitoring=False, ssh_port=22, job_id=job_id,
                           **machine_args)
    # timeout = time() + 120
    # while time() < timeout:
    if result:
        assert result['job_id'] == job_id
        print ('****Create machine succeed with job_id: %s' % job_id)
        machine_id = result['id']
        # break
        # sleep(5)

    # pare to id apo to result kai gamise to onoma
    # spase se 2 loup
    timeout = time() + 120
    flag=False
    while time() < timeout:
        machines = cloud.ctl.list_machines()

        # # cause softlayer add .mist.io at the end of the machine_name
        # if cloud.__class__.__name__[:-5].lower() == 'softlayer':
        #     machine_name += '.mist.io'

        for m in machines:
            if m['machine_id'] == machine_id:
                print "****success, machine exists in list_machines"
                flag=True
                break
        if flag:
            break
        sleep(5)

    flag=False
    timeout = time() + 200
    while time() < timeout:
        machines = cloud.ctl.list_machines()

        for m in machines:
            if m['machine_id'] == machine_id and m['state'] == 'running':
                created_machine = m
                flag=True
                break
        if flag:
            break
        sleep(10)

    assert created_machine.state != 'pending', 'take too long'

    print("****test all possible actions")
    for action in ('start','stop','reboot','rename'):
        if created_machine.actions[action]:
            print('make action %s'% action)
            if action == 'start':
                created_machine.ctl.start()
            elif action == 'stop':
                created_machine.ctl.stop()
            elif action == 'undefine':
                created_machine.ctl.undefine()
            elif action == 'suspend':
                created_machine.ctl.suspend()
            elif action == 'resume':
                created_machine.ctl.resume()
            elif action == 'resize':
                created_machine.ctl.resize()
            elif action == 'rename':
                created_machine.ctl.rename('karitestsecond'+random_word)
            elif action == 'reboot':
                created_machine.ctl.reboot()

    print ("****destroy machine machine")
    destroy_machine(org, cloud.id, created_machine['machine_id'])
