//Integrationstest filen; testar backendkoden mot vår db, för just tasks routes.
//Jest-funktioner som describe, test, expect, afterEach, afterAll osv.
//supertest avänds för att skicka HTTP-requests mot vår ecpress app under testet ex request(app).get(...).

const request = require("supertest"); // Supertest är verktyget för att skicka requests till vår Express app.
const { app } = require("../app"); //importera appen
const { pool } = require("../pool");

// sprar namn på tasks som läggs til i db under testkörningen
const createdTaskNames = new Set();

// efter varje test ta bort skapade tasks från db (testerna ska ej påverka varandra)
afterEach(async () => {
  for (const taskName of createdTaskNames) {
    await pool.query("DELETE FROM tasks WHERE task_name = $1", [taskName]); // ta bort matcher i db
  }
  createdTaskNames.clear();
});

// Efter alla tester stäng av db anslutningen (pga jest)
afterAll(async () => {
  await pool.end();
});

describe("Tasks integration tests with real database", () => {
  test("GET /tasks returns an array from PostgreSQL, atm empty", async () => {
    const response = await request(app).get("/tasks"); //skicka en GET request till /tasks route i vår app,
    // obs! vi anger endpoint som annars redan står i URL:en i frontend

    // kolla repsons statuset, och att det är av typ json samt en array.
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test that POST /tasks/add writes a real row to the real database.
  test("POST /tasks inserts a real task into PostgreSQL", async () => {
    // Build a unique task name so this test does not clash with existing rows.
    const testTaskName = `integration-task-${Date.now()}`;

    // Send a real POST request that should insert a row into PostgreSQL.
    const response = await request(app)
      .post("/tasks")
      .send({ name: testTaskName })
      .set("Content-Type", "application/json");

    // spara i setet för att ta bort det i aftereach
    createdTaskNames.add(testTaskName);

    //kontroller
    expect(response.status).toBe(200);
    expect(response.body.task_name).toBe(testTaskName);

    // Verifiera att datan finns i db
    const dbResult = await pool.query(
      "SELECT * FROM tasks WHERE task_name = $1",
      [testTaskName],
    );

    expect(dbResult.rows.length).toBe(1); // kanske inte behövs?
    expect(dbResult.rows[0].task_name).toBe(testTaskName);
  });

  test("PATCH /tasks/:id edits a task name in table", async () => {
    const testTaskName = `integration-task-${Date.now()}`;
    const updatedTaskName = `${testTaskName}-updated`; //adds extra text to the string

    // Create task first.
    const createResponse = await request(app)
      .post("/tasks")
      .send({ name: testTaskName })
      .set("Content-Type", "application/json");

    createdTaskNames.add(testTaskName);

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.task_name).toBe(testTaskName);

    const taskId = createResponse.body.task_id;

    // Update created task name by id.
    const patchResponse = await request(app)
      .patch(`/tasks/${taskId}`)
      .send({ name: updatedTaskName })
      .set("Content-Type", "application/json");

    // Cleanup set should track the updated name.
    createdTaskNames.delete(testTaskName);
    createdTaskNames.add(updatedTaskName);

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.task_id).toBe(taskId);
    expect(patchResponse.body.task_name).toBe(updatedTaskName);

    const dbResult = await pool.query(
      "SELECT * FROM tasks WHERE task_id = $1",
      [taskId],
    );

    expect(dbResult.rows.length).toBe(1);
    expect(dbResult.rows[0].task_name).toBe(updatedTaskName);
  });

  test("DELETE /tasks/:id delete a task by id from table", async () => {
    //create a task and verify it
    const testTaskName = `integration-task-${Date.now()}`;
    const createResponse = await request(app)
      .post("/tasks")
      .send({ name: testTaskName })
      .set("Content-Type", "application/json");

    createdTaskNames.add(testTaskName);

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.task_name).toBe(testTaskName);

    const taskId = createResponse.body.task_id;
    const response = await request(app) //respons ifrån backend efter att ha kallat clear tasks
      .delete(`/tasks/${taskId}`)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);

    const dbResult = await pool.query(
      "SELECT * FROM tasks WHERE task_id = $1",
      [taskId],
    );

    expect(dbResult.rows.length).toBe(0);
  });

  test("POST /tasks clear delete all tasks from table", async () => {
    const response = await request(app) //respons ifrån backend efter att ha kallat clear tasks
      .delete("/tasks")
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);

    const dbResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM tasks",
    );
    expect(dbResult.rows[0].count).toBe(0);
  });
});
