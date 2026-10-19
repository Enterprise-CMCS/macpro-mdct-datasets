import { useNavigate } from "react-router";
import { Button, Heading, Link, Text } from "@chakra-ui/react";
import { PageTemplate, Table } from "components";
import { useStore } from "utils";
import { HELP_DESK_EMAIL_ADDRESS } from "../../../constants";
import { UserRoles } from "@datasets/shared";

export const ProfilePage = () => {
  const navigate = useNavigate();

  const { email, given_name, family_name, userRole, state } =
    useStore().user ?? {};

  const tableContent = {
    caption: "Profile Account Information",
    bodyRows: [
      ["Email", email!],
      ["First Name", given_name!],
      ["Last Name", family_name!],
      ["Role", userRole!],
      ["State", state || "N/A"],
    ],
  };

  return (
    <PageTemplate>
      <Heading as="h1" variant="h1">
        My Account
      </Heading>
      <Text>
        If any information is incorrect, please contact the MDCT Help Desk at{" "}
        <Link href={`mailto:${HELP_DESK_EMAIL_ADDRESS}`} isExternal>
          {HELP_DESK_EMAIL_ADDRESS}
        </Link>
        .
      </Text>
      <Table content={tableContent} variant="striped" />
      {userRole === UserRoles.BOR && (
        <Button onClick={() => navigate("/admin")}>Banner Editor</Button>
      )}
    </PageTemplate>
  );
};
