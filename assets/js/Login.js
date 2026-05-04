
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

async function validateEmailOnInput() {
    const email = document.getElementById('emailCreate').value;
    const msgBox = document.getElementById('emailMsg');
    const input = document.getElementById('email');
    
    if (!email || email.trim() === '') {
        msgBox.innerHTML = '❌ Email is required';
        msgBox.className = 'message error';
        input.className = 'error';
        return false;
    }
    
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        msgBox.innerHTML = '❌ Enter valid email (name@example.com)';
        msgBox.className = 'message error';
        input.className = 'error';
        return false;
    }
    
    // Check database - THIS MUST BE AWAITED
    try {
        const exists = await checkEmailExists(email);
        
        if (exists) {
            msgBox.innerHTML = '❌ Email already registered';
            msgBox.className = 'message error';
            input.className = 'error';
            return false;
        } else {
            msgBox.innerHTML = '✅';
            msgBox.className = 'message success';
            input.className = 'success';
            return true;
        }
    } catch (error) {
        console.error('Error checking email:', error);
        msgBox.innerHTML = '❌ Error checking email';
        msgBox.className = 'message error';
        input.className = 'error';
        return false;
    }
}

function checkEmailExists(email) {
    // Make sure the path is correct
    const url = window.location.origin + '/datahub/Handlers/AuthHandler.php';
    
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
    .catch(error => {
        console.error('Fetch error:', error);
        return false;
    });
}

function validatePasswordOnInput() {
  const password = document.getElementById('passwordCreate').value;
  const msgBox = document.getElementById('passwordMsg');
  const input = document.getElementById('password');
  
  if (!password || password.trim() === '') {
    msgBox.innerHTML = '❌ Password is required';
    msgBox.className = 'message error';
    input.className = 'error';
    return false;
  }
  
  if (password.length < 8) {
    msgBox.innerHTML = '❌ Password must be at least 8 characters';
    msgBox.className = 'message error';
    input.className = 'error';
    return false;
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    msgBox.innerHTML = '❌ Must contain uppercase, lowercase & numbers';
    msgBox.className = 'message error';
    input.className = 'error';
    return false;
  }
  
  msgBox.innerHTML = '✅';
  msgBox.className = 'message success';
  input.className = 'success';
  return true;
}
/*=============== LOGIN & REGISTER AJAX ===============*/
document.addEventListener('DOMContentLoaded', function() {
    // لاگین
    const loginForm = document.querySelector('#loginAccessRegister .login__access form');
    if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('#email').value;
        const password = this.querySelector('#password').value;
        
        fetch('/Datahub/Handlers/AuthHandler.php', {
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
        .then(function(response) {
            return response.text();
        })
        .then(function(text) {
            try {
                var data = JSON.parse(text);
                if (data.success) {
                    window.location.href = '/Datahub/Dashboard/dashboard.php';
                } else {
                    alert(data.message);
                }
            } catch(e) {
                console.error('Invalid JSON:', text);
                alert('Hmm something went wrong. Please try again later.');
            }
        })
        .catch(function(error) {
            console.error('Fetch error:', error);
            alert('Hmm something went wrong. Please check your connection.');
        });
    });
}
    
    // ثبت نام
    const registerForm = document.querySelector('#loginAccessRegister .login__register form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = this.querySelector('#names').value;
            const email = this.querySelector('#emailCreate').value;
            const password = this.querySelector('#passwordCreate').value;
            
            try {
                const response = await fetch('/Datahub/Handlers/AuthHandler.php', {
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
                });
                
                if (!response.ok) {
                    throw new Error('Network error');
                }
                
                const text = await response.text();
                let data;
                
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error('Invalid JSON:', text);
                    alert('Hmm something went wrong. Please try again later.');
                    return;
                }
                
                if (data.success) {
                    alert('Registration successful! Please login.');
                    document.getElementById('loginButtonAccess')?.click();
                } else {
                    alert(data.message);
                }
                
            } catch (error) {
                console.error('Error:', error);
                alert('Hmm something went wrong. Please check your connection and try again.');
            }
        })
    }
});


/*=============== SHOW HIDE PASSWORD LOGIN ===============*/
const passwordAccess = (loginPass, loginEye) =>{
   const input = document.getElementById(loginPass),
         iconEye = document.getElementById(loginEye)

   iconEye.addEventListener('click', () =>{
      input.type === 'password' ? input.type = 'text' : input.type = 'password'
      iconEye.classList.toggle('ri-eye-fill')
      iconEye.classList.toggle('ri-eye-off-fill')
   })
}
passwordAccess('password','loginPassword')

/*=============== SHOW HIDE PASSWORD CREATE ACCOUNT ===============*/
const passwordRegister = (loginPass, loginEye) =>{
   const input = document.getElementById(loginPass),
         iconEye = document.getElementById(loginEye)

   iconEye.addEventListener('click', () =>{
      input.type === 'password' ? input.type = 'text' : input.type = 'password'
      iconEye.classList.toggle('ri-eye-fill')
      iconEye.classList.toggle('ri-eye-off-fill')
   })
}
passwordRegister('passwordCreate','loginPasswordCreate')
