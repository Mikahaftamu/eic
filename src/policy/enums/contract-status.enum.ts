export enum ContractStatus {
  DRAFT = 'DRAFT',           // Initial state when contract is being created
  PENDING = 'PENDING',       // Waiting for underwriting/approval
  ACTIVE = 'ACTIVE',         // Contract is active and in force
  GRACE_PERIOD = 'GRACE_PERIOD', // Payment is overdue but within grace period
  SUSPENDED = 'SUSPENDED',    // Coverage temporarily suspended (e.g., non-payment)
  CANCELLED = 'CANCELLED',    // Contract terminated before end date
  EXPIRED = 'EXPIRED',       // Contract reached its end date
  RENEWED = 'RENEWED'        // Contract has been renewed
}
