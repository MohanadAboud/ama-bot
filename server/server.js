import express from "express";
import fs from "node:fs/promises";
import { answers } from "./data/answers.js";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

async function loadMessages() {
  const data = await fs.readFile("./data/messages.json", "utf8");
  const messages = JSON.parse(data);

  return messages.map((message) => ({
    ...message,
    createdAt: new Date(message.createdAt)
  }));
}

async function saveMessages(messages) {
  const json = JSON.stringify(messages, null, 2);
  await fs.writeFile("./data/messages.json", json);
}

function sanitizeQuestion(input) {
  return String(input).replace(/[\u0000-\u001F\u007F]/g, "");
}

function normalizeQuestion(question) {
  return question
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function countMatches(keywords, normalizedQuestion) {
  return keywords.filter((keyword) =>
    normalizedQuestion.includes(keyword.toLowerCase())
  ).length;
}

function findBestAnswer(question) {
  const normalizedQuestion = normalizeQuestion(question);

  const matchedCategories = [];

  for (const answerGroup of answers) {
    const score = countMatches(
      answerGroup.keywords,
      normalizedQuestion
    );

    if (score > 0) {
      const answer =
        answerGroup.answer[
          Math.floor(Math.random() * answerGroup.answer.length)
        ];

      matchedCategories.push({
        category: answerGroup.category,
        answer
      });
    }
  }

  if (matchedCategories.length === 0) {
    return {
      answer: "Det kender jeg ikke svaret på endnu.",
      categories: []
    };
  }

  return {
    answer: matchedCategories
      .map((match) => match.answer)
      .join(" "),
    categories: matchedCategories.map((match) => match.category)
  };
}

async function loadTopicStats() {
  const data = await fs.readFile("./data/topic-stats.json", "utf8");
  return JSON.parse(data);
}

async function saveTopicStats(topicStats) {
  const json = JSON.stringify(topicStats, null, 2);
  await fs.writeFile("./data/topic-stats.json", json);
}

app.get("/", async (request, response) => {
  const messages = await loadMessages();
  const topicStats = await loadTopicStats();

  response.render("index", {
    messages,
    error: "",
    topicStats
  });
});

app.post("/ask", async (request, response) => {
  const messages = await loadMessages();
  const topicStats = await loadTopicStats();

  const rawQuestion = request.body.question || "";
  const question = sanitizeQuestion(rawQuestion).trim();

  let error = "";

  if (!question) {
    error = "Husk at skrive et spørgsmål, før du sender.";
  } else if (question.length > 100) {
    error = "Spørgsmålet må højst være 100 tegn.";
  } else {
    messages.push({
      type: "question",
      text: question,
      createdAt: new Date()
    });

    const result = findBestAnswer(question);

    messages.push({
      type: "answer",
      text: result.answer,
      categories: result.categories,
      createdAt: new Date()
    });

    for (const category of result.categories) {
      if (topicStats[category] !== undefined) {
        topicStats[category]++;
      }
    }
  }

  await saveMessages(messages);
  await saveTopicStats(topicStats);

  response.redirect("/");
});

app.post("/clear-messages", async (request, response) => {
  await saveMessages([]);
  
  response.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});