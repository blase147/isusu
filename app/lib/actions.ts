'use server';

import { signIn } from '@/auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    // Handle specific errors based on their message or other properties
    if (error instanceof Error) {
      if (error.message.includes('CredentialsSignin')) {
        return 'Invalid credentials.';
      }
    }
    return 'Something went wrong.';
  }
}
