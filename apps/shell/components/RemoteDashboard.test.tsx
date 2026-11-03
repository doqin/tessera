import { render, screen } from "@testing-library/react";
import { RemoteDashboard } from "./RemoteDashboard";

jest.mock("./dashboardRemote", () => ({
  loadDashboardRemote: () => Promise.resolve({ default: () => <p>dashboard remote mounted</p> }),
}));

describe("RemoteDashboard", () => {
  it("shows a loading state, then mounts the remote Dashboard module once it has loaded", async () => {
    render(<RemoteDashboard />);
    expect(screen.getByText(/Đang tải Dashboard module/)).toBeInTheDocument();
    expect(await screen.findByText("dashboard remote mounted")).toBeInTheDocument();
  });
});
