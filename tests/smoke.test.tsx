import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GalleryPage } from '../src/pages/GalleryPage';
import { ParameterPanel } from '../src/components/ParameterPanel';
import { heart01DefaultConfig } from '../src/gift-library/objects/heart-01/presets';
import { heart01Manifest } from '../src/gift-library/objects/heart-01/manifest';
import { UsageSnippet } from '../src/components/UsageSnippet';

describe('UI Smoke & Component Integration Tests (Stage B)', () => {
  it('renders Gallery Page with Stage B banner and Trái tim mẫu 1 card', () => {
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

    // Verify Stage B banner
    expect(screen.getByText('GIAI ĐOẠN B')).toBeInTheDocument();
    expect(
      screen.getByText(/Đã hoàn thiện Trái tim mẫu 1/i)
    ).toBeInTheDocument();

    // Verify Heart-01 and Love-Universe-01 cards are rendered in the gallery grid
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
    expect(screen.getAllByText('v0.1.0').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/Chờ duyệt/i).length).toBeGreaterThanOrEqual(2); // review status

    // Click "Xem mẫu" on the heart card
    const viewBtn = screen.getByRole('button', { name: /^Xem mẫu Card 1$/i });
    fireEvent.click(viewBtn);
    expect(handleSelect).toHaveBeenCalledWith('heart-01');
  });

  it('renders ParameterPanel with heart-01 config and allows updates', () => {
    const handleChange = vi.fn();
    const handleReset = vi.fn();
    const handleSave = vi.fn();

    render(
      <ParameterPanel
        config={heart01DefaultConfig}
        defaultConfig={heart01DefaultConfig}
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
    expect(screen.getByText(heart01DefaultConfig.appearance.color.toUpperCase())).toBeInTheDocument();

    // Click reset button
    const resetBtn = screen.getByRole('button', { name: /Đặt lại mẫu/i });
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);

    // Click save preset button
    const saveBtn = screen.getByRole('button', { name: /Lưu biến thể/i });
    fireEvent.click(saveBtn);
    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it('renders UsageSnippet and switches between JSX, JSON, and AI tabs for Heart01', () => {
    render(<UsageSnippet manifest={heart01Manifest} config={heart01DefaultConfig} />);

    // JSX snippet tab is active by default
    expect(screen.getByText(/import { Canvas }/)).toBeInTheDocument();
    expect(screen.getByText(/import { Heart01 }/)).toBeInTheDocument();

    // Switch to JSON tab
    const jsonTab = screen.getByRole('button', { name: /Cấu hình \(JSON\)/i });
    fireEvent.click(jsonTab);
    expect(screen.getByText(/"assetId": "heart-01"/)).toBeInTheDocument();

    // Switch to AI tab
    const aiTab = screen.getByRole('button', { name: /Lệnh cho AI/i });
    fireEvent.click(aiTab);
    expect(screen.getByText(/Card 1/)).toBeInTheDocument();
    expect(screen.getByText(/KHÔNG TỰ Ý DỰNG LẠI HÌNH HỌC/)).toBeInTheDocument();
  });
});
