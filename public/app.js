
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

let lang = "ar";
const pages = ["home", "tools", "saved"];

// ==============================
// TOAST
// ==============================

function toast(msg) {
  const t = $("#toast");
  if (!t) return;

  t.textContent = msg;
  t.classList.add("show");

  setTimeout(() => t.classList.remove("show"), 2600);
}

// ==============================
// PAGE NAVIGATION
// ==============================

function go(page) {
  if (!pages.includes(page)) return;

  pages.forEach(p => {
    const element = $("#" + p + "Page");

    if (element) {
      element.classList.toggle("hidden", p !== page);
    }
  });

  $$(".nav-item[data-page]").forEach(b => {
    b.classList.toggle("active", b.dataset.page === page);
  });

  const pageTitle = $("#pageTitle");

  if (pageTitle) {
    pageTitle.textContent = ({
      home: lang === "ar" ? "الرئيسية" : "Home",
      tools: lang === "ar" ? "كل الأدوات" : "All tools",
      saved: lang === "ar" ? "المفضلة" : "Favorites"
    })[page];
  }

  $("#sidebar")?.classList.remove("open");

  window.scrollTo(0, 0);
}

$$("[data-page]").forEach(b => {
  b.addEventListener("click", e => {
    e.preventDefault();
    go(b.dataset.page);
  });
});

// ==============================
// MOBILE MENU
// ==============================

if ($("#menuBtn")) {
  $("#menuBtn").onclick = () => {
    $("#sidebar")?.classList.toggle("open");
  };
}

// ==============================
// DARK / LIGHT MODE
// ==============================

if ($("#themeBtn")) {
  $("#themeBtn").onclick = () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");
    const themeText = $("#themeBtn b");

    if (themeText) {
      themeText.textContent = isDark
        ? (lang === "ar" ? "الوضع الفاتح" : "Light mode")
        : (lang === "ar" ? "الوضع الليلي" : "Dark mode");
    }
  };
}

// ==============================
// LANGUAGE
// ==============================

if ($("#langBtn")) {
  $("#langBtn").onclick = () => {
    lang = lang === "ar" ? "en" : "ar";

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    $$("[data-ar][data-en]").forEach(el => {
      el.innerHTML = el.dataset[lang];
    });

    $$("[data-ar-placeholder][data-en-placeholder]").forEach(el => {
      el.placeholder = lang === "ar"
        ? el.dataset.arPlaceholder
        : el.dataset.enPlaceholder;
    });

    const langText = $("#langBtn b");
    if (langText) {
      langText.textContent =
        lang === "ar" ? "English" : "العربية";
    }

    const themeText = $("#themeBtn b");

    if (themeText) {
      const isDark = document.body.classList.contains("dark");

      themeText.textContent = isDark
        ? (lang === "ar" ? "الوضع الفاتح" : "Light mode")
        : (lang === "ar" ? "الوضع الليلي" : "Dark mode");
    }

    go("home");
  };
}

// ==============================
// LOGOUT
// ==============================

if ($("#logoutBtn")) {
  $("#logoutBtn").onclick = () => {
    if (confirm(lang === "ar" ? "تأكيد تسجيل الخروج؟" : "Sign out?")) {
      toast(
        lang === "ar"
          ? "تم إنهاء العرض التجريبي. اربط نظام تسجيل الدخول قبل النشر."
          : "Demo session ended. Connect authentication before launch."
      );
    }
  };
}

// ==============================
// MODAL
// ==============================

const modal = $("#modal");
const mc = $("#modalContent");

if ($("#modalClose") && modal) {
  $("#modalClose").onclick = () => {
    modal.classList.add("hidden");
  };
}

if (modal) {
  modal.addEventListener("click", e => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
}

// ==============================
// SECURITY HELPER
// ==============================

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// ==============================
// CV TEMPLATE CSS
// ==============================

function getCVTemplateCSS() {
  return `
    .cv-sheet {
      width: 100%;
      max-width: 800px;
      margin: 15px auto;
      padding: 30px 34px;
      background: #fff;
      color: #171717;
      border: 1px solid #ddd;
      font-family: Arial, Tahoma, sans-serif;
      font-size: 13px;
      line-height: 1.55;
      direction: ltr;
      text-align: left;
      overflow-wrap: anywhere;
      box-sizing: border-box;
    }

    .cv-title {
      text-align: center;
      font-size: 23px;
      font-variant: small-caps;
      font-weight: bold;
      margin: 0 0 22px;
    }

    .cv-header {
      display: flex;
      flex-direction: row;
      gap: 22px;
      align-items: flex-start;
      border-bottom: 1px solid #555;
      padding-bottom: 18px;
      min-height: 145px;
    }

    .cv-photo {
      order: 2;
      flex: 0 0 112px;
      width: 112px;
      height: 132px;
      object-fit: cover;
      border: 0;
    }

    .cv-person {
      order: 1;
      flex: 1;
      min-width: 0;
      padding-top: 30px;
    }

    .cv-person h2 {
      font-size: 15px;
      margin: 0 0 2px;
      text-align: left;
      text-transform: uppercase;
    }

    .cv-person h3 {
      font-size: 13px;
      margin: 0 0 2px;
      font-weight: normal;
    }

    .cv-contact {
      font-size: 12px;
      line-height: 1.45;
    }

    .cv-section {
      padding: 13px 0 12px;
      border-bottom: 1px solid #777;
      break-inside: avoid;
    }

    .cv-section h3 {
      margin: 0 0 5px;
      font-size: 13px;
      font-weight: bold;
      text-transform: none;
    }

    .cv-entries {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .cv-entry {
      display: grid;
      grid-template-columns: 105px minmax(0, 1fr);
      gap: 15px;
      align-items: start;
      padding-left: 14px;
      position: relative;
    }

    .cv-entry::before {
      content: "•";
      position: absolute;
      left: 0;
      top: 0;
    }

    .cv-date {
      font-weight: normal;
      white-space: pre-wrap;
    }

    .cv-description {
      white-space: pre-wrap;
    }

    @media(max-width:600px) {
      .cv-sheet {
        padding: 18px;
      }

      .cv-header {
        gap: 12px;
      }

      .cv-photo {
        flex-basis: 85px;
        width: 85px;
        height: 105px;
      }

      .cv-person {
        padding-top: 10px;
      }

      .cv-entry {
        grid-template-columns: 85px minmax(0, 1fr);
        gap: 8px;
      }
    }

    @page {
      size: A4;
      margin: 15mm;
    }

    @media print {
      .cv-sheet {
        border: 0;
        margin: 0;
        max-width: none;
        width: 100%;
        padding: 0;
      }
    }
  `;
}

// ==============================
// BUILD CV
// ==============================

function buildCV(data, labels = {}) {
  const L = {
    title: labels.title || "Curriculum Vitae",
    email: labels.email || "Email",
    phone: labels.phone || "Phone",
    address: labels.address || "Address",
    education: labels.education || "Education",
    experience: labels.experience || "Employment experience",
    skills: labels.skills || "Skills",
    languages: labels.languages || "Languages",
    additional: labels.additional || "Additional abilities and qualities",
    hobbies: labels.hobbies || "Hobbies"
  };

  const photo = data.photo
    ? `<img class="cv-photo" src="${safe(data.photo)}" alt="Profile photo">`
    : "";

  const sections = [
    ["education", L.education],
    ["experience", L.experience],
    ["languages", L.languages],
    ["additional", L.additional],
    ["skills", L.skills],
    ["hobbies", L.hobbies]
  ];

  const renderEntries = value => {
    if (!value) return "";

    return String(value)
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split(/\s+\|\s+/, 2);
        const hasDate = parts.length === 2;

        return `
          <div class="cv-entry">
            <span class="cv-date">${hasDate ? safe(parts[0]) : ""}</span>
            <span class="cv-description">${safe(hasDate ? parts[1] : line)}</span>
          </div>
        `;
      })
      .join("");
  };

  return `
    <div class="result cv-sheet">
      <div class="cv-title">${safe(L.title)}</div>

      <div class="cv-header">
        <div class="cv-person">
          <h2>${safe(data.name || "")}</h2>
          <h3>${safe(data.job || "")}</h3>

          <div class="cv-contact">
            ${data.email ? `${safe(L.email)}: ${safe(data.email)}<br>` : ""}
            ${data.phone ? `${safe(L.phone)}: ${safe(data.phone)}<br>` : ""}
            ${data.address ? `${safe(L.address)}: ${safe(data.address)}` : ""}
          </div>
        </div>

        ${photo}
      </div>

      ${sections.map(([key, label]) => data[key]
        ? `
          <section class="cv-section">
            <h3>${safe(label)}</h3>
            <div class="cv-entries">
              ${renderEntries(data[key])}
            </div>
          </section>
        `
        : ""
      ).join("")}
    </div>
  `;
}

// ==============================
// DOWNLOAD CV
// ==============================

function downloadCV(title, content, direction = "ltr") {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    toast("من فضلك اسمح بفتح النوافذ المنبثقة للتحميل.");
    return;
  }

  printWindow.document.open();

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en" dir="${direction}">
    <head>
      <meta charset="UTF-8">
      <title>${safe(title)}</title>

      <style>
        * {
          box-sizing: border-box;
        }

        body {
          font-family: Arial, Tahoma, sans-serif;
          background: #fff;
          color: #222;
          padding: 25px;
          line-height: 1.65;
        }

        ${getCVTemplateCSS()}

        @page {
          size: A4;
          margin: 15mm;
        }

        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>

    <body>${content}</body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

// ==============================
// PARSE TRANSLATED CV
// ==============================

function parseTranslatedCV(text) {
  if (typeof text === "object" && text !== null) {
    return text;
  }

  let cleaned = String(text || "").trim();

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");

    if (first !== -1 && last > first) {
      try {
        return JSON.parse(cleaned.slice(first, last + 1));
      } catch (e) {
        // النص ليس JSON صالحًا.
      }
    }
  }

  return null;
}

// ==============================
// TRANSLATED CV
// ==============================

function renderTranslatedCV(data, originalText, targetLanguage) {
  const labels = {
    Arabic: {
      name: "الاسم",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      address: "مكان الإقامة",
      job: "المسمى الوظيفي",
      education: "المؤهل الدراسي",
      experience: "الخبرات العملية",
      skills: "المهارات",
      languages: "اللغات",
      additional: "قدرات إضافية ومهارات",
      hobbies: "الهوايات",
      title: "Curriculum Vitae"
    },

    English: {
      name: "Full Name",
      email: "Email",
      phone: "Phone",
      address: "Location",
      job: "Job Title",
      education: "Education",
      experience: "Work Experience",
      skills: "Skills",
      languages: "Languages",
      additional: "Additional abilities and qualities",
      hobbies: "Hobbies",
      title: "Curriculum Vitae"
    },

    French: {
      name: "Nom complet",
      email: "E-mail",
      phone: "Téléphone",
      address: "Adresse",
      job: "Poste",
      education: "Formation",
      experience: "Expérience professionnelle",
      skills: "Compétences",
      languages: "Langues",
      additional: "Compétences supplémentaires",
      hobbies: "Loisirs",
      title: "Curriculum Vitae"
    },

    German: {
      name: "Vollständiger Name",
      email: "E-Mail",
      phone: "Telefon",
      address: "Wohnort",
      job: "Berufsbezeichnung",
      education: "Ausbildung",
      experience: "Berufserfahrung",
      skills: "Fähigkeiten",
      languages: "Sprachen",
      additional: "Zusätzliche Fähigkeiten",
      hobbies: "Hobbys",
      title: "Curriculum Vitae"
    },

    Spanish: {
      name: "Nombre completo",
      email: "Correo electrónico",
      phone: "Teléfono",
      address: "Ubicación",
      job: "Puesto de trabajo",
      education: "Educación",
      experience: "Experiencia laboral",
      skills: "Habilidades",
      languages: "Idiomas",
      additional: "Habilidades adicionales",
      hobbies: "Aficiones",
      title: "Curriculum Vitae"
    },

    Italian: {
      name: "Nome completo",
      email: "Email",
      phone: "Telefono",
      address: "Località",
      job: "Posizione lavorativa",
      education: "Istruzione",
      experience: "Esperienza lavorativa",
      skills: "Competenze",
      languages: "Lingue",
      additional: "Competenze aggiuntive",
      hobbies: "Hobby",
      title: "Curriculum Vitae"
    },

    Turkish: {
      name: "Ad Soyad",
      email: "E-posta",
      phone: "Telefon",
      address: "Konum",
      job: "İş Unvanı",
      education: "Eğitim",
      experience: "İş Deneyimi",
      skills: "Beceriler",
      languages: "Diller",
      additional: "Ek beceriler",
      hobbies: "Hobiler",
      title: "Curriculum Vitae"
    },

    Russian: {
      name: "Полное имя",
      email: "Электронная почта",
      phone: "Телефон",
      address: "Местоположение",
      job: "Должность",
      education: "Образование",
      experience: "Опыт работы",
      skills: "Навыки",
      languages: "Языки",
      additional: "Дополнительные навыки",
      hobbies: "Хобби",
      title: "Curriculum Vitae"
    },

    Chinese: {
      name: "姓名",
      email: "电子邮箱",
      phone: "电话",
      address: "居住地",
      job: "职位",
      education: "教育背景",
      experience: "工作经验",
      skills: "技能",
      languages: "语言",
      additional: "其他能力",
      hobbies: "爱好",
      title: "Curriculum Vitae"
    }
  };

  const L = labels[targetLanguage] || labels.English;

  if (data && typeof data === "object" && !Array.isArray(data)) {
    data.additional =
      data.additional ||
      data.abilities ||
      data.additionalAbilities ||
      "";

    data.hobbies =
      data.hobbies ||
      data.interests ||
      "";
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return `
      <div class="result cv-sheet">
        <h2>${safe(L.title)}</h2>
        <pre>${safe(originalText)}</pre>
      </div>
    `;
  }

  return buildCV(data, L);
}

// ==============================
// OPEN TOOL
// ==============================

function openTool(tool) {
  if (!mc || !modal) {
    console.error("Modal or modalContent was not found in index.html");
    return;
  }

  const configs = {
    cv: {
      title: "إنشاء CV احترافي",
      desc: "أنشئ سيرتك الذاتية بطريقة احترافية وسهلة.",
      fields: [
        ["الاسم بالكامل", "name"],
        ["البريد الإلكتروني", "email"],
        ["رقم الهاتف", "phone"],
        ["مكان الإقامة", "address"],
        ["المسمى الوظيفي", "job"],
        ["المؤهل الدراسي", "education"],
        ["الخبرات العملية", "experience"],
        ["المهارات", "skills"],
        ["اللغات", "languages"],
        ["القدرات الإضافية", "additional"],
        ["الهوايات", "hobbies"]
      ]
    },

    calories: {
      title: "قياس السعرات",
      desc: "تقدير عام للسعرات؛ النتائج ليست نصيحة طبية.",
      fields: [
        ["النوع (ذكر/أنثى)", "sex"],
        ["العمر بالسنوات", "age"],
        ["الوزن بالكيلو", "weight"],
        ["الطول بالسنتيمتر", "height"]
      ]
    },

    installments: {
      title: "حساب الأقساط",
      desc: "احسب القسط الشهري بدون فوائد إضافية.",
      fields: [
        ["إجمالي المبلغ بالجنيه", "amount"],
        ["المقدم بالجنيه", "down"],
        ["عدد الشهور", "months"]
      ]
    },

    games: {
      title: "الألعاب",
      desc: "لعبة تخمين رقم بسيطة. اختار رقم من 1 إلى 5.",
      fields: [
        ["تخمينك", "guess"]
      ]
    }
  };

  const c = configs[tool];

  if (!c) return;

  mc.innerHTML = `
    <h2>${c.title}</h2>
    <p>${c.desc}</p>

    ${c.fields.map(([label, id]) => `
      <div class="field">
        <label>${label}</label>

        ${[
          "experience",
          "skills",
          "education",
          "languages",
          "additional",
          "hobbies"
        ].includes(id)
          ? `
            <textarea
              id="f-${id}"
              rows="3"
              placeholder="كل سطر في سطر منفصل. وللتاريخ اكتب: التاريخ | التفاصيل"
            ></textarea>
          `
          : `
            <input
              id="f-${id}"
              ${[
                "age",
                "weight",
                "height",
                "amount",
                "down",
                "months",
                "guess"
              ].includes(id) ? 'type="number"' : ""}
            >
          `
        }
      </div>
    `).join("")}

    ${tool === "cv" ? `
      <div class="field">
        <label>الصورة الشخصية (اختياري):</label>
        <input id="f-photo" type="file" accept="image/*">
      </div>

      <div class="field">
        <label>ترجمة السيرة الذاتية إلى:</label>

        <select id="cvLanguage">
          <option value="Arabic">العربية</option>
          <option value="English" selected>الإنجليزية</option>
          <option value="French">الفرنسية</option>
          <option value="German">الألمانية</option>
          <option value="Spanish">الإسبانية</option>
          <option value="Italian">الإيطالية</option>
          <option value="Turkish">التركية</option>
          <option value="Russian">الروسية</option>
          <option value="Chinese">الصينية</option>
        </select>
      </div>

      <button class="primary-btn" id="translateCV">
        ترجمة السيرة الذاتية
      </button>

      <div id="cvTranslationResult"></div>
    ` : ""}

    <button class="primary-btn" id="toolRun">تنفيذ</button>

    <div id="toolResult"></div>
  `;

  modal.classList.remove("hidden");

  // ============================
  // CV TRANSLATION
  // ============================

  if (tool === "cv") {
    $("#translateCV").onclick = async () => {
      const cvData = {
        name: $("#f-name").value.trim(),
        email: $("#f-email").value.trim(),
        phone: $("#f-phone").value.trim(),
        address: $("#f-address").value.trim(),
        job: $("#f-job").value.trim(),
        education: $("#f-education").value.trim(),
        experience: $("#f-experience").value.trim(),
        skills: $("#f-skills").value.trim(),
        languages: $("#f-languages").value.trim(),
        additional: $("#f-additional").value.trim(),
        hobbies: $("#f-hobbies").value.trim()
      };

      const targetLanguage = $("#cvLanguage").value;
      const resultBox = $("#cvTranslationResult");
      const translateButton = $("#translateCV");

      if (!cvData.name || !cvData.job) {
        resultBox.textContent =
          "من فضلك اكتب الاسم والمسمى الوظيفي على الأقل.";
        return;
      }

      translateButton.disabled = true;
      translateButton.textContent = "جاري الترجمة...";
      resultBox.textContent = "انتظر، جاري ترجمة السيرة الذاتية...";

      try {
        const response = await fetch("/api/translate-cv", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            cvData,
            targetLanguage
          })
        });

        let data;

        try {
          data = await response.json();
        } catch (error) {
          throw new Error("السيرفر أرسل استجابة غير مفهومة.");
        }

        if (!response.ok) {
          throw new Error(
            data.error || "فشلت عملية الترجمة. حاول مرة أخرى."
          );
        }

        const translatedText = data.translatedCV || "";
        const translatedData = parseTranslatedCV(translatedText);

        if (translatedData && typeof translatedData === "object") {
          const photoFile = $("#f-photo")?.files?.[0];

          if (photoFile) {
            translatedData.photo = await new Promise((resolve, reject) => {
              const reader = new FileReader();

              reader.onload = () => resolve(reader.result);
              reader.onerror = () => reject(
                new Error("تعذر قراءة الصورة الشخصية.")
              );

              reader.readAsDataURL(photoFile);
            });
          }
        }

        resultBox.innerHTML = `
          ${renderTranslatedCV(
            translatedData,
            translatedText,
            targetLanguage
          )}

          <button class="primary-btn" id="downloadTranslatedCV">
            تحميل PDF
          </button>
        `;

        $("#downloadTranslatedCV").onclick = () => {
          const cvContent = resultBox.querySelector(".result");

          if (cvContent) {
            downloadCV(
              "Translated CV",
              cvContent.outerHTML,
              targetLanguage === "Arabic" ? "rtl" : "ltr"
            );
          }
        };

      } catch (error) {
        console.error("CV Translation Error:", error);

        resultBox.textContent =
          error.message || "حصلت مشكلة أثناء الترجمة. حاول تاني.";

      } finally {
        translateButton.disabled = false;
        translateButton.textContent = "ترجمة السيرة الذاتية";
      }
    };
  }

  // ============================
  // RUN TOOLS
  // ============================

  $("#toolRun").onclick = () => {
    let out = "";

    if (tool === "installments") {
      const a = +$("#f-amount").value;
      const d = +$("#f-down").value;
      const m = +$("#f-months").value;

      out = a > 0 && d >= 0 && d < a && m > 0
        ? `القسط الشهري: ${((a - d) / m).toLocaleString("ar-EG", {
            maximumFractionDigits: 2
          })} جنيه`
        : "راجع المبلغ والمقدم وعدد الشهور.";
    }

    else if (tool === "calories") {
      const age = +$("#f-age").value;
      const w = +$("#f-weight").value;
      const h = +$("#f-height").value;
      const sex = $("#f-sex").value.trim().toLowerCase();

      if (age > 0 && w > 0 && h > 0 && sex) {
        const isMale =
          sex.includes("ذكر") || sex.includes("male");

        const base =
          10 * w + 6.25 * h - 5 * age +
          (isMale ? 5 : -161);

        out = `
          معدل الأيض الأساسي التقريبي:
          ${Math.round(base)} سعرة يوميًا.
          احتياجك الفعلي يتغير حسب النشاط وعوامل أخرى.
        `;
      } else {
        out = "من فضلك املأ البيانات بأرقام صحيحة.";
      }
    }

    else if (tool === "games") {
      const g = +$("#f-guess").value;
      const n = Math.floor(Math.random() * 5) + 1;

      out = g === n
        ? `صح عليك! الرقم كان ${n} 🎉`
        : `حاول تاني! الرقم كان ${n}.`;
    }

    else if (tool === "cv") {
      const cvData = {
        name: $("#f-name").value.trim(),
        email: $("#f-email").value.trim(),
        phone: $("#f-phone").value.trim(),
        address: $("#f-address").value.trim(),
        job: $("#f-job").value.trim(),
        education: $("#f-education").value.trim(),
        experience: $("#f-experience").value.trim(),
        skills: $("#f-skills").value.trim(),
        languages: $("#f-languages").value.trim(),
        additional: $("#f-additional").value.trim(),
        hobbies: $("#f-hobbies").value.trim()
      };

      if (!cvData.name || !cvData.job) {
        out = "من فضلك اكتب الاسم والمسمى الوظيفي على الأقل.";
      } else {
        const file = $("#f-photo")?.files?.[0];

        const showCV = (photo = "") => {
          cvData.photo = photo;

          $("#toolResult").innerHTML = `
            ${buildCV(cvData, {
              title: "Curriculum Vitae",
              email: "e-mail",
              phone: "Phone",
              address: "Website / Address",
              education: "Education",
              experience: "Employment experience",
              languages: "Languages",
              additional: "Additional abilities and qualities",
              skills: "Skills",
              hobbies: "Hobbies"
            })}

            <button class="primary-btn" id="downloadOriginalCV">
              تحميل PDF
            </button>
          `;

          $("#downloadOriginalCV").onclick = () => {
            const cvContent = $("#toolResult .result");

            if (cvContent) {
              downloadCV(
                "My CV",
                cvContent.outerHTML,
                "ltr"
              );
            }
          };
        };

        if (file) {
          const reader = new FileReader();

          reader.onload = () => showCV(reader.result);

          reader.onerror = () => {
            $("#toolResult").textContent =
              "تعذر قراءة الصورة الشخصية.";
          };

          reader.readAsDataURL(file);
          return;
        }

        showCV();
      }
    }

    else {
      out = "قريبًا هنضيف أدوات الملفات هنا.";
    }

    if (tool !== "cv" || out) {
      $("#toolResult").textContent = out;
    }
  };
}

// ==============================
// OPEN BASIC TOOLS
// ==============================

$$("[data-tool]").forEach(b => {
  b.addEventListener("click", e => {
    e.preventDefault();
    openTool(b.dataset.tool);
  });
});

// ملاحظة:
// تشغيل الأدوات الجديدة مسؤولية extra-tools.js فقط.
// لا تضف هنا مستمعًا آخر لـ data-extra-tool.
