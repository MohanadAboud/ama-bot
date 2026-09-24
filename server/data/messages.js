import fs from "node:fs/promises";

export async function loadMessages() {
  const data = await fs.readFile("./data/messages.json", "utf8");
  const messages = JSON.parse(data);

  return messages.map((message) => ({
    ...message,
    createdAt: new Date(message.createdAt)
  }));
}

export async function saveMessages(messages) {
  const json = JSON.stringify(messages, null, 2);
  await fs.writeFile("./data/messages.json", json);
}