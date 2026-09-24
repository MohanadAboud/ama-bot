export function sanitizeQuestion(input) {
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

export function findBestAnswer(question, answers) {
  const normalizedQuestion = normalizeQuestion(question);
  const matchedCategories = [];

  for (const answerGroup of answers) {
    const score = countMatches(
      answerGroup.keywords,
      normalizedQuestion
    );

    if (score > 0) {
      const answer = Array.isArray(answerGroup.answer)
        ? answerGroup.answer[
            Math.floor(Math.random() * answerGroup.answer.length)
          ]
        : answerGroup.answer;

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