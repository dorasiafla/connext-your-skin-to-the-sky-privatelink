let currentCountryName = "";
let pm25 = 12;
const fixedRadius = 240;
let satelliteThickness = 4;
let countrySelect;
let countryData = {};
let isStarted = false;
let stars = [];
let eclipseY;
let eclipseRadius;
let currentBG;
let menuAlpha = 255;
let userZoom = 1.0;
let zoomSliderEl = null;
let zoomLabelEl = null;
let zoomPanelEl = null;

const REAL_SATELLITES = [
  { name: "ISS (ZARYA)", period: 5568000, inclination: 51.6, phase: 0.0 },
  { name: "HUBBLE SPACE TELESCOPE", period: 5742000, inclination: 28.5, phase: 1.2 },
  { name: "NOAA-19 (WEATHER)", period: 6120000, inclination: 99.2, phase: 2.5 },
  { name: "TIANGONG (SPACE STATION)", period: 5562000, inclination: 41.5, phase: 3.1 },
  { name: "AQUA (EOS-PM1)", period: 5934000, inclination: 98.2, phase: 0.5 },
  { name: "TERRA (EOS-AM1)", period: 5934000, inclination: 98.2, phase: 4.2 },
  { name: "METOP-B (METEOROLOGY)", period: 6072000, inclination: 98.7, phase: 1.8 },
  { name: "LANDSAT 8", period: 5934000, inclination: 98.2, phase: 5.0 },
  { name: "STARLINK-3014", period: 5480000, inclination: 53.2, phase: 0.8 },
  { name: "STARLINK-1008", period: 5480000, inclination: 53.2, phase: 2.1 },
  { name: "STARLINK-2415", period: 5480000, inclination: 53.2, phase: 3.9 },
  { name: "COSMOS 2550", period: 5620000, inclination: 67.1, phase: 1.1 },
  { name: "FENGYUN 3D", period: 6120000, inclination: 98.7, phase: 4.7 },
  { name: "ALOS-2 (DAICHI-2)", period: 5930000, inclination: 98.1, phase: 2.9 },
  { name: "SENTINEL-1A", period: 5930000, inclination: 98.1, phase: 0.2 },
  { name: "SENTINEL-2A", period: 6000000, inclination: 98.5, phase: 1.5 },
  { name: "SENTINEL-2B", period: 6000000, inclination: 98.5, phase: 3.6 },
  { name: "SENTINEL-3A", period: 6060000, inclination: 98.6, phase: 5.1 },
  { name: "SENTINEL-5P", period: 6060000, inclination: 98.7, phase: 2.3 },
  { name: "GPM-CORE", period: 5590000, inclination: 65.0, phase: 1.7 },
  { name: "CRYOSAT 2", period: 6000000, inclination: 92.0, phase: 5.3 },
  { name: "CHUANXIN-16", period: 5800000, inclination: 50.0, phase: 2.4 },
  { name: "STARLINK-1042", period: 5480000, inclination: 53.2, phase: 4.5 },
  { name: "STARLINK-1544", period: 5480000, inclination: 53.2, phase: 1.1 },
  { name: "STARLINK-1921", period: 5480000, inclination: 53.2, phase: 5.8 },
  { name: "STARLINK-2105", period: 5480000, inclination: 53.2, phase: 2.7 },
  { name: "STARLINK-3112", period: 5480000, inclination: 53.2, phase: 0.3 },
  { name: "STARLINK-4022", period: 5480000, inclination: 53.2, phase: 3.3 },
  { name: "ONEWEB-0142", period: 6540000, inclination: 87.9, phase: 0.9 },
  { name: "ONEWEB-0255", period: 6540000, inclination: 87.9, phase: 2.6 },
  { name: "ONEWEB-0312", period: 6540000, inclination: 87.9, phase: 4.1 },
  { name: "ONEWEB-0419", period: 6540000, inclination: 87.9, phase: 5.5 },
  { name: "NOAA-15", period: 5940000, inclination: 98.5, phase: 3.2 },
  { name: "NOAA-18", period: 6060000, inclination: 98.7, phase: 0.7 },
  { name: "METOP-A", period: 6080000, inclination: 98.7, phase: 4.8 },
  { name: "METOP-C", period: 6070000, inclination: 98.7, phase: 2.1 },
  { name: "LANDSAT 7", period: 5930000, inclination: 98.2, phase: 1.4 },
  { name: "LANDSAT 9", period: 5930000, inclination: 98.2, phase: 3.8 },
  { name: "SUOMI NPP", period: 6080000, inclination: 98.7, phase: 5.9 },
  { name: "TERRAZAR", period: 5670000, inclination: 97.4, phase: 0.4 },
  { name: "COSMO-SKYMED 1", period: 5830000, inclination: 97.9, phase: 1.9 },
  { name: "COSMO-SKYMED 2", period: 5830000, inclination: 97.9, phase: 3.5 },
  { name: "COSMO-SKYMED 3", period: 5830000, inclination: 97.9, phase: 4.9 },
  { name: "RADARSAT-2", period: 5880000, inclination: 98.1, phase: 2.2 },
  { name: "ICESAT 2", period: 5690000, inclination: 92.0, phase: 0.6 },
  { name: "SWARM A", period: 5610000, inclination: 87.4, phase: 3.7 },
  { name: "SWARM B", period: 5610000, inclination: 87.4, phase: 5.2 },
  { name: "SWARM C", period: 5610000, inclination: 87.4, phase: 1.3 }
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  currentBG = color(8, 12, 18);
  eclipseRadius = max(width, height) * 0.9;
  eclipseY = height + eclipseRadius * 0.72;
  for (let i = 0; i < 70; i++) {
    stars.push({ x: random(width), y: random(height * 0.7), size: random(0.8, 2.2), alpha: random(50, 200) });
  }
  countrySelect = createSelect();
  countrySelect.position(width / 2, height / 2 + 35);
  countrySelect.style('transform', 'translate(-50%, -50%)');
  countrySelect.style('-webkit-appearance', 'none');
  countrySelect.style('background', '#000000');
  countrySelect.style('color', 'rgba(235, 228, 215, 0.85)');
  countrySelect.style('border', '1px solid rgba(0, 150, 255, 0.15)');
  countrySelect.style('padding', '10px 30px');
  countrySelect.style('font-family', 'Arial, sans-serif');
  countrySelect.style('font-size', '12px');
  countrySelect.style('letter-spacing', '2.5px');
  countrySelect.style('border-radius', '20px');
  countrySelect.style('outline', 'none');
  countrySelect.style('cursor', 'pointer');
  countrySelect.style('text-align', 'center');
  injectCSS();
  countrySelect.option("SELECT A DESTINATION...");
  countrySelect.changed(onCountryChange);
  buildZoomPanel();
  fetch('https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-geo-coordinates.json')
    .then(res => res.json())
    .then(data => {
      countrySelect.html('');
      countrySelect.option("SELECT A DESTINATION...");
      data.sort((a, b) => a.country.localeCompare(b.country));
      for (let c of data) {
        let name = c.country.toUpperCase();
        countryData[name] = { lat: c.north, lon: c.west };
        countrySelect.option(name);
      }
    })
    .catch(() => {
      countrySelect.option("GREECE");
      countryData = { "GREECE": {lat: 39.0742, lon: 21.8243} };
    });
}

function injectCSS() {
  let styleEl = document.createElement('style');
  styleEl.innerHTML = `
    #zoom-panel { position: fixed; bottom: 32px; right: 32px; display: flex; align-items: center; gap: 14px; background: rgba(0,0,0,0.55); border: 1px solid rgba(0, 150, 255, 0.18); border-radius: 24px; padding: 10px 20px 10px 22px; font-family: 'Courier New', monospace; font-size: 11px; color: rgba(0, 180, 255, 0.75); backdrop-filter: blur(8px); z-index: 999; }
    #zoom-slider { -webkit-appearance: none; width: 110px; height: 2px; background: rgba(0, 150, 255, 0.22); }
    #zoom-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: rgba(0, 160, 255, 0.85); }
    #zoom-close { background: none; border: none; color: rgba(0, 180, 255, 0.5); cursor: pointer; }
  `;
  document.head.appendChild(styleEl);
}

function buildZoomPanel() {
  zoomPanelEl = document.createElement('div');
  zoomPanelEl.id = 'zoom-panel';
  zoomPanelEl.style.opacity = '0';
  zoomPanelEl.style.pointerEvents = 'none';
  zoomLabelEl = document.createElement('label');
  zoomLabelEl.innerText = 'ZOOM  1.0×';
  zoomSliderEl = document.createElement('input');
  zoomSliderEl.id = 'zoom-slider';
  zoomSliderEl.type = 'range';
  zoomSliderEl.min = '0.3'; zoomSliderEl.max = '2.5'; zoomSliderEl.step = '0.05'; zoomSliderEl.value = '1.0';
  zoomSliderEl.addEventListener('input', () => { userZoom = parseFloat(zoomSliderEl.value); zoomLabelEl.innerText = 'ZOOM  ' + userZoom.toFixed(1) + '×'; });
  let closeBtn = document.createElement('button');
  closeBtn.id = 'zoom-close'; closeBtn.innerText = '✕';
  closeBtn.addEventListener('click', hideZoomPanel);
  zoomPanelEl.appendChild(zoomLabelEl); zoomPanelEl.appendChild(zoomSliderEl); zoomPanelEl.appendChild(closeBtn);
  document.body.appendChild(zoomPanelEl);
}

function showZoomPanel() { zoomPanelEl.style.opacity = '1'; zoomPanelEl.style.pointerEvents = 'auto'; }
function hideZoomPanel() { zoomPanelEl.style.opacity = '0'; zoomPanelEl.style.pointerEvents = 'none'; }

function draw() {
  if (isStarted) { currentBG = lerpColor(currentBG, color(0), 0.08); menuAlpha = lerp(menuAlpha, 0, 0.08); } 
  else { currentBG = lerpColor(currentBG, color(8, 12, 18), 0.05); menuAlpha = lerp(menuAlpha, 255, 0.05); }
  background(currentBG);
  let centerX = width / 2;
  let centerY = height / 2;
  if (menuAlpha > 0.5) {
    noStroke();
    for (let s of stars) {
      let flicker = noise(s.x, s.y, frameCount * 0.01) * 60 - 30;
      fill(235, 228, 215, constrain(s.alpha + flicker, 10, 225) * (menuAlpha / 255));
      ellipse(s.x, s.y, s.size);
    }
    fill(3, 6, 10, menuAlpha);
    stroke(50, 80, 100, menuAlpha * 0.12);
    strokeWeight(2);
    ellipse(centerX, eclipseY, eclipseRadius * 2);
    noStroke();
  }
  if (!isStarted) {
    textAlign(CENTER, CENTER); fill(220, 235, 255, 245); textSize(25);
    text("Connect your skin to the sky.", centerX, centerY - 100);
    fill(160, 180, 200, 210); textSize(11);
    text("L O C A L   A I R   P O L L U T I O N   D I S R U P T S   T H E   S A T E L L I T E   B E A M S", centerX, centerY - 45);
    return;
  }
  push();
  translate(centerX, centerY);
  scale(userZoom);
  stroke(0, 120, 255, 40); noFill(); strokeWeight(1.5); circle(0, 0, fixedRadius * 2);
  let targetCountry = countryData[currentCountryName];
  for (let satData of REAL_SATELLITES) {
    drawRealisticSatellite(satData.name, satData, targetCountry);
  }
  pop();
}

function getSatPos(time, satData, country) {
  let angle = (time / satData.period) * TWO_PI + satData.phase;
  let lon = (((((angle % TWO_PI) - PI) * (180 / PI)) - country.lon + 540) % 360 - 180);
  let lat = sin(angle) * satData.inclination - country.lat;
  return { x: lon * 5, y: -lat * 5 };
}

function drawRealisticSatellite(name, satData, country) {
  let disruption = constrain(map(pm25, 0, 30, 0.1, 0.9), 0.1, 0.9);
  let currentPos = getSatPos(Date.now(), satData, country);
  for (let f = 0; f < 65; f++) {
    let pos1 = getSatPos(Date.now() - f * 18000, satData, country);
    let pos2 = getSatPos(Date.now() - (f + 1) * 18000, satData, country);
    if (dist(pos1.x, pos1.y, 0, 0) < fixedRadius && dist(pos2.x, pos2.y, 0, 0) < fixedRadius) {
      let flicker = noise(satData.phase + frameCount * 0.1, f * 0.1);
      let alphaMod = (flicker < disruption) ? map(flicker, 0, disruption, 0.05, 0.8) : 1.0;
      let baseAlpha = map(pow(1 - (f/65), 1.2), 0, 1, 0, 255) * alphaMod;
      stroke(0, 100, 255, baseAlpha * 0.2); strokeWeight(satelliteThickness * (1 - f/65) * 3.5); line(pos1.x, pos1.y, pos2.x, pos2.y);
      stroke(0, 180, 255, baseAlpha * 0.6); strokeWeight(satelliteThickness * (1 - f/65) * 1.5); line(pos1.x, pos1.y, pos2.x, pos2.y);
      stroke(255, 255, 255, baseAlpha * 0.9); strokeWeight(satelliteThickness * (1 - f/65) * 0.4); line(pos1.x, pos1.y, pos2.x, pos2.y);
    }
  }
  if (dist(currentPos.x, currentPos.y, 0, 0) < fixedRadius) {
    fill(130, 225, 255, 200);
    noStroke(); textFont('Courier New'); textSize(9); text(name, currentPos.x + 10, currentPos.y);
  }
}

function onCountryChange() {
  let val = countrySelect.value();
  if (val !== "SELECT A DESTINATION..." && countryData[val]) {
    currentCountryName = val;
    fetchAirData(countryData[val].lat, countryData[val].lon);
    isStarted = true; countrySelect.hide(); showZoomPanel();
  }
}

function fetchAirData(lat, lon) {
  fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`)
    .then(r => r.json()).then(d => { if (d.current) pm25 = d.current.pm2_5; })
    .catch(() => pm25 = floor(random(8, 25)));
}

function keyPressed() { if (key === 'm' || key === 'M') { isStarted = false; countrySelect.show(); hideZoomPanel(); } }
function windowResized() { resizeCanvas(windowWidth, windowHeight); eclipseRadius = max(width, height) * 0.9; eclipseY = height + eclipseRadius * 0.72; countrySelect.position(width / 2, height / 2 + 35); }