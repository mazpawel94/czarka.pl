const newReservation = document.querySelector('.reservation');
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

// const hourDistance = {
//     10: 0,
//     smallIndian: 150,
//     bigIndian: 300,
//     rightChinese: 450,
//     leftChinese: 600,
//     base: 750,
//     board: 900,
//     rightRattan: 1050,
//     leftRattan: 1200
// };

function activeReservation (e) {
if(e.target.nodeName === 'SELECT') return;
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
newReservation.addEventListener('mousedown', activeReservation);

document.addEventListener('mousemove', dragReservation);
document.addEventListener('mouseup', () => 
{
    active = false;
    newReservation.style.left =`${Math.floor((parseInt(newReservation.style.left) + 60)/150)*150}px`;
    newReservation.style.top =`${40 + Math.floor(parseInt((newReservation.style.top) + 15)/50)*50}px`;
    newReservation.style.backgroundColor = 'rgb(180, 190, 39)';
});

document.querySelector('#select-table').addEventListener('change', function(e) {
console.log(tableDistance[e.target.value]);
newReservation.style.left = `${tableDistance[e.target.value]}px`;
});

document.querySelector('#select-hour').addEventListener('change', function(e) {
    const distance = (e.target.value).split(':')[0] - 10;
    newReservation.style.top = `${40 + (e.target.value).split(':')[1]*(5/6) + distance*50}px`;
    console.log(40 + (e.target.value).split(':')[1]*(5/6) + distance*50);

    })