var POLICY_FORM_FIELDS = [{
    name: "permission",
    label: "Permission *",
    type: "dropdown",
    value: "",
    defaultValue: "",
    show: true,
    required: true,
    options: [{
        title: "Allow",
        val: "allow"
    }, {
        title: "Deny",
        val: "deny"
    }]
}, {
    name: "source",
    label: "Source *",
    type: "dropdown",
    value: "",
    defaultValue: "",
    show: true,
    required: true,
    options: [{
        title: "Cloud",
        val: "cloud"
    }, {
        title: "Machine",
        val: "machine"
    }, {
        title: "Script",
        val: "script"
    }, {
        title: "Network",
        val: "network"
    }, {
        title: "Key",
        val: "key"
    }, {
        title: "Template",
        val: "template"
    }]
}, {
    name: "action",
    label: "Actions *",
    type: "dropdown",
    value: "",
    defaultValue: "",
    show: false,
    required: true,
    options: [],
    showIf: {
        fieldName: "source",
        fieldExists: true
    },
    optionsIf: {
        fieldName: "source",
        fieldOptions: {
            cloud: [{
                title: "All",
                val: "all"
            }, {
                title: "add",
                val: "add"
            }],
            machine: [{
                title: "create",
                val: "create"
            }, {
                title: "read",
                val: "Read"
            }, {
                title: "Edit",
                val: "Edit"
            }, {
                title: "EditTags",
                val: "EditTags"
            }, {
                title: "EditRules",
                val: "EditRules"
            }, {
                title: "EditCustomMetrics",
                val: "EditCustomMetrics"
            }, {
                title: "Start",
                val: "Start"
            }, {
                title: "Stop",
                val: "Stop"
            }, {
                title: "Reboot",
                val: "Reboot"
            }, {
                title: "Destroy",
                val: "Destroy"
            }, {
                title: "RunScript",
                val: "RunScript"
            }, {
                title: "OpenShell",
                val: "OpenShell"
            }, {
                title: "AssociateKey",
                val: "AssociateKey"
            }, {
                title: "DisassociateKey",
                val: "DisassociateKey"
            }],
            script: [{
                title: "Add",
                val: "Add"
            }, {
                title: "Read",
                val: "Read"
            }, {
                title: "Edit",
                val: "Edit"
            }, {
                title: "Run",
                val: "Run"
            }, {
                title: "Remove",
                val: "Remove"
            }],
            network: [{
                title: "Create",
                val: "Create"
            }, {
                title: "Read",
                val: "Read"
            }, {
                title: "Edit",
                val: "Edit"
            }, {
                title: "Remove",
                val: "Remove"
            }, {
                title: "AllocateAddress",
                val: "AllocateAddress"
            }],
            key: [{
                title: "Add",
                val: "Add"
            }, {
                title: "Read",
                val: "Read"
            }, {
                title: "ReadPrivate",
                val: "ReadPrivate"
            }, {
                title: "Remove",
                val: "Remove"
            }, {
                title: "Edit",
                val: "Edit"
            }],
            template: [{
                title: "Add",
                val: "Add"
            }, {
                title: "Read",
                val: "Read"
            }, {
                title: "Edit",
                val: "Edit"
            }, {
                title: "Remove",
                val: "Remove"
            }, {
                title: "Apply",
                val: "Apply"
            }]
        }
    }
}, {
    name: "tags",
    label: "Tags *",
    type: "dropdown",
    value: "",
    defaultValue: "",
    show: true,
    required: true,
    options: [],
    showIf: {
        fieldName: "source",
        fieldExists: true
    }
}];

var CLOUD_ADD_FORM_FIELDS = [{
    title: 'Azure',
    val: 'azure',
    className: 'provider-azure',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "Azure",
        defaultValue: "Azure",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "subscription_id",
        label: "Subscription ID *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter subscription id",
        helpText: "You can find your subscriptionID on the Azure portal",
        helpHref: "http://docs.mist.io/article/18-adding-microsoft-azure"
    }, {
        name: "certificate",
        label: "Certificate *",
        type: "file",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        buttonText: "Add Certificate",
        buttonFilledText: "Certificate",
        helpText: "Your Azure certificate PEM file",
        helpHref: "http://docs.mist.io/article/18-adding-microsoft-azure"
    }]
}, {
    title: 'CoreOS',
    val: 'coreos',
    className: 'provider-coreos',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "CoreOS",
        defaultValue: "CoreOS",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "machine_ip",
        label: "Hostname *",
        type: "text",
        value: "",
        defaultValue: "",
        placeholder: "DNS or IP",
        show: true,
        required: true,
        errorMessage: "Please enter hostname"
    }, {
        name: "machine_key",
        label: "SSH Key",
        type: "dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        options: []
    }, {
        name: "machine_user",
        label: "User",
        type: "text",
        value: "root",
        defaultValue: "root",
        show: true,
        required: false,
        showIf: {
            fieldName: "machine_key",
            fieldExists: true
        }
    }, {
        name: "machine_port",
        label: "Port",
        type: "text",
        value: 22,
        defaultValue: 22,
        show: true,
        required: false,
        showIf: {
            fieldName: "machine_key",
            fieldExists: true
        }
    }, {
        name: "monitoring",
        label: "Enable monitoring",
        type: "switch",
        value: true,
        defaultValue: true,
        show: true,
        required: false,
        showIf: {
            fieldName: "machine_key",
            fieldExists: true
        }
    }]
}, {
    title: 'Digital Ocean',
    val: 'digitalocean',
    className: 'provider-digitalocean',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "Digital Ocean",
        defaultValue: "Digital Ocean",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "token",
        label: "Token *",
        type: "password",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter token",
        helpText: 'You can find your API Token on the Digital Ocean portal',
        helpHref: 'http://docs.mist.io/article/19-adding-digital-ocean'
    }]
}, {
    title: 'Docker',
    val: 'docker',
    className: 'provider-docker',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "Docker",
        defaultValue: "Docker",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "host",
        label: "Host *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter host",
    }, {
        name: "authentication",
        label: "Authentication",
        type: "dropdown",
        value: "basic",
        defaultValue: "basic",
        options: [{
            val: "basic",
            title: "Basic"
        }, {
            val: "tls",
            title: "TLS"
        }],
        show: true,
        required: true,
        errorMessage: "Please choose authentication method",
    }, {
        name: "user",
        label: "Username",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        showIf: {
            fieldName: "authentication",
            fieldValues: ["basic"]
        }
    }, {
        name: "password",
        label: "Password",
        type: "password",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        showIf: {
            fieldName: "authentication",
            fieldValues: ["basic"]
        }
    }, {
        name: "key",
        label: "Key",
        type: "textarea",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        showIf: {
            fieldName: "authentication",
            fieldValues: ["tls"]
        }
    }, {
        name: "certificate",
        label: "Certificate",
        type: "textarea",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        showIf: {
            fieldName: "authentication",
            fieldValues: ["tls"]
        }
    }, {
        name: "ca_certificate",
        label: "CA Certificate",
        type: "textarea",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        showIf: {
            fieldName: "authentication",
            fieldValues: ["tls"]
        }
    }]
}, {
    title: 'EC2',
    val: 'ec2',
    className: 'provider-ec2',
    options: [{
        name: "region",
        label: "Region *",
        type: "dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    }, {
        name: "title",
        label: "Title *",
        type: "text",
        value: "EC2",
        defaultValue: "EC2",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "apikey",
        label: "API Key *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        helpText: 'You can find your API key on your Amazon console',
        helpHref: 'http://docs.mist.io/article/17-adding-amazon-ec2'
    }, {
        name: "apisecret",
        label: "Password *",
        type: "password",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        helpText: 'You can find your API secret on your Amazon console',
        helpHref: 'http://docs.mist.io/article/17-adding-amazon-ec2'
    }]
}, {
    title: 'GCE',
    val: 'gce',
    className: 'provider-gce',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "GCE",
        defaultValue: "GCE",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "project_id",
        label: "Project ID *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter project's ID",
        helpText: 'You can find your project ID on your GCE portal',
        helpHref: 'http://docs.mist.io/article/21-adding-google-compute-engine'
    }, {
        name: "private_key",
        label: "Private Key *",
        type: "textarea",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter private key",
        helpText: 'You can create a new key on your GCE portal',
        helpHref: 'http://docs.mist.io/article/21-adding-google-compute-engine'
    }]
}, {
    title: 'HostVirtual',
    val: 'hostvirtual',
    className: 'provider-hostvirtual',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "HostVirtual",
        defaultValue: "HostVirtual",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "apikey",
        label: "API Key *",
        type: "password",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter API Key",
        helpText: 'You can find your API Token on the HostVirtual portal',
        helpHref: 'http://docs.mist.io/article/22-adding-hostvirtual'
    }]
}, {
    title: 'Indonesian Cloud',
    val: 'indonesian_vcloud',
    className: 'provider-indonesian',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "Indonesian Cloud",
        defaultValue: "Indonesian Cloud",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "username",
        label: "Username *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter username",
        helpText: 'The username you use to login Indonesian Cloud\'s portal'
    }, {
        name: "password",
        label: "Password *",
        type: "password",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter password",
        helpText: 'The password you use to login Indonesian Cloud\'s portal'
    }, {
        name: "host",
        label: "Hostname *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter hostname",
        helpText: 'The URL or IP vCloud listens to',
        helpHref: 'http://docs.mist.io/article/31-adding-vmware-vcloud'
    }, {
        name: "indonesianRegion",
        label: "Region",
        type: "dropdown",
        value: "my.idcloudonline.com",
        defaultValue: "my.idcloudonline.com",
        options: [{
            val: "my.idcloudonline.com",
            title: "my.idcloudonline.com"
        }, {
            val: "compute.idcloudonline.com",
            title: "compute.idcloudonline.com"
        }],
        show: true,
        required: false
    }]
}, {
    title: 'KVM (via libvirt)',
    val: 'libvirt',
    className: 'provider-libvirt',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "KVM (libvirt)",
        defaultValue: "KVM (libvirt)",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "machine_hostname",
        label: "KVM hostname *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter KVM hostname",
        helpText: 'The URL or IP that your KVM hypervisor listens to',
        helpHref: 'http://docs.mist.io/article/24-adding-kvm'
    }, {
        name: "machine_key",
        label: "SSH Key",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        options: [],
        helpText: 'If you don\'t specify an SSH key, mist.io will assume that you are connecting via tcp (qemu+tcp)',
        helpHref: 'http://docs.mist.io/article/24-adding-kvm'
    }, {
        name: "machine_user",
        label: "SSH user",
        type: "text",
        value: "root",
        defaultValue: "root",
        show: true,
        required: false,
        helpText: 'The SSH user that Mist.io should try to connect as'
    }, {
        name: "ssh_port",
        label: "SSH port",
        type: "text",
        value: 22,
        defaultValue: 22,
        show: true,
        required: false
    }, {
        name: "images_location",
        label: "Path for *.iso images",
        type: "text",
        value: '/var/lib/libvirt/images',
        defaultValue: '/var/lib/libvirt/images',
        show: true,
        required: false,
        helpText: 'The path that your disk or iso images are located, example /var/lib/libvirt/images'
    }]
}, {
    title: 'Linode',
    val: 'linode',
    className: 'provider-linode',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "Linode",
        defaultValue: "Linode",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "apikey",
        label: "API Key *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter API Key",
        helpText: 'You can create an API key on your Linode portal',
        helpHref: 'http://docs.mist.io/article/25-adding-linode'
    }]
}, {
    title: 'Nephoscale',
    val: 'nephoscale',
    className: 'provider-nephoscale',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "Nephoscale",
        defaultValue: "Nephoscale",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "username",
        label: "Username *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter username",
        helpText: 'The username you use to connect to the Nephoscale portal'
    }, {
        name: "password",
        label: "Password *",
        type: "password",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter password",
        helpText: 'The password you use to connect to the Nephoscale portal'
    }]
}, {
    title: 'Openstack',
    val: 'openstack',
    className: 'provider-openstack',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "OpenStack",
        defaultValue: "OpenStack",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "username",
        label: "Username *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter username"
    }, {
        name: "password",
        label: "Password *",
        type: "password",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter password"
    }, {
        name: "auth_url",
        label: "Title *",
        type: "text",
        value: "OpenStack",
        defaultValue: "OpenStack",
        show: true,
        required: true,
        errorMessage: "Please enter url",
        helpText: 'Your OpenStack Auth URL',
        helpHref: 'http://docs.mist.io/article/27-adding-openstack'
    }, {
        name: "tenant_name",
        label: "Tenant Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter tenant name"
    }, {
        name: "region",
        label: "Region",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: false
    }]
}, {
    title: 'Packet',
    val: 'packet',
    className: 'provider-packet',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "Packet.net",
        defaultValue: "Packet.net",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "apikey",
        label: "API Key *",
        type: "password",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter API Key",
        helpText: 'You can find your API Token on the Packet.net portal',
        helpHref: 'http://docs.mist.io/article/100-adding-packet'
    }, {
        name: "project_id",
        label: "Project",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        errorMessage: "Please enter title",
        helpText: 'Optionally specify the project name'
    }]
}, {
    title: 'Rackspace',
    val: 'rackspace',
    className: 'provider-rackspace',
    options: [{
        name: "region",
        label: "Region *",
        type: "dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    }, {
        name: "title",
        label: "Title *",
        type: "text",
        value: "Rackspace",
        defaultValue: "Rackspace",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "username",
        label: "Username *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter title",
        helpText: 'The username you use to connect to the RackSpace portal'
    }, {
        name: "apikey",
        label: "API Key *",
        type: "password",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter API Key",
        helpText: 'You can find your API key on your RackSpace portal',
        helpHref: 'http://docs.mist.io/article/29-adding-rackspace'
    }]
}, {
    title: 'Softlayer',
    val: 'softlayer',
    className: 'provider-softlayer',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "SoftLayer",
        defaultValue: "SoftLayer",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "username",
        label: "Username *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter username",
        helpText: 'The username you use to connect to the SoftLayer portal'
    }, {
        name: "apikey",
        label: "API Key *",
        type: "password",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter API Key",
        helpText: 'You can find your API key on your SoftLayer portal',
        helpHref: 'http://docs.mist.io/article/30-adding-softlayer'
    }]
}, {
    title: 'VMWare vCloud',
    val: 'vcloud',
    className: 'provider-vcloud',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "VMWare vCloud",
        defaultValue: "VMWare vCloud",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "username",
        label: "Username *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter username",
        helpText: 'The username you use to login to vCloud Director'
    }, {
        name: "password",
        label: "Password *",
        type: "password",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter password",
        helpText: 'The password you use to login to vCloud Director'
    }, {
        name: "organization",
        label: "Organization *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter organization"
    }, {
        name: "host",
        label: "Hostname *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter hostname",
        helpText: 'The URL or IP vCloud listens to',
        helpHref: 'http://docs.mist.io/article/31-adding-vmware-vcloud'
    }]
}, {
    title: 'VMWare vSphere',
    val: 'vsphere',
    className: 'provider-vsphere',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "VMware vSphere",
        defaultValue: "VMware vSphere",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "username",
        label: "Username *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter username"
    }, {
        name: "password",
        label: "Password *",
        type: "password",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter password"
    }, {
        name: "host",
        label: "Hostname *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter hostname",
        helpText: 'The URL or IP vSphere listens to',
        helpHref: 'http://docs.mist.io/article/73-adding-vsphere'
    }]
}, {
    title: 'Vultr',
    val: 'vultr',
    className: 'provider-vultr',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "Vultr",
        defaultValue: "Vultr",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "apikey",
        label: "API Key *",
        type: "password",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter API Key",
        helpText: 'You can find your API Token on the Vultr portal',
        helpHref: 'http://docs.mist.io/article/72-adding-vultr'
    }]
}, {
    title: 'Other Server',
    val: 'bare_metal',
    className: 'provider-baremetal',
    options: [{
        name: "title",
        label: "Title *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        errorMessage: "Please enter title"
    }, {
        name: "machine_ip",
        label: "Hostname",
        type: "text",
        value: "Vultr",
        defaultValue: "Vultr",
        placeholder: 'DNS or IP',
        show: true,
        required: false,
        helpText: 'The URL or IP adress that your server listens to',
        helpHref: 'http://docs.mist.io/article/28-adding-other-servers'
    }, {
        name: "operating_system",
        label: "Operating System",
        type: "dropdown",
        value: "unix",
        defaultValue: "unix",
        show: true,
        required: false,
        options: [{
            title: "Unix",
            val: "unix"
        }, {
            title: "Windows",
            val: "windows"
        }]
    }, {
        name: "machine_key",
        label: "SSH Key",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        options: [],
        showIf: {
            fieldName: "operating_system",
            fieldValues: ["unix"]
        }
    }, {
        name: "machine_user",
        label: "User",
        type: "text",
        value: "root",
        defaultValue: "root",
        show: true,
        required: false,
        errorMessage: "Please enter user",
        showIf: {
            fieldName: "machine_key",
            fieldExists: true
        }
    }, {
        name: "machine_port",
        label: "Port",
        type: "text",
        value: 22,
        defaultValue: 22,
        show: true,
        required: false,
        errorMessage: "Please enter port",
        showIf: {
            fieldName: "machine_key",
            fieldExists: true
        }
    }, {
        name: "remote_desktop_port",
        label: "Remote Desktop Port",
        type: "text",
        value: 3389,
        defaultValue: 3389,
        errorMessage: "Please enter remote desktop's port",
        show: true,
        required: true,
        showIf: {
            fieldName: "operating_system",
            fieldValues: ["windows"]
        }
    }, {
        name: "monitoring",
        label: "Enable monitoring",
        type: "switch",
        value: true,
        defaultValue: true,
        show: true,
        required: false
    }]
}];

var SCRIPT_RUN_FORM_FIELDS = [{
    name: "machine",
    label: "Select Machine *",
    type: "dropdown",
    value: "",
    defaultValue: "",
    placeholder: "",
    show: true,
    required: true,
    options: []
}, {
    name: "parameters",
    label: "Parameters",
    type: "textarea",
    value: "",
    defaultValue: "",
    placeholder: "",
    errorMessage: "Please enter network's name",
    show: true,
    required: false
}, {
    name: "schedulerUse",
    label: "Use Scheduler",
    type: "switch",
    value: true,
    defaultValue: false,
    show: true,
    required: false
}, {
    name: "schedulerName",
    label: "Name *",
    type: "text",
    value: "",
    defaultValue: "",
    placeholder: "",
    errorMessage: "Please enter scheduler's name",
    show: true,
    required: true,
    showIf: {
        fieldName: "schedulerUse",
        fieldValues: [true]
    }
}, {
    name: "schedulerDescription",
    label: "Description",
    type: "textarea",
    value: "",
    defaultValue: "",
    placeholder: "",
    errorMessage: "Please enter scheduler's description",
    show: true,
    required: false,
    showIf: {
        fieldName: "schedulerUse",
        fieldValues: [true]
    }
}, {
    name: "schedulerEnabled",
    label: "Enabled",
    type: "switch",
    value: true,
    defaultValue: true,
    show: true,
    required: true,
    showIf: {
        fieldName: "schedulerUse",
        fieldValues: [true]
    }
}, {
    name: "schedulerRunImmediately",
    label: "Run Immediately",
    type: "switch",
    value: false,
    defaultValue: false,
    show: true,
    required: false,
    showIf: {
        fieldName: "schedulerUse",
        fieldValues: [true]
    }
}, {
    name: "schedulerAction",
    label: "Select Action",
    type: "dropdown",
    value: "",
    defaultValue: "",
    placeholder: "",
    show: true,
    required: false,
    options: [{
        title: "Reboot",
        val: "reboot"
    }, {
        title: "Destroy",
        val: "destroy"
    }, {
        title: "Start",
        val: "start"
    }],
    showIf: {
        fieldName: "schedulerUse",
        fieldValues: [true]
    }
}, {
    name: "schedulerExpires",
    label: "Expires",
    type: "datetime",
    value: "",
    defaultValue: "",
    show: true,
    required: false,
    showIf: {
        fieldName: "schedulerUse",
        fieldValues: [true]
    }
}, {
    name: "schedulerType",
    label: "Select Scheduler's Type *",
    type: "dropdown",
    value: "",
    defaultValue: "",
    show: true,
    required: true,
    options: [{
        title: "One Off",
        val: "one_off"
    }, {
        title: "Interval",
        val: "interval"
    }, {
        title: "Crontab",
        val: "crontab"
    }],
    showIf: {
        fieldName: "schedulerUse",
        fieldValues: [true]
    }
}, {
    name: "scedulerOneOffEntry",
    label: "One Off *",
    type: "text",
    value: "",
    defaultValue: "",
    placeholder: "",
    errorMessage: "Please enter one-off datetime",
    show: true,
    required: true,
    showIf: {
        fieldName: "schedulerType",
        fieldValues: ["one_off"]
    }
}, {
    name: "scedulerCrontabEntry",
    label: "Crontab *",
    type: "text",
    value: "",
    defaultValue: "",
    placeholder: "",
    errorMessage: "Please enter crontab",
    show: true,
    required: true,
    showIf: {
        fieldName: "schedulerType",
        fieldValues: ["crontab"]
    }
}, {
    name: "scedulerIntervalEveryEntry",
    label: "Every *",
    type: "number",
    value: 30,
    defaultValue: 30,
    placeholder: "",
    errorMessage: "Please enter crontab",
    show: true,
    required: true,
    showIf: {
        fieldName: "schedulerType",
        fieldValues: ["interval"]
    }
}, {
    name: "scedulerIntervalPeriodEntry",
    label: "Period *",
    type: "dropdown",
    value: "minutes",
    defaultValue: "minutes",
    placeholder: "",
    show: true,
    required: true,
    options: [{
        title: "Days",
        val: "days"
    }, {
        title: "Hours",
        val: "hours"
    }, {
        title: "Minutes",
        val: "minutes"
    }, {
        title: "Seconds",
        val: "seconds"
    }, {
        title: "Microseconds",
        val: "microsecaonds"
    }],
    showIf: {
        fieldName: "schedulerType",
        fieldValues: ["interval"]
    }
}];

var NETWORK_FORM_FIELDS = [{
    name: "name",
    label: "Name *",
    type: "text",
    value: "",
    defaultValue: "",
    placeholder: "",
    errorMessage: "Please enter network's name",
    show: true,
    required: true
}, {
    name: "cloud",
    label: "Cloud *",
    type: "dropdown",
    value: "",
    defaultValue: "",
    placeholder: "",
    errorMessage: "Please select a cloud",
    show: true,
    required: true,
    options: []
}, {
    name: "adminStateUp",
    label: "Admin State *",
    type: "dropdown",
    value: true,
    defaultValue: true,
    placeholder: "",
    show: true,
    required: true,
    options: [{
        title: "Up",
        val: true
    }, {
        title: "Down",
        val: false
    }]
}, {
    name: "createSubnet",
    label: "Create Subnet",
    type: "switch",
    value: false,
    defaultValue: false,
    placeholder: "",
    show: true,
    required: false
}, {
    name: "subnet_name",
    label: "Subnet Name",
    type: "text",
    value: "",
    defaultValue: "",
    placeholder: "",
    show: false,
    required: false,
    showIf: {
        fieldName: "createSubnet",
        fieldValues: [true]
    }
}, {
    name: "subnet_address",
    label: "Network Address (CIDR)",
    type: "text",
    value: "",
    defaultValue: "",
    placeholder: "",
    show: false,
    required: false,
    showIf: {
        fieldName: "subnet_name",
        fieldExists: true
    }
}, {
    name: "subnet_ipv",
    label: "IP Version",
    type: "dropdown",
    value: "ipv4",
    defaultValue: "ipv4",
    placeholder: "",
    show: false,
    required: false,
    options: [{
        title: "IPv4",
        val: "ipv4"
    }, {
        title: "IPv6",
        val: "ipv6"
    }],
    showIf: {
        fieldName: "subnet_address",
        fieldExists: true
    }
}, {
    name: "subnet_gatewayIp",
    label: "Gateway IP",
    type: "text",
    value: "",
    defaultValue: "",
    placeholder: "",
    show: false,
    required: false,
    showIf: {
        fieldName: "subnet_address",
        fieldExists: true
    }
}, {
    name: "subnet_disableGateway",
    label: "Disable Gateway",
    type: "checkbox",
    value: false,
    defaultValue: false,
    placeholder: "",
    show: false,
    required: false,
    showIf: {
        fieldName: "subnet_address",
        fieldExists: true
    }
}, {
    name: "subnet_enableDHCP",
    label: "Enable DHCP",
    type: "checkbox",
    value: false,
    defaultValue: false,
    placeholder: "",
    show: false,
    required: false,
    showIf: {
        fieldName: "subnet_address",
        fieldExists: true
    }
}, {
    name: "subnet_createRouter",
    label: "Create Router",
    type: "checkbox",
    value: false,
    defaultValue: false,
    placeholder: "",
    show: false,
    required: false,
    showIf: {
        fieldName: "subnet_address",
        fieldExists: true
    }
}, {
    name: "subnet_routerName",
    label: "Router Name",
    type: "text",
    value: "",
    defaultValue: "",
    placeholder: "",
    show: false,
    required: false,
    showIf: {
        fieldName: "subnet_createRouter",
        fieldValues: [true]
    }
}, {
    name: "network_routerPublicGateway",
    label: "Set Public Gateway",
    type: "checkbox",
    value: true,
    defaultValue: true,
    placeholder: "",
    show: false,
    required: false,
    showIf: {
        fieldName: "subnet_createRouter",
        fieldValues: [true]
    }
}, {
    name: "subnet_allocationPools",
    label: "Allocation Pools",
    type: "textarea",
    value: "",
    defaultValue: "",
    placeholder: "",
    show: false,
    required: false,
    showIf: {
        fieldName: "subnet_address",
        fieldExists: true
    }
}];

var SCRIPT_FORM_FIELDS = [{
    name: "name",
    label: "Name *",
    type: "text",
    value: "",
    defaultValue: "",
    placeholder: "",
    errorMessage: "Please enter script's name",
    show: true,
    required: true
}, {
    name: "description",
    label: "Description",
    type: "textarea",
    value: "",
    defaultValue: "",
    placeholder: "",
    errorMessage: "Please enter script's description",
    show: true,
    required: false
}, {
    name: "type",
    label: "Type *",
    type: "dropdown",
    value: "",
    defaultValue: "",
    errorMessage: "Please enter script's description",
    show: true,
    required: true,
    options: [{
        title: "Executable",
        val: "executable"
    }, {
        title: "Ansible Playbook",
        val: "ansible"
    }]
}, {
    name: "source",
    label: "Source *",
    type: "dropdown",
    value: "",
    defaultValue: "",
    errorMessage: "Please enter script's source",
    show: true,
    required: true,
    options: [{
        title: "Github",
        val: "github"
    }, {
        title: "URL",
        val: "url"
    }, {
        title: "Inline",
        val: "inline"
    }]
}, {
    name: "url",
    label: "Url *",
    type: "text",
    value: "http://",
    defaultValue: "http://",
    placeholder: "",
    show: false,
    required: true,
    showIf: {
        fieldName: "source",
        fieldValues: ["url"]
    },
    errorMessage: "Please enter a url"
}, {
    name: "url",
    label: "Github Repo *",
    type: "text",
    value: "https://github.com/owner/repo",
    defaultValue: "https://github.com/owner/repo",
    placeholder: "",
    show: false,
    required: true,
    showIf: {
        fieldName: "source",
        fieldValues: ["github"]
    },
    errorMessage: "Please enter a github repo"
}, {
    name: "entryPoint",
    label: "Entry point",
    type: "text",
    value: "",
    defaultValue: "",
    placeholder: "",
    show: false,
    required: false,
    showIf: {
        fieldName: "source",
        fieldValues: ["github", "url"]
    },
    errorMessage: "Please enter entry point"
}, {
    name: "script",
    label: "Script *",
    type: "textarea",
    value: "",
    defaultValue: "",
    placeholder: "",
    show: false,
    required: true,
    errorMessage: "Please enter inline script",
    showIf: {
        fieldName: "source",
        fieldValues: ["inline"]
    },
    placeholderIf: {
        fieldName: "type",
        fieldOptions: {
            "executable": "#!/bin/bash\necho 'hello world'",
            "ansible": "- name: Dummy ansible playbook\n\thosts: localhost\n\ttasks:\n\t\t- name: Dummy task\n\t\t\tdebug:\n\t\t\t\tmsg: 'Hello World'\n\thosts: localhost\n\ttasks:\n\t\t- name: Dummy task\n\t\t\tdebug: msg='Hello World'\n"
        }
    }
}];

var TIME_MAP = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000,
    YEAR: 12 * 30 * 24 * 60 * 60 * 1000,
};

Date.prototype.getMonthName = function(short) {
    if (short) {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
            'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ][this.getMonth()];
    }

    return ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
    ][this.getMonth()];
}

Date.prototype.getTimeFromNow = function() {
    var now = new Date();
    var diff = now - this;
    var ret = '';

    if (diff < 10 * TIME_MAP.SECOND)
        ret = 'Now';

    else if (diff < TIME_MAP.MINUTE)
        ret = parseInt(diff / TIME_MAP.SECOND) + ' sec';

    else if (diff < TIME_MAP.HOUR)
        ret = parseInt(diff / TIME_MAP.MINUTE) + ' min';

    else if (diff < TIME_MAP.DAY)
        ret = parseInt(diff / TIME_MAP.HOUR) + ' hour';

    else if (diff < 2 * TIME_MAP.DAY)
        ret = 'Yesterday';

    else if (diff < TIME_MAP.YEAR)
        ret = this.getMonthName(true) + ' ' + this.getDate();

    if (ret.indexOf('sec') > -1 ||
        ret.indexOf('min') > -1 ||
        ret.indexOf('hour') > -1) {

        // Add 's' for plural
        if (ret.split(' ')[0] != '1')
            ret = ret + 's';

        ret = ret + ' ago';
    }

    return ret;
}

var COUNTRIES = ["Afghanistan", "Åland Islands", "Albania", "Algeria",
    "American Samoa", "Andorra", "Angola", "Anguilla",
    "Antarctica", "Antigua and Barbuda", "Argentina",
    "Armenia", "Aruba", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh",
    "Barbados", "Belarus", "Belgium", "Belize", "Benin",
    "Bermuda", "Bhutan", "Bolivia",
    "Bosnia and Herzegovina", "Botswana", "Bouvet Island",
    "Brazil", "British Indian Ocean Territory",
    "Brunei Darussalam", "Bulgaria", "Burkina Faso",
    "Burundi", "Cambodia", "Cameroon", "Canada",
    "Cape Verde", "Cayman Islands",
    "Central African Republic", "Chad", "Chile", "China",
    "Christmas Island", "Cocos (Keeling) Islands",
    "Colombia", "Comoros", "Congo",
    "Congo, The Democratic Republic of the",
    "Cook Islands", "Costa Rica", "Cote D'Ivoire",
    "Croatia", "Cuba", "Cyprus", "Czech Republic",
    "Denmark", "Djibouti", "Dominica",
    "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea",
    "Estonia", "Ethiopia", "Falkland Islands (Malvinas)",
    "Faroe Islands", "Fiji", "Finland", "France",
    "French Guiana", "French Polynesia",
    "French Southern Territories", "Gabon", "Gambia",
    "Georgia", "Germany", "Ghana", "Gibraltar", "Greece",
    "Greenland", "Grenada", "Guadeloupe", "Guam",
    "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau",
    "Guyana", "Haiti", "Heard Island and Mcdonald Islands",
    "Holy See (Vatican City State)", "Honduras",
    "Hong Kong", "Hungary", "Iceland", "India",
    "Indonesia", "Iran, Islamic Republic Of", "Iraq",
    "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica",
    "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya",
    "Kiribati", "Korea, Democratic People'S Republic of",
    "Korea, Republic of", "Kuwait", "Kyrgyzstan",
    "Lao People'S Democratic Republic", "Latvia", "Lebanon",
    "Lesotho", "Liberia", "Libyan Arab Jamahiriya",
    "Liechtenstein", "Lithuania", "Luxembourg", "Macao",
    "Macedonia, The Former Yugoslav Republic of",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
    "Malta", "Marshall Islands", "Martinique", "Mauritania",
    "Mauritius", "Mayotte", "Mexico",
    "Micronesia, Federated States of",
    "Moldova, Republic of", "Monaco", "Mongolia",
    "Montserrat", "Morocco", "Mozambique", "Myanmar",
    "Namibia", "Nauru", "Nepal", "Netherlands",
    "Netherlands Antilles", "New Caledonia", "New Zealand",
    "Nicaragua", "Niger", "Nigeria", "Niue",
    "Norfolk Island", "Northern Mariana Islands", "Norway",
    "Oman", "Pakistan", "Palau",
    "Palestinian Territory, Occupied", "Panama",
    "Papua New Guinea", "Paraguay", "Peru", "Philippines",
    "Pitcairn", "Poland", "Portugal", "Puerto Rico",
    "Qatar", "Reunion", "Romania", "Russian Federation",
    "RWANDA", "Saint Helena", "Saint Kitts and Nevis",
    "Saint Lucia", "Saint Pierre and Miquelon",
    "Saint Vincent and the Grenadines", "Samoa",
    "San Marino", "Sao Tome and Principe", "Saudi Arabia",
    "Senegal", "Serbia and Montenegro", "Seychelles",
    "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
    "Solomon Islands", "Somalia", "South Africa",
    "South Georgia and the South Sandwich Islands",
    "Spain", "Sri Lanka", "Sudan", "Suriname",
    "Svalbard and Jan Mayen", "Swaziland", "Sweden",
    "Switzerland", "Syrian Arab Republic",
    "Taiwan, Province of China", "Tajikistan",
    "Tanzania, United Republic of", "Thailand",
    "Timor-Leste", "Togo", "Tokelau", "Tonga",
    "Trinidad and Tobago", "Tunisia", "Turkey",
    "Turkmenistan", "Turks and Caicos Islands", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates",
    "United Kingdom", "United States",
    "United States Minor Outlying Islands", "Uruguay",
    "Uzbekistan", "Vanuatu", "Venezuela", "Viet Nam",
    "Virgin Islands, British", "Virgin Islands, U.S.",
    "Wallis and Futuna", "Western Sahara", "Yemen",
    "Zambia", "Zimbabwe"
];
