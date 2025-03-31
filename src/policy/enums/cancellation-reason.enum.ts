export enum CancellationReason {
  NON_PAYMENT = 'NON_PAYMENT',           // Contract cancelled due to non-payment
  MEMBER_REQUEST = 'MEMBER_REQUEST',      // Member requested cancellation
  FRAUD = 'FRAUD',                       // Contract cancelled due to fraud
  DEATH = 'DEATH',                       // Member deceased
  RELOCATION = 'RELOCATION',             // Member relocated outside coverage area
  EMPLOYER_TERMINATION = 'EMPLOYER_TERMINATION', // Employer terminated coverage
  OTHER = 'OTHER'                        // Other reasons
}
