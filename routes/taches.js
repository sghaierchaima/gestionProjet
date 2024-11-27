// routes/taches.js
const express = require('express');
const router = express.Router();
const Tache = require('../models/Tache'); 
const Projet = require('../models/Projet'); 
const Utilisateur = require('../models/Utilisateur'); // Assurez-vous que votre modèle est importé correctement

// Exemple de route pour afficher les tâches d'un projet
/* router.get('/:id', async (req, res) => {
    const projectId = req.params.id;
    
    try {
        const taches = await Tache.findAll({
            where: { projetId: projectId },
            attributes: ['id', 'titre', 'description', 'date_echeance', 'priorite', 'statut', 'createdAt', 'updatedAt', 'projetId']   // Assurez-vous que ce nom correspond bien au champ dans votre table
        });

        if (!taches || taches.length === 0) {
            return res.status(404).send('Aucune tâche trouvée pour ce projet.');
        }

        res.render('taches.twig', { taches: taches, projectId: projectId });
    } catch (error) {
        console.error('Erreur lors de la récupération des tâches :', error);
        res.status(500).send('Erreur lors de la récupération des tâches');
    }
});
 */
// Route pour afficher la page des tâches
router.get('/:projetId', async (req, res) => {
    try {
        const projetId = req.params.projetId;

        // Vérifiez si le projet existe avant d'exécuter la suite
        const projet = await Projet.findByPk(projetId);
        if (!projet) {
            return res.status(404).send("Projet non trouvé");
        }

        // Récupérer les tâches associées au projet
        const taches = await Tache.findAll({
            where: { projetId },
            attributes: ['id', 'titre', 'description', 'date_echeance', 'priorite', 'statut', 'createdAt', 'updatedAt', 'projetId'],
            include: {
                model: Utilisateur,
                as:'utilisateur',
                attributes: ['nom', 'photo'] // Inclure le nom et la photo de l'utilisateur
            }
        });

        // Séparation des tâches par statut
        const tachesAFaire = taches.filter(tache => tache.statut === 'à faire');
        const tachesEnCours = taches.filter(tache => tache.statut === 'en cours');
        const tachesTerminees = taches.filter(tache => tache.statut === 'terminée');

        // Debugging pour voir les données récupérées
        console.log('Tâches en cours :', tachesEnCours);

        // Passer les données à la vue
        res.render('taches.twig', { projet, tachesAFaire, tachesEnCours, tachesTerminees });
    } catch (error) {
        console.error("Erreur lors de la récupération des tâches :", error);
        res.status(500).send("Erreur lors de la récupération des tâches.");
    }
});

 // Dans votre fichier routes/taches.js
router.post('/taches', async (req, res) => {
    const { titre, description, date_echeance, priorite, statut, projetId } = req.body;
    if (!req.session.userId) {
        return res.status(401).send('Utilisateur non authentifié');
    }

    // Récupérer l'ID de l'utilisateur depuis la session
    const utilisateurId = req.session.userId;
    try {
        const newTache = await Tache.create({
            titre,
            description,
            date_echeance,
            priorite,
            statut,
            projetId,
            utilisateurId
        });
        res.status(201).json(newTache);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la création de la tâche');
    }
});
// Exemple de mise à jour d'une tâche
router.put('/taches/:id', async (req, res) => {
    try {
        const { titre, description, date_echeance, priorite, statut } = req.body;
        const tacheId = req.params.id;

        // Mettre à jour la tâche dans la base de données (par exemple, avec Sequelize)
        const tache = await Tache.update(
            { titre, description, date_echeance, priorite, statut },
            { where: { id: tacheId } }
        );

        if (tache[0] === 0) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        res.json({ message: 'Tâche modifiée avec succès!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la tâche' });
    }
});


  
module.exports = router;
