$("#date").dateDropper();

const calendar = document.querySelector("#date");
const calendarPage = document.getElementById("datedropper-0");
const newReservation = document.querySelector(".reservation");
const selectTable = newReservation.querySelector("#select-table");
const selectHour = newReservation.querySelector("#select-hour");
const tablesScheme = document.querySelector(".tables");
const topDistance = tablesScheme.offsetTop + tablesScheme.clientHeight;
const leftDistance = document.querySelector(".hours").offsetLeft;
let active = false;
let ofX, ofY;
const reservations = [];

const tableDistance = {
  leftRattan: 0,
  rightRattan: 150,
  bigIndian: 300,
  smallIndian: 450,
  japanese: 600,
  leftChinese: 750,
  rightChinese: 900,
  board: 1050,
  base: 1200
};

function activeReservation(e) {
  if (!e.target.classList.contains("reservation")) return;
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
  newReservation.style.left = `${leftDistance +
    Math.floor(
      (parseInt(newReservation.style.left) - leftDistance + 60) / 150
    ) *
      150}px`;
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
}

const getTableByDistance = (tables, value) =>
  Object.keys(tables).find(key => tables[key] === value);

function changePositionByHour(e) {
  const distance = e.target.value.split(":")[0] - 10;
  newReservation.style.top = `${topDistance +
    e.target.value.split(":")[1] * (5 / 6) +
    distance * 50}px`;
}

const createReservationFromBase = reservation => {
  const distance = reservation.hour.split(":")[0] - 10;
  const reservationDiv = document.createElement("div");
  reservationDiv.classList.add("reservation");
  reservationDiv.innerHTML = newReservation.innerHTML;
  const deleteDiv = document.createElement("div");
  deleteDiv.classList.add("delete");
  deleteDiv.classList.add("hidden");
  reservationDiv.appendChild(deleteDiv);
  reservationDiv.querySelector("#select-table").value = reservation.table;
  reservationDiv.querySelector("#select-hour").value = reservation.hour;
  reservationDiv.querySelector("input").value = reservation.name;
  reservationDiv.style.left = `${tableDistance[reservation.table] +
    leftDistance}px`;
  reservationDiv.style.top = `${topDistance +
    reservation.hour.split(":")[1] * (5 / 6) +
    distance * 50}px`;
  reservationDiv.dataset.id = reservation._id;
  document.body.appendChild(reservationDiv);
};

const showDaylyReservations = () => {
  const day = calendar.value;
  [...document.querySelectorAll(".reservation")]
    .filter(e => !e.classList.contains("new"))
    .forEach(e => e.remove());
  reservations.forEach(reservation => {
    if (reservation.date == day) createReservationFromBase(reservation);
  });
};

newReservation.addEventListener("mousedown", activeReservation);
document.addEventListener("mousemove", dragReservation);
document.addEventListener("mouseup", putReservation);
selectTable.addEventListener(
  "change",
  e =>
    (newReservation.style.left = `${tableDistance[e.target.value] +
      leftDistance}px`)
);
selectHour.addEventListener("change", changePositionByHour);

let xhr = new XMLHttpRequest();
xhr.open("GET", getAdress, true);
xhr.addEventListener("load", function() {
  const date = JSON.parse(this.responseText);
  [...date].forEach(e => reservations.push(e));
  showDaylyReservations(calendar.value);
  document.querySelector(".loader").remove();
});
xhr.send();

document.querySelector(".save").addEventListener("click", () => {
  let xhr = new XMLHttpRequest();
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

calendarPage.addEventListener("click", showDaylyReservations);

const deleteReservation = id => {
  let xhr = new XMLHttpRequest();
  xhr.open("DELETE", getAdress, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.addEventListener("load", function() {
    location.reload();
  });
  xhr.send(`{ "id": "${id}"}`);
};
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("delete")) {
    deleteReservation(e.target.parentNode.dataset.id);
  }
});

document.querySelector(".unlock-delete").addEventListener("click", () => {
  document
    .querySelectorAll(".delete")
    .forEach(e => e.classList.toggle("hidden"));
});
