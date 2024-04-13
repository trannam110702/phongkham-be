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
        address text NOT NULL
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

--EXAM_SERVICE--
CREATE TABLE
    exam_service (
        exam uuid REFERENCES exam (code) ON DELETE CASCADE,
        service uuid REFERENCES service (code),
        PRIMARY KEY (exam, service)
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

-- Generate mock data for People table
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
        '1234567890',
        'patient',
        'John Doe',
        '123-456-7890',
        'john.doe@example.com',
        '123 Main St'
    ),
    (
        uuid_generate_v4 (),
        '0987654321',
        'doctor',
        'Dr. Jane Smith',
        '987-654-3210',
        'jane.smith@example.com',
        '456 Oak St'
    );

-- Generate mock data for Account table
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
        'johndoe',
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
        'drjanesmith',
        'securepassword'
    );

-- Generate mock data for Medicine table
INSERT INTO
    medicine (code, name, origin, dueDate, unit, price)
VALUES
    (
        uuid_generate_v4 (),
        'Paracetamol',
        'USA',
        '2024-04-30',
        'mg',
        10
    ),
    (
        uuid_generate_v4 (),
        'Amoxicillin',
        'Germany',
        '2024-05-15',
        'mg',
        15
    );

-- Generate mock data for Service table
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
    );

-- Generate mock data for Exam table
INSERT INTO
    exam (code, patient, medico, examDate, description)
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
        '2024-04-14',
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
        '2024-04-20',
        'X-Ray examination'
    );

-- Generate mock data for Exam_Medicine table
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
        1
    ),
    (
        (
            SELECT
                code
            FROM
                exam
            WHERE
                description = 'X-Ray examination'
        ),
        (
            SELECT
                code
            FROM
                medicine
            WHERE
                name = 'Amoxicillin'
        ),
        2
    );

-- Generate mock data for Exam_Service table
INSERT INTO
    exam_service (exam, service)
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
                service
            WHERE
                name = 'Consultation'
        )
    ),
    (
        (
            SELECT
                code
            FROM
                exam
            WHERE
                description = 'X-Ray examination'
        ),
        (
            SELECT
                code
            FROM
                service
            WHERE
                name = 'X-Ray'
        )
    );

-- Generate mock data for Invoice table
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
        '2024-04-15'
    ),
    (
        uuid_generate_v4 (),
        (
            SELECT
                code
            FROM
                exam
            WHERE
                description = 'X-Ray examination'
        ),
        100,
        '2024-04-21'
    );

-- Generate mock data for Invoice_Medicine table
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
                date = '2024-04-15'
        ),
        (
            SELECT
                code
            FROM
                medicine
            WHERE
                name = 'Paracetamol'
        ),
        1,
        10
    ),
    (
        (
            SELECT
                code
            FROM
                invoice
            WHERE
                date = '2024-04-21'
        ),
        (
            SELECT
                code
            FROM
                medicine
            WHERE
                name = 'Amoxicillin'
        ),
        2,
        15
    );

-- Generate mock data for Schedule table
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
        '2024-04-15',
        'Scheduled'
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
        '2024-04-20',
        'Scheduled'
    );