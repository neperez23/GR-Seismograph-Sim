/*
    Author:     Nicholas Perez
    Date:       3/10/18
    Version:    1.0
    Green River College Seismic Simulating Earthquakes.
 */

const PADDING_COMPENSATION = 15;
const EARTHQUAKE_RANGE = 40;
const NUMBER_OF_STATIONS = 7;
const MIN_MAGNITUDE = 2.5;
const MAX_MAGNITUDE = 9.0;
const P_WAVE_SPEED = 8;
const S_WAVE_SPEED = 3.45;
const MAX_EARTHQUAKE_DURATION = 25;
const MAX_LABEL_COUNT = 184;
const STATION_POS = ['62,216','150,485','443,526','539,316','483,54','221,41','238,224'];

//Station object with a pos: x and y, as well as its distance from the earthquake
function Station(idName, x, y, elementType, cssClass, distance, range, data) {
    this.idName = idName;
    this.x = x;
    this.y = y;
    this.elementType = elementType;
    this.cssClass = cssClass;
    this.distance = distance;
    this.range = range;
    this.data = data;
}

//Earthquake object with a pos: x and y, as well as its magnitude, or strength
function Earthquake(x, y, magnitude, pWaveSpeed, sWaveSpeed, duration) {
    this.x = x;
    this.y = y;
    this.magnitude = magnitude;
    this.pWaveSpeed = pWaveSpeed;
    this.sWaveSpeed = sWaveSpeed;
    this.duration = duration;
}

//circumference range tool for stations
function RangeToolParts(idName, x, y, elementType, cssClass) {
    this.idName = idName;
    this.x = x;
    this.y = y;
    this.elementType = elementType;
    this.cssClass = cssClass;
}

//init function
function init() {

    //resets
    myChart = makeChart([]);
    document.getElementById('map-pane').classList.toggle('mapPointer', false);
    document.getElementById('solve-for').innerHTML = '';

    //create earthquake, stations, circle range tool
    let earthquake = new Earthquake(
        getRandomIntInclusive(EARTHQUAKE_RANGE) * 10,
        getRandomIntInclusive(EARTHQUAKE_RANGE) * 10,
        Number(getRandomFloatInclusive(MIN_MAGNITUDE, MAX_MAGNITUDE).toFixed(2)),
        P_WAVE_SPEED,
        S_WAVE_SPEED,
        getRandomIntInclusive(MAX_EARTHQUAKE_DURATION)+10);
    let stationPool = createStations(NUMBER_OF_STATIONS, STATION_POS, earthquake);
    let rangeTools = generateRangeToolParts(stationPool);

    solveEpicenter(earthquake);

    //plot items
    plotItems(stationPool, document.getElementById('stationsDiv'));
    plotItems(rangeTools, document.getElementById('rangeCircleDiv'));

    //sets tool tips for each station
    setToolTips(stationPool);

    //events
    addSelectedEvent(stationPool);


    // console.log(earthquake);
    // console.log(stationPool);
}

//creates an array of station objects
function createStations(amount, posArr, theEarthquake) {
    let arr = [];

    for (let i = 0; i < amount; i++) {
        arr.push(new Station(
            'station' + (i + 1).toString(),
            Number(posArr[i].split(',')[0]),
            Number(posArr[i].split(',')[1]),
            'div',
            'station-style',
            0,
            0,
            0,
        ));

        arr[i]['distance'] = findDistance(
            Number(posArr[i].split(',')[0]),
            Number(posArr[i].split(',')[1]),
            theEarthquake.x,
            theEarthquake.y
        );

        arr[i]['data'] = generateChartData(arr[i], theEarthquake);
    }
    return arr;
}

//creates an array of range tool parts
function generateRangeToolParts(stations) {
    let arr = [];

    let nameParts = ['-distanceLine','-circleClick','-circumferenceText'];
    let cssClasses = ['line','circle','circleSize'];

    for (let i = 0; i < stations.length; i++) {
        for(let f = 0; f < nameParts.length;f++){

            //plus 11 and plus 12 are used to put these elements under the station
            arr.push(new RangeToolParts(
                stations[i].idName+nameParts[f],
                stations[i].x-11,
                stations[i].y-12,
                'div',
                cssClasses[f]
            ));
        }
    }
    return arr;
}

//checks if the user has selected the right location for the earthquake
function solveEpicenter(earthquake) {
    document.getElementById('solveBtn').addEventListener('click', (e)=>{
        // let messageBox = document.getElementById('message');

        console.log(earthquake);
        console.log(PADDING_COMPENSATION);
    });
}