--
-- PostgreSQL database dump
--

\restrict 1uxwA1DScJK8MgMn6jfj5AAeTCb7ZgRZ7p9TCEdSrxhdMegCla0biM7SSbcW9Pb

-- Dumped from database version 17.7
-- Dumped by pg_dump version 17.7

-- Started on 2025-11-26 17:03:51

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 239 (class 1259 OID 30720)
-- Name: arbitros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arbitros (
    cedula character(10) NOT NULL,
    experiencia integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.arbitros OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 30561)
-- Name: cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 30568)
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 30831)
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 30830)
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_id_seq OWNER TO postgres;

--
-- TOC entry 5069 (class 0 OID 0)
-- Dependencies: 250
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;


--
-- TOC entry 249 (class 1259 OID 30814)
-- Name: configuracion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracion (
    id bigint NOT NULL,
    clave character varying(100) NOT NULL,
    valor text,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.configuracion OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 30813)
-- Name: configuracion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.configuracion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.configuracion_id_seq OWNER TO postgres;

--
-- TOC entry 5070 (class 0 OID 0)
-- Dependencies: 248
-- Name: configuracion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.configuracion_id_seq OWNED BY public.configuracion.id;


--
-- TOC entry 231 (class 1259 OID 30631)
-- Name: deportes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deportes (
    id bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.deportes OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 30630)
-- Name: deportes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.deportes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.deportes_id_seq OWNER TO postgres;

--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 230
-- Name: deportes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deportes_id_seq OWNED BY public.deportes.id;


--
-- TOC entry 235 (class 1259 OID 30661)
-- Name: equipos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipos (
    id bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    torneo_id bigint NOT NULL,
    logo character varying(255),
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deporte_id bigint,
    categoria_id bigint
);


ALTER TABLE public.equipos OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 30660)
-- Name: equipos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipos_id_seq OWNER TO postgres;

--
-- TOC entry 5072 (class 0 OID 0)
-- Dependencies: 234
-- Name: equipos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipos_id_seq OWNED BY public.equipos.id;


--
-- TOC entry 243 (class 1259 OID 30765)
-- Name: estadisticas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estadisticas (
    id bigint NOT NULL,
    jugador_cedula character(10) NOT NULL,
    partido_id bigint NOT NULL,
    goles integer DEFAULT 0 NOT NULL,
    asistencias integer DEFAULT 0 NOT NULL,
    tarjetas_amarillas integer DEFAULT 0 NOT NULL,
    tarjetas_rojas integer DEFAULT 0 NOT NULL,
    rebotes integer DEFAULT 0 NOT NULL,
    bloqueos integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.estadisticas OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 30764)
-- Name: estadisticas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estadisticas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estadisticas_id_seq OWNER TO postgres;

--
-- TOC entry 5073 (class 0 OID 0)
-- Dependencies: 242
-- Name: estadisticas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estadisticas_id_seq OWNED BY public.estadisticas.id;


--
-- TOC entry 227 (class 1259 OID 30593)
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 30592)
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO postgres;

--
-- TOC entry 5074 (class 0 OID 0)
-- Dependencies: 226
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- TOC entry 247 (class 1259 OID 30803)
-- Name: galeria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.galeria (
    id bigint NOT NULL,
    titulo character varying(100),
    descripcion text,
    imagen character varying(255) NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.galeria OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 30802)
-- Name: galeria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.galeria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.galeria_id_seq OWNER TO postgres;

--
-- TOC entry 5075 (class 0 OID 0)
-- Dependencies: 246
-- Name: galeria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.galeria_id_seq OWNED BY public.galeria.id;


--
-- TOC entry 237 (class 1259 OID 30680)
-- Name: inscripciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inscripciones (
    id bigint NOT NULL,
    equipo_id bigint NOT NULL,
    torneo_id bigint NOT NULL,
    fecha_inscripcion date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.inscripciones OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 30679)
-- Name: inscripciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inscripciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inscripciones_id_seq OWNER TO postgres;

--
-- TOC entry 5076 (class 0 OID 0)
-- Dependencies: 236
-- Name: inscripciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inscripciones_id_seq OWNED BY public.inscripciones.id;


--
-- TOC entry 225 (class 1259 OID 30585)
-- Name: job_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 30576)
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 30575)
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- TOC entry 5077 (class 0 OID 0)
-- Dependencies: 223
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- TOC entry 238 (class 1259 OID 30701)
-- Name: jugadores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jugadores (
    cedula character(10) NOT NULL,
    equipo_id bigint,
    posicion character varying(50),
    numero integer,
    carnet_qr text,
    carnet_pdf character varying(255),
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    victorias integer DEFAULT 0,
    derrotas integer DEFAULT 0,
    empates integer DEFAULT 0
);


ALTER TABLE public.jugadores OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 30528)
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 30527)
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- TOC entry 5078 (class 0 OID 0)
-- Dependencies: 217
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 245 (class 1259 OID 30792)
-- Name: noticias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.noticias (
    id bigint NOT NULL,
    titulo character varying(255) NOT NULL,
    contenido text,
    imagen character varying(255),
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.noticias OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 30791)
-- Name: noticias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.noticias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.noticias_id_seq OWNER TO postgres;

--
-- TOC entry 5079 (class 0 OID 0)
-- Dependencies: 244
-- Name: noticias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.noticias_id_seq OWNED BY public.noticias.id;


--
-- TOC entry 241 (class 1259 OID 30734)
-- Name: partidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.partidos (
    id bigint NOT NULL,
    torneo_id bigint NOT NULL,
    arbitro_cedula character(10),
    equipo_local_id bigint NOT NULL,
    equipo_visitante_id bigint NOT NULL,
    fecha timestamp(0) without time zone,
    marcador_local integer DEFAULT 0 NOT NULL,
    marcador_visitante integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estado character varying(255) DEFAULT 'Programado'::character varying NOT NULL
);


ALTER TABLE public.partidos OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 30733)
-- Name: partidos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.partidos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.partidos_id_seq OWNER TO postgres;

--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 240
-- Name: partidos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.partidos_id_seq OWNED BY public.partidos.id;


--
-- TOC entry 219 (class 1259 OID 30545)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 30880)
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 30879)
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 252
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- TOC entry 228 (class 1259 OID 30604)
-- Name: personas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personas (
    cedula character(10) NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    edad integer,
    estatura numeric(4,2),
    telefono character varying(20),
    foto character varying(255),
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.personas OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 30552)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id character varying(20),
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 30642)
-- Name: torneos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.torneos (
    id bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    deporte_id bigint NOT NULL,
    fecha_inicio date,
    fecha_fin date,
    ubicacion character varying(100),
    creado_por character(10),
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    categoria_id bigint NOT NULL,
    descripcion text,
    estado character varying(50) DEFAULT 'Activo'::character varying NOT NULL
);


ALTER TABLE public.torneos OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 30641)
-- Name: torneos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.torneos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.torneos_id_seq OWNER TO postgres;

--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 232
-- Name: torneos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.torneos_id_seq OWNED BY public.torneos.id;


--
-- TOC entry 229 (class 1259 OID 30611)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    cedula character(10) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    rol character varying(255) DEFAULT 'usuario'::character varying NOT NULL,
    estado boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    nombres character varying(100),
    apellidos character varying(100),
    foto character varying(255),
    telefono character varying(20),
    CONSTRAINT usuarios_rol_check CHECK (((rol)::text = ANY ((ARRAY['admin'::character varying, 'entrenador'::character varying, 'jugador'::character varying, 'arbitro'::character varying, 'usuario'::character varying])::text[])))
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 4798 (class 2604 OID 30834)
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);


--
-- TOC entry 4795 (class 2604 OID 30817)
-- Name: configuracion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion ALTER COLUMN id SET DEFAULT nextval('public.configuracion_id_seq'::regclass);


--
-- TOC entry 4752 (class 2604 OID 30634)
-- Name: deportes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportes ALTER COLUMN id SET DEFAULT nextval('public.deportes_id_seq'::regclass);


--
-- TOC entry 4759 (class 2604 OID 30664)
-- Name: equipos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos ALTER COLUMN id SET DEFAULT nextval('public.equipos_id_seq'::regclass);


--
-- TOC entry 4780 (class 2604 OID 30768)
-- Name: estadisticas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estadisticas ALTER COLUMN id SET DEFAULT nextval('public.estadisticas_id_seq'::regclass);


--
-- TOC entry 4744 (class 2604 OID 30596)
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- TOC entry 4792 (class 2604 OID 30806)
-- Name: galeria id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.galeria ALTER COLUMN id SET DEFAULT nextval('public.galeria_id_seq'::regclass);


--
-- TOC entry 4762 (class 2604 OID 30683)
-- Name: inscripciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones ALTER COLUMN id SET DEFAULT nextval('public.inscripciones_id_seq'::regclass);


--
-- TOC entry 4743 (class 2604 OID 30579)
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- TOC entry 4742 (class 2604 OID 30531)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 4789 (class 2604 OID 30795)
-- Name: noticias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.noticias ALTER COLUMN id SET DEFAULT nextval('public.noticias_id_seq'::regclass);


--
-- TOC entry 4774 (class 2604 OID 30737)
-- Name: partidos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidos ALTER COLUMN id SET DEFAULT nextval('public.partidos_id_seq'::regclass);


--
-- TOC entry 4799 (class 2604 OID 30883)
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- TOC entry 4755 (class 2604 OID 30645)
-- Name: torneos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.torneos ALTER COLUMN id SET DEFAULT nextval('public.torneos_id_seq'::regclass);


--
-- TOC entry 5049 (class 0 OID 30720)
-- Dependencies: 239
-- Data for Name: arbitros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.arbitros (cedula, experiencia, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5031 (class 0 OID 30561)
-- Dependencies: 221
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- TOC entry 5032 (class 0 OID 30568)
-- Dependencies: 222
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- TOC entry 5061 (class 0 OID 30831)
-- Dependencies: 251
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (id, nombre, descripcion, created_at, updated_at) FROM stdin;
1	Libre	\N	\N	\N
2	Masculino	\N	\N	\N
3	Femenino	\N	\N	\N
4	Mixto	\N	\N	\N
5	Sub-18	\N	\N	\N
6	Sub-20	\N	\N	\N
7	Master	\N	\N	\N
8	Juvenil	\N	2025-11-26 16:01:09	2025-11-26 16:01:09
\.


--
-- TOC entry 5059 (class 0 OID 30814)
-- Dependencies: 249
-- Data for Name: configuracion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracion (id, clave, valor, created_at, updated_at) FROM stdin;
1	nombre_sistema	Gestor Multideportivo UEB	2025-11-08 18:14:24	2025-11-08 18:14:24
2	version	1.0.0	2025-11-08 18:14:24	2025-11-08 18:14:24
\.


--
-- TOC entry 5041 (class 0 OID 30631)
-- Dependencies: 231
-- Data for Name: deportes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deportes (id, nombre, descripcion, created_at, updated_at) FROM stdin;
1	Fútbol	Deporte de equipo jugado con balón y dos porterías.	2025-11-08 18:14:23	2025-11-08 18:14:23
2	Vóley	Juego con balón y red central.	2025-11-08 18:14:23	2025-11-08 18:14:23
3	Básquet	Juego de balón y aro.	2025-11-08 18:14:23	2025-11-08 18:14:23
\.


--
-- TOC entry 5045 (class 0 OID 30661)
-- Dependencies: 235
-- Data for Name: equipos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipos (id, nombre, torneo_id, logo, created_at, updated_at, deporte_id, categoria_id) FROM stdin;
1	Los Innovadores	28	logos/mnsLpqWjfVBvh4PkoweBwGBKz5HfRGSu70T1CXQ7.jpg	2025-11-15 16:55:08	2025-11-16 00:58:06	1	3
\.


--
-- TOC entry 5053 (class 0 OID 30765)
-- Dependencies: 243
-- Data for Name: estadisticas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estadisticas (id, jugador_cedula, partido_id, goles, asistencias, tarjetas_amarillas, tarjetas_rojas, rebotes, bloqueos, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5037 (class 0 OID 30593)
-- Dependencies: 227
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- TOC entry 5057 (class 0 OID 30803)
-- Dependencies: 247
-- Data for Name: galeria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.galeria (id, titulo, descripcion, imagen, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5047 (class 0 OID 30680)
-- Dependencies: 237
-- Data for Name: inscripciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inscripciones (id, equipo_id, torneo_id, fecha_inscripcion, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5035 (class 0 OID 30585)
-- Dependencies: 225
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- TOC entry 5034 (class 0 OID 30576)
-- Dependencies: 224
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- TOC entry 5048 (class 0 OID 30701)
-- Dependencies: 238
-- Data for Name: jugadores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jugadores (cedula, equipo_id, posicion, numero, carnet_qr, carnet_pdf, created_at, updated_at, victorias, derrotas, empates) FROM stdin;
1500982689	1	Defensa	4	\N	\N	2025-11-15 17:10:29	2025-11-15 22:46:49	0	0	0
\.


--
-- TOC entry 5028 (class 0 OID 30528)
-- Dependencies: 218
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2025_11_08_000001_create_personas_table	1
5	2025_11_08_000002_create_usuarios_table	1
6	2025_11_08_000003_create_deportes_table	1
7	2025_11_08_000004_create_torneos_table	1
8	2025_11_08_000005_create_equipos_table	1
9	2025_11_08_000006_create_inscripciones_table	1
10	2025_11_08_000007_create_jugadores_table	1
11	2025_11_08_000008_create_arbitros_table	1
12	2025_11_08_000009_create_partidos_table	1
13	2025_11_08_000010_create_estadisticas_table	1
14	2025_11_08_000011_create_noticias_table	1
15	2025_11_08_000012_create_galeria_table	1
16	2025_11_08_000013_create_configuracion_table	1
17	2025_11_08_233113_create_categorias_table	2
18	2025_11_08_233440_add_categoria_id_to_torneos_table	3
19	2025_11_13_140435_add_campos_to_torneos_table	4
20	2025_11_15_120000_add_deporte_categoria_to_equipos_table	5
21	2025_11_25_230335_create_personal_access_tokens_table	6
22	2025_11_26_161740_add_estado_to_torneos_table	7
23	2025_11_26_162514_remove_redundant_categoria_column_from_torneos_table	8
24	2025_11_26_171044_add_estado_to_partidos_table	9
25	2025_11_26_171152_create_arbitros_table	9
\.


--
-- TOC entry 5055 (class 0 OID 30792)
-- Dependencies: 245
-- Data for Name: noticias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.noticias (id, titulo, contenido, imagen, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5051 (class 0 OID 30734)
-- Dependencies: 241
-- Data for Name: partidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partidos (id, torneo_id, arbitro_cedula, equipo_local_id, equipo_visitante_id, fecha, marcador_local, marcador_visitante, created_at, updated_at, estado) FROM stdin;
\.


--
-- TOC entry 5029 (class 0 OID 30545)
-- Dependencies: 219
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- TOC entry 5063 (class 0 OID 30880)
-- Dependencies: 253
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
1	App\\Models\\Usuario	1500982671	auth_token	4d13984d270cc1dfa2c515c450fd04b5db3489b52738fe3f4a84ab65e9977eea	["*"]	\N	\N	2025-11-25 23:06:57	2025-11-25 23:06:57
2	App\\Models\\Usuario	1500982671	auth_token	136717c751ef6c5032ddb6d42424b5822ea41daf757158f325616e5bb1f73103	["*"]	\N	\N	2025-11-25 23:10:17	2025-11-25 23:10:17
3	App\\Models\\Usuario	1500982671	auth_token	e26deca8773f2fbe3400b5fb081bfbafaa0fe318cfcb04f993b1f6685c9c1f97	["*"]	\N	\N	2025-11-25 23:21:49	2025-11-25 23:21:49
4	App\\Models\\Usuario	1500982671	auth_token	ee5e73f01499a1435e3fb7582316d7a74c3caa56d7fbd4177693a5769b54dbaa	["*"]	\N	\N	2025-11-25 23:23:13	2025-11-25 23:23:13
5	App\\Models\\Usuario	1500982671	auth_token	3f275fcd100d01ed0fe6ff5a57971582dedc09c9bfc542d07fe93f147cd41b61	["*"]	\N	\N	2025-11-26 00:16:49	2025-11-26 00:16:49
6	App\\Models\\Usuario	1500982671	auth_token	0873c82597fd215ea8748ca2da72e7af1188390bc2384a61d84a057b52055722	["*"]	\N	\N	2025-11-26 00:24:56	2025-11-26 00:24:56
7	App\\Models\\Usuario	1500982671	auth_token	1e017ca87de3c763aee242fddafcb0c0dc1b6139785c7bf21f6fbfd853a2a893	["*"]	\N	\N	2025-11-26 00:26:10	2025-11-26 00:26:10
8	App\\Models\\Usuario	1500982671	auth_token	8321ac0df6fd6025eaf097c4771335b33b39a948ac2feeedddf9483f6716b0cf	["*"]	\N	\N	2025-11-26 00:26:12	2025-11-26 00:26:12
9	App\\Models\\Usuario	1500982671	auth_token	5b09c67e3484cd90a3f0d042645e14b88d1d4e252ee7c568e3a75ad704d04463	["*"]	\N	\N	2025-11-26 00:26:15	2025-11-26 00:26:15
10	App\\Models\\Usuario	1500982671	auth_token	0f1623844c0823392ae535441185d52ec0420e917fcebb2fba25a39dcda9b73c	["*"]	\N	\N	2025-11-26 00:26:17	2025-11-26 00:26:17
11	App\\Models\\Usuario	1500982671	auth_token	c455fc87d0b57e7e7d4ab88281557993ebff82e95ffea3e09cf4384cd4ffc3fa	["*"]	\N	\N	2025-11-26 00:26:20	2025-11-26 00:26:20
22	App\\Models\\Usuario	1500982671	auth_token	a98fd3896a66d8d13fb0577f6a06fd91e60adc9a638935fa2a83a08e53b0aa3c	["*"]	2025-11-26 12:07:56	\N	2025-11-26 12:06:56	2025-11-26 12:07:56
12	App\\Models\\Usuario	1500982671	auth_token	d6d21dc3ab55e8708eaa3497050960ecb6adf6ee1bbbe78a37e037052f5c84a3	["*"]	2025-11-26 00:33:59	\N	2025-11-26 00:33:56	2025-11-26 00:33:59
32	App\\Models\\Usuario	1500982671	auth_token	387a3538009b648be9ea6b94923fc9684ce9196fbc1120be7a17d8c3b591b7ea	["*"]	2025-11-26 21:24:39	\N	2025-11-26 21:23:21	2025-11-26 21:24:39
18	App\\Models\\Usuario	1500982671	auth_token	59af3bf3215cfb32fa5f638ade9703bc47a6aa22c6da322520e53d0b7d32bf81	["*"]	2025-11-26 03:50:23	\N	2025-11-26 02:20:37	2025-11-26 03:50:23
28	App\\Models\\Usuario	1500982671	auth_token	5cfcd46a5ff40eb0e2f337e9c06c538596bf8ea4fd733d145ad80f2b9e896d79	["*"]	2025-11-26 12:26:21	\N	2025-11-26 12:24:45	2025-11-26 12:26:21
13	App\\Models\\Usuario	1500982671	auth_token	e95936bba1ca8d4729cb0def362f6da6c61614ac18322644ba958aec97c36bb7	["*"]	2025-11-26 01:39:57	\N	2025-11-26 01:08:58	2025-11-26 01:39:57
20	App\\Models\\Usuario	1500982671	auth_token	942d0cd1f6409147cfe461e4c5be94f5489f4ed67e04b9ada4175da7efa26bab	["*"]	2025-11-26 12:04:28	\N	2025-11-26 11:17:00	2025-11-26 12:04:28
23	App\\Models\\Usuario	1500982671	auth_token	1ab9ef652bc4c53120f1377270209d551d2bbf6c799b82f7d4e86ca7cdd78fc1	["*"]	2025-11-26 12:14:27	\N	2025-11-26 12:14:21	2025-11-26 12:14:27
14	App\\Models\\Usuario	1500982671	auth_token	80e80bb69d15fdfd165a93b30abc8b5ad5196d48d9752e75f00a66061070d66b	["*"]	2025-11-26 01:45:20	\N	2025-11-26 01:40:11	2025-11-26 01:45:20
26	App\\Models\\Usuario	1500982671	auth_token	19945f2df38afaaaf9caf2558ed4c6a1de3b61efbfdae96a619378552b7f2994	["*"]	2025-11-26 12:23:00	\N	2025-11-26 12:22:39	2025-11-26 12:23:00
16	App\\Models\\Usuario	1500982671	auth_token	b18628c82f2c75d8fa793e6cb889e2edcea2b227fffe5576f8c22654ccf1ae0a	["*"]	2025-11-26 02:08:40	\N	2025-11-26 02:08:38	2025-11-26 02:08:40
19	App\\Models\\Usuario	1500982671	auth_token	40361c36d613e79d9384e4298f3cb6e24a52ca98802b4d1ffe07baec513dfc03	["*"]	2025-11-26 04:17:40	\N	2025-11-26 03:53:37	2025-11-26 04:17:40
21	App\\Models\\Usuario	1500982671	auth_token	67fbb9086b0816ea60d4ac46b1fa469fe72a01af54969185a0989b9ba04e9897	["*"]	2025-11-26 12:05:38	\N	2025-11-26 12:05:26	2025-11-26 12:05:38
30	App\\Models\\Usuario	1500982671	auth_token	c5c2200a356b7c0a0137c13472711b6d7f6d170f79b3c6e68224c31d9c3ff702	["*"]	2025-11-26 19:09:25	\N	2025-11-26 16:54:21	2025-11-26 19:09:25
24	App\\Models\\Usuario	1500982671	auth_token	33a0720f7baa016114ac0ec30c1a47a750697cd47e89bfe3755c6150019c5275	["*"]	2025-11-26 12:17:12	\N	2025-11-26 12:17:04	2025-11-26 12:17:12
27	App\\Models\\Usuario	1500982671	auth_token	a1d438791eaa4b6a65e71dbbc5f5c4b55f72ad8ab7cc91bf886d1c3891e7e3a7	["*"]	2025-11-26 12:24:11	\N	2025-11-26 12:23:57	2025-11-26 12:24:11
29	App\\Models\\Usuario	1500982671	auth_token	5fa6ed40e2da6eac2da8a95638c38aecfbdd96f67b6cbb76b8be405ee4fcb4d2	["*"]	2025-11-26 16:53:53	\N	2025-11-26 13:11:31	2025-11-26 16:53:53
25	App\\Models\\Usuario	1500982671	auth_token	dff7316f815c62331587ca551025573e034630e102ee38ae7e5ed52879625c4d	["*"]	2025-11-26 12:22:19	\N	2025-11-26 12:22:07	2025-11-26 12:22:19
31	App\\Models\\Usuario	1500982671	auth_token	429b8512210cb1240af12e9fa8115258db38d3afa66d05ddbfa37a4893cefbae	["*"]	2025-11-26 19:49:24	\N	2025-11-26 19:09:57	2025-11-26 19:49:24
34	App\\Models\\Usuario	1500982671	auth_token	f86f0eca46f12a26add1b59e02b2020c7605b0f0fc6a5f417c8638abea853e18	["*"]	2025-11-26 21:51:02	\N	2025-11-26 21:50:29	2025-11-26 21:51:02
35	App\\Models\\Usuario	1500982671	auth_token	2e3af3ce9b1d73305f070f28a3b03e44776edc32c16976de67733ea9ba244d89	["*"]	2025-11-26 21:58:20	\N	2025-11-26 21:53:38	2025-11-26 21:58:20
\.


--
-- TOC entry 5038 (class 0 OID 30604)
-- Dependencies: 228
-- Data for Name: personas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personas (cedula, nombres, apellidos, edad, estatura, telefono, foto, created_at, updated_at) FROM stdin;
1500982671	Stalin	Alvarado	26	1.59	0989213708	fotos/BKjKyueGgVpluUZMd5V3VUPlIj47hIbM4CHlDr0Z.jpg	2025-11-09 00:15:35	2025-11-09 00:15:35
1701234567	Juan	Pérez	33	1.75	0998765432	\N	2025-11-09 23:32:45	2025-11-09 23:32:45
1500982689	Maria		\N	\N	\N	\N	2025-11-10 19:19:13	2025-11-10 19:19:13
123456789 	Raul	Lopez	\N	\N	\N	\N	2025-11-18 14:59:14	2025-11-18 14:59:14
1500982673	Raul	Lopez	\N	\N	\N	\N	2025-11-18 15:02:16	2025-11-18 15:02:16
\.


--
-- TOC entry 5030 (class 0 OID 30552)
-- Dependencies: 220
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
3eFz2uEdGRirdL9w0nbdkDaCZDrzEfnC0589dshv	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoic2VKSkJ1OEppY2EwZDdEa1l3c3RIMk16NVp1V1ZQaVkxNFpiamhwZSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1764184172
MPasFwHwu1nPNvLAkZE6ywLjQM1mgWuR0nCZUcM7	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiOUEzcTZnOGhtRXo5dEMxRU9XNno1TjR2TkpESFZhTzhuNVE1MnFXRyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1764194011
\.


--
-- TOC entry 5043 (class 0 OID 30642)
-- Dependencies: 233
-- Data for Name: torneos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.torneos (id, nombre, deporte_id, fecha_inicio, fecha_fin, ubicacion, creado_por, created_at, updated_at, categoria_id, descripcion, estado) FROM stdin;
28	Software 2025	1	2025-11-27	2025-11-28	\N	\N	2025-11-15 13:06:00	2025-11-26 21:23:59	1	Torneo Relampago	Activo
\.


--
-- TOC entry 5039 (class 0 OID 30611)
-- Dependencies: 229
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (cedula, email, password, rol, estado, created_at, updated_at, nombres, apellidos, foto, telefono) FROM stdin;
1500982671	admin@torneos.com	$2y$12$4mw/Q4ogYBb4xjENifPGDu9UsShb1Mzm7KEvKiUcGSBIstCsFD4Im	admin	t	2025-11-09 00:15:36	2025-11-09 00:15:36	Stalin	Alvarado	\N	0989213708
1701234567	juan.perez@email.com	$2y$12$4mw/Q4ogYBb4xjENifPGDu9UsShb1Mzm7KEvKiUcGSBIstCsFD4Im	usuario	t	2025-11-09 23:32:45	2025-11-09 23:32:45	Juan	Pérez	\N	0998765432
1500982689	maria.perez@gmail.com	$2y$12$.Z.dz6CHjvlBNZ0Ax.6KF.PRoOcrEFE4bRdQdG3gwtth41GqdoOpG	usuario	t	2025-11-10 19:19:13	2025-11-12 21:45:17	Maria		\N	\N
123456789 	raul.lopez@gmail.com	$2y$12$Le80x8bZWag871JTKYGiVu3be1ToWtGAvXgoWvQwknPFNR0HBKAtu	usuario	t	2025-11-18 14:59:15	2025-11-18 14:59:15	\N	\N	\N	\N
1500982673	raullopez@gmail.com	$2y$12$h46bzWS0tgYIANn5k970OeNL0nWw5rbJpmI2q2iwcAyHGxThPMD2q	usuario	t	2025-11-18 15:02:16	2025-11-18 15:02:16	\N	\N	\N	\N
\.


--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 250
-- Name: categorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_id_seq', 8, true);


--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 248
-- Name: configuracion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configuracion_id_seq', 2, true);


--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 230
-- Name: deportes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.deportes_id_seq', 3, true);


--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 234
-- Name: equipos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipos_id_seq', 1, true);


--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 242
-- Name: estadisticas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estadisticas_id_seq', 1, false);


--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 226
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 246
-- Name: galeria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.galeria_id_seq', 1, false);


--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 236
-- Name: inscripciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inscripciones_id_seq', 1, false);


--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 223
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 217
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 25, true);


--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 244
-- Name: noticias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.noticias_id_seq', 1, false);


--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 240
-- Name: partidos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partidos_id_seq', 1, false);


--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 252
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 35, true);


--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 232
-- Name: torneos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.torneos_id_seq', 28, true);


--
-- TOC entry 4841 (class 2606 OID 30732)
-- Name: arbitros arbitros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arbitros
    ADD CONSTRAINT arbitros_pkey PRIMARY KEY (cedula);


--
-- TOC entry 4812 (class 2606 OID 30574)
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- TOC entry 4810 (class 2606 OID 30567)
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- TOC entry 4857 (class 2606 OID 30838)
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- TOC entry 4853 (class 2606 OID 30825)
-- Name: configuracion configuracion_clave_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion
    ADD CONSTRAINT configuracion_clave_unique UNIQUE (clave);


--
-- TOC entry 4855 (class 2606 OID 30823)
-- Name: configuracion configuracion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion
    ADD CONSTRAINT configuracion_pkey PRIMARY KEY (id);


--
-- TOC entry 4829 (class 2606 OID 30640)
-- Name: deportes deportes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportes
    ADD CONSTRAINT deportes_pkey PRIMARY KEY (id);


--
-- TOC entry 4833 (class 2606 OID 30668)
-- Name: equipos equipos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_pkey PRIMARY KEY (id);


--
-- TOC entry 4845 (class 2606 OID 30790)
-- Name: estadisticas estadisticas_jugador_cedula_partido_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estadisticas
    ADD CONSTRAINT estadisticas_jugador_cedula_partido_id_unique UNIQUE (jugador_cedula, partido_id);


--
-- TOC entry 4847 (class 2606 OID 30778)
-- Name: estadisticas estadisticas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estadisticas
    ADD CONSTRAINT estadisticas_pkey PRIMARY KEY (id);


--
-- TOC entry 4819 (class 2606 OID 30601)
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4821 (class 2606 OID 30603)
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- TOC entry 4851 (class 2606 OID 30812)
-- Name: galeria galeria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.galeria
    ADD CONSTRAINT galeria_pkey PRIMARY KEY (id);


--
-- TOC entry 4835 (class 2606 OID 30700)
-- Name: inscripciones inscripciones_equipo_id_torneo_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_equipo_id_torneo_id_unique UNIQUE (equipo_id, torneo_id);


--
-- TOC entry 4837 (class 2606 OID 30688)
-- Name: inscripciones inscripciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_pkey PRIMARY KEY (id);


--
-- TOC entry 4817 (class 2606 OID 30591)
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- TOC entry 4814 (class 2606 OID 30583)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4839 (class 2606 OID 30719)
-- Name: jugadores jugadores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugadores
    ADD CONSTRAINT jugadores_pkey PRIMARY KEY (cedula);


--
-- TOC entry 4802 (class 2606 OID 30533)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4849 (class 2606 OID 30801)
-- Name: noticias noticias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.noticias
    ADD CONSTRAINT noticias_pkey PRIMARY KEY (id);


--
-- TOC entry 4843 (class 2606 OID 30743)
-- Name: partidos partidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidos
    ADD CONSTRAINT partidos_pkey PRIMARY KEY (id);


--
-- TOC entry 4804 (class 2606 OID 30551)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- TOC entry 4860 (class 2606 OID 30887)
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4862 (class 2606 OID 30890)
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- TOC entry 4823 (class 2606 OID 30610)
-- Name: personas personas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_pkey PRIMARY KEY (cedula);


--
-- TOC entry 4807 (class 2606 OID 30558)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4831 (class 2606 OID 30649)
-- Name: torneos torneos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.torneos
    ADD CONSTRAINT torneos_pkey PRIMARY KEY (id);


--
-- TOC entry 4825 (class 2606 OID 30629)
-- Name: usuarios usuarios_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_unique UNIQUE (email);


--
-- TOC entry 4827 (class 2606 OID 30627)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (cedula);


--
-- TOC entry 4815 (class 1259 OID 30584)
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- TOC entry 4858 (class 1259 OID 30891)
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- TOC entry 4863 (class 1259 OID 30888)
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- TOC entry 4805 (class 1259 OID 30560)
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- TOC entry 4808 (class 1259 OID 30853)
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- TOC entry 4875 (class 2606 OID 30726)
-- Name: arbitros arbitros_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arbitros
    ADD CONSTRAINT arbitros_cedula_foreign FOREIGN KEY (cedula) REFERENCES public.personas(cedula) ON DELETE CASCADE;


--
-- TOC entry 4868 (class 2606 OID 30869)
-- Name: equipos equipos_categoria_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_categoria_id_foreign FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL;


--
-- TOC entry 4869 (class 2606 OID 30864)
-- Name: equipos equipos_deporte_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_deporte_id_foreign FOREIGN KEY (deporte_id) REFERENCES public.deportes(id) ON DELETE SET NULL;


--
-- TOC entry 4870 (class 2606 OID 30674)
-- Name: equipos equipos_torneo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_torneo_id_foreign FOREIGN KEY (torneo_id) REFERENCES public.torneos(id) ON DELETE CASCADE;


--
-- TOC entry 4880 (class 2606 OID 30779)
-- Name: estadisticas estadisticas_jugador_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estadisticas
    ADD CONSTRAINT estadisticas_jugador_cedula_foreign FOREIGN KEY (jugador_cedula) REFERENCES public.jugadores(cedula) ON DELETE CASCADE;


--
-- TOC entry 4881 (class 2606 OID 30784)
-- Name: estadisticas estadisticas_partido_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estadisticas
    ADD CONSTRAINT estadisticas_partido_id_foreign FOREIGN KEY (partido_id) REFERENCES public.partidos(id) ON DELETE CASCADE;


--
-- TOC entry 4871 (class 2606 OID 30689)
-- Name: inscripciones inscripciones_equipo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_equipo_id_foreign FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON DELETE CASCADE;


--
-- TOC entry 4872 (class 2606 OID 30694)
-- Name: inscripciones inscripciones_torneo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_torneo_id_foreign FOREIGN KEY (torneo_id) REFERENCES public.torneos(id) ON DELETE CASCADE;


--
-- TOC entry 4873 (class 2606 OID 30708)
-- Name: jugadores jugadores_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugadores
    ADD CONSTRAINT jugadores_cedula_foreign FOREIGN KEY (cedula) REFERENCES public.personas(cedula) ON DELETE CASCADE;


--
-- TOC entry 4874 (class 2606 OID 30713)
-- Name: jugadores jugadores_equipo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugadores
    ADD CONSTRAINT jugadores_equipo_id_foreign FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON DELETE SET NULL;


--
-- TOC entry 4876 (class 2606 OID 30749)
-- Name: partidos partidos_arbitro_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidos
    ADD CONSTRAINT partidos_arbitro_cedula_foreign FOREIGN KEY (arbitro_cedula) REFERENCES public.arbitros(cedula) ON DELETE SET NULL;


--
-- TOC entry 4877 (class 2606 OID 30754)
-- Name: partidos partidos_equipo_local_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidos
    ADD CONSTRAINT partidos_equipo_local_id_foreign FOREIGN KEY (equipo_local_id) REFERENCES public.equipos(id);


--
-- TOC entry 4878 (class 2606 OID 30759)
-- Name: partidos partidos_equipo_visitante_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidos
    ADD CONSTRAINT partidos_equipo_visitante_id_foreign FOREIGN KEY (equipo_visitante_id) REFERENCES public.equipos(id);


--
-- TOC entry 4879 (class 2606 OID 30744)
-- Name: partidos partidos_torneo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidos
    ADD CONSTRAINT partidos_torneo_id_foreign FOREIGN KEY (torneo_id) REFERENCES public.torneos(id) ON DELETE CASCADE;


--
-- TOC entry 4865 (class 2606 OID 30839)
-- Name: torneos torneos_categoria_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.torneos
    ADD CONSTRAINT torneos_categoria_id_foreign FOREIGN KEY (categoria_id) REFERENCES public.categorias(id);


--
-- TOC entry 4866 (class 2606 OID 30874)
-- Name: torneos torneos_creado_por_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.torneos
    ADD CONSTRAINT torneos_creado_por_foreign FOREIGN KEY (creado_por) REFERENCES public.usuarios(cedula) ON DELETE SET NULL;


--
-- TOC entry 4867 (class 2606 OID 30650)
-- Name: torneos torneos_deporte_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.torneos
    ADD CONSTRAINT torneos_deporte_id_foreign FOREIGN KEY (deporte_id) REFERENCES public.deportes(id) ON DELETE CASCADE;


--
-- TOC entry 4864 (class 2606 OID 30621)
-- Name: usuarios usuarios_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_cedula_foreign FOREIGN KEY (cedula) REFERENCES public.personas(cedula) ON DELETE CASCADE;


-- Completed on 2025-11-26 17:03:52

--
-- PostgreSQL database dump complete
--

\unrestrict 1uxwA1DScJK8MgMn6jfj5AAeTCb7ZgRZ7p9TCEdSrxhdMegCla0biM7SSbcW9Pb

