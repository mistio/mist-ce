def select_docker():
    """
    Choose the container with the minimum load
    """
    # nodes = []
    # for node in docker_nodes:
    #     nodes.append(docker.Client(base_url=node, version='1.10'))
    #
    # if len(nodes) == 1:
    #     chosen_node = nodes[0]
    #     return chosen_node
    #
    # containers_number = nodes[0].info()['Containers']
    # chosen_node = nodes[0]
    #
    # for node in nodes:
    #     if node.info()['Containers'] < containers_number:
    #         containers_number = node.info()['Containers']
    #         chosen_node = node
    #
    # return chosen_node
    return None


def select_image(docker_node, flavor):
    """
    Select image
    """
    images = docker_node.images()

    for image in images:
        for tags in image['RepoTags']:
            if flavor in tags:
                image_id = image['Id']

    if not image_id:
        raise Exception("Could not find %s in images" % flavor)

    return image_id


def create_container(docker_node, image_id, environment={}):
    """
    Create docker container for the given image
    """
    try:
        container = docker_node.create_container(image=image_id, environment=environment)
        return container['Id']
    except Exception as e:
        print e


def start_container(docker_node, container):
    """
    Start previously created container
    """
    try:
        docker_node.start(container, publish_all_ports=True)
        return
    except Exception as e:
        print e


def get_mist_uri(docker_node, container, port):
    """
    Return the new uri, where io or core listens to
    """
    base_url = docker_node.base_url[:-4]
    mist_url = base_url + docker_node.port(container, int(port))[0]['HostPort']
    return mist_url


def docker_all_in_one(flavor, environment={}):
    if flavor not in ['io', 'core']:
        raise Exception("Flavor must be either 'io', or 'core'")

    node = select_docker()

    image = select_image(node, flavor)

    environment = {
        'BRANCH': "staging"
    }
    container = create_container(node, image, environment=environment)

    start_container(node, container)

    all_in_one = {
        'URL': get_mist_uri(node, container, port="8000"),
        'node': node,
        'container': container
    }
    return all_in_one
