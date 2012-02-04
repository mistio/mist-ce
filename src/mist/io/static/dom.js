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
$(document).bind("mobileinit", function(){

    // run list_machines action on each backend
    backends.forEach(function(b, i){
        // TODO: create provider widget
        b.newAction(['list_machines']);
    });

    //after getting the machines, get images and sizes
    backends.forEach(function(b, i){
        b.newAction(['list_sizes']);
        b.newAction(['list_images']);
        b.newAction(['list_locations']);
    });

    // Change default machines list callback
    $.mobile.listview.prototype.options.filterCallback = customMachinesFilter;
});

// Update tags page when it opens
$("#dialog-tags").live( "pagebeforeshow", function( e, data ) {
    // TODO get tags from machine object and display them
    $('#dialog-tags #tags-container').empty();
});

// Hide footer on machines page load.
$( '#machines' ).live( 'pageinit',function(event){
    $('#machines-footer').hide();
    setTimeout(function() {$('#logo-container').fadeOut(500);}, 5000);
});

// make sure the listview is not broken when displaying machines list
$('#machines').live('pagebeforeshow', function(){
    $('#machines-list').listview('refresh'); 
});

//
// MOUSE EVENTS
//

// prepare single view on node click
$('li.node a' ).live( 'click',function(event){
    var domId = $(this).parent().parent().parent()[0].id;
    var backendId = domId.split('-')[0];
    var machineId = domId.split('-').splice(1).join('-');
    var machine = get_machine(backendId, machineId);
    $('#single-machine h1#single-machine-name').text(machine.name || machine.id);
});

// Message notifier mouseenter and mouseleave events
$('#notifier, #notifier-in').mouseenter(function() {
    clearTimeout(log.timeout);
}).mouseleave(function() {
    // TODO: fix selectors
    log.timeout = setTimeout("$('#notifier, #notifier-in').slideUp(300)", 5000);
});

// Footer reboot button / Machines view
$('#machines-button-reboot').live('click', function() {
    var machinesSelected = $('#machines .node input:checked').length;
    if (machinesSelected > 1) {
        var titl = 'Reboot Machines',
            msg = 'Are you sure you want to reboot '+machinesSelected+' machines?';
        displayConfirmation(titl, msg, function() {alert('Reboot is in order!!');});
    } else if (machinesSelected == 1) {
        var mName = $('#machines .node input:checked').closest('.node').find('.name').text();
            titl = 'Reboot '+mName,
            msg = 'Are you sure you want to reboot '+mName+'?';
        displayConfirmation(titl, msg, function() {alert('Reboot is in order!!');});
    }
});

// Footer reboot button / Single view
$('#single-button-reboot').live('click', function() {
    var mName = $('#single-machine-name').text();
        titl = 'Reboot '+mName,
        msg = 'Are you sure you want to reboot '+mName+'?';
    displayConfirmation(titl, msg, function() {alert('Reboot is in order!!');});
});

// Footer reboot button / Machines view
$('#machines-button-destroy').live('click', function() {
    var machinesSelected = $('#machines .node input:checked').length;
    if (machinesSelected > 1) {
        var titl = 'Destroy Machines',
            msg = 'Are you sure you want to destroy '+machinesSelected+' machines?';
        displayConfirmation(titl, msg, function() {alert('Reboot is in order!!');});
    } else if (machinesSelected == 1) {
        var mName = $('#machines .node input:checked').closest('.node').find('.name').text();
            titl = 'Destroy '+mName,
            msg = 'Are you sure you want to destroy '+mName+'?';
        displayConfirmation(titl, msg, function() {alert('Destroy is in order!!');});
    }
});

// Footer reboot button / Single view
$('#single-button-destroy').live('click', function() {
    var mName = $('#single-machine-name').text();
        titl = 'Destroy '+mName,
        msg = 'Are you sure you want to destroy '+mName+'?';
    displayConfirmation(titl, msg, function() {alert('Destroy is in order!!');});
});

//
// CHANGE EVENTS
//

// Selection control behavior.
// Select according to control value. Show/hide footer accordingly,
// and reset selection in the end.
// Note that change event should be triggered manually! Why?
$('#mist-select-machines').live('change', function() {
    var selectVal = $(this).val();
    $('#machines-list .node input:checkbox').attr('checked',false);
    if (selectVal == 'all') {
        $('#machines-list .node:visible input:checkbox').attr('checked',true);
    } else if (selectVal != 'none') {
        $('#machines-list .node').each( function() {
            if ($(this).find('span.'+selectVal).length > 0) {
                $(this).find('input:checkbox').attr('checked',true);
            }
        });
    }
    $('#machines-list .node input:checkbox').trigger('change').checkboxradio("refresh");
    updateFooterVisibility();
    $(this).val('select').selectmenu('refresh');
});

// Event listener for node checkbox change.
// Adds a hidden text value to the node to affect
// node display while filtering.
$('#machines-list .node input:checkbox').live('change', function(event){
    var $this = $(this);
    if ($this.is(':checked')) {
        $this.closest('.node').append('<span class="mist-node-selected" style="display:none">mist-node-selected</span>');
    } else {
        $this.closest('.node').find('.mist-node-selected').remove();
    }
});

// Check for footer visibility and button enabling
// when a checkbox is selected/deselected.
$('#machines-list input:checkbox').live('change', updateFooterVisibility);


//
// MIST.IO FUNCTIONS
//

/* when the list_machines action returns, update the view */
function update_machines_view(backend){ 
    backend.machines.forEach(function(machine, index){
        var node = $('#machines-list > #' + backends.indexOf(backend) + '-' + machine.id);
        if (node.length == 1) { // there should be only one machine with this id in the DOM
            if (node.find('.name').text() != machine.name){
                node.fadeOut(100);                
                node.find('.name').text(truncate_names(machine.name, NODE_NAME_CHARACTERS));
                node.find('.backend').text(backend.title);
                node.find('.backend').addClass('prov-'+backend.provider);
                //node.find('.select')[0].id = 'chk-' + machine.id;
                node.fadeIn(100);
            }
            // Remove classes and add the basic 'state' and 'ui-li'count' for tags
            node.find('.state').removeClass().addClass('ui-li-count state state'+machine.state);
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
            //node.find('.state').addClass('state'+machine.state);
            //node.find('.state').text(STATES[machine.state]);
            node.find('.state-icon').addClass('ui-icon ui-icon-'+STATEICONS[machine.state]);
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
        try {
            $('#machines-list').listview('refresh');
        } catch(err) {}
        $("#machines-list input[type='checkbox']").checkboxradio();
        //$("input[type='checkbox']").checkboxradio("refresh");
    }
    update_machines_count();
    update_select_providers();
}

// Update footer visibility
function updateFooterVisibility() {
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
    //return;
    // TODO    
    var allMachines = 0;
    for (var i = 0 ; i < backends.length; i++) {
        allMachines += backends[i].machines.length;
    }

    $('#all-machines').text(allMachines);

    // Also update machines count bubble in initial screen.
    $('#one-li-machines .ui-li-count').text(allMachines);
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

// Update the status of a backend
function update_backend_status(backend, action) {
    
}

// Wrapper function for displaying a confirmation dialog with
// title, message and callback
function displayConfirmation(titl, msg, callbk) {
    $('#dialog-confirm-title').text(titl);
    $('#dialog-confirm-message').text(msg);
    $('#dialog-confirm-yes').one('click', function() {callbk();});
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
    addmenu.empty();
    addmenu.append('<option>Select Provider</option>');
    backends.forEach(function(b, i) {
        var optionContent = '<option value="prov-'+b.provider+'">'+b.title+'</option>';
        optgroup.append(optionContent);
        if (b.locations.length < 1) {
            addmenu.append(optionContent);
        } else {
            b.locations.forEach(function(l, j) {
                addmenu.append('<option value="prov-'+b.provider+' loc-'+l.id+'">'+b.title+' - '+l.name+'</option>');
            });
        }
    });
    try {
        $('#mist-select-machines').selectmenu('refresh');
        addmenu.selectmenu('refresh');
    } catch(err) {
    
    }
}

function truncate_names(truncateName, truncateCharacters ) { //truncate truncateName if bigger than truncateCharacters
    if (truncateName.length > truncateCharacters) {
        return truncateName.substring(0, NODE_NAME_CHARACTERS) + '...';
    } else {
        return truncateName;
    }
}