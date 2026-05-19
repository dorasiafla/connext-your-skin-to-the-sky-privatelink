let currentCountryName = "";
let pm25 = 12;                
let liveSatelliteCount = 3;   
const fixedRadius = 240;      
let maxHistory = 500;         

let satelliteThickness = 12;  
let zoomFactor = 1.0;         

let satellites = []; 
let countrySelect; 
let countryData = {}; 
let isStarted = false; 

let stars = [];
let eclipseY;
let eclipseRadius;
let currentBG; 
let menuAlpha = 255; 

// --- Zoom Control State ---
let userZoom = 1.0;        // the zoom the user has set (persists after X)
let zoomControlVisible = false;
let zoomSliderEl = null;
let zoomLabelEl = null;
let zoomPanelEl = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  currentBG = color(8, 12, 18);

  eclipseRadius = max(width, height) * 0.9;
  eclipseY = height + eclipseRadius * 0.72;

  stars = [];
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
  countrySelect.style('-moz-appearance', 'none');    
  countrySelect.style('appearance', 'none');         
  
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
  countrySelect.style('text-align-last', 'center');
  countrySelect.style('transition', 'all 0.4s ease'); 
  
  let styleEl = document.createElement('style');
  styleEl.innerHTML = `
    select::-ms-expand { display: none; }
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
      letter-spacing: 2px;
      color: rgba(0, 180, 255, 0.75);
      backdrop-filter: blur(8px);
      z-index: 999;
      transition: opacity 0.35s ease;
    }
    #zoom-panel label {
      white-space: nowrap;
      user-select: none;
      min-width: 56px;
    }
    #zoom-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 110px;
      height: 2px;
      background: rgba(0, 150, 255, 0.22);
      border-radius: 2px;
      outline: none;
      cursor: pointer;
    }
    #zoom-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(0, 160, 255, 0.85);
      box-shadow: 0 0 8px rgba(0, 160, 255, 0.6);
      cursor: pointer;
      transition: box-shadow 0.2s;
    }
    #zoom-slider::-webkit-slider-thumb:hover {
      box-shadow: 0 0 14px rgba(0, 200, 255, 0.9);
    }
    #zoom-close {
      background: none;
      border: none;
      color: rgba(0, 180, 255, 0.5);
      font-size: 14px;
      line-height: 1;
      cursor: pointer;
      padding: 0 2px;
      font-family: 'Courier New', monospace;
      transition: color 0.2s;
      user-select: none;
    }
    #zoom-close:hover {
      color: rgba(0, 220, 255, 0.9);
    }
  `;
  document.head.appendChild(styleEl);
  
  countrySelect.elt.onmouseover = () => {
    countrySelect.style('border', '1px solid rgba(0, 150, 255, 0.5)'); 
    countrySelect.style('background', 'rgba(0, 180, 255, 0.03)'); 
  };
  countrySelect.elt.onmouseout = () => {
    countrySelect.style('border', '1px solid rgba(0, 150, 255, 0.15)');
    countrySelect.style('background', '#000000');
  };
  
  countrySelect.option("SELECT A DESTINATION...");
  countrySelect.changed(onCountryChange);

  // Build zoom panel (hidden initially)
  buildZoomPanel();

  fetch('https://restcountries.com/v3.1/all?fields=name,latlng,area')
    .then(res => res.json())
    .then(data => {
      let list = data.filter(c => c.latlng && c.latlng.length === 2);
      list.sort((a, b) => a.name.common.localeCompare(b.name.common));
      
      countrySelect.html(''); 
      countrySelect.option("SELECT A DESTINATION...");
      
      for (let c of list) {
        let name = c.name.common.toUpperCase();
        countryData[name] = { 
          lat: c.latlng[0], 
          lon: c.latlng[1],
          area: c.area || 100000 
        };
        countrySelect.option(name);
      }
      console.log("🌍 System Ready: Loaded " + list.length + " countries successfully.");
    })
    .catch(err => {
      console.log("❌ Error loading countries. Using fallback.");
      countrySelect.html('');
      countrySelect.option("NETHERLANDS");
      countryData = { "NETHERLANDS": {lat: 52.3676, lon: 4.9041, area: 41850} };
    });

  setInterval(() => {
    if (isStarted && countryData[currentCountryName]) {
      console.log("⏰ 10-Minute Timer Triggered: Fetching fresh air quality data...");
      let lat = countryData[currentCountryName].lat;
      let lon = countryData[currentCountryName].lon;
      fetchAirData(lat, lon);
    }
  }, 600000);

  setInterval(() => {
    if (isStarted && countryData[currentCountryName]) {
      calculateZoomAndSatellites(countryData[currentCountryName].area);
      generateSatellites();
    }
  }, 20000);
}

function buildZoomPanel() {
  zoomPanelEl = document.createElement('div');
  zoomPanelEl.id = 'zoom-panel';
  zoomPanelEl.style.opacity = '0';
  zoomPanelEl.style.pointerEvents = 'none';

  zoomLabelEl = document.createElement('label');
  zoomLabelEl.id = 'zoom-label';
  zoomLabelEl.innerText = 'ZOOM  1.0×';

  zoomSliderEl = document.createElement('input');
  zoomSliderEl.id = 'zoom-slider';
  zoomSliderEl.type = 'range';
  zoomSliderEl.min = '0.4';
  zoomSliderEl.max = '3.0';
  zoomSliderEl.step = '0.05';
  zoomSliderEl.value = '1.0';

  zoomSliderEl.addEventListener('input', () => {
    userZoom = parseFloat(zoomSliderEl.value);
    zoomLabelEl.innerText = 'ZOOM  ' + userZoom.toFixed(1) + '×';
    // Reposition satellites velocity with new zoom, don't regenerate fully
    for (let sat of satellites) {
      // scale velocity ratio
      let speed = sqrt(sat.vx * sat.vx + sat.vy * sat.vy);
      let angle = atan2(sat.vy, sat.vx);
      let baseSpeed = random(0.2, 0.5) * userZoom;
      sat.vx = cos(angle) * baseSpeed;
      sat.vy = sin(angle) * baseSpeed * 0.4;
    }
  });

  let closeBtn = document.createElement('button');
  closeBtn.id = 'zoom-close';
  closeBtn.innerText = '✕';
  closeBtn.title = 'Close zoom control';
  closeBtn.addEventListener('click', () => {
    hideZoomPanel();
  });

  zoomPanelEl.appendChild(zoomLabelEl);
  zoomPanelEl.appendChild(zoomSliderEl);
  zoomPanelEl.appendChild(closeBtn);
  document.body.appendChild(zoomPanelEl);
}

function showZoomPanel() {
  zoomControlVisible = true;
  zoomPanelEl.style.opacity = '1';
  zoomPanelEl.style.pointerEvents = 'auto';
}

function hideZoomPanel() {
  zoomControlVisible = false;
  zoomPanelEl.style.opacity = '0';
  zoomPanelEl.style.pointerEvents = 'none';
  // userZoom stays as-is — persists
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

    drawingContext.shadowBlur = map(menuAlpha, 0, 255, 0, 90);
    drawingContext.shadowColor = color(25, 55, 75, menuAlpha * 0.78); 
    
    fill(3, 6, 10, menuAlpha); 
    stroke(50, 80, 100, menuAlpha * 0.12); 
    strokeWeight(2);
    ellipse(centerX, eclipseY, eclipseRadius * 2);
    
    drawingContext.shadowBlur = 0;
    noStroke();
  }

  if (!isStarted) {
    textAlign(CENTER, CENTER);
    textFont('Arial'); 
    
    drawingContext.shadowBlur = 12;
    drawingContext.shadowColor = color(0, 150, 255, 90); 
    fill(220, 235, 255, 245); 
    textSize(25); 
    textStyle(NORMAL);
    text("Connect your skin to the sky.", centerX, centerY - 100);
    drawingContext.shadowBlur = 0; 
    
    fill(160, 180, 200, 210); 
    textSize(11); 
    textStyle(NORMAL);
    let subText = "L O C A L   A I R   P O L L U T I O N   D I S R U P T S   T H E   S A T E L L I T E   B E A M S";
    text(subText, centerX, centerY - 45);
    return; 
  }

  // Draw orbit circle — stronger glow
  let circleR = fixedRadius * userZoom;
  drawingContext.shadowBlur = 28;
  drawingContext.shadowColor = 'rgba(0, 140, 255, 0.55)';
  noFill();
  stroke(0, 120, 255, 55);
  strokeWeight(1.5);
  circle(centerX, centerY, circleR * 2);

  // Second inner ring for more presence
  drawingContext.shadowBlur = 12;
  drawingContext.shadowColor = 'rgba(0, 180, 255, 0.35)';
  stroke(0, 160, 255, 30);
  strokeWeight(0.6);
  circle(centerX, centerY, circleR * 2 - 3);
  drawingContext.shadowBlur = 0;

  for (let sat of satellites) {
    updateAndDrawSatellite(sat, centerX, centerY, circleR);
  }
}

function onCountryChange() {
  let selected = countrySelect.value();
  if (selected !== "SELECT A DESTINATION..." && countryData[selected]) {
    currentCountryName = selected;
    let country = countryData[selected];
    
    console.log("\n--- 🌌 NEW DESTINATION SELECTED ---");
    console.log("Country: " + currentCountryName);
    console.log("Coordinates: Lat " + country.lat + ", Lon " + country.lon);
    console.log("Surface Area: " + country.area + " km²");

    calculateZoomAndSatellites(country.area);
    fetchAirData(country.lat, country.lon);
    
    satellites = [];
    generateSatellites(); 
    isStarted = true; 
    countrySelect.hide();
    showZoomPanel();
  }
}

function calculateZoomAndSatellites(area) {
  let baseCount = map(sqrt(area), sqrt(50000), sqrt(17000000), 3, 18);
  liveSatelliteCount = floor(constrain(baseCount, 2, 20));
  let baseThickness = map(sqrt(area), sqrt(50000), sqrt(17000000), 12, 4.5);
  satelliteThickness = constrain(baseThickness, 4.0, 12.0);
  // zoomFactor from country area is separate from userZoom
  zoomFactor = map(sqrt(area), sqrt(50000), sqrt(17000000), 1.0, 2.2);
  
  console.log("🛰️ Simulation Specs -> Target Satellites: " + liveSatelliteCount + " | Beam Thickness: " + satelliteThickness.toFixed(1) + "px");
}

function keyPressed() {
  if (key === 'm' || key === 'M') {
    console.log("↩️ Installation reset to Main Menu.");
    isStarted = false;
    satellites = []; 
    countrySelect.selected("SELECT A DESTINATION...");
    countrySelect.position(width / 2, height / 2 + 35);
    countrySelect.show();
    hideZoomPanel();
  }
  // Toggle zoom panel with 'z'
  if ((key === 'z' || key === 'Z') && isStarted) {
    if (zoomControlVisible) hideZoomPanel();
    else showZoomPanel();
  }
}

function fetchAirData(lat, lon) {
  let airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`;
  
  fetch(airUrl)
    .then(response => response.json())
    .then(data => {
      if (data && data.current && data.current.pm2_5 !== undefined) {
        pm25 = data.current.pm2_5;
        console.log("📡 [AIR QUALITY UPDATE] -> Current PM2.5 Level: " + pm25 + " µg/m³");
      }
    })
    .catch(err => console.log("❌ Air API Connection error. Check internet connection."));
}

function generateSatellites() {
  let currentLength = satellites.length;
  if (currentLength < liveSatelliteCount) {
    for (let i = currentLength; i < liveSatelliteCount; i++) {
      satellites.push({
        x: random(width),
        y: random(height * 0.8),
        vx: random(0.2, 0.5) * (random() > 0.5 ? 1 : -1) * userZoom,
        vy: random(0.05, 0.2) * (random() > 0.5 ? 1 : -1) * userZoom,
        history: [],
        // Dashing state — each satellite gets its own irregular rhythm
        dashPhase: random(1000),
        dashSpeed: random(0.008, 0.018),    // how fast the dash cycle runs
        dotChance: random(0.15, 0.35),      // probability of dot vs segment
        gapLengthMin: random(4, 12),        // frames of gap minimum
        gapLengthMax: random(15, 40),       // frames of gap maximum
        segLengthMin: random(3, 10),        // frames of segment minimum
        segLengthMax: random(12, 35),       // frames of segment maximum
        dashState: 'on',
        dashTimer: floor(random(5, 20))
      });
    }
  } else if (currentLength > liveSatelliteCount) {
    satellites.splice(liveSatelliteCount);
  }
}

// Returns 0 (invisible) or 1 (visible) based on irregular dash rhythm.
// At low pollution: fully continuous. At high pollution: heavy gaps, dot flashes.
function getDashAlphaMultiplier(sat) {
  let disruption = constrain(map(pm25, 2, 34, 0.0, 1.0), 0.0, 1.0);

  // Below threshold (pm25 roughly < 8) stay fully on, no dashing at all
  if (disruption < 0.18) {
    sat.dashState = 'on';
    sat.dashTimer = 999;
    return 1.0;
  }

  sat.dashTimer--;
  if (sat.dashTimer <= 0) {
    if (sat.dashState === 'on') {
      // Probability of actually going into a gap grows with disruption
      let gapChance = map(disruption, 0.18, 1.0, 0.15, 1.0);
      if (random() < gapChance) {
        sat.dashState = 'off';
        let gapMin = lerp(2, sat.gapLengthMin * 2.5, disruption);
        let gapMax = lerp(5, sat.gapLengthMax * 3.5, disruption);
        sat.dashTimer = floor(random(gapMin, gapMax));
      } else {
        // Stay on with a long segment
        let segMin = lerp(30, sat.segLengthMin, disruption);
        let segMax = lerp(80, sat.segLengthMax, disruption);
        sat.dashTimer = floor(random(segMin, segMax));
      }
    } else {
      // Back to on — segments shrink as pollution rises
      sat.dashState = 'on';
      let segMin = lerp(sat.segLengthMin * 2, sat.segLengthMin * 0.4, disruption);
      let segMax = lerp(sat.segLengthMax * 2, sat.segLengthMax * 0.35, disruption);
      sat.dashTimer = max(1, floor(random(segMin, segMax)));

      // At very high pollution: occasional single-dot flash
      if (disruption > 0.6 && random() < sat.dotChance * disruption) {
        sat.dashTimer = floor(random(1, 3));
      }
    }
  }

  return sat.dashState === 'on' ? 1.0 : 0.0;
}

function updateAndDrawSatellite(sat, cx, cy, circleR) {
  sat.x += sat.vx;
  sat.y += sat.vy;

  if (sat.x > width) sat.x = 0;
  if (sat.x < 0) sat.x = width;
  if (sat.y > height) sat.y = 0;
  if (sat.y < 0) sat.y = height;

  // Compute dash visibility for this frame
  let dashVisible = getDashAlphaMultiplier(sat);

  let v = createVector(sat.x, sat.y);
  // Store history entry with dash state baked in
  sat.history.push({ pos: v.copy(), visible: dashVisible });
  if (sat.history.length > maxHistory) sat.history.shift();

  let minBrightness = map(pm25, 0, 45, 255, 30); 
  minBrightness = constrain(minBrightness, 20, 255);

  let glowColor = color(0, 130, 255); 
  drawingContext.shadowBlur = map(satelliteThickness, 4, 12, 6, 18);     
  drawingContext.shadowColor = glowColor;

  for (let i = 0; i < sat.history.length; i++) {
    let entry = sat.history[i];
    let pos = entry.pos;
    let d = dist(pos.x, pos.y, cx, cy);
    if (d < circleR) { 
      let progress = (sat.history.length > 1) ? i / (sat.history.length - 1) : 1;
      let baseAlpha = map(pow(progress, 1.5), 0, 1, 0, 120);
      let alpha = baseAlpha * entry.visible;   // 0 during gaps
      let flicker = random(minBrightness, 255);
      stroke(0, flicker, 255, alpha); 
      strokeWeight(satelliteThickness * userZoom); 
      point(pos.x, pos.y);
    }
  }
  drawingContext.shadowBlur = 0; 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  eclipseRadius = max(width, height) * 0.9;
  eclipseY = height + eclipseRadius * 0.72;
  countrySelect.position(width / 2, height / 2 + 35); 
}