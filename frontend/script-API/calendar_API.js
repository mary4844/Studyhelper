
console.log("calendar_API.js loaded");

export async function getDeadlineTask(date) {
    const response = await fetch(`http://localhost:3000/calendar/${date}`);

    if (!response.ok) {
        console.error("API error:", response.status);
        return [];
    }

    return await response.json();
} 
