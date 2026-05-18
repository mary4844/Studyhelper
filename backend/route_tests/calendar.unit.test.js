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

describe('calendar routes', () => {
     beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('/calendar/2026-05-14', () => {
        
        it('should return the subtasks for the given date', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{
                    subtask_id: 1,
                    subtask_name: 'subtask1',
                    deadline: '2026-05-14',
                    task_id: 1
                }]
            });

            const res = await request(app).get('/calendar/2026-05-14');

            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0]).toMatchObject({
                subtask_id: 1,
                subtask_name: 'subtask1',
                deadline: '2026-05-14',
                task_id: 1
            });
        });

        it('should return empty array if no tasks found for that date', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });

            const res = await request(app).get('/calendar/2026-05-14');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should return 500 if db crashes', async () => {
            pool.query.mockRejectedValueOnce(new Error('DB crashed'));

            const res = await request(app).get('/calendar/2026-05-14');

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error', 'Server error');
        });
    })
})
