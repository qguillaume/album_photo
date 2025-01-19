<?php

// src/Form/ContactFormType.php
namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Contracts\Translation\TranslatorInterface;

class ContactFormType extends AbstractType
{
    private $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', TextType::class, [
                'attr' => ['placeholder' => 'name'],
                'label' => false,
                'constraints' => [
                    new Assert\NotBlank(['message' => 'form.name_required']),
                    new Assert\Length([
                        'min' => 3,
                        'minMessage' => $this->translator->trans('form.name_min_length', ['{{ limit }}' => 3]),
                    ]),
                ],
            ])
            ->add('email', EmailType::class, [
                'attr' => ['placeholder' => 'email'],
                'label' => false,
                'constraints' => [
                    new Assert\NotBlank(['message' => $this->translator->trans('form.email_required')]),
                    new Assert\Email(['message' => $this->translator->trans('form.email_invalid')]),
                ],
            ])
            ->add('message', TextareaType::class, [
                'attr' => ['placeholder' => 'message'],
                'label' => false,
                'constraints' => [
                    new Assert\NotBlank(['message' => $this->translator->trans('form.message_required')]),
                    new Assert\Length([
                        'min' => 10,
                        'minMessage' => $this->translator->trans('form.message_min_length', ['{{ limit }}' => 10]),
                    ]),
                ],
            ])
            ->add('send', SubmitType::class, [
                'label' => 'form.send',
            ]);
    }

    /*public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => null,
        ]);
    }*/
}