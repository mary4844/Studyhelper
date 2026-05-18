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

describe('tasks integration tests', () => {
    
    beforeEach(async () => {
        //clean database before each test
        await pool.query('DELETE FROM subtask');
        await pool.query('DELETE FROM task');
        await pool.query('DELETE FROM user_board');
        await pool.query('DELETE FROM board');
        await pool.query('DELETE FROM users');         
    })

    afterAll(async () => {
        await pool.end(); //close connection to database when done
    })

        describe('POST /tasks', () => {
            
            it('should send an error 400 status code if the task has no name', async () => {
            
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
                                .post(`/boards/${new_board.rows[0].board_id}/tasks`)
                                .send({});

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('error', 'Name is required');
            })

            
            it('should return 500 if board does not exist', async () => {
                const res = await request(app)
                    .post('/boards/99999/tasks') //Random board that doesnt exist
                    .send({ task_name: 'new task' });

                expect(res.statusCode).toBe(500); // FK constraint violation
            });

            it('should return status code 201 and the task that was created', async () => {
            
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
                                .post(`/boards/${new_board.rows[0].board_id}/tasks`)
                                .send({ task_name: 'new task' });

                expect(res.statusCode).toBe(201);
                expect(res.body).toMatchObject({ task_name: 'new task'})

            })
        })

        describe('GET /tasks', () => {

            it('should return status code 200 and empty array if there are no tasks', async () => {
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
                
                const res = await request(app).get(`/boards/${board.rows[0].board_id}/tasks`);

                expect(res.statusCode).toBe(200);
                expect(res.body).toMatchObject([]);
            })

            it('should return status code 200 and all tasks on the board', async () => {
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
                const task1 = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 1']
                );

                const task2 = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 2']
                );

                const res = await request(app).get(`/boards/${board.rows[0].board_id}/tasks`);

                expect(res.statusCode).toBe(200);
                expect(res.body.length).toBe(2);
                expect(res.body[0]).toMatchObject({ 
                    board_id: board.rows[0].board_id,
                    task_name: 'Test task 1'
                });
                expect(res.body[1]).toMatchObject({ 
                    board_id: board.rows[0].board_id,
                    task_name: 'Test task 2'    
                });
            })
        })

        describe('DELETE /tasks/:task_id', () => {

            it('should return 404 if the task is not connected to the board', async () => {

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
                const task = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board1.rows[0].board_id, 'Test task']
                );

                // try deleting through BOARD 2
                const res = await request(app)
                    .delete(`/boards/${board2.rows[0].board_id}/tasks/${task.rows[0].task_id}`);

                expect(res.statusCode).toBe(404);
                expect(res.body).toHaveProperty(
                    'error',
                    'task is not connected to this board'
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
                const task1 = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 1']
                );

                const task2 = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 2']
                );

                const res = await request(app)
                            .delete(`/boards/${board.rows[0].board_id}/tasks/${task1.rows[0].task_id}`);

                expect(res.statusCode).toBe(204);

                const deleted = await pool.query(
                    `SELECT * FROM task WHERE task_id = $1`,
                    [task1.rows[0].task_id]
                )

                expect(deleted.rows.length).toBe(0);
            });
        })

        describe('PATCH /tasks/:task_id', () => {

            it('should return 400 if tasl has no new name (as in no name)', async () => {
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
                const task1 = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 1']
                );

                const res = await request(app)
                                .patch(`/boards/${board.rows[0].board_id}/tasks/${task1.rows[0].task_id}`)
                                .send({})

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('error', 'Behöver ett nytt namn');

            })

            it('should return 404 if there is no task with the id that should be changed', async () => {
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
                const task = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 1']
                );

                const res = await request(app)
                                .patch(`/boards/${board.rows[0].board_id}/tasks/999999`)
                                .send({ task_name: 'cant change name if card doesnt exist'});

                expect(res.statusCode).toBe(404);
                expect(res.body).toHaveProperty('error', 'task saknas')
            })

            it('should return 200 if the PATCH works and the changed task', async () => {
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
                const task1 = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 1']
                );

                const task2 = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 2']
                );

                const res = await request(app)
                                .patch(`/boards/${board.rows[0].board_id}/tasks/${task1.rows[0].task_id}`)
                                .send({ task_name: 'new task name'});

                expect(res.statusCode).toBe(200);
                expect(res.body).toMatchObject({ 
                    task_id: task1.rows[0].task_id, 
                    task_name: 'new task name'
            });
        })
    })
})