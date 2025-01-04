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
use Symfony\Component\Validator\Constraints as Assert;

class RegistrationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('username', TextType::class, [
                'attr' => ['placeholder' => 'username'],
                'label' => false, // Désactive l'affichage du label
                'constraints' => [
                    new Assert\NotBlank(['message' => 'form.username.required']),
                    new Assert\Length([
                        'min' => 3,
                        'minMessage' => 'form.username.min_length',
                    ]),
                ],
            ])
            ->add('email', EmailType::class, [
                'attr' => ['placeholder' => 'email'],
                'label' => false,
                'constraints' => [
                    new Assert\NotBlank(['message' => 'form.email.required']),
                    new Assert\Email(['message' => 'form.email.invalid']),
                ],
            ])
            ->add('password', PasswordType::class, [
                'attr' => ['placeholder' => 'password'],
                'label' => false,
                'constraints' => [
                    new Assert\NotBlank(['message' => 'form.password.required']),
                    new Assert\Length([
                        'min' => 6,
                        'minMessage' => 'form.password.min_length',
                    ]),
                ],
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
