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

describe('subtask integration tests', () => {
    
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

    describe('subtask integration tests', () => {

        describe('GET /subtask', () => {

            //get subtasks doesnt use statuscodes for success
            it('should return all subtasks in a task in subtask_id order (higher id if inserted later)', async () => {
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

                // insert task with that board_id
                const task = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task']
                );

                //insert real data
                const subtask1 = await pool.query(
                    `INSERT INTO subtask (task_id, subtask_name, deadline) VALUES ($1, $2, $3)`,
                    [task.rows[0].task_id, 'test subtask 1', '2026-05-14']
                );

                const subtask2 = await pool.query(
                    `INSERT INTO subtask (task_id, subtask_name, deadline) VALUES ($1, $2, $3)`,
                    [task.rows[0].task_id, 'test subtask 2', '2026-05-15']
                )

                const res = await request(app).get(`/boards/${board.rows[0].board_id}/tasks/${task.rows[0].task_id}/subtasks`)

                expect(res.statusCode).toBe(200);
                expect(res.body.length).toBe(2);
                expect(res.body[0].subtask_name).toBe('test subtask 1');
                expect(res.body[1].subtask_name).toBe('test subtask 2');
            });

            it('should return an empty array if there are no subtasks', async () => {
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

                // insert task with that board_id
                const task = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task']
                );

                const res = await request(app).get(`/boards/${board.rows[0].board_id}/tasks/${task.rows[0].task_id}/subtasks`);

                expect(res.statusCode).toBe(200);
                expect(res.body.length).toBe(0);
                expect(res.body).toMatchObject([]);
            })

            it('should return an error if the task_id doesn`t exist', async () => {
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

                const res = await request(app).get(`/boards/${board.rows[0].board_id}/tasks/99999/subtasks`)
                
                expect(res.statusCode).toBe(404);
            });
        })
      
//////////////////////////////////////////////
        describe('POST /tasks', () => {
            
            it('should return 400 if the subtask has no name', async () => {
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

                // insert task with that board_id
                const task = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task']
                );

                const res = await request(app)
                    .post(`/boards/${board.rows[0].board_id}/tasks/${task.rows[0].task_id}/subtasks`)
                    .send({});

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('error', 'Name is required');
            })

            it('should still create the subtask if there is no date', async () => {
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

                // insert task with that board_id
                const task = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task']
                );

                const res = await request(app)
                    .post(`/boards/${board.rows[0].board_id}/tasks/${task.rows[0].task_id}/subtasks`)
                    .send({ subtask_name: "new subtask"});

                expect(res.statusCode).toBe(200);
                expect(res.body.subtask_name).toBe('new subtask');
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

                // insert task with that board_id
                const task = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task']
                );

                const res = await request(app)
                    .post(`/boards/${board.rows[0].board_id}/tasks/${task.rows[0].task_id}/subtasks`)
                    .send({ subtask_name: "new subtask", deadline: "2026-05-16"});

                expect(res.statusCode).toBe(200);
                expect(res.body.subtask_name).toBe('new subtask');
                // vi borde ändra så potgrez inte använder dom konstiga sakerna på datum
                // det kan man göra genom att ha tabellen i date istället för timestamp
                expect(res.body.deadline).toBe('2026-05-15T22:00:00.000Z');
            })

            it('should not create a subtask if there is no valid task_id, return status code 404', async () => {
                
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
                    .post(`/boards/${board.rows[0].board_id}/tasks/99999/subtasks`)
                    .send({ subtask_name: "test subtask"})
                
                expect(res.statusCode).toBe(404);
            })

            it('should set the status to false when a subtask is created', async () => {
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

                // insert task with that board_id
                const task = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test Card']
                );

                const res = await request(app)
                    .post(`/boards/${board.rows[0].board_id}/tasks/${task.rows[0].task_id}/subtasks`)
                    .send({ subtask_name: "test subtask" });

                expect(res.statusCode).toBe(200);
                expect(res.body.deadline).toBe(null);
                expect(res.body.subtask_name).toBe('test subtask');
                expect(res.body.status).toBe(false);
            })
        })

        describe('DELETE /task/:task', () => {

            it('should send status 404 if the task_id doesn`t have the task', async () => {
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

                // insert task with that board_id
                const task1 = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 1']
                );

                const task2 = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 2']
                );

                //insert real data
                const subtask = await pool.query(
                    `INSERT INTO subtask (task_id, subtask_name, deadline) VALUES ($1, $2, $3) RETURNING *`,
                    [task1.rows[0].task_id, 'test subtask 1', '2026-05-14']
                );

                const res = await request(app)
                    .delete(`/boards/${board.rows[0].board_id}/tasks/${task2.rows[0].task_id}/subtasks/${subtask.rows[0].subtask_id}`);

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

                // insert task with that board_id
                const task1 = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 1']
                );

                //insert real data
                const subtask = await pool.query(
                    `INSERT INTO subtask (task_id, subtask_name, deadline) VALUES ($1, $2, $3) RETURNING *`,
                    [task1.rows[0].task_id, 'test subtask 1', '2026-05-14']
                );

                const res = await request(app)
                    .delete(`/boards/${board.rows[0].board_id}/tasks/${task1.rows[0].task_id}/subtasks/${subtask.rows[0].subtask_id}`);

                expect(res.statusCode).toBe(204);

                const deleted = await pool.query(
                    `SELECT * FROM subtask WHERE task_id = $1`,
                    [task1.rows[0].task_id]
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

                // insert task with that board_id
                const task1 = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 1']
                );

                //insert real data
                const subtask = await pool.query(
                    `INSERT INTO subtask (task_id, subtask_name) VALUES ($1, $2) RETURNING *`,
                    [task1.rows[0].task_id, 'test subtask 1']
                );

                const res = await request(app)
                    .patch(`/boards/${board.rows[0].board_id}/tasks/${task1.rows[0].task_id}/subtasks/${subtask.rows[0].subtask_id}`)
                    .send({});

                expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('error', 'New name is required');
            })

            it('should return 404 if there is no subtask with the id that should be changed', async () => {
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

                // insert task
                const task = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 1']
                );

                const res = await request(app)
                                .patch(`/boards/${board.rows[0].board_id}/tasks/${task.rows[0].task_id}/subtasks/99999`)
                                .send({ subtask_name: 'cant change name if task doesn`t exist'});

                expect(res.statusCode).toBe(404);
                expect(res.body).toHaveProperty('error', 'subtask not found')
            })

            it('should return 200 if the PATCH works and the changed task', async () => {
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

                // insert task with that board_id
                const task = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 1']
                );

                //insert real data
                const subtask = await pool.query(
                    `INSERT INTO subtask (task_id, subtask_name) VALUES ($1, $2) RETURNING *`,
                    [task.rows[0].task_id, 'test subtask 1']
                );

                const res = await request(app)
                    .patch(`/boards/${board.rows[0].board_id}/tasks/${task.rows[0].task_id}/subtasks/${subtask.rows[0].subtask_id}`)
                    .send({ subtask_name: 'new task name' });
                
                expect(res.statusCode).toBe(200);
                expect(res.body).toMatchObject({ 
                    subtask_id : subtask.rows[0].subtask_id, 
                    subtask_name : 'new task name'
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

                // insert task with that board_id
                const task = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 1']
                );

                //insert real data
                const subtask = await pool.query(
                    `INSERT INTO subtask (task_id, subtask_name, status) VALUES ($1, $2, $3) RETURNING *`,
                    [task.rows[0].task_id, 'test subtask 1', false]
                );

                const res = await request(app)
                    .patch(`/boards/${board.rows[0].board_id}/tasks/${task.rows[0].task_id}/subtasks/${subtask.rows[0].subtask_id}/status`);

                expect(res.statusCode).toBe(200);
                expect(res.body.subtask_name).toBe('test subtask 1');
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

                // insert task with that board_id
                const task = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 1']
                );

                //insert real data
                const subtask = await pool.query(
                    `INSERT INTO subtask (task_id, subtask_name, status) VALUES ($1, $2, $3) RETURNING *`,
                    [task.rows[0].task_id, 'test subtask 1', true]
                );

                const res = await request(app)
                    .patch(`/boards/${board.rows[0].board_id}/tasks/${task.rows[0].task_id}/subtasks/${subtask.rows[0].subtask_id}/status`);

                expect(res.statusCode).toBe(200);
                expect(res.body.subtask_name).toBe('test subtask 1');
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

                // insert task with that board_id
                const task = await pool.query(
                    `INSERT INTO task (board_id, task_name) VALUES ($1, $2) RETURNING *`,
                    [board.rows[0].board_id, 'Test task 1']
                );

                //insert subtask
                const subtask = await pool.query(
                    `INSERT INTO subtask (task_id, subtask_name, status) VALUES ($1, $2, $3) RETURNING *`,
                    [task.rows[0].task_id, 'test subtask 1', true]
                );

                const res = await request(app)
                    .patch(`/boards/${board.rows[0].board_id}/tasks/${task.rows[0].task_id}/subtasks/999/status`); //subtask_id that doesn`t exist

                expect(res.statusCode).toBe(404);
                expect(res.body).toHaveProperty('error', 'subtask not found');
            })
        })
    })
})
