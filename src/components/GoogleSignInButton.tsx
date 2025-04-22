import { supabase } from '../../supabase/supabaseClient'

export default function GoogleSignInButton() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) console.error('Login failed:', error.message)
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className="bg-white text-black border border-gray-300 rounded-lg px-6 py-2 shadow-sm flex items-center gap-2 hover:shadow-md transition"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="w-5 h-5"
      />
      Sign in with Google
    </button>
  )
}
