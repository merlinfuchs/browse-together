import BrowserOverlay from "./BrowserOverlay";
import BrowserPage from "./BrowserPage";

export default function Browser() {
  return (
    <div className="h-full">
      <BrowserOverlay />
      <BrowserPage />
    </div>
  );
}
