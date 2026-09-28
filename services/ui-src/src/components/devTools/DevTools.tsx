import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { useFlags } from "launchdarkly-react-client-sdk";
import { DevDashboardTools } from "./DevDashboardTools";
import { useState } from "react";

interface Props {
  type: ToolType;
  reload?: Function;
  state?: string;
  datasetId?: string;
}

export enum ToolType {
  DASHBOARD = "dashboard",
}

export const DevTools = ({
  type,
  reload,
  state,
  datasetId
}: Props) => {
  const devTools = useFlags()?.devTools;
  if (!devTools ) return;

  const [showOptions, setShowOptions] = useState<boolean>();

  return (
    <Box sx={sx.container} top={type === ToolType.DASHBOARD ? "96px" : "156px"}>
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
              datasetId={datasetId}
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
    maxHeight: "500px",
    overflowY: "auto",
    overflowX: "hidden",
  },
  primaryBtn: {
    width: "40px",
    height: "100px",
    borderRadius: "12px 0px 0px 12px",
  },
};
