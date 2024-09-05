import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./index.css";
// 1. import `ChakraProvider` component
import { ChakraProvider } from "@chakra-ui/react";

function Main() {
  // 2. Wrap ChakraProvider at the root of your app
  return (
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Main />);
