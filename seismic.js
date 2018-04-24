/*
    Author:     Nicholas Perez
    Date:       3/10/18
    Version:    1.0
    Green River College Seismic Simulating Earthquakes.
 */

$(function () {

    //Station object with a pos: x and y, as well as its distance from the earthquake
    function Station(name, stationX, stationY, distance, range) {
        this.name = name;
        this.stationX = stationX;
        this.stationY = stationY;
        this.distance = distance;
        this.range = range;
    }

    //Earthquake object with a pos: x and y, as well as its magnitude, or strength
    function Earthquake(earthquakeX, earthquakeY, magnitude) {
        this.earthquakeX = earthquakeX;
        this.earthquakeY = earthquakeY;
        this.magnitude = magnitude;
    }

    //generates a random number between 1 and the number passed in, numRange
    function getRandomIntInclusive(numRange){

        return Math.floor(Math.random() * numRange)+1;
    }

    /*
        All these constants represent the max range of the x and y for the station and the earthquake.

        The numbers are later multiplied by ten to use on a pixel grid
        and to avoid decimal points when finding distance later
    */
    const STATION_X_RANGE = 50;
    const STATION_Y_RANGE = 50;
    const EARTHQUAKE_X_RANGE = 40;
    const EARTHQUAKE_Y_RANGE = 40;

    //misc constants
    const NUMBER_OF_STATIONS = 5;
    const PADDING_COMPENSATION = 15;

    //Global variables
    let map = $('#map');
    let stationPool =[];
    let stationDiv = $('#stationDiv');
    let rangeCircle = $('#rangeCircle')
    let pos = {x: 0, y: 0};
    let selected;





    function init() {

        //checks if its fresh load
        if(stationPool.length > 0){
            stationPool = [];

            for(let j = 0 ; j<stationPool.length ; j++){
                stationPool[j]['range'] = 0;
            }
        }

        selected = '';

        //creates earthquake object
        let earthQuake = new Earthquake(
            getRandomIntInclusive(EARTHQUAKE_X_RANGE)*10,
            getRandomIntInclusive(EARTHQUAKE_Y_RANGE)*10,
            getRandomIntInclusive(7)+2
        );
        console.log(earthQuake);

        //create stations
        for(let i = 0; i < NUMBER_OF_STATIONS; i++){
            stationPool.push(new Station(
                'station'+(i+1),
                (getRandomIntInclusive(STATION_X_RANGE)*10)+PADDING_COMPENSATION,
                (getRandomIntInclusive(STATION_Y_RANGE)*10)+PADDING_COMPENSATION,
                0,0));

            stationPool[i].distance = Math.round(
                findDistance(
                    stationPool[i].stationX,
                    stationPool[i].stationY,
                    earthQuake.earthquakeX,
                    earthQuake.earthquakeY
                )
            );

        }

        //adds stations to map
        plotStations(stationPool);

        //creates and adds click functionality for station divs
        createStationOnClick(stationPool);

        //creates circle measure on wheel movement
        document.addEventListener('wheel',createCircumferenceEvents);


        console.log(stationPool);

    }

    //plots station into the #stationDiv at random top/left points
    function plotStations(stations) {
        stationDiv.empty();
        rangeCircle.empty();

        let test = document.querySelector('#stationDiv');
        let stationName;
        let circleDistanceIdName,distanceLineIdName,circleClickIdName;

        for(let i = 0; i<stations.length; i++){
            circleDistanceIdName = stations[i].name+'-circumferenceText';
            distanceLineIdName = stations[i].name+'-distanceLine';
            circleClickIdName = stations[i].name+'-circleClick';

            // document.querySelector('#stationDiv').innerHTML =
                stationDiv.append('<div class="station-style" id="'+stations[i].name+'"></div>');

            //rangeCircle

            rangeCircle.append(
                    '<span id="'+circleDistanceIdName+'" class="circleSize" style="top:'+parseInt((stations[i].stationY)+PADDING_COMPENSATION)+'px;left:'+(stations[i].stationX)+'px;"></span>'+
                '<div id="'+distanceLineIdName+'" class="line" style="top:'+parseInt((stations[i].stationY)+20)+'px;left:'+parseInt((stations[i].stationX)+4)+'px;"></div>'+
                '<div id="'+circleClickIdName+'" class="circle" style="top:'+parseInt((stations[i].stationY)+20)+'px;left:'+parseInt((stations[i].stationX)+4)+'px;"></div>');

            $('#'+stations[i].name)
                .css("top", stations[i].stationY+'px')
                .css("left", stations[i].stationX+'px');
        }
    }


    //sets the selected to a station object
    function setSelected(selectedName, stations) {
        for (let i = 0 ; i < stations.length ; i++){

            if(selectedName == stations[i].name){
                return stations[i];
            }
        }
    }

    //finds and returns the distance between a station and the earthquake
    function findDistance(stationX, stationY, earthquakeX, earthquakeY) {
        let x =0;
        let y =0;

        if(stationX > earthquakeX){
            x = stationX - earthquakeX;
        }
        if( stationX < earthquakeX){
            x = earthquakeX - stationX;
        }
        if(stationY > earthquakeY){
            y = stationY - earthquakeY;
        }
        if( stationY < earthquakeY){
            y = earthquakeY - stationY
        }

        return Math.round(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    }

    //create .on 'click' for each station and display info such as pos/location and the seismograph
    function createStationOnClick(stations) {
        for(let i = 0; i< stations.length; i++)
        {
            $('#'+stations[i].name).on('click', function () {
                $('#stationName').text(stations[i].name).css('text-transform','capitalize');
                $('#stationXPos').text(stations[i].stationX);
                $('#stationYPos').text(stations[i].stationY);

                if(selected !== ''){
                    $('#'+selected.name).removeClass('selected');
                }


                selected = setSelected($(this).attr('id'), stationPool);

                console.log(selected);

                $('#'+selected.name).addClass('selected');
            });
        }
    }


    /*
        Circumference Measuring tool for Stations
            - Select station and scroll up or down representing distance
     */

    function createCircumferenceEvents() {
        let wheelEventNumber = 0;

        if(selected !== ''){
            wheelEventNumber = event.deltaY;

            let top = parseInt(window.getComputedStyle((document.querySelector('#'+selected.name+'-circleClick')), null).getPropertyValue('top').split('px')[0]);
            let left = parseInt(window.getComputedStyle((document.querySelector('#'+selected.name+'-circleClick')), null).getPropertyValue('left').split('px')[0]);
            let lineWidth = parseInt(window.getComputedStyle((document.querySelector('#'+selected.name+'-circleClick')), null).getPropertyValue('width').split('px')[0]);

            //grow
            if(wheelEventNumber > 0){
                if(selected['range'] >= 0 ){
                    selected['range'] += 4;

                    document.querySelector('#'+selected.name+'-circleClick').style.width = selected.range+'px';
                    document.querySelector('#'+selected.name+'-circleClick').style.height = selected.range+'px';
                    document.querySelector('#'+selected.name+'-circleClick').style.top = top-2+'px';
                    document.querySelector('#'+selected.name+'-circleClick').style.left = left-2+'px';

                    document.querySelector('#'+selected.name+'-distanceLine').style.width = (lineWidth/2)+1+'px';
                }
            }
            //shrink
            else if(wheelEventNumber < 0){
                if(selected['range'] > 0 ){
                    selected['range'] -= 4;

                    document.querySelector('#'+selected.name+'-circleClick').style.width = selected.range+'px';
                    document.querySelector('#'+selected.name+'-circleClick').style.height = selected.range+'px';
                    document.querySelector('#'+selected.name+'-circleClick').style.top = top+2+'px';
                    document.querySelector('#'+selected.name+'-circleClick').style.left = left+2+'px';

                    document.querySelector('#'+selected.name+'-distanceLine').style.width = (lineWidth/2)-4+'px';
                }

            }
            console.log(selected['range']);

            document.querySelector('#'+selected.name+'-circumferenceText').innerHTML = (selected['range']/2)+'km';
        }

    }


    //generates seismic graph for each station


    //UI and button controls
    $('#init').on('click', function () {
        init();
    });

    map.on('mousemove',function (event) {
        pos.x = event.pageX - PADDING_COMPENSATION;
        pos.y = event.pageY - PADDING_COMPENSATION;
        $('#pos').text(pos.x +","+pos.y);
    });

    $('#gridToggle').on('click', function () {
        $('#grid').toggleClass('testGrid');
    });
});