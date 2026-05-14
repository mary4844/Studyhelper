
console.log("calendar_API.js loaded");

export async function getDeadline(date) {
    const response = await fetch(`/calendar/${date}`);
    return await response.json();
} 
