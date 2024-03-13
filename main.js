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
  const seed = this.textContent;
  document.getElementById("seed").value = seed;
  seedInput();
}

function setUserid() {
  document.getElementById("userid").value = this.getAttribute("data-id");
  useridInput();
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
    const seed = document.getElementById("seed").value;
    const difficultyPatterns = [
      {"pattern": /^.{5}[AQgw]/, "difficulty": "0"},
      {"pattern": /^.{5}[CSiy]/, "difficulty": "1"},
      {"pattern": /^.{5}[EUk0]/, "difficulty": "2"},
      {"pattern": /^.{5}[GWm2]/, "difficulty": "3"},
      {"pattern": /^.{5}[IYo4]/, "difficulty": "4"},
    ]
    const modePatterns = [
      {"pattern": /^.{6}s/, "mode": "11"},
      {"pattern": /^.{6}U/, "mode": "5"},
      {"pattern": /^.{6}E/, "mode": "1"},
      {"pattern": /^.{6}Y/, "mode": "6"},
      {"pattern": /^.{6}g/, "mode": "8"},
      {"pattern": /^.{6}I/, "mode": "2"},
    ]
    difficultyPatterns.forEach((pattern)=>{
      if(pattern["pattern"].test(seed)){
        document.getElementById("difficulty").value = pattern["difficulty"];
      }
    });
    modePatterns.forEach((pattern)=>{
      if(pattern["pattern"].test(seed)){
        document.getElementById("mode").value = pattern["mode"];
      }
    });
    input.classList.add("is-valid");
  } else {
    input.classList.add("is-invalid");
  }
  updateData();
}

function useridInput() {
  const input = document.getElementById("userid");
  input.classList.remove("is-valid", "is-invalid");
  if (input.value) {
    input.classList.add("is-valid");
  } else {
    input.classList.add("is-invalid");
  }
  updateData();
}

function checkIfValidData() {
  (() => {
    const input = document.getElementById("seed");
    const isValid = validateSeed(input.value);
    input.classList.remove("is-valid", "is-invalid");
    if (isValid) {
      input.classList.add("is-valid");
    } else {
      input.classList.add("is-invalid");
    }
  })();
  (() => {
    const input = document.getElementById("userid");
    input.classList.remove("is-valid", "is-invalid");
    if (input.value) {
      input.classList.add("is-valid");
    } else {
      input.classList.add("is-invalid");
    }
  })();
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
  const keys = [
    "mode",
    "difficulty",
    "period",
    "crashes",
    "seed",
    "week",
    "userid",
  ];
  const values = keys.map((id) => getFormData(id));

  let data = keys.reduce((obj, key, index) => {
    obj[key] = values[index];
    return obj;
  }, {});

  if (!validateSeed(data["seed"])) {
    delete data["seed"];
  }
  if (!data["userid"]) {
    delete data["userid"];
  } else {
    data["personalOnly"] = true;
  }

  let searchParm = new URLSearchParams(Object.entries(data));
  if (parm == searchParm.toString()) {
    return;
  }
  parm = searchParm.toString();

  if (`${searchParm}`) {
    const url = `${location.origin}${location.pathname}?${searchParm}`;
    history.replaceState(null, "", url);
  } else {
    const url = `${location.origin}${location.pathname}`;
    history.replaceState(null, "", url);
  }
  resetTable();

  document.getElementById("dummy").classList.remove("no-display");

  fetch(`${proxyUrl}?${searchParm.toString()}`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      putTableData(data);
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
    playerElement.setAttribute("data-id", player["userid"]);
    playerElement.textContent = player["name"];
    playerElement.addEventListener("click", setUserid);
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
  document.getElementById("userid").addEventListener("input", useridInput);

  for (let [key, value] of new URLSearchParams(location.search)) {
    let inputElement = document.getElementById(key);
    if (
      inputElement != null &&
      inputElement.classList.contains("search-input")
    ) {
      inputElement.value = value;
    }
  }

  checkIfValidData();
  updateData();
};
