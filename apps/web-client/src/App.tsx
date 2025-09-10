import DesktopApp from "./entries/DesktopApp";
import WebApp from "./entries/WebApp";

enum UIMode {
  Desktop = "desktop",
  Web = "web",
}

const parseMode = (input: string | null | undefined): UIMode | null => {
  if (!input) return null;
  const v = input.toLowerCase();
  if (v === UIMode.Desktop) return UIMode.Desktop;
  if (v === UIMode.Web) return UIMode.Web;
  return null;
};

export default function App() {
  const envMode = parseMode(import.meta.env.VITE_UI_TARGET);
  return envMode === UIMode.Desktop ? <DesktopApp /> : <WebApp />;
}
