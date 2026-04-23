// theme toggle logic
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark');
    // save to localStorage for persistence
    if(document.body.classList.contains('dark')) {
      themeToggle.textContent = "☀️";
      localStorage.setItem("theme", "dark");
    } else {
      themeToggle.textContent = "🌙";
      localStorage.setItem("theme", "light");
    }
  });
  // on page load, respect saved theme
  if(localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }
}

// Magnetic Button
const btn = document.querySelector(".modern-btn");

btn.addEventListener("mousemove", e => {
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
});

btn.addEventListener("mouseleave", () => {
  btn.style.transform = "translate(0,0)";
});
