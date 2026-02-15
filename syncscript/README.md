# 🚀 SyncScript - Collaborative Vault Management System

A modern, real-time collaborative platform for organizing and sharing research sources with role-based access control.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Core Functionality](#core-functionality)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Demo Credentials](#demo-credentials)

## ✨ Features

### Authentication & Authorization
- 🔐 Secure signup/login with NextAuth.js v5
- 🎭 Role-based access control (Owner, Contributor, Viewer)
- 🔑 JWT session management

### Vault Management
- 📁 Create and manage vaults
- 🔗 Generate invite links for collaboration
- 👥 Invite team members with role assignment
- 🎯 Role-based UI rendering

### Source Management
- 📝 Add sources with title, URL, content, and tags
- 🏷️ Tag-based organization
- 📊 Real-time source updates
- 🗑️ Delete sources (owner only)

### Collaboration Features
- 🔄 Real-time updates with Socket.io
- 📜 Comprehensive audit logging
- 👤 Member role management
- 🔔 Toast notifications for events

## 🛠️ Tech Stack

### Frontend
- **Next.js 15+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **NextAuth.js v5** - Authentication
- **Socket.io Client** - Real-time updates

### Backend
- **Next.js API Routes** - Serverless API
- **Prisma ORM** - Database toolkit
- **NeonDB** - Serverless PostgreSQL
- **Socket.io** - WebSocket server
- **Zod** - Schema validation
- **bcryptjs** - Password hashing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- NeonDB account (or PostgreSQL database)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Habibullahdevv/syncscript-hackathon.git
   cd syncscript-hackathon/syncscript
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="your_neondb_connection_string"

   # NextAuth
   NEXTAUTH_SECRET="your_secret_key_here"
   NEXTAUTH_URL="http://localhost:3000"

   # Cloudinary (optional for file uploads)
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database** (optional - creates demo users)
   ```bash
   npx prisma db seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
syncscript/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding
│   └── migrations/            # Migration history
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Dashboard pages
│   │   ├── api/               # API routes
│   │   ├── invite/            # Invite acceptance
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── vaults/            # Vault detail pages
│   ├── components/
│   │   ├── dashboard/         # Dashboard components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── auth-config.ts     # NextAuth configuration
│   │   ├── auth-session.ts    # Session utilities
│   │   ├── prisma.ts          # Prisma client
│   │   ├── validators.ts      # Zod schemas
│   │   └── responses.ts       # API response helpers
│   └── types/                 # TypeScript definitions
├── server.ts                  # Custom server with Socket.io
└── package.json
```

## 🎯 Core Functionality

### User Flow

1. **Sign Up** → Create account with email/password
2. **Login** → Authenticate and access dashboard
3. **Create Vault** → Owner creates a new vault
4. **Invite Members** → Generate invite link and share
5. **Accept Invite** → Members join as contributors
6. **Add Sources** → Contributors add research sources
7. **Manage Roles** → Owner changes member roles
8. **View Audit Log** → Owner reviews all actions

### Role Permissions

| Action | Owner | Contributor | Viewer |
|--------|-------|-------------|--------|
| Create Vault | ✅ | ❌ | ❌ |
| View Vault | ✅ | ✅ | ✅ |
| Update Vault | ✅ | ✅ | ❌ |
| Delete Vault | ✅ | ❌ | ❌ |
| Add Source | ✅ | ✅ | ❌ |
| View Source | ✅ | ✅ | ✅ |
| Delete Source | ✅ | ❌ | ❌ |
| Generate Invite | ✅ | ❌ | ❌ |
| Change Roles | ✅ | ❌ | ❌ |
| View Audit Log | ✅ | ❌ | ❌ |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Vaults
- `GET /api/vaults` - List all accessible vaults
- `POST /api/vaults` - Create new vault
- `GET /api/vaults/[id]` - Get vault details
- `PATCH /api/vaults/[id]` - Update vault
- `DELETE /api/vaults/[id]` - Delete vault

### Sources
- `GET /api/vaults/[id]/sources` - List vault sources
- `POST /api/vaults/[id]/sources` - Add source
- `DELETE /api/vaults/[id]/sources/[sourceId]` - Delete source

### Invites
- `POST /api/vaults/[id]/invite` - Generate invite link
- `GET /api/invites/[token]` - Validate invite
- `POST /api/invites/[token]/accept` - Accept invite

### Members
- `PATCH /api/vaults/[id]/members/[userId]` - Change member role

### Audit
- `GET /api/vaults/[id]/audit` - Get audit logs

## 🗄️ Database Schema

### Core Models

- **User** - Authentication and profile
- **Vault** - Container for sources
- **VaultUser** - Many-to-many with roles
- **Source** - Research sources with metadata
- **VaultInvite** - Invite link management
- **AuditLog** - Action history tracking

## 🎭 Demo Credentials

After running `npx prisma db seed`, you can use:

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@demo.com | owner123 |
| Contributor | contributor@demo.com | contributor123 |
| Viewer | viewer@demo.com | viewer123 |

## 🧪 Testing

### Manual Testing Flow

1. **Sign up** with a new account
2. **Create a vault** from dashboard
3. **Generate invite link** from vault detail page
4. **Open invite link** in incognito/another browser
5. **Accept invite** and join as contributor
6. **Add sources** as contributor
7. **Change roles** as owner
8. **View audit log** to see all actions

## 📝 License

This project was created for a hackathon challenge.

## 👨‍💻 Author

**Habibullah**
- GitHub: [@Habibullahdevv](https://github.com/Habibullahdevv)

---

Built with ❤️ using Next.js, Prisma, and NeonDB
