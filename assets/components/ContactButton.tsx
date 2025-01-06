import React from 'react';
import { useTranslation } from 'react-i18next'; // hook

const ContactButton: React.FC = () => {
  const { t } = useTranslation();

  return (
    <button className="blue-button" onClick={() => window.location.href = "/contact"}>
      {t('contact_me', { defaultValue: 'Contactez-moi (fallback)'})} {/* La traduction de "contact_me" */}
    </button>
  );
};

export default ContactButton;
