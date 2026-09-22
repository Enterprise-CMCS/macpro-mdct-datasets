import { createDataSet, getDataSets, updateDataSet } from "./datasets";

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
  test("createDataSet", async () => {
    await createDataSet({ name: "name", status: true });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  test("getDataSets", async () => {
    await getDataSets();
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  test("updateDataSet", async () => {
    await updateDataSet({ name: "name", status: "true" });
    expect(mockPut).toHaveBeenCalledTimes(1);
  });
});
