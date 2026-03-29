import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

describe('LoginPage', () => {
    const mockNavigate = vi.fn();
    const mockLogin = vi.fn();
    const mockClearAuthExpiredMessage = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useNavigate).mockReturnValue(mockNavigate);

        vi.mocked(useAuth).mockReturnValue({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
            authExpiredMessage: null,
            login: mockLogin,
            logout: vi.fn(),
            checkAuth: vi.fn().mockResolvedValue(false),
            clearAuthExpiredMessage: mockClearAuthExpiredMessage,
        });
    });

    describe('前端元素', () => {
        it('【前端元素】渲染登入表單', () => {
            render(<LoginPage />);

            expect(screen.getByRole('heading', { name: '歡迎回來' })).toBeInTheDocument();
            expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
            expect(screen.getByLabelText('密碼')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
        });
    });

    describe('function 邏輯', () => {
        it('【function 邏輯】Email 格式驗證失敗', async () => {
            const user = userEvent.setup();
            render(<LoginPage />);

            await user.type(screen.getByLabelText('電子郵件'), 'invalid-email');
            await user.type(screen.getByLabelText('密碼'), 'Valid123');
            await user.click(screen.getByRole('button', { name: '登入' }));

            expect(screen.getByText('請輸入有效的 Email 格式')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('【function 邏輯】密碼長度驗證失敗', async () => {
            const user = userEvent.setup();
            render(<LoginPage />);

            await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
            await user.type(screen.getByLabelText('密碼'), 'a12');
            await user.click(screen.getByRole('button', { name: '登入' }));

            expect(screen.getByText('密碼必須至少 8 個字元')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('【function 邏輯】密碼格式驗證失敗', async () => {
            const user = userEvent.setup();
            render(<LoginPage />);

            await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
            await user.type(screen.getByLabelText('密碼'), 'onlyletters');
            await user.click(screen.getByRole('button', { name: '登入' }));

            expect(screen.getByText('密碼必須fffff包含英文字母和數字')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });
    });

    describe('Mock API', () => {
        it('【Mock API】登入成功並導向 Dashboard', async () => {
            const user = userEvent.setup();

            let resolveLogin: () => void;
            const loginPromise = new Promise<void>((resolve) => {
                resolveLogin = resolve;
            });
            mockLogin.mockReturnValueOnce(loginPromise);

            render(<LoginPage />);

            await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
            await user.type(screen.getByLabelText('密碼'), 'Valid123');

            const submitButton = screen.getByRole('button', { name: '登入' });
            await user.click(submitButton);

            // Checking the "登入中..." state
            expect(submitButton).toHaveTextContent('登入中...');

            resolveLogin!();

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Valid123');
            });

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
            });
        });

        it('【Mock API】登入失敗並顯示 API 錯誤訊息', async () => {
            const user = userEvent.setup();
            const axiosError = {
                isAxiosError: true,
                response: { data: { message: '帳號或密碼錯誤' } }
            };
            mockLogin.mockRejectedValueOnce(axiosError);

            render(<LoginPage />);

            await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
            await user.type(screen.getByLabelText('密碼'), 'Valid123');
            await user.click(screen.getByRole('button', { name: '登入' }));

            await waitFor(() => {
                expect(screen.getByText('帳號或密碼錯誤')).toBeInTheDocument();
            });
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    describe('驗證權限', () => {
        it('【驗證權限】已登入狀態下自動導向', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { username: 'testuser', role: 'user' },
                token: 'fake-token',
                isLoading: false,
                isAuthenticated: true,
                authExpiredMessage: null,
                login: mockLogin,
                logout: vi.fn(),
                checkAuth: vi.fn(),
                clearAuthExpiredMessage: mockClearAuthExpiredMessage,
            });

            render(<LoginPage />);

            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });

        it('【驗證權限】捕獲認證過期訊息', async () => {
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                token: null,
                isLoading: false,
                isAuthenticated: false,
                authExpiredMessage: '請重新登入',
                login: mockLogin,
                logout: vi.fn(),
                checkAuth: vi.fn(),
                clearAuthExpiredMessage: mockClearAuthExpiredMessage,
            });

            render(<LoginPage />);

            expect(screen.getByText('請重新登入')).toBeInTheDocument();
            expect(mockClearAuthExpiredMessage).toHaveBeenCalled();
        });
    });
});
