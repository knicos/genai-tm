import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Classification } from './Classification';
import SamplePreviewModal from './SamplePreviewModal';
import userEvent from '@testing-library/user-event';
import TestWrapper from '../../util/TestWrapper';

function createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    return canvas;
}

describe('SamplePreviewModal Component', () => {
    describe('Image navigation', () => {
        it('should display correct counter for current image', ({ expect }) => {
            const classNames = ['Class 1', 'Class 2'];
            render(
                <SamplePreviewModal
                    open={true}
                    onClose={() => {}}
                    imageUrl="data:image/png;base64,test"
                    currentIndex={0}
                    totalCount={4}
                    classNames={classNames}
                    currentClassIndex={0}
                    onPrevious={() => {}}
                    onNext={() => {}}
                    onClassChange={() => {}}
                    onMoveToClass={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('1 / 4')).toBeInTheDocument();
        });

        it('should call onNext when next button is clicked', async ({ expect }) => {
            const onNext = vi.fn();
            const classNames = ['Class 1'];

            render(
                <SamplePreviewModal
                    open={true}
                    onClose={() => {}}
                    imageUrl="data:image/png;base64,test"
                    currentIndex={0}
                    totalCount={4}
                    classNames={classNames}
                    currentClassIndex={0}
                    onPrevious={() => {}}
                    onNext={onNext}
                    onClassChange={() => {}}
                    onMoveToClass={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            const user = userEvent.setup();
            const nextButton = screen.getByLabelText('next');
            await user.click(nextButton);

            expect(onNext).toHaveBeenCalledTimes(1);
        });

        it('should call onPrevious when previous button is clicked', async ({ expect }) => {
            const onPrevious = vi.fn();
            const classNames = ['Class 1'];

            render(
                <SamplePreviewModal
                    open={true}
                    onClose={() => {}}
                    imageUrl="data:image/png;base64,test"
                    currentIndex={2}
                    totalCount={4}
                    classNames={classNames}
                    currentClassIndex={0}
                    onPrevious={onPrevious}
                    onNext={() => {}}
                    onClassChange={() => {}}
                    onMoveToClass={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            const user = userEvent.setup();
            const prevButton = screen.getByLabelText('previous');
            await user.click(prevButton);

            expect(onPrevious).toHaveBeenCalledTimes(1);
        });

        it('should disable previous button on first image', ({ expect }) => {
            const classNames = ['Class 1'];

            render(
                <SamplePreviewModal
                    open={true}
                    onClose={() => {}}
                    imageUrl="data:image/png;base64,test"
                    currentIndex={0}
                    totalCount={4}
                    classNames={classNames}
                    currentClassIndex={0}
                    onPrevious={() => {}}
                    onNext={() => {}}
                    onClassChange={() => {}}
                    onMoveToClass={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            const prevButton = screen.getByLabelText('previous');
            expect(prevButton).toBeDisabled();
        });

        it('should disable next button on last image', ({ expect }) => {
            const classNames = ['Class 1'];

            render(
                <SamplePreviewModal
                    open={true}
                    onClose={() => {}}
                    imageUrl="data:image/png;base64,test"
                    currentIndex={3}
                    totalCount={4}
                    classNames={classNames}
                    currentClassIndex={0}
                    onPrevious={() => {}}
                    onNext={() => {}}
                    onClassChange={() => {}}
                    onMoveToClass={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            const nextButton = screen.getByLabelText('next');
            expect(nextButton).toBeDisabled();
        });
    });

    describe('Class navigation', () => {
        it('should display current class name', async ({ expect }) => {
            const classNames = ['Dogs', 'Cats', 'Birds'];

            render(
                <SamplePreviewModal
                    open={true}
                    onClose={() => {}}
                    imageUrl="data:image/png;base64,test"
                    currentIndex={0}
                    totalCount={3}
                    classNames={classNames}
                    currentClassIndex={1}
                    onPrevious={() => {}}
                    onNext={() => {}}
                    onClassChange={() => {}}
                    onMoveToClass={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            const classNameEl = await screen.findByTestId('modal-class-name');
            expect(classNameEl).toHaveTextContent('Cats');
        });

        it('should call onClassChange when previous class button is clicked', async ({ expect }) => {
            const onClassChange = vi.fn();
            const classNames = ['Class 1', 'Class 2', 'Class 3'];

            render(
                <SamplePreviewModal
                    open={true}
                    onClose={() => {}}
                    imageUrl="data:image/png;base64,test"
                    currentIndex={0}
                    totalCount={3}
                    classNames={classNames}
                    currentClassIndex={1}
                    onPrevious={() => {}}
                    onNext={() => {}}
                    onClassChange={onClassChange}
                    onMoveToClass={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            const user = userEvent.setup();
            const prevClassButton = screen.getByLabelText('previous class');
            await user.click(prevClassButton);

            expect(onClassChange).toHaveBeenCalledWith(0);
        });

        it('should call onClassChange when next class button is clicked', async ({ expect }) => {
            const onClassChange = vi.fn();
            const classNames = ['Class 1', 'Class 2', 'Class 3'];

            render(
                <SamplePreviewModal
                    open={true}
                    onClose={() => {}}
                    imageUrl="data:image/png;base64,test"
                    currentIndex={0}
                    totalCount={3}
                    classNames={classNames}
                    currentClassIndex={1}
                    onPrevious={() => {}}
                    onNext={() => {}}
                    onClassChange={onClassChange}
                    onMoveToClass={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            const user = userEvent.setup();
            const nextClassButton = screen.getByLabelText('next class');
            await user.click(nextClassButton);

            expect(onClassChange).toHaveBeenCalledWith(2);
        });

        it('should disable previous class button on first class', ({ expect }) => {
            const classNames = ['Class 1', 'Class 2'];

            render(
                <SamplePreviewModal
                    open={true}
                    onClose={() => {}}
                    imageUrl="data:image/png;base64,test"
                    currentIndex={0}
                    totalCount={3}
                    classNames={classNames}
                    currentClassIndex={0}
                    onPrevious={() => {}}
                    onNext={() => {}}
                    onClassChange={() => {}}
                    onMoveToClass={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            const prevClassButton = screen.getByLabelText('previous class');
            expect(prevClassButton).toBeDisabled();
        });

        it('should disable next class button on last class', ({ expect }) => {
            const classNames = ['Class 1', 'Class 2'];

            render(
                <SamplePreviewModal
                    open={true}
                    onClose={() => {}}
                    imageUrl="data:image/png;base64,test"
                    currentIndex={0}
                    totalCount={3}
                    classNames={classNames}
                    currentClassIndex={1}
                    onPrevious={() => {}}
                    onNext={() => {}}
                    onClassChange={() => {}}
                    onMoveToClass={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            const nextClassButton = screen.getByLabelText('next class');
            expect(nextClassButton).toBeDisabled();
        });
    });

    describe('Empty class handling', () => {
        it('should display empty message when totalCount is 0', ({ expect }) => {
            const classNames = ['Empty Class'];

            render(
                <SamplePreviewModal
                    open={true}
                    onClose={() => {}}
                    imageUrl={undefined}
                    currentIndex={0}
                    totalCount={0}
                    classNames={classNames}
                    currentClassIndex={0}
                    onPrevious={() => {}}
                    onNext={() => {}}
                    onClassChange={() => {}}
                    onMoveToClass={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            expect(screen.getByTestId('empty-class-message')).toBeInTheDocument();
        });

        it('should display N / A counter for empty class', ({ expect }) => {
            const classNames = ['Empty Class'];

            render(
                <SamplePreviewModal
                    open={true}
                    onClose={() => {}}
                    imageUrl={undefined}
                    currentIndex={0}
                    totalCount={0}
                    classNames={classNames}
                    currentClassIndex={0}
                    onPrevious={() => {}}
                    onNext={() => {}}
                    onClassChange={() => {}}
                    onMoveToClass={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            expect(screen.getByText('N / A')).toBeInTheDocument();
        });

        it('should disable all navigation buttons for empty class', ({ expect }) => {
            const classNames = ['Empty Class'];

            render(
                <SamplePreviewModal
                    open={true}
                    onClose={() => {}}
                    imageUrl={undefined}
                    currentIndex={0}
                    totalCount={0}
                    classNames={classNames}
                    currentClassIndex={0}
                    onPrevious={() => {}}
                    onNext={() => {}}
                    onClassChange={() => {}}
                    onMoveToClass={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            expect(screen.getByLabelText('previous')).toBeDisabled();
            expect(screen.getByLabelText('next')).toBeDisabled();
        });

        it('should disable delete button for empty class', ({ expect }) => {
            const classNames = ['Empty Class'];

            render(
                <SamplePreviewModal
                    open={true}
                    onClose={() => {}}
                    imageUrl={undefined}
                    currentIndex={0}
                    totalCount={0}
                    classNames={classNames}
                    currentClassIndex={0}
                    onPrevious={() => {}}
                    onNext={() => {}}
                    onClassChange={() => {}}
                    onMoveToClass={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
            expect(deleteButtons[0]).toBeDisabled();
        });
    });

    describe('Move to class functionality', () => {
        it('should disable move button when same class is selected', ({ expect }) => {
            const classNames = ['Class 1', 'Class 2'];

            render(
                <SamplePreviewModal
                    open={true}
                    onClose={() => {}}
                    imageUrl="data:image/png;base64,test"
                    currentIndex={0}
                    totalCount={3}
                    classNames={classNames}
                    currentClassIndex={0}
                    onPrevious={() => {}}
                    onNext={() => {}}
                    onClassChange={() => {}}
                    onMoveToClass={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            const moveButton = screen.getByLabelText('move to class');
            expect(moveButton).toBeDisabled();
        });
    });
});

describe('Sample Image Index Handling', () => {
    describe('Image click index calculation', () => {
        it('should pass correct index when clicking first image (newest)', async ({ expect }) => {
            const onSampleClick = vi.fn();
            const samples = [
                { data: createCanvas(), id: '0' },
                { data: createCanvas(), id: '1' },
                { data: createCanvas(), id: '2' },
            ];

            render(
                <Classification
                    name="TestClass"
                    index={0}
                    active={false}
                    data={{ label: 'TestClass', samples }}
                    setData={() => {}}
                    setActive={() => {}}
                    onActivate={() => {}}
                    onDelete={() => {}}
                    onSampleClick={onSampleClick}
                />,
                { wrapper: TestWrapper }
            );

            const user = userEvent.setup();
            // First displayed image has display index 3 (samples.length=3, ix=0 -> 3-0=3)
            // But we can't query by test-id since Sample copies from canvas data-testid
            // Get all samples and click the first one visually displayed
            const imageElements = screen.getAllByRole('img');
            await user.click(imageElements[0]);

            // Should call with classIndex=0, imageIndex=0 (first in array)
            expect(onSampleClick).toHaveBeenCalledWith(0, 0);
        });

        it('should pass correct index when clicking middle image', async ({ expect }) => {
            const onSampleClick = vi.fn();
            const samples = [
                { data: createCanvas(), id: '0' },
                { data: createCanvas(), id: '1' },
                { data: createCanvas(), id: '2' },
            ];

            render(
                <Classification
                    name="TestClass"
                    index={0}
                    active={false}
                    data={{ label: 'TestClass', samples }}
                    setData={() => {}}
                    setActive={() => {}}
                    onActivate={() => {}}
                    onDelete={() => {}}
                    onSampleClick={onSampleClick}
                />,
                { wrapper: TestWrapper }
            );

            const user = userEvent.setup();
            // Middle image (second visually)
            const images = screen.getAllByRole('img');
            await user.click(images[1]);

            // Should call with classIndex=0, imageIndex=1 (middle in array)
            expect(onSampleClick).toHaveBeenCalledWith(0, 1);
        });

        it('should pass correct index when clicking last image (oldest)', async ({ expect }) => {
            const onSampleClick = vi.fn();
            const samples = [
                { data: createCanvas(), id: '0' },
                { data: createCanvas(), id: '1' },
                { data: createCanvas(), id: '2' },
            ];

            render(
                <Classification
                    name="TestClass"
                    index={0}
                    active={false}
                    data={{ label: 'TestClass', samples }}
                    setData={() => {}}
                    setActive={() => {}}
                    onActivate={() => {}}
                    onDelete={() => {}}
                    onSampleClick={onSampleClick}
                />,
                { wrapper: TestWrapper }
            );

            const user = userEvent.setup();
            // Last displayed image (third visually)
            const images = screen.getAllByRole('img');
            await user.click(images[2]);

            // Should call with classIndex=0, imageIndex=2 (last in array)
            expect(onSampleClick).toHaveBeenCalledWith(0, 2);
        });

        it('should pass correct index with single image', async ({ expect }) => {
            const onSampleClick = vi.fn();
            const samples = [{ data: createCanvas(), id: '0' }];

            render(
                <Classification
                    name="TestClass"
                    index={0}
                    active={false}
                    data={{ label: 'TestClass', samples }}
                    setData={() => {}}
                    setActive={() => {}}
                    onActivate={() => {}}
                    onDelete={() => {}}
                    onSampleClick={onSampleClick}
                />,
                { wrapper: TestWrapper }
            );

            const user = userEvent.setup();
            const singleImage = screen.getByRole('img');
            await user.click(singleImage);

            // Should call with classIndex=0, imageIndex=0
            expect(onSampleClick).toHaveBeenCalledWith(0, 0);
        });
    });

    describe('Delete index calculation', () => {
        it('should delete correct image when deleting first image', async ({ expect }) => {
            const setData = vi.fn();
            const samples = [
                { data: createCanvas(), id: '0' },
                { data: createCanvas(), id: '1' },
                { data: createCanvas(), id: '2' },
            ];

            render(
                <Classification
                    name="TestClass"
                    index={0}
                    active={false}
                    data={{ label: 'TestClass', samples }}
                    setData={setData}
                    setActive={() => {}}
                    onActivate={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            const user = userEvent.setup();
            const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
            // First delete button corresponds to the newest image (index 0 in array)
            await user.click(deleteButtons[0]);

            expect(setData).toHaveBeenCalled();
            const updateFunction = setData.mock.calls[0][0];
            const result = updateFunction({ label: 'TestClass', samples });

            // Should remove first element (index 0)
            expect(result.samples).toHaveLength(2);
            expect(result.samples[0].id).toBe('1');
            expect(result.samples[1].id).toBe('2');
        });

        it('should delete correct image when deleting last image', async ({ expect }) => {
            const setData = vi.fn();
            const samples = [
                { data: createCanvas(), id: '0' },
                { data: createCanvas(), id: '1' },
                { data: createCanvas(), id: '2' },
            ];

            render(
                <Classification
                    name="TestClass"
                    index={0}
                    active={false}
                    data={{ label: 'TestClass', samples }}
                    setData={setData}
                    setActive={() => {}}
                    onActivate={() => {}}
                    onDelete={() => {}}
                />,
                { wrapper: TestWrapper }
            );

            const user = userEvent.setup();
            const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
            // Last delete button corresponds to the oldest image (index 2 in array)
            await user.click(deleteButtons[2]);

            expect(setData).toHaveBeenCalled();
            const updateFunction = setData.mock.calls[0][0];
            const result = updateFunction({ label: 'TestClass', samples });

            // Should remove last element (index 2)
            expect(result.samples).toHaveLength(2);
            expect(result.samples[0].id).toBe('0');
            expect(result.samples[1].id).toBe('1');
        });
    });

    describe('Index consistency across operations', () => {
        it('should maintain consistent index when samples are added and removed', async ({ expect }) => {
            const onSampleClick = vi.fn();
            let currentSamples = [
                { data: createCanvas(), id: '0' },
                { data: createCanvas(), id: '1' },
            ];

            const { rerender } = render(
                <Classification
                    name="TestClass"
                    index={0}
                    active={false}
                    data={{ label: 'TestClass', samples: currentSamples }}
                    setData={() => {}}
                    setActive={() => {}}
                    onActivate={() => {}}
                    onDelete={() => {}}
                    onSampleClick={onSampleClick}
                />,
                { wrapper: TestWrapper }
            );

            const user = userEvent.setup();

            // Click first image (index 0)
            let images = screen.getAllByRole('img');
            await user.click(images[0]);
            expect(onSampleClick).toHaveBeenCalledWith(0, 0);

            // Add a new sample at the beginning (making it 3 samples)
            currentSamples = [
                { data: createCanvas(), id: '2' },
                { data: createCanvas(), id: '0' },
                { data: createCanvas(), id: '1' },
            ];

            rerender(
                <Classification
                    name="TestClass"
                    index={0}
                    active={false}
                    data={{ label: 'TestClass', samples: currentSamples }}
                    setData={() => {}}
                    setActive={() => {}}
                    onActivate={() => {}}
                    onDelete={() => {}}
                    onSampleClick={onSampleClick}
                />
            );

            onSampleClick.mockClear();

            // Click what is now the second image (original first element pushed to index 1)
            images = screen.getAllByRole('img');
            await user.click(images[1]);
            expect(onSampleClick).toHaveBeenCalledWith(0, 1);
        });
    });
});
