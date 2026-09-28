import React from "react";
import { Box, Flex, SystemStyleObject, Link, Image } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
import arrowLeftIcon from "assets/icons/arrows/icon_arrow_left_blue.svg";

export const PageTemplate = ({
  type = "standard",
  children,
  sxOverride,
  returnTo,
}: Props) => {
  return (
    <section>
      <Box sx={{ ...sx.contentBox, ...sxOverride }} className={type}>
        {returnTo && (
          <Link
            as={RouterLink}
            to={returnTo.path}
            variant="return"
            sx={sx.returnBtn}
          >
            <Image src={arrowLeftIcon} alt="" className="icon" />
            {returnTo.label}
          </Link>
        )}
        <Flex
          sx={sx.contentFlex}
          className={`contentFlex ${type}`}
          gap="spacer4"
        >
          {children}
        </Flex>
      </Box>
    </section>
  );
};

interface Props {
  type?: "standard" | "report";
  children: React.ReactNode;
  sxOverride?: SystemStyleObject;
  returnTo?: { label: string; path: string };
}

const sx = {
  contentBox: {
    "&.standard": {
      flexShrink: "0",
    },
    "&.report": {
      height: "100%",
    },
  },
  contentFlex: {
    flexDirection: "column",
    "&.standard": {
      maxWidth: "basicPageWidth",
      marginY: "5.25rem",
      marginX: "auto",
    },
    ".mobile &": {
      marginY: "spacer5",
    },
    "&.report": {
      height: "100%",
    },
  },
  returnBtn: {
    position: "absolute",
    top: "1.25rem",
    // marginTop: "1.5rem",
  },
};
