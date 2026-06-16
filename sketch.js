let currentCountryName = "";
let pm25 = 12;                
const fixedRadius = 240;      
let satelliteThickness = 8;  
let countrySelect; 
let countryData = {}; 
let isStarted = false; 
let stars = [];
let eclipseY;
let eclipseRadius;
let currentBG; 
let menuAlpha = 255; 
let userZoom = 1.0;        
let zoomControlVisible = false;
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
    stars.push({
      x: random(width),
      y: random(height * 0.7),
      size: random(0.8, 2.2),
      alpha: random(50, 200)
    });
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
  let styleEl = document.createElement('style');
  styleEl.innerHTML = `
    #zoom-panel {
      position: fixed;
      bottom: 32px;
      right: 32px;
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(0,0,0,0.55);
      border: 1px solid rgba(0, 150, 255, 0.18);
      border-radius: 24px;
      padding: 10px 20px 10px 22px;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: rgba(0, 180, 255, 0.75);
      backdrop-filter: blur(8px);
      z-index: 999;
    }
    #zoom-slider {
      -webkit-appearance: none;
      width: 110px;
      height: 2px;
      background: rgba(0, 150, 255, 0.22);
    }
    #zoom-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(0, 160, 255, 0.85);
    }
    #zoom-close {
      background: none;
      border: none;
      color: rgba(0, 180, 255, 0.5);
      cursor: pointer;
    }
  `;
  document.head.appendChild(styleEl);
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
    .catch(err => {
      countrySelect.html('');
      countrySelect.option("GREECE");
      countryData = { "GREECE": {lat: 39.0742, lon: 21.8243} };
    });
  setInterval(() => {
    if (isStarted && countryData[currentCountryName]) {
      fetchAirData(countryData[currentCountryName].lat, countryData[currentCountryName].lon);
    }
  }, 600000);
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
  zoomSliderEl.min = '0.3';
  zoomSliderEl.max = '2.5';
  zoomSliderEl.step = '0.05';
  zoomSliderEl.value = '1.0';
  zoomSliderEl.addEventListener('input', () => {
    userZoom = parseFloat(zoomSliderEl.value);
    zoomLabelEl.innerText = 'ZOOM  ' + userZoom.toFixed(1) + '×';
  });
  let closeBtn = document.createElement('button');
  closeBtn.id = 'zoom-close';
  closeBtn.innerText = '✕';
  closeBtn.addEventListener('click', () => { hideZoomPanel(); });
  zoomPanelEl.appendChild(zoomLabelEl);
  zoomPanelEl.appendChild(zoomSliderEl);
  zoomPanelEl.appendChild(closeBtn);
  document.body.appendChild(zoomPanelEl);
}

function showZoomPanel() {
  zoomPanelEl.style.opacity = '1';
  zoomPanelEl.style.pointerEvents = 'auto';
}

function hideZoomPanel() {
  zoomPanelEl.style.opacity = '0';
  zoomPanelEl.style.pointerEvents = 'none';
}

function draw() {
  if (isStarted) {
    currentBG = lerpColor(currentBG, color(0), 0.08);
    menuAlpha = lerp(menuAlpha, 0, 0.08); 
  } else {
    currentBG = lerpColor(currentBG, color(8, 12, 18), 0.05);
    menuAlpha = lerp(menuAlpha, 255, 0.05);
  }
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
    textAlign(CENTER, CENTER);
    textFont('Arial'); 
    fill(220, 235, 255, 245); 
    textSize(25); 
    text("Connect your skin to the sky.", centerX, centerY - 100);
    fill(160, 180, 200, 210); 
    textSize(11); 
    text("L O C A L   A I R   P O L L U T I O N   D I S R U P T S   T H E   S A T E L L I T E   B E A M S", centerX, centerY - 45);
    return; 
  }
  push();
  translate(centerX, centerY); 
  scale(userZoom); 
  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = 'rgba(0, 140, 255, 0.4)';
  noFill();
  stroke(0, 120, 255, 60);
  strokeWeight(1.5);
  circle(0, 0, fixedRadius * 2);
  drawingContext.shadowBlur = 0;
  let targetCountry = countryData[currentCountryName];
  for (let satData of REAL_SATELLITES) {
    let time = Date.now();
    let angle = (time / satData.period) * TWO_PI + satData.phase;
    let satLon = ((angle % TWO_PI) - PI) * (180 / PI); 
    let satLat = sin(angle) * satData.inclination;     
    let dLat = satLat - targetCountry.lat;
    let dLon = satLon - targetCountry.lon;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    let distanceDegrees = sqrt(dLat * dLat + dLon * dLon);
    if (distanceDegrees < 45) {
      let satX = dLon * 5.0;
      let satY = -dLat * 5.0;
      drawRealisticSatellite(satData.name, satX, satY, satData, targetCountry);
    }
  }
  pop();
}

function drawRealisticSatellite(name, currentX, currentY, satData, country) {
  let disruption = constrain(map(pm25, 2, 35, 0, 1), 0, 1);
  let minBrightness = map(pm25, 0, 45, 255, 60);
  let timeNow = Date.now();
  for (let f = 0; f < 80; f++) {
    let tPast = timeNow - (f * 15000); 
    let anglePast = (tPast / satData.period) * TWO_PI + satData.phase;
    let pastLon = ((anglePast % TWO_PI) - PI) * (180 / PI);
    let pastLat = sin(anglePast) * satData.inclination;
    let dLatPast = pastLat - country.lat;
    let dLonPast = pastLon - country.lon;
    if (dLonPast > 180) dLonPast -= 360;
    if (dLonPast < -180) dLonPast += 360;
    let histX = dLonPast * 5.0;
    let histY = -dLatPast * 5.0;
    if (dist(histX, histY, 0, 0) < fixedRadius) {
      let progress = 1.0 - (f / 80);
      let dashAlpha = 1.0;
      if (disruption > 0.2) {
        let noiseCheck = noise(satData.phase, f * 0.5, frameCount * 0.1);
        if (noiseCheck < disruption * 0.7) dashAlpha = 0.1;
      }
      let alpha = map(pow(progress, 2), 0, 1, 0, 140) * dashAlpha;
      let flicker = random(minBrightness, 255);
      stroke(0, flicker, 255, alpha);
      strokeWeight(satelliteThickness * progress);
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = `rgba(0, ${flicker}, 255, ${alpha / 255})`;
      point(histX, histY);
    }
  }
  if (dist(currentX, currentY, 0, 0) < fixedRadius) {
    drawingContext.shadowBlur = 0;
    fill(0, 200, 255, 180);
    noStroke();
    textFont('Courier New');
    textSize(9);
    textAlign(LEFT, CENTER);
    text(name, currentX + 10, currentY);
  }
  drawingContext.shadowBlur = 0;
}

function onCountryChange() {
  let selected = countrySelect.value();
  if (selected !== "SELECT A DESTINATION..." && countryData[selected]) {
    currentCountryName = selected;
    fetchAirData(countryData[selected].lat, countryData[selected].lon);
    isStarted = true; 
    countrySelect.hide();
    showZoomPanel();
  }
}

function keyPressed() {
  if (key === 'm' || key === 'M') {
    isStarted = false;
    countrySelect.selected("SELECT A DESTINATION...");
    countrySelect.show();
    hideZoomPanel();
  }
}

function fetchAirData(lat, lon) {
  let airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`;
  fetch(airUrl)
    .then(response => response.json())
    .then(data => {
      if (data && data.current && data.current.pm2_5 !== undefined) {
        pm25 = data.current.pm2_5;
      }
    })
    .catch(err => {
      pm25 = floor(random(8, 25)); 
    });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  eclipseRadius = max(width, height) * 0.9;
  eclipseY = height + eclipseRadius * 0.72;
  countrySelect.position(width / 2, height / 2 + 35); 
}