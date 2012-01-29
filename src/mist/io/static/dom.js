var NODE_NAME_CHARACTERS = 35;
var STATES = {
    '0' : 'Running',
    '1' : 'Rebooting',
    '2' : 'Terminated',
    '3' : 'Pending',
    '4' : 'Unknown',            
    };
    
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
});

// Selection control behavior.
$('#mist-select-machines').live('change', function() {
    if ($(this).val() == 'all') {
        $('#machines-list .ui-checkbox-off').removeClass('.ui-checkbox-off').addClass('ui-checkbox-on');
        $('#machines-list .ui-icon-checkbox-off').removeClass('.ui-icon-checkbox-off').addClass('ui-icon-checkbox-on');
    } else {
        $('#machines-list .ui-checkbox-on').removeClass('.ui-checkbox-on').addClass('ui-checkbox-off');
        $('#machines-list .ui-icon-checkbox-on').removeClass('.ui-icon-checkbox-on').addClass('ui-icon-checkbox-off');
    }
});

/* when the list_machines action returns, update the view */
function update_machines_view(backend){ 
    $('#logo-container').animate({opacity : 0.04});
    backend.machines.forEach(function(machine, index){
        var node = $('#machines-list > #' + backends.indexOf(backend) + '-' + machine.id);
        if (node.length == 1) { // there should be only one machine with this id in the DOM
            if (node.find('.name').text() != machine.name){
                node.fadeOut(100);                
                node.find('.name').text(truncate_names(machine.name, NODE_NAME_CHARACTERS));
                node.find('.backend').text(backends.indexOf(backend));
                node.find('.backend').addClass('provider'+backend.provider);
                //node.find('.select')[0].id = 'chk-' + machine.id;
                node.fadeIn(100);
            }
            node.find('.state').removeClass().addClass('state').addClass('state'+machine.state);
        } else { // if the machine does does exist in the DOM, then add it 
            if (node.length != 0){
                log.newMessage(ERROR, 'DOM Error: ' + node);
            }
            node = $('.node-template').clone();
            node.removeClass('node-template');
            node.addClass('node');
            node.find('.name').text(truncate_names(machine.name, NODE_NAME_CHARACTERS));
            node.find('.backend').text(backends.indexOf(backend));
            node.find('.backend').addClass('provider'+backend.provider);
            node.find('.state').addClass('state'+machine.state);
            node.find('.state').text(STATES[machine.state]);
            node.find('input')[0].id = 'chk-' + machine.id;
            node.find('input')[0].name = 'chk-' + machine.id;
            node.find('label').attr('for', 'chk-' + machine.id);
            node[0].id = backends.indexOf(backend) + '-' + machine.id;
            node.appendTo('#machines-list');
            node.fadeIn(200);
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
     
    $('#machines-list').listview('refresh');
    $("#machines-list input[type='checkbox']").checkboxradio();
    //$("input[type='checkbox']").checkboxradio("refresh");
    update_machines_count();
}

$("input[type='checkbox']").bind( "change", function(event, ui) { alert('c');});
// update the machines counter
function update_machines_count() {
    return;
    // TODO    
    var allMachines = 0;
    for (var i = 0 ; i < backends.length; i++) {
        allMachines += backends[i].machines.length;
    }

    $('#all-machines').text(allMachines);
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

// Message notifier mouseenter and mouseleave events
$('#notifier, #notifier-in').mouseenter(function() {
    clearTimeout(log.timeout);
}).mouseleave(function() {
    // TODO: fix selectors
    log.timeout = setTimeout("$('#notifier, #notifier-in').slideUp(300)", 5000);
});

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

function truncate_names(truncateName, truncateCharacters ) { //truncate truncateName if bigger than truncateCharacters
    if (truncateName.length > truncateCharacters) {
        return truncateName.substring(0, NODE_NAME_CHARACTERS) + '...';
    } else {
        return truncateName;
    }
}