define('app/views/monitoring', [
    'app/views/mistscreen',
    'text!app/templates/monitoring.html', 'ember'],
    /**
     *
     * Monitoring View
     *
     * @returns Class
     */
    function(MistScreen, monitoring_html) {
        return MistScreen.extend({

            template: Ember.Handlebars.compile(monitoring_html),

            cpuGraph: null,
            loadGraph: null,
            //other Graphs to be added (TODO)

            init: function() {
                this._super();
                this.setUpGraphs();
            },

            // Graph Constructor
            setUpGraphs: function() {
                
                // Graph Constructor
                function Graph(divID,width,timeToDisplay){

                    this.id = divID;
                    this.width = width;
                    // Calculate Aspect Ratio Of Height
                    var fixedHeight = 160 / 1280 * width;
                    this.height = (fixedHeight < 85 ? 85 : fixedHeight);
                    this.height = fixedHeight;

                    // Calculate The step  of the time axis
                    this.secondsStep =  Math.floor((timeToDisplay.getHours()*60*60 + 
                                        timeToDisplay.getMinutes()*60 + 
                                        timeToDisplay.getSeconds() ) /6); // 6 Is Labels To Display (TODO Add it as constant)
                    this.data = [];
                    var margin = {top: 30, right: 0, bottom: 30, left: 0}; // TODO Fix Margin Based On Aspect Ratio
                    
                    // May Be Removed TODO (Working On Minute And Second Step)
                    if(this.secondsStep == 0) this.secondsStep = 1; // Fix For Science Fixion Request Of 6 Seconds To Display.

                    var xScale = d3.time.scale().range([0, this.width - margin.left - margin.right]);
                    var yScale = d3.scale.linear().range([this.height - margin.top - margin.bottom, 0]);
                    var valueline = d3.svg.line()
                                    .x(function(d) {return xScale(d.time); })
                                    .y(function(d) {return yScale(d.close); });

                    
                    // Create Main Graph (SVG Element)
                    var d3svg = d3.select("#"+this.id)
                                .append('svg')
                                .attr('width',this.width)
                                .attr('height',this.height);

                    var d3valueLine = d3svg.append('g')
                                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                                      .append('path'); 

                    var d3xAxis = d3svg.append('g')
                                  .attr('class','x-axis')
                                  .attr("transform", "translate(0," + (this.height - margin.bottom) + ")");
    
                    d3xAxis.call(d3.svg.axis()
                                 .scale(xScale)
                                 .orient("bottom")
                                 .ticks(d3.time.minutes, this.secondsStep/60)
                                 .tickFormat(d3.time.format("%I:%M%p")));


                    this.updateData = function(newData) {
                        this.data = newData;
                        this.updateView();
                    };
                    
                    this.updateView = function() {

                        // Fix Our Values
                        var fixedData = [];
                        this.data.forEach(function(d) {

                            var format = d3.time.format("%X");
                            var tempObj = {};
                            tempObj.time = format.parse(d.time);
                            tempObj.close = +d.close;
                            fixedData.push(tempObj);

                        });
                        
                        xScale.domain(d3.extent(fixedData, function(d) { return d.time; }));
                        yScale.domain([0, d3.max(fixedData, function(d) { return d.close; })]);

                        // Set the valueline path.
                        d3valueLine.attr("d", valueline(fixedData));
            
                        // Update xAxis - TODO Fix secondsStep
                        d3xAxis.call(d3.svg.axis()
                                     .scale(xScale)
                                     .orient("bottom")
                                     .ticks(d3.time.minutes, this.secondsStep/60)
                                     .tickFormat(d3.time.format("%I:%M%p")));

                    };

                    /* TODO Remove Demonstration When Have A Working Graph
                    // Part Of Graph Demonstration. TODO remove It
                    this.updateVirtualData = function(newData) {
                        this.data = newData;
                        this.updateVirtual();
                    };
                    // Part Of Graph Demonstration. TODO Remove it
                    this.updateVirtual = function() {

                        // Fix Our Values
                        var fixedData = [];
                        if(this.data.length > 30)
                        {
                            for(var i= this.data.length-30; i < this.data.length ;i++ )
                            {
                                var d = this.data[i];
                                var format = d3.time.format("%X");
                                var tempObj = {};
                                tempObj.time = format.parse(d.time);
                                tempObj.close = +d.close;
                                fixedData.push(tempObj);
                            }

                        }
                        else
                        {
                            this.data.forEach(function(d) {
                                var format = d3.time.format("%X");
                                var tempObj = {};
                                tempObj.time = format.parse(d.time);
                                tempObj.close = +d.close;
                                fixedData.push(tempObj);
                            });
                        }
                        
                        xScale.domain(d3.extent(fixedData, function(d) { return d.time; }));
                        yScale.domain([0, d3.max(fixedData, function(d) { return d.close; })]);
                        
                        // Add the valueline path.
                        d3valueLine.attr("d", valueline(fixedData));
            
                        
                        d3xAxis.call(d3.svg.axis()
                                     .scale(xScale)
                                     .orient("bottom")
                                     .ticks(d3.time.seconds, 5)
                                     .tickFormat(d3.time.format("%I:%S%p")));

                    };
                    */
                    this.changeWidth = function (width) {

                        // Change Width CSS Attribute And Set New Scale Values
                        this.width = width;
                        d3svg.attr('width',this.width);
                        xScale = d3.time.scale().range([0, this.width - margin.left - margin.right]);

                        // Create An Aspect Ratio
                        var newHeight = 160 / 1280 * width;
                        newHeight = (newHeight < 85 ? 85 : newHeight);
                        this.changeHeight(newHeight);

                        // Update View Will Be Done Within changeHeight
                    };

                    // This one will only be called Only From changeWidth TODO Possibly Merge
                    function changeHeight(height) {

                        this.height = height;
                        d3svg.attr('height',this.height);
                        d3xAxis.attr("transform", "translate(0," + (this.height - margin.bottom) + ")");

                        yScale = d3.scale.linear().range([this.height - margin.top - margin.bottom, 0]);

                        this.updateView();
                    };
                }



                /* Demonstrate Info: - TODO To be removed When Done Graphs
                *  Create A Graph With Virtual Values That Shows How A Graph Will Be When Showing Last 30 Minutes.
                *  -- Arguments -- 
                * isMoving: set True For A Moving Graph or False For A Static One
                * hasPrevData: Set True To Virtualize A Machine That Is Turned On More Than 30 Minutes 
                                Else Set False For A Just Turned On Machine
                */
                /*function demonstrateGraph(isMoving,hasPrevData)
                {

                    var movingGraph = {enabled: isMoving, hasPrevData:hasPrevData};

                    Em.run.next(function() {
                
                        // Check Monitoring because it may run twice
                        if(machine.hasMonitoring){

                            machine.set('pendingStats', true);

                            // Set time To Display (Last 30 Minutes)
                            var timeToDisplay = new Date();
                            timeToDisplay.setHours(0,30,0);

                            // Ration
                            //original height / original width x new width = new height
                            var newWidth = window.innerWidth;
                            var newHeight = 160 / 1280 * newWidth;
                            if(newHeight < 85)
                                    ratioHeight = 85;
                                
                            var cpuGraph = new mistIOGraph('cpuGraph',newWidth,newHeight,timeToDisplay);
                            $(window).resize(function(){
                                cpuGraph.changeWidth(window.innerWidth);
                                var ratioHeight = 160 / 1280 * window.innerWidth;
                                if(ratioHeight < 85)
                                    ratioHeight = 85;
                                cpuGraph.changeHeight(ratioHeight);
                            })
                            if(!movingGraph.enabled){
                            // Temporary Data For Debbuging
                                var data= [
                                
                                {time: "15:35:00", close: "0.10"},
                                {time: "15:36:00", close: "0.15"},
                                {time: "15:37:00", close: "0.09"},
                                {time: "15:38:00", close: "0.25"},
                                {time: "15:39:00", close: "0.49"},
                                
                                {time: "15:40:00", close: "0.80"},
                                {time: "15:41:00", close: "0.20"},
                                {time: "15:42:00", close: "0.40"},
                                {time: "15:43:00", close: "0.10"},
                                {time: "15:44:00", close: "0.50"},
                                
                                {time: "15:45:00", close: "0.45"},
                                {time: "15:50:00", close: "0.10"},
                                {time: "15:55:00", close: "0.70"},
                                {time: "16:00:00", close: "0.80"},
                                {time: "16:05:00", close: "0.90"}
                                ]
                                
                                machine.set('pendingStats', false);
                                // This function must run every time we have new data
                                cpuGraph.updateData(data);
                            }
                            else{
                                var liveData = [];
                                    
                                    if(movingGraph.hasPrevData){
                                        // give Last 30 Second values
                                        var oldTime = new Date();
                                        for(var i=0; i<30; i++)
                                        {
                                            oldTime = new Date(oldTime.getTime() - 1000);
                                            var tempObj = {};
                                            tempObj.time = oldTime.getHours() + ":" + oldTime.getMinutes() + ":" + oldTime.getSeconds();
                                            tempObj.close = Math.random();
                                            liveData.push(tempObj);
                                        }
                                        liveData.reverse();

                                        machine.set('pendingStats', false);

                                        cpuGraph.updateVirtualData(liveData);
                                    }
                                    
                                    // Create random time and values, Update every Second
                                    window.setInterval(function(){
                                        var date = new Date();
                                        var tempObj = {};
                                        tempObj.time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                                        tempObj.close = Math.random();
                                        liveData.push(tempObj);
                                        cpuGraph.updateVirtualData(liveData);
                                    },1000);
                            }
                        }
                    });
                }*/


                // Execuation Starts Here
                Em.run.next(function() {
                    try{
                        $('.monitoring-button').button();
                        $('#add-rule-button').button();
                        $('#monitoring-dialog').popup();                        
                    } catch(err){
                        // TODO check what error may produce
                    }
                });

                var machine = this.get('controller').get('model');

                Em.run.next(function() {

                    console.log("Setting Up Graphs");       // DEBUG TODO Remove It
                    var width = $('#cpuGraph').width();     // Get Current Width

                    // Create Graphs
                    if(machine.hasMonitoring)
                        this.cpuGraph = new Graph('cpuGraph',width,new Date());

                    // Set Up Resolution Change Event
                    $(window).resize(function(){

                                this.cpuGraph.changeWidth($('#cpuGraph').width());
                    })
                });

                Mist.rulesController.redrawRules();
            }.observes('controller.model.hasMonitoring'),

    
        });
    }
);
