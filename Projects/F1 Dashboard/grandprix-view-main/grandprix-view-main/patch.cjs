const fs = require('fs');
const path = './src/data/monaco2024.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const extraResults = [
  { driverId: "alonso", code: "ALO", number: 14, position: 11, grid: 14, status: "Finished", points: 0, constructor: "Aston Martin", name: "Fernando Alonso" },
  { driverId: "ricciardo", code: "RIC", number: 3, position: 12, grid: 12, status: "Finished", points: 0, constructor: "RB", name: "Daniel Ricciardo" },
  { driverId: "bottas", code: "BOT", number: 77, position: 13, grid: 17, status: "Finished", points: 0, constructor: "Sauber", name: "Valtteri Bottas" },
  { driverId: "stroll", code: "STR", number: 18, position: 14, grid: 13, status: "Finished", points: 0, constructor: "Aston Martin", name: "Lance Stroll" },
  { driverId: "sargeant", code: "SAR", number: 2, position: 15, grid: 15, status: "Finished", points: 0, constructor: "Williams", name: "Logan Sargeant" },
  { driverId: "zhou", code: "ZHO", number: 24, position: 16, grid: 18, status: "Finished", points: 0, constructor: "Sauber", name: "Guanyu Zhou" },
  { driverId: "ocon", code: "OCO", number: 31, position: 17, grid: 11, status: "Collision damage", points: 0, constructor: "Alpine", name: "Esteban Ocon" },
  { driverId: "perez", code: "PER", number: 11, position: 18, grid: 16, status: "Collision", points: 0, constructor: "Red Bull", name: "Sergio Perez" },
  { driverId: "hulkenberg", code: "HUL", number: 27, position: 19, grid: 19, status: "Collision", points: 0, constructor: "Haas", name: "Nico Hulkenberg" },
  { driverId: "magnussen", code: "MAG", number: 20, position: 20, grid: 20, status: "Collision", points: 0, constructor: "Haas", name: "Kevin Magnussen" }
];

data.results.push(...extraResults);

// Add empty or average lap times for them
const baseLaps = data.lapTimes["leclerc"];
for (const r of extraResults) {
  if (r.status.includes("Collision")) {
    data.lapTimes[r.driverId] = [120, 120]; // DNF on lap 1
  } else {
    data.lapTimes[r.driverId] = baseLaps.map(l => l + 0.5); // finished but slower
  }
}

fs.writeFileSync(path, JSON.stringify(data, null, 1));
console.log("Patched monaco2024.json");
