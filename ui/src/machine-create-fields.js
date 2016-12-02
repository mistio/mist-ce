var MACHINE_CREATE_FIELDS = []

// AZURE
MACHINE_CREATE_FIELDS.push({
    provider: 'azure',
    fields: [{
        name: "name",
        label: "Machine Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true
    },{
        name: "image",
        label: "Image *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location",
        label: "Location *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "azure_port_bindings",
        label: "Azure Port Bindings",
        type: "text",
        value: "",
        defaultValue: "",
        show: false,
        required: false,
        helptext: ""
    },{
        name: "ports",
        label: "Ports *",
        type: "textarea",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        helptext: 'e.g. 80:80'
    },{
        name: "cloud_init",
        label: "Cloud Init *",
        type: "textarea",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: ''
    }]
});

// AZURE ARM
MACHINE_CREATE_FIELDS.push({
    provider: 'azure_arm',
    fields: [{
        name: "name",
        label: "Machine Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true
    },{
        name: "image",
        label: "Image *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location",
        label: "Location *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "cloud_init",
        label: "Cloud Init *",
        type: "textarea",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: ''
    }]
});


// DIGITALOCEAN
MACHINE_CREATE_FIELDS.push({
    provider: 'digitalocean',
    fields: [{
        name: "name",
        label: "Machine Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true
    },{
        name: "image",
        label: "Image *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location",
        label: "Location *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "cloud_init",
        label: "Cloud Init *",
        type: "textarea",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: ''
    }]
});

// DOCKER
MACHINE_CREATE_FIELDS.push({
    provider: 'docker',
    fields: [{
        name: "name",
        label: "Machine Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true
    },{
        name: "image",
        label: "Image *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "docker_env",
        label: "Docker Env",
        type: "textarea",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        helptext: "",
    },{
        name: "docker_command",
        label: "Docker Command",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        helptext: ""
    },{
        name: "docker_port_bindings",
        label: "Docker Port Bindings",
        type: "text",
        value: "",
        defaultValue: "",
        show: false,
        required: false,
        helptext: ""
    },{
        name: "docker_exposed_ports",
        label: "Docker Exposed Ports",
        type: "text",
        value: "",
        defaultValue: "",
        show: false,
        required: false,
        helptext: ""
    },{
        name: "ports",
        label: "Ports *",
        type: "textarea",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        helptext: 'e.g. 80:80'
    },{
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: ''
    }]
});

// AWS
MACHINE_CREATE_FIELDS.push({
    provider: 'ec2',
    fields: [{
        name: "name",
        label: "Machine Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true
    },{
        name: "image",
        label: "Image *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location",
        label: "Location *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "cloud_init",
        label: "Cloud Init *",
        type: "textarea",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: ''
    }]
});

// GCE
MACHINE_CREATE_FIELDS.push({
    provider: 'gce',
    fields: [{
        name: "name",
        label: "Machine Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true
    },{
        name: "image",
        label: "Image *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "image_extra",
        label: "Image extra",
        type: "text",
        value: "",
        defaultValue: "",
        show: false,
        required: true
    },{
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location",
        label: "Location *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location_name",
        label: "Location name",
        type: "text",
        value: "",
        defaultValue: "",
        show: false,
        required: true
    },{
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: ''
    }]
});

// HOSTVIRTUAL
MACHINE_CREATE_FIELDS.push({
    provider: 'hostvirtual',
    fields: [{
        name: "name",
        label: "Machine Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true
    },{
        name: "image",
        label: "Image *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location",
        label: "Location *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "cloud_init",
        label: "Cloud Init *",
        type: "textarea",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: ''
    }]
});

// INDONESIAN CLOUD
// MACHINE_CREATE_FIELDS.push({
//     provider: 'indonesian_vcloud',
//     fields: [{
//         name: "name",
//         label: "Machine Name *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true
//     },{
//         name: "image",
//         label: "Image *",
//         type: "mist_dropdown",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         options: []
//     },{
//         name: "size",
//         label: "Size *",
//         type: "mist_dropdown",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         options: []
//     },{
//         name: "location",
//         label: "Location *",
//         type: "mist_dropdown",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         options: []
//     },{
//         name: "key",
//         label: "Key *",
//         type: "ssh_key",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         options: []
//     },{
//         name: "cloud_init",
//         label: "Cloud Init *",
//         type: "textarea",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: false,
//         helptext: ''
//     },{
//         name: "monitoring",
//         label: "Enable monitoring",
//         type: "toggle",
//         value: "true",
//         defaultValue: "true",
//         show: true,
//         required: false,
//         helptext: ''
//     },{
//         name: "async",
//         label: "Async request",
//         type: "toggle",
//         value: "true",
//         defaultValue: "true",
//         show: false,
//         required: false,
//         helptext: ''
//     }]
// });

// // KVM
// MACHINE_CREATE_FIELDS.push({
//     provider: 'libvirt',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "KVM (libvirt)",
//         defaultValue: "KVM (libvirt)",
//         show: true,
//         required: true,
//         errorMessage: "Please enter title"
//     }, {
//         name: "machine_hostname",
//         label: "KVM hostname *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter KVM hostname",
//         helptext: 'The URL or IP that your KVM hypervisor listens to',
//         helpHref: 'http://docs.mist.io/article/24-adding-kvm'
//     }, {
//         name: "machine_key",
//         label: "SSH Key",
//         type: "ssh_key",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: false,
//         options: [],
//         helptext: 'If you don\'t specify an SSH key, mist.io will assume that you are connecting via tcp (qemu+tcp)',
//         helpHref: 'http://docs.mist.io/article/24-adding-kvm'
//     }, {
//         name: "machine_user",
//         label: "SSH user",
//         type: "text",
//         value: "root",
//         defaultValue: "root",
//         show: true,
//         required: false,
//         helptext: 'The SSH user that Mist.io should try to connect as'
//     }, {
//         name: "ssh_port",
//         label: "SSH port",
//         type: "text",
//         value: 22,
//         defaultValue: 22,
//         show: true,
//         required: false
//     }, {
//         name: "images_location",
//         label: "Path for *.iso images",
//         type: "text",
//         value: '/var/lib/libvirt/images',
//         defaultValue: '/var/lib/libvirt/images',
//         show: true,
//         required: false,
//         helptext: 'The path that your disk or iso images are located, example /var/lib/libvirt/images'
//     }]
// });

// LINODE
MACHINE_CREATE_FIELDS.push({
    provider: 'linode',
    fields: [{
        name: "name",
        label: "Machine Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true
    },{
        name: "image",
        label: "Image *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "image_extra",
        label: "Image extra",
        type: "text",
        value: "",
        defaultValue: "",
        show: false,
        required: true
    },{
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location",
        label: "Location *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location_name",
        label: "Location name",
        type: "text",
        value: "",
        defaultValue: "",
        show: false,
        required: true
    },{
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "cloud_init",
        label: "Cloud Init *",
        type: "textarea",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: ''
    }]
});

// NEPHOSCALE
MACHINE_CREATE_FIELDS.push({
    provider: 'nephoscale',
    fields: [{
        name: "name",
        label: "Machine Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true
    },{
        name: "image",
        label: "Image *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location",
        label: "Location *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: ''
    }]
});

// OPENSTACK
MACHINE_CREATE_FIELDS.push({
    provider: 'openstack',
    fields: [{
        name: "name",
        label: "Machine Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true
    },{
        name: "image",
        label: "Image *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location",
        label: "Location *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "networks",
        label: "Networks *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        options: []
    },{
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: '',
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: '',
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: ''
    }]
});

// PACKET
MACHINE_CREATE_FIELDS.push({
    provider: 'packet',
    fields: [{
        name: "name",
        label: "Machine Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true
    },{
        name: "image",
        label: "Image *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location",
        label: "Location *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: ''
    }]
});

// RACKSPACE
MACHINE_CREATE_FIELDS.push({
    provider: 'rackspace',
    fields: [{
        name: "name",
        label: "Machine Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true
    },{
        name: "image",
        label: "Image *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location",
        label: "Location *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: ''
    }]
});

// SOFTLAYER
MACHINE_CREATE_FIELDS.push({
    provider: 'softlayer',
    fields: [{
        name: "name",
        label: "Machine Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true
    },{
        name: "image",
        label: "Image *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location",
        label: "Location *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: ''
    }]
});

// VCLOUD
MACHINE_CREATE_FIELDS.push({
    provider: 'vcloud',
    fields: [{
        name: "name",
        label: "Machine Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true
    },{
        name: "image",
        label: "Image *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location",
        label: "Location *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "networks",
        label: "Networks *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        options: []
    },{
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: ''
    }]
});

// // VSPHERE
// MACHINE_CREATE_FIELDS.push({
//     provider: 'vsphere',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "VMware vSphere",
//         defaultValue: "VMware vSphere",
//         show: true,
//         required: true,
//         errorMessage: "Please enter title"
//     }, {
//         name: "username",
//         label: "Username *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter username"
//     }, {
//         name: "password",
//         label: "Password *",
//         type: "password",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter password"
//     }, {
//         name: "host",
//         label: "Hostname *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter hostname",
//         helptext: 'The URL or IP vSphere listens to',
//         helpHref: 'http://docs.mist.io/article/73-adding-vsphere'
//     }]
// });

// VULTR
MACHINE_CREATE_FIELDS.push({
    provider: 'vultr',
    fields: [{
        name: "name",
        label: "Machine Name *",
        type: "text",
        value: "",
        defaultValue: "",
        show: true,
        required: true
    },{
        name: "image",
        label: "Image *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "location",
        label: "Location *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    },{
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: ''
    },{
        name: "async",
        label: "Async request",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: false,
        required: false,
        helptext: ''
    }]
});

