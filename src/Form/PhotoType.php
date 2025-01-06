<?php

// src/Form/PhotoType.php
namespace App\Form;

use App\Entity\Photo;
use App\Entity\Album; // Import de l'entité Album
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PhotoType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class, [
                'attr' => ['placeholder' => 'title_photo_form'],
                'label' => false,
            ])
            ->add('album', EntityType::class, [
                'label' => false,
                'class' => Album::class, // Spécifie l'entité Album
                'choice_label' => 'nom_album', // Attribut affiché dans la liste déroulante
                'placeholder' => 'select_album_form', // Valeur par défaut
                'required' => true, // Rend ce champ obligatoire
            ])
            ->add('file', FileType::class, [
                'attr' => ['placeholder' => 'Photo (JPEG, PNG)'],
                'label' => false,
                'mapped' => false, // Ne lie pas ce champ à l'entité
                'required' => true,
                'constraints' => [
                    new \Symfony\Component\Validator\Constraints\File([
                        'maxSize' => '8M',
                        'mimeTypes' => ['image/jpeg', 'image/png'],
                        'mimeTypesMessage' => 'Veuillez télécharger une image au format JPEG ou PNG.',
                    ])
                ],
            ])
            ->add('download_photo', SubmitType::class, [
                'label' => 'publish',
            ]);
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Photo::class,
        ]);
    }
}
