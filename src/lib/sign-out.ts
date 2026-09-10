'use client'

import { authClient } from '@/lib/auth-client'

export async function signOutAndRedirect() {
  // First try the auth client sign out
  try {
    await authClient.signOut()
  } catch {
    // Ignore errors
  }

  // Then call our custom endpoint to make sure cookies are cleared
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // Ignore errors
  }

  // Use hard redirect to clear all client state
  window.location.replace('/auth/login')
}
