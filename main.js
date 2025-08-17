let earthTexture;
let issData;
let earthRadius;

async function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(RADIANS);

  if (windowHeight < windowWidth) {
    earthRadius = (windowHeight * 0.75) / 2;
  } else {
    earthRadius = (windowWidth * 0.75) / 2;
  }

  earthTexture = await loadImage("images/Solarsystemscope_texture_8k_earth_daymap.jpg");

  await getIssData(); // Initial fetch for ISS data
  setInterval(getIssData, 5000); // update ISS every 5 seconds
}

function draw() {
  background(10, 10, 20);
  noStroke();
  orbitControl(1, 1, 0); // Allow mouse control to rotate the globe, but not zoom

  setupSunLight();

  // Draw Earth
  rotateY(PI); // Correct texture orientation
  texture(earthTexture);
  sphere(earthRadius, 20, 20);

  if (issData) {
    drawISS();
  }
}

function setupSunLight() {
  // SunCalc returns azimuth and altitude for a given location & date
  let sunPosition = SunCalc.getPosition(new Date(), 0, 0); // lat, lon = 0,0
  let azimuth = sunPosition.azimuth;
  let altitude = sunPosition.altitude;

  // Convert azimuth/altitude to a 3D directional vector for lighting
  let sunX = -cos(altitude) * sin(azimuth);
  let sunY = cos(altitude) * cos(azimuth);
  let sunZ = sin(altitude);

  // Sun light
  directionalLight(255, 255, 255, -sunX, -sunY, -sunZ);

  // Soft light on night side
  ambientLight(50);
}

function drawISS() {
  let issLatitude = radians(float(issData.latitude));
  let issLongitude = radians(float(issData.longitude));

  let x = -earthRadius * cos(issLatitude) * sin(issLongitude);
  let y = -earthRadius * sin(issLatitude);
  let z = -earthRadius * cos(issLatitude) * cos(issLongitude);

  // Draw ISS
  push();
  noLights();
  shininess(1);
  translate(x, y, z);
  fill(255, 0, 0);
  sphere(5);
  pop();
}

async function getIssData() {
  try {
    let response = await fetch("https://api.allorigins.win/raw?url=http://api.open-notify.org/iss-now.json");
    if (!response.ok) throw new Error("API request failed");
    let data = await response.json();

    issData = {
      latitude: parseFloat(data.iss_position.latitude),
      longitude: parseFloat(data.iss_position.longitude)
    };
  } catch (err) {
    console.log("ISS data fetch error:", err);
    issData = null;
  }
}
