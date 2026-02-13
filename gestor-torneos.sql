--
-- PostgreSQL database dump
--

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-02-12 07:37:42

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
-- TOC entry 219 (class 1259 OID 16389)
-- Name: arbitros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arbitros (
    cedula character(10) NOT NULL,
    experiencia integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    especialidad character varying(255),
    estado character varying(255) DEFAULT 'Certificado'::character varying
);


ALTER TABLE public.arbitros OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16395)
-- Name: auditoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria (
    id bigint NOT NULL,
    "timestamp" timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_cedula character varying(10),
    accion character varying(255) NOT NULL,
    entidad character varying(255) NOT NULL,
    entidad_id character varying(255),
    detalle text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.auditoria OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16405)
-- Name: auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditoria_id_seq OWNER TO postgres;

--
-- TOC entry 5205 (class 0 OID 0)
-- Dependencies: 221
-- Name: auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_id_seq OWNED BY public.auditoria.id;


--
-- TOC entry 222 (class 1259 OID 16406)
-- Name: cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16414)
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16422)
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id bigint NOT NULL,
    nombre text NOT NULL,
    descripcion character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deporte_id bigint
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16429)
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
-- TOC entry 5206 (class 0 OID 0)
-- Dependencies: 225
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;


--
-- TOC entry 226 (class 1259 OID 16430)
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
-- TOC entry 227 (class 1259 OID 16441)
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
-- TOC entry 5207 (class 0 OID 0)
-- Dependencies: 227
-- Name: configuracion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.configuracion_id_seq OWNED BY public.configuracion.id;


--
-- TOC entry 228 (class 1259 OID 16442)
-- Name: deportes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deportes (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.deportes OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16449)
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
-- TOC entry 5208 (class 0 OID 0)
-- Dependencies: 229
-- Name: deportes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deportes_id_seq OWNED BY public.deportes.id;


--
-- TOC entry 230 (class 1259 OID 16450)
-- Name: equipos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipos (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    logo character varying(255),
    torneo_id bigint NOT NULL,
    deporte_id bigint NOT NULL,
    categoria_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    representante_cedula character(10)
);


ALTER TABLE public.equipos OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16460)
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
-- TOC entry 5209 (class 0 OID 0)
-- Dependencies: 231
-- Name: equipos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipos_id_seq OWNED BY public.equipos.id;


--
-- TOC entry 232 (class 1259 OID 16461)
-- Name: estadisticas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estadisticas (
    id bigint NOT NULL,
    partido_id bigint NOT NULL,
    jugador_cedula character(10) NOT NULL,
    tipo character varying(255) NOT NULL,
    minuto integer,
    observaciones text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    goles integer DEFAULT 0 NOT NULL,
    CONSTRAINT estadisticas_tipo_check CHECK (((tipo)::text = ANY (ARRAY[('gol'::character varying)::text, ('asistencia'::character varying)::text, ('tarjeta_amarilla'::character varying)::text, ('tarjeta_roja'::character varying)::text, ('lesion'::character varying)::text])))
);


ALTER TABLE public.estadisticas OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16473)
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
-- TOC entry 5210 (class 0 OID 0)
-- Dependencies: 233
-- Name: estadisticas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estadisticas_id_seq OWNED BY public.estadisticas.id;


--
-- TOC entry 234 (class 1259 OID 16474)
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
-- TOC entry 235 (class 1259 OID 16487)
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
-- TOC entry 5211 (class 0 OID 0)
-- Dependencies: 235
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- TOC entry 236 (class 1259 OID 16488)
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
-- TOC entry 237 (class 1259 OID 16499)
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
-- TOC entry 5212 (class 0 OID 0)
-- Dependencies: 237
-- Name: galeria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.galeria_id_seq OWNED BY public.galeria.id;


--
-- TOC entry 238 (class 1259 OID 16500)
-- Name: inscripciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inscripciones (
    id bigint NOT NULL,
    equipo_id bigint NOT NULL,
    torneo_id bigint NOT NULL,
    fecha_inscripcion date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estado character varying(255) DEFAULT 'Pendiente'::character varying NOT NULL
);


ALTER TABLE public.inscripciones OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16514)
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
-- TOC entry 5213 (class 0 OID 0)
-- Dependencies: 239
-- Name: inscripciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inscripciones_id_seq OWNED BY public.inscripciones.id;


--
-- TOC entry 240 (class 1259 OID 16515)
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
-- TOC entry 241 (class 1259 OID 16527)
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
-- TOC entry 242 (class 1259 OID 16538)
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
-- TOC entry 5214 (class 0 OID 0)
-- Dependencies: 242
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- TOC entry 243 (class 1259 OID 16539)
-- Name: jugadores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jugadores (
    cedula character varying(10) NOT NULL,
    equipo_id bigint,
    posicion character varying(255),
    numero integer,
    carnet_qr character varying(255),
    carnet_pdf character varying(255),
    victorias integer DEFAULT 0 NOT NULL,
    derrotas integer DEFAULT 0 NOT NULL,
    empates integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    qr_token character varying(80),
    qr_generated_at timestamp(0) without time zone,
    carrera character varying(255),
    facultad character varying(255)
);


ALTER TABLE public.jugadores OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 16551)
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16557)
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
-- TOC entry 5215 (class 0 OID 0)
-- Dependencies: 245
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 246 (class 1259 OID 16558)
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
-- TOC entry 247 (class 1259 OID 16569)
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
-- TOC entry 5216 (class 0 OID 0)
-- Dependencies: 247
-- Name: noticias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.noticias_id_seq OWNED BY public.noticias.id;


--
-- TOC entry 248 (class 1259 OID 16570)
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
    estado character varying(255) DEFAULT 'Programado'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    hora time(0) without time zone,
    campo character varying(100),
    CONSTRAINT partidos_estado_check CHECK (((estado)::text = ANY (ARRAY[('Programado'::character varying)::text, ('En Juego'::character varying)::text, ('Finalizado'::character varying)::text, ('Postergado'::character varying)::text])))
);


ALTER TABLE public.partidos OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16584)
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
-- TOC entry 5217 (class 0 OID 0)
-- Dependencies: 249
-- Name: partidos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.partidos_id_seq OWNED BY public.partidos.id;


--
-- TOC entry 250 (class 1259 OID 16585)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 16592)
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id character varying(255) NOT NULL,
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
-- TOC entry 252 (class 1259 OID 16602)
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
-- TOC entry 5218 (class 0 OID 0)
-- Dependencies: 252
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- TOC entry 253 (class 1259 OID 16603)
-- Name: personas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personas (
    cedula character varying(10) NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    edad integer,
    estatura numeric(4,2),
    telefono character varying(20),
    foto character varying(255),
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email character varying(255),
    fecha_nacimiento date,
    password character varying(255),
    rol character varying(255) DEFAULT 'usuario'::character varying NOT NULL,
    estado character varying(255) DEFAULT 'activo'::character varying NOT NULL
);


ALTER TABLE public.personas OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 16615)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 16623)
-- Name: torneos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.torneos (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    deporte_id bigint NOT NULL,
    categoria_id bigint NOT NULL,
    fecha_inicio timestamp(0) without time zone,
    fecha_fin timestamp(0) without time zone,
    ubicacion character varying(255),
    estado character varying(255) DEFAULT 'Inscripcion'::character varying NOT NULL,
    creado_por character(10),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT torneos_estado_check CHECK (((estado)::text = ANY (ARRAY[('Inscripcion'::character varying)::text, ('Activo'::character varying)::text, ('Finalizado'::character varying)::text])))
);


ALTER TABLE public.torneos OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 16635)
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
-- TOC entry 5219 (class 0 OID 0)
-- Dependencies: 256
-- Name: torneos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.torneos_id_seq OWNED BY public.torneos.id;


--
-- TOC entry 257 (class 1259 OID 16636)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 16645)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5220 (class 0 OID 0)
-- Dependencies: 258
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 259 (class 1259 OID 16646)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    cedula character(10) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    rol character varying(255) DEFAULT 'usuario'::character varying NOT NULL,
    token_sesion character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    estado boolean DEFAULT true NOT NULL,
    CONSTRAINT usuarios_rol_check CHECK (((rol)::text = ANY (ARRAY[('admin'::character varying)::text, ('entrenador'::character varying)::text, ('jugador'::character varying)::text, ('arbitro'::character varying)::text, ('usuario'::character varying)::text, ('representante'::character varying)::text])))
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 4868 (class 2604 OID 16659)
-- Name: auditoria id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria ALTER COLUMN id SET DEFAULT nextval('public.auditoria_id_seq'::regclass);


--
-- TOC entry 4870 (class 2604 OID 16660)
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);


--
-- TOC entry 4871 (class 2604 OID 16661)
-- Name: configuracion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion ALTER COLUMN id SET DEFAULT nextval('public.configuracion_id_seq'::regclass);


--
-- TOC entry 4874 (class 2604 OID 16662)
-- Name: deportes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportes ALTER COLUMN id SET DEFAULT nextval('public.deportes_id_seq'::regclass);


--
-- TOC entry 4875 (class 2604 OID 16663)
-- Name: equipos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos ALTER COLUMN id SET DEFAULT nextval('public.equipos_id_seq'::regclass);


--
-- TOC entry 4876 (class 2604 OID 16664)
-- Name: estadisticas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estadisticas ALTER COLUMN id SET DEFAULT nextval('public.estadisticas_id_seq'::regclass);


--
-- TOC entry 4878 (class 2604 OID 16665)
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- TOC entry 4880 (class 2604 OID 16666)
-- Name: galeria id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.galeria ALTER COLUMN id SET DEFAULT nextval('public.galeria_id_seq'::regclass);


--
-- TOC entry 4883 (class 2604 OID 16667)
-- Name: inscripciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones ALTER COLUMN id SET DEFAULT nextval('public.inscripciones_id_seq'::regclass);


--
-- TOC entry 4888 (class 2604 OID 16668)
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- TOC entry 4892 (class 2604 OID 16669)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 16670)
-- Name: noticias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.noticias ALTER COLUMN id SET DEFAULT nextval('public.noticias_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 16671)
-- Name: partidos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidos ALTER COLUMN id SET DEFAULT nextval('public.partidos_id_seq'::regclass);


--
-- TOC entry 4900 (class 2604 OID 16672)
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- TOC entry 4903 (class 2604 OID 16673)
-- Name: torneos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.torneos ALTER COLUMN id SET DEFAULT nextval('public.torneos_id_seq'::regclass);


--
-- TOC entry 4905 (class 2604 OID 16674)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5159 (class 0 OID 16389)
-- Dependencies: 219
-- Data for Name: arbitros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.arbitros (cedula, experiencia, created_at, updated_at, especialidad, estado) FROM stdin;
1500511231	6	2026-02-05 15:00:42	2026-02-05 15:17:05	\N	Certificado
\.


--
-- TOC entry 5160 (class 0 OID 16395)
-- Dependencies: 220
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditoria (id, "timestamp", usuario_cedula, accion, entidad, entidad_id, detalle, created_at, updated_at) FROM stdin;
1	2026-02-05 21:11:56	0102030405	ACTUALIZAR	Usuario	1500982782	Actualización de usuario: winston@ueb.edu.ec (Rol: usuario, Estado: Activo)	2026-02-05 21:11:56	2026-02-05 21:11:56
2	2026-02-05 21:22:09	0102030405	ACTUALIZAR	Usuario	0921345678	Actualización de usuario: user0921345678@ueb.edu.ec (Rol: jugador, Estado: Inactivo)	2026-02-05 21:22:09	2026-02-05 21:22:09
3	2026-02-06 02:34:26	0102030405	ACTUALIZAR	Configuracion	general	Actualización de configuración general.	2026-02-06 02:34:26	2026-02-06 02:34:26
4	2026-02-06 02:34:26	0102030405	ACTUALIZAR	Configuracion	operacional	Actualización de configuración operacional.	2026-02-06 02:34:26	2026-02-06 02:34:26
5	2026-02-06 02:34:26	0102030405	ACTUALIZAR	Configuracion	seguridad	Actualización de configuración de seguridad.	2026-02-06 02:34:26	2026-02-06 02:34:26
6	2026-02-06 02:41:48	0102030405	ACTUALIZAR	Configuracion	general	Actualización de configuración general.	2026-02-06 02:41:48	2026-02-06 02:41:48
7	2026-02-06 02:41:48	0102030405	ACTUALIZAR	Configuracion	operacional	Actualización de configuración operacional.	2026-02-06 02:41:48	2026-02-06 02:41:48
8	2026-02-06 02:41:48	0102030405	ACTUALIZAR	Configuracion	seguridad	Actualización de configuración de seguridad.	2026-02-06 02:41:48	2026-02-06 02:41:48
9	2026-02-06 02:49:37	0102030405	ACTUALIZAR	Configuracion	general	Actualización de configuración general.	2026-02-06 02:49:37	2026-02-06 02:49:37
10	2026-02-06 02:49:37	0102030405	ACTUALIZAR	Configuracion	operacional	Actualización de configuración operacional.	2026-02-06 02:49:37	2026-02-06 02:49:37
11	2026-02-06 02:49:37	0102030405	ACTUALIZAR	Configuracion	seguridad	Actualización de configuración de seguridad.	2026-02-06 02:49:37	2026-02-06 02:49:37
12	2026-02-06 22:02:23	0302429733	LOGIN	Usuario	0302429733	Inicio de sesión de usuario: luis@ueb.edu.ec	2026-02-06 22:02:23	2026-02-06 22:02:23
13	2026-02-07 23:55:37	0302429733	LOGIN	Usuario	0302429733	Inicio de sesión de usuario: luis@ueb.edu.ec	2026-02-07 23:55:37	2026-02-07 23:55:37
14	2026-02-08 12:02:58	0302429733	LOGIN	Usuario	0302429733	Inicio de sesión de usuario: luis@ueb.edu.ec	2026-02-08 12:02:58	2026-02-08 12:02:58
15	2026-02-08 13:29:52	0102030405	LOGIN	Usuario	0102030405	Inicio de sesión de usuario: admin@ueb.edu.ec	2026-02-08 13:29:52	2026-02-08 13:29:52
16	2026-02-08 13:35:34	0102030405	LOGIN	Usuario	0102030405	Inicio de sesión de usuario: admin@ueb.edu.ec	2026-02-08 13:35:34	2026-02-08 13:35:34
17	2026-02-08 13:35:56	0302429733	LOGIN	Usuario	0302429733	Inicio de sesión de usuario: luis@ueb.edu.ec	2026-02-08 13:35:56	2026-02-08 13:35:56
18	2026-02-09 00:32:50	0302429733	LOGIN	Usuario	0302429733	Inicio de sesión de usuario: luis@ueb.edu.ec	2026-02-09 00:32:50	2026-02-09 00:32:50
19	2026-02-09 12:15:45	0302429733	ACTUALIZAR_FOTO_PERFIL	Persona	0302429733	Foto de perfil de representante actualizada	2026-02-09 12:15:45	2026-02-09 12:15:45
20	2026-02-09 12:16:08	0302429733	ACTUALIZAR_FOTO_PERFIL	Persona	0302429733	Foto de perfil de representante actualizada	2026-02-09 12:16:08	2026-02-09 12:16:08
21	2026-02-09 12:16:18	0302429733	ACTUALIZAR_FOTO_PERFIL	Persona	0302429733	Foto de perfil de representante actualizada	2026-02-09 12:16:18	2026-02-09 12:16:18
22	2026-02-09 12:16:22	0302429733	ACTUALIZAR_PERFIL	Usuario	0302429733	Perfil de representante actualizado: 	2026-02-09 12:16:22	2026-02-09 12:16:22
23	2026-02-09 12:17:37	0302429733	ACTUALIZAR_FOTO_PERFIL	Persona	0302429733	Foto de perfil de representante actualizada	2026-02-09 12:17:37	2026-02-09 12:17:37
24	2026-02-09 12:19:49	0302429733	ACTUALIZAR_FOTO_PERFIL	Persona	0302429733	Foto de perfil de representante actualizada	2026-02-09 12:19:49	2026-02-09 12:19:49
25	2026-02-09 12:53:30	0302429733	ACTUALIZAR_FOTO_PERFIL	Persona	0302429733	Foto de perfil de representante actualizada	2026-02-09 12:53:30	2026-02-09 12:53:30
26	2026-02-09 13:00:03	0302429733	ACTUALIZAR_FOTO_PERFIL	Persona	0302429733	Foto de perfil de representante actualizada	2026-02-09 13:00:03	2026-02-09 13:00:03
27	2026-02-09 13:09:44	1500511231	LOGIN	Usuario	1500511231	Inicio de sesión de usuario: bethy@ueb.edu.ec	2026-02-09 13:09:44	2026-02-09 13:09:44
28	2026-02-09 13:13:09	1500982782	LOGIN	Usuario	1500982782	Inicio de sesión de usuario: winston@ueb.edu.ec	2026-02-09 13:13:09	2026-02-09 13:13:09
29	2026-02-09 13:13:57	1500511231	LOGIN	Usuario	1500511231	Inicio de sesión de usuario: bethy@ueb.edu.ec	2026-02-09 13:13:57	2026-02-09 13:13:57
30	2026-02-09 13:30:21	1500511231	ACTUALIZAR_FOTO_PERFIL	Persona	1500511231	Foto de perfil de árbitro actualizada	2026-02-09 13:30:21	2026-02-09 13:30:21
31	2026-02-09 13:38:41	1500511231	LOGIN	Usuario	1500511231	Inicio de sesión de usuario: bethy@ueb.edu.ec	2026-02-09 13:38:41	2026-02-09 13:38:41
32	2026-02-09 13:39:04	1500982782	LOGIN	Usuario	1500982782	Inicio de sesión de usuario: winston@ueb.edu.ec	2026-02-09 13:39:04	2026-02-09 13:39:04
33	2026-02-09 13:45:47	1500982782	LOGIN	Usuario	1500982782	Inicio de sesión de usuario: winston@ueb.edu.ec	2026-02-09 13:45:47	2026-02-09 13:45:47
34	2026-02-09 13:46:10	1500982782	ACTUALIZAR_FOTO_PERFIL	Persona	1500982782	Foto de perfil de jugador actualizada	2026-02-09 13:46:10	2026-02-09 13:46:10
35	2026-02-09 13:47:23	1500982782	ACTUALIZAR_FOTO_PERFIL	Persona	1500982782	Foto de perfil de jugador actualizada	2026-02-09 13:47:23	2026-02-09 13:47:23
36	2026-02-09 14:09:17	1500982782	LOGIN	Usuario	1500982782	Inicio de sesión de usuario: winston@ueb.edu.ec	2026-02-09 14:09:17	2026-02-09 14:09:17
37	2026-02-09 14:09:22	0102030405	LOGIN	Usuario	0102030405	Inicio de sesión de usuario: admin@ueb.edu.ec	2026-02-09 14:09:22	2026-02-09 14:09:22
38	2026-02-09 14:09:53	0102030405	LOGIN	Usuario	0102030405	Inicio de sesión de usuario: admin@ueb.edu.ec	2026-02-09 14:09:53	2026-02-09 14:09:53
39	2026-02-09 15:09:55	0102030405	ACTUALIZAR_FOTO_PERFIL	Persona	0102030405	Foto de perfil de jugador actualizada	2026-02-09 15:09:55	2026-02-09 15:09:55
40	2026-02-09 15:15:48	0102030405	ACTUALIZAR	Configuracion	logo	Actualización del logo del sistema.	2026-02-09 15:15:48	2026-02-09 15:15:48
41	2026-02-09 15:22:34	0102030405	LOGIN	Usuario	0102030405	Inicio de sesión de usuario: admin@ueb.edu.ec	2026-02-09 15:22:34	2026-02-09 15:22:34
42	2026-02-09 20:20:33	0102030405	LOGIN	Usuario	0102030405	Inicio de sesión de usuario: admin@ueb.edu.ec	2026-02-09 20:20:33	2026-02-09 20:20:33
43	2026-02-09 20:20:51	0302429733	LOGIN	Usuario	0302429733	Inicio de sesión de usuario: luis@ueb.edu.ec	2026-02-09 20:20:51	2026-02-09 20:20:51
44	2026-02-10 13:28:30	0102030405	LOGIN	Usuario	0102030405	Inicio de sesión de usuario: admin@ueb.edu.ec	2026-02-10 13:28:30	2026-02-10 13:28:30
45	2026-02-10 13:32:07	0102030405	LOGIN	Usuario	0102030405	Inicio de sesión de usuario: admin@ueb.edu.ec	2026-02-10 13:32:07	2026-02-10 13:32:07
46	2026-02-12 03:07:19	0102030405	LOGIN	Usuario	0102030405	Inicio de sesión de usuario: admin@ueb.edu.ec	2026-02-12 03:07:19	2026-02-12 03:07:19
\.


--
-- TOC entry 5162 (class 0 OID 16406)
-- Dependencies: 222
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- TOC entry 5163 (class 0 OID 16414)
-- Dependencies: 223
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- TOC entry 5164 (class 0 OID 16422)
-- Dependencies: 224
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (id, nombre, descripcion, created_at, updated_at, deporte_id) FROM stdin;
2	Masculino	\N	\N	\N	\N
4	Mixto	\N	\N	\N	\N
5	Sub-18	\N	\N	\N	\N
6	Sub-20	\N	\N	\N	\N
7	Master	\N	\N	\N	\N
1	Libre	\N	2026-01-03 16:03:31	2026-01-03 16:03:31	\N
10	juvenil 2026	\N	2026-01-15 20:52:48	2026-01-15 20:52:48	\N
3	Femenino	\N	\N	2026-01-16 00:23:30	1
8	Juvenil	\N	2025-11-26 16:01:09	2026-01-16 00:32:45	3
\.


--
-- TOC entry 5166 (class 0 OID 16430)
-- Dependencies: 226
-- Data for Name: configuracion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracion (id, clave, valor, created_at, updated_at) FROM stdin;
1	nombre_sistema	Gestor Multideportivo UEB	2025-11-08 18:14:24	2025-11-08 18:14:24
2	version	1.0.0	2025-11-08 18:14:24	2025-11-08 18:14:24
4	operacional	{"maxEquiposPorTorneo":32,"defaultEstadoInscripcion":"Aprobado","diasMaximoParaProgramacion":15,"activarNotificacionesEmail":true}	2025-11-30 03:56:01	2025-11-30 03:56:01
5	seguridad	{"longitudMinimaContrasena":8,"rolUsuarioPorDefecto":"Invitado","forzar2FA":false}	2025-11-30 03:56:01	2025-11-30 03:56:01
3	general	{"nombreSistema":"Gestor de Torneos UEB","emailContacto":"contacto@ueb.edu.ec","logoUrl":"http:\\/\\/127.0.0.1:8000\\/storage\\/logos\\/yOD2fTEUk8d7LRmuxvwXJCpPLeusE0iHhb6mUHuB.png","timezone":"America\\/Guayaquil","registroAbierto":true}	2025-11-30 03:56:01	2026-02-09 15:15:48
\.


--
-- TOC entry 5168 (class 0 OID 16442)
-- Dependencies: 228
-- Data for Name: deportes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deportes (id, nombre, descripcion, created_at, updated_at) FROM stdin;
2	Vóley	Juego con balón y red central.	2025-11-08 18:14:23	2025-11-08 18:14:23
3	Básquet	Juego de balón y aro.	2025-11-08 18:14:23	2025-11-08 18:14:23
1	Fútbol	Deporte de equipo jugado con balón y dos porterías.	2026-01-03 16:03:31	2026-01-03 16:03:31
\.


--
-- TOC entry 5170 (class 0 OID 16450)
-- Dependencies: 230
-- Data for Name: equipos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipos (id, nombre, logo, torneo_id, deporte_id, categoria_id, created_at, updated_at, representante_cedula) FROM stdin;
5	Los Informaticos	\N	28	1	2	2025-12-18 18:17:43	2025-12-18 18:17:43	0302429733
7	The streamers	\N	28	3	3	2025-12-21 19:50:59	2025-12-21 19:50:59	0302429733
9	Barcelona SC	\N	1	1	1	2026-01-03 16:06:40	2026-01-03 16:06:40	\N
10	Emelec	\N	1	1	1	2026-01-03 16:06:41	2026-01-03 16:06:41	\N
11	Liga de Quito	\N	1	1	1	2026-01-03 16:06:41	2026-01-03 16:06:41	\N
12	Independiente del Valle	\N	1	1	1	2026-01-03 16:06:42	2026-01-03 16:06:42	\N
13	El Nacional	\N	1	1	1	2026-01-03 16:06:42	2026-01-03 16:06:42	\N
14	Delfín SC	\N	1	1	1	2026-01-03 16:06:42	2026-01-03 16:06:42	\N
15	Deportivo Cuenca	\N	1	1	1	2026-01-03 16:06:43	2026-01-03 16:06:43	\N
16	Mushuc Runa	\N	1	1	1	2026-01-03 16:06:43	2026-01-03 16:06:43	\N
17	Aucas	\N	1	1	1	2026-01-03 16:06:43	2026-01-03 16:06:43	\N
18	Universidad Católica	\N	1	1	1	2026-01-03 16:06:44	2026-01-03 16:06:44	\N
19	Macará	\N	1	1	1	2026-01-03 16:06:44	2026-01-03 16:06:44	\N
20	Técnico Universitario	\N	1	1	1	2026-01-03 16:06:45	2026-01-03 16:06:45	\N
\.


--
-- TOC entry 5172 (class 0 OID 16461)
-- Dependencies: 232
-- Data for Name: estadisticas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estadisticas (id, partido_id, jugador_cedula, tipo, minuto, observaciones, created_at, updated_at, goles) FROM stdin;
\.


--
-- TOC entry 5174 (class 0 OID 16474)
-- Dependencies: 234
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- TOC entry 5176 (class 0 OID 16488)
-- Dependencies: 236
-- Data for Name: galeria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.galeria (id, titulo, descripcion, imagen, created_at, updated_at) FROM stdin;
1	Cancha	Lugar hermoso	https://civideportes.com.co/wp-content/uploads/2019/08/Cancha-de-f%C3%BAtbol-11-768x512.jpg	2025-11-29 03:09:09	2025-11-29 03:11:57
\.


--
-- TOC entry 5178 (class 0 OID 16500)
-- Dependencies: 238
-- Data for Name: inscripciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inscripciones (id, equipo_id, torneo_id, fecha_inscripcion, created_at, updated_at, estado) FROM stdin;
2	5	28	2025-12-18	2025-12-18 18:17:43	2025-12-18 18:31:54	Aprobada
3	7	28	2025-12-21	2025-12-21 19:50:59	2025-12-21 20:30:23	Aprobada
\.


--
-- TOC entry 5180 (class 0 OID 16515)
-- Dependencies: 240
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- TOC entry 5181 (class 0 OID 16527)
-- Dependencies: 241
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- TOC entry 5183 (class 0 OID 16539)
-- Dependencies: 243
-- Data for Name: jugadores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jugadores (cedula, equipo_id, posicion, numero, carnet_qr, carnet_pdf, victorias, derrotas, empates, created_at, updated_at, qr_token, qr_generated_at, carrera, facultad) FROM stdin;
0921345678	9	Capitán	10	\N	\N	0	0	0	2026-01-03 16:06:40	2026-01-03 16:06:40	\N	\N	\N	\N
0912345679	10	Capitán	10	\N	\N	0	0	0	2026-01-03 16:06:41	2026-01-03 16:06:41	\N	\N	\N	\N
1712345678	11	Capitán	10	\N	\N	0	0	0	2026-01-03 16:06:41	2026-01-03 16:06:41	\N	\N	\N	\N
1723456789	12	Capitán	10	\N	\N	0	0	0	2026-01-03 16:06:42	2026-01-03 16:06:42	\N	\N	\N	\N
1701234567	13	Capitán	10	\N	\N	0	0	0	2026-01-03 16:06:42	2026-01-03 16:06:42	\N	\N	\N	\N
1309876543	14	Capitán	10	\N	\N	0	0	0	2026-01-03 16:06:42	2026-01-03 16:06:42	\N	\N	\N	\N
1803456782	16	Capitán	10	\N	\N	0	0	0	2026-01-03 16:06:43	2026-01-03 16:06:43	\N	\N	\N	\N
1715678901	17	Capitán	10	\N	\N	0	0	0	2026-01-03 16:06:43	2026-01-03 16:06:43	\N	\N	\N	\N
1718901234	18	Capitán	10	\N	\N	0	0	0	2026-01-03 16:06:44	2026-01-03 16:06:44	\N	\N	\N	\N
1801234567	19	Capitán	10	\N	\N	0	0	0	2026-01-03 16:06:44	2026-01-03 16:06:44	\N	\N	\N	\N
1809876543	20	Capitán	10	\N	\N	0	0	0	2026-01-03 16:06:45	2026-01-03 16:06:45	\N	\N	\N	\N
1718718396	5	Defensa	14	\N	\N	0	0	0	2025-12-19 17:50:56	2026-01-12 13:47:08	422a548c-073c-4d74-bb95-c872f730d7cc	2026-01-12 13:47:08	\N	\N
1500982782	7	Defensa	12	\N	\N	0	0	0	2025-12-25 15:00:24	2026-01-14 22:09:26	1e3b4bca-8035-419d-80b9-cdca2bedbad1	2025-12-29 14:31:19	\N	\N
1500511231	7	Delantero	13	\N	\N	0	0	0	2025-11-30 19:59:50	2026-01-14 22:10:15	beeb0dd0-96ab-4aa3-bcdd-0d933679c1fc	2025-12-13 19:16:14	\N	\N
0102345678	15	Capitán	10	\N	\N	0	0	0	2026-01-03 16:06:43	2026-02-05 12:14:21	eab90610-8e9b-42fd-83f8-ee93b994b1cd	2026-02-05 11:54:35	Software	Ciencias Administrativas
0202492310	5	Delantero	5	\N	\N	0	0	0	2025-12-20 21:33:04	2026-02-05 14:30:45	1e3464b4-0f81-4ecb-892a-7c427051321a	2026-02-05 14:30:45	\N	\N
\.


--
-- TOC entry 5184 (class 0 OID 16551)
-- Dependencies: 244
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
37	2026_01_15_161630_add_formato_to_torneos_table	2
38	2026_01_15_200720_fix_categorias_unique_index	2
39	2026_01_15_210245_add_deporte_id_to_categorias_table	3
40	2026_01_16_155119_add_hora_and_campo_to_partidos_table	4
41	2026_01_16_223405_add_fecha_nacimiento_to_personas_table	5
42	2026_01_17_131932_add_carrera_facultad_to_jugadores_table	6
43	2026_02_05_153036_add_especialidad_estado_to_arbitros_table	7
\.


--
-- TOC entry 5186 (class 0 OID 16558)
-- Dependencies: 246
-- Data for Name: noticias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.noticias (id, titulo, contenido, imagen, created_at, updated_at) FROM stdin;
1	Inauguracion Torneo	Con gran exito se inauguro el Campeonato Deportivo. contando con la Participacion de Docentes, Alumnos que cursan la Carrera de Software del año 2025	https://www.laprensa.com.ec/wp-content/uploads/2025/06/Universidad-Estatal-de-Bolivar-jugo-contra-Livianitos-FC-1024x682.webp	2026-01-15 19:24:39	2026-01-15 19:24:39
\.


--
-- TOC entry 5188 (class 0 OID 16570)
-- Dependencies: 248
-- Data for Name: partidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partidos (id, torneo_id, arbitro_cedula, equipo_local_id, equipo_visitante_id, fecha, marcador_local, marcador_visitante, estado, created_at, updated_at, hora, campo) FROM stdin;
1	1	\N	9	10	2026-01-14 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
3	1	\N	9	12	2026-01-13 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
4	1	\N	9	13	2026-01-15 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
5	1	\N	9	14	2026-01-22 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
6	1	\N	9	15	2026-01-24 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
7	1	\N	9	16	2026-01-12 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
8	1	\N	9	17	2026-01-22 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
9	1	\N	9	18	2026-01-27 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
10	1	\N	9	19	2026-01-21 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
11	1	\N	9	20	2026-01-22 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
12	1	\N	10	11	2026-01-15 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
13	1	\N	10	12	2026-01-10 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
14	1	\N	10	13	2026-01-29 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
15	1	\N	10	14	2026-01-28 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
17	1	\N	10	16	2026-01-08 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
18	1	\N	10	17	2026-01-12 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
19	1	\N	10	18	2026-01-25 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
20	1	\N	10	19	2026-01-10 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
21	1	\N	10	20	2026-01-30 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
22	1	\N	11	12	2026-01-20 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
23	1	\N	11	13	2026-01-12 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
24	1	\N	11	14	2026-01-21 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
25	1	\N	11	15	2026-01-27 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
26	1	\N	11	16	2026-01-22 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
27	1	\N	11	17	2026-01-28 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
29	1	\N	11	19	2026-01-28 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
30	1	\N	11	20	2026-01-11 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
31	1	\N	12	13	2026-01-07 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
32	1	\N	12	14	2026-01-10 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
33	1	\N	12	15	2026-01-12 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
34	1	\N	12	16	2026-01-30 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
35	1	\N	12	17	2026-01-14 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
36	1	\N	12	18	2026-01-06 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
37	1	\N	12	19	2026-01-22 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
39	1	\N	13	14	2026-01-22 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
40	1	\N	13	15	2026-01-25 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
41	1	\N	13	16	2026-01-06 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
42	1	\N	13	17	2026-01-22 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
44	1	\N	13	19	2026-01-21 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
45	1	\N	13	20	2026-01-29 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
46	1	\N	14	15	2026-01-14 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
47	1	\N	14	16	2026-01-24 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
48	1	\N	14	17	2026-01-21 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
49	1	\N	14	18	2026-01-13 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
50	1	\N	14	19	2026-01-13 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
51	1	\N	14	20	2026-01-23 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
52	1	\N	15	16	2026-01-18 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
53	1	\N	15	17	2026-01-18 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
54	1	\N	15	18	2026-01-12 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
55	1	\N	15	19	2026-01-30 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
57	1	\N	16	17	2026-01-09 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
58	1	\N	16	18	2026-01-07 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
59	1	\N	16	19	2026-01-26 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
60	1	\N	16	20	2026-01-09 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
61	1	\N	17	18	2026-01-15 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
62	1	\N	17	19	2026-01-15 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
63	1	\N	17	20	2026-01-28 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
64	1	\N	18	19	2026-01-28 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
65	1	\N	18	20	2026-01-19 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
66	1	\N	19	20	2026-01-21 16:07:34	0	0	Programado	2026-01-03 16:07:34	2026-01-03 16:07:34	\N	\N
67	1	\N	9	10	2026-01-06 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
68	1	\N	9	11	2026-01-20 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
69	1	\N	9	12	2026-01-10 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
70	1	\N	9	13	2026-01-09 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
71	1	\N	9	14	2026-01-15 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
43	1	\N	13	18	2026-01-15 00:00:00	0	0	Programado	2026-01-03 16:07:34	2026-01-15 17:35:49	\N	\N
56	1	\N	15	20	2026-01-04 16:07:34	4	3	Finalizado	2026-01-03 16:07:34	2026-01-15 17:37:52	\N	\N
72	1	\N	9	15	2026-01-20 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
73	1	\N	9	16	2026-01-23 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
74	1	\N	9	17	2026-01-13 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
75	1	\N	9	18	2026-01-06 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
76	1	\N	9	19	2026-01-05 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
77	1	\N	9	20	2026-01-29 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
78	1	\N	10	11	2026-01-21 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
79	1	\N	10	12	2026-01-19 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
80	1	\N	10	13	2026-01-22 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
81	1	\N	10	14	2026-01-31 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
82	1	\N	10	15	2026-01-31 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
83	1	\N	10	16	2026-01-10 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
84	1	\N	10	17	2026-01-24 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
85	1	\N	10	18	2026-01-24 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
86	1	\N	10	19	2026-01-06 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
88	1	\N	11	12	2026-01-15 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
89	1	\N	11	13	2026-01-15 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
90	1	\N	11	14	2026-01-16 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
91	1	\N	11	15	2026-01-27 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
92	1	\N	11	16	2026-01-23 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
94	1	\N	11	18	2026-01-19 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
95	1	\N	11	19	2026-01-07 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
96	1	\N	11	20	2026-01-30 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
97	1	\N	12	13	2026-01-26 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
98	1	\N	12	14	2026-01-21 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
99	1	\N	12	15	2026-01-17 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
100	1	\N	12	16	2026-01-28 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
101	1	\N	12	17	2026-01-28 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
102	1	\N	12	18	2026-01-13 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
103	1	\N	12	19	2026-01-16 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
104	1	\N	12	20	2026-01-07 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
105	1	\N	13	14	2026-01-05 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
106	1	\N	13	15	2026-01-17 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
107	1	\N	13	16	2026-01-27 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
108	1	\N	13	17	2026-01-29 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
109	1	\N	13	18	2026-01-30 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
110	1	\N	13	19	2026-01-28 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
111	1	\N	13	20	2026-01-06 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
112	1	\N	14	15	2026-01-14 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
113	1	\N	14	16	2026-01-23 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
114	1	\N	14	17	2026-01-20 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
115	1	\N	14	18	2026-01-08 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
116	1	\N	14	19	2026-01-16 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
117	1	\N	14	20	2026-01-16 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
118	1	\N	15	16	2026-01-05 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
119	1	\N	15	17	2026-01-12 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
121	1	\N	15	19	2026-01-13 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
122	1	\N	15	20	2026-01-21 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
123	1	\N	16	17	2026-01-24 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
124	1	\N	16	18	2026-01-07 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
125	1	\N	16	19	2026-01-25 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
126	1	\N	16	20	2026-01-23 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
128	1	\N	17	19	2026-01-04 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
129	1	\N	17	20	2026-01-18 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
130	1	\N	18	19	2026-01-19 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
132	1	\N	19	20	2026-01-05 16:12:04	0	0	Programado	2026-01-03 16:12:04	2026-01-03 16:12:04	\N	\N
93	1	\N	11	17	2026-02-01 16:12:04	4	1	Finalizado	2026-01-03 16:12:04	2026-01-03 21:15:47	\N	\N
131	1	\N	18	20	2026-02-01 16:12:04	2	1	Finalizado	2026-01-03 16:12:04	2026-01-07 02:59:24	\N	\N
38	1	\N	12	20	2026-02-01 16:07:34	1	0	Finalizado	2026-01-03 16:07:34	2026-01-14 14:21:21	\N	\N
87	1	\N	10	20	2026-01-14 00:00:00	4	3	Finalizado	2026-01-03 16:12:04	2026-01-16 01:25:56	\N	\N
134	1	\N	9	11	2026-01-22 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
135	1	\N	9	12	2026-01-29 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
136	1	\N	9	13	2026-01-17 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
137	1	\N	9	14	2026-01-31 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
138	1	\N	9	15	2026-01-25 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
139	1	\N	9	16	2026-01-24 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
2	1	\N	9	11	2026-01-15 00:00:00	0	1	Finalizado	2026-01-03 16:07:34	2026-01-16 15:08:02	\N	\N
140	1	\N	9	17	2026-01-25 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
141	1	\N	9	18	2026-01-19 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
143	1	\N	9	20	2026-01-29 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
146	1	\N	10	13	2026-01-23 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
147	1	\N	10	14	2026-01-21 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
150	1	\N	10	17	2026-01-26 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
152	1	\N	10	19	2026-01-30 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
153	1	\N	10	20	2026-01-27 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
154	1	\N	11	12	2026-01-29 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
157	1	\N	11	15	2026-01-21 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
158	1	\N	11	16	2026-01-23 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
163	1	\N	12	13	2026-01-22 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
164	1	\N	12	14	2026-01-26 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
165	1	\N	12	15	2026-01-31 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
166	1	\N	12	16	2026-01-31 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
169	1	\N	12	19	2026-01-26 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
170	1	\N	12	20	2026-01-17 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
172	1	\N	13	15	2026-01-31 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
173	1	\N	13	16	2026-01-17 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
175	1	\N	13	18	2026-01-30 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
176	1	\N	13	19	2026-01-25 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
177	1	\N	13	20	2026-01-29 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
178	1	\N	14	15	2026-01-30 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
179	1	\N	14	16	2026-01-20 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
181	1	\N	14	18	2026-01-19 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
184	1	\N	15	16	2026-01-30 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
191	1	\N	16	19	2026-01-21 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
195	1	\N	17	20	2026-01-31 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
197	1	\N	18	20	2026-02-01 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
198	1	\N	19	20	2026-01-19 13:37:01	0	0	Programado	2026-01-16 13:37:01	2026-01-16 13:37:01	\N	\N
199	28	\N	5	7	2026-01-27 19:58:08	0	0	Programado	2026-01-16 19:58:08	2026-01-16 19:58:08	\N	\N
189	1	\N	16	17	2026-01-16 00:00:00	3	0	En Juego	2026-01-16 13:37:01	2026-01-16 19:22:52	14:22:00	\N
174	1	\N	13	17	2026-01-16 00:00:00	0	0	En Juego	2026-01-16 13:37:01	2026-01-16 19:29:20	14:29:00	\N
144	1	\N	10	11	2026-02-01 13:37:01	0	0	En Juego	2026-01-16 13:37:01	2026-01-16 19:29:33	\N	\N
\.


--
-- TOC entry 5190 (class 0 OID 16585)
-- Dependencies: 250
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- TOC entry 5191 (class 0 OID 16592)
-- Dependencies: 251
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
76	App\\Models\\Usuario	102030405	auth_token	e3755c0e9012e0ff6eb551bc913b9ab65f9ca53b598c0373733771b98fbc1133	["*"]	\N	\N	2025-11-27 17:19:15	2025-11-27 17:19:15
358	App\\Models\\Usuario	1500470453	auth_token	8009180675bfbc6eaae55cf0ecfd152ee2c92ecf47e95ab612a94eb875338582	["*"]	2026-01-07 02:58:27	\N	2026-01-07 02:58:20	2026-01-07 02:58:27
372	App\\Models\\Usuario	0955038518	auth_token	d1665625d9f23f5aabf90c1db6b84217dff68dbbd5926999bc94aaa921e4c675	["*"]	2026-01-12 13:52:59	\N	2026-01-12 13:52:58	2026-01-12 13:52:59
393	App\\Models\\Usuario	1718718396	auth_token	0710ad171cdb2a19df0dfd1e80743de8ccb9a78392d49f40017b67a3bbf17113	["*"]	2026-01-16 16:34:06	\N	2026-01-16 16:34:05	2026-01-16 16:34:06
477	App\\Models\\Usuario	0302429733	auth_token	ec5c4032e3beb369a1386630923e4ae0c98893a6c8380d86737471acd4c2c2ff	["*"]	2026-02-10 13:28:24	\N	2026-02-09 20:20:51	2026-02-10 13:28:24
469	App\\Models\\Usuario	1500511231	auth_token	9e4655698a3220ffdfa51ecec57eb79fb24be98485aac46985b847f1bea289fd	["*"]	2026-02-09 13:38:43	\N	2026-02-09 13:38:41	2026-02-09 13:38:43
472	App\\Models\\Usuario	1500982782	auth_token	2a7b3dc512ee22ce4886a1187e506115c5a15aeff54cd8af01903b9ec23ec051	["*"]	2026-02-09 14:09:21	\N	2026-02-09 14:09:17	2026-02-09 14:09:21
480	App\\Models\\Usuario	0102030405	auth_token	527c20f953e7d4279402ab244de13d2741ad66fe42da8b13becccbab21d110d2	["*"]	2026-02-12 03:07:37	\N	2026-02-12 03:07:19	2026-02-12 03:07:37
\.


--
-- TOC entry 5193 (class 0 OID 16603)
-- Dependencies: 253
-- Data for Name: personas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personas (cedula, nombres, apellidos, edad, estatura, telefono, foto, created_at, updated_at, email, fecha_nacimiento, password, rol, estado) FROM stdin;
1500982671	Stalin	Alvarado	26	1.59	0989213708	fotos/BKjKyueGgVpluUZMd5V3VUPlIj47hIbM4CHlDr0Z.jpg	2025-11-09 00:15:35	2025-11-09 00:15:35	\N	\N	\N	usuario	activo
1500982689	Maria		\N	\N	\N	\N	2025-11-10 19:19:13	2025-11-10 19:19:13	\N	\N	\N	usuario	activo
123456789	Raul	Lopez	\N	\N	\N	\N	2025-11-18 14:59:14	2025-11-18 14:59:14	\N	\N	\N	usuario	activo
1500982673	Raul	Lopez	\N	\N	\N	\N	2025-11-18 15:02:16	2025-11-18 15:02:16	\N	\N	\N	usuario	activo
1500470453	Saul	Alvarado	\N	\N	\N	\N	2025-12-15 00:58:41	2025-12-15 00:58:41	\N	\N	$2y$12$7WC2c63zaUao8PyTlNp7N.2S/hy8nWyQOChtLTwws1wrcwtvJ8OEW	representante	activo
1718718396	Anthony	Pozo	\N	\N	\N	\N	2025-12-19 17:48:57	2025-12-19 17:48:57	\N	\N	$2y$12$G45386laC3O78Yde8BT7/.YpY1gwXeu872sqsmlbLntsYPnDXmxQ6	usuario	activo
0921345678	Capitán	Barcelona SC	\N	\N	\N	\N	2026-01-03 15:58:59	2026-01-03 15:58:59	user0921345678@ueb.edu.ec	\N	$2y$12$k78.faswCD4dyXZAK6JDAeHmpyukhIPQH7qK8xN2BXof.jPh.1mga	jugador	inactivo
0912345679	Capitán	Emelec	\N	\N	\N	\N	2026-01-03 11:06:41	2026-01-03 11:06:41	user0912345679@ueb.edu.ec	\N	$2y$12$FaE3QPKf.QH1zzlEti/Gk.pbVf557UfoCYcCiHEMAD1bf21wTEwwm	jugador	activo
1712345678	Capitán	Liga de Quito	\N	\N	\N	\N	2026-01-03 11:06:41	2026-01-03 11:06:41	user1712345678@ueb.edu.ec	\N	$2y$12$uveAeXuj7FrdFRd2u5IOtujFHa0eA3QTEqSESsVKYZ3qVQ9ZMLnRW	jugador	activo
1723456789	Capitán	Independiente del Valle	\N	\N	\N	\N	2026-01-03 11:06:42	2026-01-03 11:06:42	user1723456789@ueb.edu.ec	\N	$2y$12$07emr8Dn0hv6VtdB2agmjOoQWU8RWJ/QwTeVeQ258Yk5T7OmAZhaK	jugador	activo
1701234567	Capitán	El Nacional	33	1.75	0998765432	\N	2025-11-09 23:32:45	2025-11-09 23:32:45	user1701234567@ueb.edu.ec	\N	$2y$12$.OADow.RQyJzbY0kxTZnbO1uQyAE9vkVqSIYEKuPhCe/knCyQ5f8a	jugador	activo
1309876543	Capitán	Delfín SC	\N	\N	\N	\N	2026-01-03 11:06:42	2026-01-03 11:06:42	user1309876543@ueb.edu.ec	\N	$2y$12$0FH0eE6GvuFc/W9l1bgqqucCvstENy86QLHEqhg8Tjr.FHTPEglwi	jugador	activo
1803456782	Capitán	Mushuc Runa	\N	\N	\N	\N	2026-01-03 11:06:43	2026-01-03 11:06:43	user1803456782@ueb.edu.ec	\N	$2y$12$LbsjrZv5/mfGmBUgLpQ2EeykvM8725KxNqdFl1cOft5SrYvI8M94S	jugador	activo
1715678901	Capitán	Aucas	\N	\N	\N	\N	2026-01-03 11:06:44	2026-01-03 11:06:44	user1715678901@ueb.edu.ec	\N	$2y$12$LWzahYBSpyHXfT9z6Qi7DOur0JQ9l2zmNnUMV4KldfR8oq2Z2rLRu	jugador	activo
1718901234	Capitán	Universidad Católica	\N	\N	\N	\N	2026-01-03 11:06:44	2026-01-03 11:06:44	user1718901234@ueb.edu.ec	\N	$2y$12$rgF8CI.iJ0PX9XHo1884f.kVpEtCBXg/tpYSqomZ5rnBP3j54R.Ja	jugador	activo
1801234567	Capitán	Macará	\N	\N	\N	\N	2026-01-03 11:06:44	2026-01-03 11:06:44	user1801234567@ueb.edu.ec	\N	$2y$12$5bPDGfxe90HZ8TMfN2Y/n.pqYxFoxR5a/2pnLrcC4NonppKUzC9HW	jugador	activo
1809876543	Capitán	Técnico Universitario	\N	\N	\N	\N	2026-01-03 11:06:45	2026-01-03 11:06:45	user1809876543@ueb.edu.ec	\N	$2y$12$wLQvM8IHJUZwZHnUQRP4BefU1ta3wcs/H/Nje3/2wH.8iAfBP0mxG	jugador	activo
0955038518	Mily	Vendoval	\N	\N	\N	\N	2026-01-12 13:52:42	2026-01-12 13:52:42	\N	\N	$2y$12$qCcjd4ZU.QSmo5EOHuAU1OIZ94ArjRMBkPLlMLHKfuGyK64Mtu5pC	usuario	activo
0102345678	Capitán	Deportivo Cuenca	\N	\N	\N	fotos/capitan-deportivo-cuenca-1770301661.jpg	2026-01-03 11:06:43	2026-02-05 14:27:42	user0102345678@ueb.edu.ec	\N	$2y$12$4X8nHmhi95jsrorjUzUW7.L6GEMy3Vy4loH9Y04Xqq/j.zy73hx6W	jugador	activo
0202492310	Aldair	Muyulema	\N	\N	0918223712	fotos/aldair-muyulema-1770301857.jpg	2025-12-20 21:33:04	2026-02-05 14:30:59	aldair@ueb.edu.ec	\N	\N	usuario	activo
0302429733	Luis	Duy	\N	\N	\N	perfiles/perfil_0302429733_4c7d949f-906e-4ff8-add4-0780fe275ba3.jpg	2025-12-18 14:14:25	2026-02-09 13:00:03	luis@ueb.edu.ec	\N	$2y$12$oGi146qP/5sxT3DALc8yFOt2jD.fqKVTujAfEYjvnKuMHbrcZRljW	representante	activo
1500511231	Bethy	Chongo	\N	\N	0989213708	perfiles/perfil_1500511231_2b4aa3c3-1522-4c2c-baf9-664f00763528.jpg	2025-11-30 17:58:13	2026-02-09 13:30:21	bethy@ueb.edu.ec	\N	$2y$12$Ggnjj2Ei8hj1bCTuwFvdI.tIiEU9wjD6nB3WQOfPmRTKgHemexfpG	arbitro	activo
1500982782	Winston	Alvarado	\N	\N	\N	perfiles/perfil_jugador_1500982782_66479a8f-a79f-41cd-8267-3fd93c185be4.jpg	2025-12-24 02:53:37	2026-02-09 13:47:23	winston@ueb.edu.ec	\N	$2y$12$pVjLg.UEhIP3iAXzDtviE.Kp8yjHOJ0g1Yr8r10u/b0cHz4iNSxhW	usuario	activo
0102030405	Henry	Administrador	\N	\N	\N	perfiles/perfil_jugador_0102030405_c051ab89-b287-4699-91db-9df483c2a8a9.jpg	2025-11-27 14:45:04	2026-02-09 15:09:55	admin@ueb.edu.ec	\N	$2y$12$c6jFhoECiqfrKMLM2qBAC.6CK0.Y8dcatrOKuFyEQbpD7EogncPca	admin	activo
\.


--
-- TOC entry 5194 (class 0 OID 16615)
-- Dependencies: 254
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
zMiv8UAK4eEUpUCQnpq958cG19K01qxBOxHbAozT	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoidTBneUdjcmdpelpSWGU3dHo0a2RpZHNWalZ6Q043aHpFdGRmMmd5WCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hZG1pbi9qdWdhZG9yZXMiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=	1768660700
5E7TnKWz906B5X63ZdRqbPo9CmbO3gf3B8OSrh1p	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiUTMwWlZFZ2twcTNkNm1UNDNWVDVyT3gyMDBaWnU1akQ0V3lCTEV5ZSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC8ud2VsbC1rbm93bi9hcHBzcGVjaWZpYy9jb20uY2hyb21lLmRldnRvb2xzLmpzb24iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=	1768535694
b9Bpohjk2WyAg6KH4wgLfxUpZFgeP8kEN4eGwrzc	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiUFN3Vm5CQ3Y3a3JSWm90TEdsamRkQ2JhVXVabnVvaVlSbkdLM05IUSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzY6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hZG1pbi9wYXJ0aWRvcyI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1768568917
smVqKEtkAQ7uZL2wQYI7dcfDls257yJdjDu7JaUf	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoicWNGVFZNWnE4R0FybzVDcFpRV0xKWDdscUU5SEJKY0ZMU2hPeUlPNCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC8ud2VsbC1rbm93bi9hcHBzcGVjaWZpYy9jb20uY2hyb21lLmRldnRvb2xzLmpzb24iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=	1768568920
VT6MSzHYsrRDRVgwwFJmelFQM3OKLAgFaCoeG970	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiRUdyU1JmQVpudGkzOFVNTXhQWGdrdEIxUGJUdTNlbXFBdWs5YVp5NSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC8ud2VsbC1rbm93bi9hcHBzcGVjaWZpYy9jb20uY2hyb21lLmRldnRvb2xzLmpzb24iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=	1768590876
pipFxCBl8ZI6dXo3IAimn8Y1zSBJgP2mgOYiQkcc	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiejA5UERpQmxuRnNNRlowUW9FVXU1Y3VGeHQ3UHhxdDVBVVRQUUcyMCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC8ud2VsbC1rbm93bi9hcHBzcGVjaWZpYy9jb20uY2hyb21lLmRldnRvb2xzLmpzb24iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=	1768601811
e5XRH90QRVG48vEGMwY0564YzuyMoWXX0nPHOhaf	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiUVpybDRBZDE5MEFSU1htVHVuMGZuekRoM09ZYXJoWndzOGd3aFFLVCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hZG1pbi9qdWdhZG9yZXMiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=	1768631006
ukVZlSuRbmgVI5N71gYxbovRxDjxfdmIbcRFijsl	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiMlJlWU1rV3NwZllDNlNTejVOcjRJY29GMTNpaFR5WVpycGE1MzI5YyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzg6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9pbWcvbG9nby11ZWIuanBnIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19	1769452638
kulWxKw1adZ9CerwcTEwo7ny6p9YAvGMDUjDSCZY	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiWUZhRlZIVnc5NDFoSUpHdHh1dkpoZkxSeExrM3BGUnhGZUN3aDR1ayI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzg6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9pbWcvbG9nby11ZWIuanBnIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19	1769478689
IVAfQ43c5bx29gt7D9vIHrow6rXz91btXt171Jtm	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiWDJ6Tkx6N3FMcGEydEhkVElPWmJqT1phenU5UUxNT3RObDV1blZzUyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzg6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9pbWcvbG9nby11ZWIuanBnIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19	1769516176
lOZs67l7enydBIpgUp4dHSQSdwq0tSnapM3p8yQy	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiZ3NBZ1pkdm9uZk9RemhZNEFSU080bnFaNzB2ejR0dmZDS0JGMjFZViI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1769516305
\.


--
-- TOC entry 5195 (class 0 OID 16623)
-- Dependencies: 255
-- Data for Name: torneos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.torneos (id, nombre, descripcion, deporte_id, categoria_id, fecha_inicio, fecha_fin, ubicacion, estado, creado_por, created_at, updated_at) FROM stdin;
28	Software 2025	Torneo Relampago	1	3	2025-11-27 00:00:00	2025-12-16 00:00:00	\N	Activo	\N	2025-11-15 13:06:00	2025-12-15 00:21:11
29	Los Innovadores	\N	3	4	2025-12-16 00:00:00	2025-12-31 00:00:00	\N	Activo	\N	2025-12-15 00:23:48	2025-12-15 00:23:48
1	Torneo Apertura 2026	\N	1	1	2026-02-01 00:00:00	2026-06-01 00:00:00	\N	Activo	\N	2026-01-03 16:06:40	2026-01-03 16:06:40
\.


--
-- TOC entry 5197 (class 0 OID 16636)
-- Dependencies: 257
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at) FROM stdin;
1	Test User	test@example.com	2025-11-27 00:51:40	$2y$12$yS9O.G2eAVE8YBJozxAU1eHwnj1bjx0HsDwsg.Ofg/YvRJCVqiS.u	8ZnSjj2YP5	2025-11-27 00:51:41	2025-11-27 00:51:41
\.


--
-- TOC entry 5199 (class 0 OID 16646)
-- Dependencies: 259
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (cedula, email, password, rol, token_sesion, created_at, updated_at, estado) FROM stdin;
0912345679	user0912345679@ueb.edu.ec	$2y$12$FaE3QPKf.QH1zzlEti/Gk.pbVf557UfoCYcCiHEMAD1bf21wTEwwm	jugador	\N	\N	\N	t
1712345678	user1712345678@ueb.edu.ec	$2y$12$uveAeXuj7FrdFRd2u5IOtujFHa0eA3QTEqSESsVKYZ3qVQ9ZMLnRW	jugador	\N	\N	\N	t
1723456789	user1723456789@ueb.edu.ec	$2y$12$07emr8Dn0hv6VtdB2agmjOoQWU8RWJ/QwTeVeQ258Yk5T7OmAZhaK	jugador	\N	\N	\N	t
1701234567	user1701234567@ueb.edu.ec	$2y$12$.OADow.RQyJzbY0kxTZnbO1uQyAE9vkVqSIYEKuPhCe/knCyQ5f8a	jugador	\N	\N	\N	t
1309876543	user1309876543@ueb.edu.ec	$2y$12$0FH0eE6GvuFc/W9l1bgqqucCvstENy86QLHEqhg8Tjr.FHTPEglwi	jugador	\N	\N	\N	t
0102345678	user0102345678@ueb.edu.ec	$2y$12$4X8nHmhi95jsrorjUzUW7.L6GEMy3Vy4loH9Y04Xqq/j.zy73hx6W	jugador	\N	\N	\N	t
1803456782	user1803456782@ueb.edu.ec	$2y$12$LbsjrZv5/mfGmBUgLpQ2EeykvM8725KxNqdFl1cOft5SrYvI8M94S	jugador	\N	\N	\N	t
1715678901	user1715678901@ueb.edu.ec	$2y$12$LWzahYBSpyHXfT9z6Qi7DOur0JQ9l2zmNnUMV4KldfR8oq2Z2rLRu	jugador	\N	\N	\N	t
1718901234	user1718901234@ueb.edu.ec	$2y$12$rgF8CI.iJ0PX9XHo1884f.kVpEtCBXg/tpYSqomZ5rnBP3j54R.Ja	jugador	\N	\N	\N	t
1801234567	user1801234567@ueb.edu.ec	$2y$12$5bPDGfxe90HZ8TMfN2Y/n.pqYxFoxR5a/2pnLrcC4NonppKUzC9HW	jugador	\N	\N	\N	t
1809876543	user1809876543@ueb.edu.ec	$2y$12$wLQvM8IHJUZwZHnUQRP4BefU1ta3wcs/H/Nje3/2wH.8iAfBP0mxG	jugador	\N	\N	\N	t
0955038518	mily@ueb.edu.ec	$2y$12$qCcjd4ZU.QSmo5EOHuAU1OIZ94ArjRMBkPLlMLHKfuGyK64Mtu5pC	usuario	\N	2026-01-12 13:52:42	2026-01-12 13:54:23	t
1500511231	bethy@ueb.edu.ec	$2y$12$Ggnjj2Ei8hj1bCTuwFvdI.tIiEU9wjD6nB3WQOfPmRTKgHemexfpG	arbitro	\N	2025-11-30 23:18:16	2026-01-15 02:26:18	t
0102030405	admin@ueb.edu.ec	$2y$12$c6jFhoECiqfrKMLM2qBAC.6CK0.Y8dcatrOKuFyEQbpD7EogncPca	admin	\N	2025-11-27 14:45:06	2026-02-05 16:59:48	t
0302429733	luis@ueb.edu.ec	$2y$12$oGi146qP/5sxT3DALc8yFOt2jD.fqKVTujAfEYjvnKuMHbrcZRljW	representante	\N	2025-12-18 14:14:25	2026-02-05 17:00:09	t
1500470453	saul@ueb.edu.ec	$2y$12$7WC2c63zaUao8PyTlNp7N.2S/hy8nWyQOChtLTwws1wrcwtvJ8OEW	representante	\N	2025-12-15 00:58:42	2026-02-05 17:52:32	t
1718718396	pozo@ueb.edu.ec	$2y$12$G45386laC3O78Yde8BT7/.YpY1gwXeu872sqsmlbLntsYPnDXmxQ6	usuario	\N	2025-12-19 17:48:57	2026-02-05 18:54:40	t
1500982782	winston@ueb.edu.ec	$2y$12$pVjLg.UEhIP3iAXzDtviE.Kp8yjHOJ0g1Yr8r10u/b0cHz4iNSxhW	usuario	\N	2025-12-24 02:53:38	2026-02-05 21:11:56	t
0921345678	user0921345678@ueb.edu.ec	$2y$12$k78.faswCD4dyXZAK6JDAeHmpyukhIPQH7qK8xN2BXof.jPh.1mga	jugador	\N	2026-01-03 15:59:00	2026-02-05 21:22:09	f
\.


--
-- TOC entry 5221 (class 0 OID 0)
-- Dependencies: 221
-- Name: auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_id_seq', 46, true);


--
-- TOC entry 5222 (class 0 OID 0)
-- Dependencies: 225
-- Name: categorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_id_seq', 10, true);


--
-- TOC entry 5223 (class 0 OID 0)
-- Dependencies: 227
-- Name: configuracion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configuracion_id_seq', 5, true);


--
-- TOC entry 5224 (class 0 OID 0)
-- Dependencies: 229
-- Name: deportes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.deportes_id_seq', 3, true);


--
-- TOC entry 5225 (class 0 OID 0)
-- Dependencies: 231
-- Name: equipos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipos_id_seq', 20, true);


--
-- TOC entry 5226 (class 0 OID 0)
-- Dependencies: 233
-- Name: estadisticas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estadisticas_id_seq', 1, false);


--
-- TOC entry 5227 (class 0 OID 0)
-- Dependencies: 235
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- TOC entry 5228 (class 0 OID 0)
-- Dependencies: 237
-- Name: galeria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.galeria_id_seq', 1, true);


--
-- TOC entry 5229 (class 0 OID 0)
-- Dependencies: 239
-- Name: inscripciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inscripciones_id_seq', 3, true);


--
-- TOC entry 5230 (class 0 OID 0)
-- Dependencies: 242
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- TOC entry 5231 (class 0 OID 0)
-- Dependencies: 245
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 43, true);


--
-- TOC entry 5232 (class 0 OID 0)
-- Dependencies: 247
-- Name: noticias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.noticias_id_seq', 1, true);


--
-- TOC entry 5233 (class 0 OID 0)
-- Dependencies: 249
-- Name: partidos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partidos_id_seq', 199, true);


--
-- TOC entry 5234 (class 0 OID 0)
-- Dependencies: 252
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 480, true);


--
-- TOC entry 5235 (class 0 OID 0)
-- Dependencies: 256
-- Name: torneos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.torneos_id_seq', 30, true);


--
-- TOC entry 5236 (class 0 OID 0)
-- Dependencies: 258
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- TOC entry 4913 (class 2606 OID 16676)
-- Name: arbitros arbitros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arbitros
    ADD CONSTRAINT arbitros_pkey PRIMARY KEY (cedula);


--
-- TOC entry 4915 (class 2606 OID 16678)
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id);


--
-- TOC entry 4919 (class 2606 OID 16680)
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- TOC entry 4917 (class 2606 OID 16682)
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- TOC entry 4921 (class 2606 OID 16684)
-- Name: categorias categorias_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_nombre_unique UNIQUE (nombre);


--
-- TOC entry 4923 (class 2606 OID 16686)
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- TOC entry 4925 (class 2606 OID 16688)
-- Name: configuracion configuracion_clave_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion
    ADD CONSTRAINT configuracion_clave_unique UNIQUE (clave);


--
-- TOC entry 4927 (class 2606 OID 16690)
-- Name: configuracion configuracion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion
    ADD CONSTRAINT configuracion_pkey PRIMARY KEY (id);


--
-- TOC entry 4929 (class 2606 OID 16692)
-- Name: deportes deportes_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportes
    ADD CONSTRAINT deportes_nombre_unique UNIQUE (nombre);


--
-- TOC entry 4931 (class 2606 OID 16694)
-- Name: deportes deportes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportes
    ADD CONSTRAINT deportes_pkey PRIMARY KEY (id);


--
-- TOC entry 4933 (class 2606 OID 16696)
-- Name: equipos equipos_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_nombre_unique UNIQUE (nombre);


--
-- TOC entry 4935 (class 2606 OID 16698)
-- Name: equipos equipos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_pkey PRIMARY KEY (id);


--
-- TOC entry 4937 (class 2606 OID 16700)
-- Name: estadisticas estadisticas_jugador_cedula_partido_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estadisticas
    ADD CONSTRAINT estadisticas_jugador_cedula_partido_id_unique UNIQUE (jugador_cedula, partido_id);


--
-- TOC entry 4939 (class 2606 OID 16702)
-- Name: estadisticas estadisticas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estadisticas
    ADD CONSTRAINT estadisticas_pkey PRIMARY KEY (id);


--
-- TOC entry 4941 (class 2606 OID 16704)
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4943 (class 2606 OID 16706)
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- TOC entry 4945 (class 2606 OID 16708)
-- Name: galeria galeria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.galeria
    ADD CONSTRAINT galeria_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 2606 OID 16710)
-- Name: inscripciones inscripciones_equipo_id_torneo_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_equipo_id_torneo_id_unique UNIQUE (equipo_id, torneo_id);


--
-- TOC entry 4949 (class 2606 OID 16712)
-- Name: inscripciones inscripciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_pkey PRIMARY KEY (id);


--
-- TOC entry 4951 (class 2606 OID 16714)
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 16716)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4956 (class 2606 OID 16718)
-- Name: jugadores jugadores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugadores
    ADD CONSTRAINT jugadores_pkey PRIMARY KEY (cedula);


--
-- TOC entry 4958 (class 2606 OID 16720)
-- Name: jugadores jugadores_qr_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugadores
    ADD CONSTRAINT jugadores_qr_token_unique UNIQUE (qr_token);


--
-- TOC entry 4960 (class 2606 OID 16722)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4962 (class 2606 OID 16724)
-- Name: noticias noticias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.noticias
    ADD CONSTRAINT noticias_pkey PRIMARY KEY (id);


--
-- TOC entry 4964 (class 2606 OID 16726)
-- Name: partidos partidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidos
    ADD CONSTRAINT partidos_pkey PRIMARY KEY (id);


--
-- TOC entry 4966 (class 2606 OID 16728)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- TOC entry 4969 (class 2606 OID 16730)
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 16732)
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- TOC entry 4975 (class 2606 OID 16734)
-- Name: personas personas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_pkey PRIMARY KEY (cedula);


--
-- TOC entry 4978 (class 2606 OID 16736)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4981 (class 2606 OID 16738)
-- Name: torneos torneos_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.torneos
    ADD CONSTRAINT torneos_nombre_unique UNIQUE (nombre);


--
-- TOC entry 4983 (class 2606 OID 16740)
-- Name: torneos torneos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.torneos
    ADD CONSTRAINT torneos_pkey PRIMARY KEY (id);


--
-- TOC entry 4985 (class 2606 OID 16742)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 4987 (class 2606 OID 16744)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4989 (class 2606 OID 16746)
-- Name: usuarios usuarios_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_unique UNIQUE (email);


--
-- TOC entry 4991 (class 2606 OID 16748)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (cedula);


--
-- TOC entry 4954 (class 1259 OID 16749)
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- TOC entry 4967 (class 1259 OID 16750)
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- TOC entry 4972 (class 1259 OID 16751)
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- TOC entry 4973 (class 1259 OID 16752)
-- Name: personas_email_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX personas_email_unique ON public.personas USING btree (email) WHERE (email IS NOT NULL);


--
-- TOC entry 4976 (class 1259 OID 16753)
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- TOC entry 4979 (class 1259 OID 16754)
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- TOC entry 4992 (class 2606 OID 16755)
-- Name: arbitros arbitros_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arbitros
    ADD CONSTRAINT arbitros_cedula_foreign FOREIGN KEY (cedula) REFERENCES public.usuarios(cedula) ON DELETE CASCADE;


--
-- TOC entry 4993 (class 2606 OID 16760)
-- Name: auditoria auditoria_usuario_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_usuario_cedula_foreign FOREIGN KEY (usuario_cedula) REFERENCES public.usuarios(cedula) ON DELETE SET NULL;


--
-- TOC entry 4994 (class 2606 OID 16765)
-- Name: categorias categorias_deporte_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_deporte_id_foreign FOREIGN KEY (deporte_id) REFERENCES public.deportes(id) ON DELETE SET NULL;


--
-- TOC entry 4995 (class 2606 OID 16770)
-- Name: equipos equipos_categoria_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_categoria_id_foreign FOREIGN KEY (categoria_id) REFERENCES public.categorias(id);


--
-- TOC entry 4996 (class 2606 OID 16775)
-- Name: equipos equipos_deporte_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_deporte_id_foreign FOREIGN KEY (deporte_id) REFERENCES public.deportes(id);


--
-- TOC entry 4997 (class 2606 OID 16780)
-- Name: equipos equipos_torneo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_torneo_id_foreign FOREIGN KEY (torneo_id) REFERENCES public.torneos(id) ON DELETE CASCADE;


--
-- TOC entry 4998 (class 2606 OID 16785)
-- Name: estadisticas estadisticas_jugador_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estadisticas
    ADD CONSTRAINT estadisticas_jugador_cedula_foreign FOREIGN KEY (jugador_cedula) REFERENCES public.jugadores(cedula) ON DELETE CASCADE;


--
-- TOC entry 4999 (class 2606 OID 16790)
-- Name: estadisticas estadisticas_partido_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estadisticas
    ADD CONSTRAINT estadisticas_partido_id_foreign FOREIGN KEY (partido_id) REFERENCES public.partidos(id) ON DELETE CASCADE;


--
-- TOC entry 5000 (class 2606 OID 16795)
-- Name: inscripciones inscripciones_equipo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_equipo_id_foreign FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON DELETE CASCADE;


--
-- TOC entry 5001 (class 2606 OID 16800)
-- Name: inscripciones inscripciones_torneo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_torneo_id_foreign FOREIGN KEY (torneo_id) REFERENCES public.torneos(id) ON DELETE CASCADE;


--
-- TOC entry 5002 (class 2606 OID 16805)
-- Name: jugadores jugadores_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugadores
    ADD CONSTRAINT jugadores_cedula_foreign FOREIGN KEY (cedula) REFERENCES public.personas(cedula) ON DELETE CASCADE;


--
-- TOC entry 5003 (class 2606 OID 16810)
-- Name: jugadores jugadores_equipo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugadores
    ADD CONSTRAINT jugadores_equipo_id_foreign FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON DELETE SET NULL;


--
-- TOC entry 5004 (class 2606 OID 16815)
-- Name: partidos partidos_arbitro_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidos
    ADD CONSTRAINT partidos_arbitro_cedula_foreign FOREIGN KEY (arbitro_cedula) REFERENCES public.arbitros(cedula) ON DELETE SET NULL;


--
-- TOC entry 5005 (class 2606 OID 16820)
-- Name: partidos partidos_equipo_local_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidos
    ADD CONSTRAINT partidos_equipo_local_id_foreign FOREIGN KEY (equipo_local_id) REFERENCES public.equipos(id);


--
-- TOC entry 5006 (class 2606 OID 16825)
-- Name: partidos partidos_equipo_visitante_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidos
    ADD CONSTRAINT partidos_equipo_visitante_id_foreign FOREIGN KEY (equipo_visitante_id) REFERENCES public.equipos(id);


--
-- TOC entry 5007 (class 2606 OID 16830)
-- Name: partidos partidos_torneo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidos
    ADD CONSTRAINT partidos_torneo_id_foreign FOREIGN KEY (torneo_id) REFERENCES public.torneos(id) ON DELETE CASCADE;


--
-- TOC entry 5008 (class 2606 OID 16835)
-- Name: torneos torneos_categoria_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.torneos
    ADD CONSTRAINT torneos_categoria_id_foreign FOREIGN KEY (categoria_id) REFERENCES public.categorias(id);


--
-- TOC entry 5009 (class 2606 OID 16840)
-- Name: torneos torneos_creado_por_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.torneos
    ADD CONSTRAINT torneos_creado_por_foreign FOREIGN KEY (creado_por) REFERENCES public.usuarios(cedula) ON DELETE SET NULL;


--
-- TOC entry 5010 (class 2606 OID 16845)
-- Name: torneos torneos_deporte_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.torneos
    ADD CONSTRAINT torneos_deporte_id_foreign FOREIGN KEY (deporte_id) REFERENCES public.deportes(id) ON DELETE CASCADE;


--
-- TOC entry 5011 (class 2606 OID 16850)
-- Name: usuarios usuarios_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_cedula_foreign FOREIGN KEY (cedula) REFERENCES public.personas(cedula) ON DELETE CASCADE;


-- Completed on 2026-02-12 07:37:43

--
-- PostgreSQL database dump complete
--

