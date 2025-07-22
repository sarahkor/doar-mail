# 🔒 Security & Validation
This section describes the system’s security model, including authentication, input validation, and protection against malicious inputs.

## 🔑 JWT Authentication
- Upon login or registration, the server issues a JWT (JSON Web Token).

- Token includes:

  - username

  - userId

  - exp (expiry timestamp)

### Storage:
- React: Stored in localStorage

- Android: Stored in SharedPreferences

### Token Usage
- All authenticated requests must include the token in the Authorization header:

``` bash
Authorization: Bearer <token>
```

- Middleware verifies the token on the backend.

### Input Validation
Frontend:

- Empty fields disallowed

- Password fields masked

- Form errors shown inline

- Email/URL format validation

Backend:

- All request bodies validated

- Username and password length constraints

- Duplicate username protection

###  Password Rules
- Minimum length: 8 characters
- Cannot be empty
- Must include uppercase letter
- Must include lowercase letter
- Must include a number
- Must include special character
