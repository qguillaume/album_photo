import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';

interface PasswordSwitchProps {
  passwordFieldId: string;
}

const PasswordSwitch: React.FC<PasswordSwitchProps> = ({ passwordFieldId }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { t, i18n } = useTranslation(); // Hook pour accéder aux traductions

  useEffect(() => {
  }, [t]); // Le hook se relance lorsque `t` (la fonction de traduction) change

  const togglePassword = () => {
    setShowPassword(!showPassword);
    const passwordField = document.getElementById(passwordFieldId) as HTMLInputElement;
    if (passwordField) {
      passwordField.type = showPassword ? "password" : "text";
    }
  };

  return (
    <div className="form-group">
      <label className="switch-container">
        <label className="switch">
          <input type="checkbox" checked={showPassword} onChange={togglePassword} />
          <span className="slider"></span>
        </label>
        <span className="switch-label">{t('labels.show_password')}</span>
      </label>
    </div>
  );
};

export default PasswordSwitch;
