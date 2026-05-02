
/*=============== SHOW HIDE LOGIN & CREATE ACCOUNT ===============*/
const loginAcessRegister = document.getElementById('loginAccessRegister'),
      buttonRegister = document.getElementById('loginButtonRegister'),
      buttonAccess = document.getElementById('loginButtonAccess')

buttonRegister.addEventListener('click', () => {
   loginAcessRegister.classList.add('active')
})

buttonAccess.addEventListener('click', () => {
   loginAcessRegister.classList.remove('active')
})

/*=============== LOGIN & REGISTER AJAX ===============*/
document.addEventListener('DOMContentLoaded', function() {
    // لاگین
    const loginForm = document.querySelector('#loginAccessRegister .login__access form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('#email').value;
            const password = this.querySelector('#password').value;
            
            fetch('auth_handler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: new URLSearchParams({
                    'action': 'login',
                    'email': email,
                    'password': password
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = 'dashboard.php';
                } else {
                    alert(data.message);
                }
            });
        });
    }
    
    // ثبت نام
    const registerForm = document.querySelector('#loginAccessRegister .login__register form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = this.querySelector('#names').value;
            const email = this.querySelector('#emailCreate').value;
            const password = this.querySelector('#passwordCreate').value;
            
            fetch('auth_handler.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: new URLSearchParams({
                    'action': 'register',
                    'username': username,
                    'email': email,
                    'password': password
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Registration successful! Please login.');
                    document.getElementById('loginButtonAccess')?.click();
                } else {
                    alert(data.message);
                }
            });
        });
    }
});