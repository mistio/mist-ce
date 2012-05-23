var NODE_NAME_CHARACTERS = 35;
var STATES = {
    '0' : 'Running',
    '1' : 'Rebooting',
    '2' : 'Terminated',
    '3' : 'Pending',
    '4' : 'Unknown'
    };
var STATEICONS = {
    '0' : 'check',
    '1' : 'refresh',
    '2' : 'delete',
    '3' : 'gear',
    '4' : 'alert'
    };

/* disable browser bar on android */
if(navigator.userAgent.match(/Android/i)){
   window.scrollTo(0,1);
}

/* on page init */
$(document).on('mobileinit', function(){

    // run list_machines action on each backend
    $.each(backends, function(i, b){
        b.newAction(['list_machines']);
    });
    
    //after getting the machines, get images and sizes
    $.each(backends, function(i, b){
        b.newAction(['list_sizes']);
        b.newAction(['list_locations']);
        b.newAction(['list_images']);
    });

    // Change default machines list callback
    $.mobile.listview.prototype.options.filterCallback = customMachinesFilter;
});

$(document).on( 'ready', '', update_backends);

$(document).delegate('#edit-backend', 'pagebeforeshow', function(){
	var backend = $(this).data('backend');
	
	$(this).find('.status').text(backend.status);
	
	if(backend.status != 'offline'){
		$("#backend-enable").val('on');
	} else {
		$("#backend-enable").val('off');
	}
	
	$("#backend-enable").slider('refresh');
	$("#backend-enable").data('backend', backend);	
});

$(document).delegate("#backend-enable", "change", function(event, ui) {
	var backend = $(this).data('backend');
	
	if($(this).val() == 'on'){
		backend.enable();
	} else {
		backend.disable();
	}
});

$(document).delegate('.mist-dialog', 'keyup keydown keypress', close_on_escape);
$(document).delegate('#create-cancel', 'click', function(){history.back()});

function update_backends() {
    // run list_machines action on each backend
    $('#backend-buttons').empty();
    $.each(backends, function(i, b){
    	$('#backend-buttons').append($('<a href="#edit-backend" data-rel="dialog" ' + 
    			'data-theme="c" data-inline="true" data-transition="slidedown" ' +
    			'data-corners="false" data-shadow="false" ' +
    			'data-role="button" data-icon="' + BACKENDSTATEICONS[b.status] +
    			'">' + b.title + '</a>')
    			.on('click', function(){ $('#edit-backend').data('backend', b) }));   
    });
    if (backends.length) {
        $('#home-menu').show(); 
    }
    
    $('#backend-buttons').trigger('create');
}

// Update tags page when it opens
$(document).on( 'pagebeforeshow', '#dialog-tags', function( e, data ) {
    // TODO get tags from machine object and display them
    $('#dialog-tags #tags-container').empty();
});

// Update providers page when it opens
$(document).on( 'pagebeforeshow', '#dialog-providers', function( e, data ) {
    $('#providers-status-list').listview('refresh');
});

// Hide footer on machines page load.
$(document).on( 'pageinit', '#machines', function(event){
    $('#machines-footer').hide();
    setTimeout(function() {$('#logo-container').fadeOut(500);}, 5000);
});

// make sure the listview is not broken when displaying machines list
$(document).on( 'pagebeforeshow', '#machines', function(){
    $('#machines-list').listview('refresh');
});

$(document).on('pagebeforeshow', '#dialog-add', function(e, data){
	if(data.prevPage[0].id){
		$('input[name=create-machine-name]').val(null);
		$('#create-select-provider').val(null).selectmenu('refresh');
		$('#create-select-image').val(null).selectmenu('refresh').selectmenu('disable');
		$('#create-select-size').val(null).selectmenu('refresh').selectmenu('disable');
		$('#create-ok').button('disable');
	}
});

//
// MOUSE EVENTS
//

// prepare single view on node click
$(document).on( 'click', 'li.node a', function(event){
    var domId = $(this).parent().parent().parent()[0].id;
    var backendId = domId.split('-')[0];
    var machineId = domId.split('-').splice(1).join('-');
    var machine = get_machine(backendId, machineId);

//STUB!
    var name = machine.name || machine.id;
    var status = machine.extra.status;
    if(!status){
    	status = STATES[machine.state];
    }
    var basicvars = {
        public_ips : ['Public IPs', machine.public_ips],
        private_ips : ['Private IPs', machine.private_ips],
        image : ['Image', machine.image],
        dns_name : ['DNS Name', machine.extra.dns_name],
        launchdatetime : ['Launch Date', machine.extra.launchdatetime]
    }

    $('#single-machine #single-view-name').text(name);
    $('#single-machine #single-view-provider-icon').removeClass().addClass('provider-'+backendId);
    
    
    get_image_type(backendId, machine.image, function(imagetype){
    	$('#single-machine #single-view-image-icon').removeClass().addClass('image-' + imagetype);	
    });
    
    $('#single-machine #single-view-status').removeClass().addClass(status.toLowerCase()).empty().text(status);
    //also show any of the following if found: keyname,availability,flavorId,uri,hostId';
    // Create a table for the basic info.
    $('#single-machine span.machine-basic-stuff').html('<table id="machine-basic-table"></table>');
    $.each(basicvars, function(i, v) {
        var row = $('<tr></tr>');
        row.append('<td class="key">'+v[0]+'</td>');
        row.append('<td class="value">'+v[1]+'</td>');
        $('#machine-basic-table').append(row);
    });

    $('#single-machine h1#single-machine-name').text(machine.name || machine.id);
    $('#machine-metadata').html(to_ul(machine.extra));
});

// Message notifier mouseenter and mouseleave events
$(document).on( 'mouseenter', '#notifier, #notifier-in', function() {
    clearTimeout(log.timeout);
}).mouseleave(function() {
    // TODO: fix selectors
    log.timeout = setTimeout("$('#notifier, #notifier-in').slideUp(300)", 5000);
});

// Add backend
$(document).on( 'click', '#create-backend-ok', function() {
            var provider = $('#new-backend').val();
            var apikey = $('#new-apikey').val();
            var apisecret = $('#new-apisecret').val();
            add_backend(provider, apikey, apisecret);
});

// Create machine
$(document).on( 'click', '#create-ok', function() {
    var backend = backends[$('#create-select-provider option:selected')[0].value.split('-loc')[0]];
    var location = $('#create-select-provider option:selected')[0].value.split('-loc')[1];
    var name = $('#new-machine-name').val();
    var image = $('#create-select-image option:selected')[0].value
    var size = $('#create-select-size option:selected')[0].value
    backend.newAction(['create', name, location, image, size]);
    history.back();
});

// Footer reboot button / Machines view
$(document).on( 'click', '#machines-button-reboot', function() {
    var machinesSelected = $('#machines .node input:checked').length;
    if (machinesSelected > 1) {
        var titl = 'Reboot Machines',
            msg = 'Are you sure you want to reboot '+machinesSelected+' machines?';
        displayConfirmation(titl, msg, function() {
            $('#machines .node input:checked').each(function() {
                var node = $(this).closest('.node');
                var backend = backends[node[0].id.split('-')[0]];
                backend.newAction(['reboot', node[0].id.split('-').splice(1).join('-')]);
            });
        });
    } else if (machinesSelected == 1) {
        var mName = $('#machines .node input:checked').closest('.node').find('.name').text();
            titl = 'Reboot '+mName,
            msg = 'Are you sure you want to reboot '+mName+'?';
        displayConfirmation(titl, msg, function() {
            var node = $('#machines .node input:checked').closest('.node');
            var backend = backends[node[0].id.split('-')[0]];
            backend.newAction(['reboot', node[0].id.split('-').splice(1).join('-')]);
        });
    }
});

// Footer reboot button / Single view
$(document).on( 'click', '#single-button-reboot', function() {
    var mName = $('#single-machine-name').text();
        titl = 'Reboot '+mName,
        msg = 'Are you sure you want to reboot '+mName+'?';
    displayConfirmation(titl, msg, function() {alert('Reboot is in order!!');});
});

// Footer destroy button / Machines view
$(document).on( 'click', '#machines-button-destroy', function() {
    var machinesSelected = $('#machines .node input:checked').length;
    if (machinesSelected > 1) {
        var titl = 'Destroy Machines',
            msg = 'Are you sure you want to destroy '+machinesSelected+' machines?';
        displayConfirmation(titl, msg, function() {
            $('#machines .node input:checked').each(function() {
                var node = $(this).closest('.node');
                var backend = backends[node[0].id.split('-')[0]];
                backend.newAction(['destroy', node[0].id.split('-').splice(1).join('-')]);
            });
        });
    } else if (machinesSelected == 1) {
        var mName = $('#machines .node input:checked').closest('.node').find('.name').text();
            titl = 'Destroy '+mName,
            msg = 'Are you sure you want to destroy '+mName+'?';
        displayConfirmation(titl, msg, function() {
            var node = $('#machines .node input:checked').closest('.node');
            var backend = backends[node[0].id.split('-')[0]];
            backend.newAction(['destroy', node[0].id.split('-').splice(1).join('-')]);
        });
    }
});

// Footer destroy button / Single view
$(document).on( 'click', '#single-button-destroy', function() {
    var mName = $('#single-machine-name').text();
        titl = 'Destroy '+mName,
        msg = 'Are you sure you want to destroy '+mName+'?';
    displayConfirmation(titl, msg, function() {alert('Destroy is in order!!');});
});

// DIALOG MOUSE EVENTS

// DIALOG MOUSE EVENTS

$(document).on('click', '#backend-delete', function() {
    $('#backend-delete-confirm').slideDown(200);
});

$(document).on('click', '#backend-delete-no', function() {
    $('#backend-delete-confirm').slideUp(200);
});

//
// CHANGE EVENTS
//

// Selection control behavior.
// Select according to control value. Show/hide footer accordingly,
// and reset selection in the end.
// Note that change event should be triggered manually! Why?
$(document).on( 'change', '#mist-select-machines', function() {
    var selectVal = $(this).val();
    $('#machines-list .node input:checkbox').attr('checked',false);
    if (selectVal == 'all') {
        $('#machines-list .node:visible input:checkbox').attr('checked',true);
    } else if (selectVal != 'none') {
        $('#machines-list .node').each( function() {
            if ($(this).find('.prov-'+selectVal).length > 0) {
                $(this).find('input:checkbox').attr('checked',true);
            }
        });
    }
    $('#machines-list .node:visible input:checkbox').trigger('change').checkboxradio("refresh");
    updateFooterVisibility();
    $(this).val('select').selectmenu('refresh');
});

// Event listener for node checkbox change.
// Adds a hidden text value to the node to affect
// node display while filtering.
$(document).on( 'click', '#machines-list .node input:checkbox', function(event){
    var $this = $(this);
    var checked = $this.is(':checked')
    if (checked) {
        $this.closest('.node').append('<span class="mist-node-selected" style="display:none">mist-node-selected</span>');
    } else {
        $this.closest('.node').find('.mist-node-selected').remove();
    }
    $(this).checkboxradio("refresh")
});

$(document).on( 'click', '#machines-list li a', function(event){
    if(event.target.tagName != 'A'){
    	event.stopPropagation();
    }
});

// Check for footer visibility and button enabling
// when a checkbox is selected/deselected.
$(document).on( 'change', '#machines-list input:checkbox', updateFooterVisibility);

// Check for change event in the select boxes of the create dialog.
$(document).on( 'change', '#create-select-provider', onMachineCreateProviderChange);
$(document).on( 'change', '#create-select-image', onMachineCreateImageChange);
$(document).on( 'change', '#create-select-size', onMachineCreateSizeChange);

$(document).on( 'change keyup', '#new-machine-name', function() {
    updateCreateFields();
});

//
// MIST.IO FUNCTIONS
//

/* when the list_machines action returns, update the view */
function update_machines_view(backend){
    $.each(backend.machines, function(index, machine){
        var node = $('#machines-list > #' + backends.indexOf(backend) + '-' + machine.id);
        if (node.length == 1) { // there should be only one machine with this id in the DOM
            if (node.find('.name').text() != machine.name){
                node.fadeOut(100);
                node.find('.name').text(truncate_names(machine.name, NODE_NAME_CHARACTERS));
                node.find('.backend').text(backend.title);
                node.find('.backend').addClass('prov-'+backend.provider);
                node.addClass('prov-'+backend.provider);
                //node.find('.select')[0].id = 'chk-' + machine.id;
                node.fadeIn(100);
            }
            node.find('.state').removeClass().addClass('state').addClass('state'+machine.state);
            node.find('.state').text(STATES[machine.state]);
        } else { // if the machine does does exist in the DOM, then add it
            if (node.length != 0){
                log.newMessage(ERROR, 'DOM Error: ' + node);
            }
            node = $('.node-template').clone();
            node.removeClass('node-template');
            node.addClass('node');
            node.find('.name').text(truncate_names(machine.name, NODE_NAME_CHARACTERS));
            node.find('.backend').text(backend.title);
            node.find('.backend').addClass('prov-'+backend.provider);
            node.addClass('prov-'+backend.provider);
            node.find('.state').addClass('state'+machine.state);
            node.find('.state').text(STATES[machine.state]);
            //node.find('.state-icon').addClass('ui-icon ui-icon-'+STATEICONS[machine.state]);
            node.find('input')[0].id = 'chk-' + machine.id;
            node.find('input')[0].name = 'chk-' + machine.id;
            node.find('label').attr('for', 'chk-' + machine.id);
            node[0].id = backends.indexOf(backend) + '-' + machine.id;
            node.appendTo('#machines-list');
            node.fadeTo(200, 0.80);
        }
    });

    //Make a list of all machine ids first, from all backends and check if machine
    //is in DOM but not in list, then delete it from DOM. Example id: 2-18
    var machines_list = [];
    for (var i = 0 ; i < backends.length; i++) {
        for (var m in backends[i].machines) {
            machines_list.push(i + '-' + backends[i].machines[m].id);
        }
    }

    $('#machines-list').find('.node').each(function (i) {
        if ($.inArray(this.id, machines_list) == -1) {
            $('#' + this.id).remove();
        }
    });

    if ($.mobile.activePage.attr('id') == 'machines') {
        $('#machines-list').listview('refresh');
        $("#machines-list input[type='checkbox']").checkboxradio();
    }
    update_machines_count();
    update_select_providers();
}

/* when the list_images action returns, update the view */
function update_images_view(backend){
    update_images_count();
}

// Update footer visibility
function updateFooterVisibility(e) {
    var len = $('#machines-list input:checked').length;
    if (len > 1) {
        $('#machines-footer').fadeIn(140);
        $('#machines #footer-console').addClass('ui-disabled');
    } else if (len > 0) {
        $('#machines-footer').fadeIn(140);
        $('#machines #footer-console').removeClass('ui-disabled');
    } else {
        $('#machines-footer').fadeOut(200);
    }

    return false;
}

// Update the status of backends
// Affects both backends dialog and
// status indicator
function update_backend_status(backend, action) {
    var i = backends.indexOf(backend);
    $('#backend-' + i + '-menu li.ui-li-divider').text(backend.status);
    if (backend.status != 'online') {        
        $('#backend-'+i+'-button .ui-icon').removeClass('ui-icon-check').addClass('ui-icon-alert');
    } else {
        $('#backend-'+i+'-button .ui-icon').removeClass('ui-icon-alert').addClass('ui-icon-check');
    }


/*
    var $backend = $('#providers-status-list #provider-'+backend.id);
    if ($backend.length > 0) {
        $backend.removeClass('state-on state-off state-wait state-unknown').addClass('state-'+backend.status);
    } else {
        $('#providers-status-list').append(
            '<li id="provider-'+backend.id+'" class="state-'+backend.status+'"><span class="provider-state-icon ui-btn-corner-all"></span>'+backend.title+'</li>'
        );
    }
    if ($.mobile.activePage.attr('id') == 'dialog-providers') {
        $('#providers-status-list').listview('refresh');
    }
    // Update the status icon according to general provider status
    $('.state-providers').removeClass('state-on state-error state-wait');
    if ($('#providers-status-list .state-off').length > 0 || $('#providers-status-list .state-unknown').length > 0) {
        $('.state-providers').addClass('state-error');
    } else if ($('#providers-status-list .state-wait').length > 0) {
        $('.state-providers').addClass('state-wait');
    } else if ($('#providers-status-list .state-on').length == $('#providers-status-list li').length) {
        $('.state-providers').addClass('state-on');
    }
*/
}

// Custom machines filtering function.
// Relies on the presence of a hidden span
// which contains the text "mist-node-selected" only
// if the node is selected.
// This is to overcome jQuery mobile filtering lameness
// which only passes li text as a parameter.
function customMachinesFilter( text, searchValue ){
    var textL = text.toLowerCase();
  return !(textL.indexOf( searchValue ) >= 0 || textL.indexOf( 'mist-node-selected' ) >= 0);
};

// update the machines counter
function update_machines_count() {
    var allMachines = 0;
    for (var i = 0 ; i < backends.length; i++) {
        allMachines += backends[i].machines.length;
    }

    // Also update machines count bubble in initial screen.
    $('#one-li-machines .ui-li-count').text(allMachines);
}

// update the images counter
function update_images_count() {
    var allImages = 0;
    for (var i = 0 ; i < backends.length; i++) {
        allImages += backends[i].images.length;
    }

    // Also update machines count bubble in initial screen.
    $('#one-li-images .ui-li-count').text(allImages);
}


//updates the messages notifier
function update_message_notifier() {
    return;
    // TODO
    if (log.messages[log.messages.length-1][0] < LOGLEVEL){
        clearTimeout(log.timeout);
        if (!$('#notifier').is (':visible')){
            $('#notifier').slideDown(300);
        }
        var txt = log.messages[log.messages.length-1][1].toISOString() + " : " + log.messages[log.messages.length-1].slice(2).join(' - ');
        $('#notifier span.text').text(txt);
        update_messages_count();
        log.timeout = setTimeout("$('#notifier, #notifier-in').slideUp(300)", 5000);
    }
}

// Wrapper function for displaying a confirmation dialog with
// title, message and callback
function displayConfirmation(titl, msg, callbk) {
    $('#dialog-confirm-title').text(titl);
    $('#dialog-confirm-message').text(msg);
    $('#dialog-confirm-yes').one('click', function() {
        callbk();
        // clear selected checkboxes and hide the actions
        $('#machines-list li.node input:checked').attr('checked',false);
        $("#machines-list li.node input").checkboxradio("refresh");
        $("#machines-footer").hide();
    });
    $.mobile.changePage('#dialog-confirm');
}

// update the messages counter
function update_messages_count() {
    return;
    // TODO: fix selectors
    var message_count = log.messages.filter(function(el,i){return el[0] < LOGLEVEL}).length;
    if (message_count == 1) {
        messages = ' message';
    } else {
        messages =  ' messages';
    }
    $('#notifier span.messages-count').text(message_count + messages);
}

// updates the optgroup in the select menu and the select in the create dialog
// with the appropriate providers
// Note that for the create dialog, locations become separate list items for
// each provider.
function update_select_providers() {
    var optgroup = $('#optgroup-providers'),
        addmenu = $('#dialog-add #create-select-provider');

    optgroup.empty();
    $.each(backends, function(i, b) {
        var optionContent = '<option value="'+b.provider+'">'+b.title+'</option>';
        optgroup.append(optionContent);
    });

    // Only update create dialog if nothing yet selected
    if (createSelectionDefault()) {
        addmenu.empty();
        addmenu.append('<option>Select Provider</option>');
        $.each(backends, function(i, b) {
            var optionContent = '<option value="'+b.provider+'">'+b.title+'</option>';
            if (b.locations.length < 1) {
                addmenu.append(optionContent);
            } else {
                $.each(b.locations, function(j, l) {
                	addmenu.append('<option value="'+i+'-loc'+l.id+'">'+b.title+' - '+l.name+'</option>');
                });
            }
        });
    }

    try {
        $('#mist-select-machines').selectmenu('refresh');
        addmenu.selectmenu('refresh');
    } catch(err) {

    }
}

function updateCreateFields() {
    if (createSelectionComplete() && $("#new-machine-name").val()) {
    	$('#create-ok').button("enable");
    } else {
    	$('#create-ok').button('disable');
    }
}

function onMachineCreateProviderChange() {
    var image = $('#create-select-image'),
        size = $('#create-select-size');

    var loc = $(this).val();
    
    size.selectmenu('disable');
    
    if (loc == 'Select Provider') {
        image.selectmenu('disable');
    } else {
       	var backend = backends[loc.split('-')[0]];
        image.empty();
        image.append($("<option>​Select Image</option>"));
        $.each(backend.images, function(index, value){
        	image.append($('<option>', { value : value.id })
         	          .text(value.name));
        });
        image.selectmenu('refresh');
        image.selectmenu('enable');
        
        size.empty();
        size.append($("<option>​Select Size</option>"));
        backend.sizes.sort(compareSizes);
        $.each(backend.sizes, function(index, value){
       		size.append($('<option>', { value : value.id })
       	          .text(value.name)); 
        });
        size.selectmenu('refresh');
    }
}

function onMachineCreateImageChange() {
    var size = $('#create-select-size');
    
    if($(this).val() == 'Select Image'){
        size.selectmenu('disable');
    } else {
    	size.selectmenu('enable');
    }
}

function onMachineCreateSizeChange() {
	updateCreateFields();
}


// Create a <ul> from a Javascript object
function to_ul(obj, prop) {
    if (typeof(obj)=='string'){
        var li = document.createElement("li");
        var strong = document.createElement("strong");
        strong.appendChild(document.createTextNode(prop + ': '));
        li.appendChild(strong);
        li.appendChild(document.createTextNode(obj));
        return li;
    } else {
        var ul = document.createElement ("ul");
        for (var prop in obj) {
            ul.appendChild(to_ul(obj[prop], prop));
        }
        return ul;
    }
}

// returns whether all of the
// the elements in the create dialog have
// non-default values.
function createSelectionComplete() {
    var name = $('#new-machine-name').val(),
        provider = $('#create-select-provider'),
        image = $('#create-select-image'),
        size = $('#create-select-size');
    return name != '' && provider.val() != 'Select Provider' && image.val() != 'Select Image' && size.val() != 'Select Size';
}

// returns whether all of the
// the elements in the create dialog have
// default values.
function createSelectionDefault() {
    var name = $('#new-machine-name').val(),
        provider = $('#create-select-provider'),
        image = $('#create-select-image'),
        size = $('#create-select-size');
    return name == '' && provider.val() == 'Select Provider' && image.val() == 'Select Image' && size.val() == 'Select Size';
}

function truncate_names(truncateName, truncateCharacters ) { //truncate truncateName if bigger than truncateCharacters
    if (truncateName.length > truncateCharacters) {
        return truncateName.substring(0, NODE_NAME_CHARACTERS) + '...';
    } else {
        return truncateName;
    }
}

function compareSizes(a,b) {
	if (a.disk < b.disk)
	     return -1;
	if (a.disk > b.disk)
        return 1;
    return 0;
}
