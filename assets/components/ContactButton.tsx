const ContactButton = () => {

  const handleContactClick = () => {
    window.location.href = "/contact";
  };

  return (
    <button className="blue-button" onClick={handleContactClick}>
      Contactez-moi
    </button>
  );
};

export default ContactButton;
