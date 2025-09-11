import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CouponFormPage from "./CouponFormPage";
import { BrowserRouter } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

// Mock axios
jest.mock("../../api/axios");
const mockedApi = api as jest.Mocked<typeof api>;

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(() => {}),
    error: jest.fn(() => {}),
  },
}));

describe("CouponFormPage", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const { useNavigate, useParams } = require("react-router-dom");
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({}); // Default to create mode
  });

  test("submits form with expiresAt as null when field is empty", async () => {
    mockedApi.post.mockResolvedValue({ data: { id: "new-coupon-id" } });

    render(
      <BrowserRouter>
        <CouponFormPage />
      </BrowserRouter>
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Coupon Code \*/i), {
      target: { value: "TESTCODE" },
    });
    fireEvent.change(screen.getByLabelText(/Discount Type \*/i), {
      target: { value: "fixed" },
    });
    fireEvent.change(screen.getByLabelText(/Discount Value \*/i), {
      target: { value: "10" },
    });

    // expiresAt field is left empty by default

    fireEvent.click(screen.getByRole("button", { name: /Create Coupon/i }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledTimes(1);
      const payload = mockedApi.post.mock.calls[0][1];
      expect(payload.expiresAt).toBeNull();
      expect(toast.success).toHaveBeenCalledWith("Coupon created");
      expect(mockNavigate).toHaveBeenCalledWith("/admin/coupons");
    });
  });

  test("submits form with expiresAt as ISO string when field is filled", async () => {
    mockedApi.post.mockResolvedValue({ data: { id: "new-coupon-id" } });

    render(
      <BrowserRouter>
        <CouponFormPage />
      </BrowserRouter>
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Coupon Code \*/i), {
      target: { value: "TESTDATE" },
    });
    fireEvent.change(screen.getByLabelText(/Discount Type \*/i), {
      target: { value: "percentage" },
    });
    fireEvent.change(screen.getByLabelText(/Discount Value \*/i), {
      target: { value: "50" },
    });

    // Fill expiresAt field
    const testDate = "2025-12-31T23:59";
    fireEvent.change(screen.getByLabelText(/Expires At/i), {
      target: { value: testDate },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create Coupon/i }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledTimes(1);
      const payload = mockedApi.post.mock.calls[0][1];
      expect(payload.expiresAt).toBe(new Date(testDate).toISOString());
      expect(toast.success).toHaveBeenCalledWith("Coupon created");
      expect(mockNavigate).toHaveBeenCalledWith("/admin/coupons");
    });
  });

  test("handles error during coupon creation", async () => {
    const errorMessage = "Failed to create coupon";
    mockedApi.post.mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    render(
      <BrowserRouter>
        <CouponFormPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Coupon Code \*/i), {
      target: { value: "ERRORCODE" },
    });
    fireEvent.change(screen.getByLabelText(/Discount Type \*/i), {
      target: { value: "fixed" },
    });
    fireEvent.change(screen.getByLabelText(/Discount Value \*/i), {
      target: { value: "5" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create Coupon/i }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(mockNavigate).not.toHaveBeenCalled(); // Should not navigate on error
    });
  });
});
