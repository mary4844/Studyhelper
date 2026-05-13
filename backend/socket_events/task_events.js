

function emitTaskCreated(io, board_id, result) {
    io.to(board_id).emit("task-created", result);
}

function emitTaskDeleted(io, board_id, task_id) {
    io.to(board_id).emit("task-deleted", task_id);
}

function emitAllTasksDeleted(io, board_id) {
    io.to(board_id).emit("all-tasks-deleted");
}

function emitTaskEdit(io, board_id, result) {
    io.to(board_id).emit("task-edited", result);
}

module.exports = {
    emitTaskCreated,
    emitTaskDeleted,
    emitAllTasksDeleted,
    emitTaskEdit
}