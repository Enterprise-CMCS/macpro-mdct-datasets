import { ComponentStyleConfig, theme } from "@chakra-ui/react";

const baseStyles = {
  table: {
    th: {
      padding: "0.5rem 0",
      borderBottom: "1px solid",
      borderColor: "gray_light",
      color: "gray",
      fontWeight: "heading_sm_bold",
      textTransform: "none",
      letterSpacing: "normal",
      fontSize: "heading_sm",
    },
    tr: {
      borderBottom: "1px solid",
      borderColor: "gray_light",
    },
    td: {
      paddingLeft: 0,
      borderColor: "gray_light",
      textAlign: "left",
      "&:last-of-type": {
        paddingRight: 0,
      },
    },
    ".ds-c-inline-error": {
      color: "error_dark !important",
    },
  },
};

const stripedVariant = () => ({
  ...theme.components.Table.variants!.striped,
  table: {
    maxWidth: "100%",
    "tr td:first-of-type": {
      width: "8rem",
      fontWeight: "semibold",
    },
    td: {
      padding: "0.5rem",
    },
    "td, tr": {
      border: "none",
    },
  },
});

const variants = {
  striped: stripedVariant,
};

const sizes = {};

const tableTheme: ComponentStyleConfig = {
  baseStyle: baseStyles,
  sizes: sizes,
  variants: variants,
};

export default tableTheme;
