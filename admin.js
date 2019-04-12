$("#date").dateDropper();

const calendar = document.querySelector("#date");
const calendarPage = document.getElementById("datedropper-0");
const newReservation = document.querySelector(".reservation");
const selectTable = newReservation.querySelector("#select-table");
const selectHour = newReservation.querySelector("#select-hour");
const name = newReservation.querySelector("input");
const tablesScheme = document.querySelector(".tables");
const reservationDivs = document.getElementsByClassName("reservation");
const saveButton = document.querySelector(".save");
let active = false;
let ofX, ofY, topDistance, leftDistance, hourWidth, hourHeight;
const reservations = [];
const tableDistance = {
  leftRattan: 0,
  rightRattan: hourWidth,
  bigIndian: hourWidth * 2,
  smallIndian: hourWidth * 3,
  japanese: hourWidth * 4,
  leftChinese: hourWidth * 5,
  rightChinese: hourWidth * 6,
  board: hourWidth * 7,
  base: hourWidth * 8
};

const getTableByDistance = value =>
  Object.keys(tableDistance).find(key => tableDistance[key] === value);

const changePositionByHour = hour => {
  const separateHour = hour.split(":");
  const distance = separateHour[0] - 10; //10 - pierwsza godzina, na którą można robić rezerwacje
  return `${topDistance + separateHour[1] * (5 / 6) + distance * hourHeight}px`;
};

const setSize = () => {
  [...tablesScheme.querySelectorAll(".table")].forEach(
    e => (e.style.width = `${Math.floor((window.innerWidth * 0.85) / 9)}px`)
  );
  document.querySelector(".hours").style.width = `${Math.floor(
    (window.innerWidth * 0.85) / 9
  ) * 9}px`;
  document.querySelector(".hours").style.height = `${Math.floor(
    (window.innerHeight * 0.8 - document.querySelector(".table").clientHeight) /
      11
  ) * 11}px`;
  topDistance = document.querySelector(".hour").offsetTop;
  leftDistance = document.querySelector(".hours").offsetLeft;
  hourWidth = document.querySelector(".table").clientWidth;
  hourHeight = document.querySelector(".hour").clientHeight;
  Object.keys(tableDistance).forEach(
    (key, index) => (tableDistance[key] = hourWidth * index)
  );
  [...reservationDivs].forEach(reservation => {
    reservation.style.width = `${hourWidth}px`;
    reservation.style.height = `${hourHeight * 3}px`;
    reservation.style.left = `${leftDistance +
      tableDistance[reservation.querySelector("#select-table").value]}px`;
    reservation.style.top = changePositionByHour(
      reservation.querySelector("#select-hour").value
    );
  });
};
setSize();
newReservation.style.top = "calc(50% - 50px)";
newReservation.style.left = 0;
const xhr = new XMLHttpRequest();
xhr.open("GET", fullAdres, true);
xhr.addEventListener("load", function() {
  const date = JSON.parse(this.responseText);
  [...date].forEach(e => reservations.push(e));
  showDaylyReservations(calendar.value);
  document.querySelector(".loader").remove();
});
xhr.send();

function activeReservation(e) {
  if (
    !e.target.parentNode.classList.contains("reservation") ||
    e.target.nodeName === "INPUT"
  )
    return;
  newReservation.style.width = `${hourWidth}px`;
  newReservation.style.height = `${hourHeight * 3}px`;
  active = true;
  ofX = e.offsetX;
  ofY = e.offsetY + 30; //30px - wysokość inputa rezerwacji
}

function dragReservation(e) {
  if (!active) return;
  newReservation.style.left = `${e.clientX - ofX}px`;
  newReservation.style.top = `${e.clientY - ofY}px`;
}

function putReservation(e) {
  active = false;
  if (
    !e.target.parentNode.classList.contains("reservation") ||
    e.target.nodeName === "INPUT"
  )
    return;
  setNewReservationValue();
}

const setNewReservationValue = () => {
  //zaokrąglamy left i top, tak by rezerwacja mieściła się w konretnej komórce
  newReservation.style.left = `${leftDistance +
    Math.floor(
      (parseInt(newReservation.style.left) - leftDistance + hourWidth / 2) /
        hourWidth
    ) *
      hourWidth}px`;
  newReservation.style.top = `${topDistance +
    Math.floor(
      (parseInt(newReservation.style.top) - topDistance) / hourHeight
    ) *
      hourHeight}px`;
  newReservation.style.backgroundColor = "rgb(180, 190, 39)";
  selectTable.value = getTableByDistance(
    parseInt(newReservation.style.left) - leftDistance
  );
  selectHour.value = `${(parseInt(newReservation.style.top) - topDistance) /
    hourHeight +
    10}:00`;
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
  reservationDiv.querySelector("#select-guests").value = reservation.guests;
  reservationDiv.querySelector("input").value = reservation.name;
  reservationDiv.style.left = `${tableDistance[reservation.table] +
    leftDistance}px`;
  reservationDiv.style.top = changePositionByHour(reservation.hour);
  reservationDiv.style.width = `${hourWidth}px`;
  reservationDiv.style.height = `${hourHeight * 3}px`;
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

const showSaveButton = () => {
  if (selectHour.value && selectTable.value && name.value)
    saveButton.classList.remove("hidden");
  else saveButton.classList.add("hidden");
};
const saveNewReservation = () => {
  if (!selectTable.value || !selectHour.value) return;
  const xhr = new XMLHttpRequest();
  xhr.open("POST", fullAdres, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.addEventListener("load", function() {
    location.reload();
  });
  xhr.send(`{ "day": "${calendar.value}",
              "hour": "${selectHour.value}",
              "name": "${name.value}",
              "table":"${selectTable.value}",
              "guests": "${
                newReservation.querySelector("#select-guests").value
              }"
            }`);
};

const deleteReservation = id => {
  const xhr = new XMLHttpRequest();
  xhr.open("DELETE", fullAdres, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.addEventListener("load", function() {
    location.reload();
  });
  xhr.send(`{ "id": "${id}"}`);
};

const changeReservation = reservation => {
  const xhr = new XMLHttpRequest();
  xhr.open("PUT", fullAdres, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.addEventListener("load", function() {
    location.reload();
  });
  xhr.send(`{ "id": "${reservation.dataset.id}",
              "day": "${calendar.value}",
              "hour": "${reservation.querySelector("#select-hour").value}",
              "name": "${reservation.querySelector("input").value}",
              "table":"${reservation.querySelector("#select-table").value}",
              "guests": "${reservation.querySelector("#select-guests").value}"
            }`);
};

saveButton.addEventListener("click", saveNewReservation);
calendarPage.addEventListener("click", showDaylyReservations);
newReservation.addEventListener("mousedown", activeReservation);
document.addEventListener("mousemove", dragReservation);
document.addEventListener("mouseup", putReservation);

//zmiana pozycji nowej rezerwacji poprzez wybór z listy
selectTable.addEventListener("change", e => {
  newReservation.style.left = `${tableDistance[e.target.value] +
    leftDistance}px`;
  showSaveButton();
});
selectHour.addEventListener("change", e => {
  newReservation.style.top = changePositionByHour(e.target.value);
  showSaveButton();
});

//delegacja zdarzeń - nasłuchiwanie na usunięcie rezerwacji lub jej zmianę
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("delete")) {
    deleteReservation(e.target.parentNode.dataset.id);
  }
  if (e.target.classList.contains("diskette")) {
    changeReservation(e.target.parentNode);
  }
});

//oznaczanie rezerwacji jako położona - zapis w local storage
document.addEventListener("dblclick", function(e) {
  if (e.target.classList.contains("select-wrapper")) {
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
  saveButton.classList.add("hidden");
});

const add15Minutes = () => {
  if (parseInt(selectHour.value.split(":")[0]) >= 21) return;
  if (!selectHour.value) {
    selectHour.value = "14:00";
    newReservation.style.top = changePositionByHour(selectHour.value);
  }
  newReservation.style.top = `${parseFloat(newReservation.style.top) +
    hourHeight / 4}px`;
  const hourSeparate = selectHour.value.split(":");
  if (hourSeparate[1] == 45)
    selectHour.value = `${parseInt(hourSeparate[0]) + 1}:00`;
  else
    selectHour.value = `${hourSeparate[0]}:${parseInt(hourSeparate[1]) + 15}`;
};

const substract15Minutes = () => {
  if (selectHour.value === "10:00") return;
  if (!selectHour.value) {
    selectHour.value = "14:00";
    newReservation.style.top = changePositionByHour(selectHour.value);
  }
  newReservation.style.top = `${parseFloat(newReservation.style.top) -
    hourHeight / 4}px`;
  const hourSeparate = selectHour.value.split(":");
  if (hourSeparate[1] === "00")
    selectHour.value = `${parseInt(hourSeparate[0]) - 1}:45`;
  else {
    let minutes = parseInt(hourSeparate[1]) - 15;
    if (!minutes) minutes = "00";
    selectHour.value = `${parseInt(hourSeparate[0])}:${minutes}`;
  }
};

const goToLeft = () => {
  if (selectTable.value === "leftRattan") return;
  newReservation.style.left = `${parseInt(newReservation.style.left) -
    hourWidth}px`;
  selectTable.value = getTableByDistance(
    parseInt(newReservation.style.left) - leftDistance
  );
};

const goToRight = () => {
  if (selectTable.value === "base") return;
  if (!selectTable.value) {
    selectTable.value = "leftRattan";
    newReservation.style.left = `${leftDistance +
      tableDistance[selectTable.value]}px`;
    return;
  }
  newReservation.style.left = `${parseInt(newReservation.style.left) +
    hourWidth}px`;
  selectTable.value = getTableByDistance(
    parseInt(newReservation.style.left) - leftDistance
  );
};

document.addEventListener("keydown", e => {
  showSaveButton();
  if (e.keyCode === 40) add15Minutes();
  if (e.keyCode === 38) substract15Minutes();
  if (e.keyCode === 37) goToLeft();
  if (e.keyCode === 39) goToRight();
  if (e.keyCode === 13) saveNewReservation();
});

window.addEventListener("resize", setSize);
