/*
|--------------------------------------------------------------------------
| ADMISSIONS ADMIN FRONTEND
|--------------------------------------------------------------------------
*/

const API_BASE_URL = "http://localhost:5000/api";

let students = [];
let teachers = [];

let selectedStudent = null;


/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken")
  );
}


function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");

  window.location.href = "login.html";
}


/*
|--------------------------------------------------------------------------
| API HELPER
|--------------------------------------------------------------------------
*/

async function apiRequest(endpoint, options = {}) {

  const token = getToken();

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

  let body = {};

  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (response.status === 401) {
    logout();
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {

    throw new Error(
      body.message ||
      body.error ||
      `Request failed with status ${response.status}`
    );
  }

  return body;
}


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
| ACADEMIC DROPDOWNS
|--------------------------------------------------------------------------
*/

let academicYears = [];
let terms = [];
let grades = [];
let streams = [];


/*
|--------------------------------------------------------------------------
| LOAD ACADEMIC YEARS
|--------------------------------------------------------------------------
*/

async function loadAcademicYears() {

  try {

    const response =
      await apiRequest(
        "/academic-admin/academic-years"
      );

    const data =
      extractData(response);

    academicYears =
      Array.isArray(data)
        ? data
        : data?.academicYears || [];

    populateAcademicYearDropdowns();

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


/*
|--------------------------------------------------------------------------
| POPULATE ACADEMIC YEAR DROPDOWNS
|--------------------------------------------------------------------------
*/

function populateAcademicYearDropdowns() {

  const selects = [
    document.getElementById(
      "admissionAcademicYearId"
    ),
    document.getElementById(
      "enrollmentAcademicYearId"
    ),
  ];

  selects.forEach(select => {

    if (!select) {
      return;
    }

    select.innerHTML = `
      <option value="">
        Select academic year
      </option>
    `;

    academicYears.forEach(year => {

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

  });
}


/*
|--------------------------------------------------------------------------
| LOAD TERMS
|--------------------------------------------------------------------------
*/

async function loadTerms(academicYearId) {

  const admissionTerm =
    document.getElementById(
      "admissionTermId"
    );

  const enrollmentTerm =
    document.getElementById(
      "enrollmentTermId"
    );


  const termSelects = [
    admissionTerm,
    enrollmentTerm,
  ];


  termSelects.forEach(select => {

    if (!select) {
      return;
    }

    select.innerHTML = `
      <option value="">
        Select term
      </option>
    `;

    select.disabled = true;

  });


  if (!academicYearId) {
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


    terms =
      Array.isArray(data)
        ? data
        : data?.terms || [];


    termSelects.forEach(select => {

      if (!select) {
        return;
      }

      terms.forEach(term => {

        const option =
          document.createElement("option");

        option.value = term.id;

        option.textContent =
          term.name ||
          term.termName ||
          term.label ||
          term.id;

        select.appendChild(option);

      });

      select.disabled = false;

    });

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


/*
|--------------------------------------------------------------------------
| LOAD GRADES
|--------------------------------------------------------------------------
*/

async function loadGrades() {

  try {

    const response =
      await apiRequest(
        "/academic-admin/grades"
      );


    const data =
      extractData(response);


    grades =
      Array.isArray(data)
        ? data
        : data?.grades || [];


    populateGradeDropdowns();

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


/*
|--------------------------------------------------------------------------
| POPULATE GRADE DROPDOWNS
|--------------------------------------------------------------------------
*/

function populateGradeDropdowns() {

  const selects = [
    document.getElementById(
      "admissionGradeId"
    ),
    document.getElementById(
      "enrollmentGradeId"
    ),
  ];


  selects.forEach(select => {

    if (!select) {
      return;
    }


    select.innerHTML = `
      <option value="">
        Select grade
      </option>
    `;


    grades.forEach(grade => {

      const option =
        document.createElement("option");

      option.value = grade.id;

      option.textContent =
        grade.name ||
        grade.gradeName ||
        grade.label ||
        grade.code ||
        grade.id;

      select.appendChild(option);

    });

  });
}


/*
|--------------------------------------------------------------------------
| LOAD STREAMS
|--------------------------------------------------------------------------
*/

async function loadStreams(
  gradeId,
  targetSelect
) {

  if (!targetSelect) {
    return;
  }


  targetSelect.innerHTML = `
    <option value="">
      Select stream
    </option>
  `;

  targetSelect.disabled = true;


  if (!gradeId) {
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


    streams =
      Array.isArray(data)
        ? data
        : data?.streams || [];


    streams.forEach(stream => {

      const option =
        document.createElement("option");

      option.value = stream.id;

      option.textContent =
        stream.name ||
        stream.streamName ||
        stream.label ||
        stream.code ||
        stream.id;

      targetSelect.appendChild(option);

    });


    targetSelect.disabled = false;

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


/*
|--------------------------------------------------------------------------
| ADMISSION ACADEMIC YEAR CHANGE
|--------------------------------------------------------------------------
*/

async function handleAdmissionAcademicYearChange() {

  const academicYearId =
    document.getElementById(
      "admissionAcademicYearId"
    ).value;


  await loadTerms(
    academicYearId
  );
}


/*
|--------------------------------------------------------------------------
| ADMISSION GRADE CHANGE
|--------------------------------------------------------------------------
*/

async function handleAdmissionGradeChange() {

  const gradeId =
    document.getElementById(
      "admissionGradeId"
    ).value;


  const streamSelect =
    document.getElementById(
      "admissionStreamId"
    );


  await loadStreams(
    gradeId,
    streamSelect
  );
}


/*
|--------------------------------------------------------------------------
| ENROLLMENT ACADEMIC YEAR CHANGE
|--------------------------------------------------------------------------
*/

async function handleEnrollmentAcademicYearChange() {

  const academicYearId =
    document.getElementById(
      "enrollmentAcademicYearId"
    ).value;


  await loadTerms(
    academicYearId
  );
}


/*
|--------------------------------------------------------------------------
| ENROLLMENT GRADE CHANGE
|--------------------------------------------------------------------------
*/

async function handleEnrollmentGradeChange() {

  const gradeId =
    document.getElementById(
      "enrollmentGradeId"
    ).value;


  const streamSelect =
    document.getElementById(
      "enrollmentStreamId"
    );


  await loadStreams(
    gradeId,
    streamSelect
  );
}

/*
|--------------------------------------------------------------------------
| MESSAGES
|--------------------------------------------------------------------------
*/

function showSuccess(message) {

  const box = document.getElementById("successMessage");

  box.textContent = message;
  box.classList.remove("hidden");

  document
    .getElementById("errorMessage")
    .classList.add("hidden");

  setTimeout(() => {
    box.classList.add("hidden");
  }, 5000);
}


function showError(message) {

  const box = document.getElementById("errorMessage");

  box.textContent = message;
  box.classList.remove("hidden");

  document
    .getElementById("successMessage")
    .classList.add("hidden");
}


/*
|--------------------------------------------------------------------------
| SIDEBAR
|--------------------------------------------------------------------------
*/

function openSidebar() {

  document
    .getElementById("sidebar")
    .classList.remove("-translate-x-full");

  document
    .getElementById("mobileOverlay")
    .classList.remove("hidden");
}


function closeSidebar() {

  document
    .getElementById("sidebar")
    .classList.add("-translate-x-full");

  document
    .getElementById("mobileOverlay")
    .classList.add("hidden");
}


function setActive(element) {

  document
    .querySelectorAll(".sidebar-link")
    .forEach(link => {
      link.classList.remove("active");
    });

  element.classList.add("active");

  closeSidebar();
}


/*
|--------------------------------------------------------------------------
| MODALS
|--------------------------------------------------------------------------
*/

function openModal(id) {

  const modal = document.getElementById(id);

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}


function closeModal(id) {

  const modal = document.getElementById(id);

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}


/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

function loadCurrentDate() {

  const element =
    document.getElementById("currentDate");

  element.textContent =
    new Date().toLocaleDateString(
      undefined,
      {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
}


/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

async function loadAdmissionsDashboard() {

  try {

    const response =
      await apiRequest(
        "/admissions-admin/dashboard"
      );

    const dashboard =
      extractData(response) || {};


    /*
    |--------------------------------------------------------------------------
    | The frontend accepts several possible naming conventions.
    |--------------------------------------------------------------------------
    */

    const studentsCount =
      dashboard.students ??
      dashboard.studentCount ??
      dashboard.studentsCount ??
      0;

    const enrollmentsCount =
      dashboard.enrollments ??
      dashboard.enrollmentCount ??
      dashboard.activeEnrollments ??
      dashboard.enrollmentsCount ??
      0;

    const teachersCount =
      dashboard.teachers ??
      dashboard.teacherCount ??
      dashboard.teachersCount ??
      0;

    const parentsCount =
      dashboard.parents ??
      dashboard.parentCount ??
      dashboard.parentsCount ??
      0;


    document.getElementById(
      "studentsCount"
    ).textContent = studentsCount;


    document.getElementById(
      "enrollmentsCount"
    ).textContent = enrollmentsCount;


    document.getElementById(
      "teachersCount"
    ).textContent = teachersCount;


    document.getElementById(
      "parentsCount"
    ).textContent = parentsCount;

  } catch (error) {

    console.error(
      "Admissions dashboard error:",
      error
    );
  }
}


/*
|--------------------------------------------------------------------------
| STUDENTS
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
| VIEW STUDENT
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
| ADMIT STUDENT
|--------------------------------------------------------------------------
*/

async function openAdmitStudentModal() {

  document
    .getElementById("admitStudentForm")
    .reset();


  document.getElementById(
    "admissionDate"
  ).value =
    new Date().toISOString().split("T")[0];


  /*
  |--------------------------------------------------------------------------
  | Reset dependent dropdowns
  |--------------------------------------------------------------------------
  */

  const termSelect =
    document.getElementById(
      "admissionTermId"
    );

  const streamSelect =
    document.getElementById(
      "admissionStreamId"
    );


  termSelect.innerHTML = `
    <option value="">
      Select term
    </option>
  `;

  termSelect.disabled = true;


  streamSelect.innerHTML = `
    <option value="">
      Select stream
    </option>
  `;

  streamSelect.disabled = true;


  /*
  |--------------------------------------------------------------------------
  | Open modal
  |--------------------------------------------------------------------------
  */

  openModal("admitStudentModal");


  /*
  |--------------------------------------------------------------------------
  | Make sure academic data is available
  |--------------------------------------------------------------------------
  */

  if (!academicYears.length) {
    await loadAcademicYears();
  }

  if (!grades.length) {
    await loadGrades();
  }
}

async function submitAdmitStudent(event) {

  event.preventDefault();


  const button =
    document.getElementById(
      "admitStudentButton"
    );


  button.disabled = true;
  button.textContent = "Admitting...";


  try {

    const student = {

      admissionNumber:
        document.getElementById(
          "admissionNumber"
        ).value.trim(),

      firstName:
        document.getElementById(
          "studentFirstName"
        ).value.trim(),

      middleName:
        document.getElementById(
          "studentMiddleName"
        ).value.trim(),

      lastName:
        document.getElementById(
          "studentLastName"
        ).value.trim(),

      dateOfBirth:
        document.getElementById(
          "studentDateOfBirth"
        ).value || null,

      gender:
        document.getElementById(
          "studentGender"
        ).value || null,
    };


    const enrollment = {

  gradeId:
    document.getElementById(
      "admissionGradeId"
    ).value || null,

  streamId:
    document.getElementById(
      "admissionStreamId"
    ).value || null,

  academicYearId:
    document.getElementById(
      "admissionAcademicYearId"
    ).value || null,

  termId:
    document.getElementById(
      "admissionTermId"
    ).value || null,

  admissionDate:
    document.getElementById(
      "admissionDate"
    ).value || null,
};

if (!enrollment.academicYearId) {
  throw new Error(
    "Please select an academic year."
  );
}

if (!enrollment.gradeId) {
  throw new Error(
    "Please select a grade."
  );
}


    /*
    |--------------------------------------------------------------------------
    | Remove empty enrollment values
    |--------------------------------------------------------------------------
    */

    Object.keys(enrollment).forEach(key => {

      if (
        enrollment[key] === null ||
        enrollment[key] === ""
      ) {
        delete enrollment[key];
      }

    });


    const response =
      await apiRequest(
        "/admissions-admin/students",
        {
          method: "POST",
          body: JSON.stringify({
            student,
            enrollment,
          }),
        }
      );


    const result =
      extractData(response);


    showSuccess(
      response.message ||
      "Student admitted successfully."
    );


    closeModal("admitStudentModal");


    await loadStudents();


    if (result?.student?.id) {

      await viewStudent(
        result.student.id
      );

    }

  } catch (error) {

    showError(error.message);

  } finally {

    button.disabled = false;
    button.textContent = "Admit Student";
  }
}


/*
|--------------------------------------------------------------------------
| STUDENT ENROLLMENTS
|--------------------------------------------------------------------------
*/

async function loadStudentEnrollments(
  studentId
) {

  /*
  |--------------------------------------------------------------------------
  | The current Admissions backend exposes student detail.
  | Enrollment history is therefore read from the student response.
  |--------------------------------------------------------------------------
  */

  const table =
    document.getElementById(
      "enrollmentsTable"
    );


  const enrollmentData =
    selectedStudent?.enrollments ||
    selectedStudent?.enrollmentHistory ||
    [];


  if (!Array.isArray(enrollmentData) ||
      !enrollmentData.length) {

    table.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="p-8 text-center text-gray-500"
        >
          No enrollment records found.
        </td>
      </tr>
    `;

    return;
  }


  table.innerHTML =
    enrollmentData
      .map(enrollment => {

        const academicYear =
          enrollment.academicYear?.name ||
          enrollment.academicYear?.year ||
          enrollment.academicYearId ||
          "-";


        const term =
          enrollment.term?.name ||
          enrollment.termId ||
          "-";


        const grade =
          enrollment.grade?.name ||
          enrollment.gradeId ||
          "-";


        const stream =
          enrollment.stream?.name ||
          enrollment.streamId ||
          "-";


        const active =
          enrollment.isActive;


        return `
          <tr class="border-t">

            <td class="p-4">
              ${escapeHtml(academicYear)}
            </td>

            <td class="p-4">
              ${escapeHtml(term)}
            </td>

            <td class="p-4">
              ${escapeHtml(grade)}
            </td>

            <td class="p-4">
              ${escapeHtml(stream)}
            </td>

            <td class="p-4">

              <span
                class="px-2 py-1 rounded-full text-xs
                ${
                  active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }"
              >
                ${active ? "Active" : "Ended"}
              </span>

            </td>

            <td class="p-4 text-right">

              ${
                active
                  ? `
                    <button
                      type="button"
                      onclick="endEnrollment('${enrollment.id}')"
                      class="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs"
                    >
                      End
                    </button>
                  `
                  : "-"
              }

            </td>

          </tr>
        `;
      })
      .join("");
}

async function openEnrollmentModal() {

  if (!selectedStudent) {

    showError(
      "Please select a student first."
    );

    return;
  }


  document.getElementById(
    "enrollmentStudentLabel"
  ).textContent =
    `Student: ${
      selectedStudent.firstName || ""
    } ${
      selectedStudent.lastName || ""
    }`;


  /*
  |--------------------------------------------------------------------------
  | Reset enrollment dropdowns
  |--------------------------------------------------------------------------
  */

  const termSelect =
    document.getElementById(
      "enrollmentTermId"
    );

  const streamSelect =
    document.getElementById(
      "enrollmentStreamId"
    );


  termSelect.innerHTML = `
    <option value="">
      Select term
    </option>
  `;

  termSelect.disabled = true;


  streamSelect.innerHTML = `
    <option value="">
      Select stream
    </option>
  `;

  streamSelect.disabled = true;


  /*
  |--------------------------------------------------------------------------
  | Open modal
  |--------------------------------------------------------------------------
  */

  openModal("enrollmentModal");


  /*
  |--------------------------------------------------------------------------
  | Load academic data if necessary
  |--------------------------------------------------------------------------
  */

  if (!academicYears.length) {
    await loadAcademicYears();
  }

  if (!grades.length) {
    await loadGrades();
  }
}

async function submitEnrollment(event) {

  event.preventDefault();


  if (!selectedStudent?.id) {

    showError(
      "Please select a student first."
    );

    return;
  }


  try {

    const data = {

  gradeId:
    document
      .getElementById(
        "enrollmentGradeId"
      )
      .value || null,

  streamId:
    document
      .getElementById(
        "enrollmentStreamId"
      )
      .value || null,

  academicYearId:
    document
      .getElementById(
        "enrollmentAcademicYearId"
      )
      .value || null,

  termId:
    document
      .getElementById(
        "enrollmentTermId"
      )
      .value || null,

  admissionDate:
    document
      .getElementById(
        "enrollmentAdmissionDate"
      )
      .value || null,
};

if (!data.academicYearId) {
  throw new Error(
    "Please select an academic year."
  );
}

if (!data.gradeId) {
  throw new Error(
    "Please select a grade."
  );
}

    const response =
      await apiRequest(
        `/admissions-admin/students/${selectedStudent.id}/enrollments`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );


    showSuccess(
      response.message ||
      "Enrollment created successfully."
    );


    closeModal("enrollmentModal");


    await viewStudent(
      selectedStudent.id
    );

  } catch (error) {

    showError(error.message);
  }
}


async function endEnrollment(
  enrollmentId
) {

  const confirmed =
    confirm(
      "Are you sure you want to end this enrollment?"
    );


  if (!confirmed) {
    return;
  }


  try {

    const response =
      await apiRequest(
        `/admissions-admin/enrollments/${enrollmentId}/remove`,
        {
          method: "PATCH",
          body: JSON.stringify({
            exitDate:
              new Date()
                .toISOString()
                .split("T")[0],
          }),
        }
      );


    showSuccess(
      response.message ||
      "Enrollment ended successfully."
    );


    await viewStudent(
      selectedStudent.id
    );

  } catch (error) {

    showError(error.message);
  }
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


/*
|--------------------------------------------------------------------------
| CREATE / UPDATE TEACHER
|--------------------------------------------------------------------------
*/

function openTeacherModal() {

  document
    .getElementById("teacherForm")
    .reset();


  document.getElementById(
    "teacherId"
  ).value = "";


  document.getElementById(
    "teacherModalTitle"
  ).textContent =
    "Create Teacher";


  document.getElementById(
    "teacherSubmitButton"
  ).textContent =
    "Create Teacher";


  document.getElementById(
    "teacherPasswordContainer"
  ).classList.remove("hidden");


  openModal("teacherModal");
}


function editTeacher(teacherId) {

  const teacher =
    teachers.find(
      item => item.id === teacherId
    );


  if (!teacher) {
    return;
  }


  const user =
    teacher.user || {};


  document.getElementById(
    "teacherId"
  ).value =
    teacher.id;


  document.getElementById(
    "teacherFirstName"
  ).value =
    user.firstName || "";


  document.getElementById(
    "teacherMiddleName"
  ).value =
    user.middleName || "";


  document.getElementById(
    "teacherLastName"
  ).value =
    user.lastName || "";


  document.getElementById(
    "teacherEmployeeNumber"
  ).value =
    teacher.employeeNumber || "";


  document.getElementById(
    "teacherEmail"
  ).value =
    user.email || "";


  document.getElementById(
    "teacherPhone"
  ).value =
    user.phone || "";


  document.getElementById(
    "teacherPassword"
  ).value = "";


  document.getElementById(
    "teacherModalTitle"
  ).textContent =
    "Update Teacher";


  document.getElementById(
    "teacherSubmitButton"
  ).textContent =
    "Update Teacher";


  document.getElementById(
    "teacherPasswordContainer"
  ).classList.add("hidden");


  openModal("teacherModal");
}


async function submitTeacher(event) {

  event.preventDefault();


  const teacherId =
    document.getElementById(
      "teacherId"
    ).value;


  const data = {

    firstName:
      document
        .getElementById(
          "teacherFirstName"
        )
        .value
        .trim(),

    middleName:
      document
        .getElementById(
          "teacherMiddleName"
        )
        .value
        .trim(),

    lastName:
      document
        .getElementById(
          "teacherLastName"
        )
        .value
        .trim(),

    employeeNumber:
      document
        .getElementById(
          "teacherEmployeeNumber"
        )
        .value
        .trim(),

    email:
      document
        .getElementById(
          "teacherEmail"
        )
        .value
        .trim(),

    phone:
      document
        .getElementById(
          "teacherPhone"
        )
        .value
        .trim(),
  };


  try {

    if (teacherId) {

      await apiRequest(
        `/teachers/${teacherId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );


      showSuccess(
        "Teacher updated successfully."
      );

    } else {

      const password =
        document
          .getElementById(
            "teacherPassword"
          )
          .value;


      if (!password) {

        showError(
          "Teacher password is required."
        );

        return;
      }


      data.password =
        password;


      await apiRequest(
        "/teachers",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );


      showSuccess(
        "Teacher created successfully."
      );
    }


    closeModal("teacherModal");

    await loadTeachers();

    await loadAdmissionsDashboard();

  } catch (error) {

    showError(error.message);
  }
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


async function loadStudentParentsFromSelect() {

  const studentId =
    document.getElementById(
      "parentStudentSelect"
    ).value;


  if (!studentId) {

    document
      .getElementById(
        "studentParentsContainer"
      )
      .classList.add("hidden");

    return;
  }


  await loadStudentParents(
    studentId
  );
}


async function loadStudentParents(
  studentId
) {

  try {

    const response =
      await apiRequest(
        `/admissions-admin/students/${studentId}/parents`
      );


    const parents =
      extractData(response);


    renderStudentParents(
      Array.isArray(parents)
        ? parents
        : parents?.parents || []
    );


    const select =
      document.getElementById(
        "parentStudentSelect"
      );


    if (select) {
      select.value = studentId;
    }

  } catch (error) {

    /*
    |--------------------------------------------------------------------------
    | A student may have no parents.
    |--------------------------------------------------------------------------
    */

    renderStudentParents([]);

    console.error(
      "Parent loading error:",
      error
    );
  }
}


function renderStudentParents(
  parents
) {

  document
    .getElementById(
      "studentParentsContainer"
    )
    .classList.remove("hidden");


  const container =
    document.getElementById(
      "studentParentsList"
    );


  if (!parents.length) {

    container.innerHTML = `
      <div
        class="rounded-xl border border-dashed p-6 text-center text-gray-500"
      >
        No parents are currently linked to this student.
      </div>
    `;

    return;
  }


  container.innerHTML =
    parents
      .map(link => {

        const parent =
          link.parent ||
          link;


        const user =
          parent.user ||
          {};


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
          "Parent";


        return `
          <div class="border rounded-xl p-4">

            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>

                <h5 class="font-bold">
                  ${escapeHtml(name)}
                </h5>

                <p class="text-sm text-gray-500">
                  ${escapeHtml(
                    user.email ||
                    parent.email ||
                    "-"
                  )}
                </p>

                <p class="text-sm text-gray-500">
                  ${escapeHtml(
                    user.phone ||
                    parent.phone ||
                    "-"
                  )}
                </p>

              </div>

              <div class="text-sm">

                <span class="font-semibold">
                  Relationship:
                </span>

                ${escapeHtml(
                  link.relationship ||
                  parent.relationship ||
                  "-"
                )}

              </div>

            </div>

          </div>
        `;
      })
      .join("");
}


function openParentModal() {

  const studentId =
    document.getElementById(
      "parentStudentSelect"
    ).value;


  if (!studentId) {

    showError(
      "Please select a student first."
    );

    return;
  }


  const student =
    students.find(
      item => item.id === studentId
    );


  if (student) {

    const firstName =
      student.firstName ||
      student.user?.firstName ||
      "";


    const lastName =
      student.lastName ||
      student.user?.lastName ||
      "";


    document.getElementById(
      "parentStudentLabel"
    ).textContent =
      `Student: ${firstName} ${lastName}`.trim();
  }


  document
    .getElementById(
      "parentModal"
    )
    .dataset.studentId =
    studentId;


  openModal("parentModal");
}


async function submitParent(event) {

  event.preventDefault();


  const studentId =
    document
      .getElementById(
        "parentModal"
      )
      .dataset.studentId;


  if (!studentId) {

    showError(
      "Please select a student first."
    );

    return;
  }


  const email =
    document
      .getElementById(
        "parentEmail"
      )
      .value
      .trim();


  const phone =
    document
      .getElementById(
        "parentPhone"
      )
      .value
      .trim();


  if (!email && !phone) {

    showError(
      "Parent email or phone is required."
    );

    return;
  }


  const data = {

    firstName:
      document
        .getElementById(
          "parentFirstName"
        )
        .value
        .trim(),

    middleName:
      document
        .getElementById(
          "parentMiddleName"
        )
        .value
        .trim(),

    lastName:
      document
        .getElementById(
          "parentLastName"
        )
        .value
        .trim(),

    email,

    phone,

    password:
      document
        .getElementById(
          "parentPassword"
        )
        .value,

    relationship:
      document
        .getElementById(
          "parentRelationship"
        )
        .value
        .trim(),

    studentId,

    isPrimary:
      document
        .getElementById(
          "parentIsPrimary"
        )
        .checked,
  };


  try {

    const response =
      await apiRequest(
        "/admissions-admin/parents",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );


    showSuccess(
      response.message ||
      "Parent account created successfully."
    );


    closeModal(
      "parentModal"
    );


    await loadStudentParents(
      studentId
    );


    document
      .getElementById(
        "parentStudentSelect"
      )
      .value =
      studentId;

  } catch (error) {

    showError(error.message);
  }
}


/*
|--------------------------------------------------------------------------
| ESCAPE HTML
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


/*
|--------------------------------------------------------------------------
| INITIALIZATION
|--------------------------------------------------------------------------
*/

async function initializeAdmissionsPage() {

  loadCurrentDate();


  const token =
    getToken();


  if (!token) {

    window.location.href =
      "login.html";

    return;
  }


  await Promise.all([
  loadAdmissionsDashboard(),
  loadStudents(),
  loadTeachers(),
  loadParents(),
  loadAcademicYears(),
  loadGrades(),
]);
}


document.addEventListener(
  "DOMContentLoaded",
  initializeAdmissionsPage
);