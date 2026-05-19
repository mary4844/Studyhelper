

function emitCardCreated(io, board_id, result) {
    io.to(board_id).emit("card-created", result);
}

function emitCardDeleted(io, board_id, subject_card_id) {
    io.to(board_id).emit("card-deleted", subject_card_id);
}

function emitCardEdit(io, board_id, result) {
    io.to(board_id).emit("card-edited", result);
}

function emitCardStatus(io, board_id, result) {
    io.to(board_id).emit("card-status-updated", result);
}

module.exports = {
    emitCardCreated,
    emitCardDeleted,
    emitCardEdit,
    emitCardStatus
}