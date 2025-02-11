<?php

// src/Validator/Constraints/CaptchaValidValidator.php
namespace App\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class CaptchaValidValidator extends ConstraintValidator
{
    private $session;

    public function __construct(SessionInterface $session)
    {
        $this->session = $session;
    }

    public function validate($value, Constraint $constraint)
    {
        if (null === $value || '' === $value) {
            return;
        }

        $storedCaptcha = $this->session->get('captcha');

        if ($value !== $storedCaptcha) {
            $this->context->buildViolation($constraint->message)
                ->addViolation();
        }
    }
}