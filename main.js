/* Wetterstationen Euregio Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true
}).setView([ibk.lat, ibk.lng], 11);

// thematische Layer
let themaLayer = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "Relief avalanche.report": L.tileLayer(
        "https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
        attribution: `© <a href="https://lawinen.report">CC BY avalanche.report</a>`
    }).addTo(map),
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery")
}, {
    "Wetterstationen": themaLayer.stations.addTo(map),
    "Temperatur": themaLayer.temperature.addTo(map),
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

function writeStationLayer(jsondata) {
// Wetterstationen bearbeiten
L.geoJSON(jsondata, {
    pointToLayer: function(feature, latlng) {
        return L.marker(latlng, {
            icon: L.icon({
                iconUrl: `icons/wifi.png`,
                iconAnchor: [16, 37],
                popupAnchor: [0, -37],
            })
        });
    },

        onEachFeature: function (feature, layer) {
            let prop = feature.properties; //Variable damit kürzer; * steht als Platzhalter für Bildunterschrift, Link für Infos, nur 1 Tab für Links
            let höhenmeter = feature.geometry.coordinates;
            let pointInTime = new Date(prop.date);
            console.log(pointInTime);
            layer.bindPopup(`      
            <h4>${prop.name} ${höhenmeter[2]} m ü NN</h4>
            <ul>
            <li>Lufttemperatur (°C): ${prop.LT||"keine Angabe"}</li>
            <li>Relative Luftfeuchte (%): ${prop.RH||"keine Angabe"}</li>
            <li>Windgeschwindigkeit (km/h): ${prop.WG ? (prop.WG*3.6).toFixed(1) : "keine Angabe"}</li>
            <li>Schneehöhe (cm): ${prop.HS||"keine Angabe"}</li>
            </ul>
            <span>${pointInTime.toLocaleString()}</span> 
            `);
        }
    }).addTo(themaLayer.stations); //alle Wetterstationen anzeigen als Marker
    }

function writeTemperatureLayer(jsondata){
    L.geoJSON(jsondata,{
        filter: function(feature){
            if (feature.properties.LT > -50 && feature.properties.LT < 50) {
                return true;
            }
        },
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span>${feature.properties.LT}</span>`
                })
            });
        },
    }).addTo(themaLayer.temperature);
}

    async function loadStations (url) {
        let response = await fetch(url); //Anfrage, Antwort kommt zurück
        let jsondata = await response.json(); //json Daten aus Response entnehmen
        writeStationLayer(jsondata);
        writeTemperatureLayer(jsondata);
    }
loadStations("https://static.avalanche.report/weather_stations/stations.geojson");