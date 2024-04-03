CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--PEOPLE--
CREATE TABLE
    people (
        code uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
        cccd text NOT NULL,
        type text NOT NULL,
        name text NOT NULL,
        phonenumber text NOT NULL,
        email text NOT NULL,
        address integer NOT NULL,
    );

--ACCOUNT--
CREATE TABLE
    account (
        code uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
        people uuid REFERENCES people (uuid) ON DELETE CASCADE,
        username text NOT NULL,
        password text NOT NULL,
    );

--MEDICINE--
CREATE TABLE
    medicine (
        code uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
        name text NOT NULL,
        origin text NOT NULL,
        area float NOT NULL,
        dueDate date NOT NULL,
        unit text NOT NULL,
        price integer NOT NULL,
    );

--SERVICE--
CREATE TABLE
    service (
        code uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
        name text NOT NULL,
        price integer NOT NULL,
        description text NOT NULL
    );

--EXAM--
CREATE TABLE
    exam (
        code uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
        patient uuid NOT NULL,
        medico uuid NOT NULL,
        service uuid NOT NULL,
        examDate date NOT NULL,
        description text NOT NULL,
    );

--EXAM_MEDICINE--
CREATE TABLE
    exam_medicine (
        exam uuid REFERENCES exam (uuid) ON DELETE CASCADE,
        medicine uuid REFERENCES medicine (uuid),
        quantity integer NOT NULL,
        PRIMARY KEY (exam, medicine)
    );