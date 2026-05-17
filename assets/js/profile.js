document.addEventListener('DOMContentLoaded', function() {
    
    const infoForm = document.getElementById('infoForm');
    if (infoForm) {
        infoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(infoForm);
            formData.append('action', 'Change_Username');
            
            const submitBtn = infoForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> ${__('updating')}`;
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/Datahub/Handlers/ProfileHandler.php', {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage(__(data.message), 'success');
                    // Update displayed username
                    const usernameInput = infoForm.querySelector('input[name="username"]');
                    if (usernameInput) {
                        usernameInput.value = usernameInput.value;
                    }
                    // Update session username display in header if exists
                    const usernameDisplay = document.querySelector('.user-name');
                    if (usernameDisplay) {
                        usernameDisplay.textContent = usernameInput.value;
                    }
                } else {
                    showMessage(__(data.message) || data.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage(__('connection_error'), 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Handle Password Change Form
    const passwordForm = document.getElementById('passwordForm');
    // Add real-time password validation
        const newPasswordInput = passwordForm.querySelector('input[name="new_password"]');
        const confirmPasswordInput = passwordForm.querySelector('input[name="confirm_password"]');
        
    if (passwordForm) {
        
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', function() {
                validatePasswordStrength(this.value);
            });
        }
        
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', function() {
                validatePasswordMatch();
            });
        }
        
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPassword = passwordForm.querySelector('input[name="current_password"]').value;
            const newPassword = passwordForm.querySelector('input[name="new_password"]').value;
            const confirmPassword = passwordForm.querySelector('input[name="confirm_password"]').value;
            
            // Client-side validation
            if (!currentPassword) {
                showMessage(__('current_password_required'), 'error');
                return;
            }
            
            if (!newPassword) {
                showMessage(__('new_password_required'), 'error');
                return;
            }
            
            if (newPassword.length < 8) {
                showMessage(__('password_too_short'), 'error');
                return;
            }
            
            // Check password strength
            const strengthResult = checkPasswordStrength(newPassword);
            if (!strengthResult.valid) {
                showMessage(strengthResult.message, 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showMessage(__('passwords_do_not_match'), 'error');
                return;
            }
            
            if (currentPassword === newPassword) {
                showMessage(__('same_as_current'), 'error');
                return;
            }
            
            const formData = new FormData();
            formData.append('action', 'Change_Password');
            formData.append('current_password', currentPassword);
            formData.append('new_password', newPassword);
            formData.append('confirm_new_password', confirmPassword);
            
            const submitBtn = passwordForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> ${__('updating')}`;
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/Datahub/Handlers/ProfileHandler.php', {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage(__(data.message) || data.message, 'success');
                    // Clear password fields
                    passwordForm.reset();
                    // Clear validation messages
                    clearPasswordValidation();
                } else {
                    showMessage(__(data.message) || data.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage(__('connection_error'), 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
   
    // Password strength validation
    function checkPasswordStrength(password) {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            return {
                valid: false,
                message: __('password_weak')
            };
        }
        
        return {
            valid: true,
            message: ''
        };
    }
    
    // Real-time password strength display
    function validatePasswordStrength(password) {
        // Remove existing strength indicator
        const existingIndicator = document.querySelector('.password-strength');
        if (existingIndicator) existingIndicator.remove();
        
        const formGroup = newPasswordInput.closest('.form-group');
        
        if (password.length > 0) {
            const strengthIndicator = document.createElement('div');
            strengthIndicator.className = 'password-strength';
            
            let strength = 0;
            let strengthText = '';
            let strengthColor = '';
            
            if (password.length >= 8) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[a-z]/.test(password)) strength++;
            if (/\d/.test(password)) strength++;
            
            if (strength <= 2) {
                strengthText = __('password_weak');
                strengthColor = '#dc3545';
            } else if (strength === 3) {
                strengthText = __('password_medium');
                strengthColor = '#ffc107';
            } else {
                strengthText = __('password_strong');
                strengthColor = '#28a745';
            }
            
            strengthIndicator.innerHTML = `
                <small style="color: ${strengthColor}; display: block; margin-top: 5px;">
                    ${strengthText}
                </small>
            `;
            
            formGroup.appendChild(strengthIndicator);
        }
    }
    
    // Validate password match
    function validatePasswordMatch() {
        const newPassword = newPasswordInput?.value || '';
        const confirmPassword = confirmPasswordInput?.value || '';
        
        // Remove existing match indicator
        const existingMatch = document.querySelector('.password-match');
        if (existingMatch) existingMatch.remove();
        
        const formGroup = confirmPasswordInput.closest('.form-group');
        
        if (confirmPassword.length > 0) {
            const matchIndicator = document.createElement('div');
            matchIndicator.className = 'password-match';
            
            if (newPassword === confirmPassword) {
                matchIndicator.innerHTML = `
                    <small style="color: #28a745; display: block; margin-top: 5px;">
                        <i class="ri-checkbox-circle-line"></i> ${__('passwords_match')}
                    </small>
                `;
            } else {
                matchIndicator.innerHTML = `
                    <small style="color: #dc3545; display: block; margin-top: 5px;">
                        <i class="ri-error-warning-line"></i> ${__('passwords_do_not_match')}
                    </small>
                `;
            }
            
            formGroup.appendChild(matchIndicator);
        }
    }
     

    function clearPasswordValidation() {
        const indicators = document.querySelectorAll('.password-strength, .password-match');
        indicators.forEach(indicator => indicator.remove());
    }
});

    function showMessage(message, type) {
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            alert(message);
        }
    }