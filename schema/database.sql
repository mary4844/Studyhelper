--
-- PostgreSQL database dump
--

\restrict 6zkcJgOcroKj9n2jN6aCSSkUThT6jMLMzPEbbBa8znsTQCsYrwoZdCG80dnRjYf

-- Dumped from database version 18.3 (Homebrew)
-- Dumped by pg_dump version 18.2

-- Started on 2026-05-06 13:51:57 CEST

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
-- TOC entry 220 (class 1259 OID 16395)
-- Name: users; Type: TABLE; Schema: public; Owner: josefinfundberg
--

CREATE TABLE public.users (
    user_id integer CONSTRAINT "User_user_id_not_null" NOT NULL,
    user_name varchar(255),
    pwd varchar
);


ALTER TABLE public.users OWNER TO josefinfundberg;

--
-- TOC entry 219 (class 1259 OID 16394)
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
-- TOC entry 3788 (class 0 OID 0)
-- Dependencies: 219
-- Name: User_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: josefinfundberg
--

ALTER SEQUENCE public."User_user_id_seq" OWNED BY public.users.user_id;


--
-- TOC entry 222 (class 1259 OID 16405)
-- Name: board; Type: TABLE; Schema: public; Owner: josefinfundberg
--

CREATE TABLE public.board (
    board_id integer NOT NULL,
    board_name character varying,
    is_shared boolean DEFAULT false
);


ALTER TABLE public.board OWNER TO josefinfundberg;

--
-- TOC entry 221 (class 1259 OID 16404)
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
-- TOC entry 3789 (class 0 OID 0)
-- Dependencies: 221
-- Name: board_board_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: josefinfundberg
--

ALTER SEQUENCE public.board_board_id_seq OWNED BY public.board.board_id;


--
-- TOC entry 228 (class 1259 OID 16574)
-- Name: subject_card_task; Type: TABLE; Schema: public; Owner: josefinfundberg
--

CREATE TABLE public.subject_card_task (
    subject_card_id integer NOT NULL,
    task_id integer NOT NULL
);


ALTER TABLE public.subject_card_task OWNER TO josefinfundberg;

--
-- TOC entry 227 (class 1259 OID 16553)
-- Name: subject_cards; Type: TABLE; Schema: public; Owner: josefinfundberg
--

CREATE TABLE public.subject_cards (
    subject_card_id integer NOT NULL,
    board_id integer,
    subject_name character varying NOT NULL
);


ALTER TABLE public.subject_cards OWNER TO josefinfundberg;

--
-- TOC entry 226 (class 1259 OID 16552)
-- Name: subject_cards_subject_card_id_seq; Type: SEQUENCE; Schema: public; Owner: josefinfundberg
--

CREATE SEQUENCE public.subject_cards_subject_card_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subject_cards_subject_card_id_seq OWNER TO josefinfundberg;

--
-- TOC entry 3790 (class 0 OID 0)
-- Dependencies: 226
-- Name: subject_cards_subject_card_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: josefinfundberg
--

ALTER SEQUENCE public.subject_cards_subject_card_id_seq OWNED BY public.subject_cards.subject_card_id;


--
-- TOC entry 224 (class 1259 OID 16415)
-- Name: tasks; Type: TABLE; Schema: public; Owner: josefinfundberg
--

CREATE TABLE public.tasks (
    task_id integer NOT NULL,
    task_name text,
    user_id integer,
    deadline date,
    status boolean DEFAULT false,
    subject_card_id integer
);


ALTER TABLE public.tasks OWNER TO josefinfundberg;

--
-- TOC entry 223 (class 1259 OID 16414)
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
-- TOC entry 3791 (class 0 OID 0)
-- Dependencies: 223
-- Name: tasks_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: josefinfundberg
--

ALTER SEQUENCE public.tasks_task_id_seq OWNED BY public.tasks.task_id;


--
-- TOC entry 225 (class 1259 OID 16441)
-- Name: user_board; Type: TABLE; Schema: public; Owner: josefinfundberg
--

CREATE TABLE public.user_board (
    user_id integer NOT NULL,
    board_id integer NOT NULL
);


ALTER TABLE public.user_board OWNER TO josefinfundberg;

--
-- TOC entry 3612 (class 2604 OID 16408)
-- Name: board board_id; Type: DEFAULT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.board ALTER COLUMN board_id SET DEFAULT nextval('public.board_board_id_seq'::regclass);


--
-- TOC entry 3616 (class 2604 OID 16556)
-- Name: subject_cards subject_card_id; Type: DEFAULT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.subject_cards ALTER COLUMN subject_card_id SET DEFAULT nextval('public.subject_cards_subject_card_id_seq'::regclass);


--
-- TOC entry 3614 (class 2604 OID 16418)
-- Name: tasks task_id; Type: DEFAULT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.tasks ALTER COLUMN task_id SET DEFAULT nextval('public.tasks_task_id_seq'::regclass);


--
-- TOC entry 3611 (class 2604 OID 16398)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public."User_user_id_seq"'::regclass);


--
-- TOC entry 3618 (class 2606 OID 16403)
-- Name: users User_pkey; Type: CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (user_id);


--
-- TOC entry 3620 (class 2606 OID 16413)
-- Name: board board_pkey; Type: CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.board
    ADD CONSTRAINT board_pkey PRIMARY KEY (board_id);


--
-- TOC entry 3628 (class 2606 OID 16580)
-- Name: subject_card_task subject_card_task_pkey; Type: CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.subject_card_task
    ADD CONSTRAINT subject_card_task_pkey PRIMARY KEY (subject_card_id, task_id);


--
-- TOC entry 3626 (class 2606 OID 16562)
-- Name: subject_cards subject_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.subject_cards
    ADD CONSTRAINT subject_cards_pkey PRIMARY KEY (subject_card_id);


--
-- TOC entry 3622 (class 2606 OID 16423)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (task_id);


--
-- TOC entry 3624 (class 2606 OID 16447)
-- Name: user_board user_board_pkey; Type: CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.user_board
    ADD CONSTRAINT user_board_pkey PRIMARY KEY (user_id, board_id);


--
-- TOC entry 3634 (class 2606 OID 16581)
-- Name: subject_card_task subject_card_task_subject_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.subject_card_task
    ADD CONSTRAINT subject_card_task_subject_card_id_fkey FOREIGN KEY (subject_card_id) REFERENCES public.subject_cards(subject_card_id);


--
-- TOC entry 3635 (class 2606 OID 16586)
-- Name: subject_card_task subject_card_task_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.subject_card_task
    ADD CONSTRAINT subject_card_task_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(task_id);


--
-- TOC entry 3633 (class 2606 OID 16563)
-- Name: subject_cards subject_cards_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.subject_cards
    ADD CONSTRAINT subject_cards_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.board(board_id);


--
-- TOC entry 3629 (class 2606 OID 16568)
-- Name: tasks tasks_subject_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_subject_card_id_fkey FOREIGN KEY (subject_card_id) REFERENCES public.subject_cards(subject_card_id);


--
-- TOC entry 3630 (class 2606 OID 16545)
-- Name: tasks tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3631 (class 2606 OID 16453)
-- Name: user_board user_board_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.user_board
    ADD CONSTRAINT user_board_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.board(board_id);


--
-- TOC entry 3632 (class 2606 OID 16448)
-- Name: user_board user_board_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: josefinfundberg
--

ALTER TABLE ONLY public.user_board
    ADD CONSTRAINT user_board_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


-- Completed on 2026-05-06 13:51:57 CEST

--
-- PostgreSQL database dump complete
--

\unrestrict 6zkcJgOcroKj9n2jN6aCSSkUThT6jMLMzPEbbBa8znsTQCsYrwoZdCG80dnRjYf

