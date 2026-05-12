

// -----------------------CARD FUNKTIONER ----------------------

// board_id=${board_id} används i url:en men behövs inte i routes, används bara för att 
// skicka board_id eftersom GET inte har någon body.

//kommer card_id vara unikt igenom hela databasen?, då behövs inte board_id

export async function createSubjectCard(board_id, card_name) {
    return await fetch(`/cards`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board_id, card_name })
    }).then(res => res.json());
}

//behöver vi user id?
export async function getAllSubjectCards(board_id) {
    return await fetch(`/cards?board_id=${board_id}`)
    .then(res => res.json());
}

export async function getSubjectCardById(board_id, card_id) {

    //board_id fås genom: const { board_id } = req.quary;
    return await fetch(`/cards/${card_id}?board_id=${board_id}`)
    .then(res => res.json());
}


export async function deleteSubjectCardById(board_id, card_id) {
    
    //board_id fås genom: const { board_id } = req.quary;
    return await fetch(`/cards/${card_id}?board_id=${board_id}`, {
        method: 'DELETE'
    })
}

export async function patchSubjectCardById(board_id, card_id, card_name) {
    return await fetch(`/cards/${card_id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board_id, card_id, card_name })
    })
    .then(res => res.json());
}

// ----------------------- OM CARD ID:N ÄR GLOBALT UNIKA ------------

// export async function createSubjectCard(card_name) {
//     return await fetch('/cards', {
//         method: 'PATCH',
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ card_name })
//     })
//     .then(res => res.json());
// }

// export async function getAllSubjectCards(board_id) {
//     return await fetch('/cards')
//     .then(res => res.json());
// }

// export async function getSubjectCardById(card_id) {
//     return await fetch(`/cards/${card_id}`)
//     .then(res => res.json());
// }

// export async function deleteSubjectCardById(card_id) {
//     return await fetch(`/cards/${card_id}`, {
//         method: 'DELETE'
//     })
// }

// export async function patchSubjectCardById(card_id, card_name) {
//     return await fetch(`/cards/${card_id}`, {
//         method: 'PATCH',
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ card_name })
//     })
// }


// ----------------------- TASK FUNKTIONER -------------------------

// ?cards=${card_id} och ?boards=${board_id} används i GET för att skicka
// parametrarna, behövs inte i routen

// samma som cards, om tasks alla har unika id:n så behövs parametrarna inte

export async function createTask(board_id, card_id, task_name, deadline) {
    return await fetch(`/tasks`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board_id, card_id, task_name, deadline})
    })
    .then(res => res.json());
}

export async function getTasks(board_id, card_id, task_id) {

    //skickar med board_id och card_id, routen är fortarande "/tasks/${task_id}"
    //fås genom: const { board_id, card_id } = req.query;
    return await fetch(`/tasks/${task_id}?board_id=${board_id}&card_id=${card_id}`)
    .then(res => res.json());
} 

export async function deleteTaskById(board_id, card_id, task_id) {
    
    //skickar med board_id och card_id, routen är fortarande "/tasks/${task_id}" 
    //fås genom: const { board_id, card_id } = req.query;   
    return await fetch(`/tasks/${task_id}?board_id=${board_id}&card_id=${card_id}`, {
        method: 'DELETE'
    })
}

export async function patchTaskById(board_id, card_id, task_id, new_name, new_deadline) {
    return await fetch(`/tasks/${task_id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board_id, card_id, task_id, new_name, new_deadline })
    })
    .then(res => res.json());
}

// ------------------------- OM TASKS ÄR GLOBALT UNIKA -----------------------

// export async function createTask(task_name, deadline) {
//     return await fetch('/tasks', {
//          method: 'POST',
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ task_name, deadline })
//     })
//     .then(res => res.json());
// }

// export async function getTasks(task_id) {
//     return await fetch(`/tasks/${task_id}`)
//     .then(res => res.json());
// }

// export async function deleteTaskById(task_id) {
//     return await fetch(`/tasks/${task_id}`, {
//         method: 'DELETE'
//     })
//     .then(res => res.json());
// }

// export async function patchTaskById(task_id, new_name, deadline) {
//     return await fetch(`/tasks/${task_id}`, {
//         method: 'PATCH',
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ new_name, deadline })
//     })
// }