import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext'; // Hook
import '../styles/components/_header.scss';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useUser();

  const isLoggedIn = !!user;
  const isAdmin = isLoggedIn && user?.roles.includes('ROLE_ADMIN');
  const isSuperAdmin = isLoggedIn && user?.roles.includes('ROLE_SUPER_ADMIN');

  // Basculer le menu burger
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  alert("isLoggedIn : "+isLoggedIn);
  alert("isAdmin : "+isAdmin);
  alert("isSuperAdmin : "+isSuperAdmin);
  return (
    <header className="header">
      <div className="hamburger-menu" onClick={toggleMenu}>
        ☰
      </div>

      {/* Menu de navigation affiché lorsque le menu burger est ouvert */}
      <nav className={`nav-menu ${menuOpen ? 'active' : ''}`}>
        <div className="header-center">
          <a href="/" className="logo">
            <img src="images/logoGQ.png" alt="logo GQ" />
          </a>
        </div>

        <div className="header-left">
          <a href="/">{t('home')}</a>

          <div className="dropdown">
            <a href="/photos">{t('photos')}</a>
            {isLoggedIn && (
              <div className="dropdown-content">
                <a href="/album/new">{t('create_album')}</a>
                <a href="/photo/upload">{t('upload_photo')}</a>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="dropdown">
              <a href="/articles">{t('articles')}</a>
              <div className="dropdown-content">
                <a href="/articles/new">{t('new_article')}</a>
                <a href="/theme/create">{t('new_theme')}</a>
              </div>
            </div>
          )}

          {isSuperAdmin && (
            <a href="/references">{t('references')}</a>
          )}

          <a href="/contact">{t('contact')}</a>
        </div>

        <div className="header-right">
          {isLoggedIn ? (
            <div className="dropdown">
              <a href="#">{t('welcome')} {user.username}</a>
              <div className="dropdown-content">
                {(isAdmin || isSuperAdmin) && <a href="/dashboard">{t('dashboard')}</a>}
                <a href="/logout">{t('disconnection')}</a>
              </div>
            </div>
          ) : (
            <>
              <a href="/login">{t('connexion')}</a>
              <a href="/register" className="register">{t('inscription')}</a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
