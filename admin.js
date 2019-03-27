const newReservation = document.querySelector('.reservation');
let active = false;
const activeReservation = (e) => {
active = true;
newReservation.style.backgroundColor = 'green';
}

const dragReservation = e => {
    if(!active) return;
    console.log(newReservation.style.top, e.clientY);

newReservation.style.left =`${e.clientX}px`;
newReservation.style.top =`${e.clientY}px`;
    
}
newReservation.addEventListener('mousedown', activeReservation);

document.addEventListener('mousemove', dragReservation);
document.addEventListener('mouseup', () => 
{
    active = false;
    newReservation.style.backgroundColor = 'rgb(180, 190, 39)';
});