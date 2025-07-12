const comboToMajorMinor = {
  "ΒΥΝ-ΚΔΕ": { major: "ΒΥΝ", minor: "ΚΔΕ" },
  "ΒΥΝ-ΨΜΑΔ": { major: "ΒΥΝ", minor: "ΨΜΑΔ" },
  "ΚΔΕ-ΒΥΝ": { major: "ΚΔΕ", minor: "ΒΥΝ" },
  "ΚΔΕ-ΨΜΑΔ": { major: "ΚΔΕ", minor: "ΨΜΑΔ" },
  "ΨΜΑΔ-ΒΥΝ": { major: "ΨΜΑΔ", minor: "ΒΥΝ" },
  "ΨΜΑΔ-ΚΔΕ": { major: "ΨΜΑΔ", minor: "ΚΔΕ" }
};

// 🔢 Αρχικοποίηση σκορ
let scoresA = { ΒΥΝ: 0, ΚΔΕ: 0, ΨΜΑΔ: 0 };
let scoresB = {
  "ΒΥΝ-ΚΔΕ": 0,
  "ΒΥΝ-ΨΜΑΔ": 0,
  "ΚΔΕ-ΒΥΝ": 0,
  "ΚΔΕ-ΨΜΑΔ": 0,
  "ΨΜΑΔ-ΒΥΝ": 0,
  "ΨΜΑΔ-ΚΔΕ": 0
};

let shuffled = [];
let index = 0;

// 🔗 Επιλογή στοιχείων DOM
const card = document.getElementById("card");
const result = document.getElementById("result");
const title = document.getElementById("course-title");
const desc = document.getElementById("course-desc");

function updateProgressBar() {
  const total = shuffled.length;
  const current = Math.min(index, total);
  const percent = (current / total) * 100;
  document.getElementById("progress-bar").style.width = percent + "%";
}

// ▶️ Εμφάνιση επόμενου μαθήματος
function showNext() {

   updateProgressBar();

  if (index >= shuffled.length) {
    showResults();
    return;
  }

  const course = shuffled[index];
  title.textContent = course.title;

  const fullText = course.description;
  const shortText = fullText.length > 120 ? fullText.slice(0, 120) + "..." : fullText;

  // Δημιουργία περιγραφής με toggle
  const descContainer = document.createElement("div");
  descContainer.innerHTML = `
    <span id="desc-text">${shortText}</span>
    ${fullText.length > 120 ? `<a href="#" id="toggle-desc" style="margin-left: 6px; font-size: 14px;">Περισσότερα</a>` : ""}
  `;

  desc.innerHTML = "";
  desc.appendChild(descContainer);

  if (fullText.length > 120) {
    const toggle = document.getElementById("toggle-desc");
    const descText = document.getElementById("desc-text");
    let expanded = false;

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      expanded = !expanded;
      descText.textContent = expanded ? fullText : shortText;
      toggle.textContent = expanded ? "Λιγότερα" : "Περισσότερα";
    });
  }

  card.classList.remove("hidden");
}


// 🗳️ Ψήφος και βαθμολόγηση
function vote(score) {
  if (index >= shuffled.length) return;

  const course = shuffled[index];
  const weight = course.weight || 1;

  let points = 0;
  if (score === 2 && weight === 0.5) points = 0.5;
  else if (score === 1 && weight === 0.5) points = 0;
  else if (score === 2) points = 2;
  else if (score === 1) points = 1;

  if (scoresA.hasOwnProperty(course.directionA)) {
    scoresA[course.directionA] += points;
  }

  if (Array.isArray(course.directionB)) {
    course.directionB.forEach(dir => {
      if (scoresB.hasOwnProperty(dir)) {
        scoresB[dir] += points;
      }
    });
  }

  index++;
  showNext();
}



// 📊 Εμφάνιση αποτελεσμάτων
function showResults() {
  card.classList.add("hidden");
  result.classList.remove("hidden");

  // ➤ Βασικές κατευθύνσεις (directionA)
  const sortedA = Object.entries(scoresA).sort((a, b) => b[1] - a[1]);
  const labelsA = sortedA.map(([dir]) => dir);
  const dataA = sortedA.map(([, val]) => val);

  new Chart(document.getElementById("scoreChart"), {
    type: "bar",
    data: {
      labels: labelsA,
      datasets: [{
        label: "Σκορ Κατεύθυνσης",
        data: dataA,
        backgroundColor: "#bc0a0aff"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // ➤ Ανάλυση directionB (Major/Minor)
  const maxComboScore = Math.max(...Object.values(scoresB));
  const topCombos = Object.entries(scoresB)
    .filter(([, val]) => val === maxComboScore)
    .map(([combo]) => comboToMajorMinor[combo])
    .filter(Boolean);

  if (topCombos.length > 0) {
    const message = topCombos
      .map(({ major, minor }) => `Major: ${major}, Minor: ${minor}`)
      .join(" ή ");

    const resultText = document.createElement("p");
    resultText.style.marginTop = "20px";
    resultText.style.fontWeight = "bold";
    resultText.style.fontSize = "18px";
    resultText.textContent = `Όμως η κατεύθυνση που σου ταιριάζει είναι: ${message}`;

    // ➤ Τοποθέτηση πριν το κουμπί κοινοποίησης
    const shareBtn = document.getElementById("share-btn");
    result.insertBefore(resultText, shareBtn);
  }

  // 🔒 Προαιρετικά: Αν θέλεις να επαναφέρεις το γράφημα των directionB, ξεσχόλιασε παρακάτω:
  /*
  const sortedB = Object.entries(scoresB).sort((a, b) => b[1] - a[1]);
  const labelsB = sortedB.map(([dir]) => dir);
  const dataB = sortedB.map(([, val]) => val);

  const comboCanvas = document.createElement("canvas");
  comboCanvas.id = "comboChart";
  result.appendChild(comboCanvas);

  new Chart(comboCanvas, {
    type: "bar",
    data: {
      labels: labelsB,
      datasets: [{
        label: "Σκορ Κατεύθυνσης 3!",
        data: dataB,
        backgroundColor: "#2196F3"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
  */

  // ➤ Γέμισε τον πίνακα με ταξινομημένα scoresB
  const tableBody = document.querySelector("#combo-table tbody");
  tableBody.innerHTML = "";

  Object.entries(scoresB)
    .sort((a, b) => b[1] - a[1])
    .forEach(([combo, score]) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${combo}</td><td>${score}</td>`;
      tableBody.appendChild(row);
  });

}


// 📤 Κοινοποίηση αποτελέσματος
document.getElementById("share-btn").addEventListener("click", async () => {
  const resultContent = document.getElementById("result");
  const shareBtn = document.getElementById("share-btn");

  // Απόκρυψη κουμπιού
  const originalDisplay = shareBtn.style.display;
  shareBtn.style.display = "none";

  // Λήψη στιγμιότυπου
  const canvas = await html2canvas(resultContent, {
    backgroundColor: "#ffffff",
    scale: 2
  });

  // Επαναφορά κουμπιού
  shareBtn.style.display = originalDisplay;

  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  const file = new File([blob], "score.png", { type: "image/png" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: "Το αποτέλεσμα μου!",
        text: "Δες ποια κατεύθυνση μου ταιριάζει!",
        files: [file]
      });
    } catch (err) {
      console.error("Share cancelled or failed:", err);
    }
  } else {
    const link = document.createElement("a");
    link.download = "score.png";
    link.href = URL.createObjectURL(blob);
    link.click();
  }
});


// ▶️ Εκκίνηση quiz
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-btn");
  startBtn.addEventListener("click", () => {
    document.getElementById("start-screen").classList.add("hidden");
    shuffled = [...courses].sort(() => Math.random() - 0.5);
    index = 0;
    scoresA = { ΒΥΝ: 0, ΚΔΕ: 0, ΨΜΑΔ: 0 };
    scoresB = {
      "ΒΥΝ-ΚΔΕ": 0,
      "ΒΥΝ-ΨΜΑΔ": 0,
      "ΚΔΕ-ΒΥΝ": 0,
      "ΚΔΕ-ΨΜΑΔ": 0,
      "ΨΜΑΔ-ΒΥΝ": 0,
      "ΨΜΑΔ-ΚΔΕ": 0
    };
    showNext();
  });
    document.getElementById("info-btn").addEventListener("click", () => {
    document.getElementById("info-modal").classList.remove("hidden");
  });

  document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("info-modal").classList.add("hidden");
  });
  
  document.getElementById("info-modal").addEventListener("click", (e) => {
    if (e.target.id === "info-modal") {
      document.getElementById("info-modal").classList.add("hidden");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.getElementById("info-modal").classList.add("hidden");
    }
  });
  
  // ✅ Εγγραφή Service Worker για PWA
  self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open("quiz-cache-v1").then((cache) => {
        return cache.addAll([
          "/",
          "/index.html",
          "/style.css",
          "/script.js",
          "/courses.js",
          "/manifest.json",
          "/chart.js",
          "/html2canvas.min.js",
          "https://di.ionio.gr/favicon.ico"
        ]);
      })
    );
  });

  self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.match(event.request).then((response) =>
        response || fetch(event.request)
      )
    );
  });


});
