import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LabelUsername: React.FC = () => {
  const { t, i18n } = useTranslation(); // Hook pour accéder aux traductions

  useEffect(() => {
  }, [t]); // Le hook se relance lorsque `t` (la fonction de traduction) change

  return (
    <p>{t('labels.username')}</p>
  );
};

export default LabelUsername;