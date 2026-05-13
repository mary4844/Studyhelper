

function emitCardCreated(io, board_id, result) {
    io.to(board_id).emit("card-created", result);
}

function emitCardDeleted(io, board_id, subject_card_id) {
    io.to(board_id).emit("card-deleted", subject_card_id);
}

function emitAllCardsDeleted(io, board_id) {
    io.to(board_id).emit("all-cards-deleted");
}

function emitCardEdit(io, board_id, result) {
    io.to(board_id).emit("card-edited", result);
}

module.exports = {
    emitCardCreated,
    emitCardDeleted,
    emitAllCardsDeleted,
    emitCardEdit
}