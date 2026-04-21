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
const layerId = "orbit-line";

function orbitLineColor() {
    return document.documentElement.dataset.theme === "dark" ? "#7eb8aa" : "#5d8a7a";
}

/** Добавляет источник и слой трека; при смене стиля MapLibre удаляет пользовательские слои — вызывается снова на style.load */
function ensureOrbitLayer() {
    if (!map.getSource(sourceId)) {
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
    }

    if (!map.getLayer(layerId)) {
        map.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-color": orbitLineColor(),
                "line-width": 3,
                "line-opacity": 0.95,
            },
        });
        try {
            map.moveLayer(layerId);
        } catch (_) {
            /* ignore if style ещё не готов */
        }
    } else {
        map.setPaintProperty(layerId, "line-color", orbitLineColor());
    }
}

function restoreOrbitData() {
    const src = map.getSource(sourceId);
    if (!src || typeof src.setData !== "function") return;
    src.setData({
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: path,
        },
    });
}

function onMapStyleReady() {
    ensureOrbitLayer();
    restoreOrbitData();
}

// Только style.load: после загрузки векторного стиля Carto пользовательские слои должны попасть поверх подложки.
// Событие load может приходить в другом порядке и давать «пустой» трек до первой перерисовки стиля.
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
    if (!src || typeof src.setData !== "function") return;
    src.setData({
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: path,
        },
    });
}
