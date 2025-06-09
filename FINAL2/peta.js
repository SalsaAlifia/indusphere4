

// Inisialisasi peta
const map = L.map('map').setView([-6.9194, 106.9272], 13);


// Basemap
const basemapOSM = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

const baseMapGoogle = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
  maxZoom: 20, subdomains: ['mt0','mt1','mt2','mt3'],
  attribution: 'Map by Google'
});

const baseMapSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20, subdomains: ['mt0','mt1','mt2','mt3'],
  attribution: 'Satellite by Google'
});

// Tombol Home
const home = { lat: -6.9194, lng: 106.9272, zoom: 13 };
const homeControl = L.control({ position: 'topleft' });
homeControl.onAdd = function(map) {
  const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
  div.innerHTML = '🏠';
  div.style = 'background:white;width:30px;height:30px;text-align:center;line-height:30px;cursor:pointer;';
  div.title = 'Kembali ke Home';
  div.onclick = () => map.setView([home.lat, home.lng], home.zoom);
  return div;
};
homeControl.addTo(map);

// Lokasi Pengguna
L.control.locate({
  position: 'topleft',
  flyTo: true,
  strings: { title: "Temukan lokasiku" },
  locateOptions: { enableHighAccuracy: true }
}).addTo(map);

// slide
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".hero-btn");
  const sections = document.querySelectorAll("section");

  function showSection(id) {
    sections.forEach((section) => {
      section.classList.remove("active");
    });
    const target = document.querySelector(id);
    if (target) {
      target.classList.add("active");
    }
  }

  // Default tampilkan hero-section saat awal
  showSection("#hero-section");

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      showSection(targetId);
    });
  });
});




// ======================== LAYERS =======================

/// Style simbol titik
const industriIcon = L.icon({
  iconUrl: "./asset/industri.jpg", // Pastikan path dan nama file benar
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// LayerGroup untuk pabrik
const pabrikPT = new L.LayerGroup();

// Ambil dan tampilkan data pabrik
fetch("./asset/pabrik4.json")
  .then(res => res.json())
  .then(data => {
    const geojson = {
      type: "FeatureCollection",
      features: data.features.map(f => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [f.geometry.x, f.geometry.y]
        },
        properties: f.attributes
      }))
    };

    L.geoJSON(geojson, {
      pointToLayer: (feature, latlng) => L.marker(latlng, { icon: industriIcon }),
onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindPopup(`
          <b>Nama Pabrik:</b> ${p.NAMA || '-'}<br>
          <b>Klasifikasi:</b> ${p.Klasifikasi || '-'}<br>
          <b>Jenis:</b> ${p.Jenis || '-'}<br>
          <b>Alamat:</b> ${p.ALAMAT || '-'}<br>
          <b>Kecamatan:</b> ${p.KECAMATAN || '-'}<br>
          <b>Catatan Pencemaran:</b> ${p.Catatan_Pencemaran || '-'}
        `);
      }
    }).addTo(pabrikPT);

    pabrikPT.addTo(map);
  });


// =======================
// 1. Batas Administrasi
// =======================
const adminKecamatanAR = new L.LayerGroup();

$.getJSON("./asset/Data_Spasial/ADMSMI.json", function (data) {
  const geojsonConverted = {
    type: "FeatureCollection",
    features: data.features.map(f => ({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: f.geometry.rings
      },
      properties: f.attributes
    }))
  };

  const adminLayer = L.geoJSON(geojsonConverted, {
    style: {
      color: "red",
      weight: 2,
      opacity: 1,
      dashArray: '3,3,20,3',
      lineJoin: 'round'
    },
    onEachFeature: function (feature, layer) {
      const nama = feature.properties?.WADMKC || "Tidak diketahui";
      layer.bindPopup(`<b>Wilayah:</b> ${nama}`);
      
    }
  }).addTo(adminKecamatanAR);

  adminKecamatanAR.addTo(map);
});

// =======================
// 2. Sungai
// =======================
const sungaiLN = new L.LayerGroup();
const symbologySungai = {
  color: "#0077ff", weight: 2, opacity: 0.9
};

$.getJSON("./asset/Data_Spasial/LN_Sungai.json", function (data) {
  const geojsonConverted = {
    type: "FeatureCollection",
    features: data.features.map(f => ({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: f.geometry.paths[0].map(c => [c[0], c[1]])
      },
      properties: f.attributes
    }))
  };
  L.geoJSON(geojsonConverted, { style: symbologySungai }).addTo(sungaiLN);
  sungaiLN.addTo(map);
});

// =======================
// 3. Jalan
// =======================
const jalanLN = new L.LayerGroup();
const symbologyJalan = {
  color: "#808080", weight: 2, opacity: 0.8
};

$.getJSON("./asset/Data_Spasial/LN_Jalan.json", function (data) {
  const geojson = {
    type: "FeatureCollection",
    features: data.features.map(f => ({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: f.geometry.paths[0].map(c => [c[0], c[1]])
      },
      properties: f.attributes
    }))
  };
  L.geoJSON(geojson, { style: symbologyJalan }).addTo(jalanLN);
  jalanLN.addTo(map);
});

// =======================
// 4. Pemukiman
// =======================
const pemukimanAR = new L.LayerGroup();

$.getJSON("./asset/Data_Spasial/pemukiman.json", function (data) {
  const geojsonConverted = {
    type: "FeatureCollection",
    features: data.features.map(f => ({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: f.geometry.rings
      },
      properties: f.attributes
    }))
  };

  L.geoJSON(geojsonConverted, {
    style: {
      color: "yellow",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.4,
      dashArray: '3,3,20,3',
      lineJoin: 'round'
    },
    onEachFeature: function (feature, layer) {
      const nama = feature.properties?.NAMOBJ || "Tanpa Nama";
      layer.bindPopup(`<b>Pemukiman:</b> ${nama}`);
    }
  }).addTo(pemukimanAR);

  pemukimanAR.addTo(map);
});
// buffer
// =======================
// 6. Buffer
// =======================
const bufferLayer = new L.LayerGroup().addTo(map);

// Fungsi warna berdasarkan jarak buffer
function getBufferColor(distance) {
  return distance > 10000 ? "#3ed34a" :
         distance > 5500  ? "#3ead3e" :
         distance > 3500  ? "#fffb1f" :
         distance > 1500  ? "#f5a021f2" :
                            "#cc2d2df2"; // fallback untuk jarak kecil
}

// Ambil data buffer dan konversi ke GeoJSON
fetch("./asset/Data_Spasial/buffer.json")
  .then(res => {
    if (!res.ok) throw new Error("Gagal fetch buffer.json");
    return res.json();
  })
  .then(data => {
    const geojson = {
      type: "FeatureCollection",
      features: data.features.map(f => {
        const coords = f.geometry.rings;
        const geometry = coords.length > 1
          ? { type: "MultiPolygon", coordinates: [coords] }
          : { type: "Polygon", coordinates: coords };

        return {
          type: "Feature",
          geometry: geometry,
          properties: f.attributes
        };
      })
    };

    const bufferGeoJSON = L.geoJSON(geojson, {
      style: feature => ({
        color: getBufferColor(feature.properties.distance),
        weight: 2,
        fillOpacity: 0.5
      }),
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindPopup(`
          <b>OBJECTID:</b> ${p.OBJECTID || "-"}<br>
          <b>Jarak Buffer:</b> ${p.distance || "-"} meter
        `);
      }
    }).addTo(bufferLayer);

    map.fitBounds(bufferGeoJSON.getBounds());
  })
  .catch(err => console.error("Gagal memuat buffer:", err));


// =======================
// 7. Peta Choropleth Penduduk
// =======================
const layerPenduduk = new L.LayerGroup();
let geojsonPenduduk; // Simpan agar bisa di-reset stylenya saat interaksi

// Fungsi warna berdasarkan jumlah penduduk
function getColor(d) {
  return d > 100000 ? '#800026' :
         d > 75000  ? '#BD0026' :
         d > 50000  ? '#E31A1C' :
         d > 30000  ? '#FC4E2A' :
         d > 20000  ? '#FD8D3C' :
         d > 10000  ? '#FEB24C' :
         d > 0      ? '#FED976' :
                      '#FFEDA0';
}

// Style tiap fitur
function stylePenduduk(feature) {
  return {
    fillColor: getColor(feature.properties["penduduk.csv.jumlah penduduk"]),
    weight: 1,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

// Interaksi hover highlight
function highlightFeature(e) {
  const layer = e.target;
  layer.setStyle({
    weight: 3,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });
  layer.bringToFront();
}

function resetHighlight(e) {
  geojsonPenduduk.resetStyle(e.target);
}

function onEachFeaturePenduduk(feature, layer) {
  const props = feature.properties;
  layer.bindPopup(
    `<b>Kecamatan:</b> ${props["penduduk.csv.WADMKC"]}<br>` +
    `<b>Jumlah Penduduk:</b> ${props["penduduk.csv.jumlah penduduk"]}`
  );
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight
  });
}

// Ambil dan tampilkan data penduduk
fetch("./asset/Data_Spasial/penduduk.json")
  .then(res => res.json())
  .then(data => {
    const geojson = {
      type: "FeatureCollection",
      features: data.features.map(f => ({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: f.geometry.rings
        },
        properties: f.attributes
      }))
    };

    geojsonPenduduk = L.geoJSON(geojson, {
      style: stylePenduduk,
      onEachFeature: onEachFeaturePenduduk
    });

    geojsonPenduduk.addTo(layerPenduduk);
    layerPenduduk.addTo(map);
  });

// ========================
// Legend dan Control Panel
// ========================
const legend = L.control({ position: "bottomright" });
legend.onAdd = function () {
  const div = L.DomUtil.create("div", "info legend");
  div.innerHTML += '<h4>Legenda</h4>';
  div.innerHTML += '<i style="background:#9dfc03; width:10px; height:10px; display:inline-block; margin-right:5px;"></i>Pabrik<br>';
  div.innerHTML += '<i style="background:#0077ff; width:10px; height:2px; display:inline-block; margin-right:5px;"></i>Sungai<br>';
  div.innerHTML += '<i style="background:#808080; width:10px; height:2px; display:inline-block; margin-right:5px;"></i>Jalan<br>';
  div.innerHTML += '<i style="background:yellow; width:10px; height:10px; display:inline-block; margin-right:5px; border:1px solid black;"></i>Pemukiman<br>';
  
  div.innerHTML += '<hr><b>Zona Buffer</b><br>';
  div.innerHTML += '<i style="background:#cc2d2df2; width:10px; height:10px; display:inline-block; margin-right:5px;"></i> 0–1500 m<br>';
  div.innerHTML += '<i style="background:#f5a021f2; width:10px; height:10px; display:inline-block; margin-right:5px;"></i> 1501–3500 m<br>';
  div.innerHTML += '<i style="background:#fffb1f; width:10px; height:10px; display:inline-block; margin-right:5px;"></i> 3501–5500 m<br>';
  div.innerHTML += '<i style="background:#3ead3e; width:10px; height:10px; display:inline-block; margin-right:5px;"></i> > 5500 m';

  return div;
};
legend.addTo(map);

const overlayMaps = {
  "Pabrik": pabrikPT,
  "Sungai": sungaiLN,
  "Jalan": jalanLN,
  "Pemukiman": pemukimanAR,
  "Zona Buffer": bufferLayer,
  "Kepadatan Penduduk": layerPenduduk
};

const baseMaps = {
  "OpenStreetMap": basemapOSM,
  "Google Maps": baseMapGoogle,
  "Google Satellite": baseMapSatellite
};

L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

