import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "./useAuth0Safe";

export default function CallbackPage() {
  const { isAuthenticated, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      console.error("Auth0 Error:", error.message);
      return;
    }

    if (isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, error, navigate]);

  if (error) {
    return (
      <div className="p-6 text-white bg-red-900/60">
        <p className="font-semibold">Login failed.</p>
        <p className="text-sm text-red-200">{error.message}</p>
      </div>
    );
  }

  return <div className="p-6 text-white">Processing login...</div>;
}