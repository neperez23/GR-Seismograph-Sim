    /*
        Author:     Nicholas Perez
        Date:       3/10/18
        Version:    1.0
        Green River College Seismic Simulating Earthquakes.
     */

    //Station object with a pos: x and y, as well as its distance from the earthquake
    function Station(name, stationX, stationY, distance, range, data) {
        this.name = name;
        this.stationX = stationX;
        this.stationY = stationY;
        this.distance = distance;
        this.range = range;
        this.data = data;
    }

    //Earthquake object with a pos: x and y, as well as its magnitude, or strength
    function Earthquake(earthquakeX, earthquakeY, magnitude, pWaveSpeed, sWaveSpeed, duration) {
        this.earthquakeX = earthquakeX;
        this.earthquakeY = earthquakeY;
        this.magnitude = magnitude;
        this.pWaveSpeed = pWaveSpeed;
        this.sWaveSpeed = sWaveSpeed;
        this.duration = duration;
    }

    //generates a random number between 1 and the number passed in, numRange
    function getRandomIntInclusive(numRange){
        return Math.floor(Math.random() * numRange)+1;
    }

    const STATION_RANGE = 50;
    const EARTHQUAKE_RANGE = 40;
    const NUMBER_OF_STATIONS = 5;
    const PADDING_COMPENSATION = 15;
    const MAX_MAGNITUDE = 7;
    const MAX_P_WAVE_SPEED = 3;
    const MAX_S_WAVE_SPEED = 4;
    const MAX_EARTHQUAKE_DURATION = 20;
    const MAX_LABEL = 150;

    //Global variables
    let pos = {x: 0, y: 0};
    let stationPool, selected, stationsDiv, rangedCircleDiv, earthQuake;
    let ctx = document.querySelector("#myChart");
    let myChart = makeChart([]);
    let isCtrl = false;

    //initialize function
    function init() {
        stationsDiv = document.querySelector('#stationsDiv');
        rangedCircleDiv = document.querySelector('#rangeCircleDiv');

        //reset/instantiate variables
        selected = '';
        stationPool = [];
        stationsDiv.innerHTML = '';
        rangedCircleDiv.innerHTML = '';
        myChart = makeChart([]);


        if(document.querySelector('#grid-pane').classList.length > 1){
            document.querySelector('#grid-pane').classList.toggle('gridStyle');
        }

        document.querySelector('#the-win').style.display = 'none';
        document.querySelector('#solve-for').style.display = 'none';


        //creates earthquake object


        earthQuake = new Earthquake(
            getRandomIntInclusive(EARTHQUAKE_RANGE) * 10,
            getRandomIntInclusive(EARTHQUAKE_RANGE) * 10,
            getRandomIntInclusive(MAX_MAGNITUDE) + 2,
            0,
            0,
            getRandomIntInclusive(MAX_EARTHQUAKE_DURATION)+10
        );
        earthQuake['pWaveSpeed'] = getRandomIntInclusive(MAX_P_WAVE_SPEED)+4;
        earthQuake['sWaveSpeed'] = getRandomIntInclusive(MAX_S_WAVE_SPEED);


        //create stations
        for (let i = 0; i < NUMBER_OF_STATIONS; i++) {
            stationPool.push(new Station(
                'station' + (i + 1),
                (getRandomIntInclusive(STATION_RANGE) * 10) + PADDING_COMPENSATION,
                (getRandomIntInclusive(STATION_RANGE) * 10) + PADDING_COMPENSATION,
                0, 0, ));

            stationPool[i].distance = Math.round(
                findDistance(
                    stationPool[i].stationX,
                    stationPool[i].stationY,
                    earthQuake.earthquakeX,
                    earthQuake.earthquakeY
                )
            );

            stationPool[i].data = generateChartData(
                stationPool[i].distance,
                earthQuake.magnitude,
                earthQuake.pWaveSpeed,
                earthQuake.sWaveSpeed,
                earthQuake.duration);

            //creates new html elements, adds them to the map, and adds event listeners
            plotStations(stationsDiv, stationPool[i]);
            plotRangeCircles(rangedCircleDiv, stationPool[i]);
            createStationClick(stationPool[i]);
        }

        //creates circle measure on wheel movement
        document.addEventListener('wheel',createCircumferenceEvents);

        //debug
        console.log(stationPool);
        console.log(earthQuake);

    }

    //plots station into the #stationsDiv at random top/left points
    function plotStations(stationsDiv, station) {

        //new stationDiv
        let newDiv = document.createElement('div');
        newDiv.id = station.name;
        newDiv.className = 'station-style';
        newDiv.style.top = station.stationY+'px';
        newDiv.style.left = station.stationX+'px';

        //adds to div
        stationsDiv.append(newDiv);
    }

    //plots rangedCircle and its parts into the #rangeCircleDiv at top/left points based on its station
    function plotRangeCircles(circleRangeDiv, station) {

        //new line div
        let newLineDiv = document.createElement('div');
        newLineDiv.id = station.name + '-circumferenceText';
        newLineDiv.className = 'circleSize';
        newLineDiv.style.top = station.stationY+PADDING_COMPENSATION+'px';
        newLineDiv.style.left = station.stationX+PADDING_COMPENSATION+'px';

        //new circle div
        let newCircleDiv = document.createElement('div');
        newCircleDiv.id = station.name+'-distanceLine';
        newCircleDiv.className = 'line';
        newCircleDiv.style.top = station.stationY+20+'px';
        newCircleDiv.style.left = station.stationX+4+'px';

        //new circumference span
        let newCircumferenceSpan = document.createElement('span');
        newCircumferenceSpan.id = station.name+'-circleClick';
        newCircumferenceSpan.className = 'circle';
        newCircumferenceSpan.style.top = station.stationY+20+'px';
        newCircumferenceSpan.style.left = station.stationX+4+'px';

        //adds to div
        circleRangeDiv.append(newCircleDiv, newLineDiv, newCircumferenceSpan);
    }

    //sets the selected to a station object
    function setSelected(selectedName, stations) {
        for (let i = 0 ; i < stations.length ; i++){

            if(selectedName === stations[i].name){
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

    //create .on 'click' for each station and display info such as pos/location and the seismograph uses isEmpty()
    function createStationClick(station) {

        let selectedDiv = document.querySelector('#'+station.name);

        selectedDiv.addEventListener('click', () =>{

            if(!isEmpty(selected)){
                document.querySelector('#'+selected.name).classList.remove('selected');
            }

            document.querySelector('#stationName').innerHTML = station.name;
            document.querySelector('#stationName').style.textTransform = 'capitalize';
            document.querySelector('#stationXPos').innerHTML = station.stationX;
            document.querySelector('#stationYPos').innerHTML = station.stationY;
            document.querySelector('#rangeSize').innerHTML = station.range;

            selected = setSelected(station.name, stationPool);

            selectedDiv.classList.add('selected');

            myChart = makeChart(selected.data);
        });
    }

    //part of createStationClick()
    function isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    //circumference Measuring tool for Stations - Select station and scroll up or down representing distance
    function createCircumferenceEvents() {
        let currentSelectedCircle = document.querySelector('#'+selected.name+'-circleClick');
        let currentSelectedLine = document.querySelector('#'+selected.name+'-distanceLine');
        let currentSelectedText = document.querySelector('#'+selected.name+'-circumferenceText');

        let baseRangeIncrement = 4;
        let baseTopLeftIncrement = 2;

        if(isCtrl){
            baseRangeIncrement = 8;
            baseTopLeftIncrement = 4;
        }

        if(selected !== ''){
            let wheelEventNumber = event.deltaY;
            let top = parseInt(window.getComputedStyle((document.querySelector('#'+selected.name+'-circleClick')), null).getPropertyValue('top').split('px')[0]);
            let left = parseInt(window.getComputedStyle((document.querySelector('#'+selected.name+'-circleClick')), null).getPropertyValue('left').split('px')[0]);
            let lineWidth = parseInt(window.getComputedStyle((document.querySelector('#'+selected.name+'-circleClick')), null).getPropertyValue('width').split('px')[0]);

            //grow
            if(wheelEventNumber > 0){

                if(selected['range'] >= 0 ){

                    selected['range'] += baseRangeIncrement;

                    currentSelectedCircle.style.width = selected.range+'px';
                    currentSelectedCircle.style.height = selected.range+'px';
                    currentSelectedCircle.style.top = top-baseTopLeftIncrement+'px';
                    currentSelectedCircle.style.left = left-baseTopLeftIncrement+'px';
                    currentSelectedLine.style.width = (lineWidth/2)+1+'px';
                }
            }

            //shrink
            else if(wheelEventNumber < 0){

                if(selected['range'] > 0 ){

                    selected['range'] -= baseRangeIncrement;

                    currentSelectedCircle.style.width = selected.range+'px';
                    currentSelectedCircle.style.height = selected.range+'px';
                    currentSelectedCircle.style.top = top+baseTopLeftIncrement+'px';
                    currentSelectedCircle.style.left = left+baseTopLeftIncrement+'px';
                    currentSelectedLine.style.width = (lineWidth/2)-4+'px';
                }
            }
            currentSelectedText.innerHTML = (selected['range']/2)+'km';
            currentSelectedText.style.padding = '2px';
        }
        document.querySelector('#rangeSize').innerHTML = (selected['range']/2).toString();
    }

    //generates seismic graph for each station
    function generateChartData(distance, magnitude, pWaveSpeed, sWaveSpeed, duration) {
        let dataAmount = MAX_LABEL;
        let data = [];
        let isOther = false;
        let arrivalTime = Math.round(distance/pWaveSpeed);
        let lagTime = Math.round((Math.round(distance/sWaveSpeed) - arrivalTime)/10)+5;

        console.log('distance: '+ distance +", p-wave arrival count: "+arrivalTime+', s-wave arrival count: '+Math.round(distance/sWaveSpeed)+', lag time: '+ lagTime);

        //adds arrival time
        for(let a = 0 ; a < arrivalTime ; a++){
            data.push(0);
            dataAmount--;
        }

        //adds p wave
        for(let d = 0; d<duration ; d++){
            if(isOther){
                data.push(getRandomIntInclusive(magnitude));
                isOther = false;
            }else{
                data.push(-Math.abs(getRandomIntInclusive(magnitude)));
                isOther = true;
            }
            dataAmount--;
        }

        //adds lag time
        for (let lt = 0; lt < lagTime ; lt++){
            data.push(0);
            dataAmount--;
        }

        //adds s wave
        for(let d = 0; d<duration+10 ; d++){
            if(isOther){
                data.push(getRandomIntInclusive(magnitude));
                isOther = false;
            }else{
                data.push(-Math.abs(getRandomIntInclusive(magnitude)));
                isOther = true;
            }
            dataAmount--;
        }

        for (let i = 0 ; i < dataAmount ; i ++){
            data.push(0);
        }

        return data
    }

    //makes chart labels
    function makeChartLabels(seconds) {
        let labels = [];

        for(let i = 0 ; i <= seconds ; i++){
            if((i%10) === 0){
                labels.push(i+'sec');
            }else{
                labels.push('');
            }

        }

        return labels;
    }

    //creates a new chart based on data from generateChartData()
    function makeChart(data) {

        return new Chart(ctx, {
            type: 'line',
            options:{
                scales:{
                    yAxes: [{
                        ticks:{
                            beginAtZero: true
                        }
                    }]
                },
                legend:{
                    display: true,
                    position: 'top'
                },
                tooltips: {
                    mode: 'index'
                }
            },
            data: {
                labels: makeChartLabels(MAX_LABEL),

                datasets:[
                    {
                        label: 'p-wave',
                        fill: false,
                        borderCapStyle: 'butt',
                        pointRadius: 0,
                        lineTension: 0,
                        borderColor: '#ff2400',
                        borderWidth: 1,

                        data: data
                    }
                ],

            }
        });
    }

    //UI and button controls
    document.querySelector('#init').addEventListener('click', () =>{
       init();
    });

    document.querySelector('#map-pane').addEventListener('mousemove', (event) => {
        pos.x = event.pageX - PADDING_COMPENSATION;
        pos.y = event.pageY - PADDING_COMPENSATION;
        document.querySelector('#pos').innerHTML = pos.x +","+pos.y;
    });

    document.querySelector('#gridToggle').addEventListener('click', () =>{
        document.querySelector('#grid-pane').classList.toggle('gridStyle');
    });

    document.querySelector('#map-pane').addEventListener('click', (event) =>{
       let solver = document.querySelector('#solve-for');
       let targetId = event.target.id;

       if(targetId.split('-').length !== 1){
           solver.style.display = 'block';
           solver.style.left = (event.pageX-12)+'px';
           solver.style.top = (event.pageY-12)+'px';
       }
    });

    document.querySelector('#solve').addEventListener('click', () =>{
        let solver = document.querySelector('#solve-for');
        let theWin = document.querySelector('#the-win');

        let solvePos = [parseInt(solver.style.left.split('px')[0]),parseInt(solver.style.top.split('px')[0])];
        let eqPos = [earthQuake.earthquakeX, earthQuake.earthquakeY];

        //if the pos of the solver is within 15px of the earthquake then win .. else loose
        let x = Math.abs((solvePos[0]-eqPos[0]));
        let y = Math.abs((solvePos[1]-eqPos[1]));
        if(x <= 50 && y <= 50)
        {
            theWin.style.top = '250px';
            theWin.style.left = '200px';
            theWin.style.display = 'block';
            theWin.innerHTML = '<h1 class="text-center">Winner</h1><p class="text-center">Try again!</p>';
        }
    });

    document.addEventListener('keydown', (event)=>{
        if(event.keyCode === 16){
            isCtrl = true;
        }
    });

    document.addEventListener('keyup', (event)=>{
        if(event.keyCode === 16){
            isCtrl = false;
        }
    });
