# Sprint Tracker – Architecture & Design Rationale

## 1. Overview

Sprint Tracker is a **full‑stack, cloud‑native web application** designed to manage sprint workload, assignments, and capacity planning for development teams.

The system follows a **serverless, decoupled architecture** using AWS managed services to minimize operational overhead while remaining scalable, secure, and cost‑efficient.

**High‑level goals:**
- Secure, authenticated access (Cognito)
- Stateless backend (Lambda)
- Scalable data storage (DynamoDB)
- Low‑latency global UI delivery (S3 + CloudFront)
- Infrastructure as Code (AWS CDK)

---

## 2. High‑Level Architecture

```
Browser (React)
   ↓
CloudFront (CDN)
   ↓
S3 (Static UI Hosting)

Browser (API calls)
   ↓
API Gateway (REST + Cognito Authorizer)
   ↓
AWS Lambda (Node.js / TypeScript)
   ↓
DynamoDB (Sprint & Workload Data)
```

---

## 3. Frontend Architecture

### 3.1 React + Vite

**Why chosen:**
- Fast local development and build times
- Component‑based architecture
- Strong ecosystem
- Industry standard for modern SPAs

**Alternatives & when to use them:**
| Alternative | When to Choose |
|------------|--------------|
| Angular | Large enterprise apps with strict structure |
| Vue | Smaller teams, simpler learning curve |
| Next.js | SEO‑heavy apps, SSR/SSG required |

**Why React here:**
- SPA is sufficient (no SEO requirement)
- Faster iteration
- Fits well with static hosting on S3

---

## 4. Static Hosting: S3 + CloudFront

### 4.1 Amazon S3

**Role:**
- Stores compiled frontend assets (HTML, JS, CSS)

**Why S3:**
- Durable (11 9s)
- Cheap
- Native integration with CloudFront
- No server management

**Alternatives:**
| Alternative | Trade‑offs |
|-----------|------------|
| EC2 + Nginx | Full control, but high ops overhead |
| Elastic Beanstalk | Overkill for static UI |

### 4.2 CloudFront

**Role:**
- CDN for global low‑latency access
- TLS termination
- Caching static assets

**Why CloudFront:**
- Tight integration with S3
- Edge caching improves UX
- Cost‑effective for read‑heavy workloads

**Alternatives:**
| Alternative | When to Use |
|-----------|-------------|
| Akamai | Enterprise‑level CDN |
| Cloudflare | DNS + CDN + WAF focused |

---

## 5. Authentication: Amazon Cognito

### 5.1 Cognito User Pool

**Role:**
- User authentication
- JWT token issuance
- Secure identity management

**Why Cognito:**
- Managed service (no password storage)
- Native API Gateway integration
- Scales automatically

**Alternatives:**
| Alternative | When to Choose |
|-----------|---------------|
| Auth0 | Advanced enterprise IAM features |
| Custom JWT + DB | Full control, high security risk |

**Why Cognito here:**
- Cost‑effective
- AWS‑native
- Enough for sprint‑tracking use case

---

## 6. API Layer: API Gateway (REST)

### 6.1 REST API

**Why REST (not GraphQL):**
- Simple CRUD‑style operations
- Clear HTTP semantics
- Easier debugging

**Alternatives:**
| Alternative | When to Choose |
|-----------|---------------|
| GraphQL | Complex data graphs, frontend flexibility |
| WebSockets | Real‑time updates |

### 6.2 Cognito Authorizer

**Role:**
- Validates JWT tokens
- Injects user claims into Lambda context

**Why API Gateway Authorizer:**
- Offloads auth logic from Lambda
- Standardized security layer

---

## 7. Backend: AWS Lambda (Node.js)

### 7.1 Lambda

**Why Lambda:**
- Serverless (no infra management)
- Scales automatically
- Pay‑per‑execution

**Runtime:** Node.js 18 + TypeScript

**Why Node.js:**
- Same language as frontend
- Fast cold starts
- Strong AWS SDK support

**Alternatives:**
| Alternative | When to Choose |
|-----------|---------------|
| ECS/Fargate | Long‑running processes |
| EC2 | Legacy workloads |

---

## 8. Business Layer: Service & Repository Pattern

### 8.1 Service Layer (SprintService)

**Purpose:**
- Business logic
- Aggregation and calculations
- Keeps Lambda handler thin

**Why important:**
- Testable
- Maintainable
- Separation of concerns

### 8.2 Repository Layer (SprintRepository)

**Purpose:**
- All DynamoDB access isolated
- Query and persistence logic

**Why this pattern:**
- Avoids tight coupling
- Easier to change DB later

---

## 9. Data Layer: DynamoDB

### 9.1 DynamoDB (Single Table Design)

**Why DynamoDB:**
- Fully managed
- Serverless
- Millisecond latency
- Scales automatically

**Partition + Sort Key Design:**
- Optimized for access patterns
- Avoids joins

**Alternatives:**
| Alternative | When to Choose |
|-----------|---------------|
| RDS | Strong relational requirements |
| Aurora Serverless | Complex SQL queries |

**Why DynamoDB here:**
- Access patterns are known
- High read/write scalability
- Cost efficient

---

## 10. Infrastructure as Code: AWS CDK

### 10.1 CDK (TypeScript)

**Why CDK:**
- Strong typing
- Reusable constructs
- Easier than raw CloudFormation

**Alternatives:**
| Alternative | Trade‑offs |
|-----------|------------|
| Terraform | Multi‑cloud, less AWS‑native |
| CloudFormation | Verbose, harder to maintain |

**Why CDK here:**
- Same language as app
- Faster iteration
- Better refactoring support

---

## 11. Security Considerations

- JWT validation via Cognito
- No credentials stored in frontend
- IAM least privilege
- DynamoDB access scoped to Lambda
- CloudFront + HTTPS

---

## 12. Scalability & Reliability

- Stateless Lambdas
- Auto‑scaling API Gateway
- DynamoDB on‑demand billing
- CDN edge caching

---

## 13. Failure Handling

- Explicit error handling in Lambda
- 401 for unauthorized access
- 404 for unsupported routes
- 500 for internal failures

---

## 14. Topics Interviewers May Touch (Good to Know)

### Must‑Know
- JWT flow (Access vs ID token)
- API Gateway authorizers
- DynamoDB access patterns
- Lambda cold starts

### Nice‑to‑Have
- WAF with CloudFront
- API Gateway throttling
- DynamoDB GSIs
- CI/CD pipelines

---

## 15. Future Enhancements

- CI/CD via GitHub Actions
- Canary deployments for Lambda
- Metrics & alarms (CloudWatch)
- WAF protection

---

## 16. Summary

This architecture prioritizes:
- **Low operational overhead**
- **Scalability by default**
- **Security by design**
- **Clear separation of concerns**

It is well‑suited for small‑to‑medium production workloads and demonstrates real‑world, interview‑ready AWS system design.

