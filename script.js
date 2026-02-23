// ===== REC BUTTON TOGGLE =====
const recBtn = document.getElementById("recBtn");
let isRecording = false;

recBtn.addEventListener("click", function(){
    isRecording = !isRecording;

    if(isRecording){
        recBtn.style.background = "white";
        recBtn.style.color = "black";
    }else{
        recBtn.style.background = "red";
        recBtn.style.color = "white";
    }
});

// ===== DRAW MOCK WAVEFORM =====
const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas(){
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function drawWave(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const mid = canvas.height/2;

    for(let i=0;i<canvas.width;i+=5){
        const height = Math.random()*100;
        ctx.fillStyle="white";
        ctx.fillRect(i, mid-height/2, 2, height);
    }
}

setInterval(drawWave, 500);

