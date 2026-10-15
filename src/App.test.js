import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react';
import App from './App';
import domtoimage from 'dom-to-image';

jest.mock('dom-to-image', () => ({
  toPng: jest.fn(() => Promise.resolve('data:image/png;base64,' + 'A'.repeat(2000)))
}));

// Mock fetch for meme APIs
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ data: { memes: [] } })
    })
  );
  window.scrollTo = jest.fn();
  delete window.__FORCE_APPLE_DEVICE_FOR_TESTING__;
});

afterEach(() => {
  jest.restoreAllMocks();
  delete window.__FORCE_APPLE_DEVICE_FOR_TESTING__;
});

test('renders meme generator header and clean form with three text inputs', () => {
  const { getByText, getByPlaceholderText, queryByLabelText } = render(<App />);
  expect(getByText(/Meme Generator/i)).toBeInTheDocument();
  expect(getByText(/Create your meme/i)).toBeInTheDocument();
  expect(getByPlaceholderText(/Top Text/i)).toBeInTheDocument();
  expect(getByPlaceholderText(/Bottom Text/i)).toBeInTheDocument();
  expect(getByPlaceholderText(/Optional Text/i)).toBeInTheDocument();

  // No position sliders in form
  expect(queryByLabelText(/vertical position/i)).toBeNull();
  expect(queryByLabelText(/horizontal position/i)).toBeNull();
});

test('updates top, optional, and bottom text on the meme', () => {
  const { getByPlaceholderText, getByText } = render(<App />);
  const topInput = getByPlaceholderText(/Top Text/i);
  const bottomInput = getByPlaceholderText(/Bottom Text/i);
  const optionalInput = getByPlaceholderText(/Optional Text/i);

  fireEvent.change(topInput, { target: { name: 'topText', value: 'Hello Top' } });
  fireEvent.change(bottomInput, { target: { name: 'bottomText', value: 'Hello Bottom' } });
  fireEvent.change(optionalInput, { target: { name: 'optionalText', value: 'Hello Center' } });

  expect(getByText('Hello Top')).toBeInTheDocument();
  expect(getByText('Hello Bottom')).toBeInTheDocument();
  expect(getByText('Hello Center')).toBeInTheDocument();
});

test('optional text appears in the center vertically (50%, 50%) when user enters text into it', () => {
  const { getByPlaceholderText, getByText, queryByText } = render(<App />);
  
  // Initially not entered
  expect(queryByText('Center Punchline')).toBeNull();

  const optionalInput = getByPlaceholderText(/Optional Text/i);
  fireEvent.change(optionalInput, { target: { name: 'optionalText', value: 'Center Punchline' } });

  const centerHeading = getByText('Center Punchline');
  expect(centerHeading).toBeInTheDocument();
  expect(centerHeading).toHaveStyle('top: 50%');
  expect(centerHeading).toHaveStyle('left: 50%');
  expect(centerHeading).toHaveStyle('transform: translate(-50%, -50%)');
});

test('supports clicking and moving optional text anywhere over the picture and resets to center', () => {
  const { getByPlaceholderText, getByText, container, queryByText } = render(<App />);
  const optionalInput = getByPlaceholderText(/Optional Text/i);
  fireEvent.change(optionalInput, { target: { name: 'optionalText', value: 'Move Center' } });

  const optionalHeading = getByText('Move Center');
  expect(optionalHeading).toHaveStyle('top: 50%');
  expect(optionalHeading).toHaveStyle('left: 50%');

  // No reset button initially
  expect(queryByText(/Reset/i)).toBeNull();

  const memeDiv = container.querySelector('#meme');
  jest.spyOn(memeDiv, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 500,
    height: 500,
    right: 500,
    bottom: 500
  });

  // Start pointer down at (250, 250)
  fireEvent.pointerDown(optionalHeading, {
    clientX: 250,
    clientY: 250,
    button: 0,
    pointerId: 1
  });

  // Drag up by 100px (-20%) and right by 100px (+20%)
  fireEvent.pointerMove(window, {
    clientX: 350,
    clientY: 150,
    pointerId: 1
  });

  expect(optionalHeading).toHaveStyle('top: 30%');
  expect(optionalHeading).toHaveStyle('left: 70%');

  fireEvent.pointerUp(window, { pointerId: 1 });

  // Reset button should now be visible
  const resetBtn = getByText(/Reset/i);
  expect(resetBtn).toBeInTheDocument();

  // Clicking reset restores default center position (50%, 50%)
  fireEvent.click(resetBtn);
  expect(optionalHeading).toHaveStyle('top: 50%');
  expect(optionalHeading).toHaveStyle('left: 50%');
  expect(queryByText(/Reset/i)).toBeNull();
});

test('supports clicking and moving top text with mouse anywhere over the picture and resets', () => {
  const { getByPlaceholderText, getByText, container, queryByText } = render(<App />);
  const topInput = getByPlaceholderText(/Top Text/i);
  fireEvent.change(topInput, { target: { name: 'topText', value: 'Drag Me Top' } });

  const topHeading = getByText('Drag Me Top');
  expect(topHeading).toHaveStyle('top: 8%');
  expect(topHeading).toHaveStyle('left: 50%');

  // No reset button initially
  expect(queryByText(/Reset/i)).toBeNull();

  const memeDiv = container.querySelector('#meme');
  jest.spyOn(memeDiv, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 500,
    height: 500,
    right: 500,
    bottom: 500
  });

  // Start pointer down at (100, 100)
  fireEvent.pointerDown(topHeading, {
    clientX: 100,
    clientY: 100,
    button: 0,
    pointerId: 2
  });

  // Drag down by 150px (+30%) and right by 100px (+20%)
  fireEvent.pointerMove(window, {
    clientX: 200,
    clientY: 250,
    pointerId: 2
  });

  expect(topHeading).toHaveStyle('top: 38%');
  expect(topHeading).toHaveStyle('left: 70%');

  fireEvent.pointerUp(window, { pointerId: 2 });

  // Reset button should now be visible
  const resetBtn = getByText(/Reset/i);
  expect(resetBtn).toBeInTheDocument();

  // Clicking reset restores default position (8%, 50%)
  fireEvent.click(resetBtn);
  expect(topHeading).toHaveStyle('top: 8%');
  expect(topHeading).toHaveStyle('left: 50%');
  expect(queryByText(/Reset/i)).toBeNull();
});

test('supports moving bottom text using touch/finger anywhere over the picture', () => {
  const { getByPlaceholderText, getByText, container } = render(<App />);
  const bottomInput = getByPlaceholderText(/Bottom Text/i);
  fireEvent.change(bottomInput, { target: { name: 'bottomText', value: 'Finger Drag' } });

  const bottomHeading = getByText('Finger Drag');
  expect(bottomHeading).toHaveStyle('top: 92%');
  expect(bottomHeading).toHaveStyle('left: 50%');

  const memeDiv = container.querySelector('#meme');
  jest.spyOn(memeDiv, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 400,
    height: 400,
    right: 400,
    bottom: 400
  });

  // Touch start at (200, 360)
  fireEvent.touchStart(bottomHeading, {
    touches: [{ clientX: 200, clientY: 360 }]
  });

  // Move finger up by 160px (-40%) and left by 80px (-20%)
  fireEvent.touchMove(window, {
    touches: [{ clientX: 120, clientY: 200 }]
  });

  expect(bottomHeading).toHaveStyle('top: 52%');
  expect(bottomHeading).toHaveStyle('left: 30%');

  fireEvent.touchEnd(window);
});

test('clamps text movement within picture boundaries', () => {
  const { getByPlaceholderText, getByText, container } = render(<App />);
  const topInput = getByPlaceholderText(/Top Text/i);
  fireEvent.change(topInput, { target: { name: 'topText', value: 'Boundary Test' } });

  const topHeading = getByText('Boundary Test');
  const memeDiv = container.querySelector('#meme');
  jest.spyOn(memeDiv, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 500,
    height: 500,
    right: 500,
    bottom: 500
  });

  fireEvent.pointerDown(topHeading, {
    clientX: 250,
    clientY: 40,
    button: 0,
    pointerId: 3
  });

  // Drag way beyond top-left bounds
  fireEvent.pointerMove(window, {
    clientX: -1000,
    clientY: -1000,
    pointerId: 3
  });

  // Clamped so text doesn't go off-screen
  expect(topHeading).toHaveStyle('top: 2%');
  expect(topHeading).toHaveStyle('left: 2%');

  // Drag way beyond bottom-right bounds
  fireEvent.pointerMove(window, {
    clientX: 2000,
    clientY: 2000,
    pointerId: 3
  });

  expect(topHeading).toHaveStyle('top: 98%');
  expect(topHeading).toHaveStyle('left: 98%');

  fireEvent.pointerUp(window, { pointerId: 3 });
});

test('moves text using keyboard arrow keys', () => {
  const { getByPlaceholderText, getByText } = render(<App />);
  const optionalInput = getByPlaceholderText(/Optional Text/i);
  fireEvent.change(optionalInput, { target: { name: 'optionalText', value: 'Arrow Center' } });

  const optionalHeading = getByText('Arrow Center');
  expect(optionalHeading).toHaveStyle('top: 50%');
  expect(optionalHeading).toHaveStyle('left: 50%');

  // Move up by 2%
  fireEvent.keyDown(optionalHeading, { key: 'ArrowUp' });
  expect(optionalHeading).toHaveStyle('top: 48%');

  // Move right by 2%
  fireEvent.keyDown(optionalHeading, { key: 'ArrowRight' });
  expect(optionalHeading).toHaveStyle('left: 52%');

  // Shift + ArrowDown moves by 5%
  fireEvent.keyDown(optionalHeading, { key: 'ArrowDown', shiftKey: true });
  expect(optionalHeading).toHaveStyle('top: 53%');
});

test('bilingual support translates labels, reset button, and hint', () => {
  const { getByText, getByPlaceholderText, container } = render(<App />);
  const langBtn = getByText('FR');
  fireEvent.click(langBtn);

  // In French
  expect(getByText(/Texte du haut/i)).toBeInTheDocument();
  expect(getByText(/Texte du bas/i)).toBeInTheDocument();
  expect(getByText(/Texte optionnel/i)).toBeInTheDocument();
  expect(getByText(/Astuce : déplacez le texte avec la souris ou le doigt/i)).toBeInTheDocument();

  // Move optional text
  const optionalInput = getByPlaceholderText(/Texte optionnel/i);
  fireEvent.change(optionalInput, { target: { name: 'optionalText', value: 'Texte FR' } });
  const optionalHeading = getByText('Texte FR');

  const memeDiv = container.querySelector('#meme');
  jest.spyOn(memeDiv, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 500,
    height: 500,
    right: 500,
    bottom: 500
  });

  fireEvent.pointerDown(optionalHeading, { clientX: 250, clientY: 250, button: 0, pointerId: 4 });
  fireEvent.pointerMove(window, { clientX: 250, clientY: 350, pointerId: 4 });
  fireEvent.pointerUp(window, { pointerId: 4 });

  // Reset button in French
  expect(getByText(/Réinitialiser/i)).toBeInTheDocument();
});

test('allows uploading a custom image locally without sending to server', async () => {
  const { getByLabelText, getByText, container } = render(<App />);

  // Verify privacy note is displayed
  expect(getByText(/stays 100% local on your device/i)).toBeInTheDocument();

  const fileInput = getByLabelText(/Upload local image/i);
  const file = new File(['fake-image-bytes'], 'my-dog.png', { type: 'image/png' });

  // Simulate file selection
  fireEvent.change(fileInput, { target: { files: [file] } });

  // Wait for FileReader onload
  await new Promise(resolve => setTimeout(resolve, 50));

  const memeImg = container.querySelector('#meme img');
  expect(memeImg.src).toContain('data:image/png;base64');

  // Verify MemePicker shows Custom Image label
  expect(getByText(/Custom Image \(local\)/i)).toBeInTheDocument();

  // Clicking on custom image should NOT randomize it
  const currentSrc = memeImg.src;
  fireEvent.click(memeImg);
  expect(memeImg.src).toBe(currentSrc);
});

test('supports drag and drop of local image files onto the meme preview', async () => {
  const { container, queryByText } = render(<App />);
  const memeDiv = container.querySelector('#meme');

  // Drag over with file
  fireEvent.dragOver(memeDiv, {
    dataTransfer: {
      types: ['Files']
    }
  });

  // Drop overlay should appear
  expect(memeDiv).toHaveClass('drag-over');

  // Drag leave
  fireEvent.dragLeave(memeDiv);
  expect(memeDiv).not.toHaveClass('drag-over');

  // Drop a local image file
  const file = new File(['drop-image-bytes'], 'vacation.jpg', { type: 'image/jpeg' });
  fireEvent.drop(memeDiv, {
    dataTransfer: {
      files: [file]
    }
  });

  // Wait for FileReader onload
  await new Promise(resolve => setTimeout(resolve, 50));

  const memeImg = container.querySelector('#meme img');
  expect(memeImg.src).toContain('data:image/jpeg;base64');
});

test('generates image on the first click on Apple devices using warmup pass without warning', async () => {
  window.__FORCE_APPLE_DEVICE_FOR_TESTING__ = true;
  domtoimage.toPng.mockClear();
  domtoimage.toPng.mockImplementation(() => Promise.resolve('data:image/png;base64,' + 'A'.repeat(2000)));

  const { container, queryByText } = render(<App />);
  const copyBtn = container.querySelector('#buttonCopy');

  fireEvent.click(copyBtn);

  // Wait for warmup pass + render pass to finish
  await wait(() => {
    expect(container.querySelector('.imgZone img')).toBeInTheDocument();
  });

  // Automatically executed warmup + final render on single click
  expect(domtoimage.toPng).toHaveBeenCalledTimes(2);
  expect(container.querySelector('.imgZone h2').textContent).toBe('Image # 1');

  // No Apple bug warning message should exist
  expect(queryByText(/Apple Bug/i)).toBeNull();
  expect(queryByText(/bogue d'Apple/i)).toBeNull();
});

test('generates image directly on non-Apple devices on first click', async () => {
  window.__FORCE_APPLE_DEVICE_FOR_TESTING__ = false;
  domtoimage.toPng.mockClear();
  domtoimage.toPng.mockImplementation(() => Promise.resolve('data:image/png;base64,' + 'A'.repeat(2000)));

  const { container } = render(<App />);
  const copyBtn = container.querySelector('#buttonCopy');

  fireEvent.click(copyBtn);

  await wait(() => {
    expect(container.querySelector('.imgZone img')).toBeInTheDocument();
  });

  // Single render pass on non-Apple browsers
  expect(domtoimage.toPng).toHaveBeenCalledTimes(1);
  expect(container.querySelector('.imgZone h2').textContent).toBe('Image # 1');
});

test('retries image generation if first render produces blank canvas data', async () => {
  window.__FORCE_APPLE_DEVICE_FOR_TESTING__ = false;
  domtoimage.toPng.mockClear();
  // First call returns blank (small) data, second returns valid image
  domtoimage.toPng
    .mockImplementationOnce(() => Promise.resolve('data:image/png;base64,tiny'))
    .mockImplementationOnce(() => Promise.resolve('data:image/png;base64,' + 'B'.repeat(2000)));

  const { container } = render(<App />);
  const copyBtn = container.querySelector('#buttonCopy');

  fireEvent.click(copyBtn);

  await wait(() => {
    expect(container.querySelector('.imgZone img')).toBeInTheDocument();
  });

  expect(domtoimage.toPng).toHaveBeenCalledTimes(2);
  expect(container.querySelector('.imgZone img').src).toContain('B'.repeat(2000));
});

test('generates image on initial default template without changing the image (secure HTTPS)', async () => {
  domtoimage.toPng.mockClear();
  domtoimage.toPng.mockImplementation(() => Promise.resolve('data:image/png;base64,' + 'C'.repeat(2000)));

  const { container } = render(<App />);
  const previewImg = container.querySelector('#meme img');

  // Verify the default initial image uses HTTPS
  expect(previewImg.src).toMatch(/^https:\/\//);
  expect(previewImg.src).toContain('i.imgflip.com/1bij.jpg');
  expect(previewImg).toHaveAttribute('crossorigin', 'anonymous');

  // Click generate directly without changing image
  const copyBtn = container.querySelector('#buttonCopy');
  fireEvent.click(copyBtn);

  await wait(() => {
    expect(container.querySelector('.imgZone img')).toBeInTheDocument();
  });

  expect(domtoimage.toPng).toHaveBeenCalled();
  expect(container.querySelector('.imgZone h2').textContent).toBe('Image # 1');
});
