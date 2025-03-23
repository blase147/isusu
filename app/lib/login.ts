// 'use client';

// import { signIn } from '@/auth';

// interface Credentials {
//     username: string;
//     password: string;
// }

// export async function login(credentials: Credentials) {
//     try {
//         const response = await signIn('credentials', {
//             redirect: false, // ✅ Prevent automatic redirects
//             callbackUrl: '/dashboard', // ✅ Redirect manually
//             ...credentials,
//         });

//         if (response?.error) {
//             console.error('Login failed:', response.error);
//             return 'Invalid credentials';
//         }

//         window.location.href = '/dashboard'; // ✅ Redirect user after login
//         return null; // No errors
//     } catch (error) {
//         console.error('Login error:', error);
//         return 'Something went wrong.';
//     }
// }
