import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  jest.spyOn(Storage.prototype, "getItem").mockImplementation((key: string) => {
    if (key === "sanctuary:onboardingComplete") return "1"; // <-- keep this string
    return null;
  });

  jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ([]),
  } as any);
});

afterEach(() => {
  (Storage.prototype.getItem as any).mockRestore?.();
  (global.fetch as any).mockRestore?.();
});

test("renders the Today section", async () => {
  render(<App />);
  expect(await screen.findByRole("heading", { name: /today/i })).toBeInTheDocument();
});
