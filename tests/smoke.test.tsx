import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GalleryPage } from '../src/pages/GalleryPage';
import { ParameterPanel } from '../src/components/ParameterPanel';
import { devBoxDefaultConfig } from '../src/gift-library/objects/dev-fixture/presets';
import { devBoxManifest } from '../src/gift-library/objects/dev-fixture/manifest';
import { UsageSnippet } from '../src/components/UsageSnippet';

describe('UI Smoke & Component Integration Tests', () => {
  it('renders Gallery Page with Stage A banner and empty state', () => {
    const handleSelect = vi.fn();
    const handleDev = vi.fn();
    const handleFav = vi.fn();

    render(
      <GalleryPage
        favorites={[]}
        onToggleFavorite={handleFav}
        onSelectAsset={handleSelect}
        onNavigateDev={handleDev}
      />
    );

    // Verify Stage A banner
    expect(screen.getByText('GIAI ĐOẠN A')).toBeInTheDocument();
    expect(
      screen.getByText(/Gallery hiện trạng thái trống theo đúng đặc tả/i)
    ).toBeInTheDocument();

    // Verify empty state title
    expect(screen.getByText('Chưa có mẫu nào trong bộ sưu tập')).toBeInTheDocument();

    // Click Dev button
    const devBtn = screen.getByRole('button', { name: /Kiểm tra bằng Khối kỹ thuật/i });
    fireEvent.click(devBtn);
    expect(handleDev).toHaveBeenCalledTimes(1);
  });

  it('renders ParameterPanel and allows updating color and sliders', () => {
    const handleChange = vi.fn();
    const handleReset = vi.fn();
    const handleSave = vi.fn();

    render(
      <ParameterPanel
        config={devBoxDefaultConfig}
        defaultConfig={devBoxDefaultConfig}
        onChange={handleChange}
        onReset={handleReset}
        onOpenSavePreset={handleSave}
        onCopyJson={vi.fn()}
        onCopyJsx={vi.fn()}
        onCopyAiPrompt={vi.fn()}
      />
    );

    // Parameter sections are rendered
    expect(screen.getByText('1. Hình dáng & Vật liệu')).toBeInTheDocument();
    expect(screen.getByText('2. Kích thước & Góc xoay ban đầu')).toBeInTheDocument();
    expect(screen.getByText('3. Chuyển động (Motion)')).toBeInTheDocument();

    // Check color display
    expect(screen.getByText(devBoxDefaultConfig.appearance.color.toUpperCase())).toBeInTheDocument();

    // Click reset button
    const resetBtn = screen.getByRole('button', { name: /Đặt lại mẫu/i });
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);

    // Click save preset button
    const saveBtn = screen.getByRole('button', { name: /Lưu biến thể/i });
    fireEvent.click(saveBtn);
    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it('renders UsageSnippet and switches between JSX, JSON, and AI tabs', () => {
    render(<UsageSnippet manifest={devBoxManifest} config={devBoxDefaultConfig} />);

    // JSX snippet tab is active by default
    expect(screen.getByText(/import { Canvas }/)).toBeInTheDocument();

    // Switch to JSON tab
    const jsonTab = screen.getByRole('button', { name: /Cấu hình \(JSON\)/i });
    fireEvent.click(jsonTab);
    expect(screen.getByText(/"schemaVersion": 1/)).toBeInTheDocument();

    // Switch to AI tab
    const aiTab = screen.getByRole('button', { name: /Lệnh cho AI/i });
    fireEvent.click(aiTab);
    expect(screen.getByText(/Chỉ dẫn AI: Ghép chi tiết thiệp/)).toBeInTheDocument();
  });
});
