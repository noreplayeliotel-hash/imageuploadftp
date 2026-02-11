const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');
require("dotenv").config();

// Configuration FTP
const FTP_HOST = process.env.FTP_HOST;
const FTP_USER = process.env.FTP_USER;
const FTP_PASSWORD = process.env.FTP_PASSWORD;
const FTP_DIR = 'upload';  // Conservé comme dans le code original
const BASE_URL = 'http://m4ckwwswggwo8c8g08gwsscc.82.112.242.233.sslip.io/afficheimage/image';  // Conservé comme dans le code original

/**
 * Fonction pour télécharger un fichier avec réessais automatiques
 */
const uploadFileWithRetry = async (file, fileName, retries = 3) => {
  const client = new ftp.Client();
  client.ftp.verbose = process.env.NODE_ENV !== 'production';

  // Créer un fichier temporaire pour l'upload
  const tempDir = path.join(__dirname, 'tmp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempFilePath = path.join(tempDir, fileName);
  fs.writeFileSync(tempFilePath, file.buffer);

  let attempt = 0;
  let lastError = null;

  while (attempt < retries) {
    try {
      // Connexion au serveur FTP
      await client.access({
        host: FTP_HOST,
        user: FTP_USER,
        password: FTP_PASSWORD,
        secure: false,
      });

      

      // Upload du fichier
    
      await client.uploadFrom(tempFilePath, fileName);
      
      // Définir les permissions pour un accès public (644 = rw-r--r--)
      try {
        await client.send(`SITE CHMOD 644 ${fileName}`);
       
      } catch (chmodErr) {
        console.warn(`⚠️ Impossible de définir les permissions: ${chmodErr.message}`);
        // Continuer même si CHMOD échoue
      }
      
    

      // Construire l'URL selon le format original
      const fileUrl = `${BASE_URL}/${fileName}`;

      // Nettoyage
      fs.unlinkSync(tempFilePath);
      client.close();
      return fileUrl;
    } catch (error) {
      lastError = error;
      attempt++;
      console.error(`❌ Tentative ${attempt}/${retries} échouée: ${error.message}`);

      // Attendre avant de réessayer
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    } finally {
      client.close();
    }
  }

  // Échec après tous les essais
  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
  }

  throw lastError || new Error("Échec de l'upload après plusieurs tentatives");
};

/**
 * Middleware pour gérer l'upload d'images vers un serveur FTP
 * Garde le même nom que dans le code original
 */
const UploadImage = (req, res, next) => {
  if (!req.files || !req.files.image) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const files = req.files;
  const uploadedFiles = {};

  const uploadPromises = Object.keys(files).map((fieldName) => {
    const file = files[fieldName][0];
    const remoteFileName = Date.now() + `.${file.originalname.split(".").pop()}`;

    return uploadFileWithRetry(file, remoteFileName).then((fileUrl) => {
      uploadedFiles[fieldName] = {
        fileName: remoteFileName,
        url: fileUrl,
      };
    });
  });

  Promise.all(uploadPromises)
    .then(() => {
      const imageField = uploadedFiles.image;
      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        imageUrl: imageField ? imageField.url : null,
      });
    })
    .catch((error) => {
      console.error("⛔ Upload failed:", error);
      return res.status(500).json({ error: "Image upload failed" });
    });
};


module.exports = UploadImage;
