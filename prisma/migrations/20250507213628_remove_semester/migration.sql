/*
  Warnings:

  - You are about to drop the column `semester` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `Match` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Course" ("code", "createdAt", "id", "name", "updatedAt") SELECT "code", "createdAt", "id", "name", "updatedAt" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");
CREATE TABLE "new_Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "course" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Match" ("course", "createdAt", "id", "status", "updatedAt") SELECT "course", "createdAt", "id", "status", "updatedAt" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
