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

class ContactFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', TextType::class, [
                'attr' => ['placeholder' => 'name'],
                'label' => false,
                'constraints' => [
                    new Assert\NotBlank(['message' => 'form.name.required']),
                    new Assert\Length([
                        'min' => 3,
                        'minMessage' => 'form.name.min_length',
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
            ->add('message', TextareaType::class, [
                'attr' => ['placeholder' => 'message'],
                'label' => false,
                'constraints' => [
                    new Assert\NotBlank(['message' => 'form.message.required']),
                    new Assert\Length([
                        'min' => 10,
                        'minMessage' => 'form.message.min_length',
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