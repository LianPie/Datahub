<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Datahub</title>
    <!--=============== CSS ===============-->
    <link rel="stylesheet" href="assets/css/styles.css">

    <!--=============== REMIX ICONS ===============-->
    <link href="assets/fonts/remixicon.css" rel="stylesheet">

    <!-- =============== FAVICON ===============
    <link rel="shortcut icon" href="" type="image/x-icon"> -->

</head>
<body>



    <!--=============== LOGIN ===============-->
      <div class="login container grid" id="loginAccessRegister">
         <!--===== LOGIN ACCESS =====-->
         <div class="login__access">
            <h1 class="login__title">Log in to your account.</h1>
            
            <div class="login__area">
               <form action="" class="login__form">
                  <div class="login__content grid">
                     <div class="login__box">
                        <input type="email" id="email" required placeholder=" " class="login__input">
                        <label for="email" class="login__label">Email</label>
            
                        <i class="ri-mail-fill login__icon"></i>
                     </div>
         
                     <div class="login__box">
                        <input type="password" id="password" required placeholder=" " class="login__input">
                        <label for="password" class="login__label">Password</label>
            
                        <i class="ri-eye-off-fill login__icon login__password" id="loginPassword"></i>
                     </div>
                  </div>
         
                  <a href="#" class="login__forgot">Forgot your password?</a>
         
                  <button type="submit" class="login__button">Login</button>
               </form>
      
               <div class="login__social">
                  <p class="login__social-title">Or login with</p>
      
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
                  Don't have an account? 
                  <button id="loginButtonRegister">Create Account</button>
               </p>
            </div>
         </div>

         <!--===== LOGIN REGISTER =====-->
         <div class="login__register">
            <h1 class="login__title">Create new account.</h1>

            <div class="login__area">
               <form action="" class="login__form">
                  <div class="login__content grid">
                        <div class="login__box">
                           <input type="text" id="names" required placeholder=" " class="login__input">
                           <label for="names" class="login__label">Username</label>
      
                           <i class="ri-id-card-fill login__icon"></i>
                        </div>
         
                     <div class="login__box">
                        <input type="email" id="emailCreate" required placeholder=" " class="login__input">
                        <label for="emailCreate" class="login__label">Email</label>
   
                        <i class="ri-mail-fill login__icon"></i>
                     </div>
   
                     <div class="login__box">
                        <input type="password" id="passwordCreate" required placeholder=" " class="login__input">
                        <label for="passwordCreate" class="login__label">Password</label>
   
                        <i class="ri-eye-off-fill login__icon login__password" id="loginPasswordCreate"></i>
                     </div>
                  </div>
   
                  <button type="submit" class="login__button">Create account</button>
               </form>
   
               <p class="login__switch">
                  Already have an account? 
                  <button id="loginButtonAccess">Log In</button>
               </p>
            </div>
         </div>
      </div>
    
</body>
</html>