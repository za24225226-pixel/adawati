
(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const lang = () => document.documentElement.lang === "en" ? "en" : "ar";
  const ar = () => lang() === "ar";

  const databaseKey = "adawati_business_data_v1";

  const definitions = [
    {
      id: "employees",
      title: ["الموظفون", "Employees"],
      icon: "👥",
      fields: [
        ["name", "اسم الموظف", "Employee name", "text"],
        ["job", "الوظيفة", "Job title", "text"],
        ["phone", "رقم الهاتف", "Phone", "tel"],
        ["salary", "الراتب الأساسي", "Basic salary", "number"]
      ]
    },
    {
      id: "attendance",
      title: ["الحضور والانصراف", "Attendance"],
      icon: "⏱️",
      fields: [
        ["employee", "اسم الموظف", "Employee name", "employee"],
        ["date", "التاريخ", "Date", "date"],
        ["checkIn", "وقت الحضور", "Check-in time", "time"],
        ["checkOut", "وقت الانصراف", "Check-out time", "time"],
        ["status", "الحالة", "Status", "select",
          ["حاضر", "غائب", "متأخر"],
          ["Present", "Absent", "Late"]]
      ]
    },
    {
      id: "tasks",
      title: ["المهام", "Tasks"],
      icon: "📋",
      fields: [
        ["title", "اسم المهمة", "Task name", "text"],
        ["employee", "المسؤول", "Assigned to", "employee"],
        ["date", "موعد التسليم", "Due date", "date"],
        ["status", "الحالة", "Status", "select",
          ["جديدة", "قيد التنفيذ", "مكتملة"],
          ["New", "In progress", "Completed"]]
      ]
    },
    {
      id: "payroll",
      title: ["الرواتب", "Payroll"],
      icon: "💰",
      fields: [
        ["employee", "اسم الموظف", "Employee name", "employee"],
        ["month", "الشهر", "Month", "month"],
        ["amount", "قيمة الراتب المستحق", "Salary amount", "number"]
      ]
    },
    {
      id: "leaves",
      title: ["الإجازات", "Leaves"],
      icon: "📅",
      fields: [
        ["employee", "اسم الموظف", "Employee name", "employee"],
        ["from", "من تاريخ", "From date", "date"],
        ["to", "إلى تاريخ", "To date", "date"],
        ["status", "الحالة", "Status", "select",
          ["قيد المراجعة", "مقبولة", "مرفوضة"],
          ["Pending", "Approved", "Rejected"]]
      ]
    },
    {
      id: "reports",
      title: ["التقارير", "Reports"],
      icon: "📊",
      report: true
    },
    {
      id: "invoices",
      title: ["الفواتير", "Invoices"],
      icon: "🧾",
      fields: [
        ["number", "رقم الفاتورة", "Invoice number", "text"],
        ["customer", "اسم العميل", "Customer", "text"],
        ["date", "التاريخ", "Date", "date"],
        ["amount", "المبلغ", "Amount", "number"],
        ["status", "الحالة", "Status", "select",
          ["غير مدفوعة", "مدفوعة"],
          ["Unpaid", "Paid"]]
      ]
    },
    {
      id: "inventory",
      title: ["المخزون", "Inventory"],
      icon: "📦",
      fields: [
        ["product", "اسم المنتج", "Product name", "text"],
        ["quantity", "الكمية", "Quantity", "number"],
        ["price", "سعر الوحدة", "Unit price", "number"]
      ]
    },
    {
      id: "expenses",
      title: ["المصروفات", "Expenses"],
      icon: "💸",
      fields: [
        ["category", "نوع المصروف", "Expense category", "text"],
        ["amount", "المبلغ", "Amount", "number"],
        ["date", "التاريخ", "Date", "date"],
        ["note", "ملاحظات", "Notes", "text"]
      ]
    },
    {
      id: "customers",
      title: ["العملاء", "Customers"],
      icon: "🤝",
      fields: [
        ["name", "اسم العميل", "Customer name", "text"],
        ["phone", "رقم الهاتف", "Phone", "tel"],
        ["email", "البريد الإلكتروني", "Email", "email"],
        ["note", "ملاحظات", "Notes", "text"]
      ]
    }
  ];

  function loadData() {
    try {
      const data = JSON.parse(localStorage.getItem(databaseKey) || "{}");
      return data && typeof data === "object" ? data : {};
    } catch {
      return {};
    }
  }

  let database = loadData();

  function saveData() {
    try {
      localStorage.setItem(databaseKey, JSON.stringify(database));
      return true;
    } catch (error) {
      console.error(error);
      notify(ar()
        ? "تعذر حفظ البيانات. مساحة التخزين قد تكون ممتلئة."
        : "Could not save data. Storage may be full.");
      return false;
    }
  }

  function records(id) {
    if (!Array.isArray(database[id])) database[id] = [];
    return database[id];
  }

  function notify(message) {
    if (typeof window.toast === "function") {
      window.toast(message);
    } else {
      alert(message);
    }
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function openWindow(html) {
    if (typeof window.openModal === "function") {
      window.openModal(html);
      return;
    }

    const modal = $("#modal");
    const content = $("#modalContent");

    if (!modal || !content) {
      notify("Modal not found");
      return;
    }

    content.innerHTML = html;
    modal.classList.remove("hidden");
  }

  function label(field) {
    return ar() ? field[1] : field[2];
  }

  function getValue(record, field) {
    const value = record[field[0]];

    if (value === undefined || value === null || value === "") {
      return "—";
    }

    if (field[3] === "select") {
      const index = field[4].indexOf(value);
      if (index !== -1) {
        return ar() ? field[4][index] : field[5][index];
      }
    }

    return String(value);
  }

  function money(value) {
    return Number(value || 0).toLocaleString(ar() ? "ar-EG" : "en-US", {
      maximumFractionDigits: 2
    });
  }

  function getEmployee(employeeName) {
    return records("employees").find(
      employee => employee.name === employeeName
    );
  }

  // تاريخ اليوم بالتوقيت المحلي
  function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // تحديث لوحة التحكم
  function updateDashboard() {
    const dashboard = $("#businessDashboard");
    if (!dashboard) return;

    const employees = records("employees");
    const attendance = records("attendance");
    const tasks = records("tasks");
    const payroll = records("payroll");
    const leaves = records("leaves");
    const invoices = records("invoices");
    const expenses = records("expenses");

    const today = getToday();

    // الموظفون
    const employeeCount = employees.length;

    // حضور اليوم
    const todayAttendance = attendance.filter(
      item => item.date === today
    );

    const presentCount = todayAttendance.filter(
      item => item.status === "حاضر" || item.status === "متأخر"
    ).length;

    const absentCount = todayAttendance.filter(
      item => item.status === "غائب"
    ).length;

    // المهام
    const completedTasks = tasks.filter(
      item => item.status === "مكتملة"
    ).length;

    const taskPercentage = tasks.length
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

    // نسبة الحضور من عدد الموظفين
    const attendancePercentage = employeeCount
      ? Math.min(100, Math.round((presentCount / employeeCount) * 100))
      : 0;

    // الإجازات المعلقة
    const pendingLeaves = leaves.filter(
      item => item.status === "قيد المراجعة"
    ).length;

    // إجمالي الرواتب المسجلة
    const totalPayroll = payroll.reduce(
      (sum, item) => sum + Number(item.amount || 0), 0
    );

    // إجمالي الفواتير
    const totalInvoices = invoices.reduce(
      (sum, item) => sum + Number(item.amount || 0), 0
    );

    // إجمالي المصروفات
    const totalExpenses = expenses.reduce(
      (sum, item) => sum + Number(item.amount || 0), 0
    );

    const setText = (id, value) => {
      const element = $("#" + id);
      if (element) element.textContent = value;
    };

    const setProgress = (id, percentage) => {
      const element = $("#" + id);
      if (element) {
        element.style.width = `${percentage}%`;
      }
    };

    setText("dashEmployees", money(employeeCount));
    setText("dashPresent", money(presentCount));
    setText("dashAbsent", money(absentCount));
    setText("dashTasks", money(completedTasks));
    setText("dashLeaves", money(pendingLeaves));
    setText("dashPayroll", money(totalPayroll));
    setText("dashInvoices", money(totalInvoices));
    setText("dashExpenses", money(totalExpenses));

    setProgress("dashTasksBar", taskPercentage);
    setProgress("dashAttendanceBar", attendancePercentage);

    setText(
      "dashTasksText",
      ar()
        ? `${completedTasks} من ${tasks.length} مهمة مكتملة (${taskPercentage}%)`
        : `${completedTasks} of ${tasks.length} tasks completed (${taskPercentage}%)`
    );

    setText(
      "dashAttendanceText",
      ar()
        ? `${attendancePercentage}% من الموظفين حضروا اليوم`
        : `${attendancePercentage}% employee attendance today`
    );
  }

  // حساب عدد الأيام بين تاريخين شاملًا يوم البداية والنهاية
  function countDays(from, to) {
    if (!from || !to) return 0;

    const start = new Date(from + "T00:00:00Z");
    const end = new Date(to + "T00:00:00Z");

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end < start
    ) {
      return 0;
    }

    return Math.floor((end - start) / 86400000) + 1;
  }

  // حساب إجازات الموظف
  function getEmployeeLeaveStats(employeeName) {
    const leaves = records("leaves").filter(leave =>
      leave.employee === employeeName
    );

    const approved = leaves.filter(
      leave => leave.status === "مقبولة"
    );

    const pending = leaves.filter(
      leave => leave.status === "قيد المراجعة"
    );

    const rejected = leaves.filter(
      leave => leave.status === "مرفوضة"
    );

    return {
      approvedDays: approved.reduce(
        (sum, leave) => sum + countDays(leave.from, leave.to), 0
      ),
      pendingDays: pending.reduce(
        (sum, leave) => sum + countDays(leave.from, leave.to), 0
      ),
      approvedCount: approved.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
      totalCount: leaves.length
    };
  }

  // حساب أيام الإجازة المقبولة داخل شهر محدد
  function getMonthlyApprovedLeaveDays(employeeName, month) {
    if (!month) return 0;

    const monthStart = new Date(month + "-01T00:00:00Z");

    if (Number.isNaN(monthStart.getTime())) return 0;

    const year = monthStart.getUTCFullYear();
    const monthIndex = monthStart.getUTCMonth();

    const firstDay = new Date(Date.UTC(year, monthIndex, 1));
    const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0));

    return records("leaves")
      .filter(leave =>
        leave.employee === employeeName &&
        leave.status === "مقبولة" &&
        leave.from &&
        leave.to
      )
      .reduce((sum, leave) => {
        const leaveStart = new Date(leave.from + "T00:00:00Z");
        const leaveEnd = new Date(leave.to + "T00:00:00Z");

        if (
          Number.isNaN(leaveStart.getTime()) ||
          Number.isNaN(leaveEnd.getTime())
        ) {
          return sum;
        }

        const start = leaveStart > firstDay ? leaveStart : firstDay;
        const end = leaveEnd < lastDay ? leaveEnd : lastDay;

        return sum + (
          end >= start
            ? Math.floor((end - start) / 86400000) + 1
            : 0
        );
      }, 0);
  }

  // إحصائيات حضور الموظف خلال شهر معين
  function getMonthlyAttendance(employeeName, month) {
    const attendance = records("attendance").filter(record =>
      record.employee === employeeName &&
      String(record.date || "").startsWith(month)
    );

    return {
      present: attendance.filter(item => item.status === "حاضر").length,
      absent: attendance.filter(item => item.status === "غائب").length,
      late: attendance.filter(item => item.status === "متأخر").length,
      total: attendance.length
    };
  }

  // عرض حقول النموذج
  function renderForm(tool) {
    const fields = tool.fields.map(field => {
      const [name, arLabel, enLabel, type, arOptions, enOptions] = field;
      const title = label(field);

      if (type === "employee") {
        const employees = records("employees");

        return `
          <label class="business-field">
            ${escapeHTML(title)}

            <select name="${name}" required>
              <option value="">
                ${ar() ? "اختر الموظف" : "Select employee"}
              </option>

              ${employees.map(employee => `
                <option value="${escapeHTML(employee.name)}">
                  ${escapeHTML(employee.name)}
                  ${employee.job ? ` - ${escapeHTML(employee.job)}` : ""}
                </option>
              `).join("")}
            </select>

            ${employees.length === 0 ? `
              <small class="business-note">
                ${ar()
                  ? "أضف موظفًا أولًا من قسم الموظفين."
                  : "Add an employee first."}
              </small>
            ` : ""}
          </label>
        `;
      }

      if (type === "select") {
        return `
          <label class="business-field">
            ${escapeHTML(title)}

            <select name="${name}" required>
              ${arOptions.map((option, i) => `
                <option value="${escapeHTML(option)}">
                  ${escapeHTML(ar() ? option : enOptions[i])}
                </option>
              `).join("")}
            </select>
          </label>
        `;
      }

      return `
        <label class="business-field">
          ${escapeHTML(title)}

          <input
            name="${name}"
            type="${type}"
            ${type === "number" ? 'min="0" step="any"' : ""}
            ${name === "email" ? "" : "required"}
            placeholder="${escapeHTML(title)}"
            ${tool.id === "payroll" && name === "amount"
              ? 'id="payrollAmount"'
              : ""}
          >
        </label>
      `;
    }).join("");

    const payrollInfo = tool.id === "payroll" ? `
      <div id="payrollInfo" class="payroll-info">
        <p>
          ${ar()
            ? "اختر الموظف والشهر لعرض تفاصيل الحضور والراتب والإجازات."
            : "Select an employee and month to view salary, attendance and leaves."}
        </p>
      </div>
    ` : "";

    const leaveInfo = tool.id === "leaves" ? `
      <div id="leaveInfo" class="payroll-info">
        <p>
          ${ar()
            ? "اختر الموظف والتواريخ لعرض ملخص الإجازات."
            : "Select an employee and dates to view leave summary."}
        </p>
      </div>
    ` : "";

    return `
      <form id="businessForm" class="business-form">
        <div class="business-form-grid">${fields}</div>
        ${payrollInfo}
        ${leaveInfo}

        <button type="submit" class="primary-btn">
          ${ar() ? "حفظ البيانات" : "Save data"}
        </button>
      </form>
    `;
  }

  // عرض السجلات
  function renderTable(tool) {
    const data = records(tool.id);

    if (!data.length) {
      return `
        <div class="business-empty">
          <span>${tool.icon}</span>
          <p>${ar() ? "لا توجد بيانات حتى الآن" : "No records yet"}</p>
        </div>
      `;
    }

    return `
      <div class="business-table-wrap">
        <table class="business-table">
          <thead>
            <tr>
              ${tool.fields.map(field =>
                `<th>${escapeHTML(label(field))}</th>`
              ).join("")}

              ${tool.id === "leaves"
                ? `<th>${ar() ? "عدد الأيام" : "Days"}</th>`
                : ""}

              <th>${ar() ? "إجراء" : "Action"}</th>
            </tr>
          </thead>

          <tbody>
            ${data.map((record, index) => `
              <tr>
                ${tool.fields.map(field => `
                  <td>${escapeHTML(getValue(record, field))}</td>
                `).join("")}

                ${tool.id === "leaves" ? `
                  <td>${countDays(record.from, record.to)}</td>
                ` : ""}

                <td>
                  <button
                    type="button"
                    class="business-delete"
                    data-delete-record="${index}"
                    aria-label="${ar() ? "حذف" : "Delete"}"
                  >🗑️</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // تحديث ملخص الإجازات
  function updateLeaveInfo() {
    const form = $("#businessForm");
    if (!form) return;

    const info = $("#leaveInfo");
    if (!info) return;

    const employeeName = form.elements.employee?.value;
    const from = form.elements.from?.value;
    const to = form.elements.to?.value;

    if (!employeeName) {
      info.innerHTML = `
        <p>
          ${ar()
            ? "اختر الموظف لعرض ملخص إجازاته."
            : "Select an employee."}
        </p>
      `;
      return;
    }

    const stats = getEmployeeLeaveStats(employeeName);
    const days = countDays(from, to);

    let dateMessage = "";

    if (from && to) {
      if (to < from) {
        dateMessage = `
          <p class="leave-warning">
            ${ar()
              ? "تاريخ النهاية يجب أن يكون بعد تاريخ البداية أو مساويًا له."
              : "End date must be on or after start date."}
          </p>
        `;
      } else {
        dateMessage = `
          <p>
            ${ar() ? "مدة الإجازة المطلوبة:" : "Requested leave duration:"}
            <strong>${days} ${ar() ? "يوم" : "days"}</strong>
          </p>
        `;
      }
    }

    info.innerHTML = `
      <h4>${ar() ? "ملخص إجازات الموظف" : "Employee leave summary"}</h4>

      <div class="payroll-summary-grid">
        <div>
          <small>${ar() ? "أيام الإجازات المقبولة" : "Approved leave days"}</small>
          <strong>${stats.approvedDays}</strong>
        </div>

        <div>
          <small>${ar() ? "أيام الإجازات المعلقة" : "Pending leave days"}</small>
          <strong>${stats.pendingDays}</strong>
        </div>

        <div>
          <small>${ar() ? "طلبات مقبولة" : "Approved requests"}</small>
          <strong>${stats.approvedCount}</strong>
        </div>

        <div>
          <small>${ar() ? "طلبات قيد المراجعة" : "Pending requests"}</small>
          <strong>${stats.pendingCount}</strong>
        </div>
      </div>

      ${dateMessage}

      <p class="business-note">
        ${ar()
          ? "يتم احتساب الأيام المقبولة فقط ضمن الإجازات المعتمدة. لا يتم خصم أيام تلقائيًا من الراتب."
          : "Only approved leave days count as approved leave. No automatic salary deductions are applied."}
      </p>
    `;
  }

  // تحديث ملخص الراتب
  function updatePayrollInfo() {
    const form = $("#businessForm");
    if (!form) return;

    const employeeName = form.elements.employee?.value;
    const month = form.elements.month?.value;
    const info = $("#payrollInfo");

    if (!info) return;

    if (!employeeName || !month) {
      info.innerHTML = `
        <p>
          ${ar()
            ? "اختر الموظف والشهر لعرض تفاصيل الحضور والراتب والإجازات."
            : "Select an employee and month."}
        </p>
      `;
      return;
    }

    const employee = getEmployee(employeeName);

    if (!employee) {
      info.innerHTML = `
        <p>${ar() ? "الموظف غير موجود." : "Employee not found."}</p>
      `;
      return;
    }

    const stats = getMonthlyAttendance(employeeName, month);
    const leaveDays = getMonthlyApprovedLeaveDays(employeeName, month);
    const salary = Number(employee.salary || 0);

    const amountInput = $("#payrollAmount");
    if (amountInput) {
      amountInput.value = salary;
    }

    info.innerHTML = `
      <h4>${ar() ? "ملخص الموظف لهذا الشهر" : "Monthly employee summary"}</h4>

      <div class="payroll-summary-grid">
        <div>
          <small>${ar() ? "الراتب الأساسي" : "Basic salary"}</small>
          <strong>${escapeHTML(money(salary))}</strong>
        </div>

        <div>
          <small>${ar() ? "أيام الحضور" : "Present days"}</small>
          <strong>${stats.present}</strong>
        </div>

        <div>
          <small>${ar() ? "أيام الغياب" : "Absent days"}</small>
          <strong>${stats.absent}</strong>
        </div>

        <div>
          <small>${ar() ? "أيام التأخير" : "Late days"}</small>
          <strong>${stats.late}</strong>
        </div>

        <div>
          <small>${ar() ? "أيام الإجازات المقبولة" : "Approved leave days"}</small>
          <strong>${leaveDays}</strong>
        </div>

        <div>
          <small>${ar() ? "إجمالي سجلات الحضور" : "Total attendance records"}</small>
          <strong>${stats.total}</strong>
        </div>
      </div>

      <p class="business-note">
        ${ar()
          ? "قيمة الراتب تم ملؤها بالراتب الأساسي. يمكنك تعديلها قبل الحفظ. لا يتم تطبيق خصومات تلقائية."
          : "Salary is filled using the basic salary. You can edit it before saving. No automatic deductions are applied."}
      </p>
    `;
  }

  // فتح أداة وإدارة بياناتها
  function openManager(tool) {
    openWindow(`
      <div class="business-manager" dir="${ar() ? "rtl" : "ltr"}">

        <div class="business-manager-heading">
          <span>${tool.icon}</span>
          <div>
            <h2>${escapeHTML(ar() ? tool.title[0] : tool.title[1])}</h2>
            <p>${ar() ? "إدارة وإضافة البيانات" : "Manage and add records"}</p>
          </div>
        </div>

        <section class="business-panel">
          <h3>${ar() ? "إضافة سجل جديد" : "Add new record"}</h3>
          ${renderForm(tool)}
        </section>

        <section class="business-panel">
          <h3>${ar() ? "السجلات المسجلة" : "Saved records"}</h3>
          <div id="businessRecords">${renderTable(tool)}</div>
        </section>

      </div>
    `);

    const form = $("#businessForm");

    if (tool.id === "payroll" && form) {
      form.elements.employee?.addEventListener("change", updatePayrollInfo);
      form.elements.month?.addEventListener("change", updatePayrollInfo);
    }

    if (tool.id === "leaves" && form) {
      form.elements.employee?.addEventListener("change", updateLeaveInfo);
      form.elements.from?.addEventListener("change", updateLeaveInfo);
      form.elements.to?.addEventListener("change", updateLeaveInfo);
    }

    form?.addEventListener("submit", event => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);
      const record = {};

      for (const field of tool.fields) {
        const value = String(formData.get(field[0]) || "").trim();

        if (field[0] !== "email" && !value) {
          return notify(ar()
            ? "من فضلك أكمل البيانات المطلوبة"
            : "Please complete the required fields");
        }

        if (
          field[3] === "number" &&
          (!Number.isFinite(Number(value)) || Number(value) < 0)
        ) {
          return notify(ar()
            ? "أدخل رقمًا صحيحًا"
            : "Enter a valid number");
        }

        record[field[0]] =
          field[3] === "number" ? Number(value) : value;
      }

      // التأكد من وجود الموظف
      if (["attendance", "tasks", "payroll", "leaves"].includes(tool.id)) {
        const employeeExists = records("employees").some(
          employee => employee.name === record.employee
        );

        if (!employeeExists) {
          return notify(ar()
            ? "الموظف غير موجود في قائمة الموظفين"
            : "Employee not found");
        }
      }

      // التحقق من الإجازات
      if (tool.id === "leaves") {
        if (record.to < record.from) {
          return notify(ar()
            ? "تاريخ النهاية يجب أن يكون بعد تاريخ البداية أو مساويًا له."
            : "End date must be on or after start date.");
        }

        record.days = countDays(record.from, record.to);

        const hasOverlap = records("leaves").some(leave => {
          if (leave.employee !== record.employee) return false;
          if (leave.status === "مرفوضة") return false;

          return record.from <= leave.to && record.to >= leave.from;
        });

        if (hasOverlap) {
          return notify(ar()
            ? "يوجد طلب إجازة آخر متداخل مع هذه الفترة لهذا الموظف."
            : "Another leave request overlaps this period.");
        }
      }

      // حفظ ملخص الراتب والحضور
      if (tool.id === "payroll") {
        const employee = getEmployee(record.employee);
        const stats = getMonthlyAttendance(record.employee, record.month);

        record.baseSalary = Number(employee?.salary || 0);
        record.attendanceSummary = stats;
        record.approvedLeaveDays =
          getMonthlyApprovedLeaveDays(record.employee, record.month);
      }

      record.createdAt = new Date().toISOString();

      records(tool.id).push(record);

      if (saveData()) {
        $("#businessRecords").innerHTML = renderTable(tool);

        event.currentTarget.reset();

        if (tool.id === "payroll") {
          updatePayrollInfo();
        }

        if (tool.id === "leaves") {
          updateLeaveInfo();
        }

        updateDashboard();

        notify(ar()
          ? "تم حفظ البيانات بنجاح"
          : "Record saved successfully");
      } else {
        records(tool.id).pop();
      }
    });

    $("#businessRecords")?.addEventListener("click", event => {
      const button = event.target.closest("[data-delete-record]");
      if (!button) return;

      const index = Number(button.dataset.deleteRecord);
      if (!Number.isInteger(index)) return;

      const confirmed = confirm(
        ar() ? "هل تريد حذف هذا السجل؟" : "Delete this record?"
      );

      if (!confirmed) return;

      const deletedRecord = records(tool.id).splice(index, 1)[0];

      if (saveData()) {
        $("#businessRecords").innerHTML = renderTable(tool);
        updateDashboard();

        notify(ar() ? "تم الحذف" : "Deleted");
      } else {
        records(tool.id).splice(index, 0, deletedRecord);
      }
    });
  }

  function reportCard(title, value, icon) {
    return `
      <div class="business-stat">
        <span>${icon}</span>
        <small>${escapeHTML(title)}</small>
        <strong>${escapeHTML(value)}</strong>
      </div>
    `;
  }

  // التقارير
  function openReports() {
    const employees = records("employees");
    const attendance = records("attendance");
    const tasks = records("tasks");
    const payroll = records("payroll");
    const invoices = records("invoices");
    const inventory = records("inventory");
    const expenses = records("expenses");
    const customers = records("customers");
    const leaves = records("leaves");

    const totalPayroll = payroll.reduce(
      (sum, item) => sum + Number(item.amount || 0), 0
    );

    const totalExpenses = expenses.reduce(
      (sum, item) => sum + Number(item.amount || 0), 0
    );

    const totalInvoices = invoices.reduce(
      (sum, item) => sum + Number(item.amount || 0), 0
    );

    const completedTasks = tasks.filter(
      item => item.status === "مكتملة"
    ).length;

    const pendingLeaves = leaves.filter(
      item => item.status === "قيد المراجعة"
    ).length;

    const approvedLeaves = leaves.filter(
      item => item.status === "مقبولة"
    );

    const approvedLeaveDays = approvedLeaves.reduce(
      (sum, item) => sum + countDays(item.from, item.to), 0
    );

    const lowStock = inventory.filter(
      item => Number(item.quantity) <= 5
    ).length;

    openWindow(`
      <div class="business-manager" dir="${ar() ? "rtl" : "ltr"}">

        <div class="business-manager-heading">
          <span>📊</span>
          <div>
            <h2>${ar() ? "تقارير الشركة" : "Business reports"}</h2>
            <p>${ar()
              ? "ملخص البيانات المسجلة على هذا الجهاز"
              : "Summary of records saved on this device"}</p>
          </div>
        </div>

        <div class="business-stats">
          ${reportCard(ar() ? "الموظفون" : "Employees", employees.length, "👥")}
          ${reportCard(ar() ? "سجلات الحضور" : "Attendance records", attendance.length, "⏱️")}
          ${reportCard(ar() ? "المهام المكتملة" : "Completed tasks", completedTasks, "📋")}
          ${reportCard(ar() ? "العملاء" : "Customers", customers.length, "🤝")}
          ${reportCard(ar() ? "الفواتير" : "Invoices", invoices.length, "🧾")}
          ${reportCard(ar() ? "قيمة الفواتير" : "Invoice value", money(totalInvoices), "💰")}
          ${reportCard(ar() ? "إجمالي الرواتب" : "Total payroll", money(totalPayroll), "💵")}
          ${reportCard(ar() ? "المصروفات" : "Expenses", money(totalExpenses), "💸")}
          ${reportCard(ar() ? "طلبات الإجازة المعلقة" : "Pending leave requests", pendingLeaves, "📅")}
          ${reportCard(ar() ? "طلبات الإجازة المقبولة" : "Approved leave requests", approvedLeaves.length, "✅")}
          ${reportCard(ar() ? "أيام الإجازات المقبولة" : "Approved leave days", approvedLeaveDays, "🗓️")}
          ${reportCard(ar() ? "منتجات مخزون منخفض" : "Low stock products", lowStock, "📦")}
        </div>

        <p class="business-note">
          ${ar()
            ? "هذه التقارير مبنية على البيانات التي أُدخلت في أدوات Business على هذا المتصفح."
            : "These reports use data entered into Business tools in this browser."}
        </p>

      </div>
    `);
  }

  // ربط الكروت العشرة
  document.addEventListener("click", event => {
    const card = event.target.closest(".business-card");
    if (!card) return;

    updateDashboard();

    const cards = $$(".business-card");
    const index = cards.indexOf(card);
    const tool = definitions[index];

    if (!tool) return;

    if (tool.report) {
      openReports();
    } else {
      openManager(tool);
    }
  });

  // تحديث لوحة التحكم عند فتح شاشة Business
  const businessScreen = $("#businessScreen");

  if (businessScreen && "MutationObserver" in window) {
    const observer = new MutationObserver(() => {
      updateDashboard();
    });

    observer.observe(businessScreen, {
      attributes: true,
      attributeFilter: ["style", "class"]
    });
  }

  // تحديث الأرقام عند تغيير اللغة
  const languageObserver = new MutationObserver(() => {
    updateDashboard();
  });

  languageObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });

  // تنسيقات أدوات Business ولوحة التحكم
  const style = document.createElement("style");

  style.textContent = `
    .business-card {
      cursor: pointer;
      transition: transform .2s ease, border-color .2s ease;
    }

    .business-card:hover {
      transform: translateY(-5px);
      border-color: #659cff;
    }

    /* Dashboard */

    .business-dashboard {
      position: relative;
      margin: 25px 0;
      padding: 25px;
      overflow: hidden;
      border: 1px solid rgba(101,156,255,.25);
      border-radius: 22px;
      background:
        radial-gradient(circle at 90% 0%, rgba(83,130,255,.15), transparent 35%),
        linear-gradient(135deg, rgba(25,45,90,.35), rgba(80,65,150,.12));
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
    }

    .dashboard-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      margin-bottom: 25px;
    }

    .dashboard-heading h2 {
      margin: 7px 0;
      font-size: 23px;
    }

    .dashboard-heading p {
      margin: 0;
      opacity: .7;
      font-size: 13px;
    }

    .welcome-kicker {
      color: #79aaff;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 2px;
    }

    .dashboard-live {
      color: #5ee5a1;
      font-size: 11px;
      font-weight: bold;
      white-space: nowrap;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 13px;
    }

    .dashboard-stat {
      min-width: 0;
      padding: 17px;
      display: flex;
      flex-direction: column;
      gap: 9px;
      border: 1px solid rgba(130,160,220,.2);
      border-radius: 15px;
      background: rgba(120,150,220,.07);
      transition: transform .2s ease, background .2s ease;
    }

    .dashboard-stat:hover {
      transform: translateY(-3px);
      background: rgba(120,150,220,.13);
    }

    .dashboard-stat > span {
      font-size: 23px;
    }

    .dashboard-stat small {
      opacity: .7;
      font-size: 12px;
    }

    .dashboard-stat strong {
      font-size: 23px;
      font-weight: 800;
      overflow-wrap: anywhere;
    }

    .dashboard-panels {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin-top: 17px;
    }

    .dashboard-panel {
      padding: 18px;
      border: 1px solid rgba(130,160,220,.2);
      border-radius: 15px;
      background: rgba(120,150,220,.06);
    }

    .dashboard-panel h3 {
      margin: 0 0 17px;
      font-size: 14px;
    }

    .dashboard-progress {
      width: 100%;
      height: 9px;
      overflow: hidden;
      border-radius: 20px;
      background: rgba(130,160,220,.17);
    }

    .dashboard-progress-bar {
      width: 0;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #478cff, #9275ff);
      transition: width .5s ease;
    }

    .attendance-bar {
      background: linear-gradient(90deg, #26c99a, #6edcbb);
    }

    .dashboard-panel p {
      margin: 12px 0 0;
      font-size: 12px;
      opacity: .75;
    }

    /* Manager */

    .business-manager {
      color: var(--text, inherit);
      max-height: 75vh;
      overflow-y: auto;
      padding: 8px;
    }

    .business-manager-heading {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 22px;
    }

    .business-manager-heading > span {
      font-size: 35px;
    }

    .business-manager-heading h2 {
      margin: 0 0 5px;
    }

    .business-manager-heading p {
      margin: 0;
      opacity: .7;
    }

    .business-panel {
      padding: 18px;
      margin: 16px 0;
      border: 1px solid rgba(130,160,220,.2);
      border-radius: 15px;
      background: rgba(120,150,220,.05);
    }

    .business-panel h3 {
      margin-top: 0;
    }

    .business-form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0,1fr));
      gap: 13px;
    }

    .business-field {
      display: flex;
      flex-direction: column;
      gap: 7px;
      font-size: 14px;
    }

    .business-field input,
    .business-field select {
      width: 100%;
      min-width: 0;
      padding: 11px;
      border: 1px solid rgba(130,160,220,.35);
      border-radius: 9px;
      background: var(--input-bg, rgba(120,150,220,.08));
      color: inherit;
      font: inherit;
    }

    .business-form > button {
      margin-top: 17px;
      cursor: pointer;
    }

    .business-table-wrap {
      overflow-x: auto;
      width: 100%;
    }

    .business-table {
      border-collapse: collapse;
      width: 100%;
      min-width: 500px;
      font-size: 13px;
    }

    .business-table th,
    .business-table td {
      padding: 11px;
      border-bottom: 1px solid rgba(130,160,220,.2);
      text-align: start;
    }

    .business-table th {
      opacity: .8;
    }

    .business-delete {
      border: 0;
      background: transparent;
      cursor: pointer;
      font-size: 17px;
    }

    .business-empty {
      padding: 25px;
      text-align: center;
      opacity: .7;
    }

    .business-empty span {
      font-size: 35px;
    }

    .business-stats {
      display: grid;
      grid-template-columns: repeat(2,minmax(0,1fr));
      gap: 12px;
    }

    .business-stat {
      padding: 17px;
      border: 1px solid rgba(130,160,220,.25);
      border-radius: 13px;
      display: flex;
      flex-direction: column;
      gap: 7px;
      min-width: 0;
    }

    .business-stat span {
      font-size: 23px;
    }

    .business-stat small {
      opacity: .75;
    }

    .business-stat strong {
      font-size: 20px;
      overflow-wrap: anywhere;
    }

    .business-note {
      opacity: .7;
      font-size: 13px;
      line-height: 1.7;
    }

    .payroll-info {
      margin-top: 18px;
      padding: 16px;
      border: 1px solid rgba(101,156,255,.3);
      border-radius: 12px;
      background: rgba(101,156,255,.07);
    }

    .payroll-info h4 {
      margin: 0 0 14px;
    }

    .payroll-summary-grid {
      display: grid;
      grid-template-columns: repeat(2,minmax(0,1fr));
      gap: 12px;
    }

    .payroll-summary-grid > div {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 11px;
      border-radius: 9px;
      background: rgba(130,160,220,.08);
    }

    .payroll-summary-grid small {
      opacity: .7;
    }

    .payroll-summary-grid strong {
      font-size: 18px;
    }

    .leave-warning {
      color: #ff7373;
      font-weight: bold;
      margin-top: 12px;
    }

    @media(max-width:850px) {
      .dashboard-stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media(max-width:550px) {
      .business-dashboard {
        padding: 16px;
      }

      .dashboard-heading h2 {
        font-size: 19px;
      }

      .dashboard-stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 9px;
      }

      .dashboard-stat {
        padding: 12px;
      }

      .dashboard-stat strong {
        font-size: 19px;
      }

      .dashboard-panels,
      .business-form-grid,
      .business-stats,
      .payroll-summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);

  // أول تحديث للوحة التحكم
  updateDashboard();

})();
