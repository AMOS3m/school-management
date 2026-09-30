const API_BASE_URL = "http://localhost:5000/api";


document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const role = params.get("role");

  const adminRole = document.getElementById("adminRole");

  const validRoles = [
    "ACADEMIC_ADMIN",
    "FINANCE_ADMIN",
    "ADMISSIONS_ADMIN",
  ];


  /*
  |--------------------------------------------------------------------------
  | Set role from URL
  |--------------------------------------------------------------------------
  |
  | Example:
  | admin-creation.html?role=ACADEMIC_ADMIN
  |
  */

  if (role && validRoles.includes(role)) {
    adminRole.value = role;
  }


  /*
  |--------------------------------------------------------------------------
  | Update button when role changes
  |--------------------------------------------------------------------------
  */

  adminRole.addEventListener("change", () => {
    updatePageTitle();
  });


  updatePageTitle();


  /*
  |--------------------------------------------------------------------------
  | Form submission
  |--------------------------------------------------------------------------
  */

  document
    .getElementById("adminCreationForm")
    .addEventListener("submit", createAdmin);
});


/*
|--------------------------------------------------------------------------
| UPDATE BUTTON TEXT
|--------------------------------------------------------------------------
*/

function updatePageTitle() {
  const role = document.getElementById("adminRole").value;

  const button = document.getElementById("createAdminButton");

  const roleNames = {
    ACADEMIC_ADMIN: "Academic Admin",
    FINANCE_ADMIN: "Finance Admin",
    ADMISSIONS_ADMIN: "Admissions Admin",
  };


  const roleName = roleNames[role] || "Administrator";

  button.textContent = `Create ${roleName}`;
}


/*
|--------------------------------------------------------------------------
| CREATE ADMINISTRATOR
|--------------------------------------------------------------------------
*/

async function createAdmin(event) {
  event.preventDefault();


  const errorBox = document.getElementById("formError");
  const successBox = document.getElementById("formSuccess");
  const button = document.getElementById("createAdminButton");


  /*
  |--------------------------------------------------------------------------
  | Clear previous messages
  |--------------------------------------------------------------------------
  */

  errorBox.classList.add("hidden");
  successBox.classList.add("hidden");


  /*
  |--------------------------------------------------------------------------
  | Get form values
  |--------------------------------------------------------------------------
  */

  const role = document.getElementById("adminRole").value;

  const firstName =
    document.getElementById("firstName").value.trim();

  const middleName =
    document.getElementById("middleName").value.trim();

  const lastName =
    document.getElementById("lastName").value.trim();

  const email =
    document.getElementById("email").value.trim();

  const phone =
    document.getElementById("phone").value.trim();

  const password =
    document.getElementById("password").value;

  const confirmPassword =
    document.getElementById("confirmPassword").value;


  /*
  |--------------------------------------------------------------------------
  | Validate passwords
  |--------------------------------------------------------------------------
  */

  if (password !== confirmPassword) {
    errorBox.textContent = "Passwords do not match.";
    errorBox.classList.remove("hidden");
    return;
  }


  if (password.length < 8) {
    errorBox.textContent =
      "Password must contain at least 8 characters.";

    errorBox.classList.remove("hidden");
    return;
  }


  /*
  |--------------------------------------------------------------------------
  | Get authentication token
  |--------------------------------------------------------------------------
  */

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");


  if (!token) {
    errorBox.textContent =
      "Your session has expired. Please log in again.";

    errorBox.classList.remove("hidden");
    return;
  }


  /*
  |--------------------------------------------------------------------------
  | Disable button while request is running
  |--------------------------------------------------------------------------
  */

  const originalButtonText = button.textContent;

  button.disabled = true;
  button.textContent = "Creating...";


  /*
  |--------------------------------------------------------------------------
  | Send request to Users API
  |--------------------------------------------------------------------------
  */

  try {
    const response = await fetch(
      `${API_BASE_URL}/users/admins`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },

        body: JSON.stringify({
          firstName,
          middleName: middleName || null,
          lastName,
          email,
          phone: phone || null,
          password,
          role,
        }),
      }
    );


    /*
    |--------------------------------------------------------------------------
    | Read backend response
    |--------------------------------------------------------------------------
    */

    const data = await response.json();


    /*
    |--------------------------------------------------------------------------
    | Handle failed request
    |--------------------------------------------------------------------------
    */

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Failed to create administrator."
      );
    }


    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    successBox.textContent =
      `${data.admin.firstName} ${data.admin.lastName} was created successfully as ${getRoleName(role)}.`;

    successBox.classList.remove("hidden");


    /*
    |--------------------------------------------------------------------------
    | Reset form
    |--------------------------------------------------------------------------
    */

    document.getElementById("adminCreationForm").reset();


    /*
    |--------------------------------------------------------------------------
    | Restore selected role after reset
    |--------------------------------------------------------------------------
    */

    document.getElementById("adminRole").value = role;

    updatePageTitle();


  } catch (error) {

    console.error("Create administrator error:", error);

    errorBox.textContent =
      error.message ||
      "Something went wrong while creating the administrator.";

    errorBox.classList.remove("hidden");


  } finally {

    /*
    |--------------------------------------------------------------------------
    | Re-enable button
    |--------------------------------------------------------------------------
    */

    button.disabled = false;
    button.textContent = originalButtonText;
  }
}


/*
|--------------------------------------------------------------------------
| ROLE DISPLAY NAME
|--------------------------------------------------------------------------
*/

function getRoleName(role) {
  const roleNames = {
    ACADEMIC_ADMIN: "Academic Admin",
    FINANCE_ADMIN: "Finance Admin",
    ADMISSIONS_ADMIN: "Admissions Admin",
  };

  return roleNames[role] || "Administrator";
}


/*
|--------------------------------------------------------------------------
| BACK TO HEAD DASHBOARD
|--------------------------------------------------------------------------
*/

function goBackToDashboard() {
  window.location.href = "head.html";
}