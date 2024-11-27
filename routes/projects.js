// routes/projects.js
const express = require('express');
const router = express.Router();
const Projet = require('../models/Projet');

const Invitation = require('../models/Invitation'); 
const MembreEquipe = require('../models/MembreEquipe');
const Utilisateur = require('../models/Utilisateur');
const nodemailer = require('nodemailer');
const crypto = require("crypto");

// Créer un projet
router.post('/projet', async (req, res) => {
    try {
        const projet = await Projet.create({ 
            nom: req.body.nom, 
            description: req.body.description, 
            date_debut: req.body.date_debut, 
            date_fin: req.body.date_fin, 
            utilisateurId: req.session.userId 
        });
        res.redirect('/projets'); // Redirection vers la page des projets
    } catch (error) {
        console.error('Erreur lors de la création du projet:', error);
        res.status(500).send('Erreur lors de la création du projet');
    }
}); 


// Route pour modifier un projet

// Définition de la route PUT pour modifier un projet
/* router.put('/projets/:id', async (req, res) => {
    const { id } = req.params; // Récupère l'ID du projet depuis les paramètres de l'URL
    try {
        const projet = await Projet.findByPk(id); // Recherche le projet par son ID
        if (!projet) {
            return res.status(404).json({ error: 'Projet introuvable' }); // Si projet non trouvé, retourne une erreur 404
        }

        // Mise à jour des informations du projet
        await projet.update({
            nom: req.body.nom,
            description: req.body.description,
            date_debut: req.body.date_debut,
            date_fin: req.body.date_fin,
        });

        // Réponse de succès
        res.json({ message: 'Projet modifié avec succès' });
    } catch (error) {
        console.error('Erreur lors de la modification du projet:', error);
        res.status(500).json({ error: 'Erreur lors de la modification du projet' });
    }
});
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params; // Récupère l'ID du projet
    try {
        const projet = await Projet.findByPk(id); // Recherche par ID
        if (!projet) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }
        console.log('ID reçu :', id);

        // Mise à jour du projet
        await projet.update({
            nom: req.body.nom,
            description: req.body.description,
            date_debut: req.body.date_debut,
            date_fin: req.body.date_fin,
        });

        res.json({ message: 'Projet modifié avec succès' });
    } catch (error) {
        console.error('Erreur lors de la modification du projet:', error);
        res.status(500).json({ error: 'Erreur lors de la modification du projet' });
    }
});


router.get('/projet/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const projet = await Projet.findByPk(id);
        if (!projet) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }
        res.json(projet);
    } catch (error) {
        console.error('Erreur lors de la récupération du projet:', error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// Exemple de route pour obtenir un projet par son ID
router.get('/api/projets/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const projet = await Projet.findByPk(id);  // Utiliser findByPk pour rechercher par ID
        if (projet) {
            res.json(projet);  // Retourner le projet en JSON
        } else {
            res.status(404).send('Projet non trouvé');  // Projet non trouvé
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du projet:', error);
        res.status(500).send('Erreur serveur');
    }
});

// Supprimer un projet
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Requête pour supprimer le projet ID :', id);
    try {
        const projet = await Projet.findByPk(id);
        if (!projet) {
            return res.status(404).json({ error: 'Projet introuvable' });
        }

        await projet.destroy();
        res.json({ message: 'Projet supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du projet :', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
    }
});



router.get('/projets', async (req, res) => {
    try {
        const projets = await Projet.findAll({
            where: { utilisateurId: req.session.userId } // Filtrer par utilisateur
        });
        const nom = req.session.nom;
        res.render('projets', { projets, nom }); // Rendre la vue avec les projets
    } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error); // Log détaillé
        res.status(500).send('Erreur lors de la récupération des projets');
    }
}); 



// Route pour afficher les tâches d'un projet
router.get('/:id/taches', async (req, res) => {
    const projectId = req.params.id;

    try {
        // Supposons que tu as une base de données avec une table "taches"
        const taches = await Tache.findAll({ where: { projectId: projectId } });
        const projet = await Projet.findByPk(projectId); // Pour obtenir les détails du projet

        res.render('tache.twig', { projet, taches });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la récupération des tâches");
    }
});


router.get('/:projetId', async (req, res) => {
    try {
      const projetId = req.params.projetId;
      const taches = await Tache.findAll({ where: { projetId }, 
        attributes: ['id', 'titre', 'description', 'date_echeance', 'priorite', 'statut', 'createdAt', 'updatedAt', 'projetId'],
        include: {
            model: Utilisateur,
            attributes: ['nom', 'photo'] // Assurez-vous que 'photo' contient le chemin de l'image de profil
          }
    });
      const projet = await Projet.findByPk(projetId);
  
      // Séparation des tâches en fonction de leur statut
      const tachesAFaire = taches.filter(tache => tache.statut === 'à faire');
      const tachesEnCours = taches.filter(tache => tache.statut === 'en cours');
      const tachesTerminees = taches.filter(tache => tache.statut === 'terminée');
  
      // Vérifie si les tâches en cours existent
      console.log('Tâches en cours :', tachesEnCours);
  
      // Passer les tâches filtrées à la vue
      res.render('taches.twig', { projet, tachesAFaire, tachesEnCours, tachesTerminees });
    } catch (error) {
      res.status(500).send("Erreur lors de la récupération des tâches.");
    }
  });



 

  async function sendEmail(to, subject, text) {
      let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: "csghaierm@gmail.com",
              pass: "trjx zwra djfz dxgr",
          },
      });
  
      await transporter.sendMail({
          from: '"Gestion Projet" <csghaierm@gmail.com>',
          to,
          subject,
          text,
      });
  }
  
  
 
 /* router.post('/:projetId/membre', async (req, res) => {
    const { projetId } = req.params;
    const { email } = req.body;

    try {
        // Vérifier si l'email est déjà associé à un utilisateur
        const utilisateur = await Utilisateur.findOne({ where: { email } });

        if (utilisateur) {
            // Si l'utilisateur existe, l'ajouter directement au projet
            await MembreEquipe.create({
                projetId,
                utilisateurId: utilisateur.id,
            });
            return res.status(200).send('Membre ajouté avec succès');
        } else {
            // Si l'utilisateur n'existe pas, envoyer une invitation par email
            const inviteLink = `http://localhost:3000/inscription?projetId=${projetId}`;

            // Créer le transporteur Nodemailer
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "csghaierm@gmail.com",   // Ton adresse email
                    pass: "dtgt rcwv zvzc fsnj",   // Ton mot de passe ou un app password (si activé)
                },
                debug: true,  // Activer le mode débogage
                logger: true, // Log l'activité
            });

            // Définir les options de l'email
            const mailOptions = {
                from: '"Gestion Projet" <csghaierm@gmail.com>',
                to: 'Chaima.Sghaier@esprim.tn',
                subject: 'Invitation à rejoindre un projet',
                html: `
                    <p>Vous avez été invité à rejoindre un projet.</p>
                    <p>Cliquez sur le lien suivant pour vous inscrire et rejoindre le projet :</p>
                    <a href="http://localhost:3000/inscription?projetId=${encodeURIComponent(projetId)}">Rejoindre le projet</a>
                `,
            };

            // Envoyer l'email
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.error('Erreur lors de l\'envoi de l\'email :', error);
                    return res.status(500).send('Erreur lors de l\'envoi de l\'email d\'invitation');
                } else {
                    console.log('Email envoyé :', info.response); // Afficher la réponse dans les logs pour débogage
                    return res.status(200).send('Invitation envoyée avec succès');
                }
            });
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout du membre:", error);
        return res.status(500).send('Erreur interne du serveur');
    }
});  */

/*  router.post('/:projetId/membre', async (req, res) => {
    const { projetId } = req.params;
    const { email } = req.body;
    try {
        // Vérifier si l'email est déjà associé à un utilisateur
        const utilisateur = await Utilisateur.findOne({ where: { email } });

        if (utilisateur) {
            // Si l'utilisateur existe, l'ajouter directement au projet
            await MembreEquipe.create({
                projetId,
                utilisateurId: utilisateur.id,
            });
            return res.status(200).send('Membre ajouté avec succès');
        } else {
            // Si l'utilisateur n'existe pas, envoyer une invitation par email
            const inviteLink = `http://localhost:3000/inscription?projetId=${projetId}`;

            // Créer le transporteur Nodemailer
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "csghaierm@gmail.com",   // Ton adresse email
                    pass: "trjx zwra djfz dxgr",   // Ton mot de passe ou un app password (si activé)
                },
                debug: true,  // Activer le mode débogage
                logger: true, // Log l'activité
            });

            // Définir les options de l'email
            const mailOptions = {
                from: '"Gestion Projet" <csghaierm@gmail.com>',
                to: email,  // Utiliser l'email passé dans le formulaire
                subject: 'Invitation à rejoindre un projet',
                html: `
                    <p>Vous avez été invité à rejoindre un projet.</p>
                    <p>Cliquez sur le lien suivant pour vous inscrire et rejoindre le projet :</p>
                    <a href="${encodeURIComponent(inviteLink)}">Rejoindre le projet</a>
                `,
            };

            // Envoyer l'email
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.error('Erreur lors de l\'envoi de l\'email :', error);
                    return res.status(500).send('Erreur lors de l\'envoi de l\'email d\'invitation');
                } else {
                    console.log('Email envoyé :', info.response); // Afficher la réponse dans les logs pour débogage
                    return res.status(200).send('Invitation envoyée avec succès');
                }
            });
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout du membre:", error);
        return res.status(500).send('Erreur interne du serveur');
    }
});  */ 
// Route pour afficher les projets partagés avec l'utilisateur
/* 
router.post('/:projetId/membre', async (req, res) => {
    const { projetId } = req.params;
    const { email } = req.body;

    if (!projetId || !email) {
        return res.status(400).send("Projet ID et email sont requis.");
    }

    try {
        // Vérifier si le projet existe
        const projet = await Projet.findByPk(projetId);
        if (!projet) {
            return res.status(404).send("Projet introuvable.");
        }

        // Vérifier si l'email est associé à un utilisateur
        const utilisateur = await Utilisateur.findOne({ where: { email } });

        if (utilisateur) {
            // Ajouter le membre directement au projet
            await MembreEquipe.create({
                projetId,
                utilisateurId: utilisateur.id,
            });
            return res.status(200).send('Membre ajouté avec succès');
        } else {
            // Créer le lien d'invitation
            const inviteLink = `http://localhost:3000/inscription?projetId=${encodeURIComponent(projetId)}`;

            // Configurer le transporteur Nodemailer
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "csghaierm@gmail.com",
                    pass: "votre_app_password",
                },
            });

            // Définir les options d'email
            const mailOptions = {
                from: '"Gestion Projet" <csghaierm@gmail.com>',
                to: email,
                subject: 'Invitation à rejoindre un projet',
                html: `
                    <p>Bonjour,</p>
                    <p>Vous avez été invité à rejoindre un projet sur notre plateforme.</p>
                    <p>Cliquez sur le lien suivant pour vous inscrire :</p>
                    <a href="${inviteLink}" style="color: #0275d8;">Rejoindre le projet</a>
                `,
            };

            // Envoi de l'email
            await transporter.sendMail(mailOptions);
            return res.status(200).send('Invitation envoyée avec succès');
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout du membre:", error);
        return res.status(500).send('Erreur interne du serveur');
    }
}); */

router.post('/:projetId/membre', async (req, res) => {
    const { projetId } = req.params;
    const { email } = req.body;

    if (!projetId || !email) {
        return res.status(400).send("Projet ID et email sont requis.");
    }

    try {
        // Vérifier si le projet existe
        const projet = await Projet.findByPk(projetId);
        if (!projet) {
            return res.status(404).send("Projet introuvable.");
        }

        // Vérifier si l'email est associé à un utilisateur
        const utilisateur = await Utilisateur.findOne({ where: { email } });

        if (utilisateur) {
            // Ajouter le membre directement au projet
            await MembreEquipe.create({
                projetId,
                utilisateurId: utilisateur.id,
            });
            return res.status(200).send('Membre ajouté avec succès.');
        } else {
            // Créer le lien d'invitation
            const inviteLink = `http://localhost:3000/inscription?projetId=${encodeURIComponent(projetId)}`;

            // Configurer le transporteur Nodemailer
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "csghaierm@gmail.com",
                    pass: "trjx zwra djfz dxgr", // Utilisez un mot de passe d'application sécurisé
                },
            });

            // Définir les options d'email
            const mailOptions = {
                from: '"Gestion Projet" <csghaierm@gmail.com>',
                to: email,
                subject: 'Invitation à rejoindre un projet',
                html: `
                    <p>Bonjour,</p>
                    <p>Vous avez été invité à rejoindre un projet sur notre plateforme.</p>
                    <p>Cliquez sur le lien suivant pour vous inscrire :</p>
                    <a href="${inviteLink}" style="color: #0275d8;">Rejoindre le projet</a>
                `,
            };

            // Envoi de l'email
            await transporter.sendMail(mailOptions);
            return res.status(200).send('Invitation envoyée avec succès.');
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout du membre:", error);
        return res.status(500).send('Erreur interne du serveur.');
    }
});



module.exports = router;
