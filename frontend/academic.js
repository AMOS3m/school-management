
/*
|--------------------------------------------------------------------------
| ACADEMIC ADMIN JAVASCRIPT
|--------------------------------------------------------------------------
|
| This file connects academic.html to the backend API.
|
| Main sections:
|
| Dashboard
| Academic Years
| Terms
| Grades
| Streams
| Students
| Teachers
| Parents
| Teaching Assignments
| Class Teachers
| Timetables
| Assessments
| Report Cards
| Announcements
| Events
|
|--------------------------------------------------------------------------
*/

const API_BASE = "http://localhost:5000/api";


/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

function getToken() {
  return localStorage.getItem("token");
}


/*
|--------------------------------------------------------------------------
| API REQUEST HELPER
|--------------------------------------------------------------------------
*/

async function apiRequest(endpoint, options = {}) {

  const token = getToken();

  const config = {
    ...options,

    headers: {
      ...(options.body
        ? {
            "Content-Type": "application/json",
          }
        : {}),

      ...(options.headers || {}),

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  };


  const response =
    await fetch(
      `${API_BASE}${endpoint}`,
      config
    );


  let data = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }


  if (!response.ok) {

    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }


  return data;
}



async function examinationApiFetch(url, options = {}) {

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const response = await fetch(url, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {

    throw new Error(
      data.message ||
      data.error ||
      `Request failed with status ${response.status}`
    );

  }

  return data;
}



/*
|--------------------------------------------------------------------------
| RESPONSIVE SIDEBAR
|--------------------------------------------------------------------------
*/

const sidebar = document.getElementById("sidebar");
const mobileOverlay = document.getElementById("mobileOverlay");


/*
|--------------------------------------------------------------------------
| OPEN SIDEBAR
|--------------------------------------------------------------------------
*/

function openSidebar() {
  if (!sidebar || !mobileOverlay) return;

  sidebar.classList.remove("-translate-x-full");
  mobileOverlay.classList.remove("hidden");

  // Prevent the page behind the sidebar from scrolling
  document.body.classList.add("overflow-hidden");
}


/*
|--------------------------------------------------------------------------
| CLOSE SIDEBAR
|--------------------------------------------------------------------------
*/

function closeSidebar() {
  if (!sidebar || !mobileOverlay) return;

  // Only hide sidebar on mobile
  if (window.innerWidth < 1024) {
    sidebar.classList.add("-translate-x-full");
  }

  mobileOverlay.classList.add("hidden");

  // Allow page scrolling again
  document.body.classList.remove("overflow-hidden");
}


/*
|--------------------------------------------------------------------------
| SIDEBAR NAVIGATION
|--------------------------------------------------------------------------
*/

function setActive(element) {
  if (!element) return;

  // Remove active state from all sidebar links
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.classList.remove("active");
  });

  // Add active state to clicked link
  element.classList.add("active");

  // Close sidebar on mobile after selecting a menu item
  if (window.innerWidth < 1024) {
    closeSidebar();
  }
}


/*
|--------------------------------------------------------------------------
| CLOSE SIDEBAR WHEN SCREEN BECOMES LARGE
|--------------------------------------------------------------------------
*/

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    mobileOverlay.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");

    // Desktop sidebar should always be visible
    sidebar.classList.remove("-translate-x-full");
  } else {
    // Mobile sidebar starts closed
    if (!mobileOverlay.classList.contains("hidden")) {
      sidebar.classList.remove("-translate-x-full");
    } else {
      sidebar.classList.add("-translate-x-full");
    }
  }
});


/*
|--------------------------------------------------------------------------
| CLOSE SIDEBAR WITH ESCAPE KEY
|--------------------------------------------------------------------------
*/

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSidebar();
  }
});


/*
|--------------------------------------------------------------------------
| CLOSE SIDEBAR AFTER CLICKING A LINK
|--------------------------------------------------------------------------
*/

document.querySelectorAll(".sidebar-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  });
});


/*
|--------------------------------------------------------------------------
| CURRENT DATE
|--------------------------------------------------------------------------
*/

function displayCurrentDate() {
  const dateElement = document.getElementById("currentDate");

  if (!dateElement) return;

  const today = new Date();

  dateElement.textContent = today.toLocaleDateString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

displayCurrentDate();


/*
|--------------------------------------------------------------------------
| MAKE INLINE HTML FUNCTIONS AVAILABLE
|--------------------------------------------------------------------------
|
| Your HTML uses:
|
| onclick="openSidebar()"
| onclick="closeSidebar()"
| onclick="setActive(this)"
|
|--------------------------------------------------------------------------
*/

window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.setActive = setActive;



/*
|--------------------------------------------------------------------------
| RESPONSE DATA HELPER
|--------------------------------------------------------------------------
*/

function extractData(response) {

  if (
    response &&
    Object.prototype.hasOwnProperty.call(
      response,
      "data"
    )
  ) {
    return response.data;
  }

  return response;
}


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

function logout() {

  localStorage.removeItem("token");

  localStorage.removeItem("user");

  window.location.href =
    "/login.html";
}


/*
|--------------------------------------------------------------------------
| MESSAGE HELPERS
|--------------------------------------------------------------------------
*/

function showMessage(message, type = "success") {

  const element =
    document.getElementById(
      "dashboardMessage"
    );


  if (!element) {
    console.log(message);
    return;
  }


  element.textContent =
    message;


  element.className =
    `message ${type}`;
}


function showSuccess(message) {

  showMessage(
    message,
    "success"
  );
}


function showError(message) {

  console.error(message);

  showMessage(
    message,
    "error"
  );
}


/*
|--------------------------------------------------------------------------
| HTML HELPERS
|--------------------------------------------------------------------------
*/

function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }


  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function formatDate(date) {

  if (!date) {
    return "-";
  }


  const parsed =
    new Date(date);


  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }


  return parsed.toLocaleDateString();
}


function setText(id, value) {

  const element =
    document.getElementById(id);


  if (element) {
    element.textContent =
      value ?? 0;
  }
}


/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

async function loadAcademicDashboard() {

  try {

    const response =
      await apiRequest(
        "/academic-admin/dashboard"
      );


    const dashboard =
      extractData(response);


    renderDashboardOverview(
      dashboard
    );

  } catch (error) {

    console.error(
      "Failed to load academic dashboard:",
      error
    );

    showError(
      "Unable to load academic dashboard."
    );
  }
}


/*
|--------------------------------------------------------------------------
| DASHBOARD OVERVIEW
|--------------------------------------------------------------------------
*/

function renderDashboardOverview(data) {

  if (!data) {
    return;
  }


  setText(
    "academicYearsCount",
    data.academicYears?.length ?? 0
  );


  setText(
    "termsCount",
    data.terms?.length ?? 0
  );


  setText(
    "gradesCount",
    data.grades?.length ?? 0
  );


  setText(
    "streamsCount",
    data.streams?.length ?? 0
  );


  setText(
    "teachersCount",
    data.teachers?.length ?? 0
  );


  setText(
    "teachingAssignmentsCount",
    data.teachingAssignments?.length ?? 0
  );


  setText(
    "classTeacherAssignmentsCount",
    data.classTeacherAssignments?.length ?? 0
  );


  setText(
    "publishedAssessmentsCount",
    data.assessmentReview
      ?.totalPublishedAssessments ?? 0
  );


  setText(
    "recommendedAssessmentsCount",
    data.assessmentReview
      ?.recommendedForReportCard ?? 0
  );


  setText(
    "draftReportCardsCount",
    data.reportCards?.draft ?? 0
  );


  setText(
    "publishedReportCardsCount",
    data.reportCards?.published ?? 0
  );
}


/*
|--------------------------------------------------------------------------
| ACADEMIC OVERVIEW
|--------------------------------------------------------------------------
*/

async function loadAcademicOverview() {

  try {

    const response =
      await apiRequest(
        "/academic-admin/overview"
      );


    const overview =
      extractData(response);


    renderAcademicOverview(
      overview
    );

  } catch (error) {

    console.error(
      "Failed to load academic overview:",
      error
    );
  }
}


function renderAcademicOverview(data) {

  if (!data) {
    return;
  }


  setText(
    "academicYearsCount",
    data.academicYears ?? 0
  );


  setText(
    "termsCount",
    data.terms ?? 0
  );


  setText(
    "gradesCount",
    data.grades ?? 0
  );


  setText(
    "streamsCount",
    data.streams ?? 0
  );


  setText(
    "teachersCount",
    data.teachers ?? 0
  );


  setText(
    "teachingAssignmentsCount",
    data.teachingAssignments ?? 0
  );


  setText(
    "classTeacherAssignmentsCount",
    data.classTeacherAssignments ?? 0
  );


  setText(
    "publishedAssessmentsCount",
    data.assessments?.published ?? 0
  );


  setText(
    "recommendedAssessmentsCount",
    data.assessments
      ?.recommendedForReportCard ?? 0
  );


  setText(
    "draftReportCardsCount",
    data.reportCards?.draft ?? 0
  );


  setText(
    "publishedReportCardsCount",
    data.reportCards?.published ?? 0
  );
}


/*
|--------------------------------------------------------------------------
| ACADEMIC YEARS
|--------------------------------------------------------------------------
*/

async function loadAcademicYears() {

  try {

    const response =
      await apiRequest(
        "/academic-admin/academic-years"
      );


    const years =
      extractData(response);


    renderAcademicYears(
      years
    );


    populateAcademicYearSelects(
      years
    );

  } catch (error) {

    console.error(error);

    showError(
      "Unable to load academic years."
    );
  }
}

function renderAcademicYears(years = []) {
  const tableBody = document.getElementById("academicYearsTable");

  if (!tableBody) {
    return;
  }

  // Store the years so editAcademicYear() can access them
  window.__academicYears = years;

  tableBody.innerHTML = "";

  if (!years.length) {
    tableBody.innerHTML = `
      <tr>
        <td
          colspan="4"
          class="p-8 text-center text-gray-500"
        >
          No academic years found.
        </td>
      </tr>
    `;

    return;
  }

  years.forEach((year) => {
    const row = document.createElement("tr");

    row.className = "border-t hover:bg-gray-50";

    row.innerHTML = `
      <td class="p-4 font-medium">
        ${escapeHtml(year.name || "")}
      </td>

      <td class="p-4 text-gray-600">
        ${formatDate(year.startDate)}
      </td>

      <td class="p-4 text-gray-600">
        ${formatDate(year.endDate)}
      </td>

      <td class="p-4 text-right">
        <button
          type="button"
          onclick="editAcademicYear('${year.id}')"
          class="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
        >
          Edit
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}


/*
|--------------------------------------------------------------------------
| ACADEMIC YEAR SELECTS
|--------------------------------------------------------------------------
*/

function populateAcademicYearSelects(years = []) {

  const selectIds = [

    "academicYearSelect",

    "termAcademicYear",

    "timetableAcademicYear",

    "assessmentAcademicYear",

    "reportCardAcademicYear",

    "classTeacherAcademicYear",

    "assignmentAcademicYear"

  ];


  selectIds.forEach(id => {

    const select =
      document.getElementById(id);


    if (!select) {
      return;
    }


    const currentValue =
      select.value;


    const firstOption =
      select.options[0]
        ?.textContent ||
      "Select academic year";


    select.innerHTML =
      `<option value="">${escapeHtml(firstOption)}</option>`;


    years.forEach(year => {

      const option =
        document.createElement("option");


      option.value =
        year.id;


      option.textContent =
        year.name;


      select.appendChild(option);
    });


    if (currentValue) {
      select.value =
        currentValue;
    }
  });
}




function openAcademicYearModal(academicYear = null) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");

  if (!modal || !modalTitle || !modalBody) {
    console.error("Academic year modal elements not found.");
    return;
  }

  const isEditing = Boolean(academicYear);

  modalTitle.textContent = isEditing
    ? "Edit Academic Year"
    : "Create Academic Year";

  modalBody.innerHTML = `
    <form id="academicYearForm" class="space-y-5">

      <div>
        <label
          for="academicYearName"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Academic Year Name
        </label>

        <input
          id="academicYearName"
          type="text"
          required
          value="${isEditing ? escapeHtml(academicYear.name || "") : ""}"
          placeholder="e.g. 2026"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-600"
        />
      </div>

      <div>
        <label
          for="academicYearStartDate"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Start Date
        </label>

        <input
          id="academicYearStartDate"
          type="date"
          required
          value="${
            isEditing && academicYear.startDate
              ? academicYear.startDate.substring(0, 10)
              : ""
          }"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-600"
        />
      </div>

      <div>
        <label
          for="academicYearEndDate"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          End Date
        </label>

        <input
          id="academicYearEndDate"
          type="date"
          required
          value="${
            isEditing && academicYear.endDate
              ? academicYear.endDate.substring(0, 10)
              : ""
          }"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-600"
        />
      </div>

      <div class="flex justify-end gap-3 pt-3">

        <button
          type="button"
          onclick="closeModal()"
          class="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="px-4 py-2 rounded-lg bg-school-800 text-white hover:bg-school-700"
        >
          ${isEditing ? "Save Changes" : "Create Academic Year"}
        </button>

      </div>

    </form>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  const form = document.getElementById("academicYearForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name =
      document.getElementById("academicYearName").value.trim();

    const startDate =
      document.getElementById("academicYearStartDate").value;

    const endDate =
      document.getElementById("academicYearEndDate").value;

    if (!name || !startDate || !endDate) {
      showError("Please fill in all academic year fields.");
      return;
    }

    if (startDate >= endDate) {
      showError("Start date must be before end date.");
      return;
    }

    const data = {
      name,
      startDate,
      endDate,
    };

    try {
      if (isEditing) {
        await updateAcademicYear(
          academicYear.id,
          data
        );
      } else {
        await createAcademicYear(data);
      }

      closeModal();

    } catch (error) {
      console.error(
        "Academic year save failed:",
        error
      );
    }
  });
}


/*
|--------------------------------------------------------------------------
| CREATE ACADEMIC YEAR
|--------------------------------------------------------------------------
*/

async function createAcademicYear(data) {

  try {

    const response =
      await apiRequest(
        "/academic-admin/academic-years",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );


    await loadAcademicYears();

    await loadAcademicOverview();

    await loadAcademicDashboard();


    showSuccess(
      "Academic year created successfully."
    );


    return extractData(response);

  } catch (error) {

    showError(
      error.message
    );

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE ACADEMIC YEAR
|--------------------------------------------------------------------------
*/

async function updateAcademicYear(
  academicYearId,
  data
) {

  try {

    const response =
      await apiRequest(
        `/academic-admin/academic-years/${academicYearId}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );


    await loadAcademicYears();

    await loadAcademicOverview();

    showSuccess(
      "Academic year updated successfully."
    );


    return extractData(response);

  } catch (error) {

    showError(
      error.message
    );

    throw error;
  }
}

async function editAcademicYear(academicYearId) {
  const year =
    window.__academicYears?.find(
      (item) => item.id === academicYearId
    );

  if (!year) {
    showError("Academic year not found.");
    return;
  }

  openAcademicYearModal(year);
}

/*
|--------------------------------------------------------------------------
| TERMS
|--------------------------------------------------------------------------
*/

async function loadTerms(
  academicYearId = ""
) {

  try {

    const query =
      academicYearId
        ? `?academicYearId=${encodeURIComponent(academicYearId)}`
        : "";


    const response =
      await apiRequest(
        `/academic-admin/terms${query}`
      );


    const terms =
      extractData(response);


    renderTerms(
      terms
    );


    populateTermSelects(
      terms
    );

  } catch (error) {

    console.error(error);

    showError(
      "Unable to load terms."
    );
  }
}

function renderTerms(terms = []) {
  const tableBody = document.getElementById("termsTable");

  if (!tableBody) {
    return;
  }

  window.__terms = terms;

  tableBody.innerHTML = "";

  if (!terms.length) {
    tableBody.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="p-8 text-center text-gray-500"
        >
          No terms found.
        </td>
      </tr>
    `;

    return;
  }

  terms.forEach((term) => {
    const row = document.createElement("tr");

    row.className = "border-t hover:bg-gray-50";

    row.innerHTML = `
      <td class="p-4 font-medium">
        ${escapeHtml(term.academicYear?.name || "-")}
      </td>

      <td class="p-4">
        ${escapeHtml(String(term.termNumber))}
      </td>

      <td class="p-4">
        ${escapeHtml(term.name || "")}
      </td>

      <td class="p-4 text-gray-600">
        ${formatDate(term.startDate)}
        -
        ${formatDate(term.endDate)}
      </td>

      <td class="p-4 text-right">
        <button
          type="button"
          onclick="editTerm('${term.id}')"
          class="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
        >
          Edit
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}



function populateTermSelects(terms = []) {

  const selectIds = [

    "termSelect",

    "timetableTerm",

    "assessmentTerm",

    "reportCardTerm",

    "classTeacherTerm",

    "assignmentTerm"

  ];


  selectIds.forEach(id => {

    const select =
      document.getElementById(id);


    if (!select) {
      return;
    }


    const currentValue =
      select.value;


    select.innerHTML =
      `<option value="">Select term</option>`;


    terms.forEach(term => {

      const option =
        document.createElement("option");


      option.value =
        term.id;


      option.textContent =
        `${term.name} - ${term.academicYear?.name || ""}`;


      select.appendChild(option);
    });


    if (currentValue) {
      select.value =
        currentValue;
    }
  });
}


/*
|--------------------------------------------------------------------------
| CREATE TERM
|--------------------------------------------------------------------------
*/

async function createTerm(data) {

  try {

    const response =
      await apiRequest(
        "/academic-admin/terms",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );


    await loadTerms();

    await loadAcademicOverview();

    await loadAcademicDashboard();


    showSuccess(
      "Term created successfully."
    );


    return extractData(response);

  } catch (error) {

    showError(
      error.message
    );

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE TERM
|--------------------------------------------------------------------------
*/

async function updateTerm(
  termId,
  data
) {

  try {

    const response =
      await apiRequest(
        `/academic-admin/terms/${termId}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );


    await loadTerms();

    await loadAcademicOverview();
    await loadAcademicDashboard();


    showSuccess(
      "Term updated successfully."
    );


    return extractData(response);

  } catch (error) {

    showError(
      error.message
    );

    throw error;
  }
}

async function editTerm(termId) {
  const term =
    window.__terms?.find(
      (item) => item.id === termId
    );

  if (!term) {
    showError("Term not found.");
    return;
  }

  openTermModal(term);
}

function openTermModal(term = null) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");

  if (!modal || !modalTitle || !modalBody) {
    console.error("Term modal elements not found.");
    return;
  }

  const isEditing = Boolean(term);

  modalTitle.textContent = isEditing
    ? "Edit Term"
    : "Create Term";

  const academicYears =
    window.__academicYears || [];

  modalBody.innerHTML = `
    <form id="termForm" class="space-y-5">

      <div>
        <label
          for="termAcademicYear"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Academic Year
        </label>

        <select
          id="termAcademicYear"
          required
          ${isEditing ? "disabled" : ""}
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-600"
        >
          <option value="">Select academic year</option>

          ${academicYears
            .map(
              (year) => `
                <option
                  value="${year.id}"
                  ${
                    isEditing &&
                    term.academicYearId === year.id
                      ? "selected"
                      : ""
                  }
                >
                  ${escapeHtml(year.name)}
                </option>
              `
            )
            .join("")}
        </select>
      </div>

      <div>
        <label
          for="termNumber"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Term Number
        </label>

        <input
          id="termNumber"
          type="number"
          min="1"
          required
          value="${
            isEditing
              ? term.termNumber
              : ""
          }"
          placeholder="e.g. 1"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-600"
        />
      </div>

      <div>
        <label
          for="termName"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Term Name
        </label>

        <input
          id="termName"
          type="text"
          required
          value="${
            isEditing
              ? escapeHtml(term.name || "")
              : ""
          }"
          placeholder="e.g. Term 1"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-600"
        />
      </div>

      <div>
        <label
          for="termStartDate"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Start Date
        </label>

        <input
          id="termStartDate"
          type="date"
          required
          value="${
            isEditing && term.startDate
              ? term.startDate.substring(0, 10)
              : ""
          }"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-600"
        />
      </div>

      <div>
        <label
          for="termEndDate"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          End Date
        </label>

        <input
          id="termEndDate"
          type="date"
          required
          value="${
            isEditing && term.endDate
              ? term.endDate.substring(0, 10)
              : ""
          }"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-600"
        />
      </div>

      <div class="flex justify-end gap-3 pt-3">

        <button
          type="button"
          onclick="closeModal()"
          class="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="px-4 py-2 rounded-lg bg-school-800 text-white hover:bg-school-700"
        >
          ${isEditing ? "Save Changes" : "Create Term"}
        </button>

      </div>

    </form>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  const form =
    document.getElementById("termForm");

  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const academicYearId =
        document.getElementById(
          "termAcademicYear"
        ).value;

      const termNumber =
        Number(
          document.getElementById(
            "termNumber"
          ).value
        );

      const name =
        document.getElementById(
          "termName"
        ).value.trim();

      const startDate =
        document.getElementById(
          "termStartDate"
        ).value;

      const endDate =
        document.getElementById(
          "termEndDate"
        ).value;

      if (
        !academicYearId &&
        !isEditing
      ) {
        showError(
          "Please select an academic year."
        );
        return;
      }

      if (
        !termNumber ||
        !name ||
        !startDate ||
        !endDate
      ) {
        showError(
          "Please fill in all term fields."
        );
        return;
      }

      if (startDate >= endDate) {
        showError(
          "Start date must be before end date."
        );
        return;
      }

      const data = {
        termNumber,
        name,
        startDate,
        endDate,
      };

      try {
        if (isEditing) {
          await updateTerm(
            term.id,
            data
          );
        } else {
          await createTerm({
            academicYearId,
            ...data,
          });
        }

        closeModal();

      } catch (error) {
        console.error(
          "Term save failed:",
          error
        );
      }
    }
  );
}

/*
|--------------------------------------------------------------------------
| GRADES
|--------------------------------------------------------------------------
*/

function openGradeModal() {
  document.getElementById("modalTitle").textContent = "Add Grade";

  document.getElementById("modalBody").innerHTML = `
    <form id="gradeForm" class="space-y-4">

      <div>
        <label
          for="gradeName"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Grade Name
        </label>

        <input
          type="text"
          id="gradeName"
          name="name"
          placeholder="e.g. Grade 1"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-800"
          required
        />
      </div>


      <div>
        <label
          for="educationLevelId"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Education Level
        </label>

        <select
          id="educationLevelId"
          name="educationLevelId"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-school-800"
          required
        >
          <option value="">Select education level</option>

          <option value="e3f866c9-058a-4c05-80f2-4915cf9b8049">
            Pre-Primary
          </option>

          <option value="6f7b370e-a8f0-4e08-b8e1-b9ca1f374314">
            Primary
          </option>

          <option value="1b9388f1-0382-429e-b80a-fb4308947d0d">
            Junior Secondary
          </option>

          <option value="47faa2a4-def0-4420-ba99-5f5430d7666b">
            Senior Secondary
          </option>
        </select>
      </div>


      <div class="flex justify-end gap-3 pt-3">

        <button
          type="button"
          onclick="closeModal()"
          class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="px-4 py-2 rounded-lg bg-school-800 text-white hover:bg-school-900"
        >
          Save Grade
        </button>

      </div>

    </form>
  `;

  const modal = document.getElementById("modal");

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

async function loadGrades() {

  try {

    const response =
      await apiRequest(
        "/academic-admin/grades"
      );


    const grades =
      extractData(response);


    window.__grades =
      grades;


    renderGrades(
      grades
    );


    populateGradeSelects(
      grades
    );

  } catch (error) {

    console.error(error);

    showError(
      "Unable to load grades."
    );
  }
}


function renderGrades(grades = []) {
  const tableBody = document.getElementById("gradesTable");

  if (!tableBody) return;

  window.__grades = grades;

  tableBody.innerHTML = "";

  if (!grades.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="p-8 text-center text-gray-500">
          No grades found.
        </td>
      </tr>
    `;

    return;
  }

  grades.forEach((grade) => {
    const row = document.createElement("tr");

    row.className =
      "border-t hover:bg-gray-50";

    row.innerHTML = `
      <td class="p-4 font-medium">
        ${escapeHtml(grade.name || "")}
      </td>

      <td class="p-4 text-gray-600">
        ${escapeHtml(
          grade.educationLevel?.name || "-"
        )}
      </td>

      <td class="p-4 text-gray-600">
        ${grade.streams?.length || 0}
      </td>

      <td class="p-4 text-right">
        <button
          type="button"
          onclick="editGrade('${grade.id}')"
          class="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
        >
          Edit
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

function populateGradeSelects(grades = []) {

  const selectIds = [

    "gradeSelect",

    "timetableGrade",

    "assessmentGrade",

    "reportCardGrade",

    "assignmentGrade",

    "classTeacherGrade"

  ];


  selectIds.forEach(id => {

    const select =
      document.getElementById(id);


    if (!select) {
      return;
    }


    const currentValue =
      select.value;


    select.innerHTML =
      `<option value="">Select grade</option>`;


    grades.forEach(grade => {

      const option =
        document.createElement("option");


      option.value =
        grade.id;


      option.textContent =
        grade.name;


      select.appendChild(option);
    });


    if (currentValue) {
      select.value =
        currentValue;
    }
  });
}


/*
|--------------------------------------------------------------------------
| CREATE GRADE
|--------------------------------------------------------------------------
*/

async function createGrade(data) {

  try {

    const response =
      await apiRequest(
        "/academic-admin/grades",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );


    await loadGrades();

    await loadAcademicOverview();

    await loadAcademicDashboard();


    showSuccess(
      "Grade created successfully."
    );


    return extractData(response);

  } catch (error) {

    showError(
      error.message
    );

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE GRADE
|--------------------------------------------------------------------------
*/

async function updateGrade(
  gradeId,
  data
) {

  try {

    const response =
      await apiRequest(
        `/academic-admin/grades/${gradeId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );


    await loadGrades();

    await loadAcademicOverview();


    showSuccess(
      "Grade updated successfully."
    );


    return extractData(response);

  } catch (error) {

    showError(
      error.message
    );

    throw error;
  }
}

async function editGrade(gradeId) {
  const grade =
    window.__grades?.find(
      (item) => item.id === gradeId
    );

  if (!grade) {
    showError(
      "Grade not found."
    );

    return;
  }

  await openGradeModal(grade);
}



document.addEventListener("submit", async function (event) {
  if (event.target.id !== "gradeForm") return;

  event.preventDefault();

  const name = document
    .getElementById("gradeName")
    .value
    .trim();

  const educationLevelId = document
    .getElementById("educationLevelId")
    .value;

  if (!name || !educationLevelId) {
    showError("Grade name and education level are required.");
    return;
  }

  try {
    await apiRequest("/academic-admin/grades", {
      method: "POST",
      body: JSON.stringify({
        name,
        educationLevelId,
      }),
    });

    showSuccess("Grade created successfully.");

    closeModal();

    await loadGrades();
  } catch (error) {
    console.error("Failed to create grade:", error);

    showError(
      error.message || "Failed to create grade."
    );
  }
});

/*
|--------------------------------------------------------------------------
| STREAMS
|--------------------------------------------------------------------------
*/

function openStreamModal() {
  document.getElementById("modalTitle").textContent = "Add Stream";

  document.getElementById("modalBody").innerHTML = `
    <form id="streamForm" class="space-y-4">

      <div>
        <label
          for="streamName"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Stream Name
        </label>

        <input
          type="text"
          id="streamName"
          name="name"
          placeholder="e.g. East"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        />
      </div>

      <div>
        <label
          for="streamGradeId"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Grade
        </label>

        <select
          id="streamGradeId"
          name="gradeId"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        >
          <option value="">Loading grades...</option>
        </select>
      </div>

      <div class="flex justify-end gap-3 pt-3">

        <button
          type="button"
          onclick="closeModal()"
          class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="px-4 py-2 rounded-lg bg-school-800 text-white hover:bg-school-900"
        >
          Save Stream
        </button>

      </div>

    </form>
  `;

  const modal = document.getElementById("modal");

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  loadGradesForStream();
}


async function loadGradesForStream() {
  const select = document.getElementById("streamGradeId");

  if (!select) return;

  try {
    const result = await apiRequest(
      "/academic-admin/grades"
    );

    const grades = extractData(result);

    if (!grades || grades.length === 0) {
      select.innerHTML = `
        <option value="">
          No grades available
        </option>
      `;
      return;
    }

    select.innerHTML = `
      <option value="">
        Select grade
      </option>

      ${grades.map((grade) => `
        <option value="${escapeHtml(grade.id)}">
          ${escapeHtml(grade.name)}
        </option>
      `).join("")}
    `;

  } catch (error) {
    console.error(
      "Failed to load grades for stream:",
      error
    );

    select.innerHTML = `
      <option value="">
        Failed to load grades
      </option>
    `;

    showError(
      error.message ||
      "Failed to load grades."
    );
  }
}


async function loadStreams(
  gradeId = ""
) {

  try {

    const query =
      gradeId
        ? `?gradeId=${encodeURIComponent(gradeId)}`
        : "";


    const response =
      await apiRequest(
        `/academic-admin/streams${query}`
      );


    const streams =
      extractData(response);


    window.__streams =
      streams;


    renderStreams(
      streams
    );


    populateStreamSelects(
      streams
    );

  } catch (error) {

    console.error(error);

    showError(
      "Unable to load streams."
    );
  }
}

function renderStreams(streams) {
  const table = document.getElementById("streamsTable");

  if (!table) return;

  if (!streams || streams.length === 0) {
    table.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="px-5 py-8 text-center text-gray-500"
        >
          No streams found.
        </td>
      </tr>
    `;

    return;
  }

  table.innerHTML = streams
    .map((stream, index) => {
      const gradeName =
        stream.grade?.name || "—";

      const educationLevelName =
        stream.grade?.educationLevel?.name || "—";

      return `
        <tr class="border-b last:border-b-0 hover:bg-gray-50">

          <td class="px-5 py-3 text-gray-500">
            ${index + 1}
          </td>

          <td class="px-5 py-3 font-medium text-gray-900">
            ${escapeHtml(stream.name)}
          </td>

          <td class="px-5 py-3 text-gray-700">
            ${escapeHtml(gradeName)}
          </td>

          <td class="px-5 py-3 text-gray-700">
            ${escapeHtml(educationLevelName)}
          </td>

          <td class="px-5 py-3 text-right">
            <button
              type="button"
              onclick="editStream('${stream.id}')"
              class="text-sm text-school-800 hover:underline"
            >
              Edit
            </button>
          </td>

        </tr>
      `;
    })
    .join("");
}


function populateStreamSelects(
  streams = []
) {

  const selectIds = [

    "streamSelect",

    "timetableStream",

    "assessmentStream",

    "reportCardStream",

    "assignmentStream",

    "classTeacherStream"

  ];


  selectIds.forEach(id => {

    const select =
      document.getElementById(id);


    if (!select) {
      return;
    }


    const currentValue =
      select.value;


    select.innerHTML =
      `<option value="">All streams</option>`;


    streams.forEach(stream => {

      const option =
        document.createElement("option");


      option.value =
        stream.id;


      option.textContent =
        `${stream.grade?.name || ""} - ${stream.name}`;


      select.appendChild(option);
    });


    if (currentValue) {
      select.value =
        currentValue;
    }
  });
}


/*
|--------------------------------------------------------------------------
| CREATE STREAM
|--------------------------------------------------------------------------
*/

async function createStream(data) {

  try {

    const response =
      await apiRequest(
        "/academic-admin/streams",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );


    await loadStreams();

    await loadAcademicOverview();

    await loadAcademicDashboard();


    showSuccess(
      "Stream created successfully."
    );


    return extractData(response);

  } catch (error) {

    showError(
      error.message
    );

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE STREAM
|--------------------------------------------------------------------------
*/

async function updateStream(
  streamId,
  data
) {

  try {

    const response =
      await apiRequest(
        `/academic-admin/streams/${streamId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );


    await loadStreams();

    await loadAcademicOverview();


    showSuccess(
      "Stream updated successfully."
    );


    return extractData(response);

  } catch (error) {

    showError(
      error.message
    );

    throw error;
  }
}

async function editStream(streamId) {
  console.log("Editing stream:", streamId);

  if (!streamId) {
    showError("Stream ID is missing.");
    return;
  }

  // IMPORTANT: store the ID for the shared submit handler
  window.__editingStreamId = streamId;

  const stream = (window.__streams || []).find(
    (item) => item.id === streamId
  );

  if (!stream) {
    showError("Stream not found.");
    return;
  }

  document.getElementById("modalTitle").textContent = "Edit Stream";

  document.getElementById("modalBody").innerHTML = `
    <form id="editStreamForm" class="space-y-4">

      <div>
        <label
          for="editStreamName"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Stream Name
        </label>

        <input
          type="text"
          id="editStreamName"
          value="${escapeHtml(stream.name || "")}"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        />
      </div>

      <div>
        <label
          for="editStreamGradeId"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Grade
        </label>

        <select
          id="editStreamGradeId"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        >
          <option value="">Loading grades...</option>
        </select>
      </div>

      <div class="flex justify-end gap-3 pt-3">

        <button
          type="button"
          onclick="closeModal()"
          class="px-4 py-2 rounded-lg border border-gray-300"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="px-4 py-2 rounded-lg bg-school-800 text-white"
        >
          Update Stream
        </button>

      </div>

    </form>
  `;

  const modal = document.getElementById("modal");

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  try {
    const response =
      await apiRequest("/academic-admin/grades");

    const grades = extractData(response);

    const select =
      document.getElementById("editStreamGradeId");

    if (!grades || grades.length === 0) {
      select.innerHTML =
        `<option value="">No grades available</option>`;
      return;
    }

    select.innerHTML = `
      <option value="">Select grade</option>

      ${grades.map((grade) => `
        <option
          value="${escapeHtml(grade.id)}"
          ${grade.id === stream.gradeId ? "selected" : ""}
        >
          ${escapeHtml(grade.name)}
        </option>
      `).join("")}
    `;

  } catch (error) {

    console.error(
      "Failed to load grades for stream edit:",
      error
    );

    showError(
      error.message || "Failed to load grades."
    );
  }
}

document.addEventListener("submit", async function (event) {
  if (event.target.id !== "streamForm") return;

  event.preventDefault();

  const name =
    document.getElementById("streamName")
      .value
      .trim();

  const gradeId =
    document.getElementById("streamGradeId")
      .value;

  if (!name || !gradeId) {
    showError(
      "Stream name and grade are required."
    );

    return;
  }

  try {
    await apiRequest(
      "/academic-admin/streams",
      {
        method: "POST",

        body: JSON.stringify({
          name,
          gradeId,
        }),
      }
    );

    showSuccess(
      "Stream created successfully."
    );

    closeModal();

    await loadStreams();

  } catch (error) {
    console.error(
      "Failed to create stream:",
      error
    );

    showError(
      error.message ||
      "Failed to create stream."
    );
  }
});



document.addEventListener("submit", async function (event) {
  const form = event.target;

  // Only handle our edit forms
  const editForms = [
    "editAcademicYearForm",
    "editTermForm",
    "editGradeForm",
    "editStreamForm",
  ];

  if (!editForms.includes(form.id)) {
    return;
  }

  event.preventDefault();

  try {
    let endpoint;
    let method = "PATCH";
    let body;

    /*
    |--------------------------------------------------------------------------
    | EDIT ACADEMIC YEAR
    |--------------------------------------------------------------------------
    */

    if (form.id === "editAcademicYearForm") {
      const academicYearId = window.__editingAcademicYearId;

      const name =
        document.getElementById("editAcademicYearName").value.trim();

      const startDate =
        document.getElementById("editAcademicYearStartDate").value;

      const endDate =
        document.getElementById("editAcademicYearEndDate").value;

      if (!academicYearId) {
        showError("Academic year ID is missing.");
        return;
      }

      if (!name || !startDate || !endDate) {
        showError("Please fill in all academic year fields.");
        return;
      }

      endpoint =
        `/academic-admin/academic-years/${academicYearId}`;

      body = {
        name,
        startDate,
        endDate,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | EDIT TERM
    |--------------------------------------------------------------------------
    */

    else if (form.id === "editTermForm") {
      const termId = window.__editingTermId;

      const termNumber =
        document.getElementById("editTermNumber").value;

      const name =
        document.getElementById("editTermName").value.trim();

      const startDate =
        document.getElementById("editTermStartDate").value;

      const endDate =
        document.getElementById("editTermEndDate").value;

      if (!termId) {
        showError("Term ID is missing.");
        return;
      }

      if (!termNumber || !name || !startDate || !endDate) {
        showError("Please fill in all term fields.");
        return;
      }

      endpoint =
        `/academic-admin/terms/${termId}`;

      body = {
        termNumber: Number(termNumber),
        name,
        startDate,
        endDate,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | EDIT GRADE
    |--------------------------------------------------------------------------
    */

    else if (form.id === "editGradeForm") {
      const gradeId = window.__editingGradeId;

      const name =
        document.getElementById("editGradeName").value.trim();

      const educationLevelId =
        document.getElementById("editEducationLevelId").value;

      if (!gradeId) {
        showError("Grade ID is missing.");
        return;
      }

      if (!name || !educationLevelId) {
        showError("Grade name and education level are required.");
        return;
      }

      endpoint =
        `/academic-admin/grades/${gradeId}`;

      body = {
        name,
        educationLevelId,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | EDIT STREAM
    |--------------------------------------------------------------------------
    */

    else if (form.id === "editStreamForm") {
      const streamId = window.__editingStreamId;

      const name =
        document.getElementById("editStreamName").value.trim();

      const gradeId =
        document.getElementById("editStreamGradeId").value;

        console.log("Updating stream:", {
     streamId,
     name,
     gradeId
     });


      if (!streamId) {
        showError("Stream ID is missing.");
        return;
      }

      if (!name || !gradeId) {
        showError("Stream name and grade are required.");
        return;
      }

      endpoint =
        `/academic-admin/streams/${streamId}`;

      body = {
        name,
        gradeId,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | SEND UPDATE
    |--------------------------------------------------------------------------
    */

    await apiRequest(endpoint, {
      method,
      body: JSON.stringify(body),
    });

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    showSuccess("Updated successfully.");

    closeModal();

    /*
    |--------------------------------------------------------------------------
    | REFRESH THE CORRECT TABLE
    |--------------------------------------------------------------------------
    */

    if (form.id === "editAcademicYearForm") {
      await loadAcademicYears();
    }

    else if (form.id === "editTermForm") {
      await loadTerms();
    }

    else if (form.id === "editGradeForm") {
      await loadGrades();
    }

    else if (form.id === "editStreamForm") {
      await loadStreams();
    }

  } catch (error) {

    console.error("Failed to update:", error);

    showError(
      error.message || "Failed to update."
    );
  }
});

/*
|--------------------------------------------------------------------------
| STUDENTS
|--------------------------------------------------------------------------
|
| Student module owns the actual student endpoint.
|
|--------------------------------------------------------------------------
*/

 async function loadStudents(search = "") {

  const table =
    document.getElementById("studentsTable");

  table.innerHTML = `
    <tr>
      <td
        colspan="5"
        class="p-8 text-center text-gray-500"
      >
        Loading students...
      </td>
    </tr>
  `;


  try {

    const query =
      search
        ? `?search=${encodeURIComponent(search)}`
        : "";


    const response =
      await apiRequest(
        `/admissions-admin/students${query}`
      );


    const data =
      extractData(response);


    students =
      Array.isArray(data)
        ? data
        : data?.students || [];


    renderStudents();

    populateParentStudentSelect();

  } catch (error) {

    console.error(error);

    table.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="p-8 text-center text-red-600"
        >
          ${escapeHtml(error.message)}
        </td>
      </tr>
    `;
  }
}


async function searchStudents() {

  const search =
    document
      .getElementById("studentSearch")
      .value
      .trim();

  await loadStudents(search);
}


function handleStudentSearchKey(event) {

  if (event.key === "Enter") {
    searchStudents();
  }
}

 
 
 


function renderStudents() {

  const table =
    document.getElementById("studentsTable");


  if (!students.length) {

    table.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="p-8 text-center text-gray-500"
        >
          No students found.
        </td>
      </tr>
    `;

    return;
  }


  table.innerHTML =
    students
      .map(student => {

        const user =
          student.user || {};


        const firstName =
          student.firstName ||
          user.firstName ||
          "";


        const middleName =
          student.middleName ||
          user.middleName ||
          "";


        const lastName =
          student.lastName ||
          user.lastName ||
          "";


        const fullName =
          [
            firstName,
            middleName,
            lastName,
          ]
            .filter(Boolean)
            .join(" ");


        const admissionNumber =
          student.admissionNumber || "-";


        const gender =
          student.gender || "-";


        const isActive =
          student.isActive ??
          student.status === "ACTIVE";


        /*
        |--------------------------------------------------------------------------
        | PARENT
        |--------------------------------------------------------------------------
        */

        const parentLinks =
          Array.isArray(student.parentLinks)
            ? student.parentLinks
            : [];


        const parentNames =
          parentLinks
            .map(link => {

              const parentUser =
                link?.parent?.user || {};

              return [
                parentUser.firstName,
                parentUser.middleName,
                parentUser.lastName,
              ]
                .filter(Boolean)
                .join(" ");

            })
            .filter(Boolean);


        const parentName =
          parentNames.length
            ? parentNames.join(", ")
            : "No parent linked";


        return `
          <tr class="border-t hover:bg-gray-50">

            <td class="p-4 font-medium">
              ${escapeHtml(admissionNumber)}
            </td>


            <td class="p-4">
              ${escapeHtml(fullName || "-")}
            </td>


            <td class="p-4">
              ${escapeHtml(gender)}
            </td>


            <!-- PARENT -->

            <td class="p-4">
              <div class="font-medium text-gray-800">
                ${escapeHtml(parentName)}
              </div>

              ${
                parentLinks.length
                  ? `
                    <div class="text-xs text-gray-500 mt-1">
                      ${parentLinks.length}
                      ${
                        parentLinks.length === 1
                          ? "parent linked"
                          : "parents linked"
                      }
                    </div>
                  `
                  : ""
              }
            </td>


            <td class="p-4 text-right">

              <button
                type="button"
                onclick="viewStudent('${student.id}')"
                class="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs"
              >
                View
              </button>

            </td>

          </tr>
        `;
      })
      .join("");
}



/*
|--------------------------------------------------------------------------
| VIEW STUDENT PROFILE
|--------------------------------------------------------------------------
|
| Clicking View now opens a complete student profile on the
| current page. No HTML redirect is used.
|
|--------------------------------------------------------------------------
*/



/*
|--------------------------------------------------------------------------
| STUDENT PROFILE
|--------------------------------------------------------------------------
|
| The student profile stays on the current page.
| No students-details.html redirect is required.
|
|--------------------------------------------------------------------------
*/

async function viewStudent(studentId) {

  try {

    const response =
      await apiRequest(
        `/admissions-admin/students/${studentId}`
      );


    selectedStudent =
      extractData(response);


    if (!selectedStudent) {
      throw new Error(
        "Student information could not be loaded."
      );
    }


    displaySelectedStudent();

  } catch (error) {

    console.error(
      "Student profile error:",
      error
    );

    showError(
      error.message ||
      "Failed to load student profile."
    );
  }
}


/*
|--------------------------------------------------------------------------
| DISPLAY STUDENT PROFILE
|--------------------------------------------------------------------------
*/

function displaySelectedStudent() {

  if (!selectedStudent) {
    return;
  }


  const existingProfile =
    document.getElementById(
      "studentProfileModal"
    );


  if (existingProfile) {
    existingProfile.remove();
  }


  const firstName =
    selectedStudent.firstName ||
    selectedStudent.user?.firstName ||
    "";


  const middleName =
    selectedStudent.middleName ||
    selectedStudent.user?.middleName ||
    "";


  const lastName =
    selectedStudent.lastName ||
    selectedStudent.user?.lastName ||
    "";


  const fullName =
    [
      firstName,
      middleName,
      lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Student";


  const admissionNumber =
    selectedStudent.admissionNumber ||
    "-";


  const gender =
    selectedStudent.gender ||
    "-";


  const dateOfBirth =
    formatStudentDate(
      selectedStudent.dateOfBirth
    );


  const status =
    selectedStudent.status ||
    (
      selectedStudent.isActive === false
        ? "INACTIVE"
        : "ACTIVE"
    );


  const currentEnrollment =
    getCurrentStudentEnrollment();


  const gradeName =
    currentEnrollment?.grade?.name ||
    currentEnrollment?.grade?.gradeName ||
    currentEnrollment?.grade?.label ||
    "-";


  const streamName =
    currentEnrollment?.stream?.name ||
    currentEnrollment?.stream?.streamName ||
    currentEnrollment?.stream?.label ||
    "-";


  const academicYearName =
    currentEnrollment?.academicYear?.name ||
    currentEnrollment?.academicYear?.label ||
    currentEnrollment?.academicYear?.year ||
    "-";


  const termName =
    currentEnrollment?.term?.name ||
    currentEnrollment?.term?.label ||
    "-";


  const initials =
    [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .map(
        name =>
          name.charAt(0).toUpperCase()
      )
      .join("")
      .slice(0, 2) ||
    "ST";


  const modal =
    document.createElement("div");


  modal.id =
    "studentProfileModal";


  modal.className =
    "fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4";


  modal.innerHTML = `

    <div
      class="bg-white w-full max-w-7xl max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
    >

      <!-- =====================================================
           PROFILE HEADER
      ====================================================== -->

      <div class="border-b bg-white">

        <div class="p-6 flex items-start justify-between gap-4">

          <div class="flex items-center gap-4">

            <div
              class="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold"
            >
              ${escapeHtml(initials)}
            </div>


            <div>

              <h2
                class="text-2xl font-bold text-gray-900"
              >
                ${escapeHtml(fullName)}
              </h2>


              <p class="text-sm text-gray-500 mt-1">
                Admission No:
                <span class="font-medium text-gray-700">
                  ${escapeHtml(admissionNumber)}
                </span>
              </p>


              <div class="flex flex-wrap gap-2 mt-3">

                <span
                  class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"
                >
                  ${escapeHtml(gradeName)}
                </span>


                <span
                  class="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700"
                >
                  ${escapeHtml(streamName)}
                </span>


                <span
                  class="px-2.5 py-1 rounded-full text-xs font-semibold
                  ${
                    status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }"
                >
                  ${escapeHtml(status)}
                </span>

              </div>

            </div>

          </div>


          <button
            type="button"
            onclick="closeStudentProfile()"
            class="w-10 h-10 rounded-lg hover:bg-gray-100 text-gray-500 text-2xl"
            title="Close"
          >
            &times;
          </button>

        </div>


        <!-- =====================================================
             QUICK ACADEMIC SUMMARY
        ====================================================== -->

        <div
          class="px-6 pb-5 grid grid-cols-2 md:grid-cols-4 gap-3"
        >

          ${studentProfileCard(
            "Current Grade",
            gradeName
          )}

          ${studentProfileCard(
            "Stream",
            streamName
          )}

          ${studentProfileCard(
            "Academic Year",
            academicYearName
          )}

          ${studentProfileCard(
            "Current Term",
            termName
          )}

        </div>


        <!-- =====================================================
             TABS
        ====================================================== -->

        <div
          id="studentProfileTabs"
          class="px-4 overflow-x-auto border-t"
        >

          <div class="flex min-w-max">

            ${studentProfileTab(
              "overview",
              "Overview",
              true
            )}

            ${studentProfileTab(
              "academics",
              "Academics"
            )}

            ${studentProfileTab(
              "attendance",
              "Attendance"
            )}

            ${studentProfileTab(
              "assessments",
              "Assessments"
            )}

            ${studentProfileTab(
              "report-cards",
              "Report Cards"
            )}

            ${studentProfileTab(
              "fees",
              "Fees"
            )}

            ${studentProfileTab(
              "parents",
              "Parents"
            )}

            ${studentProfileTab(
              "enrollment-history",
              "Enrollment History"
            )}

          </div>

        </div>

      </div>


      <!-- =====================================================
           PROFILE CONTENT
      ====================================================== -->

      <div
        id="studentProfileContent"
        class="overflow-y-auto p-6 bg-gray-50"
      >

        ${renderStudentProfileTab("overview")}

      </div>

    </div>

  `;


  document.body.appendChild(modal);


  /*
  |--------------------------------------------------------------------------
  | Close when clicking outside the profile
  |--------------------------------------------------------------------------
  */

  modal.addEventListener(
    "click",
    event => {

      if (
        event.target === modal
      ) {

        closeStudentProfile();

      }

    }
  );

}


/*
|--------------------------------------------------------------------------
| PROFILE TAB BUTTON
|--------------------------------------------------------------------------
*/

function studentProfileTab(
  id,
  label,
  active = false
) {

  return `

    <button
      type="button"
      data-student-tab="${escapeHtml(id)}"
      onclick="switchStudentProfileTab('${escapeHtml(id)}')"
      class="
        px-4 py-3
        text-sm
        font-medium
        border-b-2
        whitespace-nowrap
        ${
          active
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
        }
      "
    >
      ${escapeHtml(label)}
    </button>

  `;
}


/*
|--------------------------------------------------------------------------
| SWITCH PROFILE TAB
|--------------------------------------------------------------------------
*/

function switchStudentProfileTab(tab) {

  if (!selectedStudent) {
    return;
  }


  const content =
    document.getElementById(
      "studentProfileContent"
    );


  if (!content) {
    return;
  }


  document
    .querySelectorAll(
      "[data-student-tab]"
    )
    .forEach(button => {

      const isActive =
        button.dataset.studentTab === tab;


      button.classList.toggle(
        "border-blue-600",
        isActive
      );


      button.classList.toggle(
        "text-blue-600",
        isActive
      );


      button.classList.toggle(
        "border-transparent",
        !isActive
      );


      button.classList.toggle(
        "text-gray-500",
        !isActive
      );

    });


  content.innerHTML =
    renderStudentProfileTab(tab);
}


/*
|--------------------------------------------------------------------------
| RENDER PROFILE TAB
|--------------------------------------------------------------------------
*/

function renderStudentProfileTab(tab) {

  switch (tab) {

    case "overview":
      return renderStudentOverview();

    case "academics":
      return renderStudentAcademics();

    case "attendance":
      return renderStudentAttendance();

    case "assessments":
      return renderStudentAssessments();

    case "report-cards":
      return renderStudentReportCards();

    case "fees":
      return renderStudentFees();

    case "parents":
      return renderStudentParents();

    case "enrollment-history":
      return renderStudentEnrollmentHistory();

    default:
      return renderStudentOverview();

  }
}


/*
|--------------------------------------------------------------------------
| OVERVIEW
|--------------------------------------------------------------------------
*/

function renderStudentOverview() {

  const firstName =
    selectedStudent.firstName ||
    selectedStudent.user?.firstName ||
    "";


  const middleName =
    selectedStudent.middleName ||
    selectedStudent.user?.middleName ||
    "";


  const lastName =
    selectedStudent.lastName ||
    selectedStudent.user?.lastName ||
    "";


  const currentEnrollment =
    getCurrentStudentEnrollment();


  return `

    <div class="space-y-6">

      <!-- Student Information -->

      <section class="bg-white rounded-xl border">

        <div class="p-5 border-b">

          <h3 class="font-bold text-lg">
            Student Information
          </h3>

          <p class="text-sm text-gray-500 mt-1">
            Basic learner information.
          </p>

        </div>


        <div
          class="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >

          ${studentProfileDetail(
            "First Name",
            firstName
          )}

          ${studentProfileDetail(
            "Middle Name",
            middleName || "-"
          )}

          ${studentProfileDetail(
            "Last Name",
            lastName
          )}

          ${studentProfileDetail(
            "Admission Number",
            selectedStudent.admissionNumber || "-"
          )}

          ${studentProfileDetail(
            "Gender",
            selectedStudent.gender || "-"
          )}

          ${studentProfileDetail(
            "Date of Birth",
            formatStudentDate(
              selectedStudent.dateOfBirth
            )
          )}

          ${studentProfileDetail(
            "Student ID",
            selectedStudent.id || "-"
          )}

          ${studentProfileDetail(
            "Status",
            selectedStudent.status ||
            (
              selectedStudent.isActive === false
                ? "INACTIVE"
                : "ACTIVE"
            )
          )}

        </div>

      </section>


      <!-- Current Academic Placement -->

      <section class="bg-white rounded-xl border">

        <div class="p-5 border-b">

          <h3 class="font-bold text-lg">
            Current Academic Placement
          </h3>

        </div>


        <div
          class="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >

          ${studentProfileDetail(
            "Grade",
            currentEnrollment?.grade?.name ||
            currentEnrollment?.grade?.gradeName ||
            "-"
          )}

          ${studentProfileDetail(
            "Stream",
            currentEnrollment?.stream?.name ||
            currentEnrollment?.stream?.streamName ||
            "-"
          )}

          ${studentProfileDetail(
            "Academic Year",
            currentEnrollment?.academicYear?.name ||
            currentEnrollment?.academicYear?.year ||
            "-"
          )}

          ${studentProfileDetail(
            "Term",
            currentEnrollment?.term?.name ||
            "-"
          )}

        </div>

      </section>


      <!-- Parent Summary -->

      <section class="bg-white rounded-xl border">

        <div class="p-5 border-b flex items-center justify-between">

          <div>

            <h3 class="font-bold text-lg">
              Parents / Guardians
            </h3>

            <p class="text-sm text-gray-500 mt-1">
              Linked parents and guardians.
            </p>

          </div>


          <button
            type="button"
            onclick="switchStudentProfileTab('parents')"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View all
          </button>

        </div>


        <div class="p-5">

          ${renderParentSummary()}

        </div>

      </section>

    </div>

  `;
}


/*
|--------------------------------------------------------------------------
| ACADEMICS
|--------------------------------------------------------------------------
*/

function renderStudentAcademics() {

  const enrollments =
    Array.isArray(
      selectedStudent.enrollments
    )
      ? selectedStudent.enrollments
      : [];


  if (!enrollments.length) {

    return studentEmptyState(
      "No academic enrollment history is available."
    );

  }


  return `

    <section class="bg-white rounded-xl border">

      <div class="p-5 border-b">

        <h3 class="font-bold text-lg">
          Academic History
        </h3>

        <p class="text-sm text-gray-500 mt-1">
          The learner's academic placements over time.
        </p>

      </div>


      <div class="overflow-x-auto">

        <table class="w-full text-sm">

          <thead class="bg-gray-50">

            <tr>

              <th class="text-left p-4">
                Academic Year
              </th>

              <th class="text-left p-4">
                Term
              </th>

              <th class="text-left p-4">
                Grade
              </th>

              <th class="text-left p-4">
                Stream
              </th>

              <th class="text-left p-4">
                Admission Date
              </th>

              <th class="text-left p-4">
                Status
              </th>

            </tr>

          </thead>


          <tbody>

            ${enrollments
              .map(enrollment => `

                <tr class="border-t">

                  <td class="p-4">
                    ${escapeHtml(
                      enrollment.academicYear?.name ||
                      enrollment.academicYear?.year ||
                      "-"
                    )}
                  </td>

                  <td class="p-4">
                    ${escapeHtml(
                      enrollment.term?.name ||
                      "-"
                    )}
                  </td>

                  <td class="p-4">
                    ${escapeHtml(
                      enrollment.grade?.name ||
                      enrollment.grade?.gradeName ||
                      "-"
                    )}
                  </td>

                  <td class="p-4">
                    ${escapeHtml(
                      enrollment.stream?.name ||
                      enrollment.stream?.streamName ||
                      "-"
                    )}
                  </td>

                  <td class="p-4">
                    ${formatStudentDate(
                      enrollment.admissionDate
                    )}
                  </td>

                  <td class="p-4">

                    <span class="
                      inline-flex px-2.5 py-1 rounded-full
                      text-xs font-semibold
                      ${
                        enrollment.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }
                    ">
                      ${
                        enrollment.isActive
                          ? "Active"
                          : "Inactive"
                      }
                    </span>

                  </td>

                </tr>

              `)
              .join("")}

          </tbody>

        </table>

      </div>

    </section>

  `;
}


/*
|--------------------------------------------------------------------------
| ATTENDANCE
|--------------------------------------------------------------------------
|
| Attendance records are not currently included in the student-detail
| response, so we deliberately do not invent attendance numbers here.
|
|--------------------------------------------------------------------------
*/

function renderStudentAttendance() {

  return `

    <section class="bg-white rounded-xl border">

      <div class="p-5 border-b">

        <h3 class="font-bold text-lg">
          Attendance
        </h3>

        <p class="text-sm text-gray-500 mt-1">
          Learner attendance records.
        </p>

      </div>


      <div class="p-8 text-center">

        <div class="text-4xl mb-3">
          📅
        </div>

        <h4 class="font-semibold text-gray-800">
          Attendance data is not connected yet
        </h4>

        <p class="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
          The profile interface is ready for attendance.
          We will connect the learner's attendance records
          from the backend next.
        </p>

      </div>

    </section>

  `;
}


/*
|--------------------------------------------------------------------------
| ASSESSMENTS
|--------------------------------------------------------------------------
*/

function renderStudentAssessments() {

  const results =
    Array.isArray(
      selectedStudent.assessmentResults
    )
      ? selectedStudent.assessmentResults
      : [];


  if (!results.length) {

    return studentEmptyState(
      "No assessment results are available for this learner."
    );

  }


  return `

    <section class="bg-white rounded-xl border">

      <div class="p-5 border-b">

        <h3 class="font-bold text-lg">
          Assessment History
        </h3>

        <p class="text-sm text-gray-500 mt-1">
          Assessment results recorded for the learner.
        </p>

      </div>


      <div class="overflow-x-auto">

        <table class="w-full text-sm">

          <thead class="bg-gray-50">

            <tr>

              <th class="text-left p-4">
                Learning Area
              </th>

              <th class="text-left p-4">
                Academic Year
              </th>

              <th class="text-left p-4">
                Term
              </th>

              <th class="text-left p-4">
                Marks
              </th>

              <th class="text-left p-4">
                Performance
              </th>

              <th class="text-left p-4">
                Teacher Comment
              </th>

            </tr>

          </thead>


          <tbody>

            ${results
              .map(result => `

                <tr class="border-t">

                  <td class="p-4 font-medium">

                    ${escapeHtml(
                      result.assessment?.learningArea?.name ||
                      result.learningArea?.name ||
                      "-"
                    )}

                  </td>

                  <td class="p-4">

                    ${escapeHtml(
                      result.assessment?.academicYear?.name ||
                      result.assessment?.academicYear?.year ||
                      "-"
                    )}

                  </td>

                  <td class="p-4">

                    ${escapeHtml(
                      result.assessment?.term?.name ||
                      "-"
                    )}

                  </td>

                  <td class="p-4">

                    ${escapeHtml(
                      result.marks ??
                      result.score ??
                      "-"
                    )}

                  </td>

                  <td class="p-4">

                    ${escapeHtml(
                      result.performanceLevel ||
                      result.performance ||
                      "-"
                    )}

                  </td>

                  <td class="p-4 text-gray-600">

                    ${escapeHtml(
                      result.teacherComment ||
                      "-"
                    )}

                  </td>

                </tr>

              `)
              .join("")}

          </tbody>

        </table>

      </div>

    </section>

  `;
}


/*
|--------------------------------------------------------------------------
| REPORT CARDS
|--------------------------------------------------------------------------
*/

function renderStudentReportCards() {

  const reportCards =
    Array.isArray(
      selectedStudent.reportCards
    )
      ? selectedStudent.reportCards
      : [];


  if (!reportCards.length) {

    return studentEmptyState(
      "No report cards are available for this learner."
    );

  }


  return `

    <section class="bg-white rounded-xl border">

      <div class="p-5 border-b">

        <h3 class="font-bold text-lg">
          Report Cards
        </h3>

        <p class="text-sm text-gray-500 mt-1">
          Term report cards and academic standing.
        </p>

      </div>


      <div class="overflow-x-auto">

        <table class="w-full text-sm">

          <thead class="bg-gray-50">

            <tr>

              <th class="text-left p-4">
                Academic Year
              </th>

              <th class="text-left p-4">
                Term
              </th>

              <th class="text-left p-4">
                Status
              </th>

              <th class="text-left p-4">
                Grade Position
              </th>

              <th class="text-left p-4">
                Stream Position
              </th>

              <th class="text-left p-4">
                Total Score
              </th>

            </tr>

          </thead>


          <tbody>

            ${reportCards
              .map(reportCard => `

                <tr class="border-t">

                  <td class="p-4">

                    ${escapeHtml(
                      reportCard.academicYear?.name ||
                      reportCard.academicYear?.year ||
                      "-"
                    )}

                  </td>

                  <td class="p-4">

                    ${escapeHtml(
                      reportCard.term?.name ||
                      "-"
                    )}

                  </td>

                  <td class="p-4">

                    <span class="
                      inline-flex px-2.5 py-1 rounded-full
                      text-xs font-semibold
                      ${
                        reportCard.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    ">
                      ${escapeHtml(
                        reportCard.status || "-"
                      )}
                    </span>

                  </td>

                  <td class="p-4">

                    ${escapeHtml(
                      reportCard.gradePosition ??
                      "-"
                    )}

                  </td>

                  <td class="p-4">

                    ${escapeHtml(
                      reportCard.streamPosition ??
                      "-"
                    )}

                  </td>

                  <td class="p-4 font-medium">

                    ${escapeHtml(
                      reportCard.totalScore ??
                      "-"
                    )}

                  </td>

                </tr>

              `)
              .join("")}

          </tbody>

        </table>

      </div>

    </section>

  `;
}


/*
|--------------------------------------------------------------------------
| FEES
|--------------------------------------------------------------------------
*/

function renderStudentFees() {

  const account =
    selectedStudent.feeAccount;


  if (!account) {

    return studentEmptyState(
      "No fee account has been created for this learner."
    );

  }


  const charges =
    Array.isArray(account.charges)
      ? account.charges
      : [];


  const payments =
    Array.isArray(account.payments)
      ? account.payments
      : [];


  const adjustments =
    Array.isArray(account.adjustments)
      ? account.adjustments
      : [];


  const totalCharges =
    charges.reduce(
      (sum, item) =>
        sum +
        Number(
          item.amount ||
          item.totalAmount ||
          0
        ),
      0
    );


  const totalPayments =
    payments.reduce(
      (sum, item) =>
        sum +
        Number(
          item.amount ||
          0
        ),
      0
    );


  const totalAdjustments =
    adjustments.reduce(
      (sum, item) =>
        sum +
        Number(
          item.amount ||
          0
        ),
      0
    );


  const balance =
    totalCharges -
    totalPayments +
    totalAdjustments;


  return `

    <div class="space-y-6">

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

        ${studentProfileMoneyCard(
          "Total Charges",
          totalCharges
        )}

        ${studentProfileMoneyCard(
          "Total Payments",
          totalPayments
        )}

        ${studentProfileMoneyCard(
          "Outstanding Balance",
          balance
        )}

      </div>


      <section class="bg-white rounded-xl border">

        <div class="p-5 border-b">

          <h3 class="font-bold text-lg">
            Fee Charges
          </h3>

        </div>


        <div class="overflow-x-auto">

          <table class="w-full text-sm">

            <thead class="bg-gray-50">

              <tr>

                <th class="text-left p-4">
                  Description
                </th>

                <th class="text-left p-4">
                  Academic Year
                </th>

                <th class="text-left p-4">
                  Term
                </th>

                <th class="text-right p-4">
                  Amount
                </th>

              </tr>

            </thead>


            <tbody>

              ${
                charges.length
                  ? charges
                      .map(charge => `

                        <tr class="border-t">

                          <td class="p-4">
                            ${escapeHtml(
                              charge.description ||
                              charge.name ||
                              "-"
                            )}
                          </td>

                          <td class="p-4">
                            ${escapeHtml(
                              charge.academicYear?.name ||
                              charge.academicYear?.year ||
                              "-"
                            )}
                          </td>

                          <td class="p-4">
                            ${escapeHtml(
                              charge.term?.name ||
                              "-"
                            )}
                          </td>

                          <td class="p-4 text-right font-medium">
                            ${formatStudentMoney(
                              charge.amount ||
                              charge.totalAmount ||
                              0
                            )}
                          </td>

                        </tr>

                      `)
                      .join("")
                  : `
                    <tr>
                      <td
                        colspan="4"
                        class="p-6 text-center text-gray-500"
                      >
                        No charges recorded.
                      </td>
                    </tr>
                  `
              }

            </tbody>

          </table>

        </div>

      </section>

    </div>

  `;
}


/*
|--------------------------------------------------------------------------
| PARENTS
|--------------------------------------------------------------------------
*/

function renderStudentParents() {

  const parentLinks =
    Array.isArray(
      selectedStudent.parentLinks
    )
      ? selectedStudent.parentLinks
      : [];


  if (!parentLinks.length) {

    return studentEmptyState(
      "No parents or guardians are linked to this learner."
    );

  }


  return `

    <section class="bg-white rounded-xl border">

      <div class="p-5 border-b">

        <h3 class="font-bold text-lg">
          Parents / Guardians
        </h3>

      </div>


      <div
        class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
      >

        ${parentLinks
          .map(link => {

            const parent =
              link?.parent || {};


            const user =
              parent?.user || {};


            const name =
              [
                user.firstName,
                user.middleName,
                user.lastName,
              ]
                .filter(Boolean)
                .join(" ") ||
              "Parent / Guardian";


            return `

              <div
                class="border rounded-xl p-5"
              >

                <div class="flex items-start justify-between gap-4">

                  <div>

                    <h4 class="font-bold text-gray-900">
                      ${escapeHtml(name)}
                    </h4>

                    <p class="text-sm text-gray-500 mt-1">
                      ${escapeHtml(
                        link.relationship ||
                        "Guardian"
                      )}
                    </p>

                  </div>


                  ${
                    link.isPrimary
                      ? `
                        <span
                          class="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold"
                        >
                          Primary
                        </span>
                      `
                      : ""
                  }

                </div>


                <div class="mt-4 space-y-2 text-sm">

                  <div>
                    <span class="text-gray-500">
                      Email:
                    </span>

                    <span class="font-medium">
                      ${escapeHtml(
                        user.email ||
                        "-"
                      )}
                    </span>
                  </div>


                  <div>
                    <span class="text-gray-500">
                      Phone:
                    </span>

                    <span class="font-medium">
                      ${escapeHtml(
                        user.phone ||
                        parent.phone ||
                        "-"
                      )}
                    </span>
                  </div>

                </div>

              </div>

            `;

          })
          .join("")}

      </div>

    </section>

  `;
}


/*
|--------------------------------------------------------------------------
| ENROLLMENT HISTORY
|--------------------------------------------------------------------------
*/

function renderStudentEnrollmentHistory() {

  const enrollments =
    Array.isArray(
      selectedStudent.enrollments
    )
      ? selectedStudent.enrollments
      : [];


  if (!enrollments.length) {

    return studentEmptyState(
      "No enrollment history is available."
    );

  }


  return `

    <section class="bg-white rounded-xl border">

      <div class="p-5 border-b">

        <h3 class="font-bold text-lg">
          Enrollment History
        </h3>

        <p class="text-sm text-gray-500 mt-1">
          Complete history of the learner's school placement.
        </p>

      </div>


      <div class="overflow-x-auto">

        <table class="w-full text-sm">

          <thead class="bg-gray-50">

            <tr>

              <th class="text-left p-4">
                Academic Year
              </th>

              <th class="text-left p-4">
                Term
              </th>

              <th class="text-left p-4">
                Grade
              </th>

              <th class="text-left p-4">
                Stream
              </th>

              <th class="text-left p-4">
                Admission Date
              </th>

              <th class="text-left p-4">
                Exit Date
              </th>

              <th class="text-left p-4">
                Status
              </th>

            </tr>

          </thead>


          <tbody>

            ${enrollments
              .map(enrollment => `

                <tr class="border-t">

                  <td class="p-4">
                    ${escapeHtml(
                      enrollment.academicYear?.name ||
                      enrollment.academicYear?.year ||
                      "-"
                    )}
                  </td>

                  <td class="p-4">
                    ${escapeHtml(
                      enrollment.term?.name ||
                      "-"
                    )}
                  </td>

                  <td class="p-4">
                    ${escapeHtml(
                      enrollment.grade?.name ||
                      enrollment.grade?.gradeName ||
                      "-"
                    )}
                  </td>

                  <td class="p-4">
                    ${escapeHtml(
                      enrollment.stream?.name ||
                      enrollment.stream?.streamName ||
                      "-"
                    )}
                  </td>

                  <td class="p-4">
                    ${formatStudentDate(
                      enrollment.admissionDate
                    )}
                  </td>

                  <td class="p-4">
                    ${formatStudentDate(
                      enrollment.exitDate
                    )}
                  </td>

                  <td class="p-4">

                    <span class="
                      inline-flex px-2.5 py-1 rounded-full
                      text-xs font-semibold
                      ${
                        enrollment.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }
                    ">
                      ${
                        enrollment.isActive
                          ? "Active"
                          : "Inactive"
                      }
                    </span>

                  </td>

                </tr>

              `)
              .join("")}

          </tbody>

        </table>

      </div>

    </section>

  `;
}


/*
|--------------------------------------------------------------------------
| PROFILE HELPERS
|--------------------------------------------------------------------------
*/

function getCurrentStudentEnrollment() {

  const enrollments =
    Array.isArray(
      selectedStudent?.enrollments
    )
      ? selectedStudent.enrollments
      : [];


  return (
    enrollments.find(
      enrollment =>
        enrollment.isActive === true
    ) ||
    enrollments[0] ||
    null
  );
}


function studentProfileCard(
  label,
  value
) {

  return `

    <div
      class="border rounded-xl p-4 bg-gray-50"
    >

      <p class="text-xs text-gray-500">
        ${escapeHtml(label)}
      </p>

      <p class="font-semibold text-gray-900 mt-1">
        ${escapeHtml(value || "-")}
      </p>

    </div>

  `;
}


function studentProfileDetail(
  label,
  value
) {

  return `

    <div>

      <p class="text-xs uppercase tracking-wide text-gray-400">
        ${escapeHtml(label)}
      </p>

      <p class="font-medium text-gray-800 mt-1">
        ${escapeHtml(value || "-")}
      </p>

    </div>

  `;

}


function studentProfileMoneyCard(
  label,
  amount
) {

  return `

    <div
      class="bg-white border rounded-xl p-5"
    >

      <p class="text-sm text-gray-500">
        ${escapeHtml(label)}
      </p>

      <p class="text-2xl font-bold text-gray-900 mt-2">
        ${formatStudentMoney(amount)}
      </p>

    </div>

  `;

}


function studentEmptyState(
  message
) {

  return `

    <div
      class="bg-white border rounded-xl p-10 text-center"
    >

      <div class="text-3xl mb-3">
        📋
      </div>

      <p class="text-gray-500">
        ${escapeHtml(message)}
      </p>

    </div>

  `;

}


function renderParentSummary() {

  const parentLinks =
    Array.isArray(
      selectedStudent?.parentLinks
    )
      ? selectedStudent.parentLinks
      : [];


  if (!parentLinks.length) {

    return `

      <p class="text-sm text-gray-500">
        No parents or guardians linked.
      </p>

    `;

  }


  return `

    <div class="space-y-3">

      ${parentLinks
        .slice(0, 3)
        .map(link => {

          const user =
            link?.parent?.user || {};


          const name =
            [
              user.firstName,
              user.middleName,
              user.lastName,
            ]
              .filter(Boolean)
              .join(" ") ||
            "Parent / Guardian";


          return `

            <div
              class="flex items-center justify-between border rounded-lg p-4"
            >

              <div>

                <p class="font-semibold text-gray-800">
                  ${escapeHtml(name)}
                </p>

                <p class="text-xs text-gray-500 mt-1">
                  ${escapeHtml(
                    link.relationship ||
                    "Guardian"
                  )}
                </p>

              </div>


              ${
                link.isPrimary
                  ? `
                    <span
                      class="text-xs font-semibold text-blue-600"
                    >
                      Primary
                    </span>
                  `
                  : ""
              }

            </div>

          `;

        })
        .join("")}

    </div>

  `;

}


/*
|--------------------------------------------------------------------------
| CLOSE STUDENT PROFILE
|--------------------------------------------------------------------------
*/

function closeStudentProfile() {

  const modal =
    document.getElementById(
      "studentProfileModal"
    );


  if (modal) {
    modal.remove();
  }

}


/*
|--------------------------------------------------------------------------
| FORMAT DATE
|--------------------------------------------------------------------------
*/

function formatStudentDate(
  value
) {

  if (!value) {
    return "-";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "-";

  }


  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

}


/*
|--------------------------------------------------------------------------
| FORMAT MONEY
|--------------------------------------------------------------------------
*/

function formatStudentMoney(
  value
) {

  const amount =
    Number(value || 0);


  return `KSh ${amount.toLocaleString(
    "en-KE",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;

}




/*
|--------------------------------------------------------------------------
| TEACHERS
|--------------------------------------------------------------------------
*/
async function loadTeachers(search = "") {

  const table =
    document.getElementById(
      "teachersTable"
    );


  table.innerHTML = `
    <tr>
      <td
        colspan="6"
        class="p-8 text-center text-gray-500"
      >
        Loading teachers...
      </td>
    </tr>
  `;


  try {

    let endpoint;


    if (search) {

      endpoint =
        `/teachers/search?search=${encodeURIComponent(search)}`;

    } else {

      endpoint =
        "/teachers";
    }


    const response =
      await apiRequest(endpoint);


    const data =
      extractData(response);


    teachers =
      Array.isArray(data)
        ? data
        : data?.teachers || [];


    renderTeachers();

  } catch (error) {

    console.error(error);


    table.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="p-8 text-center text-red-600"
        >
          ${escapeHtml(error.message)}
        </td>
      </tr>
    `;
  }
}


async function searchTeachers() {

  const search =
    document
      .getElementById(
        "teacherSearch"
      )
      .value
      .trim();


  await loadTeachers(search);
}


function handleTeacherSearchKey(event) {

  if (event.key === "Enter") {
    searchTeachers();
  }
}


function renderTeachers() {

  const table =
    document.getElementById(
      "teachersTable"
    );


  if (!teachers.length) {

    table.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="p-8 text-center text-gray-500"
        >
          No teachers found.
        </td>
      </tr>
    `;

    return;
  }


  table.innerHTML =
    teachers
      .map(teacher => {

        const user =
          teacher.user || {};


        const name =
          [
            user.firstName,
            user.middleName,
            user.lastName,
          ]
            .filter(Boolean)
            .join(" ") ||
          [
            teacher.firstName,
            teacher.middleName,
            teacher.lastName,
          ]
            .filter(Boolean)
            .join(" ") ||
          "-";


        return `
          <tr class="border-t hover:bg-gray-50">

            <td class="p-4">
              ${escapeHtml(
                teacher.employeeNumber || "-"
              )}
            </td>

            <td class="p-4 font-medium">
              ${escapeHtml(name)}
            </td>

            <td class="p-4">
              ${escapeHtml(
                user.email || "-"
              )}
            </td>

            <td class="p-4">
              ${escapeHtml(
                user.phone || "-"
              )}
            </td>

            <td class="p-4">
              ${escapeHtml(
                user.status || "-"
              )}
            </td>

            <td class="p-4 text-right">

              <button
                type="button"
                onclick="editTeacher('${teacher.id}')"
                class="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs"
              >
                Edit
              </button>

            </td>

          </tr>
        `;
      })
      .join("");
}

async function viewTeacher(
  teacherId
) {

  try {

    const response =
      await apiRequest(
        `/teachers/${teacherId}`
      );


    const teacher =
      extractData(response);


    renderTeacherDetails(
      teacher
    );

  } catch (error) {

    console.error(error);

    showError(
      "Unable to load teacher details."
    );
  }
}


function renderTeacherDetails(
  teacher
) {

  const container =
    document.getElementById(
      "teacherDetails"
    );


  if (!container) {
    return;
  }


  const user =
    teacher.user || {};


  const name =
    [
      user.firstName,
      user.middleName,
      user.lastName
    ]
      .filter(Boolean)
      .join(" ");


  container.innerHTML = `

    <h3>
      ${escapeHtml(name || "-")}
    </h3>

    <p>
      Email:
      ${escapeHtml(
        user.email || "-"
      )}
    </p>

    <p>
      Phone:
      ${escapeHtml(
        user.phone || "-"
      )}
    </p>

    <p>
      Employee Number:
      ${escapeHtml(
        teacher.employeeNumber || "-"
      )}
    </p>

  `;
}


/*
|--------------------------------------------------------------------------
| PARENTS
|--------------------------------------------------------------------------
*/

async function loadParents(search = "") {

  const table =
    document.getElementById(
      "parentsTable"
    );


  table.innerHTML = `
    <tr>
      <td
        colspan="6"
        class="p-8 text-center text-gray-500"
      >
        Loading parents...
      </td>
    </tr>
  `;


  try {

    let endpoint;


    if (search) {

      endpoint =
        `/parents/search?search=${encodeURIComponent(search)}`;

    } else {

      endpoint =
        "/parents";
    }


    const response =
      await apiRequest(endpoint);


    const data =
      extractData(response);


    parents =
      Array.isArray(data)
        ? data
        : data?.parents || [];


    renderParents();

  } catch (error) {

    console.error(error);


    table.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="p-8 text-center text-red-600"
        >
          ${escapeHtml(error.message)}
        </td>
      </tr>
    `;
  }
}


async function searchParents() {

  const search =
    document
      .getElementById(
        "parentSearch"
      )
      .value
      .trim();


  await loadParents(search);
}


function handleParentsSearchKey(event) {

  if (event.key === "Enter") {
    searchParents();
  }
}


function renderParents() {
  const table = document.getElementById("parentsTable");

  if (!table) {
    console.error("parentsTable element not found.");
    return;
  }

  if (!parents.length) {
    table.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="p-8 text-center text-gray-500"
        >
          No parents found.
        </td>
      </tr>
    `;

    return;
  }

  table.innerHTML = parents
    .map(parent => {
      const user = parent.user || {};

      /*
      |--------------------------------------------------------------------------
      | Parent name
      |--------------------------------------------------------------------------
      */

      const name =
        [
          user.firstName,
          user.middleName,
          user.lastName,
        ]
          .filter(Boolean)
          .join(" ") ||
        [
          parent.firstName,
          parent.middleName,
          parent.lastName,
        ]
          .filter(Boolean)
          .join(" ") ||
        "-";


      /*
      |--------------------------------------------------------------------------
      | Gender
      |--------------------------------------------------------------------------
      */

      const gender = user.gender || parent.gender || "-";


      /*
      |--------------------------------------------------------------------------
      | Email / Phone
      |--------------------------------------------------------------------------
      */

      const email = user.email || "-";
      const phone = user.phone || "-";


      /*
      |--------------------------------------------------------------------------
      | Linked students
      |--------------------------------------------------------------------------
      */

      const children =
        Array.isArray(parent.children)
          ? parent.children
          : [];

      const studentNames = children
        .map(link => {
          const student = link?.student || {};

          return [
            student.firstName,
            student.middleName,
            student.lastName,
          ]
            .filter(Boolean)
            .join(" ");
        })
        .filter(Boolean);

      const studentName =
        studentNames.length
          ? studentNames.join(", ")
          : "No student linked";


      /*
      |--------------------------------------------------------------------------
      | Status
      |--------------------------------------------------------------------------
      */

      const status =
        user.status ||
        parent.status ||
        "-";


      /*
      |--------------------------------------------------------------------------
      | Row
      |--------------------------------------------------------------------------
      */

      return `
        <tr class="border-t hover:bg-gray-50">

          <!-- Email / Phone -->
          <td class="p-4">
            <div class="font-medium">
              ${escapeHtml(email)}
            </div>

            <div class="text-xs text-gray-500 mt-1">
              ${escapeHtml(phone)}
            </div>
          </td>


          <!-- Parent -->
          <td class="p-4 font-medium">
            ${escapeHtml(name)}
          </td>


          <!-- Gender -->
          <td class="p-4">
            ${escapeHtml(gender)}
          </td>


          <!-- Student -->
          <td class="p-4">
            ${escapeHtml(studentName)}
          </td>


          <!-- Status -->
          <td class="p-4">
            ${escapeHtml(status)}
          </td>


          <!-- Action -->
          <td class="p-4 text-right">

            <button
              type="button"
              onclick="editParent('${parent.id}')"
              class="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs"
            >
              Edit
            </button>

          </td>

        </tr>
      `;
    })
    .join("");
}





function populateParentStudentSelect() {

 
 
  const select =
    document.getElementById(
      "parentStudentSelect"
    );
    
  if (!select) {
    return;
}

  
  const currentValue =
    select.value;


  select.innerHTML = `
    <option value="">
      Select a student
    </option>
  `;


  students.forEach(student => {

    const firstName =
      student.firstName ||
      student.user?.firstName ||
      "";


    const lastName =
      student.lastName ||
      student.user?.lastName ||
      "";


    const name =
      `${firstName} ${lastName}`.trim();


    const option =
      document.createElement(
        "option"
      );


    option.value =
      student.id;


    option.textContent =
      `${name || "Student"} — ${
        student.admissionNumber || "-"
      }`;


    select.appendChild(option);
  });


  if (currentValue) {
    select.value = currentValue;
  }
}


async function viewParent(
  parentId
) {

  try {

    const response =
      await apiRequest(
        `/parents/${parentId}`
      );


    const parent =
      extractData(response);


    renderParentDetails(
      parent
    );

  } catch (error) {

    console.error(error);

    showError(
      "Unable to load parent details."
    );
  }
}


function renderParentDetails(
  parent
) {

  const container =
    document.getElementById(
      "parentDetails"
    );


  if (!container) {
    return;
  }


  const user =
    parent.user || {};


  const name =
    [
      user.firstName,
      user.middleName,
      user.lastName
    ]
      .filter(Boolean)
      .join(" ");


  const children =
    parent.children ||
    parent.parentLinks ||
    [];


  container.innerHTML = `

    <h3>
      ${escapeHtml(name || "-")}
    </h3>

    <p>
      Email:
      ${escapeHtml(
        user.email || "-"
      )}
    </p>

    <p>
      Phone:
      ${escapeHtml(
        user.phone || "-"
      )}
    </p>

    <h4>
      Children
    </h4>

    ${
      children.length
        ? children
            .map(link => {

              const student =
                link.student || {};


              return `

                <div>

                  ${escapeHtml(
                    [
                      student.firstName,
                      student.middleName,
                      student.lastName
                    ]
                      .filter(Boolean)
                      .join(" ") ||
                    "-"
                  )}

                </div>

              `;
            })
            .join("")
        : "<p>No children linked.</p>"
    }

  `;
}


/* ============================================================
   TEACHING ASSIGNMENTS
============================================================ */

let editingTeachingAssignmentId = null;


/*
|--------------------------------------------------------------------------
| LOAD TEACHING ASSIGNMENTS
|--------------------------------------------------------------------------
*/

async function loadTeachingAssignments() {
  const tbody = document.getElementById("teachingAssignmentsTable");

  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td
        colspan="5"
        class="p-8 text-center text-gray-500"
      >
        Loading teaching assignments...
      </td>
    </tr>
  `;

  try {
    const response = await apiRequest("/teacher-teaching-assignments");

    const data = extractData(response);

    const assignments = Array.isArray(data)
      ? data
      : data?.assignments || data?.teacherAssignments || [];

    window.__teachingAssignments = assignments;

    renderTeachingAssignments(assignments);

  } catch (error) {
    console.error(
      "Unable to load teaching assignments:",
      error
    );

    tbody.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="p-8 text-center text-red-600"
        >
          ${escapeHtml(
            error.message ||
            "Unable to load teaching assignments."
          )}
        </td>
      </tr>
    `;
  }
}


/*
|--------------------------------------------------------------------------
| RENDER TEACHING ASSIGNMENTS
|--------------------------------------------------------------------------
*/

function renderTeachingAssignments(assignments = []) {

  const tbody =
    document.getElementById(
      "teachingAssignmentsTable"
    );

  if (!tbody) return;

  tbody.innerHTML = "";

  if (!assignments.length) {

    tbody.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="p-8 text-center text-gray-500"
        >
          No teaching assignments found.
        </td>
      </tr>
    `;

    return;
  }


  assignments.forEach((assignment) => {

    const user =
      assignment.teacher?.user || {};

    const teacherName =
      [
        user.firstName,
        user.middleName,
        user.lastName
      ]
        .filter(Boolean)
        .join(" ") ||
      assignment.teacher?.firstName ||
      "-";


    const learningAreaName =
      assignment.learningArea?.name ||
      "-";


    const gradeName =
      assignment.grade?.name ||
      "-";


    const streamName =
      assignment.stream?.name ||
      "All streams";


    const row =
      document.createElement("tr");

    row.className =
      "border-t hover:bg-gray-50";


    row.innerHTML = `

      <td class="p-4 font-medium">
        ${escapeHtml(teacherName)}
      </td>

      <td class="p-4">
        ${escapeHtml(learningAreaName)}
      </td>

      <td class="p-4">
        ${escapeHtml(gradeName)}
      </td>

      <td class="p-4">
        ${escapeHtml(streamName)}
      </td>

      <td class="p-4 text-right">

        <button
          type="button"
          onclick="editTeachingAssignment('${assignment.id}')"
          class="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs hover:bg-gray-800"
        >
          Edit
        </button>

      </td>

    `;

    tbody.appendChild(row);

  });

}


/*
|--------------------------------------------------------------------------
| OPEN TEACHING ASSIGNMENT FORM
|--------------------------------------------------------------------------
*/

async function openTeachingAssignment(
  assignment = null
) {

  editingTeachingAssignmentId =
    assignment?.id || null;


  const title =
    assignment
      ? "Edit Teaching Assignment"
      : "Assign Teacher";


  document.getElementById(
    "modalTitle"
  ).textContent = title;


  document.getElementById(
    "modalBody"
  ).innerHTML = `

    <form
      id="teachingAssignmentForm"
      class="space-y-1"
    >

      <!-- TEACHER -->

      <div>

        <label
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Teacher
        </label>

        <select
          id="teachingAssignmentTeacherId"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        >

          <option value="">
            Loading teachers...
          </option>

        </select>

      </div>


      <!-- LEARNING AREA -->

<div>

  <label 
    class="block text-sm font-medium text-gray-700 mb-1"
  >
    Learning Area
  </label>

  <input
    type="text"
    id="teachingAssignmentLearningArea"
    class="w-full border border-gray-300 rounded-lg px-3 py-2"
    placeholder="e.g. Mathematics"
    required
  >

  <p class="text-xs text-gray-500 mt-1">
    Type the learning area. If it does not already exist, it will be created automatically.
  </p>

</div>


      <!-- GRADE -->

      <div>

        <label
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Grade
        </label>

        <select
          id="teachingAssignmentGradeId"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        >

          <option value="">
            Loading grades...
          </option>

        </select>

      </div>


      <!-- STREAM -->

      <div>

        <label
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Stream
        </label>

        <select
          id="teachingAssignmentStreamId"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
        >

          <option value="">
            Select stream
          </option>

        </select>

        <p class="text-xs text-gray-500 mt-1">
          Leave blank if the teacher teaches the whole grade.
        </p>

      </div>


      <!-- ACADEMIC YEAR -->

      <div>

        <label
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Academic Year
        </label>

        <select
          id="teachingAssignmentAcademicYearId"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        >

          <option value="">
            Loading academic years...
          </option>

        </select>

      </div>


      <!-- TERM -->

      <div>

        <label
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Term
        </label>

        <select
          id="teachingAssignmentTermId"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
        >

          <option value="">
            Select term
          </option>

        </select>

        <p class="text-xs text-gray-500 mt-1">
          Leave blank if the assignment applies to the whole academic year.
        </p>

      </div>


      <!-- ACTIONS -->

      <div
        class="flex justify-end gap-3 pt-4 border-t"
      >

        <button
          type="button"
          onclick="closeModal()"
          class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="px-5 py-2 rounded-lg bg-school-800 text-white hover:bg-school-900"
        >
          ${
            assignment
              ? "Update Assignment"
              : "Save Assignment"
          }
        </button>

      </div>

    </form>

  `;


  const modal =
    document.getElementById("modal");

  if (modal) {

    modal.classList.remove("hidden");
    modal.classList.add("flex");

  }


  /*
  |--------------------------------------------------------------------------
  | LOAD TEACHERS
  |--------------------------------------------------------------------------
  */

  await loadTeachingAssignmentTeachers();


  


  /*
  |--------------------------------------------------------------------------
  | LOAD GRADES
  |--------------------------------------------------------------------------
  */

  await loadTeachingAssignmentGrades();


  /*
  |--------------------------------------------------------------------------
  | LOAD ACADEMIC YEARS
  |--------------------------------------------------------------------------
  */

  await loadTeachingAssignmentAcademicYears();


  /*
  |--------------------------------------------------------------------------
  | GRADE -> STREAM
  |--------------------------------------------------------------------------
  */

  const gradeSelect =
    document.getElementById(
      "teachingAssignmentGradeId"
    );


  if (gradeSelect) {

    gradeSelect.addEventListener(
      "change",
      async function () {

        await loadTeachingAssignmentStreams(
          this.value
        );

      }
    );

  }


  /*
  |--------------------------------------------------------------------------
  | ACADEMIC YEAR -> TERM
  |--------------------------------------------------------------------------
  */

  const yearSelect =
    document.getElementById(
      "teachingAssignmentAcademicYearId"
    );


  if (yearSelect) {

    yearSelect.addEventListener(
      "change",
      async function () {

        await loadTeachingAssignmentTerms(
          this.value
        );

      }
    );

  }


  /*
  |--------------------------------------------------------------------------
  | EDIT VALUES
  |--------------------------------------------------------------------------
  */

  if (assignment) {

    document.getElementById(
      "teachingAssignmentTeacherId"
    ).value =
      assignment.teacherId || "";


      document.getElementById(
      "teachingAssignmentLearningArea"
      ).value =
      assignment.learningArea?.name || "";

    document.getElementById(
      "teachingAssignmentGradeId"
    ).value =
      assignment.gradeId || "";


    document.getElementById(
      "teachingAssignmentAcademicYearId"
    ).value =
      assignment.academicYearId || "";


    await loadTeachingAssignmentStreams(
      assignment.gradeId || ""
    );


    document.getElementById(
      "teachingAssignmentStreamId"
    ).value =
      assignment.streamId || "";


    await loadTeachingAssignmentTerms(
      assignment.academicYearId || ""
    );


    document.getElementById(
      "teachingAssignmentTermId"
    ).value =
      assignment.termId || "";

  }

}


/*
|--------------------------------------------------------------------------
| LOAD TEACHERS FOR ASSIGNMENT
|--------------------------------------------------------------------------
*/

async function loadTeachingAssignmentTeachers() {

  const select =
    document.getElementById(
      "teachingAssignmentTeacherId"
    );

  if (!select) return;


  try {

    const response =
      await apiRequest("/teachers");

    const data =
      extractData(response);

    const teachers =
      Array.isArray(data)
        ? data
        : data?.teachers || [];


    select.innerHTML = `

      <option value="">
        Select teacher
      </option>

      ${
        teachers
          .map((teacher) => {

            const user =
              teacher.user || {};

            const name =
              [
                user.firstName,
                user.middleName,
                user.lastName
              ]
                .filter(Boolean)
                .join(" ") ||
              teacher.firstName ||
              "Teacher";


            return `

              <option value="${escapeHtml(
                teacher.id
              )}">
                ${escapeHtml(name)}
              </option>

            `;

          })
          .join("")
      }

    `;

  } catch (error) {

    console.error(error);

    select.innerHTML = `
      <option value="">
        Unable to load teachers
      </option>
    `;

    throw error;
  }

}





/*
|--------------------------------------------------------------------------
| LOAD GRADES
|--------------------------------------------------------------------------
*/

async function loadTeachingAssignmentGrades() {

  const select =
    document.getElementById(
      "teachingAssignmentGradeId"
    );

  if (!select) return;


  const response =
    await apiRequest(
      "/academic-admin/grades"
    );


  const data =
    extractData(response);


  const grades =
    Array.isArray(data)
      ? data
      : data?.grades || [];


  select.innerHTML = `

    <option value="">
      Select grade
    </option>

    ${
      grades
        .map((grade) => `

          <option value="${escapeHtml(
            grade.id
          )}">
            ${escapeHtml(
              grade.name
            )}
          </option>

        `)
        .join("")
    }

  `;

}


/*
|--------------------------------------------------------------------------
| LOAD STREAMS FOR SELECTED GRADE
|--------------------------------------------------------------------------
*/

async function loadTeachingAssignmentStreams(
  gradeId
) {

  const select =
    document.getElementById(
      "teachingAssignmentStreamId"
    );

  if (!select) return;


  select.innerHTML = `
    <option value="">
      Loading streams...
    </option>
  `;


  if (!gradeId) {

    select.innerHTML = `
      <option value="">
        Select stream
      </option>
    `;

    return;
  }


  try {

    const response =
      await apiRequest(
        `/academic-admin/streams?gradeId=${encodeURIComponent(
          gradeId
        )}`
      );


    const data =
      extractData(response);


    const streams =
      Array.isArray(data)
        ? data
        : data?.streams || [];


    select.innerHTML = `

      <option value="">
        All streams
      </option>

      ${
        streams
          .map((stream) => `

            <option value="${escapeHtml(
              stream.id
            )}">
              ${escapeHtml(
                stream.name
              )}
            </option>

          `)
          .join("")
      }

    `;

  } catch (error) {

    console.error(error);

    select.innerHTML = `
      <option value="">
        Unable to load streams
      </option>
    `;

    throw error;
  }

}


/*
|--------------------------------------------------------------------------
| LOAD ACADEMIC YEARS
|--------------------------------------------------------------------------
*/

async function loadTeachingAssignmentAcademicYears() {

  const select =
    document.getElementById(
      "teachingAssignmentAcademicYearId"
    );

  if (!select) return;


  const response =
    await apiRequest(
      "/academic-admin/academic-years"
    );


  const data =
    extractData(response);


  const years =
    Array.isArray(data)
      ? data
      : data?.academicYears || [];


  select.innerHTML = `

    <option value="">
      Select academic year
    </option>

    ${
      years
        .map((year) => `

          <option value="${escapeHtml(
            year.id
          )}">
            ${escapeHtml(
              year.name
            )}
          </option>

        `)
        .join("")
    }

  `;

}


/*
|--------------------------------------------------------------------------
| LOAD TERMS FOR SELECTED ACADEMIC YEAR
|--------------------------------------------------------------------------
*/

async function loadTeachingAssignmentTerms(
  academicYearId
) {

  const select =
    document.getElementById(
      "teachingAssignmentTermId"
    );

  if (!select) return;


  select.innerHTML = `
    <option value="">
      Loading terms...
    </option>
  `;


  if (!academicYearId) {

    select.innerHTML = `
      <option value="">
        Whole academic year
      </option>
    `;

    return;
  }


  try {

    const response =
      await apiRequest(
        `/academic-admin/terms?academicYearId=${encodeURIComponent(
          academicYearId
        )}`
      );


    const data =
      extractData(response);


    const terms =
      Array.isArray(data)
        ? data
        : data?.terms || [];


    select.innerHTML = `

      <option value="">
        Whole academic year
      </option>

      ${
        terms
          .map((term) => `

            <option value="${escapeHtml(
              term.id
            )}">
              ${escapeHtml(
                term.name
              )}
            </option>

          `)
          .join("")
      }

    `;

  } catch (error) {

    console.error(error);

    select.innerHTML = `
      <option value="">
        Unable to load terms
      </option>
    `;

    throw error;
  }

}


/*
|--------------------------------------------------------------------------
| SUBMIT TEACHING ASSIGNMENT
|--------------------------------------------------------------------------
*/

document.addEventListener(
  "submit",
  async function (event) {

    if (
      event.target.id !==
      "teachingAssignmentForm"
    ) {
      return;
    }


    event.preventDefault();


    const teacherId =
      document.getElementById(
        "teachingAssignmentTeacherId"
      ).value;

     const learningArea =
     document.getElementById(
    "teachingAssignmentLearningArea"
    ).value.trim();
    
    const gradeId =
      document.getElementById(
        "teachingAssignmentGradeId"
      ).value;


    const streamId =
      document.getElementById(
        "teachingAssignmentStreamId"
      ).value;


    const academicYearId =
      document.getElementById(
        "teachingAssignmentAcademicYearId"
      ).value;


    const termId =
      document.getElementById(
        "teachingAssignmentTermId"
      ).value;


    if (
      !teacherId ||
      !learningArea ||
      !gradeId ||
      !academicYearId
    ) {

      showError(
        "Teacher, learning area, grade and academic year are required."
      );

      return;
    }


    const payload = {

      teacherId,

      learningArea,

      gradeId,

      streamId:
        streamId || null,

      academicYearId,

      termId:
        termId || null

    };


    try {

      if (
        editingTeachingAssignmentId
      ) {

        await updateTeachingAssignment(
          editingTeachingAssignmentId,
          payload
        );

      } else {

        await createTeachingAssignment(
          payload
        );

      }


      editingTeachingAssignmentId =
        null;


      closeModal();


      await loadTeachingAssignments();

    } catch (error) {

      console.error(
        "Teaching assignment save failed:",
        error
      );

    }

  }
);


/*
|--------------------------------------------------------------------------
| CREATE TEACHING ASSIGNMENT
|--------------------------------------------------------------------------
*/

async function createTeachingAssignment(
  data
) {

  try {

    const response =
      await apiRequest(
        "/teacher-teaching-assignments",
        {
          method: "POST",

          body:
            JSON.stringify(data)
        }
      );


    showSuccess(
      response.message ||
      "Teaching assignment created successfully."
    );


    return extractData(response);

  } catch (error) {

    showError(
      error.message ||
      "Unable to create teaching assignment."
    );

    throw error;
  }

}


/*
|--------------------------------------------------------------------------
| UPDATE TEACHING ASSIGNMENT
|--------------------------------------------------------------------------
*/

async function updateTeachingAssignment(
  assignmentId,
  data
) {

  try {

    const response =
      await apiRequest(
        `/teacher-teaching-assignments/${assignmentId}`,
        {
          method: "PUT",

          body:
            JSON.stringify(data)
        }
      );


    showSuccess(
      response.message ||
      "Teaching assignment updated successfully."
    );


    return extractData(response);

  } catch (error) {

    showError(
      error.message ||
      "Unable to update teaching assignment."
    );

    throw error;
  }

}


/*
|--------------------------------------------------------------------------
| EDIT TEACHING ASSIGNMENT
|--------------------------------------------------------------------------
*/

async function editTeachingAssignment(
  assignmentId
) {

  const assignments =
    window.__teachingAssignments ||
    [];


  const assignment =
    assignments.find(
      item =>
        item.id === assignmentId
    );


  if (!assignment) {

    showError(
      "Teaching assignment not found."
    );

    return;
  }


  await openTeachingAssignment(
    assignment
  );

}

/*
|--------------------------------------------------------------------------
| CLASS TEACHERS
|--------------------------------------------------------------------------
*/

async function loadClassTeachers() {

  try {

    const response =
      await apiRequest(
        "/class-teacher"
      );


    const assignments =
      extractData(response);


    renderClassTeachers(
      assignments
    );

  } catch (error) {

    console.error(error);

    showError(
      "Unable to load class-teacher assignments."
    );
  }
}


function renderClassTeachers(
  assignments = []
) {

  const tbody =
    document.getElementById(
      "classTeachersTableBody"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = "";


  if (!assignments.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          No class-teacher assignments found.
        </td>
      </tr>
    `;

    return;
  }


  assignments.forEach(assignment => {

    const user =
      assignment.teacher?.user || {};


    const teacherName =
      [
        user.firstName,
        user.middleName,
        user.lastName
      ]
        .filter(Boolean)
        .join(" ");


    const row =
      document.createElement("tr");


    row.innerHTML = `

      <td>
        ${escapeHtml(
          teacherName || "-"
        )}
      </td>

      <td>
        ${escapeHtml(
          assignment.grade?.name || "-"
        )}
      </td>

      <td>
        ${escapeHtml(
          assignment.stream?.name || "-"
        )}
      </td>

      <td>
        ${escapeHtml(
          assignment.academicYear?.name || "-"
        )}
      </td>

      <td>
        ${escapeHtml(
          assignment.term?.name || "-"
        )}
      </td>

      <td>

        <button
          type="button"
          onclick="editClassTeacher('${assignment.id}')"
        >
          Edit
        </button>

      </td>

      <td>

        <button
          type="button"
          onclick="removeClassTeacher('${assignment.id}')"
        >
          Remove
        </button>

      </td>

    `;


    tbody.appendChild(row);
  });
}


async function createClassTeacher(
  data
) {

  try {

    const response =
      await apiRequest(
        "/class-teacher",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );


    await loadClassTeachers();

    await loadAcademicDashboard();

    await loadAcademicOverview();


    showSuccess(
      "Class teacher assigned successfully."
    );


    return extractData(response);

  } catch (error) {

    showError(
      error.message
    );

    throw error;
  }
}


async function updateClassTeacher(
  assignmentId,
  data
) {

  try {

    const response =
      await apiRequest(
        `/class-teacher/${assignmentId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );


    await loadClassTeachers();

    await loadAcademicDashboard();

    await loadAcademicOverview();


    showSuccess(
      "Class teacher assignment updated successfully."
    );


    return extractData(response);

  } catch (error) {

    showError(
      error.message
    );

    throw error;
  }
}


async function removeClassTeacher(
  assignmentId
) {

  if (
    !confirm(
      "Remove this class-teacher assignment?"
    )
  ) {
    return;
  }


  try {

    await apiRequest(
      `/class-teacher/${assignmentId}`,
      {
        method: "DELETE",
      }
    );


    await loadClassTeachers();

    await loadAcademicDashboard();

    await loadAcademicOverview();


    showSuccess(
      "Class teacher assignment removed successfully."
    );

  } catch (error) {

    console.error(error);

    showError(
      error.message
    );
  }
}


async function editClassTeacher(
  assignmentId
) {

  const teacherId =
    prompt(
      "Teacher ID:"
    );


  if (teacherId === null) {
    return;
  }


  const gradeId =
    prompt(
      "Grade ID:"
    );


  if (gradeId === null) {
    return;
  }


  const streamId =
    prompt(
      "Stream ID (leave blank if none):"
    );


  if (streamId === null) {
    return;
  }


  const academicYearId =
    prompt(
      "Academic year ID:"
    );


  if (academicYearId === null) {
    return;
  }


  const termId =
    prompt(
      "Term ID (leave blank if none):"
    );


  if (termId === null) {
    return;
  }


  await updateClassTeacher(
    assignmentId,
    {
      teacherId,
      gradeId,
      streamId:
        streamId || null,
      academicYearId,
      termId:
        termId || null,
    }
  );
}

/* ============================================================
   TIMETABLE MANAGEMENT
   ============================================================ */

/*
|--------------------------------------------------------------------------
| GLOBAL TIMETABLE STATE
|--------------------------------------------------------------------------
*/

let currentTimetableType = null;
let currentTimetableId = null;
let currentTimetableEntries = [];


/*
|--------------------------------------------------------------------------
| OPEN TIMETABLE
|--------------------------------------------------------------------------
|
| Called from academic.html:
|
| openTimetable('teacher')
| openTimetable('stream')
| openTimetable('examination')
|
|--------------------------------------------------------------------------
*/

async function openTimetable(type) {

  if (type === "examination") {

  const examinationSection = document.getElementById(
    "examination-timetable-section"
  );

  if (!examinationSection) {
    console.error(
      "Examination timetable section was not found in the HTML."
    );
    return;
  }

  // Hide other sections
  document.querySelectorAll(".section").forEach(section => {
    section.classList.add("hidden");
  });

  // Show examination timetable section
  examinationSection.classList.remove("hidden");

  selectedExaminationTimetableId = null;
  examinationTimetables = [];

  await loadExaminationTimetables();
  await loadExaminationFormData();

  return;
}


  // --------------------------------------------------
  // EXISTING TEACHER / STREAM TIMETABLE LOGIC
  // --------------------------------------------------

  currentTimetableType = type;
  currentTimetableId = null;
  currentTimetableEntries = [];

  let title = "Timetable Management";

  if (type === "teacher") {
    title = "Teacher Timetable";
  }

  if (type === "stream") {
    title = "Stream Timetable";
  }


  modalTitle.textContent = title;

  modalBody.innerHTML = `
    <div class="space-y-5">

      <div class="flex items-center justify-between">

        <div>

          <h4 class="font-semibold text-gray-800">
            ${title}
          </h4>

          <p class="text-sm text-gray-500">
            Create and manage timetable schedules.
          </p>

        </div>

        <button
          type="button"
          onclick="showCreateTimetableForm()"
          class="px-4 py-2 rounded-lg bg-school-800 text-white text-sm"
        >
          + Create Timetable
        </button>

      </div>


      <div id="timetableListContainer">

        <div class="text-center py-8 text-gray-500">
          Loading timetables...
        </div>

      </div>

    </div>
  `;

  modal.classList.remove("hidden");

  await loadTimetables();
}
/*
|--------------------------------------------------------------------------
| LOAD TIMETABLES
|--------------------------------------------------------------------------
|
| The backend currently exposes POST /timetables but does NOT expose
| GET /timetables.
|
| Therefore this function first tries the endpoint. If your backend
| does not yet have GET /timetables, we will add it below.
|--------------------------------------------------------------------------
*/

async function loadTimetables() {
  const container =
    document.getElementById("timetableListContainer");

  if (!container) {
    return;
  }

  try {
    const response =
      await apiRequest("/timetables");

    const timetables =
      response.timetables ||
      response.data ||
      [];

    renderTimetables(timetables);

  } catch (error) {
    console.error(
      "Unable to load timetables:",
      error
    );

    container.innerHTML = `
      <div class="border border-red-200 bg-red-50 rounded-lg p-4">
        <p class="text-sm text-red-600">
          Unable to load timetables.
        </p>

        <p class="text-xs text-red-500 mt-1">
          ${error.message || "Request failed"}
        </p>
      </div>
    `;
  }
}


/*
|--------------------------------------------------------------------------
| RENDER TIMETABLES
|--------------------------------------------------------------------------
*/

function renderTimetables(timetables) {
  const container =
    document.getElementById("timetableListContainer");

  if (!container) {
    return;
  }

  if (!Array.isArray(timetables) || timetables.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 border rounded-xl bg-gray-50">
        <div class="text-4xl mb-3">
          📅
        </div>

        <p class="font-medium text-gray-700">
          No timetables found
        </p>

        <p class="text-sm text-gray-500 mt-1">
          Create a timetable to get started.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      ${timetables.map(timetable => `
        <div class="border rounded-xl p-5 bg-white">

          <div class="flex items-start justify-between">

            <div>
              <h5 class="font-semibold text-gray-800">
                ${escapeHtml(timetable.name || "Untitled Timetable")}
              </h5>

              <p class="text-sm text-gray-500 mt-1">
                ${
                  escapeHtml(
                    timetable.academicYear?.name ||
                    "Academic year not specified"
                  )
                }
              </p>

              <p class="text-sm text-gray-500">
                ${
                  escapeHtml(
                    timetable.term?.name ||
                    "All terms"
                  )
                }
              </p>
            </div>

            <span
              class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
            >
              ${currentTimetableType}
            </span>

          </div>

          <div class="mt-4 flex gap-2">

            <button
              type="button"
              onclick="viewTimetableEntries('${timetable.id}')"
              class="flex-1 px-3 py-2 rounded-lg bg-school-800 text-white text-sm"
            >
              View
            </button>

            <button
              type="button"
              onclick="createTimetableEntryForm('${timetable.id}')"
              class="flex-1 px-3 py-2 rounded-lg border border-school-800 text-school-800 text-sm"
            >
              Add Lesson
            </button>

          </div>

        </div>
      `).join("")}

    </div>
  `;
}


/*
|--------------------------------------------------------------------------
| CREATE TIMETABLE FORM
|--------------------------------------------------------------------------
*/

async function showCreateTimetableForm() {
  const yearsResponse =
    await apiRequest("/academic-admin/academic-years");

  const academicYears =
    yearsResponse.data ||
    yearsResponse.academicYears ||
    [];

  const termsResponse =
    await apiRequest("/academic-admin/terms");

  const terms =
    termsResponse.data ||
    termsResponse.terms ||
    [];

  const typeLabel =
    currentTimetableType === "teacher"
      ? "Teacher"
      : currentTimetableType === "stream"
      ? "Stream"
      : "Examination";

  modalTitle.textContent =
    `Create ${typeLabel} Timetable`;

  modalBody.innerHTML = `
    <form
      id="createTimetableForm"
      class="space-y-5"
    >

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Timetable Name
        </label>

        <input
          type="text"
          id="timetableName"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="e.g. Term 1 Teacher Timetable"
          required
        >
      </div>


      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Academic Year
        </label>

        <select
          id="timetableAcademicYearId"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        >

          <option value="">
            Select academic year
          </option>

          ${academicYears.map(year => `
            <option value="${year.id}">
              ${escapeHtml(year.name)}
            </option>
          `).join("")}

        </select>
      </div>


      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Term
        </label>

        <select
          id="timetableTermId"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
        >

          <option value="">
            All terms
          </option>

          ${terms.map(term => `
            <option value="${term.id}">
              ${escapeHtml(term.name)}
            </option>
          `).join("")}

        </select>
      </div>


      <div class="flex justify-end gap-3 pt-3">

        <button
          type="button"
          onclick="openTimetable(currentTimetableType)"
          class="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="px-5 py-2 rounded-lg bg-school-800 text-white"
        >
          Create Timetable
        </button>

      </div>

    </form>
  `;

  document
    .getElementById("createTimetableForm")
    .addEventListener(
      "submit",
      handleCreateTimetable
    );
}


/*
|--------------------------------------------------------------------------
| CREATE TIMETABLE
|--------------------------------------------------------------------------
|
| POST /api/timetables
|--------------------------------------------------------------------------
*/

async function handleCreateTimetable(event) {
  event.preventDefault();

  const name =
    document
      .getElementById("timetableName")
      .value
      .trim();

  const academicYearId =
    document
      .getElementById("timetableAcademicYearId")
      .value;

  const termId =
    document
      .getElementById("timetableTermId")
      .value;

  if (!name || !academicYearId) {
    showError(
      "Timetable name and academic year are required."
    );

    return;
  }

  try {
    const response =
      await apiRequest(
        "/timetables",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name,
            academicYearId,
            termId: termId || null
          })
        }
      );

    showSuccess(
      response.message ||
      "Timetable created successfully."
    );

    await openTimetable(currentTimetableType);

  } catch (error) {
    console.error(
      "Unable to create timetable:",
      error
    );

    showError(
      error.message ||
      "Unable to create timetable."
    );
  }
}


/*
|--------------------------------------------------------------------------
| CREATE TIMETABLE ENTRY FORM
|--------------------------------------------------------------------------
*/

async function createTimetableEntryForm(timetableId) {
  currentTimetableId = timetableId;

  modalTitle.textContent =
    "Add Timetable Lesson";

  modalBody.innerHTML = `
    <form
      id="createTimetableEntryForm"
      class="space-y-0"
    >

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Teacher
        </label>

        <select
          id="timetableTeacherId"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        >
          <option value="">
            Loading teachers...
          </option>
        </select>
      </div>


      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Grade
        </label>

        <select
          id="timetableGradeId"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        >
          <option value="">
            Loading grades...
          </option>
        </select>
      </div>


      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Stream
        </label>

        <select
          id="timetableStreamId"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">
            Select stream
          </option>
        </select>
      </div>


      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Learning Area
        </label>

        <select
          id="timetableLearningAreaId"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        >
          <option value="">
            Loading learning areas...
          </option>
        </select>
      </div>


      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Day
        </label>

        <select
          id="timetableDayOfWeek"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        >

          <option value="">
            Select day
          </option>

          <option value="MONDAY">Monday</option>
          <option value="TUESDAY">Tuesday</option>
          <option value="WEDNESDAY">Wednesday</option>
          <option value="THURSDAY">Thursday</option>
          <option value="FRIDAY">Friday</option>
          <option value="SATURDAY">Saturday</option>

        </select>
      </div>


      <div class="grid grid-cols-2 gap-4">

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>

          <input
            type="time"
            id="timetableStartTime"
            class="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
        </div>


        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>

          <input
            type="time"
            id="timetableEndTime"
            class="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
        </div>

      </div>


      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Room
        </label>

        <input
          type="text"
          id="timetableRoom"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="e.g. Room 12"
        >
      </div>


      <div class="flex justify-end gap-3 pt-1">

        <button
          type="button"
          onclick="openTimetable(currentTimetableType)"
          class="px-4 py-1 border rounded-lg"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="px-4 py-1 rounded-lg bg-school-800 text-white"
        >
          Add Lesson
        </button>

      </div>

    </form>
  `;

  document
    .getElementById("createTimetableEntryForm")
    .addEventListener(
      "submit",
      handleCreateTimetableEntry
    );

  await loadTimetableTeachers();
  await loadTimetableGrades();
  await loadTimetableLearningAreas();
}


/*
|--------------------------------------------------------------------------
| LOAD TEACHERS
|--------------------------------------------------------------------------
*/

async function loadTimetableTeachers() {
  const select =
    document.getElementById(
      "timetableTeacherId"
    );

  if (!select) return;

  try {
    const response =
      await apiRequest("/teachers");

    const teachers =
      response.data ||
      response.teachers ||
      [];

    select.innerHTML = `
      <option value="">
        Select teacher
      </option>

      ${teachers.map(teacher => {

        const name =
          teacher.user?.firstName ||
          teacher.firstName ||
          "";

        const lastName =
          teacher.user?.lastName ||
          teacher.lastName ||
          "";

        return `
          <option value="${teacher.id}">
            ${escapeHtml(`${name} ${lastName}`.trim())}
          </option>
        `;

      }).join("")}
    `;

  } catch (error) {
    console.error(
      "Unable to load teachers:",
      error
    );

    select.innerHTML = `
      <option value="">
        Unable to load teachers
      </option>
    `;
  }
}


/*
|--------------------------------------------------------------------------
| LOAD GRADES
|--------------------------------------------------------------------------
*/

async function loadTimetableGrades() {
  const select =
    document.getElementById(
      "timetableGradeId"
    );

  if (!select) return;

  try {
    const response =
      await apiRequest(
        "/academic-admin/grades"
      );

    const grades =
      response.data ||
      response.grades ||
      [];

    select.innerHTML = `
      <option value="">
        Select grade
      </option>

      ${grades.map(grade => `
        <option value="${grade.id}">
          ${escapeHtml(grade.name)}
        </option>
      `).join("")}
    `;

    select.addEventListener(
      "change",
      async function () {
        await loadTimetableStreams(
          this.value
        );
      }
    );

  } catch (error) {
    console.error(
      "Unable to load grades:",
      error
    );

    select.innerHTML = `
      <option value="">
        Unable to load grades
      </option>
    `;
  }
}


/*
|--------------------------------------------------------------------------
| LOAD STREAMS
|--------------------------------------------------------------------------
*/

async function loadTimetableStreams(gradeId) {
  const select =
    document.getElementById(
      "timetableStreamId"
    );

  if (!select) return;

  if (!gradeId) {
    select.innerHTML = `
      <option value="">
        Select stream
      </option>
    `;

    return;
  }

  try {
    const response =
      await apiRequest(
        `/academic-admin/streams?gradeId=${encodeURIComponent(
          gradeId
        )}`
      );

    const streams =
      response.data ||
      response.streams ||
      [];

    select.innerHTML = `
      <option value="">
        Select stream
      </option>

      ${streams.map(stream => `
        <option value="${stream.id}">
          ${escapeHtml(stream.name)}
        </option>
      `).join("")}
    `;

  } catch (error) {
    console.error(
      "Unable to load streams:",
      error
    );

    select.innerHTML = `
      <option value="">
        Unable to load streams
      </option>
    `;
  }
}


/*
|--------------------------------------------------------------------------
| LOAD LEARNING AREAS
|--------------------------------------------------------------------------
*/

async function loadTimetableLearningAreas() {
  const select =
    document.getElementById(
      "timetableLearningAreaId"
    );

  if (!select) return;

  try {
    const response =
      await apiRequest(
        "/academic-admin/learning-areas"
      );

    const learningAreas =
      response.data ||
      response.learningAreas ||
      [];

    select.innerHTML = `
      <option value="">
        Select learning area
      </option>

      ${learningAreas.map(area => `
        <option value="${area.id}">
          ${escapeHtml(area.name)}
        </option>
      `).join("")}
    `;

  } catch (error) {
    console.error(
      "Unable to load learning areas:",
      error
    );

    select.innerHTML = `
      <option value="">
        Unable to load learning areas
      </option>
    `;
  }
}


/*
|--------------------------------------------------------------------------
| CREATE TIMETABLE ENTRY
|--------------------------------------------------------------------------
|
| POST /api/timetables/:timetableId/entries
|--------------------------------------------------------------------------
*/

async function handleCreateTimetableEntry(event) {
  event.preventDefault();

  const teacherId =
    document.getElementById(
      "timetableTeacherId"
    ).value;

  const gradeId =
    document.getElementById(
      "timetableGradeId"
    ).value;

  const streamId =
    document.getElementById(
      "timetableStreamId"
    ).value;

  const learningAreaId =
    document.getElementById(
      "timetableLearningAreaId"
    ).value;

  const dayOfWeek =
    document.getElementById(
      "timetableDayOfWeek"
    ).value;

  const startTime =
    document.getElementById(
      "timetableStartTime"
    ).value;

  const endTime =
    document.getElementById(
      "timetableEndTime"
    ).value;

  const room =
    document.getElementById(
      "timetableRoom"
    ).value.trim();

  if (
    !teacherId ||
    !gradeId ||
    !learningAreaId ||
    !dayOfWeek ||
    !startTime ||
    !endTime
  ) {
    showError(
      "Please fill in all required timetable fields."
    );

    return;
  }

  if (startTime >= endTime) {
    showError(
      "Start time must be before end time."
    );

    return;
  }

  try {
    const response =
      await apiRequest(
        `/timetables/${currentTimetableId}/entries`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            teacherId,
            gradeId,
            streamId: streamId || null,
            learningAreaId,
            dayOfWeek,
            startTime,
            endTime,
            room: room || null
          })
        }
      );

    showSuccess(
      response.message ||
      "Timetable lesson created successfully."
    );

    await viewTimetableEntries(
      currentTimetableId
    );

  } catch (error) {
    console.error(
      "Unable to create timetable entry:",
      error
    );

    showError(
      error.message ||
      "Unable to create timetable lesson."
    );
  }
}


/*
|--------------------------------------------------------------------------
| VIEW TIMETABLE ENTRIES
|--------------------------------------------------------------------------
|
| GET /api/timetables/:timetableId/entries
|--------------------------------------------------------------------------
*/

async function viewTimetableEntries(timetableId) {
  currentTimetableId = timetableId;

  try {
    const response =
      await apiRequest(
        `/timetables/${timetableId}/entries`
      );

    const entries =
      response.entries ||
      response.data ||
      [];

    currentTimetableEntries = entries;

    renderTimetableEntries(entries);

  } catch (error) {
    console.error(
      "Unable to load timetable entries:",
      error
    );

    showError(
      error.message ||
      "Unable to load timetable entries."
    );
  }
}


/*
|--------------------------------------------------------------------------
| RENDER TIMETABLE ENTRIES
|--------------------------------------------------------------------------
*/

function renderTimetableEntries(entries) {
  modalTitle.textContent =
    `${
      currentTimetableType === "teacher"
        ? "Teacher"
        : currentTimetableType === "stream"
        ? "Stream"
        : "Examination"
    } Timetable`;

  if (!entries.length) {
    modalBody.innerHTML = `
      <div class="text-center py-10">

        <div class="text-4xl mb-3">
          📅
        </div>

        <p class="font-medium text-gray-700">
          No timetable entries
        </p>

        <button
          type="button"
          onclick="createTimetableEntryForm('${currentTimetableId}')"
          class="mt-4 px-4 py-2 rounded-lg bg-school-800 text-white"
        >
          + Add Lesson
        </button>

      </div>
    `;

    return;
  }

  const dayOrder = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6
  };

  const sortedEntries =
    [...entries].sort((a, b) => {

      const dayDifference =
        (dayOrder[a.dayOfWeek] || 99) -
        (dayOrder[b.dayOfWeek] || 99);

      if (dayDifference !== 0) {
        return dayDifference;
      }

      return String(a.startTime || "")
        .localeCompare(
          String(b.startTime || "")
        );
    });

  modalBody.innerHTML = `
    <div class="space-y-5">

      <div class="flex justify-between items-center">

        <div>
          <p class="text-sm text-gray-500">
            ${sortedEntries.length} timetable lesson(s)
          </p>
        </div>

        <button
          type="button"
          onclick="createTimetableEntryForm('${currentTimetableId}')"
          class="px-4 py-2 rounded-lg bg-school-800 text-white text-sm"
        >
          + Add Lesson
        </button>

      </div>


      <div class="overflow-x-auto">

        <table class="w-full text-sm">

          <thead>
            <tr class="border-b text-left">

              <th class="px-3 py-3">
                Day
              </th>

              <th class="px-3 py-3">
                Time
              </th>

              <th class="px-3 py-3">
                Learning Area
              </th>

              <th class="px-3 py-3">
                Teacher
              </th>

              <th class="px-3 py-3">
                Grade
              </th>

              <th class="px-3 py-3">
                Stream
              </th>

              <th class="px-3 py-3">
                Room
              </th>

              <th class="px-3 py-3">
                Action
              </th>

            </tr>
          </thead>

          <tbody>

            ${sortedEntries.map(entry => {

              const firstName =
                entry.teacher?.user?.firstName ||
                entry.teacher?.firstName ||
                "";

              const lastName =
                entry.teacher?.user?.lastName ||
                entry.teacher?.lastName ||
                "";

              return `
                <tr class="border-b">

                  <td class="px-3 py-3">
                    ${escapeHtml(
                      formatTimetableDay(
                        entry.dayOfWeek
                      )
                    )}
                  </td>

                  <td class="px-3 py-3 whitespace-nowrap">
                    ${escapeHtml(
                      entry.startTime || ""
                    )}
                    -
                    ${escapeHtml(
                      entry.endTime || ""
                    )}
                  </td>

                  <td class="px-3 py-3 font-medium">
                    ${escapeHtml(
                      entry.learningArea?.name ||
                      "—"
                    )}
                  </td>

                  <td class="px-3 py-3">
                    ${escapeHtml(
                      `${firstName} ${lastName}`.trim() ||
                      "—"
                    )}
                  </td>

                  <td class="px-3 py-3">
                    ${escapeHtml(
                      entry.grade?.name ||
                      "—"
                    )}
                  </td>

                  <td class="px-3 py-3">
                    ${escapeHtml(
                      entry.stream?.name ||
                      "All streams"
                    )}
                  </td>

                  <td class="px-3 py-3">
                    ${escapeHtml(
                      entry.room ||
                      "—"
                    )}
                  </td>

                  <td class="px-3 py-3">

                    <button
                      type="button"
                      onclick="editTimetableEntry('${entry.id}')"
                      class="text-school-800 hover:underline mr-2"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onclick="deleteTimetableEntry('${entry.id}')"
                      class="text-red-600 hover:underline"
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              `;

            }).join("")}

          </tbody>

        </table>

      </div>

    </div>
  `;
}


/*
|--------------------------------------------------------------------------
| EDIT TIMETABLE ENTRY
|--------------------------------------------------------------------------
*/

async function editTimetableEntry(entryId) {
  const entry =
    currentTimetableEntries.find(
      item => item.id === entryId
    );

  if (!entry) {
    showError(
      "Timetable entry could not be found."
    );

    return;
  }

  modalTitle.textContent =
    "Edit Timetable Lesson";

  modalBody.innerHTML = `
    <form
      id="editTimetableEntryForm"
      class="space-y-5"
    >

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Day
        </label>

        <select
          id="editTimetableDay"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
          required
        >

          ${[
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY"
          ].map(day => `
            <option
              value="${day}"
              ${entry.dayOfWeek === day ? "selected" : ""}
            >
              ${formatTimetableDay(day)}
            </option>
          `).join("")}

        </select>
      </div>


      <div class="grid grid-cols-2 gap-4">

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>

          <input
            type="time"
            id="editTimetableStart"
            value="${escapeHtml(entry.startTime || "")}"
            class="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>

          <input
            type="time"
            id="editTimetableEnd"
            value="${escapeHtml(entry.endTime || "")}"
            class="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
        </div>

      </div>


      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Room
        </label>

        <input
          type="text"
          id="editTimetableRoom"
          value="${escapeHtml(entry.room || "")}"
          class="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
      </div>


      <div class="flex justify-end gap-3">

        <button
          type="button"
          onclick="viewTimetableEntries('${currentTimetableId}')"
          class="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="px-5 py-2 rounded-lg bg-school-800 text-white"
        >
          Save Changes
        </button>

      </div>

    </form>
  `;

  document
    .getElementById("editTimetableEntryForm")
    .addEventListener(
      "submit",
      async function(event) {

        event.preventDefault();

        const dayOfWeek =
          document.getElementById(
            "editTimetableDay"
          ).value;

        const startTime =
          document.getElementById(
            "editTimetableStart"
          ).value;

        const endTime =
          document.getElementById(
            "editTimetableEnd"
          ).value;

        const room =
          document.getElementById(
            "editTimetableRoom"
          ).value.trim();

        if (startTime >= endTime) {
          showError(
            "Start time must be before end time."
          );

          return;
        }

        try {
          const response =
            await apiRequest(
              `/timetables/entries/${entryId}`,
              {
                method: "PUT",

                headers: {
                  "Content-Type": "application/json"
                },

                body: JSON.stringify({
                  dayOfWeek,
                  startTime,
                  endTime,
                  room: room || null
                })
              }
            );

          showSuccess(
            response.message ||
            "Timetable entry updated successfully."
          );

          await viewTimetableEntries(
            currentTimetableId
          );

        } catch (error) {
          console.error(
            "Unable to update timetable entry:",
            error
          );

          showError(
            error.message ||
            "Unable to update timetable entry."
          );
        }
      }
    );
}


/*
|--------------------------------------------------------------------------
| DELETE TIMETABLE ENTRY
|--------------------------------------------------------------------------
|
| DELETE /api/timetables/entries/:entryId
|--------------------------------------------------------------------------
*/

async function deleteTimetableEntry(entryId) {
  const confirmed =
    window.confirm(
      "Are you sure you want to delete this timetable lesson?"
    );

  if (!confirmed) {
    return;
  }

  try {
    const response =
      await apiRequest(
        `/timetables/entries/${entryId}`,
        {
          method: "DELETE"
        }
      );

    showSuccess(
      response.message ||
      "Timetable entry deleted successfully."
    );

    await viewTimetableEntries(
      currentTimetableId
    );

  } catch (error) {
    console.error(
      "Unable to delete timetable entry:",
      error
    );

    showError(
      error.message ||
      "Unable to delete timetable entry."
    );
  }
}


/*
|--------------------------------------------------------------------------
| FORMAT DAY
|--------------------------------------------------------------------------
*/

function formatTimetableDay(day) {
  if (!day) {
    return "";
  }

  return day
    .toLowerCase()
    .replace(
      /^./,
      letter => letter.toUpperCase()
    );
}


/*
|--------------------------------------------------------------------------
| HTML ESCAPE
|--------------------------------------------------------------------------
|
| Uses the existing function if your academic.js already has one.
| Only define it if it does not already exist.
|--------------------------------------------------------------------------
*/

if (typeof escapeHtml !== "function") {
  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

/*
|--------------------------------------------------------------------------
| ASSESSMENTS
|--------------------------------------------------------------------------
*/

async function loadAssessmentReviews(
  filters = {}
) {

  try {

    const params =
      new URLSearchParams();


    if (filters.academicYearId) {

      params.set(
        "academicYearId",
        filters.academicYearId
      );
    }


    if (filters.termId) {

      params.set(
        "termId",
        filters.termId
      );
    }


    if (filters.gradeId) {

      params.set(
        "gradeId",
        filters.gradeId
      );
    }


    if (filters.streamId) {

      params.set(
        "streamId",
        filters.streamId
      );
    }


    const query =
      params.toString()
        ? `?${params.toString()}`
        : "";


    const response =
      await apiRequest(
        `/academic-admin/assessment-reviews${query}`
      );


    const assessments =
      extractData(response);


    renderAssessments(
      assessments
    );

  } catch (error) {

    console.error(error);

    showError(
      "Unable to load assessment reviews."
    );
  }
}


function renderAssessments(
  assessments = []
) {

  const tbody =
    document.getElementById(
      "assessmentsTableBody"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = "";


  if (!assessments.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          No assessments found.
        </td>
      </tr>
    `;

    return;
  }


  assessments.forEach(assessment => {

    const teacher =
      assessment.teacher?.user || {};


    const teacherName =
      [
        teacher.firstName,
        teacher.middleName,
        teacher.lastName
      ]
        .filter(Boolean)
        .join(" ");


    const row =
      document.createElement("tr");


    row.innerHTML = `

      <td>
        ${escapeHtml(
          assessment.name || "-"
        )}
      </td>

      <td>
        ${escapeHtml(
          assessment.type || "-"
        )}
      </td>

      <td>
        ${escapeHtml(
          assessment.grade?.name || "-"
        )}
      </td>

      <td>
        ${escapeHtml(
          assessment.stream?.name || "-"
        )}
      </td>

      <td>
        ${escapeHtml(
          assessment.learningArea?.name || "-"
        )}
      </td>

      <td>
        ${escapeHtml(
          teacherName || "-"
        )}
      </td>

      <td>
        ${formatDate(
          assessment.assessmentDate
        )}
      </td>

      <td>
        ${
          assessment.includeInReportCard
            ? "Recommended"
            : "Not recommended"
        }
      </td>

      <td>

        <button
          type="button"
          onclick="viewAssessment('${assessment.id}')"
        >
          View
        </button>

      </td>

    `;


    tbody.appendChild(row);
  });
}


/*
|--------------------------------------------------------------------------
| VIEW ASSESSMENT
|--------------------------------------------------------------------------
*/

async function viewAssessment(
  assessmentId
) {

  try {

    const response =
      await apiRequest(
        `/assessments/${assessmentId}`
      );


    const assessment =
      extractData(response);


    renderAssessmentDetails(
      assessment
    );

  } catch (error) {

    console.error(error);

    showError(
      "Unable to load assessment."
    );
  }
}


function renderAssessmentDetails(
  assessment
) {

  const container =
    document.getElementById(
      "assessmentDetails"
    );


  if (!container) {
    return;
  }


  const teacher =
    assessment.teacher?.user || {};


  const teacherName =
    [
      teacher.firstName,
      teacher.middleName,
      teacher.lastName
    ]
      .filter(Boolean)
      .join(" ");


  container.innerHTML = `

    <h3>
      ${escapeHtml(
        assessment.name || "-"
      )}
    </h3>

    <p>
      Type:
      ${escapeHtml(
        assessment.type || "-"
      )}
    </p>

    <p>
      Learning Area:
      ${escapeHtml(
        assessment.learningArea?.name || "-"
      )}
    </p>

    <p>
      Teacher:
      ${escapeHtml(
        teacherName || "-"
      )}
    </p>

    <p>
      Grade:
      ${escapeHtml(
        assessment.grade?.name || "-"
      )}
    </p>

    <p>
      Stream:
      ${escapeHtml(
        assessment.stream?.name || "-"
      )}
    </p>

    <p>
      Assessment Date:
      ${formatDate(
        assessment.assessmentDate
      )}
    </p>

    <p>
      Total Marks:
      ${escapeHtml(
        assessment.totalMarks ?? "-"
      )}
    </p>

    <p>
      Status:
      ${
        assessment.isPublished
          ? "Published"
          : "Draft"
      }
    </p>

    <p>
      Report Card:
      ${
        assessment.includeInReportCard
          ? "Recommended"
          : "Not recommended"
      }
    </p>

  `;
}


/*
|--------------------------------------------------------------------------
| REPORT CARDS
|--------------------------------------------------------------------------
*/

async function loadReportCards(
  filters = {}
) {

  try {

    const params =
      new URLSearchParams();


    if (filters.academicYearId) {

      params.set(
        "academicYearId",
        filters.academicYearId
      );
    }


    if (filters.termId) {

      params.set(
        "termId",
        filters.termId
      );
    }


    if (filters.gradeId) {

      params.set(
        "gradeId",
        filters.gradeId
      );
    }


    if (filters.streamId) {

      params.set(
        "streamId",
        filters.streamId
      );
    }


    if (filters.status) {

      params.set(
        "status",
        filters.status
      );
    }


    const query =
      params.toString()
        ? `?${params.toString()}`
        : "";


    const response =
      await apiRequest(
        `/academic-admin/report-cards${query}`
      );


    const reportCards =
      extractData(response);


    renderReportCards(
      reportCards
    );

  } catch (error) {

    console.error(error);

    showError(
      "Unable to load report cards."
    );
  }
}


function renderReportCards(
  reportCards = []
) {

  const tbody =
    document.getElementById(
      "reportCardsTableBody"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = "";


  if (!reportCards.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          No report cards found.
        </td>
      </tr>
    `;

    return;
  }


  reportCards.forEach(reportCard => {

    const student =
      reportCard.student || {};


    const studentName =
      [
        student.firstName,
        student.middleName,
        student.lastName
      ]
        .filter(Boolean)
        .join(" ");


    const enrollment =
      student.enrollments?.find(
        item =>
          item.isActive
      ) ||
      student.enrollments?.[0];


    const row =
      document.createElement("tr");


    row.innerHTML = `

      <td>
        ${escapeHtml(
          student.admissionNumber || "-"
        )}
      </td>

      <td>
        ${escapeHtml(
          studentName || "-"
        )}
      </td>

      <td>
        ${escapeHtml(
          enrollment?.grade?.name || "-"
        )}
      </td>

      <td>
        ${escapeHtml(
          enrollment?.stream?.name || "-"
        )}
      </td>

      <td>
        ${escapeHtml(
          reportCard.academicYear?.name || "-"
        )}
      </td>

      <td>
        ${escapeHtml(
          reportCard.term?.name || "-"
        )}
      </td>

      <td>
        ${escapeHtml(
          reportCard.status || "-"
        )}
      </td>

      <td>
        ${reportCard.resultCount ?? 0}
      </td>

      <td>

        <button
          type="button"
          onclick="viewReportCard('${reportCard.id}')"
        >
          View
        </button>

      </td>

    `;


    tbody.appendChild(row);
  });
}


/*
|--------------------------------------------------------------------------
| VIEW REPORT CARD
|--------------------------------------------------------------------------
*/

async function viewReportCard(
  reportCardId
) {

  try {

    const response =
      await apiRequest(
        `/report-cards/${reportCardId}`
      );


    const reportCard =
      extractData(response);


    renderReportCardDetails(
      reportCard
    );

  } catch (error) {

    console.error(error);

    showError(
      "Unable to load report card."
    );
  }
}


function renderReportCardDetails(
  reportCard
) {

  const container =
    document.getElementById(
      "reportCardDetails"
    );


  if (!container) {
    return;
  }


  const student =
    reportCard.student || {};


  const name =
    [
      student.firstName,
      student.middleName,
      student.lastName
    ]
      .filter(Boolean)
      .join(" ");


  container.innerHTML = `

    <h3>
      ${escapeHtml(name || "-")}
    </h3>

    <p>
      Status:
      ${escapeHtml(
        reportCard.status || "-"
      )}
    </p>

    <p>
      Grade Position:
      ${escapeHtml(
        reportCard.gradePosition ?? "-"
      )}
    </p>

    <p>
      Stream Position:
      ${escapeHtml(
        reportCard.streamPosition ?? "-"
      )}
    </p>

    <p>
      Total Score:
      ${escapeHtml(
        reportCard.totalScore ?? "-"
      )}
    </p>

    <p>
      Total Learners:
      ${escapeHtml(
        reportCard.totalLearners ?? "-"
      )}
    </p>

    <p>
      Results:
      ${reportCard.resultCount ?? 0}
    </p>

  `;
}


/*
|--------------------------------------------------------------------------
| ANNOUNCEMENTS
|--------------------------------------------------------------------------
*/

async function loadAnnouncements() {

  try {

    const response =
      await apiRequest(
        "/announcements"
      );


    const announcements =
      extractData(response);


    renderAnnouncements(
      announcements
    );

  } catch (error) {

    console.error(error);

    showError(
      "Unable to load announcements."
    );
  }
}


function renderAnnouncements(
  announcements = []
) {

  const container =
    document.getElementById(
      "announcementsContainer"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!announcements.length) {

    container.innerHTML =
      `<p>No announcements found.</p>`;

    return;
  }


  announcements.forEach(
    announcement => {

      const card =
        document.createElement("article");


      card.className =
        "announcement-card";


      card.innerHTML = `

        <h3>
          ${escapeHtml(
            announcement.title || ""
          )}
        </h3>

        <p>
          ${escapeHtml(
            announcement.content || ""
          )}
        </p>

        <small>
          ${formatDate(
            announcement.createdAt
          )}
        </small>

      `;


      container.appendChild(card);
    }
  );
}


/*
|--------------------------------------------------------------------------
| CREATE ANNOUNCEMENT
|--------------------------------------------------------------------------
*/

async function createAnnouncement(
  data
) {

  try {

    const response =
      await apiRequest(
        "/announcements",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );


    await loadAnnouncements();


    showSuccess(
      "Announcement created successfully."
    );


    return extractData(response);

  } catch (error) {

    showError(
      error.message
    );

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

async function loadEvents() {

  try {

    const response =
      await apiRequest(
        "/events"
      );


    const events =
      extractData(response);


    renderEvents(
      events
    );

  } catch (error) {

    console.error(error);

    showError(
      "Unable to load events."
    );
  }
}


function renderEvents(
  events = []
) {

  const container =
    document.getElementById(
      "eventsContainer"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!events.length) {

    container.innerHTML =
      `<p>No events found.</p>`;

    return;
  }


  events.forEach(event => {

    const card =
      document.createElement("article");


    card.className =
      "event-card";


    card.innerHTML = `

      <h3>
        ${escapeHtml(
          event.title || ""
        )}
      </h3>

      <p>
        ${escapeHtml(
          event.description || ""
        )}
      </p>

      <p>
        ${formatDate(
          event.startDate
        )}
      </p>

    `;


    container.appendChild(card);
  });
}


/*
|--------------------------------------------------------------------------
| CREATE EVENT
|--------------------------------------------------------------------------
*/

async function createEvent(
  data
) {

  try {

    const response =
      await apiRequest(
        "/events",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );


    await loadEvents();


    showSuccess(
      "Event created successfully."
    );


    return extractData(response);

  } catch (error) {

    showError(
      error.message
    );

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| FILTER HELPERS
|--------------------------------------------------------------------------
*/

async function applyAssessmentFilters() {

  const filters = {

    academicYearId:
      document.getElementById(
        "assessmentAcademicYear"
      )?.value || "",

    termId:
      document.getElementById(
        "assessmentTerm"
      )?.value || "",

    gradeId:
      document.getElementById(
        "assessmentGrade"
      )?.value || "",

    streamId:
      document.getElementById(
        "assessmentStream"
      )?.value || ""

  };


  await loadAssessmentReviews(
    filters
  );
}


async function applyReportCardFilters() {

  const filters = {

    academicYearId:
      document.getElementById(
        "reportCardAcademicYear"
      )?.value || "",

    termId:
      document.getElementById(
        "reportCardTerm"
      )?.value || "",

    gradeId:
      document.getElementById(
        "reportCardGrade"
      )?.value || "",

    streamId:
      document.getElementById(
        "reportCardStream"
      )?.value || "",

    status:
      document.getElementById(
        "reportCardStatus"
      )?.value || ""

  };


  await loadReportCards(
    filters
  );
}


/*
|--------------------------------------------------------------------------
| GRADE -> STREAM FILTER
|--------------------------------------------------------------------------
*/

async function handleGradeStreamChange(
  gradeSelectId,
  streamSelectId
) {

  const gradeId =
    document.getElementById(
      gradeSelectId
    )?.value || "";


  if (!gradeId) {

    await loadStreams();

    return;
  }


  await loadStreams(
    gradeId
  );


  const streamSelect =
    document.getElementById(
      streamSelectId
    );


  if (streamSelect) {

    streamSelect.value =
      "";
  }
}


/* ============================================================
   EXAMINATION TIMETABLE
============================================================ */

let selectedExaminationTimetableId = null;
let examinationTimetables = [];


  

function showExaminationTimetableForm() {
  document
    .getElementById("examination-timetable-form")
    .classList.remove("hidden");
}


function hideExaminationTimetableForm() {
  document
    .getElementById("examination-timetable-form")
    .classList.add("hidden");
}


async function loadExaminationFormData() {
  try {
    await Promise.all([
      loadExaminationAcademicYears(),
      loadExaminationTerms(),
      loadExaminationGrades(),
      loadExaminationLearningAreas(),
    ]);
  } catch (error) {
    console.error(
      "Unable to load examination form data:",
      error
    );
  }
}

async function loadExaminationAcademicYears() {

  try {

    const response = await examinationApiFetch(
      "/api/academic-admin/academic-years"
    );

    console.log("Examination academic years response:", response);

    const years =
      Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.academicYears)
            ? response.academicYears
            : [];

    const select = document.getElementById("exam-academic-year");

    if (!select) {
      console.error(
        "Element #exam-academic-year was not found."
      );
      return;
    }

    select.innerHTML = `
      <option value="">Select academic year</option>
    `;

    years.forEach(year => {

      const option = document.createElement("option");

      option.value = year.id;

      option.textContent =
        year.name ||
        year.year ||
        year.label ||
        `Academic Year ${year.id}`;

      select.appendChild(option);

    });

  } catch (error) {

    console.error(
      "Unable to load examination academic years:",
      error
    );

  }
}


async function loadExaminationTerms() {
  const data = await examinationApiFetch(
    "http://localhost:5000/api/academic-admin/terms"
  );

  const select =
    document.getElementById("exam-term");

  select.innerHTML =
    '<option value="">Select term</option>';

  const terms =
    data.terms ||
    data;

  terms.forEach((term) => {
    const option =
      document.createElement("option");

    option.value = term.id;

    option.textContent =
      term.name ||
      term.termName ||
      `Term ${term.number || ""}`;

    select.appendChild(option);
  });
}



async function loadExaminationGrades() {
  const data = await examinationApiFetch(
    "http://localhost:5000/api/academic-admin/grades"
  );

  const select =
    document.getElementById("exam-entry-grade");

  select.innerHTML =
    '<option value="">Select grade</option>';

  const grades =
    data.grades ||
    data;

  grades.forEach((grade) => {
    const option =
      document.createElement("option");

    option.value = grade.id;

    option.textContent =
      grade.name ||
      grade.gradeName ||
      grade.code;

    select.appendChild(option);
  });
}



async function loadExaminationLearningAreas() {
  const data = await examinationApiFetch(
    "http://localhost:5000/api/academic-admin/learning-areas"
  );

  const select =
    document.getElementById(
      "exam-entry-learning-area"
    );

  select.innerHTML =
    '<option value="">Select learning area</option>';

  const learningAreas =
    data.learningAreas ||
    data;

  learningAreas.forEach((area) => {
    const option =
      document.createElement("option");

    option.value = area.id;

    option.textContent =
      area.name ||
      area.learningAreaName;

    select.appendChild(option);
  });
}


async function createExaminationTimetable(event) {
  event.preventDefault();

  const name =
    document.getElementById(
      "exam-timetable-name"
    ).value.trim();

  const examinationType =
    document.getElementById(
      "exam-timetable-type"
    ).value;

  const academicYearId =
    document.getElementById(
      "exam-academic-year"
    ).value;

  const termId =
    document.getElementById(
      "exam-term"
    ).value;

  if (!name || !academicYearId) {
    alert(
      "Examination name and academic year are required."
    );

    return;
  }

  try {
    const data =
      await examinationApiFetch(
        "http://localhost:5000/api/examination-timetables",
        {
          method: "POST",

          body: JSON.stringify({
            name,
            examinationType:
              examinationType || null,
            academicYearId,
            termId:
              termId || null,
          }),
        }
      );

    alert(
      "Examination timetable created successfully."
    );

    document
      .getElementById(
        "create-examination-timetable-form"
      )
      .reset();

    hideExaminationTimetableForm();

    await loadExaminationTimetables();

    if (data.timetable) {
      selectExaminationTimetable(
        data.timetable.id
      );
    }

  } catch (error) {
    console.error(
      "Unable to create examination timetable:",
      error
    );

    alert(error.message);
  }
}


async function loadExaminationTimetables() {
  const container =
    document.getElementById(
      "examination-timetables-container"
    );

  container.innerHTML = `
    <div class="bg-white border rounded-xl p-8 text-center text-gray-500">
      Loading examination timetables...
    </div>
  `;

  try {
    const data =
      await examinationApiFetch(
        "http://localhost:5000/api/examination-timetables"
      );

    examinationTimetables =
      data.timetables || [];

    renderExaminationTimetables();

  } catch (error) {
    console.error(
      "Unable to load examination timetables:",
      error
    );

    container.innerHTML = `
      <div class="bg-white border rounded-xl p-8 text-center text-red-500">
        ${escapeHtml(error.message)}
      </div>
    `;
  }
}


function renderExaminationTimetables() {
  const container =
    document.getElementById(
      "examination-timetables-container"
    );

  if (!examinationTimetables.length) {
    container.innerHTML = `
      <div class="bg-white border rounded-xl p-8 text-center text-gray-500">
        <div class="text-4xl mb-3">📝</div>

        <p class="font-medium">
          No examination timetables yet.
        </p>

        <p class="text-sm mt-1">
          Create your first examination timetable.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

      ${examinationTimetables
        .map(
          (timetable) => `
            <div
              class="bg-white border rounded-xl p-5 hover:shadow-sm transition"
            >

              <div class="flex items-start justify-between gap-3">

                <div>

                  <h4 class="font-bold text-gray-800">
                    ${escapeHtml(
                      timetable.name
                    )}
                  </h4>

                  <p class="text-sm text-gray-500 mt-1">
                    ${escapeHtml(
                      timetable.examinationType ||
                        "Examination"
                    )}
                  </p>

                </div>

                <span
                  class="px-2.5 py-1 rounded-full text-xs font-medium
                  ${
                    timetable.status ===
                    "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }"
                >
                  ${escapeHtml(
                    timetable.status ||
                      "DRAFT"
                  )}
                </span>

              </div>


              <div class="mt-4 text-sm text-gray-600">

                <div>
                  Academic Year:
                  <span class="font-medium">
                    ${
                      timetable.academicYear
                        ?.name ||
                      timetable.academicYear
                        ?.year ||
                      "-"
                    }
                  </span>
                </div>

                <div class="mt-1">
                  Term:
                  <span class="font-medium">
                    ${
                      timetable.term?.name ||
                      "-"
                    }
                  </span>
                </div>

                <div class="mt-1">
                  Papers:
                  <span class="font-medium">
                    ${
                      timetable.entries
                        ?.length || 0
                    }
                  </span>
                </div>

              </div>


              <div class="mt-5">

                <button
                  onclick="selectExaminationTimetable('${timetable.id}')"
                  class="w-full py-2 rounded-lg bg-school-800 text-white hover:bg-school-900"
                >
                  Manage Timetable
                </button>

              </div>

            </div>
          `
        )
        .join("")}

    </div>
  `;
}


async function selectExaminationTimetable(
  timetableId
) {
  selectedExaminationTimetableId =
    timetableId;

  try {
    const data =
      await examinationApiFetch(
        `http://localhost:5000/api/examination-timetables/${timetableId}`
      );

    const timetable =
      data.timetable;

    document
      .getElementById(
        "selected-examination-timetable"
      )
      .classList.remove("hidden");

    document.getElementById(
      "selected-examination-title"
    ).textContent =
      timetable.name;

    document.getElementById(
      "selected-examination-meta"
    ).textContent =
      `${timetable.examinationType || "Examination"} • ${
        timetable.academicYear?.name ||
        timetable.academicYear?.year ||
        ""
      } • ${
        timetable.term?.name ||
        ""
      }`;

    await loadExaminationEntries(
      timetableId
    );

    document
      .getElementById(
        "selected-examination-timetable"
      )
      .scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

  } catch (error) {
    console.error(
      "Unable to load examination timetable:",
      error
    );

    alert(error.message);
  }
}


function showExaminationEntryForm() {
  if (!selectedExaminationTimetableId) {
    alert(
      "Please select an examination timetable first."
    );

    return;
  }

  document
    .getElementById(
      "examination-entry-form"
    )
    .classList.remove("hidden");
}


function hideExaminationEntryForm() {
  document
    .getElementById(
      "examination-entry-form"
    )
    .classList.add("hidden");
}


async function createExaminationEntry(event) {
  event.preventDefault();

  if (!selectedExaminationTimetableId) {
    alert(
      "Please select an examination timetable first."
    );

    return;
  }

  const examDate =
    document.getElementById(
      "exam-entry-date"
    ).value;

  const gradeId =
    document.getElementById(
      "exam-entry-grade"
    ).value;

  const learningAreaId =
    document.getElementById(
      "exam-entry-learning-area"
    ).value;

  const startTime =
    document.getElementById(
      "exam-entry-start-time"
    ).value;

  const endTime =
    document.getElementById(
      "exam-entry-end-time"
    ).value;

  if (
    !examDate ||
    !gradeId ||
    !learningAreaId ||
    !startTime ||
    !endTime
  ) {
    alert(
      "Please fill in all examination fields."
    );

    return;
  }

  if (startTime >= endTime) {
    alert(
      "End time must be later than start time."
    );

    return;
  }

  try {
    await examinationApiFetch(
      `http://localhost:5000/api/examination-timetables/${selectedExaminationTimetableId}/entries`,
      {
        method: "POST",

        body: JSON.stringify({
          examDate,
          gradeId,
          learningAreaId,
          startTime,
          endTime,
        }),
      }
    );

    alert(
      "Examination added successfully."
    );

    document
      .getElementById(
        "create-examination-entry-form"
      )
      .reset();

    hideExaminationEntryForm();

    await loadExaminationEntries(
      selectedExaminationTimetableId
    );

    await loadExaminationTimetables();

  } catch (error) {
    console.error(
      "Unable to create examination entry:",
      error
    );

    alert(error.message);
  }
}

async function loadExaminationEntries(
  timetableId
) {
  const container =
    document.getElementById(
      "examination-entries-container"
    );

  container.innerHTML = `
    <div class="py-10 text-center text-gray-500">
      Loading examinations...
    </div>
  `;

  try {
    const data =
      await examinationApiFetch(
        `http://localhost:5000/api/examination-timetables/${timetableId}/entries`
      );

    renderExaminationEntries(
      data.entries || []
    );

  } catch (error) {
    console.error(
      "Unable to load examination entries:",
      error
    );

    container.innerHTML = `
      <div class="py-10 text-center text-red-500">
        ${escapeHtml(error.message)}
      </div>
    `;
  }
}


function renderExaminationEntries(
  entries
) {
  const container =
    document.getElementById(
      "examination-entries-container"
    );

  if (!entries.length) {
    container.innerHTML = `
      <div class="py-10 text-center text-gray-500">
        <div class="text-3xl mb-2">📝</div>

        <p class="font-medium">
          No examinations added yet.
        </p>

        <p class="text-sm mt-1">
          Click "Add Examination" to create the first paper.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <table class="min-w-full">

      <thead>

        <tr class="border-b bg-gray-50">

          <th class="text-left px-4 py-3 text-sm font-semibold">
            Date
          </th>

          <th class="text-left px-4 py-3 text-sm font-semibold">
            Grade
          </th>

          <th class="text-left px-4 py-3 text-sm font-semibold">
            Learning Area
          </th>

          <th class="text-left px-4 py-3 text-sm font-semibold">
            Start
          </th>

          <th class="text-left px-4 py-3 text-sm font-semibold">
            End
          </th>

          <th class="text-right px-4 py-3 text-sm font-semibold">
            Actions
          </th>

        </tr>

      </thead>


      <tbody>

        ${entries
          .map(
            (entry) => `
              <tr class="border-b hover:bg-gray-50">

                <td class="px-4 py-3 text-sm">
                  ${formatExaminationDate(
                    entry.examDate
                  )}
                </td>

                <td class="px-4 py-3 text-sm font-medium">
                  ${escapeHtml(
                    entry.grade?.name ||
                      entry.grade?.gradeName ||
                      "-"
                  )}
                </td>

                <td class="px-4 py-3 text-sm">
                  ${escapeHtml(
                    entry.learningArea?.name ||
                      entry.learningArea
                        ?.learningAreaName ||
                      "-"
                  )}
                </td>

                <td class="px-4 py-3 text-sm">
                  ${escapeHtml(
                    entry.startTime
                  )}
                </td>

                <td class="px-4 py-3 text-sm">
                  ${escapeHtml(
                    entry.endTime
                  )}
                </td>

                <td class="px-4 py-3 text-right">

                  <button
                    onclick="deleteExaminationEntry('${entry.id}')"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>

                </td>

              </tr>
            `
          )
          .join("")}

      </tbody>

    </table>
  `;
}

async function deleteExaminationEntry(
  entryId
) {
  const confirmed =
    confirm(
      "Are you sure you want to delete this examination?"
    );

  if (!confirmed) {
    return;
  }

  try {
    await examinationApiFetch(
      `http://localhost:5000/api/examination-timetables/entries/${entryId}`,
      {
        method: "DELETE",
      }
    );

    await loadExaminationEntries(
      selectedExaminationTimetableId
    );

    await loadExaminationTimetables();

  } catch (error) {
    console.error(
      "Unable to delete examination entry:",
      error
    );

    alert(error.message);
  }
}

/*  
  |---  ------------------------------------------------------- ----------------
  | INITIALIZATION
|--------------------------------------------------------------------------
*/

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */


    /*
    |--------------------------------------------------------------------------
    | Load dashboard
    |--------------------------------------------------------------------------
    */

    await loadAcademicDashboard();

    await loadAcademicOverview();


    /*
    |--------------------------------------------------------------------------
    | Load academic configuration
    |--------------------------------------------------------------------------
    */

    await loadAcademicYears();

    await loadTerms();

    await loadGrades();

    await loadStreams();


    /*
    |--------------------------------------------------------------------------
    | Load people
    |--------------------------------------------------------------------------
    */

    await loadStudents();

    await loadTeachers();

    await loadParents();


    /*
    |--------------------------------------------------------------------------
    | Load academic administration
    |--------------------------------------------------------------------------
    */

    await loadTeachingAssignments();

    await loadClassTeachers();


    /*
    |--------------------------------------------------------------------------
    | Load timetable
    |--------------------------------------------------------------------------
    */

    await loadTimetables();


    /*
    |--------------------------------------------------------------------------
    | Load assessment/report-card review
    |--------------------------------------------------------------------------
    */

    await loadAssessmentReviews();

    await loadReportCards();


    /*
    |--------------------------------------------------------------------------
    | Communications
    |--------------------------------------------------------------------------
    */

    await loadAnnouncements();

    await loadEvents();

  }
);


function closeModal() {
  const modal = document.getElementById("modal");

  if (!modal) {
    return;
  }

  modal.classList.add("hidden");
  modal.classList.remove("flex");

  const modalBody =
    document.getElementById("modalBody");

  if (modalBody) {
    modalBody.innerHTML = "";
  }
}


/*
|--------------------------------------------------------------------------
| GLOBAL FUNCTIONS
|--------------------------------------------------------------------------
|
| academic.html can call these directly from:
|
| onclick=""
| onchange=""
| onsubmit=""
|
|--------------------------------------------------------------------------
*/

window.logout =
  logout;


/* Dashboard */

window.loadAcademicDashboard =
  loadAcademicDashboard;

window.loadAcademicOverview =
  loadAcademicOverview;


/* Academic Years */

window.loadAcademicYears =
  loadAcademicYears;

window.createAcademicYear =
  createAcademicYear;

window.updateAcademicYear =
  updateAcademicYear;


/* Terms */

window.loadTerms =
  loadTerms;

window.createTerm =
  createTerm;

window.updateTerm =
  updateTerm;


/* Grades */

window.loadGrades =
  loadGrades;

window.createGrade =
  createGrade;

window.updateGrade =
  updateGrade;


/* Streams */

window.loadStreams =
  loadStreams;

window.createStream =
  createStream;

window.updateStream =
  updateStream;


/* Students */

window.loadStudents =
  loadStudents;

window.searchStudents =
  searchStudents;

window.viewStudent =
  viewStudent;


/* Teachers */

window.loadTeachers =
  loadTeachers;

window.searchTeachers =
  searchTeachers;

window.viewTeacher =
  viewTeacher;


/* Parents */

window.loadParents =
  loadParents;

window.searchParents =
  searchParents;

window.viewParent =
  viewParent;


/* Teaching Assignments */

window.loadTeachingAssignments =
  loadTeachingAssignments;

window.createTeachingAssignment =
  createTeachingAssignment;

window.updateTeachingAssignment =
  updateTeachingAssignment;


/* Class Teachers */

window.loadClassTeachers =
  loadClassTeachers;

window.createClassTeacher =
  createClassTeacher;

window.updateClassTeacher =
  updateClassTeacher;

window.removeClassTeacher =
  removeClassTeacher;


/* Timetables */

window.loadTimetables =
  loadTimetables;

window.handleCreateTimetable =
  handleCreateTimetable;

window.openTimetable =
  openTimetable;

window.handleCreateTimetableEntry =
  handleCreateTimetableEntry;

window.editTimetableEntry =
  editTimetableEntry;


/* Assessments */

window.loadAssessmentReviews =
  loadAssessmentReviews;

window.applyAssessmentFilters =
  applyAssessmentFilters;

window.viewAssessment =
  viewAssessment;


/* Report Cards */

window.loadReportCards =
  loadReportCards;

window.applyReportCardFilters =
  applyReportCardFilters;

window.viewReportCard =
  viewReportCard;


/* Announcements */

window.loadAnnouncements =
  loadAnnouncements;

window.createAnnouncement =
  createAnnouncement;


/* Events */

window.loadEvents =
  loadEvents;

window.createEvent =
  createEvent;


/* Filters */

window.handleGradeStreamChange =
  handleGradeStreamChange;

