- Initially build React + Vite +MUI + NodeJs + Express app
- Later started integrating with AWS services
# Services
1) Cognito
2) Lambda
3) API Gateway
4) DynamoDB
5) S3
6) CloudFront
7) Cloudwatch
# Cognito/ Amazon Cognito
Secure identity and access management for apps.
With Amazon Cognito, you can add registration and sign-in to your applications. You can also get temporary AWS credentials for access to your cloud resources.

---

# 🚀 What You Saw in the Network Logs

Cognito authentication is a **multi-step exchange**, not a simple username/password check.

This is because Cognito uses:

> **SRP (Secure Remote Password Protocol)**

SRP means:

* The password is **never sent to AWS**
* Instead, AWS and the client compare cryptographic proofs

That’s why you saw 3 calls.

---

## ✅ Call #1 — **Initiate Authentication (SRP Start)**

```
AuthFlow: USER_SRP_AUTH
Payload: SRP-A, username, clientId
```

This is:

> "Hi Cognito, here is the SRP challenge start."

Response contains:

```
ChallengeName: PASSWORD_VERIFIER
ChallengeParameters: SRP_B, Salt, etc.
```

Meaning:

> "Okay, now prove the password using SRP math."

---

## ✅ Call #2 — **Password Verifier + Cognito Policies**

Payload sends:

```
ChallengeName: PASSWORD_VERIFIER
SRP proof + your email + session token
```

Cognito validates the SRP proof.
Since this is a newly created admin user with "temporary password", Cognito returns:

```
ChallengeName: NEW_PASSWORD_REQUIRED
```

Meaning:

> "User must set a permanent password before login can complete."

This is exactly normal when you create a user manually in console.

---

## ✅ Call #3 — **New Password Challenge Response**

Payload:

```
ChallengeResponses:
- NEW_PASSWORD
- USERNAME
- SESSION
```

Response:

```
AuthenticationResult: {
   IdToken,
   AccessToken,
   RefreshToken,
   ExpiresIn
}
```

This is the **successful authentication**.

---

# Cognito SRP lifecycle


You accidentally saw the **entire Cognito SRP lifecycle**.

This is gold for understanding AWS auth.

---

# 🧠 How to use this knowledge in an interview

If asked:

> **“How does Cognito authenticate users?”**

You can now answer like a senior engineer:

---

### ⭐ Ideal Interview Answer

> AWS Cognito doesn’t send plaintext passwords.
> Instead, it uses **Secure Remote Password Protocol (SRP)** to negotiate authentication between the client and Cognito service.

> The authentication flow is multi-step:
>
> 1. Client initiates auth with **USER_SRP_AUTH** sending SRP-A.
> 2. Cognito returns SRP challenge including salt and SRP-B.
> 3. Client computes password proof locally and sends **PASSWORD_VERIFIER**.
> 4. If user was created with a temporary password, Cognito responds with **NEW_PASSWORD_REQUIRED**.
> 5. After password change, Cognito returns JWT tokens: **ID token, Access token, Refresh token**.

> These tokens are then used for authorization against API Gateway, Lambda or any protected resource.

---

# 🎓 Why this matters (for your skills)

Understanding this makes you dangerous in:

| Area                         | Why it matters                                     |
| ---------------------------- | -------------------------------------------------- |
| AWS security                 | You understand SRP, JWT tokens, challenge-response |
| Cognito troubleshooting      | You now know why you saw `NEW_PASSWORD_REQUIRED`   |
| Frontend auth flows          | You know login isn’t a single request              |
| API Gateway with authorizers | You understand the token lifecycle                 |
| Interview strength           | Very few frontend devs understand this deep        |

You're not just "using Cognito" — you're **understanding Cognito**.

---

# 🚀 Final Step

Since Cognito responded with:

```
ChallengeName: NEW_PASSWORD_REQUIRED
```

We need to handle that in your React code.

Meaning: next task is updating your login code to support:

* Temporary password users (admin-created)
* First login password reset flow


It is used to 
- Authenticate users (login with lead@example.com).
- Issue JWT tokens (ID token + Access token).
- Those tokens are:
    - Used in React to call your APIs with Authorization: Bearer <token>.
    - Validated by API Gateway Cognito Authorizer before your Lambda is executed.
- So Cognito sits between your UI and your APIs, guarding them.
- It has
    - User pools
    - Identity pools
## User pools
### what is it?
### why is it required?
### How can we integrate?
selected the region as Asia Pacific > Mumbai(ap-south-1)
Amazon Cognito > User pools > Create user pool
#### Define your application
##### Application type
SPA(Single page application)
##### Name your application
Sprint-Tracker-app
#### Configure options
##### Options for sign-in identifiers
Out of E-mail, Phone number, Username, I chose only Email
##### Self-registration
I selected Enable self-registration
##### Required attributes for sign-up
e-mail
=============
## 🔹 Step 1: Define Your Application

On the screen you’re on now:

### 1️⃣ Application type → choose:

> **✅ Single-page application**

Because you’re using React + Vite (SPA).

### 2️⃣ Name your application → set:

> `sprint-tracker-frontend`

This is just a label; it’s for the app client under the pool.

👉 Don’t overthink here. Just SPA + name.

Click **Next** / **Configure options** (whatever button is shown).

---

## 🔹 Step 2: Configure Options (the options you mentioned)

Here you’ll see sections like:

* **Sign-in identifiers**
* **Self-registration**
* **Required attributes**
* **Add a redirect URL** (for Hosted UI)

Here’s what to set:

### 1️⃣ Sign-in identifiers

We want people to log in with email.

* **Select:**
  ✅ **Email**
  ❌ Do NOT enable username or phone for now.

So sign-in is: *"Users sign in with their email address."*

---

### 2️⃣ Self-registration

This controls whether users can sign up on their own.

For your environment (dev/test), it’s fine to allow:

* ✅ Enable self-registration

Even if we don’t build a fancy sign-up UI now, it makes it easier to create users later if needed.

---

### 3️⃣ Required attributes

We **must** have `email` as required. Others (like name, family name, etc.) are not needed right now.

So:

* ✅ `email` → required
* ❌ everything else → optional or not selected

We just want **email** as core attribute.

---

### 4️⃣ Add a redirect URL (this is for Hosted UI)

Right now we are using **`Auth.signIn(username, password)`** directly from React, not the Hosted UI (redirect-based login).

But the new wizard often nudges you to set this anyway.

Do this:

* Add this as redirect URL:

  ```
  http://localhost:5173/
  ```

* If there is a **sign-out URL** field, use the same:

  ```
  http://localhost:5173/
  ```

This won’t hurt anything, and if we later decide to try Hosted UI, it’s already correct.

---

Now go **Next** / **Review / Create user pool**.

Some wizard screens may show:

* Security policies (password, MFA) → leave defaults, MFA disabled for now.
* Email settings → fine with defaults (Cognito can send emails without extra config in dev).

Finally, click:

> **Create user pool**

---

## 🔹 After Creation: What You Need to Note

Once the pool is created:

1. On pool overview, note:

   * **User pool ID** → something like `ap-south-1_USXcq9vQBBD`

2. On “App integration” / “Application clients” tab, note for your `sprint-tracker-frontend` app:
App Client Name: sprint-tracker-frontend

   * **Client ID** --> 44mfu9vmbd2uisd7kjdlr455muBD

3. Region is the one you see at the top right of the console, e.g.:

   * `Mumbai (ap-south-1)` → so region = `ap-south-1`

You’ll plug these into `aws-exports.ts`.

---

## 🔹 What to Do Right Now

1. Finish the wizard with these choices:

   * Single-page application
   * Name = `sprint-tracker-frontend`
   * Sign-in with **Email**
   * Self-registration = enabled
   * Required attribute = **email only**
   * Redirect URL = `http://localhost:5173/`

2. Click **Create user pool**.

3. Then tell me:

> “User pool created. I have region, userPoolId, clientId.”

1QStart:
Good question — and yes, there **is a reason** I told you to name the app client:

> `sprint-tracker-frontend`

and NOT just repeat the name of the whole system.

Let me break it down **clean and fast**:

---

### ✅ Cognito Does **NOT** represent one application — it represents **authentication for many apps**

A Cognito **User Pool** can support:

* A web frontend
* A mobile app
* An admin dashboard
* A machine–to–machine backend
* CLI scripts
* Integrations with other services

Each of those is not a new *user pool* — it's a new **app client**.

So what we named as:

> `sprint-tracker-frontend`

means:

🟢 This client represents **your React web UI**
👉 Using `Auth.signIn()`
👉 No client secret (because browser apps can’t store secrets securely)

Later, we may add:

| Client Name                | Purpose                             | Has Secret? |
| -------------------------- | ----------------------------------- | ----------- |
| `sprint-tracker-frontend`  | Your React SPA website              | ❌ No        |
| `sprint-tracker-backend`   | Lambda/API Gateway/JWT verification | ✅ Yes       |
| `mobile-client` (optional) | Mobile version someday              | ❌ No        |
| `internal-job-runner`      | Scripts calling Cognito backend     | ✅ Yes       |

So yes — I named it **frontend** because **Cognito expects multiple clients**, and each requires different security rules.

---

### 🧠 Why not just call everything the same name?

Because:

* A frontend **must not** have a client secret
* A backend or automation service **must have** a client secret
* Backends may use different token flows (Client Credentials, Admin API)
* Roles and scopes may differ (frontend users vs service accounts)

Mixing them creates:

❌ Incorrect security
❌ Confusion later
❌ Hard to manage tokens and permissions

So naming it clearly now prevents architectural mistakes later.

---

### 🚀 Final Answer to Your Question

> **“Is there a chance we will create another app client for backend later?”**

👉 **Yes — absolutely.**

When we integrate authentication into:

* Lambda
* API Gateway

We will generate a **second Cognito App Client** for backend usage.

So:
✔️ `sprint-tracker-frontend` (React SPA)
⬜ `sprint-tracker-backend` (later for AWS services)

This is **the clean, scalable, real-world way**.

---

### Ruthless Mentor Verdict

👍 You’re thinking the right way and noticing architecture decisions — good sign.

Now keep going:

#### Your next task:

👉 Finish creating the Cognito pool with the settings I gave you.

Then tell me one line:

> **“Cognito user pool created. I have region + clientId + userPoolId.”**

Once you confirm, we move to wiring Amplify and replacing your login logic.

1QEnd:
2QStart:
Good, this is exactly the kind of architecture question you *should* be asking.

Short, ruthless answer:

> **Yes – frontend and backend share the *same user data* in ONE Cognito User Pool.**
> They do **not** duplicate users. They may use **different app clients**, but **same pool, same users**.

Let’s untangle it cleanly.

---

## 🧠 Mental Model

* **User Pool = database of users + passwords + attributes**
  (this is where emails, passwords, attributes live)

* **App Client = way an application talks to that pool**

  * `sprint-tracker-frontend` → used by React SPA
  * `sprint-tracker-backend` → used by backend services (if needed later)

> All app clients under the same pool **see the same users**.

There is **no duplicate data**. One user pool, multiple access paths.

---

## 🟢 What frontend does

Your **React app**:

1. Calls Cognito via `Auth.signIn(email, password)` using `sprint-tracker-frontend` client.
2. Cognito checks the **same User Pool**.
3. If valid → returns JWT tokens.
4. React stores token and attaches it to API calls to your backend:

```http
Authorization: Bearer <JWT>
```

---

## 🔵 What backend does

Your **Lambda/API backend** does NOT have its own users.

Backend simply:

1. Receives token from React in `Authorization` header.
2. Verifies token **against the same Cognito User Pool**.
3. If valid → allows access to your API.

For backend, you usually don’t even need a separate app client. It just **validates** tokens that frontend got.

Sometimes, you create a **second app client** for backend if:

* Backend itself needs to call Cognito as a client (e.g., Machine-to-Machine, service login).
* You’re using special flows (client credentials, admin APIs).

But even then:

* **User Pool is the same**
* **User data is the same**
* No duplication

---

## 🔁 So to your exact question:

> “So, for the frontend and backend, do we use the same data, like to eliminate duplication… We feed the same data to Cognito frontend and backend?”

✅ Yes.

* You have **one source of truth**: the User Pool
* The frontend **authenticates users** against it
* The backend **verifies tokens** issued by it
* You do **not** create separate users for backend and frontend

Think of it as:

* **One Database (User Pool)**
* **Multiple Clients (front, back, mobile, etc.)**

---

## What this means for your project right now

Right now, we’re doing **only this**:

* React (frontend)
  → logs in via Cognito User Pool
  → gets token
  → continues working with your existing Node backend

Later, when we:

* Replace Node backend with **API Gateway + Lambda**
* Protect API Gateway routes with **Cognito Authorizer**

We’ll still be using the **same User Pool**, same users, same tokens. No duplication.

---

If that clicked, good.
Now, back to execution:

👉 Have you **finished creating the Cognito User Pool + app client** yet?

If **yes**, your next move is:

* Create `aws-exports.ts`
* Wire `Amplify.configure`
* Swap `LoginPage` to `Auth.signIn`

If you tell me, *“Pool created, I have region / poolId / clientId”*, I’ll give you **exact code to paste** next.

2QEnd:
3QStart:
Good catch — this matters.

### 👉 **For localhost, always use *HTTP*, not HTTPS.**

Why?

* Your local dev server (`vite`) runs on **[http://localhost:5173](http://localhost:5173)**, **not https**.
* If you put `https://localhost:5173`, Cognito will try to redirect securely and the browser will block it or fail because you don't have a local TLS certificate.

So the value should be:

```
http://localhost:5173/
```

Even if Cognito form pre-fills `https://`, you must **change it to http://** for local development.

---

### ⚠️ But for production later (when hosted on S3 + CloudFront):

You will use HTTPS:

e.g.:

```
https://sprinttracker.yourdomain.com
```

But we are not there yet.

---

### Summary

| Environment        | Redirect URL             |
| ------------------ | ------------------------ |
| Local dev          | `http://localhost:5173/` |
| Production (later) | `https://<your-domain>/` |

---

💬 So answer to your question:

> **Use `http://localhost:5173/`, not HTTPS.**

---

Once you save that, continue setup.

When you're ready, tell me:

> **“Redirect URL updated. Cognito user pool created.”**

Then I’ll give you the next exact code step.

3QEnd:
4Qstart:
Short answer:
Yes, Cognito is *built* around JWTs – that’s the standard way it works. JWT vs session ID is not “more secure by default”; security depends on **how** you handle tokens/sessions. Cognito gives you several secure patterns to choose from.

Let’s break it down in practical terms for your project.

---

## 1️⃣ Can we safely use JWTs with Cognito?

Yes. Cognito **User Pools** issue three JWTs:

* **ID token** – who the user is (profile/claims)
* **Access token** – what the user can do (scopes, groups)
* **Refresh token** – used to get new ID/access tokens

These tokens are:

* **Digitally signed** (you can verify signature & expiry)
* **Time-bound** (short-lived access/ID tokens)
* **Standard OIDC-compliant**, so API Gateway / custom backend can validate them without a DB lookup.

So *using JWTs with Cognito* is not some custom hack; it’s literally the **intended, standard** usage.

---

## 2️⃣ JWT vs Session ID – which is “more secure”?

You’re really comparing two *architectural styles*:

### 🟦 JWT-based (stateless)

Typical Cognito flow:

1. User authenticates (Hosted UI / SDK).
2. Cognito returns JWTs.
3. Client sends `Authorization: Bearer <access_token>` to your API.
4. API verifies token signature + expiry.

**Security pros:**

* No server-side session store → less state to manage.
* Signature + expiry means:

  * APIs can independently verify tokens.
  * Works very well for **microservices** and API Gateway.
* Standard validation libraries, clear lifetime boundaries.

**Security cons / risks (if done wrong):**

* If you store tokens in **localStorage** and you get XSS → attacker steals token.
* Token revocation is not instant (you rely on expiry + some revocation logic).

### 🟥 Session ID (stateful)

Old-school web apps:

1. User logs in.
2. Server creates a session record in DB/Redis and returns **session ID in a cookie**.
3. Browser sends cookie automatically on every request.

**Security pros:**

* You can invalidate a session instantly by deleting it from DB.
* With **Secure + HttpOnly cookies**, XSS cannot directly read the cookie value.

**Security cons:**

* Server-side store (DB/Redis) required.
* Harder for distributed / microservice / API Gateway setups.
* You’ll **still** need to integrate with Cognito to know who the user is; Cognito will emit JWTs anyway, and you’ll wrap them in your own session.

---

## 3️⃣ So which should *you* use for this AWS project?

For your **API Gateway + Lambda + Cognito** style project, the “native” approach is:

> **Use Cognito JWT access tokens as Bearer tokens for your API.**

That’s exactly what API Gateway’s Cognito Authorizer is built for.

Then choose *where* you keep the tokens:

* **Safe-ish quick option for your project**:

  * Get tokens in frontend (React).
  * Store them in memory (state) and refresh as needed.
  * Avoid localStorage if you can; if you must use it for now, at least understand the XSS risk.

* **More enterprise / production style**:

  * Use authorization code flow with PKCE.
  * Exchange code in a backend.
  * Your backend sets a **Secure, HttpOnly cookie** (session) and internally maps that to JWTs.
    → This gives you both: Cognito security + traditional cookie-based session UX.

JWT vs session ID **isn’t** “secure vs insecure”; it’s **stateless vs stateful** and “where do you put your complexity”.

---

## 4️⃣ What authentication options does Cognito actually give (security-wise)?

Think in layers:

### 4.1 How users sign in

Cognito User Pool supports:

* **Username & password**
* **Email / phone number as username**
* **Federated logins**:

  * Google, Facebook, Apple, etc. (social IdP)
  * SAML providers (e.g., corporate SSO)
  * OIDC providers

Passwords are never directly stored by you; Cognito uses secure hashing and offers **SRP (Secure Remote Password)** protocol for enhanced security during auth exchange.

---

### 4.2 How you protect accounts (MFA & risk-based controls)

You can enable:

* **MFA (Multi-Factor Auth)**

  * SMS OTP
  * TOTP (e.g., Google Authenticator)
  * WebAuthn/FIDO2 (security keys, platform authenticators) – depending on configuration
* **Adaptive / risk-based authentication**:

  * Block sign-in from unusual locations / devices.
  * Compromised credentials checks (if enabled).
* **Device tracking** & “remember this device” style configs.

For a secure setup in your project, bare minimum:

* Enforce strong password policy.
* Turn on TOTP MFA for at least privileged/demo users.
* Consider advanced security / adaptive auth if available in your account.

---

### 4.3 How the app consumes auth (flows / grants)

Typical secure flows with Cognito:

1. **Authorization Code + PKCE (recommended for SPAs)**

   * User redirected to Hosted UI.
   * After login, Cognito redirects back with `code`.
   * Your app exchanges `code` → tokens.
     This avoids sending the user’s password directly to your JS app.

2. **Resource Owner Password (username/password via SDK)**

   * Less preferred for SPAs; harder to keep credentials away from client.

3. **Hosted UI + Social/SAML providers**

   * You don’t manage passwords at all; just receive tokens.

For **security**, prefer:

* **Authorization Code + PKCE**, not implicit flow.
* Short-lived access tokens.
* Use refresh tokens cautiously; store them only where safe (often server-side).

---

### 4.4 Token-level security

You can adjust:

* Token expiration periods.
* What claims are inside (custom attributes).
* Which app clients can issue which tokens.
* Global sign-out (invalidate refresh tokens for a user).
* App Client secret use (for confidential clients / backend, not browser code).

---

## 5️⃣ How to think about this simply

Given your context (AWS project, API Gateway + Lambda + React):

* ✅ **Yes, use Cognito JWT tokens** – that’s the expected pattern.
* ✅ It’s secure *if* you:

  * Use proper auth flow (auth code + PKCE is best).
  * Validate tokens correctly in API Gateway / Lambda.
  * Store tokens safely (prefer memory/HttpOnly cookies over localStorage).
* 🔁 If you really like “session IDs”, you can:

  * Use Cognito → verify JWT on backend → issue your own session cookie → store mapping in Redis/DB.
    But that’s extra work unless the assignment specifically wants session IDs.

---

If you tell me:

* **Is your frontend a pure SPA (React/Vite) with no backend server of your own?**
  I can give you a concrete “this is the best auth design for *your* case” and show the exact flow diagram + what to store where.
Yes — JWTs are secure **when used correctly**, but they come with **very real risks** if implemented poorly.

Here’s the **brutal truth** in simple English:

> JWTs are powerful because they are **stateless, portable, and valid anywhere until they expire.**
> That also means:
> **If someone steals your JWT → they *are you* until expiry.**

So the main risk isn’t JWT technology — it’s how you **store, transmit, and validate** it.

---

# 🔥 Key Security Risks with JWTs

### **1️⃣ Token Theft (Most Common Risk)**

If a JWT is stored in:

* `localStorage`
* `sessionStorage`
* React state without protection
* IndexedDB
* Browser cache

…then a successful **XSS attack** can read it.

👉 If an attacker gets the token, they can call your API as the user.

This is the **#1 real-world JWT failure point.**

---

### **2️⃣ No Built-In Revocation**

Unlike server sessions (where you delete a row in DB and session dies):

* JWTs remain valid **until expiry**
* They cannot be globally invalidated easily.

Solutions include:

* Short token TTL (5–15 mins)
* Refresh token rotation
* Token blacklist (DB, Dynamo, Redis)
* Cognito global sign-out (works but not instant across API cache)

---

### **3️⃣ Long Expiry Is Dangerous**

A long-lived access token = more damage if stolen.

Best practice:

| Token Type    | Good Lifetime               |
| ------------- | --------------------------- |
| Access token  | **5–15 mins**               |
| ID token      | **1 hour**                  |
| Refresh token | **30 days (rotate on use)** |

---

### **4️⃣ Weak Signature Validation / No Validation**

Some amateur implementations make mistakes like:

❌ Not verifying signature
❌ Trusting claims without verifying issuer, audience, expiration
❌ Accepting unsigned tokens (`alg="none"` vulnerability)

Correct validation must check:

```
- Signature validity (using JWKS)
- `iss` matches Cognito user pool
- `aud` matches your app client ID
- `exp` not expired
```

AWS API Gateway + Cognito Authorizer does this automatically — good.

---

### **5️⃣ Sending JWTs via Query Params**

Example:
`https://mysite.com/callback?token=eyJhbGci...`

This leaks tokens in:

* Browser history
* Logs
* Analytics trackers
* Reverse proxies
* Referrer headers

👉 **Never send JWT in URL.**

Use:

* Cookies
* Post message secure channel
* Authorization header

---

### **6️⃣ CSRF (If Token Is in Cookies)**

If you store JWT in cookies (especially with `Authorization` header fallback):

* Cross-site attacker could trigger requests automatically.

Mitigation:

* `SameSite=Lax` or `Strict`
* CSRF token
* Only backend reads the cookie

---

### **7️⃣ Using JWT as a Database**

If you stuff too many claims in JWT (roles, permissions, flags, dynamic data):

* You cannot update those until token refresh.
* Leaked token gives attacker more intel.

Keep claims minimal.

---

### **8️⃣ Too Much Trust in Client**

JWTs are **self-contained**, not trustworthy by default.
Backend must still enforce authorization.

Example mistake:

```js
if (token.payload.role === 'admin') {
   allow(); // NO, NEVER TRUST CLIENT
}
```

User can edit their JWT payload in seconds if not validated with signature.

---

---

# 🛡️ How to Use JWTs Safely (Best Practices)

| Area                   | Best Practice                                                    |
| ---------------------- | ---------------------------------------------------------------- |
| Storage                | Use **Secure HttpOnly cookies** if possible. Avoid localStorage. |
| Expiry                 | Short-lived access tokens, use refresh tokens for renewal.       |
| Validation             | Verify signature, issuer, audience, and expiration.              |
| Transport              | Always send over HTTPS. Never in URLs.                           |
| Refresh Token Security | Rotate refresh tokens and revoke on suspicious reuse.            |
| Threat Controls        | Enable MFA, rate limiting, anomaly detection.                    |

---

# 🚀 In Your AWS Cognito Project

You are safe if you:

✔ Use **Authorization Code + PKCE Flow**
✔ Store JWTs in **memory** or **HttpOnly secure cookies**
✔ Let **API Gateway Cognito Authorizer** verify tokens
✔ Keep token TTL short
✔ Use Refresh Token rotation

---

# Summary

JWTs are **not inherently insecure**.

They are secure, modern, and widely used (AWS, Auth0, Google, Microsoft, Okta, GitHub).

**BUT**:

> They are easy to use **insecurely**, especially in SPAs using `localStorage`.

If someone steals the token → game over until expiry or revocation.

4Qend
5Qstart
# ✅ 1. **Does Cognito charge you for users you created?**

No — **Cognito does NOT charge per user stored.**

You can create **10 users or 10,000 users — no cost for just existing users.**

Billing is based on **MAUs (Monthly Active Users)**, meaning:

> A user counts toward billing only if they **sign in during a given month**.

### Free Tier Benefits:

| Item                                      | Free Allowance                          |
| ----------------------------------------- | --------------------------------------- |
| MAUs (User logins/authenticated sessions) | **50,000 per month**                    |
| SMS MFA messages                          | **Not entirely free (SMS costs apply)** |

So if it's just you testing or a few users logging in → **you’ll stay free.**

---

# ⚠️ 2. **What *can* cost money in Cognito?**

Cognito by itself is mostly free for your usage, **BUT** these can create unexpected charges:

| Feature                                    | Cost?    | Notes                                                            |
| ------------------------------------------ | -------- | ---------------------------------------------------------------- |
| SMS MFA codes                              | 💲 Yes   | AWS charges per SMS (varies per country). India SMS = not cheap. |
| Email via SES instead of Cognito’s default | 💲 Maybe | SES emails can incur cost after free tier.                       |
| OAuth hosted UI, tokens, auth flow         | 🆓 Free  | counts toward MAU only.                                          |

So:

### 👉 If you enabled SMS MFA — TURN IT OFF unless you really need it.

Use **TOTP (Google Authenticator)** instead – it's free.

---

# 🧊 3. How to avoid cost now and long-term

Here’s the **practical strategy** for you:

| Action                                                   | Why                              | Cost Result                 |
| -------------------------------------------------------- | -------------------------------- | --------------------------- |
| Disable **SMS MFA**                                      | It costs money                   | Saves 100% SMS charges      |
| Use Auth only for testing (small usage)                  | Low volume → stays under 50K MAU | $0                          |
| Disable email/verification messages if using dummy users | Avoid SES costs                  | $0                          |
| Delete unused Cognito User Pools                         | Reduce clutter                   | No effect on cost, but safe |
| Use AWS Budgets + Alerts                                 | Warns you proactively            | Protection from surprises   |

---

# 🔧 How to make Cognito low-cost or zero-cost

### 🔹 Step 1: Disable SMS MFA

Go to:

> Cognito → User Pool → **Authentication** → MFA and verifications
> ➡ Set MFA to **OFF** or **TOTP only**

### 🔹 Step 2: Use TOTP instead of SMS

* Free
* Still secure

### 🔹 Step 3: Avoid unnecessary email triggers

Under **Message templates**, disable or reduce verification flows if not required.

### 🔹 Step 4: Use Cognito hosted UI (free) instead of SES email triggers

Hosted UI signs users in without extra infra.

### 🔹 Step 5: Set a **Billing Alert**

AWS Billing → Budgets → Create Budget:

* Type: **Cost budget**
* Amount: **$5**
* Alert when forecast > $1

---

# 💵 Summary: Expected Cost for YOU

| AWS Component               | Free?                                              | Notes                       |
| --------------------------- | -------------------------------------------------- | --------------------------- |
| Cognito Users               | ✔ Free                                             | No charge for storing users |
| Monthly logins (MAUs < 50k) | ✔ Free                                             | You're safe                 |
| Hosted UI                   | ✔ Free                                             | No cost                     |
| JWT Token refresh/auth      | ✔ Free                                             | Included                    |
| Lambda                      | ✔ Free tier covers ~1M invokes/month               |                             |
| DynamoDB                    | ✔ On-demand + low usage = likely free or near-free |                             |
| API Gateway                 | ❓ Small cost (~$0.30–$2/month depending on calls)  |                             |
| SMS MFA                     | ❌ Costs per message                                | Disable                     |

Realistically, if you're the only user testing:

> **Total AWS monthly cost: $0–$1**

Worst case if you forget something running:

> **$2–$5 max (from API Gateway + Dynamo overhead).**

---

# ✔️ Going forward, I’ll follow your rule:

Whenever I tell you:

* "Create X"
* "Enable Y"
* "Deploy Z"

I will also add:

1. **Expected cost**
2. **Tips to keep cost at or near zero**
3. **When to shut it off if unused**

5Qend
6Qstart

1. **The Dev-Mode version of your architecture and cost behavior**
2. **A clear list of AWS services and whether they can be paused/disabled/auto-zero-cost when unused (and how).**

This will help you stop AWS from quietly billing you.

# ✅ DEV-MODE ARCHITECTURE (What you're building)

| Component         | Service              | Pay Model                                | Dev Mode Status                     |
| ----------------- | -------------------- | ---------------------------------------- | ----------------------------------- |
| Auth              | Cognito              | Free up to 50k MAUs                      | ✔ Good                              |
| Backend Execution | Lambda               | Pay per request                          | ✔ Essentially free while unused     |
| API Front Door    | API Gateway          | Pay per call (pennies but NOT free tier) | ⚠ Minimal but still can cost        |
| Data Store        | DynamoDB (On-Demand) | Pay per read/write                       | ✔ free if no traffic                |
| Identity/Logs     | CloudWatch           | Small storage cost if logs accumulate    | ⚠ Needs cleanup or retention policy |

# My anology:
API gate way is like receptionist
http request is like some customer coming to reception and query
1 lambda function is like friend of some http request
DynamoDB's data is like water tank/ electricity source for that entire suite
receptionist(API gate way) asks customer(http request) if they have proof(valid JWT token) that their friend is same as the one in their suit room
If yes, they'll redirect http request to the related lambda function which is using the data from DynamoDB

So in Dev Mode:

* **Only real cost risk = API Gateway + CloudWatch logs**
* Everything else can be near zero.

---

# ✅ PART 1 — Can these be "disabled" or “stop billing” when unused?

Here’s the truth — **AWS does NOT have a “pause project” button**.

Some services auto-scale to zero naturally, some do not.

Let’s break it down:

---

### ⭐ Lambda → **Zero cost when unused**

* ✔ No billing if nobody triggers it.
* ⚠ Logs may cost pennies unless retention is set.

👉 Action: Set CloudWatch retention to **3–7 days.**

---

### ⭐ DynamoDB On-Demand → **Almost zero when unused**

* ✔ No reads = No cost
* ⚠ Minimal storage charge (e.g., ₹1–₹10/month depending on data)

👉 Action: Use **On-Demand mode**, not Provisioned.

---

### ⭐ Cognito → **Zero cost unless users authenticate**

* ✔ No charge for stored users
* ✔ Free for 50,000 MAUs
* ⚠ MFA SMS costs → you already disabled (good)

👉 No action needed.

---

### ⚠ API Gateway → **NOT zero cost but tiny**

* API Gateway REST API **charges per million calls**
* BUT even if unused, there is **no fixed cost**.

So cost behavior:

| Calls Per Month | Cost           |
| --------------- | -------------- |
| 0               | **₹0**         |
| Few (testing)   | **₹5–₹30 max** |

👉 So: **No need to disable. Just don’t spam it.**

---

### ⚠ CloudWatch Logs → May accumulate charge slowly

* Every Lambda creates logs.
* AWS charges tiny amounts for storage.

👉 Fix:
Set retention to **7 days** or **1 day** and you're safe.

---

# 🛑 But what if you want TRUE $0 when unused?

Then these are your options:

### 🟢 Option 1 — **Export infra using Terraform/CDK → Delete → Re-deploy**

* Delete whole stack → cost = 0
* When needed again → run deployment → everything comes back

This is the **real way developers do "freeze billing".**

AWS isn't like a computer you "shut down" — you delete services and redeploy later.

---

### 🟢 Option 2 — **Delete DynamoDB + API Gateway, keep Cognito**

* Cognito user storage is free
* DynamoDB stores data, so if deleted → data gone
* Frontend won't work until redeployed

---

### 🟢 Option 3 — **Keep everything but remove roles to prevent accidental use**

Not necessary, but safe.

---

# 🧠 Recommended Approach for YOU (Balanced)

Do this to prevent charges:

| Item               | What to do                               |
| ------------------ | ---------------------------------------- |
| Lambda             | leave as-is                              |
| DynamoDB           | On-Demand + delete test rows if unneeded |
| Cognito            | leave as-is                              |
| API Gateway        | leave (low cost)                         |
| CloudWatch Logs    | set retention = 3 days                   |
| Billing Protection | enable budget alerts                     |

---

# 🚨 Must-Do Step (RIGHT NOW)

Go to:

> AWS Billing → Budgets → Create Budget

Set:

* Monthly cost alert at **₹200 INR**
* Notify email if cost is forecasted to exceed **₹100**

This prevents surprises.

---

# 🔥 Quick Checklist to Freeze Billing If You Go Idle

| Task                                     | Cost Impact                                |
| ---------------------------------------- | ------------------------------------------ |
| Disable/shorten CloudWatch log retention | Saves recurring storage                    |
| Delete DynamoDB table if no data needed  | Saves storage                              |
| Delete API Gateway stages                | Removes endpoints, avoids accidental calls |
| Keep Cognito + Lambda                    | **Zero cost idle**                         |

---

# SUMMARY

You are already in a **serverless model**, which is designed to cost almost nothing during inactivity.

So:

> **No traffic → almost ₹0 monthly.**

If you want **perfect zero**, then:

👉 Delete DynamoDB tables & API Gateway
👉 Keep the Lambda, Cognito, and React code
👉 Redeploy later (takes minutes)

---

Would you like me to:

1. **Create a “Shutdown Script” — deletes everything safely and logs state**
2. **Create a “Redeploy Script” — rebuilds the entire stack automatically**
3. **Both (recommended)**

Reply: `Shutdown`, `Redeploy`, or `Both`.

6qend
7Qstart
Yes — you *can* absolutely restart AWS services with **default data** every time you recreate the environment.
And you can do it in a clean, automated way — not manual clicking.

There are **three levels** depending on how professional you want it.

---

## 🔥 OPTION 1 — Infra as Code + Seed Script (Most Practical)

You deploy with CDK/Terraform → THEN run a **seeding script** that:

* Creates default **Cognito users**
* Inserts default **DynamoDB records**
* Uploads default static files to **S3** (if needed)

This script can be:

```
npm run seed
```

Or made automatic after deployment.

Example workflow:

```
cdk deploy   --> creates infra
npm run seed --> creates demo users + sample data
```

This way:

* The database starts fresh every time
* Default users always exist
* You can version-control the seed data

🔹 BEST FOR YOUR DEV MODE.

---

## 🔥 OPTION 2 — CDK/Terraform Creates Resources + Also Seeds Data

Both CDK and Terraform can **seed DynamoDB** and **create Cognito users** directly during deployment.

However:

* CDK → easier & more flexible (because you can run AWS SDK inside Lambda Custom Resource)
* Terraform → also possible but more awkward because `aws_cognito_user` exists but requires careful lifecycle logic.

Example CDK pattern:

* Define DynamoDB table & Cognito in CDK
* Add a **Custom Resource Lambda** called `SeedResource`
* On first deploy → Lambda runs:

  * `AdminCreateUser()` for your default users
  * `PutItem()` for default sprint setup data

CDK pseudo-code:

```ts
new CustomResource(this, "Seed", {
  serviceToken: seedLambda.functionArn,
});
```

Seed Lambda would check DynamoDB/Cognito and populate if empty.

---

## 🔥 OPTION 3 — S3 Snapshot Backup + Restore (Not required for now, but good to know)

You can:

* Export DynamoDB table to S3
* Store a JSON snapshot
* Restore it every time environment is recreated

Same for:

* Cognito user export/import (currently requires CLI + AWS import feature)

This is more for teams or prod testing — **overkill for you** right now.

---

---

## ✅ What YOU Need Based on Your Goals

You are in **Dev Mode**, meaning:

* Create everything on demand
* Destroy when not using
* Recreate with known state

So the right approach for **you right now** is:

> **CDK + a seed script (Option 1).**

Simple, predictable, and version-controlled.

---

### 👇 What your seed script can include:

#### 🟢 DynamoDB default entries

Example seed JSON:

```json
[
  {
    "protocolKey": "P-1",
    "name": "Login Flow",
    "uiAssignee": "dev1",
    "uiSP": 3,
    "serverAssignee": "dev2",
    "serverSP": 5
  },
  {
    "protocolKey": "P-2",
    "name": "User Profile",
    "uiAssignee": "dev1",
    "uiSP": 2,
    "serverAssignee": "dev3",
    "serverSP": 4
  }
]
```

Seed script:

```js
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
...
```

(We will generate this script once stack is ready.)

#### 🟢 Cognito default users

Two default dev users — example:

```
lead@demo.com
dev@demo.com
```

Script uses AWS SDK:

```js
const cognito = new CognitoIdentityProvider();
await cognito.adminCreateUser({
  UserPoolId,
  Username: "lead@demo.com",
  TemporaryPassword: "Password123!"
});
```

Optional: auto-confirm them for convenience.

---

---

## FAQ (In Your Style 👇)

### ❓ When I redeploy, will default users always come back?

✔ Yes — because the **seed script recreates them** after deployment.

---

### ❓ Will I be billed for those users even if unused?

❌ No — Cognito charges by **MAU (Monthly Active User)**, not stored users.

So storing users = **FREE**.

---

### ❓ Can I also seed DynamoDB every time?

✔ Yes — with:

* `delete existing → put new` logic
* OR `if empty → insert defaults`

---

### ❓ Can this run automatically after deploy?

✔ Yes — best practice:

* CDK deploy
* Custom Resource triggers seed Lambda
* Seed Lambda creates users + data

Fully automated.

---

---

## FINAL ROADMAP FOR YOU

| Step | Action                                                     |
| ---- | ---------------------------------------------------------- |
| 1    | Finish minimal CDK stack (Cognito, Lambda, Dynamo, API GW) |
| 2    | Add seed script (`npm run seed`)                           |
| 3    | Optionally automate with CDK Custom Resource               |
| 4    | Destroy stack when not using (`cdk destroy`)               |
| 5    | Deploy + seed when needed (`cdk deploy && npm run seed`)   |

---

### If you say:

👉 **“Use CDK and give me starter stack + seed script”**

I will generate:

* `/infra/` folder
* `cdk.json`
* `bin/app.ts`
* `lib/infrastructure-stack.ts`
* `seed.js`
* Deploy + destroy commands

So just respond:

```
CDK please.
```

(You can also ask Terraform later if you want comparison or migration.)

7Qend
8Qstart
Good — this is the right question.
Let’s drop the “dev mode thinking” and answer like **someone designing a real SaaS product**.

---

## 🧨 First: In real-world production, companies do **NOT** destroy and recreate infra every time.

Prod environments are **persistent**.

Instead, companies do this pattern:

| Environment                       | Lifecycle                                 |
| --------------------------------- | ----------------------------------------- |
| **Production**                    | Permanent. Never destroyed.               |
| **Staging/UAT**                   | Permanent or auto-reset with test data.   |
| **Sandbox/Dev/Test environments** | Can be destroyed/recreated automatically. |

So your idea of reset/redeploy is **valid only for non-prod environments.**

---

## 🏆 Most commonly used in the market (real industry answer)

| Option                          | Used in real world?                                  | Typical Purpose                            |
| ------------------------------- | ---------------------------------------------------- | ------------------------------------------ |
| **CDK + Seed Data automation**  | ⭐⭐⭐⭐ Widely used in AWS-native teams                 | Serverless backend, IaC + automation       |
| **Terraform + Seed automation** | ⭐⭐⭐⭐⭐ Most common across multi-cloud or larger teams | Infra standardization across AWS/Azure/GCP |
| **Manual + Scripts only**       | ⭐ Rare and unprofessional                            | Startups early stage, hacky                |
| **Amplify without IaC**         | ⭐⭐ Common for small startups & prototypes            | Fast start, less control                   |

### **Winner in industry: *Terraform first, CDK second.***

But…

---

## 🧭 For a serverless AWS-centric stack like yours?

👉 **AWS CDK is the most natural fit.**

Why?

* Works with **Lambda, API Gateway, DynamoDB, Cognito, S3** easily
* Uses **Node/TypeScript**, which matches your project
* Integrates well with **CI/CD and serverless deployments**

Terraform is great, but requires:

* More boilerplate
* Separate cloud knowledge
* More maturity

So:

| Category                          | Best Option            |
| --------------------------------- | ---------------------- |
| AWS-native serverless app (yours) | **CDK**                |
| Multi-cloud / enterprise infra    | **Terraform**          |
| Quick prototypes                  | Amplify Console or CDK |

---

## 💰 Cost Comparison (Real Numbers)

Let’s compare **runtime cost difference**.
IaC choice does **NOT** change AWS billing — only how you manage infrastructure.

So cost is based on architecture, not CDK vs Terraform.

### With your stack (Cognito + Lambda + DynamoDB + APIGW + CloudFront + S3):

| Service                 | Cost in Production (Light traffic)                   |
| ----------------------- | ---------------------------------------------------- |
| Cognito                 | Free for first 50k monthly active users              |
| Lambda                  | Pay per request (~₹0–₹200/month unless high traffic) |
| API Gateway (REST)      | Most expensive piece → can be ₹300–₹2,500/month      |
| DynamoDB                | ₹0–₹400 depending on usage                           |
| CloudFront              | Cheap, but depends on bandwidth                      |
| S3 hosting static files | ₹5–₹50/month                                         |
| CloudWatch logs         | ₹10–₹300/month unless retention is controlled        |

### Biggest surprise cost in real projects?

> 🔥 **API Gateway** (because pay-per-request)

#### Cost Optimization Path in production:

| Stage                   | Service Choice                    | Cost Impact         |
| ----------------------- | --------------------------------- | ------------------- |
| Phase 1 (early)         | REST API Gateway                  | Simple but pricier  |
| Phase 2 (scale)         | HTTP API Gateway                  | Cuts cost by ~70%   |
| Phase 3 (heavy traffic) | AppSync (GraphQL) or ALB + Lambda | Can be even cheaper |

---

## 🌍 Real company approach to cost and infra setup

| Phase  | Team Behavior                                                          |
| ------ | ---------------------------------------------------------------------- |
| Start  | CDK/Terraform + simple deployment + low-cost serverless                |
| Growth | Optimizing: HTTP API instead of REST API Gateway, VPC lambda if needed |
| Scale  | Use multiple stacks, CI/CD, environment isolation                      |

---

## 🎯 Final Answer You Asked For (Straight, No Fluff)

> **Production Preferred:**

* **Terraform in general industry**
* **CDK in AWS-native serverless teams (like your project)**

> **Most Cost-Effective Runtime Stack for Production:**

* Cognito (auth)
* **Lambda + DynamoDB + HTTP API Gateway (NOT REST)**
* S3 + CloudFront hosting frontend
* Tight CloudWatch retention policies

> **Cheapest long-term architecture:**

* **CDK-managed infrastructure + HTTP API Gateway + DynamoDB + Lambda**

---

## 🔥 Want me to build your CDK repo with:

* Cognito user pool
* DynamoDB table
* HTTP API Gateway wired to Lambdas
* CloudFront + S3 hosting
* Auto-create 2 default users
* Optional seed data Lambda
* Dev + Prod environment support

?

Just reply:

```
Build CDK repo.
```
8Qend
9Qstart
> **Cognito Authorizer ON + test from Postman using a real JWT from your browser.**
## 1️⃣ Preconditions (what must already be in place)

This should already be true or you’re close:

1. **Cognito User Pool** with:

   * At least one test user (you created earlier)
   * An **App client** (preferably *no client secret* for SPA)

2. **API Gateway → Cognito Authorizer** configured:

   * Type: **Cognito**
   * User Pool: your pool
   * On your method (e.g. `GET /api/my-work`), `Authorization` set to **that authorizer** (not `NONE`).

If that’s done, API Gateway now *demands* a `Bearer <token>`.

---

## 2️⃣ Step 1 – Get a real JWT token from the browser

You said you’ll use the browser → Network tab → Postman. Good.

### Option A (easiest): Copy the Authorization header from your frontend call

1. Open your React app in the browser.
2. Log in via Cognito (Hosted UI or your login flow).
3. Open **DevTools → Network**.
4. Trigger one of your backend calls (e.g. “Load My Work”).

Then:

* Click the request to your backend, e.g.:

  ```
  https://<api-id>.execute-api.<region>.amazonaws.com/dev/api/my-work
  ```

* Go to **Headers** tab.

* In **Request Headers**, find:

  ```text
  Authorization: Bearer eyJraWQiOiJ...
  ```

* Double-click just the token part (`eyJ…`) and copy it.

That string is your **access token (or id token)**.
We’ll use it in Postman.

> If you **don’t** see `Authorization` in your frontend request, it means your React code is not yet adding the token header. In that case, see Option B.

---

### Option B: Copy token from Cognito `/oauth2/token` response

If your app uses Cognito Hosted UI (auth code flow), you’ll see a request like:

* `https://<your-domain>.auth.<region>.amazoncognito.com/oauth2/token`

Steps:

1. In Network tab, filter by **`token`**.

2. Click the `oauth2/token` request.

3. Open **Response** tab.

4. You’ll see JSON like:

   ```json
   {
     "access_token": "eyJraWQiOiJ...",
     "id_token": "eyJhbGciOiJIUzI1...",
     "refresh_token": "...",
     "expires_in": 3600,
     "token_type": "Bearer"
   }
   ```

5. Copy the value of **`access_token`** (prefer this for API Gateway).

Both `/oauth2/token` response and Authorization header are fine; just grab **one valid JWT**.

---

## 3️⃣ Step 2 – Use that token in Postman

Now we plug this into Postman to hit your API **with Cognito auth enabled**.

### Example: test `/api/my-work`

1. Open Postman → **New Request**

2. Method: `GET`

3. URL:

   ```text
   https://<api-id>.execute-api.<region>.amazonaws.com/dev/api/my-work
   ```

4. Go to **Headers** tab, add:

   | Key           | Value                                |
   | ------------- | ------------------------------------ |
   | Authorization | `Bearer <paste-your-JWT-token-here>` |

   Example:

   ```text
   Authorization: Bearer eyJraWQiOiJabc...xyz
   ```

5. Click **Send**.

If:

* Token is valid
* Authorizer is configured against the same user pool
* The method uses that authorizer

👉 You should get the **real Lambda response** (JSON), not 401/403.

---

## 4️⃣ Step 3 – Testing secured POST endpoints

For something like:

```http
POST /api/sprint-setup
```

In Postman:

1. Method: `POST`

2. URL:

   ```text
   https://<api-id>.execute-api.<region>.amazonaws.com/dev/api/sprint-setup
   ```

3. Headers:

   ```text
   Authorization: Bearer <your-token>
   Content-Type: application/json
   ```

4. Body → select **raw**, **JSON**, e.g.:

   ```json
   [
     {
       "protocolKey": "P-1",
       "name": "Login Flow",
       "uiAssignee": "Dev1",
       "uiSP": 3,
       "serverAssignee": "Dev2",
       "serverSP": 5
     }
   ]
   ```

5. Send → Lambda writes to Dynamo → 200 OK with your message.

---

## 5️⃣ What if it fails? (Key error patterns)

When you test with Cognito Authorizer, these are the common ones:

### ❌ 401 / 403 from API Gateway

* Message like: **“Unauthorized”** or **“Missing Authentication Token”**

Check:

* Did you include the `Authorization` header at all?
* Is it exactly `Bearer <space><token>`?
* Is your method actually using the Cognito authorizer (not `NONE`)?

> “Missing Authentication Token” often means **wrong path or method** (e.g., POST instead of GET, or missing `/dev` stage).

---

### ❌ 403 with message about token / claims

* Could be:

  * Expired token (`exp` passed)
  * Token issued for a **different user pool** or wrong clientId

Fix:

* Log in again in browser → copy *fresh* token.
* Make sure API Gateway authorizer is pointing to the **same User Pool**.

---

### ❌ You see Lambda called in CloudWatch but response is weird

Then it’s not auth anymore – it’s your function logic or event parsing.
Look at:

* `event.requestContext.authorizer.claims` to see user info.
* `event.body`, `event.pathParameters` etc.

---

## 6️⃣ Cost side (since you asked me to always mention)

What you’re doing (manual tests with Postman):

* **API Gateway requests** → tiny cost per 1,000 calls
* **Lambda invocations** → almost certainly in free tier
* **DynamoDB reads/writes** → pay-per-request, your volumes are tiny

You won’t notice cost from occasional Postman testing.
The only real risk is if some script starts hammering the API in a loop.

---

## 7️⃣ Summary in your words

* ✅ Yes, you can and **should** test **with Cognito Authorizer enabled.**
* ✅ Flow = login in browser → copy JWT → paste as Bearer token in Postman.
* ✅ This proves **end-to-end security** is working, not just “lambda works without auth”.

Whenever you’re ready, if you want, I can show you how to:

* Print `claims` in your Lambda to know *which user* called it.
* Restrict data by user (e.g., `userId = sub` from token).
9Qend
===========
Cognito on AWS is done
### Cognito integration in Reactjs code
Nice. 🎯 That means Cognito is finally set up:

* Application: `sprint-tracker-frontend`
* User pool: something like `…exec4gm` (full ID shows on details page)

Now we wire this into your React app.

I’ll give you **very concrete next steps**. Just follow them in order.

---

## 1️⃣ Grab the 3 important values

In AWS Console → Cognito → your new user pool:

1. **Region**
   Check top-right of the console.
   Example: `Mumbai (ap-south-1)` → region = `ap-south-1`.

2. **User Pool ID**
   On the pool’s **Overview** page, you’ll see something like:
   `ap-south-1_exec4gm`
   → copy the whole thing.

3. **App client ID** for `sprint-tracker-frontend`
   Go to **App integration → App clients** (or similar tab).
   You’ll see your app client with a **Client ID** like:
   `6h2kxxxxxxxxxxxxxxx` → copy it.

Keep these three ready.

---

## 2️⃣ Install aws-amplify in your client

In your project **client** folder:

```bash
cd client
npm install aws-amplify
```

If this fails, stop and paste the error. If it succeeds, go on.

---

## 3️⃣ Create `src/aws-exports.ts`

In `client/src`, create a file called `aws-exports.ts`:

```ts
// client/src/aws-exports.ts
const awsConfig = {
  Auth: {
    region: "ap-south-1",                 // ← your region
    userPoolId: "ap-south-1_exec4gm",     // ← your actual User Pool ID
    userPoolWebClientId: "YOUR_CLIENT_ID" // ← your actual App Client ID
  },
};

export default awsConfig;
```

Replace all three placeholders with your real values.

---

## 4️⃣ Wire Amplify in `main.tsx`

Open `client/src/main.tsx`.

At the **very top**, add:

```ts
import { Amplify } from "aws-amplify";
import awsConfig from "./aws-exports";

Amplify.configure(awsConfig);
```

Leave the rest of the file (ReactDOM, BrowserRouter, ThemeProvider, etc.) as-is.

---

## 5️⃣ Update `LoginPage` to use Cognito

Open `client/src/pages/LoginPage.tsx`.

1. At the top, add:

```ts
import { Auth } from "aws-amplify";
```

2. Find your `handleSubmit` (or similar) and change it to:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    const user = await Auth.signIn(username, password);

    const idToken = user.signInUserSession.idToken.jwtToken;

    onLoginSuccess(idToken, user.username, "lead"); // we can refine role logic later
  } catch (err: any) {
    console.error("Cognito sign-in error:", err);
    setError("Invalid username or password (Cognito)");
  }
};
```

Keep the JSX form, input fields, and button as they are.

---

## 6️⃣ Create a test Cognito user

In the Cognito User Pool:

* Go to **Users** → **Create user**
* Email: e.g. `lead@example.com`
* Password: e.g. `Test@12345`
* If there’s **“Force user to change password at next sign-in”**, **uncheck** it for now.

Now you have:

* Username/email: `lead@example.com`
* Password: `Test@12345` (or whatever you set)
Good, you stopped and asked **before** clicking random things. This screen is important.

You’re on **Create user** inside your Cognito User Pool, and it’s asking for:

* Invitation message
* Email
* Mark email as verified
* Temporary password (set / generate)

Here’s **exactly** what to do for *our* case (you are the user, not some external customer).

---

## ✅ What to choose on this "Create user" screen

### 1️⃣ Invitation message

Since this user is **you**, we don’t need AWS to send you an email.

* ✅ **Select:** `Don't send an invitation`

We will manually use the password you set and log in directly from your app.

---

### 2️⃣ Email address

Set:

* **Email address** → whatever you want to log in with, e.g.:

```text
lead@example.com
```

* ✅ Tick **“Mark email address as verified”**

This avoids email confirmation flows / codes for now.

---

### 3️⃣ Phone number

You can ignore this completely for now:

* Leave **Phone number** empty
* Do **NOT** tick "Mark phone number as verified"

We’re not using phone login.

---

### 4️⃣ Temporary password

Here you have two options: **Set a password** or **Generate a password**.

Choose:

* ✅ `Set a password`

Then enter something you know, e.g.:

```text
Test@12345
```

> ⚠️ You MUST remember this value – this is what you’ll use on your React login page.

If you see any checkbox like:

* “Require user to reset password on next sign-in”
* “User must change password at next sign-in”

👉 **Uncheck it** if the UI allows.

If there’s no such option, then Cognito will treat this as a temporary password and might ask you to set a new one on first login. If that happens, we’ll handle it in code later. For now, just move ahead.

---

## After clicking **Create user**

You should see this user listed under **Users** in the pool, with status something like `FORCE_CHANGE_PASSWORD` or `CONFIRMED` depending on how Cognito treats it.

Either way, for now remember:

* **Username / email**: `lead@example.com` (or what you chose)
* **Password**: `Test@12345` (or what you set)

---

## Next step (don’t skip this):

Once this user is created, you are ready to:

1. Make sure `aws-exports.ts` is configured
2. Amplify is configured in `main.tsx` (you already showed it 👍)
3. Update `LoginPage` to call `Auth.signIn(email, password)`

If you’ve already done (1) and (2), and the only missing thing is **LoginPage**, send me your current `LoginPage.tsx` and I’ll rewrite the `handleSubmit` **exactly** for your file so you don’t have to guess.

Then you’ll:

* Start server + client
* Try logging in with this user
  → If it works, we’re done with basic Cognito.
  → If you get `NEW_PASSWORD_REQUIRED` or some error, we’ll handle that next.
Use **`lead@example.com` — it is perfectly fine.** 👍
You do **NOT** need a real email for local development.

Why?

* We already selected **“Mark email address as verified”**
* We disabled invitation emails
* Cognito will not try to send anything
* Your app only cares that the user exists and can authenticate

So using a fake but valid-looking email like:

```
lead@example.com
test.user@dummy.com
admin@local.dev
```

is **standard practice** in development.

---

### 🚨 Only case where you need a real email:

Later, if you enable:

* MFA
* Forgot password flows
* Hosted UI verification
* Email OTP login

Then you need a real inbox.

But for **now** (local Cognito + Auth.signIn flow):

✔ fake email OK
✔ no verification required
✔ no OTP needed
✔ login will work

---

### So final answer:

> **Yes — use `lead@example.com`. No real email required.**

---

When the user is created, tell me:

➡ **“User created. Ready to update LoginPage.”**

Then we paste the exact login code and test.
Good, this is a *real* problem, not you being confused.
You’ve hit the **new Amplify v6 API**, and you’re using the **old v5 style**.

So:

* ❌ `import { Auth } from "aws-amplify";` → **no longer works in v6**
* ❌ `Auth: { region, userPoolId, userPoolWebClientId }` → **wrong config shape for v6**

We fix both.

---

## ✅ Step 1 – Fix `aws-exports.ts` for Amplify v6

Replace your current `aws-exports.ts` with this structure:

```ts
// src/aws-exports.ts
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: "ap-south-1_exec4gm",    // 🔁 your actual User Pool ID
      userPoolClientId: "YOUR_CLIENT_ID",  // 🔁 your actual App Client ID
      region: "ap-south-1",                // 🔁 your region
    },
  },
};

export default awsConfig;
```

Key differences:

* `Auth.Cognito` instead of just `Auth`
* `userPoolClientId` (not `userPoolWebClientId`)
* Includes `region` inside `Cognito`

This matches the v6 `ResourcesConfig` typing and will fix the **main.tsx type error**.

Your `main.tsx` stays the same:

```ts
import { Amplify } from "aws-amplify";
import awsConfig from "./aws-exports";

Amplify.configure(awsConfig);
```

---

## ✅ Step 2 – Fix `LoginPage.tsx` to use new Auth API

In Amplify v6, there is **no `Auth` export from "aws-amplify"**.
You must use the **modular auth APIs** from `"aws-amplify/auth"`.

### 2.1 Change imports

At the top of `LoginPage.tsx`, **remove**:

```ts
import { Auth } from "aws-amplify";
```

and **add**:

```ts
import { signIn, fetchAuthSession } from "aws-amplify/auth";
```

---

### 2.2 Update `handleSubmit`

Replace your current `handleSubmit` with this v6-friendly version:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    // 1) Ask Cognito to sign in
    const result = await signIn({
      username, // this should be the email
      password,
    });

    // If Cognito needs more steps (like NEW_PASSWORD_REQUIRED), we can handle later
    if (result.nextStep?.signInStep !== "DONE") {
      console.warn("Sign-in requires additional step:", result.nextStep);
      setError("Sign-in requires an additional step (e.g. password change). Not handled yet.");
      return;
    }

    // 2) Fetch the current auth session to get tokens
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString() ?? "";

    // 3) Reuse your existing login success logic
    onLoginSuccess(idToken, username, "lead");
  } catch (err: any) {
    console.error("Cognito sign-in error:", err);
    setError("Invalid username or password (Cognito)");
  }
};
```

Keep everything else in `LoginPage` (state, JSX form, etc.) as-is.

---

## ✅ Step 3 – Quick sanity checks

1. `aws-exports.ts` is now:

   * `Auth: { Cognito: { userPoolId, userPoolClientId, region }}`
   * Exporting `default awsConfig`

2. `main.tsx`:

   * `Amplify.configure(awsConfig);` — ✅ still correct

3. `LoginPage.tsx`:

   * Uses `signIn` and `fetchAuthSession` from `"aws-amplify/auth"`
   * No more `Auth` import

---

## ✅ Step 4 – Run and test

Restart dev server to be safe:

```bash
# in client
npm run dev
```

Then:

* Open `http://localhost:5173/`
* Log in with your Cognito user:

  * username/email: `lead@example.com` (or whatever you created)
  * password: the one you set

Now one of three things will happen:

1. ✅ You land on Dashboard → **WIN: Cognito + Amplify v6 working**
2. ❌ You see an error in UI + console like `User is not confirmed` / `Password reset required` / etc.
3. ❌ You see some TypeScript or runtime error from Amplify

---

## 🎯 Your next reply to me should be:

* **“Login working with Cognito (v6).”**
  or
* **“Error: <copy exact red error from console or terminal>”**

Don’t summarize the error — **copy it exactly**.
I’ll adjust for `NEW_PASSWORD_REQUIRED`, `UserNotConfirmedException`, or anything else you hit.

You’re not dumb; you just collided with a breaking change in Amplify.
You handled it the right way — asked and adapted.

---

## 7️⃣ Run and test locally

Make sure both are running:

```bash
# in server/
node server.js

# in client/
npm run dev
```

Open:
`http://localhost:5173/`

On the login page:

* Enter the email + password of the Cognito user you just created
* Hit Login

Now either:

* ✅ You’re taken to Dashboard → **Cognito integration is working**
* ❌ You see an error → check **browser console** and copy the exact error

---

## What I want from you now

Do steps 2→7, then tell me exactly one of:

* **“Login working with Cognito.”**
* **“Login failed, console says: <paste error message>”**

No shame if it fails — then we debug precisely.
You’re doing the right thing by wiring this properly instead of faking it.
Nice, you read the whole wizard. That’s exactly what confuses most people. Let me be blunt:

### ❌ We are **NOT** going to follow that React OIDC / Hosted UI quick-start.

### ✅ We are going to use the **simpler, direct Cognito + aws-amplify Auth.signIn** route.

What you’re seeing is:

* A **new Cognito quick setup** that pushes:

  * `react-oidc-context`
  * redirect-based Hosted UI
  * `authority`, `clientId`, `redirectUri`, etc.

That is **one valid approach**, but it’s heavier:

* More libraries
* Full-page redirects
* Need precise callback/logout URLs
* More moving parts to debug

You don’t need that complexity **right now**.

---

## 🧠 Two ways to use Cognito in React

1. **Hosted UI + OIDC + react-oidc-context**
   → What the wizard is showing you
   → Sign in with redirect to Cognito’s hosted login page
   → Needs OIDC client, callback URLs, etc.

2. **Direct Cognito Auth API + aws-amplify** ✅
   → What I told you to do
   → `Auth.signIn(username, password)` from your own login form
   → No redirect, just an API call to Cognito
   → Much easier to wire into your existing LoginPage

We are doing **#2**. That is completely valid, documented, and used in many real projects.

So:

> Ignore the “Install react-oidc-context and copy this App.js / index.js template” part.
> That is **not** our path.

The only things we care about from Cognito are:

* Region
* User Pool ID
* App Client ID
* (Optional) Redirect URL we already set to `http://localhost:5173/` – doesn’t hurt.

Everything else: noise **for now**.

---

## 🔥 What you should do NEXT (concrete, no theory now)

We’re past the wizard. Cognito pool + app client are created. Good.

Now, in your project:

---

### 1️⃣ In `client` folder, install aws-amplify

```bash
cd client
npm install aws-amplify
```

---

### 2️⃣ Create `src/aws-exports.ts`

In `client/src/aws-exports.ts`:

```ts
// client/src/aws-exports.ts
const awsConfig = {
  Auth: {
    region: "ap-south-1",                 // 👈 your region from AWS console
    userPoolId: "ap-south-1_exec4gm",     // 👈 your actual User Pool ID
    userPoolWebClientId: "YOUR_CLIENT_ID" // 👈 your actual App Client ID
  },
};

export default awsConfig;
```

Fill in YOUR exact values.

---

### 3️⃣ Wire Amplify in `main.tsx`

At the top of `client/src/main.tsx`:

```ts
import { Amplify } from "aws-amplify";
import awsConfig from "./aws-exports";

Amplify.configure(awsConfig);
```

Keep everything else in `main.tsx` as it is.

---

### 4️⃣ Change `LoginPage` to use Cognito Auth

In `client/src/pages/LoginPage.tsx`:

At top:

```ts
import { Auth } from "aws-amplify";
```

Replace your submit logic with:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    const user = await Auth.signIn(username, password);
    const idToken = user.signInUserSession.idToken.jwtToken;

    onLoginSuccess(idToken, user.username, "lead");
  } catch (err: any) {
    console.error("Cognito sign-in error:", err);
    setError("Invalid username or password (Cognito)");
  }
};
```

We are **not** using any of the `react-oidc-context` / `AuthProvider` / `useAuth()` stuff from the wizard.

---

### 5️⃣ Create a test user in the pool

In Cognito console → your User Pool → **Users → Create user**:

* Email: `lead@example.com`
* Password: `Test@12345` (or similar)
* Uncheck “must change password” for now (if present).

---

### 6️⃣ Start servers and test

```bash
# backend
cd server
node server.js

# frontend
cd client
npm run dev
```

Then in browser: `http://localhost:5173/` → login with that Cognito user.

---

## 🎯 What I want from you now

Don’t worry about the wizard code samples.
You are **not** dumb for being confused — AWS’s UX *is* confusing.

You do this:

1. Install `aws-amplify`
2. Create `aws-exports.ts`
3. Wire `Amplify.configure` in `main.tsx`
4. Swap `LoginPage` to use `Auth.signIn`
5. Create one Cognito user
6. Try logging in

Then tell me:

> **“Cognito login working”**
> or
> **“Cognito login failing with: <copy exact console error>”**

We’ll fix whatever happens next, but we’re staying on the **Amplify Auth path**, not the OIDC quickstart path.

## Identity pools
### what is it?
### why is it required?
### How can we integrate?
# LAMBDA (Why are we choosing Lambda over others)
When you go beyond Node 16.x in Lambda, a few things change:

* Node doesn't include `aws-sdk` anymore
* Lambda expects **modules, not raw inline scripts**
* You must **bundle dependencies** (like using `npm install` + ZIP or Docker)
* Most use **Infrastructure-as-Code (IaC)** like CDK, Serverless Framework, or SAM

So experienced devs almost never write Lambdas directly in the AWS console.
They develop locally, bundle, test, then deploy.

---

### 🔥 The reality in modern AWS Lambda workflows:

Most production teams use one of these:

| Tool                           | Purpose                             | Benefit                                      |
| ------------------------------ | ----------------------------------- | -------------------------------------------- |
| **AWS CDK**                    | Infra + functions declared in code  | Runtime set correctly, dependencies packaged |
| **Serverless Framework**       | Deploy Lambdas + API Gateway easily | Bundles Node modules automatically           |
| **AWS SAM**                    | Local testing + deployment          | Can run Lambda locally                       |
| **esbuild / Webpack / Rollup** | Bundles node modules into one file  | Removes import/require errors                |
| **Layers**                     | Shared SDK or libs                  | Avoid bundling dependencies repeatedly       |

So when they use Node 18/20 — they **package the code with dependencies** before deploying.

---

### 🚀 Example workflow of a modern developer using Node 20.x

```
mkdir lambda && cd lambda
npm init -y
npm install @aws-sdk/client-dynamodb
```

Code (ESM style):

```js
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
```

Then bundle:

```
npx esbuild index.js --bundle --platform=node --outfile=dist/index.js
```

Then deploy using:

```
serverless deploy
```

or:

```
cdk deploy
```

or:

```
sam build && sam deploy
```

💡 That bundling step resolves:

* `"aws-sdk not found"`
* `"require not supported"`
* `"module resolution failed"`

---

### 💡 Why you hit errors now

You are using:

❌ **Inline editor**
❌ **Node 20.x (doesn’t include AWS SDK)**
❌ **ESM mode (`*.mjs`)**
❌ **No bundling or dependency packaging**

So you're basically doing **advanced runtime style using beginner deployment tools** — mismatch.

What you did by switching to **Node 16 + CommonJS** is exactly what AWS expects when editing directly in console.

That’s why:

* `require('aws-sdk')` works
* No bundling needed
* No packaging step required

---

### 🧠 So the rule of thumb:

| Situation                                          | Best Runtime                                | Packaging Needed?           |
| -------------------------------------------------- | ------------------------------------------- | --------------------------- |
| **Learning / editing code in AWS console**         | Node.js **14 or 16** + CommonJS (`require`) | ❌ No                        |
| **Local development + CI/CD + CDK/SAM/Serverless** | Node.js **18/20** + ESM                     | ✅ Yes (bundle dependencies) |

---

### Your current path is correct for learning

You’re:

* Building
* Testing with DynamoDB + API Gateway + Cognito
* Validating your backend design

Once your project is **fully working**, then:

> You migrate to **CDK or Serverless Framework**, upgrade to **Node 20**, bundle dependencies, and deploy properly.

---

### Final mindshift:

> **Beginners write code in AWS Console.
> Experienced engineers deploy packages.
> Senior engineers automate deployments.**

You're moving from stage 1 → stage 2 → stage 3.

And you're doing it correctly.

---

If you're mentally reset and ready:

Say:

```
GET test succeeded
```

(or paste the next error).
Good you asked now 😄
Given where you are (using console editor, just want it to work):

> 👉 **Yes, lower the Lambda runtime to Node.js 16.x and use the CommonJS (`require`) code.**
> Don’t fight Node 20 + ESM + packaging right now.

That’s the simplest, least-friction path for you.

---

## ✅ Option I recommend (do THIS now)

### Step 1 – Change runtime to Node.js 16.x

1. Open your Lambda **SprintSetupHandler**.
2. Go to **Configuration → General configuration → Edit**.
3. Set **Runtime = Node.js 16.x**.
4. Save.

*(No cost impact; runtime version doesn’t change billing.)*

---

### Step 2 – Use CommonJS code in `index.js`

1. Go to **Code** tab.

2. Make sure your handler file is `index.js` (if it’s index.mjs, either:

   * rename it to `index.js`, or
   * create a new file `index.js` and use that).

3. Put this **exact code** in `index.js`:

```js
const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.SPRINT_SETUP_TABLE_NAME || "SprintSetupTable";

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // dev only; tighten later
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  try {
    console.log("ENV TABLE:", TABLE_NAME);
    console.log("Incoming event:", JSON.stringify(event));

    const method = event.httpMethod;

    if (method === "GET") {
      const result = await dynamo
        .scan({
          TableName: TABLE_NAME,
        })
        .promise();

      return response(200, result.Items || []);
    }

    if (method === "POST") {
      const rows = JSON.parse(event.body || "[]");

      if (!Array.isArray(rows)) {
        return response(400, { message: "Invalid sprint setup payload" });
      }

      const existing = await dynamo
        .scan({
          TableName: TABLE_NAME,
          ProjectionExpression: "protocolKey",
        })
        .promise();

      const deleteRequests =
        existing.Items?.map((item) => ({
          DeleteRequest: {
            Key: { protocolKey: item.protocolKey },
          },
        })) || [];

      const putRequests = rows.map((row, index) => ({
        PutRequest: {
          Item: {
            protocolKey: row.protocolKey || `P-${index + 1}`,
            name: row.name || row.protocolKey || `Protocol ${index + 1}`,
            fixedVersion: row.fixedVersion || "",
            targetDate: row.targetDate || null,
            clarification: row.clarification || "",

            uiAssignee: row.uiAssignee || null,
            uiSP: Number(row.uiSP) || 0,

            serverAssignee: row.serverAssignee || null,
            serverSP: Number(row.serverSP) || 0,

            dbAssignee: row.dbAssignee || null,
            dbSP: Number(row.dbSP) || 0,

            ldapAssignee: row.ldapAssignee || null,
            ldapSP: Number(row.ldapSP) || 0,
          },
        },
      }));

      const allRequests = [...deleteRequests, ...putRequests];

      const chunks = (arr, size) =>
        arr.reduce((acc, _, i) => {
          if (i % size === 0) acc.push(arr.slice(i, i + size));
          return acc;
        }, []);

      for (const batch of chunks(allRequests, 25)) {
        const params = {
          RequestItems: {
            [TABLE_NAME]: batch,
          },
        };
        await dynamo.batchWrite(params).promise();
      }

      return response(200, {
        message: "Sprint setup saved",
        count: rows.length,
      });
    }

    return response(405, { message: "Method Not Allowed" });
  } catch (err) {
    console.error("SprintSetupHandler error", err);
    return response(500, { message: "Internal Server Error" });
  }
};
```

4. Click **Deploy**.

---

### Step 3 – Make sure handler is correct

1. Go to **Configuration → Runtime settings**.
2. Ensure **Handler = `index.handler`**.
3. Save if needed.

---

### Step 4 – Re-run your test events

**GET event:**

```json
{
  "httpMethod": "GET"
}
```

**POST event:**

```json
{
  "httpMethod": "POST",
  "body": "[{\"protocolKey\":\"P-1\",\"name\":\"Test Protocol\",\"uiAssignee\":\"Dev1\",\"uiSP\":3}]"
}
```

Both should now succeed if IAM + env var are set correctly.

---

## 🧠 What about Node 20?

If you *insist* on Node 20 later, you’d need to:

* Install `@aws-sdk/client-dynamodb` (v3) with `npm`
* Bundle code and dependencies with a tool (esbuild/webpack)
* Upload a ZIP or use CDK/SAM/Serverless

That’s “next level”. For where you are **today**, dropping to Node 16 + `require` is exactly what most people do when they’re learning.

---

So:
👉 **Yes, lower Node version to 16 and use the CommonJS code above. No other changes needed right now.**

Once you do that, tell me what happens with the **GET test** (status + any error).

Ahhh, got it now.
If **Node.js 20.x is the lowest option** in the runtime dropdown, that means in your region AWS has **stopped offering 16.x/18.x for new functions**.

So:

* ❌ We **cannot** downgrade to Node 16 from the console.
* ❌ We **cannot** rely on `aws-sdk` being preinstalled.
* ✅ We **must package the SDK with your function code and upload as a ZIP.**

This is exactly how people “survive” on higher Node versions in Lambda 😄

Let’s fix this properly.

---

## 🌟 What we’ll do

1. Create a **small folder on your laptop** for this Lambda.
2. Put **our `index.js`** file in it.
3. Run `npm install aws-sdk` so `node_modules/aws-sdk` is included.
4. ZIP the folder and upload it to Lambda.
5. Test again – no more `Cannot find package 'aws-sdk'`.

This is standard real-world Lambda workflow.

---

## 1️⃣ On your local machine – prepare the Lambda package

Do this on your laptop (Windows):

### Step 1: Create a project folder

Pick a location, for example `C:\aws-lambdas\SprintSetupHandler`

* Create folder: `SprintSetupHandler`

Inside it, you’ll have:

```
SprintSetupHandler/
  index.js
  package.json
  node_modules/  (after install)
```

### Step 2: Create `index.js` with our Lambda code

Open VS Code or Notepad++ and create a file `index.js` inside `SprintSetupHandler` with this content:

```js
const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.SPRINT_SETUP_TABLE_NAME || "SprintSetupTable";

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // dev only; tighten later
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  try {
    console.log("ENV TABLE:", TABLE_NAME);
    console.log("Incoming event:", JSON.stringify(event));

    const method = event.httpMethod;

    if (method === "GET") {
      const result = await dynamo
        .scan({
          TableName: TABLE_NAME,
        })
        .promise();

      return response(200, result.Items || []);
    }

    if (method === "POST") {
      const rows = JSON.parse(event.body || "[]");

      if (!Array.isArray(rows)) {
        return response(400, { message: "Invalid sprint setup payload" });
      }

      const existing = await dynamo
        .scan({
          TableName: TABLE_NAME,
          ProjectionExpression: "protocolKey",
        })
        .promise();

      const deleteRequests =
        existing.Items?.map((item) => ({
          DeleteRequest: {
            Key: { protocolKey: item.protocolKey },
          },
        })) || [];

      const putRequests = rows.map((row, index) => ({
        PutRequest: {
          Item: {
            protocolKey: row.protocolKey || `P-${index + 1}`,
            name: row.name || row.protocolKey || `Protocol ${index + 1}`,
            fixedVersion: row.fixedVersion || "",
            targetDate: row.targetDate || null,
            clarification: row.clarification || "",

            uiAssignee: row.uiAssignee || null,
            uiSP: Number(row.uiSP) || 0,

            serverAssignee: row.serverAssignee || null,
            serverSP: Number(row.serverSP) || 0,

            dbAssignee: row.dbAssignee || null,
            dbSP: Number(row.dbSP) || 0,

            ldapAssignee: row.ldapAssignee || null,
            ldapSP: Number(row.ldapSP) || 0,
          },
        },
      }));

      const allRequests = [...deleteRequests, ...putRequests];

      const chunks = (arr, size) =>
        arr.reduce((acc, _, i) => {
          if (i % size === 0) acc.push(arr.slice(i, i + size));
          return acc;
        }, []);

      for (const batch of chunks(allRequests, 25)) {
        const params = {
          RequestItems: {
            [TABLE_NAME]: batch,
          },
        };
        await dynamo.batchWrite(params).promise();
      }

      return response(200, {
        message: "Sprint setup saved",
        count: rows.length,
      });
    }

    return response(405, { message: "Method Not Allowed" });
  } catch (err) {
    console.error("SprintSetupHandler error", err);
    return response(500, { message: "Internal Server Error" });
  }
};
```

### Step 3: Initialize Node project & install `aws-sdk`

Open **Command Prompt** or **PowerShell**, go into the folder:

```bash
cd C:\aws-lambdas\SprintSetupHandler
```

Run:

```bash
npm init -y
npm install aws-sdk
```

Now your folder looks like:

```
SprintSetupHandler/
  index.js
  package.json
  package-lock.json
  node_modules/
    aws-sdk/
    ... (other deps)
```

This is exactly what Lambda needs.

---

## 2️⃣ Zip and upload to Lambda

### Step 4: Create the ZIP (important: zip INSIDE the folder, not the parent)

In File Explorer:

1. Open `C:\aws-lambdas\SprintSetupHandler`
2. Select all contents inside (index.js, package.json, node_modules, etc.)
3. Right-click → **Send to → Compressed (zipped) folder**
4. Name it something like `SprintSetupHandler.zip`

Your ZIP must contain:

* `index.js` at the root of the ZIP
* `node_modules/` at the root
* `package.json`

(not a parent folder containing them)

### Step 5: Upload ZIP into Lambda

1. Go to **AWS Console → Lambda → SprintSetupHandler**
2. Go to the **Code** tab.
3. Top-right, click the dropdown next to **Upload from**.
4. Choose: **.zip file**.
5. Select your `SprintSetupHandler.zip`.
6. Click **Save** / **Upload**.

Lambda will now use your zipped code + node_modules.

### Step 6: Confirm handler

Under **Configuration → General configuration** or **Runtime settings**, confirm:

* Runtime: **Node.js 20.x** (fine)
* Handler: **index.handler**

If Handler is something else, change it to `index.handler` and save.

---

## 3️⃣ Test again from Lambda console

Go to **Test** tab:

### GET event

```json
{
  "httpMethod": "GET"
}
```

Click **Test**.

Expected:

* `statusCode: 200`
* body: `[]` or existing items

### POST event

```json
{
  "httpMethod": "POST",
  "body": "[{\"protocolKey\":\"P-1\",\"name\":\"Test Protocol\",\"uiAssignee\":\"Dev1\",\"uiSP\":3}]"
}
```

Click **Test**.

Expected:

* `statusCode: 200`
* body with `"Sprint setup saved"` and `count: 1`

Then GET again → should show `P-1` item from DynamoDB.

---

## 💰 Cost impact

* `npm install` and packaging are local → **no AWS cost**.
* Lambda with Node 20 + aws-sdk in your package costs the same as before:

  * Invocations = tiny cost in dev
  * DynamoDB reads/writes = pay-per-request (super low with your usage)

---

## TL;DR

Because:

* Node.js 20.x is the lowest runtime you can choose
* Node 20.x Lambda **does not include `aws-sdk` built-in**

You **must**:

> ✅ Bundle `aws-sdk` with your code using `npm install` locally → ZIP → upload to Lambda.

Once you do this **once**, it becomes your standard workflow for all future Lambdas.

If you want, next I can help you do the **same packaging flow** for `MyWorkHandler` once `SprintSetupHandler` works.

Absolutely — here is the **exact `package.json`** you should use for this Lambda project.

Since you’re running Lambda on **Node.js 20.x**, and using the classic AWS SDK (v2), this is the correct minimal package file:

---

### 📄 `package.json`

```json
{
  "name": "sprint-setup-handler",
  "version": "1.0.0",
  "description": "Lambda function for handling sprint setup with DynamoDB",
  "main": "index.js",
  "type": "commonjs",
  "dependencies": {
    "aws-sdk": "^2.1480.0"
  }
}
```

---

### 👍 Why this version?

* `aws-sdk@2.x` works perfectly with Lambda DocumentClient (classic style)
* Works with the CommonJS `require("aws-sdk")`
* No breaking changes for DynamoDB API you're using

---

## 🚀 Installation steps recap

After creating `package.json`, run these commands inside your Lambda folder:

```bash
npm install
```

This creates:

```
node_modules/
package-lock.json
```

Then ZIP the contents (not the parent folder), so the ZIP contains:

```
index.js
package.json
package-lock.json
node_modules/
```

---

## 🔧 Upload ZIP to Lambda

1. Go to Lambda → `SprintSetupHandler`
2. Go to **Code** tab
3. Click **Upload from → .zip file**
4. Select your zip
5. Ensure Handler = `index.handler`
6. Save & Deploy

---

## 🧪 Test with the GET event:

```json
{
  "httpMethod": "GET"
}
```

Expected result:

```json
[]
```

(or items if table already has data)

Then test POST.

---

### When GET works, reply:

```
GET OK - ready for POST test
```

Or paste the new error if anything fails — we fix step by step.

This is actually a **good** failure – your code is fine, Lambda runs, env var is fine.
AWS is just saying:

> “Your Lambda’s IAM role is **not allowed** to read from DynamoDB.”

So we just need to give the Lambda **permission** to `Scan` that table (and later `BatchWrite` etc).

No code change needed. Just IAM policy.

---

## 1️⃣ What the error is saying (in plain English)

From the log:

> `User: arn:aws:sts::8257...:assumed-role/SprintSetupHandler-role-lnqjvabc/SprintSetupHandler is not authorized to perform: dynamodb:Scan on resource: arn:aws:dynamodb:ap-south-1:8257...:table/SprintSetupTable`

So:

* Execution role: `SprintSetupHandler-role-lnqjvabc`
* Action denied: `dynamodb:Scan`
* Resource: your table `SprintSetupTable`

We need to attach an IAM policy to that role allowing:

* `dynamodb:Scan`
* `dynamodb:BatchWriteItem`
* maybe `dynamodb:PutItem`, `dynamodb:DeleteItem` (for POST)

---

## 2️⃣ Add IAM permissions to the Lambda role

### Step 1: Open the Lambda’s role in IAM

1. Go to your Lambda **SprintSetupHandler**.

2. In the **Configuration** tab → under **General configuration**, you’ll see:

   ```
   Execution role
   service-role/SprintSetupHandler-role-lnqjvabc
   [View the SprintSetupHandler-role-lnqjvabc role on the IAM console]
   ```

3. Click **“View the SprintSetupHandler-role-lnqjvabc role on the IAM console”** link.

This opens the IAM role page.

---

### Step 2: Attach an inline policy with DynamoDB permissions

1. On the IAM role page, you’ll see **Permissions** tab.

2. Click **Add permissions → Create inline policy**.

3. Go to the **JSON** tab and paste this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Scan",
        "dynamodb:BatchWriteItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:ap-south-1:825765384171:table/SprintSetupTable"
    }
  ]
}
```

> If you want to be super-precise:
>
> * You can copy the table ARN directly from **DynamoDB → SprintSetupTable → Overview → Table ARN**

4. Click **Review policy**.

5. Give it a name, e.g.:

   ```
   SprintSetupHandlerDynamoPolicy
   ```

6. Click **Create policy**.

Now your role has rights to touch that table.

💰 Cost: IAM policies are free. This does not affect billing.

---

## 3️⃣ Retry the GET test

Go back to **Lambda → SprintSetupHandler → Test**.

Use the same event:

```json
{
  "httpMethod": "GET"
}
```

Click **Test**.

Now you should get:

```json
{
  "statusCode": 200,
  "body": "[]"
}
```

(or some items if you had already inserted rows).

---

## 4️⃣ Next: test POST

Once GET returns 200, create/run the **POST** event:

```json
{
  "httpMethod": "POST",
  "body": "[{\"protocolKey\":\"P-1\",\"name\":\"Test Protocol\",\"uiAssignee\":\"Dev1\",\"uiSP\":3}]"
}
```

* Expect `statusCode: 200`
* Body like: `{"message":"Sprint setup saved","count":1}`

Then run GET again → should show the `P-1` item.

---

So summary:

* Error now is **only** about IAM, not code ✅
* Fix = add DynamoDB permissions to the Lambda role ✅
* After that, your Lambda–DynamoDB integration will be **fully working**.

Do the IAM steps, then tell me what you get on the next GET test (status + body).

No worries — I’ll walk you through it **step-by-step, exactly where to click.**

You only need to do this **once per event** — after that, they remain saved.

---

## ✅ Step-by-Step: Create a Saved Test Event

1. Go to your Lambda function:
   **AWS Console → Lambda → SprintSetupHandler**

2. Click the **Test** tab (top bar).

3. On the right side of the Test button, you’ll see a dropdown labeled:

```
Test event action
```

4. Click the dropdown → choose:

👉 **Create new event**

---

### A small form will appear with these fields:

| Field                      | What to do                          |
| -------------------------- | ----------------------------------- |
| **Event name**             | Type a name like: `GetSprintSetup`  |
| **Event sharing settings** | Leave as **Private**                |
| **Template**               | Ignore (no need to select template) |
| **Event JSON**             | Replace content with your JSON      |

---

## 📌 Create Event #1 — GET Sprint Setup

Paste this JSON in the box:

```json
{
  "httpMethod": "GET"
}
```

Then click **Save**.

➡ Now you'll see this event selected next to the Test button.

You can now click **Test** anytime and it will reuse this exact JSON.

---

## 📌 Create Event #2 — POST Sprint Setup

Repeat:

* Test tab
* Test event action ➜ **Create new event**

Use:

* **Event name:** `PostSprintSetup`
* **Event JSON:**

```json
{
  "httpMethod": "POST",
  "body": "[{\"protocolKey\":\"P-1\",\"name\":\"Test Protocol\",\"uiAssignee\":\"Dev1\",\"uiSP\":3}]"
}
```

Click **Save**.

---

## 📌 Optional — Create Event #3 (Bad Request Testing)

Name: `PostInvalid`

JSON:

```json
{
  "httpMethod": "POST",
  "body": "{}"
}
```

Save it.

---

### 🎉 After creating them:

You will now have a dropdown next to the Test button showing:

```
GetSprintSetup
PostSprintSetup
PostInvalid
```

You simply select one and click **Test** — no need to rewrite JSON again.

---

## Bonus Tips

### 🟢 To edit a test event later:

* Dropdown → **Edit saved event**
* Modify JSON
* Save

### 🔴 To delete a test event:

* Dropdown → **Edit saved event**
* Click delete icon (trash)

---

## Summary

✔ You now know how to create reusable test events
✔ These will speed testing while coding Lambdas
✔ No overwriting unless you intentionally edit

---

When you're ready, tell me:

```
GET working → move to POST test
```

(or paste the POST result if already tested).
Perfect — good job 🎯
Now you have the two essential test events:

* `GetSprintSetup`
* `PostSprintSetup`

Those are enough to validate this Lambda end-to-end.

Before moving on to wiring with API Gateway & Postman, let's add **one more optional but useful test event**:

---

### 🔹 Optional Event #3 — Update Test (simulating a user updating a protocol)

Later you'll implement:

```
PUT /api/protocols/:id/work/:disc
```

But for now, let's prepare a simplified version that helps ensure your Lambda handles payloads cleanly.

Create:

**Event name:** `PostSprintSetup_Multiple`

**JSON:**

```json
{
  "httpMethod": "POST",
  "body": "[{\"protocolKey\":\"P-1\",\"name\":\"Test Protocol\",\"uiAssignee\":\"UIDev\",\"uiSP\":3},{\"protocolKey\":\"P-2\",\"name\":\"Second Protocol\",\"serverAssignee\":\"ServerDev\",\"serverSP\":5}]"
}
```

Why useful:

* Tests multiple rows
* Tests overwrite (delete + batch insert logic)
* Ensures DynamoDB logic isn’t only working for single record

---

### 🔹 Optional Event #4 — Invalid Payload Check

This one confirms your Lambda properly rejects bad input (good for API Gateway mapping later).

**Event name:** `InvalidPayload`

**JSON:**

```json
{
  "httpMethod": "POST",
  "body": "{}"
}
```

Expected response:

```
400 Bad Request → "Invalid sprint setup payload"
```

Good APIs reject garbage — this ensures yours does.

---

### 🔹 Optional Event #5 — No HTTP Method (Error Trigger)

Sometimes API Gateway misconfig happens — this catches that.

**Event name:** `NoMethod`

**JSON:**

```json
{}
```

Expected response:

```
405 Method Not Allowed
```

Good safety test.

---

## Summary of events:

| Name                     | Purpose                       | Required?      |
| ------------------------ | ----------------------------- | -------------- |
| GetSprintSetup           | Read from DynamoDB            | ✔ Yes          |
| PostSprintSetup          | Save new setup                | ✔ Yes          |
| PostSprintSetup_Multiple | Stress test + overwrite logic | 👍 Recommended |
| InvalidPayload           | Handle bad input              | Optional       |
| NoMethod                 | Safety / fallback test        | Optional       |

---

## Next Milestone

Once you're done with:

* `GetSprintSetup` → returns `[]` or items
* `PostSprintSetup` → saves and GET reflects items
* `PostSprintSetup_Multiple` → overwrites previous rows cleanly

Then your Lambda → DynamoDB integration is **fully validated.**

---

### 🚀 Once ready, tell me:

```
SprintSetup Lambda fully tested. Ready for API Gateway wiring.
```

Then we move to the real API route with Cognito authorization + Postman testing.
Nice. You’ve done the hard part (Lambda + DynamoDB). Now we just need to put a proper HTTP front door on it.

We’ll do **API Gateway wiring + Cognito authorizer + Postman test** in one go.

---

## 1️⃣ Pick / Create the REST API

1. Go to **API Gateway** in AWS console.
2. Left menu → **APIs → REST APIs**.
3. You have two possibilities:

* If you already created an API for this project (e.g. `sprint-planner-api`), click it and reuse it.
* If not:

  * Click **Create API**
  * Choose **REST API → Build** (NOT HTTP API)
  * Name: `sprint-planner-api`
  * Endpoint type: Regional
  * Create

> REST API is slightly more expensive than HTTP API but simpler with Cognito + console. For dev + low calls, cost is still tiny.

---

## 2️⃣ Create the `/api/sprint-setup` resource path

Inside your REST API:

1. In the left panel, click **Resources**.

2. Click **Actions → Create Resource**.

   * Resource Name: `api`
   * Resource Path: `/api`
   * Check “Configure as proxy resource” **OFF**
   * Click **Create Resource**.

3. Select `/api`

4. **Actions → Create Resource** again:

   * Resource Name: `sprint-setup`
   * Resource Path: `/sprint-setup`
   * Create.

You now have:
`/api` → `/api/sprint-setup`.

---

## 3️⃣ Wire GET & POST to your Lambda (`SprintSetupHandler`)

### a) GET method

1. Click the `/api/sprint-setup` resource.
2. Click **Actions → Create Method**.
3. In the small dropdown under `/api/sprint-setup`, choose **GET**, click tick ✅.
4. Configure:

   * Integration type: **Lambda Function**
   * ✅ **Check “Use Lambda Proxy integration”** (important!)
   * Region: `ap-south-1`
   * Lambda function: `SprintSetupHandler`
   * Save → when asked about permission, click **OK**.

### b) POST method

1. Same resource `/api/sprint-setup`.
2. **Actions → Create Method → POST**.
3. Same settings:

   * Lambda Function
   * ✅ Use Lambda Proxy integration
   * `SprintSetupHandler`

Now both GET and POST methods pass the full event (with `httpMethod`, `body`, etc.) to your Lambda just like your Test events.

---

## 4️⃣ Enable CORS for the endpoint (for your React app later)

1. Select resource `/api/sprint-setup`.
2. Click **Actions → Enable CORS**.
3. Allowed methods: GET, POST, OPTIONS (at least).
4. Confirm the popups.

This adds the `OPTIONS` method and headers so browser won’t complain.

---

## 5️⃣ Create Cognito Authorizer

You want these endpoints **protected**, so let’s hook Cognito.

Pre-req: you already have a **Cognito User Pool**.

1. In the same REST API, on the left, click **Authorizers**.
2. Click **Create New Authorizer**:

   * Name: `CognitoAuthorizer`
   * Type: **Cognito**
   * Cognito User Pool: select your pool
   * Token Source: `Authorization`
   * Leave TTL default
   * Save.

Now API Gateway knows how to validate `Authorization: Bearer <JWT>` against Cognito.

---

## 6️⃣ Attach the authorizer to GET & POST

### a) For GET:

1. In **Resources**, click `GET` under `/api/sprint-setup` (should show “Method Execution”).
2. Click **Method Request** (box left).
3. Under **Authorization**, change from `NONE` to `CognitoAuthorizer` (the one you created).
4. Save.

### b) For POST:

Repeat same:

1. Click `POST` under `/api/sprint-setup`.
2. Method Request → Authorization → `CognitoAuthorizer`.
3. Save.

Now **both methods require a valid JWT**.

---

## 7️⃣ Deploy the API

Changes don’t go live until you deploy.

1. In the REST API, click **Actions → Deploy API**.
2. If you already have a stage (like `dev`), pick it. If not:

   * New Stage Name: `dev`
   * Description: `Dev stage`
3. Click **Deploy**.

You’ll see an **Invoke URL**, something like:

```text
https://abc123.execute-api.ap-south-1.amazonaws.com/dev
```

Your full URLs:

* GET:
  `https://abc123.execute-api.ap-south-1.amazonaws.com/dev/api/sprint-setup`
* POST:
  `https://abc123.execute-api.ap-south-1.amazonaws.com/dev/api/sprint-setup`

---

## 8️⃣ Test quickly from API Gateway console (no auth)

This test bypasses Cognito and calls Lambda directly, good sanity check.

1. Go to **Resources → GET /api/sprint-setup**.
2. Click **Test** (top of Method Execution).
3. Click **Test** again → it should return 200 + whatever DynamoDB has.

If this fails, the problem is Lambda / integration, not auth.

Do the same for POST:

* Method: POST → Test
* In **Request Body**, paste:

```json
[
  {
    "protocolKey": "P-1",
    "name": "Test Protocol",
    "uiAssignee": "Dev1",
    "uiSP": 3
  }
]
```

* Test → 200 + “Sprint setup saved”.

Once this works via Test console, your backend is solid.

---

## 9️⃣ Test the secured API from Postman (with Cognito token)

Now the **real flow you wanted**:

### Step 1: Get a JWT from your browser

1. Open your React app.
2. Log in using Cognito.
3. Open **DevTools → Network**.
4. Trigger any API call so you can inspect headers, or look for a call to `/oauth2/token`.
5. Find a request with `Authorization: Bearer eyJ...` or a response JSON with `access_token`.
6. Copy the **access_token** value (the long `eyJ...` string).

### Step 2: Call GET from Postman

1. New request in Postman.
2. Method: **GET**.
3. URL:

```text
https://abc123.execute-api.ap-south-1.amazonaws.com/dev/api/sprint-setup
```

4. Headers:

```text
Authorization: Bearer <paste-your-token>
```

5. Send.

You should now get whatever your Lambda returns (list of protocols) instead of 401/403.

### Step 3: Call POST from Postman

1. Same URL.
2. Method: **POST**
3. Headers:

```text
Authorization: Bearer <token>
Content-Type: application/json
```

4. Body → raw JSON:

```json
[
  {
    "protocolKey": "P-2",
    "name": "Another Protocol",
    "uiAssignee": "Dev2",
    "uiSP": 5
  }
]
```

5. Send → should get `Sprint setup saved`, then GET shows both `P-1` and `P-2` (depending on whether you cleared first).

---

## 🔎 Cost reminder (dev mode)

* REST API Gateway: small per-call charge. With your manual testing, expect **₹ few rupees/month**.
* Lambda: almost certainly in free tier.
* DynamoDB: PAY_PER_REQUEST; your traffic is tiny.

No additional cost just because you turned on Cognito Authorizer.

---

If you hit any specific error now (401/403, 500, etc.), paste the **status + body** and we’ll debug that next. Otherwise, once `/api/sprint-setup` works from Postman with a Cognito token, we’re ready to move on to `MyWorkHandler` (`GET /api/my-work`).
🔥 BOOM. That means you now have a **fully working backend microservice** in AWS:

* Cognito authentication ✔
* Lambda executing business logic ✔
* DynamoDB persistence ✔
* IAM least-privilege security ✔
* API Gateway routing ✔
* Postman/browser-ready endpoint ✔

That's a real-world production pattern.
Most engineers never reach this point cleanly on the first project — you did it.

---

## 👉 Now What’s Next?

Now we wire this into your **React front-end**.

Your frontend should stop calling:

```
http://localhost:3001/api/sprint-setup
```

and instead call:

```
https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/dev/api/sprint-setup
```

But there are two important adjustments before using it from the UI:

---

### 1️⃣ **Include the Cognito token in fetch calls**

In React (after login), you'll already have:

```js
const token = user.getSignInUserSession().getIdToken().getJwtToken();
```

Now call the real API like:

```js
await fetch(
  "https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/dev/api/sprint-setup",
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
```

---

### 2️⃣ **Fix CORS for browser requests**

You already enabled CORS in API Gateway, but you should also confirm these headers exist in:

#### Method Response → `200` → Add headers:

| Header                         | Value                        |
| ------------------------------ | ---------------------------- |
| `Access-Control-Allow-Origin`  | `*` (dev)                    |
| `Access-Control-Allow-Headers` | `Authorization,Content-Type` |
| `Access-Control-Allow-Methods` | `GET,POST,OPTIONS`           |

If not present → add → redeploy.

This fixes browser errors like:

```
CORS policy: Missing Allow-Origin header
```

---

### 3️⃣ **Update frontend to POST**

When saving sprint setup:

```js
await fetch(
  "https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/dev/api/sprint-setup",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(protocolRows),
  }
);
```

---

## 🧪 Test Flow Checklist

| Step                         | Tool           | Goal                 | Expected    |
| ---------------------------- | -------------- | -------------------- | ----------- |
| GET via Lambda Test          | Lambda Console | Function works alone | 200 + JSON  |
| POST via Lambda Test         | Lambda Console | Database write       | 200 + saved |
| GET via API Gateway Test     | API Gateway    | Integration OK       | 200         |
| GET via Postman (with token) | Postman        | Cognito auth OK      | 200         |
| POST via Postman             | Postman        | Writes DB via API    | 200         |
| GET in Browser/React         | Browser        | CORS & token correct | 200         |

You're currently at ✔✔✔✔
Two steps away from full front-end integration.

---

## 🚀 Once React talks to AWS successfully, next milestone:

* Create second Lambda: `MyWorkHandler`
* Add route: `/api/my-work`
* Repeat the same wiring model
* Then integrate into React dashboard

---

### Final question:

👉 **Do you want me to guide:**

1. **React integration next**, or
2. **Create the next Lambda route (`my-work`) first before frontend?**

Reply with:

```
Option 1: React → AWS wiring now
```

or

```
Option 2: Build MyWork Lambda next
```

Your call.

# Dynamo DB(Why?)
Because of your requirements and your reality, not because DynamoDB is “cool”.

## 1️⃣ What are you actually building?

Not a banking core.
Not a crazy analytics engine.

You’re building:

* A **sprint planning / workload** tool
* Backed by **API Gateway + Lambda + Cognito**
* Low–medium scale, but you want:

  * **Simple** to run
  * **Cheap**
  * **Fits serverless stack**
  * **Minimal DevOps babysitting**

With that context, DynamoDB is not random – it matches your actual constraints.
## 2️⃣ Why DynamoDB fits *your* stack

### ✅ 1. It matches Lambda & API Gateway perfectly

* **No connections** → You don’t deal with DB connection pools from Lambda.
* Lambda spins up, does a `Get/Put/Update` → done.
* You pay only for **requests**, not for idle servers.

If you picked RDS (Postgres/MySQL):

* You’d manage **connections per Lambda** (or use RDS Proxy = more moving parts).
* You’d pay for DB instances 24/7 even if nobody uses the app.
* You’d own backups, minor version upgrades, performance tuning, etc.

For your level + goal: that is **wasted complexity**.

---

### ✅ 2. Operational overhead: almost zero

DynamoDB:

* No OS to patch.
* No DB engine upgrades to schedule.
* Autoscaling for read/write capacity or on-demand.
* Integrated metrics/alerts in CloudWatch.

RDS / Aurora:

* Instance sizing
* Storage sizing
* Connection tuning
* Failover config
* Backups, maintenance windows

Be honest:
Do you *really* want to debug “too many connections” at 2 AM for a side project?
No. You want to **finish the project**, demo it, and move on.

---

### ✅ 3. Data model is simple enough for NoSQL

Your data is basically:

* **Sprint setup rows** (per protocol)
* Derived **protocols** view
* **Work item statuses** per protocol + discipline
* Maybe users/roles (but Cognito mostly handles auth)

This is **key-value / document-ish**, not heavy relational data with 20-table joins.

You need:

* Get all sprint setup rows
* Update work item status
* Compute workloads by assignee

Perfectly fine with a couple of tables and **primary key + maybe GSI** later if you ever need.

Using Postgres here is like buying a truck to deliver one pizza.

---

### ✅ 4. IAM & security integration is cleaner

DynamoDB:

* IAM role for Lambda:

  * `dynamodb:GetItem`, `PutItem`, `UpdateItem`, `Scan` on specific tables
* No DB username/password.
* No secrets rotation hassle.

RDS:

* Separate credentials (username/password or IAM auth).
* Secrets in Secrets Manager.
* Need to configure networking correctly (VPC, subnets, security groups).

Again: more moving parts, more things to screw up.

---

### ✅ 5. Cost profile is safer for a low-traffic project

DynamoDB (on-demand):

* You pay per request.
* If only **you** are using this during early dev → peanuts.

RDS:

* Even the smallest instance still runs **24/7**.
* You’re paying for uptime, not queries.

You told me earlier you want something doable in your real life, not enterprise team with SREs. Dynamo keeps the risk low.

---

## 3️⃣ Why *not* choose other options?

Let’s go through alternatives one by one.

### ❌ RDS (Postgres/MySQL)

Use this if:

* You **need** complex joins, transactions, relational constraints.
* You have a team comfortable with SQL + DB tuning.
* You expect non-trivial reporting / analytics.

In your case:

* Your relationships are simple.
* You’re not building third-normal-form schema with 20 FKs.
* Lambda + RDS adds **connection management headaches** you don’t need.

Could you use it? Sure.
Is it the smartest choice for this project? **No**.

---

### ❌ Aurora Serverless

Slightly better than plain RDS for serverless, but still:

* More complex than Dynamo.
* Still a relational engine.
* Still more to understand & manage (cluster, scaling, restore, etc.).

Right now, you’re already juggling:

* React
* Cognito
* API Gateway
* Lambda
* CloudWatch
* Project logic

Adding Aurora is **polishing the wrong part** of the project.

---

### ❌ S3 JSON files / “just like your current sprint-setup.json”

Tech debt level: 💀

* No concurrency control.
* No easy querying/filtering.
* No transactional update semantics.
* You’ll reinvent a crappy database.

You already did that locally with `sprint-setup.json`.
That’s fine for mock server, **not fine for real cloud deployment**.

---

### ❌ Firebase / external DB SaaS

* Doesn’t align well with AWS stack.
* Adds cross-cloud complexity.
* For a project that already uses Cognito + API Gateway, this is sideways.

---

## 4️⃣ Are there any *downsides* of DynamoDB for you? Yes.

I’m not going to sugar coat it.

### ❗ You can’t be lazy with modeling

If you start needing:

* Fancy “give me all protocols where X and Y and sorted by Z” queries
* Ad-hoc analytics

DynamoDB will push back. You’ll have to:

* Think primary key + sort key
* Maybe define **GSIs**
* Adapt query patterns to DB design

If your data blows up in complexity and relationships, you may eventually outgrow Dynamo and move to relational.

But **for this project**, that’s not your world.

---

## 5️⃣ Ruthless conclusion

**Why are we going with DynamoDB?**

Because for your **current project**, your **current skill/time budget**, and your **serverless-first architecture**, it is:

* ✅ Simpler to operate
* ✅ Cheaper when idle
* ✅ Native fit for API Gateway + Lambda + Cognito
* ✅ Good match for your relatively simple data
* ✅ Less crap to configure, tune, and break

Using RDS/Aurora **here** would:

* Increase complexity
* Increase cost
* NOT give you meaningful benefits for your current use case

So unless:

* Your PO suddenly says “we need complex SQL analytics and cross-entity joins”, or
* You personally want to **practice relational DBs on AWS** as a learning goal

…then DynamoDB is the **practical, adult choice**.

# Dynamo DB
Perfect — let’s finish **DynamoDB setup** step by step, with exactly what you need for your project.

This will cover:

1. **Table structure**
2. **Creating table in AWS**
3. **Indexes (only if needed later)**
4. **Cost settings**
5. **How to verify it’s ready**

---

## ⭐ 1️⃣ What table do you need?

For now, you only need **ONE TABLE**:

### 📌 Table: `SprintSetupTable`

This stores data from your current `/api/sprint-setup` POST request.

Each row in the table represents **one protocol entry**.

---

## ⭐ 2️⃣ Table schema

| Field Name       | Type   | Required              | Notes                                       |
| ---------------- | ------ | --------------------- | ------------------------------------------- |
| `protocolKey`    | String | **YES (Primary Key)** | Unique key for the protocol (like P-1, P-2) |
| `name`           | String | Optional              |                                             |
| `fixedVersion`   | String | Optional              |                                             |
| `targetDate`     | String | Optional              |                                             |
| `clarification`  | String | Optional              |                                             |
| `uiAssignee`     | String | Optional              |                                             |
| `uiSP`           | Number | Optional              |                                             |
| `serverAssignee` | String | Optional              |                                             |
| `serverSP`       | Number | Optional              |                                             |
| `dbAssignee`     | String | Optional              |                                             |
| `dbSP`           | Number | Optional              |                                             |
| `ldapAssignee`   | String | Optional              |                                             |
| `ldapSP`         | Number | Optional              |                                             |

You can store everything as **flat attributes** — DynamoDB is NoSQL, so no schema constraints.

---

## ⭐ 3️⃣ Create the table in AWS Console

### Step-by-step:

1. Go to AWS Console → **DynamoDB**
2. Click **Create table**
3. Fill:

| Setting       | Value              |
| ------------- | ------------------ |
| Table name    | `SprintSetupTable` |
| Partition key | `protocolKey`      |
| Type          | String             |

4. Expand **Table settings**
5. Select:

```
Billing mode: On-demand (PAY_PER_REQUEST)
```

👉 Cost impact:

* **Idle = almost ₹0/month**
* Only pay for reads/writes (your app is low volume → cheap)

6. Leave everything else default.
7. Click **Create Table**

Done. 🟢

---

## ⭐ 4️⃣ Do we need a sort key?

Not right now.
Your use case does **lookup by full table scan**, not per-key filtering.

So **NO sort key needed**.

---

## ⭐ 5️⃣ Do we need secondary indexes (GSI/LSI)?

Eventually maybe, but **NOT now.**
Examples where you would need GSI later:

| Query                                | Needed?                                               |
| ------------------------------------ | ----------------------------------------------------- |
| "Get all protocols assigned to Dev1" | Maybe later (GSI on `uiAssignee` or `serverAssignee`) |
| "Filter by sprintId"                 | Maybe later                                           |
| "Search by name"                     | Not ideal for DynamoDB                                |

For now → **skip GSIs** until the app stabilizes.

---

## ⭐ 6️⃣ Verify table exists

After creation:

* Open the table → Tab **Items**
* Should show: **No items**
* Good.

---

## ⭐ 7️⃣ Connect Lambda to this table

You already added environment variable:

```
SPRINT_SETUP_TABLE_NAME = SprintSetupTable
```

Now ensure Lambda has IAM permissions:

* `Scan`
* `PutItem`
* `DeleteItem`
* `BatchWriteItem`

You already added that earlier — so you're good.

---

## ⭐ 8️⃣ Insert first data (Optional sanity check)

You can manually insert **one record** to verify everything works:

In DynamoDB Console → **Explore Table Items → Create Item**:

Example:

```json
{
  "protocolKey": "P-1",
  "name": "Login Feature",
  "uiAssignee": "Divya",
  "uiSP": 3,
  "serverAssignee": "BackendDev",
  "serverSP": 5
}
```

Click **Save**.

Then:

* Go to Lambda test → run with `GET` event.
* It should return this one row.

---

## ⭐ 9️⃣ Test via Postman AFTER Cognito Auth

Now call:

```
GET https://<api-id>.execute-api.<region>.amazonaws.com/dev/api/sprint-setup
```

Headers:

```
Authorization: Bearer eyJxxxxx....
```

If Dynamo + Lambda + API Gateway + Cognito are all correct → you’ll get JSON response.

---

## ⭐ 🔟 Cost Summary (as promised)

| AWS Component      | Cost when idle       | Cost when used                                |
| ------------------ | -------------------- | --------------------------------------------- |
| DynamoDB On-Demand | ~₹0                  | ₹0.012–₹0.15 per 1K operations (tiny for dev) |
| Lambda             | ₹0 idle              | Free tier covers 1M req/month                 |
| API Gateway        | ₹0 idle              | ~$0.03 per 1K calls                           |
| Cognito            | Free up to 50K users | Only SMS MFA costs (you disabled it)          |

So you’re in safe cost range.
For your project, the correct **Partition Key** for the `SprintSetupTable` is:

```
protocolKey  (String)
```

---

### ✔ Why `protocolKey`?

* In your current data model, each item (row) represents **one protocol**.
* Protocols are uniquely identified by a field like:

```
P-1
P-2
P-3
...
```

* DynamoDB **requires each item’s partition key to be unique**, and you already treat `protocolKey` that way in your backend.

So using `protocolKey` makes the table structure align with how your app already expects and processes the data.

---

### ❓ Should there be a Sort Key?

**No. Not required right now.**

You’re not querying:

* protocols *within* a hierarchy
* history per protocol
* multiple rows with same protocol key

So a single **Partition Key only** table is correct.

If in the future you want multiple versions of a protocol (like audit history), then you *might* add a sort key like:

```
versionNo (Number)
```

…but for now → **not needed.**

---

### Final Table Setup Recap

| Setting       | Value                       |
| ------------- | --------------------------- |
| Table Name    | `SprintSetupTable`          |
| Partition Key | `protocolKey`               |
| Type          | String                      |
| Billing Mode  | On-demand (PAY_PER_REQUEST) |
| Sort Key      | ❌ None                      |

---

### Cost (so you don’t have surprise billing 😉)

| Activity                          | Cost            |
| --------------------------------- | --------------- |
| Idle table (no reads/writes)      | ~₹0             |
| Few test reads/writes from Lambda | A few paise     |
| No index (GSI)                    | No extra charge |

You're 100% safe in dev mode.

---

#### Summary:

👉 Create DynamoDB table with:

```
Partition key: protocolKey (String)
```

Nothing else needed.

---

When you're ready to continue with the next Lambda (MyWork), just tell me:

```
Ready for MyWorkHandler
```

🔥 You're making real progress. Keep going.

### Short answer: **Yes — you *can* use the default table settings.**

BUT… change **ONE thing** during creation:

> ✔ Set **Billing mode → On-demand (PAY_PER_REQUEST)**

Everything else can stay default.

---

### Why this matters

AWS defaults to **Provisioned capacity**, which means:

* You manually tell DynamoDB how many reads/writes per second.
* If you pick wrong → **you either overpay or get throttling**.

For dev/testing, provisioned mode is unnecessary complexity.

---

### On-Demand mode gives you:

* Auto-scaling read/write capacity
* No capacity planning
* **₹0 cost when idle**
* Only pay per actual request (your usage is tiny → almost free)

This is the **best and safest mode** for your current stage.

---

### Final recommended configuration for you

| Setting       | Value                           |
| ------------- | ------------------------------- |
| Table name    | `SprintSetupTable`              |
| Partition key | `protocolKey` (String)          |
| Sort key      | ❌ None                          |
| Billing mode  | **On-Demand (PAY_PER_REQUEST)** |
| Tags          | Optional                        |

Everything else → leave default.

---

### Cost Summary (as promised)

| Usage                                   | Cost               |
| --------------------------------------- | ------------------ |
| No requests for days                    | **₹0**             |
| Light testing with Postman and UI calls | Maybe ₹1–₹10/month |
| No risk of surprise charges             | 👍                 |

---

### So final answer:

> ✅ Yes — use default settings and just switch to **On-Demand** billing.
> No other edits needed.

detecytion protection is off for this table. Deletion protection off is fine for dev. In prod you’d turn on more safety; for now you want freedom to blow it away if needed.

only settings tab has info..nothing is configured on other tabs
![alt text](image-1.png)
![alt text](image-2.png)
![alt text](image-3.png)
![alt text](image-4.png)
![alt text](image-5.png)

# API Gateway
Got it, perfect timing to set it up from scratch then 😄
You already have:

* DynamoDB table ✅
* `SprintSetupHandler` Lambda ✅

Now we’ll put **API Gateway** in front of that Lambda so you get a real HTTP endpoint.

I’ll give you **from-zero steps in the AWS console**.

---

## 1️⃣ Create a REST API

1. Go to **AWS Console → API Gateway**.
2. On the left, click **APIs**.
3. Click **Create API**.
4. Choose **REST API** (the one that says “Build”) – *not* HTTP API.
5. Click **Build**.

In the form:

* **API name** → `sprint-planner-api`
* **Endpoint type** → `Regional` (default)
* Click **Create API**.

Now you have an empty REST API.

---

## 2️⃣ Create the `/api/sprint-setup` resource path

Inside your new API:

1. In the left menu, click **Resources** (if not already selected).
2. You’ll see a root `/`.

### Step 1: create `/api`

* Click the root `/`.
* Click **Actions → Create Resource**.
* **Resource Name**: `api`
* **Resource Path**: `/api`
* Leave “proxy resource” unchecked.
* Click **Create Resource**.

You now have `/api`.

### Step 2: create `/api/sprint-setup`

* Click the new `/api` node.
* Click **Actions → Create Resource**.
* **Resource Name**: `sprint-setup`
* **Resource Path**: `/sprint-setup`
* Click **Create Resource**.

You now have `/api/sprint-setup` in API Gateway.

---

## 3️⃣ Hook GET and POST to your Lambda

We want:

* `GET /api/sprint-setup` → `SprintSetupHandler`
* `POST /api/sprint-setup` → `SprintSetupHandler` (same function)

### a) Add GET method

1. Click the `/api/sprint-setup` resource.
2. Click **Actions → Create Method**.
3. A small dropdown appears under it → select **GET** and click the ✔ checkmark.
4. Configure the method:

   * **Integration type**: `Lambda Function`
   * ✅ Check **Use Lambda Proxy integration** (important)
   * **Lambda Region**: `ap-south-1`
   * **Lambda Function**: `SprintSetupHandler`
   * Click **Save**.
   * When asked for permission to invoke Lambda, click **OK/Allow**.

### b) Add POST method

1. With `/api/sprint-setup` still selected:
2. **Actions → Create Method → POST → ✔**.
3. Same config:

   * Type: Lambda Function
   * Use Lambda Proxy integration
   * Function: `SprintSetupHandler`
   * Save, allow permission.

Now API Gateway will send the full event including `httpMethod` and `body` to your Lambda — exactly like your Test events.

---

## 4️⃣ Quick test from API Gateway (no Cognito yet)

Let’s confirm the wiring before adding auth.

### Test GET

1. In the left tree, click `GET` under `/api/sprint-setup`.
2. You’ll see a **Method Execution** diagram.
3. At the top, click **Test**.
4. On the right, click **Test** again.

If everything is good:

* You should get `200` and the JSON body (likely `[]` if table empty or your saved rows).

### Test POST

1. Click `POST` under `/api/sprint-setup`.
2. Click **Test** at the top.
3. In the **Request Body** box, paste:

```json
[
  {
    "protocolKey": "P-1",
    "name": "Test Protocol",
    "uiAssignee": "Dev1",
    "uiSP": 3
  }
]
```

4. Click **Test**.

If all good:

* Status `200`
* Body `{"message":"Sprint setup saved","count":1}` (or similar)

Then run the GET method test again — you should see that `P-1` row coming back.

If that works: **Lambda + API Gateway are officially wired.** ✅

---

## 5️⃣ Deploy the API to a stage (get a real URL)

Right now you’ve only tested internal wiring. To get a URL your React app / Postman can call, you must **deploy**.

1. At the top of the **Resources** page, click **Actions → Deploy API**.
2. If it asks for a stage:

   * Choose **[New Stage]**
   * Stage name: `dev`
   * Click **Deploy**.

After deploy, you’ll see:

```text
Invoke URL: https://abc123.execute-api.ap-south-1.amazonaws.com/dev
```

Your final endpoints are:

* `GET  https://abc123.execute-api.ap-south-1.amazonaws.com/dev/api/sprint-setup`
* `POST https://abc123.execute-api.ap-south-1.amazonaws.com/dev/api/sprint-setup`

*(Replace `abc123` with your actual API ID.)*

You can now:

* Hit these from **Postman** (no auth yet, unless you attach Cognito).
* Use them from **React**.

---

## 6️⃣ Next fork: secure it with Cognito or test open first?

You have two options now:

### Option A – **Test open first (simpler)**

* Leave methods with **Authorization: NONE**
* Call the URL directly from Postman and React (no token)
* Once it works, then add Cognito Authorizer.

### Option B – **Secure immediately with Cognito**

* Create a Cognito Authorizer in API Gateway
* Attach it to GET and POST methods
* Then always include `Authorization: Bearer <token>` from Postman/React.

You previously said you want to test **with** Cognito, but since you haven’t even created the API before, I’d suggest:

> 🔹 Confirm the API works **without auth first** (Option A)
> 🔹 Then we turn on Cognito and add the header

That way you debug **one thing at a time**.

---

If you’re okay with that, do this next:

1. Use Postman:

   * `GET https://.../dev/api/sprint-setup`
   * No headers needed
     → Confirm you see the data.
2. `POST https://.../dev/api/sprint-setup` with JSON body like above
   → Confirm it returns 200 and GET reflects the new data.

Then tell me:

> “Postman GET/POST working (no auth).”

And I’ll walk you through **adding Cognito Authorizer** on top of this API.
Good catch, that screen *is* a bit confusing the first time.

That **“Security policy”** is just asking:

> “Which TLS (HTTPS) versions do you want to allow for this API?”

You’re basically choosing which HTTPS clients are allowed to talk to your API.

---

## What to pick? (simple answer)

Pick the **latest TLS 1.2-only policy** in the dropdown.

Depending on your console it may look like:

* `TLS 1.2`
* or `TLS 1.2_2019` / `TLS 1.2_2021` / `TLS 1.2_2023`

👉 Choose the one that:

* Mentions **TLS 1.2**
* **Does NOT** allow TLS 1.0/1.1 (avoid “TLS 1.0” or “TLS 1.1” options)

That’s the **recommended secure default**.
No cost impact, just better security.

Your browser, Postman, and React app all support TLS 1.2+, so nothing will break.

---

### So concretely for that field:

* **Security policy** → select something like:
  **`TLS 1.2`** or **`TLS 1.2_2021`** (whatever is the newest).

Then continue with:

* API name = `sprint-planner-api`
* Endpoint type = `Regional`
* Click **Create API**

After that, you can proceed with:

* Creating `/api` → `/api/sprint-setup`
* Wiring GET/POST to `SprintSetupHandler`

If you tell me the *exact* options in your “Security policy” dropdown, I can point to the exact string to select.
Nice, you’ve hit the CORS bit at exactly the right time 👌

Let’s clear up **two things**:

1. What to do with **Proxy resource** → **leave it OFF**
2. What to do with **CORS checkbox here** → you *can* ignore it now and enable CORS properly after methods are created

---

## 1️⃣ Proxy resource – what should you do?

You see:

> **Proxy resource Info**
> “Proxy resources handle requests to all sub-resources…”

For your use case:

* You **do NOT** want a proxy resource right now.
* You’re building clear, specific paths like `/api/sprint-setup`.

✅ So: **Do not tick anything related to proxy resource.**
Just:

* `Resource path`: `/api`
* `Resource name`: `api`

---

## 2️⃣ CORS section on this screen

You see:

> **CORS (Cross Origin Resource Sharing)**
> “Create an OPTIONS method that allows all origins, all methods, and several common headers.”

You have two ways to handle CORS:

### Option A – Ignore CORS here, enable later (recommended)

This is what I recommend:

1. **For now, don’t click anything in this CORS section.**
2. Click **Create Resource** to create `/api`.
3. Create `/api/sprint-setup` under it.
4. Add **GET** and **POST** methods.
5. Then, when `/api/sprint-setup` exists with methods, do:

   * Select `/api/sprint-setup` in the left tree
   * Click **Actions → Enable CORS**
   * Select methods: GET, POST, OPTIONS
   * Confirm

This way, CORS is attached to the **actual resource** where your frontend calls, not generically at root.

### Option B – Enable CORS now

You *could* tick that CORS option now, but it will:

* Create an `OPTIONS` method only at `/api`
* Not fully configure your `/api/sprint-setup` until you tweak things anyway

So Option A is cleaner and easier to reason about.

---

## 3️⃣ CORS in plain English (so you know why we care)

* Postman calls → **don’t care about CORS** (works even if CORS is off)
* Browser (React app) → **requires CORS** if your frontend origin (`http://localhost:3000`) and API origin (API Gateway URL) are different

So CORS is **only for browser → API calls**, not for Lambda, not for Postman.

We’ll finish wiring the API first, then enable CORS properly and test from the browser.

---

## TL;DR for this screen right now

On the “Create Resource” screen for `/api`:

* **Proxy resource**: ignore / leave unchecked
* **CORS section**: ignore for now
* Just set:

  * `Resource path`: `/api`
  * `Resource name`: `api`
* Click **Create Resource**

Then:

1. Create `/api/sprint-setup`
2. Add GET + POST to Lambda
3. Test via API Gateway “Test”
4. Later → `Actions → Enable CORS` on `/api/sprint-setup`

Go ahead and create `/api` without touching CORS, then tell me when `/api/sprint-setup` is created and we’ll do the next step (methods).
Good question — this sounds scary but the answer is simple:

👉 **Select: `Buffered`**

---

### Why?

* **Buffered mode** waits for your Lambda to finish and then sends the full JSON response.
* This is the **default and recommended** mode for typical REST APIs — especially when responses are small to medium-sized (like your sprint setup data).
* It avoids partial responses and weird streaming edge cases.

---

### When would someone use **Stream**?

Only when:

* Returning **very large responses**
* Doing long-running data streams
* Handling file downloads or live logs

Examples:

* Streaming a 250MB CSV
* Live video
* Real-time logs or event streaming

None of that applies to your current project.

---

### So for your architecture:

| Setting                       | Correct Choice |
| ----------------------------- | -------------- |
| GET returning JSON            | `Buffered` ✔   |
| POST returning small response | `Buffered` ✔   |
| Future `/api/my-work`         | `Buffered` ✔   |

---

### Summary:

> **Choose `Buffered` — leave Streaming for advanced use cases.**

---

Once that’s selected, go ahead and continue to the next step.

Tell me when:

```
/api/sprint-setup GET and POST created
```

…so we move to **Deploy API**, then **Test**, then **Cognito authorizer**.
![alt text](image-16.png)
![alt text](image-17.png)
![alt text](image-18.png)
OPTIONS call's method request:
![alt text](image-19.png)
OPTIONS call's method response:
![alt text](image-20.png)
OPTIONS call's integration request:
![alt text](image-25.png)
OPTIONS call's integration response:
![alt text](image-26.png)
GET method's method request:
![alt text](image-21.png)
GET method's method response:
![alt text](image-22.png)
GET method's integration request:
![alt text](image-23.png)
GET method's integration response:
![alt text](image-24.png)

![alt text](image-6.png)
![alt text](image-7.png)
![alt text](image-9.png)
![alt text](image-10.png)
![alt text](image-11.png)
![alt text](image-12.png)
![alt text](image-13.png)
![alt text](image-14.png)

# cognito screens:
![alt text](image-27.png)
![alt text](image-28.png)
![alt text](image-29.png)
![alt text](image-30.png)
![alt text](image-31.png)
![alt text](image-32.png)
![alt text](image-33.png)
![alt text](image-34.png)

# DynamoDB screens
![alt text](image-35.png)
![alt text](image-36.png)
![alt text](image-37.png)
![alt text](image-38.png)
![alt text](image-39.png)
![alt text](image-40.png)
![alt text](image-41.png)
![alt text](image-42.png)
![alt text](image-43.png)
![alt text](image-44.png)
![alt text](image-45.png)
![alt text](image-46.png)
![alt text](image-47.png)
![alt text](image-48.png)
![alt text](image-49.png)
# S3 screens
![alt text](image-50.png)
![alt text](image-51.png)
![alt text](image-52.png)
![alt text](image-53.png)
![alt text](image-54.png)
![alt text](image-55.png)
![alt text](image-56.png)
![alt text](image-57.png)
![alt text](image-58.png)
![alt text](image-59.png)
![alt text](image-60.png)
![alt text](image-61.png)
![alt text](image-62.png)
# CloudFront screens
![alt text](image-63.png)
![alt text](image-64.png)
![alt text](image-65.png)
![alt text](image-66.png)
![alt text](image-67.png)
![alt text](image-68.png)
![alt text](image-69.png)
![alt text](image-70.png)
![alt text](image-71.png)
![alt text](image-72.png)
![alt text](image-73.png)
![alt text](image-74.png)
![alt text](image-75.png)
![alt text](image-76.png)
![alt text](image-77.png)
![alt text](image-80.png)
![alt text](image-78.png)
![alt text](image-79.png)
![alt text](image-81.png)
![alt text](image-82.png)
![alt text](image-83.png)
Content-security-policy's value
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self' data:;
connect-src 'self' https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com;
frame-ancestors 'none';
base-uri 'self';

![alt text](image-84.png)
![alt text](image-85.png)

# Live URL:
https://dr529pnbgi820.cloudfront.net/

# My Questions
- different types of authenticationmethods supported by AWS
- with cognito, we can get temporary credetials for our cloud resources. give me exact examples of temporary credentials' significance
- SRP(Secure Remote Password Protocol) vs Cognito SRP lifecycle
- Cognito architecture
- what is aws-amplify?
- JWT tokens(ID token, access token, refresh token)
- what is redirect URL config in cognito?
- User pool vs having users in other DBs(DynamoDB, and the other)
- self registration in cognito
- Real time use cases for 
    - A web frontend
    - A mobile app
    - An admin dashboard
    - A machine–to–machine backend
    - CLI scripts
    - Integrations with other services
- App client in User pool/cognito?
- any other sort of data that we can save in user pool
- Standard OIDC-compliant (JWT)
- How sessionID is stateful and JWT is stateless
- API gateway's cognito authorizer
- auth code + PKCE(Proof Key for Code Exchange) means
- How can we store JWT tokens in localStorage, sessionStorage, IndexedDB, React state without protection, Browser cache -> not recommended but Want to see how this can be done
- Short token TTL(time to live)?
- Refresh token rotation
- Token blacklist
- Cognito global sign-out
- how to verify issuer, audience, expiration, signature
- How much time will it take to delete and redeploy using CDK with default configs/data
- why allowed http methods are GET, HEAD in cloudFront?