const fs = require('fs');
const path = './src/data/monaco2024.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const extraIds = ["alonso", "ricciardo", "bottas", "stroll", "sargeant", "zhou"];
const gaslyLaps = data.lapTimes["gasly"]; // 77 laps

for (let i = 0; i < extraIds.length; i++) {
  const driverId = extraIds[i];
  // Add an increasing penalty so they finish in order: Alonso > Ricciardo > Bottas > ...
  const penalty = (i + 1) * 0.5; // seconds per lap slower than Gasly
  data.lapTimes[driverId] = gaslyLaps.map(l => l + penalty);
}

fs.writeFileSync(path, JSON.stringify(data, null, 1));
console.log("Fixed monaco2024.json lap counts for bottom 6 finishers.");
