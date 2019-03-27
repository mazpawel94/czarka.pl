const newReservation = document.querySelector('.reservation');
let active = false;
let ofX, ofY;
function activeReservation (e) {
active = true;
newReservation.style.backgroundColor = 'green';
console.log(e.offsetX, e.offsetY);
ofX=e.offsetX;
ofY=e.offsetY;
}

function dragReservation (e) {
    if(!active) return;

    console.log(newReservation.style.left, ofX);

newReservation.style.left =`${e.clientX - ofX}px`;
newReservation.style.top =`${e.clientY - ofY}px`;
    
}
newReservation.addEventListener('mousedown', activeReservation);

document.addEventListener('mousemove', dragReservation);
document.addEventListener('mouseup', () => 
{
    active = false;
    newReservation.style.left =`${Math.floor((parseInt(newReservation.style.left) + 60)/150)*150}px`;
    newReservation.style.top =`${40 + Math.floor(parseInt((newReservation.style.top) + 15)/50)*50}px`;
    newReservation.style.backgroundColor = 'rgb(180, 190, 39)';
});