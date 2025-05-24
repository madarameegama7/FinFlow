const { saveGoal, updateGoal, getGoals } = require('../../controllers/goalController');
const Goal = require('../../models/Goal');
const User = require('../../models/User');
const { getExchangeRate } = require('../../controllers/currencyController');

jest.mock('../../models/Goal', () => ({
  findOneAndUpdate: jest.fn(),
  find: jest.fn(),
}));

jest.mock('../../models/User', () => ({
  findOne: jest.fn(),
}));

jest.mock('../../controllers/currencyController', () => ({
  getExchangeRate: jest.fn(),
}));

describe('Goal Controller Tests', () => {
  let res;
  
  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('saveGoal', () => {

    it('should return an error if required fields are missing', async () => {
      const req = { body: {} };
      
      await saveGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "All fields (title, targetAmount, deadline, autoSavePercentage, currency) are required.",
      });
    });
  });

  describe('updateGoal', () => {
    it('should update the goal successfully', async () => {
      const req = {
        user: { email: 'test@example.com' },
        params: { goalId: 'goalId' },
        body: { savedAmount: 500 },
      };

      Goal.findOneAndUpdate.mockResolvedValueOnce({ _id: 'goalId', savedAmount: 500 });

      await updateGoal(req, res);

      expect(Goal.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'goalId', userEmail: 'test@example.com' },
        { savedAmount: 500 },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Goal updated successfully",
        goal: { _id: 'goalId', savedAmount: 500 },
      });
    });

    it('should return an error if saved amount exceeds target amount', async () => {
      const req = {
        user: { email: 'test@example.com' },
        params: { goalId: 'goalId' },
        body: { savedAmount: 1500 },
      };

      Goal.findOneAndUpdate.mockResolvedValueOnce(null);

      await updateGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cannot save more than target amount",
      });
    });
  });

  describe('getGoals', () => {
    it('should return all goals for an admin', async () => {
      const req = { user: { isAdmin: true } };
      const mockGoals = [{ title: 'Goal 1' }, { title: 'Goal 2' }];

      Goal.find.mockResolvedValueOnce(mockGoals);

      await getGoals(req, res);

      expect(Goal.find).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGoals);
    });

    it('should return only user goals for a non-admin', async () => {
      const req = { user: { email: 'test@example.com', isAdmin: false } };
      const mockGoals = [{ title: 'Goal 1', userEmail: 'test@example.com' }];

      Goal.find.mockResolvedValueOnce(mockGoals);

      await getGoals(req, res);

      expect(Goal.find).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGoals);
    });
  });
});
