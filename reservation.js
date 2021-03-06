$("#date").dateDropper();
$("#time").timeDropper();

const inputDate = document.getElementById("date");
const inputHour = document.getElementById("time");
const today = new Date().toJSON().slice(0, 10);
const actualTime = new Date().toJSON().slice(11, 16);
const calendarPage = document.getElementById("datedropper-0");
const clock = document.querySelector(".td-clock");
const minutesToAround = document.querySelectorAll(".td-time>span")[1];
const rotateClock = document.querySelector(".td-n");
const tables = document.querySelectorAll(".table");

let reservations = [];

const compareHours = (pickedHour, elementHour) => {
  const pickedMinutes =
    parseInt(pickedHour.slice(0, 2)) * 60 + parseInt(pickedHour.slice(3, 5));
  const elementMinutes =
    parseInt(elementHour.slice(0, 2)) * 60 + parseInt(elementHour.slice(3, 5));
  if (pickedMinutes < elementMinutes || pickedMinutes > elementMinutes + 180)
    return false;
  return true;
};

const compareDate = (a, b) => {
  const date1Array = a.date.split('/');
  const hour1Array = a.hour.split(":");
  const date2Array = b.date.split('/');
  const hour2Array = b.hour.split(':');
  const date1 = new Date(parseInt(date1Array[2]), parseInt(date1Array[1]) - 1, parseInt(date1Array[0]), parseInt(hour1Array[0]), parseInt(hour1Array[1])).getTime();
  const date2 = new Date(parseInt(date2Array[2]), parseInt(date2Array[1]) - 1, parseInt(date2Array[0]), parseInt(hour2Array[0]), parseInt(hour2Array[1])).getTime();
  if (date1 < date2) return -1;
  if (date1 > date2) return 1;
  return 0;
}

const endReservation = startReservation => {
  let end = parseInt(startReservation.slice(0, 2)) + 3;
  if (end >= 22) return "22:00";
  return end + startReservation.slice(2);
};

const setFreeTables = () =>
  [...tables].forEach(table => table.classList.remove("busy", "busy-soon"));

const addThreeHours = hours => {
  const trueHour = parseInt(hours.slice(0, 2));
  const minutes = hours.slice(3, 5);
  let newHour = trueHour + 3;
  if (newHour < 10) newHour = `0${newHour}`;
  return `${newHour}:${minutes}`;
};

const aroundMinutes = () => {
  if (!minutesToAround.classList.contains("on")) return;
  const n = Math.round(minutesToAround.innerHTML / 15) * 15;
  const radius = n * 6;
  rotateClock.style.transform = `rotate(${radius}deg)`;
  if (n < 15 || n == 60) {
    inputHour.value = `${inputHour.value.slice(0, 3)}00`;
    minutesToAround.innerHTML = `00`;
    minutesToAround.setAttribute("data-id", "00");
  } else {
    inputHour.value = `${inputHour.value.slice(0, 3)}${n}`;
    minutesToAround.innerHTML = n;
    minutesToAround.setAttribute("data-id", n);
  }
};

function showReservation() {
  setFreeTables();
  const pickedDay = inputDate.value;
  let pickedHour = inputHour.value;
  if (pickedHour.length <= 4) pickedHour = `0${pickedHour}`;
  reservations.forEach(reservation => {
    if (
      reservation.date == pickedDay &&
      compareHours(pickedHour, reservation.hour)
    ) {
      const table = document.querySelector(`.${reservation.table}`);
      table.classList.add("busy");
      table.dataset.busy = `Rezerwacja \ ${reservation.hour} - ${endReservation(
        reservation.hour
      )}`;
    } else if (
      reservation.date == pickedDay &&
      compareHours(addThreeHours(pickedHour), reservation.hour)
    ) {
      const table = document.querySelector(`.${reservation.table}`);
      if (table.classList.contains("busy") || table.classList.contains("busy-soon")) return;
      table.classList.add("busy-soon");
      table.dataset.busySoon = ` Najbliższa rezerwacja \ ${reservation.hour}`;
    }
  });
}
calendarPage.addEventListener("click", showReservation);
clock.addEventListener("click", showReservation);
clock.addEventListener("click", aroundMinutes);
clock.addEventListener("touchmove", showReservation);

let xhr = new XMLHttpRequest();
xhr.open("GET", "https://czarka-api.herokuapp.com/reservations", true);
xhr.addEventListener("load", function () {
  const date = JSON.parse(this.responseText);
  [...date].forEach(e => reservations.push(e));
  reservations.sort(compareDate);
  showReservation();
  [...document.querySelector(".loader").querySelectorAll("div")].forEach(
    e => (e.style.animationPlayState = "paused")
  );
  document.querySelector(".loader").style.display = "none";
});

xhr.send();

