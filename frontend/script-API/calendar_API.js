
console.log("calendar_API.js loaded");

export async function getDeadlineTask(date) {
    const response = await fetch(`/calendar/${date}`);
    return await response.json();
} 
