import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { useFlags } from "launchdarkly-react-client-sdk";
import { DevDashboardTools } from "./DevDashboardTools";
import { useState } from "react";
import { DropdownOptions } from "types";
import { DevAdminDashboardTools } from "./DevAdminDashboardTools";
import { UploadType } from "@datasets/shared";

interface Props {
  type: ToolType;
  reload?: Function;
  state?: string;
  datasets?: DropdownOptions[];
  files: UploadType[];
}

export enum ToolType {
  DASHBOARD = "dashboard",
  ADMIN_DASHBOARD = "adminDashboard",
}

export const DevTools = ({ type, reload, state, datasets, files }: Props) => {
  const devTools = useFlags()?.devTools;
  if (!devTools || !datasets) return;

  const [showOptions, setShowOptions] = useState<boolean>();

  return (
    <Box sx={sx.container} top="96px">
      <Button sx={sx.primaryBtn} onClick={() => setShowOptions(!showOptions)}>
        <Text transform="rotate(-90deg)" color="white">
          Dev Tools
        </Text>
      </Button>
      {showOptions && (
        <Stack sx={sx.menuBox} gap="1rem">
          {type === ToolType.DASHBOARD && (
            <DevDashboardTools
              state={state}
              reload={reload}
              datasets={datasets}
            />
          )}
          {type === ToolType.ADMIN_DASHBOARD && (
            <DevAdminDashboardTools
              reload={reload}
              datasets={datasets}
              files={files}
            />
          )}
        </Stack>
      )}
    </Box>
  );
};

const sx = {
  container: {
    position: "fixed",
    display: "flex",
    right: "0",
    zIndex: "1001",
    alignItems: "flex-start",
    maxHeight: "600px",
  },
  menuBox: {
    background: "white",
    border: "1px solid grey",
    height: "100%",
    width: "300px",
    padding: "12px",
    borderRadius: "0px 0px 0px 12px",
    boxShadow: "0px 3px 9px rgba(0, 0, 0, 0.1)",
    minHeight: "110px",
    maxHeight: "100%",
    overflowY: "auto",
    overflowX: "hidden",
  },
  primaryBtn: {
    width: "40px",
    height: "100px",
    borderRadius: "12px 0px 0px 12px",
  },
};
