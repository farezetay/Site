const urlApi = "http://localhost:3000"
const $bookList = document.querySelector("#books")
const $address = document.querySelector("#address")
const $userList = document.querySelector("#users")
const $main = document.querySelector("#main")
const $newUserForm = document.querySelector("#new-user")
const $newBookForm = document.querySelector("#new-book")
const $editUserForm = document.querySelector("#edit-user")
const $editBookForm = document.querySelector("#edit-book")

let books = null
let users = null


/* Fonction pour afficher les livres */
const showBooks = () => {
  // On stock un template
  let template = ""
  // Pour chaque livre on crée un li avec le nom du livre
  books.forEach((book,key) => {
    template += `
    <li data-key="${key}" data-id="${book.id}" class="book">
    <p><a href="" class="delete">X</a> | <a href="" class="edit">Edit</a></p>
    ${book.title}
    </li>`
  })
  // On injecte les li dans l'HTML
  $bookList.innerHTML = template

}

const showAddress = (address) => {

  let template = `
  <p>${address.street}</p>
  <p>${address.zipcode} ${address.city}</p>  
  `

  $address.innerHTML = template

}

const showUsers = () => {
  // On stock un template
  let template = ""
  // Pour chaque livre on crée un li avec le nom du livre
  users.forEach((user,key) => {
    template += `
    <li data-key="${key}" data-id="${user.id}" class="user">
    <p><a href="" class="delete">X</a> | <a href="" class="edit">Edit</a></p>
    ${user.firstname} ${user.lastname}
    </li>`
  })
  // On injecte les li dans l'HTML
  $userList.innerHTML = template

}

const fetchAddress = async () => {
  try {

    let resp = await fetch(`${urlApi}/address`)

    if(!resp.ok) {
      throw new Error(`Erreur HTTP : ${resp.status}`)
    }

    let address = await resp.json()
    //console.log(address)

    showAddress(address)
  }
  catch (err) {console.log(err)}
} 
/* Fonction pour interroger la base de donnée */
// On crée une fonction asynchrone
const fetchBooks = async () => {
  // On essaye de récuperer les données
    try {
      
      let resp = await fetch(`${urlApi}/books`)
      
      if(!resp.ok) {
        throw new Error(`Erreur HTTP : ${resp.status}`)
      }

      books = await resp.json()
      
      if(books.length == 0) {
        throw new Error(`Il n'y a pas de livre`)
      }

      //console.log(books)

    }
  catch (err) {console.log(err)}
}

const fetchUsers = async () => {
  try {

    let resp = await fetch(`${urlApi}/users`)

    if(!resp.ok) {
      throw new Error(`Erreur HTTP : ${resp.status}`)
    }

    users = await resp.json()

    if(users.length == 0) {
      throw new Error(`Il n'y a pas d'utilisateur`)
    }

    //console.log(users)

    showUsers()
    showBooks()
  }
  catch (err) {console.log(err)}
}

// On écoute lorsqu'on clique
$bookList.addEventListener("click", e => {
  e.preventDefault()
  // 
  if(e.target.classList.contains("delete")) {
    if(!confirm("Voulez vous vraiment supprimer ?")) {
      return
    }
    // On récupère les attributs et le li concercné
    const li = e.target.closest('li')
    const key = li.dataset.key
    const id = li.dataset.id
    // On envoie à la base de donnée une requête pour faire un DELETE
     fetch(`${urlApi}/books/${id}`,{
      method: "DELETE"
  })
  // Si la base de donnée répond bien, on supprime le li
  .then(resp => {
    if(resp.ok) {
      books.splice(key,1)
      li.remove()
    }
  })
  .catch(err => console.log(err))

}
  if(e.target.classList.contains("edit")) {
    // On récupère les attributs et le li concercné
    const li = e.target.closest('li')
    const key = li.dataset.key
    const id = li.dataset.id
    // afficher le formulaire et l'alimenter en data
    $editBookForm.classList.remove("hidden")
    const theBook = books[Number(key)]
    $editBookForm.querySelector("#title2").value = theBook.title
    $editBookForm.querySelector("#pages2").value = theBook.pages
    $editBookForm.querySelector("#isbn2").value = theBook.isbn
    $editBookForm.querySelector("#resume2").value = theBook.resume
    $editBookForm.querySelector("#out2").checked = (theBook.out) ? true : false
    $editBookForm.querySelector("#key").value = key
    $editBookForm.querySelector("#id").value = id
    
  }
})

$userList.addEventListener("click", e => {
  e.preventDefault()
  // 
  if(e.target.classList.contains("delete")) {
    if(!confirm("Voulez vous vraiment supprimer ?")) {
      return
    }
    // On récupère les attributs et le li concercné
    const li = e.target.closest('li')
    const key = li.dataset.key
    const id = li.dataset.id
    // On envoie à la base de donnée une requête pour faire un DELETE
     fetch(`${urlApi}/users/${id}`,{
      method: "DELETE"
  })
  // Si la base de donnée répond bien, on supprime le li
  .then(resp => {
    if(resp.ok) {
      users.splice(key,1)
      li.remove()
    }
  })

  
  .catch(err => console.log(err))
}
if(e.target.classList.contains("edit")) {
    // On récupère les attributs et le li concercné
    const li = e.target.closest('li')
    const key = li.dataset.key
    const id = li.dataset.id
    // afficher le formulaire et l'alimenter en data
    $editUserForm.classList.remove("hidden")
    const theUser = users[Number(key)]
    $editUserForm.querySelector("#firstname2").value = theUser.firstname
    $editUserForm.querySelector("#lastname2").value = theUser.lastname
    $editUserForm.querySelector("#key").value = key
    $editUserForm.querySelector("#id").value = id
    
  }

})

$editBookForm.addEventListener('submit', e => {
  e.preventDefault()
  const newData = new FormData($editBookForm)
  const editBook = Object.fromEntries(newData.entries())
  if(editBook.title == "") {
    alert("Veuillez fournir le titre")
    return
  }
  editBook.pages = (Number(editBook.pages)) ? Number(editBook.pages) : null
  editBook.out = (editBook.out == "on") ? true : false
  const keyBook = editBook.key
  delete editBook.key
  const args = {
    method: "PATCH",
    header: {
      "content-type": "application/json"
    },
    body: JSON.stringify(editBook)
  }
  fetch(`${urlApi}/books/${editBook.id}`, args)
    .then(resp => resp.json())
    .then(resp => {
      books[keyBook] = resp
      showBooks()
      $editBookForm.reset()
      $editBookForm.classList.add("hidden")
    })
    .catch(err => console.log(err))
})

$editUserForm.addEventListener('submit', e => {
  e.preventDefault()
  const newData = new FormData($editUserForm)
  const editUser = Object.fromEntries(newData.entries())
  const keyUser = editUser.key
  delete editUser.key
  const args = {
    method: "PATCH",
    header: {
      "content-type": "application/json"
    },
    body: JSON.stringify(editUser)
  }
  fetch(`${urlApi}/users/${editUser.id}`, args)
    .then(resp => resp.json())
    .then(resp => {
      users[keyUser] = resp
      showUsers()
      $editUserForm.reset()
      $editUserForm.classList.add("hidden")
    })
    .catch(err => console.log(err))
})

/* add new user */

$newUserForm.addEventListener('submit', e => {
  e.preventDefault()
  const newData = new FormData($newUserForm)
  const newUser = Object.fromEntries(newData.entries())
  const args = {
    method: "Post",
    header: {
      "content-type": "application/json"
    },
    body: JSON.stringify(newUser)
  }
  fetch(`${urlApi}/users`, args)
    .then(resp => resp.json())
    .then(resp => {
      users.push(resp)
      showUsers()
    })
    .catch(err => console.log(err))
})

$newBookForm.addEventListener('submit', e => {
  e.preventDefault()
  const newData = new FormData($newBookForm)
  const newBook = Object.fromEntries(newData.entries())
  if(newBook.title == "") {
    alert("Veuillez fournir le titre")
    return
  }
  newBook.pages = (Number(newBook.pages)) ? Number(newBook.pages) : null
  newBook.out = (newBook.out == "on") ? true : false
  const args = {
    method: "Post",
    header: {
      "content-type": "application/json"
    },
    body: JSON.stringify(newBook)
  }
  fetch(`${urlApi}/books`, args)
    .then(resp => resp.json())
    .then(resp => {
      books.push(resp)
      showBooks()
    })
    .catch(err => console.log(err))
})

const init = () => {
    fetchAddress()
    fetchBooks()
    fetchUsers()
}

init ()
