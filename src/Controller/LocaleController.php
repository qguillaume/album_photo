<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\Translation\TranslatorInterface;

class LocaleController
{
    public function changeLocale(Request $request, SessionInterface $session): RedirectResponse
    {
        $locale = $request->query->get('locale', 'fr');
        $session->set('_locale', $locale);

        // Récupère l'URL de la page précédente
        $referer = $request->headers->get('referer');

        // Redirection avec la langue mise à jour
        if ($referer) {
            $parsedUrl = parse_url($referer);
            parse_str($parsedUrl['query'] ?? '', $queryParams);

            // Remplacer ou ajouter le paramètre locale
            $queryParams['locale'] = $locale;

            // Reconstruire l'URL avec les nouveaux paramètres
            $newUrl = $parsedUrl['path'] . '?' . http_build_query($queryParams);

            return new RedirectResponse($newUrl);
        }

        // Si aucune page précédente, redirige vers la page d'accueil avec la locale mise à jour
        return new RedirectResponse('/?locale=' . $locale);
    }

    public function testTranslation(TranslatorInterface $translator): Response
    {
        $translated = $translator->trans('hello');
        return new Response($translated);
    }
}
