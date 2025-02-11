<?php

// src/Validator/Constraints/CaptchaValid.php
namespace App\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class CaptchaValid extends Constraint
{
    public $message = 'Le captcha est incorrect.';
}