# Changelog

## v4.7.2 (18 May 2025)

- Bugfix: Critical security fixes contributed by Alex Perrakis (stolichnayer) and Efthymis Chatzoglou (efchatz)

## v4.7.1 (31 Jul 2022)

- Change: Add feature flag for parsing arp tables in Libvirt hosts
- Change: Regularly probe hosts with associated keys to determine cpu & ram
- Bugfix: Update UI when adding Libvirt hosts
- Bugfix: Fix tree view issue
- Bugfix: Fix LXD shell issue


## v4.7.0 (25 Jul 2022)

- Feature: Support for GKE & EKS managed clusters. Inventory, pricing, provisioning (APIv2 only), edit nodepools (APIv2 only).
- Feature: Serial console support for KVM machines
- Feature: Price catalog for block storage volumes (EE / HS only).
- Change: Improve installation process. Helm chart as the recommended method.
- Change: Refactor object storage support to improve performance.
- Change: Reduce amount of metadata about locations, images & sizes fetched by the UI to improve performance.
- Change: Rename CORE_URI to PORTAL_URI in settings.
- Change: Improve EC2 & GCP instance pricing.
- Change: Fetch KVM guest ifaces & IP addresses from Libvirt instead of parsing arp tables
- Change: Update paramiko, libcloud & RabbitMQ dependencies.
- Bugfix: Fix metering of block storage volumes.
- Bugfix: Fix Openstack issue when auth url contains a path.
- Bugfix: Fix execution of Ansible playbooks.
- Bugfix: Fix LXD shell support
- Bugfix: Fix execution of orchestration template workflows (EE/HS only)


## v4.6.2 (20 Dec 2021)

 - Change: Upgrade Elasticsearch & logstash, mitigates potential security issue
 - Change: Add monthly portal maintenance schedule to merge or delete old ES indices
 - Change: Improve API v2 exception handling
 - Change: Support regex field selectors on schedules (API only)
 - Change: Accelerate polling schedule after machine action
 - Change: Use sudo defensively when running monitoring commands over ssh
 - Change: Prioritize images tagged latest on docker create machine
 - Bugfix: Fix auth context for scheduled scripts
 - Bugfix: Allow multiple A record IPs on document validation
 - Bugfix: Prevent potential parsing exception for Azure Networks
 - Bugfix: Prevent UnboundLocalError when Azure machine listing API fails
 - Bugfix: Decode libvirt command output & error defensively, prevents potential machine listing issue
 - Bugfix: Pre-save rule before validating, prevents potential rule validation issue

## v4.6.1 (4 Dec 2021)

 - Change: Improve custom metric dialog usability
 - Change: Include DigitalOcean droplet snapshots in available images
 - Bugfix: Prevent redundant CloudSize JSON patches emitted from WebSocket which were causing UI hangs
 - Bugfix: Improve error handling in APIv2 listings
 - Bugfix: Fix loading issue in size constraints form (EE/HS only)

## v4.6.0 (26 Nov 2021)

 - Feature: Add support for VictoriaMetrics for storing monitoring & metering metrics
 - Feature: Add standalone K8s/OpenShift cluster as cloud
 - Feature: Add support managed K8s clusters on GCE, AWS clouds (API only)
 - Feature: Display tree view on machines page
 - Feature: Select security groups when creating machine on OpenStack clouds
 - Feature: Add support for networks on Alibaba clouds
 - Feature: Add support for Vexxhost clouds
 - Change: Replace Celery with Dramatiq for async tasks
 - Change: Replace Beat with APScheduler for scheduled tasks
 - Change: Drop support for vCloud & GigG8 clouds
 - Change: Support Vultr API v2
 - Change: Update Helm chart templates to work with k8s 1.22 or later.
 - Bugfix: Activate machine monitoring without requiring monitoring data request
 - Bugfix: Numerous minor bugfixes & UX improvements
 
## v4.5.5 (27 Jul 2021)

 - Bugfix: Prevent loss of hosts when disabling KVM clouds
 - Bugfix: Fix support of multiple locations & volume types on OpenStack clouds
 - Bugfix: Fix network listing on OpenStack when IPv6 subnet exists
 - Bugfix: Fix machine provisioning issue on OpenStack when attaching existing volume
 - Bugfix: Update RBAC mappings for images & locations when cloud added by non-owner (EE/HS only)

## v4.5.4 (15 Jun 2021)

 - Bugfix: Fix clone action for vSphere machines
 - Bugfix: Improve snapshot dialog for vSphere machines
 - Change: Support security group selection when creating OpenStack machines
 - Change: Revamp check_size implementation (EE/HS only)

## v4.5.3 (10 Jun 2021)

  - Bugfix: Declare dramatiq broker on every actor
  - Bugfix: Get cached_machines before creating the machine, closes(#120)
  - Bugfix: Fix schedule editing
  - Bugfix: Fix bug when size disk is absent for check_size (EE/HS only)
  - Change: Update snapshots dialog for vSphere machines
  - Change: Add more tests on constraints (EE/HS only)

## v4.5.2 (1 Jun 2021)

  - Bugfix: Fix constraints field & expiration output
  - Change: Don't update creation time on reboot for Azure machines
  - Change: Add constraints tests (EE/HS only)
  - Change: Improve apiv2 create machine spec
  
## v4.5.1 (26 May 2021)

 - Bugfix: Fix DNS hostname on provisioning
 - Change: Improve list_images performance on vSphere/vCenter clouds
 - Change: Add human friendly name to custom sizes (EE/HS only)
 - Change: Run update_mappings task on Dramatiq runner (EE/HS only)

## v4.5.0 (20 May 2021)

 - Feature: Add read-only objectstorage support for AWS & OpenStack clouds
 - Feature: Extend size & field constraints, enabling owners to configure available create-machine form fields & sizes (EE/HS only)
 - Feature: Web UI for configuring constraints (EE/HS only)
 - Feature: Helm chart
 - Change: Support Ansible 2.0, run playbooks in runner container
 - Change: Do not require password when creating API token, notify user by email
 - Change: Upgrade RabbitMQ, remove Memcached
 - Change: Make portal name configurable in email subjects & bodies

## v4.4.5 (25 Apr 2021)

 - Bugfix: Fix post-deploy ssh login
 - Bugfix: Use num of cpu cores in Equnix CloudSize object
 - Bugfix: Allow monitoring API calls on terminated machines
 - Bugfix: Update RBAC mappings after adding machine in KVM/Other cloud (EE/HS only)
 - Bugfix: Fix excessive log filtering for non owners (EE/HS only)
 - Change: Use double quotes for exact match & support math operators in APIv2 calls

## v4.4.4 (14 Apr 2021)

 - Bugfix: Fix validation error when adding new host in KVM clouds
 - Bugfix: Remember custom sort order & field widths in lists
 - Bugfix: Always fetch permissions & constraints in machine-create form
 - Bugfix: Prevent occasional exceptions when listing images in vSphere
 - Change: Dont use asyncio by default when listing vSphere nodes

## v4.4.3 (1 Apr 2021)

 - Change: Add support for CI Logon SSO (EE only)
 - Change: Upgrade echarts & load them only when needed
 - Change: Add new DB indexes on Images & Sizes to increase query performance
 - Bugfix: Allow image formats other than .img when cloning KVM machine
 
## v4.4.2 (18 Mar 2021)

 - Bugfix: Fix UI RBAC checking issue (EE/HS only)
 - Bugfix: Fix LDAP URI stripping issue (EE/HS only)
 - Change: Allow LDAP login from multiple OU's (EE/HS only)
 - Change: Update pre-starred AWS & Azure images

## v4.4.1 (4 Mar 2021)

 - Bugfix: Pin influxdb image to v1.8.4
 - Bugfix: Fix display of tags with empty value
 - Bugfix: Fix constraint enforcement on create machine form (EE/HS only)
 - Bugfix: Do not display sign in disabled message when MS365 SSO is the only one available (EE only)
 - Change: Update requests & limits in helm chart

## v4.4.0 (19 Feb 2021)

 - Change: Upgrade to Polymer3 / Web Components v1
 - Feature: Add support for CloudSigma clouds
 - Feature: Use Monaco editor when viewing or editing code or markup
 - Feature: Add RBAC on images (EE/HS only)
 - Feature: Add support for Microsoft 365 sign on (EE only)
 - Feature: Hide sidebar sections when the user has no permission to access them (EE/HS only)
 - Feature: Add power\_cycle action for DigitalOcean
 - Feature: Extend supported constraints on machine size
 - Feature: Add rename & clone actions for vSphere machines
 - Feature: Introduce API v2 (experimental)
 - Feature: Add support for volumes in Linode
 - Change: Open shell in new window, rewrite ssh backend in Golang
 - Change: Support Linode API v4
 - Change: Rename Packet to EquinixMetal
 - Change: Drop experimental support for Gig G8 clouds
 - Bugfix: Numerous minor bugfixes & UX improvements

## v4.3.8 (26 Aug 2020)

 - Bugfix: Fix machine provisioning issue on OpenStack
 - Bugfix: Fix machine provisioning on KubeVirt

## v4.3.7 (22 July 2020)

 - Bugfix: Fix KVM add cloud with custom SSH port
 - Bugfix: Fix undefine machine on KVM clouds
 - Bugfix: Fix possible event loop error when creating machine on KVM clouds
 - Bugfix: Fix possible even loop error when listing images in KVM clouds
 - Bugfix: Fix possible event loop error when creating machine on Packet clouds
 - Bugfix: Fix error when location is not found for list_storage_accounts on Azure clouds
 - Bugfix: Add defensive check for vsphere and kubevirt specific endpoints to throw error the provider is not correct
 - Bugfix: Fix region extraction from Packet clouds
 - Change: Allow starting terminated machines on KVM clouds
 - Change: Throw VolumeCreationError instead of `Cloud Unavailable` when volume creation fails
 - Change: Update description of sizes in DigitalOcean clouds
 - Change: Update min size for packet volumes to 100

## v4.3.6 (25 June 2020)

 - Bugfix: Fix image path issue on KVM create machine
 - Bugfix: Fix insights utilization graph (EE/HS only)
 - Change: Increase max RAM size in KVM create machine fields
 - Change: Add option to disable image starring on machine create
 - Change: Update default task queue names

## v4.3.5 (12 June 2020)

 - Bugfix: Fix machine provisioning for KVM clouds
 - Bugfix: Use ThreadPoolExecutor in create_machine_async, fixes provisioning issue on OpenStack clouds
 - Bugfix: Fix Azure storage account autogenerated name
 - Bugfix: Fix links to filtered lists
 - Bugfix: Fix handling of custom sizes
 - Bugfix: Fix cost output in csv export
 - Change: Set images as unstarred by default

## v4.3.4 (5 June 2020)

 - Bugfix: Fix ordering of starred images in machine create form
 - Bugfix: Fix CSV export
 - Bugfix: Fix zone listing issue for non-owners (EE/HS only)
 - Bugfix: Fix network deletion in OpenStack

## v4.3.3 (25 May 2020)

 - Bugfix: Fix provisioning on multi-host KVM when a host is down
 - Bugfix: Include disk in KVM machine sizes
 - Bugfix: Remove unnecessary scrollbars from dialogs
 - Bugfix: Fix display of starred images in create machine form

## v4.3.2 (21 May 2020)

 - Change: Avoid dereferencing machine owner on clean, minor optimization
 - Change: Increase AsyncHTTPClient timeouts

## v4.3.1 (19 May 2020)

- Bugfix: Fix exception when provisioning GCE machines
- Bugfix: Fix datetime serialization issue when listing machines in AWS clouds
- Change: Unset missing_since for resources that pop back into existence

## v4.3.0 (16 May 2020)

This release greatly improves support for KVM. It's now possible to manage multiple hypervisors as a single cloud and to access VNC console, assign VNF's with SR-IOV and more. It also introduces support for new platforms like LXD, KubeVirt, G8. Support for vSphere/vCenter has been enhanced significantly. Many bugfixes and improvements under the hood are included. The Enterprise Edition introduces support for Active Directory & LDAP and includes the first version of the Price Catalog for configuring custom pricing policies on cloud resources.

- Feature: Support LDAP & Active Directory (EE only)
- Feature: Pricing policy catalog (EE only, experimental)
- Feature: Add support for LXD clouds
- Feature: Add support for KubeVirt clouds
- Feature: Widens support for vSphere/vCenter versions v4.0 up to v6.7, add optional support for new REST API
- Feature: Add support for vSphere Content Libraries, select Folder & Datastore when provisioning
- Feature: Add support for GIG G8 clouds (experimental)
- Feature: Support multiple hosts in KVM clouds
- Feature: Support VNC console for KVM machines
- Feature: Display KVM machine image, size and parent in listing
- Feature: Support listing and configuring VNFs on KVM
- Feature: Add polling for images
- Feature: Add process pool option to update machines in parallel, avoid unnecessary db updates
- Feature: Support listing and selecting security group on machine creation for AWS
- Change: Rename conditions to selectors
- Change: Deprecate UserTasks & remove memcached
- Change: Update most Python dependencies
- Change: Show more info about DigitalOcean sizes, like in DO console
- Bugfix: Fix cost estimation for Packet, AWS, Azure
- Bugfix: Fix clone action in KVM

## v4.2.1 (17 December 2019)

* Bugfix: Fix image retrieval for vSphere machines
* Bugfix: Fix webhooks on org rules & webhooks with empty body

## v4.2.0 (12 December 2019)

This release brings major enhancements on rules and logging. It's now possible 
to set rules on logs that match any managed resource. Observation logs are 
emitted whenever the poller detects new, missing or updated machines, volumes, 
networks or zones.

* Feature: Log observations of infrastructure changes
* Feature: Rules on logs
* Feature: Rules can trigger webhook actions
* Feature: Add alert level & description in rule notification actions
* Feature: Add optional domain name field for OpenStack clouds
* Feature: Add support for FoundationDB Document Layer as a replacement for MongoDB
* Feature: Improve volume support for Azure Resource Manager
* Feature: Attach disk upon machine creation on Alibaba Cloud
* Feature: Attach existing and new volume when creating EC2 Instance
* Feature: Attach existing volume when creating DigitalOcean droplet
* Feature: Add cloudinit support for OpenStack, Alibaba Cloud, IBM Cloud, Vultr
* Feature: Add support for Maxihost bare metal cloud
* Feature: Add support for machine expiration dates
* Feature: Enforce constraints on expiration dates (EE/HS only)
* Feature: Enforce quotas on cost per team/user/org (EE/HS only)
* Feature: Enforce RBAC permissions on the UI by hiding unavailable actions (EE/HS only)
* Change: Update add cloud form, separate providers into categories
* Change: Deprecate Nephoscale provider
* Change: Rename Softlayer to IBM Cloud
* Change: Update cloud provider logos
* Change: Improve DNS record creation widget when creating machine
* Bugfix: Fix IBM Cloud machine size association
* Bugfix: Fix provisioning on Alibaba Cloud
* Bugfix: Fix provisioning use cases on Azure Resource Manager
* Bugfix: Fix attach/detach volume on DigitalOcean

## v4.1.4 (4 September 2019)

* Bugfix: Search for vSphere machine snapshots recursively
* Bugfix: Remove deprecated ex_disk_id param in create_machine which affected the machine's network configuration.
* Bugfix: Fix list_sizes on Packet when using Project API token

## v4.1.1 (21 July 2019)

* Change: Catch jsonpatch errors, prevents browser memory increase over time
* Change: Dont store shell sessions by default
* Bugfix: Only show available Aliyun sizes in resize dialog
* Bugfix: Fix issue with sidebar counters not updating
* Bugfix: Fix volume actions & attachment info update in UI
* Bugfix: Fix volume parsing in DigitalOcean and OpenStack
* Bugfix: Fix detach_volume in OpenStack driver

## v4.1.0 (21 May 2019)

* Feature: Add support for volumes in Packet clouds
* Feature: Add support for volumes and machine provisioning in Aliyun ECS clouds
* Feature: Support new OpenSSH key format
* Feature: Set filesystem type when creating volumes in DigitalOcean
* Feature: Create and attach volume on OpenStack machine creation
* Change: Refactor landing page, improving customizability and SEO
* Change: Use OpenStack API v2.2
* Change: Machine-Key associations have their own DB collection, enhancing query performance
* Change: Update date picker in schedule add form
* Bugfix: Fix portal name & logo in notification emails
* Bugfix: Fix deletion of multiple clouds from cloud list
* Bugfix: Fix editing of schedule script params
* Bugfix: Fix tag editing in lists
* Bugfix: Fix price retrieval for GCE Asia regions
* Bugfix: Avoid XML parse errors in xml-viewer in resource metadata sections
* Bugfix: Fix port detection on OpenStack post machine create steps
* Bugfix: Assign volume ownership on creation
* Bugfix: Fix sidebar counter updates

## v4.0.3 (20 March 2019)

* Bugfix: Fix floating ip string representation in OpenStack driver
* Bugfix: Hide location field if empty and non required
* Bugfix: Force update of key selection lists when keys arrive from socket
* Bugfix: Fix display of custom org logos
* Bugfix: Improve UI update when applying patch to resource property

## v4.0.2 (20 February 2019)

* Bugfix: Fix Python3 compatibility issue in vSphere libcloud driver

## v4.0.1 (20 February 2019)

* Bugfix: Update Python to 3.7.2, fixes uwsgi segfault when handling invalid certs

## v4.0.0 (19 February 2019)

This is a major release that brings important performance improvements both in the backend as well as in the frontend. It also introduces usability improvements when filtering lists, exploring logs, adding "other server" clouds and when selecting tags, keys & networks in forms.

* Feature: Widget to select existing tags
* Feature: Configurable filters in every list that persist in localStorage
* Feature: Searchable key & network selection widgets in forms
* Feature: Collapsible sections in monitoring dashboards
* Feature: Export machine monitoring dashboard as pdf
* Feature: Automatic backup & restore scripts for mongo & influx
* Feature: Pre and post action hooks
* Change: Upgrade backend code to Python 3.7
* Change: Upgrade frontend code to Polymer 2.x and Web Components v1
* Change: Upgrade to latest Apache Libcloud 2.4.0
* Change: Improve user interaction when adding "Other Server" Clouds
* Change: Improve display of JSON & XML metadata

## v3.3.1 (6 November 2018)

* Bugfix: Correctly check if DNS is enabled when polling for zones
* Bugfix: Fix issue when destroying vSphere machines

## v3.3.0 (23 October 2018)

* Feature: Support for block storage volumes in GCE, EC2, OpenStack, DigitalOcean
* Feature: Automatic db migrations
* Feature: Display org logo in user menu
* Feature: Resize GCE machines
* Feature: Allow to create multiple interfaces and assign static IPs to KVM guest VMs
* Feature: Implement VM cloning for KVM
* Feature: Support snapshots in vSphere
* Feature: Allow to enable/disable and edit the window/frequency of a NoDataRule
* Feature: Saved searches in log listings
* Feature: Cloud listing page
* Change: Use html5 date & time inputs
* Change: Improve performance when applying patches to the model over websocket
* Change: Reduce poller update threshold to 90 secs
* Change: Add k8s deployment specific script that displays online portal users
* Bugfix: Properly pass params when running scheduled scripts
* Bugfix: Display prices in resize dialog correctly for DigitalOcean

## v3.2.0 (6 Aug 2018)

Performance optimizations, preliminary support for Alibaba Cloud (Aliyun ECS), minor bugfixes

* Feature: Initial support for Alibaba Cloud
* Feature: Configure default post deploy steps for selected clouds
* Feature: Support VNC console action on OpenStack
* Bugfix: Fix influxdb mountpath in helm chart
* Bugfix: Fix VCloud OS detection
* Bugfix: Fix vSphere machine listing issue
* Bugfix: Fix load graph for many machines
* Change: Expose more settings for rabbitmq, gocky, cilia in helm chart
* Change: Upgrade gocky images
* Change: Configurable pollers in helm chart
* Change: Add flag to disable machine polling acceleration
* Change: Optimize tag query when calculating machine cost
* Change: Re-implement metering for checks and datapoints based on rate/sec
* Change: Dont probe stopped machines or localhost
* Change: Dont run update_poller task if not necessary
* Change: Import middleware chains from plugins, if defined
* Change: Make scheduler configurable in bin/poller


## v3.1.0 (16 Jul 2018)

Adds polling for networks. Improves KVM machine creation & networking. Optimize vSphere API queries. Improves DB query performance. Upgrades ELK which lowers RAM requirements.

### Changes

* Feature: Support custom sizes when creating KVM machines.
* Feature: Store & display resource creator & owner
* Feature: Allow to undefine a KVM domain, if it is not active
* Feature: Support multiple interfaces and attaching to more than one networks when creating KVM machines.
* Feature: Poller for networks.
* Change: Sharding of polling tasks.
* Change: Deprecate collectd support.
* Change: Support metering of datapoints.
* Change: Add owner index, improves performance of DB queries.
* Change: Upgrade ELK to 5.6.10
* Change: Get vm properties in batches in vSphere driver
* Bugfix: Fix internal server error when editing some rules.
* Bugfix: Fix KVM networks upon machine creation.
* Bugfix: Prevent setting telegraf deployment error to "None"
* Bugfix: Do not schedule MeteringPollingSchedule task immediately, since that would result in the task being scheduled every time the Organization instance is saved
* Bugfix: Fix bug regarding incidents not closing when disabling monitoring


## v3.0.0 (29 Apr 2018)

Major new release of the Mist Cloud Management Platform, Community Edition. 

The Community Edition now integrates with Telegraf & InfluxDB to provide a fully open source infrastructure management & monitoring stack. It also includes a revamped alerting & automation engine that will apply your rules to any group of machines. We enhanced the support of many clouds, most notably vSphere, GCE & OpenStack. It's now possible to bring together machines into a single virtual "Cloud". The usability and performance of the UI was greatly improved. At the same time we've remorselessly eliminated more than a few bugs.

A new plugin system was introduced, which is currently used by the Enterprise Edition and the Hosted Service to provide add-on functionality like i) Role Based Access Control, ii) Cost Insights, iii) VPN tunnels, iv) Orchestration of multi-tier architectures like Kubernetes clusters, as well as v) metering & billing extensions.

You can purchase the Mist Enterprise Edition and the Mist Hosted Service at https://mist.io


### Changes

* Feature: Machine monitoring, using InfluxDB & Telegraf
* Feature: Alerting and automation rules on machine metrics, apply rules on groups of machines
* Feature: Interactive API docs using OpenAPI 3.0 spec & Swagger UI
* Feature: Poller for cloud locations & sizes
* Feature: Select network & subnetwork when creating GCE machine
* Feature: Support ClearCenter SDN as cloud
* Change: Improved vSphere support
* Change: UI performance improvements
* Change: Support for plugins
* Bugfix: Too many bugfixes to count


## v2.6.0 (10 Dec 2017)

### Changes

* Feature: Export CSV on any list
* Change: Improve layout in small screens
* Bugfix: Update required fields for provisioning in OpenStack
* Change: Remove deprecated polling tasks (!510)


## v2.5.0 (18 Nov 2017)

### Changes

* Feature: Chained actions in Rules, backend only (!475)
* Feature: CSV renderer for API results
* Feature: Send multipart emails when required
* Feature: List all machines view
* Change: Dismiss notifications menu
* Change: Async session update (!503)
* Change: Vsphere opts and metadata (!487)
* Bugfix: Catch me.NotUniqueError when renaming a Cloud


## v2.4.0 (27 Oct 2017)

### Changes

* Feature: Azurearm provisioning (!457)
* Feature: Improved Windows support
* Feature: Granular Notification Overrides (!460)
* Feature: Resize machine action for EC2, DigitalOcean, OpenStack
* Bugfix: Fix lock bug https://gitlab.ops.mist.io/mistio/mist.core/issues/1221 (!454)
* Bugfix: Properly read cost from tags for generic (non-libcloud) machines
* Bugfix: Fix ping parsing
* Bugfix: Fix poller computed property
* Change: Update xterm.js & fix shell display issues
* Change: Improve display of probe data
* Change: Exclude audit log ES templates (!473)
* Change: Run tests with headless Chrome (!442)
* Change: New rules models (!472)
* Change: Sso refresh token (!461)
* Change: Update docker/nginx/nginx.conf (!459)
* Change: Move ES template for cloudify-metrics to mist.io/docker/elasticsearch-manage (!458)


## v2.3.0 (19 Sep 2017)

### Changes

* Change: Whitelisting UI improvements (!446)
* Change: Insights UI improvements
* Bugfix: Catch invalid SSL cert for OnApp
* Change: Update GCE pricing, improve list sizes behavior


## v2.2.1 (8 Sep 2017)

### Changes

* Bugfix: Use tz aware objects in changelog.py (!445)
* Bugfix: Install dateutil for ci release step (!444)


## v2.2.0 (8 Sep 2017)

### Changes

* Feature: IP whitelisting (!434)
* Change: Do not hardcore repo name in release process (!382)
* Change: Ansible script example - update ref (!432)
* Change: Refactor poller (!420)
* Change: Change submodule paths (!426)
* Change: Update ES templates with merge policy (!419)
* Bugfix: Fix async permission mappings (!401)
* Change: Fix ordering and naming of crontab fields


## v2.1.0 (21 Jul 2017)

### Changes

* Change: Display stack logs grouped by workflow operation (!406)
* Change: Notifications API & UI improvements (!390) (!409)
* Change: Update to Libcloud v2
* Change: Apply stricter checks on the dns enabled cloud field (!404)
* Bugfix: Fix error in machine weight calculation
* Change: Update DNS API (!396)
* Bugfix: Fix association with a secondary key (!394)


## v2.0.0 (21 Jun 2017)

This is a major update of the open source version Mist.io with many of the
latest features and fixes from the Enterprise SaaS version available at
https://mist.io

It comes with a brand new UI based on Polymer and web components and introduces
new functionality.

For more details on the changes also check out the
[blog post](http://blog.mist.io/post/162083041316/our-biggest-mistio-open-source-release-yet).



### Changes

* Feature: Support for more cloud providers
* Feature: DNS management
* Feature: Manage private networks
* Feature: Support for running scripts (executables as well as Ansible playbooks)
* Feature: Scheduled tasks
* Feature: Tagging of all resources
* Feature: Cost reporting
* Feature: Support for multiple Users, Teams & Organizations (full RBAC support available in the Enterprise Edition)
