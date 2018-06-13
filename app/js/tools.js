/*
    Author:     Nicholas Perez
    Date:       3/10/18
    Version:    1.0
    Green River College Seismic Simulating Earthquakes.

    This file contains the functions for various tools/helper functions throughout the application.
 */

let selected = '';

/* RANDOM GEN NUMBERS */

//generates a random number between 1 and the number passed in, numRange
function getRandomIntInclusive(numRange){
    return Number(Math.floor(Math.random() * numRange)+1);
}

//generates a random number between two given ints
function getRandomIntInclusiveRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//generates a random number between 0 and the number passed in, numRange
function getRandomFloatExclusive(numRange){
    return Number(Math.random() * numRange);
}

//generates a random number between two given floats
function getRandomFloatInclusive(min, max) {
    return Number(Math.random() * (max - min) + min);
}


/* HELPER FUNCTIONS */

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

//used to retrieve the css pixel amount from a given element and style type
function getStyleNumber(element, type){
    switch (type) {
        case "top":
            return parseInt(element.style.top.split('px')[0]);
        case "left":
            return parseInt(element.style.left.split('px')[0]);
        case "right":
            return parseInt(element.style.right.split('px')[0]);
        case "bottom":
            return parseInt(element.style.bottom.split('px')[0]);
        case "height":
            return parseInt(element.style.height.split('px')[0]);
        case "width":
            return parseInt(element.style.width.split('px')[0]);
    }
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

//get data from notepad to check
function getFormData() {


    let groupOne = document.getElementById('data-group-1').children;
    let groupTwo = document.getElementById('data-group-2').children;
    let groupThree = document.getElementById('data-group-3').children;

    console.log('station value for select 1: ' + groupOne[0].childNodes[3].selectedOptions[0].value);
    console.log(groupOne[0].childNodes[7].value);//lag
    console.log(groupOne[0].childNodes[11].value);//amp
    console.log(groupOne[0].childNodes[15].value);//dis
    console.log(groupOne[0].childNodes[19].value);//mag


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



/* RANGED TOOL CONTROLS */

//updates the ranged tool per station
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


/* BUTTON AND MOUSE EVENTS */

//init button event to start the app
document.getElementById('init').addEventListener('click', () =>{
    init();
});

//mouse move event for current x,y on map
document.getElementById('map-pane').addEventListener('mousemove', (event) => {
    document.getElementById('pos').innerHTML = (event.layerX - PADDING_COMPENSATION)
        + " , " + (event.layerY - PADDING_COMPENSATION);
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

//toggle for plot epicenter button
document.getElementById('plotEpi').addEventListener('click', () =>{
    document.getElementById('map-pane').classList.toggle('mapPointer');
});

//adds the epicenter to the map and toggles the crosshairs
document.getElementById('map-pane').addEventListener('click', (event) =>{

    let CENTER_BUFFER = 28;

    if (document.getElementById('map-pane').classList.contains('mapPointer')){
        document.getElementById('solve-for').innerHTML = '';


        solver = document.createElement('div');

        solver.id = 'solverDiv';

        solver.style.top = event.y-CENTER_BUFFER+'px';
        solver.style.left = event.x-CENTER_BUFFER+'px';

        document.getElementById('solve-for').append(solver);

        solver.classList.add('solveCircleStyle');
    }
    document.getElementById('map-pane').classList.toggle('mapPointer', false);
});

//notepad
document.getElementById('notePadBtn').addEventListener('click', () =>{
    getFormData();
});

//Amp and time tool for the graphs
document.getElementById('stationGraph').addEventListener('click', (event)=>{
    const leftTimeBuffer = 31;
    const rightTimeBuffer = 582;
    const midpoint = 129;

    let ampTool = document.getElementById('ampTool');
    let timeTool = document.getElementById('timeTool');


    //uses the mouse click even as well as keyboard button presses to dictate which tool is being used
    if(event.ctrlKey){
        ampToolUpdate(ampTool,event, midpoint);
    }
    else if(event.altKey){
        timeToolUpdate(timeTool, event, rightTimeBuffer);
    }
    else{
        //sets amp tool to the mid
        if(isNaN(getStyleNumber(ampTool, 'height'))){
            ampTool.style.top = midpoint+'px';
        }
        //sets time line at clicked point
        if(event.offsetX <= leftTimeBuffer){
            timeTool.style.left = leftTimeBuffer+'px';
        }
        else if(event.offsetX >= rightTimeBuffer){
            timeTool.style.left = rightTimeBuffer+'px';
        }
        else{
            timeTool.style.left = event.offsetX+'px';
        }
        //checks of the user moves the time line with a width causing it to go outside of the parent div
        if((getStyleNumber(timeTool, 'width')+getStyleNumber(timeTool, 'left')) > rightTimeBuffer){
            timeTool.style.width = (rightTimeBuffer - getStyleNumber(timeTool, 'left'))+'px';
            document.getElementById('timeText').innerHTML = Math.round(getStyleNumber(timeTool, 'width')/3)+' sec';
        }
    }
});

function ampToolUpdate(ampTool, event, midpoint) {
    const topAmpBuffer = 17;
    const bottomAmpBuffer = 242;
    const ampIncrement = 12.5;

    if(event.layerY < midpoint) {
        if(event.layerY < 18){
            ampTool.style.top = topAmpBuffer+'px';
            ampTool.style.height = ((midpoint+1)-topAmpBuffer)+'px'
        }else{
            ampTool.style.top = event.offsetY + 'px';
            ampTool.style.height = ((midpoint+1)-event.offsetY)+'px'
        }
    }
    if(event.layerY > midpoint){

        console.log('click y: '+event.offsetY);

        ampTool.style.top = midpoint+'px';

        if(event.layerY > bottomAmpBuffer && getStyleNumber(ampTool, 'top') === midpoint){
            ampTool.style.height = (bottomAmpBuffer - midpoint) +'px';
        }else{
            ampTool.style.height = (event.offsetY - getStyleNumber(ampTool, 'top')) + 'px';
        }
        console.log('current top after clicked bellow'+getStyleNumber(ampTool, 'top'));
    }

    if(getStyleNumber(ampTool, 'height') > 0){
        if(getStyleNumber(ampTool, 'top') === midpoint){
            document.getElementById('ampText').innerHTML = (getStyleNumber(ampTool, 'height')/-ampIncrement).toPrecision(2)+'mm';
        }
        else{
            document.getElementById('ampText').innerHTML = (getStyleNumber(ampTool, 'height')/ampIncrement).toPrecision(2)+'mm';
        }
    }
}

function timeToolUpdate(timeTool, event, rightBuffer) {
    if(event.layerX > rightBuffer){
        timeTool.style.width = rightBuffer - getStyleNumber(timeTool, 'left') +'px';
    }else{
        timeTool.style.width = (event.offsetX - getStyleNumber(timeTool, 'left')) + 'px';
    }

    if(getStyleNumber(timeTool, 'width') > 0){
        document.getElementById('timeText').innerHTML = Math.round(getStyleNumber(timeTool, 'width')/3)+' sec';
    }
}