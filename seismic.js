$(function () {


    //Station object with a pos: x and y, as well as its distance from the earthquake
    function Station(name, stationX, stationY, distance) {
        this.name = name;
        this.stationX = stationX;
        this.stationY = stationY;
        this.distance = distance;
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
    const STATION_X_RANGE = 82;
    const STATION_Y_RANGE = 37;
    const EARTHQUAKE_X_RANGE = 75;
    const EARTHQUAKE_Y_RANGE = 30;

    //misc constants
    const NUMBER_OF_STATIONS = 5;
    const PADDING_COMPENSATION = 15;

    //Global variables
    let map = $('#map');
    let stationPool =[];
    let stationDiv = $('#stationDiv');
    let pos = {
        x: 0,
        y: 0
    };

    function init() {

        //checks if its fresh load
        if(stationPool.length > 0){
            stationPool = [];
        }

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
                getRandomIntInclusive(STATION_X_RANGE)*10,
                getRandomIntInclusive(STATION_Y_RANGE)*10,
                0));

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
        creatStationOnClick(stationPool);

        //creates circle measure on click/drag tool

        console.log(stationPool);

    }

    //plots station into the #stationDiv at random top/left points
    function plotStations(stations) {
        stationDiv.empty();

        for(let i = 0; i<stations.length; i++){
            stationDiv.append('<div class="station-style" id="'+stations[i].name+'"></div>');

            $('#'+stations[i].name)
                .css("left", stations[i].stationX+PADDING_COMPENSATION+'px')
                .css("top", stations[i].stationY+PADDING_COMPENSATION+'px');
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
    function creatStationOnClick(stations) {
        for(let i = 0; i< stations.length; i++)
        {
            $('#'+stations[i].name).on('click', function () {
                $('#stationName').text(stations[i].name).css('text-transform','capitalize');
                $('#stationXPos').text(stations[i].stationX);
                $('#stationYPos').text(stations[i].stationY);
            });
        }
    }


    /*
        Measuring tool for Stations - Click and drag circle representing distance
     */
    function create() {

    }

    //generates seismic graph for each station
    //to-do


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