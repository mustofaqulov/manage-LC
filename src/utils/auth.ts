import type { Role } from '../api/types';

/**
 * Foydalanuvchining imtihon topshirish huquqini tekshiradi
 *
 * Backend logikasi (2026-02-12 aniqlanishi):
 * - Agar role NULL yoki EMPTY bo'lsa → premium yo'q (access yo'q)
 * - Agar role bor bo'lsa (USER, ADMIN, va hokazo) → premium bor (access bor)
 *
 * Har qanday role'ga ega bo'lgan foydalanuvchi premium hisoblanadi.
 *
 * @param roles - Foydalanuvchi role'lari massivi
 * @returns true - imtihon topshirish mumkin (premium), false - premium obuna kerak
 */
export const hasExamAccess = (roles: Role[] | null | undefined): boolean => {
  // Agar roles null yoki empty bo'lsa → premium yo'q
  if (!roles || roles.length === 0) {
    return false;
  }

  // Agar role bor bo'lsa (qaysi role ekanidan qat'iy nazar) → premium bor
  return true;
};
