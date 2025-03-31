export enum PaymentStatus {
  PENDING = 'PENDING',         // Payment is due but not yet paid
  PARTIAL = 'PARTIAL',         // Partial payment received
  PAID = 'PAID',              // Full payment received
  OVERDUE = 'OVERDUE',        // Payment is overdue
  DEFAULTED = 'DEFAULTED',     // Payment defaulted beyond grace period
  REFUNDED = 'REFUNDED'       // Payment has been refunded
}
