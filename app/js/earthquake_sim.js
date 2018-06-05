/*
    Author:     Nicholas Perez
    Date:       3/10/18
    Version:    1.0
    Green River College Seismic Simulating Earthquakes.
 */


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


//generates a random number between 1 and the number passed in, numRange
function getRandomIntInclusive(numRange){
    return Number(Math.floor(Math.random() * numRange)+1);
}

function getRandomFloatInclusive(min, max) {
    return Number(Math.random() * (max - min) + min);
}

//generates a random number between 0 and the number passed in, numRange
function getRandomFloatExclusive(numRange){
    return Number(Math.random() * numRange);
}

function getRandomIntInclusiveRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const EARTHQUAKE_RANGE = 40;
const NUMBER_OF_STATIONS = 7;
const PADDING_COMPENSATION = 15;
const MIN_MAGNITUDE = 2.5;
const MAX_MAGNITUDE = 9.0;
const P_WAVE_SPEED = 8;
const S_WAVE_SPEED = 3.45;
const MAX_EARTHQUAKE_DURATION = 25;
const MAX_LABEL_COUNT = 200;
const STATION_POS = ['62,216','150,485','443,526','539,316','483,54','221,41','238,224'];

//global... get rid of them?!?!?
let selected = '';
let ctx = document.getElementById("myChart");
let myChart = makeChart([]);
let solver;


function init() {

    //resets
    myChart = makeChart([]);
    document.getElementById('map-pane').classList.toggle('mapPointer', false);
    document.getElementById('solve-for').innerHTML = '';

    //create items
    let earthquake = new Earthquake(
        getRandomIntInclusive(EARTHQUAKE_RANGE) * 10,
        getRandomIntInclusive(EARTHQUAKE_RANGE) * 10,
        Number(getRandomFloatInclusive(MIN_MAGNITUDE, MAX_MAGNITUDE).toFixed(2)),
        P_WAVE_SPEED,
        S_WAVE_SPEED,
        getRandomIntInclusive(MAX_EARTHQUAKE_DURATION)+10);

    let stationPool = createStations(NUMBER_OF_STATIONS, STATION_POS, earthquake);
    let rangeTools = generateRangeToolParts(stationPool);

    //plot items
    plotItems(stationPool, document.getElementById('stationsDiv'));
    plotItems(rangeTools, document.getElementById('rangeCircleDiv'));

    setToolTips(stationPool);

    //events
    addSelectedEvent(stationPool);

    console.log(earthquake);
    console.log(stationPool);

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

function generateRangeToolParts(stations) {
    let arr = [];

    let nameParts = ['-distanceLine','-circleClick','-circumferenceText'];
    let cssClasses = ['line','circle','circleSize'];

    for (let i = 0; i < stations.length; i++) {
        for(let f = 0; f < nameParts.length;f++){

            //plus 5 and plus 20 are used to put these elements under the station
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

//finds and returns the distance between a station and the earthquake
function findDistance(stationX, stationY, earthquakeX, earthquakeY) {
    let a =0.0;
    let b =0.0;

    if(stationX > earthquakeX){
        a = stationX - earthquakeX;
    }
    if( stationX < earthquakeX){
        a = earthquakeX - stationX;
    }
    if(stationY > earthquakeY){
        b = stationY - earthquakeY;
    }
    if( stationY < earthquakeY){
        b = earthquakeY - stationY
    }

    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

//plots item/s to destination div/s
function plotItems(elements, destination,) {

    destination.innerHTML = '';

    for(let i = 0 ; i< elements.length ; i++) {
        let newDiv = document.createElement(elements[i].elementType);

        newDiv.id = elements[i].idName;
        newDiv.className = elements[i].cssClass;
        newDiv.style.left = elements[i].x+'px';
        newDiv.style.top = elements[i].y+'px';
        newDiv.setAttribute('data-toggle', 'tooltip');

        destination.appendChild(newDiv);
    }
}

//part of addSelectedEvent()
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

//add selected event listener to stations
function addSelectedEvent(elements){
    for(let i = 0; i<elements.length;i++){
        document.getElementById(elements[i].idName).addEventListener('click', ()=>{

            if(!isEmpty(selected)) {
                document.getElementById(selected.idName).classList.remove('selected');
                // selected = elements[i];
                // document.getElementById(selected.idName).classList.add('selected');

            }
            selected = elements[i];

            document.getElementById(selected.idName).classList.add('selected');

            document.getElementById('stationName').innerHTML = selected.idName;
            document.getElementById('stationName').style.textTransform = 'capitalize';
            document.getElementById('stationXPos').innerHTML = selected.x;
            document.getElementById('stationYPos').innerHTML = selected.y;

            myChart.destroy();
            myChart = makeChart(selected.data);
        })
    }
}

function setCircumference(incrementModifier) {
    let rangeHTMLParts = document.getElementById('rangeCircleDiv').children;

    let line, circle,distance;

    //change for grow and shrink
    if(event.deltaY < 0) {
        incrementModifier[0] = 0 - incrementModifier[0];
        incrementModifier[1] = 0 - incrementModifier[1];
    }

    for(let i = 0; i< rangeHTMLParts.length; i++){
        if(selected.idName.slice(7, 8) === rangeHTMLParts[i].id.split('-')[0].slice(7,8)){
            line = rangeHTMLParts[i];
            circle = rangeHTMLParts[i+1];
            distance = rangeHTMLParts[i+2];
            break;
        }
    }
    if(selected.range >= 0 ) {
        //prevents neg range numbers
        if (selected.range + incrementModifier[0] < 0) {
            selected['range'] = 0;
        } else {
            selected['range'] += incrementModifier[0];

            line.style.width = ((selected.range/2)-1)+'px';

            circle.style.width = selected.range+'px';
            circle.style.height = selected.range+'px';

            circle.style.top = (getStyleNumber(circle, 'top') - incrementModifier[1])+'px';
            circle.style.left = (getStyleNumber(circle, 'left') - incrementModifier[1])+'px';

            distance.innerHTML = selected.range/2 + ' km';

            document.getElementById('rangeSize').innerHTML = (selected.range/2).toString();
        }
    }
}

//sets tool tips for each station
function setToolTips(stations) {
    let stationDiv = document.getElementById('stationsDiv').children;

    let name;

    for(let i = 0 ; i < stations.length ; i++){
        name = stations[i].idName.charAt(0).toUpperCase()+stations[i].idName.slice(1, 7)+' '+stations[i].idName.charAt(7);
        stationDiv[i].setAttribute('title', name);
    }
}

//creates a tiered data in order
function taperData(range, scale) {
    let arr = [];

    for(let i = 0; i<range; i++){
        arr.push(Number(getRandomFloatExclusive(scale).toFixed(2)));
    }
    return arr.sort().reverse();
}

//changes every other value to negative
function alternateValue(arr) {
    let tempArr = [];

    for(let i = 0; i<arr.length; i++){
        if(i%2===0){
            tempArr.push(arr[i]);
        }else{
            tempArr.push(-Math.abs(arr[i]));
        }
    }
    return tempArr
}

//used the sort data into staggered sections so its a more random looking linear progression
function bracketSort(arr) {
    let highBracket = Number(Math.round(getRandomIntInclusiveRange(5,arr.length/3)));
    let medBracket = Number(Math.round(getRandomIntInclusiveRange(4,arr.length/2)));
    let lowBracket = arr.length-(highBracket+medBracket);

    let highPart = arr.slice(0,lowBracket).sort(function(){return 0.5 - Math.random()});
    let medPart = arr.slice(lowBracket,medBracket+lowBracket).sort(function(){return 0.5 - Math.random()});
    let lowPart = arr.slice(medBracket+lowBracket,arr.length).sort(function(){return 0.5 - Math.random()});

    return highPart.concat(medPart).concat(lowPart);
}

//makes the data for the charts
function generateChartData(station, theEarthquake) {
    let duration = Number(theEarthquake.duration);
    let magnitude = theEarthquake.magnitude;

    let dataAmount = MAX_LABEL_COUNT;

    let arrivalTime = Number((station.distance/P_WAVE_SPEED).toString().split('.')[0]);
    let data = [];
    let lagTime =((station.distance/S_WAVE_SPEED) - arrivalTime);


    //change to string them split then make number again
    //arrivalTime = Number(arrivalTime.split('.')[0]);

    //create numbers ->sort in order->bracket sort -> alternate abs



    //adds arrival time
    for(let a = 0 ; a < arrivalTime ; a++){
        data.push(0);
        dataAmount--;
    }

    console.log(station.idName +' '+station.distance);
    console.log(station.idName +' '+P_WAVE_SPEED);
    console.log(station.idName +' Pre trim arrival time: '+station.distance/P_WAVE_SPEED);
    console.log(station.idName +' Arrival Time: '+arrivalTime);
    console.log('...');


    //adds p wave
    let pData = alternateValue(bracketSort(taperData(duration, (magnitude/2))));
    for(let p = 0; p<theEarthquake.duration ; p++){
        data.push(pData[p]);
        dataAmount--;
    }

    //lag time
    for (let lt = 0; lt < lagTime ; lt++){
        if(lt%2 === 0){
            data.push(.09)
        }else{
            data.push(-.09);
        }
        dataAmount--;
    }

    let sData = alternateValue(bracketSort(taperData(duration, magnitude)));
    for(let s = 0; s<theEarthquake.duration ; s++){
        data.push(sData[s]);
        dataAmount--;
    }

    for (let i = 0 ; i < dataAmount ; i ++){
        data.push(0);
    }

    return data;
}

//makes chart labels
function makeChartLabels(seconds) {
    let labels = [];
    let count = 0;

    for(let i = 0 ; i <= seconds ; i++){
        if(count%8 === 0){
            labels.push(count +' sec');
        }else{
            labels.push(count)
        }
        count++;
    }
    return labels;
}

//creates a new chart based on data from generateChartData()
function makeChart(data) {
    return new Chart(ctx, {
        type: 'line',
        options:{
            responsive:true,
            maintainAspectRatio: false,


            scales:{
                yAxes: [{
                    ticks:{
                        // beginAtZero: true,
                        max: 10,
                        min: -10
                    }
                }]
            },
            // scales: {
            //     xAxes: [{
            //         display: false
            //     }],
            //     yAxes: [{
            //         display: false
            //     }],
            // },
            legend:{
                display: false
            },
            tooltips: {
                enabled: false
            },
            hover: {
                mode: null
            }
        },
        data: {
            labels: makeChartLabels(MAX_LABEL_COUNT),

            datasets:[
                {
                    label: 'reading',
                    fill: false,
                    borderCapStyle: 'butt',
                    pointRadius: 0,
                    lineTension: 0,
                    borderColor: '#2c882b',
                    borderWidth: 1,
                    

                    data: data
                }
            ],

        }
    });
}

//used to retrieve the css pixel amount from a given element and style type
function getStyleNumber(element, type){

    switch (type) {
        case "top":
            return Number(element.style.top.split('px')[0]);
        case "left":
            return Number(element.style.left.split('px')[0]);
        case "right":
            return Number(element.style.right.split('px')[0]);
        case "bottom":
            return Number(element.style.bottom.split('px')[0]);
        case "height":
            return Number(element.style.height.split('px')[0]);
        case "width":
            return Number(element.style.width.split('px')[0]);
    }
}

//UI and button controls
document.getElementById('init').addEventListener('click', () =>{
    init();
});

//mouse move event for current x,y on map
document.getElementById('map-pane').addEventListener('mousemove', (event) => {
    document.getElementById('pos').innerHTML = (event.clientX)
        + " , " + (event.clientY);
});

//toggle event for map grid
document.getElementById('gridToggle').addEventListener('click', () =>{
    document.getElementById('grid-pane').classList.toggle('gridStyle');
});

//creates circle measure on wheel movement
document.addEventListener('wheel', (e) =>{
    let circumferenceModifier;//4,2,8,4

    if(selected !== ''){
        if(e.shiftKey){
            circumferenceModifier = [8,4];
        }else{
            circumferenceModifier = [2,1];
        }
        setCircumference(circumferenceModifier);
    }
});

// document.getElementById('placeEpi').addEventListener('click', (e) =>{
//     getFormData();
// });
//
// function getFormData() {
//
//
//     let groupOne = document.getElementById('data-group-1').children;
//     let groupTwo = document.getElementById('data-group-2').children;
//     let groupThree = document.getElementById('data-group-3').children;
//
//     console.log('station value for select 1: ' + groupOne[0].childNodes[3].selectedOptions[0].value);
//     console.log(groupOne[0].childNodes[7].value);//lag
//     console.log(groupOne[0].childNodes[11].value);//amp
//     console.log(groupOne[0].childNodes[15].value);//dis
//     console.log(groupOne[0].childNodes[19].value);//mag
//
//
// }

//Amp and time tool for the graphs
document.getElementById('stationGraph').addEventListener('click', (e)=>{
    let midpoint = 129.00;

    //uses the mouse click even as well as keyboard button presses to dictate which tool is being used
    if(e.ctrlKey){
        console.log('x: '+e.offsetX+ ' y: '+ e.offsetY);
        if(e.layerY < midpoint) {
            ampTool.style.top = e.offsetY + 'px';
            ampTool.style.height = (midpoint-e.offsetY+1)+'px'
        }
        if(e.layerY > midpoint){
            ampTool.style.top = midpoint+'px';
            ampTool.style.height = (e.offsetY - getStyleNumber(ampTool, 'top')) + 'px';
        }
    }else if(e.altKey){

        timeTool.style.width = (e.offsetX - getStyleNumber(timeTool, 'left')) + 'px';
    }else{

        //sets time line at clicked point
        timeTool.style.left = e.offsetX+'px';

        //checks of the user moves the time line with a width causing it to go outside of the parent div
        if((getStyleNumber(timeTool, 'width')+getStyleNumber(timeTool, 'left')) > 600){
            timeTool.style.width = (600 - getStyleNumber(timeTool, 'left'))+'px';
        }

        //checks if amp tool is above the 0 line and adjusts the top to be above the midpoint of the tool box
        if(getStyleNumber(ampTool, 'top') <= midpoint){
            ampTool.style.top = midpoint+'px';
        }
    }
});

//toggle for plot epicenter button
document.getElementById('plotEpi').addEventListener('click', (e) =>{
    document.getElementById('map-pane').classList.toggle('mapPointer');
});

//adds the epicenter to the map and toggles the crosshairs
document.getElementById('map-pane').addEventListener('click', (e) =>{
   if (document.getElementById('map-pane').classList.contains('mapPointer')){
       document.getElementById('solve-for').innerHTML = '';


       solver = document.createElement('div');

       solver.id = 'solverDiv';

       solver.style.top = e.y-28+'px';
       solver.style.left = e.x-28+'px';

       document.getElementById('solve-for').append(solver);

       solver.classList.add('solveCircleStyle');
   }
   document.getElementById('map-pane').classList.toggle('mapPointer', false);
});