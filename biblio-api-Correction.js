// =========================================================================
// CONFIGURATION GLOBALE ET CIBLAGE DES ÉLÉMENTS HTML (DOM)
// =========================================================================

// L'adresse de base du serveur (l'API) qui stocke nos données (livres, utilisateurs...)
const urlApi = "http://localhost:3000"

// Sélection des zones HTML où nous allons afficher nos listes de données
const $bookList = document.querySelector("#books")     // Liste des livres (balise <ul> ou <ol>)
const $address = document.querySelector('#address')    // Zone pour afficher l'adresse de la bibliothèque
const $usersList = document.querySelector("#users")    // Liste des clients (balise <ul> ou <ol>)

// Sélection des différents formulaires présents dans la page HTML
const $newUserForm = document.querySelector('#new-user')   // Formulaire d'inscription d'un client
const $newBookForm = document.querySelector('#new-book')   // Formulaire d'ajout d'un livre
const $editUserForm = document.querySelector('#edit-user') // Formulaire de modification d'un client
const $editBookForm = document.querySelector('#edit-book') // Formulaire de modification d'un livre

// Tableaux globaux (vides au départ) qui vont stocker la copie de nos données reçues du serveur
let books = null
let users = null

// Jeton (Token) de sécurité envoyé au serveur pour prouver qu'on a le droit de modifier les livres
const token = "ljglkdfg315d4g5dgf3d"

// =========================================================================
// FONCTIONS DE RÉCUPÉRATION ET D'AFFICHAGE DES DONNÉES (API & LOGIQUE MÉTIER)
// =========================================================================

/**
 * RÉCUPÉRATION DES CLIENTS (USERS)
 * Cette fonction va chercher les clients sur le serveur, puis gère l'affichage général
 * ainsi que le remplissage des options du formulaire de location.
 */
const usersFetch = async () => {
    try {
        // Étape 1 : On demande poliment les utilisateurs au serveur
        let resp = await fetch(`${urlApi}/users`)

        // Sécurité : Si le serveur rencontre un problème, on arrête tout et on génère une erreur
        if (!resp.ok) {
            throw new Error('Erreur HTTP')
        }
        
        // Étape 2 : On transforme la réponse texte du serveur en véritable tableau JavaScript
        users = await resp.json()

        // --- LOGIQUE MÉTIER ET RENTRÉE DES DONNÉES DANS L'INTERFACE ---
        showUsers() // On affiche la liste visuelle des utilisateurs
        showBooks() // On affiche (ou rafraîchit) les livres, car ils ont besoin de connaître les utilisateurs !
        
        // --- LOGIQUE MÉTIER : LE SÉLECTEUR DE LOCATION ---
        // On parcourt la liste de tous nos utilisateurs pour remplir dynamiquement la liste déroulante 
        // (<select id="loueur">) présente dans le formulaire de modification d'un livre.
        users.forEach(item => {
            $editBookForm.querySelector('#loueur').insertAdjacentHTML('beforeend',`
                <option value="${item.id}">${item.firstname} ${item.lastname}</option>
            `)
        })

    }
    catch (err) {
        // En cas de bug (serveur éteint, mauvaise URL...), on l'affiche dans la console de développement
        console.log(err)
    }
}

/**
 * AFFICHAGE DE LA LISTE DES LIVRES
 * Génère le code HTML pour chaque livre et y associe ses informations de location.
 */
const showBooks = () => {
    let template = '' // Variable temporaire qui va accumuler le code HTML de tous nos livres
    
    // On passe en revue chaque livre de notre tableau un par un
    books.forEach((book, key) => {
        // On commence à créer la balise de liste (<li>) avec le titre du livre et ses boutons X (Supprimer) et V (Modifier)
        template += `
        <li data-key="${key}" data-id="${book.id}" class="book">
        <p><a href="" class="delete">X</a> | <a href="" class="edit">V</a></p>
        ${book.title}
        `
        
        // --- LOGIQUE MÉTIER : CORRÉLATION ENTRE UN LIVRE ET SON LOCATAIRE ---
        // CONDITION : Si le livre est marqué comme "sorti" (book.out est vrai) ET qu'il possède un identifiant de client (book.id_user)
        if (book.out && book.id_user) {
            // On cherche dans notre tableau global 'users' le client dont l'ID correspond exactement à l'ID stocké dans le livre
            const myUser = users.find(user => user.id == book.id_user)
            
            // Si on a trouvé le client, on ajoute une ligne au HTML pour écrire son nom et prénom en gras
            template += `
            <p><strong>Loué par :</strong> ${myUser.firstname} ${myUser.lastname}</p>
            </li>
            `
        }
    })
    
    // On injecte tout le gros bloc de texte HTML généré directement dans la page web
    $bookList.innerHTML = template
}

/**
 * RÉCUPÉRATION DES LIVRES
 * Va chercher la liste des livres sur le serveur. C'est le point de départ de l'application.
 */
const fetchBooks = async () => {
    try {
        // Étape 1 : Demande de la liste des livres à l'API
        let resp = await fetch(`${urlApi}/books`)

        if (!resp.ok) {
            throw new Error(`Erreur HTTP : ${resp.status}`)
        }

        // Étape 2 : Enregistrement des livres reçus dans notre tableau global
        books = await resp.json()

        // Sécurité Métier : S'il n'y a aucun livre dans la base de données, on crée une alerte
        if (books.length < 1) {
            throw new Error(`Il n'y a pas de livres`)
        }
        
        // --- LOGIQUE MÉTIER : ORCHESTRATION DU CHARGEMENT ---
        // Très important : On attend d'avoir fini de charger les livres AVANT de lancer 'usersFetch()'.
        // Pourquoi ? Parce que l'affichage complet des livres a besoin des données des utilisateurs pour faire la liaison.
        usersFetch()
        console.log(books)

    }
    catch (err) { console.log(err) }
}

/**
 * AFFICHAGE DE L'ADRESSE
 * Injecte l'adresse physique de la bibliothèque dans le composant HTML prévu.
 */
const showAddress = (data) => {
    let template = `
    <p>${data.street}</p>
    <p>${data.zipcode} ${data.city}</p>
    `
    // On ajoute le texte HTML à la fin de la zone d'adresse sans écraser ce qui s'y trouvait déjà
    $address.insertAdjacentHTML("beforeend", template)
}

/**
 * RÉCUPÉRATION DE L'ADRESSE
 * Va chercher les coordonnées de la bibliothèque sur le serveur.
 */
const addressFetch = async () => {
    try {
        let resp = await fetch(`${urlApi}/address`)

        if (!resp.ok) {
            throw new Error('Erreur HTTP')
        }
        let data = await resp.json()

        showAddress(data) // Envoi des données brutes à la fonction d'affichage

    }
    catch (err) {
        console.log(err)
    }
}

/**
 * AFFICHAGE DE LA LISTE DES CLIENTS (USERS)
 * Génère le code HTML simple pour lister les abonnés de la bibliothèque.
 */
const showUsers = () => {
    let template = ''
    users.forEach((user, key) => {
        template += `
        <li data-key="${key}" data-id="${user.id}" class="book">
        <p><a href="" class="delete">X</a> | <a href="" class="edit">Edit</a></p>
        ${user.firstname} ${user.lastname}
        </li>
        `
    })
    $usersList.innerHTML = template
}

// =========================================================================
// GESTIONNAIRES D'ÉVÉNEMENTS (INTELLIGENCE ET INTERACTIONS DE L'UTILISATEUR)
// =========================================================================

/**
 * ACTIONS SUR LA LISTE DES LIVRES (SUPPRESSION OU MODIFICATION)
 * On écoute les clics sur toute la liste (Délégation d'événement).
 */
$bookList.addEventListener('click', e => {
    e.preventDefault() // Bloque le comportement par défaut des liens <a> (qui rechargent normalement la page)
    
    // --- CAS N°1 : CLIC SUR "X" (SUPPRIMER UN LIVRE) ---
    if (e.target.classList.contains('delete')) {
        // Fenêtre de sécurité pop-up : si l'utilisateur clique sur "Annuler", on s'arrête là
        if (!confirm("Supprimer le livre ?")) {
            return
        }
        
        // Extraction des informations stockées dans les attributs "data-" du <li> parent
        const li = e.target.closest('li')
        const key = li.dataset.key // L'emplacement (index) du livre dans notre tableau JavaScript local
        const id = li.dataset.id   // L'ID unique du livre enregistré en base de données (ex: 42)
        
        // Envoi de l'ordre de suppression définitive au serveur
        fetch(`${urlApi}/books/${id}`, {
            method: "DELETE" // Verbe HTTP pour supprimer
        })
            .then(resp => {
                if (resp.ok) {
                    // Si le serveur dit "OK", on synchronise notre tableau JavaScript en retirant le livre (index 'key', 1 seul élément)
                    books.splice(key, 1)
                    // On fait disparaître la ligne de l'écran (HTML)
                    li.remove()
                }
            })
            .catch(err => console.log(err))
    }

    // --- CAS N°2 : CLIC SUR "V" (OUVRIR LE FORMULAIRE DE MODIFICATION DU LIVRE) ---
    if (e.target.classList.contains('edit')) {
        const li = e.target.closest('li')
        const key = li.dataset.key
        const id = li.dataset.id
        const theBook = books[key] // Récupération de l'objet complet du livre sélectionné
        
        // Rendre le formulaire visible en retirant sa classe CSS "hidden" (caché)
        $editBookForm.classList.remove('hidden')
        
        // Remplissage automatique des champs de saisie avec les valeurs actuelles du livre
        $editBookForm.querySelector('#title').value = theBook.title
        $editBookForm.querySelector('#pages').value = theBook.pages
        $editBookForm.querySelector('#resume').value = theBook.resume
        $editBookForm.querySelector('#isbn').value = theBook.isbn
        
        // --- LOGIQUE MÉTIER : BOOLEEN DE SOUCHAGE DE STATUT ---
        // Si theBook.out est vrai, on coche la case (true), sinon on la décoche (false)
        $editBookForm.querySelector('#out').checked = (theBook.out) ? true : false
        
        // Stockage discret de l'ID et de la Key dans des champs cachés (<input type="hidden">)
        // pour s'en souvenir au moment où on cliquera sur "Valider"
        $editBookForm.querySelector('#id').value = id
        $editBookForm.querySelector('#key').value = key
    }
})

/**
 * SOUMISSION DU FORMULAIRE DE MODIFICATION DE LIVRE
 */
$editBookForm.addEventListener('submit', e => {
    e.preventDefault() // Empêche la page Web de s'actualiser
    
    // Outil JavaScript magique qui récupère d'un coup toutes les saisies du formulaire
    const newData = new FormData($editBookForm)
    // Conversion en un objet JavaScript propre (ex: {title: "Le Cid", pages: "120"...})
    const editBook = Object.fromEntries(newData.entries())
    
    console.log(editBook)
    const key = editBook.key // On extrait notre clé locale stockée tout à l'heure
    delete editBook.key     // On la retire de l'objet pour ne pas polluer l'envoi au serveur
    
    // --- LOGIQUE MÉTIER : CONTROLE DES DONNÉES ENTRÉES ---
    // RÈGLE COMMERCIALE N°1 : Un livre doit obligatoirement avoir un titre
    if (editBook.title == '') {
        alert('Veuillez fournir le titre')
        return // On bloque la soumission ici
    }
    
    // RÈGLE COMMERCIALE N°2 : Forcer le champ 'pages' à devenir un type Nombre (et pas du texte)
    editBook.pages = (Number(editBook.pages)) ? Number(editBook.pages) : null
    
    // RÈGLE COMMERCIALE N°3 : Traduction de la case à cocher
    // En HTML, une case cochée renvoie le texte "on". Nous la traduisons en Vrai (true) ou Faux (false) pour notre base de données.
    editBook.out = (editBook.out == "on") ? true : false
    
    // Configuration de la requête de mise à jour (PATCH)
    const args = {
        method: "PATCH", // Modifie partiellement une ressource existante
        headers: {
            "Content-Type": "application/json",
            "auth": `Bearer ${token}` // On transmet notre preuve de sécurité
        },
        body: JSON.stringify(editBook) // Conversion de l'objet JS en texte brut JSON lisible par le serveur
    }
    
    // Envoi de la mise à jour à l'URL spécifique du livre modifié (ex: /books/42)
    fetch(`${urlApi}/books/${editBook.id}`, args)
        .then(resp => resp.json()) // Le serveur nous renvoie le livre mis à jour de sa propre main
        .then(resp => {
            // Étape 1 : On remplace l'ancien livre par la nouvelle version du serveur dans notre tableau local
            books[key] = resp
            // Étape 2 : On redessine la liste des livres à l'écran pour afficher le nouveau titre ou l'état de location
            showBooks()
            // Étape 3 : On recache le formulaire et on le vide
            $editBookForm.classList.add('hidden')
            $editBookForm.reset()
        })
        .catch(err => console.log(err))
})

/**
 * ACTIONS SUR LA LISTE DES CLIENTS (SUPPRIMER OU OUVRIR LE FORMULAIRE DE MODIFICATION)
 * Fonctionne exactement sur le même principe que pour les livres.
 */
$usersList.addEventListener('click', e => {
    e.preventDefault()
    
    // Supprimer un client
    if (e.target.classList.contains('delete')) {
        if (!confirm("Supprimer le client ?")) {
            return
        }
        const li = e.target.closest('li')
        const key = li.dataset.key
        const id = li.dataset.id
        
        fetch(`${urlApi}/users/${id}`, {
            method: "DELETE"
        })
            .then(resp => {
                if (resp.ok) {
                    users.splice(key, 1) // Retire du tableau JavaScript
                    li.remove()          // Retire du HTML visuel
                }
            })
            .catch(err => console.log(err))
    }

    // Ouvrir le formulaire de modification du client
    if (e.target.classList.contains('edit')) {
        const li = e.target.closest('li')
        const key = li.dataset.key
        const id = li.dataset.id
        
        $editUserForm.classList.remove('hidden') // Affiche le formulaire
        const theUser = users[key]
        
        // Injecte les données existantes du client dans les champs de saisie
        $editUserForm.querySelector('#firstname').value = theUser.firstname
        $editUserForm.querySelector('#lastname').value = theUser.lastname
        $editUserForm.querySelector('#key').value = key
        $editUserForm.querySelector('#id').value = id
    }

})

/**
 * FORMULAIRE : CRÉATION D'UN NOUVEAU CLIENT
 */
$newUserForm.addEventListener('submit', e => {
    e.preventDefault()
    const newData = new FormData($newUserForm)
    const newUser = Object.fromEntries(newData.entries())
    
    const args = {
        method: "POST", // POST est le verbe HTTP standard pour CRÉER quelque chose
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
    }
    
    fetch(`${urlApi}/users`, args)
        .then(resp => resp.json()) // Reçoit le client créé (qui possède maintenant un 'id' unique attribué par le serveur)
        .then(resp => {
            users.push(resp) // Ajoute le nouveau client à la fin de notre tableau local
            showUsers()      // Actualise l'écran
        })
        .catch(err => console.log(err))
})

/**
 * FORMULAIRE : VALIDATION DE LA MODIFICATION CLIENT
 */
$editUserForm.addEventListener('submit', e => {
    e.preventDefault()
    const newData = new FormData($editUserForm)
    const editUser = Object.fromEntries(newData.entries())
    const keyUser = editUser.key
    delete editUser.key
    
    const args = {
        method: "PATCH", // Modification ciblée
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(editUser)
    }
    
    fetch(`${urlApi}/users/${editUser.id}`, args)
        .then(resp => resp.json())
        .then(resp => {
            users[keyUser] = resp // Enregistre les changements dans notre tableau local
            showUsers()           // Actualise l'affichage des utilisateurs
            $editUserForm.reset() // Nettoie le formulaire
            $editUserForm.classList.add('hidden') // Recache le formulaire
        })
        .catch(err => console.log(err))
})

/**
 * FORMULAIRE : AJOUT D'UN NOUVEAU LIVRE
 */
$newBookForm.addEventListener('submit', e => {
    e.preventDefault()
    const newData = new FormData($newBookForm)
    const newBook = Object.fromEntries(newData.entries())
    
    // --- LOGIQUE MÉTIER DE VÉRIFICATION À LA CRÉATION ---
    if (newBook.title == '') {
        alert('Veuillez fournir le titre')
        return
    }
    newBook.pages = (Number(newBook.pages)) ? Number(newBook.pages) : null
    newBook.out = (newBook.out == "on") ? true : false
    
    const args = {
        method: "POST", // Création en base de données
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newBook)
    }
    
    fetch(`${urlApi}/books`, args)
        .then(resp => resp.json())
        .then(resp => {
            books.push(resp) // Insère le nouveau livre dans notre mémoire locale
            showBooks()      // Actualise l'écran pour voir apparaître le livre
        })
        .catch(err => console.log(err))
})

// =========================================================================
// DEMARRAGE ET INITIALISATION DU SITE INTERNET
// =========================================================================

/**
 * Chef d'orchestre du site. Cette fonction se lance immédiatement à l'ouverture de la page.
 */
const init = () => {
    fetchBooks()   // Déclenche le chargement des livres (qui lancera ensuite les clients à sa suite)
    addressFetch() // Déclenche le chargement des coordonnées de la bibliothèque
}

// Lancement effectif de notre application !
init()