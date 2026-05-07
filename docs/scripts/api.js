// Hanterar kommunikationen med backend
// Gör fetches

const API_URL = "https://studyhelper-xlki.onrender.com";

export function testFunction() {
  return fetch(`${API_URL}/boards`)
    .then(res => res.json());
}

export function getBoards() {
  return fetch(`${API_URL}/boards`)
    .then(res => res.json());
}

export function getBoardById(id) {
  return fetch(`${API_URL}/boards/${id}`)
    .then(res => res.json());
}

export function createBoard(name) {
  return fetch(`${API_URL}/boards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  }).then(res => res.json());
}