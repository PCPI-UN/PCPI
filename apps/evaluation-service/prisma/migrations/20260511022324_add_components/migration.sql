-- CreateTable
CREATE TABLE "public"."Component" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Component_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "public"."criterions" ADD COLUMN "component_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."criterions" ADD CONSTRAINT "criterions_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "public"."Component"("id") ON DELETE SET NULL ON UPDATE CASCADE;
