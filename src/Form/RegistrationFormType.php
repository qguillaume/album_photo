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
use Symfony\Contracts\Translation\TranslatorInterface;

class RegistrationFormType extends AbstractType
{
    private $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('username', TextType::class, [
                'attr' => ['placeholder' => 'username'],
                'label' => false, // Désactive l'affichage du label
                'constraints' => [
                    new Assert\NotBlank(['message' => $this->translator->trans('username_required')]),
                    new Assert\Length([
                        'min' => 3,
                        'minMessage' => $this->translator->trans('username_min_length', ['{{ limit }}' => 3]),
                    ]),
                ],
            ])
            ->add('email', EmailType::class, [
                'attr' => ['placeholder' => 'email'],
                'label' => false,
                'constraints' => [
                    new Assert\NotBlank(['message' => $this->translator->trans('email_required')]),
                    new Assert\Email(['message' => $this->translator->trans('email_invalid')]),
                ],
            ])
            ->add('password', PasswordType::class, [
                'attr' => ['placeholder' => 'password'],
                'label' => false,
                'constraints' => [
                    new Assert\NotBlank(['message' => $this->translator->trans('password_required')]),
                    new Assert\Length([
                        'min' => 8,
                        'minMessage' => $this->translator->trans('password_min_length', ['{{ limit }}' => 8]),
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
