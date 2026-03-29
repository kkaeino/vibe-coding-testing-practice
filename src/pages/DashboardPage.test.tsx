import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from './DashboardPage';
import { useAuth } from '../context/AuthContext';
import { useNavigate, BrowserRouter } from 'react-router-dom';
import { productApi } from '../api/productApi';

vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

vi.mock('../api/productApi', () => ({
    productApi: {
        getProducts: vi.fn(),
    },
}));

describe('DashboardPage', () => {
    const mockNavigate = vi.fn();
    const mockLogout = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
        vi.mocked(useAuth).mockReturnValue({
            user: { username: 'test_user', role: 'user' },
            token: 'fake-token',
            isLoading: false,
            isAuthenticated: true,
            authExpiredMessage: null,
            login: vi.fn(),
            logout: mockLogout,
            checkAuth: vi.fn(),
            clearAuthExpiredMessage: vi.fn(),
        });
        vi.mocked(productApi.getProducts).mockResolvedValue([]);
    });

    describe('前端元素', () => {
        it('【前端元素】渲染儀表板基本元件', async () => {
            render(<BrowserRouter><DashboardPage /></BrowserRouter>);
            
            expect(screen.getByRole('heading', { name: '儀表板' })).toBeInTheDocument();
            expect(screen.getByText(/Welcome, test_user/)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
            
            await waitFor(() => {
                 expect(productApi.getProducts).toHaveBeenCalled();
            });
        });

        it('【前端元素】管理員角色顯示管理後台連結', async () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { username: 'admin_user', role: 'admin' },
                token: 'fake-token',
                isLoading: false,
                isAuthenticated: true,
                authExpiredMessage: null,
                login: vi.fn(),
                logout: mockLogout,
                checkAuth: vi.fn(),
                clearAuthExpiredMessage: vi.fn(),
            });
            render(<BrowserRouter><DashboardPage /></BrowserRouter>);
            
            expect(screen.getByRole('link', { name: /管理後台/ })).toBeInTheDocument();
        });

        it('【前端元素】一般用戶不顯示管理後台連結', async () => {
            render(<BrowserRouter><DashboardPage /></BrowserRouter>);
            
            expect(screen.queryByRole('link', { name: /管理後台/ })).not.toBeInTheDocument();
        });
    });

    describe('function 邏輯', () => {
        it('【function 邏輯】點擊登出按鈕', async () => {
            const user = userEvent.setup();
            render(<BrowserRouter><DashboardPage /></BrowserRouter>);
            
            await user.click(screen.getByRole('button', { name: '登出' }));
            
            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });

    describe('Mock API', () => {
        it('【Mock API】顯示商品載入中狀態', () => {
            let resolvePromise: (value: any) => void;
            const promise = new Promise<any>((resolve) => {
                resolvePromise = resolve;
            });
            vi.mocked(productApi.getProducts).mockReturnValue(promise);

            render(<BrowserRouter><DashboardPage /></BrowserRouter>);
            
            expect(screen.getByText('載入商品中...')).toBeInTheDocument();
            
            // Cleanup
            resolvePromise!([]);
        });

        it('【Mock API】成功獲取並渲染商品列表', async () => {
            vi.mocked(productApi.getProducts).mockResolvedValue([
                { id: 1, name: 'Product A', price: 100, description: 'Desc A' },
                { id: 2, name: 'Product B', price: 200, description: 'Desc B' }
            ]);

            render(<BrowserRouter><DashboardPage /></BrowserRouter>);
            
            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });
            
            expect(screen.getByText('Product A')).toBeInTheDocument();
            expect(screen.getByText('Desc A')).toBeInTheDocument();
            expect(screen.getByText('NT$ 100')).toBeInTheDocument();
            expect(screen.getByText('Product B')).toBeInTheDocument();
        });

        it('【Mock API】獲取商品失敗顯示錯誤訊息', async () => {
            vi.mocked(productApi.getProducts).mockRejectedValue({
                response: {
                    status: 500,
                    data: { message: '伺服器錯誤' }
                }
            });

            render(<BrowserRouter><DashboardPage /></BrowserRouter>);
            
            await waitFor(() => {
                expect(screen.getByText('伺服器錯誤')).toBeInTheDocument();
            });
        });
    });
});
