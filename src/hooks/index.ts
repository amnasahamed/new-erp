/**
 * Custom React Hooks for API Integration
 *
 * These hooks provide a simple interface to interact with the backend API.
 * They handle loading states, errors, and data management automatically.
 *
 * Usage:
 * ```typescript
 * import { useStudents } from '@/hooks';
 *
 * function MyComponent() {
 *   const { students, loading, error, pauseStudent } = useStudents({ status: 'ongoing' });
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <div>
 *       {students.map(student => (
 *         <div key={student.id}>
 *           {student.name}
 *           <button onClick={() => pauseStudent(student.id)}>Pause</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

export { useStudents } from './useStudents';
export { useTeachers, useTeacherAvailability } from './useTeachers';
export { useClasses, useTodayClasses } from './useClasses';
export { useDemos } from './useDemos';
export { useDisputes } from './useDisputes';
export { useLedger } from './useLedger';
