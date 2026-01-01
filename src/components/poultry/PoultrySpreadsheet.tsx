import { useState } from 'react';
import { format } from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PoultryRecord {
  id: string;
  record_date: string;
  pen?: string;
  line?: string;
  // Egg sizes - production
  eggs_big?: number;
  eggs_pullet?: number;
  eggs_jumbo?: number;
  eggs_cracked?: number;
  // Supply/Sales
  supply_big?: number;
  supply_pullet?: number;
  supply_jumbo?: number;
  supply_cracked?: number;
  // Balance (calculated)
  balance_big?: number;
  balance_pullet?: number;
  balance_jumbo?: number;
  balance_cracked?: number;
  // Customer info
  customer_name?: string;
  customer_phone?: string;
  invoice_ref?: string;
  // Other
  mortality?: number;
  mortality_cause?: string;
  notes?: string;
  // Legacy fields
  egg_count?: number;
  hen_count?: number;
  health_notes?: string;
}

interface ColumnGroup {
  label: string;
  columns: Column[];
  bgClass: string;
}

interface Column {
  key: keyof PoultryRecord | 'actions' | 'total_production' | 'total_supply' | 'total_balance';
  header: string;
  width?: string;
  render?: (record: PoultryRecord) => React.ReactNode;
  editable?: boolean;
}

interface PoultrySpreadsheetProps {
  data: PoultryRecord[];
  isLoading?: boolean;
  onEdit?: (record: PoultryRecord) => void;
  onDelete?: (record: PoultryRecord) => void;
  onAdd?: () => void;
}

export function PoultrySpreadsheet({ 
  data, 
  isLoading, 
  onEdit, 
  onDelete,
  onAdd 
}: PoultrySpreadsheetProps) {
  const [sortField, setSortField] = useState<keyof PoultryRecord>('record_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof PoultryRecord) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;
    if (sortDir === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  // Calculate totals for each record
  const getTotalProduction = (r: PoultryRecord) => 
    (r.eggs_big || r.egg_count || 0) + (r.eggs_pullet || 0) + (r.eggs_jumbo || 0);
  
  const getTotalSupply = (r: PoultryRecord) => 
    (r.supply_big || 0) + (r.supply_pullet || 0) + (r.supply_jumbo || 0) + (r.supply_cracked || 0);
  
  const getTotalBalance = (r: PoultryRecord) => 
    (r.balance_big || 0) + (r.balance_pullet || 0) + (r.balance_jumbo || 0) + (r.balance_cracked || 0);

  const columnGroups: ColumnGroup[] = [
    {
      label: 'Basic Info',
      bgClass: 'bg-muted/30',
      columns: [
        { 
          key: 'record_date', 
          header: 'Date', 
          width: 'w-28',
          render: (r) => format(new Date(r.record_date), 'MMM d, yyyy')
        },
        { key: 'pen', header: 'Pen', width: 'w-16' },
        { key: 'line', header: 'Line', width: 'w-16' },
      ]
    },
    {
      label: 'Production (Eggs)',
      bgClass: 'bg-green-500/10',
      columns: [
        { key: 'eggs_big', header: 'Big', width: 'w-16', render: (r) => r.eggs_big ?? r.egg_count ?? '-' },
        { key: 'eggs_pullet', header: 'Pullet', width: 'w-16', render: (r) => r.eggs_pullet ?? '-' },
        { key: 'eggs_jumbo', header: 'Jumbo', width: 'w-16', render: (r) => r.eggs_jumbo ?? '-' },
        { key: 'eggs_cracked', header: 'Cracked', width: 'w-20', render: (r) => r.eggs_cracked ?? '-' },
        { 
          key: 'total_production', 
          header: 'Total', 
          width: 'w-20',
          render: (r) => {
            const total = getTotalProduction(r);
            return <span className="font-semibold text-green-600">{total}</span>;
          }
        },
      ]
    },
    {
      label: 'Supply (Sold/Supplied)',
      bgClass: 'bg-blue-500/10',
      columns: [
        { key: 'supply_big', header: 'Big', width: 'w-16', render: (r) => r.supply_big ?? '-' },
        { key: 'supply_pullet', header: 'Pullet', width: 'w-16', render: (r) => r.supply_pullet ?? '-' },
        { key: 'supply_jumbo', header: 'Jumbo', width: 'w-16', render: (r) => r.supply_jumbo ?? '-' },
        { key: 'supply_cracked', header: 'Cracked', width: 'w-20', render: (r) => r.supply_cracked ?? '-' },
        { 
          key: 'total_supply', 
          header: 'Total', 
          width: 'w-20',
          render: (r) => {
            const total = getTotalSupply(r);
            return <span className="font-semibold text-blue-600">{total}</span>;
          }
        },
      ]
    },
    {
      label: 'Daily Balance',
      bgClass: 'bg-amber-500/10',
      columns: [
        { key: 'balance_big', header: 'Big', width: 'w-16', render: (r) => r.balance_big ?? '-' },
        { key: 'balance_pullet', header: 'Pullet', width: 'w-16', render: (r) => r.balance_pullet ?? '-' },
        { key: 'balance_jumbo', header: 'Jumbo', width: 'w-16', render: (r) => r.balance_jumbo ?? '-' },
        { key: 'balance_cracked', header: 'Cracked', width: 'w-20', render: (r) => r.balance_cracked ?? '-' },
        { 
          key: 'total_balance', 
          header: 'Total', 
          width: 'w-20',
          render: (r) => {
            const total = getTotalBalance(r);
            return <span className="font-semibold text-amber-600">{total}</span>;
          }
        },
      ]
    },
    {
      label: 'Customer & Sales',
      bgClass: 'bg-purple-500/10',
      columns: [
        { key: 'customer_name', header: 'Customer', width: 'w-32', render: (r) => r.customer_name ?? '-' },
        { key: 'customer_phone', header: 'Contact', width: 'w-28', render: (r) => r.customer_phone ?? '-' },
        { key: 'invoice_ref', header: 'Invoice #', width: 'w-24', render: (r) => r.invoice_ref ?? '-' },
      ]
    },
    {
      label: 'Health',
      bgClass: 'bg-red-500/10',
      columns: [
        { key: 'mortality', header: 'Mortality', width: 'w-20', render: (r) => r.mortality ?? 0 },
        { key: 'mortality_cause', header: 'Cause', width: 'w-28', render: (r) => r.mortality_cause ?? '-' },
        { key: 'notes', header: 'Notes', width: 'w-40', render: (r) => (r.notes || r.health_notes)?.slice(0, 25) ?? '-' },
      ]
    },
  ];

  const SortIcon = ({ field }: { field: keyof PoultryRecord }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3 w-3 inline ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 inline ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="p-8 text-center text-muted-foreground">
          Loading records...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/20">
        <div className="text-sm text-muted-foreground">
          {data.length} records
        </div>
        {onAdd && (
          <Button size="sm" onClick={onAdd} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Record
          </Button>
        )}
      </div>

      <ScrollArea className="w-full">
        <div className="min-w-[1400px]">
          {/* Column Group Headers */}
          <div className="flex border-b bg-muted/50">
            {columnGroups.map((group) => (
              <div
                key={group.label}
                className={cn(
                  "flex-shrink-0 text-center text-xs font-semibold py-2 border-r last:border-r-0",
                  group.bgClass
                )}
                style={{ width: `${group.columns.reduce((acc, col) => acc + (parseInt(col.width?.replace('w-', '') || '20') * 4), 0)}px` }}
              >
                {group.label}
              </div>
            ))}
            <div className="w-24 text-center text-xs font-semibold py-2 bg-muted/30">
              Actions
            </div>
          </div>

          {/* Column Headers */}
          <div className="flex border-b bg-muted/30 sticky top-0 z-10">
            {columnGroups.map((group) =>
              group.columns.map((col) => (
                <div
                  key={String(col.key)}
                  className={cn(
                    "flex-shrink-0 px-2 py-2 text-xs font-medium text-muted-foreground border-r last:border-r-0 cursor-pointer hover:bg-muted/50 transition-colors",
                    col.width,
                    group.bgClass
                  )}
                  onClick={() => col.key !== 'total_production' && col.key !== 'total_supply' && col.key !== 'total_balance' && handleSort(col.key as keyof PoultryRecord)}
                >
                  {col.header}
                  {col.key !== 'total_production' && col.key !== 'total_supply' && col.key !== 'total_balance' && (
                    <SortIcon field={col.key as keyof PoultryRecord} />
                  )}
                </div>
              ))
            )}
            <div className="w-24 px-2 py-2 text-xs font-medium text-muted-foreground bg-muted/30">
              Actions
            </div>
          </div>

          {/* Data Rows */}
          {sortedData.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No records found. Click "Add Record" to start tracking.
            </div>
          ) : (
            sortedData.map((record, idx) => (
              <div
                key={record.id}
                className={cn(
                  "flex border-b hover:bg-muted/20 transition-colors",
                  idx % 2 === 0 ? "bg-background" : "bg-muted/5"
                )}
              >
                {columnGroups.map((group) =>
                  group.columns.map((col) => (
                    <div
                      key={`${record.id}-${String(col.key)}`}
                      className={cn(
                        "flex-shrink-0 px-2 py-2 text-sm border-r last:border-r-0 truncate",
                        col.width
                      )}
                    >
                      {col.render ? col.render(record) : (record[col.key as keyof PoultryRecord] ?? '-')}
                    </div>
                  ))
                )}
                <div className="w-24 px-2 py-2 flex items-center gap-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEdit(record)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onDelete(record)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Summary Footer */}
      {sortedData.length > 0 && (
        <div className="flex border-t bg-muted/30 font-medium text-sm">
          <div className="flex-shrink-0 px-2 py-3 w-28">Totals</div>
          <div className="flex-shrink-0 px-2 py-3 w-16"></div>
          <div className="flex-shrink-0 px-2 py-3 w-16"></div>
          
          {/* Production totals */}
          <div className="flex-shrink-0 px-2 py-3 w-16 text-green-600">
            {sortedData.reduce((sum, r) => sum + (r.eggs_big || r.egg_count || 0), 0)}
          </div>
          <div className="flex-shrink-0 px-2 py-3 w-16 text-green-600">
            {sortedData.reduce((sum, r) => sum + (r.eggs_pullet || 0), 0)}
          </div>
          <div className="flex-shrink-0 px-2 py-3 w-16 text-green-600">
            {sortedData.reduce((sum, r) => sum + (r.eggs_jumbo || 0), 0)}
          </div>
          <div className="flex-shrink-0 px-2 py-3 w-20 text-green-600">
            {sortedData.reduce((sum, r) => sum + (r.eggs_cracked || 0), 0)}
          </div>
          <div className="flex-shrink-0 px-2 py-3 w-20 font-bold text-green-700">
            {sortedData.reduce((sum, r) => sum + getTotalProduction(r), 0)}
          </div>

          {/* Supply totals */}
          <div className="flex-shrink-0 px-2 py-3 w-16 text-blue-600">
            {sortedData.reduce((sum, r) => sum + (r.supply_big || 0), 0)}
          </div>
          <div className="flex-shrink-0 px-2 py-3 w-16 text-blue-600">
            {sortedData.reduce((sum, r) => sum + (r.supply_pullet || 0), 0)}
          </div>
          <div className="flex-shrink-0 px-2 py-3 w-16 text-blue-600">
            {sortedData.reduce((sum, r) => sum + (r.supply_jumbo || 0), 0)}
          </div>
          <div className="flex-shrink-0 px-2 py-3 w-20 text-blue-600">
            {sortedData.reduce((sum, r) => sum + (r.supply_cracked || 0), 0)}
          </div>
          <div className="flex-shrink-0 px-2 py-3 w-20 font-bold text-blue-700">
            {sortedData.reduce((sum, r) => sum + getTotalSupply(r), 0)}
          </div>

          {/* Balance - show last record's balance as current */}
          <div className="flex-shrink-0 px-2 py-3 w-16 text-amber-600">-</div>
          <div className="flex-shrink-0 px-2 py-3 w-16 text-amber-600">-</div>
          <div className="flex-shrink-0 px-2 py-3 w-16 text-amber-600">-</div>
          <div className="flex-shrink-0 px-2 py-3 w-20 text-amber-600">-</div>
          <div className="flex-shrink-0 px-2 py-3 w-20 font-bold text-amber-700">-</div>

          {/* Customer section - empty for totals */}
          <div className="flex-shrink-0 px-2 py-3 w-32"></div>
          <div className="flex-shrink-0 px-2 py-3 w-28"></div>
          <div className="flex-shrink-0 px-2 py-3 w-24"></div>

          {/* Mortality total */}
          <div className="flex-shrink-0 px-2 py-3 w-20 text-red-600">
            {sortedData.reduce((sum, r) => sum + (r.mortality || 0), 0)}
          </div>
          <div className="flex-shrink-0 px-2 py-3 w-28"></div>
          <div className="flex-shrink-0 px-2 py-3 w-40"></div>
          <div className="w-24"></div>
        </div>
      )}
    </div>
  );
}
