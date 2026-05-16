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
        await pool.query('DELETE FROM tasks');
        await pool.query('DELETE FROM subject_cards');
        await pool.query('DELETE FROM user_board');
        await pool.query('DELETE FROM board');
        await pool.query('DELETE FROM users');
    })

    afterAll(async () => {
        await pool.end(); //close connection to database when done
    })

    describe('tasks integration tests', () => {

        describe('GET /tasks', () => {

            //get tasks doesnt use statuscodes for success
            it('should return all tasks in a card in task_id order (higher id if inserted later)', async () => {
            // test setup    
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );  
                
                // insert board first
                const board = await pool.query(
                    `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                    ['Test Board']
                );

                // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert subject card with that board_id
                const card = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card']
                );

                //insert real data
                const task1 = await pool.query(
                    `INSERT INTO tasks (subject_card_id, task_name, deadline) VALUES ($1, $2, $3)`,
                    [card.rows[0].subject_card_id, 'test task 1', '2026-05-14']
                );

                const task2 = await pool.query(
                    `INSERT INTO tasks (subject_card_id, task_name, deadline) VALUES ($1, $2, $3)`,
                    [card.rows[0].subject_card_id, 'test task 2', '2026-05-15']
                )

                const res = await request(app).get(`/boards/${board.rows[0].board_id}/cards/${card.rows[0].subject_card_id}/tasks`)

                expect(res.statusCode).toBe(200);
                expect(res.body.length).toBe(2);
                expect(res.body[0].task_name).toBe('test task 1');
                expect(res.body[1].task_name).toBe('test task 2');
            });

            it('should return an empty array if there are no tasks', async () => {
            // test setup    
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );  
                
                // insert board first
                const board = await pool.query(
                    `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                    ['Test Board']
                );

                // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert subject card with that board_id
                const card = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card']
                );

                const res = await request(app).get(`/boards/${board.rows[0].board_id}/cards/${card.rows[0].subject_card_id}/tasks`);

                expect(res.statusCode).toBe(200);
                expect(res.body.length).toBe(0);
                expect(res.body).toMatchObject([]);
            })

            it('should return an error if the card_id doesnt exist', async () => {
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );  
                
                // insert board first
                const board = await pool.query(
                    `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                    ['Test Board']
                );

                // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                const res = await request(app).get(`/boards/${board.rows[0].board_id}/99999/tasks`)
                
                expect(res.statusCode).toBe(404);
            });
        })
      

        describe('POST /tasks', () => {
            
            it('should return 400 if the task has no name', async () => {
            // test setup    
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );  
                
                // insert board first
                const board = await pool.query(
                    `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                    ['Test Board']
                );

                // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert subject card with that board_id
                const card = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card']
                );

                const res = await request(app)
                    .post(`/boards/${board.rows[0].board_id}/cards/${card.rows[0].subject_card_id}/tasks`)
                    .send({});

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('error', 'Name is required');
            })

            it('should still create the task if there is no date', async () => {
            // test setup    
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );  
                
                // insert board first
                const board = await pool.query(
                    `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                    ['Test Board']
                );

                // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert subject card with that board_id
                const card = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card']
                );

                const res = await request(app)
                    .post(`/boards/${board.rows[0].board_id}/cards/${card.rows[0].subject_card_id}/tasks`)
                    .send({ task_name: "new task"});

                expect(res.statusCode).toBe(200);
                expect(res.body.task_name).toBe('new task');
                expect(res.body.deadline).toBe(null);
            })

            it('the object that is returned should contain date', async () => {
            // test setup    
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );  
                
                // insert board first
                const board = await pool.query(
                    `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                    ['Test Board']
                );

                // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert subject card with that board_id
                const card = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card']
                );

                const res = await request(app)
                    .post(`/boards/${board.rows[0].board_id}/cards/${card.rows[0].subject_card_id}/tasks`)
                    .send({ task_name: "new task", deadline: "2026-05-16"});

                expect(res.statusCode).toBe(200);
                expect(res.body.task_name).toBe('new task');
                // vi borde ändra så potgrez inte använder dom konstiga sakerna på datum
                // det kan man göra genom att ha tabellen i date istället för timestamp
                expect(res.body.deadline).toBe('2026-05-15T22:00:00.000Z');
            })

            it('should not create a task if there is no valid card_id, return status code 404', async () => {
                
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );  
                
                // insert board first
                const board = await pool.query(
                    `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                    ['Test Board']
                );

                // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                const res = await request(app)
                    .get(`/boards/${board.rows[0].board_id}/99999/tasks`)
                    .send({ task_name: "test task"})
                
                expect(res.statusCode).toBe(404);
            })

            it('should set the status to false when a task is created', async () => {
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );  
                
                // insert board first
                const board = await pool.query(
                    `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                    ['Test Board']
                );

                // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert subject card with that board_id
                const card = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card']
                );

                const res = await request(app)
                    .post(`/boards/${board.rows[0].board_id}/cards/${card.rows[0].subject_card_id}/tasks`)
                    .send({ task_name: "test task" });

                expect(res.statusCode).toBe(200);
                expect(res.body.deadline).toBe(null);
                expect(res.body.task_name).toBe('test task');
                expect(res.body.status).toBe(false);
            })
        })

        describe('DELETE /task/:task', () => {

            it('should send status 404 if the subject_card_id doesnt have the task', async () => {
            // test setup    
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );  
                
                // insert board first
                const board = await pool.query(
                    `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                    ['Test Board']
                );

                // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert subject card with that board_id
                const card1 = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 1']
                );

                const card2 = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 2']
                );

                //insert real data
                const task = await pool.query(
                    `INSERT INTO tasks (subject_card_id, task_name, deadline) VALUES ($1, $2, $3) RETURNING *`,
                    [card1.rows[0].subject_card_id, 'test task 1', '2026-05-14']
                );

                const res = await request(app)
                    .delete(`/boards/${board.rows[0].board_id}/cards/${card2.rows[0].subject_card_id}/tasks/${task.rows[0].task_id}`);

                expect(res.statusCode).toBe(404);
                expect(res.body).toHaveProperty('error', 'Koppling finns inte; FEL!')
            })

            it('should return status 204 if the delete was successful', async () => {
            // test setup    
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );  
                
                // insert board first
                const board = await pool.query(
                    `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                    ['Test Board']
                );

                // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert subject card with that board_id
                const card1 = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 1']
                );

                //insert real data
                const task = await pool.query(
                    `INSERT INTO tasks (subject_card_id, task_name, deadline) VALUES ($1, $2, $3) RETURNING *`,
                    [card1.rows[0].subject_card_id, 'test task 1', '2026-05-14']
                );

                const res = await request(app)
                    .delete(`/boards/${board.rows[0].board_id}/cards/${card1.rows[0].subject_card_id}/tasks/${task.rows[0].task_id}`);

                expect(res.statusCode).toBe(204);

                const deleted = await pool.query(
                    `SELECT * FROM tasks WHERE subject_card_id = $1`,
                    [card1.rows[0].subject_card_id]
                )

                expect(deleted.rows.length).toBe(0);
            })
        })

        describe('PATCH /task', () => {

            it('shoud return 400 error if new input has no name', async () => {
            // test setup    
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );  
                
                // insert board first
                const board = await pool.query(
                    `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                    ['Test Board']
                );

                // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert subject card with that board_id
                const card1 = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 1']
                );

                //insert real data
                const task = await pool.query(
                    `INSERT INTO tasks (subject_card_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [card1.rows[0].subject_card_id, 'test task 1']
                );

                const res = await request(app)
                    .patch(`/boards/${board.rows[0].board_id}/cards/${card1.rows[0].subject_card_id}/tasks/${task.rows[0].task_id}`)
                    .send({});

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('error', 'New name is required');
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
                const card = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 1']
                );

                const res = await request(app)
                                .patch(`/boards/${board.rows[0].board_id}/cards/${card.rows[0].subject_card_id}/tasks/99999`)
                                .send({ task_name: 'cant change name if card doesnt exist'});

                expect(res.statusCode).toBe(404);
                expect(res.body).toHaveProperty('error', 'Task not found')
            })

            it('should return 200 if the PATCH works and the changed card', async () => {
            //test setup
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );  
                
                // insert board first
                const board = await pool.query(
                    `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                    ['Test Board']
                );

                // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert subject card with that board_id
                const card = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 1']
                );

                //insert real data
                const task = await pool.query(
                    `INSERT INTO tasks (subject_card_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [card.rows[0].subject_card_id, 'test task 1']
                );

                const res = await request(app)
                    .patch(`/boards/${board.rows[0].board_id}/cards/${card.rows[0].subject_card_id}/tasks/${task.rows[0].task_id}`)
                    .send({ task_name: 'new card name' });
                
                expect(res.statusCode).toBe(200);
                expect(res.body).toMatchObject({ 
                    task_id : task.rows[0].task_id, 
                    task_name : 'new card name'
                });
            })
        })  

        describe('PATCH /task/status', () => {

            it('should set status to true if it is false', async () => {
                 //test setup
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );  
                
                // insert board first
                const board = await pool.query(
                    `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                    ['Test Board']
                );

                // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert subject card with that board_id
                const card = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 1']
                );

                //insert real data
                const task = await pool.query(
                    `INSERT INTO tasks (subject_card_id, task_name, status) VALUES ($1, $2, $3) RETURNING *`,
                    [card.rows[0].subject_card_id, 'test task 1', false]
                );

                const res = await request(app)
                    .patch(`/boards/${board.rows[0].board_id}/cards/${card.rows[0].subject_card_id}/tasks/${task.rows[0].task_id}/status`);

                expect(res.statusCode).toBe(200);
                expect(res.body.task_name).toBe('test task 1');
                expect(res.body.status).toBe(true);
            })

            it('should set status to false if it is true', async () => {
             //test setup
                //insert user
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );  
                
                // insert board first
                const board = await pool.query(
                    `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                    ['Test Board']
                );

                // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert subject card with that board_id
                const card = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 1']
                );

                //insert real data
                const task = await pool.query(
                    `INSERT INTO tasks (subject_card_id, task_name, status) VALUES ($1, $2, $3) RETURNING *`,
                    [card.rows[0].subject_card_id, 'test task 1', true]
                );

                const res = await request(app)
                    .patch(`/boards/${board.rows[0].board_id}/cards/${card.rows[0].subject_card_id}/tasks/${task.rows[0].task_id}/status`);

                expect(res.statusCode).toBe(200);
                expect(res.body.task_name).toBe('test task 1');
                expect(res.body.status).toBe(false);
            })

            it('should return 400 if there is no task found', async () => {
                const user = await pool.query(
                    `INSERT INTO users (user_mail) VALUES ($1) RETURNING *`,
                    ['test@test.com'] // matches the mocked email
                );  
                
                // insert board first
                const board = await pool.query(
                    `INSERT INTO board (board_name) VALUES ($1) RETURNING *`,
                    ['Test Board']
                );

                // link user to board
                await pool.query(
                    `INSERT INTO user_board (user_id, board_id) VALUES ($1, $2)`,
                    [user.rows[0].user_id, board.rows[0].board_id]
                );

                // insert subject card with that board_id
                const card = await pool.query(
                    `INSERT INTO subject_cards (board_id, subject_card_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card 1']
                );

                //insert task
                const task = await pool.query(
                    `INSERT INTO tasks (subject_card_id, task_name, status) VALUES ($1, $2, $3) RETURNING *`,
                    [card.rows[0].subject_card_id, 'test task 1', true]
                );

                const res = await request(app)
                    .patch(`/boards/${board.rows[0].board_id}/cards/${card.rows[0].subject_card_id}/tasks/999/status`); //task_id that doesnt exist

                expect(res.statusCode).toBe(404);
                expect(res.body).toHaveProperty('error', 'Task not found');
            })
        })
    })
})
