
function emitUserAdded(io, board_id, result) {
    io.to(board_id).emit("User added", result);
}

module.exports = {
    emitUserAdded
};