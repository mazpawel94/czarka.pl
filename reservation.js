$('#date').dateDropper();
$("#time").timeDropper();
const inputDate = document.getElementById('date');
const inputHour = document.getElementById('time');
const today = new Date().toJSON().slice(0, 10);
const actualTime = new Date().toJSON().slice(11, 16);
const calendarPage = document.getElementById('datedropper-0');
const clock = document.querySelector('.td-clock');
const dateFromBase = document.querySelector('.dateFromBase');
const minutesToAround = document.querySelectorAll('.td-time>span')[1];
const rotateClock = document.querySelector('.td-n');


const reservation = [];

function compareHours(pickedHour, elementHour) {
    let pickedMinutes = Number(pickedHour.slice(0,2))*60 + Number(pickedHour.slice(3,5));
    let elementMinutes = Number(elementHour.slice(0,2))*60 + Number(elementHour.slice(3,5));
    if(pickedMinutes<elementMinutes || pickedMinutes>(elementMinutes + 180))
        return false;
    else
        return true;
}

function endReservation(startReservation) {
    const end = Number(startReservation.slice(0,2))+3;
    return end+startReservation.slice(2,);
}

function setFreeTables() {
    $('.table').removeClass('busy');
    $('.table').removeClass('busySoon');
}

function addThreeHours(hours) {
    let trueHour = Number(hours.slice(0,2));
    let minutes =hours.slice(3,5);
    let newHour = trueHour+3;
    if (newHour<10)
        newHour = `0${newHour}`;
    return `${newHour}:${minutes}`;
}

function aroundMinutes() {
    if(minutesToAround.classList.contains('on')) {
        let n =Math.round((minutesToAround.innerHTML)/15)*15;
        console.log(n);
        let radius = n*6;
        rotateClock.style.transform = `rotate(${radius}deg)`;
       
        if(n<15 || n==60)
        {
            inputHour.value = `${inputHour.value.slice(0,3)}00`;
            minutesToAround.innerHTML =`00`;
            minutesToAround.setAttribute('data-id', '00');
        }
           
        else {
            inputHour.value = `${inputHour.value.slice(0,3)}${n}`;
            minutesToAround.innerHTML =n;
            minutesToAround.setAttribute('data-id', n);
        }
          
    }

}

function showReservation() {
    setFreeTables();
    let pickedDay = inputDate.value;
    let pickedHour = inputHour.value;
    if(pickedHour.length <= 4)
        pickedHour=`0${pickedHour}`;
    let i = 1;
    reservation.forEach(element => {
        if(element.date == pickedDay && compareHours(pickedHour, element.hour))
            {
                const reserve = element.table;
                $(`.${reserve}`).addClass('busy')
                .attr('data-busy', `Rezerwacja \ ${element.hour} - ${endReservation(element.hour)}`);
            }
        else if(element.date == pickedDay && compareHours(addThreeHours(pickedHour), element.hour))
            {
                const reserve = element.table;
                $(`.${reserve}`).addClass('busySoon')
                .attr('data-busy-soon', ` Najbliższa rezerwacja \ ${element.hour}`);
            }
        })
}
showReservation();
calendarPage.addEventListener('click', showReservation);
clock.addEventListener('click', showReservation);
clock.addEventListener('click', aroundMinutes);
clock.addEventListener('touchmove', showReservation);

let xhr = new XMLHttpRequest();
xhr.open(
    "GET",
    "https://czarka-api.herokuapp.com/reservations",
    true
  );
xhr.addEventListener("load", function() {
    const date = JSON.parse(this.responseText);
    console.log(reservation);
    [...date].forEach(e => reservation.push(e));
    console.log(reservation);
});

xhr.send();