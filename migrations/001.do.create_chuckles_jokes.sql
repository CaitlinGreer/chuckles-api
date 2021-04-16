CREATE TABLE chuckles_jokes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    joke TEXT NOT NULL,
    punchline TEXT NOT NULL,
    submitted_by TEXT NOT NULL,
    date_submitted TIMESTAMPTZ DEFAULT now() NOT NULL
);