import express from "express";
import { loadAnswers, saveAnswers } from "../data/answers.js";

const router = express.Router();

router.get("/", async (request, response) => {
  const answers = await loadAnswers();

  response.json(answers);
});

router.get("/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find(
    (answer) => answer.category === request.params.category
  );

  response.json(answerRule ?? null);
});

router.post("/", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = {
    category: request.body.category,
    keywords: request.body.keywords,
    answer: request.body.answer
  };

  answers.push(answerRule);
  await saveAnswers(answers);

  response.json(answerRule);
});

router.put("/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find(
    (answer) => answer.category === request.params.category
  );

  if (!answerRule) {
    response.json(null);
    return;
  }

  if (request.body.keywords !== undefined) {
    answerRule.keywords = request.body.keywords;
  }
  if (request.body.answer !== undefined) {
    answerRule.answer = request.body.answer;
  }

  await saveAnswers(answers);
  response.json(answerRule);
});

router.delete("/:category", async (request, response) => {
  const answers = await loadAnswers();
  const remainingAnswers = answers.filter(
    (answer) => answer.category !== request.params.category
  );

  await saveAnswers(remainingAnswers);
  response.send();
});

export default router;