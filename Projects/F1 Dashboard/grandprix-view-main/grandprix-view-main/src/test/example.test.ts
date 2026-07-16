import { describe, it, expect } from "vitest";
import App from "../App";
import Index from "../pages/Index";

describe("Imports and initialization", () => {
  it("should import successfully", () => {
    expect(App).toBeDefined();
    expect(Index).toBeDefined();
  });
});
