document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Récupérer dynamiquement l'ID du projet depuis Twig
    const projetId = "{{ projet.id | json }}";  // Assurez-vous que cette ligne reçoit bien l'ID du projet

if (!projetId) {
    console.error('ID du projet manquant');
    return;
}
console.log('ID du projet envoyé:', projetId);  // Vérifiez si l'ID est correct

socket.emit('joinProject', projetId); 

    // Lorsque le serveur envoie les messages précédents
    socket.on('previousMessages', (messages) => {
        const messageList = document.getElementById('messages');
        console.log('Messages précédents:', messages);  // Afficher les messages récupérés
        messages.forEach((msg) => {
            const newMessage = document.createElement('li');
            newMessage.textContent = `${msg.userId}: ${msg.message}`;
            messageList.appendChild(newMessage);
        });
    });

    // Envoi du message
    const sendMessageButton = document.getElementById('sendMessageButton');
    const messageInput = document.getElementById('messageInput');

    sendMessageButton.addEventListener('click', () => {
        const message = messageInput.value;
        if (message.trim()) {
            const userId = 18; // Remplacer par l'ID réel de l'utilisateur connecté
            socket.emit('message', { message, userId, projetId });
            messageInput.value = ''; // Effacer le champ après envoi
        }
    });

    // Recevoir les nouveaux messages en temps réel
    socket.on('message', (message) => {
        const messageList = document.getElementById('messages');
        const newMessage = document.createElement('li');
        newMessage.textContent = `${message.userId}: ${message.message}`;
        messageList.appendChild(newMessage);
    });
});
