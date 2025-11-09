export class DomainError extends Error { constructor(msg: string){ super(msg); } }
export class NotFoundError extends DomainError {}
export class ValidationError extends DomainError {}
export class ConflictError extends DomainError {}
export class ForbiddenError extends DomainError {}
export class PreconditionError extends DomainError {}
