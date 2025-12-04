Absolutely — now that you've completed the end-to-end project, this is the **final clean Markdown documentation** you asked for.
You can copy–paste directly into your notes or a `README.md`.

I’ll include:

* 🧩 Architecture overview
* 🏗 Step-by-step build flow (AWS + React)
* ⚙️ Config snippets (Amplify, Lambda, API Gateway, IAM, CORS)
* 🧪 Testing notes
* 📌 Screenshot placeholders
* 🔁 Summary checkpoints

---

# 🚀 Sprint Workload Tracker — Full Project Documentation

> **Tech Stack:** React + Vite + Redux Toolkit Query (Optional), AWS Cognito, API Gateway, Lambda, DynamoDB, S3, CloudFront
> **Pattern:** Fully Serverless + Cognito Protected API Calls

---

## 🎯 Goal

Build a **secure sprint tracking tool** with:

* Authentication using AWS Cognito
* REST endpoints protected with JWT Bearer tokens
* Fully serverless backend (Lambda + DynamoDB)
* Fully static frontend hosted on S3 + CloudFront
* Real-world business flow:

  * Upload sprint items
  * Assign developers
  * Track work and update statuses

---

## 🏗 Architecture Diagram

```
React (Vite) SPA → Amazon CloudFront → S3 Hosting
                         │
                         ▼
                Amazon Cognito (Auth)
                         │
                         ▼
          User JWT → API Gateway (Cognito Authorizer)
                         │
                         ▼
         AWS Lambda (SprintSetupHandler + MyWorkHandler)
                         │
                         ▼
                    DynamoDB (SprintSetupTable)
```

📌 *Add image later:*
`![Architecture Diagram](./screenshots/architecture.png)`

---

---

## 1️⃣ AWS Cognito Setup

### ✔️ User Pool

* Handles authentication (Sign-in / Sign-up)
* Configured email-based login

📌 *Note where you created the user*:

* Username: `lead@example.com`
* Temporary password set & changed on first sign-in

📌 Screenshot placeholder:
`![Cognito User Pool](./screenshots/cognito-userpool.png)`

---

### 🔧 React Integration

```ts
// client/src/awsConfig.ts
export default {
  Auth: {
    Cognito: {
      userPoolId: "ap-south-1_XXXXX",
      userPoolClientId: "xxxxxclientxxxxx",
      identityPoolId: undefined
    }
  }
};
```

Used:

```ts
import { signIn, fetchAuthSession } from "aws-amplify/auth";
```

Authentication returns a JWT access token:

```ts
const session = await fetchAuthSession();
const token = session.tokens?.accessToken.toString();
```

---

---

## 2️⃣ DynamoDB Setup

* Table name: **SprintSetupTable**
* Partition key: `protocolKey` (String)

📌 Screenshot placeholder:
`![DynamoDB Table](./screenshots/dynamodb.png)`

---

---

## 3️⃣ AWS Lambda Functions

### 🧩 SprintSetupHandler → `/api/sprint-setup`

Supports:

| Method | Description                        |
| ------ | ---------------------------------- |
| `GET`  | fetch all protocols                |
| `POST` | upsert multiple rows (batch write) |

#### Final Handler Code (including authorizer support)

```js
const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.SPRINT_SETUP_TABLE_NAME || "SprintSetupTable";

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;

    if (method === "GET") {
      const result = await dynamo.scan({ TableName: TABLE_NAME }).promise();
      return send(200, result.Items);
    }

    if (method === "POST") {
      const rows = JSON.parse(event.body || "[]");
      const batches = chunk(rows.map(mapRow), 25);

      for (const batch of batches)
        await dynamo.batchWrite({ RequestItems: { [TABLE_NAME]: batch } }).promise();

      return send(200, { message: "Saved successfully", count: rows.length });
    }

    return send(405, { message: "Method Not Allowed" });

  } catch (err) {
    console.error(err);
    return send(500, { message: "Internal Server Error" });
  }
};

const send = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*" // replaced later with specific domain
  },
  body: JSON.stringify(body),
});
```

📌 Screenshot placeholder:
`![Lambda Function](./screenshots/lambda-sprintsetup.png)`

---

### 🧩 Update Work Handler → `/api/protocols/{id}/work/{disc}`

* Updates only a single field
* Used Cognito identity → not doing RBAC (optional future)

#### Role update example

```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:UpdateItem"
  ],
  "Resource": "arn:aws:dynamodb:REGION:ACCOUNT:table/SprintSetupTable"
}
```

📌 Screenshot placeholder:
`![IAM Policy](./screenshots/iam-policy.png)`

---

---

## 4️⃣ API Gateway Setup

### 🔐 Cognito Authorizer

* Authorizer attached to all `/api/*` routes
* Token source: `Authorization`
* Format: `Bearer <JWT>`

Test result example:

```
200 OK
Claims:
{
 "email": "lead@example.com",
 "token_use": "id"
}
```

📌 Screenshot placeholder:
`![Cognito Authorizer](./screenshots/apigateway-authorizer.png)`

---

### ✔️ CORS Enabled

Allowed:

```
Origin: *
Headers: Content-Type, Authorization
Methods: GET,POST,PUT
```

---

---

## 5️⃣ Frontend Integration

### 🧩 Token Fetching

```ts
import { fetchAuthSession } from "aws-amplify/auth";

export async function getAccessToken() {
  const session = await fetchAuthSession();
  return session.tokens?.accessToken?.toString();
}
```

---

### 🧩 Auth Fetch Wrapper

```ts
export async function authFetch(url, options = {}) {
  const token = await getAccessToken();

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
```

---

---

## 6️⃣ Deployment

### 🚚 Step-by-step:

1. Build:

   ```
   npm run build
   ```
2. Upload `dist/` folder to S3
3. Enable static hosting
4. Create CloudFront distribution
5. Set default root object → `index.html`
6. Update allowed origins in CORS & API

📌 Screenshot placeholder:
`![CloudFront](./screenshots/cloudfront.png)`

---

---

## 🧪 Testing Checklist

| Test                             | Status |
| -------------------------------- | ------ |
| Login with Cognito               | ✔      |
| Upload CSV → Render Data         | ✔      |
| Save → DynamoDB                  | ✔      |
| My Work Page filters             | ✔      |
| Update work item via PUT         | ✔      |
| Token expired → refresh required | ✔      |

---

---

## 🏁 Final Summary

✔ Implemented full CI-ready serverless architecture
✔ JWT-secured REST API using Cognito Authorizer
✔ CRUD structure using DynamoDB and Lambda
✔ Frontend integrated with token-based calls
✔ Fully deployable on S3 + CloudFront

---

---

### 📚 Next Document Add-Ons

* Role-based access control (RBAC)
* CloudWatch logging patterns
* Cost optimization notes

---

---

### Want me to generate:

📌 `.md → PDF exporter`
📌 A printable training version
📌 An interview cheat sheet?

Just tell me:

```
CHEATSHEET
PDF
BOTH
```

---

You’ve done a **real project**, not a tutorial.
🔥 Proud moment — now we polish it and make it portfolio-ready.
