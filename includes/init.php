<?php
session_start();

$available_langs = ['en', 'fa'];
$default_lang = 'fa';

// Get current language
function getCurrentLanguage() {
    global $available_langs, $default_lang;
    
    if (isset($_GET['lang']) && in_array($_GET['lang'], $available_langs)) {
        $_SESSION['lang'] = $_GET['lang'];
        setcookie('lang', $_GET['lang'], time() + (86400 * 30), "/");
        return $_GET['lang'];
    }
    
    if (isset($_SESSION['lang']) && in_array($_SESSION['lang'], $available_langs)) {
        return $_SESSION['lang'];
    }
    
    if (isset($_COOKIE['lang']) && in_array($_COOKIE['lang'], $available_langs)) {
        $_SESSION['lang'] = $_COOKIE['lang'];
        return $_COOKIE['lang'];
    }
    
    if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
        $browser_lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
        if ($browser_lang == 'fa') return 'fa';
        if (in_array($browser_lang, $available_langs)) return $browser_lang;
    }
    
    return $default_lang;
}

$current_lang = getCurrentLanguage();

// Load translations globally (only ONCE for all pages)
$GLOBALS['translations'] = include dirname(__DIR__) . "/lang/{$current_lang}.php";

// Simple translation function (auto-works on all pages)
function __($key) {
    return $GLOBALS['translations'][$key] ?? $key;
}

// Helper functions
function getLangDirection() {
    global $current_lang;
    return $current_lang === 'fa' ? 'rtl' : 'ltr';
}

function getHtmlLang() {
    global $current_lang;
    return $current_lang === 'fa' ? 'fa' : $current_lang;
}

// Language switcher URL helper
function lang_url($page = '') {
    global $current_lang;
    $other_lang = $current_lang === 'en' ? 'fa' : 'en';
    return $page . '?lang=' . $other_lang;
}
?>