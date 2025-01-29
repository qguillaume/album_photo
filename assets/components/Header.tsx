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
            {t('home')}
          </a>
          <div className="dropdown">
            <a href="/photos" className={window.location.pathname === '/photos' ? 'active' : ''}>
              {t('photos')}
            </a>
            {isLoggedIn && (
              <div className="dropdown-content">
                <a href="/album/new">{t('create_album')}</a>
                <a href="/photo/upload">{t('upload_photo')}</a>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="dropdown">
              <a href="/articles" className={window.location.pathname === '/articles' ? 'active' : ''}>
                {t('articles')}
              </a>
              <div className="dropdown-content">
                <a href="/articles/new">{t('new_article')}</a>
                <a href="/theme/create">{t('new_theme')}</a>
              </div>
            </div>
          )}

          {isSuperAdmin && (
            <a href="/reference" className={window.location.pathname === '/reference' ? 'active' : ''}>
              {t('references')}
            </a>
          )}

          <a href="/contact" className={window.location.pathname === '/contact' ? 'active' : ''}>
            {t('contact')}
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
