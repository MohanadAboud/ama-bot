import express from "express";
import { loadAnswers, saveAnswers } from "../data/answers.js";

const router = express.Router();

function isValidAnswerRule(body) {
  return body.category && body.keywords && body.answer;
}

router.get("/", async (request, response) => {
  const answers = await loadAnswers();

  response.json(answers);
});

router.get("/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find(
    (answer) => answer.category === request.params.category
  );

  if (!answerRule) {
    response.status(404).json({ error: "Svarreglen blev ikke fundet." });
    return;
  }

  response.json(answerRule);
});

router.post("/", async (request, response) => {
  const answers = await loadAnswers();
  const body = request.body ?? {};

  if (!isValidAnswerRule(body)) {
    response.status(400).json({ error: "Svarreglen mangler gyldige felter." });
    return;
  }

  const answerRule = {
    category: body.category,
    keywords: body.keywords,
    answer: body.answer
  };

  answers.push(answerRule);
  await saveAnswers(answers);

  response.status(201).json(answerRule);
});

router.put("/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find(
    (answer) => answer.category === request.params.category
  );

  if (!answerRule) {
    response.status(404).json({ error: "Svarreglen blev ikke fundet." });
    return;
  }

  const body = request.body ?? {};
  if (!isValidAnswerRule({ ...body, category: request.params.category })) {
    response.status(400).json({ error: "Svarreglen mangler gyldige felter." });
    return;
  }

  answerRule.keywords = body.keywords;
  answerRule.answer = body.answer;

  await saveAnswers(answers);
  response.json(answerRule);
});

router.delete("/:category", async (request, response) => {
  const answers = await loadAnswers();
  const answerRule = answers.find(
    (answer) => answer.category === request.params.category
  );

  if (!answerRule) {
    response.status(404).json({ error: "Svarreglen blev ikke fundet." });
    return;
  }

  const remainingAnswers = answers.filter(
    (answer) => answer !== answerRule
  );

  await saveAnswers(remainingAnswers);
  response.status(204).send();
});

export default router;