
function emitUserAdded(io, board_id, result) {
    io.to(`user_${user_id}`).emit('board-shared', result.rows[0]);
}

    // then in frontend 

    // socket.on('boardShared', (newBoard) => {
    // // add the new board to the UI
    // });

module.exports = {
    emitUserAdded
};