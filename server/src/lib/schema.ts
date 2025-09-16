// Drizzle schema file
import { pgTable, text, timestamp, integer, doublePrecision, uuid, varchar, boolean, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('Role', ['USER', 'ADMIN', 'SUPERADMIN']);
export const orderStatusEnum = pgEnum('OrderStatus', ['PENDING', 'PAID', 'IN_TECHNICAL_REVIEW', 'APPROVED', 'FAILED', 'REFUNDED', 'CANCELED']);
export const payoutStatusEnum = pgEnum('PayoutStatus', ['PENDING', 'PAID', 'FAILED', 'UNPAID']);

// Forward declare all tables to break circular dependencies
let users: any;
let portfolios: any;
let blogPosts: any;
let services: any;
let carts: any;
let cartItems: any;
let coupons: any;
let orders: any;
let orderLineItems: any;
let referrals: any;
let commissions: any;
let payouts: any;
let refreshTokens: any;

// Define tables (using lazy () => for references)
portfolios = pgTable('PortfolioItem', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  thumbnailUrl: text('thumbnailUrl'),
  imageUrls: text('imageUrls').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table: any) => ({
  createdAtIdx: index('portfolios_createdAt_idx').on(table.createdAt),
}));

blogPosts = pgTable('BlogPost', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull().unique(),
  summary: text('summary').notNull(),
  content: text('content').notNull(),
  thumbnailUrl: text('thumbnailUrl'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table: any) => ({
  userIdIdx: index('blogPosts_userId_idx').on(table.userId),
  createdAtIdx: index('blogPosts_createdAt_idx').on(table.createdAt),
}));

services = pgTable('Service', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  price: doublePrecision('price').notNull(),
  features: text('features').notNull(),
  category: text('category').notNull(),
  thumbnailUrl: text('thumbnailUrl'),
  imageUrls: text('imageUrls').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table: any) => ({
  categoryIdx: index('services_category_idx').on(table.category),
  createdAtIdx: index('services_createdAt_idx').on(table.createdAt),
}));

cartItems = pgTable('CartItem', {
  id: uuid('id').defaultRandom().primaryKey(),
  quantity: integer('quantity').default(1).notNull(),
  cartId: uuid('cartId').notNull().references(() => carts.id),
  serviceId: uuid('serviceId').notNull().references(() => services.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table: any) => ({
  uniqueCartService: uniqueIndex('uniqueCartService').on(table.cartId, table.serviceId),
  cartIdIdx: index('cartItems_cartId_idx').on(table.cartId),
  serviceIdIdx: index('cartItems_serviceId_idx').on(table.serviceId),
}));

coupons = pgTable('Coupon', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  type: text('type').notNull(),
  value: integer('value').notNull(),
  minOrderAmount: integer('minOrderAmount'),
  maxUses: integer('maxUses'),
  currentUses: integer('currentUses').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  expiresAt: timestamp('expiresAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table: any) => ({
  activeIdx: index('coupons_active_idx').on(table.active),
  expiresAtIdx: index('coupons_expiresAt_idx').on(table.expiresAt),
}));

orderLineItems = pgTable('OrderLineItem', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('orderId').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  serviceId: uuid('serviceId').notNull().references(() => services.id),
  unitPrice: integer('unitPrice').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  totalPrice: integer('totalPrice').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table: any) => ({
  orderIdIdx: index('orderLineItems_orderId_idx').on(table.orderId),
  serviceIdIdx: index('orderLineItems_serviceId_idx').on(table.serviceId),
}));

// Now assign circular tables
users = pgTable('User', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 191 }).notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  role: roleEnum('role').default('USER').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull(),
  cartId: uuid('cartId').references(() => carts.id, { onDelete: 'cascade' }),
  referredById: uuid('referredById').references(() => referrals.id),
  passwordResetToken: text('passwordResetToken').unique(),
  passwordResetExpires: timestamp('passwordResetExpires'),
}, (table: any) => ({
  passwordResetTokenIdx: index('users_passwordResetToken_idx').on(table.passwordResetToken),
}));

carts = pgTable('Cart', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull(),
});

referrals = pgTable('Referral', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  code: text('code').notNull().unique(),
  commissionRate: doublePrecision('commissionRate').default(0.10).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table: any) => ({
  createdAtIdx: index('referrals_createdAt_idx').on(table.createdAt),
}));

orders = pgTable('Order', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  couponId: uuid('couponId').references(() => coupons.id),
  status: orderStatusEnum('status').default('PENDING').notNull(),
  currency: text('currency').default('USD').notNull(),
  totalAmount: integer('totalAmount').notNull(),
  requirements: text('requirements'),
  suggestions: text('suggestions'),
  preferences: text('preferences'),
  questions: text('questions'),
  metadata: text('metadata'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull(),
  referralId: uuid('referralId').references(() => referrals.id),
}, (table: any) => ({
  userIdIdx: index('orders_userId_idx').on(table.userId),
  statusIdx: index('orders_status_idx').on(table.status),
  createdAtIdx: index('orders_createdAt_idx').on(table.createdAt),
  referralIdIdx: index('orders_referralId_idx').on(table.referralId),
}));

commissions = pgTable('Commission', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('orderId').notNull().unique().references(() => orders.id, { onDelete: 'cascade' }),
  referralId: uuid('referralId').notNull().references(() => referrals.id),
  amount: integer('amount').notNull(),
  status: payoutStatusEnum('status').default('UNPAID').notNull(),
  payoutId: uuid('payoutId').references(() => payouts.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table: any) => ({
  referralIdIdx: index('commissions_referralId_idx').on(table.referralId),
  createdAtIdx: index('commissions_createdAt_idx').on(table.createdAt),
}));

payouts = pgTable('Payout', {
  id: uuid('id').defaultRandom().primaryKey(),
  referralId: uuid('referralId').notNull().references(() => referrals.id),
  amount: integer('amount').notNull(),
  status: payoutStatusEnum('status').default('PENDING').notNull(),
  payoutDate: timestamp('payoutDate').defaultNow().notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table: any) => ({
  referralIdIdx: index('payouts_referralId_idx').on(table.referralId),
  statusIdx: index('payouts_status_idx').on(table.status),
  payoutDateIdx: index('payouts_payoutDate_idx').on(table.payoutDate),
}));

refreshTokens = pgTable('RefreshToken', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('tokenHash').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  revokedAt: timestamp('revokedAt'),
  replacedByTokenId: uuid('replacedByTokenId').references(() => refreshTokens.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (table: any) => ({
  userIdIdx: index('refreshTokens_userId_idx').on(table.userId),
  expiresAtIdx: index('refreshTokens_expiresAt_idx').on(table.expiresAt),
}));

// Now export the tables (they are assigned and ready)
export {
  users,
  portfolios,
  blogPosts,
  services,
  carts,
  cartItems,
  coupons,
  orders,
  orderLineItems,
  referrals,
  commissions,
  payouts,
  refreshTokens,
};

// Relations (now all refs are resolved)
export const usersRelations = relations(users, ({ one, many }) => ({
  cart: one(carts, {
    fields: [users.cartId],
    references: [carts.id],
  }),
  orders: many(orders),
  referredBy: one(referrals, {
    fields: [users.referredById],
    references: [referrals.id],
    relationName: 'referredBy',
  }),
  promoterReferral: one(referrals, {
    fields: [users.id],
    references: [referrals.userId],
  }),
  blogPosts: many(blogPosts),
  refreshTokens: many(refreshTokens),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  service: one(services, {
    fields: [cartItems.serviceId],
    references: [services.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  coupon: one(coupons, {
    fields: [orders.couponId],
    references: [coupons.id],
  }),
  lineItems: many(orderLineItems),
  referral: one(referrals, {
    fields: [orders.referralId],
    references: [referrals.id],
  }),
  commission: one(commissions, {
    fields: [orders.id],
    references: [commissions.orderId],
  }),
}));

export const orderLineItemsRelations = relations(orderLineItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderLineItems.orderId],
    references: [orders.id],
  }),
  service: one(services, {
    fields: [orderLineItems.serviceId],
    references: [services.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ many }) => ({
  orders: many(orders),
}));

export const referralsRelations = relations(referrals, ({ one, many }) => ({
  promoter: one(users, {
    fields: [referrals.userId],
    references: [users.id],
    relationName: 'promoter',
  }),
  referredUsers: many(users, {
    relationName: 'referredBy',
  }),
  orders: many(orders),
  commissions: many(commissions),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  order: one(orders, {
    fields: [commissions.orderId],
    references: [orders.id],
  }),
  referral: one(referrals, {
    fields: [commissions.referralId],
    references: [referrals.id],
  }),
  payout: one(payouts, {
    fields: [commissions.payoutId],
    references: [payouts.id],
  }),
}));

export const payoutsRelations = relations(payouts, ({ one, many }) => ({
  referral: one(referrals, {
    fields: [payouts.referralId],
    references: [referrals.id],
  }),
  commissions: many(commissions),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  user: one(users, {
    fields: [blogPosts.userId],
    references: [users.id],
  }),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  cartItems: many(cartItems),
  orderLineItems: many(orderLineItems),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

// Schema export
export const schema = {
  users,
  portfolios,
  blogPosts,
  services,
  carts,
  cartItems,
  coupons,
  orders,
  orderLineItems,
  referrals,
  commissions,
  payouts,
  refreshTokens,
} as const;

export type Schema = typeof schema;
