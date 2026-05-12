// const { type } = require("node:os");
console.log("startpage_API.js loaded");

// function getAllBoards() {
//     return fetch("/boards", {method: "GET", headers: {"Content-Type": "application/json"}}).then(res => res.json());
// }

console.log("startpage_API.js loaded");

export async function loadboards() {
    const response = await fetch("/boards");
    const boards = await response.json();
    return boards;
}

export async function saveBoard(name, type) {
    const response = await fetch("/boards", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, type })
    });

    return await response.json();
}

function getGruopBoard (type) {
    return fetch("/boards", {
        Method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({type})
    }).then(res => res.json());
}

// getPersonalBoards() {}

// getboardbyid() {}

// deleteBoardById() {}

// PatchBoardById() {}

// ////////

// saveSubjectCards() {}

// getSubjectCard() //kalla på get tasks

// getAllSubjectCards() {}

// deleteSubjectCardById() {}

// patchSubjectCardById()

// //////

// saveTask() {}

// getTasks() {} //??

// deleteTaskById() {}

// patchTaskById() {}
