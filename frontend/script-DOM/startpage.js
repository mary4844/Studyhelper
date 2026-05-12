import { saveBoard, loadboards } from "../script-API/startpage_API.js";
// Add_board knappen
const add_board_btn = document.getElementById("add-board-btn");
const boards_container = document.getElementById("boards-container");
let userInput = null;
let selectedAlt = null;
let selectedAltYourBoards = "all";

function applyBoardFilter(filter) {
    const allBoards = document.querySelectorAll(".board");

    allBoards.forEach(board => {
        if (filter === "all") {
            board.style.display = "block";
        } else if (filter === "personal") {
            board.style.display = board.classList.contains("board-personal")
                ? "block"
                : "none";
        } else if (filter === "group") {
            board.style.display = board.classList.contains("board-group")
                ? "block"
                : "none";
        }
    });
}

async function displayBoards() {
    const boards = await loadboards();

    boards_container.innerHTML = "";

    boards.forEach(board => {
        const new_board = document.createElement("a");
        new_board.href = `boardpage.html?boardId=${board.id}`;
        new_board.classList.add("board");
        new_board.dataset.id = board.id;

        if (board.type === "personal") {
            new_board.classList.add("board-personal");
        } else if (board.type === "group") {
            new_board.classList.add("board-group");
        }

        const board_title = document.createElement("p");
        board_title.textContent = board.name;
        board_title.style.fontWeight = "bold";
        board_title.style.color = "white";

        const delete_btn = document.createElement("button");
        delete_btn.textContent = "Delete";
        delete_btn.classList.add("delete-board-btn");

        delete_btn.addEventListener("click", async (event) => {
            event.preventDefault();

            await deleteBoard(board.id);
            await displayBoards();
        });
        new_board.append(board_title, delete_btn);
        boards_container.append(new_board);
    });

    applyBoardFilter(selectedAltYourBoards);
}

displayBoards();

add_board_btn.addEventListener("click", () => {
    // Check if already displayed
    const existing_alts = document.getElementById("add-board-alts");
    const other_alts = document.getElementById("your-boards-alts");
    if (existing_alts) {
        // Spara den radio som var checkad
        const checkedRadio = existing_alts.querySelector("input[name='board-type']:checked");

        if(checkedRadio) {
            selectedAlt = checkedRadio.value;
        }

        existing_alts.remove();
        return;
    }

    if (other_alts) {
        other_alts.remove();
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
        
        
        // Remove popup
        const checkedRadio = board_type.querySelector(
            "input[name='board-type']:checked"
        );

        if (checkedRadio) {
            selectedAlt = checkedRadio.value;
        }

        // Remove popup
        board_type.remove();
    });
    header.append(title, exit_btn);

    // Input field
    const board_name = document.createElement("input");
    board_name.type = "text";
    board_name.placeholder = "Enter board name"
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
    alt2.id = "alt2"
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
    add_btn.textContent = "Add"
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
        if(!(userInput === null || userInput === "")) {
            // lägg till ny board med namnet
            const new_board = document.createElement("a");
            if (selectedAlt === "personal") {
                new_board.classList.add("board");
                new_board.classList.add("board-personal");
            } else if (selectedAlt === "group") {
                new_board.classList.add("board");
                new_board.classList.add("board-group");
            } else {
                return;
            }
            const board_title = document.createElement("p");
            board_title.textContent = userInput;
            board_title.style.fontWeight = "bold";
            board_title.style.color = "white";

            const delete_btn = document.createElement("button");
            delete_btn.textContent = "Delete";
            delete_btn.classList.add("delete-board-btn");

            delete_btn.addEventListener("click", (event) => {
                event.preventDefault();
                new_board.remove();
            });

            await saveBoard(userInput, selectedAlt);

            if (selectedAltYourBoards !== "all" && selectedAltYourBoards !== selectedAlt) {
                selectedAltYourBoards = selectedAlt;
            }

            await displayBoards();
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

your_boards_btn.addEventListener("click", () => {
    const existing_alts = document.getElementById("your-boards-alts");

    if (existing_alts) {
        existing_alts.remove();
        return;
    }

    const other_alts = document.getElementById("add-board-alts");

    if (other_alts) {
        other_alts.remove();
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
        applyBoardFilter("all");
        board_type.remove();
    });

    const alt2 = document.createElement("button");
    alt2.id = "personal-boards";
    alt2.textContent = "Personal boards";
    alt2.addEventListener("click", () => {
        selectedAltYourBoards = "personal";
        applyBoardFilter("personal");
        board_type.remove();
    });

    const alt3 = document.createElement("button");
    alt3.id = "group-boards";
    alt3.textContent = "Group boards";
    alt3.addEventListener("click", () => {
        selectedAltYourBoards = "group";
        applyBoardFilter("group");
        board_type.remove();
    });

    board_type.append(header, alt1, alt2, alt3);
    document.getElementById("board-btns-div").append(board_type);
});

// Sound knappen
const whiteNoise = new Audio("../music/white-noise.mp3");
const brownNoise = new Audio("../music/brown-noise.mp3");
const pinkNoise = new Audio("../music/pink-noise.mp3");
whiteNoise.loop = true;
brownNoise.loop = true;
pinkNoise.loop = true;
const sound_btn = document.getElementById("sound-btn");

let selectedSound = null;
function stopAllSounds() {
    whiteNoise.pause();
    brownNoise.pause();
    pinkNoise.pause();

    whiteNoise.currentTime = 0;
    brownNoise.currentTime = 0;
    pinkNoise.currentTime = 0;
}

sound_btn.addEventListener("click", () => {
    // Check if already displayed
    const existing_alts = document.getElementById("sound-alts");
    if (existing_alts) {
        existing_alts.remove();
        return;
    }

    const sound_other1 = document.getElementById("schedule-alts"); // ?
    const sound_other2 = document.getElementById("timer-alts");

    if (sound_other1) {
        sound_other1.remove();
    }
    
    if (sound_other2) {
        sound_other2.remove();
    }
    
    const sound_type = document.createElement("div");
    sound_type.id = "sound-alts";
    
    const header = document.createElement("div");
    header.id = "sound-popup-div";
    const title = document.createElement("h3");
    title.textContent = "Sound";
    title.id = "sound-popup-title";
    const exit_btn = document.createElement("button");
    exit_btn.textContent = "X";
    exit_btn.classList.add("board-popup-close");
    exit_btn.addEventListener("click", () => {
        // Remove popup
        sound_type.remove();
    });
    header.append(title, exit_btn);
    const alt1 = document.createElement("button");
    alt1.id = "white-noise";
    alt1.textContent = "White noise";
    alt1.addEventListener("click", () => {
        selectedSound = "white";
        stopAllSounds();
        whiteNoise.play();
        sound_type.remove();
    });

    const alt2 = document.createElement("button");
    alt2.id = "brown-noise";
    alt2.textContent = "Brown noise";
    alt2.addEventListener("click", () => {
        selectedSound = "brown";
        stopAllSounds();
        brownNoise.play();
        sound_type.remove();
    });

    const alt3 = document.createElement("button");
    alt3.id = "pink-noise";
    alt3.textContent = "Pink noise";
    alt3.addEventListener("click", () => {
        selectedSound = "pink";
        stopAllSounds();
        pinkNoise.play();
        sound_type.remove();
    });

    const alt4 = document.createElement("button");
    alt4.id = "mute";
    alt4.textContent = "Mute";
    alt4.addEventListener("click", () => {
        selectedSound = "mute";
        stopAllSounds();
        sound_type.remove();
    });
    
    sound_type.append(header, alt1, alt2, alt3, alt4);
    let timer_btn = document.getElementById("timer-btn")
    document.getElementById("features-btns-div").insertBefore(sound_type, timer_btn);
    // document.body.append(sound_type);

});

// Timer
// const start = document.getElementById("start");
// const stop = document.getElementById("stop");
// const reset = document.getElementById("reset");


// const timer_btn = document.getElementById("time-btn");
// const timer_other1 = document.getElementById("schedule-alts"); // ?
// const timer_other2 = document.getElementById("sound-alts");

// let startingMinutes = null;
// let startingSeconds = null;
// let startingTime = startingMinutes * 60 + startingSeconds;
// let initalTime = startingTime;
// let currentTime = null;
// const updateTimer = () => {
//     let minutes = Math.floor(startingTime/60);
//     let seconds = startingTime % 60;
//     // startingTime--;

//     currentTime = minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
// };

// const startTimer = () => {
//     currentTime = setInterval(() => {
//         startTimer--;
//         updateTimer();

//         if(startingTime === 0) {
//             clearInterval(currentTime);
//             alert("Time's up!");
//             startingTime = initalTime;
//             updateTimer();
//         }
//     }, 
//     1000);
// };

// const stopTimer = () => clearInterval(currentTime);

// const resetTimer = () => {
//     clearInterval(currentTime);
//     startingTime = initalTime;
//     updateTimer();
// }

// timer_btn.addEventListener("click", () => {
//     const existing_alts = document.getElementById("sound-alts");
//     if (existing_alts) {
//         existing_alts.remove();
//         return;
//     }

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
//     exit_btn.classList.add("board-popup-close");
//     exit_btn.addEventListener("click", () => {
//         // Remove popup
//         timer_type.remove();
//     });
//     header.append(title, exit_btn);

//     let timer_text = document.createElement("p");
//     // timer_text.textContent = 
//     const alt1 = document.createElement("button");
//     alt1.id = "white-noise";
//     alt1.textContent = "White noise";
//     alt1.addEventListener("click", () => {
//         selectedSound = "white";
//         stopAllSounds();
//         whiteNoise.play();
//         sound_type.remove();
//     });

//     timer_type.append(header);
//     document.getElementById("features-btns-div").append(timer_btn)
// });

// start.addEventListener("click", startTimer);
// stop.addEventListener("click", stopTimer);
// reset.addEventListener("click", resetTimer);

// Timer youtube
const timer_btn = document.getElementById("timer-btn");
let timeDisplayed = null;
let startTime = null;
let interval = null;
let remainingTime = 0;
let timerIsRunning = false;
let timerIsPaused = false;
let pauseBtn = null;

function updateTimer(time) {
    let minutes = Math.floor(time/60);
    let seconds = time % 60;

    return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
};

function updatePauseButton() {
    if (!pauseBtn) return;

    if (timerIsRunning) {
        pauseBtn.textContent = "Pause";
        pauseBtn.style.backgroundColor = "red";
    } else {
        pauseBtn.textContent = "Unpause";
        pauseBtn.style.backgroundColor = "green";
    }
}

const startTimer = (time) => {
    clearInterval(interval);

    remainingTime = time;
    timerIsRunning = true;
    timerIsPaused = false;

    timeDisplayed.style.display = "block";

    const timerText = updateTimer(remainingTime);

    timeDisplayed.textContent = timerText;
    document.title = timerText + " - StudyHelper";

    updatePauseButton();

    interval = setInterval(() => {
        remainingTime--;

        timeDisplayed.textContent = updateTimer(remainingTime);
        document.title = updateTimer(remainingTime) + " - StudyHelper";

        if (remainingTime <= 0) {
            clearInterval(interval);
            timerIsRunning = false;
            timerIsPaused = false;

            timeDisplayed.textContent = updateTimer(0);
            document.title = "Time's up!";
            updatePauseButton();

            setTimeout(() => {
                alert("Time's up!");
                timeDisplayed.style.display = "none";
                document.title = "StudyHelper";
            }, 100);
        }
    }, 1000);
};

// const stopTimer = () => clearInterval(interval);

// const resetTimer = () => {
//     clearInterval(interval);
//     timeLeft = 1500;
//     updateTimer();
// }


timer_btn.addEventListener("click", () => {
    // Check if already displayed
    const existing_alts = document.getElementById("timer-alts");
    if (existing_alts) {
        existing_alts.remove();
        return;
    }

    const timer_other1 = document.getElementById("schedule-alts"); // ?
    const timer_other2 = document.getElementById("sound-alts");

    if (timer_other1) {
        timer_other1.remove();
    }
    
    if (timer_other2) {
        timer_other2.remove();
    }
    
    const timer_type = document.createElement("div");
    timer_type.id = "timer-alts";
    
    const header = document.createElement("div");
    header.id = "timer-popup-div";
    const title = document.createElement("h3");
    title.textContent = "Timer";
    title.id = "timer-popup-title";
    const exit_btn = document.createElement("button");
    exit_btn.textContent = "X";
    exit_btn.classList.add("board-popup-close");
    exit_btn.addEventListener("click", () => {
        // Remove popup
        timer_type.remove();
    });
    header.append(title, exit_btn);
    timeDisplayed = document.getElementById("timer-text");
    if(!timerIsRunning) {
        timeDisplayed.textContent = startTime === null ? updateTimer(0) : updateTimer(startTime);
    }
    const alt1 = document.createElement("button");
    alt1.id = "pomodoro";
    alt1.textContent = "Pomodoro";
    alt1.addEventListener("click", () => {
        startTime = 1500;
        startTimer(startTime);
        timer_type.remove();
});

    const alt2 = document.createElement("button");
    alt2.id = "custom";
    alt2.textContent = "Custom";
    alt2.addEventListener("click", () => {
        const custom_container = document.createElement("div");
        custom_container.id = "custom-container";

        const header_custom = document.createElement("div");
        header_custom.id = "timer-popup-div";
        const title_custom = document.createElement("h3");
        title_custom.textContent = "Custom";
        title_custom.id = "custom-popup-title";
        const exit_btn_custom = document.createElement("button");
        exit_btn_custom.textContent = "X";
        exit_btn_custom.classList.add("board-popup-close");
        exit_btn_custom.addEventListener("click", () => {
            // Remove popup
            custom_container.remove();
        });
        header_custom.append(title_custom, exit_btn_custom);

        // const time_text = document.createElement("p");
        // time_text.id = "time-text";
        // time_text.textContent = "Select time: ";

        // const time_input = document.createElement("input");
        // time_input.type = "time";
        // time_input.id = "time-input"
        
        // Minutes input
        const minutes_input = document.createElement("input");
        minutes_input.type = "number";
        minutes_input.placeholder = "MM";

        // Seconds input
        const seconds_input = document.createElement("input");
        seconds_input.type = "number";
        seconds_input.placeholder = "SS";

        const submit_btn = document.createElement("button");
        submit_btn.id = "submit-btn";
        submit_btn.classList.add("board-popup-close");
        submit_btn.textContent = "Start";
        submit_btn.addEventListener("click", () => {
            // const [minutes_input, seconds_input] = time_input.value.split(":");
            const minutes = Number(minutes_input.value);
            const seconds = Number(seconds_input.value);
            
            if(minutes_input.value === "" || seconds_input.value === "") {
                alert("Please fill in both minutes and seconds");
            } else if(minutes < 0 || seconds < 0 || seconds > 59) {
                alert("Please insert a valid time");
            } else {
                startTime = minutes * 60 + seconds;
                custom_container.remove();
                timer_type.remove()
                startTimer(startTime);
                
            }
        });
        custom_container.append(header_custom, 
            document.createTextNode("Minutes:"), minutes_input,
            document.createTextNode("Seconds:"), seconds_input, 
            submit_btn);
        timer_type.append(custom_container);
        
    });

    const timer_controls = document.createElement("div");
    timer_controls.id = "timer-controls";
    timer_controls.style.display = "flex";
    timer_controls.style.marginTop = "5px";

    const restart_btn = document.createElement("button");
    restart_btn.classList.add("board-popup-close");
    restart_btn.textContent = "Restart";
    restart_btn.style.marginRight = "2px";

    pauseBtn = document.createElement("button");
    pauseBtn.classList.add("board-popup-close")
    pauseBtn.textContent = "Pause";
    pauseBtn.style.backgroundColor = "red";
    pauseBtn.style.marginLeft = "2px";

    pauseBtn.addEventListener("click", () => {
        if (timerIsRunning) {
            clearInterval(interval);
            timerIsRunning = false;
            timerIsPaused = true;
        } else if (timerIsPaused) {
            startTimer(remainingTime);
        }

        updatePauseButton();
    });

    restart_btn.addEventListener("click", () => {
        if (startTime === null) {
            return;
        }

        clearInterval(interval);

        remainingTime = startTime;

        timerIsRunning = false;
        timerIsPaused = true;

        timeDisplayed.textContent = updateTimer(startTime);
        timeDisplayed.style.display = "block";

        updatePauseButton();
    });

    timer_controls.append(restart_btn, pauseBtn);

     
    timer_type.append(header, alt1, alt2, timer_controls);
    document.getElementById("features-btns-div").append(timer_type);
    // document.body.append(sound_type);

});



// const start = document.getElementById("start");
// const stop = document.getElementById("stop");
// const reset = document.getElementById("reset");
// const timer = document.getElementById("timer");

// let timeLeft = 1500;
// let interval = null;

// const updateTimer = () => {
//     let minutes = Math.floor(timeLeft/60);
//     let seconds = timeLeft % 60;

//     timer.textContent = minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
// };

// const startTimer = () => {
//     interval = setInterval(() => {
//         timeLeft--;
//         updateTimer();

//         if(timeLeft === 0) {
//             clearInterval(interval);
//             alert("Time's up!");
//             timeLeft = 1500;
//             updateTimer();
//         }
//     }, 
//     1000);
// };

// const stopTimer = () => clearInterval(interval);

// const resetTimer = () => {
//     clearInterval(interval);
//     timeLeft = 1500;
//     updateTimer();
// }

// start.addEventListener("click", startTimer);
// stop.addEventListener("click", stopTimer);
// reset.addEventListener("click", resetTimer);