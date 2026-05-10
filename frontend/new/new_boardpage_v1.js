
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

add_task_btn.addEventListener("click", () => {
    let checked = false;
    // Check if already displayed
    const existing_alts = document.getElementById("add-task-alts");
    if (existing_alts) {
        existing_alts.remove();
        return;
    }

    const task_type = document.createElement("div");
    task_type.id = "add-task-alts";
    
    const header = document.createElement("div");
    header.id = "add-task-popup-div";
    const title = document.createElement("h3");
    title.textContent = "Add task";
    title.id = "add-task-popup-title";
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
    task_name.id = "task-name-input";

    // Add knapp
    const add_btn = document.createElement("button");
    add_btn.textContent = "Add"
    add_btn.id = "add-btn";
    add_btn.addEventListener("click", () => {
        // Save the input field
        userInput = task_name.value.trim();
        if(!(userInput === null || userInput === "")) {
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
                if(check_btn.textContent === "") {
                    check_btn.textContent = "✔️";

                    const confirm_popup = document.createElement("div");
                    confirm_popup.classList.add("confirm_popup");
                    
                    const question = document.createElement("h4");
                    question.textContent = "Confirm task as done?";
                    
                    const confirm_btns = document.createElement("div");
                    confirm_btns.id = "confirm-btns";
                    
                    const yes_btn = document.createElement("button");
                    yes_btn.textContent = "Yes";
                    yes_btn.classList.add("task-popup-close");
                    yes_btn.id = "yes-btn";
                    yes_btn.addEventListener("click", () => {
                        confirm_btns.remove();
                        checked = true;
                    })

                    const no_btn = document.createElement("button");
                    no_btn.textContent = "No";
                    no_btn.classList.add("task-popup-close");
                    no_btn.id = "no-btn";
                    no_btn.addEventListener("click", () => {
                        
                    })

                    confirm_btns.append(yes_btn, no_btn);
                } else {
                    check_btn.textContent = "";
                }
                
            })

            const delete_btn = document.createElement("button");
            delete_btn.textContent = "Delete";
            delete_btn.classList.add("delete-task-btn");
            
            delete_btn.addEventListener("click", () => {
                new_task.remove();
            });
            const task_tail = document.createElement("div");
            task_tail.classList.add("task-tail");
            task_tail.append(check_btn, delete_btn);
            
            new_task.append(task_header, task_tail);
            tasks_container.append(new_task);
        } else {
            return;
        }

        // Remove popup
        task_type.remove();
    });



    task_type.append(header, task_name, add_btn);
    document.getElementById("task-btns-div").append(task_type);

    
});



// // Timer youtube
// const timer_btn = document.getElementById("timer-btn");
// let timeDisplayed = null;
// let startTime = null;
// let interval = null;
// let remainingTime = 0;
// let timerIsRunning = false;
// let timerIsPaused = false;
// let pauseBtn = null;

// function updateTimer(time) {
//     let minutes = Math.floor(time/60);
//     let seconds = time % 60;

//     return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
// };

// function updatePauseButton() {
//     if (!pauseBtn) return;

//     if (timerIsRunning) {
//         pauseBtn.textContent = "Pause";
//         pauseBtn.style.backgroundColor = "red";
//     } else {
//         pauseBtn.textContent = "Unpause";
//         pauseBtn.style.backgroundColor = "green";
//     }
// }

// const startTimer = (time) => {
//     clearInterval(interval);

//     remainingTime = time;
//     timerIsRunning = true;
//     timerIsPaused = false;

//     timeDisplayed.style.display = "block";

//     const timerText = updateTimer(remainingTime);

//     timeDisplayed.textContent = timerText;
//     document.title = timerText + " - StudyHelper";

//     updatePauseButton();

//     interval = setInterval(() => {
//         remainingTime--;

//         timeDisplayed.textContent = updateTimer(remainingTime);
//         document.title = updateTimer(remainingTime) + " - StudyHelper";

//         if (remainingTime <= 0) {
//             clearInterval(interval);
//             timerIsRunning = false;
//             timerIsPaused = false;

//             timeDisplayed.textContent = updateTimer(0);
//             document.title = "Time's up!";
//             updatePauseButton();

//             setTimeout(() => {
//                 alert("Time's up!");
//                 timeDisplayed.style.display = "none";
//                 document.title = "StudyHelper";
//             }, 100);
//         }
//     }, 1000);
// };

// // const stopTimer = () => clearInterval(interval);

// // const resetTimer = () => {
// //     clearInterval(interval);
// //     timeLeft = 1500;
// //     updateTimer();
// // }


// timer_btn.addEventListener("click", () => {
//     // Check if already displayed
//     const existing_alts = document.getElementById("timer-alts");
//     if (existing_alts) {
//         existing_alts.remove();
//         return;
//     }

//     const timer_other1 = document.getElementById("schedule-alts"); // ?
//     const timer_other2 = document.getElementById("sound-alts");

//     if (timer_other1) {
//         timer_other1.remove();
//     }
    
//     if (timer_other2) {
//         timer_other2.remove();
//     }
    
//     const timer_type = document.createElement("div");
//     timer_type.id = "timer-alts";
    
//     const header = document.createElement("div");
//     header.id = "timer-popup-div";
//     const title = document.createElement("h3");
//     title.textContent = "Timer";
//     title.id = "timer-popup-title";
//     const exit_btn = document.createElement("button");
//     exit_btn.textContent = "X";
//     exit_btn.classList.add("task-popup-close");
//     exit_btn.addEventListener("click", () => {
//         // Remove popup
//         timer_type.remove();
//     });
//     header.append(title, exit_btn);
//     timeDisplayed = document.getElementById("timer-text");
//     if(!timerIsRunning) {
//         timeDisplayed.textContent = startTime === null ? updateTimer(0) : updateTimer(startTime);
//     }
//     const alt1 = document.createElement("button");
//     alt1.id = "pomodoro";
//     alt1.textContent = "Pomodoro";
//     alt1.addEventListener("click", () => {
//         startTime = 1500;
//         startTimer(startTime);
//         timer_type.remove();
// });

//     const alt2 = document.createElement("button");
//     alt2.id = "custom";
//     alt2.textContent = "Custom";
//     alt2.addEventListener("click", () => {
//         const custom_container = document.createElement("div");
//         custom_container.id = "custom-container";

//         const header_custom = document.createElement("div");
//         header_custom.id = "timer-popup-div";
//         const title_custom = document.createElement("h3");
//         title_custom.textContent = "Custom";
//         title_custom.id = "custom-popup-title";
//         const exit_btn_custom = document.createElement("button");
//         exit_btn_custom.textContent = "X";
//         exit_btn_custom.classList.add("task-popup-close");
//         exit_btn_custom.addEventListener("click", () => {
//             // Remove popup
//             custom_container.remove();
//         });
//         header_custom.append(title_custom, exit_btn_custom);

//         // const time_text = document.createElement("p");
//         // time_text.id = "time-text";
//         // time_text.textContent = "Select time: ";

//         // const time_input = document.createElement("input");
//         // time_input.type = "time";
//         // time_input.id = "time-input"
        
//         // Minutes input
//         const minutes_input = document.createElement("input");
//         minutes_input.type = "number";
//         minutes_input.placeholder = "MM";

//         // Seconds input
//         const seconds_input = document.createElement("input");
//         seconds_input.type = "number";
//         seconds_input.placeholder = "SS";

//         const submit_btn = document.createElement("button");
//         submit_btn.id = "submit-btn";
//         submit_btn.classList.add("task-popup-close");
//         submit_btn.textContent = "Start";
//         submit_btn.addEventListener("click", () => {
//             // const [minutes_input, seconds_input] = time_input.value.split(":");
//             const minutes = Number(minutes_input.value);
//             const seconds = Number(seconds_input.value);
            
//             if(minutes_input.value === "" || seconds_input.value === "") {
//                 alert("Please fill in both minutes and seconds");
//             } else if(minutes < 0 || seconds < 0 || seconds > 59) {
//                 alert("Please insert a valid time");
//             } else {
//                 startTime = minutes * 60 + seconds;
//                 custom_container.remove();
//                 timer_type.remove()
//                 startTimer(startTime);
                
//             }
//         });
//         custom_container.append(header_custom, 
//             document.createTextNode("Minutes:"), minutes_input,
//             document.createTextNode("Seconds:"), seconds_input, 
//             submit_btn);
//         timer_type.append(custom_container);
        
//     });

//     const timer_controls = document.createElement("div");
//     timer_controls.id = "timer-controls";
//     timer_controls.style.display = "flex";
//     timer_controls.style.marginTop = "5px";

//     const restart_btn = document.createElement("button");
//     restart_btn.classList.add("task-popup-close");
//     restart_btn.textContent = "Restart";
//     restart_btn.style.marginRight = "2px";

//     pauseBtn = document.createElement("button");
//     pauseBtn.classList.add("task-popup-close")
//     pauseBtn.textContent = "Pause";
//     pauseBtn.style.backgroundColor = "red";
//     pauseBtn.style.marginLeft = "2px";

//     pauseBtn.addEventListener("click", () => {
//         if (timerIsRunning) {
//             clearInterval(interval);
//             timerIsRunning = false;
//             timerIsPaused = true;
//         } else if (timerIsPaused) {
//             startTimer(remainingTime);
//         }

//         updatePauseButton();
//     });

//     restart_btn.addEventListener("click", () => {
//         if (startTime === null) {
//             return;
//         }

//         clearInterval(interval);

//         remainingTime = startTime;

//         timerIsRunning = false;
//         timerIsPaused = true;

//         timeDisplayed.textContent = updateTimer(startTime);
//         timeDisplayed.style.display = "block";

//         updatePauseButton();
//     });

//     timer_controls.append(restart_btn, pauseBtn);

     
//     timer_type.append(header, alt1, alt2, timer_controls);
//     document.getElementById("features-btns-div").append(timer_type);
//     // document.body.append(sound_type);

// });