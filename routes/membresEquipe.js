const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const MembreEquipe = require('../models/MembreEquipe');
const Utilisateur = require('../models/Utilisateur');
const Projet = require('../models/Projet');
const Invitation = require('../models/Invitation');  // Modèle d'invitation pour stocker les tokens
const nodemailer = require('nodemailer');


// Créer un transporteur d'email avec votre configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'csghaierm@gmail.com',
        pass: 'dtgt rcwv zvzc fsnj' // Utilisez un mot de passe d'application pour plus de sécurité
    }
});

// Route pour ajouter des membres par email
router.post('/projets/:projetId/ajouter-membres', async (req, res) => {
    const { projetId } = req.params;
    const { emails } = req.body; // Emails des membres à inviter

    try {
        const projet = await Projet.findOne({ where: { id: projetId } });

        if (!projet) {
            return res.status(404).json({ success: false, message: 'Projet non trouvé' });
        }

        // Pour chaque email
        for (const email of emails) {
            // Créer un token unique pour cette invitation
            const token = crypto.randomBytes(20).toString('hex');
            
            // Créer un lien d'invitation avec un token unique (incluant l'email et le projetId)
            const invitationLink = `http://localhost:3000/api/accept-invitation?email=${email}&projetId=${projetId}&token=${token}`;

            // Stocker l'invitation avec le token
            await Invitation.create({
                email,
                projetId,
                token,
                expiredAt: new Date(Date.now() + 3600000) // Expire dans 1 heure (ajuster selon vos besoins)
            });

            // Préparer l'email d'invitation
            const mailOptions = {
                from: 'csghaierm@gmail.com',
                to: email,
                subject: `Invitation à rejoindre le projet "${projet.nom}"`,
                text: `Bonjour,\n\nVous êtes invité à rejoindre le projet "${projet.nom}".\n\nCliquez sur ce lien pour accepter l'invitation :\n\n${invitationLink}\n\nCordialement,\nL'équipe du projet`
            };

            // Envoyer l'email
            await transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Erreur d\'envoi de l\'email:', error);
                } else {
                    console.log('Email envoyé :', info.response);
                }
            });
        }

        return res.json({ success: true, message: 'Invitation envoyée aux utilisateurs' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
});









module.exports = router;
