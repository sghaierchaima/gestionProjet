// routes/inscription.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Utilisateur = require('../models/Utilisateur');  // Assurez-vous d'avoir le modèle Utilisateur
const MembreEquipe = require('../models/MembreEquipe');  // Assurez-vous d'avoir le modèle MembreEquipe

router.post('/inscription', async (req, res) => {
    const { nom, email, mot_de_passe, projetId } = req.body;
    console.log("Route /inscription atteinte");
    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await Utilisateur.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).send("L'email est déjà utilisé");
        }

        // Hacher le mot de passe
        const mot_de_passe_hache = await bcrypt.hash(mot_de_passe, 10);

        // Créer un nouvel utilisateur
        const utilisateur = await Utilisateur.create({
            nom,
            email,
            mot_de_passe: mot_de_passe_hache,
        });

        // Ajouter l'utilisateur au projet
        await MembreEquipe.create({
            projetId,
            utilisateurId: utilisateur.id,
        });

        return res.status(201).send("Utilisateur inscrit avec succès");
    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        return res.status(500).send("Erreur interne du serveur");
    }
});
const path = require('path');

router.get('/inscription', (req, res) => {
    res.sendFile(path.join(__dirname, 'inscription.twig'));  // Assurez-vous que le chemin est correct
});

module.exports = router;
