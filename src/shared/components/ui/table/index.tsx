import type React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

// Type aliases for specific components
type TableHeaderProps = TableProps;
type TableBodyProps = TableProps;
type TableRowProps = TableProps;

export const Table: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <table className={`min-w-full border-collapse ${className}`}>
      {children}
    </table>
  );
};

// TableHeader Component
export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  className,
}) => {
  return <thead className={className}>{children}</thead>;
};

// TableBody Component
export const TableBody: React.FC<TableBodyProps> = ({
  children,
  className,
}) => {
  return <tbody className={className}>{children}</tbody>;
};

// TableRow Component
export const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return <tr className={className}>{children}</tr>;
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  isHeader?: boolean;
  colSpan?: number;
  rowSpan?: number;
}

// TableCell Component
export const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
  colSpan,
  rowSpan,
}) => {
  const CellTag = isHeader ? "th" : "td";
  return (
    <CellTag className={` ${className}`} colSpan={colSpan} rowSpan={rowSpan}>
      {children}
    </CellTag>
  );
};
