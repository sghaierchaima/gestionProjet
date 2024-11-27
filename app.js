const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const Projet = require('./models/Projet');
const Tache = require('./models/Tache');
const Utilisateur = require('./models/Utilisateur');
const Jalon = require('./models/Jalon');
const Invitation = require('./models/Invitation');
const path = require('path');
const session = require('express-session');
const projectsRouter = require('./routes/projects');
const tachesRouter = require('./routes/taches'); 
const inscriptionRouter = require('./routes/inscription'); 
const multer = require('multer');
const Message = require('./models/Message');
const MembreEquipe = require('./models/MembreEquipe');  // Vérifie que ce chemin est correct
  // Vérifiez la casse ici

// Import du modèle Chat
const router = express.Router();
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Configuration du middleware de session
app.use(session({
    secret: 'votre_clé_secrète', // Changez ceci par une clé secrète unique
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Utilisez true si vous utilisez HTTPS
}));
app.use((req, res, next) => {
    res.locals.userId = req.session.userId;
    next();
});
app.set('view engine', 'twig');
app.set('views', path.join(__dirname, 'views'));


const Twig = require('twig');

// Ajouter un filtre personnalisé json
Twig.extendFilter('json', (value) => {
  return JSON.stringify(value);
});



      
// Association des modèles
Utilisateur.hasMany(Projet);
Projet.belongsTo(Utilisateur);
Projet.hasMany(Tache);
Tache.belongsTo(Projet);
Utilisateur.hasMany(Tache);
Tache.belongsTo(Utilisateur);

// Lancer le serveur
/* app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
}); */


// Routes

// Route par défaut
app.get('/', async (req, res) => {
    let userId = req.session.userId;
    let nom = null;
    let projets = [];

    if (userId) {
        try {
            const utilisateur = await Utilisateur.findByPk(userId);
            if (utilisateur) {
                nom = utilisateur.nom;
                projets = await Projet.findAll({ where: { utilisateurId: userId } }); // Récupérer les projets de l'utilisateur
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des informations de l\'utilisateur:', error);
        }
    }

    res.render('index', { userId, nom, projets }); // Passer les projets à la vue
});


// Route de connexion
const bcrypt = require('bcrypt');

app.post('/connexion', async (req, res) => {
    const { email, mot_de_passe } = req.body;

    try {
        const utilisateur = await Utilisateur.findOne({ where: { email } });

        // Vérifie si l'utilisateur existe
        if (!utilisateur) {
            return res.status(400).json({ error: 'Email ou mot de passe incorrect.' });
        }

        // Comparaison sécurisée du mot de passe
        const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
        if (!motDePasseValide) {
            return res.status(400).json({ error: 'Email ou mot de passe incorrect.' });
        }

        // Si la connexion est réussie, stocke l'ID utilisateur dans la session
        req.session.userId = utilisateur.id;
        res.status(200).json({ message: 'Connexion réussie' }); // Réponse succès
    } catch (error) {
        console.error('Erreur de connexion:', error);
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/photos'); // Dossier où les images seront stockées
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));



app.post('/inscription', upload.single('photo'), async (req, res) => {
    const { nom, email, mot_de_passe } = req.body;
    const photo = req.file ? req.file.filename : null;

    try {
        if (!photo) {
            return res.status(400).json({ error: 'Photo obligatoire.' });
        }

        // Vérifie si l'utilisateur existe déjà
        const utilisateurExist = await Utilisateur.findOne({ where: { email } });
        if (utilisateurExist) {
            return res.status(400).json({ error: 'Email déjà utilisé.' });
        }

        // Hachage du mot de passe
        const mot_de_passe_hache = await bcrypt.hash(mot_de_passe, 10);
        
        // Création de l'utilisateur
        const utilisateur = await Utilisateur.create({
            nom,
            email,
            mot_de_passe: mot_de_passe_hache,
            photo
        });

        req.session.userId = utilisateur.id;
        res.status(201).json({ message: 'Inscription réussie !' });
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
});


// Assure-toi que le chemin est correct
app.use('/taches', tachesRouter);


app.use('/api/projets', projectsRouter);
// Route pour afficher les projets


// Route pour afficher la page des projets
/* app.get('/projets', async (req, res) => {
    try {
        const projets = await Projet.findAll({
            where: { utilisateurId: req.session.userId }
        });
        res.render('projets', { projets });
    } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        res.status(500).send('Erreur lors de la récupération des projets');
    }
});
 */
// Route pour afficher la page des projets
app.get('/projets', async (req, res) => {
    // Vérifier si l'utilisateur est connecté
    const utilisateurId = req.session.userId;
    if (!utilisateurId) {
        // Si l'utilisateur n'est pas connecté, renvoyer une réponse d'erreur ou rediriger vers la page de connexion
        return res.status(400).send('Utilisateur non connecté');
        // Ou vous pouvez rediriger l'utilisateur vers la page de connexion :
        // return res.redirect('/login');
    }

    try {
        // Récupérer les projets associés à l'utilisateur connecté
        const projets = await Projet.findAll({
            where: { utilisateurId } // Utiliser l'ID de l'utilisateur connecté
        });

        // Renvoyer la vue avec les projets récupérés
        res.render('projets', { projets });
    } catch (error) {
        // Gérer les erreurs de récupération des projets
        console.error('Erreur lors de la récupération des projets:', error);
        res.status(500).send('Erreur lors de la récupération des projets');
    }
});


const membresEquipeRouter = require('./routes/membresEquipe');

app.use('/api', membresEquipeRouter);


sequelize.sync({ force: false }) // Utilisez `{ force: false }` pour éviter de supprimer les données existantes
    .then(() => {
        console.log('Les tables sont synchronisées avec succès.');
    })
    .catch((err) => {
        console.error('Erreur lors de la synchronisation des tables:', err);
    });


// Route pour afficher les utilisateurs
app.get('/utilisateurs', async (req, res) => {
    try {
        const utilisateurs = await Utilisateur.findAll();
        res.render('utilisateurs', { utilisateurs });
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).send('Erreur lors de la récupération des utilisateurs');
    }
});
app.use('/inscrit', inscriptionRouter);
app.get('/inscription', (req, res) => {
    res.render('inscription', { projetId: req.query.projetId });
});

app.get('/projets/partages', async (req, res) => { 
    const utilisateurId = req.session.userId;

    if (!utilisateurId) {
        return res.status(400).send('Utilisateur non connecté');
    }

    try {
        const projetsPartages = await sequelize.query(`
            SELECT p.id, p.nom, p.description, p.date_debut, p.date_fin, 
                   u.nom AS createur_nom, u.id AS createur_id,
                   me.utilisateurId AS membre_id, membre.nom AS membre_nom
            FROM projets p
            JOIN utilisateurs u ON u.id = p.utilisateurId  -- Récupère le nom du créateur
            LEFT JOIN membres_equipe me ON me.projetId = p.id
            LEFT JOIN utilisateurs membre ON membre.id = me.utilisateurId  -- Récupère les noms des membres
            WHERE (me.utilisateurId = :utilisateurId) AND p.utilisateurId != :utilisateurId
        `, {
            replacements: { utilisateurId },
            type: sequelize.QueryTypes.SELECT
        });

        // Regroupe les informations pour chaque projet
        const projets = projetsPartages.reduce((acc, row) => {
            let projet = acc.find(p => p.id === row.id);
            if (!projet) {
                projet = {
                    id: row.id,
                    nom: row.nom,
                    description: row.description,
                    date_debut: row.date_debut,
                    date_fin: row.date_fin,
                    createur_nom: row.createur_nom,
                    membres: [{ id: row.createur_id, nom: row.createur_nom }] // Inclut le créateur dans la liste des membres
                };
                acc.push(projet);
            }
            if (row.membre_nom && row.membre_id !== row.createur_id) { // Évite les doublons si le membre est aussi le créateur
                projet.membres.push({ id: row.membre_id, nom: row.membre_nom });
            }
            return acc;
        }, []);

        res.render('projetP', { projets });
    } catch (error) {
        console.error('Erreur lors de la récupération des projets partagés:', error);
        res.status(500).send('Erreur lors de la récupération des projets partagés');
    }
});


// Importer le modèle Sequelize de MembreEquipe

async function isUserInProject(userId, projectId) {
    try {
        // Rechercher si une relation existe entre l'utilisateur et le projet
        const membre = await MembreEquipe.findOne({
            where: {
                utilisateurId: userId,
                projetId: projectId
            }
        });
        
        // Retourne true si une relation est trouvée, sinon false
        return !!membre;
    } catch (error) {
        console.error("Erreur lors de la vérification de l'appartenance de l'utilisateur au projet :", error);
        return false;
    }
}

module.exports = isUserInProject;



const jalonsRouter = require('./routes/jalons');
app.use('/api/jalons', jalonsRouter);
const rapportsRouter = require('./routes/rapport');
app.use('/api/rapports', rapportsRouter);



// Configurer les événements Socket.IO


// Démarre

// Route pour la déconnexion
app.get('/deconnexion', (req, res) => {
    // Détruire la session de l'utilisateur
    req.session.destroy((err) => {
        if (err) {
            console.error("Erreur lors de la déconnexion :", err);
            return res.status(500).send("Erreur lors de la déconnexion");
        }
        
        // Rediriger vers la page d'accueil après la déconnexion
        res.redirect('/');
    });
});


//socket
const http = require('http');
const socketIo = require('socket.io');

// Crée un serveur HTTP en utilisant l'application Express
const server = http.createServer(app);

// Initialise Socket.IO avec le serveur HTTP
const io = socketIo(server);

// Route pour accéder à la page de chat
/* app.get('/chat/:projetId', async (req, res) => {
    const { projetId } = req.params;
    const parsedProjetId = parseInt(projetId, 10);

    if (isNaN(parsedProjetId)) {
        return res.status(400).send('ID du projet invalide');
    }

    try {
        const projet = await sequelize.query(`
            SELECT
                p.id AS projet_id, p.nom AS projet_nom, p.description AS projet_description,
                p.date_debut, p.date_fin,
                u.nom AS createur_nom, u.id AS createur_id,
                me.utilisateurId AS membre_id, membre.nom AS membre_nom,
                membre.photo AS membre_photo
            FROM projets p
            JOIN utilisateurs u ON u.id = p.utilisateurId
            LEFT JOIN membres_equipe me ON me.projetId = p.id
            LEFT JOIN utilisateurs membre ON membre.id = me.utilisateurId
            WHERE p.id = :projetId
        `, {
            replacements: { projetId: parsedProjetId },
            type: sequelize.QueryTypes.SELECT
        });

        // Vérifier si des messages sont associés au projet
        const messages = await Message.findAll({ where: { projetId: parsedProjetId }, order: [['createdAt', 'ASC']] });

        if (!projet || projet.length === 0) {
            return res.status(404).send('Projet introuvable');
        }

        // Assurez-vous que le projet a bien des messages avant de rendre la vue
        console.log('Projet récupéré:', projet);
        console.log('Messages du projet:', messages);

        res.render('chat', { projet: projet[0], Messages: messages }); // Passer les messages à la vue
    } catch (error) {
        console.error('Erreur lors de la récupération du projet:', error);
        res.status(500).send('Erreur interne du serveur');
    }
});
 */

// Côté serveur : Node.js avec Express
app.get('/chat/:projetId', (req, res) => {
    const projetId = req.params.projetId;
    const userId = req.session.userId;

    if (!projetId) {
        console.error("L'ID du projet est manquant.");
        return res.status(400).send("L'ID du projet est manquant.");
    }
    if (!userId) {
        console.error("L'utilisateur doit être connecté.");
        return res.status(403).send("L'utilisateur doit être connecté.");
    }

    res.render('chat', { projetId, userId });
});


// Gestion des connexions Socket.IO
// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté');

    // Lorsque l'utilisateur rejoint un projet
    socket.on('joinProject', (projetId) => {
        console.log(`Utilisateur a rejoint le projet ${projetId}`);
        socket.join(projetId);
    });

    // Récupérer les messages précédents
    socket.on('getPreviousMessages', async (projetId) => {
        try {
            const messages = await Message.findAll({
                where: { projetId },
                order: [['createdAt', 'ASC']],
            });
            socket.emit('previousMessages', messages);
        } catch (error) {
            console.error('Erreur lors de la récupération des messages:', error);
        }
    });

    // Lorsqu'un message est envoyé
    socket.on('message', async ({ message, userId, projetId }) => {
        try {
            const newMessage = await Message.create({
                message,
                userId,
                projetId,
            });

            // Diffuser le message à tous les clients connectés au projet
            io.to(projetId).emit('message', newMessage);
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
        }
    });

    // Déconnexion de l'utilisateur
    socket.on('disconnect', () => {
        console.log('Un utilisateur est déconnecté');
    });
});



server.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});


















sequelize.sync();
sequelize.sync({ force: false }); // Force la resynchronisation des modèles si nécessaire
