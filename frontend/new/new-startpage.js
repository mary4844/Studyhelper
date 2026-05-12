import { saveBoard, loadboards } from "../scripts/startpage_API.js";

console.log("new-startpage.js loaded");

// Add_board knappen
const add_board_btn = document.getElementById("add-board-btn");
const boards_container = document.getElementById("boards-container");
let userInput = null;
let selectedAlt = null;


function renderboards(boards) {
    boards_container.innerHTML = ""; // Clear existing boards
    
    boards.forEach(board => {
        const bordElement = document.createElement("a");

        bordElement.textContent = board.name;
        bordElement.dataset.id = board.id; // Store board ID for later use
        bordElement.classList.add("board");

        if (board.type === "personal") {
            bordElement.classList.add("board-personal");
        } else if (board.type === "group") {
            bordElement.classList.add("board-group");
        }

        boards_container.appendChild(bordElement);
    });
}


async function fetchAndRenderBoards() {
    const boards = await loadboards();
    console.log("boards from backend:", boards);

    renderboards(boards);
}


document.addEventListener("DOMContentLoaded", async () => {
    await fetchAndRenderBoards();
});


add_board_btn.addEventListener("click", () => {
    // Check if already displayed
    const existing_alts = document.getElementById("add-board-alts");
    if (existing_alts) {
        // Spara den radio som var checkad
        const checkedRadio = existing_alts.querySelector("input[name='board-type']:checked");

        if(checkedRadio) {
            selectedAlt = checkedRadio.value;
        }

        existing_alts.remove();
        return;
    }

    const board_type = document.createElement("div");
    board_type.id = "add-board-alts";
    
    const header = document.createElement("div");
    header.id = "add-board-popup-div";

    const title = document.createElement("h3");
    title.textContent = "Add Board";
    title.id = "add-board-popup-title";

    const exit_btn = document.createElement("button");
    exit_btn.textContent = "X";
    exit_btn.classList.add("board-popup-close");

    exit_btn.addEventListener("click", () => {
        const checkedRadio = board_type.querySelector(
            "input[name='board-type']:checked"
        );

        if (checkedRadio) {
            selectedAlt = checkedRadio.value;
        }

        board_type.remove();
    });

    header.append(title, exit_btn);

    // Input field
    const board_name = document.createElement("input");
    board_name.type = "text";
    board_name.placeholder = "Enter board name";
    board_name.id = "board-name-input";

    // Alternativ 1
    const alt1 = document.createElement("div");
    alt1.id = "alt1";

    const radio1 = document.createElement("input");
    radio1.type = "radio";
    radio1.name = "board-type";
    radio1.value = "personal";
    
    const label1 = document.createElement("label");
    label1.textContent = " Personal board";


    // Alternativ 2
    const alt2 = document.createElement("div");
    alt2.id = "alt2";

    const radio2 = document.createElement("input");
    radio2.type = "radio";
    radio2.name = "board-type";
    radio2.value = "group";
    
    const label2 = document.createElement("label");
    label2.textContent = " Group board";
    
    if (selectedAlt === "personal") {
        radio1.checked = true;
    }

    if (selectedAlt === "group") {
        radio2.checked = true;
    }

    alt1.append(radio1, label1);
    alt2.append(radio2, label2);

    // Add knapp
    const add_btn = document.createElement("button");
    add_btn.textContent = "Add";
    add_btn.id = "add-btn";

    add_btn.addEventListener("click", async () => {
        // Save alt
        const checkedRadio = board_type.querySelector(
            "input[name='board-type']:checked"
        );

        if (checkedRadio) {
            selectedAlt = checkedRadio.value;
        }

        // Save the input field
        userInput = board_name.value.trim();

        if (!(userInput === null || userInput === "")) {
            if (selectedAlt === "personal" || selectedAlt === "group") {
                await saveBoard(userInput, selectedAlt);  // sparar först i backend/database
                await fetchAndRenderBoards();            // hämtar sedan från backend och renderar DOM
            } else {
                return;
            }
        } else {
            return;
        }

        // Remove popup
        board_type.remove();
    });


    board_type.append(header, board_name, alt1, alt2, add_btn);

    const second_btn = document.getElementById("your-boards-btn");
    document.getElementById("board-btns-div").insertBefore(board_type, second_btn);
});


// Your boards knappen
const your_boards_btn = document.getElementById("your-boards-btn");
let selectedAltYourBoards = null;

your_boards_btn.addEventListener("click", () => {
    // Check if already displayed
    const existing_alts = document.getElementById("your-boards-alts");
    if (existing_alts) {
        existing_alts.remove();
        return;
    }

    const board_type = document.createElement("div");
    board_type.id = "your-boards-alts";
    
    const header = document.createElement("div");
    header.id = "your-boards-popup-div";

    const title = document.createElement("h3");
    title.textContent = "Your Boards";
    title.id = "your-boards-popup-title";

    const exit_btn = document.createElement("button");
    exit_btn.textContent = "X";
    exit_btn.classList.add("board-popup-close");

    exit_btn.addEventListener("click", () => {
        board_type.remove();
    });

    header.append(title, exit_btn);

    const alt1 = document.createElement("button");
    alt1.id = "all-boards";
    alt1.textContent = "All boards";
    alt1.addEventListener("click", () => {
        selectedAltYourBoards = "all";
        board_type.remove();
    });

    const alt2 = document.createElement("button");
    alt2.id = "personal-boards";
    alt2.textContent = "Personal boards";
    alt2.addEventListener("click", () => {
        selectedAltYourBoards = "personal";
        board_type.remove();
    });

    const alt3 = document.createElement("button");
    alt3.id = "group-boards";
    alt3.textContent = "Group boards";
    alt3.addEventListener("click", () => {
        selectedAltYourBoards = "group";
        board_type.remove();
    });

    board_type.append(header, alt1, alt2, alt3);
    document.getElementById("board-btns-div").append(board_type);
});