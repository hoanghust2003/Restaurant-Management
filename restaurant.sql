--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

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

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: batches_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.batches_status_enum AS ENUM (
    'available',
    'depleted',
    'expired',
    'expiring_soon',
    'damaged'
);


ALTER TYPE public.batches_status_enum OWNER TO postgres;

--
-- Name: financial_records_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.financial_records_type_enum AS ENUM (
    'income',
    'expense'
);


ALTER TYPE public.financial_records_type_enum OWNER TO postgres;

--
-- Name: order_items_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_items_status_enum AS ENUM (
    'waiting',
    'preparing',
    'done',
    'failed'
);


ALTER TYPE public.order_items_status_enum OWNER TO postgres;

--
-- Name: orders_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.orders_status_enum AS ENUM (
    'pending',
    'in_progress',
    'ready',
    'served',
    'completed',
    'canceled'
);


ALTER TYPE public.orders_status_enum OWNER TO postgres;

--
-- Name: payments_method_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payments_method_enum AS ENUM (
    'vnpay',
    'cash'
);


ALTER TYPE public.payments_method_enum OWNER TO postgres;

--
-- Name: tables_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tables_status_enum AS ENUM (
    'available',
    'occupied',
    'reserved',
    'cleaning'
);


ALTER TYPE public.tables_status_enum OWNER TO postgres;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'admin',
    'staff',
    'chef',
    'warehouse',
    'customer'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batches (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(250) NOT NULL,
    quantity double precision NOT NULL,
    remaining_quantity double precision NOT NULL,
    expiry_date date NOT NULL,
    price double precision NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    import_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    deleted_at timestamp without time zone,
    status public.batches_status_enum DEFAULT 'available'::public.batches_status_enum NOT NULL
);


ALTER TABLE public.batches OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: dish_ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dish_ingredients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    quantity double precision NOT NULL,
    dish_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.dish_ingredients OWNER TO postgres;

--
-- Name: dishes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dishes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    price double precision NOT NULL,
    image_url character varying(255),
    is_preparable boolean DEFAULT true NOT NULL,
    available boolean DEFAULT true NOT NULL,
    preparation_time integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    category_id uuid NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.dishes OWNER TO postgres;

--
-- Name: export_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.export_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    quantity double precision NOT NULL,
    export_id uuid NOT NULL,
    batch_id uuid NOT NULL,
    ingredient_id uuid NOT NULL
);


ALTER TABLE public.export_items OWNER TO postgres;

--
-- Name: financial_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.financial_records (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type public.financial_records_type_enum NOT NULL,
    amount double precision NOT NULL,
    description text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    related_import_id uuid,
    related_order_id uuid
);


ALTER TABLE public.financial_records OWNER TO postgres;

--
-- Name: ingredient_exports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredient_exports (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reason text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.ingredient_exports OWNER TO postgres;

--
-- Name: ingredient_imports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredient_imports (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_by uuid NOT NULL,
    supplier_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    note character varying(250)
);


ALTER TABLE public.ingredient_imports OWNER TO postgres;

--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    unit character varying(50) NOT NULL,
    threshold double precision NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    image_url character varying(255)
);


ALTER TABLE public.ingredients OWNER TO postgres;

--
-- Name: menu_dishes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_dishes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    menu_id uuid NOT NULL,
    dish_id uuid NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.menu_dishes OWNER TO postgres;

--
-- Name: menus; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menus (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    is_main boolean DEFAULT false NOT NULL
);


ALTER TABLE public.menus OWNER TO postgres;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
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
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    quantity integer NOT NULL,
    note text,
    status public.order_items_status_enum NOT NULL,
    prepared_at timestamp without time zone,
    order_id uuid NOT NULL,
    dish_id uuid NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    status public.orders_status_enum NOT NULL,
    total_price double precision NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    table_id uuid NOT NULL,
    user_id uuid,
    feedback character varying(500)
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "transactionId" character varying NOT NULL,
    order_id uuid NOT NULL,
    method public.payments_method_enum NOT NULL,
    error text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone,
    "orderId" uuid NOT NULL,
    "paymentMethod" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "paidAt" timestamp without time zone,
    amount integer NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: restaurants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    address text NOT NULL,
    phone character varying(20) NOT NULL,
    logo_url character varying,
    cover_image_url character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.restaurants OWNER TO postgres;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    contact_name character varying(255) NOT NULL,
    contact_phone character varying(20) NOT NULL,
    contact_email character varying(255) NOT NULL,
    address text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: tables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tables (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    capacity integer NOT NULL,
    status public.tables_status_enum DEFAULT 'available'::public.tables_status_enum NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.tables OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    avatar_url character varying,
    role public.users_role_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batches (id, name, quantity, remaining_quantity, expiry_date, price, created_at, import_id, ingredient_id, deleted_at, status) FROM stdin;
81725d5d-7345-4173-8824-3019854f7d75	Test batch	10	10	2025-07-14	50000	2025-06-14 23:22:55.778073	c0808d2d-85bc-4321-91a4-4d8047a63d0f	528400d9-7ad4-467b-924b-5dfc0e7d4c71	\N	available
1b3f477e-33c6-4709-9413-4e039fac65db	Test batch	10	10	2025-07-14	50000	2025-06-14 23:53:26.400638	f38e96e2-bf9b-4104-86b2-1902065652c4	528400d9-7ad4-467b-924b-5dfc0e7d4c71	\N	available
dd23f22b-55ee-4b2f-9048-388b7562fcbb	nhập mướp đắng	34	30	2025-03-06	300000	2025-05-31 12:22:29.829208	a86b0c5f-a2f4-4cf8-8b3f-cc8a153dbb55	00d7587a-8b0c-45cc-936e-3b15c657024a	\N	expired
eb1a3b3b-61d1-4a21-a7fd-c6359955f3dc	111 14062025	20	20	2025-06-19	400000	2025-06-14 23:27:11.195153	8ed4ac03-c40a-496b-8ccf-9ac23b8d25cd	ebfb67c5-3ce7-4383-b84c-279ea0886e18	\N	expired
48fd8da4-1f45-4f22-8cc3-56b2c2508076	8 15062025	5	5	2025-06-17	10000	2025-06-15 17:26:41.60733	6d3258fd-aee4-4e66-b290-d2d9bff2c255	00d7587a-8b0c-45cc-936e-3b15c657024a	\N	expired
02bf16d0-9f02-4363-94b6-0181117110f6	23 15062025	6	6	2025-06-19	5000	2025-06-15 17:26:41.614195	6d3258fd-aee4-4e66-b290-d2d9bff2c255	528400d9-7ad4-467b-924b-5dfc0e7d4c71	\N	expired
2180346d-e234-44ef-b8f1-0a966dd4dbac	123 30062025	40	28	2025-07-30	150000	2025-06-30 01:18:44.042271	6ae1b4be-1ae6-4f27-9b32-330e73748274	0404a47f-e788-47ff-aa9b-aab68c8d85af	\N	available
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, deleted_at) FROM stdin;
5bac7dc9-b563-4088-b45e-265072138a2b	cá	các loại cá	\N
9030a1b6-7f1a-4c5d-a8e5-8d7e0643aed1	Đỗ Văn Hoàng	fdsfgds	\N
447c3e85-bfd5-410f-926d-2bddbfec7b0f	Canh/Súp	Món ăn chứa nước	\N
9fd4c780-7bbc-418c-93f1-9a512855bc09	Món ăn nhiều đạm	Những món này có nhiều đạm như thịt, cá, ...	\N
ac311daa-fec6-49a5-95b4-2c3f2f94af4f	Rau củ	rau muống, cà chua, khoai tây, ...	\N
eed3090c-b68d-4857-ad16-c175634c755e	Cá	 Những món chứa cá	\N
0c5cac24-4eb8-49b8-a47f-6f47e42705dc	Món luộc	Gà luộc, Rau luộc, ...	\N
f669d0b6-1dc6-4450-acfc-784b4edbaf14	vdfger	dfv\n	2025-06-15 15:41:27.707511
004442ae-ef52-442b-8a3b-87af132ce5a4	nkknkjknl	nnnnn	2025-06-15 15:41:30.209671
\.


--
-- Data for Name: dish_ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dish_ingredients (id, quantity, dish_id, ingredient_id, deleted_at) FROM stdin;
87dbc4b7-9c9c-4fc3-9f4f-a10c30d3febe	2	2a88a6b3-b510-49da-ba73-0563e08a8d2e	ebfb67c5-3ce7-4383-b84c-279ea0886e18	2025-05-22 01:21:20.363258
5e810b97-ed9b-444f-9416-98d4699bf825	1	e665f294-78bb-4a5b-bb24-1c82ca74e092	ebfb67c5-3ce7-4383-b84c-279ea0886e18	2025-05-31 12:09:57.24297
30c94a74-5b32-4a30-87c4-433a5d11281c	1	ef0f430b-9e46-4fbd-96a5-f93f138f599a	14f68c8b-b34d-4dcf-962c-b897f9324a12	\N
30b47ad0-ce57-431a-8b36-7b3078613fdd	3	ef0f430b-9e46-4fbd-96a5-f93f138f599a	fd45827e-d4a1-4aa3-a21b-e6707fa05a0c	\N
4d2254a0-2351-4f0d-b306-8d8f26661bc8	1	e769738a-feda-4d6d-9d3b-f571490ba208	f3e78334-c934-4950-bcb0-5fea316f53c0	\N
c7f3f5a4-9724-4d8a-a99e-b8431304cae8	4	e769738a-feda-4d6d-9d3b-f571490ba208	f1cfd1d3-3a53-4d8c-85a4-7cf5f0f51ce8	\N
28dd8546-26cc-4516-afc5-9bc695db596a	2	e769738a-feda-4d6d-9d3b-f571490ba208	19b78bee-c214-45fb-bc57-a83ad1bdb917	\N
49c8ab42-6f49-4489-a3fc-61d8c5ed5146	1	471951f2-dc86-4763-b696-790f8e24c388	9f2b2b6b-07fc-4346-8e71-2624c0c0320b	\N
bf5349fe-367d-4e1a-be7f-6b3cfce153dc	1	8afbf285-82b0-40ae-bfea-8a5bd37433fa	f1cfd1d3-3a53-4d8c-85a4-7cf5f0f51ce8	\N
e1f2bf94-6da0-45fa-948f-14c7d4cc9946	2	8afbf285-82b0-40ae-bfea-8a5bd37433fa	f1cfd1d3-3a53-4d8c-85a4-7cf5f0f51ce8	\N
4e9f7433-9297-4c38-b04e-0d2ae97ea16e	1	6c88d1e5-463a-4496-a471-1bf08995ebd8	00d7587a-8b0c-45cc-936e-3b15c657024a	\N
fdec6cf5-5d72-408a-9279-a5f2569f12dd	2	6c88d1e5-463a-4496-a471-1bf08995ebd8	ebfb67c5-3ce7-4383-b84c-279ea0886e18	\N
\.


--
-- Data for Name: dishes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dishes (id, name, description, price, image_url, is_preparable, available, preparation_time, created_at, category_id, deleted_at) FROM stdin;
2a88a6b3-b510-49da-ba73-0563e08a8d2e	Cá nướng	ngon đấy	100000	/uploads/dishes/4af386a5-906b-45ac-9a5f-06bd44152457.jpg	t	t	15	2025-05-19 01:53:18.612824	f669d0b6-1dc6-4450-acfc-784b4edbaf14	2025-05-22 01:21:20.35776
e665f294-78bb-4a5b-bb24-1c82ca74e092	Mướp đắng nhồi thịt	Mướp đắng nhồi với thịt	50000	/uploads/dishes/0aed08d6-c85a-4e13-81a4-3c63edfa8d34.jpg	t	t	15	2025-05-31 12:09:51.720021	0c5cac24-4eb8-49b8-a47f-6f47e42705dc	2025-05-31 12:09:57.228912
ef0f430b-9e46-4fbd-96a5-f93f138f599a	Canh cua rau đay	Canh cua nấu với rau đay	45000	/uploads/dishes/b778e7f0-83b0-49b6-b132-72829f6b3d61.jpg	t	t	20	2025-05-31 14:28:54.928126	447c3e85-bfd5-410f-926d-2bddbfec7b0f	\N
e769738a-feda-4d6d-9d3b-f571490ba208	Thịt bò xào	Thịt bò xào rau củ, hành tây, cần tây	34234	/uploads/dishes/0aa030af-eccb-4359-9393-1beb477400e6.jpg	t	t	17	2025-05-23 18:03:23.57007	9fd4c780-7bbc-418c-93f1-9a512855bc09	\N
471951f2-dc86-4763-b696-790f8e24c388	Bò sốt vang	Thịt bò dẻ sườn rửa sạch, thấm khô, thái miếng bao diêm to. Ướp thịt bò với 2 thìa canh nước mắm, 1 thìa cà phê muối (bột canh), 2 thìa cà phê hạt nêm, 2 thìa cà phê hạt tiêu, 2 thìa cà phê ớt bột paprika (tùy chọn), 3-4 thìa canh dầu màu điều giúp lên màu đẹp, gừng giã (băm) nhuyễn, 1/2 phần tỏi băm cùng quế, hồi thảo quả rang thơm cùng rượu vang đỏ (nếu không có thì dùng rượu trắng). Tất cả trộn đều và ướp tối thiểu trong 1 giờ. Nếu có thời gian, bọc màng bọc thực phẩm để qua đêm trong tủ lạnh sẽ thấm đủ vị và ngon hơn.	1223	/uploads/dishes/eb582364-b9fa-4734-bb26-c6aa958a8e57.jpg	t	t	2	2025-05-29 19:03:42.145645	447c3e85-bfd5-410f-926d-2bddbfec7b0f	\N
8afbf285-82b0-40ae-bfea-8a5bd37433fa	Bánh mỳ	Bánh mỳ pate gan ngỗng, rau củ quả	20000	/uploads/dishes/be1801f5-065f-487e-bbe0-3e599134e7be.jpg	t	t	12	2025-05-21 10:20:08.244692	9fd4c780-7bbc-418c-93f1-9a512855bc09	\N
6c88d1e5-463a-4496-a471-1bf08995ebd8	Cá chép om dưa	Cá chép đem om với dưa	23000	/uploads/dishes/97e55f95-5980-46bb-afb5-bf0283cc633e.jpg	t	t	12	2025-05-29 19:03:22.371921	5bac7dc9-b563-4088-b45e-265072138a2b	\N
\.


--
-- Data for Name: export_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.export_items (id, quantity, export_id, batch_id, ingredient_id) FROM stdin;
6333778f-15b2-4e5b-a2d2-dab35c7d502d	12	493a282a-3b9e-4d25-86f7-c196bc4103a4	2180346d-e234-44ef-b8f1-0a966dd4dbac	0404a47f-e788-47ff-aa9b-aab68c8d85af
\.


--
-- Data for Name: financial_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.financial_records (id, type, amount, description, created_at, created_by, related_import_id, related_order_id) FROM stdin;
\.


--
-- Data for Name: ingredient_exports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredient_exports (id, reason, created_at, created_by, deleted_at) FROM stdin;
493a282a-3b9e-4d25-86f7-c196bc4103a4	usage	2025-06-30 00:00:00	eab1bc84-0d54-412a-9860-6aad02687405	\N
\.


--
-- Data for Name: ingredient_imports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredient_imports (id, created_by, supplier_id, created_at, deleted_at, note) FROM stdin;
a86b0c5f-a2f4-4cf8-8b3f-cc8a153dbb55	eab1bc84-0d54-412a-9860-6aad02687405	7511e8e5-438d-4be9-bbc9-14ceefb330fa	2025-05-31 12:19:44.800798	\N	Nhập thêm rau vào kho
b7c0fcc9-ecde-463f-a3d9-ff102e037229	eab1bc84-0d54-412a-9860-6aad02687405	7511e8e5-438d-4be9-bbc9-14ceefb330fa	2025-05-31 12:56:17.770081	\N	\N
c0808d2d-85bc-4321-91a4-4d8047a63d0f	eab1bc84-0d54-412a-9860-6aad02687405	7511e8e5-438d-4be9-bbc9-14ceefb330fa	2025-06-14 23:22:55.738386	\N	Phiếu nhập test
8ed4ac03-c40a-496b-8ccf-9ac23b8d25cd	eab1bc84-0d54-412a-9860-6aad02687405	7511e8e5-438d-4be9-bbc9-14ceefb330fa	2025-06-14 23:27:11.170187	\N	\N
f38e96e2-bf9b-4104-86b2-1902065652c4	eab1bc84-0d54-412a-9860-6aad02687405	7511e8e5-438d-4be9-bbc9-14ceefb330fa	2025-06-14 23:53:26.372196	\N	Phiếu nhập test
6d3258fd-aee4-4e66-b290-d2d9bff2c255	eab1bc84-0d54-412a-9860-6aad02687405	7511e8e5-438d-4be9-bbc9-14ceefb330fa	2025-06-15 17:26:41.589864	\N	Nhập mướp đắng và rau cải
6ae1b4be-1ae6-4f27-9b32-330e73748274	eab1bc84-0d54-412a-9860-6aad02687405	0eee28aa-22ee-4455-a43a-e50fe3e12004	2025-06-30 01:18:44.005844	\N	Nhập cua đông lạnh tháng 7
\.


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredients (id, name, unit, threshold, created_at, deleted_at, image_url) FROM stdin;
fc5b317c-6aa6-43f2-a7cc-2b3ba168e06e	rau muống	kg	10	2025-05-17 23:57:17.989841	2025-05-18 00:10:27.154192	\N
a3e26415-7693-43d2-991b-405c6716de73	Đỗ Văn Hoàng	kg	3	2025-06-12 22:11:37.448337	2025-06-12 22:11:48.362516	/uploads/ingredients/c13a4a61-542d-4fc5-a678-544988660b32.jpg
528400d9-7ad4-467b-924b-5dfc0e7d4c71	Rau cải	bó	30	2025-05-19 22:06:52.703244	\N	/uploads/ingredients/79119206-e776-45db-8968-ab8ea83e6930.jpg
19b78bee-c214-45fb-bc57-a83ad1bdb917	Đỗ Văn Hoàng	kg	33443	2025-05-19 22:34:35.114442	2025-06-15 16:23:18.067737	/uploads/ingredients/25b4f2f5-9893-466b-ab94-002e0692f6ed.jpg
9f2b2b6b-07fc-4346-8e71-2624c0c0320b	êr	everv	222	2025-05-20 16:45:22.421927	2025-06-15 16:23:20.476675	/uploads/ingredients/b1dc3d2f-5bad-4624-a4a8-48c43bc12209.jpg
fd45827e-d4a1-4aa3-a21b-e6707fa05a0c	rêr	rferf	4332	2025-05-20 16:45:40.143512	2025-06-15 16:23:22.198822	\N
f1cfd1d3-3a53-4d8c-85a4-7cf5f0f51ce8	dfveffedff	dfsdfdf3	22	2025-05-20 16:46:00.538164	2025-06-15 16:23:23.841562	\N
1ebd639f-5bf4-45a0-933a-653577242afe	fseferwfef	ềq	23	2025-05-20 16:46:11.627972	2025-06-15 16:23:25.467135	\N
f3e78334-c934-4950-bcb0-5fea316f53c0	ferfer	ừe	34	2025-05-20 16:46:27.500183	2025-06-15 16:23:27.159451	\N
ba63d4c0-5746-485f-b295-80425e21634d	ferferfr	ưeferfrw	23	2025-05-20 16:46:37.347994	2025-06-15 16:23:28.713855	\N
9a22b95f-5df4-4ef3-9db9-4ed0d2d37698	3rf34f3	re	223	2025-05-20 16:46:47.459353	2025-06-15 16:23:30.271324	\N
344373a8-2192-44aa-8f25-16d08593d3d5	ề	kg	34	2025-05-20 16:47:04.451193	2025-06-15 16:23:32.348277	\N
77fd1bae-ada1-4d4d-b251-3957374e5fed	Rau cải	kg	20	2025-06-15 16:22:33.03326	2025-06-15 16:23:40.100144	/uploads/ingredients/55ff8e02-b6d1-4b7c-9ec2-026ef754d948.jpg
00d7587a-8b0c-45cc-936e-3b15c657024a	Mướp đắng	kg	10	2025-05-31 12:13:15.914676	\N	/uploads/ingredients/3128e4a0-1f5c-4ab2-9fcf-bbc6b6e27e52.jpeg
14f68c8b-b34d-4dcf-962c-b897f9324a12	hành	kg	4	2025-05-29 00:31:33.716863	2025-06-15 16:26:50.457948	/uploads/ingredients/dd86abbf-20c3-4424-85d0-06e714c9b3bf.jpg
ebfb67c5-3ce7-4383-b84c-279ea0886e18	rau muống	kg	100	2025-05-18 00:10:40.697734	\N	/uploads/ingredients/88532224-ead8-4154-87ca-db741f1aa39e.jpg
38f74077-f985-425f-8061-74a236bf7aa1	Thực đơn mùa Đông	sdcwd	23	2025-06-15 17:14:15.785683	2025-06-15 17:14:19.848731	\N
0404a47f-e788-47ff-aa9b-aab68c8d85af	Cua	kg	11	2025-05-31 14:31:08.655383	\N	/uploads/ingredients/1594e15c-ea35-47ce-9ef8-2efe8f32daa5.jpg
\.


--
-- Data for Name: menu_dishes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_dishes (id, menu_id, dish_id, deleted_at) FROM stdin;
38dcf8c3-4bde-4ff2-a984-50669a9e5a0f	b28555a9-00d5-432b-9a0b-fff9ea6ec0b0	2a88a6b3-b510-49da-ba73-0563e08a8d2e	\N
2786151a-d80e-43c6-87a2-0c7cd66e65c5	c60db0d9-1934-4462-b08b-a97d5bc9bc27	2a88a6b3-b510-49da-ba73-0563e08a8d2e	\N
954ea9eb-7efa-4611-ada2-66bbfaf59c21	f67fbd15-329f-4ad8-b297-b19495329eaf	8afbf285-82b0-40ae-bfea-8a5bd37433fa	\N
8cf2c7b6-4102-48eb-b7cb-ff1b74c6b142	c60db0d9-1934-4462-b08b-a97d5bc9bc27	8afbf285-82b0-40ae-bfea-8a5bd37433fa	\N
3c3fa833-a2db-4400-80f7-e518b3d1123a	c4bbc919-772f-436c-969c-51f4c4528d5f	8afbf285-82b0-40ae-bfea-8a5bd37433fa	\N
61d123c6-d1ca-4891-9ea3-185f0d34ff2b	014a86e6-803e-43dd-ac38-ba3658b92115	8afbf285-82b0-40ae-bfea-8a5bd37433fa	\N
9411f322-5368-40f4-a00f-a75a1cb85b89	e77ccd80-534f-427c-9cac-4141d76df4fc	8afbf285-82b0-40ae-bfea-8a5bd37433fa	\N
181f3d20-c835-426c-90c0-f90e1a56c740	0423cf1c-9f8e-49ac-bcff-ec41d02cdc53	8afbf285-82b0-40ae-bfea-8a5bd37433fa	\N
bd7b0771-aa7f-455b-8e56-0f829d987fa4	0423cf1c-9f8e-49ac-bcff-ec41d02cdc53	e769738a-feda-4d6d-9d3b-f571490ba208	\N
fc8f3539-4b52-454a-bf3a-5407dbc53951	41efbd83-2b04-4c35-8cde-6afbfffd96c4	e769738a-feda-4d6d-9d3b-f571490ba208	\N
7d7f651c-eacb-4fd8-9321-08cb0c9085b6	41efbd83-2b04-4c35-8cde-6afbfffd96c4	8afbf285-82b0-40ae-bfea-8a5bd37433fa	\N
b96ff16b-e7e1-405b-87d4-e4d045e81e79	2f37b23b-7330-402d-94f9-d4ea78c1e705	8afbf285-82b0-40ae-bfea-8a5bd37433fa	\N
5e6d3f91-0251-4ef1-83aa-f69cf2bd5082	2f37b23b-7330-402d-94f9-d4ea78c1e705	e769738a-feda-4d6d-9d3b-f571490ba208	\N
6726390c-f9e1-431b-8e1c-111b62911a51	2f37b23b-7330-402d-94f9-d4ea78c1e705	6c88d1e5-463a-4496-a471-1bf08995ebd8	\N
c4504308-61a3-4564-bf5b-b179125f3670	2f37b23b-7330-402d-94f9-d4ea78c1e705	471951f2-dc86-4763-b696-790f8e24c388	\N
883acd9b-a733-429e-9146-9db4e61df151	75dcfeba-f38b-4367-a2e0-06fbafc023f2	6c88d1e5-463a-4496-a471-1bf08995ebd8	\N
68114ed8-c47c-4f2b-9b72-95058ee2d1b4	75dcfeba-f38b-4367-a2e0-06fbafc023f2	8afbf285-82b0-40ae-bfea-8a5bd37433fa	\N
\.


--
-- Data for Name: menus; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menus (id, name, description, created_at, deleted_at, is_main) FROM stdin;
75dcfeba-f38b-4367-a2e0-06fbafc023f2	Thực đơn mùa Hè	Nhiều món thanh nhiệt	2025-05-31 12:52:55.800968	\N	f
c4bbc919-772f-436c-969c-51f4c4528d5f	Thực đơn mùa Xuân	vdfvdv	2025-05-23 14:48:34.313779	\N	f
f67fbd15-329f-4ad8-b297-b19495329eaf	Thực đơn mùa Đông	Nhiều hoa quả xứ lạnh	2025-05-23 14:22:06.31314	\N	f
2f37b23b-7330-402d-94f9-d4ea78c1e705	Thực đơn tháng 6	greg	2025-05-29 19:05:01.520434	\N	t
014a86e6-803e-43dd-ac38-ba3658b92115	Thực đơn tháng 2	dfvcdvfd	2025-05-23 14:48:50.420522	\N	f
0423cf1c-9f8e-49ac-bcff-ec41d02cdc53	Thực đơn tháng 1	vdfbcxb cv 	2025-05-23 18:05:52.510048	\N	f
41efbd83-2b04-4c35-8cde-6afbfffd96c4	Thực đơn tháng 5	kjbj	2025-05-23 18:18:08.125824	\N	f
b28555a9-00d5-432b-9a0b-fff9ea6ec0b0	Thực đơn mùa Thu	dfvdf	2025-05-19 09:50:54.37797	2025-05-23 14:25:52.371806	f
c60db0d9-1934-4462-b08b-a97d5bc9bc27	Thực đơn mùa cá	dffvf	2025-05-19 09:51:27.857566	2025-05-23 18:05:25.47146	f
e77ccd80-534f-427c-9cac-4141d76df4fc	Thực đơn mùa rau	dfvdfvdf	2025-05-23 14:49:07.32323	\N	f
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, quantity, note, status, prepared_at, order_id, dish_id) FROM stdin;
b50faa6b-b1d4-4e9b-9330-a71180dce126	2	No spice	waiting	\N	17cf5c25-a5e3-4994-b858-e7657f7bc0a1	8afbf285-82b0-40ae-bfea-8a5bd37433fa
5394c5df-5dac-4d23-86b1-75314663c8bd	2	\N	waiting	\N	4dc22593-d580-4a0e-aaa5-36c5460735d2	8afbf285-82b0-40ae-bfea-8a5bd37433fa
e39a3d72-8b66-4588-b3d3-d8bd17164d6b	2	\N	waiting	\N	4dc22593-d580-4a0e-aaa5-36c5460735d2	e769738a-feda-4d6d-9d3b-f571490ba208
038da03b-0e0f-43b6-881c-5c6c0e1e9634	1	\N	waiting	\N	4dc22593-d580-4a0e-aaa5-36c5460735d2	471951f2-dc86-4763-b696-790f8e24c388
0f3301f5-4875-4402-b5e9-a5440b7e25bb	1	\N	waiting	\N	4dc22593-d580-4a0e-aaa5-36c5460735d2	6c88d1e5-463a-4496-a471-1bf08995ebd8
d7594576-a823-4fb9-b51a-5ae492c8fa62	1	\N	waiting	\N	d1aacc80-d319-4cc8-92f8-8d7a0c9bfa59	8afbf285-82b0-40ae-bfea-8a5bd37433fa
3e1f93be-bd2d-4213-8608-2dcb3918a228	1	\N	waiting	\N	d1aacc80-d319-4cc8-92f8-8d7a0c9bfa59	e769738a-feda-4d6d-9d3b-f571490ba208
85d4490b-a6de-4e9a-8fc3-b3309044c71c	1	\N	waiting	\N	4602f58c-d062-469e-ac7d-fa90f408be5d	e769738a-feda-4d6d-9d3b-f571490ba208
9188d427-9728-418a-9d73-3240ced2e377	1	\N	waiting	\N	ec48e874-d3a4-4141-bb91-22a0221e3ac0	471951f2-dc86-4763-b696-790f8e24c388
76fbb9fb-8bfe-4554-b089-c32265208929	1	\N	waiting	\N	ec48e874-d3a4-4141-bb91-22a0221e3ac0	6c88d1e5-463a-4496-a471-1bf08995ebd8
74cbcb6c-b934-40b2-a5bb-9903d7962aca	1	\N	waiting	\N	dfe62720-2471-48e0-bd9f-f1c669f2e4b4	471951f2-dc86-4763-b696-790f8e24c388
f78d6d9e-8354-4262-bc5f-5cd5a6c1f05d	1	\N	waiting	\N	dfe62720-2471-48e0-bd9f-f1c669f2e4b4	6c88d1e5-463a-4496-a471-1bf08995ebd8
35ed8ff4-8fbc-47e1-aa3e-029e1eb29fcf	1	\N	waiting	\N	dfe62720-2471-48e0-bd9f-f1c669f2e4b4	e769738a-feda-4d6d-9d3b-f571490ba208
ec0522be-9576-46b4-b708-457517a9a5b6	1	\N	waiting	\N	1bc97a33-fba6-47e5-8611-7aa3f620f395	6c88d1e5-463a-4496-a471-1bf08995ebd8
52ef11dd-7d89-43f2-9dc6-e82cd6e7854d	1	\N	waiting	\N	1bc97a33-fba6-47e5-8611-7aa3f620f395	471951f2-dc86-4763-b696-790f8e24c388
38ccb242-f5b0-4d8d-855f-bd0aabcce55a	1	\N	waiting	\N	3eb30585-1a7c-4a88-a71c-172e0db49d82	471951f2-dc86-4763-b696-790f8e24c388
b09b47bf-00e1-49fa-8455-9509bfa5d850	1	\N	waiting	\N	3eb30585-1a7c-4a88-a71c-172e0db49d82	6c88d1e5-463a-4496-a471-1bf08995ebd8
5fa52455-ee46-48ff-a528-5bf8d2a856be	1	\N	waiting	\N	ced11936-51ad-4e1d-9bf7-f701cc9a77dd	8afbf285-82b0-40ae-bfea-8a5bd37433fa
a532f16c-86ae-4e79-b916-fd7c332a55cc	1	\N	waiting	\N	ced11936-51ad-4e1d-9bf7-f701cc9a77dd	e769738a-feda-4d6d-9d3b-f571490ba208
ce674189-5db6-479d-b516-ef03ced950ce	1	\N	waiting	\N	64523b25-5b5c-44e6-9577-cf7aa205e91f	e769738a-feda-4d6d-9d3b-f571490ba208
bd9e4a36-65ef-40ed-b1ae-ed7d3581864f	1	\N	waiting	\N	64523b25-5b5c-44e6-9577-cf7aa205e91f	471951f2-dc86-4763-b696-790f8e24c388
f205713d-80d6-4f9a-9f44-d91a91c1406e	1	\N	waiting	\N	376a1ce7-1ef6-4c86-9900-759dbd946228	471951f2-dc86-4763-b696-790f8e24c388
5222571e-ae50-4ea3-8039-4a20d34ac797	1	\N	waiting	\N	376a1ce7-1ef6-4c86-9900-759dbd946228	6c88d1e5-463a-4496-a471-1bf08995ebd8
e559e6a3-09d5-4bae-9aa8-f7eb5630f938	1	\N	waiting	\N	376a1ce7-1ef6-4c86-9900-759dbd946228	e769738a-feda-4d6d-9d3b-f571490ba208
80e81e9a-7333-4a18-a728-f84d35b79ba6	1	\N	waiting	\N	a1e5ddd7-a0d3-4240-942b-2f3839b90900	6c88d1e5-463a-4496-a471-1bf08995ebd8
80a82174-ffce-49a4-93eb-c40ae6cc36e0	1	\N	waiting	\N	a1e5ddd7-a0d3-4240-942b-2f3839b90900	471951f2-dc86-4763-b696-790f8e24c388
1cafbff2-6aa1-42ee-b10a-de2761235ce9	1	\N	waiting	\N	8f7d83ab-1fa3-49c0-a431-8594c254cfc4	8afbf285-82b0-40ae-bfea-8a5bd37433fa
dee57ed9-9674-436d-84a8-b72a30503770	1	\N	waiting	\N	8f7d83ab-1fa3-49c0-a431-8594c254cfc4	e769738a-feda-4d6d-9d3b-f571490ba208
00e47454-2910-44d4-8f69-5062de349986	1	\N	waiting	\N	3d5cf496-e956-4e2c-80f7-f6dc066fa8f1	8afbf285-82b0-40ae-bfea-8a5bd37433fa
86f418fa-7b09-4504-9b4e-8a2f907794fa	1	\N	waiting	\N	3d5cf496-e956-4e2c-80f7-f6dc066fa8f1	e769738a-feda-4d6d-9d3b-f571490ba208
3c6b53b8-af56-4efa-b608-28205c9ef107	1	\N	waiting	\N	3d5cf496-e956-4e2c-80f7-f6dc066fa8f1	6c88d1e5-463a-4496-a471-1bf08995ebd8
73f53717-8eb3-4155-9976-c3e4d4109a87	1	\N	waiting	\N	c43cc76c-dc2e-4068-8428-321588424e15	8afbf285-82b0-40ae-bfea-8a5bd37433fa
4dbdf7e2-c7a0-48f2-85e9-d69af1b698a9	2	\N	waiting	\N	c43cc76c-dc2e-4068-8428-321588424e15	e769738a-feda-4d6d-9d3b-f571490ba208
a8bc2a77-3e01-4509-9bf8-411aaafa0508	1	\N	waiting	\N	c43cc76c-dc2e-4068-8428-321588424e15	6c88d1e5-463a-4496-a471-1bf08995ebd8
d630a771-13fa-4bae-8da1-9bcfb1b7c6db	3	không bỏ hành	waiting	\N	e74f7f51-4639-454c-b5b7-771aa8b1ad6a	8afbf285-82b0-40ae-bfea-8a5bd37433fa
0abc3250-d988-4791-b619-8a63a809d13f	1	\N	waiting	\N	e74f7f51-4639-454c-b5b7-771aa8b1ad6a	e769738a-feda-4d6d-9d3b-f571490ba208
0c0456d2-f2c3-48de-b5ee-b9fc6db9a63d	1	\N	waiting	\N	e74f7f51-4639-454c-b5b7-771aa8b1ad6a	6c88d1e5-463a-4496-a471-1bf08995ebd8
bf1017fb-67ea-46a4-9d10-564a78348cb9	2	\N	waiting	\N	0e1dc3b7-950b-4e00-84d2-95ef1de00156	8afbf285-82b0-40ae-bfea-8a5bd37433fa
96149e65-8a51-42c5-91c0-d311ecaced60	1	\N	waiting	\N	f5656ca6-770c-484c-8b9e-258ce3929422	8afbf285-82b0-40ae-bfea-8a5bd37433fa
af5b6570-b8a0-4ceb-9bc4-a7a4c6ad3a3e	1	\N	waiting	\N	f5656ca6-770c-484c-8b9e-258ce3929422	e769738a-feda-4d6d-9d3b-f571490ba208
ee6945ae-0e05-4c1e-9465-9650389d4093	1	\N	waiting	\N	f5656ca6-770c-484c-8b9e-258ce3929422	6c88d1e5-463a-4496-a471-1bf08995ebd8
b0b24565-8461-4c05-a952-ebe73c572402	3	fghgfh	waiting	\N	4deb3de6-6ee9-4d3e-b227-1c7500c95c12	8afbf285-82b0-40ae-bfea-8a5bd37433fa
1fdea4cc-1de6-4f5f-ad99-4d9fe87154b9	1	fdbdfb	waiting	\N	4deb3de6-6ee9-4d3e-b227-1c7500c95c12	471951f2-dc86-4763-b696-790f8e24c388
bae9da80-797d-42c1-95c6-430c5e865bfa	1	\N	waiting	\N	4deb3de6-6ee9-4d3e-b227-1c7500c95c12	e769738a-feda-4d6d-9d3b-f571490ba208
5a677fde-8b88-4867-921c-444a59690765	2	\N	waiting	\N	4deb3de6-6ee9-4d3e-b227-1c7500c95c12	6c88d1e5-463a-4496-a471-1bf08995ebd8
0e279bc6-7042-4210-8f2f-abf206894064	1	\N	waiting	\N	a81ccd2e-b5b7-4195-baec-aa21b0ca603a	e769738a-feda-4d6d-9d3b-f571490ba208
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, status, total_price, created_at, updated_at, table_id, user_id, feedback) FROM stdin;
17cf5c25-a5e3-4994-b858-e7657f7bc0a1	pending	80000	2025-05-29 22:35:15.770545	2025-05-29 22:35:15.770545	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	eab1bc84-0d54-412a-9860-6aad02687405	\N
4dc22593-d580-4a0e-aaa5-36c5460735d2	pending	172691	2025-05-30 20:08:09.127572	2025-05-30 20:08:09.127572	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	56fd0ed4-4ab4-4960-85fd-5c738fdba648	\N
d1aacc80-d319-4cc8-92f8-8d7a0c9bfa59	pending	74234	2025-05-30 20:08:32.33184	2025-05-30 20:08:32.33184	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	56fd0ed4-4ab4-4960-85fd-5c738fdba648	\N
4602f58c-d062-469e-ac7d-fa90f408be5d	pending	34234	2025-05-30 21:30:05.594026	2025-05-30 21:30:05.594026	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	\N	\N
ec48e874-d3a4-4141-bb91-22a0221e3ac0	pending	24223	2025-05-30 21:30:27.849161	2025-05-30 21:30:27.849161	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	\N	\N
dfe62720-2471-48e0-bd9f-f1c669f2e4b4	pending	58457	2025-05-30 22:57:19.104063	2025-05-30 22:57:19.104063	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	\N	\N
1bc97a33-fba6-47e5-8611-7aa3f620f395	pending	24223	2025-05-30 23:18:31.075732	2025-05-30 23:18:31.075732	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	\N	\N
3eb30585-1a7c-4a88-a71c-172e0db49d82	pending	24223	2025-05-30 23:21:25.921185	2025-05-30 23:21:25.921185	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	\N	\N
ced11936-51ad-4e1d-9bf7-f701cc9a77dd	pending	74234	2025-05-30 23:21:48.827558	2025-05-30 23:21:48.827558	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	\N	\N
64523b25-5b5c-44e6-9577-cf7aa205e91f	pending	35457	2025-05-30 23:23:18.448918	2025-05-30 23:23:18.448918	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	\N	\N
376a1ce7-1ef6-4c86-9900-759dbd946228	pending	58457	2025-05-30 23:31:58.922472	2025-05-30 23:31:58.922472	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	\N	\N
a1e5ddd7-a0d3-4240-942b-2f3839b90900	pending	24223	2025-05-30 23:35:38.765136	2025-05-30 23:35:38.765136	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	\N	\N
8f7d83ab-1fa3-49c0-a431-8594c254cfc4	pending	54234	2025-05-31 01:19:48.415819	2025-05-31 01:19:48.415819	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	\N	\N
3d5cf496-e956-4e2c-80f7-f6dc066fa8f1	pending	77234	2025-05-31 13:13:38.27584	2025-05-31 13:13:38.27584	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	\N	\N
c43cc76c-dc2e-4068-8428-321588424e15	pending	111468	2025-05-31 14:09:32.572413	2025-05-31 14:09:32.572413	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	\N	\N
e74f7f51-4639-454c-b5b7-771aa8b1ad6a	pending	117234	2025-05-31 14:22:08.606565	2025-05-31 14:22:08.606565	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	\N	\N
0e1dc3b7-950b-4e00-84d2-95ef1de00156	pending	40000	2025-06-11 23:57:20.184941	2025-06-11 23:57:20.184941	7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	\N	\N
f5656ca6-770c-484c-8b9e-258ce3929422	pending	77234	2025-06-30 02:01:38.092922	2025-06-30 02:01:38.092922	0bb42628-aeab-41bf-8262-ed3ba80f5cb5	\N	\N
4deb3de6-6ee9-4d3e-b227-1c7500c95c12	pending	141457	2025-06-30 13:31:32.182344	2025-06-30 13:31:32.182344	0bb42628-aeab-41bf-8262-ed3ba80f5cb5	\N	\N
a81ccd2e-b5b7-4195-baec-aa21b0ca603a	pending	34234	2025-06-30 13:33:49.065461	2025-06-30 13:33:49.065461	0bb42628-aeab-41bf-8262-ed3ba80f5cb5	\N	\N
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, "transactionId", order_id, method, error, metadata, created_at, completed_at, "orderId", "paymentMethod", "createdAt", "paidAt", amount, status) FROM stdin;
\.


--
-- Data for Name: restaurants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurants (id, name, address, phone, logo_url, cover_image_url, created_at) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, contact_name, contact_phone, contact_email, address, created_at, deleted_at) FROM stdin;
7511e8e5-438d-4be9-bbc9-14ceefb330fa	Nhà bán rau	Chú Dũng	2152454646	dung@gmail.com	Nam Từ Liêm, Hà Nội	2025-05-29 01:43:57.775555	\N
2635e366-0b31-4633-9678-7c356c982961	dfbgfngf	fvgfbdfv	dfbfdb	bdfbdf@gmail.vom	bdf	2025-05-29 01:44:32.2543	2025-05-29 01:44:35.356265
1ec00d90-2871-40dc-b9cd-a442010a8a92	Đỗ Văn Hoàng	Đỗ Văn Hoàng	0345662835	dung@gmail.com	Lam thôn	2025-05-29 01:51:52.679531	\N
fa91910c-e64d-49c4-90ae-14ad497d4f7d	Lò thịt lợn	Chú Ba	0345662835	dung@gmail.com	Ba Đình	2025-05-31 12:15:08.779693	\N
0eee28aa-22ee-4455-a43a-e50fe3e12004	Chú bán cua	Chú Sáu	042359834	abc@gmail.com	Ba Đình	2025-05-31 16:02:54.123498	\N
\.


--
-- Data for Name: tables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tables (id, name, capacity, status, deleted_at) FROM stdin;
7c7cb080-b550-4dbd-9aed-c3c0a716f4ee	Bàn VIP 1	8	reserved	\N
0bb42628-aeab-41bf-8262-ed3ba80f5cb5	Bàn 3	1	available	\N
d22cf524-2764-4904-8922-4cfac2ff93a6	Bàn 2	6	available	\N
89b1258f-70bd-49e1-b944-76b67f5e92dd	Bàn 2	4	occupied	\N
9a3cc90d-cf8d-439c-a3d0-1cc263daf56e	Bàn 5	6	available	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, avatar_url, role, created_at, deleted_at) FROM stdin;
281c5c51-a3aa-4366-837b-e4fc19079728	admin5	admin5@gmail.com	$2b$10$Hfpq3Kroun7/NPISJMnSCOU8K5KGz6k9ni5miNxDRT61Jqxd4nfKG	\N	admin	2025-05-04 20:53:45.736771	\N
ce5012cd-8d1d-4796-bad2-6e22ad127852	admin2	admin2@gmail.com	$2b$10$cKx3dGQPqFM.129WcwG5FuQvMWQ5.7u97aV9Pyj6zgkC.Mdal6yUq	/uploads/avatars/b0ad3c1b-1c01-4233-b884-512eef9a48ff.jpg	chef	2025-04-28 12:56:24.377352	\N
fbff00fd-e2c2-406f-856b-a426996f6dc9	Đỗ Văn Hoàng	dovanhoang.work@gmail.com	$2b$10$hSUxLnutYbDmeo4BgoB3Ru14w3JpQ78mD0SA5jtfSCuR.72wVI0O.	\N	customer	2025-05-09 19:30:03.396195	\N
eab1bc84-0d54-412a-9860-6aad02687405	admin2	admin@gmail.com	$2b$10$TLM0.oSwdzfDuFkob.PcWeIZopq.qRZbzAYHXoZgpnDR5ZTA.4JVi	/uploads/avatars/5424e7c8-16e3-4cea-8816-d3090c8b688f.jpg	admin	2025-04-28 13:05:47.681024	\N
f3c84296-1bbc-4d23-a757-6794103a9132	admin4	admin4@gmail.com	$2b$10$Q.WUsIgnNfZl.eEpvhnEr.lcpUlzkZvPeyEBAVM/dyzgEH3BKkJL2	\N	staff	2025-05-04 20:33:03.215202	\N
b829f8ba-9c6b-4416-9df7-94349a548939	Đỗ Văn Hoàng	dovanhoang1201@gmail.com	$2b$10$eEnQJjY7QqcvJofwNW6kNOBTMl2sFVxHi7rWxbgLQcYo1OtCu1Icu	\N	warehouse	2025-05-08 22:48:25.187098	\N
a023c873-523b-44ba-b5ec-5673f1086f86	Test User	test@example.com	$2b$10$08b5IcP5ge9brqKcKygyYOXpdZ3kQC7Wio6RBcaNHLwJGiILANbC6	\N	customer	2025-05-24 11:41:21.318685	2025-05-31 13:16:29.683273
56fd0ed4-4ab4-4960-85fd-5c738fdba648	Đỗ Văn Hoàn	admin6@gmail.com	$2b$10$nS5nQZF/lgnoM2Ylpsm6bOdSHPr7cFW7hZONCnjx7CXdZ/Uc9Mq1m	\N	customer	2025-05-04 20:54:11.853756	\N
bd047cfa-da16-4312-8e7e-25b450b81027	vdfsfbdfb	Hoang.DV215378@sis.hust.edu.vnx	$2b$10$SJM6p/fK/Rk/Per7A3itw.KKK9kmnLYCin1X5dZ00PYQ8sSn5Qe1u	\N	customer	2025-06-14 22:23:04.830004	2025-06-15 15:30:18.034394
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, false);


--
-- Name: order_items PK_005269d8574e6fac0493715c308; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY (id);


--
-- Name: dish_ingredients PK_0c1cc40f8fc05334e8cb958b60d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dish_ingredients
    ADD CONSTRAINT "PK_0c1cc40f8fc05334e8cb958b60d" PRIMARY KEY (id);


--
-- Name: payments PK_197ab7af18c93fbb0c9b28b4a59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY (id);


--
-- Name: categories PK_24dbc6126a28ff948da33e97d3b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY (id);


--
-- Name: ingredient_imports PK_2f63ef8572c660ed68b8fbebb10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_imports
    ADD CONSTRAINT "PK_2f63ef8572c660ed68b8fbebb10" PRIMARY KEY (id);


--
-- Name: menus PK_3fec3d93327f4538e0cbd4349c4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT "PK_3fec3d93327f4538e0cbd4349c4" PRIMARY KEY (id);


--
-- Name: batches PK_55e7ff646e969b61d37eea5be7a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT "PK_55e7ff646e969b61d37eea5be7a" PRIMARY KEY (id);


--
-- Name: orders PK_710e2d4957aa5878dfe94e4ac2f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY (id);


--
-- Name: tables PK_7cf2aca7af9550742f855d4eb69; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT "PK_7cf2aca7af9550742f855d4eb69" PRIMARY KEY (id);


--
-- Name: export_items PK_81bd9bf0456a0414a4052382712; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.export_items
    ADD CONSTRAINT "PK_81bd9bf0456a0414a4052382712" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: ingredients PK_9240185c8a5507251c9f15e0649; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT "PK_9240185c8a5507251c9f15e0649" PRIMARY KEY (id);


--
-- Name: financial_records PK_926582dfe48e41b238655e7540c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_records
    ADD CONSTRAINT "PK_926582dfe48e41b238655e7540c" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: suppliers PK_b70ac51766a9e3144f778cfe81e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY (id);


--
-- Name: ingredient_exports PK_b7b6b9a86fdd173d33d8922fc23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_exports
    ADD CONSTRAINT "PK_b7b6b9a86fdd173d33d8922fc23" PRIMARY KEY (id);


--
-- Name: menu_dishes PK_d607c20da4a70cec3b98edfbeb4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_dishes
    ADD CONSTRAINT "PK_d607c20da4a70cec3b98edfbeb4" PRIMARY KEY (id);


--
-- Name: restaurants PK_e2133a72eb1cc8f588f7b503e68; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT "PK_e2133a72eb1cc8f588f7b503e68" PRIMARY KEY (id);


--
-- Name: dishes PK_f4748c8e8382ad34ef517520b7b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dishes
    ADD CONSTRAINT "PK_f4748c8e8382ad34ef517520b7b" PRIMARY KEY (id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: ingredient_exports FK_021893b5edf20b71ef4c50588ea; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_exports
    ADD CONSTRAINT "FK_021893b5edf20b71ef4c50588ea" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: batches FK_06a47ecacce3fef75ec567cefbf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT "FK_06a47ecacce3fef75ec567cefbf" FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id);


--
-- Name: dishes FK_078dfd20b43f0efe2b4e5fc520c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dishes
    ADD CONSTRAINT "FK_078dfd20b43f0efe2b4e5fc520c" FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: menu_dishes FK_0f427202c22ed5aede5f1b3a4bc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_dishes
    ADD CONSTRAINT "FK_0f427202c22ed5aede5f1b3a4bc" FOREIGN KEY (menu_id) REFERENCES public.menus(id);


--
-- Name: order_items FK_145532db85752b29c57d2b7b1f1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: ingredient_imports FK_16dbbdd4793f2391b89ecd60f5d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_imports
    ADD CONSTRAINT "FK_16dbbdd4793f2391b89ecd60f5d" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: batches FK_1beea9d1bc847c79fd267ac0fdf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT "FK_1beea9d1bc847c79fd267ac0fdf" FOREIGN KEY (import_id) REFERENCES public.ingredient_imports(id);


--
-- Name: export_items FK_1c9cbdd34328c4cc72760588af0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.export_items
    ADD CONSTRAINT "FK_1c9cbdd34328c4cc72760588af0" FOREIGN KEY (export_id) REFERENCES public.ingredient_exports(id);


--
-- Name: export_items FK_2c7f10fcad049aca452330bd589; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.export_items
    ADD CONSTRAINT "FK_2c7f10fcad049aca452330bd589" FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id);


--
-- Name: dish_ingredients FK_39f8e6cc96a9d1cf6fc18d25b0e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dish_ingredients
    ADD CONSTRAINT "FK_39f8e6cc96a9d1cf6fc18d25b0e" FOREIGN KEY (dish_id) REFERENCES public.dishes(id);


--
-- Name: orders FK_3d36410e89a795172fa6e0dd968; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_3d36410e89a795172fa6e0dd968" FOREIGN KEY (table_id) REFERENCES public.tables(id);


--
-- Name: financial_records FK_3faf1dae96b022b696922d305b6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_records
    ADD CONSTRAINT "FK_3faf1dae96b022b696922d305b6" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: menu_dishes FK_53515946fa53ce086f5282e1629; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_dishes
    ADD CONSTRAINT "FK_53515946fa53ce086f5282e1629" FOREIGN KEY (dish_id) REFERENCES public.dishes(id);


--
-- Name: dish_ingredients FK_67a8cf026a0b034af2709ce4215; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dish_ingredients
    ADD CONSTRAINT "FK_67a8cf026a0b034af2709ce4215" FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id);


--
-- Name: financial_records FK_a003526bce4a1cf445c2dee359a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_records
    ADD CONSTRAINT "FK_a003526bce4a1cf445c2dee359a" FOREIGN KEY (related_import_id) REFERENCES public.ingredient_imports(id);


--
-- Name: orders FK_a922b820eeef29ac1c6800e826a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: payments FK_af929a5f2a400fdb6913b4967e1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1" FOREIGN KEY ("orderId") REFERENCES public.orders(id);


--
-- Name: payments FK_b2f7b823a21562eeca20e72b006; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_b2f7b823a21562eeca20e72b006" FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: ingredient_imports FK_ceec78c732e01009416aa61097d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_imports
    ADD CONSTRAINT "FK_ceec78c732e01009416aa61097d" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: export_items FK_d172acf7f96fb247acdd5a3fcc8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.export_items
    ADD CONSTRAINT "FK_d172acf7f96fb247acdd5a3fcc8" FOREIGN KEY (batch_id) REFERENCES public.batches(id);


--
-- Name: order_items FK_ee9bb257017dd6202e7c95ef5fe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_ee9bb257017dd6202e7c95ef5fe" FOREIGN KEY (dish_id) REFERENCES public.dishes(id);


--
-- Name: financial_records FK_f394cb3f713ce6dcdc1b7a28cbe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_records
    ADD CONSTRAINT "FK_f394cb3f713ce6dcdc1b7a28cbe" FOREIGN KEY (related_order_id) REFERENCES public.orders(id);


--
-- PostgreSQL database dump complete
--

