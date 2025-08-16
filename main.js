let earthTexture;
let issData;
let earthRadius = 200;

async function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(RADIANS);

  earthTexture = await loadImage("images/Solarsystemscope_texture_8k_earth_daymap.jpg");

  await getIssData(); // Initial fetch for ISS data
  setInterval(getIssData, 5000); // update ISS every 5 seconds
}

function draw() {
  background(10, 10, 20);
  noStroke();
  orbitControl(); // Allow mouse control to rotate the globe

  setupSunLight();

  // Draw Earth
  rotateY(PI); // Correct texture orientation
  texture(earthTexture);
  sphere(earthRadius, 24, 24);

  if (issData) {
    drawISS();
  }
}

function setupSunLight() {
  // SunCalc returns azimuth and altitude for a given location & date
  let sunPosition = SunCalc.getPosition(new Date(), 0, 0); // lat, lon = 0,0

  let azimuth = sunPosition.azimuth; // Sun's horizontal angle
  let altitude = sunPosition.altitude; // Sun's vertical angle

  // Convert azimuth/altitude to a 3D directional vector for lighting
  let sunX = cos(altitude) * sin(azimuth);
  let sunY = sin(altitude);
  let sunZ = cos(altitude) * cos(azimuth);

  // Sun light
  directionalLight(255, 255, 255, sunX, sunY, sunZ);

  // Soft light on night side
  ambientLight(50);
}

function drawISS() {
  let issLatitude = radians(float(issData.iss_position.latitude));
  let issLongitude = radians(float(issData.iss_position.longitude));

  // Calculation for an un-rotated p5.js sphere
  let x = earthRadius * cos(issLatitude) * sin(issLongitude);
  let y = -earthRadius * sin(issLatitude);
  let z = earthRadius * cos(issLatitude) * cos(issLongitude);

  // The rotateY(PI) in the main draw loop flips the x and z axes so the same transformation need to be applied to the ISS coordinates.
  let rotatedX = -x;
  let rotatedY = y;
  let rotatedZ = -z;

  // Draw ISS
  push();
  noLights();
  shininess(1);
  translate(rotatedX, rotatedY, rotatedZ);
  fill(255, 0, 0);
  sphere(5);
  pop();
}

async function getIssData() {
  let response = await fetch("http://api.open-notify.org/iss-now.json");
  issData = await response.json();
}