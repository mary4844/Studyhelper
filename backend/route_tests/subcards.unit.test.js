
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
const BASE = '/boards/1/cards'

describe('subcards routes', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('/GET /boards/:board_id/cards', () => {

      it('should return all cards for authenticated users for a specific board', async () => {
        pool.query
          .mockResolvedValueOnce({
            rows: [
                { subject_card_id: 1, subject_card_name: 'card 1' },
                { subject_card_id: 2, subject_card_name: 'card 2' }]
          });

        const res = await request(app).get(BASE);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
      })

      it('should return empty array if no card is found', async () => {
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
            expect(res.body).toHaveProperty('error', 'Failed to fetch subject cards');
        });
    })

    describe('/POST /boards/:board_id/cards', () => {
      
      it('should create a card and return statuscode 201', async () => {
        pool.query
          .mockResolvedValueOnce({
               rows: [
                { subject_card_id: 1, subject_card_name: 'New card' }
           ]});

        const res = await request(app).post(BASE).send({ subject_card_name: 'New card' });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('subject_card_name', 'New card');
      })

      it('should return statuscode 400', async () => {
         const res = await request(app).post(BASE).send({});

          expect(res.statusCode).toBe(400);
          expect(res.body).toHaveProperty('error', 'Name is required');;
      })
    })

    describe('/DELETE /boards/:board_id/cards/:subject_card_id', () => {

      //does it return the deleted task?
      it('should delete task and return the deleted task', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{ subject_card_id: 1, subject_card_name: 'Deleted card' }]
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

    describe('/PATCH /boards/:board_id/cards/:subject_card_id', () => {
      
      it('should update task name and return 200', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{ subject_card_id: 1, subject_card_name: 'Updated card' }],
                rowCount: 1
            });

            const res = await request(app)
                .patch(`${BASE}/1`)
                .send({ subject_card_name: 'Updated card' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('subject_card_name', 'Updated card');
        });

        it('should return 400 if subject_card_name is missing', async () => {
            const res = await request(app)
                .patch(`${BASE}/1`)
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'Behöver ett nytt namn');
        });

        it('should return 404 if card not found', async () => {
            pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

            const res = await request(app)
                .patch(`${BASE}/1`)
                .send({ subject_card_name: 'Updated card' });

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'Kort saknas');
        });

        it('should return 500 if db crashes', async () => {
            pool.query.mockRejectedValueOnce(new Error('DB crashed'));

            const res = await request(app)
                .patch(`${BASE}/1`)
                .send({ subject_card_name: 'Updated card' });

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error');
        });
    });
}) 