import { describe, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DatasetPicker from './DatasetPicker';

vi.mock('@genaitm/util/datasets', () => ({
    DATASETS: [],
    fetchAndCacheDatasets: vi.fn().mockResolvedValue([
        {
            id: 'dataset1',
            nameKey: 'dataset.name',
            descriptionKey: 'dataset.description',
            categoryKey: 'dataset.category',

            images: [{ url: 'https://example.com/image1.jpg' }, { url: 'https://example.com/image2.jpg' }],
        },
    ]),
}));

describe('DatasetPicker', () => {
    it('fetches and displays datasets when opened', async ({ expect }) => {
        render(
            <DatasetPicker
                open={true}
                onClose={() => {}}
                onDatasetSelected={() => {}}
            />
        );
        await waitFor(() => expect(screen.getByText('dataset.name')).toBeInTheDocument());
        expect(screen.getByText('dataset.category')).toBeInTheDocument();
        expect(screen.getAllByTestId('dataset-image')).toHaveLength(2);
    });
});
