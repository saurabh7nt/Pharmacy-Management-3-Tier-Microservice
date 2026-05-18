-- Seed one default admin user for local/dev environments.
-- Password format matches current user-service behavior: encryptPassword() => "encrypted_" + rawPassword
-- Raw password for login: Admin@123

INSERT INTO users (
    first_name,
    last_name,
    username,
    email,
    password,
    role,
    created_at,
    updated_at,
    active
)
SELECT
    'System',
    'Admin',
    'admin',
    'admin@pharmacy.local',
    'encrypted_Admin@123',
    'ADMIN',
    NOW(),
    NOW(),
    TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'admin' OR email = 'admin@pharmacy.local'
);
