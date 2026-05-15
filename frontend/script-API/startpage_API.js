
console.log("startpage_API.js loaded");


export async function loadboards() {
    const boards = await getAllBoards();
    console.log(boards);
}

// -------------------- BOARD FUNKTIONER ------------------------

//ska man skicka tokens med auth0 på varje request?
// eller ska man skicka med user_id?
export async function getAllBoards() {
    return await fetch("/boards")
        .then(res => res.json());
}

//creates board and posts it in db
export async function createBoard(name, type) {
  return await fetch("/boards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, type })
  }).then(res => res.json());
}

//avgör om den ska hämta personal eller group
//bättre att göra med 1 funktion än 2
export async function getBoardsByType(type) {
    return await fetch(`/boards/type/${type}`)
    .then(res => res.json());
}

export async function deleteBoardById(board_id) {
    return await fetch(`/boards/${board_id}`, {
        method: 'DELETE'
    }) 
}

export async function patchBoardById(board_id, new_name) {
    return await fetch(`/boards/${board_id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board_id, new_name })
    })
    .then(res => res.json());
}

