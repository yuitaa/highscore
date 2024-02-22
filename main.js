var proxyUrl =
  "https://script.google.com/macros/s/AKfycbyqHKxA_HPk-7SIn60kOx2McTPtlvdFB1Ad1pcggsjdC1TGPkL4oYu6b9_nTfujnGep1w/exec";
var parm = "";

function* range(start, end, step = 1) {
  if (arguments.length === 1) {
    end = start;
    start = 0;
  }

  for (let i = start; i < end; i += step) {
    yield i;
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const timezoneOffset = -date.getTimezoneOffset();
  const timezoneOffsetSign = timezoneOffset >= 0 ? "+" : "-";
  const timezoneOffsetHours = String(
    Math.floor(Math.abs(timezoneOffset) / 60)
  ).padStart(2, "0");
  const timezoneOffsetMinutes = String(Math.abs(timezoneOffset) % 60).padStart(
    2,
    "0"
  );
  const timezone =
    timezoneOffsetSign + timezoneOffsetHours + ":" + timezoneOffsetMinutes;

  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;

  return formattedDate;
}

function setSeed() {
  document.getElementById("seed").value = this.textContent;
  seedInput();
}

function validateSeed(input) {
  const validChars = /^[a-zA-Z0-9\+\-]{5}[ACEGQSUWgikmwy02][EUIYgs]$/;
  return validChars.test(input);
}

function seedInput() {
  const input = document.getElementById("seed");
  const isValid = validateSeed(input.value);
  input.classList.remove("is-valid", "is-invalid");
  if (isValid) {
    input.classList.add("is-valid");
  } else {
    input.classList.add("is-invalid");
  }
  updateData();
}

function resetTable() {
  let scoreTable = document.getElementById("score-table");
  scoreTable.textContent = "";

  let trElement = document.createElement("tr");
  let thElements = Array.from(
    ["#", "Players", "Date", "Score", "Seed", "_id", "build"],
    (data) => {
      let out = document.createElement("th");
      out.textContent = data;
      return out;
    }
  );

  const timezoneOffset = 0 - new Date().getTimezoneOffset();
  const timezoneOffsetSign = timezoneOffset >= 0 ? "+" : "-";
  const timezoneOffsetHours = String(
    Math.floor(Math.abs(timezoneOffset) / 60)
  ).padStart(2, "0");
  const timezoneOffsetMinutes = String(Math.abs(timezoneOffset) % 60).padStart(
    2,
    "0"
  );
  const timezone =
    timezoneOffsetSign + timezoneOffsetHours + ":" + timezoneOffsetMinutes;

  thElements[2].textContent = `Date (UTC${timezone})`;

  thElements.forEach((td) => {
    trElement.appendChild(td);
  });
  trElement.classList.add("border-bottom");
  scoreTable.appendChild(trElement);
}

function updateData() {
  const keys = ["mode", "difficulty", "period", "crashes", "seed", "week"];
  const values = keys.map((id) => getFormData(id));

  let data = keys.reduce((obj, key, index) => {
    obj[key] = values[index];
    return obj;
  }, {});

  if (!validateSeed(data["seed"])) {
    delete data["seed"];
  }
  let searchParm = new URLSearchParams(Object.entries(data));
  if (parm == searchParm.toString()) {
    return;
  }
  parm = searchParm.toString();
  resetTable();

  document.getElementById("dummy").classList.remove("no-display");

  fetch(`${proxyUrl}?${searchParm.toString()}`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      putTableData(data)
    });
}

function createScoreTable(rank, players, date, score, seed, id, build) {
  let trElement = document.createElement("tr");
  let tdElements = Array.from(range(7), () => document.createElement("td"));

  tdElements[0].textContent = rank;
  tdElements[2].textContent = formatDate(new Date(date));
  tdElements[3].textContent = score;
  tdElements[4].textContent = seed;
  tdElements[6].textContent = build;

  tdElements[4].classList.add("roboto-mono", "data-seed");
  tdElements[4].addEventListener("click", setSeed);

  players.forEach((player) => {
    let playerElement = document.createElement("div");
    playerElement.classList.add("player");
    playerElement.classList.add("player-" + player["userid"].split("_")[0]);
    playerElement.textContent = player["name"];
    tdElements[1].appendChild(playerElement);
  });

  let idElement = document.createElement("a");
  idElement.setAttribute(
    "href",
    `https://unrailed-online.com/getReplayFile?id=${id}`
  );
  idElement.setAttribute("target", "_blank");
  idElement.textContent = id;
  tdElements[5].appendChild(idElement);

  tdElements.forEach((td) => {
    trElement.appendChild(td);
  });

  return trElement;
}

function getFormData(id) {
  return document.getElementById(id).value;
}

function putTableData(data) {
  resetTable();
  document.getElementById("dummy").classList.add("no-display");
  let scoreTable = document.getElementById("score-table");

  for (let i in data) {
    let scoreTableRow = createScoreTable(
      parseInt(i) + 1,
      data[i]["players"],
      data[i]["date"],
      data[i]["score"],
      data[i]["seedString"],
      data[i]["_id"],
      data[i]["build"]
    );
    scoreTableRow.classList.add("border-bottom");
    scoreTable.appendChild(scoreTableRow);
  }
}

window.onload = () => {
  ["mode", "difficulty", "period", "crashes", "week"].forEach((id) =>
    document.getElementById(id).addEventListener("change", updateData)
  );
  document.getElementById("seed").addEventListener("input", seedInput);
  updateData();
};
