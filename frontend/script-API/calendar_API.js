
console.log("calendar_API.js loaded");

export async function getDeadline(task_id) {
    const response = await fetch(`/calendar/${task_id}`);
    return await response.json();
} 
