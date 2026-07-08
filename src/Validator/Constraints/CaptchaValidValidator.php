<?php

// src/Validator/Constraints/CaptchaValidValidator.php
namespace App\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\HttpFoundation\RequestStack;

class CaptchaValidValidator extends ConstraintValidator
{
    public function __construct(private RequestStack $requestStack)
    {
    }

    public function validate($value, Constraint $constraint)
    {
        if (null === $value || '' === $value) {
            return;
        }

        $storedCaptcha = $this->requestStack->getSession()->get('captcha');

        if ($value !== $storedCaptcha) {
            $this->context->buildViolation($constraint->message)
                ->addViolation();
        }
    }
}