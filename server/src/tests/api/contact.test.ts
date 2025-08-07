import { handleContactForm } from '../../api/contact';
import { Request, Response } from 'express';
import * as contactModule from '../../api/contact';

// Mock the contactSchema directly within the contact module
jest.mock('../../api/contact', () => ({
  ...jest.requireActual('../../api/contact'), // Import and retain default behavior
  contactSchema: {
    safeParse: jest.fn(),
  },
}));

describe('Contact API', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it('should return 200 and a success message for valid input', async () => {
    const mockData = { name: 'John Doe', email: 'john@example.com', message: 'Hello there!' };
    // Access the mocked contactSchema from the mocked module
    const { contactSchema } = jest.requireMock('../../api/contact');
    (contactSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: mockData });
    req.body = mockData;

    await handleContactForm(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Message received, thank you!' });
  });

  it('should return 400 and errors for invalid input', async () => {
    const mockErrors = {
      fieldErrors: {
        name: ['Too small: expected string to have >=2 characters'],
        email: ['Invalid email address'],
        message: ['Too small: expected string to have >=10 characters'],
      },
      formErrors: [],
    };
    // Access the mocked contactSchema from the mocked module
    const { contactSchema } = jest.requireMock('../../api/contact');
    (contactSchema.safeParse as jest.Mock).mockReturnValue({ success: false, error: { flatten: () => mockErrors } });
    req.body = { name: 'J', email: 'invalid', message: 'short' };

    await handleContactForm(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: mockErrors });
  });
});