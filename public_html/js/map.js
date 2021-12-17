const OPACITY_DESELECTED = .5;

const NAME_COL = 0;
const GKZ_COL = 1;
const INHABITANTS_COL = 2;
const INFECTIONS_COL = 3;
const CASUALTIES_COL = 4;
const SEVENDAYINCIDENCE_COL = 5;

function realIncidence(incidence, inhabitants) {
    return Math.round(incidence / inhabitants * 100000);
}

function style(feature, districtArray) {
    const district = districtArray.get(feature.properties.iso);
    let color = '#000';
    if (district === undefined) {
        console.log(feature.properties.iso);
    } else {
        color = inciThreshold(realIncidence(district[SEVENDAYINCIDENCE_COL], district[INHABITANTS_COL]));
    }
    return {
        fillColor: color,
        fillOpacity: OPACITY_DESELECTED,
        weight: 1,
        opacity: 1,
        color: 'white'
    };
}

function mapInit(mapData) {
    var mymap = L.map('mapid', {
        zoomControl: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false,
        dragging: false,
        zoomSnap: .1,
        minZoom: 5,
        maxZoom: 9
    }).fitBounds([[49.09, 12], [46.19, 15]]);
    //[[49.09, 8.64], [46.19, 17.82]]

    const districtMap = new Map();
    let districtArray;
    let layer = null;

    var wienUnion = turf.union(...districts.features.filter(it=> it.properties.iso.startsWith('9')));
    districts.features = districts.features.filter(it=>!it.properties.iso.startsWith('9'));
    wienUnion.properties.iso = '900';
    districts.features.push(wienUnion);
          
    for (let i = 1; i < mapData.length; i++) {
        const gkzNr = mapData[i][1];
        if (!districtMap.has(gkzNr)) {
            districtMap.set(gkzNr, mapData[i]);
        }                
    }
    
    const inciDistri = new Array(10).fill(0)
    mapData.slice(1, mapData.length -1).forEach(item => {
        const value = realIncidence(item[SEVENDAYINCIDENCE_COL], item[INHABITANTS_COL])
        if (value === 0) {
            inciDistri[0]++
        } else if (value < 20) {
            inciDistri[1]++
        } else if (value < 40) {
            inciDistri[2]++
        } else if (value < 100) {
            inciDistri[3]++
        } else if (value < 200) {
            inciDistri[4]++
        } else if (value < 400) {
            inciDistri[5]++
        } else if (value < 1000) {
            inciDistri[6]++
        } else if (value < 2000) {
            inciDistri[7]++
        } else if (value < 4000) {
            inciDistri[8]++
        } else {
            inciDistri[9]++
        }
    })
    
    console.log(inciDistri)
    

    districtArray = Array.from(districtMap.values());

    layer = L.geoJson(districts,{onEachFeature: onEachFeature}).addTo(mymap);

    layer.eachLayer(function(layer){
        layer.setStyle(style(layer.feature, districtMap));
    });
        
    function onClick(e) {
        var layer = e.target;            

        const district = districtMap.get(layer.feature.properties.iso);
        const modal = document.getElementById("mapModal");
        const modalContent = document.getElementById("modalContent");
        modal.style.display = "block";
        modalContent.innerHTML = `<b>${district[NAME_COL]}</b><br/>Einwohner: ${district[INHABITANTS_COL].toInt()}<br/>Fälle: ${district[INFECTIONS_COL]}<br/>7-Tage-Inzidenz: ${realIncidence(district[SEVENDAYINCIDENCE_COL].toInt(), district[INHABITANTS_COL].toInt())}<br/>Verstorben: ${district[CASUALTIES_COL]}`;
        console.log(realIncidence(district[SEVENDAYINCIDENCE_COL].toInt(), district[INHABITANTS_COL].toInt()));
    }

    function onEachFeature(feature, layer) {
        layer.on({
    //        mouseover: onMouseOver,
    //        mouseout: onMouseOut,
            click: onClick
        });
    }
}

function closeModal() {
    const modal = document.getElementById("mapModal");
    modal.style.display = "none";
}