import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/Button';
import type { ModalAnimation, ModalSize } from './types';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    animation: {
      control: 'select',
      options: ['fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'scale'],
    },
    closeOnOverlayClick: { control: 'boolean' },
    closeOnEsc: { control: 'boolean' },
    trapFocus: { control: 'boolean' },
    lockScroll: { control: 'boolean' },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

/**
 * Standard Modal Example
 */
export const Basic: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div className="mt-10 flex justify-center">
          <Button rounded="full" onClick={() => setIsOpen(true)}>
            Open Modal
          </Button>
        </div>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Modal.Header>
            <Modal.Title>Modal Title</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <p className="text-neutral-600 dark:text-neutral-400">
              This is a basic modal with header, body, and footer sections.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button rounded="full" variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button rounded="full" variant="primary">
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  },
};

/**
 * Alert Modal - Single action
 */
export const Alert: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div className="mt-10 flex justify-center">
          <Button rounded="full" onClick={() => setIsOpen(true)}>
            Show Alert
          </Button>
        </div>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="sm">
          <Modal.Header>
            <Modal.Title>Alert</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <p className="text-neutral-600 dark:text-neutral-400">
              This is an alert modal with a single action button.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button rounded="lg" variant="primary" fullWidth onClick={() => setIsOpen(false)}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  },
};

/**
 * Confirm Modal - Two actions with danger variant
 */
export const Confirm: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div className="mt-10 flex justify-center">
          <Button rounded="full" onClick={() => setIsOpen(true)}>
            Show Confirm
          </Button>
        </div>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="sm">
          <Modal.Header>
            <Modal.Title>Confirm Action</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <p className="text-neutral-600 dark:text-neutral-400">
              Are you sure you want to proceed with this action?
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button rounded="full" variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button rounded="full" variant="danger" onClick={() => setIsOpen(false)}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  },
};

/**
 * Form Modal - Complex content with input fields
 */
export const FormModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div className="mt-10 flex justify-center">
          <Button onClick={() => setIsOpen(true)}>Open Form</Button>
        </div>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
          <Modal.Header>
            <Modal.Title>Create New Project</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <form className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Project Name
                </label>
                <input
                  type="text"
                  className="focus:ring-primary-500 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-transparent focus:ring-2 dark:border-neutral-600"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Description
                </label>
                <textarea
                  className="focus:ring-primary-500 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-transparent focus:ring-2 dark:border-neutral-600"
                  rows={3}
                  placeholder="Enter project description"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  className="focus:ring-primary-500 h-4 w-4 rounded border-neutral-300 text-primary-600"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  I agree to the terms and conditions
                </label>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">Create Project</Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  },
};

/**
 * Sizes - All size variants comparison
 */
export const Sizes: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState<{ [key in ModalSize]?: boolean }>({});

    return (
      <>
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {(['sm', 'md', 'lg', 'xl', 'full'] as ModalSize[]).map((size) => (
            <Button
              key={size}
              variant="outline"
              size="sm"
              onClick={() => setIsOpen({ ...isOpen, [size]: true })}
            >
              {size.toUpperCase()}
            </Button>
          ))}
        </div>
        {(['sm', 'md', 'lg', 'xl', 'full'] as ModalSize[]).map((size) => (
          <Modal
            key={size}
            isOpen={isOpen[size] || false}
            onClose={() => setIsOpen({ ...isOpen, [size]: false })}
            size={size}
          >
            <Modal.Header>
              <Modal.Title>{size.toUpperCase()} Modal</Modal.Title>
              <Modal.CloseButton />
            </Modal.Header>
            <Modal.Body>
              <p className="text-neutral-600 dark:text-neutral-400">
                This is a {size} sized modal. Perfect for different content needs.
              </p>
              <div className="mt-4 rounded-md bg-neutral-50 p-4 dark:bg-neutral-800">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Size: <span className="font-mono">{size}</span>
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setIsOpen({ ...isOpen, [size]: false })}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        ))}
      </>
    );
  },
};

/**
 * Animations - All animation variants comparison
 */
export const Animations: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState<{ [key in ModalAnimation]?: boolean }>({});

    return (
      <>
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {(
            [
              'fade',
              'slide-up',
              'slide-down',
              'slide-left',
              'slide-right',
              'scale',
            ] as ModalAnimation[]
          ).map((animation) => (
            <Button
              key={animation}
              variant="outline"
              size="sm"
              onClick={() => setIsOpen({ ...isOpen, [animation]: true })}
            >
              {animation.replace('-', ' ')}
            </Button>
          ))}
        </div>
        {(
          [
            'fade',
            'slide-up',
            'slide-down',
            'slide-left',
            'slide-right',
            'scale',
          ] as ModalAnimation[]
        ).map((animation) => (
          <Modal
            key={animation}
            isOpen={isOpen[animation] || false}
            onClose={() => setIsOpen({ ...isOpen, [animation]: false })}
            animation={animation}
            size="sm"
          >
            <Modal.Header>
              <Modal.Title>{animation.replace('-', ' ')}</Modal.Title>
              <Modal.CloseButton />
            </Modal.Header>
            <Modal.Body>
              <p className="text-neutral-600 dark:text-neutral-400">
                This modal uses the <span className="font-mono">{animation}</span> animation.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setIsOpen({ ...isOpen, [animation]: false })}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        ))}
      </>
    );
  },
};

/**
 * Fullscreen Modal - Mobile optimized with scrollable content
 */
export const Fullscreen: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div className="mt-10 flex justify-center">
          <Button onClick={() => setIsOpen(true)}>Open Fullscreen</Button>
        </div>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="full">
          <Modal.Header>
            <Modal.Title>Fullscreen Modal</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Section {i + 1}
                  </h3>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    This is scrollable content in a fullscreen modal. Perfect for mobile experiences
                    and long forms.
                  </p>
                </div>
              ))}
            </div>
          </Modal.Body>
        </Modal>
      </>
    );
  },
};

/**
 * Without Close Button - Force user action
 */
export const WithoutCloseButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div className="mt-10 flex justify-center">
          <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        </div>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          closeOnOverlayClick={false}
          closeOnEsc={false}
          size="sm"
        >
          <Modal.Header>
            <Modal.Title>Important Notice</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-3">
              <p className="text-neutral-600 dark:text-neutral-400">
                This modal cannot be closed by clicking outside or pressing Escape.
              </p>
              <p className="text-neutral-600 dark:text-neutral-400">
                You must click one of the buttons below to proceed.
              </p>
              <div className="mt-4 border-l-4 border-warning-500 bg-warning-50 p-3 dark:bg-warning-900/30">
                <p className="text-sm font-medium text-warning-800 dark:text-warning-200">
                  ⚠️ This pattern should be used sparingly for critical actions only.
                </p>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" fullWidth onClick={() => setIsOpen(false)}>
              I Understand
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  },
};

/**
 * Accessibility Example - ARIA attributes and keyboard navigation
 */
export const Accessibility: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div className="mt-10 flex justify-center">
          <Button onClick={() => setIsOpen(true)}>Open Accessible Modal</Button>
        </div>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          aria-labelledby="accessible-modal-title"
          aria-describedby="accessible-modal-desc"
          trapFocus={true}
        >
          <Modal.Header>
            <Modal.Title id="accessible-modal-title">Accessible Modal</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <p id="accessible-modal-desc" className="text-neutral-600 dark:text-neutral-400">
                This modal demonstrates proper accessibility patterns:
              </p>
              <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>ARIA labels for screen readers</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Focus trapping (try Tab/Shift+Tab)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Escape key to close</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Click outside to close</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Scroll lock on body</span>
                </li>
              </ul>
              <div className="mt-4 rounded-md bg-neutral-50 p-4 dark:bg-neutral-800">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Try keyboard navigation:
                </p>
                <ul className="mt-2 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                  <li>
                    • Press{' '}
                    <kbd className="rounded border border-neutral-300 bg-neutral-200 px-1.5 py-0.5 font-mono dark:border-neutral-600 dark:bg-neutral-700">
                      Tab
                    </kbd>{' '}
                    to cycle through focusable elements
                  </li>
                  <li>
                    • Press{' '}
                    <kbd className="rounded border border-neutral-300 bg-neutral-200 px-1.5 py-0.5 font-mono dark:border-neutral-600 dark:bg-neutral-700">
                      Shift
                    </kbd>{' '}
                    +{' '}
                    <kbd className="rounded border border-neutral-300 bg-neutral-200 px-1.5 py-0.5 font-mono dark:border-neutral-600 dark:bg-neutral-700">
                      Tab
                    </kbd>{' '}
                    to cycle backwards
                  </li>
                  <li>
                    • Press{' '}
                    <kbd className="rounded border border-neutral-300 bg-neutral-200 px-1.5 py-0.5 font-mono dark:border-neutral-600 dark:bg-neutral-700">
                      Escape
                    </kbd>{' '}
                    to close modal
                  </li>
                </ul>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">Confirm</Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  },
};

/**
 * Custom Styling - Demonstrating className and contentClassName props
 */
export const CustomStyling: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div className="mt-10 flex justify-center">
          <Button onClick={() => setIsOpen(true)}>Open Styled Modal</Button>
        </div>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          // Outer container gets glassmorphism effect
          className="border border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/80"
          // Inner content gets custom padding
          contentClassName="p-8"
        >
          <Modal.Header>
            <Modal.Title>Custom Styled Modal</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <p className="text-neutral-600 dark:text-neutral-400">
                This modal demonstrates custom styling using className (outer container) and
                contentClassName (inner content) props.
              </p>
              <div className="rounded-lg bg-gradient-to-r from-primary-50 to-secondary-50 p-4 dark:from-primary-900/20 dark:to-secondary-900/20">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Glassmorphism Effect
                </p>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  The outer container has backdrop blur and semi-transparent background
                </p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Custom Padding
                </p>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  The inner content has increased padding (p-8 instead of default p-6)
                </p>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  },
};

/**
 * Playground - Interactive controls for all props
 */
export const Playground: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div className="mt-10 flex justify-center">
          <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        </div>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Modal.Header>
            <Modal.Title>Playground Modal</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <p className="text-neutral-600 dark:text-neutral-400">
                This is a playground modal. Try interacting with the controls in the Storybook panel
                to see how different props affect the modal behavior.
              </p>
              <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                <h4 className="mb-2 font-semibold text-neutral-900 dark:text-neutral-100">
                  Interactive Features:
                </h4>
                <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
                  <li>• Click outside to close (toggle with closeOnOverlayClick)</li>
                  <li>• Press Escape to close (toggle with closeOnEsc)</li>
                  <li>• Tab through focusable elements (toggle with trapFocus)</li>
                  <li>• Scroll the page (toggle with lockScroll)</li>
                </ul>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  },
  args: {
    size: 'md',
    animation: 'fade',
    closeOnOverlayClick: true,
    closeOnEsc: true,
    trapFocus: true,
    lockScroll: true,
  },
};
