import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LabelH2Login: React.FC = () => {
  const { t, i18n } = useTranslation(); // Hook pour accéder aux traductions

  useEffect(() => {
  }, [t]); // Le hook se relance lorsque `t` (la fonction de traduction) change

  return (
    <h2>{t('labels.h2login')}</h2>
  );
};

export default LabelH2Login;