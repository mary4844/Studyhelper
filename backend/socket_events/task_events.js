
//data är datan som post(/tasks) får från databasen 

socket.on('task-created', (data) => {
    io.to(board_id).emit('task-created', data);
})

socket.on('task-deleted', (data) => {
    io.to(board_id).emit('task-deleted');
})

socket.on('all-tasks-deleted', () => {
    io.to(board_id).emit('all-tasks-deleted');
})

socket.on('task-edited', (data) => {
    io.to(board_id).emit("task-edited", data);
})