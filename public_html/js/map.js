
const SEVENDAYINCIDENCE_COL = 5;
const POPULATION_COL = 2;
const OPACITY_DESELECTED = .5;

function inciThreshold(value) {
    if (value == 0) {
        return 'lightgrey';
    } else if (value < 20) {
        return 'lightgreen';
    } else if (value < 50) {
        return 'green';
    } else if (value < 100) {
        return 'yellow';
    } else if (value < 200) {
        return 'orange';
    } else if (value < 400) {
        return 'red';
    } else if (value < 1000) {
        return 'darkred';
    } else {
        return 'black';
    }
}

function style(feature, districtArray) {
    const district = districtArray.get(feature.properties.iso);
    let color = '#000';
    if (district === undefined) {
        console.log(feature.properties.iso);
    } else {
        color = inciThreshold(Math.round(district[SEVENDAYINCIDENCE_COL] / district[POPULATION_COL] * 100000));
    }
    return {
        fillColor: color,
        fillOpacity: OPACITY_DESELECTED,
        weight: 1,
        opacity: 1,
        color: 'white'
    };
}

function mapInit() {
    var mymap = L.map('mapid', {
        zoomControl: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false,
        dragging: false,
        zoomSnap: .1
    }).fitBounds([[49.09, 12], [46.19, 15]]);
    //[[49.09, 8.64], [46.19, 17.82]]

    const districtMap = new Map();
    let districtArray;
    let layer = null;

    var wienUnion = turf.union(...districts.features.filter(it=> it.properties.iso.startsWith('9')));
    districts.features = districts.features.filter(it=>!it.properties.iso.startsWith('9'));
    wienUnion.properties.iso = '900';
    districts.features.push(wienUnion);

    fetch("data/CovidFaelle_GKZ.csv?_=" + new Date().getTime())
        .then(response => response.text())
        .then(text => text.split("\n")
            .map(element => element.split(";"))
            )
        .then(function(arr) {
          
            for (let i = 1; i < arr.length; i++) {
                const gkzNr = arr[i][1];
                if (!districtMap.has(gkzNr)) {
                    districtMap.set(gkzNr, arr[i]);
                }                
            }

            districtArray = Array.from(districtMap.values());

            layer = L.geoJson(districts).addTo(mymap);

            layer.eachLayer(function(layer){
                layer.setStyle(style(layer.feature, districtMap));
            });
        });
}