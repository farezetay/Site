const baseUrl = "https://www.odwb.be/api/explore/v2.1/catalog/datasets/offres-d-emploi-forem/records?limit=10"
let urlApi = baseUrl
const $offersList = document.querySelector("#offersList")
const $filters = document.querySelector("#filters")
const $searchForm = document.querySelector("#search__form")
const $jobCard = document.querySelector("#job-card")
const $modale = document.querySelector("#modale")

offers = []

const showOffers = () => {
  
  let template = ''

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

    $offersList.innerHTML = template
  })
}

const fetchOffers = async () => {
  
  
  
  try {
    let resp = await fetch(`${urlApi}`)

    if (!resp.ok) {
      throw new Error(`Erreur HTTP : ${resp.status}`)
    }

    data = await resp.json()
    offers = data.results

    if(offers.length == 0) {
      throw new Error(`Il n'y a pas d'offres disponibles`)
    }
    //console.log(offers)
  } 
  catch (err) {console.log(err)}

  showOffers()
}

$searchForm.addEventListener('submit', e => {
  e.preventDefault()
  let search = $searchForm.elements.search
  //console.log()
  urlApi = baseUrl
  if (search.value !== '' ) {
    urlApi += `&where="${search.value}"`
  }
  //console.log(urlApi)
  fetchOffers()
})

$offersList.addEventListener('click', e => {
  e.preventDefault()
  if(e.target.classList.contains('job-card__button')) {
    const sec = e.target.closest('section')
    const key = sec.dataset.key
    const id = sec.dataset.id
    const theOffer = offers[key]

    $modale.classList.remove("hidden")
  }

})



fetchOffers()