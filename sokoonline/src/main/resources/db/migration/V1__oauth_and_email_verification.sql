ALTER TABLE "customer"
    ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS email_verified_at timestamp without time zone;

CREATE TABLE IF NOT EXISTS email_verification (
    id uuid PRIMARY KEY,
    customer_id uuid NOT NULL UNIQUE REFERENCES "customer"(id),
    purpose varchar(16) NOT NULL DEFAULT 'SIGNUP',
    code_hash varchar(60) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    failed_attempts integer NOT NULL,
    resend_count integer NOT NULL,
    consumed_at timestamp with time zone
);

ALTER TABLE email_verification
    ADD COLUMN IF NOT EXISTS purpose varchar(16) NOT NULL DEFAULT 'SIGNUP',
    ADD COLUMN IF NOT EXISTS consumed_at timestamp with time zone;

CREATE TABLE IF NOT EXISTS oauth_identity (
    id uuid PRIMARY KEY,
    customer_id uuid NOT NULL REFERENCES "customer"(id),
    provider varchar(30) NOT NULL,
    provider_subject varchar(255) NOT NULL,
    CONSTRAINT uk_oauth_provider_subject UNIQUE (provider, provider_subject),
    CONSTRAINT uk_oauth_customer_provider UNIQUE (customer_id, provider)
);
