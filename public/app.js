
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

let lang = "ar";
const pages = ["home", "tools", "saved"];

function toast(msg) {
  const t = $("#toast");
  if (!t) return;

  t.textContent = msg;
  t.classList.add("show");

  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 2600);
}

function go(page) {
  if (!pages.includes(page)) return;

  pages.forEach((p) => {
    const el = $(`#${p}Page`);
    if (el) el.classList.toggle("hidden", p !== page);
  });

  $$(".nav-item[data-page]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function setLanguage(nextLang) {
  lang = nextLang === "en" ? "en" : "ar";

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  $$("[data-ar][data-en]").forEach((el) => {
    const value = el.dataset[lang];
    if (value !== undefined) el.textContent = value;
  });

  $$("[data-ar-placeholder][data-en-placeholder]").forEach((el) => {
    el.placeholder = lang === "ar"
      ? el.dataset.arPlaceholder
      : el.dataset.enPlaceholder;
  });

  const langButton = $("#langBtn");
  if (langButton) {
    const label = langButton.querySelector("b");
    if (label) label.textContent = lang === "ar" ? "English" : "العربية";
  }

  const search = $("#toolSearch");
  if (search) {
    search.placeholder = lang === "ar"
      ? "ابحث عن أداة..."
      : "Search for a tool...";
  }

  document.title = lang === "ar" ? "أدواتي | Adawati" : "Adawati | Tools";
}

function openModal(html) {
  const modal = $("#modal");
  const content = $("#modalContent");

  if (!modal || !content) return;

  content.innerHTML = html;
  modal.classList.remove("hidden");
}

function closeModal() {
  $("#modal")?.classList.add("hidden");
}

$("#modalClose")?.addEventListener("click", closeModal);

$("#modal")?.addEventListener("click", (event) => {
  if (event.target.id === "modal") closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

/* NAVIGATION */

$$("[data-page]").forEach((button) => {
  button.addEventListener("click", () => {
    const page = button.dataset.page;
    if (page) go(page);
  });
});

/* THEME */

$("#themeBtn")?.addEventListener("click", () => {
  document.body.classList.toggle("light");

  const light = document.body.classList.contains("light");
  const icon = $("#themeIcon");

  if (icon) icon.textContent = light ? "☀" : "☾";

  const label = $("#themeBtn b");
  if (label) {
    label.textContent = light
      ? (lang === "ar" ? "الوضع النهاري" : "Light mode")
      : (lang === "ar" ? "الوضع الليلي" : "Dark mode");
  }
});

/* LANGUAGE */

$("#langBtn")?.addEventListener("click", () => {
  setLanguage(lang === "ar" ? "en" : "ar");
});

/* EXIT */

$("#logoutBtn")?.addEventListener("click", () => {
  const welcome = $("#welcomeScreen");
  const app = $("#appShell");

  if (app) app.style.display = "none";
  if (welcome) welcome.style.display = "";

  go("home");
});

/* CV BUILDER */

const cvStyle = `
<style>
.cv-paper {
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  padding: 38px;
  background: white;
  color: #202a40;
  font-family: Arial, sans-serif;
  border-radius: 4px;
  box-shadow: 0 5px 30px rgba(0,0,0,.15);
}
.cv-paper h1 {
  font-size: 28px;
  color: #173b70;
  margin-bottom: 8px;
}
.cv-paper h2 {
  font-size: 16px;
  color: #2464a6;
  border-bottom: 2px solid #d8e5f5;
  padding-bottom: 6px;
  margin: 23px 0 10px;
}
.cv-paper p {
  font-size: 13px;
  line-height: 1.7;
  margin: 4px 0;
  color: #39465b;
}
.cv-contact {
  color: #66758a;
  font-size: 12px;
  margin-bottom: 18px;
}
.cv-name-line {
  border-bottom: 3px solid #2865a6;
  padding-bottom: 15px;
}
.cv-section {
  white-space: pre-wrap;
}
@media print {
  body * { visibility: hidden; }
  #cvPrintArea, #cvPrintArea * { visibility: visible; }
  #cvPrintArea {
    position: absolute;
    inset: 0;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  .cv-paper {
    box-shadow: none;
    max-width: none;
  }
}
</style>
`;

function buildCV(data) {
  const isEnglish = lang === "en";

  const sections = [
    {
      title: isEnglish ? "Professional Summary" : "الملخص المهني",
      value: data.summary
    },
    {
      title: isEnglish ? "Education" : "التعليم",
      value: data.education
    },
    {
      title: isEnglish ? "Experience" : "الخبرات العملية",
      value: data.experience
    },
    {
      title: isEnglish ? "Skills" : "المهارات",
      value: data.skills
    },
    {
      title: isEnglish ? "Courses" : "الدورات التدريبية",
      value: data.courses
    },
    {
      title: isEnglish ? "Languages" : "اللغات",
      value: data.languages
    }
  ];

  return `
    ${cvStyle}
    <div class="cv-paper" id="cvPrintArea">
      <div class="cv-name-line">
        <h1>${safe(data.name)}</h1>
        <p>${safe(data.job)}</p>
        <div class="cv-contact">
          ${safe(data.email)} ${data.phone ? " | " + safe(data.phone) : ""}
          ${data.location ? " | " + safe(data.location) : ""}
        </div>
      </div>
      ${sections.map(section => section.value ? `
        <h2>${safe(section.title)}</h2>
        <p class="cv-section">${safe(section.value)}</p>
      ` : "").join("")}
    </div>
  `;
}

function downloadCV() {
  const area = $("#cvPrintArea");
  if (!area) return;

  const originalTitle = document.title;
  document.title = "Adawati-CV";

  window.print();

  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
}

function parseTranslatedCV(result) {
  if (typeof result === "string") {
    try {
      return JSON.parse(result);
    } catch {
      return { summary: result };
    }
  }

  return result || {};
}

function renderTranslatedCV(result) {
  if (!result || typeof result !== "object") {
    toast(lang === "ar" ? "تعذرت قراءة الترجمة" : "Could not read translation");
    return;
  }

  const fields = ["name", "job", "email", "phone", "location", "summary", "education", "experience", "skills", "courses", "languages"];

  const data = {};
  fields.forEach((field) => {
    data[field] = result[field] || "";
  });

  openModal(`
    <h2>${lang === "ar" ? "السيرة الذاتية المترجمة" : "Translated CV"}</h2>
    ${buildCV(data)}
    <button id="downloadTranslatedCV">
      ${lang === "ar" ? "تحميل / طباعة" : "Download / Print"}
    </button>
  `);

  $("#downloadTranslatedCV")?.addEventListener("click", downloadCV);
}

async function translateCV(data) {
  const button = $("#translateCVBtn");
  if (button) {
    button.disabled = true;
    button.textContent = lang === "ar" ? "جاري الترجمة..." : "Translating...";
  }

  try {
    const response = await fetch("/api/translate-cv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        targetLanguage: lang === "ar" ? "English" : "Arabic"
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Translation failed");
    }

    renderTranslatedCV(parseTranslatedCV(result));
  } catch (error) {
    console.error("CV Translation Error:", error);
    toast(lang === "ar"
      ? "حدث خطأ أثناء الترجمة. راجع إعدادات السيرفر."
      : "Translation failed. Check server configuration.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = lang === "ar" ? "ترجمة السيرة الذاتية" : "Translate CV";
    }
  }
}

/* OPEN TOOLS */

function openTool(tool) {
  const titles = {
    cv: lang === "ar" ? "إنشاء سيرة ذاتية" : "CV Builder",
    calories: lang === "ar" ? "حساب السعرات الحرارية" : "Calories Calculator",
    installments: lang === "ar" ? "حساب الأقساط" : "Installments Calculator",
    games: lang === "ar" ? "الألعاب" : "Games"
  };

  if (tool === "cv") {
    openModal(`
      <h2>${titles.cv}</h2>

      <label>${lang === "ar" ? "الاسم الكامل" : "Full name"}</label>
      <input id="cvName" placeholder="${lang === "ar" ? "اسمك" : "Your name"}">

      <label>${lang === "ar" ? "المسمى الوظيفي" : "Job title"}</label>
      <input id="cvJob" placeholder="${lang === "ar" ? "مثال: مطور ويب" : "Example: Web Developer"}">

      <label>Email</label>
      <input id="cvEmail" type="email">

      <label>${lang === "ar" ? "رقم الهاتف" : "Phone"}</label>
      <input id="cvPhone">

      <label>${lang === "ar" ? "الموقع" : "Location"}</label>
      <input id="cvLocation">

      <label>${lang === "ar" ? "الملخص المهني" : "Professional summary"}</label>
      <textarea id="cvSummary" rows="3"></textarea>

      <label>${lang === "ar" ? "التعليم" : "Education"}</label>
      <textarea id="cvEducation" rows="3"></textarea>

      <label>${lang === "ar" ? "الخبرات العملية" : "Experience"}</label>
      <textarea id="cvExperience" rows="3"></textarea>

      <label>${lang === "ar" ? "المهارات" : "Skills"}</label>
      <textarea id="cvSkills" rows="3"></textarea>

      <label>${lang === "ar" ? "الدورات التدريبية" : "Courses"}</label>
      <textarea id="cvCourses" rows="2"></textarea>

      <label>${lang === "ar" ? "اللغات" : "Languages"}</label>
      <textarea id="cvLanguages" rows="2"></textarea>

      <button id="createCVBtn">${lang === "ar" ? "إنشاء CV" : "Create CV"}</button>
      <button id="translateCVBtn">${lang === "ar" ? "ترجمة السيرة الذاتية" : "Translate CV"}</button>
      <div id="cvResult"></div>
    `);

    $("#createCVBtn")?.addEventListener("click", () => {
      const data = {
        name: $("#cvName").value.trim(),
        job: $("#cvJob").value.trim(),
        email: $("#cvEmail").value.trim(),
        phone: $("#cvPhone").value.trim(),
        location: $("#cvLocation").value.trim(),
        summary: $("#cvSummary").value.trim(),
        education: $("#cvEducation").value.trim(),
        experience: $("#cvExperience").value.trim(),
        skills: $("#cvSkills").value.trim(),
        courses: $("#cvCourses").value.trim(),
        languages: $("#cvLanguages").value.trim()
      };

      if (!data.name) {
        toast(lang === "ar" ? "اكتب اسمك أولاً" : "Enter your name first");
        return;
      }

      $("#cvResult").innerHTML = buildCV(data) + `
        <button id="downloadCVBtn">${lang === "ar" ? "تحميل / طباعة CV" : "Download / Print CV"}</button>
      `;

      $("#downloadCVBtn")?.addEventListener("click", downloadCV);
    });

    $("#translateCVBtn")?.addEventListener("click", () => {
      const data = {
        name: $("#cvName").value.trim(),
        job: $("#cvJob").value.trim(),
        email: $("#cvEmail").value.trim(),
        phone: $("#cvPhone").value.trim(),
        location: $("#cvLocation").value.trim(),
        summary: $("#cvSummary").value.trim(),
        education: $("#cvEducation").value.trim(),
        experience: $("#cvExperience").value.trim(),
        skills: $("#cvSkills").value.trim(),
        courses: $("#cvCourses").value.trim(),
        languages: $("#cvLanguages").value.trim()
      };

      if (!data.name) {
        toast(lang === "ar" ? "اكتب اسمك أولاً" : "Enter your name first");
        return;
      }

      translateCV(data);
    });
  }

  if (tool === "calories") {
    openModal(`
      <h2>${titles.calories}</h2>

      <label>${lang === "ar" ? "النوع" : "Gender"}</label>
      <select id="calGender">
        <option value="male">${lang === "ar" ? "ذكر" : "Male"}</option>
        <option value="female">${lang === "ar" ? "أنثى" : "Female"}</option>
      </select>

      <label>${lang === "ar" ? "العمر" : "Age"}</label>
      <input type="number" id="calAge" min="1" placeholder="25">

      <label>${lang === "ar" ? "الوزن بالكيلو" : "Weight (kg)"}</label>
      <input type="number" id="calWeight" min="1" placeholder="70">

      <label>${lang === "ar" ? "الطول بالسنتيمتر" : "Height (cm)"}</label>
      <input type="number" id="calHeight" min="1" placeholder="175">

      <label>${lang === "ar" ? "النشاط" : "Activity"}</label>
      <select id="calActivity">
        <option value="1.2">${lang === "ar" ? "قليل الحركة" : "Sedentary"}</option>
        <option value="1.375">${lang === "ar" ? "نشاط خفيف" : "Light activity"}</option>
        <option value="1.55">${lang === "ar" ? "نشاط متوسط" : "Moderate activity"}</option>
        <option value="1.725">${lang === "ar" ? "نشاط عالي" : "High activity"}</option>
        <option value="1.9">${lang === "ar" ? "نشاط مكثف" : "Very high activity"}</option>
      </select>

      <button id="calculateCalories">${lang === "ar" ? "احسب السعرات" : "Calculate calories"}</button>
      <div id="calorieResult"></div>
    `);

    $("#calculateCalories")?.addEventListener("click", () => {
      const age = Number($("#calAge").value);
      const weight = Number($("#calWeight").value);
      const height = Number($("#calHeight").value);
      const activity = Number($("#calActivity").value);
      const gender = $("#calGender").value;

      if (!age || !weight || !height || age <= 0 || weight <= 0 || height <= 0) {
        toast(lang === "ar" ? "راجع البيانات المدخلة" : "Check your inputs");
        return;
      }

      const bmr = gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

      const calories = Math.round(bmr * activity);

      $("#calorieResult").innerHTML = `
        <div class="result">
          <h3>${lang === "ar" ? "احتياجك اليومي التقريبي" : "Estimated daily calories"}</h3>
          <h2>${calories} kcal</h2>
          <p>${lang === "ar"
            ? "النتيجة تقديرية وليست بديلاً عن استشارة مختص."
            : "This is an estimate, not a substitute for professional advice."}</p>
        </div>
      `;
    });
  }

  if (tool === "installments") {
    openModal(`
      <h2>${titles.installments}</h2>

      <label>${lang === "ar" ? "السعر الإجمالي" : "Total price"}</label>
      <input type="number" id="instPrice" min="0" placeholder="10000">

      <label>${lang === "ar" ? "المقدم" : "Down payment"}</label>
      <input type="number" id="instDown" min="0" placeholder="1000">

      <label>${lang === "ar" ? "نسبة الفائدة السنوية (%)" : "Annual interest (%)"}</label>
      <input type="number" id="instRate" min="0" step="0.01" placeholder="0">

      <label>${lang === "ar" ? "عدد الشهور" : "Number of months"}</label>
      <input type="number" id="instMonths" min="1" placeholder="12">

      <button id="calculateInstallments">${lang === "ar" ? "احسب القسط" : "Calculate installment"}</button>
      <div id="installmentResult"></div>
    `);

    $("#calculateInstallments")?.addEventListener("click", () => {
      const price = Number($("#instPrice").value);
      const down = Number($("#instDown").value || 0);
      const rate = Number($("#instRate").value || 0);
      const months = Number($("#instMonths").value);

      if (!price || !months || price <= 0 || months <= 0 || down < 0 || down > price || rate < 0) {
        toast(lang === "ar" ? "راجع البيانات المدخلة" : "Check your inputs");
        return;
      }

      const financed = price - down;
      const monthlyRate = rate / 100 / 12;

      const monthly = monthlyRate === 0
        ? financed / months
        : financed * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));

      const total = monthly * months + down;

      $("#installmentResult").innerHTML = `
        <div class="result">
          <p>${lang === "ar" ? "قيمة القسط الشهري" : "Monthly installment"}</p>
          <h2>${monthly.toFixed(2)}</h2>
          <p>${lang === "ar" ? "إجمالي المبلغ مع المقدم" : "Total including down payment"}: ${total.toFixed(2)}</p>
        </div>
      `;
    });
  }

  if (tool === "games") {
    openModal(`
      <h2>${titles.games}</h2>
      <p>${lang === "ar" ? "اختار لعبة واستمتع بوقتك!" : "Choose a game and have fun!"}</p>

      <div class="result">
        <h3>${lang === "ar" ? "لعبة تخمين الرقم" : "Number guessing game"}</h3>
        <p>${lang === "ar" ? "خمن رقم من 1 إلى 10" : "Guess a number from 1 to 10"}</p>
        <input id="gameGuess" type="number" min="1" max="10" placeholder="1 - 10">
        <button id="guessBtn">${lang === "ar" ? "تحقق" : "Guess"}</button>
        <p id="guessResult"></p>
      </div>

      <div class="result">
        <h3>${lang === "ar" ? "الحجر والورقة والمقص" : "Rock Paper Scissors"}</h3>
        <div class="game-choices">
          <button data-choice="rock">✊</button>
          <button data-choice="paper">✋</button>
          <button data-choice="scissors">✌️</button>
        </div>
        <p id="rpsResult"></p>
      </div>
    `);

    const secret = Math.floor(Math.random() * 10) + 1;

    $("#guessBtn")?.addEventListener("click", () => {
      const guess = Number($("#gameGuess").value);
      const result = $("#guessResult");

      if (guess < 1 || guess > 10) {
        result.textContent = lang === "ar" ? "اكتب رقم من 1 إلى 10" : "Enter a number from 1 to 10";
        return;
      }

      result.textContent = guess === secret
        ? (lang === "ar" ? "ممتاز! إجابة صحيحة 🎉" : "Correct! 🎉")
        : (lang === "ar" ? "حاول مرة تانية!" : "Try again!");
    });

    $$("[data-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const user = button.dataset.choice;
        const choices = ["rock", "paper", "scissors"];
        const computer = choices[Math.floor(Math.random() * 3)];

        let result = "draw";

        if (
          (user === "rock" && computer === "scissors") ||
          (user === "paper" && computer === "rock") ||
          (user === "scissors" && computer === "paper")
        ) result = "win";
        else if (user !== computer) result = "lose";

        const names = {
          rock: "✊",
          paper: "✋",
          scissors: "✌️"
        };

        $("#rpsResult").textContent =
          `${lang === "ar" ? "أنت" : "You"} ${names[user]} — ${lang === "ar" ? "الكمبيوتر" : "Computer"} ${names[computer]}: ` +
          (result === "draw"
            ? (lang === "ar" ? "تعادل!" : "Draw!")
            : result === "win"
              ? (lang === "ar" ? "كسبت! 🎉" : "You win! 🎉")
              : (lang === "ar" ? "خسرت، حاول تاني!" : "You lose, try again!"));
      });
    });
  }
}

/* BASIC TOOL EVENTS */

$$("[data-tool]").forEach((button) => {
  button.addEventListener("click", () => {
    openTool(button.dataset.tool);
  });
});

/* INITIAL STATE */

setLanguage("ar");
go("home");
