-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "machine_category" TEXT NOT NULL,
    "guid_line" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "service_city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "delete" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
