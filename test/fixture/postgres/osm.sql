-- Openstreetmap schema obtained from https://git.openstreetmap.org/rails.git/blob/HEAD:/db/structure.sql
DROP TYPE IF EXISTS user_status_enum CASCADE;
CREATE TYPE user_status_enum AS ENUM (
    'pending',
    'active',
    'confirmed',
    'suspended',
    'deleted'
);

DROP TYPE IF EXISTS format_enum CASCADE;
CREATE TYPE format_enum AS ENUM (
    'html',
    'markdown',
    'text'
);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    email character varying(255) NOT NULL,
    id bigint NOT NULL,
    pass_crypt character varying(255) NOT NULL,
    creation_time timestamp without time zone NOT NULL,
    display_name character varying(255) DEFAULT ''::character varying NOT NULL,
    data_public boolean DEFAULT false NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    home_lat double precision,
    home_lon double precision,
    home_zoom smallint DEFAULT 3,
    nearby integer DEFAULT 50,
    pass_salt character varying(255),
    image_file_name text,
    email_valid boolean DEFAULT false NOT NULL,
    new_email character varying(255),
    creation_ip character varying(255),
    languages character varying(255),
    -- TODO: status user_status_enum DEFAULT 'pending'::user_status_enum NOT NULL,
    terms_agreed timestamp without time zone,
    consider_pd boolean DEFAULT false NOT NULL,
    preferred_editor character varying(255),
    terms_seen boolean DEFAULT false NOT NULL,
    auth_uid character varying(255),
    -- TODO: description_format format_enum DEFAULT 'markdown'::format_enum NOT NULL,
    image_fingerprint character varying(255),
    changesets_count integer DEFAULT 0 NOT NULL,
    traces_count integer DEFAULT 0 NOT NULL,
    diary_entries_count integer DEFAULT 0 NOT NULL,
    image_use_gravatar boolean DEFAULT false NOT NULL,
    image_content_type character varying(255),
    auth_provider character varying,
    uuid_column uuid,
    number integer,
    string character varying,
    money_col money,
    char_col char,
    time_col time,
    inet_col inet,
    jsonb_col jsonb,
    numeric_col numeric(5,2),
    bytea_col bytea,
    -- TODO: bool_array_col boolean[],
    varchar_array_col character varying[],
    -- TODO: int2_array_col int2[],
    -- TODO: int4_array_col int4[],
    int8_array_col int8[],
    uuid_array_col uuid[],
    text_array_col text[],
    bytea_array_col bytea[],
    real_col real,
    double_col double precision,
    time_with_tz time with time zone,
    oid_col oid,
    interval_col interval,
    json_col json,
    date_col date,
    -- TODO: unspported_path_type path,
    name_type_col name,
    -- TODO: json_array_col json[],
    jsonb_array_col jsonb[]
    -- TODO: timestamptz_array_col timestamptz[]
);
