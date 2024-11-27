// routes/jalons.js
const express = require('express');
const router = express.Router();
const Jalon = require('../models/Jalon');
const Projet = require('../models/Projet');

// Route pour créer un jalon
router.post('/', async (req, res) => {
    try {
        console.log(req.body); // Vérifie les données reçues
        const { nom, description, date_cible, projetId } = req.body;

        // Vérifie si projetId est défini
        if (!projetId) {
            return res.status(400).json({ error: "projetId est manquant" });
        }

        const jalon = await Jalon.create({ nom, description, date_cible, projetId });
        res.status(201).json(jalon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Route pour récupérer les jalons d'un projet
// Route pour récupérer et afficher les jalons d'un projet
/* router.get('/jalons/:projetId', async (req, res) => {
    try {
        const projetId = req.params.projetId;
        const jalons = await Jalon.findAll({ where: { projetId } });
        res.render('jalon', { projetId, jalons });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}); */
// routes/jalons.js
/* router.get('/:projetId', async (req, res) => {
    try {
        const projetId = req.params.projetId;
        const jalons = await Jalon.findAll({ where: { projetId } });
        res.render('jalon', { projetId, jalons });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}); */
router.get('/:projetId', async (req, res) => {
    try {
        const projetId = req.params.projetId; // Récupère l'ID du projet depuis l'URL
        const projet = await Projet.findByPk(projetId); // Trouve le projet par ID pour passer des informations à la vue

        if (!projet) {
            return res.status(404).json({ error: 'Projet non trouvé' });
        }

        const jalons = await Jalon.findAll({ where: { projetId } }); // Récupère les jalons associés à ce projet
        res.render('jalon', { projet, jalons }); // Passe le projet et ses jalons à la vue
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Route pour mettre à jour un jalon
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, date_cible, etat } = req.body;
    await Jalon.update({ nom, description, date_cible, etat }, { where: { id } });
    const updatedJalon = await Jalon.findByPk(id);
    res.json(updatedJalon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour supprimer un jalon
router.delete('/:id', async (req, res) => {
  try {
    await Jalon.destroy({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
