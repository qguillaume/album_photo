import React, { useState } from "react";

interface PasswordSwitchProps {
  passwordFieldId: string;
}

const PasswordSwitch: React.FC<PasswordSwitchProps> = ({ passwordFieldId }) => {
  const [showPassword, setShowPassword] = useState(false);

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
        <span className="switch-label">Afficher le mot de passe</span>
      </label>
    </div>
  );
};

export default PasswordSwitch;
