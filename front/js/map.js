const mapStyles = {
    light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

const mapInitialDark = document.documentElement.dataset.theme === "dark";

const map = new maplibregl.Map({
    container: "map",
    style: mapInitialDark ? mapStyles.dark : mapStyles.light,
    center: [0, 0],
    zoom: 2,
});

map.addControl(new maplibregl.NavigationControl(), "top-right");

let marker = new maplibregl.Marker().setLngLat([0, 0]).addTo(map);

let path = [];

let currentSatellitePosition = {
    lat: 0,
    lon: 0,
};

function updateSatellitePosition(lat, lon) {
    currentSatellitePosition.lat = lat;
    currentSatellitePosition.lon = lon;
}

document.getElementById("center-btn").addEventListener("click", () => {
    if (!currentSatellitePosition.lat) return;

    map.easeTo({
        center: [currentSatellitePosition.lon, currentSatellitePosition.lat],
        duration: 800,
        zoom: map.getZoom(),
    });
});

const sourceId = "orbit-path";

function orbitLineColor() {
    return document.documentElement.dataset.theme === "dark" ? "#7eb8aa" : "#5d8a7a";
}

function addOrbitLayer() {
    if (map.getSource(sourceId)) return;

    map.addSource(sourceId, {
        type: "geojson",
        data: {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [],
            },
        },
    });

    map.addLayer({
        id: "orbit-line",
        type: "line",
        source: sourceId,
        paint: {
            "line-color": orbitLineColor(),
            "line-width": 2,
        },
    });
}

function restoreOrbitData() {
    const src = map.getSource(sourceId);
    if (!src) return;
    src.setData({
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: path,
        },
    });
}

function onMapStyleReady() {
    addOrbitLayer();
    const layerId = "orbit-line";
    if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, "line-color", orbitLineColor());
    }
    restoreOrbitData();
}

map.on("load", onMapStyleReady);
map.on("style.load", onMapStyleReady);

window.setTelemetryMapTheme = function setTelemetryMapTheme(isDark) {
    map.setStyle(isDark ? mapStyles.dark : mapStyles.light);
};

function updateMap(lat, lon) {
    const point = [lon, lat];
    marker.setLngLat(point);

    updateSatellitePosition(lat, lon);

    path.push(point);
    if (path.length > 100) path.shift();

    const src = map.getSource(sourceId);
    if (!src) return;
    src.setData({
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: path,
        },
    });
}
