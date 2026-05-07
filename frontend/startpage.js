function show_adding_board() {
    const dropdown = document.querySelector(".input");
    dropdown.classList.toggle("show-input");
}

function show_alterntive_boards() {
    const dropdown = document.querySelector(".alternatives");
    dropdown.classList.toggle("show-alternatives");
}

function new_board() {
    const entered_name = document.querySelector(".enter-name") // hämtar namnet som användaren skrev in
    const selected_type = document.querySelector('input[name="board-type"]:checked');
    
    if (entered_name.value.trim() === "") { // Kontrollera att man skrivit in ett namn
        alert("Du måste skriva ett namn på boarden!");
        return; // Avslutar funktionen här så ingen board skapas
    }

    const single_board_container = document.createElement("div");
    single_board_container.classList.add("single_board_conatainer");
    
    const new_board = document.createElement("a"); // skapar en a-tag, klickbar
    new_board.textContent = entered_name.value; // + " (" + selected_type.value + ")";// Tar fram värdet på inputen, en sträng
    new_board.href = "boardpage.html"; // Vart vi ska när vi klickar på boarden
    new_board.classList.add("board"); // Ger klassen board till elementet
    new_board.classList.add(selected_type.value); // Ger boarden en typ beroende på vad man valt, personal eller group
    single_board_container.appendChild(new_board);
    
    const remove_button = document.createElement("button");
    remove_button.textContent = "Delete"
    remove_button.class = "button"
    remove_button.onclick = remove_board;
    remove_button.classList.add("remove_button");
    single_board_container.appendChild(remove_button);
    
    const boards_container = document.querySelector(".boards-container"); // Lägg till vårt nya element på en class
    boards_container.appendChild(single_board_container);
    
    entered_name.value = ""; // tömmer inputen från innehåll så att man kan skriva in en ny
}

function personal_boards(event) { // att hämta specifika boards från databasen borde se ut såhär ungefär?
    event.preventDefault();

    fetch("/personal_boards")
    .then(res => res.json())
    .then(tasks => {
        list.innerHTML = ""; // clear list
        tasks.forEach(task => {
            const li = document.createElement("li");
            li.textContent = task.task_name;
            list.appendChild(li);
        });
    }); 
}

function group_boards(event) {
    console.log("entered group boards")
    event.preventDefault();

}

function all_boards(event) {
    console.log("entered all boards")
    event.preventDefault();

}

function clear_boards_container() {
    console.log("entered clear boards")
}

function remove_board() {
    console.log("entered remove board")
}