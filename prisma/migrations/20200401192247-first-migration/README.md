# Migration `20200401192247-first-migration`

This migration has been generated by arbait <55246742+arbytez@users.noreply.github.com> at 4/1/2020, 7:22:47 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'ROOT');

CREATE TABLE "public"."User" (
    "createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" text  NOT NULL ,
    "id" text  NOT NULL ,
    "password" text  NOT NULL ,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "updatedAt" timestamp(3)  NOT NULL ,
    "username" text  NOT NULL ,
    PRIMARY KEY ("id")
) 

CREATE TABLE "public"."Todo" (
    "content" text  NOT NULL ,
    "createdAt" timestamp(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "done" boolean  NOT NULL ,
    "id" text  NOT NULL ,
    "updatedAt" timestamp(3)  NOT NULL ,
    "userId" text  NOT NULL ,
    PRIMARY KEY ("id")
) 

CREATE UNIQUE INDEX "User.email" ON "public"."User"("email")

ALTER TABLE "public"."Todo" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE  ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200401192247-first-migration
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,33 @@
+generator prisma_client {
+  provider = "prisma-client-js"
+}
+
+datasource db {
+  provider = "postgresql"
+  url      = env("DATABASE_URL")
+}
+
+enum Role {
+  USER ADMIN ROOT
+}
+
+model User {
+  id        String   @default(cuid()) @id
+  createdAt DateTime @default(now())
+  updatedAt DateTime @updatedAt
+  email     String   @unique
+  username  String
+  password  String
+  role      Role     @default(USER)
+  todos     Todo[]
+}
+
+model Todo {
+  id        String   @default(cuid()) @id
+  createdAt DateTime @default(now())
+  updatedAt DateTime @updatedAt
+  done      Boolean
+  content   String
+  user      User     @relation(fields: [userId], references: [id])
+  userId    String
+}
```

