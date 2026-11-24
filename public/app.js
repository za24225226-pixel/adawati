
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

let lang = "ar";
let currentCVTemplate = "classic";

const pages = ["home", "tools", "saved"];

function toast(msg) {
  const t = $("#toast");
  if (!t) return;

  t.textContent = msg;
  t.classList.add("show");

  setTimeout(() => t.classList.remove("show"), 2600);
}

function go(page) {
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
  b.addEventListener("click", () => go(b.dataset.page));
});

$("#menuBtn").onclick = () => {
  $("#sidebar").classList.toggle("open");
};

$("#themeBtn").onclick = () => {
  document.body.classList.toggle("dark");

  $("#themeBtn b").textContent =
    document.body.classList.contains("dark")
      ? (lang === "ar" ? "الوضع الفاتح" : "Light mode")
      : (lang === "ar" ? "الوضع الليلي" : "Dark mode");
};

$("#langBtn").onclick = () => {
  lang = lang === "ar" ? "en" : "ar";

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  $$("[data-ar][data-en]").forEach(el => {
    el.innerHTML = el.dataset[lang];
  });

  $("#langBtn b").textContent =
    lang === "ar" ? "English" : "العربية";

  go("home");
};

$("#logoutBtn").onclick = () => {
  if (confirm(lang === "ar" ? "تأكيد تسجيل الخروج؟" : "Sign out?")) {
    toast(
      lang === "ar"
        ? "تم إنهاء العرض التجريبي. اربط نظام تسجيل الدخول قبل النشر."
        : "Demo session ended. Connect authentication before launch."
    );
  }
};

const modal = $("#modal");
const mc = $("#modalContent");

$("#modalClose").onclick = () => {
  modal.classList.add("hidden");
};

modal.addEventListener("click", e => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// أسماء القوالب
const cvTemplates = {
  classic: "القالب الكلاسيكي",
  modern: "القالب العصري",
  minimal: "القالب البسيط"
};

// تنسيقات القوالب داخل الموقع وملف PDF
function getCVTemplateCSS() {
  return `
    .cv-template-classic {
      font-family: Arial, Tahoma, sans-serif;
      color: #222;
      border: 1px solid #ddd;
      padding: 28px;
      background: #fff;
    }

    .cv-template-classic h2 {
      color: #243b55;
      border-bottom: 2px solid #243b55;
      padding-bottom: 12px;
    }

    .cv-template-classic h3 {
      color: #243b55;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }

    .cv-template-modern {
      font-family: Arial, Tahoma, sans-serif;
      color: #263445;
      border: 1px solid #dce5ef;
      border-top: 7px solid #557da8;
      padding: 28px;
      background: #f8fbff;
    }

    .cv-template-modern h2 {
      color: #315f8d;
      font-size: 30px;
      letter-spacing: .5px;
    }

    .cv-template-modern h3 {
      color: #426e98;
      background: #e9f1f9;
      padding: 7px 10px;
      border-radius: 5px;
    }

    .cv-template-minimal {
      font-family: Arial, Tahoma, sans-serif;
      color: #333;
      padding: 28px;
      background: #fff;
      border: none;
    }

    .cv-template-minimal h2 {
      color: #222;
      font-size: 28px;
      font-weight: 600;
      text-align: start !important;
      border-bottom: 1px solid #aaa;
      padding-bottom: 12px;
    }

    .cv-template-minimal h3 {
      color: #555;
      font-size: 16px;
      font-weight: 600;
    }

    .cv-template-minimal hr {
      border-top: 1px solid #bbb;
    }

    .cv-template-classic,
    .cv-template-modern,
    .cv-template-minimal {
      max-width: 800px;
      margin: 15px auto;
      line-height: 1.9;
      overflow-wrap: anywhere;
    }

    .cv-template-classic p,
    .cv-template-modern p,
    .cv-template-minimal p {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    @media print {
      .cv-template-classic,
      .cv-template-modern,
      .cv-template-minimal {
        border-radius: 0;
        box-shadow: none;
      }
    }
  `;
}

// معاينة القالب
function renderTemplatePreview(template) {
  const preview = $("#cvTemplatePreview");
  if (!preview) return;

  const names = {
    classic: "أحمد محمد",
    modern: "أحمد محمد",
    minimal: "أحمد محمد"
  };

  const descriptions = {
    classic: "مهندس برمجيات",
    modern: "مهندس برمجيات",
    minimal: "مهندس برمجيات"
  };

  preview.innerHTML = `
    <div class="result cv-template-${template}" style="text-align:start;direction:rtl;">
      <h2>${names[template]}</h2>
      <h3>${descriptions[template]}</h3>
      <hr>
      <h3>المؤهل الدراسي</h3>
      <p>بكالوريوس حاسبات ومعلومات</p>
      <h3>الخبرات العملية</h3>
      <p>خبرة في تطوير المواقع والتطبيقات.</p>
      <h3>المهارات</h3>
      <p>HTML - CSS - JavaScript</p>
    </div>
  `;
}

// تحميل السيرة الذاتية بصيغة PDF
function downloadCV(title, content, direction = "rtl", template = "classic") {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    toast("من فضلك اسمح بفتح النوافذ المنبثقة للتحميل.");
    return;
  }

  printWindow.document.open();

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="${direction === "rtl" ? "ar" : "en"}" dir="${direction}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${safe(title)}</title>

      <style>
        * {
          box-sizing: border-box;
        }

        body {
          font-family: Arial, Tahoma, sans-serif;
          direction: ${direction};
          text-align: ${direction === "rtl" ? "right" : "left"};
          color: #222;
          background: white;
          padding: 35px;
          line-height: 1.9;
        }

        .result {
          max-width: 800px;
          margin: auto;
        }

        h2 {
          text-align: center;
          font-size: 27px;
          margin-bottom: 5px;
        }

        h3 {
          color: #333;
          margin-bottom: 5px;
        }

        p {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        hr {
          border: 0;
          border-top: 1px solid #ddd;
          margin: 18px 0;
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

    <body>
      ${content}
    </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

// تحويل نتيجة Gemini إلى بيانات قابلة للعرض
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
        // نعرض النص العادي إذا لم يكن JSON صالحًا.
      }
    }
  }

  return null;
}

// عرض السيرة الذاتية المترجمة
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
      title: "السيرة الذاتية",
      empty: "غير متوفر"
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
      title: "Professional Resume",
      empty: "Not provided"
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
      title: "Curriculum Vitae",
      empty: "Non renseigné"
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
      title: "Lebenslauf",
      empty: "Nicht angegeben"
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
      title: "Currículum profesional",
      empty: "No proporcionado"
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
      title: "Curriculum professionale",
      empty: "Non specificato"
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
      title: "Özgeçmiş",
      empty: "Belirtilmemiş"
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
      title: "Профессиональное резюме",
      empty: "Не указано"
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
      title: "个人简历",
      empty: "未提供"
    }
  };

  const L = labels[targetLanguage] || labels.English;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return `
      <div class="result cv-template-${currentCVTemplate}">
        <h3>${safe(L.title)}</h3>
        <pre style="white-space:pre-wrap;overflow-wrap:anywhere;">${safe(originalText)}</pre>
      </div>
    `;
  }

  const fields = [
    ["email", "email"],
    ["phone", "phone"],
    ["address", "address"],
    ["education", "education"],
    ["experience", "experience"],
    ["skills", "skills"],
    ["languages", "languages"]
  ];

  const name = data.name || "";
  const job = data.job || "";

  return `
    <div class="result cv-template-${currentCVTemplate}" style="text-align:start;line-height:1.9;">

      <h2 style="text-align:center;margin-bottom:5px;">
        ${safe(name || L.title)}
      </h2>

      ${job ? `
        <h3 style="text-align:center;">
          ${safe(job)}
        </h3>
      ` : ""}

      <hr>

      ${fields.map(([key, label]) => {
        const value = data[key];

        if (!value) return "";

        return `
          <section style="margin:18px 0;">
            <h3>${safe(L[label])}</h3>
            <p style="white-space:pre-wrap;overflow-wrap:anywhere;">
              ${safe(value)}
            </p>
          </section>
        `;
      }).join("")}

    </div>
  `;
}

function openTool(tool) {
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
        ["اللغات", "languages"]
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
    },

    files: {
      title: "أدوات الملفات",
      desc: "هنضيف أدوات PDF والصور في المرحلة التالية.",
      fields: []
    }
  };

  const c = configs[tool];
  if (!c) return;

  if (tool === "cv") {
    currentCVTemplate = "classic";
  }

  mc.innerHTML = `
    <h2>${c.title}</h2>
    <p>${c.desc}</p>

    ${c.fields.map(([label, id]) => `
      <div class="field">
        <label>${label}</label>
        <input
          id="f-${id}"
          ${["experience", "skills", "education", "languages"].includes(id) ? 'placeholder="اكتب هنا..."' : ""}
          ${["age", "weight", "height", "amount", "down", "months", "guess"].includes(id) ? 'type="number"' : ""}
        >
      </div>
    `).join("")}

    ${tool === "cv" ? `
      <div class="field">
        <label>اختر قالب السيرة الذاتية:</label>

        <select id="cvTemplate">
          <option value="classic">القالب الكلاسيكي</option>
          <option value="modern">القالب العصري</option>
          <option value="minimal">القالب البسيط</option>
        </select>
      </div>

      <div class="field">
        <label>معاينة القالب:</label>
        <div id="cvTemplatePreview"></div>
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

  // اختيار القالب وتحديث المعاينة
  if (tool === "cv") {
    renderTemplatePreview(currentCVTemplate);

    $("#cvTemplate").onchange = () => {
      currentCVTemplate = $("#cvTemplate").value;
      renderTemplatePreview(currentCVTemplate);

      // تحديث القالب في النتائج الموجودة
      $$("#toolResult .result, #cvTranslationResult .result").forEach(result => {
        result.classList.remove(
          "cv-template-classic",
          "cv-template-modern",
          "cv-template-minimal"
        );

        result.classList.add("cv-template-" + currentCVTemplate);
      });
    };

    // ترجمة السيرة الذاتية
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
        languages: $("#f-languages").value.trim()
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
              targetLanguage === "Arabic" ? "rtl" : "ltr",
              currentCVTemplate
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

  // تنفيذ الأدوات
  $("#toolRun").onclick = () => {
    let out = "";

    if (tool === "installments") {
      const a = +$("#f-amount").value;
      const d = +$("#f-down").value;
      const m = +$("#f-months").value;

      out = a > 0 && d >= 0 && d < a && m > 0
        ? `القسط الشهري: ${((a - d) / m).toLocaleString("ar-EG", { maximumFractionDigits: 2 })} جنيه`
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

        out = `معدل الأيض الأساسي التقريبي: ${Math.round(base)} سعرة يوميًا. احتياجك الفعلي يتغير حسب النشاط وعوامل أخرى.`;
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
      const name = $("#f-name").value.trim();
      const email = $("#f-email").value.trim();
      const phone = $("#f-phone").value.trim();
      const address = $("#f-address").value.trim();
      const job = $("#f-job").value.trim();
      const education = $("#f-education").value.trim();
      const experience = $("#f-experience").value.trim();
      const skills = $("#f-skills").value.trim();
      const languages = $("#f-languages").value.trim();

      if (!name || !job) {
        out = "من فضلك اكتب الاسم والمسمى الوظيفي على الأقل.";
      } else {
        out = `
          <div class="result cv-template-${currentCVTemplate}">
            <h2>${safe(name)}</h2>
            <h3>${safe(job)}</h3>
            <hr>
            <p><strong>البريد الإلكتروني:</strong> ${safe(email)}</p>
            <p><strong>رقم الهاتف:</strong> ${safe(phone)}</p>
            <p><strong>العنوان:</strong> ${safe(address)}</p>
            <hr>
            <h3>المؤهل الدراسي</h3>
            <p>${safe(education)}</p>
            <h3>الخبرات العملية</h3>
            <p>${safe(experience)}</p>
            <h3>المهارات</h3>
            <p>${safe(skills)}</p>
            <h3>اللغات</h3>
            <p>${safe(languages)}</p>
          </div>
        `;
      }
    }

    else {
      out = "قريبًا هنضيف أدوات الملفات هنا.";
    }

    if (tool === "cv" && out.includes('class="result')) {
      $("#toolResult").innerHTML = `
        ${out}

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
            "rtl",
            currentCVTemplate
          );
        }
      };
    } else {
      $("#toolResult").innerHTML = out;
    }
  };
}

$$("[data-tool]").forEach(b => {
  b.addEventListener("click", () => openTool(b.dataset.tool));
});
