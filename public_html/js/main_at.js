const HEARD_IMMUN = 0.85;            // Herdenimmunität von 70%
const VACC_FIRST_ROW = 6;
const VACC_SECOND_ROW = 8;
const VACC_SUM_ROW = 4;
const POP = 2;
const RECOVERED_ROW = 5;
const HOSPITAL_ROW = 6;
const CASUALTIES_ROW = 4;
const INTENSIVE_CARE_ROW = 7;
const INFECTED_ROW = 3;
const UNDER_TWELVE = 1031247;
const TESTS_ROW = 8;
const PREV_DAY = 10;
const PREV_WEEK = 70;

const bevDemo = [[433367, 428302, 423434], [435229, 506704], [595409, 613439], [613920, 571113], [608270, 700673], [698720, 587316], [460755, 411660], [342193, 278480], [140669, 65879, 17814]];
const bevGeo = { 
    "Burgenland": 296010,
    "Kärnten": 562089, 
    "Niederösterreich": 1690879, 
    "Oberösterreich": 1495608,
    "Salzburg": 560710,
    "Steiermark": 1247077,
    "Tirol": 760105,
    "Vorarlberg": 399237,
    "Wien": 1920949,
    "Österreich": 8932664
}

function getVaccRate(arr) {
    arr = arr.filter(row => row[1] === '10'); // fitler Gesamt
    return Math.round((arr[arr.length - 1][VACC_SUM_ROW] - arr[arr.length - 8][VACC_SUM_ROW]) / 7);
}

async function load() {
    const impfDataGeo = await fetch("data/COVID19_vaccination_doses_timeline.json?_=" + new Date().getTime())
            .then(response => response.json())
    
    const impfDataDemo = await fetch("data/COVID19_vaccination_doses_agegroups.json?_=" + new Date().getTime())
            .then(response => response.json())
        
    const allgData = await fetch("data/timeline-faelle-bundeslaender.csv?_=" + new Date().getTime())
            .then(response => response.text())
            .then(text => text.split("\n")
                .map(element => element.split(";"))
                );
        
    return {
        impfDataGeo: impfDataGeo,
        impfDataDemo: objectLast(impfDataDemo),
        allgData: allgData
    };
}

function main() {
    load().then(data => draw(data.impfDataGeo, data.impfDataDemo, data.allgData));
    mapInit();
};

function draw(vaccDataGeo, vaccDataDemo, covidData) {
    
    const vaccDataAut = Object.values(vaccDataGeo).map(date => date["Österreich"])
    const vaccDataAutCur = objectSum(vaccDataAut.last())
    const vaccDataAutPre = objectSum(vaccDataAut.last(7))
    
    const population = bevDemo.flat().reduce((res, idx) => res + idx, 0); // Gesamtbevölkerung Österreich

    const recovered = covidData.last()[RECOVERED_ROW].toInt();                  // Anzahl der bisher genesenen Personen https://info.gesundheitsministerium.at/data/AllgemeinDaten.csv
    const hospital = covidData.last()[HOSPITAL_ROW].toInt();
    const intensiveCare = covidData.last()[INTENSIVE_CARE_ROW].toInt();
    const casualties = covidData.last()[CASUALTIES_ROW].toInt();
    const infected = covidData.last()[INFECTED_ROW].toInt();
    const tests = covidData.last()[TESTS_ROW].toInt();
    const infectedCurrent = infected - casualties - recovered;
    const incidence = (covidData.last()[INFECTED_ROW].toInt() - covidData.last(70)[INFECTED_ROW].toInt()) / population * 100000;
    const incidenceDelta = incidence - ((covidData.last(10)[INFECTED_ROW].toInt() - covidData.last(80)[INFECTED_ROW].toInt()) / population * 100000);

    const recoveredDelta = recovered - covidData.last(PREV_DAY)[RECOVERED_ROW].toInt();
    const hospitalDelta = hospital - covidData.last(PREV_DAY)[HOSPITAL_ROW].toInt();
    const intensiveCareDelta = intensiveCare - covidData.last(PREV_DAY)[INTENSIVE_CARE_ROW].toInt();
    const casualtiesDelta = casualties - covidData.last(PREV_DAY)[CASUALTIES_ROW].toInt();
    const infectedDelta = infected - covidData.last(PREV_DAY)[INFECTED_ROW].toInt();
    const testsDelta = tests - covidData.last(PREV_DAY)[TESTS_ROW].toInt(); 
    const infectedCurrentDelta = infectedCurrent - (covidData.last(PREV_DAY)[INFECTED_ROW].toInt() - covidData.last(PREV_DAY)[CASUALTIES_ROW].toInt() - covidData.last(PREV_DAY)[RECOVERED_ROW].toInt());
    
    const recoveredAvg = (recovered - covidData.last(PREV_WEEK)[RECOVERED_ROW].toInt()) / 7;
    const hospitalAvg = (hospital - covidData.last(PREV_WEEK)[HOSPITAL_ROW].toInt()) / 7;
    const intensiveCareAvg = (intensiveCare - covidData.last(PREV_WEEK)[INTENSIVE_CARE_ROW].toInt()) / 7;
    const casualtiesAvg = (casualties - covidData.last(PREV_WEEK)[CASUALTIES_ROW].toInt()) / 7;
    const infectedAvg = (infected - covidData.last(PREV_WEEK)[INFECTED_ROW].toInt()) / 7;
    const testsAvg = (tests - covidData.last(PREV_WEEK)[TESTS_ROW].toInt()) / 7; 
    const infectedCurrentAvg = (infectedCurrent - (covidData.last(PREV_WEEK)[INFECTED_ROW].toInt() - covidData.last(PREV_WEEK)[CASUALTIES_ROW].toInt() - covidData.last(PREV_WEEK)[RECOVERED_ROW].toInt())) / 7;

    const vaccRate = (vaccDataAut.last()["2"] - vaccDataAut.last(7)["2"]) / 7     // Impfungen pro Tag im 7-Tage-Schnitt https://info.gesundheitsministerium.gv.at/data/timeline-eimpfpass.csv
    const sumVaccImmune = vaccDataAut.last()["2"];

    //let sumImmune = sumVaccImmune + recovered;    // Anzahl an immunisierten Personen
//    const isVacc = vaccDataAut.last()["2"];    // Anzahl an bisher geimpften Personen
    const vaccLeft = population * HEARD_IMMUN - sumVaccImmune; // Noch zu impfende Bevölkerung
//    const vaccinations = (population * HEARD_IMMUN) * 2 - isVacc;           // Derzeit müssen 2 Impfdosen pro Person verabreicht werden
    const isImmunePercent = (sumVaccImmune / population) * 100;
    const isInoculablePercent = (sumVaccImmune / (population - UNDER_TWELVE)) * 100;

    const daysSum = Math.round(vaccLeft / vaccRate * 2); // Tage die benötigt werden um bei derzeitiger Impfrate die Herdenimmunität zu erreichen
    const endDate = new Date().setDate(new Date().getDate() + daysSum); // Enddatum

    function drawMainBar() {
        //                document.getElementById("myProgress").style.backgroundColor = getColor(istImmunPercent * .01, 90);
        document.getElementById("inoculableBar").innerHTML = (isInoculablePercent).toFixed(2) + "%";
        document.getElementById("inoculableBar").style.width = (isInoculablePercent) + "%";
        document.getElementById("inoculableBar").style.backgroundColor = getColor(isInoculablePercent * .01, 70);
        
        document.getElementById("progressBar").style.backgroundColor = getColor(isImmunePercent * .01, 50);
        document.getElementById("progressBar").innerHTML = (isImmunePercent).toFixed(2) + "%";
        document.getElementById("progressBar").style.width = (isImmunePercent) + "%";        
        document.getElementById("update-date").innerHTML = new Date(Object.keys(vaccDataGeo).last()).toLocaleDateString("de-AT")
    }
    
    function drawBubbles() {
        document.getElementById("datum").innerHTML = new Date(endDate).toLocaleDateString("de-AT");
        document.getElementById("tage").innerHTML = `Noch ${daysSum} Tage`;
        document.getElementById("humanisedDate").innerHTML = humanise(daysSum);
        document.getElementById("impfPers").innerHTML = vaccLeft.asRoundStr();
//        document.getElementById("impfDos").innerHTML = vaccinations.asRoundStr();
//        document.getElementById("impfRat").innerHTML = vaccRate.asRoundStr();
        document.getElementById("population").innerHTML = population.asRoundStr();
    //                document.getElementById("impfbar").innerHTML = (population).asRoundStr();
        document.getElementById("vaccSum").innerHTML = vaccDataAutCur.toLocaleString("de-AT");
        document.getElementById("vaccSumDelta").innerHTML = `+${(objectSum(vaccDataAut.last()) - objectSum(vaccDataAut.last(1))).asRoundStr()}`;
        document.getElementById("vaccSumAvg").innerHTML = `Ø ${((objectSum(vaccDataAut.last()) - objectSum(vaccDataAut.last(7))) / 7).asRoundStr()}`;
        document.getElementById("vaccFirst").innerHTML = vaccDataAut.last()["1"].toLocaleString("de-AT");
        document.getElementById("vaccFirstDelta").innerHTML = `+${(vaccDataAut.last()["1"] - vaccDataAut.last(1)["1"]).asRoundStr()}`;
        document.getElementById("vaccFirstAvg").innerHTML = `Ø ${((vaccDataAut.last()["1"] - vaccDataAut.last(7)["1"]) / 7).asRoundStr()}`;
        document.getElementById("vaccSecond").innerHTML = vaccDataAut.last()["2"].toLocaleString("de-AT");
        document.getElementById("vaccSecondDelta").innerHTML = `+${(vaccDataAut.last()["2"] - vaccDataAut.last(1)["2"]).asRoundStr()}`;
        document.getElementById("vaccSecondAvg").innerHTML = `Ø ${((vaccDataAut.last()["2"] - vaccDataAut.last(7)["2"]) / 7).asRoundStr()}`;
        document.getElementById("vaccThird").innerHTML = vaccDataAut.last()["3"].toLocaleString("de-AT");
        document.getElementById("vaccThirdDelta").innerHTML = `+${(vaccDataAut.last()["3"] - vaccDataAut.last(1)["3"]).asRoundStr()}`;
        document.getElementById("vaccThirdAvg").innerHTML = `Ø ${((vaccDataAut.last()["3"] - vaccDataAut.last(7)["3"]) / 7).asRoundStr()}`;
        
        document.getElementById("recovered").innerHTML = recovered.asRoundStr();
        document.getElementById("recoveredDelta").innerHTML = recoveredDelta.toSignedString();
        document.getElementById("recoveredAvg").innerHTML = `Ø ${recoveredAvg.asRoundStr()}`;
        document.getElementById("infected").innerHTML = infected.toLocaleString("de-AT");
        document.getElementById("infectedDelta").innerHTML = infectedDelta.toSignedString();
        document.getElementById("infectedAvg").innerHTML = `Ø ${infectedAvg.asRoundStr()}`;
        document.getElementById("casualties").innerHTML = casualties.toLocaleString("de-AT");
        document.getElementById("casualtiesDelta").innerHTML = casualtiesDelta.toSignedString();
        document.getElementById("casualtiesAvg").innerHTML = `Ø ${casualtiesAvg.asRoundStr()}`;
        document.getElementById("hospital").innerHTML = hospital.toLocaleString("de-AT");
        document.getElementById("hospitalDelta").innerHTML = hospitalDelta.toSignedString();
        document.getElementById("hospitalAvg").innerHTML = `Ø ${hospitalAvg.asRoundStr()}`;
        document.getElementById("intensiveCare").innerHTML = intensiveCare.toLocaleString("de-AT");
        document.getElementById("intensiveCareDelta").innerHTML = intensiveCareDelta.toSignedString();
        document.getElementById("intensiveCareAvg").innerHTML = `Ø ${intensiveCareAvg.asRoundStr()}`;
        document.getElementById("tests").innerHTML = tests.toLocaleString("de-AT");
        document.getElementById("testsDelta").innerHTML = testsDelta.toSignedString();
        document.getElementById("testsAvg").innerHTML = `Ø ${testsAvg.asRoundStr()}`;
        document.getElementById("infectedCurrent").innerHTML = infectedCurrent.toLocaleString("de-AT");
        document.getElementById("infectedCurrentDelta").innerHTML = infectedCurrentDelta.toSignedString();
        document.getElementById("infectedCurrentAvg").innerHTML = `Ø ${infectedCurrentAvg.asRoundStr()}`;
        document.getElementById("incidence").innerHTML = Math.round(incidence).toLocaleString("de-AT");
        document.getElementById("incidenceDelta").innerHTML = Math.round(incidenceDelta).toSignedString();
    }
    
//    function calcVaccDate() {
//        let bday = Date.parse(document.getElementById("birthday").value);   // Datum
//        if (isNaN(bday)) {
//            return;
//        }
//        let diff = Date.now() - bday;                                       // Differenz Interval
//        let age = new Date(diff).getUTCFullYear() - 1970;                   // Alter
//        let idx = Math.floor(age / 5);                                      // index von bev
//        let sum = 0;
//        for (i = bev.length - 1; i >= idx; i--) {
//            sum += bev[i];
//        }
//    //                    let perc = sumVaccImmune / population; // Immunanteil der Gesamtbevölkerung
//        //let sumPrio = (sum - (sum * perc)); // Summe an Personen die vorher eine Impfung bekommen minus Anteil an imunisierter Personen, gemessen am Immunanteil der Gesamtbevölkerung
//    //                    let sumPrio = population - sum;
//        //let sumPrio = sum - sumImmune;
//        let days = ((sum * 2 - isVacc) / vaccRate);                   
//
//        if (days < 0) {
//            document.getElementById("impf_done").style.display = "block";
//            document.getElementById("impf_date_group").style.display = "none";
//        } else {                        
//            let enddate = new Date().setDate(new Date().getDate() + days);
//            document.getElementById("impf_date").innerHTML = new Date(enddate).toLocaleDateString("de-AT");
//            document.getElementById("impf_date_group").style.display = "block";
//            document.getElementById("impf_done").style.display = "none";
//            document.getElementById("impf_date_pop").innerHTML = (sum).asRoundStr();
//            document.getElementById("impf_date_pop_percent").innerHTML = (((sum) / population) * 100).toFixed(2);
//        }
//    }
    
    drawMainBar();
    drawBubbles();
    drawGroups(vaccDataDemo);
    drawStates(Object.values(vaccDataGeo));
    drawChart(vaccDataGeo);
    drawChartVaccWill();
    drawChartVaccWillNotYet();
    drawChartCompulVacc();
    drawChartVaccChild();
}

function drawBarGroups(domElem, vaccArr, vaccArrIdx, bevArr, bevIdx) {
    const sum = vaccArr.last().map(i=>i.toInt()).sum(vaccArrIdx);
    const sumPrev = vaccArr[vaccArr.length - 12].map(i=>i.toInt()).sum(vaccArrIdx);
    const percent = (sum / bevArr.sum(bevIdx)) * 100;
    document.getElementById(domElem).style.width = `${percent}%`;
    document.getElementById(domElem).innerHTML = `${percent.toFixed(2)}% <span class="barSubText">+ ${(sum - sumPrev).toLocaleString("de-AT")}</span>`;
}

function drawGroups(vaccData) {
    const groupNames = Object.keys(vaccData).slice(2)
    groupNames.unshift("0-14")
    vaccData = Object.values(vaccData)
    const firstAge = {
        "1": vaccData[0]["1"] + vaccData[1]["1"],
        "2": vaccData[0]["2"] + vaccData[1]["2"],
        "3": vaccData[0]["3"] + vaccData[1]["3"],
    }
    vaccData = vaccData.slice(2, -1)
    vaccData.unshift(firstAge)
    let html = ""
    vaccData.forEach((group, groupIdx) => {
        html += `<div class="label">${groupNames[groupIdx]}</div>
                <div class="myProgress">`
        Object.values(group).forEach((dose, doseIdx) => {
            const percent = (dose / bevDemo[groupIdx].sum()) * 100;
            const domEl = `<div id="group_${groupIdx}_${doseIdx + 1}" style="width:${percent}%" class="vacc${doseIdx + 1}">${percent.toFixed(2)}%</div>`            
            html += domEl
        })
        html += "</div>"
    })
    
    document.getElementById("agegroups").innerHTML = html
}

function drawStates(vaccArr) {
    const stateNames = Object.keys(vaccArr.last()).slice(1)
    Object.values(vaccArr.last()).slice(1).forEach((state, stateIdx) => {
        const stateName = stateNames[stateIdx]
        Object.values(state).forEach((dose, doseIdx) => {
            const idx = doseIdx + 1
            const domEl = document.getElementById(stateName + "_" + idx)
            const percent = vaccArr.last()[stateName][idx] / bevGeo[stateName] * 100;
            const difference = vaccArr.last()[stateName][idx] - vaccArr.last(1)[stateName][idx];
            domEl.style.width = `${percent}%`;
            domEl.innerHTML = `${percent.toFixed(2)}% <span class="barSubText">+ ${difference.toLocaleString("de-AT")}</span>`;
        })
    })
}

function drawChart(vaccData) {
    const ctx = document.getElementById("vaccChart").getContext("2d");
    const cols = Object.keys(vaccData)
    const vaccArr = Object.values(vaccData)

    const vaccSum = vaccArr.map(e => objectSum(e["Österreich"])).map((e, i, arr) => ((arr[i] - arr[i - 7]) / 7).toFixed(0)).slice(8)
    const vacc1 = vaccArr.map(e => e["Österreich"]["1"]).map((e, i, arr) => ((arr[i] - arr[i - 7]) / 7).toFixed(0)).slice(8)
    const vacc2 = vaccArr.map(e => e["Österreich"]["2"]).map((e, i, arr) => ((arr[i] - arr[i - 7]) / 7).toFixed(0)).slice(8)
    const vacc3 = vaccArr.map(e => e["Österreich"]["3"]).map((e, i, arr) => ((arr[i] - arr[i - 7]) / 7).toFixed(0)).slice(8)

    Chart.defaults.global.elements.point.radius = '0';

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: cols.map(col => new Date(col).toLocaleDateString("de-AT")).flat().slice(8),
            datasets: [{
                label: "3. Impfung",
                data: vacc3,
                fill: true,
                lineTension: 0,
                backgroundColor: '#99caff'
            }, {
                label: "2. Impfung",
                data: vacc2,
                fill: true,
                lineTension: 0,
                backgroundColor: '#bdddff'
            }, {
                label: "1.Impfung",
                data: vacc1,
                fill: true,
                lineTension: 0,
                backgroundColor: '#DBEDFF'
            },
            {
                label: "Gesamt",
                data: vaccSum,
                fill: true,
                lineTension: 0,
                backgroundColor: '#f2f2f2'
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

const doughChartOptions = {
            legend: {
                position: 'bottom'
            },
            plugins: {
                legend: false,
                outlabels: {
                   text: '%l %p',
                   color: 'white',
                   borderRadius: 4,
                   font: {
                       resizable: true,
                       minSize: 12,
                       maxSize: 18
                   }
                }
            },
            layout: {
                padding: 50
            }
        };

function drawChartVaccWill() {
    new Chart(document.getElementById("chartVaccWill").getContext("2d"), {
        type: 'doughnut',
        data: {
            labels: ['Geimpft', 'Ja', 'Teils', 'Nein'],
            datasets: [{
                label: "Vollimmun",
                data: [75, 1, 8, 17],
                backgroundColor: [
                  'rgb(27, 139, 255, 1)',
                  'hsl(120,70%,60%)',
                  'hsl(0,0%,60%)',
                  'hsl(0,70%,60%)'
                ]
            }]
        },
        options: doughChartOptions
    });
}

function drawChartVaccWillNotYet() {
    new Chart(document.getElementById("chartVaccWillNotYet").getContext("2d"), {
        type: 'doughnut',
        data: {
            labels: ['Ja', 'Teils', 'Nein'],
            datasets: [{
                label: "Vollimmun",
                data: [1, 8, 17],
                backgroundColor: [
                  'hsl(120,70%,60%)',
                  'hsl(0,0%,60%)',
                  'hsl(0,70%,60%)'
                ]
            }]
        },
        options: doughChartOptions
    });
}

function drawChartCompulVacc() {
    new Chart(document.getElementById("chartCompulVacc").getContext("2d"), {
        type: 'doughnut',
        data: {
            labels: ['Ja', 'Eher ja', 'Teils', 'Eher nein', 'Nein'],
            datasets: [{
                label: "Es sollte eine Impfpflicht geben",
                data: [20, 15, 17, 11, 34],
                backgroundColor: [
                  'hsl(120,70%,60%)',
                  'hsl(100,70%,60%)',
                  'hsl(0,0%,60%)',
                  'hsl(20,70%,60%)',
                  'hsl(0,70%,60%)'
                ]
            }]
        },
        options: doughChartOptions
    });
}

function drawChartVaccChild() {
    new Chart(document.getElementById("chartVaccChild").getContext("2d"), {
        type: 'doughnut',
        data: {
            labels: ['Ja', 'Eher ja', 'Teils', 'Eher nein', 'Nein'],
            datasets: [{
                label: "Vollimmun",
                data: [20, 10, 13, 8, 42],
                backgroundColor: [
                  'hsl(120,70%,60%)',
                  'hsl(100,70%,60%)',
                  'hsl(0,0%,60%)',
                  'hsl(20,70%,60%)',
                  'hsl(0,70%,60%)'
                ]
            }]
        },
        options: doughChartOptions
    });
}

function toggleChangelog(elem) {            
    elem.classList.toggle("toggle");
}