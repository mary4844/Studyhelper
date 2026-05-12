const { type } = require("node:os");
console.log("startpage_API.js loaded");


export async function loadboards() {
    const boards = await getAllBoards();
    console.log(boards);
}


function getAllBoards() {
    return fetch("/boards", {method: "GET", headers: {"Content-Type": "application/json"}}).then(res => res.json());
}

//creates board and posts it in db
export async function saveBoard(name, type) {
  return fetch("/boards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, type })
  }).then(res => res.json());
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

