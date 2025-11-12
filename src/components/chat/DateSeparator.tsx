interface DateSeparatorProps {
  label: string;
}

export const DateSeparator = ({ label }: DateSeparatorProps) => {
  return (
    <div className="flex items-center gap-4 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-background rounded-full">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
};
