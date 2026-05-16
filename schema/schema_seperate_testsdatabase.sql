--
-- PostgreSQL database dump
--

\restrict Sr4WMPul12XfSUd1QbsG28e18Bh97mk8iwQfs18ZcxthHLJRF8HOX8BA0QzJV4R

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: board; Type: TABLE; Schema: public; Owner: olof
--

CREATE TABLE public.board (
    board_id integer NOT NULL,
    board_name character varying,
    is_shared boolean DEFAULT false
);


ALTER TABLE public.board OWNER TO olof;

--
-- Name: board_board_id_seq; Type: SEQUENCE; Schema: public; Owner: olof
--

CREATE SEQUENCE public.board_board_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.board_board_id_seq OWNER TO olof;

--
-- Name: board_board_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olof
--

ALTER SEQUENCE public.board_board_id_seq OWNED BY public.board.board_id;


--
-- Name: subject_cards; Type: TABLE; Schema: public; Owner: olof
--

CREATE TABLE public.subject_cards (
    subject_card_id integer NOT NULL,
    board_id integer,
    subject_name character varying NOT NULL
);


ALTER TABLE public.subject_cards OWNER TO olof;

--
-- Name: subject_cards_subject_card_id_seq; Type: SEQUENCE; Schema: public; Owner: olof
--

CREATE SEQUENCE public.subject_cards_subject_card_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subject_cards_subject_card_id_seq OWNER TO olof;

--
-- Name: subject_cards_subject_card_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olof
--

ALTER SEQUENCE public.subject_cards_subject_card_id_seq OWNED BY public.subject_cards.subject_card_id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: olof
--

CREATE TABLE public.tasks (
    task_id integer NOT NULL,
    task_name text,
    user_id integer,
    deadline date,
    status boolean DEFAULT false,
    subject_card_id integer
);


ALTER TABLE public.tasks OWNER TO olof;

--
-- Name: tasks_task_id_seq; Type: SEQUENCE; Schema: public; Owner: olof
--

CREATE SEQUENCE public.tasks_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_task_id_seq OWNER TO olof;

--
-- Name: tasks_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olof
--

ALTER SEQUENCE public.tasks_task_id_seq OWNED BY public.tasks.task_id;


--
-- Name: user_board; Type: TABLE; Schema: public; Owner: olof
--

CREATE TABLE public.user_board (
    user_id integer NOT NULL,
    board_id integer NOT NULL
);


ALTER TABLE public.user_board OWNER TO olof;

--
-- Name: users; Type: TABLE; Schema: public; Owner: olof
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    user_name character varying(255),
    user_mail character varying(255)
);


ALTER TABLE public.users OWNER TO olof;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: olof
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO olof;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olof
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: board board_id; Type: DEFAULT; Schema: public; Owner: olof
--

ALTER TABLE ONLY public.board ALTER COLUMN board_id SET DEFAULT nextval('public.board_board_id_seq'::regclass);


--
-- Name: subject_cards subject_card_id; Type: DEFAULT; Schema: public; Owner: olof
--

ALTER TABLE ONLY public.subject_cards ALTER COLUMN subject_card_id SET DEFAULT nextval('public.subject_cards_subject_card_id_seq'::regclass);


--
-- Name: tasks task_id; Type: DEFAULT; Schema: public; Owner: olof
--

ALTER TABLE ONLY public.tasks ALTER COLUMN task_id SET DEFAULT nextval('public.tasks_task_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: olof
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: board board_pkey; Type: CONSTRAINT; Schema: public; Owner: olof
--

ALTER TABLE ONLY public.board
    ADD CONSTRAINT board_pkey PRIMARY KEY (board_id);


--
-- Name: subject_cards subject_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: olof
--

ALTER TABLE ONLY public.subject_cards
    ADD CONSTRAINT subject_cards_pkey PRIMARY KEY (subject_card_id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: olof
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (task_id);


--
-- Name: user_board user_board_pkey; Type: CONSTRAINT; Schema: public; Owner: olof
--

ALTER TABLE ONLY public.user_board
    ADD CONSTRAINT user_board_pkey PRIMARY KEY (user_id, board_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: olof
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_user_mail_key; Type: CONSTRAINT; Schema: public; Owner: olof
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_mail_key UNIQUE (user_mail);


--
-- Name: subject_cards subject_cards_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olof
--

ALTER TABLE ONLY public.subject_cards
    ADD CONSTRAINT subject_cards_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.board(board_id);


--
-- Name: tasks tasks_subject_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olof
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_subject_card_id_fkey FOREIGN KEY (subject_card_id) REFERENCES public.subject_cards(subject_card_id);


--
-- Name: tasks tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olof
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: user_board user_board_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olof
--

ALTER TABLE ONLY public.user_board
    ADD CONSTRAINT user_board_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.board(board_id);


--
-- Name: user_board user_board_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olof
--

ALTER TABLE ONLY public.user_board
    ADD CONSTRAINT user_board_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO olof;


--
-- PostgreSQL database dump complete
--

\unrestrict Sr4WMPul12XfSUd1QbsG28e18Bh97mk8iwQfs18ZcxthHLJRF8HOX8BA0QzJV4R

