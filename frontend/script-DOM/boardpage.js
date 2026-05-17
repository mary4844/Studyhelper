import {
    createSubjectCard,
    getAllSubjectCards,
    createTask,
    getTasks,
    deleteTaskById,
} from "/script-API/boardpage_API.js";

console.log("Current board id:", boardId);

// Rest of your board page code below
// Add_task knappen
let page_color_name = "blue";
let page_color = null;
let board_name = null;
if(page_color_name === "blue") {
    page_color = "#94C8F3";
}
const add_task_btn = document.getElementById("add-task-btn");
const tasks_container = document.getElementById("tasks-container");
let userInput = null;
let selectedAlt = null;
const boardId = new URLSearchParams(window.location.search).get("board_id");
let subjectCardId = null;

let selectedAltYourTasks = "all";

async function createTaskElement(task) {
    const new_task = document.createElement("span");
    new_task.style.background = page_color;
    new_task.classList.add("task");

    const dropdown_btn = document.createElement("button");
    dropdown_btn.textContent = "▼";
    dropdown_btn.style.background = page_color;
    dropdown_btn.classList.add("dropdown-btn");

    const task_title = document.createElement("h2");
    task_title.textContent = task.name;
    task_title.style.fontWeight = "bold";
    task_title.style.color = "white";
    task_title.classList.add("task-title");

    const task_header = document.createElement("div");
    task_header.classList.add("task-header");
    task_header.append(dropdown_btn, task_title);

    const check_btn = document.createElement("button");
    check_btn.style.fontSize = "100%";
    check_btn.classList.add("check-task-btn");
        if (task.completed) {
            check_btn.textContent = "✔️";
        }
        check_btn.addEventListener("click", async () => {
        const newCompletedState = !task.completed;

        await updateTask(task.id, newCompletedState);

        await displayTasks();
    });

    const delete_btn = document.createElement("button");
    delete_btn.textContent = "Delete";
    delete_btn.classList.add("delete-task-btn");
    delete_btn.addEventListener("click", async () => {
        await deleteTask(task.id);
        await displayTasks();
    });

    const task_tail_confirm_btns = document.createElement("div");
    task_tail_confirm_btns.classList.add("task-tail-confirm-btns");
    task_tail_confirm_btns.append(check_btn, delete_btn);

    const subtasks_container = document.createElement("div");
    subtasks_container.classList.add("subtasks-container");
    const subtasks = await loadSubtasks(task.id);

    subtasks.forEach(subtask => {
        const subtaskElement = document.createElement("div");
        subtaskElement.classList.add("subtask");
        subtaskElement.style.background = page_color;

        const subtaskTitle = document.createElement("h3");
        subtaskTitle.textContent = subtask.name;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-task-btn");

        deleteBtn.addEventListener("click", async () => {
            await deleteSubtask(subtask.id);
            await displayTasks();
        });

        const checkBtn = document.createElement("button");
        checkBtn.classList.add("check-task-btn");

        if (subtask.completed) {
            checkBtn.textContent = "✔️";
        }

        checkBtn.addEventListener("click", async () => {
            await updateSubtask(subtask.id, !subtask.completed);
            await displayTasks();
        });

        subtaskElement.append(subtaskTitle, checkBtn, deleteBtn);
        subtasks_container.append(subtaskElement);
    });
    const subtask_controls = document.createElement("div");
    subtask_controls.classList.add("subtask-controls");

    const add_subtask_btn = document.createElement("button");
    add_subtask_btn.textContent = "Add Subtask";
    add_subtask_btn.classList.add("add-subtask-btn", "task-btns");
    add_subtask_btn.addEventListener("click", async () => {
        const subInput = prompt("Enter subtask name:");

        if (subInput === null || subInput.trim() === "") {
            return;
        }

        await saveSubtask(task.id, subInput.trim());
        await displayTasks();
    });
    subtask_controls.append(add_subtask_btn);

    const task_tail = document.createElement("div");
    task_tail.classList.add("task-tail");
    task_tail.append(subtask_controls, task_tail_confirm_btns);

    dropdown_btn.addEventListener("click", () => {
        if (subtasks_container.style.display === "none") {
            subtasks_container.style.display = "flex";
            dropdown_btn.textContent = "▼";
        } else {
            subtasks_container.style.display = "none";
            dropdown_btn.textContent = "▶";
        }
    });

    new_task.append(task_header, task_tail);

    const task_wrapper = document.createElement("div");
    task_wrapper.classList.add("task-wrapper");
    task_wrapper.append(new_task, subtasks_container);

    return task_wrapper;
}

async function displayTasks() {
    const tasks = await loadTasks(boardId);

    tasks_container.innerHTML = "";

    for (const task of tasks) {
        const taskElement = await createTaskElement(task);
        tasks_container.append(taskElement);
    }

    applyTaskFilter(selectedAltYourTasks);
}

displayTasks();

const share_board_btn = document.getElementById("share-board-btn");

share_board_btn.addEventListener("click", () => {
    const existingPopup = document.getElementById("share-board-popup");

    if (existingPopup) {
        existingPopup.remove();
        return;
    }

    const popup = document.createElement("div");
    popup.id = "share-board-popup";

    const header = document.createElement("div");
    header.classList.add("add-task-popup-div");

    const title = document.createElement("h3");
    title.textContent = "Share Board";

    const close_btn = document.createElement("button");
    close_btn.textContent = "X";
    close_btn.classList.add("task-popup-close");

    close_btn.addEventListener("click", () => {
        popup.remove();
    });

    header.append(title, close_btn);

    const email_input = document.createElement("input");
    email_input.type = "email";
    email_input.placeholder = "Enter user email";

    const share_btn = document.createElement("button");
    share_btn.textContent = "Share";
    share_btn.classList.add("add-btn");

    share_btn.addEventListener("click", async () => {
        const email = email_input.value.trim();

        if (email === "") {
            alert("Please enter an email");
            return;
        }

        await shareBoard(boardId, email);

        popup.remove();
        alert("Board shared!");
    });

    popup.append(header, email_input, share_btn);

    document.getElementById("features-btns-div").append(popup);
});

function applyTaskFilter(filter) {
    const allTasks = document.querySelectorAll(".task-wrapper");

    allTasks.forEach(task => {
        const mainTask = task.querySelector(".task");
        const checkBtn = mainTask.querySelector(".check-task-btn");
        const isCompleted = checkBtn.textContent === "✔️";

        if (filter === "all") {
            task.style.display = "flex";
        } else if (filter === "completed") {
            task.style.display = isCompleted ? "flex" : "none";
        } else if (filter === "active") {
            task.style.display = !isCompleted ? "flex" : "none";
        }
    });
}

loadExistingTasks();

const other_alts = document.querySelector(".your-tasks-alts");
add_task_btn.addEventListener("click", () => {
    let checked = false;
    let deleted = false;
    // Check if already displayed
    const existing_alts = document.querySelector(".add-task-alts");
    if (existing_alts) {
        existing_alts.remove();
        return;
    }
    const other_alts = document.querySelector(".your-tasks-alts");
    if (other_alts) {
        other_alts.remove();
    }

    const task_type = document.createElement("div");
    task_type.classList.add("add-task-alts");
    
    const header = document.createElement("div");
    header.classList.add("add-task-popup-div");
    const title = document.createElement("h3");
    title.textContent = "Add task";
    title.classList.add("add-task-popup-title");
    const exit_btn = document.createElement("button");
    exit_btn.textContent = "X";
    exit_btn.classList.add("task-popup-close");
    exit_btn.addEventListener("click", () => {
        // Remove popup
        task_type.remove();
    });
    header.append(title, exit_btn);

    // Input field
    const task_name = document.createElement("input");
    task_name.type = "text";
    task_name.placeholder = "Enter task name"
    task_name.classList.add("task-name-input");

    // Add knapp
    const add_btn = document.createElement("button");
    add_btn.textContent = "Add"
    add_btn.classList.add("add-btn");
    add_btn.addEventListener("click", async () => {
        // Save the input field
        userInput = task_name.value.trim();
        if (!(userInput === null || userInput === "")) {
            await saveTask(boardId, userInput);

            selectedAltYourTasks = "active";
            await displayTasks();
        } else {
            return;
        }

        // Remove popup
        task_type.remove();
    });



    task_type.append(header, task_name, add_btn);
    const other = document.getElementById("your-tasks-btn");
    document.getElementById("task-btns-div").insertBefore(task_type, other);

    
});

const your_tasks_btn = document.getElementById("your-tasks-btn");

your_tasks_btn.addEventListener("click", () => {

    // Check if popup already exists
    const existing_alts = document.querySelector(".your-tasks-alts");

    if (existing_alts) {
        existing_alts.remove();
        return;
    }

    // Remove add task popup if open
    const other_alts = document.querySelector(".add-task-alts");

    if (other_alts) {
        other_alts.remove();
    }

    // Main popup
    const task_type = document.createElement("div");
    task_type.classList.add("your-tasks-alts");

    // Header
    const header = document.createElement("div");
    header.classList.add("your-tasks-popup-div");

    const title = document.createElement("h3");
    title.textContent = "Your Tasks";
    title.classList.add("your-tasks-popup-title");

    const exit_btn = document.createElement("button");
    exit_btn.textContent = "X";
    exit_btn.classList.add("task-popup-close");

    exit_btn.addEventListener("click", () => {
        task_type.remove();
    });

    header.append(title, exit_btn);

    // ALL TASKS
    const alt1 = document.createElement("button");
    alt1.id = "all-tasks";
    alt1.textContent = "All tasks";

    alt1.addEventListener("click", () => {

        selectedAltYourTasks = "all";
        applyTaskFilter("all");

        task_type.remove();
    });

    // COMPLETED TASKS
    const alt2 = document.createElement("button");
    alt2.id = "completed-tasks";
    alt2.textContent = "Completed tasks";

    alt2.addEventListener("click", () => {

        selectedAltYourTasks = "completed";
        applyTaskFilter("completed");

        task_type.remove();
    });

    // ACTIVE TASKS
    const alt3 = document.createElement("button");
    alt3.id = "active-tasks";
    alt3.textContent = "Active tasks";

    alt3.addEventListener("click", () => {

        selectedAltYourTasks = "active";
        applyTaskFilter("active");

        task_type.remove();
    });

    task_type.append(header, alt1, alt2, alt3);

    document.getElementById("task-btns-div").append(task_type);

});
