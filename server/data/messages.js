import fs from "node:fs/promises";

export async function loadMessages() {
  try {
    const data = await fs.readFile("./data/messages.json", "utf8");
    const messages = JSON.parse(data);

    return messages.map((message) => ({
      ...message,
      createdAt: new Date(message.createdAt)
    }));
  } catch (error) {
    throw new Error("Kunne ikke indlæse beskeder.", { cause: error });
  }
}

export async function saveMessages(messages) {
  const json = JSON.stringify(messages, null, 2);
  await fs.writeFile("./data/messages.json", json);
}