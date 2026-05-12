
console.log("startpage_API.js loaded");


export async function loadboards() {
    const boards = await getAllBoards();
    console.log(boards);
}

// -------------------- BOARD FUNKTIONER ------------------------

//behöver man skicka med id?
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

// -----------------------CARD FUNKTIONER ----------------------

export async function createSubjectCard(board_id, card_id) {
    return await fetch(`/boards/${board_id}/cards`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board_id, card_id })
    }).then(res => res.json());
}

//behöver vi user id?
export async function getAllSubjectCards(board_id) {
    return await fetch(`/board/${board_id}/cards`)
    .then(res => res.json());
}

export async function getSubjectCardById(board_id, card_id) {
    return await fetch(`/boards/${board_id}/cards/${card_id}`)
    .then(res => res.json());
}


export async function deleteSubjectCardById(board_id, card_id) {
    return await fetch(`/boards/${board_id}cards/${card_id}`, {
        method: 'DELETE'
    })
}

export async function patchSubjectCardById(board_id, card_id) {
    return await fetch(`/boards/${board_id}/cards/${card_id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board_id, card_id })
    })
    .then(res => res.json());
}

// ----------------------- TASK FUNKTIONER -------------------------

export async function createTask(board_id, card_id, task_id) {
    return await fetch(`boards/${board_id}/cards/${card_id}/tasks`, {
        method: 'POST',
        headers: { "Content-Type": "application/jason" },
        body: JSON.stringify({ board_id, card_id, task_id})
    })
    .then(res => res.json());
}

export async function getTasks(board_id, card_id, task_id) {
    return await fetch(`boards/${board_id}/cards/${card_id}/tasks/${task_id}`)
    .then(res => res.json());
} 

export async function deleteTaskById(board_id, card_id, task_id) {
    return await fetch(`boards/${board_id}/cards/${card_id}/tasks/${task_id}`, {
        method: 'DELETE'
    })
}

export async function patchTaskById(board_id, card_id, task_id) {
    return await fetch(`boards/${board_id}/cards/${card_id}/tasks/${task_id}`, {
        method: 'PATCH',
        headers: { "content-Type": "application/json" },
        body: JSON.stringify({ board_id, card_id, task_id })
    })
    .then(res => res.json());
}

