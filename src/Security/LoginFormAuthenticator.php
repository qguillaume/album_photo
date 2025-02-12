<?php

// src/Security/LoginFormAuthenticator.php
namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use App\Entity\User;
use Symfony\Contracts\Translation\TranslatorInterface;

class LoginFormAuthenticator extends AbstractAuthenticator implements AuthenticationEntryPointInterface
{
    private $urlGenerator;
    private $entityManager;
    private $session;
    private $translator;

    public function __construct(
        UrlGeneratorInterface $urlGenerator,
        EntityManagerInterface $entityManager,
        SessionInterface $session,
        TranslatorInterface $translator
    ) {
        $this->urlGenerator = $urlGenerator;
        $this->entityManager = $entityManager;
        $this->session = $session;
        $this->translator = $translator;
    }

    public function supports(Request $request): ?bool
    {
        return $request->getPathInfo() === '/login' && $request->isMethod('POST');
    }

    public function authenticate(Request $request): Passport
    {
        // Récupérer les données du formulaire
        $formData = $request->request->get('login_form');
        $username = $formData['username'] ?? null;
        $password = $formData['password'] ?? null;
        $submittedCaptcha = $formData['captcha'] ?? null;

        // Récupérer le captcha stocké en session
        $storedCaptcha = $this->session->get('captcha');

        // Valider le captcha
        if ($submittedCaptcha !== $storedCaptcha) {
            throw new AuthenticationException($this->translator->trans('invalid_captcha', [], 'messages'));
        }

        if (null === $username || '' === $username) {
            throw new AuthenticationException('Le nom d\'utilisateur est requis.');
        }

        // Vérifier si l'utilisateur existe
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['username' => $username]);

        if (!$user) {
            throw new AuthenticationException($this->translator->trans('invalid_credentials', [], 'messages'));
        }

        // Vérifier le mot de passe
        if (!password_verify($password, $user->getPassword())) {
            throw new AuthenticationException($this->translator->trans('invalid_credentials', [], 'messages'));
        }

        return new SelfValidatingPassport(
            new UserBadge($username, function ($username) {
                return $this->entityManager->getRepository(User::class)->findOneBy(['username' => $username]);
            })
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        // Rediriger vers la page d'accueil après une connexion réussie
        return new RedirectResponse($this->urlGenerator->generate('portfolio_home'));
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        // Récupère la clé de l'exception (ex : invalid_credentials ou invalid_captcha)
        $errorKey = $exception->getMessageKey();

        // Traduit la clé de l'erreur
        $translatedErrorMessage = $this->translator->trans($errorKey, [], 'messages');

        // Ajoute le message traduit dans les messages flash
        $request->getSession()->getFlashBag()->add('error', $translatedErrorMessage);

        // Redirige vers la page de login avec le message flash
        return new RedirectResponse($this->urlGenerator->generate('login'));
    }

    public function start(Request $request, AuthenticationException $authException = null): Response
    {
        // Redirigez l'utilisateur vers la page de connexion
        return new RedirectResponse($this->urlGenerator->generate('login'));
    }
}