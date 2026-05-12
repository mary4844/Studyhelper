

// -----------------------CARD FUNKTIONER ----------------------

// board_id=${board_id} används i url:en men behövs inte i routes, används bara för att 
// skicka board_id eftersom GET inte har någon body.

//kommer card_id vara unikt igenom hela databasen?, då behövs inte board_id

export async function createSubjectCard(board_id, subject_card_name) {
    return await fetch(`/boards/${board_id}/cards`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_card_name })
    }).then(res => res.json());
}

export async function getAllSubjectCards(board_id) {
    return await fetch(`/boards/${board_id}/cards`)
    .then(res => res.json());
}

export async function getSubjectCardById(board_id, subject_card_id) {

    return await fetch(`/boards/${board_id}/cards/${subject_card_id}`)
    .then(res => res.json());
}

export async function deleteSubjectCardById(board_id, subject_card_id) {
    return await fetch(`/boards/${board_id}/cards/${subject_card_id}`, {
        method: 'DELETE'
    });
}

export async function patchSubjectCardById(board_id, subject_card_id, subject_card_name) {
    return await fetch(`/boards/${board_id}/cards/${subject_card_id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_card_name })
    }).then(res => res.json());
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

export async function createTask(board_id, subject_card_id, task_name, deadline) {
    return await fetch(`/boards/${board_id}/cards/${subject_card_id}/tasks`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_name, deadline })
    }).then(res => res.json());
}

export async function getTasks(board_id, subject_card_id) {
    return await fetch(`/boards/${board_id}/cards/${subject_card_id}/tasks`)
        .then(res => res.json());
}

export async function deleteTaskById(board_id, subject_card_id, task_id) {
    return await fetch(`/boards/${board_id}/cards/${subject_card_id}/tasks/${task_id}`, {
        method: 'DELETE'
    });
}

export async function patchTaskById(board_id, subject_card_id, task_id, task_name) {
    return await fetch(`/boards/${board_id}/cards/${subject_card_id}/tasks/${task_id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_name })
    }).then(res => res.json());
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