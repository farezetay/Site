const baseUrl = "https://www.odwb.be/api/explore/v2.1/catalog/datasets/offres-d-emploi-forem/records?limit=10"
let urlApi = baseUrl
const $offersList = document.querySelector("#offersList")
const $filters = document.querySelector("#filters")
const $searchForm = document.querySelector("#search__form")
const $jobCard = document.querySelector("#job-card")
const $modale = document.querySelector("#modale")

offers = []
/* Fonction pour montrer les offres */

const showOffers = () => {
  // On crée un template
  let template = ''
  // Pour chaque offre, on créer une section avec les données correspondantes dans la base de donnée
  offers.forEach((offer, key) => {
    template += `
    <section class="job-card" data-key="${key}" data-id="${offer.numerooffreforem}">
                        <div class="job-card__content">
                            <h3 class="job-card__title">
                                ${offer.titreoffre || "Inconnue"}
                            </h3>
                            <p class="job-card__company">
                                ${offer.nomemployeur || "Inconnue"}
                            </p>
                            <div class="job-card__infos">
                                <span class="job-card__tag">
                                    ${offer.lieuxtravaillocalite || "Inconnue"}
                                </span>
                                <span class="job-card__tag">
                                    ${offer.typecontrat || "Inconnue"}
                                </span>
                                <span class="job-card__tag">
                                    ${offer.regimetravail || "Inconnue"}
                                </span>
                            </div>
                        </div>
                        <div class="job-card__actions">
                            <button class="job-card__favorite">
                                ❤
                            </button>
                            <a href="#" class="job-card__button">
                                Voir l'offre
                            </a>
                        </div>
                    </section>
    `
    // On injecte tout dans l'HTML
    $offersList.innerHTML = template
  })
}
/* Fonction asynchrone pour chercher les offres */

const fetchOffers = async () => {
  
  
  // On interroge la base de donnée via l'API
  try {
    let resp = await fetch(`${urlApi}`)
    // On affiche une erreur si on ne peut pas y acceder
    if (!resp.ok) {
      throw new Error(`Erreur HTTP : ${resp.status}`)
    }
    // On récupèrer les données qu'on stock dans un array
    data = await resp.json()
    offers = data.results
    // Si l'array est vide alors on affiche qu'il n'y à pas d'offre
    if(offers.length == 0) {
      throw new Error(`Il n'y a pas d'offres disponibles`)
    }
    //console.log(offers)
  } 
  // On affiche les erreurs potentielle dans la console
  catch (err) {console.log(err)}

  showOffers()
}
/* Barre de recherche */

// Si on clique sur "rechercher"
$searchForm.addEventListener('submit', e => {
  e.preventDefault()
  // On récupère ce qui a été écrit dans la barre de recherche
  let search = $searchForm.elements.search
  //console.log()
  // On remet l'url à sa valeur initiale
  urlApi = baseUrl
  // Si il quelque chose est écrit dans la barre de recherche, on adapte l'url à la recherche
  if (search.value !== '' ) {
    urlApi += `&where="${search.value}"`
  }
  //console.log(urlApi)
  fetchOffers()
})

/* Bouton détail offre */

// Si on clique sur détail offre
$offersList.addEventListener('click', e => {
  e.preventDefault()
  if(e.target.classList.contains('job-card__button')) {
    // On récupère les données correspondant à l'offre cliquée 
    const sec = e.target.closest('section')
    const key = sec.dataset.key
    const id = sec.dataset.id
    const theOffer = offers[key]

    // On affiche la boite avec les détails de l'offre
    $modale.classList.remove("hidden")
  }

})



fetchOffers()