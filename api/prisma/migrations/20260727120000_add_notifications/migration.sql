CREATE TYPE "NotificationType" AS ENUM (
  'BOARD_INVITATION_RECEIVED',
  'TASK_ASSIGNED',
  'TASK_MOVED',
  'TASK_COMMENT_CREATED'
);

CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "data" JSONB,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_user_id_created_at_idx"
ON "notifications"("user_id", "created_at");

CREATE INDEX "notifications_user_id_read_at_idx"
ON "notifications"("user_id", "read_at");

CREATE INDEX "notifications_user_id_type_idx"
ON "notifications"("user_id", "type");

ALTER TABLE "notifications"
ADD CONSTRAINT "notifications_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
