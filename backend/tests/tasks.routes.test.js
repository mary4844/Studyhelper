//Mål: testa backend-logiken isolerat utan riktig DB.

const request = require("supertest");
const { app } = require("../app");
const { pool } = require("../pool"); //Pool är ett backend-objekt som hanterar databasanslutningar

const originalQuery = pool.query;

afterEach(() => {
  //bra praxis att resta efter varje test
  pool.query = originalQuery;
});

describe("Tasks routes with mocked database", () => {
  test("GET /tasks returns a JSON array of tasks", async () => {
    pool.query = async () => ({
      //mockad anrop till db
      rows: [
        { task_id: 1, task_name: "Mock task one" },
        { task_id: 2, task_name: "Mock task two" },
      ],
    });

    const response = await request(app).get("/tasks"); //backend returnerar efter anropet via frontend

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body).toEqual([
      // vi har mockat datan o skriver in det här
      { task_id: 1, task_name: "Mock task one" },
      { task_id: 2, task_name: "Mock task two" },
    ]);
  });

  test("POST /tasks/add returns the created task", async () => {
    const mockTaskName = "Mock created task";

    pool.query = async (sql, values) => {
      expect(sql).toBe("INSERT INTO tasks (task_name) VALUES ($1) RETURNING *");
      expect(values).toEqual([mockTaskName]);

      return { rows: [{ task_id: 3, task_name: mockTaskName }] };
    };

    const response = await request(app)
      .post("/tasks/add")
      .send({ name: mockTaskName })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      task_id: 3,
      task_name: mockTaskName,
    });
  });
});
