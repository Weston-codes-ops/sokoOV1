CREATE TABLE customer_order (
    id uuid PRIMARY KEY,
    customer_id uuid NOT NULL REFERENCES "customer"(id),
    status varchar(24) NOT NULL,
    full_name varchar(120) NOT NULL,
    email varchar(254) NOT NULL,
    phone_number varchar(20) NOT NULL,
    county varchar(100) NOT NULL,
    town varchar(100) NOT NULL,
    delivery_address varchar(255) NOT NULL,
    delivery_notes varchar(500),
    items_subtotal numeric(19, 2) NOT NULL CHECK (items_subtotal >= 0),
    delivery_fee numeric(19, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    total_amount numeric(19, 2) NOT NULL CHECK (total_amount >= 0),
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_order_customer_created
    ON customer_order(customer_id, created_at DESC);

CREATE TABLE order_item (
    id uuid PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES customer_order(id) ON DELETE CASCADE,
    product_id uuid NOT NULL,
    product_name varchar(255) NOT NULL,
    image_url varchar(2048),
    unit_price numeric(19, 2) NOT NULL CHECK (unit_price >= 0),
    quantity integer NOT NULL CHECK (quantity > 0),
    line_total numeric(19, 2) NOT NULL CHECK (line_total >= 0)
);

CREATE INDEX idx_order_item_order ON order_item(order_id);

CREATE TABLE payment_attempt (
    id uuid PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES customer_order(id),
    provider varchar(24) NOT NULL,
    status varchar(24) NOT NULL,
    phone_number varchar(20) NOT NULL,
    amount numeric(19, 2) NOT NULL CHECK (amount > 0),
    merchant_request_id varchar(100),
    checkout_request_id varchar(100) UNIQUE,
    mpesa_receipt_number varchar(32),
    result_code integer,
    result_description varchar(500),
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_attempt_order_created
    ON payment_attempt(order_id, created_at DESC);
