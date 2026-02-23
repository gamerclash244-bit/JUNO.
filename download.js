// Magnetic Button Effect
const buttons = document.querySelectorAll(".modern-btn");

buttons.forEach(btn => {
  btn.addEventListener("mousemove", e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "translate(0,0)";
  });
});



function DownloadRelease() {
  window.location.href="https://github.com/gamerclash244-bit/JUNO.1/releases/download/JUNO.1-UPDATE/JUNO.1.Firmware.Updater.Setup.3.0.0.exe"
}

function ShowMessages() {
  alert("coming soon.now only available for windows");
}
