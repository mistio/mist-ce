var MACHINE_CREATE_FIELDS = []

// // AZURE
// MACHINE_CREATE_FIELDS.push({
//     provider: 'azure',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "Azure",
//         defaultValue: "Azure",
//         show: true,
//         required: true,
//         errorMessage: "Please enter title"
//     }, {
//         name: "subscription_id",
//         label: "Subscription ID *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter subscription id",
//         helptext: "You can find your subscriptionID on the Azure portal",
//         helpHref: "http://docs.mist.io/article/18-adding-microsoft-azure"
//     }, {
//         name: "certificate",
//         label: "Certificate *",
//         type: "textarea",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         buttonText: "Add Certificate",
//         buttonFilledText: "Certificate",
//         helptext: "Your Azure certificate PEM file",
//         helpHref: "http://docs.mist.io/article/18-adding-microsoft-azure"
//     }]
// });

// // AZURE ARM
// MACHINE_CREATE_FIELDS.push({
//     provider: 'azure_arm',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "Azure ARM",
//         defaultValue: "Azure ARM",
//         show: true,
//         required: true,
//         errorMessage: "Please enter title"
//     }, {
//         name: "tenant_id",
//         label: "Tenant ID *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter tenant id",
//         helptext: "You can find your tenant ID on the Azure portal",
//         helpHref: "http://docs.mist.io/article/110-adding-azure-arm"
//     }, {
//         name: "subscription_id",
//         label: "Subscription ID *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter subscription id",
//         helptext: "You can find your subscriptionID on the Azure portal",
//         helpHref: "http://docs.mist.io/article/110-adding-azure-arm"
//     }, {
//         name: "key",
//         label: "Client key *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter client key",
//         helptext: "You can find your client key on the Azure portal",
//         helpHref: "http://docs.mist.io/article/110-adding-azure-arm"
//     }, {
//         name: "secret",
//         label: "Client secret *",
//         type: "password",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter client secret",
//         helptext: "You can find your client secret on the Azure portal",
//         helpHref: "http://docs.mist.io/article/110-adding-azure-arm"
//     }]
// });


// // COREOS
// MACHINE_CREATE_FIELDS.push(
//     {
//         provider: 'coreos',
//         fields: [{
//             name: "title",
//             label: "Title *",
//             type: "text",
//             value: "CoreOS",
//             defaultValue: "CoreOS",
//             show: true,
//             required: true,
//             errorMessage: "Please enter title"
//         }, {
//             name: "machine_ip",
//             label: "Hostname *",
//             type: "text",
//             value: "",
//             defaultValue: "",
//             placeholder: "DNS or IP",
//             show: true,
//             required: true,
//             errorMessage: "Please enter hostname"
//         }, {
//             name: "machine_key",
//             label: "SSH Key",
//             type: "dropdown",
//             value: "",
//             defaultValue: "",
//             show: true,
//             required: false,
//             options: []
//         }, {
//             name: "machine_user",
//             label: "User",
//             type: "text",
//             value: "root",
//             defaultValue: "root",
//             show: true,
//             required: false,
//             showIf: {
//                 fieldName: "machine_key",
//                 fieldExists: true
//             }
//         }, {
//             name: "machine_port",
//             label: "Port",
//             type: "text",
//             value: 22,
//             defaultValue: 22,
//             show: true,
//             required: false,
//             showIf: {
//                 fieldName: "machine_key",
//                 fieldExists: true
//             }
//         }, {
//             name: "monitoring",
//             label: "Enable monitoring",
//             type: "switch",
//             value: true,
//             defaultValue: true,
//             show: true,
//             required: false,
//             showIf: {
//                 fieldName: "machine_key",
//                 fieldExists: true
//             }
//         }]
//     }
// );


// // DIGITALOCEAN
// MACHINE_CREATE_FIELDS.push({
//     provider: 'digitalocean',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "Digital Ocean",
//         defaultValue: "Digital Ocean",
//         show: true,
//         required: true,
//         errorMessage: "Please enter title"
//     }, {
//         name: "token",
//         label: "Token *",
//         type: "password",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter token",
//         helptext: 'You can find your API Token on the Digital Ocean portal',
//         helpHref: 'http://docs.mist.io/article/19-adding-digital-ocean'
//     }]
// });

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
    }, {
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []

    }, {
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    }, {
        name: "ports",
        label: "Ports *",
        type: "textarea",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        helptext: 'e.g. 80:80'
    }, {
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: '',
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
    }, {
        name: "size",
        label: "Size *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    }, {
        name: "location",
        label: "Location *",
        type: "mist_dropdown",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    }, {
        name: "key",
        label: "Key *",
        type: "ssh_key",
        value: "",
        defaultValue: "",
        show: true,
        required: true,
        options: []
    }, {
        name: "cloud_init",
        label: "Cloud Init *",
        type: "textarea",
        value: "",
        defaultValue: "",
        show: true,
        required: false,
        helptext: '',
    }, {
        name: "monitoring",
        label: "Enable monitoring",
        type: "toggle",
        value: "true",
        defaultValue: "true",
        show: true,
        required: false,
        helptext: '',
    }]
});

// // GCE
// MACHINE_CREATE_FIELDS.push({
//     provider: 'gce',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "GCE",
//         defaultValue: "GCE",
//         show: true,
//         required: true,
//         errorMessage: "Please enter title"
//     }, {
//         name: "project_id",
//         label: "Project ID *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter project's ID",
//         helptext: 'You can find your project ID on your GCE portal',
//         helpHref: 'http://docs.mist.io/article/21-adding-google-compute-engine'
//     }, {
//         name: "private_key",
//         label: "Private Key *",
//         type: "textarea",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter private key",
//         helptext: 'You can create a new key on your GCE portal',
//         helpHref: 'http://docs.mist.io/article/21-adding-google-compute-engine'
//     }]
// });

// // HOSTVIRTUAL
// MACHINE_CREATE_FIELDS.push({
//     provider: 'hostvirtual',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "HostVirtual",
//         defaultValue: "HostVirtual",
//         show: true,
//         required: true,
//         errorMessage: "Please enter title"
//     }, {
//         name: "apikey",
//         label: "API Key *",
//         type: "password",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter API Key",
//         helptext: 'You can find your API Token on the HostVirtual portal',
//         helpHref: 'http://docs.mist.io/article/22-adding-hostvirtual'
//     }]
// });

// // INDONESIAN CLOUD
// MACHINE_CREATE_FIELDS.push({
//     provider: 'indonesian_vcloud',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "Indonesian Cloud",
//         defaultValue: "Indonesian Cloud",
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
//         errorMessage: "Please enter username",
//         helptext: 'The username you use to login Indonesian Cloud\'s portal'
//     }, {
//         name: "password",
//         label: "Password *",
//         type: "password",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter password",
//         helptext: 'The password you use to login Indonesian Cloud\'s portal',
//         helpHref: 'http://docs.mist.io/article/23-adding-indonesian-cloud'
//     }, {
//         name: "organization",
//         label: "Organization *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter organization",
//         helptext: 'The name of your organization'
//     }, {
//         name: "indonesianRegion",
//         label: "Region",
//         type: "dropdown",
//         value: "my.idcloudonline.com",
//         defaultValue: "my.idcloudonline.com",
//         options: [{
//             val: "my.idcloudonline.com",
//             title: "my.idcloudonline.com"
//         }, {
//             val: "compute.idcloudonline.com",
//             title: "compute.idcloudonline.com"
//         }],
//         show: true,
//         required: false
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

// // LINODE
// MACHINE_CREATE_FIELDS.push({
//     provider: 'linode',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "Linode",
//         defaultValue: "Linode",
//         show: true,
//         required: true,
//         errorMessage: "Please enter title"
//     }, {
//         name: "apikey",
//         label: "API Key *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter API Key",
//         helptext: 'You can create an API key on your Linode portal',
//         helpHref: 'http://docs.mist.io/article/25-adding-linode'
//     }]
// });

// // NEPHOSCALE
// MACHINE_CREATE_FIELDS.push({
//     provider: 'nephoscale',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "NephoScale",
//         defaultValue: "NephoScale",
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
//         errorMessage: "Please enter username",
//         helptext: 'The username you use to connect to the NephoScale portal'
//     }, {
//         name: "password",
//         label: "Password *",
//         type: "password",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter password",
//         helptext: 'The password you use to connect to the NephoScale portal'
//     }]
// });

// // OPENSTACK
// MACHINE_CREATE_FIELDS.push({
//     provider: 'openstack',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "OpenStack",
//         defaultValue: "OpenStack",
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
//         name: "auth_url",
//         label: "Auth Url *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter url",
//         helptext: 'Your OpenStack Auth URL',
//         helpHref: 'http://docs.mist.io/article/27-adding-openstack'
//     }, {
//         name: "tenant_name",
//         label: "Tenant Name *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter tenant name"
//     }, {
//         name: "region",
//         label: "Region",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: false
//     }]
// });

// // PACKET
// MACHINE_CREATE_FIELDS.push({
//     provider: 'packet',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "Packet",
//         defaultValue: "Packet",
//         show: true,
//         required: true,
//         errorMessage: "Please enter title"
//     }, {
//         name: "apikey",
//         label: "API Key *",
//         type: "password",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter API Key",
//         helptext: 'You can find your API Token on the Packet portal',
//         helpHref: 'http://docs.mist.io/article/100-adding-packet'
//     }, {
//         name: "project_id",
//         label: "Project",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: false,
//         errorMessage: "Please enter title",
//         helptext: 'Optionally specify the project name'
//     }]
// });

// // RACKSPACE
// MACHINE_CREATE_FIELDS.push({
//     provider: 'rackspace',
//     fields: [{
//         name: "region",
//         label: "Region *",
//         type: "dropdown",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         // SUPPORTED_PROVIDERS[9].regions.map(function(i){return {val:i.id, title: i.location}})
//         options: [{"val":"dfw","title":"Dallas"},{"val":"ord","title":"Chicago"},{"val":"iad","title":"N. Virginia"},{"val":"lon","title":"London"},{"val":"syd","title":"Sydney"},{"val":"hkg","title":"Hong Kong"},{"val":"rackspace_first_gen:us","title":"US-First Gen"},{"val":"rackspace_first_gen:uk","title":"UK-First Gen"}]
//     }, {
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "Rackspace",
//         defaultValue: "Rackspace",
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
//         errorMessage: "Please enter title",
//         helptext: 'The username you use to connect to the RackSpace portal'
//     }, {
//         name: "apikey",
//         label: "API Key *",
//         type: "password",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter API Key",
//         helptext: 'You can find your API key on your RackSpace portal',
//         helpHref: 'http://docs.mist.io/article/29-adding-rackspace'
//     }]
// });

// // SOFTLAYER
// MACHINE_CREATE_FIELDS.push({
//     provider: 'softlayer',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "SoftLayer",
//         defaultValue: "SoftLayer",
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
//         errorMessage: "Please enter username",
//         helptext: 'The username you use to connect to the SoftLayer portal'
//     }, {
//         name: "apikey",
//         label: "API Key *",
//         type: "password",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter API Key",
//         helptext: 'You can find your API key on your SoftLayer portal',
//         helpHref: 'http://docs.mist.io/article/30-adding-softlayer'
//     }]
// });

// // VCLOUD
// MACHINE_CREATE_FIELDS.push({
//     provider: 'vcloud',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "VMWare vCloud",
//         defaultValue: "VMWare vCloud",
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
//         errorMessage: "Please enter username",
//         helptext: 'The username you use to login to vCloud Director'
//     }, {
//         name: "password",
//         label: "Password *",
//         type: "password",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter password",
//         helptext: 'The password you use to login to vCloud Director'
//     }, {
//         name: "organization",
//         label: "Organization *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter organization"
//     }, {
//         name: "host",
//         label: "Hostname *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter hostname",
//         helptext: 'The URL or IP vCloud listens to',
//         helpHref: 'http://docs.mist.io/article/31-adding-vmware-vcloud'
//     }]
// });

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

// // VULTR
// MACHINE_CREATE_FIELDS.push({
//     provider: 'vultr',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "Vultr",
//         defaultValue: "Vultr",
//         show: true,
//         required: true,
//         errorMessage: "Please enter title"
//     }, {
//         name: "apikey",
//         label: "API Key *",
//         type: "password",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter API Key",
//         helptext: 'You can find your API Token on the Vultr portal',
//         helpHref: 'http://docs.mist.io/article/72-adding-vultr'
//     }]
// });

// // OTHER SERVER
// MACHINE_CREATE_FIELDS.push({
//     provider: 'bare_metal',
//     fields: [{
//         name: "title",
//         label: "Title *",
//         type: "text",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: true,
//         errorMessage: "Please enter title"
//     }, {
//         name: "machine_ip",
//         label: "Hostname",
//         type: "text",
//         placeholder: 'DNS or IP',
//         show: true,
//         required: false,
//         helptext: 'The URL or IP adress that your server listens to',
//         helpHref: 'http://docs.mist.io/article/28-adding-other-servers'
//     }, {
//         name: "operating_system",
//         label: "Operating System",
//         type: "dropdown",
//         value: "unix",
//         defaultValue: "unix",
//         show: true,
//         required: false,
//         options: [{
//             title: "Unix",
//             val: "unix"
//         }, {
//             title: "Windows",
//             val: "windows"
//         }]
//     }, {
//         name: "machine_key",
//         label: "SSH Key",
//         type: "ssh_key",
//         value: "",
//         defaultValue: "",
//         show: true,
//         required: false,
//         options: [],
//         showIf: {
//             fieldName: "operating_system",
//             fieldValues: ["unix"]
//         }
//     }, {
//         name: "machine_user",
//         label: "User",
//         type: "text",
//         value: "root",
//         defaultValue: "root",
//         show: true,
//         required: false,
//         errorMessage: "Please enter user",
//         showIf: {
//             fieldName: "machine_key",
//             fieldExists: true
//         }
//     }, {
//         name: "machine_port",
//         label: "Port",
//         type: "text",
//         value: 22,
//         defaultValue: 22,
//         show: true,
//         required: false,
//         errorMessage: "Please enter port",
//         showIf: {
//             fieldName: "machine_key",
//             fieldExists: true
//         }
//     }, {
//         name: "remote_desktop_port",
//         label: "Remote Desktop Port",
//         type: "text",
//         value: 3389,
//         defaultValue: 3389,
//         errorMessage: "Please enter remote desktop's port",
//         show: true,
//         required: true,
//         showIf: {
//             fieldName: "operating_system",
//             fieldValues: ["windows"]
//         }
//     }, {
//         name: "monitoring",
//         label: "Enable monitoring",
//         type: "toggle",
//         value: true,
//         defaultValue: true,
//         show: true,
//         required: false
//     }]
// });
