

function emitTaskCreated(io, board_id, result) {
    io.to(board_id).emit("task-created", result);
}

function emitTaskDeleted(io, board_id, task_id) {
    io.to(board_id).emit("task-deleted", task_id);
}

function emitTaskEdit(io, board_id, result) {
    io.to(board_id).emit("task-edited", result);
}

function emitTaskStatus(io, board_id, result) {
    io.to(board_id).emit("task-status-updated", result);
}

module.exports = {
    emitTaskCreated,
    emitTaskDeleted,
    emitTaskEdit,
    emitTaskStatus
}