<?php 
require_once 'includes/init.php';

// Check if user is already logged in
if (isset($_SESSION["user_id"])) {
    header("Location: dashboard/");
    exit();
}
?>
<!DOCTYPE html>
<html lang="<?= getHtmlLang() ?>" dir="<?= getLangDirection() ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="/Datahub/assets/img/fav.png">
    <title>Datahub - <?= __('login') ?></title>
    
    
    <!--=============== CSS ===============-->
    <link rel="stylesheet" href="/Datahub/assets/css/LoginStyles.css">
    <link rel="stylesheet" href="/Datahub/assets/css/toast.css">
    <!--=============== REMIX ICONS ===============-->
    <link href="/Datahub/assets/fonts/remixicon.css" rel="stylesheet">
</head>
<body>

    <!-- Language Switcher -->
    <a href="?lang=<?= $current_lang == 'en' ? 'fa' : 'en' ?>" class="btn-lang"><?= $current_lang == 'en' ? 'فا' : 'En' ?></a>
    <!--=============== LOGIN IMAGE ===============-->
    <svg class="login__blob" viewBox="0 0 566 840" xmlns="http://www.w3.org/2000/svg">
        <mask id="mask0" mask-type="alpha">
            <path d="M342.407 73.6315C388.53 56.4007 394.378 17.3643 391.538 
            0H566V840H0C14.5385 834.991 100.266 804.436 77.2046 707.263C49.6393 
            591.11 115.306 518.927 176.468 488.873C363.385 397.026 156.98 302.824 
            167.945 179.32C173.46 117.209 284.755 95.1699 342.407 73.6315Z"/>
        </mask>
        
        <g mask="url(#mask0)">
            <path d="M342.407 73.6315C388.53 56.4007 394.378 17.3643 391.538 
            0H566V840H0C14.5385 834.991 100.266 804.436 77.2046 707.263C49.6393 
            591.11 115.306 518.927 176.468 488.873C363.385 397.026 156.98 302.824 
            167.945 179.32C173.46 117.209 284.755 95.1699 342.407 73.6315Z"/>
            
            <image class="login__img" href="/Datahub/assets/img/bg-img.jpg"/>
        </g>
    </svg>      

    <!--=============== LOGIN ===============-->
    <div class="login container grid" id="loginAccessRegister">
        <!--===== LOGIN ACCESS =====-->
        <div class="login__access">
            <h1 class="login__title"><?= __('log_in_account') ?></h1>
            
            <div class="login__area">
                <form action="" class="login__form" id="loginForm">
                    <div class="login__content grid">
                        <div class="login__box">
                            <input type="email" id="email" required placeholder=" " class="login__input">
                            <label for="email" class="login__label"><?= __('email') ?></label>
                            
                            <i class="ri-mail-fill login__icon"></i>
                        </div>
                        
                        <div class="login__box">
                            <input type="password" id="password" required placeholder=" " class="login__input">
                            <label for="password" class="login__label"><?= __('password') ?></label>
                            
                            <i class="ri-eye-off-fill login__icon login__password" id="loginPassword"></i>
                        </div>
                    </div>
                    
                    <a href="#" class="login__forgot"><?= __('forgot_password') ?></a>
                    
                    <button type="submit" class="login__button"><?= __('login') ?></button>
                </form>
                
                <div class="login__social">
                    <p class="login__social-title"><?= __('or_login_with') ?></p>
                    
                    <div class="login__social-links">
                        <a href="#" class="login__social-link">
                            <i class="ri-google-fill" style="color: #fed049;"></i>
                        </a>
                        
                        <a href="#" class="login__social-link">
                            <i class="ri-facebook-circle-fill" style="color: #fed049;"></i>
                        </a>
                        
                        <a href="#" class="login__social-link">
                            <i class="ri-apple-fill" style="color: #fed049;"></i>
                        </a>
                    </div>
                </div>
                
                <p class="login__switch">
                    <?= __('dont_have_account') ?> 
                    <button id="loginButtonRegister"><?= __('create_account') ?></button>
                </p>
            </div>
        </div>

        <!--===== LOGIN REGISTER =====-->
        <div class="login__register">
            <h1 class="login__title"><?= __('create_new_account') ?></h1>
            <div class="login__area">
                <form action="" class="login__form" id="registerForm">
                    <div class="login__content grid">
                        <div class="login__box">
                            <input type="text" id="names" required placeholder=" " class="login__input">
                            <label for="names" class="login__label"><?= __('username') ?></label>
                            <i class="ri-id-card-fill login__icon"></i>
                        </div>

                        <div>
                            <div class="login__box">
                                <input type="email" id="emailCreate" required placeholder=" " class="login__input" onkeyup="validateEmailOnInput()">
                                <label for="emailCreate" class="login__label"><?= __('email') ?></label>
                                <i class="ri-mail-fill login__icon"></i>
                            </div>
                            <small id="emailMsg" class="login__message"></small>
                        </div>

                        <div>
                            <div class="login__box">
                                <input type="password" id="passwordCreate" required placeholder=" " class="login__input" onkeyup="validatePasswordOnInput()">
                                <label for="passwordCreate" class="login__label"><?= __('password') ?></label>
                                <i class="ri-eye-off-fill login__icon login__password" id="loginPasswordCreate"></i>
                            </div>
                            <small id="passwordMsg" class="login__message"></small>
                        </div>
                    </div>
                    <button type="submit" class="login__button"><?= __('create_account') ?></button>
                </form>
                <p class="login__switch">
                    <?= __('already_have_account') ?> 
                    <button id="loginButtonAccess"><?= __('log_in') ?></button>
                </p>
            </div>
        </div>
    </div>
    
    <!-- Pass translations to JavaScript -->
    <script>
        window.translations = {
        // Validation messages
        'email_required': '<?= __('email_required') ?>',
        'email_invalid': '<?= __('email_invalid') ?>',
        'email_exists': '<?= __('email_exists') ?>',
        'email_available': '<?= __('email_available') ?>',
        'email_check_error': '<?= __('email_check_error') ?>',
        'password_required': '<?= __('password_required') ?>',
        'password_min_length': '<?= __('password_min_length') ?>',
        'password_requirements': '<?= __('password_requirements') ?>',
        'password_strong': '<?= __('password_strong') ?>',
        'username_required': '<?= __('username_required') ?>',
        'required_field': '<?= __('required_field') ?>',
        'fix_errors': '<?= __('fix_errors') ?>',
        
        // Success/Error messages
        'login_success': '<?= __('login_success') ?>',
        'login_failed': '<?= __('login_failed') ?>',
        'register_success': '<?= __('register_success') ?>',
        'register_failed': '<?= __('register_failed') ?>',
        'connection_error': '<?= __('connection_error') ?>'
    };
    </script>
    
    <!--=============== MAIN JS ===============-->
    <script src="/Datahub/assets/js/toast.js"></script>  
    <script src="/Datahub/assets/js/Login.js"></script>
</body>
</html>