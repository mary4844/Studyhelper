import {
    createSubjectCard,
    getAllSubjectCards,
    createTask,
    getTasks,
    deleteTaskById,
} from "/script-API/boardpage_API.js";

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

async function getDefaultSubjectCardId() {
    if (!boardId) {
        alert("Missing board id. Go back and open a board from the start page.");
        throw new Error("Missing board_id in URL");
    }

    const cards = await getAllSubjectCards(boardId);
    if (cards.length > 0) {
        return cards[0].subject_card_id;
    }

    const createdCard = await createSubjectCard(boardId, "General");
    return createdCard.subject_card_id;
}

function renderTask(taskName, taskId) {
    const task_wrapper = document.createElement("div");
    task_wrapper.classList.add("task-wrapper");
    task_wrapper.dataset.taskId = taskId;

    const new_task = document.createElement("span");
    new_task.style.background = page_color;
    new_task.classList.add("task");

    const task_title = document.createElement("h2");
    task_title.textContent = taskName;
    task_title.style.fontWeight = "bold";
    task_title.style.color = "white";
    task_title.classList.add("task-title");

    const task_header = document.createElement("div");
    task_header.classList.add("task-header");
    task_header.append(task_title);

    const check_btn = document.createElement("button");
    check_btn.style.fontSize = "100%";
    check_btn.classList.add("check-task-btn");
    check_btn.addEventListener("click", () => {
        check_btn.textContent = check_btn.textContent === "" ? "✔️" : "";
        applyTaskFilter(selectedAltYourTasks);
    });

    const delete_btn = document.createElement("button");
    delete_btn.textContent = "Delete";
    delete_btn.classList.add("delete-task-btn");
    delete_btn.addEventListener("click", async () => {
        if (subjectCardId && taskId) {
            await deleteTaskById(boardId, subjectCardId, taskId);
        }
        task_wrapper.remove();
    });

    const task_tail = document.createElement("div");
    task_tail.classList.add("task-tail");
    const task_tail_confirm_btns = document.createElement("div");
    task_tail_confirm_btns.classList.add("task-tail-confirm-btns");
    task_tail_confirm_btns.append(check_btn, delete_btn);
    task_tail.append(task_tail_confirm_btns);

    new_task.append(task_header, task_tail);
    task_wrapper.append(new_task);
    tasks_container.append(task_wrapper);
    applyTaskFilter(selectedAltYourTasks);
}

async function loadExistingTasks() {
    try {
        subjectCardId = await getDefaultSubjectCardId();
        const tasks = await getTasks(boardId, subjectCardId);
        tasks.forEach((task) => renderTask(task.task_name, task.task_id));
    } catch (error) {
        console.error("Could not load tasks:", error);
    }
}

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
        if(!(userInput === null || userInput === "")) {
            try {
                if (!subjectCardId) {
                    subjectCardId = await getDefaultSubjectCardId();
                }
                await createTask(boardId, subjectCardId, userInput, null);
            } catch (error) {
                console.error("Could not create task:", error);
                alert("Could not create task. Check the server terminal.");
                return;
            }

            // lägg till ny task med namnet
            const new_task = document.createElement("span");
            new_task.style.background = page_color;
            new_task.classList.add("task");

            const dropdown_btn = document.createElement("button");
            dropdown_btn.textContent = "▼";
            dropdown_btn.style.background = page_color;
            dropdown_btn.classList.add("dropdown-btn");

            const task_title = document.createElement("h2");
            task_title.textContent = userInput;
            task_title.style.fontWeight = "bold";
            task_title.style.color = "white";
            task_title.classList.add("task-title");

            const task_header = document.createElement("div");
            task_header.classList.add("task-header");
            task_header.append(dropdown_btn, task_title);

            const check_btn = document.createElement("button");
            check_btn.style.fontSize = "100%";
            check_btn.classList.add("check-task-btn");
            check_btn.addEventListener("click", () => {
                const current = document.querySelector(".confirm-popup-check");
                const other = document.querySelector(".confirm-popup-delete");
                if(other || current) {
                    return;
                }
                if(check_btn.textContent === "") {

                    const confirm_popup = document.createElement("div");
                    confirm_popup.classList.add("confirm-popup");
                    confirm_popup.classList.add("confirm-popup-check");
                    
                    const question = document.createElement("h5");
                    question.textContent = "Confirm task as done?";
                    
                    const confirm_btns = document.createElement("div");
                    confirm_btns.classList.add("confirm-btns");
                    
                    const yes_btn = document.createElement("button");
                    yes_btn.textContent = "Yes";
                    yes_btn.classList.add("yes-btn");
                    yes_btn.addEventListener("click", () => {
                        confirm_popup.remove();
                        checked = true;
                        check_btn.textContent = "✔️";
                    })

                    const no_btn = document.createElement("button");
                    no_btn.textContent = "No";
                    no_btn.classList.add("no-btn");
                    no_btn.addEventListener("click", () => {
                        confirm_popup.remove();
                        check_btn.textContent = "";
                    })

                    confirm_btns.append(yes_btn, no_btn);
                    confirm_popup.append(question, confirm_btns);
                    new_task.append(confirm_popup);
                } else {
                    check_btn.textContent = "";
                }
                
            })

            const delete_btn = document.createElement("button");
            delete_btn.textContent = "Delete";
            delete_btn.classList.add("delete-task-btn");
            delete_btn.addEventListener("click", () => {
                const current = document.querySelector(".confirm-popup-delete");
                const other = document.querySelector(".confirm-popup-check");
                if(other || current) {
                    return;
                }
                const confirm_popup = document.createElement("div");
                confirm_popup.classList.add("confirm-popup");
                confirm_popup.classList.add("confirm-popup-delete");
                
                const question = document.createElement("h5");
                question.textContent = "Delete task?";
                
                const confirm_btns = document.createElement("div");
                confirm_btns.classList.add("confirm-btns");
                
                const yes_btn = document.createElement("button");
                yes_btn.textContent = "Yes";
                yes_btn.classList.add("yes-btn");
                yes_btn.addEventListener("click", () => {
                    confirm_popup.remove();
                    deleted = true;
                    new_task.remove();
                })

                const no_btn = document.createElement("button");
                no_btn.textContent = "No";
                no_btn.classList.add("no-btn");
                no_btn.addEventListener("click", () => {
                    confirm_popup.remove();
                })

                confirm_btns.append(yes_btn, no_btn);
                confirm_popup.append(question, confirm_btns);
                new_task.append(confirm_popup);
            })
            
            const task_tail = document.createElement("div");
            task_tail.classList.add("task-tail");
            const task_tail_confirm_btns = document.createElement("div");
            task_tail_confirm_btns.classList.add("task-tail-confirm-btns");
            task_tail_confirm_btns.append(check_btn, delete_btn);

            // Subtasks container
            const subtasks_container = document.createElement("div");
            subtasks_container.classList.add("subtasks-container");

            // Add subtask button
            const subtask_controls = document.createElement("div");
            subtask_controls.classList.add("subtask-controls");

            const add_subtask_btn = document.createElement("button");
            add_subtask_btn.textContent = "Add Subtask";
            add_subtask_btn.classList.add("add-subtask-btn", "task-btns");

            add_subtask_btn.addEventListener("click", () => {
                const sub_existing_alts = document.querySelector(".sub-add-task-alts");
                if (sub_existing_alts) {
                    sub_existing_alts.remove();
                    return;
                }

                const sub_task_type = document.createElement("div");
                sub_task_type.classList.add("sub-add-task-alts");
                
                const sub_header = document.createElement("div");
                sub_header.classList.add("add-task-popup-div");
                const sub_title = document.createElement("h3");
                sub_title.textContent = "Add subtask";
                sub_title.classList.add("add-task-popup-title");
                sub_title.id = "sub-title";
                const sub_exit_btn = document.createElement("button");
                sub_exit_btn.textContent = "X";
                sub_exit_btn.classList.add("task-popup-close");
                sub_exit_btn.addEventListener("click", () => {
                    // Remove popup
                    sub_task_type.remove();
                });
                sub_header.append(sub_title, sub_exit_btn);

                // Input field
                const sub_task_name = document.createElement("input");
                sub_task_name.type = "text";
                sub_task_name.placeholder = "Enter task name"
                sub_task_name.classList.add("task-name-input");

                // Add knapp
                const sub_add_btn = document.createElement("button");
                sub_add_btn.textContent = "Add";
                sub_add_btn.classList.add("add-btn");
                sub_add_btn.addEventListener("click", () => {
                const subInput = sub_task_name.value.trim();

                if (subInput === "") {
                    return;
                }

                const subtask = document.createElement("div");
                subtask.classList.add("subtask");
                subtask.style.background = page_color;

                // Left side (title)
                const subtask_title = document.createElement("h3");
                subtask_title.textContent = subInput;
                subtask.id = "subtask-title";

                // Right side buttons
                const subtask_tail = document.createElement("div");
                subtask_tail.classList.add("subtask-tail");

                // Check button
                const subtask_check_btn = document.createElement("button");
                subtask_check_btn.classList.add("check-task-btn");
                subtask_check_btn.id = "sub-check-task-btn";

                subtask_check_btn.addEventListener("click", () => {
                    const current = document.querySelector(".confirm-popup-check");
                    const other = document.querySelector(".confirm-popup-delete");

                    if (other || current) {
                        return;
                    }

                    if (subtask_check_btn.textContent === "") {
                        const confirm_popup = document.createElement("div");
                        confirm_popup.classList.add("confirm-popup", "confirm-popup-check");

                        const question = document.createElement("h5");
                        question.textContent = "Confirm subtask as done?";

                        const confirm_btns = document.createElement("div");
                        confirm_btns.classList.add("confirm-btns");

                        const yes_btn = document.createElement("button");
                        yes_btn.textContent = "Yes";
                        yes_btn.classList.add("yes-btn");

                        yes_btn.addEventListener("click", () => {
                            confirm_popup.remove();
                            subtask_check_btn.textContent = "✔️";
                        });

                        const no_btn = document.createElement("button");
                        no_btn.textContent = "No";
                        no_btn.classList.add("no-btn");

                        no_btn.addEventListener("click", () => {
                            confirm_popup.remove();
                            subtask_check_btn.textContent = "";
                        });

                        confirm_btns.append(yes_btn, no_btn);
                        confirm_popup.append(question, confirm_btns);

                        subtask.append(confirm_popup);
                    } else {
                        subtask_check_btn.textContent = "";
                    }
                });

                // Delete button
                const subtask_delete_btn = document.createElement("button");
                subtask_delete_btn.id = "sub-delete-task-btn";
                subtask_delete_btn.textContent = "Delete";
                subtask_delete_btn.classList.add("delete-task-btn");

                subtask_delete_btn.addEventListener("click", () => {
                    const current = document.querySelector(".confirm-popup-delete");
                    const other = document.querySelector(".confirm-popup-check");

                    if (other || current) {
                        return;
                    }

                    const confirm_popup = document.createElement("div");
                    confirm_popup.classList.add("confirm-popup", "confirm-popup-delete");

                    const question = document.createElement("h5");
                    question.textContent = "Delete subtask?";

                    const confirm_btns = document.createElement("div");
                    confirm_btns.classList.add("confirm-btns");

                    const yes_btn = document.createElement("button");
                    yes_btn.textContent = "Yes";
                    yes_btn.classList.add("yes-btn");

                    yes_btn.addEventListener("click", () => {
                        confirm_popup.remove();
                        subtask.remove();
                    });

                    const no_btn = document.createElement("button");
                    no_btn.textContent = "No";
                    no_btn.classList.add("no-btn");

                    no_btn.addEventListener("click", () => {
                        confirm_popup.remove();
                    });

                    confirm_btns.append(yes_btn, no_btn);
                    confirm_popup.append(question, confirm_btns);

                    subtask.append(confirm_popup);
                });

                subtask_tail.append(subtask_check_btn, subtask_delete_btn);

                subtask.append(subtask_title, subtask_tail);

                subtasks_container.append(subtask);
                sub_task_type.remove();
            });

            sub_task_type.append(sub_header, sub_task_name, sub_add_btn);
            subtask_controls.append(sub_task_type);
                

            });

            // Dropdown button show/hide subtasks
            dropdown_btn.addEventListener("click", () => {
                if (subtasks_container.style.display === "none") {
                    subtasks_container.style.display = "flex";
                    dropdown_btn.textContent = "▼";
                } else {
                    subtasks_container.style.display = "none";
                    dropdown_btn.textContent = "▶";
                }
            });

            // Add subtask button to task
            subtask_controls.append(add_subtask_btn);
            task_tail.append(subtask_controls, task_tail_confirm_btns);

            // Add main task content
            new_task.append(task_header, task_tail);

            // Wrapper around task + subtasks
            const task_wrapper = document.createElement("div");
            task_wrapper.classList.add("task-wrapper");

            task_wrapper.append(new_task, subtasks_container);

            // Add everything to page
            tasks_container.append(task_wrapper);
            selectedAltYourTasks = "active";
            applyTaskFilter("active");
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
