const HEARD_IMMUN = 0.7;

let cdata = null;
let noDataStr = "no data";

function main() {    
    fetch("owid-covid-latest.json?_=" + new Date().getTime())
            .then(response => response.json())
            .then(function(data) {
                cdata = data;
                cCode = getCookie('cCode');
                draw(cCode !== null ? data[cCode] : data['OWID_WRL']);
                drawModal(data);
            });
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
//    });    
};

function draw(data) {
    let population = data['population'];
    
    let vaccRate = data['new_vaccinations'] !== null ? data['new_vaccinations'] : data['new_vaccinations_smoothed'];
    let sumVaccImmune = data['people_fully_vaccinated'];

    let vaccLeft = population * HEARD_IMMUN - sumVaccImmune; 
    let vaccinations = (population * HEARD_IMMUN) * 2 - data['total_vaccinations'];
    let isImmunePercent = (sumVaccImmune / population) * 100;

    let daysSum = Math.round(vaccinations / vaccRate);
    let endDate = new Date().setDate(new Date().getDate() + daysSum); // Enddatum
    
    document.getElementById("subtext-country").innerHTML = data['location'];

    function drawMainBar() {
        document.getElementById("progressBar").style.backgroundColor = getColor(isImmunePercent * .01, 50);
        document.getElementById("progressBar").style.width = `${isImmunePercent}%`;
        document.getElementById("progressBar").innerHTML = `${isImmunePercent?.toFixed(2)}%`;
        document.getElementById("update-date").innerHTML = new Date(data['last_updated_date'])?.toLocaleDateString("de-AT");
    }
    
    function drawBubbles() {
        document.getElementById("date").innerHTML = new Date(endDate).toLocaleDateString("de-AT");
        document.getElementById("days").innerHTML = `Noch ${daysSum} Tage`;
        document.getElementById("humanizedDate").innerHTML = humanise(daysSum);
        document.getElementById("vaccPerson").innerHTML = vaccLeft?.asRoundStr() ?? noDataStr;
        document.getElementById("vaccDoses").innerHTML = vaccinations?.asRoundStr();
        document.getElementById("vaccRate").innerHTML = data['new_vaccinations_smoothed']?.asRoundStr() ?? noDataStr;
        document.getElementById("population").innerHTML = population?.asRoundStr() ?? noDataStr;
//                document.getElementById("impfbar").innerHTML = (population).asRoundStr();
        document.getElementById("vaccSum").innerHTML = data['total_vaccinations']?.toLocaleString("de-AT") ?? noDataStr;
        document.getElementById("vaccSumDelta").innerHTML = (data['new_vaccinations'] !== null ? data['new_vaccinations'] : data['new_vaccinations_smoothed'])?.toSignedString() ?? noDataStr;
        document.getElementById("vaccFirst").innerHTML = data['people_vaccinated']?.toLocaleString("de-AT") ?? noDataStr;
        document.getElementById("vaccFirstDelta").innerHTML = '';
        document.getElementById("vaccSecond").innerHTML = data['people_fully_vaccinated']?.toLocaleString("de-AT") ?? noDataStr;
        document.getElementById("vaccSecondDelta").innerHTML = '';
//        document.getElementById("recovered").innerHTML = recovered.asRoundStr();
//        document.getElementById("recoveredDelta").innerHTML = '';
        document.getElementById("infected").innerHTML = data['total_cases']?.toLocaleString("de-AT") ?? noDataStr;
        document.getElementById("infectedDelta").innerHTML = data['new_cases']?.toSignedString() ?? noDataStr;
        document.getElementById("casualties").innerHTML = data['total_deaths']?.toLocaleString("de-AT") ?? noDataStr;
        document.getElementById("casualtiesDelta").innerHTML = (data['new_deaths'] !== null ? data['new_deaths'] : data['new_deaths_smoothed'])?.toSignedString() ?? noDataStr;
        document.getElementById("hospital").innerHTML = data['hosp_patients']?.toLocaleString("de-AT") ?? noDataStr;
        document.getElementById("hospitalDelta").innerHTML = '';
        document.getElementById("intensiveCare").innerHTML = data['icu_patients']?.toLocaleString("de-AT") ?? noDataStr;
        document.getElementById("intensiveCareDelta").innerHTML = '';
        document.getElementById("tests").innerHTML = data['total_tests']?.toLocaleString("de-AT") ?? noDataStr;
        document.getElementById("testsDelta").innerHTML = (data['new_tests'] !== null ? data['new_tests'] : data['new_tests_smoothed'])?.toSignedString() ?? noDataStr;
        document.getElementById("reproductionRate").innerHTML = data['reproduction_rate']?.toLocaleString("de-AT") ?? noDataStr;
//        document.getElementById("infectedCurrent").innerHTML = infectedCurrent.toLocaleString("de-AT");
//        document.getElementById("infectedCurrentDelta").innerHTML = '';
//        document.getElementById("incidence").innerHTML = Math.round(incidence).toLocaleString("de-AT");
//        document.getElementById("incidenceDelta").innerHTML = Math.round(incidenceDelta).toSignedString();
    }
    
    drawMainBar();
    drawBubbles();
    drawSum(data);
}

function drawSum(data) {
    const ges_first_percent = (data['people_vaccinated'] / data['population']) * 100;
    document.getElementById("ges_first").style.width = `${ges_first_percent}%`;
    document.getElementById("ges_first").innerHTML = `${ges_first_percent.toFixed(2)}%`;
    const ges_second_percent = (data['people_fully_vaccinated'] / data['population']) * 100;
    document.getElementById("ges_second").style.width = `${ges_second_percent}%`;
    document.getElementById("ges_second").innerHTML = `${ges_second_percent.toFixed(2)}%`;
}

function toggleChangelog(elem) {            
    elem.classList.toggle("toggle");
}

function drawModal(data) {
    document.getElementById('modalContent').innerHTML = Object.entries(data).map((country) => `<li id="${country[0]}" onclick="selectCountry('${country[0]}')">${country[1].location}</li>`).join('');
}

function openModal() {
    document.getElementById('countryModal').style.display='block';
}

function selectCountry(countryCode) {
    setCookie('cCode', countryCode);
    draw(cdata[countryCode]);
    document.getElementById('countryModal').style.display='none';
}