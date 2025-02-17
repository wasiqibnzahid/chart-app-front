import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "white", // Changed background to white
        color: "black", // Adjusted text color for readability on white
        minHeight: "100vh", // Ensure the body covers the full viewport height
        margin: 0,
        padding: 0,
      },
    },
  },
  components: {
    Box: {
      baseStyle: {
        borderRadius: "md", // Medium border radius
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: "gray.300", // Light grey border
        boxShadow: "lg", // Large box shadow for a subtle effect
        bg: "white", // Changed Box background to white
      },
    },
  },
});

export default theme;
