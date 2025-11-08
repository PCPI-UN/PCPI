# Notification-Service Implementation Guide

**Service:** notification-service
**Priority:** 🟢 MEDIUM - Supporting service
**Dependencies:** None

---

## Service Overview

### Responsibilities

1. **Send Emails** - Deliver emails via SMTP/service

### Authorization Strategy

**Current:** No authorization (trusts calling services)

**Recommendation:** Services should only call notification-service after their own authorization checks pass. No additional authorization needed in notification-service itself.

---

## Proto Contract

```protobuf
service NotificationService {
  rpc SendEmail(SendEmailRequest) returns (SendEmailResponse);
}
```

---

## Implementation Checklist

- [x] Basic SendEmail RPC exists
- [ ] Add email templates (optional enhancement)
- [ ] Add rate limiting (spam prevention)
- [ ] Add email validation

**Status:** Basic implementation sufficient for MVP
**Estimated Effort:** 2-4 hours for enhancements
