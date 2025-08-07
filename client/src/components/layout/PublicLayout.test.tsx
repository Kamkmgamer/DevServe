import { render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet } from "react-router-dom";
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

// Mock PublicLayout itself to ensure it's treated as a valid React component
jest.mock("./PublicLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="public-layout" className="min-h-screen flex flex-col">
      <nav data-testid="navbar">Mocked Navbar</nav>
      <main className="flex-1">{children}</main>
      <footer data-testid="footer">Mocked Footer</footer>
    </div>
  ),
}));

describe("PublicLayout Component", () => {
  it("should render the Navbar, Footer, and the content from a nested route via Outlet", () => {
    const TestChildComponent = () => <div>Child Page Content</div>;

    render(
      <MemoryRouter initialEntries={["/test-route"]}>
        <PublicLayout>
          <TestChildComponent />
        </PublicLayout>
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
    const { container } = render(
      <MemoryRouter>
        <PublicLayout />
      </MemoryRouter>
    );

    const rootDiv = screen.getByTestId("public-layout");
    expect(rootDiv).toHaveClass("min-h-screen", "flex", "flex-col");

    const mainElement = screen.getByRole("main");
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass("flex-1");
  });
});