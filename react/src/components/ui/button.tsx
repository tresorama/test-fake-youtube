import { cn } from "@/utils/cn";

type ButtonProps = React.JSX.IntrinsicElements['button'] & {
  variant?: 'primary' | 'secondary';
};


export const Button = ({
  children,
  variant = 'primary',
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "btn",
        variant === 'primary' && 'preset-filled-primary-200-800',
        variant === 'secondary' && 'preset-filled-secondary-200-800',
        className
      )}
    >
      {children}
    </button>
  );
};
