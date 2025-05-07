
import { useAuth } from '@/contexts/AuthContext';

export default function GoogleSignInButton() {
  const { handleGoogleLogin } = useAuth();

  return (
    <button
      onClick={handleGoogleLogin}
      className="bg-white text-black border border-gray-300 rounded-lg px-6 py-2 shadow-sm flex items-center justify-center gap-2 hover:shadow-md transition w-full"
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
