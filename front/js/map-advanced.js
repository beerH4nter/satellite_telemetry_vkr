(function initAdvancedMap() {
    const el = document.getElementById("map-advanced");
    if (!el) return;

    const mapStyles = {
        light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
        dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    };

    const mapAdv = new maplibregl.Map({
        container: "map-advanced",
        style: document.documentElement.dataset.theme === "dark" ? mapStyles.dark : mapStyles.light,
        center: [0, 0],
        zoom: 2,
    });
    mapAdv.addControl(new maplibregl.NavigationControl(), "top-right");

    let marker = new maplibregl.Marker().setLngLat([0, 0]).addTo(mapAdv);
    let path = [];
    let pos = { lat: 0, lon: 0 };
    const sourceId = "orbit-path-adv";
    const layerId = "orbit-line-adv";

    function orbitLineColor() {
        return document.documentElement.dataset.theme === "dark" ? "#7eb8aa" : "#5d8a7a";
    }

    function ensureLayer() {
        if (!mapAdv.getSource(sourceId)) {
            mapAdv.addSource(sourceId, {
                type: "geojson",
                data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } },
            });
        }
        if (!mapAdv.getLayer(layerId)) {
            mapAdv.addLayer({
                id: layerId,
                type: "line",
                source: sourceId,
                paint: { "line-color": orbitLineColor(), "line-width": 3 },
            });
        }
    }

    mapAdv.on("style.load", () => {
        ensureLayer();
        const src = mapAdv.getSource(sourceId);
        if (src) src.setData({ type: "Feature", geometry: { type: "LineString", coordinates: path } });
    });

    document.getElementById("center-btn-advanced")?.addEventListener("click", () => {
        mapAdv.easeTo({ center: [pos.lon, pos.lat], duration: 800 });
    });

    window.updateMapAdvanced = function (lat, lon) {
        const point = [lon, lat];
        marker.setLngLat(point);
        pos = { lat, lon };
        path.push(point);
        if (path.length > 100) path.shift();
        ensureLayer();
        const src = mapAdv.getSource(sourceId);
        if (src) src.setData({ type: "Feature", geometry: { type: "LineString", coordinates: path } });
    };

    window.setAdvancedMapTheme = function (isDark) {
        mapAdv.setStyle(isDark ? mapStyles.dark : mapStyles.light);
    };

    window.clearAdvancedMap = function () {
        path = [];
        ensureLayer();
        const src = mapAdv.getSource(sourceId);
        if (src) src.setData({ type: "Feature", geometry: { type: "LineString", coordinates: [] } });
    };
})();
