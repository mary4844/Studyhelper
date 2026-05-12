
//Vas ska type användas till?
const { type } = require("node:os");
console.log("startpage_API.js loaded");


export async function loadboards() {
    const boards = await getAllBoards();
    console.log(boards);
}

// -------------------- BOARD FUNKTIONER ------------------------

//ska man skicka tokens med auth0 på varje request?
// eller ska man skicka med user_id?
export async function getAllBoards() {
    return await fetch("/boards", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }})
        .then(res => res.json());
}

//creates board and posts it in db
export async function saveBoard(name, type) {
  return await fetch("/boards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, type })
  }).then(res => res.json());
}

export async function getGruopBoard (type) {
    return await fetch(`/boards/${type}`)
        .then(res => res.json());
}

//behöver vi skicka med nått för att hitta personliga boards?
export async function  getPersonalBoards(type) {
    return await fetch(`/boards/${type}`)
        .then(res => res.json());
}

//behövs antagligen inte när ska man ta en board bara? Kan lika gärna ta alla, sorteras ändå på type
export async function getboardbyid(board_id) {}


export async function deleteBoardById(board_id) {
    return await fetch(`/boards/${board_id}`, {
        method: 'DELETE'
    }) 
}

export async function patchBoardById(board_id) {
    return await fetch(`/boards/${board_id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board_id })
    })
    .then(res => res.json());
}