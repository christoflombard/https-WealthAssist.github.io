<?php
/**
 * Wealth Assist Magic Child Theme Functions
 */

function wealthassist_magic_enqueue_styles() {
    // Enqueue the parent theme's stylesheet
    wp_enqueue_style( 'hello-elementor-style', get_template_directory_uri() . '/style.css' );
    
    // Enqueue our magic child theme's stylesheet
    wp_enqueue_style( 'wealthassist-magic-style',
        get_stylesheet_directory_uri() . '/style.css',
        array( 'hello-elementor-style' ),
        '1.0.0'
    );
}
add_action( 'wp_enqueue_scripts', 'wealthassist_magic_enqueue_styles' );