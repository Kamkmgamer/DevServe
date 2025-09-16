CREATE TYPE "public"."OrderStatus" AS ENUM('PENDING', 'PAID', 'IN_TECHNICAL_REVIEW', 'APPROVED', 'FAILED', 'REFUNDED', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."PayoutStatus" AS ENUM('PENDING', 'PAID', 'FAILED', 'UNPAID');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('USER', 'ADMIN', 'SUPERADMIN');--> statement-breakpoint
CREATE TABLE "BlogPost" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"content" text NOT NULL,
	"thumbnailUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" uuid NOT NULL,
	CONSTRAINT "BlogPost_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "CartItem" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"cartId" uuid NOT NULL,
	"serviceId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Cart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Cart_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "Commission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"referralId" uuid NOT NULL,
	"amount" integer NOT NULL,
	"status" "PayoutStatus" DEFAULT 'UNPAID' NOT NULL,
	"payoutId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Commission_orderId_unique" UNIQUE("orderId")
);
--> statement-breakpoint
CREATE TABLE "Coupon" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"value" integer NOT NULL,
	"minOrderAmount" integer,
	"maxUses" integer,
	"currentUses" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Coupon_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "OrderLineItem" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"serviceId" uuid NOT NULL,
	"unitPrice" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"totalPrice" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"couponId" uuid,
	"status" "OrderStatus" DEFAULT 'PENDING' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"totalAmount" integer NOT NULL,
	"requirements" text,
	"suggestions" text,
	"preferences" text,
	"questions" text,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"referralId" uuid
);
--> statement-breakpoint
CREATE TABLE "Payout" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referralId" uuid NOT NULL,
	"amount" integer NOT NULL,
	"status" "PayoutStatus" DEFAULT 'PENDING' NOT NULL,
	"payoutDate" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PortfolioItem" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"thumbnailUrl" text,
	"imageUrls" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Referral" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"code" text NOT NULL,
	"commissionRate" double precision DEFAULT 0.1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Referral_userId_unique" UNIQUE("userId"),
	CONSTRAINT "Referral_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "RefreshToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"tokenHash" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"revokedAt" timestamp,
	"replacedByTokenId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "RefreshToken_tokenHash_unique" UNIQUE("tokenHash")
);
--> statement-breakpoint
CREATE TABLE "Service" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" double precision NOT NULL,
	"features" text NOT NULL,
	"category" text NOT NULL,
	"thumbnailUrl" text,
	"imageUrls" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Service_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(191) NOT NULL,
	"password" text NOT NULL,
	"name" text,
	"role" "Role" DEFAULT 'USER' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"cartId" uuid,
	"referredById" uuid,
	"passwordResetToken" text,
	"passwordResetExpires" timestamp,
	CONSTRAINT "User_email_unique" UNIQUE("email"),
	CONSTRAINT "User_passwordResetToken_unique" UNIQUE("passwordResetToken")
);
--> statement-breakpoint
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_Cart_id_fk" FOREIGN KEY ("cartId") REFERENCES "public"."Cart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_serviceId_Service_id_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_orderId_Order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_referralId_Referral_id_fk" FOREIGN KEY ("referralId") REFERENCES "public"."Referral"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_payoutId_Payout_id_fk" FOREIGN KEY ("payoutId") REFERENCES "public"."Payout"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_orderId_Order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_serviceId_Service_id_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_Coupon_id_fk" FOREIGN KEY ("couponId") REFERENCES "public"."Coupon"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_referralId_Referral_id_fk" FOREIGN KEY ("referralId") REFERENCES "public"."Referral"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_referralId_Referral_id_fk" FOREIGN KEY ("referralId") REFERENCES "public"."Referral"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_replacedByTokenId_RefreshToken_id_fk" FOREIGN KEY ("replacedByTokenId") REFERENCES "public"."RefreshToken"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_cartId_Cart_id_fk" FOREIGN KEY ("cartId") REFERENCES "public"."Cart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_Referral_id_fk" FOREIGN KEY ("referredById") REFERENCES "public"."Referral"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blogPosts_userId_idx" ON "BlogPost" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "blogPosts_createdAt_idx" ON "BlogPost" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "uniqueCartService" ON "CartItem" USING btree ("cartId","serviceId");--> statement-breakpoint
CREATE INDEX "cartItems_cartId_idx" ON "CartItem" USING btree ("cartId");--> statement-breakpoint
CREATE INDEX "cartItems_serviceId_idx" ON "CartItem" USING btree ("serviceId");--> statement-breakpoint
CREATE INDEX "commissions_referralId_idx" ON "Commission" USING btree ("referralId");--> statement-breakpoint
CREATE INDEX "commissions_createdAt_idx" ON "Commission" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "coupons_active_idx" ON "Coupon" USING btree ("active");--> statement-breakpoint
CREATE INDEX "coupons_expiresAt_idx" ON "Coupon" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "orderLineItems_orderId_idx" ON "OrderLineItem" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "orderLineItems_serviceId_idx" ON "OrderLineItem" USING btree ("serviceId");--> statement-breakpoint
CREATE INDEX "orders_userId_idx" ON "Order" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "Order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_createdAt_idx" ON "Order" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "orders_referralId_idx" ON "Order" USING btree ("referralId");--> statement-breakpoint
CREATE INDEX "payouts_referralId_idx" ON "Payout" USING btree ("referralId");--> statement-breakpoint
CREATE INDEX "payouts_status_idx" ON "Payout" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payouts_payoutDate_idx" ON "Payout" USING btree ("payoutDate");--> statement-breakpoint
CREATE INDEX "portfolios_createdAt_idx" ON "PortfolioItem" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "referrals_createdAt_idx" ON "Referral" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "refreshTokens_userId_idx" ON "RefreshToken" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "expiresAt_idx" ON "RefreshToken" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "services_category_idx" ON "Service" USING btree ("category");--> statement-breakpoint
CREATE INDEX "services_createdAt_idx" ON "Service" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "users_passwordResetToken_idx" ON "User" USING btree ("passwordResetToken");