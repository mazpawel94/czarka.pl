$("#date").dateDropper();

const calendar = document.querySelector("#date");
const calendarPage = document.getElementById("datedropper-0");
const newReservation = document.querySelector(".reservation");
const selectTable = newReservation.querySelector("#select-table");
const selectHour = newReservation.querySelector("#select-hour");
const topDistance = 40;
let active = false;
let ofX, ofY;

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth();
const day = date.getDate();
const today = `0${month + 1}/${day}/${year}`.toString();
console.log(today, calendar.value);
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
const reservations = [];
function activeReservation(e) {
  if (!e.target.classList.contains("reservation")) return;
  console.log("activereserv");
  newReservation.style.backgroundImage =
    "linear-gradient( 135deg, #81FBB8 10%, #28C76F 100%)";
  active = true;
  newReservation.style.backgroundColor = "green";
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
  newReservation.style.left = `${50 +
    Math.floor((parseInt(newReservation.style.left) + 60) / 150) * 150}px`;
  newReservation.style.top = `${topDistance +
    Math.floor(parseInt(newReservation.style.top + 15) / 50) * 50}px`;
  newReservation.style.backgroundColor = "rgb(180, 190, 39)";
  selectTable.value = getTableByDistance(
    tableDistance,
    parseInt(newReservation.style.left) - 50
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

const createReservationFromBase = (table, hour, name) => {
  const distance = hour.split(":")[0] - 10;
  const reservationDiv = document.createElement("div");
  reservationDiv.classList.add("reservation");
  reservationDiv.innerHTML = newReservation.innerHTML;
  reservationDiv.querySelector("#select-table").value = table;
  reservationDiv.querySelector("#select-hour").value = hour;
  reservationDiv.querySelector("input").value = name;
  reservationDiv.style.left = `${tableDistance[table] + 50}px`;
  reservationDiv.style.top = `${topDistance +
    hour.split(":")[1] * (5 / 6) +
    distance * 50}px`;
  document.body.appendChild(reservationDiv);
};

const showDaylyReservations = () => {
  const day = calendar.value;
  console.log("dzen", day);
  [...document.querySelectorAll(".reservation")]
    .filter(e => !e.classList.contains("new"))
    .forEach(e => e.remove());
  reservations.forEach(reservation => {
    if (reservation.date == day)
      createReservationFromBase(
        reservation.table,
        reservation.hour,
        reservation.name
      );
  });
};

newReservation.addEventListener("mousedown", activeReservation);
document.addEventListener("mousemove", dragReservation);
document.addEventListener("mouseup", putReservation);
selectTable.addEventListener(
  "change",
  e => (newReservation.style.left = `${tableDistance[e.target.value] + 50}px`)
);
selectHour.addEventListener("change", changePositionByHour);

let xhr = new XMLHttpRequest();
xhr.open("GET", getAdress, true);
xhr.addEventListener("load", function() {
  const date = JSON.parse(this.responseText);
  [...date].forEach(e => reservations.push(e));
  showDaylyReservations(today);
});
xhr.send();

document.querySelector(".save").addEventListener("click", () => {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", postAdress, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.addEventListener("load", function() {
    console.log("odpowiedź:", this.status);
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
