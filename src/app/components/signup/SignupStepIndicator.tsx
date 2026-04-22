import { CheckCircle } from 'lucide-react';
import {
  StepIndicatorWrapper, StepList, StepItem, StepCircleWrapper,
  StepCircle, StepLabel, StepConnector,
} from '../../styles/signup.styles';

interface Step {
  id: string;
  label: string;
}

interface Props {
  steps: readonly Step[];
  currentIndex: number;
}

export function SignupStepIndicator({ steps, currentIndex }: Props) {
  return (
    <StepIndicatorWrapper>
      <StepList>
        {steps.map((step, index) => (
          <>
            <StepItem key={step.id}>
              <StepCircleWrapper>
                <StepCircle active={index <= currentIndex}>
                  {index < currentIndex ? <CheckCircle className="size-5" /> : index + 1}
                </StepCircle>
                <StepLabel active={index <= currentIndex}>{step.label}</StepLabel>
              </StepCircleWrapper>
            </StepItem>
            {index < steps.length - 1 && (
              <StepConnector key={`connector-${index}`} completed={index < currentIndex} />
            )}
          </>
        ))}
      </StepList>
    </StepIndicatorWrapper>
  );
}
