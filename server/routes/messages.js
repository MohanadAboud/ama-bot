import express from "express";
import { loadMessages, saveMessages } from "../data/messages.js";
import { loadAnswers } from "../data/answers.js";
import { loadTopicStats, saveTopicStats } from "../data/topicStats.js";
import { findBestAnswer, sanitizeQuestion } from "../answerLogic.js";

const router = express.Router();

router.get("/", async (request, response) => {
  const messages = await loadMessages();

  response.json(messages);
});

router.post("/", async (request, response) => {
  const messages = await loadMessages();
  const answers = await loadAnswers();
  const topicStats = await loadTopicStats();
  const rawQuestion = request.body?.question ?? "";
  const question = sanitizeQuestion(rawQuestion).trim();

  if (!question) {
    response.json({ error: "Skriv et spørgsmål, før du sender." });
    return;
  }

  if (question.length > 100) {
    response.json({ error: "Spørgsmålet må højst være 100 tegn." });
    return;
  }

  const questionMessage = {
    type: "question",
    text: question,
    createdAt: new Date()
  };
  messages.push(questionMessage);

  const result = findBestAnswer(question, answers);
  const answerMessage = {
    type: "answer",
    text: result.answer,
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

  response.json({ question: questionMessage, answer: answerMessage });
});

router.delete("/", async (request, response) => {
  await saveMessages([]);

  response.send();
});

export default router;