import express from "express";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

const messages = [];

const answers = [
  {
    category: "navn",
    keywords: ["navn", "hedder", "hvem er du", "gammel", "alder"],
    answers: [
      "Jeg hedder Mohanad.",
      "Jeg er 27 år gammel.",
      "Jeg er en 27-årig studerende, der elsker at kode.",
      "Mit navn er Mohanad, og jeg er 27 år gammel."
    ]
  },
  {
    category: "lokation",
    keywords: ["bor", "lokation", "fra"],
    answers: [
      "Jeg bor i Aarhus.",
      "Jeg er født i Danmark, men min familie er fra Irak.",
      "Min by er Aarhus, jeg har ikke boet andre steder i Danmark."
    ]
  },
  {
    category: "hobby",
    keywords: ["fritid", "hobby", "kan lide"],
    answers: [
      "I min fritid kan jeg godt lide at læse.",
      "Jeg elsker at gå ture, når vejret tillader det.",
      "I min fritid kan jeg godt lide at spille videospil og kode.",
      "Min hobby er at spille videospil, primært roguelike-spil."
    ]
  }
];

function sanitizeQuestion(input) {
  return input.replace(/[\u0000-\u001F\u007F]/g, "");
}

function countMatches(keywords, normalizedQuestion) {
  const matches = keywords.filter((keyword) =>
    normalizedQuestion.includes(keyword)
  );

  return matches.length;
}

function findBestAnswer(question) {
  const normalizedQuestion = question.toLowerCase();

  let bestScore = 0;
  let bestAnswer = "Det kender jeg ikke svaret på endnu.";
  let bestCategory = "";

  for (const answerGroup of answers) {
    const score = countMatches(
      answerGroup.keywords,
      normalizedQuestion
    );

    if (score > bestScore) {
      bestScore = score;
      bestCategory = answerGroup.category;

      const randomIndex = Math.floor(
        Math.random() * answerGroup.answers.length
      );

      bestAnswer = answerGroup.answers[randomIndex];
    }
  }

  return {
    answer: bestAnswer,
    category: bestCategory
  };
}

const topicStats = {
  navn: 0,
  lokation: 0,
  hobby: 0
};

app.get("/", (request, response) => {
  response.render("index", {
    messages,
    error: "",
    topicStats
  });
});

app.post("/ask", (request, response) => {
  const rawQuestion = request.body.question || "";
  const question = sanitizeQuestion(rawQuestion).trim();

  let error = "";

  if (!question) {
    error = "Husk at skrive et spørgsmål, før du sender.";
  } else if (question.length > 280) {
    error = "Spørgsmålet må højst være 280 tegn.";
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
      category: result.category,
      createdAt: new Date()
    });

    if (result.category) {
      topicStats[result.category]++;
    }
  }

  response.render("index", {
    messages,
    error,
    topicStats
  });
});

app.post("/clear-messages", (request, response) => {
  messages.length = 0;
  response.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
