
// -----------------------CARD FUNKTIONER ----------------------

// board_id=${board_id} används i url:en men behövs inte i routes, används bara för att 
// skicka board_id eftersom GET inte har någon body.

export async function createTask(board_id, task_name) {
    return await fetch(`/boards/${board_id}/tasks`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_name })
    }).then(res => res.json()); 
}

export async function getAllTasks(board_id) {
    return await fetch(`/boards/${board_id}/tasks`)
    .then(res => res.json());
}

export async function getTaskById(board_id, task_id) {

    return await fetch(`/boards/${board_id}/tasks/${task_id}`)
    .then(res => res.json());
}

export async function deleteTaskById(board_id, task_id) {
    return await fetch(`/boards/${board_id}/tasks/${task_id}`, {
        method: 'DELETE'
    });
}

export async function patchTaskById(board_id, task_id, task_name) {
    return await fetch(`/boards/${board_id}/tasks/${task_id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_name })
    }).then(res => res.json());
}

// ----------------------- TASK FUNKTIONER -------------------------

// ?cards=${card_id} och ?boards=${board_id} används i GET för att skicka
// parametrarna, behövs inte i routen

//om man inte skickar med deadline blir den automatiskt null
export async function createSubTask(board_id, task_id, subtask_name, deadline = null) {
    return await fetch(`/boards/${board_id}/tasks/${task_id}/subtasks`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtask_name, deadline })
    }).then(res => res.json());
}

export async function getSubTasks(board_id, task_id) {
    return await fetch(`/boards/${board_id}/tasks/${task_id}/subtasks`)
        .then(res => res.json());
}

export async function deleteSubTaskById(board_id, task_id, subtask_id) {
    return await fetch(`/boards/${board_id}/tasks/${task_id}/subtasks/${subtask_id}`, {
        method: 'DELETE'
    });
}

export async function patchTaskById(board_id, task_id, subtask_id, subtask_name) {
    return await fetch(`/boards/${board_id}/tasks/${task_id}/subtasks/${subtask_id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtask_name })
    }).then(res => res.json());
}

export async function patchTaskStatus(board_id, task_id, subtask_id) {
    return await fetch(`/boards/${board_id}/tasks/${task_id}/subtasks/${subtask_id}/status`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
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