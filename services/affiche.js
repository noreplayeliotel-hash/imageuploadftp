const ftp = require("basic-ftp");
const express = require("express");
const path = require("path");
require("dotenv").config();

const router = express.Router();

// Configuration du serveur FTP
const ftpConfig = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: false,
};

// Fonction pour obtenir le Content-Type en fonction de l'extension
const getContentType = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".png":
            return "image/png";
        case ".pdf":
            return "application/pdf";    
        case ".gif":
            return "image/gif";
        default:
            return "application/octet-stream"; // Par défaut
    }
};

// Route pour récupérer et afficher une image
router.get("/image/:filename", async (req, res) => {
    const client = new ftp.Client();
    client.ftp.verbose = true; // Active les logs FTP pour debug (optionnel)

    const filename = req.params.filename;

    try {
        await client.access(ftpConfig);
        
        // Vérifier si le fichier existe
        const fileList = await client.list();
        const fileExists = fileList.some(file => file.name === filename);

        if (!fileExists) {
            throw new Error(`Fichier non trouvé : ${filename}`);
        }

        res.setHeader("Content-Type", getContentType(filename));

        // Stream directement depuis le serveur FTP vers la réponse HTTP
        await client.downloadTo(res, filename);

    } catch (error) {
        console.error("Erreur lors du chargement de l'image :", error.message);
        if (!res.headersSent) {
            res.status(500).send("Impossible d'afficher l'image.");
        }
    } finally {
        client.close();
    }
});

module.exports = router;