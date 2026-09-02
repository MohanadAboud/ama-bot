"use strict";

const body = document.body;
const toggleButton = document.querySelector("#toggleDarkMode");

toggleButton.addEventListener("click", () => {
    const isDark = body.dataset.theme === "dark";
    body.dataset.theme = isDark ? "light" : "dark";
    toggleButton.textContent = isDark ? "Dark mode" : "Light mode";
});
