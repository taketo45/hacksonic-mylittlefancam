CREATE TYPE "public"."account_status" AS ENUM('有効', '無効', '停止中', '審査中');--> statement-breakpoint
CREATE TYPE "public"."event_slot_status" AS ENUM('準備中', '公開中', '終了', 'キャンセル');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('準備中', '公開中', '終了', 'キャンセル');--> statement-breakpoint
CREATE TYPE "public"."organization_type" AS ENUM('保育園', '幼稚園', '小学校', '中学校', '高校', 'その他');--> statement-breakpoint
CREATE TYPE "public"."print_status" AS ENUM('準備中', '印刷中', '印刷完了', '発送準備中', '発送完了', 'キャンセル', 'エラー');--> statement-breakpoint
CREATE TABLE "cart_tbl" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"processed_photo_id" varchar(36),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "edited_photo_tbl" (
	"edited_photo_id" varchar(36) PRIMARY KEY NOT NULL,
	"original_photo_id" varchar(36),
	"storage_url" varchar(255) NOT NULL,
	"edit_date_time" timestamp DEFAULT now(),
	"user_preference" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_slot_tbl" (
	"event_slot_id" varchar(36) PRIMARY KEY NOT NULL,
	"event_id" varchar(36) NOT NULL,
	"event_slot_name" text NOT NULL,
	"event_date" text,
	"event_time" text,
	"facility_name" text,
	"facility_address" text,
	"facility_phone" text,
	"event_slot_detail" text,
	"photographer_id" varchar(36),
	"base_price" numeric(10, 2),
	"event_slot_status" "event_slot_status" DEFAULT '準備中' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_tbl" (
	"event_id" varchar(36) PRIMARY KEY NOT NULL,
	"event_name" varchar(100) NOT NULL,
	"event_status" "event_status" DEFAULT '準備中',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "facility_mst" (
	"facility_id" varchar(36) PRIMARY KEY NOT NULL,
	"facility_name" varchar(100) NOT NULL,
	"facility_address" text,
	"facility_phone" varchar(20),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "host_detail_tbl" (
	"id" serial PRIMARY KEY NOT NULL,
	"host_id" varchar(36) NOT NULL,
	"address" text,
	"phone_number" varchar(20),
	"organization_id" varchar(36),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "host_event_slot_tbl" (
	"id" serial PRIMARY KEY NOT NULL,
	"host_id" varchar(36) NOT NULL,
	"event_slot_id" varchar(36) NOT NULL,
	"slot_role" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "host_event_tbl" (
	"id" serial PRIMARY KEY NOT NULL,
	"host_id" varchar(36) NOT NULL,
	"event_id" varchar(36) NOT NULL,
	"event_role" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "host_tbl" (
	"host_id" varchar(36) PRIMARY KEY NOT NULL,
	"auth_user_id" varchar(36),
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"account_status" "account_status" DEFAULT '審査中',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "host_tbl_auth_user_id_unique" UNIQUE("auth_user_id"),
	CONSTRAINT "host_tbl_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "organization_host_tbl" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" varchar(36) NOT NULL,
	"host_id" varchar(36) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organization_mst" (
	"organization_id" varchar(36) PRIMARY KEY NOT NULL,
	"organization_name" varchar(100) NOT NULL,
	"organization_address" text,
	"organization_contact" varchar(100),
	"organization_type" "organization_type",
	"department" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "original_photo_tbl" (
	"original_photo_id" varchar(36) PRIMARY KEY NOT NULL,
	"shoot_id" varchar(36),
	"storage_url" varchar(255) NOT NULL,
	"user_preference" varchar(50),
	"geo_code" varchar(100),
	"shoot_date_time" timestamp,
	"is_ng" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "photo_shoot_tbl" (
	"shoot_id" varchar(36) PRIMARY KEY NOT NULL,
	"event_slot_id" varchar(36),
	"photographer_id" varchar(36),
	"storage_url" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "photographer_assign_tbl" (
	"id" serial PRIMARY KEY NOT NULL,
	"photographer_id" varchar(36) NOT NULL,
	"target_event_id" varchar(36),
	"target_event_slot_id" varchar(36),
	"target_area_id" varchar(36),
	"target_block_id" varchar(36),
	"target_sub_block_id" varchar(36),
	"target_start_line_id" varchar(36),
	"target_end_line_id" varchar(36),
	"target_start_row_id" varchar(36),
	"target_end_row_id" varchar(36),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "photographer_tbl" (
	"photographer_id" varchar(36) PRIMARY KEY NOT NULL,
	"auth_user_id" varchar(36),
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"account_status" "account_status" DEFAULT '審査中',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "photographer_tbl_auth_user_id_unique" UNIQUE("auth_user_id"),
	CONSTRAINT "photographer_tbl_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "print_management_tbl" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_id" varchar(36),
	"user_id" varchar(36),
	"processed_photo_id" varchar(36),
	"processed_photo_url" varchar(255),
	"status" "print_status" DEFAULT '準備中',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "processed_photo_tbl" (
	"processed_photo_id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36),
	"edited_photo_id" varchar(36),
	"frame_coordinate" text,
	"wipe_coordinate" text,
	"edit_settings_json" text,
	"process_date_time" timestamp DEFAULT now(),
	"processed_photo_url" varchar(255),
	"is_sold" boolean DEFAULT false,
	"is_downloaded" boolean DEFAULT false,
	"is_printed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_tbl" (
	"purchase_id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"processed_photo_id" varchar(36),
	"amount" varchar(20),
	"currency" varchar(10) DEFAULT 'JPY',
	"payment_status" varchar(50),
	"payment_method" varchar(50),
	"payment_id" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "role_mst" (
	"role_id" varchar(36) PRIMARY KEY NOT NULL,
	"role_name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seat_block_tbl" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" varchar(36) NOT NULL,
	"seat_block_id" varchar(36) NOT NULL,
	"seat_type" varchar(50),
	"area_id" varchar(36),
	"block_id" varchar(36),
	"sub_block_id" varchar(36),
	"start_line_id" varchar(36),
	"end_line_id" varchar(36),
	"start_row_id" varchar(36),
	"end_row_id" varchar(36),
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_participation_tbl" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"event_slot_id" varchar(36) NOT NULL,
	"facility_id" varchar(36),
	"seat_block_id" varchar(36),
	"seat_line_id" varchar(36),
	"seat_row_id" varchar(36),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_role_tbl" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"role_id" varchar(36) NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"assigned_by" varchar(36),
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_tbl" (
	"user_id" varchar(36) PRIMARY KEY NOT NULL,
	"auth_user_id" varchar(36),
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"account_status" "account_status" DEFAULT '審査中',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_tbl_auth_user_id_unique" UNIQUE("auth_user_id"),
	CONSTRAINT "user_tbl_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "cart_tbl" ADD CONSTRAINT "cart_tbl_user_id_user_tbl_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_tbl"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_tbl" ADD CONSTRAINT "cart_tbl_processed_photo_id_processed_photo_tbl_processed_photo_id_fk" FOREIGN KEY ("processed_photo_id") REFERENCES "public"."processed_photo_tbl"("processed_photo_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edited_photo_tbl" ADD CONSTRAINT "edited_photo_tbl_original_photo_id_original_photo_tbl_original_photo_id_fk" FOREIGN KEY ("original_photo_id") REFERENCES "public"."original_photo_tbl"("original_photo_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_slot_tbl" ADD CONSTRAINT "event_slot_tbl_event_id_event_tbl_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event_tbl"("event_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_slot_tbl" ADD CONSTRAINT "event_slot_tbl_photographer_id_host_tbl_host_id_fk" FOREIGN KEY ("photographer_id") REFERENCES "public"."host_tbl"("host_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "host_detail_tbl" ADD CONSTRAINT "host_detail_tbl_host_id_host_tbl_host_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."host_tbl"("host_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "host_detail_tbl" ADD CONSTRAINT "host_detail_tbl_organization_id_organization_mst_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization_mst"("organization_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "host_event_slot_tbl" ADD CONSTRAINT "host_event_slot_tbl_host_id_host_tbl_host_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."host_tbl"("host_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "host_event_slot_tbl" ADD CONSTRAINT "host_event_slot_tbl_event_slot_id_event_slot_tbl_event_slot_id_fk" FOREIGN KEY ("event_slot_id") REFERENCES "public"."event_slot_tbl"("event_slot_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "host_event_tbl" ADD CONSTRAINT "host_event_tbl_host_id_host_tbl_host_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."host_tbl"("host_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "host_event_tbl" ADD CONSTRAINT "host_event_tbl_event_id_event_tbl_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event_tbl"("event_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_host_tbl" ADD CONSTRAINT "organization_host_tbl_organization_id_organization_mst_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization_mst"("organization_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_host_tbl" ADD CONSTRAINT "organization_host_tbl_host_id_host_tbl_host_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."host_tbl"("host_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "original_photo_tbl" ADD CONSTRAINT "original_photo_tbl_shoot_id_photo_shoot_tbl_shoot_id_fk" FOREIGN KEY ("shoot_id") REFERENCES "public"."photo_shoot_tbl"("shoot_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_shoot_tbl" ADD CONSTRAINT "photo_shoot_tbl_event_slot_id_event_slot_tbl_event_slot_id_fk" FOREIGN KEY ("event_slot_id") REFERENCES "public"."event_slot_tbl"("event_slot_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_shoot_tbl" ADD CONSTRAINT "photo_shoot_tbl_photographer_id_photographer_tbl_photographer_id_fk" FOREIGN KEY ("photographer_id") REFERENCES "public"."photographer_tbl"("photographer_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photographer_assign_tbl" ADD CONSTRAINT "photographer_assign_tbl_photographer_id_photographer_tbl_photographer_id_fk" FOREIGN KEY ("photographer_id") REFERENCES "public"."photographer_tbl"("photographer_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photographer_assign_tbl" ADD CONSTRAINT "photographer_assign_tbl_target_event_id_event_tbl_event_id_fk" FOREIGN KEY ("target_event_id") REFERENCES "public"."event_tbl"("event_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photographer_assign_tbl" ADD CONSTRAINT "photographer_assign_tbl_target_event_slot_id_event_slot_tbl_event_slot_id_fk" FOREIGN KEY ("target_event_slot_id") REFERENCES "public"."event_slot_tbl"("event_slot_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_management_tbl" ADD CONSTRAINT "print_management_tbl_purchase_id_purchase_tbl_purchase_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchase_tbl"("purchase_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_management_tbl" ADD CONSTRAINT "print_management_tbl_user_id_user_tbl_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_tbl"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_management_tbl" ADD CONSTRAINT "print_management_tbl_processed_photo_id_processed_photo_tbl_processed_photo_id_fk" FOREIGN KEY ("processed_photo_id") REFERENCES "public"."processed_photo_tbl"("processed_photo_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processed_photo_tbl" ADD CONSTRAINT "processed_photo_tbl_user_id_user_tbl_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_tbl"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processed_photo_tbl" ADD CONSTRAINT "processed_photo_tbl_edited_photo_id_edited_photo_tbl_edited_photo_id_fk" FOREIGN KEY ("edited_photo_id") REFERENCES "public"."edited_photo_tbl"("edited_photo_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_tbl" ADD CONSTRAINT "purchase_tbl_user_id_user_tbl_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_tbl"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_tbl" ADD CONSTRAINT "purchase_tbl_processed_photo_id_processed_photo_tbl_processed_photo_id_fk" FOREIGN KEY ("processed_photo_id") REFERENCES "public"."processed_photo_tbl"("processed_photo_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat_block_tbl" ADD CONSTRAINT "seat_block_tbl_facility_id_facility_mst_facility_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facility_mst"("facility_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_participation_tbl" ADD CONSTRAINT "user_participation_tbl_user_id_user_tbl_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_tbl"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_participation_tbl" ADD CONSTRAINT "user_participation_tbl_event_slot_id_event_slot_tbl_event_slot_id_fk" FOREIGN KEY ("event_slot_id") REFERENCES "public"."event_slot_tbl"("event_slot_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_participation_tbl" ADD CONSTRAINT "user_participation_tbl_facility_id_facility_mst_facility_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facility_mst"("facility_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_tbl" ADD CONSTRAINT "user_role_tbl_role_id_role_mst_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role_mst"("role_id") ON DELETE no action ON UPDATE no action;