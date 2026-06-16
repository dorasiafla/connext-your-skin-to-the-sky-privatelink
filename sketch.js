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
let userZoom = 1.0;        // the zoom the user has set
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

  buildZoomPanel();

  fetch('https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-geo-coordinates.json')
    .then(res => res.json())
    .then(data => {
      countrySelect.html(''); 
      countrySelect.option("SELECT A DESTINATION...");
      
      data.sort((a, b) => a.country.localeCompare(b.country));

      for (let c of data) {
        let name = c.country.toUpperCase();
        countryData[name] = { 
          lat: c.north, 
          lon: c.west,
          area: random(50000, 500000) 
        };
        countrySelect.option(name);
      }
      console.log("🌍 System Ready: Loaded " + data.length + " countries successfully.");
    })
    .catch(err => {
      console.log("❌ Error loading countries. Using fallback.");
      countrySelect.html('');
      countrySelect.option("GREECE");
      countryData = { "GREECE": {lat: 39.0742, lon: 21.8243, area: 131957} };
    });

  setInterval(() => {
    if (isStarted && countryData[currentCountryName]) {
      let lat = countryData[currentCountryName].lat;
      let lon = countryData[currentCountryName].lon;
      fetchAirData(lat, lon);
    }
  }, 600000);
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
  zoomControlVisible = true;
  zoomPanelEl.style.opacity = '1';
  zoomPanelEl.style.pointerEvents = 'auto';
}

function hideZoomPanel() {
  zoomControlVisible = false;
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

  // Τα αστέρια και το UI μένουν ακίνητα (δεν επηρεάζονται από το zoom)
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

  // --- ΕΝΑΡΞΗ ΤΗΣ ΚΑΜΕΡΑΣ (ZOOM) ---
  push();
  translate(centerX, centerY); // Μεταφέρουμε το κέντρο του σύμπαντος στο κέντρο της οθόνης
  scale(userZoom); // Ζουμάρουμε ΟΛΑ ΤΑ ΠΑΝΤΑ αυτόματα!

  // Ζωγραφίζουμε τον κεντρικό κύκλο γύρω από το νέο κέντρο (0,0)
  drawingContext.shadowBlur = 28;
  drawingContext.shadowColor = 'rgba(0, 140, 255, 0.55)';
  noFill();
  stroke(0, 120, 255, 55);
  strokeWeight(1.5);
  circle(0, 0, fixedRadius * 2);
  drawingContext.shadowBlur = 0;

  // Ζωγραφίζουμε τους δορυφόρους
  for (let sat of satellites) {
    updateAndDrawSatellite(sat, fixedRadius);
  }
  
  pop();
  // --- ΤΕΛΟΣ ΤΗΣ ΚΑΜΕΡΑΣ ---
}

function onCountryChange() {
  let selected = countrySelect.value();
  if (selected !== "SELECT A DESTINATION..." && countryData[selected]) {
    currentCountryName = selected;
    let country = countryData[selected];
    
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
  let baseCount = map(sqrt(area), sqrt(50000), sqrt(17000000), 4, 15);
  liveSatelliteCount = floor(constrain(baseCount, 3, 15));
  let baseThickness = map(sqrt(area), sqrt(50000), sqrt(17000000), 10, 5);
  satelliteThickness = constrain(baseThickness, 4.0, 10.0);
}

function keyPressed() {
  if (key === 'm' || key === 'M') {
    isStarted = false;
    satellites = []; 
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
        console.log("📡 [LIVE DATA COUPLING] -> Country: " + currentCountryName + " | PM2.5: " + pm25);
      }
    })
    .catch(err => {
      pm25 = floor(random(8, 28)); 
    });
}

function generateSatellites() {
  satellites = [];
  // Οι συντεταγμένες πλέον μετριούνται από το κέντρο της οθόνης (0,0)
  let boundX = width * 1.5; 
  let boundY = height * 1.5;
  
  for (let i = 0; i < liveSatelliteCount; i++) {
    satellites.push({
      x: random(-boundX, boundX),
      y: random(-boundY, boundY),
      vx: random(0.5, 1.2) * (random() > 0.5 ? 1 : -1),
      vy: random(0.2, 0.6) * (random() > 0.5 ? 1 : -1),
      history: [],
      dashState: 'on',
      dashTimer: floor(random(10, 30))
    });
  }
}

function getDashAlphaMultiplier(sat) {
  let disruption = constrain(map(pm25, 2, 35, 0, 1), 0, 1);
  if (disruption < 0.2) return 1.0;

  sat.dashTimer--;
  if (sat.dashTimer <= 0) {
    if (sat.dashState === 'on') {
      sat.dashState = 'off';
      sat.dashTimer = floor(random(5, 25) * disruption);
    } else {
      sat.dashState = 'on';
      sat.dashTimer = floor(random(15, 40) * (1 - disruption));
    }
  }
  return sat.dashState === 'on' ? 1.0 : 0.1;
}

function updateAndDrawSatellite(sat, circleR) {
  sat.x += sat.vx;
  sat.y += sat.vy;

  let boundX = width * 1.5;
  let boundY = height * 1.5;

  if (sat.x > boundX) sat.x = -boundX;
  if (sat.x < -boundX) sat.x = boundX;
  if (sat.y > boundY) sat.y = -boundY;
  if (sat.y < -boundY) sat.y = boundY;

  let dashVisible = getDashAlphaMultiplier(sat);
  let v = createVector(sat.x, sat.y);
  
  sat.history.push({ pos: v.copy(), visible: dashVisible });
  if (sat.history.length > maxHistory) sat.history.shift();

  let minBrightness = map(pm25, 0, 45, 255, 50);
  
  // 🔥 ΤΟ GLOW ΕΠΕΣΤΡΕΨΕ! Το βάζουμε πριν ζωγραφίσουμε τις γραμμές 🔥
  drawingContext.shadowBlur = satelliteThickness * 1.5;
  drawingContext.shadowColor = color(0, 130, 255);
  
  strokeWeight(satelliteThickness);

  for (let i = 0; i < sat.history.length; i++) {
    let entry = sat.history[i];
    let pos = entry.pos;
    
    // Επειδή είμαστε σε "κάμερα", το κέντρο είναι πλέον το 0,0
    let d = dist(pos.x, pos.y, 0, 0); 
    
    if (d < circleR) { 
      let progress = i / sat.history.length;
      let alpha = map(progress, 0, 1, 0, 150) * entry.visible;
      let flicker = random(minBrightness, 255);
      
      stroke(0, flicker, 255, alpha); 
      point(pos.x, pos.y);
    }
  }
  
  drawingContext.shadowBlur = 0; // Καθαρίζουμε το glow για το επόμενο καρέ
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  eclipseRadius = max(width, height) * 0.9;
  eclipseY = height + eclipseRadius * 0.72;
  countrySelect.position(width / 2, height / 2 + 35); 
}