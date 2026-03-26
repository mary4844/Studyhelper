--
-- PostgreSQL database dump
--

\restrict tjU5RIf5LY8WRbPFMhaJPY9rjm3FnJxE0dz86NFHoQoqmsQmJedbkK1GaYQTRmf

-- Dumped from database version 18.3 (Homebrew)
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: josefinfundberg
--

CREATE TABLE public.users (
    user_id integer CONSTRAINT "User_user_id_not_null" NOT NULL,
    user_name character varying,
    pwd "char",
    board_id integer[]
);


ALTER TABLE public.users OWNER TO josefinfundberg;

--
-- Name: User_user_id_seq; Type: SEQUENCE; Schema: public; Owner: josefinfundberg
--

CREATE SEQUENCE public."User_user_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_user_id_seq" OWNER TO josefinfundberg;

--
-- Name: User_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: josefinfundberg
--

ALTER SEQUENCE public."User_user_id_seq" OWNED BY public.users.user_id;


--
-- Name: board; Type: TABLE; Schema: public; Owner: josefinfundberg
--

CREATE TABLE public.board (
    board_id integer NOT NULL,
    board_name character varying
);


ALTER TABLE public.board OWNER TO josefinfundberg;

--
-- Name: board_board_id_seq; Type: SEQUENCE; Schema: public; Owner: josefinfundberg
--

CREATE SEQUENCE public.board_board_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.board_board_id_seq OWNER TO josefinfundberg;

--
-- Name: board_board_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: josefinfundberg
--

ALTER SEQUENCE public.board_board_id_seq OWNED BY public.board.board_id;


--
-- Name: board_task; Type: TABLE; Schema: public; Owner: josefinfundberg
--

CREATE TABLE public.board_task (
    board_id integer NOT NULL,
    task_id integer NOT NULL
);


ALTER TABLE public.board_task OWNER TO josefinfundberg;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: josefinfundberg
--

CREATE TABLE public.tasks (
    task_id integer NOT NULL,
    task_name "char"[]
);


ALTER TABLE public.tasks OWNER TO josefinfundberg;

--
-- Name: tasks_task_id_seq; Type: SEQUENCE; Schema: public; Owner: josefinfundberg
--

CREATE SEQUENCE public.tasks_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_task_id_seq OWNER TO josefinfundberg;

--
-- Name: tasks_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: josefinfundberg
--

ALTER SEQUENCE public.tasks_task_id_seq OWNED BY public.tasks.task_id;


--
-- Name: user_board; Type: TABLE; Schema: public; Owner: josefinfundberg
--

CREATE TABLE public.user_board (
    user_id integer NOT NULL,
    board_id integer NOT NULL
);


ALTER TABLE public.user_board OWNER TO josefinfundberg;

--
-- Name: board board_id; Type: DEFAULT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.board ALTER COLUMN board_id SET DEFAULT nextval('public.board_board_id_seq'::regclass);


--
-- Name: tasks task_id; Type: DEFAULT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.tasks ALTER COLUMN task_id SET DEFAULT nextval('public.tasks_task_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public."User_user_id_seq"'::regclass);


--
-- Name: users User_pkey; Type: CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (user_id);


--
-- Name: board board_pkey; Type: CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.board
    ADD CONSTRAINT board_pkey PRIMARY KEY (board_id);


--
-- Name: board_task board_task_pkey; Type: CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.board_task
    ADD CONSTRAINT board_task_pkey PRIMARY KEY (board_id, task_id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (task_id);


--
-- Name: user_board user_board_pkey; Type: CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.user_board
    ADD CONSTRAINT user_board_pkey PRIMARY KEY (user_id, board_id);


--
-- Name: board_task board_task_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.board_task
    ADD CONSTRAINT board_task_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.board(board_id);


--
-- Name: board_task board_task_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.board_task
    ADD CONSTRAINT board_task_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(task_id);


--
-- Name: user_board user_board_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.user_board
    ADD CONSTRAINT user_board_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.board(board_id);


--
-- Name: user_board user_board_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.user_board
    ADD CONSTRAINT user_board_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- PostgreSQL database dump complete
--

\unrestrict tjU5RIf5LY8WRbPFMhaJPY9rjm3FnJxE0dz86NFHoQoqmsQmJedbkK1GaYQTRmf

