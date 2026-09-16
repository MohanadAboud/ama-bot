"use strict";

const body = document.body;
const toggleButton = document.querySelector("#toggleDarkMode");

const savedTheme = localStorage.getItem("theme") || "light";
body.dataset.theme = savedTheme;

if (toggleButton) {
  toggleButton.textContent = savedTheme === "dark" ? "Light mode" : "Dark mode";

  toggleButton.addEventListener("click", () => {
    const isDark = body.dataset.theme === "dark";
    const newTheme = isDark ? "light" : "dark";

    body.dataset.theme = newTheme;
    toggleButton.textContent = isDark ? "Dark mode" : "Light mode";

    localStorage.setItem("theme", newTheme);
  });
}