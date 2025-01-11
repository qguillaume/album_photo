<?php

// src/Controller/ThemeController.php
namespace App\Controller;

use App\Entity\Theme;
use App\Form\ThemeType;
use App\Repository\ThemeRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

class ThemeController extends AbstractController
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * @Route("/themes", name="theme_index")
     */
    public function index(ThemeRepository $themeRepository): Response
    {
        // Récupérer tous les thèmes depuis la base de données
        $themes = $themeRepository->findAll();

        return $this->render('theme/index.html.twig', [
            'themes' => $themes,
        ]);
    }

    /**
     * @Route("/theme/create", name="theme_create")
     */
    public function create(Request $request): Response
    {
        $theme = new Theme();
        $form = $this->createForm(ThemeType::class, $theme);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                $entityManager = $this->getDoctrine()->getManager();
                $entityManager->persist($theme);
                $entityManager->flush();

                // Redirection ou message de succès
            } catch (UniqueConstraintViolationException $e) {
                $this->addFlash('error', 'Un thème avec ce nom existe déjà.');
            }
        }

        return $this->render('theme/create.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/theme/{id}/edit", name="theme_edit")
     */
    public function edit(Request $request, Theme $theme): Response
    {
        $form = $this->createForm(ThemeType::class, $theme);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Mise à jour du thème dans la base de données
            $this->getDoctrine()->getManager()->flush();

            // Redirige vers la page de liste des thèmes
            return $this->redirectToRoute('theme_index');
        }

        return $this->render('theme/edit.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/theme/{id}/delete", name="theme_delete", methods="POST")
     */
    public function delete(Request $request, Theme $theme): Response
    {
        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->remove($theme);
        $entityManager->flush();
        return $this->redirectToRoute('theme_index');
    }

    /**
     * @Route("/themes_list", name="themes_list", methods={"GET"})
     */
    public function getThemes()
    {
        $themes = $this->entityManager->getRepository(Theme::class)->findAll();
        return $this->json($themes);
    }

    /**
     * @Route("/theme/{id}/edit_dashboard", name="theme_edit_dashboard", methods={"PUT"})
     */
    public function editFromDashboard(Request $request, EntityManagerInterface $em, int $id): JsonResponse
    {
        $comment = $em->getRepository(Theme::class)->find($id);

        if (!$comment) {
            return new JsonResponse(['message' => 'Thème non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $comment->setName($data['name']);
        $em->flush();

        return new JsonResponse(['message' => 'Thème modifié avec succès']);
    }
}
