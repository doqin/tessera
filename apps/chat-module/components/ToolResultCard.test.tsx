import { render, screen } from "@testing-library/react";
import { ToolResultCard } from "./ToolResultCard";

describe("ToolResultCard", () => {
  it("renders a weather result as a readable sentence instead of a pointer to the dashboard", () => {
    render(
      <ToolResultCard
        name="get_weather"
        result={{ city: "Hà Nội", temperatureC: 28, condition: "Nhiều mây" }}
        durationMs={812}
      />,
    );

    expect(screen.getByText("get_weather")).toBeInTheDocument();
    expect(screen.getByText("28°C")).toBeInTheDocument();
    expect(screen.getByText(/Hà Nội ·/)).toBeInTheDocument();
    expect(screen.getByText(/812 ms/)).toBeInTheDocument();
  });

  it("renders document results as a list", () => {
    render(
      <ToolResultCard
        name="search_docs"
        result={[
          { title: "Giới thiệu: module federation", snippet: "Đoạn 1." },
          { title: "Hướng dẫn: module federation", snippet: "Đoạn 2." },
        ]}
      />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText(/Giới thiệu: module federation/)).toBeInTheDocument();
  });

  it("falls back to JSON for an unknown shape", () => {
    render(<ToolResultCard name="mystery" result={{ a: 1 }} />);
    expect(screen.getByText(/"a": 1/)).toBeInTheDocument();
  });
});
