const impfWillig = 0.17;            // Anzahl der Impfwilligen
const HEARD_IMMUN = 0.7;            // Herdenimmunität von 70%
const VACC_FIRST_ROW = 6;
const VACC_SECOND_ROW = 8;
const VACC_SUM_ROW = 4;
const POP = 2;
const RECOVERED_ROW = 5;
const HOSPITAL_ROW = 6;
const CASUALTIES_ROW = 4;
const INTENSIVE_CARE_ROW = 7;
const INFECTED_ROW = 3;
const UNDER_SIXTEEN = 1369825;
const TESTS_ROW = 8;
const PREV_DAY = 10;

const bev = [433367, 428302, 423434, 435229, 506704, 595409, 613439, 613920, 571113, 608270, 700673, 698720, 587316, 460755, 411660, 342193, 278480, 140669, 65879, 17814];

function getVaccRate(arr) {
    arr = arr.filter(row => row[1] === '10'); // fitler Gesamt
    return Math.round((arr[arr.length - 1][VACC_SUM_ROW] - arr[arr.length - 8][VACC_SUM_ROW]) / 7);
}

function drawBarGroups(domElem, vaccArr, vaccArrIdx, bevArr, bevIdx) {
    const sum = vaccArr.last().map(i=>i.toInt()).sum(vaccArrIdx);
    const sumPrev = vaccArr[vaccArr.length - 12].map(i=>i.toInt()).sum(vaccArrIdx);
    const percent = (sum / bevArr.sum(bevIdx)) * 100;
    document.getElementById(domElem).style.width = `${percent}%`;
    document.getElementById(domElem).innerHTML = `${percent.toFixed(2)}% <span class="barSubText">+ ${(sum - sumPrev).toLocaleString("de-AT")}</span>`;
}

function drawBarState(domElem, vaccArr, rowIdx, colIdxPerc, colIdxAbs) {
    const percent = vaccArr[vaccArr.length - rowIdx][colIdxPerc].toFloat();
    const difference = vaccArr[vaccArr.length - rowIdx][colIdxAbs].toInt() - vaccArr[vaccArr.length - rowIdx - 11][colIdxAbs].toInt();
    document.getElementById(domElem).style.width = `${percent}%`;
    document.getElementById(domElem).innerHTML = `${percent.toFixed(2)}% <span class="barSubText">+ ${difference.toLocaleString("de-AT")}</span>`;                
}

async function load() {
    const impfData = await fetch("data/timeline-eimpfpass.csv?_=" + new Date().getTime())
            .then(response => response.text())
            .then(text => text.split("\n")
                .map(element => element.split(";"))
                );
        
    const allgData = await fetch("data/timeline-faelle-bundeslaender.csv?_=" + new Date().getTime())
            .then(response => response.text())
            .then(text => text.split("\n")
                .map(element => element.split(";"))
                );
        
    return {
        impfData: impfData,
        allgData: allgData
    };
}

function main() {
    load().then(data => draw(data.impfData, data.allgData));
    mapInit();
    
//    fetch("owid-covid-latest.json?_=" + new Date().getTime())
//            .then(response => response.json())
//            .then(function(data){
//                const str = Object.values(data).sort((a,b) => a.total_vaccinations_per_hundred > b.total_vaccinations_per_hundred ? -1 : 1).map(function(worldData, idx){
//                    const percentFirst = worldData.peopleVaccinated === null || worldData.population === null ? null : `${(worldData.people_vaccinated / worldData.population * 100).toFixed(2)}%`;
//                    const percentSecond = worldData.people_fully_vaccinated === null || worldData.population === null ? null : `${(worldData.people_fully_vaccinated / worldData.population * 100).toFixed(2)}%`;
//                    return `<div class="label">${idx + 1}. ${worldData.location}</div>
//                    <div class="myProgress">
//                        <div class="vaccFirst" style="width: ${percentFirst ?? '0px'}">${percentFirst ?? 'keine Daten'}</div>
//                        <div class="vaccSecond" style="width: ${percentSecond ?? '0px'}">${percentSecond ?? 'keine Daten'}</div>
//                    </div>`;
//                }).join('');
//                document.getElementById("world").innerHTML = str;
//            
//    });    
};

function draw(vaccData, covidData) {
    let population = vaccData.last()[POP].toInt(); // Gesamtbevölkerung Österreich

    let isVacc = vaccData.last()[VACC_SUM_ROW].toInt();    // Anzahl an bisher geimpften Personen
    let recovered = covidData.last()[RECOVERED_ROW].toInt();                  // Anzahl der bisher genesenen Personen https://info.gesundheitsministerium.at/data/AllgemeinDaten.csv
    let hospital = covidData.last()[HOSPITAL_ROW].toInt();
    let intensiveCare = covidData.last()[INTENSIVE_CARE_ROW].toInt();
    let casualties = covidData.last()[CASUALTIES_ROW].toInt();
    let infected = covidData.last()[INFECTED_ROW].toInt();
    let tests = covidData.last()[TESTS_ROW].toInt();
    let infectedCurrent = infected - casualties - recovered;
    let incidence = (covidData.last()[INFECTED_ROW].toInt() - covidData.last(70)[INFECTED_ROW].toInt()) / population * 100000;
    let incidenceDelta = incidence - ((covidData.last(10)[INFECTED_ROW].toInt() - covidData.last(80)[INFECTED_ROW].toInt()) / population * 100000);

    let recoveredDelta = recovered - covidData.last(PREV_DAY)[RECOVERED_ROW].toInt();
    let hospitalDelta = hospital - covidData.last(PREV_DAY)[HOSPITAL_ROW].toInt();
    let intensiveCareDelta = intensiveCare - covidData.last(PREV_DAY)[INTENSIVE_CARE_ROW].toInt();
    let casualtiesDelta = casualties - covidData.last(PREV_DAY)[CASUALTIES_ROW].toInt();
    let infectedDelta = infected - covidData.last(PREV_DAY)[INFECTED_ROW].toInt();
    let testsDelta = tests - covidData.last(PREV_DAY)[TESTS_ROW].toInt(); 
    let infectedCurrentDelta = infectedCurrent - (covidData.last(PREV_DAY)[INFECTED_ROW].toInt() - covidData.last(PREV_DAY)[CASUALTIES_ROW].toInt() - covidData.last(PREV_DAY)[RECOVERED_ROW].toInt());

    let vaccRate = getVaccRate(vaccData);     // Impfungen pro Tag im 7-Tage-Schnitt https://info.gesundheitsministerium.gv.at/data/timeline-eimpfpass.csv
    let sumVaccImmune = vaccData.last()[VACC_SECOND_ROW].toInt();

    //let sumImmune = sumVaccImmune + recovered;    // Anzahl an immunisierten Personen
    let vaccLeft = population * HEARD_IMMUN - sumVaccImmune; // Noch zu impfende Bevölkerung
    let vaccinations = (population * HEARD_IMMUN) * 2 - isVacc;           // Derzeit müssen 2 Impfdosen pro Person verabreicht werden
    let isImmunePercent = (sumVaccImmune / population) * 100;

    let daysSum = Math.round(vaccinations / vaccRate); // Tage die benötigt werden um bei derzeitiger Impfrate die Herdenimmunität zu erreichen
    let endDate = new Date().setDate(new Date().getDate() + daysSum); // Enddatum

    document.getElementById("bdbutton").onclick = calcVaccDate;

//                  const sum = vaccArr.last().map(i=>i.toInt()).sum(vaccArrIdx);
//            const sumPrev = vaccArr[vaccArr.length - 12].map(i=>i.toInt()).sum(vaccArrIdx);
//            const percent = (sum / bevArr.sum(bevIdx)) * 100;
//            document.getElementById(domElem).style.width = `${percent}%`;
//            document.getElementById(domElem).innerHTML = `${percent.toFixed(2)}% <span class="barSubText">+ ${sum - sumPrev}</span>`;

    function drawMainBar() {
        //                document.getElementById("myProgress").style.backgroundColor = getColor(istImmunPercent * .01, 90);
        document.getElementById("progressBar").style.backgroundColor = getColor(isImmunePercent * .01, 50);
        document.getElementById("progressBar").style.width = (isImmunePercent) + "%";
        document.getElementById("progressBar").innerHTML = (isImmunePercent).toFixed(2) + "%";
        document.getElementById("recoveredBar").style.width = ((recovered / population) * 100).toFixed(2) + "%";
        document.getElementById("update-date").innerHTML = new Date(vaccData.last()[0]).toLocaleDateString("de-AT");
    }
    
    function drawBubbles() {
        document.getElementById("datum").innerHTML = new Date(endDate).toLocaleDateString("de-AT");
        document.getElementById("tage").innerHTML = `Noch ${daysSum} Tage`;
        document.getElementById("humanisedDate").innerHTML = humanise(daysSum);
        document.getElementById("impfPers").innerHTML = vaccLeft.asRoundStr();
        document.getElementById("impfDos").innerHTML = vaccinations.asRoundStr();
        document.getElementById("impfRat").innerHTML = vaccRate.asRoundStr();
        document.getElementById("population").innerHTML = population.asRoundStr();
    //                document.getElementById("impfbar").innerHTML = (population).asRoundStr();
        document.getElementById("vaccSum").innerHTML = vaccData.last()[VACC_SUM_ROW].toInt().toLocaleString("de-AT");
        document.getElementById("vaccSumDelta").innerHTML = `+${(vaccData.last()[VACC_SUM_ROW].toInt() - vaccData.last(11)[VACC_SUM_ROW].toInt()).toLocaleString("de-AT")}`;
        document.getElementById("vaccFirst").innerHTML = vaccData.last()[VACC_FIRST_ROW].toInt().toLocaleString("de-AT");
        document.getElementById("vaccFirstDelta").innerHTML = `+${(vaccData.last()[VACC_FIRST_ROW].toInt() - vaccData.last(11)[VACC_FIRST_ROW].toInt()).toLocaleString("de-AT")}`;
        document.getElementById("vaccSecond").innerHTML = vaccData.last()[VACC_SECOND_ROW].toInt().toLocaleString("de-AT");
        document.getElementById("vaccSecondDelta").innerHTML = `+${(vaccData.last()[VACC_SECOND_ROW].toInt() - vaccData.last(11)[VACC_SECOND_ROW].toInt()).toLocaleString("de-AT")}`;
        
        document.getElementById("recovered").innerHTML = recovered.asRoundStr();
        document.getElementById("recoveredDelta").innerHTML = recoveredDelta.toSignedString();
        document.getElementById("infected").innerHTML = infected.toLocaleString("de-AT");
        document.getElementById("infectedDelta").innerHTML = infectedDelta.toSignedString();
        document.getElementById("casualties").innerHTML = casualties.toLocaleString("de-AT");
        document.getElementById("casualtiesDelta").innerHTML = casualtiesDelta.toSignedString();
        document.getElementById("hospital").innerHTML = hospital.toLocaleString("de-AT");
        document.getElementById("hospitalDelta").innerHTML = hospitalDelta.toSignedString();
        document.getElementById("intensiveCare").innerHTML = intensiveCare.toLocaleString("de-AT");
        document.getElementById("intensiveCareDelta").innerHTML = intensiveCareDelta.toSignedString();
        document.getElementById("tests").innerHTML = tests.toLocaleString("de-AT");
        document.getElementById("testsDelta").innerHTML = testsDelta.toSignedString();
        document.getElementById("infectedCurrent").innerHTML = infectedCurrent.toLocaleString("de-AT");
        document.getElementById("infectedCurrentDelta").innerHTML = infectedCurrentDelta.toSignedString();
        document.getElementById("incidence").innerHTML = Math.round(incidence).toLocaleString("de-AT");
        document.getElementById("incidenceDelta").innerHTML = Math.round(incidenceDelta).toSignedString();
    }
    
    function calcVaccDate() {
        let bday = Date.parse(document.getElementById("birthday").value);   // Datum
        if (isNaN(bday)) {
            return;
        }
        let diff = Date.now() - bday;                                       // Differenz Interval
        let age = new Date(diff).getUTCFullYear() - 1970;                   // Alter
        let idx = Math.floor(age / 5);                                      // index von bev
        let sum = 0;
        for (i = bev.length - 1; i >= idx; i--) {
            sum += bev[i];
        }
    //                    let perc = sumVaccImmune / population; // Immunanteil der Gesamtbevölkerung
        //let sumPrio = (sum - (sum * perc)); // Summe an Personen die vorher eine Impfung bekommen minus Anteil an imunisierter Personen, gemessen am Immunanteil der Gesamtbevölkerung
    //                    let sumPrio = population - sum;
        //let sumPrio = sum - sumImmune;
        let days = ((sum * 2 - isVacc) / vaccRate);                   

        if (days < 0) {
            document.getElementById("impf_done").style.display = "block";
            document.getElementById("impf_date_group").style.display = "none";
        } else {                        
            let enddate = new Date().setDate(new Date().getDate() + days);
            document.getElementById("impf_date").innerHTML = new Date(enddate).toLocaleDateString("de-AT");
            document.getElementById("impf_date_group").style.display = "block";
            document.getElementById("impf_done").style.display = "none";
            document.getElementById("impf_date_pop").innerHTML = (sum).asRoundStr();
            document.getElementById("impf_date_pop_percent").innerHTML = (((sum) / population) * 100).toFixed(2);
        }
    }
    
    drawMainBar();
    drawBubbles();
    drawGroups(vaccData);
    drawSum(vaccData, population);
    drawStates(vaccData);
    drawChart(vaccData);
}

function drawSum(vaccData, population) {
    const ges_first_percent = (vaccData.last()[6].toInt() / population) * 100;
    const ges_first_diff = vaccData.last()[6].toInt() - vaccData.last(11)[6].toInt();
    document.getElementById("ges_first").style.width = `${ges_first_percent}%`;
    document.getElementById("ges_first").innerHTML = `${ges_first_percent.toFixed(2)}% <span class="barSubText">+ ${ges_first_diff.toLocaleString("de-AT")}</span>`;
    const ges_second_percent = (vaccData.last()[8].toInt() / population) * 100;
    const ges_second_diff = vaccData.last()[8].toInt() - vaccData.last(11)[8].toInt();
    document.getElementById("ges_second").style.width = `${ges_second_percent}%`;
    document.getElementById("ges_second").innerHTML = `${ges_second_percent.toFixed(2)}% <span class="barSubText">+ ${ges_second_diff.toLocaleString("de-AT")}</span>`;
}

function drawGroups(vaccData) {
    drawBarGroups("_85_first", vaccData, [31, 32, 33], bev, [17, 18, 19]);
    drawBarGroups("_85_second", vaccData, [55, 56, 57], bev, [17, 18, 19]);

    drawBarGroups("_75_first", vaccData, [28, 29, 30], bev, [15, 16]);
    drawBarGroups("_75_second", vaccData, [52, 53, 54], bev, [15, 16]);

    drawBarGroups("_65_first", vaccData, [25, 26, 27], bev, [13, 14]);
    drawBarGroups("_65_second", vaccData, [49, 50, 51], bev, [13, 14]);

    drawBarGroups("_55_first", vaccData, [22, 23, 24], bev, [11, 12]);
    drawBarGroups("_55_second", vaccData, [46, 47, 48], bev, [11, 12]);

    drawBarGroups("_45_first", vaccData, [19, 20, 21], bev, [9, 10]);
    drawBarGroups("_45_second", vaccData, [43, 44, 45], bev, [9, 10]);

    drawBarGroups("_35_first", vaccData, [16, 17, 18], bev, [7, 8]);
    drawBarGroups("_35_second", vaccData, [40, 41, 42], bev, [7, 8]);

    drawBarGroups("_25_first", vaccData, [13, 14, 15], bev, [5, 6]);
    drawBarGroups("_25_second", vaccData, [37, 38, 39], bev, [5, 6]);

    drawBarGroups("_0_first", vaccData, [10, 11, 12], bev, [0, 1, 2, 3, 4]);
    drawBarGroups("_0_second", vaccData, [34, 35, 36], bev, [0, 1, 2, 3, 4]);
}

function drawStates(vaccData) {
    drawBarState("burgenland_first", vaccData, 10, 7, 6);
    drawBarState("burgenland_second", vaccData, 10, 9, 8);

    drawBarState("kaernten_first", vaccData, 9, 7, 6);
    drawBarState("kaernten_second", vaccData, 9, 9, 8);

    drawBarState("niederoesterreich_first", vaccData, 8, 7, 6);
    drawBarState("niederoesterreich_second", vaccData, 8, 9, 8);

    drawBarState("oberoesterreich_first", vaccData, 7, 7, 6);
    drawBarState("oberoesterreich_second", vaccData, 7, 9, 8);

    drawBarState("salzburg_first", vaccData, 6, 7, 6);
    drawBarState("salzburg_second", vaccData, 6, 9, 8);

    drawBarState("steiermark_first", vaccData, 5, 7, 6);
    drawBarState("steiermark_second", vaccData, 5, 9, 8);

    drawBarState("tirol_first", vaccData, 4, 7, 6);
    drawBarState("tirol_second", vaccData, 4, 9, 8);

    drawBarState("vorarlberg_first", vaccData, 3, 7, 6);
    drawBarState("vorarlberg_second", vaccData, 3, 9, 8);

    drawBarState("wien_first", vaccData, 2, 7, 6);
    drawBarState("wien_second", vaccData, 2, 9, 8); 
}

function drawChart(vaccData) {
    const chartRows = vaccData.filter(row => row[1] === '10');
    const ctx = document.getElementById("vaccChart").getContext("2d");

    const vaccDiffSum = chartRows.map(row => row[4]).flat().map((e, i, arr) => ((arr[i] - arr[i - 7]) / 7).toFixed(0)).slice(8);
    const vaccDiffFirst = chartRows.map(row => row[6]).flat().map((e, i, arr) => ((arr[i] - arr[i - 7]) / 7).toFixed(0)).slice(8);
    const vaccDiffSecond = chartRows.map(row => row[8]).flat().map((e, i, arr) => ((arr[i] - arr[i - 7]) / 7).toFixed(0)).slice(8);

    Chart.defaults.global.elements.point.radius = '0';

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartRows.map(row => new Date(row[0]).toLocaleDateString("de-AT")).flat().slice(8),
            datasets: [{
                label: "Vollimmun",
                data: vaccDiffSecond,
                fill: true,
                lineTension: 0,
                backgroundColor: 'rgba(27, 139, 255, 1)'
            }, {
                label: "Erste Impfung",
                data: vaccDiffFirst,
                fill: true,
                lineTension: 0,
                backgroundColor: 'rgba(132, 192, 255, 1)'
            },
            {
                label: "Gesamt",
                data: vaccDiffSum,
                fill: true,
                lineTension: 0,
                backgroundColor: 'rgba(171, 210, 251, 1)'
            }]
        },
        options: {
            title: {
                display: false,
                text: 'Impfrate 7-Tage-Schnitt'
            },
            aspectRatio: window.screen.width < 600 ? 1 : 2,
            tooltips: {
                mode: 'x'                            
            },
            scales: {
                xAxes: [{
                        ticks: {
                            autoSkipPadding: 10
                        }                                   
                }]
            }
       }
    });
}

function toggleChangelog(elem) {            
    elem.classList.toggle("toggle");
}