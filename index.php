<?php 
require_once 'includes/init.php';
?>
<!DOCTYPE html>
<html lang="<?php echo getHtmlLang(); ?>" dir="<?php echo getLangDirection(); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="/Datahub/assets/img/fav.png">
    <title>Datahub - <?php echo __('home'); ?></title>
    
    <!--=============== CSS ===============-->
    <link rel="stylesheet" href="/Datahub/assets/css/Landingstyles.css">

    <!--=============== REMIX ICONS ===============-->
    <link href="/Datahub/assets/fonts/remixicon.css" rel="stylesheet">

    <!-- TODO: Add RTL support for Persian -->
    <?php if ($current_lang == 'fa'): ?>
    <style>
        body {
            font-family: 'Vazir', Tahoma, 'Segoe UI', sans-serif;
        }
        .nav__menu {
            direction: rtl;
        }
        .features__card {
            text-align: right;
        }
        .home__data {
            text-align: right;
        }
    </style>

    <?php endif; ?>


</head>
<body>

    <!-- Language Switcher -->
    <a href="?lang=<?= $current_lang == 'en' ? 'fa' : 'en' ?>" class="btn-lang"><?= $current_lang == 'en' ? 'فا' : 'En' ?></a>

    <!--=============== HEADER ===============-->
    <header class="header" id="header">
        <nav class="nav container">
            <div class="nav__menu" id="nav-menu">
                <ul class="nav__list">
                    <li class="nav__item">
                        <a href="#home" class="nav__link active-link"><?php echo __('home'); ?></a>
                    </li>
                    <li class="nav__item">
                        <a href="#features" class="nav__link"><?php echo __('features'); ?></a>
                    </li>
                    <li class="nav__item">
                        <a href="#contact" class="nav__link"><?php echo __('contact_us'); ?></a>
                    </li>
                    <li class="nav__item">
                        <a href="Login.php" class="nav__link"><?php echo __('login_signup'); ?></a>
                    </li>
                </ul>
                <div class="nav__close" id="nav-close">
                    <i class="ri-close-line"></i>
                </div>
            </div>
            <div class="nav__toggle" id="nav-toggle">
                <i class="ri-function-line"></i>
            </div>
        </nav>
    </header>

    <main class="main">
        <!-- HOME section -->
        <section class="home section" id="home">
            <div class="home__container container grid">
                <div>
                    <img src="/Datahub/assets/img/hom.png" alt="" class="home__img">
                </div>
                <div class="home__data">
                    <div class="home__header">
                        <h1 class="home__title"><?php echo __('cloud'); ?></h1>
                        <h2 class="home__subtitle"><?php echo __('storage'); ?></h2>
                    </div>
                    <div class="home__footer">
                        <p class="home__description"><?php echo __('description'); ?></p>
                        <a href="../authentication/index.php" class="button button--flex">
                            <span class="button--flex">
                                <i class="ri-drive-line button__icon"></i><?php echo __('start_archiving'); ?>
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- FEATURES section -->
        <section class="features section" id="features">
            <div class="features__container container grid">
                <div class="features__card">
                    <div class="features__icon"><i class="ri-folder-line"></i></div>
                    <h3 class="features__title"><?php echo __('feature1_title'); ?></h3>
                    <p class="features__description"><?php echo __('feature1_desc'); ?></p>
                </div>
                <div class="features__card">
                    <div class="features__icon"><i class="ri-shield-line"></i></div>
                    <h3 class="features__title"><?php echo __('feature2_title'); ?></h3>
                    <p class="features__description"><?php echo __('feature2_desc'); ?></p>
                </div>
                <div class="features__card">
                    <div class="features__icon"><i class="ri-file-copy-line"></i></div>
                    <h3 class="features__title"><?php echo __('feature3_title'); ?></h3>
                    <p class="features__description"><?php echo __('feature3_desc'); ?></p>
                </div>
            </div>
        </section>
    </main>

    <!-- FOOTER -->
    <footer class="footer section">
        <div class="footer__container container grid">
            <div class="footer__content">
                <a href="#" class="footer__logo"><i class="ri-cloud-line" style="font-size: 2rem; color: #fed049;"></i></a>
                <p class="footer__description"><?php echo __('footer_description'); ?></p>
            </div>
            <div class="footer__content">
                <h3 class="footer__title"><?php echo __('quick_links'); ?></h3>
                <ul class="footer__links">
                    <li><a href="#home" class="footer__link"><?php echo __('home'); ?></a></li>
                    <li><a href="#features" class="footer__link"><?php echo __('features'); ?></a></li>
                    <li><a href="#pricing" class="footer__link"><?php echo __('pricing'); ?></a></li>
                    <li><a href="#faq" class="footer__link"><?php echo __('faq'); ?></a></li>
                </ul>
            </div>
            <div class="footer__content">
                <h3 class="footer__title"><?php echo __('support'); ?></h3>
                <ul class="footer__links">
                    <li><a href="#" class="footer__link"><?php echo __('help_center'); ?></a></li>
                    <li><a href="#" class="footer__link"><?php echo __('privacy_policy'); ?></a></li>
                    <li><a href="#" class="footer__link"><?php echo __('terms_service'); ?></a></li>
                    <li><a href="#" class="footer__link"><?php echo __('report_issue'); ?></a></li>
                </ul>
            </div>
            <div class="footer__content" id="contact">
                <h3 class="footer__title"><?php echo __('contact'); ?></h3>
                <div class="footer__contact-item"><i class="ri-mail-line"></i><span><?php echo __('team_email'); ?></span></div>
                <div class="footer__contact-item"><i class="ri-phone-line"></i><span><?php echo __('phone'); ?></span></div>
                <div class="footer__contact-item"><i class="ri-time-line"></i><span><?php echo __('hours'); ?></span></div>
            </div>
        </div>
        <div class="footer__bottom">
            <p class="footer__copy"><a href="#" class="footer__copy-link"><?php echo __('copyright'); ?></a></p>
        </div>
    </footer>

    <a href="#" class="scrollup" id="scroll-up"><i class="ri-arrow-up-s-line scrollup__icon"></i></a>

    <script src="/Datahub/assets/js/Landing.js"></script>
</body>
</html>