import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminPage } from './AdminPage';
import { useAuth } from '../context/AuthContext';
import { useNavigate, BrowserRouter } from 'react-router-dom';

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

describe('AdminPage', () => {
    const mockNavigate = vi.fn();
    const mockLogout = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
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
    });

    describe('前端元素', () => {
        it('【前端元素】渲染管理後台頁面', () => {
            render(<BrowserRouter><AdminPage /></BrowserRouter>);
            
            expect(screen.getByRole('heading', { name: /管理後台/ })).toBeInTheDocument();
            expect(screen.getByText('← 返回')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
            expect(screen.getByText('管理員專屬頁面')).toBeInTheDocument();
        });
    });

    describe('function 邏輯', () => {
        it('【function 邏輯】點擊登出按鈕', async () => {
            const user = userEvent.setup();
            render(<BrowserRouter><AdminPage /></BrowserRouter>);
            
            await user.click(screen.getByRole('button', { name: '登出' }));
            
            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });
});
