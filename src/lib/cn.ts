type ClassName = string | undefined | null | false;

export const cn = (...classNames: ClassName[]): string => {
  return classNames.filter(Boolean).join(" ");
};
