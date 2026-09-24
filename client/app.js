const API_URL = "http://localhost:3000";

const messagesContainer = document.querySelector("#messages");
const questionForm = document.querySelector("#question-form");
const questionInput = document.querySelector("#question");
const clearMessagesButton = document.querySelector("#clear-messages-button");

function displayMessage(message) {
  const createdAt = new Date(message.createdAt);
  const time = createdAt.toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const html = /*html*/ `
    <article class="${message.type}">
      <p>${message.text}</p>
      <time class="message-time" datetime="${createdAt.toISOString()}">${time}</time>
    </article>`;

  messagesContainer.insertAdjacentHTML("beforeend", html);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function getMessages() {
  const response = await fetch(`${API_URL}/messages`);
  const messages = await response.json();

  for (const message of messages) {
    displayMessage(message);
  }
}

questionForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = questionInput.value.trim();
  const response = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });
  const data = await response.json();

  if (data.error) {
    return;
  }

  displayMessage(data.question);
  displayMessage(data.answer);
  questionInput.value = "";
});

clearMessagesButton.addEventListener("click", async () => {
  await fetch(`${API_URL}/messages`, { method: "DELETE" });
  messagesContainer.innerHTML = "";
});

getMessages();
