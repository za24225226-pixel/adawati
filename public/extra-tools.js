
(() => {
  const $ = (selector) => document.querySelector(selector);
  const modal = $("#modal");
  const content = $("#modalContent");

  const show = (title, description, fields, buttonText = "تنفيذ") => {
    content.innerHTML = `
      <h2>${title}</h2>
      <p>${description}</p>
      ${fields}
      <button class="extra-tool-button" id="extraRun">${buttonText}</button>
      <div id="extraResult"></div>
    `;
    modal.classList.remove("hidden");
  };

  const field = (label, id, type = "text", placeholder = "") => `
    <div class="extra-field">
      <label for="${id}">${label}</label>
      <input id="${id}" type="${type}" placeholder="${placeholder}">
    </div>
  `;

  const fileField = (label, id, multiple = false, accept = "*/*") => `
    <div class="extra-field">
      <label for="${id}">${label}</label>
      <input class="extra-file" id="${id}" type="file"
        accept="${accept}" ${multiple ? "multiple" : ""}>
    </div>
  `;

  const output = (html) => {
    const box = $("#extraResult");
    if (box) box.innerHTML = `<div class="extra-result">${html}</div>`;
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const readFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("تعذرت قراءة الملف."));
    reader.readAsArrayBuffer(file);
  });

  const imageFromFile = (file) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("تعذر فتح الصورة."));
    };
    image.src = url;
  });

  const canvasBlob = (canvas, type, quality) => new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });

  function openExtraTool(tool) {
    switch (tool) {
      case "image-compress":
      case "image-resize":
      case "image-convert": {
        const isResize = tool === "image-resize";
        const isConvert = tool === "image-convert";

        show(
          isResize ? "تغيير مقاس الصورة" : isConvert ? "تحويل صيغة الصورة" : "ضغط الصور",
          "اختر صورة من جهازك، والمعالجة تتم داخل المتصفح.",
          fileField("اختر الصورة", "extraImage", false, "image/*") +
          (isResize ? field("العرض بالبكسل", "imageWidth", "number", "مثلاً 800") +
            field("الارتفاع بالبكسل", "imageHeight", "number", "مثلاً 600") : "") +
          (isConvert ? `
            <div class="extra-field">
              <label>الصيغة الجديدة</label>
              <select id="imageFormat">
                <option value="image/jpeg">JPG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
              </select>
            </div>` : "") +
          (!isResize && !isConvert ? `
            <div class="extra-field">
              <label>جودة الصورة</label>
              <input id="imageQuality" type="range" min="10" max="100" value="70">
            </div>` : "")
        );

        $("#extraRun").onclick = async () => {
          try {
            const file = $("#extraImage").files[0];
            if (!file) return output("اختار صورة الأول.");

            const img = await imageFromFile(file);
            const canvas = document.createElement("canvas");

            canvas.width = isResize ? Number($("#imageWidth").value) : img.naturalWidth;
            canvas.height = isResize ? Number($("#imageHeight").value) : img.naturalHeight;

            if (!canvas.width || !canvas.height || canvas.width > 10000 || canvas.height > 10000) {
              return output("اكتب مقاسات صحيحة أقل من 10000 بكسل.");
            }

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const type = isConvert ? $("#imageFormat").value : "image/jpeg";
            const quality = isResize ? 0.9 :
              isConvert ? 0.9 : Number($("#imageQuality").value) / 100;

            const blob = await canvasBlob(canvas, type, quality);
            if (!blob) return output("تعذر تجهيز الصورة.");

            const extension = type === "image/png" ? "png" :
              type === "image/webp" ? "webp" : "jpg";

            downloadBlob(blob, `adawati-image.${extension}`);
            output("تم تجهيز الصورة وبدأ التحميل.");
          } catch (error) {
            output(error.message);
          }
        };
        break;
      }

      case "qr": {
        show("مولّد QR Code", "اكتب رابطًا أو نصًا لتحويله إلى رمز QR.",
          `<div class="extra-field"><label>الرابط أو النص</label>
          <textarea id="qrText" placeholder="https://example.com"></textarea></div>
          <div id="qrCanvas" style="background:white;padding:15px;display:inline-block;margin-top:12px"></div>`
        );

        $("#extraRun").onclick = () => {
          const text = $("#qrText").value.trim();
          if (!text) return output("اكتب نصًا أو رابطًا الأول.");
          if (!window.QRCode) return output("مكتبة QR لم يتم تحميلها. تأكد من اتصال الإنترنت.");

          $("#qrCanvas").innerHTML = "";
          new QRCode($("#qrCanvas"), {
            text,
            width: 200,
            height: 200,
            correctLevel: QRCode.CorrectLevel.H
          });

          setTimeout(() => {
            const canvas = $("#qrCanvas canvas");
            const img = $("#qrCanvas img");
            const data = canvas ? canvas.toDataURL("image/png") : img?.src;

            if (data) {
              const link = document.createElement("a");
              link.href = data;
              link.download = "adawati-qr.png";
              link.textContent = "تحميل QR Code";
              link.className = "extra-tool-button";
              $("#extraResult").appendChild(link);
            }
          }, 300);

          output("تم إنشاء رمز QR. استخدم زر التحميل أسفل الرمز.");
        };
        break;
      }

      case "json": {
        show("JSON Formatter", "نسّق كود JSON أو تحقق من صحته.",
          `<div class="extra-field"><label>كود JSON</label>
          <textarea id="jsonInput" placeholder='{"name":"Adawati","tools":10}'></textarea></div>
          <div class="extra-field"><label>النتيجة</label>
          <textarea id="jsonOutput" readonly></textarea></div>`
        );

        $("#extraRun").onclick = () => {
          try {
            const parsed = JSON.parse($("#jsonInput").value);
            $("#jsonOutput").value = JSON.stringify(parsed, null, 2);
            output("JSON صحيح وتم تنسيقه.");
          } catch (error) {
            output("JSON غير صحيح: " + error.message);
          }
        };
        break;
      }

      case "password": {
        show("مولّد كلمات المرور", "أنشئ كلمة مرور عشوائية.",
          field("عدد الحروف", "passwordLength", "number", "16") +
          `<div class="extra-field"><label><input type="checkbox" id="passwordSymbols" checked> تضمين الرموز</label></div>
          <div class="extra-field"><label><input type="checkbox" id="passwordNumbers" checked> تضمين الأرقام</label></div>`
        );

        $("#extraRun").onclick = () => {
          const length = Number($("#passwordLength").value);
          if (!Number.isInteger(length) || length < 8 || length > 128) {
            return output("اختار عددًا من 8 إلى 128 حرفًا.");
          }

          let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
          if ($("#passwordNumbers").checked) chars += "0123456789";
          if ($("#passwordSymbols").checked) chars += "!@#$%^&*()-_=+";

          const random = new Uint32Array(length);
          crypto.getRandomValues(random);
          const password = Array.from(random, n => chars[n % chars.length]).join("");

          output(`<p>كلمة المرور:</p><div class="extra-output" id="generatedPassword"></div>
            <button class="extra-tool-button" id="copyPassword">نسخ كلمة المرور</button>`);
          $("#generatedPassword").textContent = password;
          $("#copyPassword").onclick = () => {
            navigator.clipboard.writeText(password)
              .then(() => output("تم نسخ كلمة المرور."));
          };
        };
        break;
      }

      case "base64": {
        show("Base64 Encoder / Decoder", "حوّل النص إلى Base64 أو فك ترميزه.",
          `<div class="extra-field"><label>النص</label><textarea id="baseInput"></textarea></div>
          <div class="extra-field"><label>النتيجة</label><textarea id="baseOutput" readonly></textarea></div>
          <div class="extra-actions">
            <button type="button" id="baseEncode">ترميز</button>
            <button type="button" id="baseDecode">فك الترميز</button>
          </div>`
        );

        $("#extraRun").remove();

        $("#baseEncode").onclick = () => {
          const bytes = new TextEncoder().encode($("#baseInput").value);
          let binary = "";
          bytes.forEach(byte => binary += String.fromCharCode(byte));
          $("#baseOutput").value = btoa(binary);
        };

        $("#baseDecode").onclick = () => {
          try {
            const binary = atob($("#baseInput").value.trim());
            const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
            $("#baseOutput").value = new TextDecoder().decode(bytes);
          } catch {
            output("النص المدخل ليس Base64 صالحًا.");
          }
        };
        break;
      }

      case "images-pdf": {
        show("تحويل الصور إلى PDF", "اختر صورة أو أكثر لإنشاء ملف PDF.",
          fileField("اختر الصور", "pdfImages", true, "image/*")
        );

        $("#extraRun").onclick = async () => {
          try {
            const files = [...$("#pdfImages").files];
            if (!files.length) return output("اختار صورة واحدة على الأقل.");
            if (!window.jspdf?.jsPDF) return output("مكتبة PDF لم يتم تحميلها.");

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();

            for (let i = 0; i < files.length; i++) {
              const img = await imageFromFile(files[i]);
              if (i > 0) pdf.addPage();

              const ratio = Math.min(180 / img.width, 260 / img.height);
              const width = img.width * ratio;
              const height = img.height * ratio;
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              canvas.getContext("2d").drawImage(img, 0, 0);

              pdf.addImage(canvas.toDataURL("image/jpeg", .9), "JPEG",
                (210 - width) / 2, (297 - height) / 2, width, height);
            }

            pdf.save("adawati-images.pdf");
            output("تم إنشاء ملف PDF.");
          } catch (error) {
            output(error.message);
          }
        };
        break;
      }

      case "pdf-merge": {
        show("دمج ملفات PDF", "اختر ملفين PDF أو أكثر لدمجهم.",
          fileField("ملفات PDF", "mergeFiles", true, "application/pdf")
        );

        $("#extraRun").onclick = async () => {
          try {
            const files = [...$("#mergeFiles").files];
            if (files.length < 2) return output("اختار ملفين PDF على الأقل.");
            if (!window.PDFLib) return output("مكتبة PDF لم يتم تحميلها.");

            const merged = await PDFLib.PDFDocument.create();

            for (const file of files) {
              const pdf = await PDFLib.PDFDocument.load(await readFile(file));
              const pages = await merged.copyPages(pdf, pdf.getPageIndices());
              pages.forEach(page => merged.addPage(page));
            }

            const bytes = await merged.save();
            downloadBlob(new Blob([bytes], { type: "application/pdf" }), "adawati-merged.pdf");
            output("تم دمج ملفات PDF.");
          } catch (error) {
            output("تعذر دمج الملفات. تأكد أنها ملفات PDF سليمة.");
          }
        };
        break;
      }

      case "pdf-split": {
        show("تقسيم PDF", "اكتب أرقام الصفحات التي تريد استخراجها، مثال: 1,3,5.",
          fileField("ملف PDF", "splitFile", false, "application/pdf") +
          field("أرقام الصفحات", "splitPages", "text", "1,3,5")
        );

        $("#extraRun").onclick = async () => {
          try {
            const file = $("#splitFile").files[0];
            if (!file) return output("اختار ملف PDF.");
            const source = await PDFLib.PDFDocument.load(await readFile(file));
            const pageNumbers = $("#splitPages").value.split(",")
              .map(x => Number(x.trim()));

            if (!pageNumbers.length || pageNumbers.some(n =>
              !Number.isInteger(n) || n < 1 || n > source.getPageCount())) {
              return output(`أرقام الصفحات لازم تكون من 1 إلى ${source.getPageCount()}.`);
            }

            const result = await PDFLib.PDFDocument.create();
            const pages = await result.copyPages(source, pageNumbers.map(n => n - 1));
            pages.forEach(page => result.addPage(page));

            const bytes = await result.save();
            downloadBlob(new Blob([bytes], { type: "application/pdf" }), "adawati-pages.pdf");
            output("تم استخراج الصفحات المطلوبة.");
          } catch {
            output("تعذر قراءة ملف PDF.");
          }
        };
        break;
      }

      case "pomodoro": {
        show("مؤقت التركيز", "جلسة تركيز 25 دقيقة واستراحة 5 دقائق.",
          `<div class="extra-output" id="pomodoroDisplay" style="font-size:32px;text-align:center">25:00</div>
          <div class="extra-actions">
            <button type="button" id="timerStart">ابدأ</button>
            <button type="button" id="timerPause">إيقاف مؤقت</button>
            <button type="button" id="timerReset">إعادة</button>
          </div>`
        );

        let remaining = 25 * 60;
        let timer = null;

        const renderTime = () => {
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          $("#pomodoroDisplay").textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        };

        $("#timerStart").onclick = () => {
          if (timer) return;
          timer = setInterval(() => {
            remaining--;
            renderTime();
            if (remaining <= 0) {
              clearInterval(timer);
              timer = null;
              alert("انتهت جلسة التركيز! خذ استراحة.");
            }
          }, 1000);
        };

        $("#timerPause").onclick = () => {
          clearInterval(timer);
          timer = null;
        };

        $("#timerReset").onclick = () => {
          clearInterval(timer);
          timer = null;
          remaining = 25 * 60;
          renderTime();
        };
        break;
      }

      case "gpa": {
        show("حساب المعدل", "اكتب درجاتك مفصولة بفاصلة، مثال: 90,85,78.",
          `<div class="extra-field"><label>الدرجات من 100</label>
          <textarea id="gpaGrades" placeholder="90,85,78,95"></textarea></div>`
        );

        $("#extraRun").onclick = () => {
          const values = $("#gpaGrades").value.split(",").map(x => Number(x.trim()));
          if (!values.length || values.some(n => !Number.isFinite(n) || n < 0 || n > 100)) {
            return output("اكتب درجات صحيحة من 0 إلى 100 وافصل بينها بفواصل.");
          }

          const average = values.reduce((a, b) => a + b, 0) / values.length;
          output(`المتوسط: ${average.toFixed(2)}%`);
        };
        break;
      }

      case "tasks": {
        show("قائمة المهام", "أضف مهامك اليومية واحفظها على هذا الجهاز.",
          field("مهمة جديدة", "taskText", "text", "اكتب المهمة") +
          `<div id="taskList" class="extra-output"></div>`
        );

        const storageKey = "adawati_tasks";
        const getTasks = () => {
          try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); }
          catch { return []; }
        };

        const renderTasks = () => {
          const list = $("#taskList");
          if (!list) return;
          const tasks = getTasks();
          list.innerHTML = tasks.length ? "" : "لا توجد مهام حتى الآن.";

          tasks.forEach((task, index) => {
            const row = document.createElement("div");
            row.style.margin = "8px 0";
            const label = document.createElement("span");
            label.textContent = (task.done ? "✓ " : "• ") + task.text + " ";
            if (task.done) label.style.textDecoration = "line-through";

            const done = document.createElement("button");
            done.textContent = task.done ? "إلغاء" : "تم";
            done.onclick = () => {
              const all = getTasks();
              all[index].done = !all[index].done;
              localStorage.setItem(storageKey, JSON.stringify(all));
              renderTasks();
            };

            const remove = document.createElement("button");
            remove.textContent = "حذف";
            remove.onclick = () => {
              const all = getTasks();
              all.splice(index, 1);
              localStorage.setItem(storageKey, JSON.stringify(all));
              renderTasks();
            };

            row.append(label, done, remove);
            list.appendChild(row);
          });
        };

        $("#extraRun").onclick = () => {
          const text = $("#taskText").value.trim();
          if (!text) return output("اكتب المهمة الأول.");
          const tasks = getTasks();
          tasks.push({ text, done: false });
          localStorage.setItem(storageKey, JSON.stringify(tasks));
          $("#taskText").value = "";
          renderTasks();
        };

        renderTasks();
        break;
      }

      case "discount": {
        show("حساب الخصم", "احسب السعر النهائي بعد الخصم.",
          field("السعر الأصلي", "discountPrice", "number", "1000") +
          field("نسبة الخصم %", "discountRate", "number", "20")
        );

        $("#extraRun").onclick = () => {
          const price = Number($("#discountPrice").value);
          const rate = Number($("#discountRate").value);
          if (price < 0 || rate < 0 || rate > 100 || !Number.isFinite(price + rate)) {
            return output("راجع السعر ونسبة الخصم.");
          }
          const finalPrice = price * (1 - rate / 100);
          output(`قيمة الخصم: ${(price - finalPrice).toFixed(2)}<br>السعر بعد الخصم: ${finalPrice.toFixed(2)}`);
        };
        break;
      }

      case "percentage": {
        show("حساب النسبة المئوية", "احسب نسبة رقم من رقم آخر.",
          field("الرقم الأول", "percentPart", "number", "25") +
          field("الرقم الكلي", "percentTotal", "number", "100")
        );

        $("#extraRun").onclick = () => {
          const part = Number($("#percentPart").value);
          const total = Number($("#percentTotal").value);
          if (!Number.isFinite(part) || !Number.isFinite(total) || total === 0) {
            return output("اكتب أرقامًا صحيحة، والرقم الكلي لا يساوي صفرًا.");
          }
          output(`النسبة المئوية: ${(part / total * 100).toFixed(2)}%`);
        };
        break;
      }

      case "currency": {
        show("تحويل العملات", "التحويل يستخدم سعرًا من خدمة خارجية عند توفر الإنترنت.",
          `<div class="extra-field"><label>من عملة</label>
            <select id="currencyFrom"><option>USD</option><option>EGP</option><option>EUR</option><option>GBP</option><option>SAR</option><option>AED</option></select>
          </div>
          <div class="extra-field"><label>إلى عملة</label>
            <select id="currencyTo"><option>EGP</option><option>USD</option><option>EUR</option><option>GBP</option><option>SAR</option><option>AED</option></select>
          </div>` +
          field("المبلغ", "currencyAmount", "number", "100")
        );

        $("#extraRun").onclick = async () => {
          const from = $("#currencyFrom").value;
          const to = $("#currencyTo").value;
          const amount = Number($("#currencyAmount").value);

          if (!(amount >= 0) || !Number.isFinite(amount)) {
            return output("اكتب مبلغًا صحيحًا.");
          }

          const button = $("#extraRun");
          button.disabled = true;
          button.textContent = "جاري جلب السعر...";

          try {
            const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
            if (!response.ok) throw new Error();
            const data = await response.json();
            const rate = data.rates?.[to];
            if (!rate) throw new Error();

            output(`${amount.toLocaleString()} ${from} = ${(amount * rate).toLocaleString(undefined, { maximumFractionDigits: 3 })} ${to}<p class="extra-note">السعر تقريبي وقد يتغير. تحقق من البنك أو مزود التحويل قبل الدفع.</p>`);
          } catch {
            output("تعذر جلب سعر العملة حاليًا. حاول مرة أخرى لاحقًا.");
          } finally {
            button.disabled = false;
            button.textContent = "تنفيذ";
          }
        };
        break;
      }
    }
  }

  document.addEventListener("click", (event) => {
    const card = event.target.closest("[data-extra-tool]");
    if (!card) return;
    openExtraTool(card.dataset.extraTool);
  });

  // البحث داخل صفحة الأدوات
  const search = $("#toolSearch");
  if (search) {
    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();

      document.querySelectorAll("#toolsPage .tool-card").forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? "" : "none";
      });

      document.querySelectorAll("#toolsPage .tool-category").forEach(category => {
        const visibleCards = [...category.querySelectorAll(".tool-card")]
          .some(card => card.style.display !== "none");
        category.style.display = visibleCards ? "" : "none";
      });
    });
  }
})();
