

const API_BASE_URL = "http://localhost:5000/api";


/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

function getAuthToken() {
  return localStorage.getItem("token");
}


/*
|--------------------------------------------------------------------------
| API REQUEST HELPER
|--------------------------------------------------------------------------
|
| Automatically:
|
| - adds Authorization header
| - sends JSON
| - parses JSON response
| - handles API errors
|
|--------------------------------------------------------------------------
*/

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch (error) {
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


/*
|--------------------------------------------------------------------------
| RESPONSE DATA HELPER
|--------------------------------------------------------------------------
|
| Your backend responses normally use:
|
| {
|   success: true,
|   data: ...
| }
|
|--------------------------------------------------------------------------
*/

function extractData(response) {
  if (
    response &&
    Object.prototype.hasOwnProperty.call(response, "data")
  ) {
    return response.data;
  }

  return response;
}


/*
|--------------------------------------------------------------------------
| HTML ESCAPING
|--------------------------------------------------------------------------
|
| Prevents API values from being inserted directly as raw HTML.
|
|--------------------------------------------------------------------------
*/

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/*
|--------------------------------------------------------------------------
| SHOW ERROR
|--------------------------------------------------------------------------
*/

function showError(message) {
  console.error(message);

  const errorContainer =
    document.getElementById("teacherError");

  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.classList.remove("hidden");
  }

  alert(message);
}


/*
|--------------------------------------------------------------------------
| SHOW SUCCESS
|--------------------------------------------------------------------------
*/

function showSuccess(message) {
  console.log(message);

  const successContainer =
    document.getElementById("teacherSuccess");

  if (successContainer) {
    successContainer.textContent = message;
    successContainer.classList.remove("hidden");

    setTimeout(() => {
      successContainer.classList.add("hidden");
    }, 3000);
  }
}

/* ==========================================================================
   TEACHER ASSESSMENT ACADEMIC DROPDOWNS
   ========================================================================== */

let teacherAcademicYears = [];
let teacherTerms = [];
let teacherGrades = [];
let teacherStreams = [];


/* ==========================================================================
   LOAD ACADEMIC YEARS
   ========================================================================== */

async function loadTeacherAcademicYears() {
  try {
    const response = await apiRequest(
      "/academic-admin/academic-years"
    );

    const data = extractData(response);

    teacherAcademicYears = Array.isArray(data)
      ? data
      : data?.academicYears || [];

    populateTeacherAssessmentAcademicYears();

  } catch (error) {
    console.error(
      "Failed to load academic years:",
      error
    );

    showError(
      "Failed to load academic years."
    );
  }
}


/* ==========================================================================
   POPULATE ACADEMIC YEAR DROPDOWN
   ========================================================================== */

function populateTeacherAssessmentAcademicYears() {
  const select = document.getElementById(
    "assessmentAcademicYear"
  );

  if (!select) {
    return;
  }

  select.innerHTML = `
    <option value="">
      Select academic year
    </option>
  `;

  teacherAcademicYears.forEach(year => {
    const option = document.createElement("option");

    option.value = year.id;

    option.textContent =
      year.name ||
      year.year ||
      year.label ||
      year.academicYear ||
      year.id;

    select.appendChild(option);
  });
}


/* ==========================================================================
   LOAD TERMS FOR SELECTED ACADEMIC YEAR
   ========================================================================== */

async function loadTeacherAssessmentTerms(
  academicYearId
) {
  const termSelect = document.getElementById(
    "assessmentTerm"
  );

  if (!termSelect) {
    return;
  }

  termSelect.innerHTML = `
    <option value="">
      Select term
    </option>
  `;

  termSelect.disabled = true;

  if (!academicYearId) {
    return;
  }

  try {
    const response = await apiRequest(
      `/academic-admin/terms?academicYearId=${encodeURIComponent(
        academicYearId
      )}`
    );

    const data = extractData(response);

    teacherTerms = Array.isArray(data)
      ? data
      : data?.terms || [];

    teacherTerms.forEach(term => {
      const option = document.createElement("option");

      option.value = term.id;

      option.textContent =
        term.name ||
        term.termName ||
        term.label ||
        term.id;

      termSelect.appendChild(option);
    });

    termSelect.disabled = false;

  } catch (error) {
    console.error(
      "Failed to load terms:",
      error
    );

    showError(
      "Failed to load terms for the selected academic year."
    );
  }
}


/* ==========================================================================
   LOAD GRADES
   ========================================================================== */

async function loadTeacherGrades() {
  try {
    const response = await apiRequest(
      "/academic-admin/grades"
    );

    const data = extractData(response);

    teacherGrades = Array.isArray(data)
      ? data
      : data?.grades || [];

    populateTeacherAssessmentGrades();

  } catch (error) {
    console.error(
      "Failed to load grades:",
      error
    );

    showError(
      "Failed to load grades."
    );
  }
}


/* ==========================================================================
   POPULATE GRADE DROPDOWN
   ========================================================================== */

function populateTeacherAssessmentGrades() {
  const gradeSelect = document.getElementById(
    "assessmentGrade"
  );

  if (!gradeSelect) {
    return;
  }

  gradeSelect.innerHTML = `
    <option value="">
      Select grade
    </option>
  `;

  teacherGrades.forEach(grade => {
    const option = document.createElement("option");

    option.value = grade.id;

    option.textContent =
      grade.name ||
      grade.gradeName ||
      grade.label ||
      grade.code ||
      grade.id;

    gradeSelect.appendChild(option);
  });
}


/* ==========================================================================
   LOAD STREAMS FOR SELECTED GRADE
   ========================================================================== */

async function loadTeacherAssessmentStreams(
  gradeId
) {
  const streamSelect = document.getElementById(
    "assessmentStream"
  );

  if (!streamSelect) {
    return;
  }

  streamSelect.innerHTML = `
    <option value="">
      All streams / No specific stream
    </option>
  `;

  streamSelect.disabled = true;

  if (!gradeId) {
    return;
  }

  try {
    const response = await apiRequest(
      `/academic-admin/streams?gradeId=${encodeURIComponent(
        gradeId
      )}`
    );

    const data = extractData(response);

    teacherStreams = Array.isArray(data)
      ? data
      : data?.streams || [];

    teacherStreams.forEach(stream => {
      const option = document.createElement("option");

      option.value = stream.id;

      option.textContent =
        stream.name ||
        stream.streamName ||
        stream.label ||
        stream.code ||
        stream.id;

      streamSelect.appendChild(option);
    });

    streamSelect.disabled = false;

  } catch (error) {
    console.error(
      "Failed to load streams:",
      error
    );

    showError(
      "Failed to load streams for the selected grade."
    );
  }
}


/* ==========================================================================
   ASSESSMENT ACADEMIC YEAR CHANGE
   ========================================================================== */

async function handleTeacherAssessmentAcademicYearChange() {
  const academicYearSelect =
    document.getElementById(
      "assessmentAcademicYear"
    );

  if (!academicYearSelect) {
    return;
  }

  const academicYearId =
    academicYearSelect.value;

  await loadTeacherAssessmentTerms(
    academicYearId
  );
}


/* ==========================================================================
   ASSESSMENT GRADE CHANGE
   ========================================================================== */

async function handleTeacherAssessmentGradeChange() {
  const gradeSelect =
    document.getElementById(
      "assessmentGrade"
    );

  if (!gradeSelect) {
    return;
  }

  const gradeId = gradeSelect.value;

  await loadTeacherAssessmentStreams(
    gradeId
  );
}


/* ==========================================================================
   INITIALIZE ASSESSMENT ACADEMIC DROPDOWNS
   ========================================================================== */

async function initializeTeacherAssessmentDropdowns() {
  await Promise.all([
    loadTeacherAcademicYears(),
    loadTeacherGrades()
  ]);

  const termSelect =
    document.getElementById(
      "assessmentTerm"
    );

  const streamSelect =
    document.getElementById(
      "assessmentStream"
    );

  if (termSelect) {
    termSelect.innerHTML = `
      <option value="">
        Select term
      </option>
    `;

    termSelect.disabled = true;
  }

  if (streamSelect) {
    streamSelect.innerHTML = `
      <option value="">
        All streams / No specific stream
      </option>
    `;

    streamSelect.disabled = true;
  }
}

/*
|--------------------------------------------------------------------------
| LOAD TEACHER DASHBOARD
|--------------------------------------------------------------------------
|
| GET /api/teachers/me/dashboard
|
|--------------------------------------------------------------------------
*/

async function loadTeacherDashboard() {
  try {
    const response = await apiRequest(
      "/teachers/me/dashboard"
    );

    const dashboard = extractData(response);

    if (!dashboard) {
      throw new Error(
        "Teacher dashboard data was not returned."
      );
    }

    renderTeacherDashboard(dashboard);

    return dashboard;
  } catch (error) {
    console.error(
      "Unable to load teacher dashboard:",
      error
    );

    showError(
      error.message ||
        "Unable to load teacher dashboard."
    );

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| RENDER TEACHER DASHBOARD
|--------------------------------------------------------------------------
*/

function renderTeacherDashboard(dashboard) {
  /*
  |--------------------------------------------------------------------------
  | Teacher profile/name
  |--------------------------------------------------------------------------
  */

  const teacher =
    dashboard.teacher ||
    dashboard.profile ||
    dashboard;

  const user =
    teacher?.user ||
    teacher?.profile ||
    {};


  const firstName =
    user.firstName ||
    teacher?.firstName ||
    "";

  const middleName =
    user.middleName ||
    teacher?.middleName ||
    "";

  const lastName =
    user.lastName ||
    teacher?.lastName ||
    "";


  const fullName =
    [
      firstName,
      middleName,
      lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Teacher";


  /*
  |--------------------------------------------------------------------------
  | Teacher name
  |--------------------------------------------------------------------------
  */

  const teacherName =
    document.getElementById(
      "teacherName"
    );

  if (teacherName) {
    teacherName.textContent = fullName;
  }


  const dashboardTeacherName =
    document.getElementById(
      "dashboardTeacherName"
    );

  if (dashboardTeacherName) {
    dashboardTeacherName.textContent =
      fullName;
  }


  /*
  |--------------------------------------------------------------------------
  | Dashboard statistics
  |--------------------------------------------------------------------------
  */

  const teachingAssignments =
    dashboard.teachingAssignments || [];

  const learningAreas =
    dashboard.learningAreas || [];

  const streams =
    dashboard.streams || [];

  const classTeacherAssignments =
    dashboard.classTeacherAssignments || [];

  const todayTimetable =
    dashboard.todayTimetable || [];

  const recentAssessments =
    dashboard.recentAssessments || [];


  setText(
    "statAssignments",
    teachingAssignments.length
  );

  setText(
    "statStreams",
    streams.length
  );

  setText(
    "statClassTeacher",
    classTeacherAssignments.length
  );

  setText(
    "statTodayLessons",
    todayTimetable.length
  );


  /*
  |--------------------------------------------------------------------------
  | Render dashboard sections
  |--------------------------------------------------------------------------
  */

  renderTodayTimetable(
    todayTimetable
  );

  renderRecentAssessments(
    recentAssessments
  );

  renderTeachingAssignments(
    teachingAssignments
  );

  renderLearningAreas(
    learningAreas
  );

  renderTeacherStreams(
    streams
  );

  renderClassTeacherAssignments(
    classTeacherAssignments
  );
}


/*
|--------------------------------------------------------------------------
| SET TEXT HELPER
|--------------------------------------------------------------------------
*/

function setText(elementId, value) {
  const element =
    document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.textContent =
    value ?? "-";
}


/*
|--------------------------------------------------------------------------
| TODAY'S TIMETABLE
|--------------------------------------------------------------------------
*/

function renderTodayTimetable(entries = []) {
  const tbody =
    document.getElementById(
      "todayTimetableBody"
    );

  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";

  if (!entries.length) {
    tbody.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="p-4 text-center text-gray-500"
        >
          No lessons scheduled for today.
        </td>
      </tr>
    `;

    return;
  }


  entries.forEach((entry) => {
    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td class="p-4">
        ${escapeHtml(
          entry.startTime || "-"
        )}
        -
        ${escapeHtml(
          entry.endTime || "-"
        )}
      </td>

      <td class="p-4">
        ${escapeHtml(
          entry.learningArea?.name || "-"
        )}
      </td>

      <td class="p-4">
        ${escapeHtml(
          entry.grade?.name || "-"
        )}
      </td>

      <td class="p-4">
        ${escapeHtml(
          entry.stream?.name || "-"
        )}
      </td>

      <td class="p-4">
        ${escapeHtml(
          entry.room || "-"
        )}
      </td>
    `;

    tbody.appendChild(row);
  });
}


/*
|--------------------------------------------------------------------------
| RECENT ASSESSMENTS
|--------------------------------------------------------------------------
*/

function renderRecentAssessments(
  assessments = []
) {
  const tbody =
    document.getElementById(
      "recentAssessmentsBody"
    );

  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";

  if (!assessments.length) {
    tbody.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="p-4 text-center text-gray-500"
        >
          No recent assessments.
        </td>
      </tr>
    `;

    return;
  }


  assessments.forEach((assessment) => {
    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td class="p-4">
        ${escapeHtml(
          assessment.name || "-"
        )}
      </td>

      <td class="p-4">
        ${escapeHtml(
          assessment.learningArea?.name || "-"
        )}
      </td>

      <td class="p-4">
        ${escapeHtml(
          assessment.grade?.name || "-"
        )}
      </td>

      <td class="p-4">
        ${escapeHtml(
          assessment.stream?.name || "-"
        )}
      </td>

      <td class="p-4">
        ${escapeHtml(
          assessment.assessmentDate
            ? new Date(
                assessment.assessmentDate
              ).toLocaleDateString()
            : "-"
        )}
      </td>

      <td class="p-4">
        ${
          assessment.includeInReportCard
            ? "Yes"
            : "No"
        }
      </td>
    `;

    tbody.appendChild(row);
  });
}



/*
|--------------------------------------------------------------------------
| TEACHER ASSESSMENTS
|--------------------------------------------------------------------------
|
| These functions connect the teacher portal to the existing
| assessment backend.
|
| Backend routes:
|
| GET    /api/assessments/teacher
| GET    /api/assessments/:assessmentId
| POST   /api/assessments
| POST   /api/assessments/:assessmentId/items
| POST   /api/assessments/:assessmentId/results
| POST   /api/assessments/items/:assessmentItemId/results
| PUT    /api/assessments/:assessmentId/publish
| PUT    /api/assessments/:assessmentId/report-card
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| LOAD MY ASSESSMENTS
|--------------------------------------------------------------------------
*/

async function loadMyAssessments() {
  try {
    const response =
      await apiRequest(
        "/assessments/teacher"
      );

    const assessments =
      response?.assessments ||
      extractData(response) ||
      [];

    renderMyAssessments(
      Array.isArray(assessments)
        ? assessments
        : []
    );

    return assessments;

  } catch (error) {

    console.error(
      "Unable to load teacher assessments:",
      error
    );

    showError(
      error.message ||
        "Unable to load teacher assessments."
    );

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| RENDER MY ASSESSMENTS
|--------------------------------------------------------------------------
|
| The HTML table body will use:
|
| id="myAssessmentsBody"
|
|--------------------------------------------------------------------------
*/

function renderMyAssessments(
  assessments = []
) {

  const tbody =
    document.getElementById(
      "myAssessmentsBody"
    );

  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";


  if (!assessments.length) {

    tbody.innerHTML = `
      <tr>
        <td
          colspan="8"
          class="p-4 text-center text-gray-500"
        >
          No assessments found.
        </td>
      </tr>
    `;

    return;
  }


  assessments.forEach(
    (assessment) => {

      const row =
        document.createElement("tr");

      const status =
        assessment.isPublished
          ? "Published"
          : "Draft";

      const reportCardStatus =
        assessment.includeInReportCard
          ? "Included"
          : "Not included";


      row.innerHTML = `

        <td class="p-4">
          ${escapeHtml(
            assessment.name || "-"
          )}
        </td>

        <td class="p-4">
          ${escapeHtml(
            assessment.type || "-"
          )}
        </td>

        <td class="p-4">
          ${escapeHtml(
            assessment.learningArea?.name ||
            "-"
          )}
        </td>

        <td class="p-4">
          ${escapeHtml(
            assessment.grade?.name ||
            "-"
          )}
        </td>

        <td class="p-4">
          ${escapeHtml(
            assessment.stream?.name ||
            "-"
          )}
        </td>

        <td class="p-4">
          ${escapeHtml(
            assessment.assessmentDate
              ? new Date(
                  assessment.assessmentDate
                ).toLocaleDateString()
              : "-"
          )}
        </td>

        <td class="p-4">
          ${escapeHtml(status)}
        </td>

        <td class="p-4">
          ${escapeHtml(
            reportCardStatus
          )}
        </td>

        <td class="p-4">

          <button
            type="button"
            onclick="viewTeacherAssessment('${assessment.id}')"
            class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm"
          >
            View
          </button>

        </td>

      `;

      tbody.appendChild(row);
    }
  );
}


/*
|--------------------------------------------------------------------------
| VIEW ASSESSMENT
|--------------------------------------------------------------------------
*/

async function viewTeacherAssessment(
  assessmentId
) {

  try {

    const response =
      await apiRequest(
        `/assessments/${assessmentId}`
      );

    const assessment =
      response?.assessment ||
      extractData(response);

    if (!assessment) {
      throw new Error(
        "Assessment data was not returned."
      );
    }

    renderTeacherAssessmentDetails(
      assessment
    );

    return assessment;

  } catch (error) {

    console.error(
      "Unable to load assessment:",
      error
    );

    showError(
      error.message ||
        "Unable to load assessment."
    );

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| RENDER ASSESSMENT DETAILS
|--------------------------------------------------------------------------
*/

function renderTeacherAssessmentDetails(
  assessment
) {

  const container =
    document.getElementById(
      "assessmentDetails"
    );

  if (!container) {
    return;
  }


  const learningArea =
    assessment.learningArea?.name ||
    "-";

  const grade =
    assessment.grade?.name ||
    "-";

  const stream =
    assessment.stream?.name ||
    "-";

  const status =
    assessment.isPublished
      ? "Published"
      : "Draft";

  const reportCardStatus =
    assessment.includeInReportCard
      ? "Included"
      : "Not included";


  container.innerHTML = `

    <div class="space-y-4">

      <div>
        <h3 class="text-xl font-bold text-gray-900">
          ${escapeHtml(
            assessment.name || "-"
          )}
        </h3>

        <p class="text-sm text-gray-500">
          ${escapeHtml(
            assessment.description || ""
          )}
        </p>
      </div>


      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <p class="text-sm text-gray-500">
            Type
          </p>

          <p class="font-medium">
            ${escapeHtml(
              assessment.type || "-"
            )}
          </p>
        </div>


        <div>
          <p class="text-sm text-gray-500">
            Learning Area
          </p>

          <p class="font-medium">
            ${escapeHtml(
              learningArea
            )}
          </p>
        </div>


        <div>
          <p class="text-sm text-gray-500">
            Grade
          </p>

          <p class="font-medium">
            ${escapeHtml(
              grade
            )}
          </p>
        </div>


        <div>
          <p class="text-sm text-gray-500">
            Stream
          </p>

          <p class="font-medium">
            ${escapeHtml(
              stream
            )}
          </p>
        </div>


        <div>
          <p class="text-sm text-gray-500">
            Assessment Date
          </p>

          <p class="font-medium">
            ${escapeHtml(
              assessment.assessmentDate
                ? new Date(
                    assessment.assessmentDate
                  ).toLocaleDateString()
                : "-"
            )}
          </p>
        </div>


        <div>
          <p class="text-sm text-gray-500">
            Total Marks
          </p>

          <p class="font-medium">
            ${escapeHtml(
              assessment.totalMarks ??
              "-"
            )}
          </p>
        </div>


        <div>
          <p class="text-sm text-gray-500">
            Status
          </p>

          <p class="font-medium">
            ${escapeHtml(status)}
          </p>
        </div>


        <div>
          <p class="text-sm text-gray-500">
            Report Card
          </p>

          <p class="font-medium">
            ${escapeHtml(
              reportCardStatus
            )}
          </p>
        </div>

      </div>


      <div class="flex flex-wrap gap-3">

        ${
          !assessment.isPublished
            ? `
              <button
                type="button"
                onclick="publishTeacherAssessment('${assessment.id}')"
                class="px-4 py-2 rounded-lg bg-green-600 text-white"
              >
                Publish Assessment
              </button>
            `
            : ""
        }


        ${
          !assessment.isPublished
            ? `
              <button
                type="button"
                onclick="toggleAssessmentReportCard('${assessment.id}', ${
                  !assessment.includeInReportCard
                })"
                class="px-4 py-2 rounded-lg bg-gray-800 text-white"
              >
                ${
                  assessment.includeInReportCard
                    ? "Exclude from Report Card"
                    : "Include in Report Card"
                }
              </button>
            `
            : ""
        }

      </div>

    </div>

  `;
}





/*
|--------------------------------------------------------------------------
| TEACHING ASSIGNMENTS
|--------------------------------------------------------------------------
*/

function renderTeachingAssignments(
  assignments = []
) {
  const tbody =
    document.getElementById(
      "teachingAssignmentsBody"
    );

  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";

  if (!assignments.length) {
    tbody.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="p-4 text-center text-gray-500"
        >
          No teaching assignments found.
        </td>
      </tr>
    `;

    return;
  }


  assignments.forEach((assignment) => {
    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td class="p-4">
        ${escapeHtml(
          assignment.learningArea?.name || "-"
        )}
      </td>

      <td class="p-4">
        ${escapeHtml(
          assignment.grade?.name || "-"
        )}
      </td>

      <td class="p-4">
        ${escapeHtml(
          assignment.stream?.name || "-"
        )}
      </td>
    `;

    tbody.appendChild(row);
  });
}


/*
|--------------------------------------------------------------------------
| LEARNING AREAS
|--------------------------------------------------------------------------
*/

function renderLearningAreas(
  learningAreas = []
) {
  const container =
    document.getElementById(
      "learningAreasList"
    );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!learningAreas.length) {
    container.innerHTML = `
      <p class="text-gray-500">
        No learning areas assigned.
      </p>
    `;

    return;
  }


  learningAreas.forEach((item) => {
    const learningArea =
      item.learningArea || item;

    const element =
      document.createElement("div");

    element.className =
      "px-4 py-3 bg-gray-50 rounded-lg border";

    element.textContent =
      learningArea.name || "-";

    container.appendChild(element);
  });
}


/*
|--------------------------------------------------------------------------
| STREAMS
|--------------------------------------------------------------------------
*/

function renderTeacherStreams(
  streams = []
) {
  const container =
    document.getElementById(
      "streamsList"
    );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!streams.length) {
    container.innerHTML = `
      <p class="text-gray-500">
        No streams assigned.
      </p>
    `;

    return;
  }


  streams.forEach((item) => {
    const stream =
      item.stream || item;

    const element =
      document.createElement("div");

    element.className =
      "px-4 py-3 bg-gray-50 rounded-lg border";

    element.textContent =
      stream.name || "-";

    container.appendChild(element);
  });
}


/*
|--------------------------------------------------------------------------
| CLASS TEACHER ASSIGNMENTS
|--------------------------------------------------------------------------
*/

function renderClassTeacherAssignments(
  assignments = []
) {
  const container =
    document.getElementById(
      "classTeacherAssignments"
    );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!assignments.length) {
    container.innerHTML = `
      <p class="text-gray-500">
        You are not currently assigned as a class teacher.
      </p>
    `;

    return;
  }


  assignments.forEach((assignment) => {
    const element =
      document.createElement("div");

    element.className =
      "p-4 bg-gray-50 rounded-lg border";

    element.innerHTML = `
      <p class="font-semibold">
        ${escapeHtml(
          assignment.grade?.name || "-"
        )}
      </p>

      <p class="text-sm text-gray-500">
        Stream:
        ${escapeHtml(
          assignment.stream?.name || "-"
        )}
      </p>
    `;

    container.appendChild(element);
  });
}



/* 
|--------------------------------------------------------------------------
| ASSESSMENT ACADEMIC DROPDOWNS
|--------------------------------------------------------------------------
*/

async function loadAssessmentAcademicYears() {

  const select =
    document.getElementById("assessmentAcademicYear");

  if (!select) {
    return;
  }

  select.innerHTML = `
    <option value="">
      Loading academic years...
    </option>
  `;

  select.disabled = true;

  try {

    const response =
      await apiRequest(
        "/academic-admin/academic-years"
      );

    const data =
      extractData(response);

    assessmentAcademicYears =
      Array.isArray(data)
        ? data
        : data?.academicYears || [];

    select.innerHTML = `
      <option value="">
        Select academic year
      </option>
    `;

    assessmentAcademicYears.forEach(year => {

      const option =
        document.createElement("option");

      option.value = year.id;

      option.textContent =
        year.name ||
        year.year ||
        year.label ||
        year.academicYear ||
        year.id;

      select.appendChild(option);

    });

    select.disabled = false;

  } catch (error) {

    console.error(
      "Failed to load assessment academic years:",
      error
    );

    select.innerHTML = `
      <option value="">
        Failed to load academic years
      </option>
    `;

    showError(
      "Failed to load academic years."
    );
  }
}





/*
|--------------------------------------------------------------------------
| MY ASSESSMENTS
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| LOAD MY ASSESSMENTS
|--------------------------------------------------------------------------
|
| GET /api/assessments/teacher
|
|--------------------------------------------------------------------------
*/

async function loadMyAssessments() {
  try {
    const response =
      await apiRequest(
        "/assessments/teacher"
      );

    const assessments =
      response.assessments ||
      extractData(response) ||
      [];

    renderMyAssessments(
      Array.isArray(assessments)
        ? assessments
        : []
    );

    return assessments;

  } catch (error) {
    console.error(
      "Unable to load teacher assessments:",
      error
    );

    showError(
      error.message ||
        "Unable to load assessments."
    );

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| RENDER MY ASSESSMENTS
|--------------------------------------------------------------------------
*/

function renderMyAssessments(assessments = []) {

    const table =
        document.getElementById(
            "teacherAssessmentsTable"
        );

    if (!table) {
        return;
    }


    table.innerHTML = "";


    if (assessments.length === 0) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="px-6 py-8 text-center text-gray-500"
                >
                    You have not created any assessments yet.
                </td>
            </tr>
        `;

        return;
    }


    assessments.forEach(
        assessment => {

            const date =
                assessment.assessmentDate
                    ? new Date(
                        assessment.assessmentDate
                      ).toLocaleDateString()
                    : "—";


            const status =
                assessment.isPublished
                    ? `
                        <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            Published
                        </span>
                      `
                    : `
                        <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                            Draft
                        </span>
                      `;


            const reportCard =
                assessment.includeInReportCard
                    ? `
                        <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            Included
                        </span>
                      `
                    : `
                        <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                            Not included
                        </span>
                      `;


            table.innerHTML += `

                <tr class="hover:bg-gray-50">

                    <td class="px-6 py-4">
                        <div class="font-medium text-gray-900">
                            ${escapeHtml(
                                assessment.name
                            )}
                        </div>
                    </td>


                    <td class="px-6 py-4 text-sm text-gray-600">
                        ${escapeHtml(
                            assessment.type || "—"
                        )}
                    </td>


                    <td class="px-6 py-4 text-sm text-gray-600">
                        ${escapeHtml(
                            assessment.learningArea?.name ||
                            "—"
                        )}
                    </td>


                    <td class="px-6 py-4 text-sm text-gray-600">
                        ${escapeHtml(
                            assessment.grade?.name ||
                            "—"
                        )}
                    </td>


                    <td class="px-6 py-4 text-sm text-gray-600">
                        ${escapeHtml(
                            assessment.stream?.name ||
                            "All Streams"
                        )}
                    </td>


                    <td class="px-6 py-4 text-sm text-gray-600">
                        ${date}
                    </td>


                    <td class="px-6 py-4">
                        ${status}
                    </td>


                    <td class="px-6 py-4">
                        ${reportCard}
                    </td>


                    <td class="px-6 py-4 text-right">

                        <button
                            type="button"
                            onclick="openAssessmentWorkspace('${assessment.id}')"
                            class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                        >
                            Open
                        </button>

                    </td>

                </tr>

            `;
        }
    );
}


/*
|--------------------------------------------------------------------------
| CREATE ASSESSMENT
|--------------------------------------------------------------------------
|
| POST /api/assessments
|
|--------------------------------------------------------------------------
*/

async function createTeacherAssessment(
  event
) {
  event.preventDefault();

  try {

    const name =
      document
        .getElementById(
          "assessmentName"
        )
        ?.value
        .trim();

    const description =
      document
        .getElementById(
          "assessmentDescription"
        )
        ?.value
        .trim();

    const type =
      document
        .getElementById(
          "assessmentType"
        )
        ?.value;

    const academicYearId =
      document
        .getElementById(
          "assessmentAcademicYear"
        )
        ?.value;

    const termId =
      document
        .getElementById(
          "assessmentTerm"
        )
        ?.value;

    const gradeId =
      document
        .getElementById(
          "assessmentGrade"
        )
        ?.value;

    const streamId =
      document
        .getElementById(
          "assessmentStream"
        )
        ?.value;

    const learningAreaId =
      document
        .getElementById(
          "assessmentLearningArea"
        )
        ?.value;

    const assessmentDate =
      document
        .getElementById(
          "assessmentDate"
        )
        ?.value;

    const totalMarks =
      document
        .getElementById(
          "assessmentTotalMarks"
        )
        ?.value;


    /*
    |--------------------------------------------------------------------------
    | FRONTEND VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!name) {
      throw new Error(
        "Assessment name is required."
      );
    }

    if (!type) {
      throw new Error(
        "Assessment type is required."
      );
    }

    if (!academicYearId) {
      throw new Error(
        "Academic year is required."
      );
    }

    if (!termId) {
      throw new Error(
        "Term is required."
      );
    }

    if (!gradeId) {
      throw new Error(
        "Grade is required."
      );
    }

    if (!learningAreaId) {
      throw new Error(
        "Learning area is required."
      );
    }

    if (!assessmentDate) {
      throw new Error(
        "Assessment date is required."
      );
    }

    if (!totalMarks) {
      throw new Error(
        "Total marks are required."
      );
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE ASSESSMENT
    |--------------------------------------------------------------------------
    */

    const assessmentData = {
      name,
      description:
        description || null,

      type,

      academicYearId,
      termId,
      gradeId,

      streamId:
        streamId || null,

      learningAreaId,

      assessmentDate,

      totalMarks:
        Number(totalMarks),
    };


    const response =
      await apiRequest(
        "/assessments",
        {
          method: "POST",

          body:
            JSON.stringify(
              assessmentData
            ),
        }
      );


    const createdAssessment =
      response.assessment ||
      extractData(response);


    /*
    |--------------------------------------------------------------------------
    | REPORT CARD CONTROL
    |--------------------------------------------------------------------------
    |
    | The create-assessment endpoint does not
    | accept includeInReportCard.
    |
    | Therefore we create the assessment first,
    | then update report-card inclusion separately.
    |
    */

    const reportCardCheckbox =
      document.getElementById(
        "isForReportCard"
      );


    if (
      reportCardCheckbox &&
      reportCardCheckbox.checked &&
      createdAssessment?.id
    ) {

      await apiRequest(
        `/assessments/${createdAssessment.id}/report-card`,
        {
          method: "PUT",

          body:
            JSON.stringify({
              includeInReportCard: true,
            }),
        }
      );
    }


    showSuccess(
      "Assessment created successfully."
    );


    /*
    |--------------------------------------------------------------------------
    | RESET FORM
    |--------------------------------------------------------------------------
    */

    const form =
      document.getElementById(
        "assessmentForm"
      );

    if (form) {
      form.reset();
    }


    /*
    |--------------------------------------------------------------------------
    | REFRESH TABLE
    |--------------------------------------------------------------------------
    */

    await loadMyAssessments();


    return createdAssessment;

  } catch (error) {

    console.error(
      "Unable to create assessment:",
      error
    );

    showError(
      error.message ||
        "Unable to create assessment."
    );

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| VIEW ASSESSMENT
|--------------------------------------------------------------------------
|
| GET /api/assessments/:assessmentId
|
|--------------------------------------------------------------------------
*/

async function viewTeacherAssessment(
  assessmentId
) {
  try {

    const response =
      await apiRequest(
        `/assessments/${assessmentId}`
      );


    const assessment =
      response.assessment ||
      extractData(response);


    if (!assessment) {
      throw new Error(
        "Assessment details were not returned."
      );
    }


    /*
    |--------------------------------------------------------------------------
    | Show details
    |--------------------------------------------------------------------------
    */

    const details =
      document.getElementById(
        "assessmentDetails"
      );


    if (details) {

      details.innerHTML = `
        <div class="space-y-3">

          <h3 class="text-lg font-bold">
            ${escapeHtml(
              assessment.name || "-"
            )}
          </h3>

          <p>
            <strong>Type:</strong>
            ${escapeHtml(
              assessment.type || "-"
            )}
          </p>

          <p>
            <strong>Learning Area:</strong>
            ${escapeHtml(
              assessment.learningArea?.name ||
                "-"
            )}
          </p>

          <p>
            <strong>Grade:</strong>
            ${escapeHtml(
              assessment.grade?.name ||
                "-"
            )}
          </p>

          <p>
            <strong>Stream:</strong>
            ${escapeHtml(
              assessment.stream?.name ||
                "-"
            )}
          </p>

          <p>
            <strong>Date:</strong>
            ${
              assessment.assessmentDate
                ? escapeHtml(
                    new Date(
                      assessment.assessmentDate
                    ).toLocaleDateString()
                  )
                : "-"
            }
          </p>

          <p>
            <strong>Total Marks:</strong>
            ${escapeHtml(
              assessment.totalMarks ?? "-"
            )}
          </p>

          <p>
            <strong>Status:</strong>
            ${
              assessment.isPublished
                ? "Published"
                : "Draft"
            }
          </p>

          <p>
            <strong>Report Card:</strong>
            ${
              assessment.includeInReportCard
                ? "Included"
                : "Not included"
            }
          </p>

        </div>
      `;
    }


    return assessment;

  } catch (error) {

    console.error(
      "Unable to load assessment:",
      error
    );

    showError(
      error.message ||
        "Unable to load assessment."
    );

    throw error;
  }
}


/* =========================================================
   ASSESSMENT WORKSPACE
========================================================= */


let assessmentAcademicYears = [];
let assessmentTerms = [];
let assessmentGrades = [];
let assessmentStreams = [];
let assessmentStudents = [];
let currentAssessmentId = null;
let currentAssessment = null;
let currentAssessmentStudents = [];
let currentAssessmentItems = [];
let currentAssessmentResults = [];
let currentAssessmentItemResults = [];
let currentAssessmentItemId = null;


/* =========================================================
   SHOW / HIDE CREATE FORM
========================================================= */

function showAssessmentCreateForm() {
    const createPanel =
        document.getElementById("assessmentCreatePanel");

    const listPanel =
        document.getElementById("assessmentListPanel");

    const workspace =
        document.getElementById("assessmentWorkspace");

    if (createPanel) {
        createPanel.classList.remove("hidden");
    }

    if (listPanel) {
        listPanel.classList.remove("hidden");
    }

    if (workspace) {
        workspace.classList.add("hidden");
    }
}


function hideAssessmentCreateForm() {
    const createPanel =
        document.getElementById("assessmentCreatePanel");

    if (createPanel) {
        createPanel.classList.add("hidden");
    }
}


/* =========================================================
   OPEN ASSESSMENT WORKSPACE
========================================================= */

async function openAssessmentWorkspace(assessmentId) {

    if (!assessmentId) {
        alert("Assessment ID is missing.");
        return;
    }

    currentAssessmentId = assessmentId;

    const createPanel =
        document.getElementById("assessmentCreatePanel");

    const listPanel =
        document.getElementById("assessmentListPanel");

    const workspace =
        document.getElementById("assessmentWorkspace");

    if (createPanel) {
        createPanel.classList.add("hidden");
    }

    if (listPanel) {
        listPanel.classList.add("hidden");
    }

    if (workspace) {
        workspace.classList.remove("hidden");
    }

    showAssessmentWorkspaceLoading();

    try {

        await loadAssessmentWorkspace();

    } catch (error) {

        console.error(
            "Failed to open assessment workspace:",
            error
        );

        alert(
            error.message ||
            "Failed to load assessment workspace."
        );
    }
}


/* =========================================================
   LOAD ASSESSMENT WORKSPACE
========================================================= */

async function loadAssessmentWorkspace() {

    if (!currentAssessmentId) {
        throw new Error("No assessment selected.");
    }

    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication token not found.");
    }


    /* -----------------------------------------------------
       LOAD ASSESSMENT
    ----------------------------------------------------- */

    const assessmentResponse = await fetch(
        `${API_BASE_URL}/assessments/${currentAssessmentId}`,
        {
            method: "GET",

            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );


    const assessmentData =
        await assessmentResponse.json();


    if (!assessmentResponse.ok) {

        throw new Error(
            assessmentData.message ||
            "Failed to load assessment."
        );
    }


    currentAssessment =
        assessmentData.assessment ||
        assessmentData.data ||
        assessmentData;


    /* -----------------------------------------------------
       LOAD STUDENTS
    ----------------------------------------------------- */

    const studentsResponse = await fetch(
        `${API_BASE_URL}/assessments/${currentAssessmentId}/students`,
        {
            method: "GET",

            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );


    const studentsData =
        await studentsResponse.json();


    if (!studentsResponse.ok) {

        throw new Error(
            studentsData.message ||
            "Failed to load assessment learners."
        );
    }


    currentAssessmentStudents =
        studentsData.students ||
        studentsData.data ||
        [];


    /* -----------------------------------------------------
       SAVE REFERENCES
    ----------------------------------------------------- */

    currentAssessmentItems =
        currentAssessment.items || [];

    currentAssessmentResults =
        currentAssessment.results || [];


    /* -----------------------------------------------------
       RENDER
    ----------------------------------------------------- */

    renderAssessmentWorkspace();

    renderAssessmentLearners();

    renderAssessmentItems();

    updateAssessmentReview();

}


/* =========================================================
   RENDER ASSESSMENT DETAILS
========================================================= */

function renderAssessmentWorkspace() {

    if (!currentAssessment) {
        return;
    }


    const learningArea =
        currentAssessment.learningArea?.name ||
        "—";

    const grade =
        currentAssessment.grade?.name ||
        "—";

    const stream =
        currentAssessment.stream?.name ||
        "All Streams";

    const type =
        currentAssessment.type ||
        "—";

    const date =
        currentAssessment.assessmentDate
            ? new Date(
                currentAssessment.assessmentDate
              ).toLocaleDateString()
            : "—";

    const totalMarks =
        currentAssessment.totalMarks ??
        "—";


    document.getElementById(
        "workspaceAssessmentName"
    ).textContent =
        currentAssessment.name || "Assessment";


    document.getElementById(
        "workspaceAssessmentDescription"
    ).textContent =
        currentAssessment.description ||
        "No description provided.";


    document.getElementById(
        "workspaceLearningArea"
    ).textContent =
        learningArea;


    document.getElementById(
        "workspaceGrade"
    ).textContent =
        grade;


    document.getElementById(
        "workspaceStream"
    ).textContent =
        stream;


    document.getElementById(
        "workspaceType"
    ).textContent =
        type;


    document.getElementById(
        "workspaceDate"
    ).textContent =
        date;


    document.getElementById(
        "workspaceTotalMarks"
    ).textContent =
        totalMarks;


    const statusElement =
        document.getElementById(
            "workspaceAssessmentStatus"
        );


    const reportCardStatus =
        document.getElementById(
            "workspaceReportCardStatus"
        );


    if (currentAssessment.isPublished) {

        statusElement.textContent =
            "Published";

        statusElement.className =
            "px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700";

    } else {

        statusElement.textContent =
            "Draft";

        statusElement.className =
            "px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700";
    }


    if (currentAssessment.includeInReportCard) {

        reportCardStatus.textContent =
            "Included in Report Card";

        reportCardStatus.className =
            "px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700";

    } else {

        reportCardStatus.textContent =
            "Not for Report Card";

        reportCardStatus.className =
            "px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700";
    }


    updatePublishControls();
    updateReportCardControl();
}


/* =========================================================
   RENDER LEARNERS
========================================================= */

function renderAssessmentLearners() {

    const table =
        document.getElementById(
            "assessmentLearnersTable"
        );

    if (!table) {
        return;
    }


    table.innerHTML = "";


    document.getElementById(
        "overallLearnerCount"
    ).textContent =
        `${currentAssessmentStudents.length} learners`;


    if (
        currentAssessmentStudents.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="px-4 py-8 text-center text-gray-500"
                >
                    No learners were found for this assessment.
                </td>
            </tr>
        `;

        return;
    }


    currentAssessmentStudents.forEach(
        (enrollment,
        index) => {

            const student =
                enrollment.student;


            const result =
                currentAssessmentResults.find(
                    item =>
                        item.studentId ===
                        student.id
                );


            const marks =
                result?.marks ?? "";


            const performance =
                result?.performanceLevel ?? "";


            const comment =
                result?.teacherComment ?? "";


            const disabled =
                currentAssessment.isPublished
                    ? "disabled"
                    : "";


            table.innerHTML += `

                <tr>

                    <td class="px-4 py-3 text-sm text-gray-500">
                        ${index + 1}
                    </td>


                    <td class="px-4 py-3 text-sm font-medium text-gray-900">
                        ${escapeHtml(
                            student.admissionNumber
                        )}
                    </td>


                    <td class="px-4 py-3 text-sm text-gray-900">
                        ${escapeHtml(
                            getStudentFullName(student)
                        )}
                    </td>


                    <td class="px-4 py-3">

                        <input
                            id="overallMarks-${student.id}"
                            type="number"
                            min="0"
                            max="${currentAssessment.totalMarks}"
                            step="0.01"
                            value="${marks}"
                            ${disabled}
                            class="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />

                    </td>


                    <td class="px-4 py-3">

                        <select
                            id="overallPerformance-${student.id}"
                            ${disabled}
                            class="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >

                            <option value="">
                                Select
                            </option>

                            <option value="EE"
                                ${performance === "EE" ? "selected" : ""}>
                                EE
                            </option>

                            <option value="ME"
                                ${performance === "ME" ? "selected" : ""}>
                                ME
                            </option>

                            <option value="AE"
                                ${performance === "AE" ? "selected" : ""}>
                                AE
                            </option>

                            <option value="BE"
                                ${performance === "BE" ? "selected" : ""}>
                                BE
                            </option>

                        </select>

                    </td>


                    <td class="px-4 py-3">

                        <input
                            id="overallComment-${student.id}"
                            type="text"
                            value="${escapeHtml(
                                comment
                            )}"
                            ${disabled}
                            placeholder="Optional comment"
                            class="w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />

                    </td>


                    <td class="px-4 py-3 text-right">

                        ${
                            currentAssessment.isPublished
                                ? `
                                    <span class="text-xs text-green-600 font-medium">
                                        Published
                                    </span>
                                  `
                                : `
                                    <button
                                        type="button"
                                        onclick="saveOverallAssessmentResult('${student.id}')"
                                        class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                  `
                        }

                    </td>

                </tr>
            `;
        }
    );
}


/* =========================================================
   SAVE OVERALL RESULT
========================================================= */

async function saveOverallAssessmentResult(
    studentId
) {

    if (!currentAssessmentId) {
        alert("No assessment selected.");
        return;
    }


    if (currentAssessment.isPublished) {
        alert(
            "This assessment has already been published."
        );
        return;
    }


    const marksInput =
        document.getElementById(
            `overallMarks-${studentId}`
        );


    const performanceInput =
        document.getElementById(
            `overallPerformance-${studentId}`
        );


    const commentInput =
        document.getElementById(
            `overallComment-${studentId}`
        );


    const marks =
        marksInput?.value;


    if (
        marks === "" ||
        marks === null ||
        marks === undefined
    ) {

        alert("Enter the learner's marks.");
        return;
    }


    const numericMarks =
        Number(marks);


    if (
        Number.isNaN(numericMarks) ||
        numericMarks < 0 ||
        numericMarks >
            Number(currentAssessment.totalMarks)
    ) {

        alert(
            `Marks must be between 0 and ${currentAssessment.totalMarks}.`
        );

        return;
    }


    const token =
        localStorage.getItem("token");


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/assessments/${currentAssessmentId}/results`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        studentId,

                        marks: numericMarks,

                        performanceLevel:
                            performanceInput?.value ||
                            null,

                        teacherComment:
                            commentInput?.value ||
                            null
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to save learner result."
            );
        }


        alert(
            "Learner result saved successfully."
        );


        await loadAssessmentWorkspace();

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Failed to save learner result."
        );
    }
}


/* =========================================================
   RENDER ASSESSMENT ITEMS
========================================================= */

function renderAssessmentItems() {

    const table =
        document.getElementById(
            "assessmentItemsTable"
        );

    if (!table) {
        return;
    }


    table.innerHTML = "";


    if (
        currentAssessmentItems.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="px-4 py-8 text-center text-gray-500"
                >
                    No assessment items have been added.
                    <br>
                    <span class="text-xs">
                        Items are optional.
                    </span>
                </td>
            </tr>
        `;

        return;
    }


    currentAssessmentItems.forEach(
        item => {

            const outcome =
                item.learningOutcome?.name ||
                "—";


            table.innerHTML += `

                <tr>

                    <td class="px-4 py-3 text-sm font-medium">
                        ${item.questionNumber}
                    </td>

                    <td class="px-4 py-3 text-sm">
                        ${escapeHtml(
                            item.description || ""
                        )}
                    </td>

                    <td class="px-4 py-3 text-sm">
                        ${escapeHtml(outcome)}
                    </td>

                    <td class="px-4 py-3 text-sm">
                        ${item.maxMarks}
                    </td>

                    <td class="px-4 py-3 text-right">

                        <button
                            type="button"
                            onclick="selectAssessmentItem('${item.id}')"
                            class="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                        >
                            Enter Marks
                        </button>

                    </td>

                </tr>
            `;
        }
    );
}


/* =========================================================
   CREATE ASSESSMENT ITEM
========================================================= */

async function createAssessmentItem(
    event
) {

    event.preventDefault();


    if (!currentAssessmentId) {
        alert("No assessment selected.");
        return;
    }


    if (currentAssessment.isPublished) {

        alert(
            "Published assessments cannot be modified."
        );

        return;
    }


    const questionNumber =
        document.getElementById(
            "assessmentItemQuestionNumber"
        ).value;


    const maxMarks =
        document.getElementById(
            "assessmentItemMaxMarks"
        ).value;


    const description =
        document.getElementById(
            "assessmentItemDescription"
        ).value.trim();


    const learningOutcomeId =
        document.getElementById(
            "assessmentItemLearningOutcome"
        ).value;


    if (
        !questionNumber ||
        !maxMarks ||
        !description
    ) {

        alert(
            "Question number, maximum marks and description are required."
        );

        return;
    }


    const token =
        localStorage.getItem("token");


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/assessments/${currentAssessmentId}/items`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        questionNumber:
                            Number(questionNumber),

                        maxMarks:
                            Number(maxMarks),

                        description,

                        learningOutcomeId:
                            learningOutcomeId ||
                            null
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to create assessment item."
            );
        }


        alert(
            "Assessment item created successfully."
        );


        document
            .getElementById(
                "assessmentItemForm"
            )
            .reset();


        await loadAssessmentWorkspace();


        showAssessmentWorkspaceTab(
            "items"
        );

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Failed to create assessment item."
        );
    }
}


/* =========================================================
   SELECT ASSESSMENT ITEM
========================================================= */

function selectAssessmentItem(
    assessmentItemId
) {

    currentAssessmentItemId =
        assessmentItemId;


    const item =
        currentAssessmentItems.find(
            item =>
                item.id ===
                assessmentItemId
        );


    if (!item) {
        return;
    }


    const panel =
        document.getElementById(
            "assessmentItemResultsPanel"
        );


    const title =
        document.getElementById(
            "selectedAssessmentItemTitle"
        );


    title.textContent =
        `Question ${item.questionNumber}: ${item.description}`;


    panel.classList.remove("hidden");


    renderAssessmentItemLearners(
        item
    );
}


/* =========================================================
   RENDER ITEM LEARNERS
========================================================= */

function renderAssessmentItemLearners(
    item
) {

    const table =
        document.getElementById(
            "assessmentItemLearnersTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    currentAssessmentStudents.forEach(
        enrollment => {

            const student =
                enrollment.student;


            const itemResult =
                item.results?.find(
                    result =>
                        result.studentId ===
                        student.id
                );


            const marks =
                itemResult?.marks ?? "";


            const performance =
                itemResult?.performanceLevel ??
                "";


            const disabled =
                currentAssessment.isPublished
                    ? "disabled"
                    : "";


            table.innerHTML += `

                <tr>

                    <td class="px-4 py-3 text-sm">
                        ${escapeHtml(
                            student.admissionNumber
                        )}
                    </td>


                    <td class="px-4 py-3 text-sm font-medium">
                        ${escapeHtml(
                            getStudentFullName(student)
                        )}
                    </td>


                    <td class="px-4 py-3">

                        <input
                            id="itemMarks-${student.id}"
                            type="number"
                            min="0"
                            max="${item.maxMarks}"
                            step="0.01"
                            value="${marks}"
                            ${disabled}
                            class="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />

                    </td>


                    <td class="px-4 py-3">

                        <select
                            id="itemPerformance-${student.id}"
                            ${disabled}
                            class="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >

                            <option value="">
                                Select
                            </option>

                            <option value="EE"
                                ${performance === "EE" ? "selected" : ""}>
                                EE
                            </option>

                            <option value="ME"
                                ${performance === "ME" ? "selected" : ""}>
                                ME
                            </option>

                            <option value="AE"
                                ${performance === "AE" ? "selected" : ""}>
                                AE
                            </option>

                            <option value="BE"
                                ${performance === "BE" ? "selected" : ""}>
                                BE
                            </option>

                        </select>

                    </td>


                    <td class="px-4 py-3 text-right">

                        ${
                            currentAssessment.isPublished
                                ? `
                                    <span class="text-xs text-green-600">
                                        Published
                                    </span>
                                  `
                                : `
                                    <button
                                        type="button"
                                        onclick="saveAssessmentItemResult('${item.id}', '${student.id}')"
                                        class="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm"
                                    >
                                        Save
                                    </button>
                                  `
                        }

                    </td>

                </tr>
            `;
        }
    );
}


/* =========================================================
   SAVE ITEM RESULT
========================================================= */

async function saveAssessmentItemResult(
    assessmentItemId,
    studentId
) {

    if (
        !assessmentItemId ||
        !studentId
    ) {
        return;
    }


    const item =
        currentAssessmentItems.find(
            item =>
                item.id ===
                assessmentItemId
        );


    if (!item) {
        return;
    }


    const marksInput =
        document.getElementById(
            `itemMarks-${studentId}`
        );


    const performanceInput =
        document.getElementById(
            `itemPerformance-${studentId}`
        );


    const marks =
        Number(marksInput.value);


    if (
        Number.isNaN(marks) ||
        marks < 0 ||
        marks > Number(item.maxMarks)
    ) {

        alert(
            `Marks must be between 0 and ${item.maxMarks}.`
        );

        return;
    }


    const token =
        localStorage.getItem("token");


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/assessments/items/${assessmentItemId}/results`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        studentId,

                        marks,

                        performanceLevel:
                            performanceInput?.value ||
                            null,

                        comment: null
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to save item result."
            );
        }


        alert(
            "Item result saved successfully."
        );


        await loadAssessmentWorkspace();


        const updatedItem =
            currentAssessmentItems.find(
                item =>
                    item.id ===
                    assessmentItemId
            );


        if (updatedItem) {

            selectAssessmentItem(
                assessmentItemId
            );
        }

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Failed to save item result."
        );
    }
}


/* =========================================================
   WORKSPACE TABS
========================================================= */

function showAssessmentWorkspaceTab(
    tab
) {

    const overallPanel =
        document.getElementById(
            "overallResultsPanel"
        );

    const itemsPanel =
        document.getElementById(
            "assessmentItemsPanel"
        );

    const reviewPanel =
        document.getElementById(
            "assessmentReviewPanel"
        );


    const overallTab =
        document.getElementById(
            "overallResultsTab"
        );

    const itemsTab =
        document.getElementById(
            "assessmentItemsTab"
        );

    const reviewTab =
        document.getElementById(
            "assessmentReviewTab"
        );


    overallPanel.classList.add("hidden");
    itemsPanel.classList.add("hidden");
    reviewPanel.classList.add("hidden");


    [overallTab, itemsTab, reviewTab]
        .forEach(button => {

            button.classList.remove(
                "border-blue-600",
                "text-blue-600",
                "font-semibold"
            );

            button.classList.add(
                "text-gray-500"
            );
        });


    if (tab === "overall") {

        overallPanel.classList.remove(
            "hidden"
        );

        activateAssessmentTab(
            overallTab
        );

    }


    if (tab === "items") {

        itemsPanel.classList.remove(
            "hidden"
        );

        activateAssessmentTab(
            itemsTab
        );

    }


    if (tab === "review") {

        reviewPanel.classList.remove(
            "hidden"
        );

        activateAssessmentTab(
            reviewTab
        );

        updateAssessmentReview();
    }
}


function activateAssessmentTab(
    button
) {

    button.classList.remove(
        "text-gray-500"
    );

    button.classList.add(
        "border-blue-600",
        "text-blue-600",
        "font-semibold"
    );
}


/* =========================================================
   REVIEW
========================================================= */

function updateAssessmentReview() {

    const learnerCount =
        currentAssessmentStudents.length;


    const resultCount =
        currentAssessmentResults.length;


    const itemCount =
        currentAssessmentItems.length;


    document.getElementById(
        "reviewLearnerCount"
    ).textContent =
        learnerCount;


    document.getElementById(
        "reviewResultCount"
    ).textContent =
        resultCount;


    document.getElementById(
        "reviewItemCount"
    ).textContent =
        itemCount;


    document.getElementById(
        "reviewStatus"
    ).textContent =
        currentAssessment?.isPublished
            ? "Published"
            : "Draft";
}


/* =========================================================
   PUBLISH ASSESSMENT
========================================================= */

async function publishCurrentAssessment() {

    if (!currentAssessmentId) {
        alert("No assessment selected.");
        return;
    }


    if (currentAssessment.isPublished) {

        alert(
            "This assessment is already published."
        );

        return;
    }


    const confirmed =
        confirm(
            "Publish this assessment? Once published, it cannot be modified."
        );


    if (!confirmed) {
        return;
    }


    const token =
        localStorage.getItem("token");


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/assessments/${currentAssessmentId}/publish`,
                {
                    method: "PUT",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to publish assessment."
            );
        }


        alert(
            "Assessment published successfully."
        );


        await loadAssessmentWorkspace();

        showAssessmentWorkspaceTab(
            "review"
        );

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Failed to publish assessment."
        );
    }
}


/* =========================================================
   REPORT CARD CONTROL
========================================================= */

async function updateReportCardInclusion(
    includeInReportCard
) {

    if (!currentAssessmentId) {
        return;
    }


    if (!currentAssessment.isPublished) {

        alert(
            "Publish the assessment before changing report-card inclusion."
        );

        return;
    }


    const token =
        localStorage.getItem("token");


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/assessments/${currentAssessmentId}/report-card`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        includeInReportCard
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update report-card setting."
            );
        }


        currentAssessment =
            data.assessment ||
            currentAssessment;


        renderAssessmentWorkspace();

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Failed to update report-card setting."
        );

        updateReportCardControl();
    }
}


/* =========================================================
   UPDATE PUBLISH CONTROLS
========================================================= */

function updatePublishControls() {

    const publishBox =
        document.getElementById(
            "publishAssessmentBox"
        );


    if (!publishBox) {
        return;
    }


    if (currentAssessment?.isPublished) {

        publishBox.classList.add(
            "hidden"
        );

    } else {

        publishBox.classList.remove(
            "hidden"
        );
    }
}


/* =========================================================
   UPDATE REPORT CARD CONTROL
========================================================= */

function updateReportCardControl() {

    const checkbox =
        document.getElementById(
            "workspaceReportCardCheckbox"
        );


    if (!checkbox) {
        return;
    }


    checkbox.checked =
        Boolean(
            currentAssessment?.includeInReportCard
        );


    checkbox.disabled =
        !currentAssessment?.isPublished;
}


/* =========================================================
   CLOSE WORKSPACE
========================================================= */

function closeAssessmentWorkspace() {

    currentAssessmentId = null;
    currentAssessment = null;
    currentAssessmentStudents = [];
    currentAssessmentItems = [];
    currentAssessmentResults = [];
    currentAssessmentItemResults = [];
    currentAssessmentItemId = null;


    document
        .getElementById(
            "assessmentWorkspace"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "assessmentListPanel"
        )
        .classList.remove("hidden");


    document
        .getElementById(
            "assessmentCreatePanel"
        )
        .classList.remove("hidden");


    loadMyAssessments();
}


/* =========================================================
   LOADING STATE
========================================================= */

function showAssessmentWorkspaceLoading() {

    document.getElementById(
        "workspaceAssessmentName"
    ).textContent =
        "Loading assessment...";


    document.getElementById(
        "workspaceAssessmentDescription"
    ).textContent =
        "Please wait while the assessment is loaded.";
}


/* =========================================================
   HELPERS
========================================================= */

function getStudentFullName(student) {

    return [
        student.firstName,
        student.middleName,
        student.lastName
    ]
        .filter(Boolean)
        .join(" ");
}


function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/*
|--------------------------------------------------------------------------
| INITIALIZE ASSESSMENT FORM
|--------------------------------------------------------------------------
*/

function initializeAssessmentForm() {

  const form =
    document.getElementById(
      "assessmentForm"
    );


  if (!form) {
    return;
  }


  form.addEventListener(
    "submit",
    async (event) => {

      await createTeacherAssessment(
        event
      );

    }
  );
}




/*
|--------------------------------------------------------------------------
| GET MY PROFILE
|--------------------------------------------------------------------------
|
| GET /api/teachers/me
|
|--------------------------------------------------------------------------
*/

async function loadMyProfile() {
  try {
    const response =
      await apiRequest(
        "/teachers/me"
      );

    const profile =
      extractData(response);

    if (!profile) {
      throw new Error(
        "Teacher profile data was not returned."
      );
    }

    renderMyProfile(profile);

    return profile;
  } catch (error) {
    console.error(
      "Unable to load teacher profile:",
      error
    );

    showError(
      error.message ||
        "Unable to load teacher profile."
    );

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| RENDER MY PROFILE
|--------------------------------------------------------------------------
*/

function renderMyProfile(profile) {
  const teacher =
    profile.teacher ||
    profile;

  const user =
    profile.profile ||
    teacher.user ||
    teacher;


  const firstName =
    user.firstName || "";

  const middleName =
    user.middleName || "";

  const lastName =
    user.lastName || "";

  const email =
    user.email || "";

  const phone =
    user.phone || "";

  const employeeNumber =
    profile.employeeNumber ||
    teacher.employeeNumber ||
    "";

  const status =
    user.status ||
    teacher.status ||
    "";


  /*
  |--------------------------------------------------------------------------
  | Display values
  |--------------------------------------------------------------------------
  */

  setText(
    "teacherFullName",
    [
      firstName,
      middleName,
      lastName,
    ]
      .filter(Boolean)
      .join(" ") || "-"
  );

  setText(
    "teacherEmployeeNumber",
    employeeNumber
  );

  setText(
    "teacherEmail",
    email
  );

  setText(
    "teacherPhone",
    phone
  );

  setText(
    "teacherStatus",
    status
  );


  /*
  |--------------------------------------------------------------------------
  | Profile form
  |--------------------------------------------------------------------------
  */

  setInputValue(
    "profileFirstName",
    firstName
  );

  setInputValue(
    "profileMiddleName",
    middleName
  );

  setInputValue(
    "profileLastName",
    lastName
  );

  setInputValue(
    "profilePhone",
    phone
  );

  setInputValue(
    "profileEmail",
    email
  );

  setInputValue(
    "profileEmployeeNumber",
    employeeNumber
  );

  setInputValue(
    "profileStatus",
    status
  );
}


/*
|--------------------------------------------------------------------------
| INPUT VALUE HELPER
|--------------------------------------------------------------------------
*/

function setInputValue(
  elementId,
  value
) {
  const element =
    document.getElementById(
      elementId
    );

  if (!element) {
    return;
  }

  element.value =
    value ?? "";
}


/*
|--------------------------------------------------------------------------
| UPDATE MY PROFILE
|--------------------------------------------------------------------------
|
| PATCH /api/teachers/me
|
|--------------------------------------------------------------------------
*/

async function updateMyProfile() {
  try {
    const firstName =
      document
        .getElementById(
          "profileFirstName"
        )
        ?.value
        .trim();

    const middleName =
      document
        .getElementById(
          "profileMiddleName"
        )
        ?.value
        .trim();

    const lastName =
      document
        .getElementById(
          "profileLastName"
        )
        ?.value
        .trim();

    const phone =
      document
        .getElementById(
          "profilePhone"
        )
        ?.value
        .trim();


    /*
    |--------------------------------------------------------------------------
    | Basic frontend validation
    |--------------------------------------------------------------------------
    */

    if (!firstName) {
      throw new Error(
        "First name is required."
      );
    }

    if (!lastName) {
      throw new Error(
        "Last name is required."
      );
    }


    /*
    |--------------------------------------------------------------------------
    | Request body
    |--------------------------------------------------------------------------
    |
    | Only send fields that the backend profile service allows.
    |
    */

    const data = {
      firstName,
      middleName: middleName || null,
      lastName,
      phone: phone || null,
    };


    const response =
      await apiRequest(
        "/teachers/me",
        {
          method: "PATCH",

          body:
            JSON.stringify(data),
        }
      );


    const updatedProfile =
      extractData(response);


    /*
    |--------------------------------------------------------------------------
    | Refresh profile display
    |--------------------------------------------------------------------------
    */

    if (updatedProfile) {
      renderMyProfile(
        updatedProfile
      );
    }


    showSuccess(
      "Profile updated successfully."
    );


    return updatedProfile;

  } catch (error) {
    console.error(
      "Unable to update teacher profile:",
      error
    );

    showError(
      error.message ||
        "Unable to update teacher profile."
    );

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| PROFILE FORM SUBMISSION
|--------------------------------------------------------------------------
*/

function initializeProfileForm() {
  const form =
    document.getElementById(
      "profileForm"
    );

  if (!form) {
    return;
  }


  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      await updateMyProfile();
    }
  );
}


const assessmentItemForm =
    document.getElementById(
        "assessmentItemForm"
    );

if (assessmentItemForm) {

    assessmentItemForm.addEventListener(
        "submit",
        createAssessmentItem
    );
}

const workspaceReportCardCheckbox =
    document.getElementById(
        "workspaceReportCardCheckbox"
    );

if (workspaceReportCardCheckbox) {

    workspaceReportCardCheckbox.addEventListener(
        "change",
        function () {

            updateReportCardInclusion(
                this.checked
            );

        }
    );
}


/* ==========================================================================
   TEACHER ATTENDANCE
   ========================================================================== */

let attendanceAcademicYears = [];
let attendanceTerms = [];
let attendanceGrades = [];
let attendanceStreams = [];
let attendanceLearners = [];


/* ==========================================================================
   LOAD ACADEMIC YEARS
   ========================================================================== */

async function loadAttendanceAcademicYears() {
  try {
    const response = await apiRequest(
      "/academic-admin/academic-years"
    );

    const data = extractData(response);

    attendanceAcademicYears = Array.isArray(data)
      ? data
      : data?.academicYears || [];

    populateAttendanceAcademicYears();

  } catch (error) {
    console.error(
      "Failed to load attendance academic years:",
      error
    );

    showError(
      "Failed to load academic years."
    );
  }
}


/* ==========================================================================
   POPULATE ACADEMIC YEARS
   ========================================================================== */

function populateAttendanceAcademicYears() {
  const select = document.getElementById(
    "attendanceAcademicYear"
  );

  if (!select) {
    return;
  }

  select.innerHTML = `
    <option value="">
      Select academic year
    </option>
  `;

  attendanceAcademicYears.forEach(year => {
    const option = document.createElement("option");

    option.value = year.id;

    option.textContent =
      year.name ||
      year.year ||
      year.label ||
      year.academicYear ||
      year.id;

    select.appendChild(option);
  });
}


/* ==========================================================================
   LOAD TERMS
   ========================================================================== */

async function loadAttendanceTerms(academicYearId) {
  const termSelect = document.getElementById(
    "attendanceTerm"
  );

  if (!termSelect) {
    return;
  }

  termSelect.innerHTML = `
    <option value="">
      Select term
    </option>
  `;

  termSelect.disabled = true;

  if (!academicYearId) {
    clearAttendanceLearners();
    return;
  }

  try {
    const response = await apiRequest(
      `/academic-admin/terms?academicYearId=${encodeURIComponent(
        academicYearId
      )}`
    );

    const data = extractData(response);

    attendanceTerms = Array.isArray(data)
      ? data
      : data?.terms || [];

    attendanceTerms.forEach(term => {
      const option = document.createElement("option");

      option.value = term.id;

      option.textContent =
        term.name ||
        term.termName ||
        term.label ||
        term.id;

      termSelect.appendChild(option);
    });

    termSelect.disabled = false;

  } catch (error) {
    console.error(
      "Failed to load attendance terms:",
      error
    );

    showError(
      "Failed to load terms."
    );
  }

  clearAttendanceLearners();
}


/* ==========================================================================
   LOAD GRADES
   ========================================================================== */

async function loadAttendanceGrades() {
  try {
    const response = await apiRequest(
      "/academic-admin/grades"
    );

    const data = extractData(response);

    attendanceGrades = Array.isArray(data)
      ? data
      : data?.grades || [];

    populateAttendanceGrades();

  } catch (error) {
    console.error(
      "Failed to load attendance grades:",
      error
    );

    showError(
      "Failed to load grades."
    );
  }
}


/* ==========================================================================
   POPULATE GRADES
   ========================================================================== */

function populateAttendanceGrades() {
  const select = document.getElementById(
    "attendanceGrade"
  );

  if (!select) {
    return;
  }

  select.innerHTML = `
    <option value="">
      Select grade
    </option>
  `;

  attendanceGrades.forEach(grade => {
    const option = document.createElement("option");

    option.value = grade.id;

    option.textContent =
      grade.name ||
      grade.gradeName ||
      grade.label ||
      grade.code ||
      grade.id;

    select.appendChild(option);
  });
}


/* ==========================================================================
   LOAD STREAMS
   ========================================================================== */

async function loadAttendanceStreams(gradeId) {
  const streamSelect = document.getElementById(
    "attendanceStream"
  );

  if (!streamSelect) {
    return;
  }

  streamSelect.innerHTML = `
    <option value="">
      Select stream
    </option>
  `;

  streamSelect.disabled = true;

  if (!gradeId) {
    clearAttendanceLearners();
    return;
  }

  try {
    const response = await apiRequest(
      `/academic-admin/streams?gradeId=${encodeURIComponent(
        gradeId
      )}`
    );

    const data = extractData(response);

    attendanceStreams = Array.isArray(data)
      ? data
      : data?.streams || [];

    attendanceStreams.forEach(stream => {
      const option = document.createElement("option");

      option.value = stream.id;

      option.textContent =
        stream.name ||
        stream.streamName ||
        stream.label ||
        stream.code ||
        stream.id;

      streamSelect.appendChild(option);
    });

    streamSelect.disabled = false;

  } catch (error) {
    console.error(
      "Failed to load attendance streams:",
      error
    );

    showError(
      "Failed to load streams."
    );
  }

  clearAttendanceLearners();
}


/* ==========================================================================
   LOAD LEARNERS
   ========================================================================== */

async function loadAttendanceLearners() {
  const academicYearId =
    document.getElementById(
      "attendanceAcademicYear"
    )?.value;

  const termId =
    document.getElementById(
      "attendanceTerm"
    )?.value;

  const gradeId =
    document.getElementById(
      "attendanceGrade"
    )?.value;

  const streamId =
    document.getElementById(
      "attendanceStream"
    )?.value;

  const date =
    document.getElementById(
      "attendanceDate"
    )?.value;


  /*
   * Make sure all required selections
   * have been made.
   */

  if (
    !academicYearId ||
    !termId ||
    !gradeId ||
    !streamId
  ) {
    showError(
      "Please select academic year, term, grade and stream."
    );

    return;
  }


  /*
   * Date is also required for attendance.
   */

  if (!date) {
    showError(
      "Please select an attendance date."
    );

    return;
  }


  /*
   * Show loading state.
   */

  const table =
    document.getElementById(
      "attendanceLearnersTable"
    );

  if (!table) {
    return;
  }

  table.innerHTML = `
    <tr>
      <td
        colspan="4"
        class="p-8 text-center text-slate-500"
      >
        Loading learners...
      </td>
    </tr>
  `;


  try {

    /*
     * This endpoint should return learners
     * enrolled in the selected:
     *
     * Academic Year
     * Term
     * Grade
     * Stream
     */

    const response = await apiRequest(
  `/attendance/teacher/learners?academicYearId=${encodeURIComponent(
    academicYearId
  )}&termId=${encodeURIComponent(
    termId
  )}&gradeId=${encodeURIComponent(
    gradeId
  )}&streamId=${encodeURIComponent(
    streamId
  )}`
);

    const data = extractData(response);


    attendanceLearners = Array.isArray(data)
      ? data
      : data?.learners || [];


    renderAttendanceLearners();

  } catch (error) {

    console.error(
      "Failed to load attendance learners:",
      error
    );

    table.innerHTML = `
      <tr>
        <td
          colspan="4"
          class="p-8 text-center text-red-500"
        >
          Failed to load learners.
        </td>
      </tr>
    `;

    showError(
      error.message ||
      "Failed to load learners."
    );
  }
}


/* ==========================================================================
   RENDER LEARNERS INTO EXISTING TABLE
   ========================================================================== */

function renderAttendanceLearners() {
  const table =
    document.getElementById(
      "attendanceLearnersTable"
    );

  if (!table) {
    return;
  }


  if (!attendanceLearners.length) {

    table.innerHTML = `
      <tr>
        <td
          colspan="4"
          class="p-8 text-center text-slate-500"
        >
          No learners found in the selected stream.
        </td>
      </tr>
    `;

    return;
  }


  table.innerHTML =
    attendanceLearners
      .map((learner, index) => {

        /*
         * Support both:
         *
         * {
         *   student: {...}
         * }
         *
         * and
         *
         * {
         *   firstName: "...",
         *   ...
         * }
         */

        const student =
          learner.student || learner;


        const fullName = [
          student.firstName,
          student.middleName,
          student.lastName
        ]
          .filter(Boolean)
          .join(" ");


        return `
          <tr
            data-student-id="${learner.student.id}"
            class="border-t border-slate-200"
          >

            <td class="p-4">
              ${escapeHtml(
                student.admissionNumber || ""
              )}

              <input
                type="hidden"
                class="attendance-student-id"
                value="${student.id || ""}"
              />
            </td>


            <td class="p-4 font-medium">
              ${escapeHtml(fullName)}
            </td>


            <td class="p-4">

              <select
                class="attendance-status
                       w-full border border-slate-300
                       rounded-lg px-3 py-2"
                data-student-id="${student.id || ""}"
              >

                <option value="PRESENT">
                  Present
                </option>

                <option value="ABSENT">
                  Absent
                </option>

                <option value="LATE">
                  Late
                </option>

                <option value="EXCUSED">
                  Excused
                </option>

              </select>

            </td>


            <td class="p-4">

              <input
                type="text"
                class="attendance-remarks
                       w-full border border-slate-300
                       rounded-lg px-3 py-2"
                data-student-id="${student.id || ""}"
                placeholder="Optional remarks"
              />

            </td>

          </tr>
        `;
      })
      .join("");
}


async function saveAttendance() {
  try {
    const academicYearId =
      document.getElementById(
        "attendanceAcademicYear"
      )?.value;

    const termId =
      document.getElementById(
        "attendanceTerm"
      )?.value;

    const gradeId =
      document.getElementById(
        "attendanceGrade"
      )?.value;

    const streamId =
      document.getElementById(
        "attendanceStream"
      )?.value;

    const date =
      document.getElementById(
        "attendanceDate"
      )?.value;

    const type =
      document.getElementById(
        "attendanceType"
      )?.value;

    /*
    |--------------------------------------------------------------------------
    | Validate selections
    |--------------------------------------------------------------------------
    */

    if (!academicYearId) {
      showError(
        "Please select an academic year."
      );
      return;
    }

    if (!termId) {
      showError(
        "Please select a term."
      );
      return;
    }

    if (!gradeId) {
      showError(
        "Please select a grade."
      );
      return;
    }

    if (!streamId) {
      showError(
        "Please select a stream."
      );
      return;
    }

    if (!date) {
      showError(
        "Please select an attendance date."
      );
      return;
    }

    if (!type) {
      showError(
        "Please select an attendance type."
      );
      return;
    }

    if (
      !attendanceLearners ||
      attendanceLearners.length === 0
    ) {
      showError(
        "Please load learners before saving attendance."
      );
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Find attendance rows
    |--------------------------------------------------------------------------
    */

    const rows =
      document.querySelectorAll(
        "#attendanceLearnersTable tr[data-student-id]"
      );

    if (rows.length === 0) {
      showError(
        "No learners are loaded."
      );
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Save each learner
    |--------------------------------------------------------------------------
    */

    let savedCount = 0;

    for (const row of rows) {
      const studentId =
        row.dataset.studentId;

      const statusInput =
        row.querySelector(
          ".attendance-status"
        );

      const remarksInput =
        row.querySelector(
          ".attendance-remarks"
        );

      const status =
        statusInput?.value;

      const remarks =
        remarksInput?.value?.trim() ||
        null;

      if (!status) {
        showError(
          "Please select attendance status for every learner."
        );
        return;
      }

      await apiRequest(
        "/attendance",
        {
          method: "POST",

          body: JSON.stringify({
            studentId,
            academicYearId,
            termId,
            date,
            type,
            status,
            remarks,
          }),
        }
      );

      savedCount++;
    }

    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    showAttendanceSuccess(
      `Attendance saved successfully for ${savedCount} learner${
        savedCount === 1
          ? ""
          : "s"
      }.`
    );

    /*
    |--------------------------------------------------------------------------
    | Refresh history
    |--------------------------------------------------------------------------
    */

    await loadTeacherAttendanceHistory();

  } catch (error) {
    console.error(
      "Failed to save attendance:",
      error
    );

    showError(
      error.message ||
        "Failed to save attendance."
    );
  }
}



function showAttendanceSuccess(message) {
  let container = document.getElementById(
    "attendanceSuccessMessage"
  );

  if (!container) {
    container = document.createElement("div");

    container.id =
      "attendanceSuccessMessage";

    container.className =
      "mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700";

    const attendanceSection =
      document.getElementById(
        "attendanceLearnersTable"
      )?.closest("section");

    if (attendanceSection) {
      attendanceSection.prepend(container);
    } else {
      document.body.prepend(container);
    }
  }

  container.textContent = message;

  container.classList.remove("hidden");

  setTimeout(() => {
    container.classList.add("hidden");
  }, 4000);
}



async function loadTeacherAttendanceHistory() {
  try {
    const tableBody = document.getElementById(
      "teacherAttendanceHistoryTable"
    );

    if (!tableBody) {
      console.error(
        "teacherAttendanceHistoryTable was not found."
      );
      return;
    }

    tableBody.innerHTML = `
      <tr>
        <td
          colspan="7"
          class="px-4 py-6 text-center text-gray-500"
        >
          Loading attendance history...
        </td>
      </tr>
    `;

    const academicYearId =
      document.getElementById(
        "attendanceAcademicYear"
      )?.value;

    const termId =
      document.getElementById(
        "attendanceTerm"
      )?.value;

    const gradeId =
      document.getElementById(
        "attendanceGrade"
      )?.value;

    const streamId =
      document.getElementById(
        "attendanceStream"
      )?.value;

    const params = new URLSearchParams();

    if (academicYearId) {
      params.append(
        "academicYearId",
        academicYearId
      );
    }

    if (termId) {
      params.append(
        "termId",
        termId
      );
    }

    if (gradeId) {
      params.append(
        "gradeId",
        gradeId
      );
    }

    if (streamId) {
      params.append(
        "streamId",
        streamId
      );
    }

    const query = params.toString();

    const response = await apiRequest(
      `/attendance/teacher/history${
        query ? `?${query}` : ""
      }`
    );

    /*
    |--------------------------------------------------------------------------
    | Backend returns:
    |
    | {
    |   message: "...",
    |   history: [...]
    | }
    |--------------------------------------------------------------------------
    */

    const history = Array.isArray(response)
      ? response
      : Array.isArray(response?.history)
        ? response.history
        : [];

    if (history.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td
            colspan="7"
            class="px-4 py-6 text-center text-gray-500"
          >
            No attendance history found.
          </td>
        </tr>
      `;

      return;
    }

    tableBody.innerHTML = history
      .map((record, index) => {
        const student =
          record.student || {};

        const studentName = [
          student.firstName,
          student.middleName,
          student.lastName,
        ]
          .filter(Boolean)
          .join(" ");

        const date = record.date
          ? new Date(
              record.date
            ).toLocaleDateString()
          : "-";

        return `
          <tr class="border-b hover:bg-gray-50">

            <td class="px-4 py-3">
              ${index + 1}
            </td>

            <td class="px-4 py-3">
              ${studentName || "-"}
            </td>

            <td class="px-4 py-3">
              ${date}
            </td>

            <td class="px-4 py-3">
              ${record.type || "-"}
            </td>

            <td class="px-4 py-3">
              ${record.status || "-"}
            </td>

            <td class="px-4 py-3">
              ${record.remarks || "-"}
            </td>

            <td class="px-4 py-3">
              ${record.term?.name || "-"}
            </td>

          </tr>
        `;
      })
      .join("");

  } catch (error) {
    console.error(
      "Failed to load attendance history:",
      error
    );

    const tableBody =
      document.getElementById(
        "teacherAttendanceHistoryTable"
      );

    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td
            colspan="7"
            class="px-4 py-6 text-center text-red-500"
          >
            Failed to load attendance history.
          </td>
        </tr>
      `;
    }

    showError(
      error.message ||
        "Failed to load attendance history."
    );
  }
}


/* ==========================================================================
   CLEAR LEARNER TABLE
   ========================================================================== */

function clearAttendanceLearners() {
  attendanceLearners = [];

  const table =
    document.getElementById(
      "attendanceLearnersTable"
    );

  if (!table) {
    return;
  }

  table.innerHTML = `
    <tr>
      <td
        colspan="4"
        class="p-8 text-center text-slate-500"
      >
        Select academic year, term, grade and stream,
        then load learners.
      </td>
    </tr>
  `;
}


/* ==========================================================================
   ATTENDANCE DROPDOWN CHANGE HANDLERS
   ========================================================================== */

async function handleAttendanceAcademicYearChange() {
  const academicYearId =
    document.getElementById(
      "attendanceAcademicYear"
    )?.value;

  await loadAttendanceTerms(
    academicYearId
  );
}


async function handleAttendanceGradeChange() {
  const gradeId =
    document.getElementById(
      "attendanceGrade"
    )?.value;

  await loadAttendanceStreams(
    gradeId
  );
}


/* ==========================================================================
   INITIALIZE ATTENDANCE DROPDOWNS
   ========================================================================== */

async function initializeAttendanceDropdowns() {

  await Promise.all([
    loadAttendanceAcademicYears(),
    loadAttendanceGrades()
  ]);


  const termSelect =
    document.getElementById(
      "attendanceTerm"
    );

  const streamSelect =
    document.getElementById(
      "attendanceStream"
    );


  if (termSelect) {

    termSelect.innerHTML = `
      <option value="">
        Select term
      </option>
    `;

    termSelect.disabled = true;
  }


  if (streamSelect) {

    streamSelect.innerHTML = `
      <option value="">
        Select stream
      </option>
    `;

    streamSelect.disabled = true;
  }
}


/* ==========================================================================
   ATTENDANCE EVENT LISTENERS
   ========================================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const academicYearSelect =
      document.getElementById(
        "attendanceAcademicYear"
      );

    const gradeSelect =
      document.getElementById(
        "attendanceGrade"
      );


    if (academicYearSelect) {

      academicYearSelect.addEventListener(
        "change",
        handleAttendanceAcademicYearChange
      );
    }


    if (gradeSelect) {

      gradeSelect.addEventListener(
        "change",
        handleAttendanceGradeChange
      );
    }


    initializeAttendanceDropdowns();

  }
);



/*
|--------------------------------------------------------------------------
| TEACHER PORTAL INITIALIZATION
|--------------------------------------------------------------------------
*/

async function initializeTeacherPortal() {
  const token =
    getAuthToken();

  if (!token) {
    window.location.href =
      "login.html";

    return;
  }


  try {
    await Promise.all([
      loadTeacherDashboard(),
      loadMyProfile(),
      loadMyAssessments(),
    ]);

    initializeProfileForm();
    
    initializeAssessmentForm();

  } catch (error) {
    console.error(
      "Teacher portal initialization failed:",
      error
    );
  }
}


/*
|--------------------------------------------------------------------------
| START TEACHER PORTAL
|--------------------------------------------------------------------------
*/

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initializeTeacherPortal();
  }
);


document.addEventListener("DOMContentLoaded", () => {

  const academicYearSelect =
    document.getElementById(
      "assessmentAcademicYear"
    );

  const gradeSelect =
    document.getElementById(
      "assessmentGrade"
    );

  if (academicYearSelect) {
    academicYearSelect.addEventListener(
      "change",
      handleTeacherAssessmentAcademicYearChange
    );
  }

  if (gradeSelect) {
    gradeSelect.addEventListener(
      "change",
      handleTeacherAssessmentGradeChange
    );
  }

  initializeTeacherAssessmentDropdowns();

});

