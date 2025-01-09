<?php

// src/Form/ArticleFormType.php

namespace App\Form;

use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use App\Entity\Article;
use App\Entity\User;

class ArticleFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class)
            ->add('content', TextareaType::class, [
                'label' => 'Contenu',
                'attr' => [
                    'class' => 'tinymce',  // Cette classe peut être utilisée pour personnaliser le champ si nécessaire
                ]
            ])
            // Utiliser EntityType pour lier l'entité User
            ->add('author', EntityType::class, [
                'class' => User::class, // Spécifie la classe User
                'choice_label' => 'username', // Le champ à afficher pour l'utilisateur
                'data' => $options['author'], // Passe l'utilisateur connecté comme valeur par défaut
                'disabled' => true, // Empêche l'utilisateur de modifier l'auteur
            ])
            ->add('published', CheckboxType::class, [
                'required' => false,
                'label' => 'Publié',
            ])
            ->add('save', SubmitType::class, [
                'label' => 'Enregistrer',
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Article::class,
            'author' => null, // On peut ajouter l'auteur comme option du formulaire
        ]);
    }
}
