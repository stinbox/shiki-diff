import { createHashRouter, RouterProvider } from "react-router-dom";
import packagejson from "../package.json?raw";
import { SyntaxHighlighter } from "./components/syntax-highlighter";

const router = createHashRouter([
  {
    path: "/",
    element: <SyntaxHighlighter code={packagejson} language="json" />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
