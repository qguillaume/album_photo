import { Editor } from "@tinymce/tinymce-react";
import { useState } from "react";

const TinyEditor = () => {
  const [content, setContent] = useState("");

  // Fonction qui gère les changements de contenu dans l'éditeur via l'API TinyMCE
  const handleEditorChange = (editor) => {
    document.querySelector(
      'textarea[name="article_form[content]"]'
    ).style.display = "block";

    const content = editor.getContent(); // Récupère le contenu actuel de l'éditeur
    console.log("Contenu édité:", content); // Affiche le contenu dans la console
    setContent(content); // Mettez à jour le state React
    // Mettez à jour la valeur du textarea caché
    document.querySelector('textarea[name="article_form[content]"]').value =
      content;
  };

  return (
    <div>
      <Editor
        apiKey="kabvnq0v1wn1ibq3zfglnmtpeswg4pu9a7nh6vi8fmfrat8c"
        initialValue="<p>Écrivez ici...</p>"
        init={{
          height: 500,
          menubar: false,
          plugins: [
            "advlist autolink lists link image charmap print preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table paste code help wordcount",
          ],
          toolbar:
            "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
        }}
        onChange={handleEditorChange} // Utilisation de l'événement onChange de l'API TinyMCE
      />
      <p>Contenu édité : {content}</p>
    </div>
  );
};

export default TinyEditor;
