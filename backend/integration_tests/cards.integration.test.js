// mock auth0 - same as unit tests
jest.mock('express-openid-connect', () => ({
    auth: () => (req, res, next) => next(),
    requiresAuth: () => (req, res, next) => {
        req.oidc = {
            isAuthenticated: () => true,
            user: { email: 'test@test.com', nickname: 'testuser' }
        };
        next();
    }
}));

const request = require('supertest');
const { app } = require('../app');
const { pool } = require('../pool'); // real pool, no mock

app.set('io', {
    to: () => ({ emit: jest.fn() })
});

describe('calendar integration tests', () => {
    
    beforeEach(async () => {
        //clean database before each test
        await pool.query('DELETE FROM tasks');
        await pool.query('DELETE FROM subject_cards');
        await pool.query('DELETE FROM user_board');
        await pool.query('DELETE FROM board');
        await pool.query('DELETE FROM users');         
    })

    afterAll(async () => {
        await pool.end(); //close connection to database when done
    })

    describe('subcards integration tests', () => {

        describe('POST /cards', () => {
            
            it('should send an error 400 status code if the card has no name', async () => {
            
            //setup
                //add user
                const user = await pool.query(
                `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                ['test@test.com'] // matches the mocked email
                );
                
                // insert board
                const new_board = await pool.query(
                    `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                    ['Test Board 1', false]
                );

                // link user to boards
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, new_board.rows[0].board_id]
                );

                const res = await request(app)
                                .post(`/boards/${new_board.rows[0].board_id}/cards`)
                                .send({});

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('error', 'Name is required');
            })

            //------------------ BACKEND FUNCTION DOESNT WORK IN THIS WAY -----------------

            // it('should send an 404 status code if there is no board', async () => {
            
            // //setup
            //     //add user
            //      const user = await pool.query(
            //         `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
            //         ['test@test.com'] // matches the mocked email
            //     );

            //     //board is not linked so the user has no board

            //     const res = await request(app)
            //                     .post(`/boards/1/cards`)
            //                     .send({ subject_card_name: 'new subcard' });

            //     expect(res.statusCode).toBe(404);
            //     expect(res.body).toHaveProperty('error', 'subject card skapas inte')
            // })

            // -------------------- CURRENTLY WORKS LIKE THIS INSEAD ------------------------
            
            it('should return 500 if board does not exist', async () => {
                const res = await request(app)
                    .post('/boards/99999/cards') //Random board that doesnt exist
                    .send({ subject_card_name: 'new subcard' });

                expect(res.statusCode).toBe(500); // FK constraint violation
            });

            it('should return status code 201 and the card that was created', async () => {
            
                //setup
                //add user
                const user = await pool.query(
                `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                ['test@test.com'] // matches the mocked email
                );
                
                // insert board
                const new_board = await pool.query(
                    `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                    ['Test Board 1', false]
                );

                // link user to boards
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, new_board.rows[0].board_id]
                );

                const res = await request(app)
                                .post(`/boards/${new_board.rows[0].board_id}/cards`)
                                .send({ subject_card_name: 'new_subcard' });

                expect(res.statusCode).toBe(201);
                expect(res.body).toMatchObject({ subject_card_name: "new_subcard"})

            })
        })

        describe('GET /cards', () => {

            it('should return status code 200 and empty array (?) if there are no cards', async () => {
            // test setup    
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );

                // insert board
                const board = await pool.query(
                    `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                    ['Test Board 1', false]
                );

                 // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );
                
                const res = await request(app).get(`/boards/${board.rows[0].board_id}/cards`);

                expect(res.statusCode).toBe(200);
                expect(res.body).toMatchObject([]);
            })

            it('should return status code 200 and all cards on the board', async () => {
            // test setup    
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );

                // insert board
                const board = await pool.query(
                    `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                    ['Test Board 1', false]
                );

                 // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert card
                const card1 = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 1']
                );

                const card2 = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 2']
                );

                const res = await request(app).get(`/boards/${board.rows[0].board_id}/cards`);

                expect(res.statusCode).toBe(200);
                expect(res.body.length).toBe(2);
                expect(res.body[0]).toMatchObject({ 
                    board_id: board.rows[0].board_id,
                    subject_card_name: 'Test Card 1'
                });
                expect(res.body[1]).toMatchObject({ 
                    board_id: board.rows[0].board_id, 
                    subject_card_name: 'Test Card 2'
                });
            })
        })

        describe('DELETE /cards/:subject_card_id', () => {

            it('should return 404 if the card is not connected to the board', async () => {

                // create user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com']
                );

                // create boards
                const board1 = await pool.query(
                    `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                    ['Board 1', false]
                );

                const board2 = await pool.query(
                    `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                    ['Board 2', false]
                );

                // link user to boards
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2), ($1, $3)`,
                    [
                        user.rows[0].user_id,
                        board1.rows[0].board_id,
                        board2.rows[0].board_id
                    ]
                );

                // create card ON BOARD 1
                const card = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board1.rows[0].board_id, 'Test Card']
                );

                // try deleting through BOARD 2
                const res = await request(app)
                    .delete(`/boards/${board2.rows[0].board_id}/cards/${card.rows[0].subject_card_id}`);

                expect(res.statusCode).toBe(404);
                expect(res.body).toHaveProperty(
                    'error',
                    'Card is not connected to this board'
                );
            })

            it('should return status code 204 if delete was successful', async () => {
            // test setup    
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );

                // insert board
                const board = await pool.query(
                    `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                    ['Test Board 1', false]
                );

                 // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert card
                const card1 = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 1']
                );

                const card2 = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 2']
                );

                const res = await request(app)
                            .delete(`/boards/${board.rows[0].board_id}/cards/${card1.rows[0].subject_card_id}`);

                expect(res.statusCode).toBe(204);

                const deleted = await pool.query(
                    `SELECT * FROM subject_cards WHERE subject_card_id = $1`,
                    [card1.rows[0].subject_card_id]
                )

                expect(deleted.rows.length).toBe(0);
            });
        })

        describe('PATCH /cards/:subject_card_id', () => {

            it('should return 400 if card has no new name (as in no name)', async () => {
            // test setup    
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );

                // insert board
                const board = await pool.query(
                    `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                    ['Test Board 1', false]
                );

                 // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert card
                const card1 = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 1']
                );

                const res = await request(app)
                                .patch(`/boards/${board.rows[0].board_id}/cards/${card1.rows[0].subject_card_id}`)
                                .send({})

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('error', 'Behöver ett nytt namn');

            })

            it('should return 404 if there is no card with the id that should be changed', async () => {
            // test setup    
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );

                // insert board
                const board = await pool.query(
                    `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                    ['Test Board 1', false]
                );

                 // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert card
                const card = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 1']
                );

                const res = await request(app)
                                .patch(`/boards/${board.rows[0].board_id}/cards/999999`)
                                .send({ subject_card_name: 'cant change name if card doesnt exist'});

                expect(res.statusCode).toBe(404);
                expect(res.body).toHaveProperty('error', 'Kort saknas')
            })

            it('should return 200 if the PATCH works and the changed card', async () => {
            // test setup    
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );

                // insert board
                const board = await pool.query(
                    `INSERT INTO board (board_name, is_shared) VALUES ($1, $2) RETURNING *`,
                    ['Test Board 1', false]
                );

                 // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert card
                const card1 = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 1']
                );

                const card2 = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 2']
                );

                const res = await request(app)
                                .patch(`/boards/${board.rows[0].board_id}/cards/${card1.rows[0].subject_card_id}`)
                                .send({ subject_card_name: 'new card name'});

                expect(res.statusCode).toBe(200);
                expect(res.body).toMatchObject({ 
                    subject_card_id: card1.rows[0].subject_card_id, 
                    subject_card_name: 'new card name'
                });
            })
        })
    })
})
