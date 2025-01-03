<?php

// src/Form/RegistrationFormType.php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class RegistrationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('username', TextType::class, [
                'attr' => ['placeholder' => 'username'],
                'label' => false, // Désactive l'affichage du label
            ])
            ->add('email', EmailType::class, [
                'attr' => ['placeholder' => 'email'],
                'label' => false,
            ])
            ->add('password', PasswordType::class, [
                'attr' => ['placeholder' => 'password'],
                'label' => false,
            ])
            ->add('register', SubmitType::class, [
                'label' => 'inscription',
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
