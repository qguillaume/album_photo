import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LabelForgot: React.FC = () => {
  const { t, i18n } = useTranslation(); // Hook pour accéder aux traductions

  useEffect(() => {
  }, [t]); // Le hook se relance lorsque `t` (la fonction de traduction) change

  return (
    <span>{t('labels.forgot_password')}</span>
  );
};

export default LabelForgot;