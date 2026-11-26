
(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const isArabic = () => document.documentElement.lang === "ar";

  const messages = {
    ar: {
      chooseFile: "اختار ملف",
      download: "تحميل",
      process: "تنفيذ",
      copied: "تم النسخ",
      error: "حصل خطأ، حاول مرة تانية",
      noFile: "اختار ملف الأول",
      saved: "تم الحفظ بنجاح",
      deleted: "تم الحذف",
      empty: "لا توجد بيانات",
      result: "النتيجة"
    },
    en: {
      chooseFile: "Choose file",
      download: "Download",
      process: "Process",
      copied: "Copied",
      error: "Something went wrong. Try again.",
      noFile: "Please choose a file first",
      saved: "Saved successfully",
      deleted: "Deleted",
      empty: "No data available",
      result: "Result"
    }
  };

  const t = (key) => messages[isArabic() ? "ar" : "en"][key] || key;
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  function notify(message) {
    if (typeof window.toast === "function") {
      window.toast(message);
      return;
    }

    const toast = $("#toast");
    if (toast) {
      toast.textContent = message;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2500);
    } else {
      alert(message);
    }
  }

  function showTool(title, html) {
    const modal = $("#modal");
    const content = $("#modalContent");

    if (!modal || !content) {
      notify(t("error"));
      return;
    }

    content.innerHTML = `
      <div class="extra-tool-content">
        <h2>${esc(title)}</h2>
        ${html}
      </div>
    `;

    if (typeof window.openModal === "function") {
      window.openModal();
    } else {
      modal.classList.add("show");
      modal.style.display = "flex";
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function downloadText(text, filename, type = "text/plain") {
    downloadBlob(new Blob([text], { type }), filename);
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function readFileAsArrayBuffer(file) {
    return file.arrayBuffer();
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Image could not be loaded"));
      };

      image.src = url;
    });
  }

  function fileInput(accept, multiple = false) {
    return `<input type="file" id="extraFile" accept="${accept}" ${multiple ? "multiple" : ""}>`;
  }

  function actionButton(label, id = "extraAction") {
    return `<button type="button" class="btn primary" id="${id}">${esc(label)}</button>`;
  }

  // ضغط الصور
  function imageCompress() {
    showTool("ضغط الصور", `
      ${fileInput("image/*")}
      <label>جودة الصورة: <span id="qualityValue">70%</span></label>
      <input type="range" id="imageQuality" min="10" max="100" value="70">
      ${actionButton("ضغط الصورة")}
      <div id="imageResult"></div>
    `);

    $("#imageQuality")?.addEventListener("input", (event) => {
      $("#qualityValue").textContent = `${event.target.value}%`;
    });

    $("#extraAction")?.addEventListener("click", async () => {
      const file = $("#extraFile")?.files[0];
      if (!file) return notify(t("noFile"));

      try {
        const image = await loadImage(file);
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        canvas.getContext("2d").drawImage(image, 0, 0);

        const quality = Number($("#imageQuality").value) / 100;
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", quality)
        );

        if (!blob) throw new Error("Compression failed");

        downloadBlob(blob, `compressed-${file.name.replace(/\.[^.]+$/, "")}.jpg`);

        $("#imageResult").innerHTML =
          `<p>الحجم الأصلي: ${(file.size / 1024).toFixed(1)} KB</p>
           <p>الحجم الجديد: ${(blob.size / 1024).toFixed(1)} KB</p>`;
      } catch (error) {
        console.error(error);
        notify(t("error"));
      }
    });
  }

  // تغيير أبعاد الصور
  function imageResize() {
    showTool("تغيير حجم الصور", `
      ${fileInput("image/*")}
      <label>العرض بالبكسل</label>
      <input type="number" id="resizeWidth" min="1" placeholder="مثال: 800">
      <label>الارتفاع بالبكسل</label>
      <input type="number" id="resizeHeight" min="1" placeholder="مثال: 600">
      ${actionButton("تغيير الحجم")}
    `);

    $("#extraAction")?.addEventListener("click", async () => {
      const file = $("#extraFile")?.files[0];
      if (!file) return notify(t("noFile"));

      const width = Number($("#resizeWidth").value);
      const height = Number($("#resizeHeight").value);

      if (!width || !height || width < 1 || height < 1) {
        return notify("اكتب العرض والارتفاع بشكل صحيح");
      }

      try {
        const image = await loadImage(file);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(image, 0, 0, width, height);

        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );

        if (!blob) throw new Error("Resize failed");
        downloadBlob(blob, `resized-${file.name.replace(/\.[^.]+$/, "")}.png`);
      } catch (error) {
        console.error(error);
        notify(t("error"));
      }
    });
  }

  // تحويل صيغ الصور
  function imageConvert() {
    showTool("تحويل صيغ الصور", `
      ${fileInput("image/*")}
      <label>الصيغة الجديدة</label>
      <select id="imageFormat">
        <option value="image/png">PNG</option>
        <option value="image/jpeg">JPG</option>
        <option value="image/webp">WEBP</option>
      </select>
      ${actionButton("تحويل الصورة")}
    `);

    $("#extraAction")?.addEventListener("click", async () => {
      const file = $("#extraFile")?.files[0];
      if (!file) return notify(t("noFile"));

      try {
        const image = await loadImage(file);
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext("2d").drawImage(image, 0, 0);

        const mime = $("#imageFormat").value;
        const extension = mime.split("/")[1].replace("jpeg", "jpg");
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, mime, 0.92)
        );

        if (!blob) throw new Error("Conversion failed");
        downloadBlob(blob, `converted-${file.name.replace(/\.[^.]+$/, "")}.${extension}`);
      } catch (error) {
        console.error(error);
        notify(t("error"));
      }
    });
  }

  // إنشاء QR Code
  function qrTool() {
    showTool("إنشاء QR Code", `
      <label>اكتب النص أو الرابط</label>
      <textarea id="qrText" rows="4" placeholder="https://example.com"></textarea>
      ${actionButton("إنشاء QR")}
      <div id="qrResult" style="text-align:center;margin-top:18px"></div>
    `);

    $("#extraAction")?.addEventListener("click", () => {
      const value = $("#qrText").value.trim();
      if (!value) return notify("اكتب النص أو الرابط الأول");

      const result = $("#qrResult");
      result.innerHTML = "";

      if (typeof QRCode === "undefined") {
        return notify("مكتبة QR Code لم يتم تحميلها");
      }

      try {
        new QRCode(result, {
          text: value,
          width: 220,
          height: 220,
          correctLevel: QRCode.CorrectLevel.H
        });

        setTimeout(() => {
          const image = result.querySelector("img");
          const canvas = result.querySelector("canvas");

          const download = document.createElement("button");
          download.className = "btn primary";
          download.textContent = "تحميل QR Code";
          download.style.marginTop = "12px";

          download.addEventListener("click", () => {
            const url = image?.src || canvas?.toDataURL("image/png");
            if (!url) return notify(t("error"));

            const link = document.createElement("a");
            link.href = url;
            link.download = "adawati-qr.png";
            link.click();
          });

          result.appendChild(download);
        }, 300);
      } catch (error) {
        console.error(error);
        notify(t("error"));
      }
    });
  }

  // تنسيق JSON
  function jsonTool() {
    showTool("منسق JSON", `
      <label>أدخل كود JSON</label>
      <textarea id="jsonInput" rows="9" placeholder='{"name":"Adawati"}'></textarea>
      <div class="tool-actions">
        <button class="btn primary" id="formatJson">تنسيق JSON</button>
        <button class="btn" id="minifyJson">ضغط JSON</button>
      </div>
      <textarea id="jsonOutput" rows="9" placeholder="النتيجة" readonly></textarea>
      <button class="btn" id="copyJson">نسخ النتيجة</button>
    `);

    const process = (minify) => {
      try {
        const parsed = JSON.parse($("#jsonInput").value);
        $("#jsonOutput").value = JSON.stringify(parsed, null, minify ? 0 : 2);
      } catch {
        notify("JSON غير صحيح، راجع الأقواس والفواصل");
      }
    };

    $("#formatJson").addEventListener("click", () => process(false));
    $("#minifyJson").addEventListener("click", () => process(true));
    $("#copyJson").addEventListener("click", async () => {
      await navigator.clipboard.writeText($("#jsonOutput").value);
      notify(t("copied"));
    });
  }

  // مولد كلمات المرور
  function passwordTool() {
    showTool("مولد كلمات المرور", `
      <label>طول كلمة المرور</label>
      <input type="number" id="passwordLength" min="6" max="128" value="16">
      <label><input type="checkbox" id="passUpper" checked> حروف كبيرة</label>
      <label><input type="checkbox" id="passLower" checked> حروف صغيرة</label>
      <label><input type="checkbox" id="passNumbers" checked> أرقام</label>
      <label><input type="checkbox" id="passSymbols" checked> رموز</label>
      ${actionButton("إنشاء كلمة المرور")}
      <input type="text" id="passwordOutput" readonly placeholder="كلمة المرور">
      <button class="btn" id="copyPassword">نسخ</button>
    `);

    $("#extraAction").addEventListener("click", () => {
      const length = Number($("#passwordLength").value);
      if (length < 6 || length > 128) {
        return notify("اختار طول من 6 إلى 128");
      }

      let chars = "";
      if ($("#passUpper").checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if ($("#passLower").checked) chars += "abcdefghijklmnopqrstuvwxyz";
      if ($("#passNumbers").checked) chars += "0123456789";
      if ($("#passSymbols").checked) chars += "!@#$%^&*()_+-=[]{}";

      if (!chars) return notify("اختار نوعًا واحدًا على الأقل");

      const random = new Uint32Array(length);
      crypto.getRandomValues(random);

      let password = "";
      for (let i = 0; i < length; i++) {
        password += chars[random[i] % chars.length];
      }

      $("#passwordOutput").value = password;
    });

    $("#copyPassword").addEventListener("click", async () => {
      const value = $("#passwordOutput").value;
      if (!value) return;
      await navigator.clipboard.writeText(value);
      notify(t("copied"));
    });
  }

  // Base64
  function base64Tool() {
    showTool("تحويل Base64", `
      <label>النص</label>
      <textarea id="baseInput" rows="5"></textarea>
      <div class="tool-actions">
        <button class="btn primary" id="toBase64">تحويل إلى Base64</button>
        <button class="btn" id="fromBase64">فك Base64</button>
      </div>
      <textarea id="baseOutput" rows="5" readonly></textarea>
      <button class="btn" id="copyBase">نسخ النتيجة</button>
    `);

    $("#toBase64").addEventListener("click", () => {
      try {
        const bytes = new TextEncoder().encode($("#baseInput").value);
        let binary = "";
        bytes.forEach((byte) => binary += String.fromCharCode(byte));
        $("#baseOutput").value = btoa(binary);
      } catch {
        notify(t("error"));
      }
    });

    $("#fromBase64").addEventListener("click", () => {
      try {
        const binary = atob($("#baseInput").value.trim());
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        $("#baseOutput").value = new TextDecoder().decode(bytes);
      } catch {
        notify("كود Base64 غير صحيح");
      }
    });

    $("#copyBase").addEventListener("click", async () => {
      await navigator.clipboard.writeText($("#baseOutput").value);
      notify(t("copied"));
    });
  }

  // تحويل الصور إلى PDF
  function imagesPdf() {
    showTool("تحويل الصور إلى PDF", `
      ${fileInput("image/*", true)}
      <p>يمكنك اختيار أكثر من صورة، وسيتم وضع كل صورة في صفحة مستقلة.</p>
      ${actionButton("إنشاء PDF")}
    `);

    $("#extraAction").addEventListener("click", async () => {
      const files = [...($("#extraFile").files || [])];
      if (!files.length) return notify(t("noFile"));

      if (!window.jspdf?.jsPDF) {
        return notify("مكتبة PDF غير متاحة");
      }

      try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        for (let i = 0; i < files.length; i++) {
          const image = await loadImage(files[i]);
          const canvas = document.createElement("canvas");
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          canvas.getContext("2d").drawImage(image, 0, 0);

          const data = canvas.toDataURL("image/jpeg", 0.92);
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const ratio = Math.min(
            pageWidth / image.naturalWidth,
            pageHeight / image.naturalHeight
          );

          const width = image.naturalWidth * ratio;
          const height = image.naturalHeight * ratio;
          const x = (pageWidth - width) / 2;
          const y = (pageHeight - height) / 2;

          if (i > 0) pdf.addPage();
          pdf.addImage(data, "JPEG", x, y, width, height);
        }

        pdf.save("adawati-images.pdf");
      } catch (error) {
        console.error(error);
        notify(t("error"));
      }
    });
  }

  // دمج ملفات PDF
  function pdfMerge() {
    showTool("دمج ملفات PDF", `
      ${fileInput("application/pdf", true)}
      <p>اختار ملفين PDF أو أكثر بالترتيب المطلوب.</p>
      ${actionButton("دمج الملفات")}
    `);

    $("#extraAction").addEventListener("click", async () => {
      const files = [...($("#extraFile").files || [])];
      if (files.length < 2) return notify("اختار ملفين PDF على الأقل");

      if (!window.PDFLib) return notify("مكتبة PDF غير متاحة");

      try {
        const merged = await PDFLib.PDFDocument.create();

        for (const file of files) {
          const source = await PDFLib.PDFDocument.load(await readFileAsArrayBuffer(file));
          const pages = await merged.copyPages(source, source.getPageIndices());
          pages.forEach((page) => merged.addPage(page));
        }

        const bytes = await merged.save();
        downloadBlob(new Blob([bytes], { type: "application/pdf" }), "merged.pdf");
      } catch (error) {
        console.error(error);
        notify("تعذر دمج الملفات، تأكد أنها ملفات PDF سليمة");
      }
    });
  }

  // تقسيم PDF إلى ملفات منفصلة
  function pdfSplit() {
    showTool("تقسيم PDF", `
      ${fileInput("application/pdf")}
      <p>سيتم تحميل كل صفحة في ملف PDF منفصل.</p>
      ${actionButton("تقسيم الملف")}
      <div id="splitResult"></div>
    `);

    $("#extraAction").addEventListener("click", async () => {
      const file = $("#extraFile")?.files[0];
      if (!file) return notify(t("noFile"));
      if (!window.PDFLib) return notify("مكتبة PDF غير متاحة");

      try {
        const source = await PDFLib.PDFDocument.load(await readFileAsArrayBuffer(file));
        const count = source.getPageCount();
        const result = $("#splitResult");
        result.innerHTML = `<p>عدد الصفحات: ${count}</p>`;

        for (let i = 0; i < count; i++) {
          const single = await PDFLib.PDFDocument.create();
          const [page] = await single.copyPages(source, [i]);
          single.addPage(page);
          const bytes = await single.save();

          const button = document.createElement("button");
          button.className = "btn";
          button.textContent = `تحميل الصفحة ${i + 1}`;
          button.style.margin = "5px";

          button.addEventListener("click", () => {
            downloadBlob(
              new Blob([bytes], { type: "application/pdf" }),
              `page-${i + 1}.pdf`
            );
          });

          result.appendChild(button);
        }
      } catch (error) {
        console.error(error);
        notify("تعذر تقسيم الملف");
      }
    });
  }

  // مؤقت بومودورو
  let pomodoroInterval = null;
  let pomodoroSeconds = 25 * 60;
  let pomodoroMode = "work";

  function pomodoroTool() {
    clearInterval(pomodoroInterval);
    pomodoroSeconds = 25 * 60;
    pomodoroMode = "work";

    showTool("مؤقت بومودورو", `
      <h3 id="pomodoroMode">وقت التركيز</h3>
      <div id="pomodoroClock" style="font-size:48px;text-align:center;font-weight:bold">25:00</div>
      <div class="tool-actions">
        <button class="btn primary" id="pomodoroStart">ابدأ</button>
        <button class="btn" id="pomodoroPause">إيقاف مؤقت</button>
        <button class="btn" id="pomodoroReset">إعادة</button>
      </div>
    `);

    const updateClock = () => {
      const minutes = Math.floor(pomodoroSeconds / 60);
      const seconds = pomodoroSeconds % 60;
      $("#pomodoroClock").textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    $("#pomodoroStart").addEventListener("click", () => {
      if (pomodoroInterval) return;

      pomodoroInterval = setInterval(() => {
        if (pomodoroSeconds > 0) {
          pomodoroSeconds--;
          updateClock();
        } else {
          clearInterval(pomodoroInterval);
          pomodoroInterval = null;

          if (pomodoroMode === "work") {
            pomodoroMode = "break";
            pomodoroSeconds = 5 * 60;
            $("#pomodoroMode").textContent = "وقت الراحة";
          } else {
            pomodoroMode = "work";
            pomodoroSeconds = 25 * 60;
            $("#pomodoroMode").textContent = "وقت التركيز";
          }

          updateClock();
          notify("انتهت الفترة! ابدأ الفترة التالية.");
        }
      }, 1000);
    });

    $("#pomodoroPause").addEventListener("click", () => {
      clearInterval(pomodoroInterval);
      pomodoroInterval = null;
    });

    $("#pomodoroReset").addEventListener("click", () => {
      clearInterval(pomodoroInterval);
      pomodoroInterval = null;
      pomodoroMode = "work";
      pomodoroSeconds = 25 * 60;
      $("#pomodoroMode").textContent = "وقت التركيز";
      updateClock();
    });
  }

  // حساب GPA
  function gpaTool() {
    showTool("حساب المعدل التراكمي GPA", `
      <label>درجاتك (من 4)</label>
      <div id="gpaRows">
        <div class="gpa-row">
          <input type="number" class="gpa-grade" min="0" max="4" step="0.01" placeholder="الدرجة">
          <input type="number" class="gpa-hours" min="1" placeholder="الساعات">
        </div>
      </div>
      <button class="btn" id="addGpaRow">إضافة مادة</button>
      ${actionButton("احسب المعدل")}
      <h3 id="gpaResult"></h3>
    `);

    $("#addGpaRow").addEventListener("click", () => {
      const row = document.createElement("div");
      row.className = "gpa-row";
      row.innerHTML = `
        <input type="number" class="gpa-grade" min="0" max="4" step="0.01" placeholder="الدرجة">
        <input type="number" class="gpa-hours" min="1" placeholder="الساعات">
        <button type="button" class="btn remove-gpa">حذف</button>
      `;
      $("#gpaRows").appendChild(row);
      row.querySelector(".remove-gpa").addEventListener("click", () => row.remove());
    });

    $("#extraAction").addEventListener("click", () => {
      const grades = [...document.querySelectorAll(".gpa-grade")];
      const hours = [...document.querySelectorAll(".gpa-hours")];

      let totalPoints = 0;
      let totalHours = 0;

      for (let i = 0; i < grades.length; i++) {
        const grade = Number(grades[i].value);
        const hour = Number(hours[i].value);

        if (!grades[i].value || !hours[i].value || grade < 0 || grade > 4 || hour <= 0) {
          return notify("راجع الدرجات والساعات المدخلة");
        }

        totalPoints += grade * hour;
        totalHours += hour;
      }

      $("#gpaResult").textContent =
        `المعدل التراكمي: ${(totalPoints / totalHours).toFixed(2)} من 4`;
    });
  }

  // قائمة المهام
  function tasksTool() {
    const storageKey = "adawati_tasks";

    let tasks = [];
    try {
      tasks = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!Array.isArray(tasks)) tasks = [];
    } catch {
      tasks = [];
    }

    showTool("قائمة المهام", `
      <div class="tool-actions">
        <input type="text" id="taskInput" placeholder="اكتب مهمة جديدة">
        <button class="btn primary" id="addTask">إضافة</button>
      </div>
      <div id="taskList"></div>
    `);

    const save = () => localStorage.setItem(storageKey, JSON.stringify(tasks));

    const render = () => {
      const list = $("#taskList");
      list.innerHTML = "";

      if (!tasks.length) {
        list.innerHTML = `<p>${t("empty")}</p>`;
        return;
      }

      tasks.forEach((task, index) => {
        const item = document.createElement("div");
        item.className = "task-item";
        item.style.cssText =
          "display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid #8884";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;

        const label = document.createElement("span");
        label.textContent = task.text;
        label.style.flex = "1";
        if (task.done) label.style.textDecoration = "line-through";

        const remove = document.createElement("button");
        remove.className = "btn";
        remove.textContent = "حذف";

        checkbox.addEventListener("change", () => {
          tasks[index].done = checkbox.checked;
          save();
          render();
        });

        remove.addEventListener("click", () => {
          tasks.splice(index, 1);
          save();
          render();
        });

        item.append(checkbox, label, remove);
        list.appendChild(item);
      });
    };

    $("#addTask").addEventListener("click", () => {
      const input = $("#taskInput");
      const value = input.value.trim();
      if (!value) return;

      tasks.push({ text: value, done: false });
      input.value = "";
      save();
      render();
      notify(t("saved"));
    });

    $("#taskInput").addEventListener("keydown", (event) => {
      if (event.key === "Enter") $("#addTask").click();
    });

    render();
  }

  // حساب الخصم
  function discountTool() {
    showTool("حساب الخصم", `
      <label>السعر الأصلي</label>
      <input type="number" id="discountPrice" min="0" placeholder="السعر">
      <label>نسبة الخصم %</label>
      <input type="number" id="discountPercent" min="0" max="100" placeholder="مثال: 20">
      ${actionButton("احسب")}
      <h3 id="discountResult"></h3>
    `);

    $("#extraAction").addEventListener("click", () => {
      const price = Number($("#discountPrice").value);
      const percent = Number($("#discountPercent").value);

      if (!$("#discountPrice").value || !$("#discountPercent").value ||
          price < 0 || percent < 0 || percent > 100) {
        return notify("راجع السعر ونسبة الخصم");
      }

      const finalPrice = price * (1 - percent / 100);
      const saved = price - finalPrice;

      $("#discountResult").textContent =
        `السعر بعد الخصم: ${finalPrice.toFixed(2)} — وفرت: ${saved.toFixed(2)}`;
    });
  }

  // حساب النسبة المئوية
  function percentageTool() {
    showTool("حساب النسبة المئوية", `
      <label>الرقم</label>
      <input type="number" id="percentNumber" placeholder="الرقم">
      <label>النسبة %</label>
      <input type="number" id="percentValue" placeholder="النسبة">
      ${actionButton("احسب")}
      <h3 id="percentResult"></h3>
    `);

    $("#extraAction").addEventListener("click", () => {
      const number = Number($("#percentNumber").value);
      const percent = Number($("#percentValue").value);

      if (!$("#percentNumber").value || !$("#percentValue").value) {
        return notify("اكتب الرقم والنسبة");
      }

      $("#percentResult").textContent =
        `${percent}% من ${number} = ${(number * percent / 100).toFixed(2)}`;
    });
  }

  // تحويل العملات بأسعار مباشرة من خدمة خارجية
  function currencyTool() {
    showTool("محول العملات", `
      <label>المبلغ</label>
      <input type="number" id="currencyAmount" min="0" value="1">
      <label>من عملة</label>
      <select id="currencyFrom">
        <option>USD</option><option>EGP</option><option>EUR</option>
        <option>GBP</option><option>SAR</option><option>AED</option>
        <option>CAD</option><option>JPY</option><option>KWD</option>
      </select>
      <label>إلى عملة</label>
      <select id="currencyTo">
        <option>EGP</option><option>USD</option><option>EUR</option>
        <option>GBP</option><option>SAR</option><option>AED</option>
        <option>CAD</option><option>JPY</option><option>KWD</option>
      </select>
      ${actionButton("تحويل")}
      <div id="currencyResult"></div>
      <p>يتم جلب سعر الصرف من الإنترنت، وقد تختلف الأسعار عن أسعار البنوك والصرافة.</p>
    `);

    $("#extraAction").addEventListener("click", async () => {
      const amount = Number($("#currencyAmount").value);
      const from = $("#currencyFrom").value;
      const to = $("#currencyTo").value;

      if (!$("#currencyAmount").value || amount < 0) {
        return notify("اكتب مبلغًا صحيحًا");
      }

      const result = $("#currencyResult");
      result.textContent = "جاري جلب سعر الصرف...";

      try {
        const response = await fetch(
          `https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`
        );

        if (!response.ok) throw new Error("Exchange rate request failed");

        const data = await response.json();
        if (data.result !== "success" || !data.rates?.[to]) {
          throw new Error("Rate unavailable");
        }

        const converted = amount * data.rates[to];
        result.innerHTML =
          `<h3>${amount} ${esc(from)} = ${converted.toFixed(2)} ${esc(to)}</h3>
           <p>سعر الصرف: 1 ${esc(from)} = ${data.rates[to]} ${esc(to)}</p>
           <small>آخر تحديث: ${esc(data.time_last_update_utc || "غير متاح")}</small>`;
      } catch (error) {
        console.error(error);
        result.textContent = "تعذر جلب سعر الصرف. تأكد من اتصال الإنترنت وحاول لاحقًا.";
      }
    });
  }

  const tools = {
    "image-compress": imageCompress,
    "image-resize": imageResize,
    "image-convert": imageConvert,
    "images-pdf": imagesPdf,
    "pdf-merge": pdfMerge,
    "pdf-split": pdfSplit,
    "qr": qrTool,
    "json": jsonTool,
    "password": passwordTool,
    "base64": base64Tool,
    "pomodoro": pomodoroTool,
    "gpa": gpaTool,
    "tasks": tasksTool,
    "discount": discountTool,
    "percentage": percentageTool,
    "currency": currencyTool
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-extra-tool]");
    if (!button) return;

    const toolName = button.dataset.extraTool;
    if (tools[toolName]) {
      tools[toolName]();
    } else {
      notify("الأداة غير موجودة");
    }
  });

  // البحث في الأدوات العامة والإضافية
  const search = $("#toolSearch");

  if (search) {
    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();

      document.querySelectorAll(".tool-card, [data-tool], [data-extra-tool]").forEach((card) => {
        const text = (
          card.textContent + " " +
          (card.dataset.tool || "") + " " +
          (card.dataset.extraTool || "")
        ).toLowerCase();

        card.style.display = text.includes(query) ? "" : "none";
      });
    });
  }

})();
