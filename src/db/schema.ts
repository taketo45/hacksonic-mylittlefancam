import { pgTable, serial, varchar, text, boolean, timestamp, date, time, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 組織区分の列挙型
export const organizationTypeEnum = pgEnum('organization_type', ['保育園', '幼稚園', '小学校', '中学校', '高校', 'その他']);

// アカウント状態の列挙型
export const accountStatusEnum = pgEnum('account_status', ['有効', '無効', '停止中', '審査中']);

// イベント状態の列挙型
export const eventStatusEnum = pgEnum('event_status', ['準備中', '公開中', '終了', 'キャンセル']);

// イベント枠状態の列挙型
export const eventSlotStatusEnum = pgEnum('event_slot_status', ['準備中', '公開中', '終了', 'キャンセル']);

// 印刷状態の列挙型
export const printStatusEnum = pgEnum('print_status', ['準備中', '印刷中', '印刷完了', '発送準備中', '発送完了', 'キャンセル', 'エラー']);

// 組織マスタテーブル
export const organizationMst = pgTable('organization_mst', {
  organizationId: varchar('organization_id', { length: 36 }).primaryKey(),
  organizationName: varchar('organization_name', { length: 100 }).notNull(),
  organizationAddress: text('organization_address'),
  organizationContact: varchar('organization_contact', { length: 100 }),
  organizationType: organizationTypeEnum('organization_type'),
  department: varchar('department', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 組織と主催者の関連テーブル
export const organizationHostTbl = pgTable('organization_host_tbl', {
  id: serial('id').primaryKey(),
  organizationId: varchar('organization_id', { length: 36 }).notNull().references(() => organizationMst.organizationId),
  hostId: varchar('host_id', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 主催者テーブル
export const hostTbl = pgTable('host_tbl', {
  hostId: varchar('host_id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  accountStatus: accountStatusEnum('account_status').default('審査中'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 主催者詳細テーブル
export const hostDetailTbl = pgTable('host_detail_tbl', {
  id: serial('id').primaryKey(),
  hostId: varchar('host_id', { length: 36 }).notNull().references(() => hostTbl.hostId),
  address: text('address'),
  phoneNumber: varchar('phone_number', { length: 20 }),
  organizationId: varchar('organization_id', { length: 36 }).references(() => organizationMst.organizationId),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 主催者とイベントの関連テーブル
export const hostEventTbl = pgTable('host_event_tbl', {
  id: serial('id').primaryKey(),
  hostId: varchar('host_id', { length: 36 }).notNull().references(() => hostTbl.hostId),
  eventId: varchar('event_id', { length: 36 }).notNull(),
  eventRole: varchar('event_role', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// イベントテーブル
export const eventTbl = pgTable('event_tbl', {
  eventId: varchar('event_id', { length: 36 }).primaryKey(),
  eventName: varchar('event_name', { length: 100 }).notNull(),
  eventStatus: eventStatusEnum('event_status').default('準備中'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// イベント枠テーブル
export const eventSlotTbl = pgTable('event_slot_tbl', {
  eventSlotId: varchar('event_slot_id', { length: 36 }).primaryKey(),
  eventId: varchar('event_id', { length: 36 }).notNull().references(() => eventTbl.eventId),
  eventSlotName: varchar('event_slot_name', { length: 100 }).notNull(),
  eventDate: date('event_date'),
  eventTime: time('event_time'),
  facilityId: varchar('facility_id', { length: 36 }),
  geoCode: varchar('geo_code', { length: 100 }),
  eventSlotDetail: text('event_slot_detail'),
  eventSlotStatus: eventSlotStatusEnum('event_slot_status').default('準備中'),
  ticketUrl: varchar('ticket_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 主催者とイベント枠の関連テーブル
export const hostEventSlotTbl = pgTable('host_event_slot_tbl', {
  id: serial('id').primaryKey(),
  hostId: varchar('host_id', { length: 36 }).notNull().references(() => hostTbl.hostId),
  eventSlotId: varchar('event_slot_id', { length: 36 }).notNull().references(() => eventSlotTbl.eventSlotId),
  slotRole: varchar('slot_role', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 施設マスタテーブル
export const facilityMst = pgTable('facility_mst', {
  facilityId: varchar('facility_id', { length: 36 }).primaryKey(),
  facilityName: varchar('facility_name', { length: 100 }).notNull(),
  facilityAddress: text('facility_address'),
  facilityPhone: varchar('facility_phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 座席ブロックテーブル
export const seatBlockTbl = pgTable('seat_block_tbl', {
  id: serial('id').primaryKey(),
  facilityId: varchar('facility_id', { length: 36 }).notNull().references(() => facilityMst.facilityId),
  seatBlockId: varchar('seat_block_id', { length: 36 }).notNull(),
  seatType: varchar('seat_type', { length: 50 }),
  areaId: varchar('area_id', { length: 36 }),
  blockId: varchar('block_id', { length: 36 }),
  subBlockId: varchar('sub_block_id', { length: 36 }),
  startLineId: varchar('start_line_id', { length: 36 }),
  endLineId: varchar('end_line_id', { length: 36 }),
  startRowId: varchar('start_row_id', { length: 36 }),
  endRowId: varchar('end_row_id', { length: 36 }),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ユーザーテーブル
export const userTbl = pgTable('user_tbl', {
  userId: varchar('user_id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  accountStatus: accountStatusEnum('account_status').default('審査中'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ユーザーのイベント参加テーブル
export const userParticipationTbl = pgTable('user_participation_tbl', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => userTbl.userId),
  eventSlotId: varchar('event_slot_id', { length: 36 }).notNull().references(() => eventSlotTbl.eventSlotId),
  facilityId: varchar('facility_id', { length: 36 }).references(() => facilityMst.facilityId),
  seatBlockId: varchar('seat_block_id', { length: 36 }),
  seatLineId: varchar('seat_line_id', { length: 36 }),
  seatRowId: varchar('seat_row_id', { length: 36 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 撮影者テーブル
export const photographerTbl = pgTable('photographer_tbl', {
  photographerId: varchar('photographer_id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  accountStatus: accountStatusEnum('account_status').default('審査中'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 撮影者のイベントアサインテーブル
export const photographerAssignTbl = pgTable('photographer_assign_tbl', {
  id: serial('id').primaryKey(),
  photographerId: varchar('photographer_id', { length: 36 }).notNull().references(() => photographerTbl.photographerId),
  targetEventId: varchar('target_event_id', { length: 36 }).references(() => eventTbl.eventId),
  targetEventSlotId: varchar('target_event_slot_id', { length: 36 }).references(() => eventSlotTbl.eventSlotId),
  targetAreaId: varchar('target_area_id', { length: 36 }),
  targetBlockId: varchar('target_block_id', { length: 36 }),
  targetSubBlockId: varchar('target_sub_block_id', { length: 36 }),
  targetStartLineId: varchar('target_start_line_id', { length: 36 }),
  targetEndLineId: varchar('target_end_line_id', { length: 36 }),
  targetStartRowId: varchar('target_start_row_id', { length: 36 }),
  targetEndRowId: varchar('target_end_row_id', { length: 36 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 撮影情報テーブル
export const photoShootTbl = pgTable('photo_shoot_tbl', {
  shootId: varchar('shoot_id', { length: 36 }).primaryKey(),
  eventSlotId: varchar('event_slot_id', { length: 36 }).references(() => eventSlotTbl.eventSlotId),
  photographerId: varchar('photographer_id', { length: 36 }).references(() => photographerTbl.photographerId),
  storageUrl: varchar('storage_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// オリジナル写真テーブル
export const originalPhotoTbl = pgTable('original_photo_tbl', {
  originalPhotoId: varchar('original_photo_id', { length: 36 }).primaryKey(),
  shootId: varchar('shoot_id', { length: 36 }).references(() => photoShootTbl.shootId),
  storageUrl: varchar('storage_url', { length: 255 }).notNull(),
  userPreference: varchar('user_preference', { length: 50 }),
  geoCode: varchar('geo_code', { length: 100 }),
  shootDateTime: timestamp('shoot_date_time'),
  isNG: boolean('is_ng').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 編集済み写真テーブル
export const editedPhotoTbl = pgTable('edited_photo_tbl', {
  editedPhotoId: varchar('edited_photo_id', { length: 36 }).primaryKey(),
  originalPhotoId: varchar('original_photo_id', { length: 36 }).references(() => originalPhotoTbl.originalPhotoId),
  storageUrl: varchar('storage_url', { length: 255 }).notNull(),
  editDateTime: timestamp('edit_date_time').defaultNow(),
  userPreference: varchar('user_preference', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 加工済み写真テーブル
export const processedPhotoTbl = pgTable('processed_photo_tbl', {
  processedPhotoId: varchar('processed_photo_id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).references(() => userTbl.userId),
  editedPhotoId: varchar('edited_photo_id', { length: 36 }).references(() => editedPhotoTbl.editedPhotoId),
  frameCoordinate: text('frame_coordinate'),
  wipeCoordinate: text('wipe_coordinate'),
  editSettingsJson: text('edit_settings_json'),
  processDateTime: timestamp('process_date_time').defaultNow(),
  processedPhotoUrl: varchar('processed_photo_url', { length: 255 }),
  isSold: boolean('is_sold').default(false),
  isDownloaded: boolean('is_downloaded').default(false),
  isPrinted: boolean('is_printed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// カートテーブル
export const cartTbl = pgTable('cart_tbl', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => userTbl.userId),
  processedPhotoId: varchar('processed_photo_id', { length: 36 }).references(() => processedPhotoTbl.processedPhotoId),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 購入テーブル
export const purchaseTbl = pgTable('purchase_tbl', {
  purchaseId: varchar('purchase_id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => userTbl.userId),
  processedPhotoId: varchar('processed_photo_id', { length: 36 }).references(() => processedPhotoTbl.processedPhotoId),
  amount: varchar('amount', { length: 20 }),
  currency: varchar('currency', { length: 10 }).default('JPY'),
  paymentStatus: varchar('payment_status', { length: 50 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentId: varchar('payment_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 印刷管理テーブル
export const printManagementTbl = pgTable('print_management_tbl', {
  id: serial('id').primaryKey(),
  purchaseId: varchar('purchase_id', { length: 36 }).references(() => purchaseTbl.purchaseId),
  userId: varchar('user_id', { length: 36 }).references(() => userTbl.userId),
  processedPhotoId: varchar('processed_photo_id', { length: 36 }).references(() => processedPhotoTbl.processedPhotoId),
  processedPhotoUrl: varchar('processed_photo_url', { length: 255 }),
  status: printStatusEnum('status').default('準備中'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// リレーションの定義
export const organizationRelations = relations(organizationMst, ({ many }) => ({
  organizationHosts: many(organizationHostTbl),
}));

export const hostRelations = relations(hostTbl, ({ many, one }) => ({
  organizationHosts: many(organizationHostTbl),
  hostDetails: one(hostDetailTbl),
  hostEvents: many(hostEventTbl),
  hostEventSlots: many(hostEventSlotTbl),
}));

export const eventRelations = relations(eventTbl, ({ many }) => ({
  hostEvents: many(hostEventTbl),
  eventSlots: many(eventSlotTbl),
}));

export const eventSlotRelations = relations(eventSlotTbl, ({ many, one }) => ({
  event: one(eventTbl, {
    fields: [eventSlotTbl.eventId],
    references: [eventTbl.eventId],
  }),
  hostEventSlots: many(hostEventSlotTbl),
  userParticipations: many(userParticipationTbl),
  photoShoots: many(photoShootTbl),
}));

export const facilityRelations = relations(facilityMst, ({ many }) => ({
  seatBlocks: many(seatBlockTbl),
}));

export const userRelations = relations(userTbl, ({ many }) => ({
  userParticipations: many(userParticipationTbl),
  processedPhotos: many(processedPhotoTbl),
  carts: many(cartTbl),
  purchases: many(purchaseTbl),
}));

export const photographerRelations = relations(photographerTbl, ({ many }) => ({
  photographerAssigns: many(photographerAssignTbl),
  photoShoots: many(photoShootTbl),
}));

export const photoShootRelations = relations(photoShootTbl, ({ many, one }) => ({
  photographer: one(photographerTbl, {
    fields: [photoShootTbl.photographerId],
    references: [photographerTbl.photographerId],
  }),
  eventSlot: one(eventSlotTbl, {
    fields: [photoShootTbl.eventSlotId],
    references: [eventSlotTbl.eventSlotId],
  }),
  originalPhotos: many(originalPhotoTbl),
}));

export const originalPhotoRelations = relations(originalPhotoTbl, ({ one, many }) => ({
  photoShoot: one(photoShootTbl, {
    fields: [originalPhotoTbl.shootId],
    references: [photoShootTbl.shootId],
  }),
  editedPhotos: many(editedPhotoTbl),
}));

export const editedPhotoRelations = relations(editedPhotoTbl, ({ one, many }) => ({
  originalPhoto: one(originalPhotoTbl, {
    fields: [editedPhotoTbl.originalPhotoId],
    references: [originalPhotoTbl.originalPhotoId],
  }),
  processedPhotos: many(processedPhotoTbl),
}));

export const processedPhotoRelations = relations(processedPhotoTbl, ({ one, many }) => ({
  user: one(userTbl, {
    fields: [processedPhotoTbl.userId],
    references: [userTbl.userId],
  }),
  editedPhoto: one(editedPhotoTbl, {
    fields: [processedPhotoTbl.editedPhotoId],
    references: [editedPhotoTbl.editedPhotoId],
  }),
  carts: many(cartTbl),
  purchases: many(purchaseTbl),
  printManagements: many(printManagementTbl),
}));

export const cartRelations = relations(cartTbl, ({ one }) => ({
  user: one(userTbl, {
    fields: [cartTbl.userId],
    references: [userTbl.userId],
  }),
  processedPhoto: one(processedPhotoTbl, {
    fields: [cartTbl.processedPhotoId],
    references: [processedPhotoTbl.processedPhotoId],
  }),
}));

export const purchaseRelations = relations(purchaseTbl, ({ one, many }) => ({
  user: one(userTbl, {
    fields: [purchaseTbl.userId],
    references: [userTbl.userId],
  }),
  processedPhoto: one(processedPhotoTbl, {
    fields: [purchaseTbl.processedPhotoId],
    references: [processedPhotoTbl.processedPhotoId],
  }),
  printManagements: many(printManagementTbl),
}));

export const printManagementRelations = relations(printManagementTbl, ({ one }) => ({
  purchase: one(purchaseTbl, {
    fields: [printManagementTbl.purchaseId],
    references: [purchaseTbl.purchaseId],
  }),
  user: one(userTbl, {
    fields: [printManagementTbl.userId],
    references: [userTbl.userId],
  }),
  processedPhoto: one(processedPhotoTbl, {
    fields: [printManagementTbl.processedPhotoId],
    references: [processedPhotoTbl.processedPhotoId],
  }),
})); 