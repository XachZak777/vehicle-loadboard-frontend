import styled from '@emotion/styled';

// ─── Page Shell ──────────────────────────────────────────────────────────────

export const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--background);
  color: var(--foreground);
`;

export const PageHeader = styled.header`
  background-color: var(--card);
  border-bottom: 1px solid var(--border);
`;

export const HeaderInner = styled.div`
  max-width: 56rem;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (min-width: 640px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  @media (min-width: 1024px) {
    padding-left: 2rem;
    padding-right: 2rem;
  }
`;

export const LogoLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
`;

export const LogoIcon = styled.div`
  background-color: #f59e0b;
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const LogoText = styled.div`
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--foreground);
    margin: 0;
  }
  p {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    margin: 0;
  }
`;

export const ContentWrapper = styled.div`
  max-width: 56rem;
  margin: 0 auto;
  padding: 1.5rem 1rem;

  @media (min-width: 640px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  @media (min-width: 1024px) {
    padding-left: 2rem;
    padding-right: 2rem;
  }
`;

// ─── Step Indicator ───────────────────────────────────────────────────────────

export const StepIndicatorWrapper = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem 0.75rem;
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
`;

export const StepList = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0 0.25rem;
`;

export const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
`;

export const StepCircleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
`;

export const StepCircle = styled.div<{ active: boolean }>`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  background-color: ${({ active }) => (active ? '#f59e0b' : 'var(--muted)')};
  color: ${({ active }) => (active ? '#fff' : 'var(--muted-foreground)')};
  transition: background-color 0.2s, color 0.2s;
`;

export const StepLabel = styled.div<{ active: boolean }>`
  font-size: 0.7rem;
  margin-top: 0.25rem;
  text-align: center;
  white-space: nowrap;
  color: ${({ active }) => (active ? 'var(--foreground)' : 'var(--muted-foreground)')};
  font-weight: ${({ active }) => (active ? '600' : '400')};
  transition: color 0.2s;
`;

export const StepConnector = styled.div<{ completed: boolean }>`
  height: 0.125rem;
  flex: 1;
  min-width: 1.5rem;
  margin: 0 0.375rem;
  margin-top: 1.25rem;
  background-color: ${({ completed }) => (completed ? '#f59e0b' : 'var(--muted)')};
  transition: background-color 0.2s;
`;

// ─── Form Sections ────────────────────────────────────────────────────────────

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const HintText = styled.p`
  font-size: 0.75rem;
  color: var(--muted-foreground);
  margin-top: 0.25rem;
`;

export const InfoBox = styled.div`
  background-color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;

  p {
    font-size: 0.875rem;
    color: var(--foreground);
    margin: 0 0 0.5rem 0;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const SuccessBox = styled.div`
  background-color: color-mix(in srgb, #16a34a 10%, transparent);
  border: 1px solid color-mix(in srgb, #16a34a 30%, transparent);
  border-radius: 0.5rem;
  padding: 1rem;
`;

export const SuccessBoxHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #16a34a;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

export const SuccessBoxText = styled.p`
  font-size: 0.875rem;
  color: var(--foreground);
  margin: 0;
`;

// ─── W9 Upload ────────────────────────────────────────────────────────────────

export const DropZone = styled.div`
  margin-top: 0.5rem;
  border: 2px dashed var(--border);
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  background-color: var(--card);
  transition: border-color 0.2s;

  &:hover {
    border-color: #f59e0b;
  }
`;

export const DropZoneUploadLabel = styled.label`
  cursor: pointer;

  .upload-link {
    color: #f59e0b;
    font-weight: 600;

    &:hover {
      color: #d97706;
    }
  }

  .upload-or {
    color: var(--muted-foreground);
  }
`;

export const DropZoneHint = styled.p`
  font-size: 0.75rem;
  color: var(--muted-foreground);
  margin-top: 0.5rem;
`;

export const DropZoneSuccess = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #16a34a;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

// ─── Complete Step ────────────────────────────────────────────────────────────

export const CompleteIconWrapper = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  background-color: color-mix(in srgb, #16a34a 15%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
`;

export const CompleteTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--foreground);
  margin-bottom: 1rem;
`;

export const CompleteSubtext = styled.p`
  font-size: 1.125rem;
  color: var(--muted-foreground);
  margin-bottom: 1.5rem;
`;

export const CompleteHint = styled.p`
  font-size: 0.875rem;
  color: var(--muted-foreground);
`;
