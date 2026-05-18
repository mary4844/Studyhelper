

function emitSubTaskCreated(io, board_id, result) {
    io.to(board_id).emit("subtask-created", result);
}

function emitSubTaskDeleted(io, board_id, subtask_id) {
    io.to(board_id).emit("subtask-deleted", subtask_id);
}

function emitSubTaskEdit(io, board_id, result) {
    io.to(board_id).emit("subtask-edited", result);
}

function emitSubTaskStatus(io, board_id, result) {
    io.to(board_id).emit("subtask-status-updated", result);
}

module.exports = {
    emitSubTaskCreated,
    emitSubTaskDeleted,
    emitSubTaskEdit,
    emitSubTaskStatus
}