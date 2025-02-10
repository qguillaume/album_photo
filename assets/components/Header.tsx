import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext'; // Hook
import '../styles/components/_header.scss';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useUser(); // Récupère l'utilisateur depuis le contexte.

  // Vérifications des rôles
  const isLoggedIn = !!user;
  const isAdmin = isLoggedIn && user?.roles?.includes('ROLE_ADMIN');
  const isSuperAdmin = isLoggedIn && user?.roles?.includes('ROLE_SUPER_ADMIN');

  // Basculer le menu burger
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="hamburger-menu" onClick={toggleMenu}>
        ☰
      </div>

      {/* Menu de navigation */}
      <nav className={`nav-menu ${menuOpen ? 'active' : ''}`}>
        <div className="header-left">
          <a href="/" className={window.location.pathname === '/' ? 'active' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </a>
          {isLoggedIn ? (
            <div className="dropdown">
              <a href="#" className={window.location.pathname === '/photos' ? 'active' : ''}>
                <span className="desktop-only">{t('photos')}</span>
                <svg className="mobile-only" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M21 7h-4.2l-1.7-2.4c-.3-.4-.8-.6-1.3-.6H10c-.5 0-1 .2-1.3.6L7 7H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-9 12c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/>
                </svg>
              </a>
              <div className="dropdown-content">
                <a href="/photos">{t('see_photos')}</a>
                <a href="/album/new">{t('create_album')}</a>
                <a href="/photo/upload">{t('upload_photo')}</a>
              </div>
            </div>
          ) : (
            <a href="/photos" className={window.location.pathname === '/photos' ? 'active' : ''}>
              <span className="desktop-only">{t('photos')}</span>
              <svg className="mobile-only" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M21 7h-4.2l-1.7-2.4c-.3-.4-.8-.6-1.3-.6H10c-.5 0-1 .2-1.3.6L7 7H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-9 12c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/>
              </svg>
            </a>
          )}

          {isAdmin && (
            <div className="dropdown">
              <a href="#" className={window.location.pathname === '/articles' ? 'active' : ''}>
                <span className="desktop-only">{t('articles')}</span>
                <svg className="mobile-only" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm4 2h6v2H9V7zm0 4h6v2H9v-2zm0 4h6v2H9v-2z"/>
                </svg>
              </a>
              <div className="dropdown-content">
                <a href="/articles">{t('see_articles')}</a>
                <a href="/articles/new">{t('new_article')}</a>
                <a href="/theme/create">{t('new_theme')}</a>
              </div>
            </div>
          )}

          {/*isSuperAdmin && (
            <a href="/reference" className={window.location.pathname === '/reference' ? 'active' : ''}>
              {t('references')}
            </a>
          )*/}

          <a href="/contact" className={window.location.pathname === '/contact' ? 'active' : ''}>
            <span className="desktop-only">{t('contact')}</span>
            <svg className="mobile-only" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M22 6H2v12h20V6zM20 16H4V8h16v8zm-3-4h-2v-2h2v2zm-4 0h-2v-2h2v2zm-4 0H7v-2h2v2z"/>
            </svg>
          </a>
        </div>

        {/* Section centrale : logo */}
        <div className="header-center">
          <a className="logo" href="/">
            <img src="/images/logoGQ.png" alt="logo GQ" />
          </a>
        </div>

        {/* Section droite : utilisateur et langue */}
        <div className="header-right">
          {isLoggedIn ? (
            <div className="dropdown">
              <a href="#" className={window.location.pathname === '/logout' ? 'active' : ''}>
                {t('welcome')} {user.username}!
              </a>
              <div className="dropdown-content">
                {isAdmin || isSuperAdmin ? (
                  <a href="/dashboard">{t('dashboard')}</a>
                ) : null}
                <a href="/logout">{t('disconnection')}</a>
              </div>
            </div>
          ) : (
            <>
              <a href="/login" className={window.location.pathname === '/login' ? 'active' : ''}>
                {t('connexion')}
              </a>
              <a href="/register" className={`register ${window.location.pathname === '/register' ? 'active' : ''}`}>
                {t('inscription')}
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
