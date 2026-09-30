
/*
|--------------------------------------------------------------------------
| API CONFIGURATION
|--------------------------------------------------------------------------
*/

const API_BASE = "http://localhost:5000/api";


/*
|--------------------------------------------------------------------------
| ELEMENTS
|--------------------------------------------------------------------------
*/

const loginForm =
  document.getElementById("loginForm");

const identifierInput =
  document.getElementById("identifier");

const passwordInput =
  document.getElementById("password");

const loginButton =
  document.getElementById("loginButton");

const loginMessage =
  document.getElementById("loginMessage");

const togglePassword =
  document.getElementById("togglePassword");


/*
|--------------------------------------------------------------------------
| SHOW MESSAGE
|--------------------------------------------------------------------------
*/

function showMessage(message, type = "error") {

  if (!loginMessage) return;

  loginMessage.textContent = message;

  loginMessage.classList.remove(
    "hidden",
    "bg-red-100",
    "text-red-700",
    "bg-green-100",
    "text-green-700"
  );

  if (type === "success") {

    loginMessage.classList.add(
      "bg-green-100",
      "text-green-700"
    );

  } else {

    loginMessage.classList.add(
      "bg-red-100",
      "text-red-700"
    );
  }
}


/*
|--------------------------------------------------------------------------
| HIDE MESSAGE
|--------------------------------------------------------------------------
*/

function hideMessage() {

  if (!loginMessage) return;

  loginMessage.classList.add("hidden");
}


/*
|--------------------------------------------------------------------------
| PASSWORD VISIBILITY
|--------------------------------------------------------------------------
*/

togglePassword?.addEventListener(
  "click",
  () => {

    if (passwordInput.type === "password") {

      passwordInput.type = "text";

      togglePassword.textContent = "Hide";

    } else {

      passwordInput.type = "password";

      togglePassword.textContent = "Show";
    }
  }
);


/*
|--------------------------------------------------------------------------
| ROLE → DASHBOARD
|--------------------------------------------------------------------------
|
| Each role has its own dashboard.
|
|--------------------------------------------------------------------------
*/

function getDashboardForRole(roles) {

  if (!Array.isArray(roles)) {
    return null;
  }


  /*
  |--------------------------------------------------------------------------
  | HEAD OF INSTITUTION
  |--------------------------------------------------------------------------
  */

  if (
    roles.includes(
      "HEAD_OF_INSTITUTION"
    )
  ) {

    return "/head.html";
  }


  /*
  |--------------------------------------------------------------------------
  | ACADEMIC ADMIN
  |--------------------------------------------------------------------------
  */

  if (
    roles.includes(
      "ACADEMIC_ADMIN"
    )
  ) {

    return "/academic.html";
  }


  /*
  |--------------------------------------------------------------------------
  | FINANCE ADMIN
  |--------------------------------------------------------------------------
  */

  if (
    roles.includes(
      "FINANCE_ADMIN"
    )
  ) {

    return "/finance.html";
  }


  /*
  |--------------------------------------------------------------------------
  | ADMISSIONS ADMIN
  |--------------------------------------------------------------------------
  */

  if (
    roles.includes(
      "ADMISSIONS_ADMIN"
    )
  ) {

    return "/admissions.html";
  }


  /*
  |--------------------------------------------------------------------------
  | TEACHER
  |--------------------------------------------------------------------------
  */

  if (
    roles.includes(
      "TEACHER"
    )
  ) {

    return "/teacher.html";
  }


  /*
  |--------------------------------------------------------------------------
  | PARENT
  |--------------------------------------------------------------------------
  */

  if (
    roles.includes(
      "PARENT"
    )
  ) {

    return "/parent.html";
  }


  /*
  |--------------------------------------------------------------------------
  | NO DASHBOARD
  |--------------------------------------------------------------------------
  */

  return null;
}


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

loginForm?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    hideMessage();


    /*
    |--------------------------------------------------------------------------
    | GET FORM VALUES
    |--------------------------------------------------------------------------
    */

    const identifier =
      identifierInput.value.trim();

    const password =
      passwordInput.value;


    /*
    |--------------------------------------------------------------------------
    | CLIENT VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!identifier || !password) {

      showMessage(
        "Email/phone and password are required."
      );

      return;
    }


    /*
    |--------------------------------------------------------------------------
    | DISABLE BUTTON
    |--------------------------------------------------------------------------
    */

    loginButton.disabled = true;

    loginButton.textContent =
      "Signing in...";


    try {


      /*
      |--------------------------------------------------------------------------
      | CALL LOGIN API
      |--------------------------------------------------------------------------
      */

      const response =
        await fetch(
          `${API_BASE}/auth/login`,
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              identifier,

              password,

            }),
          }
        );


      /*
      |--------------------------------------------------------------------------
      | READ RESPONSE
      |--------------------------------------------------------------------------
      */

      let data = null;

      try {

        data =
          await response.json();

      } catch {

        data = null;
      }


      /*
      |--------------------------------------------------------------------------
      | HANDLE LOGIN ERROR
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {

        throw new Error(
          data?.message ||
          "Login failed."
        );
      }


      /*
      |--------------------------------------------------------------------------
      | VERIFY TOKEN
      |--------------------------------------------------------------------------
      */

      if (!data?.token) {

        throw new Error(
          "Login succeeded but no authentication token was returned."
        );
      }


      /*
      |--------------------------------------------------------------------------
      | SAVE AUTHENTICATION DATA
      |--------------------------------------------------------------------------
      */

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          data.user || {}
        )
      );


      /*
      |--------------------------------------------------------------------------
      | GET USER ROLES
      |--------------------------------------------------------------------------
      */

      const roles =
        data.user?.roles || [];


      console.log(
        "Logged-in user:",
        data.user
      );

      console.log(
        "User roles:",
        roles
      );


      /*
      |--------------------------------------------------------------------------
      | FIND DASHBOARD
      |--------------------------------------------------------------------------
      */

      const dashboard =
        getDashboardForRole(
          roles
        );


      /*
      |--------------------------------------------------------------------------
      | NO DASHBOARD CONFIGURED
      |--------------------------------------------------------------------------
      */

      if (!dashboard) {

        throw new Error(
          "Your account does not have a configured dashboard."
        );
      }


      /*
      |--------------------------------------------------------------------------
      | SUCCESS MESSAGE
      |--------------------------------------------------------------------------
      */

      showMessage(
        "Login successful. Opening your dashboard...",
        "success"
      );


      /*
      |--------------------------------------------------------------------------
      | REDIRECT
      |--------------------------------------------------------------------------
      */

      setTimeout(() => {

        window.location.href =
          dashboard;

      }, 500);


    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      showMessage(
        error.message ||
        "Unable to login."
      );


    } finally {

      loginButton.disabled = false;

      loginButton.textContent =
        "Sign In";
    }
  }
);

