import { putDataSet, scanAllDataSets } from "./dataset";
import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { DataSetType } from "@datasets/shared";

const mockDynamo = mockClient(DynamoDBDocumentClient);

const mockDataset: DataSetType = {
  key: "123",
  name: "Dataset A",
  status: "Active",
};

describe("Dataset storage methods", () => {
  beforeEach(() => {
    mockDynamo.reset();
  });

  test("should call Dynamo to create a new dataset", async () => {
    const mockPut = vi.fn();
    mockDynamo.on(PutCommand).callsFakeOnce(mockPut);

    await putDataSet(mockDataset);

    expect(mockPut).toHaveBeenCalledWith(
      {
        TableName: "local-datasets-datasets",
        Item: mockDataset,
      },
      expect.any(Function)
    );
  });

  test("should call Dynamo to scan all datasets", async () => {
    const mockScan = vi
      .fn()
      .mockResolvedValueOnce({ Items: [mockDataset], LastEvaluatedKey: "foo" })
      .mockResolvedValueOnce({ Items: [mockDataset] });

    mockDynamo.on(ScanCommand).callsFakeOnce(mockScan).callsFakeOnce(mockScan);

    const datasets = await scanAllDataSets();

    expect(datasets).toEqual([mockDataset, mockDataset]);
    expect(mockScan).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: "local-datasets-datasets",
      }),
      expect.any(Function)
    );
  });
});
