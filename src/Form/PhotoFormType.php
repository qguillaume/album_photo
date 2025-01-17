<?php

// src/Form/PhotoFormType.php
namespace App\Form;

use App\Entity\Photo;
use App\Entity\Album;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use App\Repository\AlbumRepository;
use Doctrine\ORM\EntityRepository;

class PhotoFormType extends AbstractType
{
    private $albumRepository;

    public function __construct(AlbumRepository $albumRepository)
    {
        $this->albumRepository = $albumRepository;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class, [
                'attr' => ['placeholder' => 'title_photo_form'],
                'label' => false,
            ])
            ->add('album', EntityType::class, [
                'label' => false,
                'class' => Album::class,
                'choice_label' => 'nom_album',
                'placeholder' => 'select_album_form',
                'required' => true,
                'query_builder' => function (EntityRepository $er) use ($options) {
                    $user = $options['user']; // Passer l'utilisateur comme option
                    return $this->albumRepository->findByCreator($user);
                },
            ])
            ->add('file', FileType::class, [
                'attr' => ['placeholder' => 'Photo (JPEG, PNG)'],
                'label' => false,
                'mapped' => false,
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
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Photo::class,
            'user' => null, // Ajouter un utilisateur en option
            'album_id' => null, // album_id facultatif (existe en cas de choix prédéfini à partir d'un album vide)
        ]);
    }
}