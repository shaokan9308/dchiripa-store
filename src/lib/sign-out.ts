'use client'

export async function signOutAndRedirect(router: any) {
  try {
    // Call our custom sign-out endpoint that properly clears cookies
    await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // Ignore errors
  }

  // Force full page reload to clear all client state and redirect
  window.location.href = '/auth/login'
}
