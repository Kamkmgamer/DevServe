import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, jest } from "@jest/globals";
import PublicLayout from "./PublicLayout";

// Mocking child components to isolate the PublicLayout component for testing.
// This ensures that we are only testing the layout's logic, not its children's.
jest.mock("./Navbar", () => ({
  default: () => <nav data-testid="navbar">Mocked Navbar</nav>,
}));

jest.mock("./Footer", () => ({
  default: () => <footer data-testid="footer">Mocked Footer</footer>,
}));

describe("PublicLayout Component", () => {
  it("should render the Navbar, Footer, and the content from a nested route via Outlet", () => {
    const TestChildComponent = () => <div>Child Page Content</div>;

    render(
      <MemoryRouter initialEntries={["/test-route"]}>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route path="test-route" element={<TestChildComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Assert that the mocked Navbar is rendered
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByText("Mocked Navbar")).toBeInTheDocument();

    // Assert that the mocked Footer is rendered
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByText("Mocked Footer")).toBeInTheDocument();

    // Assert that the content from the child route is rendered inside the main tag
    const mainElement = screen.getByRole("main");
    expect(mainElement).toContainElement(screen.getByText("Child Page Content"));
  });

  it("should have the correct layout structure and CSS classes", () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<PublicLayout />} />
        </Routes>
      </MemoryRouter>
    );

    const rootDiv = screen.getByRole("main").parentElement; // Get the parent div of main
    expect(rootDiv).toHaveClass("min-h-screen", "flex", "flex-col");

    const mainElement = screen.getByRole("main");
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass("flex-1");
  });
});