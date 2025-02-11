<?php

// src/Form/LoginFormType.php
namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

class LoginFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('username', TextType::class, [
                'label' => "" . $options['captcha'],
            ])
            ->add('password', PasswordType::class, [
                'label' => false,
            ])
            ->add('captcha', TextType::class, [
                'label' => 'Entrez le captcha :',
                'required' => true,
                'mapped' => false,
            ])
            ->add('captcha_hidden', HiddenType::class, [
                'mapped' => false,
                'data' => $options['captcha'],
            ])
            ->add('login', SubmitType::class, [
                'label' => 'GO !',
            ]);

        // Vérification du captcha lors de la soumission du formulaire
        $builder->addEventListener(FormEvents::PRE_SUBMIT, function (FormEvent $event) {

            $data = $event->getData(); // Données soumises
            $form = $event->getForm(); // Formulaire

            $submittedCaptcha = $data['captcha'] ?? null;
            $hiddenCaptcha = $data['captcha_hidden'] ?? null;

            if ($submittedCaptcha !== $hiddenCaptcha) {
                $form->get('captcha')->addError(new \Symfony\Component\Form\FormError('Le captcha est incorrectqq.'));
            }
        });
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'captcha' => '',
        ]);
    }
}
