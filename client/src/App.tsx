import { useUserState } from "./state/users.ts";
import LoginPrompt from "./components/LoginPrompt.tsx";
import Browser from "./components/Browser.tsx";
import { useEffect, useRef } from "react";
import { createConnection } from "./common/socket.ts";

function App() {
  const isLoggedIn = useUserState((state) => !!state.me);

  const connecting = useRef(false);
  useEffect(() => {
    if (connecting.current) return;
    connecting.current = true;

    createConnection();
  }, []);

  return (
    <div className="aspect-video text-gray-100 bg-discord-dark-2">
      {isLoggedIn ? <Browser /> : <LoginPrompt />}
    </div>
  );
}

export default App;
