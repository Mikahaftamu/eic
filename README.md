# EHealthSuite

EHealthSuite is a comprehensive health insurance management system designed to streamline operations for insurance companies, members, providers, and administrators.

## Table of Contents

- [Overview](#overview)
- [Core Functional Areas](#core-functional-areas)
- [System Architecture](#system-architecture)
- [Key Features](#key-features)
  - [Multi-tenant Architecture](#multi-tenant-architecture)
  - [Policy Administration](#policy-administration)
  - [Member Management](#member-management)
  - [Authentication & Authorization](#authentication--authorization)
  - [Analytics & Reporting](#analytics--reporting)
  - [Medical Catalog Management](#medical-catalog-management)
  - [Fraud Detection & Prevention](#fraud-detection--prevention)
- [Technical Stack](#technical-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)

## Overview

EHealthSuite is a modular health insurance management platform that enables insurance companies to manage their policies, members, claims, and provider networks efficiently. The system is designed with a multi-tenant architecture, allowing multiple insurance companies to operate on the same platform while maintaining data isolation.

## Core Functional Areas

1. **Policy Administration**: Health insurance product management including quoting, underwriting, issuance, endorsements, renewals, and cancellations
2. **Member Management**: Enrollment, eligibility verification, demographics, dependent management, ID cards
3. **Provider Network Management**: Provider database, credentialing, contract management
4. **Claims Processing**: EDI/Paper/Portal claim intake, adjudication, payments, EOB/RA generation, appeals
5. **Premium Billing & Collection**: Invoicing, payment processing, reconciliation, grace period and delinquency management
6. **CSR Interface**: Customer service tools for member inquiry management
7. **Member Portal**: Self-service portal for benefits, provider search, claims, ID cards
8. **Provider Portal**: Healthcare provider portal for eligibility verification and claims
9. **Reporting & Analytics**: Comprehensive dashboards, financial reports, claims analytics, member statistics, provider performance metrics, and policy analytics
10. **Medical Catalog Management**: Standardized medical items and services catalog with pricing, coding, and authorization rules
11. **Fraud Detection & Prevention**: Rule-based system for identifying suspicious claims and patterns
12. **System Administration**: User management, RBAC, security, audit trails
13. **Integrations**: EIC General Ledger system and CBE/Vite/MoH digital payment ecosystem

## System Architecture

EHealthSuite is built on a modern tech stack using NestJS for the backend and follows a modular architecture pattern. Each functional area is implemented as a separate module with its own controllers, services, and entities.

The system uses TypeORM for database interactions and follows a repository pattern for data access.

### Modules

The system is organized into the following modules:

1. **Admin Module**: Administration and system management
2. **Analytics Module**: Comprehensive reporting and data analytics
3. **Auth Module**: Authentication and authorization
4. **Billing Module**: Invoice generation, payment processing, and financial management
5. **Claims Module**: Claims submission, processing, and adjudication
6. **Corporate Module**: Corporate client management and group policies
7. **Insurance Module**: Insurance company management and configuration
8. **Members Module**: Member enrollment, profiles, and eligibility management
9. **Policy Module**: Policy products, contracts, and coverage management
10. **Providers Module**: Healthcare provider network management
11. **Staff Module**: Staff user management and permissions

Each module is designed to be independent yet interconnected, allowing for easy maintenance and scalability.

The API is RESTful and documented using Swagger.

## Key Features

### Multi-tenant Architecture

- **Insurance Company Entity**: Complete profile management with configurable settings
- **Data Isolation**: All user types (Members, Providers, Staff) are associated with an insurance company
- **Role-based Access**: Admin users can manage multiple insurance companies
- **Security**: JWT tokens include insurance company information for tenant isolation

### Policy Administration

- **Policy Products**: Define and manage different insurance products with customizable features
- **Policy Contracts**: Create and manage contracts between members and insurance companies
- **Premium Calculation**: Dynamic premium calculation based on various factors:
  - Base premium rates
  - Age factors
  - Family size factors
  - Coverage type modifiers
  - Special terms (loadings and discounts)

### Member Management

- **Member Enrollment**: Register new members with comprehensive personal information
- **Dependent Management**: Add, update, and remove dependents with relationship tracking
- **Eligibility Verification**: Real-time verification based on active status, coverage dates, and policy contract
- **Demographics Management**: Store and update personal and contact information
- **ID Card Generation**: Generate PDF ID cards with member details and QR code verification
- **Medical History**: Track and manage member medical history records
- **Benefits Management**: Define and update detailed benefits information for each member

### Authentication & Authorization

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different access levels for Admin, Staff, Member, and Provider users
- **Password Hashing**: Secure password storage using bcrypt
- **Account Management**: User registration, login, and profile management

### Analytics & Reporting

- **Financial Analytics**: 
  - Revenue and expense tracking
  - Premium revenue analysis
  - Claims expense analysis
  - Outstanding payments monitoring
  - Monthly revenue trends
  
- **Claims Analytics**:
  - Claims distribution by status
  - Average processing time
  - Claims by provider
  - Top claim categories
  - Top providers by claims volume
  
- **Member Analytics**:
  - Enrollment statistics (new enrollments, cancellations, growth rate)
  - Member demographics (age groups, gender distribution)
  - Member retention rates
  
- **Provider Analytics**:
  - Provider performance metrics
  - Satisfaction ratings
  - Claims processing efficiency
  
- **Policy Analytics**:
  - Policy distribution by type
  - Renewal rates
  - Policy profitability analysis
  
- **Dashboard Summary**:
  - Key performance indicators
  - Active members count
  - Pending claims count
  - Expiring policies alerts
  - Financial summary

### Medical Catalog Management

- **Medical Categories**:
  - Hierarchical organization of medical items and services
  - Category-based search and filtering
  - Parent-child relationships for subcategories

- **Medical Items**:
  - Comprehensive drug catalog with NDC codes
  - Medical supplies and equipment inventory
  - Pricing information and units of measurement
  - Generic alternatives and brand name tracking
  - Prior authorization requirements

- **Medical Services**:
  - Standardized procedure codes (CPT, HCPCS)
  - Service categorization by type (consultation, diagnostic, etc.)
  - Standard duration and pricing
  - Applicable diagnosis codes (ICD-10)
  - Valid place of service restrictions
  - Modifier support for billing variations

- **Integration with Claims**:
  - Validation of service and item codes during claims submission
  - Automated pricing based on catalog data
  - Identification of services requiring prior authorization
  - Support for medical necessity determination

### Fraud Detection & Prevention

- **Rule-Based Detection System**:
  - Configurable rules for identifying suspicious claims
  - Multiple rule types (frequency, compatibility, upcoding, etc.)
  - Severity-based alerting and prioritization
  - Insurance company-specific and system-wide rules

- **Fraud Alert Management**:
  - Workflow for reviewing and resolving alerts
  - Detailed explanation of rule violations
  - Confidence scoring for prioritization
  - Historical tracking of alert resolutions

- **Detection Capabilities**:
  - **Frequency Analysis**: Identifies unusually frequent procedures
  - **Compatibility Checks**: Detects mutually exclusive service combinations
  - **Upcoding Detection**: Identifies suspicious patterns of higher-paying codes
  - **Provider Pattern Analysis**: Compares provider billing patterns against peers

- **Integration with Analytics**:
  - Fraud statistics and trend reporting
  - Provider risk scoring
  - Visualization of fraud patterns and hotspots
  - ROI tracking for fraud prevention efforts

## Technical Stack

- **Backend**: NestJS (Node.js framework)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **PDF Generation**: PDFKit
- **QR Code**: QRCode library

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- PostgreSQL (v12 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ehealthsuite.git
   cd ehealthsuite
   ```

2. Install dependencies:
   ```
   cd backend
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database connection settings and other environment variables

4. Run database migrations:
   ```
   npm run migration:run
   ```

5. Start the development server:
   ```
   npm run start:dev
   ```

## API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:3000/api
```

This provides a complete interactive documentation of all API endpoints, including:

- Policy Administration endpoints
- Member Management endpoints
- Authentication endpoints
- Insurance Company management endpoints
