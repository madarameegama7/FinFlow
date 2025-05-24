const BudgetController = require("../../controllers/budgetController");
const Budget = require("../../models/Budget");

jest.mock("../../models/Budget"); // Mock the Budget model

describe("Budget Controller Tests", () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: { amount: 1000, category: "Food", month: "March", currency: "USD" },
            query: {},
            headers: {},
            user: { email: "user123@gmail.com", role: "user" }  // Ensure the email is provided for user context
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it("should return 400 if any field is missing", async () => {
        req.body = { amount: 1000, category: "Food", month: "March" }; // Missing currency

        await BudgetController.addBudget(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "All fields are required" });
    });

    it("should return 400 if category or month is missing in getBudgetStatus", async () => {
        req.body = {}; // Ensure no category or month is sent

        await BudgetController.getBudgetStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Category and month are required" });
    });

    it("should return 404 if no budget is found", async () => {
        req.body = { category: "Food", month: "March" };
        Budget.findOne.mockResolvedValue(null);

        await BudgetController.getBudgetStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "No budget found for this category and month" });
    });

    it("should return budget status if found", async () => {
        const mockBudget = { category: "Food", amount: 1000, month: "March" };
        req.body = { category: "Food", month: "March" };
        Budget.findOne.mockResolvedValue(mockBudget);

        await BudgetController.getBudgetStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ budget: mockBudget });
    });

    it("should return a recommendation for the budget", async () => {
        req.body = { month: "March", category: "Food", spentAmountSoFar: 500 };
        const mockBudget = { category: "Food", amount: 1000, month: "March" };
        Budget.findOne.mockResolvedValue(mockBudget);

        await BudgetController.getBudgetRecommendations(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            category: "Food",
            budget: 1000,
            spent: 500,
            recommendation: "Remaining amount left for this month is 500 for Food"
        });
    });
});
