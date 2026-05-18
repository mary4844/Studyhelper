
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
const BASE = '/boards/1/tasks'

describe('subcards routes', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('/GET /boards/:board_id/task', () => {

      it('should return all cards for authenticated users for a specific board', async () => {
        pool.query
          .mockResolvedValueOnce({
            rows: [
                { task_id: 1, task_name: 'task 1' },
                { task_id: 2, task_name: 'task 2' }]
          });

        const res = await request(app).get(BASE);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
      })

      it('should return empty array if no task is found', async () => {
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
            expect(res.body).toHaveProperty('error', 'Failed to fetch tasks');
        });
    })

    describe('/POST /boards/:board_id/tasks', () => {
      
      it('should create a task and return statuscode 201', async () => {
        pool.query
          .mockResolvedValueOnce({
               rows: [
                { task_id: 1, task_name: 'New task' }
           ]});

        const res = await request(app).post(BASE).send({ task_name: 'New task' });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('task_name', 'New task');
      })

      it('should return statuscode 400', async () => {
         const res = await request(app).post(BASE).send({});

          expect(res.statusCode).toBe(400);
          expect(res.body).toHaveProperty('error', 'Name is required');;
      })
    })

    describe('/DELETE /boards/:board_id/task/:task_id', () => {

      //does it return the deleted task?
      it('should delete task and return the deleted task', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{ task_id: 1, task_name: 'Deleted task' }]
            });

            const res = await request(app).delete(`${BASE}/1`);

            expect(res.statusCode).toBe(204);
        });

        it('should return 500 if db crashes', async () => {
            pool.query.mockRejectedValueOnce(new Error('DB crashed'));

            const res = await request(app).delete(`${BASE}/1`);

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error', 'Server error');
        });
    })

    describe('/PATCH /boards/:board_id/task/:task_id', () => {
      
      it('should update task name and return 200', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{ task_id: 1, task_name: 'Updated task' }],
                rowCount: 1
            });

            const res = await request(app)
                .patch(`${BASE}/1`)
                .send({ task_name: 'Updated task' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('task_name', 'Updated task');
        });

        it('should return 400 if task_name is missing', async () => {
            const res = await request(app)
                .patch(`${BASE}/1`)
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'Behöver ett nytt namn');
        });

        it('should return 404 if task not found', async () => {
            pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

            const res = await request(app)
                .patch(`${BASE}/1`)
                .send({ task_name: 'Updated task' });

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'task saknas');
        });

        it('should return 500 if db crashes', async () => {
            pool.query.mockRejectedValueOnce(new Error('DB crashed'));

            const res = await request(app)
                .patch(`${BASE}/1`)
                .send({ task_name: 'Updated task' });

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error');
        });
    });
}) 