import { Heading } from "@chakra-ui/react";
import {
  ElementType,
  PageElement,
} from "@rhtp/shared";
import { notAnsweredText } from "../../constants";
import { parseHtml } from "utils";

const specificIds = ["initiatives-instructions", "initiative-instructions"];

//elements that are rendered as part of the table that does not need a unique renderer
const tableElementList = [
  ElementType.Textbox,
  ElementType.Radio,
  ElementType.TextAreaField,
  ElementType.NumberField,
  ElementType.ObligatedAndSpentFundsAttachment,
  ElementType.Dropdown,
  ElementType.ListInput,
  ElementType.AttachmentArea,
];

const renderElementList = [
  ...tableElementList,
  ElementType.SubHeader,
  ElementType.Paragraph,
  ElementType.ActionTable,
];

export const shouldUseTable = (type: ElementType) => {
  return tableElementList.includes(type);
};

export const renderElements = (element: PageElement) => {
  const { type } = element;
  if (!renderElementList.includes(type)) return;

  switch (type) {
    case ElementType.SubHeader:
      return (
        <Heading as="h3" variant="nestedHeading" my="2rem" key={element.id}>
          {element.text}
        </Heading>
      );
    case ElementType.Paragraph:
      if (specificIds.includes(element.id))
        return <div key={element.id}>{parseHtml(element.text)}</div>;
      return;
    case ElementType.AccordionGroup:
    case ElementType.AttachmentTable:
      return "";
  }

  if (!("answer" in element)) {
    return notAnsweredText;
  }

  return element.answer ?? notAnsweredText;
};
