import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginPage } from './LoginPage';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  const mockClearAuthExpiredMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      authExpiredMessage: '',
      clearAuthExpiredMessage: mockClearAuthExpiredMessage
    });
  });

  describe('【UI 渲染】', () => {
    it('畫面應正確渲染登入表單與初始狀態', () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );
      expect(screen.getByText('歡迎回來')).toBeInTheDocument();
      expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
      expect(screen.getByLabelText('密碼')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('Context 存在 authExpiredMessage 時應顯示錯誤並清除', () => {
      (useAuth as any).mockReturnValue({
        login: mockLogin,
        isAuthenticated: false,
        authExpiredMessage: '登入已過期',
        clearAuthExpiredMessage: mockClearAuthExpiredMessage
      });
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );
      expect(screen.getByText('登入已過期')).toBeInTheDocument();
      expect(mockClearAuthExpiredMessage).toHaveBeenCalled();
    });
  });

  describe('【表單驗證】', () => {
    it('Email 格式錯誤時應阻擋提交並顯示錯誤訊息', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText('電子郵件'), 'invalid-email');
      await user.type(screen.getByLabelText('密碼'), 'pass1234');
      await user.click(screen.getByRole('button', { name: '登入' }));

      expect(screen.getByText('請輸入有效的 Email 格式')).toBeInTheDocument();
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('密碼長度不足 8 碼時應阻擋提交並顯示錯誤訊息', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
      await user.type(screen.getByLabelText('密碼'), '1234567');
      await user.click(screen.getByRole('button', { name: '登入' }));

      expect(screen.getByText('密碼必須至少 8 個字元')).toBeInTheDocument();
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('密碼未包含英數字時應阻擋提交並顯示錯誤訊息', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
      await user.type(screen.getByLabelText('密碼'), '12345678');
      await user.click(screen.getByRole('button', { name: '登入' }));

      expect(screen.getByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('【登入邏輯與導向】', () => {
    it('成功登入後應導向至 Dashboard', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce(undefined);

      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
      await user.type(screen.getByLabelText('密碼'), 'pass1234');
      await user.click(screen.getByRole('button', { name: '登入' }));

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'pass1234');
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('登入失敗時應顯示 API 錯誤訊息', async () => {
      const user = userEvent.setup();
      const mockError = new AxiosError();
      mockError.response = { data: { message: '帳號或密碼錯誤' } } as any;
      mockLogin.mockRejectedValueOnce(mockError);

      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
      await user.type(screen.getByLabelText('密碼'), 'pass1234');
      await user.click(screen.getByRole('button', { name: '登入' }));

      await waitFor(() => {
        expect(screen.getByText('帳號或密碼錯誤')).toBeInTheDocument();
      });
    });

    it('已登入狀態下應自動導向至 Dashboard', () => {
      (useAuth as any).mockReturnValue({
        login: mockLogin,
        isAuthenticated: true,
        authExpiredMessage: '',
        clearAuthExpiredMessage: mockClearAuthExpiredMessage
      });

      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });
});
