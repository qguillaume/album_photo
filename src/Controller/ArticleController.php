<?php

namespace App\Controller;

use App\Entity\Article;
use App\Entity\Theme;
use App\Repository\ArticleRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use App\Form\ArticleFormType;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Component\Security\Core\Security;

class ArticleController extends AbstractController
{
    private $articleRepository;
    private $entityManager;
    private $security;

    public function __construct(ArticleRepository $articleRepository, EntityManagerInterface $entityManager, Security $security)
    {
        $this->articleRepository = $articleRepository;
        $this->entityManager = $entityManager;
        $this->security = $security;
    }

    /**
     * @Route("/api/article", name="api_article_create", methods={"POST"})
     */
    public function apiCreateArticle(Request $request): JsonResponse
    {
        // Vérifier que l'utilisateur est connecté
        $this->denyAccessUnlessGranted('ROLE_USER');

        // Récupérer les données envoyées dans le corps de la requête
        $data = json_decode($request->getContent(), true);

        // Créer un nouvel article
        $article = new Article();
        $article->setTitle($data['title']);
        $article->setContent($data['content']);
        $article->setPublished($data['published']);

        // Assigner l'auteur (l'utilisateur connecté)
        $user = $this->getUser();
        if ($user) {
            $article->setAuthor($user);
        }

        // Vérification et association du thème
        if (isset($data['theme']) && !empty($data['theme'])) {
            $theme = $this->entityManager->getRepository(Theme::class)->find($data['theme']);
            if ($theme) {
                $article->setTheme($theme);  // Assigner le thème à l'article
            } else {
                return new JsonResponse(['message' => 'Thème introuvable'], Response::HTTP_BAD_REQUEST);
            }
        } else {
            $article->setTheme(null);
        }

        // Sauvegarder l'article
        $this->entityManager->persist($article);
        $this->entityManager->flush();

        // Retourner une réponse JSON avec les détails de l'article créé
        return new JsonResponse([
            'message' => 'Article créé avec succès',
            'article' => [
                'id' => $article->getId(),
                'title' => $article->getTitle(),
                'content' => $article->getContent(),
                'author' => $article->getAuthor()->getUsername(),
                'createdAt' => $article->getCreatedAt()->format('Y-m-d H:i:s'),
                'published' => $article->isPublished(),
                'theme' => $article->getTheme() ? $article->getTheme()->getName() : null,
            ]
        ], Response::HTTP_CREATED);
    }

    /**
     * @Route("/articles_list", name="articles_list", methods={"GET"})
     */
    public function list()
    {
        // Récupérer tous les articles depuis la base de données
        $articles = $this->articleRepository->findAll();

        $articlesData = [];
        foreach ($articles as $article) {
            $articlesData[] =
                [
                    'id' => $article->getId(),
                    'title' => $article->getTitle(),
                    'content' => $article->getContent(),
                    'author' => [
                        'username' => $article->getAuthor()->getUsername(),
                    ],
                    'createdAt' => $article->getCreatedAt()->format('Y-m-d H:i:s'),
                    'updatedAt' => $article->getUpdatedAt() ? $article->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                    'published' => $article->isPublished(),
                ];
        }

        return new JsonResponse($articlesData);
    }

    /**
     * @Route("/articles", name="articles_index", methods={"GET"})
     */
    public function index(Request $request, PaginatorInterface $paginator): Response
    {
        // Vérifier que l'utilisateur est connecté et a le rôle requis
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        // Récupérer l'utilisateur connecté
        $user = $this->getUser();

        // Construire la requête en fonction des rôles
        $queryBuilder = $this->articleRepository->createQueryBuilder('a')
            ->orderBy('a.createdAt', 'DESC');

        // Si l'utilisateur est admin mais pas superadmin, filtrer par ses propres articles
        if ($this->isGranted('ROLE_ADMIN') && !$this->isGranted('ROLE_SUPER_ADMIN')) {
            $queryBuilder->where('a.author = :user')
                ->setParameter('user', $user);
        }

        // Exécuter la requête
        $query = $queryBuilder->getQuery();

        // Paginer les résultats
        $articles = $paginator->paginate(
            $query,
            $request->query->getInt('page', 1), // Page actuelle
            10 // Articles par page
        );

        return $this->render('article/index.html.twig', [
            'articles' => $articles,
        ]);
    }

    /**
     * @Route("/article/{id}", name="article_show", methods={"GET"})
     */
    public function show(int $id): Response
    {
        // Vérifier que l'utilisateur est connecté
        $this->denyAccessUnlessGranted('ROLE_USER');

        $article = $this->articleRepository->find($id);

        if (!$article) {
            throw $this->createNotFoundException('Article non trouvé');
        }

        return $this->render('article/show.html.twig', [
            'article' => $article,
        ]);
    }

    /**
     * @Route("/articles/new", name="article_create", methods={"GET", "POST"})
     */
    public function createArticle(Request $request): Response
    {
        // Vérifier que l'utilisateur est connecté
        $this->denyAccessUnlessGranted('ROLE_USER');

        $article = new Article();
        $user = $this->getUser();

        if (!$user) {
            return $this->redirectToRoute('app_login');
        }

        $form = $this->createForm(ArticleFormType::class, $article, [
            'author' => $user // Passe l'utilisateur au formulaire
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Assigner l'objet User à l'article
            $article->setAuthor($user);

            // Sauvegarder l'article
            $this->entityManager->persist($article);
            $this->entityManager->flush();

            // Rediriger vers la page de l'article créé
            return $this->redirectToRoute('article_show', ['id' => $article->getId()]);
        }

        return $this->render('article/create.html.twig', [
            'form' => $form->createView(),
            'user' => $user,
        ]);
    }

    /**
     * @Route("/article/{id}/edit", name="article_edit", methods={"GET", "POST"})
     */
    public function edit(int $id, Request $request): Response
    {
        $article = $this->articleRepository->find($id);
        // Vérifier que l'utilisateur est l'auteur de l'article
        if ($article->getAuthor() !== $this->getUser()) {
            throw new AccessDeniedException('Vous ne pouvez pas modifier cet article.');
        }

        if (!$article) {
            return $this->json(['message' => 'Article non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $form = $this->createForm(ArticleFormType::class, $article);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->entityManager->flush();
            return $this->redirectToRoute('article_show', ['id' => $article->getId()]);
        }

        return $this->render('article/edit.html.twig', [
            'form' => $form->createView()
        ]);
    }

    /**
     * @Route("/article/{id}/edit_dashboard", name="article_edit_dashboard", methods={"PUT"})
     */
    public function editFromDashboard(Request $request, EntityManagerInterface $em, int $id): JsonResponse
    {
        $article = $em->getRepository(Article::class)->find($id);

        if (!$article) {
            return new JsonResponse(['message' => 'Article non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $article->setContent($data['content']);
        $em->flush();

        return new JsonResponse(['message' => 'Texte de article modifie avec succès']);
    }

    /**
     * @Route("/article/{id}/delete", name="article_delete", methods={"POST"})
     */
    public function delete(int $id): Response
    {
        $article = $this->articleRepository->find($id);
        // Vérifier que l'utilisateur est l'auteur de l'article
        if ($article->getAuthor() !== $this->getUser()) {
            throw new AccessDeniedException('Vous ne pouvez pas modifier cet article.');
        }

        if (!$article) {
            return $this->json(['message' => 'Article non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($article);
        $this->entityManager->flush();

        return $this->redirectToRoute('articles');
    }
}
