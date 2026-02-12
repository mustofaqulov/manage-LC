import type { Role } from '../api/types';

/**
 * Foydalanuvchining imtihon topshirish huquqini tekshiradi
 *
 * Logika:
 * - Agar foydalanuvchi faqat USER role'iga ega bo'lsa → FALSE (premium obuna kerak)
 * - Agar boshqa role'lar (ADMIN, GRADER, CONTENT_EDITOR) bo'lsa → TRUE (ruxsat)
 * - Agar bir nechta role bo'lsa (USER + boshqa) → TRUE (ruxsat)
 *
 * @param roles - Foydalanuvchi role'lari massivi
 * @returns true - imtihon topshirish mumkin, false - premium obuna kerak
 */
export const hasExamAccess = (roles: Role[] | null | undefined): boolean => {
  // Agar roles bo'sh yoki null bo'lsa → ruxsat yo'q
  if (!roles || roles.length === 0) {
    return false;
  }

  // Agar faqat USER role'i bo'lsa → ruxsat yo'q (premium obuna kerak)
  if (roles.length === 1 && roles[0] === 'USER') {
    return false;
  }

  // Boshqa barcha holatlarda → ruxsat bor
  // (ADMIN, GRADER, CONTENT_EDITOR yoki bir nechta role)
  return true;
};
