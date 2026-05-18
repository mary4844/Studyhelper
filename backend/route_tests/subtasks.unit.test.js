
// mock auth0
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

// mock db
jest.mock('../pool', () => ({
    pool: { query: jest.fn() }
}));

const { pool } = require('../pool');

// mock socket.io
app.set('io', {
    to: () => ({ emit: jest.fn() })
});

// base url since tasks are nested
const BASE = '/boards/1/tasks/1/subtasks'

describe('task routes', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('/GET /boards/:board_id/tasks/:task_id/subtasks', () => {

      it('should return all subtasks for authenticated users', async () => {
        pool.query
          .mockResolvedValueOnce({
                rows: [
                    { subtask_id: 1, subtask_name: 'subTask 1', task_id: 1 },
                    { subtask_id: 2, subtask_name: 'subTask 2', task_id: 1 }
                ]
          });

        const res = await request(app).get(BASE);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
      })

      it('should return empty array if no subtask is found', async () => {
        pool.query
          .mockResolvedValueOnce({ rows: [] });

        const res = await request(app).get(BASE);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
      })

       it('should return 500 if db crashes', async () => {
            pool.query.mockRejectedValueOnce(new Error('DB crashed'));

            const res = await request(app).get(BASE);

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error');
        });
    })

    describe('/POST /boards/:board_id/tasks/:task_id/subtasks', () => {
      
      it('should create a subtask and return statusboard 200', async () => {
        pool.query
          .mockResolvedValueOnce({
                rows: [{ subtask_id: 1, subtask_name: 'New subTask', task_id: 1 }]
          });

        const res = await request(app).post(BASE).send({ subtask_name: 'New subTask' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('subtask_name', 'New subTask');
      })

      it('should return statuscode 400', async () => {
         const res = await request(app).post(BASE).send({});

          expect(res.statusCode).toBe(400);
          expect(res.body).toHaveProperty('error', 'Name is required');;
      })
    })

    describe('/DELETE /boards/:board_id/tasks/:task_id/subtasks/:id', () => {

      //does it return the deleted task?
      it('should delete task', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{ subtask_id: 1, subtask_name: 'Deleted subTask' }]
            });

            const res = await request(app).delete(`${BASE}/1`);

            expect(res.statusCode).toBe(204);
            
        });

        it('should return 500 if db crashes', async () => {
            pool.query.mockRejectedValueOnce(new Error('DB crashed'));

            const res = await request(app).delete(`${BASE}/1`);

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error');
        });
    })

    describe('/PATCH /boards/:board_id/tasks/:task_id/subtasks/:id', () => {
      
      it('should update task name and return 200', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{ subtask_id: 1, subtask_name: 'Updated subTask' }],
                rowCount: 1
            });

            const res = await request(app)
                .patch(`${BASE}/1`)
                .send({ subtask_name: 'Updated subTask' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('subtask_name', 'Updated subTask');
        });

        it('should return 400 if task_name is missing', async () => {
            const res = await request(app)
                .patch(`${BASE}/1`)
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'New name is required');
        });

        it('should return 404 if task not found', async () => {
            pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

            const res = await request(app)
                .patch(`${BASE}/1`)
                .send({ subtask_name: 'Updated subtask' });

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'subtask not found');
        });

        it('should return 500 if db crashes', async () => {
            pool.query.mockRejectedValueOnce(new Error('DB crashed'));

            const res = await request(app)
                .patch(`${BASE}/1`)
                .send({ subtask_name: 'Updated subtask' });

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error');
        });
    });

    describe('PATCH /subtask/status', () => {
         
        it('should toggle status from false to true', async () => {
            pool.query
                .mockResolvedValueOnce({ rows: [{ status: false }] })  // SELECT status
                .mockResolvedValueOnce({ rowCount: 1, 
                    rows: [{ subtask_id: 1, subtask_name: 'test subtask', status: true, task_id: 1 }] }); // UPDATE

            const res = await request(app).patch(`${BASE}/1/status`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.subtask_name).toBe('test subtask');
        });

        it('should toggle status from true to false', async () => {
            pool.query
                .mockResolvedValueOnce({ rows: [{ status: true }] })   // SELECT status
                .mockResolvedValueOnce({ rowCount: 1,
                    rows: [{ subtask_id: 1, subtask_name: 'test subtask', status: false, task_id: 1 }] }); // UPDATE

            const res = await request(app).patch(`${BASE}/1/status`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe(false);
            expect(res.body.subtask_name).toBe('test subtask');
        });

        it('should return 404 if task_id does not exist', async () => {
            pool.query
                .mockResolvedValueOnce({ rows: [] })         // SELECT returns nothing
                .mockResolvedValueOnce({ rowCount: 0, rows: [] }); // UPDATE finds nothing

            const res = await request(app).patch(`${BASE}/99999/status`);

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'subtask not found');
        });

        it('should return the full task object, not just the status', async () => {
            pool.query
                .mockResolvedValueOnce({ rows: [{ status: false }] })
                .mockResolvedValueOnce({ rowCount: 1, 
                    rows: [{ subtask_id: 1, subtask_name: 'test subtask', status: true, task_id: 1 }] });

            const res = await request(app).patch(`${BASE}/1/status`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('subtask_id');
            expect(res.body).toHaveProperty('subtask_name');
            expect(res.body).toHaveProperty('status');
            expect(res.body).toHaveProperty('task_id');
        });

        it('should return 500 if the database throws', async () => {
            pool.query.mockRejectedValueOnce(new Error('db error'));

            const res = await request(app).patch(`${BASE}/1/status`);

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error', 'Server error');
        });
    })
}) 