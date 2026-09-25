import express from "express";
import { loadMessages, saveMessages } from "../data/messages.js";
import { loadAnswers } from "../data/answers.js";
import { loadTopicStats, saveTopicStats } from "../data/topicStats.js";
import { findBestAnswer, sanitizeQuestion } from "../answerLogic.js";

const router = express.Router();

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

router.get("/", async (request, response) => {
  const messages = await loadMessages();

  response.json(messages);
});

router.post("/", async (request, response) => {
  const messages = await loadMessages();
  const answers = await loadAnswers();
  const topicStats = await loadTopicStats();
  const rawQuestion = request.body.question.trim();
  const question = sanitizeQuestion(rawQuestion);

  if (!question) {
    response.status(400).json({ error: "Skriv et spørgsmål, før du sender." });
    return;
  }

  if (question.length > 100) {
    response.status(400).json({ error: "Spørgsmålet må højst være 100 tegn." });
    return;
  }

  const questionMessage = {
    type: "question",
    text: escapeHtml(question),
    createdAt: new Date()
  };
  messages.push(questionMessage);

  const result = findBestAnswer(question, answers);
  const answerMessage = {
    type: "answer",
    text: escapeHtml(result.answer),
    categories: result.categories,
    createdAt: new Date()
  };
  messages.push(answerMessage);

  for (const category of result.categories) {
    if (topicStats[category] !== undefined) {
      topicStats[category]++;
    }
  }

  await saveMessages(messages);
  await saveTopicStats(topicStats);

  response.status(201).json({ question: questionMessage, answer: answerMessage });
});

router.delete("/", async (request, response) => {
  await saveMessages([]);

  response.status(204).send();
});

export default router;