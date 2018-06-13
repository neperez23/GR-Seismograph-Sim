/*
    Author:     Nicholas Perez
    Date:       3/10/18
    Version:    1.0
    Green River College Seismic Simulating Earthquakes.

    This file contains the functions for creating seismograph readings, both data and visuals.
 */

const MAX_LABEL_COUNT = 184;
let ctx = document.getElementById("myChart");
let myChart = makeChart([]);

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

    //adds arrival time
    for(let a = 0 ; a < arrivalTime ; a++){
        data.push(0);
        dataAmount--;
    }

    // console.log(station.idName +' '+station.distance);
    // console.log(station.idName +' '+P_WAVE_SPEED);
    // console.log(station.idName +' Pre trim arrival time: '+station.distance/P_WAVE_SPEED);
    // console.log(station.idName +' Arrival Time: '+arrivalTime);
    // console.log('...');


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
                        max: 9.0,
                        min: -9.0
                    }
                }]
            },
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