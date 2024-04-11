CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE
    "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
    )
WITH
    (OIDS = FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

--PEOPLE--
CREATE TABLE
    people (
        code uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
        cccd text NOT NULL,
        type text NOT NULL,
        name text NOT NULL,
        phonenumber text NOT NULL,
        email text NOT NULL,
        address integer NOT NULL
    );

--ACCOUNT--
CREATE TABLE
    account (
        code uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
        people uuid REFERENCES people (code) ON DELETE CASCADE,
        username text NOT NULL,
        password text NOT NULL
    );

--MEDICINE--
CREATE TABLE
    medicine (
        code uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
        name text NOT NULL,
        origin text NOT NULL,
        dueDate date NOT NULL,
        unit text NOT NULL,
        price integer NOT NULL
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
        description text NOT NULL
    );

--EXAM_MEDICINE--
CREATE TABLE
    exam_medicine (
        exam uuid REFERENCES exam (code) ON DELETE CASCADE,
        medicine uuid REFERENCES medicine (code),
        quantity integer NOT NULL,
        PRIMARY KEY (exam, medicine)
    );

--INVOICE--
CREATE TABLE
    invoice (
        code uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
        exam uuid REFERENCES exam (code) ON DELETE CASCADE,
        service_fee integer NOT NULL,
        date date NOT NULL
    );

--INVOICE_MEDICINE--
CREATE TABLE
    invoice_medicine (
        invoice uuid REFERENCES invoice (code) ON DELETE CASCADE,
        medicine uuid REFERENCES medicine (code),
        quantity integer NOT NULL,
        price integer NOT NULL,
        PRIMARY KEY (invoice, medicine)
    );

--SCHEDULE--
CREATE TABLE
    schedule (
        code uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
        medico uuid REFERENCES people (code) ON DELETE CASCADE,
        service uuid REFERENCES service (code) ON DELETE CASCADE,
        date date NOT NULL,
        status text NOT NULL
    );

-- Inserting into the people table
INSERT INTO
    people (
        code,
        cccd,
        type,
        name,
        phonenumber,
        email,
        address
    )
VALUES
    (
        uuid_generate_v4 (),
        '123456789',
        'patient',
        'John Doe',
        '123-456-7890',
        'john@example.com',
        123
    ),
    (
        uuid_generate_v4 (),
        '987654321',
        'doctor',
        'Dr. Jane Smith',
        '987-654-3210',
        'jane@example.com',
        456
    ),
    (
        uuid_generate_v4 (),
        '456123789',
        'nurse',
        'Alice Johnson',
        '789-123-4560',
        'alice@example.com',
        789
    );

-- Inserting into the account table
INSERT INTO
    account (code, people, username, password)
VALUES
    (
        uuid_generate_v4 (),
        (
            SELECT
                code
            FROM
                people
            WHERE
                name = 'John Doe'
        ),
        'john_doe',
        'password123'
    ),
    (
        uuid_generate_v4 (),
        (
            SELECT
                code
            FROM
                people
            WHERE
                name = 'Dr. Jane Smith'
        ),
        'dr_smith',
        'doctor456'
    ),
    (
        uuid_generate_v4 (),
        (
            SELECT
                code
            FROM
                people
            WHERE
                name = 'Alice Johnson'
        ),
        'alice_nurse',
        'nurse789'
    );

-- Inserting into the medicine table
INSERT INTO
    medicine (code, name, origin, area, dueDate, unit, price)
VALUES
    (
        uuid_generate_v4 (),
        'Paracetamol',
        'USA',
        100,
        '2024-04-05',
        'mg',
        10
    ),
    (
        uuid_generate_v4 (),
        'Amoxicillin',
        'Europe',
        50,
        '2024-04-05',
        'mg',
        15
    ),
    (
        uuid_generate_v4 (),
        'Aspirin',
        'Germany',
        75,
        '2024-04-05',
        'mg',
        8
    );

-- Inserting into the service table
INSERT INTO
    service (code, name, price, description)
VALUES
    (
        uuid_generate_v4 (),
        'Consultation',
        50,
        'Initial consultation with a doctor'
    ),
    (
        uuid_generate_v4 (),
        'X-Ray',
        100,
        'X-Ray imaging service'
    ),
    (
        uuid_generate_v4 (),
        'Blood Test',
        80,
        'Blood test service'
    );

-- Inserting into the exam table
INSERT INTO
    exam (
        code,
        patient,
        medico,
        service,
        examDate,
        description
    )
VALUES
    (
        uuid_generate_v4 (),
        (
            SELECT
                code
            FROM
                people
            WHERE
                name = 'John Doe'
        ),
        (
            SELECT
                code
            FROM
                people
            WHERE
                name = 'Dr. Jane Smith'
        ),
        (
            SELECT
                code
            FROM
                service
            WHERE
                name = 'Consultation'
        ),
        '2024-04-05',
        'Routine checkup'
    ),
    (
        uuid_generate_v4 (),
        (
            SELECT
                code
            FROM
                people
            WHERE
                name = 'John Doe'
        ),
        (
            SELECT
                code
            FROM
                people
            WHERE
                name = 'Dr. Jane Smith'
        ),
        (
            SELECT
                code
            FROM
                service
            WHERE
                name = 'Blood Test'
        ),
        '2024-04-06',
        'Blood test for allergies'
    ),
    (
        uuid_generate_v4 (),
        (
            SELECT
                code
            FROM
                people
            WHERE
                name = 'John Doe'
        ),
        (
            SELECT
                code
            FROM
                people
            WHERE
                name = 'Dr. Jane Smith'
        ),
        (
            SELECT
                code
            FROM
                service
            WHERE
                name = 'X-Ray'
        ),
        '2024-04-07',
        'X-Ray for chest pain'
    );

-- Inserting into the exam_medicine table
INSERT INTO
    exam_medicine (exam, medicine, quantity)
VALUES
    (
        (
            SELECT
                code
            FROM
                exam
            WHERE
                description = 'Routine checkup'
        ),
        (
            SELECT
                code
            FROM
                medicine
            WHERE
                name = 'Paracetamol'
        ),
        2
    ),
    (
        (
            SELECT
                code
            FROM
                exam
            WHERE
                description = 'Blood test for allergies'
        ),
        (
            SELECT
                code
            FROM
                medicine
            WHERE
                name = 'Amoxicillin'
        ),
        1
    ),
    (
        (
            SELECT
                code
            FROM
                exam
            WHERE
                description = 'X-Ray for chest pain'
        ),
        (
            SELECT
                code
            FROM
                medicine
            WHERE
                name = 'Aspirin'
        ),
        1
    );

-- Inserting into the invoice table
INSERT INTO
    invoice (code, exam, service_fee, date)
VALUES
    (
        uuid_generate_v4 (),
        (
            SELECT
                code
            FROM
                exam
            WHERE
                description = 'Routine checkup'
        ),
        50,
        '2024-04-05'
    ),
    (
        uuid_generate_v4 (),
        (
            SELECT
                code
            FROM
                exam
            WHERE
                description = 'Blood test for allergies'
        ),
        80,
        '2024-04-06'
    ),
    (
        uuid_generate_v4 (),
        (
            SELECT
                code
            FROM
                exam
            WHERE
                description = 'X-Ray for chest pain'
        ),
        100,
        '2024-04-07'
    );

-- Inserting into the invoice_medicine table
INSERT INTO
    invoice_medicine (invoice, medicine, quantity, price)
VALUES
    (
        (
            SELECT
                code
            FROM
                invoice
            WHERE
                date = '2024-04-05'
        ),
        (
            SELECT
                code
            FROM
                medicine
            WHERE
                name = 'Paracetamol'
        ),
        2,
        10
    ),
    (
        (
            SELECT
                code
            FROM
                invoice
            WHERE
                date = '2024-04-06'
        ),
        (
            SELECT
                code
            FROM
                medicine
            WHERE
                name = 'Amoxicillin'
        ),
        1,
        15
    ),
    (
        (
            SELECT
                code
            FROM
                invoice
            WHERE
                date = '2024-04-07'
        ),
        (
            SELECT
                code
            FROM
                medicine
            WHERE
                name = 'Aspirin'
        ),
        1,
        8
    );

-- Inserting into the schedule table
INSERT INTO
    schedule (code, medico, service, date, status)
VALUES
    (
        uuid_generate_v4 (),
        (
            SELECT
                code
            FROM
                people
            WHERE
                name = 'Dr. Jane Smith'
        ),
        (
            SELECT
                code
            FROM
                service
            WHERE
                name = 'Consultation'
        ),
        '2024-04-05',
        'scheduled'
    ),
    (
        uuid_generate_v4 (),
        (
            SELECT
                code
            FROM
                people
            WHERE
                name = 'Dr. Jane Smith'
        ),
        (
            SELECT
                code
            FROM
                service
            WHERE
                name = 'Blood Test'
        ),
        '2024-04-06',
        'scheduled'
    ),
    (
        uuid_generate_v4 (),
        (
            SELECT
                code
            FROM
                people
            WHERE
                name = 'Dr. Jane Smith'
        ),
        (
            SELECT
                code
            FROM
                service
            WHERE
                name = 'X-Ray'
        ),
        '2024-04-07',
        'scheduled'
    );