document.addEventListener("DOMContentLoaded", loadTasks);
        
        const list = document.getElementById("TaskList");

        function loadTasks() {
            fetch("/tasks")
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

        const nameInput = document.getElementById('name'); // fetching entered task name

        function addTask() {
            const name = nameInput.value;

            fetch("/tasks/add", { // calls backend server, writing task name to the server
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name })
            })
            
            .then(res => res.json()) // turning the response from the backend to JSON style
            .then(() => {
                nameInput.value = ""; // emptying a buffer which otherwise still would hold the old name when adding a new task
                loadTasks(); // meant to update the page to show the newly added task in the list
            });
        }

        function clearList() { // calls backend to empty the list
            console.log("entered clear list");
            fetch("/tasks/clear", {
                method: "POST"
            })
            .then(res => res.json())
            .then(() => { 
                loadTasks(); 
            }) // updates the list to show nothing
        }