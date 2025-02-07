import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LabelTopReset: React.FC = () => {
  const { t, i18n } = useTranslation(); // Hook pour accéder aux traductions

  useEffect(() => {
  }, [t]); // Le hook se relance lorsque `t` (la fonction de traduction) change

  return (
    <>
    <h2>{t('labels.h2reset')}</h2>
    <div className="form-group">
        <p>{t('labels.preset')}</p>
    </div>
    </>
  );
};

export default LabelTopReset;