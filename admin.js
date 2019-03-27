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
    newReservation.style.backgroundColor = 'rgb(180, 190, 39)';
});