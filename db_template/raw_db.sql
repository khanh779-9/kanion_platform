CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS account;

CREATE TABLE account.statuses (
  code VARCHAR(20) PRIMARY KEY,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO account.statuses (code, description) VALUES
('active', 'Active account'),
('locked', 'Locked account'),
('deleted', 'Deleted account');

CREATE TABLE account.users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    REFERENCES account.statuses(code),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE account.profiles (
  id BIGSERIAL PRIMARY KEY,
  account_id BIGINT NOT NULL
    REFERENCES account.users(id)
    ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  birthday DATE,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (account_id)
);

CREATE TABLE account.devices (
  id BIGSERIAL PRIMARY KEY,
  account_id BIGINT NOT NULL
    REFERENCES account.users(id)
    ON DELETE CASCADE,
  name TEXT,
  fingerprint TEXT,
  trusted BOOLEAN NOT NULL DEFAULT FALSE,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE account.sessions (
  id BIGSERIAL PRIMARY KEY,
  account_id BIGINT NOT NULL
    REFERENCES account.users(id)
    ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE TABLE account.settings (
  id BIGSERIAL PRIMARY KEY,
  account_id BIGINT NOT NULL
    REFERENCES account.users(id)
    ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (account_id, key)
);

CREATE INDEX idx_accounts_email
  ON account.users(email);

CREATE INDEX idx_sessions_account
  ON account.sessions(account_id);

CREATE INDEX idx_devices_account
  ON account.devices(account_id);

CREATE INDEX idx_settings_account
  ON account.settings(account_id);



-- ====== ENUM ======
CREATE TYPE vault.vault_type AS ENUM (
    'website',
    'email',
    'server',
    'database',
    'application',
    'other'
);

CREATE TABLE vault.items (
  id BIGSERIAL PRIMARY KEY,

  account_id BIGSERIAL NOT NULL
    REFERENCES account.users(id)
    ON DELETE CASCADE,

  type vault.vault_type NOT NULL DEFAULT 'other',

  name TEXT NOT NULL,
  username TEXT,
  email TEXT,

  password TEXT,
  otp_secret TEXT,
  description TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE note.item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    account_id BIGSERIAL NOT NULL,

    title VARCHAR(200),
    content TEXT NOT NULL,

    is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
    password BYTEA, -- nếu note có password

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_note_item_account
        FOREIGN KEY (account_id)
        REFERENCES account.users(id)
        ON DELETE CASCADE
);

CREATE TABLE note.share (
    id BIGSERIAL PRIMARY KEY,

    note_id UUID NOT NULL
        REFERENCES note.item(id)
        ON DELETE CASCADE,

    share_token UUID NOT NULL DEFAULT gen_random_uuid(),
    password_hash TEXT,

    expired_at TIMESTAMPTZ,          -- NULL = vĩnh viễn
    max_views INT,                   -- NULL = không giới hạn
    view_count INT NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,

    UNIQUE (share_token)
);

CREATE TYPE notification.notification_type AS ENUM (
    'security',
    'share',
    'system',
    'info'
);

CREATE TABLE notification.items (
    id BIGSERIAL PRIMARY KEY,

    account_id BIGINT NOT NULL
        REFERENCES account.users(id)
        ON DELETE CASCADE,

    type notification.notification_type NOT NULL DEFAULT 'info',

    title TEXT NOT NULL,
    content TEXT,

    resource_type TEXT,      -- 'note', 'vault', 'session', ...
    resource_id TEXT,        -- id của resource (string cho linh hoạt)

    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE account.security (
    id BIGSERIAL PRIMARY KEY,

    account_id BIGINT NOT NULL
        REFERENCES account.users(id)
        ON DELETE CASCADE,

    security_level SMALLINT NOT NULL DEFAULT 0,
    -- 0: none
    -- 1: OTP when suspicious
    -- 2: OTP every login
    -- 3: password + OTP + device trust

    otp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    otp_secret BYTEA,               -- encrypted
    otp_verified_at TIMESTAMPTZ,

    require_trusted_device BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (account_id)
);


CREATE SCHEMA IF NOT EXISTS wallet;

CREATE TABLE wallet.items (
    id BIGSERIAL PRIMARY KEY,

    account_id BIGINT NOT NULL
        REFERENCES account.users(id)
        ON DELETE CASCADE,

    wallet_type TEXT NOT NULL,
    -- 'crypto', 'blockchain', 'watch_only'

    name TEXT NOT NULL,

    address TEXT,
    encrypted_secret BYTEA NOT NULL, -- private key / seed phrase

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE wallet.metadata (
    id BIGSERIAL PRIMARY KEY,
    wallet_id BIGSERIAL NOT NULL
        REFERENCES wallet.items(id)
        ON DELETE CASCADE,

    key TEXT NOT NULL,
    value TEXT NOT NULL,

    UNIQUE (wallet_id, key)
);


CREATE SCHEMA IF NOT EXISTS breach;

CREATE TABLE breach.monitor (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGSERIAL NOT NULL,

    monitor_type TEXT NOT NULL,
    -- email | username | domain | phone | wallet | custom

    monitor_value TEXT NOT NULL,
    -- email cụ thể, domain, địa chỉ ví, v.v.

    status TEXT NOT NULL DEFAULT 'active',
    -- active | paused | deleted

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_breach_monitor_user
        FOREIGN KEY (user_id)
        REFERENCES account.users(id)
        ON DELETE CASCADE
);

CREATE TABLE breach.result (
    id BIGSERIAL PRIMARY KEY,

    monitor_id BIGSERIAL NOT NULL,

    breached BOOLEAN NOT NULL,
    breach_source TEXT,
    breach_date TIMESTAMP,

    raw_data JSONB,

    checked_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_breach_result_monitor
        FOREIGN KEY (monitor_id)
        REFERENCES breach.monitor(id)
        ON DELETE CASCADE
);




