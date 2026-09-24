import { DatasetStatusType } from "@datasets/shared";
import { createDataset, getDatasets, updateDataset } from "./datasets";

const mockPost = vi.fn();
const mockGet = vi.fn();
const mockPut = vi.fn();
vi.mock("../apiLib", () => ({
  apiLib: {
    post: (path: string, opts: Record<string, any>) => mockPost(path, opts),
    get: (path: string, opts: Record<string, any>) => mockGet(path, opts),
    put: (path: string, opts: Record<string, any>) => mockPut(path, opts),
  },
}));

describe("datasets api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("createDataset", async () => {
    await createDataset({ name: "name", status: true });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  test("getDatasets", async () => {
    await getDatasets();
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  test("updateDataset", async () => {
    await updateDataset({ name: "name", status: DatasetStatusType.ACTIVE });
    expect(mockPut).toHaveBeenCalledTimes(1);
  });
});
