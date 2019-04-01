$("#date").dateDropper();

const calendar = document.querySelector("#date");
const calendarPage = document.getElementById("datedropper-0");
const newReservation = document.querySelector(".reservation");
const selectTable = newReservation.querySelector("#select-table");
const selectHour = newReservation.querySelector("#select-hour");
const tablesScheme = document.querySelector(".tables");

const topDistance = tablesScheme.offsetTop + tablesScheme.clientHeight;
const leftDistance = document.querySelector(".hours").offsetLeft;
let hourWidth = document.querySelector(".table").clientWidth;
console.log('hourWidth:', hourWidth);

let active = false;
let ofX, ofY;
const reservations = [];

const tableDistance = {
  leftRattan: 0,
  rightRattan: hourWidth,
  bigIndian: hourWidth*2,
  smallIndian: hourWidth*3,
  japanese: hourWidth*4,
  leftChinese: hourWidth*5,
  rightChinese: hourWidth*6,
  board: hourWidth*7,
  base: hourWidth*8
};

const xhr = new XMLHttpRequest();
xhr.open("GET", getAdress, true);
xhr.addEventListener("load", function() {
  const date = JSON.parse(this.responseText);
  [...date].forEach(e => reservations.push(e));
  showDaylyReservations(calendar.value);
  document.querySelector(".loader").remove();
});
xhr.send();

function activeReservation(e) {
  if (!e.target.classList.contains("reservation")) return;
  newReservation.style.width = `${hourWidth}px`;
  active = true;
  ofX = e.offsetX;
  ofY = e.offsetY;
}

function dragReservation(e) {
  if (!active) return;
  newReservation.style.left = `${e.clientX - ofX}px`;
  newReservation.style.top = `${e.clientY - ofY}px`;
}

function putReservation(e) {
  active = false;
  if (!e.target.classList.contains("reservation")) return;
  setNewReservationValue();
}

const setNewReservationValue = () => {
  //zaokrąglamy left i top, tak by rezerwacja mieściła się w konretnej komórce
  newReservation.style.left = `${leftDistance +
    Math.floor(
      (parseInt(newReservation.style.left) - leftDistance + hourWidth/2) / hourWidth
    ) *
    hourWidth}px`;
  newReservation.style.top = `${topDistance +
    Math.floor((parseInt(newReservation.style.top) - topDistance + 15) / 50) *
      50}px`;
  newReservation.style.backgroundColor = "rgb(180, 190, 39)";
  selectTable.value = getTableByDistance(
    tableDistance,
    parseInt(newReservation.style.left) - leftDistance
  );
  selectHour.value = `${(parseInt(newReservation.style.top) - topDistance) /
    50 +
    10}:00`;
};

const getTableByDistance = (tables, value) => 
   Object.keys(tables).find(key => tables[key] === value);

const changePositionByHour = hour => {
  const separateHour = hour.split(":");
  const distance = separateHour[0] - 10; //10 - pierwsza godzina, na którą można robić rezerwacje
  return `${topDistance + separateHour[1] * (5 / 6) + distance * 50}px`;
};

const createElementInNewDiv = reservationDiv => {
  const deleteDiv = document.createElement("div");
  deleteDiv.classList.add("delete");
  deleteDiv.classList.add("hidden");
  const changeDiv = document.createElement("div");
  changeDiv.classList.add("diskette");
  changeDiv.classList.add("hidden");
  reservationDiv.appendChild(deleteDiv);
  reservationDiv.appendChild(changeDiv);
};

const createReservationFromBase = reservation => {
  const reservationDiv = document.createElement("div");
  reservationDiv.classList.add("reservation");
  reservationDiv.innerHTML = newReservation.innerHTML;
  createElementInNewDiv(reservationDiv);
  reservationDiv.querySelector("#select-table").value = reservation.table;
  reservationDiv.querySelector("#select-hour").value = reservation.hour;
  reservationDiv.querySelector("input").value = reservation.name;
  reservationDiv.style.left = `${tableDistance[reservation.table] +
    leftDistance}px`;
  reservationDiv.style.top = changePositionByHour(reservation.hour);
  reservationDiv.style.width = `${hourWidth}px`;
  reservationDiv.dataset.id = reservation._id;
  if (localStorage.getItem(reservationDiv.dataset.id) === "true")
    reservationDiv.classList.add("put");
  document.body.appendChild(reservationDiv);
};

const showDaylyReservations = () => {
  const day = calendar.value;
  [...document.querySelectorAll(".reservation")]
    .filter(e => !e.classList.contains("new"))
    .forEach(e => e.remove());
  reservations.forEach(reservation => {
    if (reservation.date === day) createReservationFromBase(reservation);
  });
};

document.querySelector(".save").addEventListener("click", () => {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", postAdress, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.addEventListener("load", function() {
    location.reload();
  });
  xhr.send(`{ "day": "${calendar.value}",
              "hour": "${selectHour.value}",
              "name": "${newReservation.querySelector("input").value}",
              "table":"${selectTable.value}",
              "numberPeople": 2
            }`);
});

const deleteReservation = id => {
  const xhr = new XMLHttpRequest();
  xhr.open("DELETE", getAdress, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.addEventListener("load", function() {
    location.reload();
  });
  xhr.send(`{ "id": "${id}"}`);
};

const changeReservation = reservation => {
  const xhr = new XMLHttpRequest();
  xhr.open("PUT", getAdress, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.addEventListener("load", function() {
    location.reload();
  });
  xhr.send(`{ "id": "${reservation.dataset.id}",
              "day": "${calendar.value}",
              "hour": "${reservation.querySelector("#select-hour").value}",
              "name": "${reservation.querySelector("input").value}",
              "table":"${reservation.querySelector("#select-table").value}"
            }`);
};

calendarPage.addEventListener("click", showDaylyReservations);
newReservation.addEventListener("mousedown", activeReservation);
document.addEventListener("mousemove", dragReservation);
document.addEventListener("mouseup", putReservation);
selectTable.addEventListener(
  "change",
  e =>
    (newReservation.style.left = `${tableDistance[e.target.value] +
      leftDistance}px`)
);
selectHour.addEventListener(
  "change",
  e => (newReservation.style.top = changePositionByHour(e.target.value))
);
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("delete")) {
    deleteReservation(e.target.parentNode.dataset.id);
  }
  if (e.target.classList.contains("diskette")) {
    changeReservation(e.target.parentNode);
  }
});

document.addEventListener("dblclick", function(e) {
  if (e.target.classList.contains("reservation")) {
    e.target.classList.toggle("put");
    localStorage.setItem(
      e.target.dataset.id,
      e.target.classList.contains("put")
    );
  }
});
document.querySelector(".unlock-delete").addEventListener("click", () => {
  document
    .querySelectorAll(".delete")
    .forEach(e => e.classList.toggle("hidden"));
});

document.querySelector(".unlock-change").addEventListener("click", () => {
  document
    .querySelectorAll(".diskette")
    .forEach(e => e.classList.toggle("hidden"));
});

const add15Minutes = () => {
  newReservation.style.top = `${parseFloat(newReservation.style.top) +
    50 / 4}px`;
  const hourSeparate = selectHour.value.split(":");
  if (hourSeparate[1] == 45)
    selectHour.value = `${parseInt(hourSeparate[0]) + 1}:00`;
  else
    selectHour.value = `${hourSeparate[0]}:${parseInt(hourSeparate[1]) + 15}`;
};

const substract15Minutes = () => {
  newReservation.style.top = `${parseFloat(newReservation.style.top) -
    50 / 4}px`;
  const hourSeparate = selectHour.value.split(":");
  console.log(hourSeparate);
  if (hourSeparate[1] === "00")
    selectHour.value = `${parseInt(hourSeparate[0]) - 1}:45`;
  else {
    let minutes = parseInt(hourSeparate[1]) - 15;
    if (!minutes) minutes = "00";
    selectHour.value = `${parseInt(hourSeparate[0])}:${minutes}`;
  }
};

document.addEventListener("keydown", e => {
  if (e.keyCode === 40) add15Minutes();
  if (e.keyCode === 38) substract15Minutes();
});
