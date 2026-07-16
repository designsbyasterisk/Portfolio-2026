import { Navigate } from "react-router-dom";
import { useAppState } from "@/lib/useAppState";

export default function Index() {
  const { state } = useAppState();
  return <Navigate to={state.onboardedAt ? "/home" : "/welcome"} replace />;
}
