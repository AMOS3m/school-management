
/*
|--------------------------------------------------------------------------
| HEAD OF INSTITUTION FRONTEND
|--------------------------------------------------------------------------
*/

const API_BASE_URL = "http://localhost:5000/api";


/*
|--------------------------------------------------------------------------
| API REQUEST
|--------------------------------------------------------------------------
*/

async function apiRequest(endpoint, options = {}) {

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response =
    await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

  let result = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {

    const message =
      result?.message ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return result;
}


/*
|--------------------------------------------------------------------------
| EXTRACT DATA
|--------------------------------------------------------------------------
*/

function extractData(response) {

  if (
    response &&
    typeof response === "object" &&
    Object.prototype.hasOwnProperty.call(response, "data")
  ) {
    return response.data;
  }

  return response;
}


/*
|--------------------------------------------------------------------------
| SHOW ERROR
|--------------------------------------------------------------------------
*/

function showError(message) {

  const element =
    document.getElementById("errorMessage");

  if (!element) return;

  element.textContent = message;

  element.classList.remove("hidden");

  setTimeout(() => {
    element.classList.add("hidden");
  }, 5000);
}


/*
|--------------------------------------------------------------------------
| SIDEBAR
|--------------------------------------------------------------------------
*/

function openSidebar() {

  const sidebar =
    document.getElementById("sidebar");

  const overlay =
    document.getElementById("sidebarOverlay");

  sidebar.classList.remove("-translate-x-full");

  overlay.classList.remove("hidden");

  requestAnimationFrame(() => {
    overlay.classList.remove("opacity-0");
  });
}


function closeSidebar() {

  const sidebar =
    document.getElementById("sidebar");

  const overlay =
    document.getElementById("sidebarOverlay");

  sidebar.classList.add("-translate-x-full");

  overlay.classList.add("opacity-0");

  setTimeout(() => {
    overlay.classList.add("hidden");
  }, 250);
}


/*
|--------------------------------------------------------------------------
| SECTION NAVIGATION
|--------------------------------------------------------------------------
*/

function showSection(section) {

  const sections = [
    "dashboard",
    "admins",
    "teachers",
    "students",
    "parents",
    "classes",
    "reports",
    "attendance",
    "fees",
    "settings",
    
  ];

  sections.forEach((name) => {

    const element =
      document.getElementById(
        `section-${name}`
      );

    if (!element) return;

    element.classList.toggle(
      "hidden",
      name !== section
    );
  });


  document.querySelectorAll(".nav-item")
    .forEach((item) => {

      const active =
        item.dataset.section === section;

      item.classList.toggle(
        "bg-slate-800",
        active
      );

      item.classList.toggle(
        "text-white",
        active
      );

      item.classList.toggle(
        "text-slate-300",
        !active
      );
    });


  closeSidebar();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}


/*
|--------------------------------------------------------------------------
| LOAD HEAD DASHBOARD
|--------------------------------------------------------------------------
*/

async function loadDashboard() {

  try {

    const response =
      await apiRequest(
        "/head-institution/dashboard"
      );

    const dashboard =
      extractData(response);

    renderFeesOverview(
  dashboard.fees,
  dashboard.academic?.currentTerm
);

    /*
    |--------------------------------------------------------------------------
    | ACADEMIC
    |--------------------------------------------------------------------------
    */

    const academic =
      dashboard.academic || {};

    const academicYear =
      academic.academicYear;

    const currentTerm =
      academic.currentTerm;


    document.getElementById(
      "academicYear"
    ).textContent =
      academicYear?.name ||
      "No academic year";


    document.getElementById(
      "currentTerm"
    ).textContent =
      currentTerm
        ? (
            currentTerm.name ||
            `Term ${currentTerm.termNumber}`
          )
        : "No current term";


    /*
    |--------------------------------------------------------------------------
    | SCHOOL
    |--------------------------------------------------------------------------
    */

    const school =
      dashboard.school || {};


    setText(
      "totalStudents",
      school.totalStudents ?? 0
    );

    setText(
      "totalTeachers",
      school.totalTeachers ?? 0
    );

    setText(
      "totalGrades",
      school.totalGrades ?? 0
    );

    setText(
      "totalStreams",
      school.totalStreams ?? 0
    );

    setText(
      "totalClassTeachers",
      school.totalClassTeacherAssignments ?? 0
    );

    setText(
      "totalTeachingAssignments",
      school.totalTeachingAssignments ?? 0
    );


    /*
    |--------------------------------------------------------------------------
    | MANAGEMENT COUNTS
    |--------------------------------------------------------------------------
    */

    setText(
      "teacherManagementCount",
      school.totalTeachers ?? 0
    );

    setText(
      "studentManagementCount",
      school.totalStudents ?? 0
    );

    setText(
      "gradeManagementCount",
      school.totalGrades ?? 0
    );

    setText(
      "streamManagementCount",
      school.totalStreams ?? 0
    );


    /*
    |--------------------------------------------------------------------------
    | ASSESSMENTS
    |--------------------------------------------------------------------------
    */

    const assessments =
      dashboard.assessments || {};


    setText(
      "assessmentTotal",
      assessments.total ?? 0
    );

    setText(
      "assessmentPublished",
      assessments.published ?? 0
    );

    setText(
      "assessmentIncluded",
      assessments.includedInReportCard ?? 0
    );


    /*
    |--------------------------------------------------------------------------
    | REPORT CARDS
    |--------------------------------------------------------------------------
    */

    const reportCards =
      dashboard.reportCards || {};


    setText(
      "reportTotal",
      reportCards.total ?? 0
    );

    setText(
      "reportDraft",
      reportCards.draft ?? 0
    );

    setText(
      "reportPublished",
      reportCards.published ?? 0
    );


    /*
    |--------------------------------------------------------------------------
    | REPORT CARD MANAGEMENT PAGE
    |--------------------------------------------------------------------------
    */

    setText(
      "reportManagementTotal",
      reportCards.total ?? 0
    );

    setText(
      "reportManagementDraft",
      reportCards.draft ?? 0
    );

    setText(
      "reportManagementPublished",
      reportCards.published ?? 0
    );


    /*
    |--------------------------------------------------------------------------
    | ATTENDANCE
    |--------------------------------------------------------------------------
    */

    const attendance =
      dashboard.attendance || {};


    setText(
      "attendanceTotal",
      attendance.totalRecords ?? 0
    );

    setText(
      "attendancePresent",
      attendance.present ?? 0
    );

    setText(
      "attendanceAbsent",
      attendance.absent ?? 0
    );

    setText(
      "attendanceLate",
      attendance.late ?? 0
    );


    /*
    |--------------------------------------------------------------------------
    | ATTENDANCE PAGE
    |--------------------------------------------------------------------------
    */

    setText(
      "attendancePageTotal",
      attendance.totalRecords ?? 0
    );

    setText(
      "attendancePagePresent",
      attendance.present ?? 0
    );

    setText(
      "attendancePageAbsent",
      attendance.absent ?? 0
    );

    setText(
      "attendancePageLate",
      attendance.late ?? 0
    );


    /*
    |--------------------------------------------------------------------------
    | RECENT ASSESSMENTS
    |--------------------------------------------------------------------------
    */

    renderRecentAssessments(
      dashboard.recentAssessments || []
    );


    /*
    |--------------------------------------------------------------------------
    | RECENT REPORT CARDS
    |--------------------------------------------------------------------------
    */

    renderRecentReportCards(
      dashboard.recentReportCards || []
    );


  } catch (error) {

    console.error(
      "Head dashboard error:",
      error
    );

    showError(
      error.message ||
      "Unable to load Head dashboard."
    );
  }
}


/*
|--------------------------------------------------------------------------
| SET TEXT HELPER
|--------------------------------------------------------------------------
*/

function setText(id, value) {

  const element =
    document.getElementById(id);

  if (!element) return;

  element.textContent = value;
}


/*
|--------------------------------------------------------------------------
| RECENT ASSESSMENTS
|--------------------------------------------------------------------------
*/

function renderRecentAssessments(
  assessments
) {

  const container =
    document.getElementById(
      "recentAssessments"
    );

  if (!container) return;


  if (!assessments.length) {

    container.innerHTML = `
      <div class="p-5 text-sm text-slate-500">
        No recent assessments found.
      </div>
    `;

    return;
  }


  container.innerHTML =
    assessments.map((assessment) => {

      const learningArea =
        assessment.learningArea?.name ||
        "Learning Area";

      const grade =
        assessment.grade?.name ||
        "Grade";

      const stream =
        assessment.stream?.name ||
        "";

      const teacher =
        assessment.teacher?.user;

      const teacherName =
        teacher
          ? `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim()
          : "Teacher";


      return `
        <div class="p-5">

          <div class="flex items-start justify-between gap-4">

            <div>
              <p class="font-semibold text-slate-900">
                ${escapeHtml(learningArea)}
              </p>

              <p class="mt-1 text-xs text-slate-500">
                ${escapeHtml(grade)}
                ${stream ? ` • ${escapeHtml(stream)}` : ""}
              </p>

              <p class="mt-1 text-xs text-slate-400">
                Teacher: ${escapeHtml(teacherName)}
              </p>
            </div>

            <span
              class="rounded-full px-2.5 py-1 text-xs font-medium ${
                assessment.isPublished
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }"
            >
              ${
                assessment.isPublished
                  ? "Published"
                  : "Draft"
              }
            </span>

          </div>

        </div>
      `;

    }).join("");
}


/*
|--------------------------------------------------------------------------
| RECENT REPORT CARDS
|--------------------------------------------------------------------------
*/

function renderRecentReportCards(
  reportCards
) {

  const container =
    document.getElementById(
      "recentReportCards"
    );

  if (!container) return;


  if (!reportCards.length) {

    container.innerHTML = `
      <div class="p-5 text-sm text-slate-500">
        No recent report cards found.
      </div>
    `;

    return;
  }


  container.innerHTML =
    reportCards.map((reportCard) => {

      const student =
        reportCard.student || {};

      const studentName =
        `${student.firstName || ""} ${
          student.middleName || ""
        } ${
          student.lastName || ""
        }`.replace(/\s+/g, " ").trim();


      const term =
        reportCard.term?.name ||
        "Term";


      return `
        <div class="p-5">

          <div class="flex items-center justify-between gap-4">

            <div>

              <p class="font-semibold text-slate-900">
                ${escapeHtml(
                  studentName || "Student"
                )}
              </p>

              <p class="mt-1 text-xs text-slate-500">
                ${escapeHtml(term)}
              </p>

            </div>


            <span
              class="rounded-full px-2.5 py-1 text-xs font-medium ${
                reportCard.status === "PUBLISHED"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }"
            >
              ${escapeHtml(
                reportCard.status || "DRAFT"
              )}
            </span>

          </div>

        </div>
      `;

    }).join("");
}


function formatCurrency(amount) {
  const value = Number(amount || 0);

  return `KSh ${value.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
function renderFeesOverview(fees, currentTerm) {

  if (!fees) {
    console.warn("No fees overview returned by the backend.");
    return;
  }


  const charged =
    Number(fees.totalFeesCharged || 0);

  const collected =
    Number(fees.totalFeesCollected || 0);

  const outstanding =
    Number(fees.outstandingBalance || 0);

  const percentage =
    Number(fees.collectionPercentage || 0);


  /*
  |--------------------------------------------------------------------------
  | MAIN CARDS
  |--------------------------------------------------------------------------
  */

  setText(
    "totalFeesCharged",
    formatCurrency(charged)
  );

  setText(
    "totalFeesCollected",
    formatCurrency(collected)
  );

  setText(
    "outstandingBalance",
    formatCurrency(outstanding)
  );

  setText(
    "collectionPercentage",
    `${percentage.toFixed(2)}%`
  );


  /*
  |--------------------------------------------------------------------------
  | STUDENT ACCOUNT STATUS
  |--------------------------------------------------------------------------
  */

  setText(
    "studentsWithBalance",
    fees.studentsWithBalance || 0
  );

  setText(
    "studentsFullyPaid",
    fees.studentsFullyPaid || 0
  );

  setText(
    "partiallyPaidAccounts",
    fees.partiallyPaidAccounts || 0
  );


  /*
  |--------------------------------------------------------------------------
  | ADJUSTMENTS
  |--------------------------------------------------------------------------
  */

  setText(
    "totalCredits",
    formatCurrency(fees.totalCredits)
  );

  setText(
    "totalDebits",
    formatCurrency(fees.totalDebits)
  );

  setText(
    "pendingCharges",
    fees.pendingCharges || 0
  );


  /*
  |--------------------------------------------------------------------------
  | PROGRESS
  |--------------------------------------------------------------------------
  */

  const safePercentage =
    Math.min(
      Math.max(percentage, 0),
      100
    );


  const progressBar =
    document.getElementById(
      "collectionProgressBar"
    );

  if (progressBar) {
    progressBar.style.width =
      `${safePercentage}%`;
  }


  const summaryBar =
    document.getElementById(
      "collectionSummaryBar"
    );

  if (summaryBar) {
    summaryBar.style.width =
      `${safePercentage}%`;
  }


  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  setText(
    "collectionPercentageLabel",
    `${safePercentage.toFixed(2)}% collected`
  );

  setText(
    "collectionPercentageSummary",
    `${safePercentage.toFixed(2)}%`
  );

  setText(
    "collectionAmountSummary",
    formatCurrency(collected)
  );

  setText(
    "collectionChargedSummary",
    formatCurrency(charged)
  );

  setText(
    "collectionOutstandingSummary",
    formatCurrency(outstanding)
  );


  /*
  |--------------------------------------------------------------------------
  | CURRENT TERM
  |--------------------------------------------------------------------------
  */

  const termBadge =
    document.getElementById(
      "feesTermBadge"
    );

  if (termBadge) {

    if (currentTerm) {

      const termName =
        currentTerm.name ||
        `Term ${currentTerm.termNumber || ""}`;

      termBadge.textContent =
        termName;

    } else {

      termBadge.textContent =
        "No Current Term";
    }
  }
}
/*
|--------------------------------------------------------------------------
| ESCAPE HTML
|--------------------------------------------------------------------------
*/

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/*
|--------------------------------------------------------------------------
| ACADEMIC ADMIN
|--------------------------------------------------------------------------
*/

function goToAcademic() {

  window.location.href =
    "academic.html";
}

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


            <td class="p-4">

              <span
                class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold
                ${
                  isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }"
              >
                ${isActive ? "Active" : "Inactive"}
              </span>

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
                onclick="viewTeacher('${teacher.id}')"
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
| TEACHER PROFILE
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| TEACHER PROFILE
|--------------------------------------------------------------------------
*/

let selectedTeacher = null;


/*
|--------------------------------------------------------------------------
| VIEW TEACHER
|--------------------------------------------------------------------------
*/

async function viewTeacher(teacherId) {

  try {

    if (!teacherId) {
      showError("Teacher ID is required.");
      return;
    }


    /*
    |--------------------------------------------------------------------------
    | Load complete teacher profile
    |--------------------------------------------------------------------------
    */

    const response =
      await apiRequest(
        `/teachers/${teacherId}`
      );


    /*
    |--------------------------------------------------------------------------
    | The Stage 1 backend returns:
    |
    | {
    |   teacher,
    |   learningAreas,
    |   streams,
    |   teachingAssignments,
    |   classTeacherAssignments,
    |   timetable,
    |   assessments
    | }
    |--------------------------------------------------------------------------
    */

    selectedTeacher =
      extractData(response);


    if (!selectedTeacher) {
      showError("Teacher profile was not found.");
      return;
    }


    renderTeacherDetails(
      selectedTeacher
    );


  } catch (error) {

    console.error(
      "Failed to load teacher profile:",
      error
    );

    showError(
      error.message ||
      "Unable to load teacher details."
    );
  }
}


/*
|--------------------------------------------------------------------------
| RENDER TEACHER PROFILE
|--------------------------------------------------------------------------
*/

function renderTeacherDetails(
  teacherData
) {

  if (!teacherData) {
    return;
  }


  /*
  |--------------------------------------------------------------------------
  | Extract teacher information
  |--------------------------------------------------------------------------
  */

  const teacher =
    teacherData.teacher || {};

  const profile =
    teacher.profile || {};


  const firstName =
    profile.firstName || "";

  const middleName =
    profile.middleName || "";

  const lastName =
    profile.lastName || "";


  const fullName =
    [
      firstName,
      middleName,
      lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Teacher";


  const initials =
    [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .map(name =>
        name.charAt(0).toUpperCase()
      )
      .join("")
      .slice(0, 2) ||
    "T";


  /*
  |--------------------------------------------------------------------------
  | Profile data
  |--------------------------------------------------------------------------
  */

  const learningAreas =
    Array.isArray(
      teacherData.learningAreas
    )
      ? teacherData.learningAreas
      : [];


  const streams =
    Array.isArray(
      teacherData.streams
    )
      ? teacherData.streams
      : [];


  const teachingAssignments =
    Array.isArray(
      teacherData.teachingAssignments
    )
      ? teacherData.teachingAssignments
      : [];


  const classTeacherAssignments =
    Array.isArray(
      teacherData.classTeacherAssignments
    )
      ? teacherData.classTeacherAssignments
      : [];


  const timetable =
    Array.isArray(
      teacherData.timetable
    )
      ? teacherData.timetable
      : [];


  const assessments =
    Array.isArray(
      teacherData.assessments
    )
      ? teacherData.assessments
      : [];


  /*
  |--------------------------------------------------------------------------
  | Create modal
  |--------------------------------------------------------------------------
  */

  let modal =
    document.getElementById(
      "teacherProfileModal"
    );


  if (!modal) {

    modal =
      document.createElement("div");

    modal.id =
      "teacherProfileModal";

    document.body.appendChild(
      modal
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Modal HTML
  |--------------------------------------------------------------------------
  */

  modal.innerHTML = `

    <div
  class="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
  onclick="closeTeacherProfile(event)"
>

      <div
  class="relative bg-white w-full min-h-screen sm:min-h-0 sm:max-w-7xl sm:max-h-[92vh] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
  onclick="event.stopPropagation()"
>


        <!-- =====================================================
             PROFILE HEADER
        ====================================================== -->

        <div class="bg-school-800 text-white p-6">

          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            <div class="flex items-center gap-4">

              <div
                class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold"
              >
                ${escapeHtml(initials)}
              </div>


              <div>

                <h2 class="text-2xl font-bold">
                  ${escapeHtml(fullName)}
                </h2>

                <p class="text-green-500 mt-1">
                  Employee No:
                  ${escapeHtml(
                    teacher.employeeNumber || "-"
                  )}
                </p>

                <p class="text-green-500 text-sm mt-1">
                  ${escapeHtml(
                    profile.email || "-"
                  )}
                </p>

              </div>

            </div>


            <div class="flex items-center gap-3">

              <span
                class="px-3 py-1 rounded-full bg-white/15 text-sm"
              >
                ${escapeHtml(
                  profile.status || "UNKNOWN"
                )}
              </span>


            <button
  type="button"
  onclick="closeTeacherProfile()"
  class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/20 hover:bg-white/30 flex items-center justify-center text-2xl font-light text-white transition"
  title="Close teacher profile"
  aria-label="Close teacher profile"
>
  &times;
</button>

            </div>

          </div>

        </div>


        <!-- =====================================================
             QUICK SUMMARY
        ====================================================== -->

        <div class="p-6 border-b bg-gray-50">

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


            <div class="bg-white border rounded-xl p-4">

              <p class="text-sm text-gray-500">
                Teaching Assignments
              </p>

              <p class="text-2xl font-bold mt-1">
                ${teachingAssignments.length}
              </p>

            </div>


            <div class="bg-white border rounded-xl p-4">

              <p class="text-sm text-gray-500">
                Streams
              </p>

              <p class="text-2xl font-bold mt-1">
                ${streams.length}
              </p>

            </div>


            <div class="bg-white border rounded-xl p-4">

              <p class="text-sm text-gray-500">
                Class Teacher
              </p>

              <p class="text-2xl font-bold mt-1">
                ${
                  classTeacherAssignments.length
                    ? "Yes"
                    : "No"
                }
              </p>

            </div>


            <div class="bg-white border rounded-xl p-4">

              <p class="text-sm text-gray-500">
                Assessments
              </p>

              <p class="text-2xl font-bold mt-1">
                ${assessments.length}
              </p>

            </div>

          </div>

        </div>


        <!-- =====================================================
             TABS
        ====================================================== -->

        <div class="border-b bg-white">
      <div
      class="flex min-w-max overflow-x-auto"
       id="teacherProfileTabs"
        >
            <button
              type="button"
              class="teacher-profile-tab active px-5 py-4 text-sm font-medium border-b-2 border-school-800 text-school-800"
              onclick="switchTeacherProfileTab('overview', this)"
            >
              Overview
            </button>


            <button
              type="button"
              class="teacher-profile-tab px-5 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-900"
              onclick="switchTeacherProfileTab('assignments', this)"
            >
              Teaching Assignments
            </button>


            <button
              type="button"
              class="teacher-profile-tab px-5 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-900"
              onclick="switchTeacherProfileTab('streams', this)"
            >
              Streams & Subjects
            </button>


            <button
              type="button"
              class="teacher-profile-tab px-5 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-900"
              onclick="switchTeacherProfileTab('classTeacher', this)"
            >
              Class Teacher
            </button>


            <button
              type="button"
              class="teacher-profile-tab px-5 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-900"
              onclick="switchTeacherProfileTab('timetable', this)"
            >
              Timetable
            </button>


            <button
              type="button"
              class="teacher-profile-tab px-5 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-900"
              onclick="switchTeacherProfileTab('assessments', this)"
            >
              Assessments
            </button>

          </div>

        </div>


        <!-- =====================================================
             TAB CONTENT
        ====================================================== -->

        <div
          id="teacherProfileContent"
          class="flex-1 overflow-y-auto p-6"
        ></div>


      </div>

    </div>
  `;


  /*
  |--------------------------------------------------------------------------
  | Show modal
  |--------------------------------------------------------------------------
  */

  modal.classList.remove("hidden");


  /*
  |--------------------------------------------------------------------------
  | Render default tab
  |--------------------------------------------------------------------------
  */

  renderTeacherProfileTab(
    "overview"
  );


  /*
  |--------------------------------------------------------------------------
  | Prevent background scrolling
  |--------------------------------------------------------------------------
  */

  document.body.classList.add(
    "overflow-hidden"
  );
}


/*
|--------------------------------------------------------------------------
| SWITCH PROFILE TAB
|--------------------------------------------------------------------------
*/

function switchTeacherProfileTab(
  tab,
  button
) {

  document
    .querySelectorAll(
      ".teacher-profile-tab"
    )
    .forEach(tabButton => {

      tabButton.classList.remove(
        "border-school-800",
        "text-school-800"
      );

      tabButton.classList.add(
        "border-transparent",
        "text-gray-500"
      );

    });


  if (button) {

    button.classList.remove(
      "border-transparent",
      "text-gray-500"
    );

    button.classList.add(
      "border-school-800",
      "text-school-800"
    );
  }


  renderTeacherProfileTab(
    tab
  );
}


/*
|--------------------------------------------------------------------------
| RENDER PROFILE TAB
|--------------------------------------------------------------------------
*/

function teacherProfileEmptyState(
  message
) {

  return `

    <div
      class="border border-dashed rounded-xl p-10 text-center text-gray-500"
    >

      ${escapeHtml(message)}

    </div>

  `;
}



function renderTeacherProfileTab(
  tab
) {

  const container =
    document.getElementById(
      "teacherProfileContent"
    );


  if (!container || !selectedTeacher) {
    return;
  }


  const teacher =
    selectedTeacher.teacher || {};

  const profile =
    teacher.profile || {};


  switch (tab) {


    /*
    |--------------------------------------------------------------------------
    | OVERVIEW
    |--------------------------------------------------------------------------
    */

    case "overview":

      container.innerHTML = `

        <div class="space-y-6">


          <!-- Personal details -->

          <div>

            <h3 class="text-lg font-bold text-gray-900 mb-4">
              Personal & Account Information
            </h3>


            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              ${teacherProfileDetail(
                "First Name",
                profile.firstName
              )}

              ${teacherProfileDetail(
                "Middle Name",
                profile.middleName
              )}

              ${teacherProfileDetail(
                "Last Name",
                profile.lastName
              )}

              ${teacherProfileDetail(
                "Email",
                profile.email
              )}

              ${teacherProfileDetail(
                "Phone",
                profile.phone
              )}

              ${teacherProfileDetail(
                "Employee Number",
                teacher.employeeNumber
              )}

              ${teacherProfileDetail(
                "Account Status",
                profile.status
              )}

            </div>

          </div>


          <!-- Learning areas -->

          <div>

            <h3 class="text-lg font-bold text-gray-900 mb-4">
              Assigned Learning Areas
            </h3>


            ${
              selectedTeacher.learningAreas?.length
                ? `
                  <div class="flex flex-wrap gap-2">

                    ${selectedTeacher.learningAreas
                      .map(item => `

                        <span
                          class="px-3 py-2 rounded-lg bg-green-50 text-green-800 border border-green-200 text-sm"
                        >
                          ${escapeHtml(
                            item.learningArea?.name || "-"
                          )}
                        </span>

                      `)
                      .join("")}

                  </div>
                `
                : teacherProfileEmptyState(
                    "No learning areas assigned."
                  )
            }

          </div>

        </div>

      `;

      break;


    /*
    |--------------------------------------------------------------------------
    | TEACHING ASSIGNMENTS
    |--------------------------------------------------------------------------
    */

    case "assignments":

      const assignments =
        selectedTeacher.teachingAssignments || [];


      container.innerHTML = `

        <div>

          <div class="mb-5">

            <h3 class="text-lg font-bold">
              Teaching Assignments
            </h3>

            <p class="text-sm text-gray-500 mt-1">
              Learning areas assigned to this teacher by grade and stream.
            </p>

          </div>


          ${
            assignments.length
              ? `

                <div class="overflow-x-auto border rounded-xl">

                  <table class="w-full text-sm">

                    <thead class="bg-gray-50">

                      <tr>

                        <th class="text-left p-4">
                          Learning Area
                        </th>

                        <th class="text-left p-4">
                          Grade
                        </th>

                        <th class="text-left p-4">
                          Stream
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      ${assignments
                        .map(assignment => `

                          <tr class="border-t">

                            <td class="p-4 font-medium">
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

                          </tr>

                        `)
                        .join("")}

                    </tbody>

                  </table>

                </div>

              `
              : teacherProfileEmptyState(
                  "No teaching assignments found."
                )
          }

        </div>

      `;

      break;


    /*
    |--------------------------------------------------------------------------
    | STREAMS & SUBJECTS
    |--------------------------------------------------------------------------
    */

    case "streams":

      const streamAssignments =
        selectedTeacher.teachingAssignments || [];


      const streamGroups = {};


      streamAssignments.forEach(
        assignment => {

          const streamId =
            assignment.streamId ||
            assignment.stream?.id ||
            "unknown";


          if (!streamGroups[streamId]) {

            streamGroups[streamId] = {
              stream:
                assignment.stream,

              grade:
                assignment.grade,

              subjects: [],
            };

          }


          streamGroups[streamId].subjects.push(
            assignment.learningArea
          );
        }
      );


      container.innerHTML = `

        <div>

          <div class="mb-5">

            <h3 class="text-lg font-bold">
              Streams & Subjects
            </h3>

            <p class="text-sm text-gray-500 mt-1">
              Subjects/learning areas taught in each stream.
            </p>

          </div>


          ${
            Object.keys(streamGroups).length
              ? `

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

                  ${Object.values(streamGroups)
                    .map(group => `

                      <div class="border rounded-xl p-5">

                        <div class="mb-4">

                          <h4 class="font-bold text-gray-900">

                            ${escapeHtml(
                              group.grade?.name || "-"
                            )}

                            -
                            ${escapeHtml(
                              group.stream?.name || "-"
                            )}

                          </h4>

                        </div>


                        <div class="flex flex-wrap gap-2">

                          ${group.subjects
                            .map(subject => `

                              <span
                                class="px-3 py-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-sm"
                              >
                                ${escapeHtml(
                                  subject?.name || "-"
                                )}
                              </span>

                            `)
                            .join("")}

                        </div>

                      </div>

                    `)
                    .join("")}

                </div>

              `
              : teacherProfileEmptyState(
                  "No stream-specific teaching assignments found."
                )
          }

        </div>

      `;

      break;


    /*
    |--------------------------------------------------------------------------
    | CLASS TEACHER
    |--------------------------------------------------------------------------
    */

    case "classTeacher":

      const classTeacherAssignments =
        selectedTeacher.classTeacherAssignments || [];


      container.innerHTML = `

        <div>

          <div class="mb-5">

            <h3 class="text-lg font-bold">
              Class Teacher Responsibilities
            </h3>

            <p class="text-sm text-gray-500 mt-1">
              Classes where this teacher is assigned as class teacher.
            </p>

          </div>


          ${
            classTeacherAssignments.length
              ? `

                <div class="overflow-x-auto border rounded-xl">

                  <table class="w-full text-sm">

                    <thead class="bg-gray-50">

                      <tr>

                        <th class="text-left p-4">
                          Grade
                        </th>

                        <th class="text-left p-4">
                          Stream
                        </th>

                        <th class="text-left p-4">
                          Academic Year
                        </th>

                        <th class="text-left p-4">
                          Term
                        </th>

                        <th class="text-left p-4">
                          Status
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      ${classTeacherAssignments
                        .map(assignment => `

                          <tr class="border-t">

                            <td class="p-4 font-medium">
                              ${escapeHtml(
                                assignment.grade?.name || "-"
                              )}
                            </td>

                            <td class="p-4">
                              ${escapeHtml(
                                assignment.stream?.name || "-"
                              )}
                            </td>

                            <td class="p-4">
                              ${escapeHtml(
                                assignment.academicYear?.name || "-"
                              )}
                            </td>

                            <td class="p-4">
                              ${escapeHtml(
                                assignment.term?.name || "-"
                              )}
                            </td>

                            <td class="p-4">

                              <span
                                class="px-2.5 py-1 rounded-full text-xs ${
                                  assignment.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                }"
                              >
                                ${
                                  assignment.isActive
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

              `
              : teacherProfileEmptyState(
                  "This teacher is not currently assigned as a class teacher."
                )
          }

        </div>

      `;

      break;


    /*
    |--------------------------------------------------------------------------
    | TIMETABLE
    |--------------------------------------------------------------------------
    */

    case "timetable":

      const timetable =
        selectedTeacher.timetable || [];


      container.innerHTML = `

        <div>

          <div class="mb-5">

            <h3 class="text-lg font-bold">
              Teacher Timetable
            </h3>

            <p class="text-sm text-gray-500 mt-1">
              All timetable entries assigned to this teacher.
            </p>

          </div>


          ${
            timetable.length
              ? `

                <div class="overflow-x-auto border rounded-xl">

                  <table class="w-full text-sm">

                    <thead class="bg-gray-50">

                      <tr>

                        <th class="text-left p-4">
                          Day
                        </th>

                        <th class="text-left p-4">
                          Time
                        </th>

                        <th class="text-left p-4">
                          Learning Area
                        </th>

                        <th class="text-left p-4">
                          Grade
                        </th>

                        <th class="text-left p-4">
                          Stream
                        </th>

                        <th class="text-left p-4">
                          Room
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      ${timetable
                        .map(entry => `

                          <tr class="border-t">

                            <td class="p-4">
                              ${escapeHtml(
                                getDayName(
                                  entry.dayOfWeek
                                )
                              )}
                            </td>

                            <td class="p-4 whitespace-nowrap">
                              ${escapeHtml(
                                entry.startTime || "-"
                              )}
                              -
                              ${escapeHtml(
                                entry.endTime || "-"
                              )}
                            </td>

                            <td class="p-4 font-medium">
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

                          </tr>

                        `)
                        .join("")}

                    </tbody>

                  </table>

                </div>

              `
              : teacherProfileEmptyState(
                  "No timetable entries found."
                )
          }

        </div>

      `;

      break;


    /*
    |--------------------------------------------------------------------------
    | ASSESSMENTS
    |--------------------------------------------------------------------------
    */

    case "assessments":

      const teacherAssessments =
        selectedTeacher.assessments || [];


      container.innerHTML = `

        <div>

          <div class="mb-5">

            <h3 class="text-lg font-bold">
              Assessments
            </h3>

            <p class="text-sm text-gray-500 mt-1">
              Assessments created by this teacher.
            </p>

          </div>


          ${
            teacherAssessments.length
              ? `

                <div class="overflow-x-auto border rounded-xl">

                  <table class="w-full text-sm">

                    <thead class="bg-gray-50">

                      <tr>

                        <th class="text-left p-4">
                          Assessment
                        </th>

                        <th class="text-left p-4">
                          Learning Area
                        </th>

                        <th class="text-left p-4">
                          Grade
                        </th>

                        <th class="text-left p-4">
                          Stream
                        </th>

                        <th class="text-left p-4">
                          Term
                        </th>

                        <th class="text-left p-4">
                          Date
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      ${teacherAssessments
                        .map(assessment => `

                          <tr class="border-t">

                            <td class="p-4 font-medium">
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
                                assessment.term?.name || "-"
                              )}
                            </td>

                            <td class="p-4">
                              ${formatDate(
                                assessment.assessmentDate
                              )}
                            </td>

                          </tr>

                        `)
                        .join("")}

                    </tbody>

                  </table>

                </div>

              `
              : teacherProfileEmptyState(
                  "No assessments found."
                )
          }

        </div>

      `;

      break;


    default:

      container.innerHTML =
        teacherProfileEmptyState(
          "Profile section not found."
        );
  }
}


/*
|--------------------------------------------------------------------------
| PROFILE DETAIL HELPER
|--------------------------------------------------------------------------
*/

function teacherProfileDetail(
  label,
  value
) {

  return `

    <div class="border rounded-xl p-4">

      <p class="text-xs uppercase tracking-wide text-gray-400">
        ${escapeHtml(label)}
      </p>

      <p class="font-medium text-gray-900 mt-1">
        ${escapeHtml(value || "-")}
      </p>

    </div>

  `;
}


/*
|--------------------------------------------------------------------------
| PROFILE EMPTY STATE
|--------------------------------------------------------------------------
*/

function teacherProfileEmptyState(
  message
) {

  return `

    <div
      class="border border-dashed rounded-xl p-10 text-center text-gray-500"
    >

      ${escapeHtml(message)}

    </div>

  `;
}


/*
|--------------------------------------------------------------------------
| DAY NAME
|--------------------------------------------------------------------------
*/

function getDayName(
  dayOfWeek
) {

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];


  return days[
    Number(dayOfWeek)
  ] || "-";
}


/*
|--------------------------------------------------------------------------
| CLOSE TEACHER PROFILE
|--------------------------------------------------------------------------
*/

function closeTeacherProfile(
  event
) {

  /*
  |--------------------------------------------------------------------------
  | If clicking the backdrop, only close when the backdrop itself
  | was clicked.
  |--------------------------------------------------------------------------
  */

  if (
    event &&
    event.target !== event.currentTarget
  ) {
    return;
  }


  const modal =
    document.getElementById(
      "teacherProfileModal"
    );


  if (modal) {
    modal.classList.add("hidden");
  }


  document.body.classList.remove(
    "overflow-hidden"
  );


  selectedTeacher = null;
}


/*
|--------------------------------------------------------------------------
| MAKE AVAILABLE TO INLINE HTML
|--------------------------------------------------------------------------
*/

window.viewTeacher =
  viewTeacher;

window.closeTeacherProfile =
  closeTeacherProfile;

window.switchTeacherProfileTab =
  switchTeacherProfileTab;



function goToAdminCreation(role) {
  window.location.href = `admin-creation.html?role=${encodeURIComponent(role)}`;
}

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

function logout() {

  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");

  window.location.href =
    "login.html";
}


/*
|--------------------------------------------------------------------------
| INITIALIZE
|--------------------------------------------------------------------------
*/

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await loadDashboard();

  }
);

