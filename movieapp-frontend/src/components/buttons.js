import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

export const LoginButton = styled(Button)({
  color: "white",
  borderColor: "blue",
  textTransform: "none",
  borderRadius: "5px",
  fontFamily: "'Roboto', 'Arial', sans-serif",
  padding: "4px 10px",
  boxShadow: "0px 0px 4px gray",
  width: "5rem",


  "&:hover": {
    borderColor: "darkblue",
  },
});

export const SignupButton = styled(Button)({
  backgroundColor: "#f1f1f3",
  color: "#161f2e",
  borderRadius: "5px",
  fontFamily: "'Roboto', 'Arial', sans-serif",
  padding: "4px 10px",
  boxShadow: "0px 0px 4px gray",
  width: "5rem",

  textTransform: "none",

  "&:hover": {
    backgroundColor: "white",
    color: "blsck",
  },
});