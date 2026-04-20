

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(100)
    --Kanske ha fler kolumner då, hur funkar lösenordshanteringen t.ex.
);


CREATE TABLE boards (
    board_id SERIAL PRIMARY KEY,
    board_name VARCHAR(100)
);

CREATE TABLE lists (
    list_id SERIAL PRIMARY KEY,
    list_name VARCHAR(100)
);

CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    task_name VARCHAR(200)
);

CREATE TABLE user_board (
    user_id INT REFERENCES users(user_id),
    board_id INT REFERENCES boards(board_id),
    PRIMARY KEY (user_id, board_id)
);

CREATE TABLE board_list (
    board_id INT REFERENCES boards(board_id),
    list_id INT REFERENCES lists(list_id),
    PRIMARY KEY (board_id, list_id)
);

CREATE TABLE list_task (
    list_id INT REFERENCES lists(list_id),
    task_id INT REFERENCES tasks(task_id),
    PRIMARY KEY (list_id, task_id)
);
