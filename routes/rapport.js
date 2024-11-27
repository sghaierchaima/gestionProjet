// routes/rapport.js
const express = require('express');
const router = express.Router();
const Tache = require('../models/Tache'); 
const Projet = require('../models/Projet'); 
const RapportAvancement = require('../models/RapportAvancement');
// Assurez-vous d'avoir importé vos modèles

// Route pour générer un rapport d'avancement pour un projet
router.get('/rapport/:projetId', async (req, res) => { 
  try {
      const projetId = req.params.projetId;

      // Récupérer les tâches du projet
      const taches = await Tache.findAll({ where: { projetId } });

      // Calculer le nombre de tâches terminées
      const tachesTerminees = taches.filter(tache => tache.statut === 'Terminée').length;

      // Calculer le nombre de tâches en retard
      const tachesRetard = taches.filter(tache => new Date(tache.date_echeance) < new Date() && tache.statut !== 'Terminée').length;

      // Enregistrer le rapport d'avancement dans la base de données (optionnel)
      const rapport = await RapportAvancement.create({
          projetId,
          tachesTerminees,
          tachesRetard
      });

      // Rendre la vue avec les données du rapport
      res.render('rapport', {
          projetId,
          tachesTerminees,
          tachesRetard,
          rapports: [rapport] // ou récupérez tous les rapports associés si besoin
      });
  } catch (error) {
      console.error("Erreur lors de la génération du rapport :", error);
      res.status(500).json({ error: error.message });
  }
});

  

module.exports = router;
