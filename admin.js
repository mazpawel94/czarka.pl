const newReservation = document.querySelector('.reservation');
const selectTable = document.querySelector('#select-table');
const selectHour = document.querySelector('#select-hour');
const topDistance = 40;
let active = false;
let ofX, ofY;

const tableDistance = {
    japanese: 0,
    smallIndian: 150,
    bigIndian: 300,
    rightChinese: 450,
    leftChinese: 600,
    base: 750,
    board: 900,
    rightRattan: 1050,
    leftRattan: 1200
};

const reservations = [];
function activeReservation (e) {
if(e.target.nodeName === 'SELECT' || e.target.nodeName === 'INPUT') return;
active = true;
newReservation.style.backgroundColor = 'green';
ofX=e.offsetX;
ofY=e.offsetY;
}

function dragReservation (e) {
if(!active) return;
newReservation.style.left =`${e.clientX - ofX}px`;
newReservation.style.top =`${e.clientY - ofY}px`;
}

function putReservation (e) {
    active = false;
    if(e.target.nodeName === 'SELECT' || e.target.nodeName === 'INPUT') return;
    newReservation.style.left =`${50 + Math.floor((parseInt(newReservation.style.left) + 60)/150)*150}px`;
    newReservation.style.top =`${topDistance + Math.floor(parseInt((newReservation.style.top) + 15)/50)*50}px`;
    newReservation.style.backgroundColor = 'rgb(180, 190, 39)';
    selectTable.value = getTableByDistance(tableDistance, parseInt(newReservation.style.left)-50);
    selectHour.value = `${(parseInt(newReservation.style.top)-topDistance)/50 + 10}:00`;
    console.log(`${(parseInt(newReservation.style.top)-topDistance)/50 + 10}:00`);
}

const getTableByDistance = (tables, value) => 
    Object.keys(tables).find(key => tables[key] === value);
  
function changePositionByHour (e) {
    const distance = (e.target.value).split(':')[0] - 10;
    newReservation.style.top = `${topDistance + (e.target.value).split(':')[1]*(5/6) + distance*50}px`;
} 

const createReservationFromBase = (table, hour) => {
    console.log(table , tableDistance[table],  hour);
    const distance = hour.split(':')[0] - 10;
    const reservationDiv = document.createElement('div');
    reservationDiv.classList.add('reservation');
    reservationDiv.style.left = `${tableDistance[table]+50}px`;
    reservationDiv.style.top = `${topDistance + hour.split(':')[1]*(5/6) + distance*50}px`;
    document.body.appendChild(reservationDiv);
}

newReservation.addEventListener('mousedown', activeReservation);
document.addEventListener('mousemove', dragReservation);
document.addEventListener('mouseup', putReservation);
selectTable.addEventListener('change', (e) => 
    newReservation.style.left = `${tableDistance[e.target.value] + 50}px`);
selectHour.addEventListener('change', changePositionByHour);

let xhr = new XMLHttpRequest();
xhr.open("GET", "https://czarka-api.herokuapp.com/reservations", true);
xhr.addEventListener("load", function() {
  const date = JSON.parse(this.responseText);
  [...date].forEach(e => {
      if(e.date == today) {
        reservations.push(e);
        createReservationFromBase(e.table, e.hour);
      } 

  });
});

xhr.send();
const date = new Date();
const year = date.getFullYear();
const month = date.getMonth();
const day = date.getDate();
console.log(`0${month+1}/${day}/${year}`);
const today = `0${month+1}/${day}/${year}`;