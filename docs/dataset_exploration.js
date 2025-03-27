// PapaParse library from https://www.papaparse.com/docs 

let allData = [];

const difficultySelect = document.getElementById("difficulty");
const questionSelect = document.getElementById("question");
const modelSelect = document.getElementById("model");
const displayArea = document.getElementById("displayArea");

Papa.parse("./ai_generated_code_new.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function(results) {
    allData = results.data.map(row => ({
      question: row.question.trim(),
      difficulty: row.difficulty.trim().toLowerCase(),
      code: row.code.replace(/\\n/g, '<br>'),
      sampleInput: row.sample_input,
      numLines: row.num_lines,
      numLoops: row.num_loops,
      model: row.model.trim().toLowerCase(),
      executionTime: row.execution_time_ms
    }));

    // Populate difficulty dropdown
    const difficulties = [...new Set(allData.map(row => row.difficulty))];
    difficulties.forEach(diff => {
      const opt = document.createElement("option");
      opt.value = diff;
      opt.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
      difficultySelect.appendChild(opt);
    });
  }
});

difficultySelect.addEventListener("change", () => {
  const selected = difficultySelect.value;
  questionSelect.innerHTML = '<option value="">-- Select Question --</option>';
  modelSelect.innerHTML = '<option value="">-- Select Model --</option>';
  displayArea.innerHTML = '';

  const questions = [...new Set(allData
    .filter(row => row.difficulty === selected)
    .map(row => row.question))];

  questions.forEach(q => {
    const opt = document.createElement("option");
    opt.value = q;
    opt.textContent = q;
    questionSelect.appendChild(opt);
  });
});

questionSelect.addEventListener("change", () => {
  const selectedDifficulty = difficultySelect.value;
  const selectedQuestion = questionSelect.value;
  modelSelect.innerHTML = '<option value="">-- Select Model --</option>';
  displayArea.innerHTML = '';

  const models = [...new Set(allData
    .filter(row =>
      row.difficulty === selectedDifficulty &&
      row.question === selectedQuestion
    )
    .map(row => row.model))];

  models.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    modelSelect.appendChild(opt);
  });
});

modelSelect.addEventListener("change", () => {
  const selectedDifficulty = difficultySelect.value;
  const selectedQuestion = questionSelect.value;
  const selectedModel = modelSelect.value;

  const match = allData.find(row =>
    row.difficulty === selectedDifficulty &&
    row.question === selectedQuestion &&
    row.model === selectedModel
  );

  displayArea.innerHTML = '';

  if (match) {
    displayArea.innerHTML = `
      <pre>${match.code}</pre>
      <p><strong>Sample Input:</strong> ${match.sampleInput}</p>
      <p><strong>Execution Time (ms):</strong> ${match.executionTime}</p>
      <p><strong>Number of Lines:</strong> ${match.numLines}</p>
      <p><strong>Number of Loops:</strong> ${match.numLoops}</p>
    `;
  } else {
    displayArea.innerHTML = "<p>No data found for selection.</p>";
  }
});