const { getTransactions, addTransaction } = require('../../controllers/transactionController');
const Transaction = require('../../models/Transaction');
const Goal = require('../../models/Goal');
const mongoose = require('mongoose');

// Mock the Transaction and Goal models
jest.mock('../../models/Transaction');
jest.mock('../../models/Goal');

describe('Transaction Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: {
                email: 'test@example.com',
                role: 'user'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear all mocks after each test
    });

    describe('getTransactions', () => {
        it('should return 401 if user is not authenticated', async () => {
            req.user = null;

            await getTransactions(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized access" });
        });

        it('should return all transactions for admin', async () => {
            req.user.role = 'admin';
            const mockTransactions = [{ id: 1, amount: 100 }, { id: 2, amount: 200 }];
            Transaction.find.mockResolvedValue(mockTransactions);

            await getTransactions(req, res);

            expect(Transaction.find).toHaveBeenCalledWith();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockTransactions);
        });

        it('should return transactions for the logged-in user', async () => {
            const mockTransactions = [{ id: 1, amount: 100, userEmail: 'test@example.com' }];
            Transaction.find.mockResolvedValue(mockTransactions);

            await getTransactions(req, res);

            expect(Transaction.find).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockTransactions);
        });

        it('should handle server errors', async () => {
            Transaction.find.mockRejectedValue(new Error('Database error'));

            await getTransactions(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Server error", error: 'Database error' });
        });
    });

    describe('addTransaction', () => {
        it('should return 400 if required fields are missing', async () => {
            req.body = {};

            await addTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "All required fields must be filled" });
        });

        it('should return 400 if transaction type is invalid', async () => {
            req.body = {
                type: 'invalid',
                amount: 100,
                category: 'Food',
                transactionDate: new Date()
            };

            await addTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid transaction type. Must be income or expense" });
        });

        it('should return 400 if category is invalid', async () => {
            req.body = {
                type: 'income',
                amount: 100,
                category: 'InvalidCategory',
                transactionDate: new Date()
            };

            await addTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid category" });
        });

        it('should create a new transaction and return 201', async () => {
            req.body = {
                type: 'income',
                amount: 100,
                category: 'Food',
                transactionDate: new Date(),
                tags: [],
                description: 'Test transaction',
                recurring: false,
                autoSave: false,
                currency: 'USD'
            };
            const mockTransaction = { ...req.body, userEmail: 'test@example.com' };
            Transaction.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(mockTransaction)
            }));

            await addTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Transaction saved successfully",
                transaction: mockTransaction,
                autoSavedGoal: "No auto-savings applied"
            });
        });

        it('should handle server errors', async () => {
            req.body = {
                type: 'income',
                amount: 100,
                category: 'Food',
                transactionDate: new Date()
            };
            Transaction.mockImplementation(() => ({
                save: jest.fn().mockRejectedValue(new Error('Database error'))
            }));

            await addTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Server error", error: 'Database error' });
        });
    });
});