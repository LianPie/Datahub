/*=============== SHOW HIDE LOGIN & CREATE ACCOUNT ===============*/
const loginAcessRegister = document.getElementById("loginAccessRegister"),
  buttonRegister = document.getElementById("loginButtonRegister"),
  buttonAccess = document.getElementById("loginButtonAccess");

buttonRegister.addEventListener("click", () => {
  loginAcessRegister.classList.add("active");
});

buttonAccess.addEventListener("click", () => {
  loginAcessRegister.classList.remove("active");
});

async function validateEmailOnInput() {
    const email = document.getElementById("emailCreate").value;
    const msgBox = document.getElementById("emailMsg");
    const input = document.getElementById("emailCreate"); 

    if (!email || email.trim() === "") {
        msgBox.innerHTML = "❌ Email is required";
        msgBox.className = "login__message error";
        input.classList.add("error");
        input.classList.remove("success");
        return false;
    }

    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) {
        msgBox.innerHTML = "❌ Enter valid email (name@example.com)";
        msgBox.className = "login__message error";
        input.classList.add("error");
        input.classList.remove("success");
        return false;
    }

    try {
        const exists = await checkEmailExists(email);
        if (exists) {
            msgBox.innerHTML = "❌ Email already registered";
            msgBox.className = "login__message error";
            input.classList.add("error");
            input.classList.remove("success");
            return false;
        } else {
            msgBox.innerHTML = "✅ Email available";
            msgBox.className = "login__message success";
            input.classList.add("success");
            input.classList.remove("error");
            return true;
        }
    } catch (error) {
        console.error("Error checking email:", error);
        msgBox.innerHTML = "❌ Error checking email";
        msgBox.className = "login__message error";
        input.classList.add("error");
        input.classList.remove("success");
        return false;
    }
}

function checkEmailExists(email) {
    const url = window.location.origin + '/Datahub/Handlers/AuthHandler.php';
    
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: new URLSearchParams({
            'action': 'check_email',
            'email': email
        })
    })
    .then(response => response.json())
    .then(data => {
        return data.exists;
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      return false;
    });
}

function validatePasswordOnInput() {
    const password = document.getElementById("passwordCreate").value;
    const msgBox = document.getElementById("passwordMsg");
    const input = document.getElementById("passwordCreate"); 

    if (!password || password.trim() === "") {
        msgBox.innerHTML = "❌ Password is required";
        msgBox.className = "login__message error";
        input.classList.add("error");
        input.classList.remove("success");
        return false;
    }

    if (password.length < 8) {
        msgBox.innerHTML = "❌ Password must be at least 8 characters";
        msgBox.className = "login__message error";
        input.classList.add("error");
        input.classList.remove("success");
        return false;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        msgBox.innerHTML = "❌ Must contain uppercase, lowercase & numbers";
        msgBox.className = "login__message error";
        input.classList.add("error");
        input.classList.remove("success");
        return false;
    }

    msgBox.innerHTML = "✅ Strong password";
    msgBox.className = "login__message success";
    input.classList.add("success");
    input.classList.remove("error");
    return true;
}
/*=============== LOGIN & REGISTER AJAX ===============*/
document.addEventListener("DOMContentLoaded", function () {
  // لاگین
  const loginForm = document.querySelector(
    "#loginAccessRegister .login__access form",
  );
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = this.querySelector("#email").value;
      const password = this.querySelector("#password").value;

      fetch("/Datahub/Handlers/AuthHandler.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: new URLSearchParams({
          action: "login",
          email: email,
          password: password,
        }),
      })
        .then(function (response) {
          return response.text();
        })
        .then(function (text) {
          try {
            var data = JSON.parse(text);
            if (data.success) {
              window.location.href = "/Datahub/Dashboard/";
            } else {
              showToast(data.message, "error");
            }
          } catch (e) {
            console.error("Invalid JSON:", text);
            showToast("Hmm something went wrong. Please try again later.", "error");
          }
        })
        .catch(function (error) {
          console.error("Fetch error:", error);
          showToast("Hmm something went wrong. Please check your connection.", "error");
        });
    });
  }

  // ثبت نام
  const registerForm = document.querySelector(
    "#loginAccessRegister .login__register form",
  );
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const username = this.querySelector("#names").value;
      const email = this.querySelector("#emailCreate").value;
      const password = this.querySelector("#passwordCreate").value;

      try {
        const response = await fetch("/Datahub/Handlers/AuthHandler.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: new URLSearchParams({
            action: "register",
            username: username,
            email: email,
            password: password,
          }),
        });

        if (!response.ok) {
          throw new Error("Network error");
        }

        const text = await response.text();
        let data;

        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Invalid JSON:", text);
          showToast("Hmm something went wrong. Please try again later.", "error");
          return;
        }

        if (data.success) {
          showToast("Registration successful! Please login.", "success");
          document.getElementById("loginButtonAccess")?.click();
        } else {
          showToast(data.message);
        }
      } catch (error) {
        console.error("Error:", error);
        showToast(
          "Hmm something went wrong. Please check your connection and try again.", "error"
        );
      }
    });
  }
});

/*=============== SHOW HIDE PASSWORD LOGIN ===============*/
const passwordAccess = (loginPass, loginEye) => {
  const input = document.getElementById(loginPass),
    iconEye = document.getElementById(loginEye);

  iconEye.addEventListener("click", () => {
    input.type === "password"
      ? (input.type = "text")
      : (input.type = "password");
    iconEye.classList.toggle("ri-eye-fill");
    iconEye.classList.toggle("ri-eye-off-fill");
  });
};
passwordAccess("password", "loginPassword");

/*=============== SHOW HIDE PASSWORD CREATE ACCOUNT ===============*/
const passwordRegister = (loginPass, loginEye) => {
  const input = document.getElementById(loginPass),
    iconEye = document.getElementById(loginEye);

  iconEye.addEventListener("click", () => {
    input.type === "password"
      ? (input.type = "text")
      : (input.type = "password");
    iconEye.classList.toggle("ri-eye-fill");
    iconEye.classList.toggle("ri-eye-off-fill");
  });
};
passwordRegister("passwordCreate", "loginPasswordCreate");
