-- Existing development invitations contain raw tokens. Invalidate them before
-- repurposing the column so plaintext tokens are never treated as SHA-256 hashes.
UPDATE "board_members"
SET "invite_token" = NULL,
    "invite_expires_at" = NULL
WHERE "invite_token" IS NOT NULL;

DROP INDEX "board_members_invite_token_key";

ALTER TABLE "board_members"
RENAME COLUMN "invite_token" TO "invite_token_hash";

CREATE UNIQUE INDEX "board_members_invite_token_hash_key"
ON "board_members"("invite_token_hash");
