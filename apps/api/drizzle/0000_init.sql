CREATE TYPE "public"."application_stage" AS ENUM('new', 'screening', 'documents', 'skills_test', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('requested', 'confirmed', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('maid', 'cook');--> statement-breakpoint
CREATE TYPE "public"."city_status" AS ENUM('live', 'waitlist', 'paused');--> statement-breakpoint
CREATE TYPE "public"."need" AS ENUM('maid', 'cook', 'both');--> statement-breakpoint
CREATE TYPE "public"."provider_status" AS ENUM('pending', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('customer', 'provider', 'admin');--> statement-breakpoint
CREATE TYPE "public"."visit_update_kind" AS ENUM('task', 'meal', 'note', 'check_in', 'check_out');--> statement-breakpoint
CREATE TYPE "public"."visit_status" AS ENUM('scheduled', 'in_progress', 'done', 'missed', 'cancelled');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"city_slug" text NOT NULL,
	"locality" text DEFAULT '' NOT NULL,
	"experience" text NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stage" "application_stage" DEFAULT 'new' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"provider_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"customer_id" uuid,
	"status" "booking_status" DEFAULT 'requested' NOT NULL,
	"need" "need" NOT NULL,
	"service_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"plan_slug" text,
	"frequency" text DEFAULT 'once' NOT NULL,
	"start_date" date NOT NULL,
	"slot" text NOT NULL,
	"recipient_name" text NOT NULL,
	"for_whom" text NOT NULL,
	"phone" text NOT NULL,
	"city_slug" text NOT NULL,
	"locality" text NOT NULL,
	"address" text NOT NULL,
	"food" text,
	"diets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"total" integer NOT NULL,
	"provider_id" uuid,
	"requested_provider_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"state" text NOT NULL,
	"status" "city_status" DEFAULT 'waitlist' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text NOT NULL,
	"city" text NOT NULL,
	"locality" text DEFAULT '' NOT NULL,
	"source" text DEFAULT 'website' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "localities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city_slug" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"title" text NOT NULL,
	"category" "category" NOT NULL,
	"service_slug" text NOT NULL,
	"city_slug" text NOT NULL,
	"locality" text DEFAULT '' NOT NULL,
	"years" integer DEFAULT 0 NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"reviews" integer DEFAULT 0 NOT NULL,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"photo" text DEFAULT '' NOT NULL,
	"rate" integer NOT NULL,
	"unit" text NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"status" "provider_status" DEFAULT 'pending' NOT NULL,
	"aadhaar_verified" boolean DEFAULT false NOT NULL,
	"police_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"short" text NOT NULL,
	"description" text NOT NULL,
	"category" "category" NOT NULL,
	"icon" text NOT NULL,
	"price" integer NOT NULL,
	"unit" text NOT NULL,
	"image" text NOT NULL,
	"includes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "role" NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"phone" text,
	"email" text,
	"password_hash" text,
	"firebase_uid" text,
	"city_slug" text,
	"locality" text,
	"address" text,
	"food" text,
	"diets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visit_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid NOT NULL,
	"kind" "visit_update_kind" NOT NULL,
	"title" text NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"provider_id" uuid,
	"date" date NOT NULL,
	"slot" text NOT NULL,
	"status" "visit_status" DEFAULT 'scheduled' NOT NULL,
	"check_in_at" timestamp with time zone,
	"check_out_at" timestamp with time zone,
	"amount" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_city_slug_cities_slug_fk" FOREIGN KEY ("city_slug") REFERENCES "public"."cities"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_city_slug_cities_slug_fk" FOREIGN KEY ("city_slug") REFERENCES "public"."cities"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_requested_provider_id_providers_id_fk" FOREIGN KEY ("requested_provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "localities" ADD CONSTRAINT "localities_city_slug_cities_slug_fk" FOREIGN KEY ("city_slug") REFERENCES "public"."cities"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_service_slug_services_slug_fk" FOREIGN KEY ("service_slug") REFERENCES "public"."services"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_city_slug_cities_slug_fk" FOREIGN KEY ("city_slug") REFERENCES "public"."cities"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_city_slug_cities_slug_fk" FOREIGN KEY ("city_slug") REFERENCES "public"."cities"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit_updates" ADD CONSTRAINT "visit_updates_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_customer" ON "bookings" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "bookings_city" ON "bookings" USING btree ("city_slug");--> statement-breakpoint
CREATE INDEX "bookings_created" ON "bookings" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "localities_city_name" ON "localities" USING btree ("city_slug","name");--> statement-breakpoint
CREATE INDEX "providers_city" ON "providers" USING btree ("city_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "providers_phone" ON "providers" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "users_role_phone" ON "users" USING btree ("role","phone");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "visit_updates_visit" ON "visit_updates" USING btree ("visit_id");--> statement-breakpoint
CREATE INDEX "visits_provider_date" ON "visits" USING btree ("provider_id","date");--> statement-breakpoint
CREATE INDEX "visits_booking" ON "visits" USING btree ("booking_id");