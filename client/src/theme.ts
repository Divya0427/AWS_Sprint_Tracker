import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // standard Material Blue
    },
    secondary: {
      main: "#9c27b0",
    },
    background: {
      default: "#f7f9fc",
      paper: "#ffffff",
    },
  },

  typography: {
    fontFamily: "Roboto, sans-serif",
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      textTransform: "none", // Remove capital letters on buttons
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 8, // Softer corners on cards & inputs
  },

  components: {
    // Global Button styling
    MuiButton: {
      styleOverrides: {
        root: {
          paddingLeft: "20px",
          paddingRight: "20px",
        },
      },
    },

    // Card shadow + padding consistency
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        },
      },
    },
  },
});

export default theme;
