CREATE TABLE users (
    char_col varchar(255) NOT NULL,
    nullable_char_col varchar(255),
    text_col text NOT NULL,
    nullable_text_col text,
    tinytext_col tinytext NOT NULL,
    nullable_tinytext_col tinytext,
    mediumtext_col mediumtext NOT NULL,
    nullable_mediumtext_col mediumtext,
    longtext_col longtext NOT NULL,
    nullable_longtext_col longtext,
    time_col time NOT NULL,
    nullable_time_col time,
    geometry_col geometry NOT NULL,
    nullable_geometry_col geometry,

    integer_col integer NOT NULL,
    nullable_integer_col integer,
    int_col int NOT NULL,
    nullable_int_col int,
    smallint_col smallint NOT NULL,
    nullable_smallint_col smallint,
    mediumint_col mediumint NOT NULL,
    nullable_mediumint_col mediumint,
    bigint_col bigint NOT NULL,
    nullable_bigint_col bigint,
    double_col double NOT NULL,
    nullable_double_col double,
    decimal_col decimal NOT NULL,
    nullable_decimal_col decimal,
    numeric_col numeric NOT NULL,
    nullable_numeric_col numeric,
    float_col float NOT NULL,
    nullable_float_col float,
    year_col year NOT NULL,
    nullable_year_col year,

    tinyint_col tinyint NOT NULL,
    nullable_tinyint_col tinyint,

    date_col date NOT NULL,
    nullable_date_col date,
    datetime_col datetime NOT NULL,
    nullable_datetime_col datetime,
    timestamp_col timestamp NOT NULL

    -- TODO: tinyblob_col tinyblob NOT NULL,
    -- TODO: nullable_tinyblob_col tinyblob,
    -- TODO: mediumblob_col mediumblob NOT NULL,
    -- TODO: nullable_mediumblob_col mediumblob,
    -- TODO: longblob_col longblob NOT NULL,
    -- TODO: nullable_longblob_col longblob,
    -- TODO: blob_col blob NOT NULL,
    -- TODO: nullable_blob_col blob,
    -- TODO: binary_col binary NOT NULL,
    -- TODO: nullable_binary_col binary,
    -- TODO: varbinary_col varbinary(255) NOT NULL,
    -- TODO: nullable_varbinary_col varbinary(255),
    -- TODO: bit_col bit NOT NULL,
    -- TODO: nullable_bit_col bit,

    -- TODO: enum_col enum('enum1', 'enum2', 'enum3') DEFAULT 'enum1' NOT NULL,
    -- TODO: nullable_enum_col enum('enum1', 'enum2', 'enum3'),
    -- TODO: set_col set('set1', 'set2', 'set3') DEFAULT 'set1' NOT NULL,
    -- TODO: nullable_set_col set('set1', 'set2', 'set3')
);

DROP TABLE IF EXISTS user_enums;

-- CREATE TABLE user_enums (
    -- TODO: enum_col enum('enum1', 'enum2', 'enum3') DEFAULT 'enum1' NOT NULL,
    -- TODO: nullable_enum_col enum('enum1', 'enum2', 'enum3'),
    -- TODO: set_col set('set1', 'set2', 'set3') DEFAULT 'set1' NOT NULL,
    -- TODO: nullable_set_col set('set1', 'set2', 'set3')
-- );

DROP TABLE IF EXISTS package;

CREATE TABLE package (
    number integer NOT NULL,
    string varchar(20) NOT NULL
);
