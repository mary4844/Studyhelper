
//datan är datan som ex fetch('/cards) hämtar från databasen

socket.on('create-card', (data) => {
    io.to(board_id).emit('create-card', data);
})

socket.on('delete-card', () => {
    io.to(board_id).emit('delete-card');
})

socket.on('delete-all-cards', () => {
    io.to(board_id).emit('delete-all-cards');
})

socket.on('edit-card', (data) => {
    io.to(board_id).emit('edit-card', data);
})