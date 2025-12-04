# Security Architecture - tRIAL-cLIENTS

## Overview

This document outlines the security architecture for the tRIAL-cLIENTS AI SaaS platform.

---

## Security Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────────┐     ┌────────────────────┐
│   Frontend   │────▶│   Cloudflare     │────▶│  Supabase Edge     │
│  (React App) │     │   Firewall       │     │    Function        │
│              │     │                  │     │                    │
│ • JWT Token  │     │ • DDoS Protection│     │ • Validate JWT     │
│ • Input Form │     │ • Rate Limiting  │     │ • Validate Input   │
│              │     │ • Bot Fight Mode │     │ • Check Credits    │
└──────────────┘     └──────────────────┘     └────────────────────┘
                                                        │
                                                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                        VALIDATION LAYER                           │
├──────────────────────────────────────────────────────────────────┤
│  1. Token Validation    → Missing/Invalid → 401 Unauthorized     │
│  2. Input Validation    → Invalid/Unsafe → 400 Bad Request       │
│  3. Credit Check        → Insufficient  → 402 Payment Required   │
│  4. Level Check         → Locked        → 403 Forbidden          │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   PostgreSQL     │     │   n8n Webhook    │────▶│  Gemini API  │
│   (Supabase)     │     │   (Secure URL)   │     │  (Server-side│
│                  │     │                  │     │   Key Only)  │
│ • RLS Policies   │     │ • Hidden Path    │     │              │
│ • Credit System  │     │ • Input Sanitized│     │              │
└──────────────────┘     └──────────────────┘     └──────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                        RESPONSE                                   │
├──────────────────────────────────────────────────────────────────┤
│  Success: { "ok": true, "status": 200, "id": "...", ... }        │
│  Error:   { "ok": false, "status": <code>, "message": "..." }    │
│  NO stack traces, NO internal error details                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 1. Token-Based Authentication

All API requests require a valid JWT token in the Authorization header.

### Implementation (Edge Function)
```typescript
// Verify authentication
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return errorResponse(401, 'Unauthorized: Missing authorization header');
}

const jwt = authHeader.replace('Bearer ', '');
const { data: { user }, error } = await supabase.auth.getUser(jwt);

if (error || !user) {
  return errorResponse(401, 'Unauthorized: Invalid token');
}
```

### Frontend Integration
```typescript
// All requests include the session token
const { data: { session } } = await supabase.auth.getSession();
const response = await supabase.functions.invoke('generate-project', {
  body: { level, projectType, industry },
  // Token is automatically included by Supabase client
});
```

---

## 2. Input Validation

### Schema Validation (Zod)
```typescript
const generateProjectSchema = z.object({
  level: z.enum(['beginner', 'intermediate', 'veteran']),
  projectType: z.string()
    .min(1, 'Project type is required')
    .max(100, 'Project type must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Invalid characters'),
  industry: z.string()
    .min(1, 'Industry is required')
    .max(100, 'Industry must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_&]+$/, 'Invalid characters'),
});
```

### Sanitization
```typescript
function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')  // Remove HTML tags
    .replace(/[<>'"]/g, '')    // Remove dangerous chars
    .trim();
}
```

### Validation Rules
| Field | Required | Max Length | Allowed Characters |
|-------|----------|------------|-------------------|
| level | Yes | - | beginner, intermediate, veteran |
| projectType | Yes | 100 | a-z, A-Z, 0-9, space, -, _ |
| industry | Yes | 100 | a-z, A-Z, 0-9, space, -, _, & |

---

## 3. Cloudflare Security Configuration

### Step-by-Step Setup

#### A. Enable DDoS Protection (Automatic)
1. Go to Cloudflare Dashboard → Your Domain
2. Navigate to **Security → DDoS**
3. Ensure "DDoS Protection" is **ON** (enabled by default)

#### B. Enable Bot Fight Mode
1. Go to **Security → Bots**
2. Enable **Bot Fight Mode** (toggle ON)
3. For better protection, enable **Super Bot Fight Mode** (requires paid plan)

#### C. Create Firewall Rules
Navigate to **Security → WAF → Custom Rules**

**Rule 1: Block Common Attack Patterns**
```
(http.request.uri.query contains "script>" or 
http.request.uri.query contains "<script" or 
http.request.uri.query contains "SELECT " or 
http.request.uri.query contains "UNION " or 
http.request.body.raw contains "<script")
```
Action: **Block**

**Rule 2: Block Suspicious User Agents**
```
(http.user_agent contains "curl" and not http.request.uri.path contains "/api/") or
(http.user_agent contains "python-requests") or
(http.user_agent eq "")
```
Action: **Challenge (CAPTCHA)**

#### D. Rate Limiting Rules
Navigate to **Security → WAF → Rate limiting rules**

**Rule: AI Generation Endpoint**
```
Expression: (http.request.uri.path contains "/functions/v1/generate-project")
Rate: 10 requests per minute
Per: IP address
Action: Block for 1 minute
```

**Rule: General API Rate Limit**
```
Expression: (http.request.uri.path contains "/functions/v1/")
Rate: 60 requests per minute
Per: IP address
Action: Challenge
```

#### E. API Shield (Enterprise)
If using Cloudflare Enterprise:
1. Go to **Security → API Shield**
2. Upload your OpenAPI schema
3. Enable **Schema Validation**
4. Block requests that don't match schema

---

## 4. Secure Webhook URL

### Best Practices
- Use unguessable paths: `/webhook/secure-brief-gen-9xhs72ks5`
- Store in environment variable: `N8N_WEBHOOK_URL`
- Never expose in frontend code
- Rotate periodically

### Why This Prevents Attacks
- Random paths prevent URL scanning/enumeration
- No predictable patterns for attackers to guess
- Combined with authentication, provides defense in depth

---

## 5. Credit System

### Credit Model

| Level | Free Monthly Quota | Credit Cost Per Project |
|-------|-------------------|------------------------|
| Beginner | 5 projects | 1 credit |
| Intermediate | 2 projects | 2 credits |
| Veteran | 0 (locked) | 4 credits |

### Veteran Level Access
- **Locked by default** for free users
- **Unlocks** when user purchases any paid plan
- All veteran projects cost 4 credits (no free quota)

### Credit Check Flow
```sql
-- Database function: check_and_consume_quota(_user_id, _level)

1. Get user subscription
2. Determine credit cost per level
3. If level = 'veteran' AND plan = 'free' → DENY (403)
4. If free_quota > 0 → Consume free quota → ALLOW
5. If credits < cost → DENY (402: Insufficient credits)
6. Deduct credits → ALLOW
```

### Response Codes
| Scenario | HTTP Code | Message |
|----------|-----------|---------|
| Success (free quota used) | 200 | "Free quota consumed" |
| Success (credits used) | 200 | "Credits consumed" |
| Insufficient credits | 402 | "Insufficient credits. Required: X, Available: Y" |
| Veteran locked | 403 | "Veteran level requires a paid plan" |
| Subscription not found | 404 | "Subscription not found" |

---

## 6. API Key Protection

### Server-Side Only
```typescript
// Edge Function - Keys in environment variables
const geminiKey = Deno.env.get('GEMINI_API_KEY');
const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');

// NEVER send to frontend
// NEVER log keys
// NEVER include in error responses
```

### Risks of Key Exposure
- **Financial**: Unauthorized API usage charges
- **Service Abuse**: Rate limits exhausted, service blocked
- **Data Breach**: Access to AI models, potential data leakage
- **Reputation**: Platform compromised, user trust lost

---

## 7. Error Response Format

### Standard Format
```json
{
  "ok": false,
  "status": 401,
  "message": "Unauthorized: Invalid token"
}
```

### Security Rules
- ❌ No stack traces
- ❌ No internal error details
- ❌ No database schema information
- ❌ No system paths
- ✅ Generic, user-friendly messages
- ✅ Appropriate HTTP status codes

---

## 8. Security Checklist

### Authentication & Authorization
- [x] JWT token required for all API calls
- [x] Token validation in edge function
- [x] User ID extracted from validated token
- [x] RLS policies enforce user data isolation

### Input Validation
- [x] Required field validation
- [x] Maximum length limits (100 chars)
- [x] Character whitelist (alphanumeric + safe chars)
- [x] HTML/script tag removal
- [x] Zod schema validation

### Rate Limiting (Cloudflare)
- [ ] DDoS protection enabled
- [ ] Bot Fight Mode enabled
- [ ] 10 req/min for AI generation
- [ ] 60 req/min general API

### API Key Protection
- [x] Gemini key server-side only
- [x] n8n webhook URL in env variable
- [x] No keys in frontend code
- [x] No keys in logs

### Credit System
- [x] Free quota tracked per level
- [x] Credit balance tracked
- [x] Server-side quota enforcement
- [x] Veteran level locked for free users
- [x] Credits deducted before allowing generation

### Safe Responses
- [x] Consistent error format
- [x] No stack traces
- [x] No internal details
- [x] Appropriate status codes

### Hidden Webhook
- [x] Unguessable webhook path
- [x] Stored in environment variable
- [x] Not exposed to frontend

### Abuse Resistance
- [x] Authentication required
- [x] Input sanitization
- [x] Rate limiting configured
- [x] Credit system prevents abuse
- [x] RLS prevents data access

---

## Quick Reference

### HTTP Status Codes Used
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (missing/invalid token) |
| 402 | Payment Required (insufficient credits) |
| 403 | Forbidden (veteran locked) |
| 404 | Not Found (subscription missing) |
| 500 | Internal Server Error |

### Environment Variables Required
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- `N8N_WEBHOOK_URL` - n8n webhook endpoint
- `GEMINI_API_KEY` - (in n8n) Gemini API key

---

## Maintenance

### Monthly Tasks
- Review Cloudflare analytics for attack patterns
- Check rate limiting effectiveness
- Audit failed authentication attempts
- Review credit system usage

### Quarterly Tasks
- Rotate webhook URL path
- Review and update firewall rules
- Security audit of edge functions
- Penetration testing
